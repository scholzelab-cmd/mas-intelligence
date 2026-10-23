(function(){
"use strict";
const root=document.getElementById("app");
const config=window.MAS_CONFIG||{};
const url=String(config.supabaseUrl||"").replace(/\/+$/,"");
const key=String(config.supabasePublishableKey||"");
const connected=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)&&key.startsWith("sb_publishable_")&&!!window.supabase;
const STAGES=[["nao_contatada","Não contatada"],["contato_planejado","Contato planejado"],["contatada","Contatada"],["respondeu","Respondeu"],["reuniao","Reunião"],["proposta","Proposta"],["negociacao","Negociação"],["convertida","Convertida"],["perdida","Perdida"],["nao_contatar","Não contatar"]];
const VERIFY=[["identificada","Identificada"],["verificada","Verificada"],["qualificada","Qualificada"],["acionavel","Acionável"],["descartada","Descartada"]];
const TYPES=[["hipotese_exploratoria","Hipótese exploratória"],["fit_estrutural","Fit estrutural"],["gatilho_indireto","Gatilho indireto"],["demanda_explicita","Demanda explícita"]];
const POINTS=[["icp_sector","Aderência ao setor",10],["icp_use","Caso de uso",10],["icp_size","Porte comprovado",5],["icp_model","Modelo operacional",5],["signal_points","Sinal comercial",25],["potential_scale","Escala de aplicação",5],["potential_repeat","Recorrência",5],["potential_expansion","Outras aplicações",5],["access_points","Acessibilidade",15],["geo_points","Geografia",10],["evidence_points","Qualidade das evidências",5]];
const caps=Object.fromEntries(POINTS.map(x=>[x[0],x[2]]));
const verified=x=>["verificada","qualificada","acionavel"].includes(x.verification_status);
const score=x=>verified(x)?Object.keys(caps).reduce((s,k)=>s+Number(x[k]||0),0):null;
const escape=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/\s+/g," ");
const safeURL=x=>{try{const u=new URL(x);return u.protocol==="https:"&&u.hostname.includes(".")&&!u.username&&!u.password}catch{return false}};
const label=(items,id)=>items.find(x=>x[0]===id)?.[1]||id||"—";
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const date=x=>x?new Date(x.length===10?x+"T12:00:00":x).toLocaleDateString("pt-BR"):"Não encontrado";
const uid=()=>crypto.randomUUID();
const demoItems=[["Construtora Exemplo Azul (fictícia)","Residencial Horizonte (exemplo)"],["Incorporadora Modelo Norte (fictícia)","Parque das Águas (exemplo)"],["Empreendimentos Teste SC (fictícia)","Jardins do Norte (exemplo)"]];
const state={db:null,user:null,workspace:null,role:null,demo:!connected,leads:[],evidences:[],activities:[],view:"dashboard",selected:null,editing:null,filter:"",leadScope:"ready",notice:"",error:false,loading:false,checks:[],draft:null,authEpoch:0,employees:[]};
function blank(){
const l={company:"",city:"Joinville",uf:"SC",segment:"Construtora / incorporadora",project:"",company_size:"",project_stage:"",verification_status:"identificada",opportunity_type:"hipotese_exploratoria",commercial_status:"nao_contatada",confidence:"baixa",source_url:"",source_checked_at:null,signal:"",signal_date:null,website:"",buyer_department:"",contact_channel:"",contact_email:"",contact_phone:"",instagram_url:"",next_action:"",dossier:""};
POINTS.forEach(p=>l[p[0]]=0);return l;
}
function startDemo(){
if(config.allowDemo===false){state.demo=false;note("Demonstração desativada.",true);return;}
state.authEpoch++;state.editing=null;state.draft=null;state.selected=null;state.error=false;
state.demo=true;state.workspace=null;state.user=null;state.role="demo";
state.leads=demoItems.map((x,i)=>({...blank(),id:"demo-"+i,company:x[0],project:x[1],dossier:"Registro inteiramente fictício para demonstração. Não é uma empresa prospectada.",created_at:new Date().toISOString()}));
state.evidences=[];state.activities=[];state.view="dashboard";state.notice="Modo demonstração: empresas fictícias e alterações apenas em memória. Os dados são apagados ao recarregar.";
render();
}
function note(t,isError=false){state.notice=t;state.error=isError;render()}
function button(text,action,arg="",kind=""){return '<button class="btn '+kind+'" type="button" data-action="'+action+'" '+(arg?'data-id="'+escape(arg)+'"':"")+'>'+text+'</button>'}
function pill(t,kind=""){return '<span class="pill '+kind+'">'+escape(t)+'</span>'}
let fieldId=0;
function field(n,t,v,type="text"){const id="f-"+n+"-"+(++fieldId);return '<div class="field"><label for="'+id+'">'+escape(t)+'</label><input id="'+id+'" name="'+n+'" class="input" type="'+type+'" value="'+escape(v??"")+'"></div>'}
function area(n,t,v){const id="f-"+n+"-"+(++fieldId);return '<div class="field"><label for="'+id+'">'+escape(t)+'</label><textarea id="'+id+'" class="input" name="'+n+'" rows="3">'+escape(v||"")+'</textarea></div>'}
function select(n,t,v,items){const id="f-"+n+"-"+(++fieldId);return '<div class="field"><label for="'+id+'">'+escape(t)+'</label><select id="'+id+'" name="'+n+'" class="input">'+items.map(x=>'<option value="'+escape(x[0])+'" '+(x[0]===v?"selected":"")+'>'+escape(x[1])+'</option>').join("")+'</select></div>'}
function detail(k,v){return '<div class="detail"><small>'+escape(k)+'</small><span>'+escape(v||"Não encontrado")+'</span></div>'}
function hlink(u){return safeURL(u)?'<a href="'+escape(u)+'" target="_blank" rel="noopener noreferrer">'+escape(u)+'</a>':escape(u||"Não encontrado")}
function instagramURL(value){
const raw=String(value||'').trim();if(!raw)return null;
let name=raw.replace(/^@/,'');
if(raw.includes('://')){try{const u=new URL(raw);if(u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname)||u.username||u.password||u.port)return null;const match=u.pathname.match(/^\/([A-Za-z0-9_.]{1,30})\/?$/);if(!match)return null;name=match[1];}catch{return null;}}
if(!/^[A-Za-z0-9_.]{1,30}$/.test(name)||name.includes('..')||name.endsWith('.')||['p','reel','reels','stories','explore','accounts','direct','about','developer','legal'].includes(name.toLowerCase()))return null;
return 'https://www.instagram.com/'+name.toLowerCase()+'/';
}
function instagramLink(x){const u=instagramURL(x.instagram_url);return u?'<a class="btn small" href="'+escape(u)+'" target="_blank" rel="noopener noreferrer">Abrir Instagram da empresa</a>':'<span class="muted">Instagram não informado</span>';}

