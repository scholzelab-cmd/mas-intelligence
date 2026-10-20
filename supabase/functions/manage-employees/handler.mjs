// No secrets in source. Credentials come only from the Edge Function environment.
const ORIGIN='https://scholzelab-cmd.github.io';
const DOMAIN='mas-crm.invalid'; // Reserved internal identifier; no email delivery.
export const validUsername=s=>typeof s==='string'&&/^[a-z][a-z0-9_-]{2,31}$/.test(s);
export const validPassword=s=>typeof s==='string'&&s.length>=12&&s.length<=128&&/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/\d/.test(s);
export function createHandler({env,fetch:request=fetch}){
 return async function handler(req){
  const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
  if(req.headers.get('origin')&&req.headers.get('origin')!==ORIGIN)return reply(403,{error:'Origem não autorizada.'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,{error:'Método não permitido.'});
  const authorization=req.headers.get('authorization')||'';
  if(!/^Bearer [^\s]+$/.test(authorization))return reply(401,{error:'Entre novamente para continuar.'});
  const url=env('SUPABASE_URL'),secret=env('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!secret)return reply(503,{error:'Serviço de equipe indisponível.'});
  const api=async(path,options={},bearer='Bearer '+secret)=>{
   const res=await request(url+path,{...options,headers:{apikey:secret,Authorization:bearer,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(15000)});
   let data=null;try{data=await res.json()}catch{}
   return {ok:res.ok,status:res.status,data};
  };
  try{
   const who=await api('/auth/v1/user',{},authorization);
   if(!who.ok||!who.data?.id)return reply(401,{error:'Sessão inválida. Entre novamente.'});
   const body=await req.json();
   const workspace=body.workspace_id;
   if(typeof workspace!=='string'||!/^[0-9a-f-]{36}$/.test(workspace))return reply(400,{error:'Organização inválida.'});
   const membership=await api('/rest/v1/workspace_members?select=role&workspace_id=eq.'+encodeURIComponent(workspace)+'&user_id=eq.'+encodeURIComponent(who.data.id));
   if(!membership.ok)return reply(503,{error:'Não foi possível conferir a permissão.'});
   if(membership.data?.[0]?.role!=='admin')return reply(403,{error:'Somente administradores gerenciam funcionários.'});
   if(body.action==='list'){
    const members=await api('/rest/v1/workspace_members?select=user_id,role&workspace_id=eq.'+encodeURIComponent(workspace));
    if(!members.ok)return reply(503,{error:'Não foi possível listar a equipe.'});
    const employees=await Promise.all(members.data.map(async m=>{
     const u=await api('/auth/v1/admin/users/'+encodeURIComponent(m.user_id));
     if(!u.ok)throw Error('list');
     return {id:m.user_id,role:m.role,username:u.data.user_metadata?.username||'Administrador principal',created_at:u.data.created_at};
    }));
    return reply(200,{employees});
   }
   if(body.action!=='create')return reply(400,{error:'Ação inválida.'});
   const username=String(body.username||'').trim().toLowerCase();
   if(!validUsername(username))return reply(400,{error:'Usuário:3 a32 caracteres, começando por letra; use letras minúsculas, números, _ ou -.'});
   if(!validPassword(body.password))return reply(400,{error:'A senha precisa ter12 a128 caracteres, com maiúscula, minúscula e número.'});
   // Never reuse an existing Auth user or accept a role supplied by the caller.
   const created=await api('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email:username+'@'+DOMAIN,password:body.password,email_confirm:true,user_metadata:{username}})});
   if(!created.ok){
    if([400,422].includes(created.status))return reply(409,{error:'Não foi possível criar:usuário já existe ou senha não aceita. Nenhuma conta existente foi alterada.'});
    return reply(503,{error:'Não foi possível criar o acesso. Confira a equipe antes de tentar novamente.'});
   }
   const user=created.data;
   if(!user?.id)return reply(503,{error:'Resposta incompleta do serviço de acesso.'});
   const linked=await api('/rest/v1/workspace_members',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({workspace_id:workspace,user_id:user.id,role:'editor'})});
   if(!linked.ok){
    // This user was created by this request and never belonged to any workspace.
    const cleanup=await api('/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE'});
    return reply(503,{error:cleanup.ok?'Acesso não criado:falha ao vincular organização.':'Acesso sem organização; administrador deve revisar o usuário antes de tentar novamente.'});
   }
   return reply(201,{employee:{id:user.id,username,role:'editor'},message:'Funcionário criado. Entregue a senha diretamente ao responsável.'});
  }catch{return reply(503,{error:'Serviço temporariamente indisponível. Confira a equipe antes de repetir a criação.'})}
 };
}
