// Testes das funções reais em ambiente mínimo. Não substitui navegador nem Supabase.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root={innerHTML:'',addEventListener(){}};
let exportedBlob;
class TestURL extends URL{static createObjectURL(b){exportedBlob=b;return 'blob:test'}static revokeObjectURL(){}}
const context={document:{getElementById:()=>root,body:{appendChild(){}},createElement:()=>({click(){},remove(){}})},window:{MAS_CONFIG:{}},URL:TestURL,Blob,crypto:require('node:crypto').webcrypto,FormData:class{constructor(o){this.o=o}get(k){return this.o[k]}},confirm:()=>true,setTimeout:()=>{}};
vm.createContext(context);
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
vm.runInContext(source.replace('init();\n})();','window.testAPI={blank,validate,score,caps,state,test,whatsappNumber,whatsappPanel,saveLead,saveStage,addEvidence,addActivity,deletion,dossierPage,editor,exportCSV,startDemo};init();\n})();'),context);
const a=context.window.testAPI;let count=0;
function check(name,fn){fn();count++;console.log('PASS '+name)}
(async()=>{
a.test();check('diagnóstico embutido 12/12',()=>assert.equal(a.state.checks.filter(x=>x.ok).length,12));
for(const n of ['(47) 99999-1234','+55 47 99999-1234','5547999991234'])check('WhatsApp normaliza '+n,()=>assert.equal(a.whatsappNumber(n),'5547999991234'));
for(const n of ['(47) 3453.099','47999991234 / 47999995678','javascript:alert(1)','5511999991234?text=oi',''])check('WhatsApp rejeita entrada ambígua/inválida '+n,()=>assert.equal(a.whatsappNumber(n),null));
a.state.demo=false;
check('WhatsApp respeita não contatar',()=>assert.ok(!a.whatsappPanel({...a.blank(),contact_phone:'47999991234',commercial_status:'nao_contatar'}).includes('https://wa.me/')));
check('WhatsApp não inventa envio nem altera funil',()=>{const x={...a.blank(),contact_phone:'47999991234'};const before=JSON.stringify(x);assert.ok(a.whatsappPanel(x).includes('https://wa.me/5547999991234'));assert.equal(JSON.stringify(x),before)});
a.state.demo=true;
check('WhatsApp não abre contato na demo',()=>assert.ok(!a.whatsappPanel({...a.blank(),contact_phone:'47999991234'}).includes('https://wa.me/')));
const valid={...a.blank(),company:'Empresa fictícia QA',verification_status:'verificada',source_url:'https://example.com/qa',source_checked_at:'2026-10-19'};
check('zero provisório',()=>assert.equal(a.score(valid),0));
check('máximo 100 válido',()=>{const x={...valid,...a.caps,opportunity_type:'demanda_explicita'};assert.equal(a.score(x),100);assert.equal(a.validate(x),null)});
check('descartada sem score',()=>assert.equal(a.score({...valid,verification_status:'descartada'}),null));
for(const [key,max]of Object.entries(a.caps))for(const value of [-1,max+1,0.5,NaN])check(key+' rejeita '+value,()=>assert.ok(a.validate({...valid,[key]:value})));
for(const key of ['source_url','source_checked_at'])check('qualificação bloqueada sem '+key,()=>assert.ok(a.validate({...valid,verification_status:'qualificada',[key]:null})));
a.state.editing='new';await a.saveLead(valid);const id=a.state.selected;
check('cadastro em memória',()=>assert.ok(a.state.leads.some(x=>x.id===id)));
a.state.editing=id;await a.saveLead({...valid,company:'Empresa fictícia editada'});
check('edição',()=>assert.equal(a.state.leads.find(x=>x.id===id).company,'Empresa fictícia editada'));
a.state.selected=null;a.dossierPage();await a.saveStage({stage:'proposta'});
check('funil via dossiê direto',()=>assert.equal(a.state.leads[0].commercial_status,'proposta'));
await a.addEvidence({attribute_name:'Porte',evidence_status:'confirmado',source_url:'https://example.com/qa',finding:'Evidência fictícia de teste'});
await a.addActivity({type:'nota',description:'Atividade fictícia QA'});
check('evidência e histórico vinculados',()=>{assert.equal(a.state.evidences[0].lead_id,id);assert.equal(a.state.activities[0].lead_id,id)});
check('dossiê exibe evidência',()=>assert.ok(a.dossierPage().includes('Evidência fictícia de teste')));
check('formulários e modal têm IDs únicos para rótulos acessíveis',()=>{a.state.editing=id;const html=a.dossierPage()+a.editor();const ids=Array.from(html.matchAll(/\sid="([^"]+)"/g),m=>m[1]);assert.equal(ids.length,new Set(ids).size);a.state.editing=null});
a.state.leads[0].company='=HYPERLINK("malicioso")';a.exportCSV();const csv=await exportedBlob.text();
check('CSV contém campos novos sem duplicação',()=>{const h=csv.split('\r\n')[0].split(',');assert.equal(h.filter(x=>x==='company_size').length,1);assert.ok(h.includes('project_stage'))});
check('CSV neutraliza fórmula e preserva acentos',()=>{assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('Joinville'))});
await a.deletion(id,'leads');check('exclusão em cascata demo',()=>{assert.ok(!a.state.leads.some(x=>x.id===id));assert.equal(a.state.evidences.length,0);assert.equal(a.state.activities.length,0)});
a.startDemo();check('reinício demo = três empresas fictícias',()=>{assert.equal(a.state.leads.length,3);assert.ok(a.state.leads.every(x=>x.company.includes('fictícia')))});
console.log('TOTAL '+count+' PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