function whatsappNumber(value){
const raw=String(value||'').trim();
if(!raw||!/^[+\d\s().-]+$/.test(raw))return null;
let n=raw.replace(/\D/g,'');
if(n.length===10||n.length===11)n='55'+n;
return /^55[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(n)?n:null;
}
function whatsappMessage(x){return 'Olá, equipe da '+x.company+'! Sou da MAS, de Joinville. Produzimos conteúdo visual e audiovisual para apresentar empresas e empreendimentos. Quem cuida de marketing ou da contratação desses serviços? Posso enviar uma apresentação breve?';}
function whatsappPanel(x){
if(state.demo)return '<div class="panel"><h2>WhatsApp</h2><p>Demonstração fictícia: contatos externos desativados.</p></div>';
if(x.verification_status==='descartada'||['nao_contatar','perdida'].includes(x.commercial_status)||/FORA DA FILA100|Contato pendente de conferência/i.test(x.contact_channel||''))return '<div class="panel"><h2>WhatsApp</h2><p>Contato bloqueado para este cadastro.</p></div>';
const n=whatsappNumber(x.contact_phone),message=whatsappMessage(x);
return '<div class="panel" style="margin-top:13px"><h2>WhatsApp</h2>'+(n?'<p>'+escape(message)+'</p><a class="btn primary" href="https://wa.me/'+n+'?text='+escape(encodeURIComponent(message))+'" target="_blank" rel="noopener noreferrer">Abrir conversa com mensagem</a><p class="muted">Revise o destinatário e a mensagem antes de enviar. A disponibilidade deste número no WhatsApp precisa ser confirmada.</p>':'<p>WhatsApp não confirmado. Utilize o e-mail ou formulário corporativo indicado no dossiê.</p>')+'</div>';
}
function readyLead(x){
if(state.demo)return true;
return verified(x)&&!['nao_contatar','perdida'].includes(x.commercial_status)&&!/^QA MAS INTERNO/i.test(x.company||'')&&!/FORA DA FILA100|Contato pendente de conferência/i.test(x.contact_channel||'')&&!!(whatsappNumber(x.contact_phone)||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.contact_email||'')||(/formul[aá]rio/i.test(x.contact_channel||'')&&safeURL(x.website||x.source_url)));
}

const FOLLOWUP_MARKER='[MAS_ACOMPANHAMENTO_V1]';
const FOLLOWUP_ACTIONS=[['comentario','Comentário'],['contato','Contato feito'],['apresentacao','Apresentação do negócio'],['negociacao','Em negociação'],['retorno','Retorno / próxima ação']];
const PRIORITIES=[['normal','Normal'],['alta','Alta'],['urgente','Urgente']];
function followupData(a){
if(!String(a.description||'').startsWith(FOLLOWUP_MARKER))return null;
try{const d=JSON.parse(a.description.slice(FOLLOWUP_MARKER.length));return d&&FOLLOWUP_ACTIONS.some(x=>x[0]===d.action)&&PRIORITIES.some(x=>x[0]===d.priority)&&typeof d.comment==='string'?d:null}catch{return null}
}
function leadPriority(x){
const records=state.activities.filter(a=>a.lead_id===x.id&&followupData(a)).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))||String(b.id||'').localeCompare(String(a.id||'')));
return records.length?followupData(records[0]).priority:'normal';
}
function priorityBadge(x){const p=leadPriority(x);return p==='normal'?'':pill('★ Prioridade '+label(PRIORITIES,p),'amber');}
function compareLeads(a,b){const ranks={normal:0,alta:1,urgente:2};return ranks[leadPriority(b)]-ranks[leadPriority(a)]||(score(b)??-1)-(score(a)??-1);}
function activityHTML(a){
const d=followupData(a),author=a.author_id?(a.author_id===state.user?.id?(state.user?.user_metadata?.username||'Você'):'Funcionário '+a.author_id.slice(0,8)):'Registro anterior';
return '<div class="event"><strong>'+escape(d?label(FOLLOWUP_ACTIONS,d.action):a.description)+'</strong>'+(d?'<p style="white-space:pre-wrap;overflow-wrap:anywhere">'+escape(d.comment)+'</p>'+pill('Prioridade '+label(PRIORITIES,d.priority),d.priority==='normal'?'':'amber'):'')+'<small>'+escape(author)+' · '+escape(new Date(a.created_at).toLocaleString('pt-BR'))+'</small></div>';
}
function followupPage(){
const x=state.leads.find(l=>l.id===state.selected)||state.leads.find(readyLead)||state.leads[0];
if(!x)return '<div class="panel">Cadastre um lead para iniciar o acompanhamento.</div>';
state.selected=x.id;
const acts=state.activities.filter(a=>a.lead_id===x.id&&commercialActivity(a)).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
const list=state.leads.filter(l=>!/^QA MAS INTERNO/i.test(l.company||'')||l.id===x.id).sort(compareLeads);
return '<div class="panel">'+select('followup_lead','Empresa em acompanhamento',x.id,list.map(l=>[l.id,l.company]))+'</div><div class="row between" style="margin:16px 0"><div><h2>'+escape(x.company)+'</h2>'+priorityBadge(x)+pill(label(STAGES,x.commercial_status))+'</div>'+button('Ver dossiê','open',x.id,'small')+'</div><div class="grid2"><section class="panel"><h2>Atualizar acompanhamento</h2>'+(editable()?'<form id="followup-form">'+select('action','O que foi feito','comentario',FOLLOWUP_ACTIONS)+area('comment','Comentário e resultado','')+select('priority','Prioridade de atendimento',leadPriority(x),PRIORITIES)+'<p class="muted">Registre somente ações realizadas. A prioridade destaca a empresa nas listas. Para mudar a etapa do funil, use o campo abaixo.</p><button class="btn primary" type="submit">Salvar atualização</button></form><hr><form id="stage-form">'+select('stage','Etapa do funil',x.commercial_status,STAGES)+'<button class="btn" type="submit">Salvar etapa</button></form>':'<p>Seu acesso permite consultar o acompanhamento.</p>')+'</section><section class="panel"><h2>Comentários e atividades</h2><div class="timeline">'+(acts.length?acts.map(activityHTML).join(''):'<p>Nenhuma atualização registrada.</p>')+'</div></section></div>';
}
async function saveFollowup(f){
if(!editable()||(!state.demo&&!state.workspace))throw Error('Sem permissão para atualizar este lead.');
const x=state.leads.find(l=>l.id===state.selected);if(!x)throw Error('Lead não encontrado.');
const d=new FormData(f),entry={action:String(d.get('action')||''),priority:String(d.get('priority')||''),comment:String(d.get('comment')||'').trim()};
if(!FOLLOWUP_ACTIONS.some(x=>x[0]===entry.action)||!PRIORITIES.some(x=>x[0]===entry.priority))throw Error('Escolha ação e prioridade válidas.');
if(!entry.comment||entry.comment.length>5000)throw Error('Informe um comentário de até 5000 caracteres.');
const payload={lead_id:x.id,type:'nota',description:FOLLOWUP_MARKER+JSON.stringify(entry)};
if(state.demo)state.activities.unshift({...payload,id:uid(),created_at:new Date().toISOString()});
else{const r=await state.db.from('activities').insert({...payload,workspace_id:state.workspace}).select('id');if(r.error)throw r.error;if(!r.data?.length)throw Error('Atualização não confirmada pelo banco.');await load();}
note('Acompanhamento salvo. Nenhuma mensagem foi enviada.');
}

