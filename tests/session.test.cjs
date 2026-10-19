// Testes de estado/sessão com cliente simulado. NÃO validam Supabase/RLS reais.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const injected=source.replace('init();\n})();','window.testAPI={state,clearAccount,load,init,saveLead,editor,startDemo,blank};init();\n})();');
function setup(config={},sdk){
 const root={innerHTML:'',addEventListener(){}};
 const ctx={document:{getElementById:()=>root},window:{MAS_CONFIG:config,supabase:sdk},URL,crypto:require('node:crypto').webcrypto,FormData:class{constructor(o){this.o=o}get(k){return this.o[k]}},setTimeout:()=>{}};
 vm.createContext(ctx);vm.runInContext(injected,ctx);return {a:ctx.window.testAPI,root};
}
(async()=>{
 let n=0;function test(name,f){f();n++;console.log('PASS '+name)}
 let {a,root}=setup({allowDemo:false});test('demo desativada não abre sem configuração',()=>{assert.equal(a.state.demo,false);assert.equal(a.state.leads.length,0);assert.ok(root.innerHTML.includes('Ambiente real indisponível'))});
 ({a}=setup({supabaseUrl:'https://invalid.example',supabasePublishableKey:'invalid'}));test('configuração inválida não vira demo silenciosa',()=>assert.equal(a.state.demo,false));
 ({a}=setup());a.state.editing='new';await assert.rejects(()=>a.saveLead({...a.blank(),company:'Rascunho preservado',verification_status:'qualificada'}));test('validação preserva rascunho',()=>assert.ok(a.editor().includes('Rascunho preservado')));
 a.clearAccount();test('limpeza remove dados e modal',()=>{assert.equal(a.state.leads.length,0);assert.equal(a.state.editing,null);assert.equal(a.state.draft,null)});
 let callback;const sdk={createClient:()=>({auth:{onAuthStateChange(fn){callback=fn;return{}},getSession:async()=>({data:{session:null}})}})};
 ({a,root}=setup({supabaseUrl:'https://test.supabase.co',supabasePublishableKey:'sb_publishable_test'},sdk));await Promise.resolve();a.state.user={id:'test-user'};a.state.leads=[{company:'Privado'}];a.state.editing='new';a.state.draft={company:'Privado'};callback('SIGNED_OUT',null);
 test('SIGNED_OUT remove cache e exige login',()=>{assert.equal(a.state.user,null);assert.equal(a.state.leads.length,0);assert.equal(a.state.editing,null);assert.ok(root.innerHTML.includes('Acessar CRM'))});
 let release;a.state.user={id:'old-user'};a.state.db={from:()=>({select:()=>({eq:()=>({limit:()=>new Promise(r=>release=r)})})})};const pending=a.load();a.clearAccount();release({data:[{workspace_id:'private',role:'admin'}]});await pending;
 test('resposta atrasada não restaura dados após sair',()=>{assert.equal(a.state.workspace,null);assert.equal(a.state.leads.length,0)});
 console.log('TOTAL '+n+' PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
