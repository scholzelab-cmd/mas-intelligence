// Rendering and request tests with a mocked SDK; no production credentials.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root={innerHTML:'',addEventListener(){}};
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const ctx={document:{getElementById:()=>root},window:{MAS_CONFIG:{}},URL,crypto:require('node:crypto').webcrypto,setTimeout(){},FormData:class{constructor(x){this.x=x}get(n){return this.x[n]}}};
vm.createContext(ctx);vm.runInContext(source.replace('init();\n})();','window.api={state,loginEmail,teamPage,guidePage,navItems,teamRequest,loadTeam,clearAccount,createEmployee};init();\n})();'),ctx);
const a=ctx.window.api;let n=0;function test(name,fn){fn();console.log('PASS '+name);n++}
(async()=>{
 test('login arch01 resolve somente identidade interna',()=>assert.equal(a.loginEmail(' ARCH01 '),'arch01@mas-crm.invalid'));
 test('login administrativo por e-mail preservado',()=>assert.equal(a.loginEmail(' Owner@Example.invalid '),'owner@example.invalid'));
 test('usuário inválido rejeitado',()=>assert.throws(()=>a.loginEmail('../admin')));
 a.state.demo=false;
 for(const role of ['editor','viewer']){a.state.role=role;test(role+' não vê equipe nem formulário',()=>{assert(!a.navItems().some(x=>x[0]==='team'));assert(!a.teamPage().includes('employee-form'))})}
 a.state.role='admin';test('admin vê formulário sem senha embutida',()=>{assert(a.navItems().some(x=>x[0]==='team'));assert(a.teamPage().includes('value="arch01"'));assert(a.teamPage().includes('name="employee_password"'));assert(!a.teamPage().includes('1234'))});
 test('guia explica limites e operação',()=>{const h=a.guidePage();assert(h.includes('A CONFERIR'));assert(h.includes('Sair'));assert(h.includes('Exportar CSV'))});
 a.state.workspace='workspace';a.state.user={id:'admin'};let calls=0;
 a.state.db={functions:{invoke:async()=>{calls++;return {data:{employees:[{username:'arch01',role:'editor'}]}}}}};
 await assert.rejects(()=>a.createEmployee({username:'arch01',employee_password:'1234'}));test('senha curta não chega ao servidor',()=>assert.equal(calls,0));
 await a.loadTeam();test('equipe carrega resultado autenticado',()=>assert.equal(a.state.employees[0].username,'arch01'));
 let release;a.state.db.functions.invoke=()=>new Promise(r=>release=r);const pending=a.loadTeam();a.clearAccount();release({data:{employees:[{username:'private'}]}});await assert.rejects(()=>pending);test('resposta tardia da equipe não restaura cache após logout',()=>assert.equal(a.state.employees.length,0));
 console.log('TOTAL '+n+' PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