function visibleLeads(){return state.leads.filter(x=>(state.leadScope==='all'||(state.leadScope==='pending'?!readyLead(x):readyLead(x)))&&norm(x.company+' '+x.city+' '+x.project).includes(norm(state.filter))).sort(compareLeads);}
function commercialActivity(a){if(followupData(a))return true;return !/\bsherlock\b|revis[aã]o work|FILA100|revis[aã]o documental|importa[cç][aã]o|recalibr|auditoria|revalida[cç][aã]o/i.test(a.description||'');}
function businessDossier(x){
const raw=String(x.dossier||'').replace(/\\r\\n|\\n/g,'\n');
if(!/\bsherlock\b|revis[aã]o work|FILA100|HISTÓRICO ANTERIOR/i.test(raw))return raw;
const current=raw.split(/\[HISTÓRICO ANTERIOR\]/i)[0];
const alert=current.match(/\[ALERTA CADASTRAL[^\]]*\]\s*([^\[]+)/i);
const facts=current.split(/\r?\n/).filter(line=>/^(Constata[cç][aã]o|Hip[oó]tese MAS|Comprador|N[aã]o verificado|Perguntas para qualifica[cç][aã]o|FATO PUBLICADO|PENDÊNCIA ESPECÍFICA|ALERTA CADASTRAL)\s*:/i.test(line.trim()));
if(!facts.length&&!/^\s*\[/.test(current)&&current.trim())return current.trim();
if(alert)facts.unshift('Pendência cadastral: '+alert[1].trim());
return facts.length?facts.join('\n'):'Cadastro em revisão. Consulte as fontes e confirme identidade, atividade e canal corporativo antes de abordar.';
}

function level(x){const n=score(x);return n===null?["Sem score",""]:n>=80?["Muito alta","green"]:n>=60?["Alta","blue"]:n>=40?["Moderada","amber"]:["Baixa",""]}
function editable(){return state.demo||["admin","editor"].includes(state.role)}
function navItems(){return [["dashboard","◫","Dashboard"],["leads","▤","Leads"],["pipeline","▦","Funil"],["followup","✎","Acompanhamento"],["dossier","◇","Dossiês"],["guide","?","Guia de uso"],...(state.role==="admin"?[["tests","✓","Diagnóstico"],["team","♙","Equipe"]]:[])]}
function validate(x){
if(!x.company.trim()||!x.city.trim()||!/^[A-Z]{2}$/.test(x.uf||""))return"Empresa, cidade e UF de duas letras são obrigatórios.";
for(const [k,max] of Object.entries(caps)){const n=Number(x[k]);if(!Number.isInteger(n)||n<0||n>max)return"Score inválido: "+k;}
if(x.instagram_url&&!instagramURL(x.instagram_url))return "Informe um perfil válido do Instagram (link HTTPS ou @usuário), sem links de publicações.";
if(x.website&&!safeURL(x.website))return"Site deve ter URL HTTPS válida.";
if(x.source_url&&!safeURL(x.source_url))return"A fonte precisa ter URL HTTPS válida.";
if(verified(x)&&(!x.source_url||!x.source_checked_at))return"Verificação exige fonte HTTPS e data da consulta.";
if(x.verification_status==="acionavel"&&(!x.contact_channel||!x.next_action))return"Acionável exige canal público e próxima ação.";
const s=Number(x.signal_points),t=x.opportunity_type;
if(["hipotese_exploratoria","fit_estrutural"].includes(t)&&s!==0)return"Fit e hipótese não pontuam como sinal.";
if(t==="gatilho_indireto"&&s!==0&&(s<9||s>17))return"Gatilho indireto aceita 0 provisório ou 9–17 pontos.";
if(t==="demanda_explicita"&&s!==0&&(s<18||s>25))return"Demanda explícita aceita 0 provisório ou 18–25 pontos.";
return null;
}
function clearAccount(){
state.authEpoch++;state.employees=[];state.user=null;state.workspace=null;state.role=null;state.leads=[];state.evidences=[];state.activities=[];state.selected=null;state.editing=null;state.draft=null;state.checks=[];state.filter="";state.leadScope="ready";state.view="dashboard";
}
async function load(){
if(!state.db||!state.user)return;
const epoch=state.authEpoch,userId=state.user.id;
const member=await state.db.from("workspace_members").select("workspace_id,role").eq("user_id",state.user.id).limit(1);
if(epoch!==state.authEpoch||state.user?.id!==userId)return;
if(member.error)throw member.error;
if(!member.data?.length){state.workspace=null;state.role=null;state.leads=[];state.activities=[];state.evidences=[];state.notice="Usuário autenticado, mas ainda não foi vinculado à organização MAS.";state.error=true;render();return;}
state.workspace=member.data[0].workspace_id;state.role=member.data[0].role;
const [leads,evidences,activities]=await Promise.all([
state.db.from("leads").select("*").eq("workspace_id",state.workspace).order("updated_at",{ascending:false}),
state.db.from("evidences").select("*").eq("workspace_id",state.workspace).order("created_at",{ascending:false}),
state.db.from("activities").select("*").eq("workspace_id",state.workspace).order("created_at",{ascending:false})
]);
if(epoch!==state.authEpoch||state.user?.id!==userId)return;
for(const res of [leads,evidences,activities])if(res.error)throw res.error;
state.leads=leads.data||[];state.evidences=evidences.data||[];state.activities=activities.data||[];
}
function login(){
root.innerHTML='<div class="signin"><div class="signin-box"><div class="brand"><div class="brand-icon">⌕</div><div><strong>MAS INTELLIGENCE</strong><small>PROSPECÇÃO COMERCIAL</small></div></div><h1>Acessar CRM</h1><p class="muted">Área comercial exclusiva da MAS. Entre com sua conta autorizada.</p>'+(state.notice?'<div class="banner error">'+escape(state.notice)+'</div>':"")+
'<form id="login-form">'+field("email","E-mail ou usuário","","text")+field("password","Senha","","password")+'<button class="btn primary" style="width:100%;margin-top:12px" type="submit">Entrar</button></form>'+
(config.allowDemo!==false?'<div style="margin-top:16px;text-align:center">'+button("Conhecer demonstração fictícia","demo","","outline")+'</div>':"")+'</div></div>';
}
function render(){
if(!state.demo&&!state.user){login();return;}
const nav=navItems();
const top=nav.find(x=>x[0]===state.view)?.[2]||"MAS Intelligence";
root.innerHTML='<div class="app-layout"><aside class="sidebar"><div class="brand"><div class="brand-icon">⌕</div><div><strong>MAS CRM</strong><small>INTELLIGENCE</small></div></div>'+
nav.map(x=>'<button class="nav '+(state.view===x[0]?"active":"")+'" data-action="nav" data-id="'+x[0]+'"><span class="ico">'+x[1]+'</span><span>'+x[2]+'</span></button>').join("")+
'<div class="sidebar-foot">'+escape(state.demo?"DEMONSTRAÇÃO":"ÁREA PROTEGIDA")+'<div style="margin-top:12px">'+button(state.demo&&connected?"Voltar ao login":state.demo?"Reiniciar demo":"Sair",state.demo?(connected?"back-login":"reset-demo"):"logout","","small")+'</div></div></aside>'+
'<div class="main"><header class="topbar"><div><h1>'+escape(top)+'</h1><small>MAS · Produção Visual e Audiovisual</small></div><div class="row">'+pill(state.demo?"Dados fictícios":state.role==="viewer"?"Somente leitura":state.user?.user_metadata?.username||"Conta autorizada",state.demo?"amber":"green")+(state.demo&&connected?button("Acessar CRM","back-login","","small"):"")+(editable()?button("+ Novo lead","new","","primary"):"")+'</div></header><main class="content">'+(state.notice?'<div class="banner '+(state.error?"error":"")+'">'+escape(state.notice)+'</div>':"")+(state.workspace===null&&!state.demo?'<div class="banner error">Associe este usuário a um workspace no Supabase para usar o CRM.</div>':"")+page()+'</main></div></div>'+(state.editing!==null?editor():"");
}
function page(){if(state.view==="followup")return followupPage();if(state.view==="team")return teamPage();if(state.view==="guide")return guidePage();return state.view==="leads"?leadsPage():state.view==="pipeline"?pipelinePage():state.view==="dossier"?dossierPage():state.view==="tests"?testPage():dashboard()}
function loginEmail(value){
const text=String(value||" ").trim().toLowerCase();
if(text.includes("@"))return text;
if(!/^[a-z][a-z0-9_-]{2,31}$/.test(text))throw Error("Informe seu e-mail ou um usuário válido, como arch01.");
return text+"@mas-crm.invalid";
}
function guidePage(){return '<div class="panel"><h2>Como usar o CRM da MAS</h2><ol><li><strong>Acesso individual.</strong> Cada funcionário usa seu próprio usuário e senha. Ao terminar em computador compartilhado, clique em Sair.</li><li><strong>Pesquisar antes de cadastrar.</strong> Busque a empresa e a cidade em Leads para evitar duplicatas. Informe empresa, segmento, cidade/UF e próxima ação.</li><li><strong>Documentar a pesquisa.</strong> No dossiê, registre URL específica, data da consulta e o que a fonte comprova. Separe confirmado, indício, hipótese e não verificado.</li><li><strong>Qualificar com evidências.</strong> Porte, projeto, estágio e comprador desconhecidos permanecem pendentes. Empresa identificada não publica score. A pontuação não representa chance de compra.</li><li><strong>Planejar e registrar.</strong> Atualize o funil somente conforme o que aconteceu. Uma pesquisa ou abertura de link não equivale a contato enviado. Registre data, resultado e próxima ação no histórico.</li><li><strong>Exportar.</strong> Em Leads, use Exportar CSV; o arquivo corresponde à lista filtrada. Guarde os dados comerciais apenas em local autorizado.</li></ol><h3>Permissões</h3><p>Funcionário editor cadastra e edita leads, fontes e histórico. Somente administrador exclui empresas e cadastra novos funcionários. Leitor consulta e exporta.</p><h3>Base de pesquisa</h3><p>Notas marcadas A CONFERIR são pesquisas pendentes. Fonte publicada não comprova demanda, orçamento nem autorização de contato. Priorize Joinville e Norte de SC para os serviços da MAS.</p><h3>Ajuda de acesso</h3><p>Se esquecer sua senha, procure o administrador. Usuários internos não recebem e-mail de recuperação. A demonstração fictícia é separada da base real e perde alterações ao recarregar.</p></div>';}
function teamPage(){
if(state.demo||state.role!=="admin")return '<div class="panel"><h2>Equipe</h2><p>Acesso exclusivo do administrador.</p></div>';
return '<div class="grid two"><section class="panel"><h2>Funcionários</h2>'+button("Atualizar equipe","team-refresh")+'<p>Cada pessoa deve ter um usuário individual. Não compartilhe a conta administrativa.</p>'+(state.employees.length?state.employees.map(x=>'<div class="detail"><strong>'+escape(x.username)+'</strong><span>'+escape(x.role==="editor"?"Funcionário editor":x.role==="viewer"?"Somente leitura":"Administrador")+'</span></div>').join(""):'<p>Clique em Atualizar equipe para consultar os acessos.</p>')+'</section><section class="panel"><h2>Novo funcionário</h2><p>O funcionário poderá cadastrar e editar a base da MAS, sem excluir empresas nem administrar acessos.</p><form id="employee-form">'+field("username","Usuário do funcionário","arch01")+field("employee_password","Senha inicial (mínimo12 caracteres)","","password").replace('type="password"','type="password" autocomplete="new-password" minlength="12" maxlength="128" required')+'<p class="muted">Use maiúscula, minúscula e número. Defina a senha diretamente aqui; ela não será exibida no histórico nem salva no código. O login usa o nome escolhido, sem precisar de e-mail. Recuperação pelo administrador.</p><button type="submit" class="btn primary">Criar funcionário editor</button></form></section></div>';
}
async function teamRequest(body){
if(state.demo||state.role!=="admin"||!state.workspace)throw Error("Somente o administrador gerencia a equipe.");
const epoch=state.authEpoch,userId=state.user?.id,workspace=state.workspace;
const result=await state.db.functions.invoke("manage-employees",{body:{...body,workspace_id:workspace}});
if(epoch!==state.authEpoch||userId!==state.user?.id||workspace!==state.workspace)throw Error("Sessão alterada. Entre novamente.");
if(result.error){let message="Não foi possível acessar o serviço de equipe.";try{message=(await result.error.context.json()).error||message}catch{}throw Error(message);}
if(result.data?.error)throw Error(result.data.error);
return result.data;
}
async function loadTeam(){const result=await teamRequest({action:"list"});state.employees=result.employees||[];}
async function createEmployee(form){
const d=new FormData(form);const username=String(d.get("username")||"").trim().toLowerCase(),password=String(d.get("employee_password")||"");
if(!/^[a-z][a-z0-9_-]{2,31}$/.test(username))throw Error("Usuário:3 a32 caracteres, começando por letra; use letras, números, _ ou -.");
if(password.length<12||password.length>128||!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/\d/.test(password))throw Error("A senha precisa ter12 a128 caracteres, com maiúscula, minúscula e número.");
const result=await teamRequest({action:"create",username,password});
form.reset();await loadTeam();state.notice=result.message||"Funcionário criado.";state.error=false;render();
}
function dashboard(){
const l=state.leads.filter(readyLead).sort(compareLeads);
const k=[["Empresas",l.length],["Verificadas",l.filter(verified).length],["Prioridade alta+",l.filter(x=>score(x)!==null&&score(x)>=60).length],["Reuniões",l.filter(x=>x.commercial_status==="reuniao").length],["Propostas",l.filter(x=>x.commercial_status==="proposta").length],["Negociações",l.filter(x=>x.commercial_status==="negociacao").length],["Convertidas",l.filter(x=>x.commercial_status==="convertida").length]];
return '<div class="banner">'+(state.demo?"Este é um ambiente demonstrativo com empresas inventadas. Cadastros não são compartilhados nem salvos.":"Sua carteira de prospecção e próximas ações comerciais.")+'</div><div class="metrics">'+k.map(x=>'<div class="metric"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join("")+'</div>'+
'<div class="section"><h2>Empresas para contato</h2>'+button("Atualizar","refresh","","small")+'</div><div class="panel">'+(l.length?l.slice(0,8).map(x=>'<div class="leadrow"><div><strong>'+escape(x.company)+'</strong>'+priorityBadge(x)+'<small>'+escape(x.city)+"/"+escape(x.uf)+' · '+escape(x.project||"Projeto pendente")+'</small></div><div>'+pill(label(VERIFY,x.verification_status))+'</div><strong>'+(score(x)??"—")+'</strong><small>'+escape(label(STAGES,x.commercial_status))+'</small>'+button("Abrir","open",x.id,"small")+'</div>').join(""):'<p class="muted">Nenhuma empresa cadastrada.</p>')+'</div><div class="grid2" style="margin-top:15px"><div class="panel"><h3>Critério de prioridade</h3><p>ICP 30 · Sinal 25 · Potencial 15 · Acesso 15 · Geografia 10 · Evidências 5.</p><p class="muted">Score só para empresas verificadas não descartadas. Score não equivale a interesse de compra.</p></div><div class="panel"><h3>Operação comercial</h3><p>Registre fontes específicas, datas, departamento comprador e próximos passos. Nenhuma comunicação é enviada automaticamente.</p></div></div>';
}
function leadsPage(){
const list=visibleLeads();
return '<div class="row" style="margin-bottom:14px">'+button('Para contato','scope','ready','small')+button('Pendências','scope','pending','small')+button('Todos','scope','all','small')+pill(state.leadScope==='pending'?'Pendências':state.leadScope==='all'?'Todos os cadastros':'Para contato')+'</div><div class="row between" style="margin-bottom:14px"><input id="search" class="input" style="max-width:360px;flex:1" placeholder="Buscar empresa, cidade ou empreendimento" value="'+escape(state.filter)+'"><div class="row">'+pill(list.length+" registros")+button("Exportar CSV","csv","","small")+'</div></div><div class="panel tablewrap"><div class="leadrow header"><span>Empresa</span><span>Estado</span><span>Score</span><span>Funil</span><span></span></div>'+
(list.length?list.map(x=>'<div class="leadrow"><div><strong>'+escape(x.company)+'</strong>'+priorityBadge(x)+'<small>'+escape(x.city)+"/"+escape(x.uf)+' · '+escape(x.project||"Não informado")+'</small></div><div>'+pill(label(VERIFY,x.verification_status),verified(x)?"green":"")+'</div><strong>'+(score(x)??"—")+'</strong><small>'+escape(label(STAGES,x.commercial_status))+'</small>'+button("Dossiê","open",x.id,"small")+'</div>').join(""):'<p>Nenhuma empresa encontrada.</p>')+'</div>';
}
function pipelinePage(){
return '<div class="banner">O funil reflete somente status comerciais registrados. Para mudar a etapa, abra o dossiê do lead.</div><div class="kanban">'+STAGES.map(st=>{const ls=state.leads.filter(x=>verified(x)&&!/^QA MAS INTERNO/i.test(x.company||'')&&!/FORA DA FILA100|Contato pendente de conferência/i.test(x.contact_channel||'')&&x.commercial_status===st[0]);return '<div class="lane"><div class="lane-title">'+escape(st[1])+pill(ls.length)+'</div>'+ls.map(x=>'<div class="ticket"><strong>'+escape(x.company)+'</strong>'+priorityBadge(x)+'<small>'+escape(x.city)+' · Score: '+(score(x)??"—")+'</small>'+button("Abrir","open",x.id,"small")+'</div>').join("")+'</div>'}).join("")+'</div>';
}
function dossierPage(){
const x=state.leads.find(l=>l.id===state.selected)||state.leads.find(readyLead)||state.leads[0];if(x)state.selected=x.id;if(!x)return '<div class="panel">Cadastre um lead para criar um dossiê.</div>';
const ev=state.evidences.filter(e=>e.lead_id===x.id),act=state.activities.filter(a=>a.lead_id===x.id&&commercialActivity(a)),s=score(x);
const gr=[["ICP",["icp_sector","icp_use","icp_size","icp_model"],30],["Sinal",["signal_points"],25],["Potencial",["potential_scale","potential_repeat","potential_expansion"],15],["Acessibilidade",["access_points"],15],["Geografia",["geo_points"],10],["Evidências",["evidence_points"],5]];
return '<div class="row between" style="margin-bottom:15px"><div><h1>'+escape(x.company)+'</h1>'+priorityBadge(x)+'<p class="muted">'+escape(x.city)+"/"+escape(x.uf)+' · '+escape(x.project||"Sem empreendimento")+'</p><div class="row">'+pill(label(VERIFY,x.verification_status),verified(x)?"green":"")+pill(label(TYPES,x.opportunity_type),"blue")+pill(label(STAGES,x.commercial_status))+'</div></div><div class="row">'+(button("Acompanhamento","followup",x.id,"small")+(editable()?button("Editar","edit",x.id,"small")+((state.demo||state.role==="admin")?button("Excluir","delete",x.id,"small danger"):""):""))+'</div></div>'+
'<div class="grid2 dossier-grid"><div><div class="panel"><h2>Dossiê do empreendimento</h2>'+
[["Segmento",x.segment],["Porte comprovado",x.company_size],["Estágio do projeto",x.project_stage],["Sinal / hipótese",x.signal],["Data do sinal",date(x.signal_date)],["Departamento comprador",x.buyer_department],["Próxima ação",/FORA DA FILA100|Contato pendente de conferência/i.test(x.contact_channel||'')?'Confirmar identidade, atividade e contato corporativo antes de abordar.':x.next_action],["Resumo comercial",businessDossier(x)],["Canal público",/FORA DA FILA100|Contato pendente de conferência/i.test(x.contact_channel||'')?'Não confirmado':x.contact_channel],["E-mail corporativo",x.contact_email],["Telefone corporativo",x.contact_phone],["Consulta da fonte",date(x.source_checked_at)]].map(y=>detail(y[0],y[1])).join("")+
'<div class="detail"><small>Instagram</small><span>'+instagramLink(x)+'</span></div><div class="detail"><small>Fonte principal</small><span>'+hlink(x.source_url)+'</span></div></div>'+
'<div class="panel" style="margin-top:13px"><div class="row between"><h2>Fontes e evidências</h2>'+pill(ev.length+" fontes")+'</div><p class="muted">Cada evidência tem atributo, URL, data e classificação. Fontes não são confirmação de intenção de compra por si só.</p>'+
ev.map(e=>'<div class="detail"><strong>'+escape(/sherlock|FILA100|revis[aã]o documental work/i.test(e.attribute_name)?'Verificação de atividade e contato':e.attribute_name)+'</strong> '+pill(e.evidence_status)+'<p>'+escape(String(e.finding||'').replace(/^Leitura documental pelo Work; n[aã]o houve contato\.\s*/i,'').replace(/^Fila100:\s*/i,''))+'</p><div>'+hlink(e.source_url)+'</div><small class="muted">Fato: '+date(e.event_date)+' · Consulta: '+date(e.checked_at)+'</small>'+(editable()?'<div style="margin-top:7px">'+button("Remover fonte","del-evidence",e.id,"small danger")+'</div>':"")+'</div>').join("")+
(editable()?'<form id="evidence-form"><div class="form-section">Nova evidência</div><div class="grid2">'+field("attribute_name","Atributo (atividade, porte, projeto...)","")+select("evidence_status","Classificação","confirmado",[["confirmado","Confirmado"],["indicio","Indício"],["hipotese","Hipótese"],["nao_verificado","Não verificado"]])+field("source_url","URL específica HTTPS","","url")+field("event_date","Data do fato","","date")+'</div><div style="margin:10px 0">'+area("finding","O que a fonte comprova","")+'</div><button class="btn primary" type="submit">Registrar evidência</button></form>':"")+'</div>'+
'<div class="panel" style="margin-top:13px"><h2>Histórico comercial</h2><div class="timeline">'+(act.length?act.map(activityHTML).join(""):'<p class="muted">Sem atividades.</p>')+'</div>'+
(editable()?'<form id="activity-form"><div class="grid2">'+select("type","Tipo","nota",[["nota","Nota"],["evidencia","Pesquisa"],["contato","Contato realizado"],["reuniao","Reunião"],["proposta","Proposta"]])+field("description","Descrição do ocorrido","")+'</div><button class="btn primary" style="margin-top:10px" type="submit">Adicionar registro</button></form>':"")+'</div></div>'+
'<div><div class="panel"><h2>Prioridade comercial</h2><div class="row between"><strong style="font-size:31px">'+(s??"—")+' <small class="muted" style="font-size:12px">/100</small></strong>'+pill(level(x)[0],level(x)[1])+'</div>'+(s===null?'<p class="muted">Pontuação não publicada: identidade ainda não verificada ou lead descartado.</p>':"")+
gr.map(g=>{const n=g[1].reduce((v,k)=>v+Number(x[k]||0),0);return '<div style="margin-top:14px"><div class="row between" style="font-size:12px;margin-bottom:6px"><span>'+g[0]+'</span><strong>'+n+'/'+g[2]+'</strong></div><div class="track"><div class="track-fill" style="width:'+(n/g[2]*100)+'%"></div></div></div>'}).join("")+detail("Confiança",x.confidence)+'</div>'+
whatsappPanel(x)+'<div class="panel" style="margin-top:13px"><h2>Funil comercial</h2>'+(editable()?'<form id="stage-form">'+select("stage","Situação atual",x.commercial_status,STAGES)+'<button class="btn primary" style="margin-top:12px" type="submit">Atualizar status</button></form>':'<p>'+escape(label(STAGES,x.commercial_status))+'</p>')+'</div></div></div>';
}
function testPage(){
return '<div class="panel"><h2>Diagnóstico da aplicação</h2><p class="muted">Estes testes verificam funções locais do programa. Não substituem testes reais de RLS nem de disponibilidade do Supabase.</p>'+button("Executar testes","test","","primary")+'<div style="margin-top:14px">'+state.checks.map(x=>'<div class="testline"><span>'+escape(x.name)+'</span>'+pill(x.ok?"PASSOU":"FALHOU",x.ok?"green":"amber")+'</div>').join("")+'</div></div>';
}
function editor(){
const x=state.draft||(state.editing==="new"?blank():state.leads.find(l=>l.id===state.editing));if(!x)return"";
return '<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-label="Cadastro de lead"><div class="modal-head"><h2>'+escape(state.editing==="new"?"Cadastrar empresa":"Editar "+x.company)+'</h2>'+button("Fechar","close","","small outline")+'</div>'+(state.error&&state.notice?'<div class="banner error" role="alert">'+escape(state.notice)+'</div>':'')+'<form id="lead-form" style="display:flex;flex-direction:column;min-height:0;overflow:hidden"><div class="modal-body"><div class="form-section">01 · Empresa</div><div class="grid2">'+field("company","Razão comercial / nome *",x.company)+field("city","Município *",x.city)+field("uf","UF",x.uf)+field("segment","Atividade",x.segment)+field("project","Empreendimento",x.project)+field("company_size","Porte comprovado (informe a fonte)",x.company_size)+field("project_stage","Estágio atual do projeto",x.project_stage)+field("buyer_department","Departamento comprador",x.buyer_department)+select("verification_status","Estado de verificação",x.verification_status,VERIFY)+select("opportunity_type","Tipo de oportunidade",x.opportunity_type,TYPES)+select("commercial_status","Status comercial",x.commercial_status,STAGES)+select("confidence","Confiança",x.confidence,[["baixa","Baixa"],["media","Média"],["alta","Alta"]])+'</div>'+
'<div class="form-section">02 · Fontes e contatos</div>'+area("signal","Sinal ou hipótese comercial",x.signal)+'<div class="grid2" style="margin:10px 0">'+field("signal_date","Data do sinal",x.signal_date,"date")+field("source_checked_at","Data da consulta",x.source_checked_at,"date")+field("source_url","URL de verificação",x.source_url,"url")+field("website","Site corporativo",x.website,"url")+field("instagram_url","Instagram oficial (link ou @usuário)",x.instagram_url)+field("contact_email","E-mail público",x.contact_email,"email")+field("contact_phone","Telefone público",x.contact_phone)+field("contact_channel","Canal adequado",x.contact_channel)+'</div>'+area("next_action","Próxima ação",x.next_action)+'<div style="margin-top:10px">'+area("dossier","Descrição, riscos e lacunas",businessDossier(x))+'</div>'+
'<div class="form-section">03 · Pontuação comercial</div><p class="muted">Registre apenas pontos sustentados por fatos. Valor ausente = zero provisório.</p><div class="grid2">'+POINTS.map(p=>'<div class="field"><label>'+escape(p[1])+' · 0–'+p[2]+'</label><input name="'+p[0]+'" class="input" type="number" min="0" max="'+p[2]+'" step="1" value="'+Number(x[p[0]]||0)+'"></div>').join("")+'</div></div><div class="modal-foot">'+button("Cancelar","close","","outline")+'<button class="btn primary" type="submit">Salvar lead</button></div></form></div></div>';
}
function formLead(f){
const d=new FormData(f),x={};
["company","city","uf","segment","project","company_size","project_stage","verification_status","opportunity_type","commercial_status","confidence","source_url","source_checked_at","signal","signal_date","website","buyer_department","contact_channel","contact_email","contact_phone","instagram_url","next_action","dossier"].forEach(k=>x[k]=String(d.get(k)||"").trim()||null);
["company","city","uf"].forEach(k=>x[k]=x[k]||"");
if(x.instagram_url)x.instagram_url=instagramURL(x.instagram_url)||x.instagram_url;
POINTS.forEach(p=>x[p[0]]=Number(d.get(p[0])||0));return x;
}
async function refresh(){if(!state.demo)await load();render()}
async function saveLead(f){
const x=formLead(f);state.draft=x;const error=validate(x);if(error)throw Error(error);
const old=state.editing==="new"?null:state.leads.find(l=>l.id===state.editing);
if(state.leads.some(l=>l.id!==(old?.id)&&norm(l.company)===norm(x.company)&&norm(l.city)===norm(x.city)))throw Error("Empresa já cadastrada nessa cidade.");
if(old&&/FILA100|HISTÓRICO ANTERIOR|revis[aã]o work|sherlock/i.test(old.dossier||'')){
const summary=businessDossier(old);
x.dossier=x.dossier===summary?old.dossier:x.dossier+'\n\n[HISTÓRICO ANTERIOR]\n'+old.dossier;
}
let id=old?.id;
if(state.demo){
if(old)Object.assign(old,x);else{id=uid();state.leads.unshift({...x,id,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});}
}else{
if(!editable()||!state.workspace)throw Error("Você não tem acesso de edição.");
if(old){
const r=await state.db.from("leads").update(x).eq("id",old.id).eq("workspace_id",state.workspace).select("id");
if(r.error)throw r.error;if(!r.data?.length)throw Error("O banco não confirmou a atualização.");
}else{
const r=await state.db.from("leads").insert({...x,workspace_id:state.workspace}).select("id").single();
if(r.error)throw r.error;id=r.data.id;
}
await load();
}
state.editing=null;state.draft=null;state.selected=id;state.view="dossier";note("Registro salvo "+(state.demo?"temporariamente na demonstração.":"no banco de dados."));
}
async function saveStage(f){
const x=state.leads.find(l=>l.id===state.selected),v=String(new FormData(f).get("stage"));
if(!x||!STAGES.some(s=>s[0]===v)||x.commercial_status===v)return;
const interaction=["contatada","respondeu","reuniao","proposta","negociacao","convertida"].includes(v);
if(!state.demo&&interaction&&!confirm("Confirmar etapa baseada em interação comercial real? Nenhuma mensagem será enviada pelo CRM."))return;
if(state.demo){x.commercial_status=v;state.activities.unshift({id:uid(),lead_id:x.id,type:"nota",description:"Etapa: "+label(STAGES,v),created_at:new Date().toISOString()});}
else{
if(!editable())throw Error("Somente leitura.");
const r=await state.db.from("leads").update({commercial_status:v}).eq("workspace_id",state.workspace).eq("id",x.id).select("id");
if(r.error)throw r.error;if(!r.data?.length)throw Error("Alteração não confirmada pelo banco.");
await load();
}
note("Etapa atualizada. Nenhum contato foi enviado.");
}
async function addEvidence(f){
const x=state.leads.find(l=>l.id===state.selected);if(!x)throw Error("Lead não encontrado.");
const d=new FormData(f),p={lead_id:x.id,attribute_name:String(d.get("attribute_name")||"").trim(),evidence_status:String(d.get("evidence_status")||""),source_url:String(d.get("source_url")||"").trim(),event_date:String(d.get("event_date")||"")||null,finding:String(d.get("finding")||"").trim(),checked_at:today()};
if(!p.attribute_name||!p.finding||!safeURL(p.source_url))throw Error("Evidência requer atributo, descrição e URL HTTPS.");
if(state.demo)state.evidences.unshift({...p,id:uid(),created_at:new Date().toISOString()});
else{
const r=await state.db.from("evidences").insert({...p,workspace_id:state.workspace}).select("id");
if(r.error)throw r.error;if(!r.data?.length)throw Error("Evidência não confirmada.");await load();
}
note("Fonte registrada. Verifique manualmente se o conteúdo realmente sustenta o atributo.");
}
async function addActivity(f){
const x=state.leads.find(l=>l.id===state.selected),d=new FormData(f);
if(!x)throw Error("Lead não encontrado.");
const p={lead_id:x.id,type:String(d.get("type")||"nota"),description:String(d.get("description")||"").trim()};
if(!p.description)throw Error("Informe o evento.");
if(state.demo)state.activities.unshift({...p,id:uid(),created_at:new Date().toISOString()});
else{
const r=await state.db.from("activities").insert({...p,workspace_id:state.workspace}).select("id");
if(r.error)throw r.error;if(!r.data?.length)throw Error("Atividade não confirmada.");await load();
}
note("Histórico atualizado. Nenhuma mensagem foi enviada.");
}
async function deletion(id,table){
if(!confirm("Excluir permanentemente este registro?"))return;
if(!state.demo&&table==="leads"&&state.role!=="admin")throw Error("Apenas administradores podem excluir leads.");
if(state.demo){
if(table==="leads"){state.leads=state.leads.filter(x=>x.id!==id);state.evidences=state.evidences.filter(x=>x.lead_id!==id);state.activities=state.activities.filter(x=>x.lead_id!==id);state.selected=null;state.view="leads";}
else state.evidences=state.evidences.filter(x=>x.id!==id);
}else{
const r=await state.db.from(table).delete().eq("id",id).eq("workspace_id",state.workspace).select("id");
if(r.error)throw r.error;if(!r.data?.length)throw Error("Exclusão não confirmada.");
await load();if(table==="leads"){state.view="leads";state.selected=null;}
}
note("Exclusão concluída.");
}
function exportCSV(){
const cols=["company","city","uf","segment","project","company_size","project_stage","verification_status","opportunity_type","commercial_status","confidence","score","signal","signal_date","source_url","source_checked_at","buyer_department","contact_channel","contact_email","contact_phone","next_action"];
const cell=x=>{const raw=String(x??"");return '"'+(/^[=+\-@\t\r]/.test(raw)?"'"+raw:raw).replace(/"/g,'""')+'"'};
const out=[cols.join(",")].concat(visibleLeads().map(l=>cols.map(c=>cell(c==="score"?score(l):l[c])).join(",")));
const blob=new Blob(["\ufeff"+out.join("\r\n")],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="MAS-Intelligence-leads.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function test(){
const x={...blank(),company:"Teste",city:"Joinville"},v={...x,verification_status:"verificada",source_url:"https://example.com/empresa",source_checked_at:"2026-10-19"};
const items=[
["Score bloqueado sem verificação",score(x)===null],
["Score máximo = 100",score({...v,...caps})===100],
["Verificação exige fonte",!!validate({...v,source_url:null})],
["Verificação exige data",!!validate({...v,source_checked_at:null})],
["Lead acionável exige contato",!!validate({...v,verification_status:"acionavel"})],
["Fit estrutural sem pontos de sinal",!!validate({...v,opportunity_type:"fit_estrutural",signal_points:12})],
["Gatilho 9–17 é válido",validate({...v,opportunity_type:"gatilho_indireto",signal_points:12})===null],
["Gatilho rejeita 22 pontos",!!validate({...v,opportunity_type:"gatilho_indireto",signal_points:22})],
["URL javascript rejeitada",!safeURL("javascript:alert(1)")],
["Texto HTML protegido",escape("<img>")==="&lt;img&gt;"],
["Busca ignora acentos",norm("CONSTRUÇÃO")===norm("construcao")],
["Banco externo não é simulado",state.demo||!!state.db]
];
state.checks=items.map(x=>({name:x[0],ok:Boolean(x[1])}));state.view="tests";note("Testes locais: "+state.checks.filter(x=>x.ok).length+"/"+state.checks.length+". Testes do Supabase devem ser realizados após a implantação.");
}
root.addEventListener("click",async e=>{
const b=e.target.closest("[data-action]");if(!b)return;
const act=b.dataset.action,id=b.dataset.id;
if(state.loading)return;state.loading=true;
try{
if(act==="nav"){state.view=id;state.notice="";render();}
else if(act==="scope"){state.leadScope=id;state.filter="";render();}
else if(act==="followup"){state.selected=id;state.view="followup";state.notice="";render();}
else if(act==="open"){state.selected=id;state.view="dossier";state.notice="";render();}
else if(act==="new"){if(!editable())throw Error("Somente leitura.");state.notice="";state.error=false;state.draft=null;state.editing="new";render();}
else if(act==="edit"){if(!editable())throw Error("Somente leitura.");state.notice="";state.error=false;state.draft=null;state.editing=id;render();}
else if(act==="close"){state.draft=null;state.editing=null;render();}
else if(act==="refresh")await refresh();
else if(act==="test")test();
else if(act==="team-refresh"){await loadTeam();state.notice="Equipe atualizada.";state.error=false;render();}
else if(act==="csv")exportCSV();
else if(act==="delete")await deletion(id,"leads");
else if(act==="del-evidence")await deletion(id,"evidences");
else if(act==="demo")startDemo();
else if(act==="reset-demo")startDemo();
else if(act==="back-login"){state.demo=false;clearAccount();state.notice="";state.error=false;render();}
else if(act==="logout"){const r=await state.db.auth.signOut();if(r.error)throw r.error;clearAccount();state.notice="Sessão encerrada.";state.error=false;render();}
}catch(err){note(err.message||String(err),true)}finally{state.loading=false;}
});
root.addEventListener("submit",async e=>{
e.preventDefault();if(state.loading)return;state.loading=true;
try{
const f=e.target;
if(f.id==="login-form"){
if(!state.db)throw Error("Supabase ainda não configurado.");
const d=new FormData(f),r=await state.db.auth.signInWithPassword({email:loginEmail(d.get("email")),password:String(d.get("password")||"")});
if(r.error)throw Error(r.error.code==="invalid_credentials"?"Usuário ou senha incorretos.":"Não foi possível entrar. Confira seu acesso e tente novamente.");state.user=r.data.user;state.demo=false;state.notice="";await load();render();
}else if(f.id==="employee-form")await createEmployee(f);
else if(f.id==="lead-form")await saveLead(f);
else if(f.id==="stage-form")await saveStage(f);
else if(f.id==="evidence-form")await addEvidence(f);
else if(f.id==="activity-form")await addActivity(f);
else if(f.id==="followup-form")await saveFollowup(f);
}catch(err){note(err.message||String(err),true)}finally{state.loading=false;}
});
root.addEventListener("change",e=>{if(e.target.name==="followup_lead"&&!state.loading){state.selected=e.target.value;state.notice="";render();}});
root.addEventListener("input",e=>{
if(e.target.id==="search"){state.filter=e.target.value;const at=e.target.selectionStart;render();const el=root.querySelector("#search");if(el){el.focus();el.setSelectionRange(at,at);}}
});
async function init(){
if(!connected){
if(!url&&!key&&config.allowDemo!==false){startDemo();return;}
state.demo=false;state.notice="Ambiente real indisponível: confira a configuração e o carregamento do Supabase. Nenhum dado real foi carregado.";state.error=true;render();return;
}
try{
state.db=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}});
state.db.auth.onAuthStateChange((event,session)=>{
if(event==="SIGNED_OUT"){
if(!state.demo){clearAccount();state.notice="Sessão encerrada. Entre novamente.";state.error=false;render();}
return;
}
if(session?.user&&!state.demo&&state.user?.id!==session.user.id){
clearAccount();state.user=session.user;
// Não consultar o banco dentro do callback do Auth.
setTimeout(()=>load().then(render).catch(err=>note(err.message||String(err),true)),0);
}
});
const s=await state.db.auth.getSession();
if(s.error)throw s.error;
if(s.data.session?.user){state.user=s.data.session.user;state.demo=false;await load();render();}
else{state.demo=false;render();}
}catch(err){state.demo=false;state.notice="Falha de inicialização: "+(err.message||String(err));state.error=true;render();}
}
init();
})();

