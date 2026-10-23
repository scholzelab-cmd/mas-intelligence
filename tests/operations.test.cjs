const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const context={window:{MAS_CONFIG:{}},document:{getElementById:()=>({innerHTML:'',addEventListener(){}})},URL,FormData:class{constructor(o){this.o=o}get(k){return this.o[k]}},crypto:require('node:crypto').webcrypto};
vm.createContext(context);
vm.runInContext(source.replace('init();\n})();','window.api={state,blank,readyLead,visibleLeads,businessDossier,commercialActivity,whatsappPanel,whatsappMessage,dashboard,navItems,saveLead};\n})();'),context);
const a=context.window.api;a.state.demo=false;
const lead={...a.blank(),id:'1',company:'Empresa & Filhos',verification_status:'verificada',contact_phone:'(47) 99999-1234'};
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
test('telefone corporativo habilita fila de contato',()=>assert.ok(a.readyLead(lead)));
test('sem canal fica pendente',()=>assert.ok(!a.readyLead({...lead,contact_phone:''})));
test('identidade não verificada fica pendente mesmo com telefone',()=>assert.ok(!a.readyLead({...lead,verification_status:'identificada'})));
test('bloqueio e QA não entram na fila',()=>{for(const patch of [{commercial_status:'nao_contatar'},{contact_channel:'FORA DA FILA100'},{contact_channel:'Contato pendente de conferência.'},{company:'QA MAS INTERNO 20261020'}])assert.ok(!a.readyLead({...lead,...patch}))});
test('formulário sem URL não habilita fila',()=>assert.ok(!a.readyLead({...lead,contact_phone:'',contact_channel:'Formulário'})));
test('formulário corporativo com URL é alternativa ao telefone',()=>assert.ok(a.readyLead({...lead,contact_phone:'',contact_channel:'Formulário corporativo',website:'https://example.com/contato'})));
a.state.leads=[lead,{...lead,id:'2',company:'Pendente',contact_phone:''}];
test('lista padrão omite pendente',()=>assert.equal(a.visibleLeads().length,1));
test('pendência permanece acessível',()=>{a.state.leadScope='pending';assert.equal(a.visibleLeads()[0].id,'2');a.state.leadScope='ready'});
test('busca limita a lista exportável',()=>{a.state.filter='inexistente';assert.equal(a.visibleLeads().length,0);a.state.filter=''});
test('dashboard não promove cadastro sem canal',()=>assert.ok(!a.dashboard().includes('Pendente')));
test('resumo mantém fatos e retira bastidores antigos',()=>{const text=a.businessDossier({...lead,dossier:'[FILA100]\\r\\nConstatação: Edifício publicado.\\r\\nHipótese MAS: vídeo.\\r\\n[HISTÓRICO ANTERIOR]\\r\\nREVISÃO WORK Sherlock'});assert.ok(text.includes('Edifício publicado'));assert.ok(!/WORK|Sherlock|FILA100/.test(text))});
test('nota comercial é preservada e importação fica fora da timeline',()=>{assert.ok(a.commercialActivity({description:'Cliente pediu proposta na terça-feira'}));assert.ok(!a.commercialActivity({description:'Revisão Work / Sherlock FILA100'}))});
test('WhatsApp inclui empresa e mensagem íntegra codificada',()=>{const html=a.whatsappPanel(lead);const href=html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');const url=new URL(href);assert.equal(url.pathname,'/5547999991234');assert.equal(url.searchParams.get('text'),a.whatsappMessage(lead));assert.ok(html.includes('Empresa &amp; Filhos'))});
test('funcionário não vê diagnóstico técnico',()=>{a.state.role='editor';assert.ok(!a.navItems().some(x=>x[0]==='tests'));a.state.role='admin';assert.ok(a.navItems().some(x=>x[0]==='tests'))});
test('alerta cadastral continua no resumo comercial',()=>assert.ok(a.businessDossier({...lead,dossier:'[ALERTA CADASTRAL — fonte secundária]\\nConfirmar situação antes de abordar.\\n[FILA100]\\nConstatação: Identidade pendente.'}).includes('Confirmar situação')));
test('nome de empreendimento High to Work não oculta nota comercial',()=>assert.ok(a.commercialActivity({description:'Cliente pediu proposta para High to Work'})));
(async()=>{
a.state.demo=true;const original='[FILA100]\nConstatação: Portfólio publicado.\n[HISTÓRICO ANTERIOR]\nRevisão Work';
const archived={...lead,source_url:'https://example.com/contato',source_checked_at:'2026-10-22',dossier:original};a.state.leads=[archived];a.state.editing=archived.id;
await a.saveLead({...archived,dossier:a.businessDossier(archived)});
test('editar outro campo preserva auditoria original do dossiê',()=>assert.equal(archived.dossier,original));
a.state.editing=archived.id;await a.saveLead({...archived,dossier:'Responsável pediu retorno na terça-feira.'});
test('nova nota comercial fica visível e histórico original preservado',()=>{assert.equal(a.businessDossier(archived),'Responsável pediu retorno na terça-feira.');assert.ok(archived.dossier.endsWith(original))});
console.log('TOTAL '+count+' PASS');
})().catch(e=>{console.error(e);process.exitCode=1});

// Acompanhamento e prioridade manual
{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{MAS_CONFIG:{}},document:{getElementById:()=>({innerHTML:'',addEventListener(){}})},URL,crypto:require('node:crypto').webcrypto,FormData:class{constructor(o){this.o=o}get(k){return this.o[k]}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../app.js','utf8').replace('init();\n})();','window.api={state,blank,score,saveFollowup,followupData,leadPriority,visibleLeads,followupPage,activityHTML,commercialActivity};\n})();'),ctx);
const a=ctx.window.api;let n=0;function check(name,f){f();n++;console.log('PASS '+name)}
(async()=>{a.state.demo=true;a.state.role='editor';a.state.user={id:'staff',user_metadata:{username:'arch01'}};a.state.leads=[{...a.blank(),id:'a',company:'Empresa A',verification_status:'verificada',icp_sector:10},{...a.blank(),id:'b',company:'Empresa B',verification_status:'verificada'}];a.state.selected='b';
await a.saveFollowup({action:'apresentacao',priority:'urgente',comment:'Apresentação realizada. Retornar amanhã.'});
check('ação e comentário preservados',()=>assert.equal(a.followupData(a.state.activities[0]).action,'apresentacao'));
check('prioridade persiste no histórico carregável',()=>assert.equal(a.leadPriority(a.state.leads[1]),'urgente'));
check('prioridade ordena antes de score maior',()=>assert.equal(a.visibleLeads()[0].id,'b'));
check('prioridade não muda score ou funil',()=>{assert.equal(a.score(a.state.leads[1]),0);assert.equal(a.state.leads[1].commercial_status,'nao_contatada')});
check('aba mostra formulário e histórico',()=>{const html=a.followupPage();assert.ok(html.includes('Salvar atualização'));assert.ok(html.includes('Apresentação realizada.'))});
check('comentários não somem por mencionar ferramenta',()=>assert.ok(a.commercialActivity({description:'[MAS_ACOMPANHAMENTO_V1]'+JSON.stringify({action:'comentario',priority:'alta',comment:'Comentário sobre Sherlock'})})));
check('HTML de comentário escapado',()=>assert.ok(a.activityHTML({description:'[MAS_ACOMPANHAMENTO_V1]'+JSON.stringify({action:'comentario',priority:'normal',comment:'<img src=x onerror=alert(1)>'}),created_at:new Date().toISOString(),author_id:'staff'}).includes('&lt;img')));
check('JSON inválido mantém nota antiga legível',()=>assert.equal(a.followupData({description:'[MAS_ACOMPANHAMENTO_V1]{bad'}),null));
await assert.rejects(a.saveFollowup({action:'comentario',priority:'alta',comment:' '}));n++;console.log('PASS comentário vazio rejeitado');
a.state.demo=false;a.state.role='viewer';await assert.rejects(a.saveFollowup({action:'comentario',priority:'alta',comment:'teste'}));n++;console.log('PASS leitor não grava');
a.state.role='editor';a.state.workspace='workspace';a.state.db={from(){return {insert(){return {select:async()=>({error:new Error('Banco indisponível')})}}}}};await assert.rejects(a.saveFollowup({action:'contato',priority:'alta',comment:'teste'}));n++;console.log('PASS falha do banco não confirma gravação');
console.log('TOTAL '+n+' PASS');})().catch(e=>{console.error(e);process.exitCode=1});

}

