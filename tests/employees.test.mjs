// Unit tests with synthetic Auth/Data API responses, not production accounts.
import assert from 'node:assert/strict';
import {createHandler,validUsername,validPassword} from '../supabase/functions/manage-employees/handler.mjs';
let passed=0;const test=async(name,fn)=>{await fn();passed++;console.log('PASS '+name)};
const workspace='00000000-0000-0000-0000-000000000001';
const request=(body,headers={Authorization:'Bearer synthetic-session'})=>new Request('https://example.invalid/functions/v1/manage-employees',{method:'POST',headers,body:JSON.stringify({workspace_id:workspace,...body})});
function mock({role='admin',valid=true,duplicate=false,link=true}={}){
 const calls=[];
 const handler=createHandler({env:n=>n==='SUPABASE_URL'?'https://synthetic.supabase.co':'synthetic-server-only-key',fetch:async(url,o)=>{
  const path=new URL(url).pathname;calls.push({path,method:o.method||'GET',body:o.body?JSON.parse(o.body):null});
  const response=(data,status=200)=>new Response(JSON.stringify(data),{status});
  if(path==='/auth/v1/user')return response(valid?{id:'caller'}:{},valid?200:401);
  if(path==='/rest/v1/workspace_members'&&(!o.method||o.method==='GET'))return response(url.includes('user_id=eq.caller')?(role?[{role}]:[]):[{user_id:'employee',role:'editor'}]);
  if(path==='/auth/v1/admin/users'&&o.method==='POST')return response(duplicate?{error:'exists'}:{id:'new-employee'},duplicate?422:200);
  if(path==='/rest/v1/workspace_members'&&o.method==='POST')return response({},link?201:400);
  if(path==='/auth/v1/admin/users/new-employee'&&o.method==='DELETE')return response({});
  if(path==='/auth/v1/admin/users/employee')return response({id:'employee',user_metadata:{username:'arch01'},email:'private@example.invalid'});
  throw Error('Unexpected '+path);
 }});return {handler,calls};
}
await test('usuários aceitos e entradas maliciosas rejeitadas',()=>{assert(validUsername('arch01'));for(const s of ['ab','<img>','x@y','../admin','Admin'])assert(!validUsername(s));});
await test('senha curta e requisitos insuficientes rejeitados',()=>{assert(!validPassword('1234'));assert(!validPassword('abcdefghijkl'));assert(validPassword('SyntheticTest123!'));});
await test('sem sessão não consulta nem cria usuário',async()=>{const m=mock();assert.equal((await m.handler(request({action:'create'},{}))).status,401);assert.equal(m.calls.length,0)});
await test('origem externa bloqueada',async()=>{const m=mock();assert.equal((await m.handler(request({}, {Authorization:'Bearer synthetic',Origin:'https://evil.invalid'}))).status,403);assert.equal(m.calls.length,0)});
await test('sessão inválida não acessa banco',async()=>{const m=mock({valid:false});assert.equal((await m.handler(request({action:'list'}))).status,401);assert.equal(m.calls.length,1)});
for(const role of ['editor','viewer',null])await test('perfil '+role+' não gerencia acessos',async()=>{const m=mock({role});assert.equal((await m.handler(request({action:'create',username:'arch01',password:'SyntheticTest123!'}))).status,403);assert.equal(m.calls.length,2)});
await test('listagem limita organização e não retorna e-mail nem senha',async()=>{const m=mock();const r=await m.handler(request({action:'list'}));assert.equal(r.status,200);const body=await r.text();assert(body.includes('arch01'));assert(!body.includes('private@example'));assert(!body.includes('synthetic-server-only-key'))});
await test('criação força editor e usa identidade interna sem revelar senha',async()=>{const m=mock();const r=await m.handler(request({action:'create',username:'arch01',password:'SyntheticTest123!',role:'admin'}));assert.equal(r.status,201);const user=m.calls.find(c=>c.path==='/auth/v1/admin/users');assert.equal(user.body.email,'arch01@mas-crm.invalid');const membership=m.calls.find(c=>c.path==='/rest/v1/workspace_members'&&c.method==='POST');assert.equal(membership.body.role,'editor');assert.equal(membership.body.workspace_id,workspace);assert(!(await r.text()).includes('SyntheticTest123!'));});
await test('duplicata não modifica nem vincula conta existente',async()=>{const m=mock({duplicate:true});assert.equal((await m.handler(request({action:'create',username:'arch01',password:'SyntheticTest123!'}))).status,409);assert(!m.calls.some(c=>c.path==='/rest/v1/workspace_members'&&c.method==='POST'));});
await test('falha de vínculo remove somente a conta nova da requisição',async()=>{const m=mock({link:false});assert.equal((await m.handler(request({action:'create',username:'arch01',password:'SyntheticTest123!'}))).status,503);assert(m.calls.some(c=>c.method==='DELETE'&&c.path==='/auth/v1/admin/users/new-employee'));});
console.log('TOTAL '+passed+' PASS');
