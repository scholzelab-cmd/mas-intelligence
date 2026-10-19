-- Executar em banco de teste que já recebeu schema.sql. Tudo é revertido.
-- Usuários temporários SEM senha; não podem fazer login. Não testa o serviço Auth.
begin;
create temporary table qa_context as select
 gen_random_uuid() as admin_id, gen_random_uuid() as editor_id,
 gen_random_uuid() as viewer_id, gen_random_uuid() as outsider_id,
 gen_random_uuid() as wa, gen_random_uuid() as wb,
 gen_random_uuid() as lead_a, gen_random_uuid() as lead_b;
grant select on qa_context to authenticated,anon;
insert into auth.users(id,aud,role,email)
select admin_id,'authenticated','authenticated','qa-admin@example.invalid' from qa_context union all
select editor_id,'authenticated','authenticated','qa-editor@example.invalid' from qa_context union all
select viewer_id,'authenticated','authenticated','qa-viewer@example.invalid' from qa_context union all
select outsider_id,'authenticated','authenticated','qa-outsider@example.invalid' from qa_context;
insert into public.workspaces(id,name)
select wa,'QA MAS TEMPORÁRIO' from qa_context union all select wb,'QA OUTRA ORG TEMPORÁRIA' from qa_context;
insert into public.workspace_members(workspace_id,user_id,role)
select wa,admin_id,'admin' from qa_context union all select wa,editor_id,'editor' from qa_context union all
select wa,viewer_id,'viewer' from qa_context union all select wb,outsider_id,'admin' from qa_context;
insert into public.leads(id,workspace_id,company,city)
select lead_a,wa,'QA A TEMPORÁRIO','Joinville' from qa_context union all
select lead_b,wb,'QA B TEMPORÁRIO','Joinville' from qa_context;
create function pg_temp.assert_true(ok boolean,msg text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'QA FALHOU: %',msg; end if; end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select viewer_id::text from qa_context),true);
select pg_temp.assert_true((select count(*) from public.leads)=1,'viewer só vê sua organização');
DO $$ begin
 begin insert into public.leads(workspace_id,company,city) select wa,'NEGADO','Joinville' from qa_context;
 raise exception 'QA FALHOU: viewer inseriu'; exception when insufficient_privilege then null; end;
end $$;
with changed as(update public.leads set company='NEGADO' returning id)
select pg_temp.assert_true((select count(*) from changed)=0,'viewer não atualiza');
with removed as(delete from public.leads returning id)
select pg_temp.assert_true((select count(*) from removed)=0,'viewer não exclui');
select set_config('request.jwt.claim.sub',(select editor_id::text from qa_context),true);
insert into public.leads(workspace_id,company,city) select wa,'QA EDITOR','Joinville' from qa_context;
with changed as(update public.leads set company='QA EDITADO' where id=(select lead_a from qa_context) returning id)
select pg_temp.assert_true((select count(*) from changed)=1,'editor atualiza');
with removed as(delete from public.leads returning id)
select pg_temp.assert_true((select count(*) from removed)=0,'editor não exclui');
DO $$ begin
 begin update public.leads set workspace_id=(select wb from qa_context) where id=(select lead_a from qa_context);
 raise exception 'QA FALHOU: transferência de organização'; exception when raise_exception then
 if SQLERRM not like '%Cannot reassign%' then raise; end if; end;
end $$;
DO $$ begin
 begin insert into public.leads(workspace_id,company,city) select wb,'NEGADO CROSS','Joinville' from qa_context;
 raise exception 'QA FALHOU: editor inseriu em outra organização'; exception when insufficient_privilege then null; end;
end $$;
insert into public.evidences(workspace_id,lead_id,attribute_name,evidence_status,finding,source_url)
select wa,lead_a,'QA','confirmado','Evidência temporária','https://example.com/qa' from qa_context;
select pg_temp.assert_true((select count(*) from public.evidences where author_id=auth.uid())=1,'autor da evidência é autenticado');
DO $$ begin
 begin insert into public.evidences(workspace_id,lead_id,attribute_name,evidence_status,finding,source_url)
 select wa,lead_b,'QA','confirmado','Negado','https://example.com/qa' from qa_context;
 raise exception 'QA FALHOU: evidência cruzada'; exception when foreign_key_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub',(select outsider_id::text from qa_context),true);
select pg_temp.assert_true((select count(*) from public.leads)=1,'outra organização só vê seu lead');
select pg_temp.assert_true((select count(*) from public.evidences)=0,'outra organização não vê evidências MAS');
select set_config('request.jwt.claim.sub',(select admin_id::text from qa_context),true);
with removed as(delete from public.leads where id=(select lead_a from qa_context) returning id)
select pg_temp.assert_true((select count(*) from removed)=1,'admin exclui lead próprio');
select pg_temp.assert_true((select count(*) from public.evidences)=0,'exclusão em cascata');
reset role;
set local role anon;
DO $$ begin
 begin perform 1 from public.leads; raise exception 'QA FALHOU: anon lê leads';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: políticas por perfil, organizações, autoria, imutabilidade, cascata e anon; dados temporários revertidos' as resultado;