// Instagram: perfil seguro, persistência no cadastro e ausência de suposições.
{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{MAS_CONFIG:{}},document:{getElementById:()=>({innerHTML:'',addEventListener(){}})},URL,FormData:class{constructor(o){this.o=o}get(k){return this.o[k]}}};
vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../app.js','utf8').replace('init();\n})();','window.api={instagramURL,instagramLink,blank,formLead,validate};\n})();'),c);
const a=c.window.api;let n=0;function t(name,f){f();n++;console.log('PASS '+name)}
t('Instagram normaliza arroba',()=>assert.equal(a.instagramURL('@Empresa.Exemplo'),'https://www.instagram.com/empresa.exemplo/'));
t('Instagram aceita link com parâmetro e remove rastreamento',()=>assert.equal(a.instagramURL('https://instagram.com/empresa/?igsh=123'),'https://www.instagram.com/empresa/'));
t('Instagram rejeita domínio falso e esquemas inseguros',()=>{for(const u of ['https://instagram.com.evil.test/empresa/','https://www.instagram.com@evil.test/empresa/','javascript:alert(1)','http://instagram.com/empresa/'])assert.equal(a.instagramURL(u),null)});
t('Instagram rejeita publicação e perfil inválido',()=>{for(const u of ['https://instagram.com/p/ABC','https://instagram.com/reels/','@nome..invalido','@empresa.'])assert.equal(a.instagramURL(u),null)});
t('Instagram não inventa perfil quando vazio',()=>assert.ok(a.instagramLink({company:'Empresa'}).includes('não informado')));
t('Instagram é link externo protegido',()=>assert.ok(a.instagramLink({instagram_url:'@empresa'}).includes('rel="noopener noreferrer"')));
t('cadastro normaliza e preserva Instagram',()=>assert.equal(a.formLead({...a.blank(),instagram_url:'@Empresa'}).instagram_url,'https://www.instagram.com/empresa/'));
t('validação rejeita Instagram inválido',()=>assert.ok(a.validate({...a.blank(),company:'Teste',instagram_url:'https://evil.test/empresa'})));
console.log('TOTAL '+n+' PASS');
}
