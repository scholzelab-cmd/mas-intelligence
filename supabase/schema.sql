-- MAS Intelligence CRM — esquema inicial para projeto Supabase NOVO
-- Executar no SQL Editor, como administrador.
create extension if not exists pgcrypto;

create table public.workspaces(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.workspace_members(
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('admin','editor','viewer')),
  primary key(workspace_id,user_id)
);

create index workspace_members_user_idx on public.workspace_members(user_id);

create table public.leads(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company text not null check (length(btrim(company))>0),
  city text not null check (length(btrim(city))>0),
  uf text not null default 'SC',
  segment text,
  project text,
  company_size text,
  project_stage text,
  verification_status text not null default 'identificada'
    check(verification_status in ('identificada','verificada','qualificada','acionavel','descartada')),
  opportunity_type text not null default 'hipotese_exploratoria'
    check(opportunity_type in ('hipotese_exploratoria','fit_estrutural','gatilho_indireto','demanda_explicita')),
  commercial_status text not null default 'nao_contatada'
    check(commercial_status in ('nao_contatada','contato_planejado','contatada','respondeu','reuniao','proposta','negociacao','convertida','perdida','nao_contatar')),
  confidence text not null default 'baixa' check(confidence in ('baixa','media','alta')),
  source_url text,
  source_checked_at date,
  signal text,
  signal_date date,
  website text,
  buyer_department text,
  contact_channel text,
  contact_email text,
  contact_phone text,
  next_action text,
  dossier text,
  icp_sector smallint not null default 0 check(icp_sector between 0 and 10),
  icp_use smallint not null default 0 check(icp_use between 0 and 10),
  icp_size smallint not null default 0 check(icp_size between 0 and 5),
  icp_model smallint not null default 0 check(icp_model between 0 and 5),
  signal_points smallint not null default 0 check(signal_points between 0 and 25),
  potential_scale smallint not null default 0 check(potential_scale between 0 and 5),
  potential_repeat smallint not null default 0 check(potential_repeat between 0 and 5),
  potential_expansion smallint not null default 0 check(potential_expansion between 0 and 5),
  access_points smallint not null default 0 check(access_points between 0 and 15),
  geo_points smallint not null default 0 check(geo_points between 0 and 10),
  evidence_points smallint not null default 0 check(evidence_points between 0 and 5),
  score_total integer generated always as (
    case when verification_status in ('verificada','qualificada','acionavel')
      then icp_sector+icp_use+icp_size+icp_model+signal_points+
        potential_scale+potential_repeat+potential_expansion+
        access_points+geo_points+evidence_points
      else null end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,workspace_id),
  constraint verified_requires_evidence check(
    verification_status not in ('verificada','qualificada','acionavel')
    or (coalesce(source_url,'') like 'https://%' and source_checked_at is not null)
  ),
  constraint actionable_requires_channel check(
    verification_status <> 'acionavel'
    or (length(btrim(coalesce(contact_channel,'')))>0 and length(btrim(coalesce(next_action,'')))>0)
  ),
  constraint correct_signal_points check(
    (opportunity_type in ('hipotese_exploratoria','fit_estrutural') and signal_points=0)
    or (opportunity_type='gatilho_indireto' and (signal_points=0 or signal_points between 9 and 17))
    or (opportunity_type='demanda_explicita' and (signal_points=0 or signal_points between 18 and 25))
  )
);

create unique index leads_unique_workspace_company_city
on public.leads(workspace_id,lower(btrim(company)),lower(btrim(city)));
create index leads_workspace_updated_idx on public.leads(workspace_id,updated_at desc);

create table public.evidences(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null,
  attribute_name text not null check(length(btrim(attribute_name))>0),
  evidence_status text not null check(evidence_status in ('confirmado','indicio','hipotese','nao_verificado')),
  finding text not null check(length(btrim(finding))>0),
  source_url text not null check(source_url like 'https://%'),
  event_date date,
  checked_at date not null default current_date,
  author_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(lead_id,workspace_id) references public.leads(id,workspace_id) on delete cascade
);

create table public.activities(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null,
  type text not null default 'nota'
    check(type in ('nota','evidencia','contato','reuniao','proposta')),
  description text not null check(length(btrim(description))>0),
  author_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key(lead_id,workspace_id) references public.leads(id,workspace_id) on delete cascade
);

create index evidences_lead_idx on public.evidences(workspace_id,lead_id);
create index activities_lead_idx on public.activities(workspace_id,lead_id);

create function public.protect_lead_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.workspace_id is distinct from old.workspace_id then
    raise exception 'Cannot reassign id or workspace_id';
  end if;
  new.updated_at=now();
  return new;
end;
$$;

create trigger leads_before_update
before update on public.leads
for each row execute function public.protect_lead_update();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.leads enable row level security;
alter table public.evidences enable row level security;
alter table public.activities enable row level security;

revoke all on public.workspaces,public.workspace_members,
  public.leads,public.evidences,public.activities from anon,authenticated;
grant usage on schema public to authenticated;
grant select on public.workspaces,public.workspace_members to authenticated;
grant select,insert,update,delete on public.leads to authenticated;
grant select,insert,delete on public.evidences,public.activities to authenticated;

create policy workspace_self on public.workspaces for select to authenticated
using(exists(select 1 from public.workspace_members m
  where m.workspace_id=id and m.user_id=(select auth.uid())));
create policy member_self on public.workspace_members for select to authenticated
using(user_id=(select auth.uid()));

create policy leads_select on public.leads for select to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid())));
create policy leads_insert on public.leads for insert to authenticated
with check(exists(select 1 from public.workspace_members m where
m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')));
create policy leads_update on public.leads for update to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')))
with check(exists(select 1 from public.workspace_members m where
m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')));
create policy leads_delete on public.leads for delete to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid()) and m.role='admin'));

create policy evidences_select on public.evidences for select to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=evidences.workspace_id and m.user_id=(select auth.uid())));
create policy evidences_insert on public.evidences for insert to authenticated
with check(author_id=(select auth.uid()) and exists(select 1 from public.workspace_members m where
m.workspace_id=evidences.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')));
create policy evidences_delete on public.evidences for delete to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=evidences.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')));

create policy activities_select on public.activities for select to authenticated
using(exists(select 1 from public.workspace_members m where
m.workspace_id=activities.workspace_id and m.user_id=(select auth.uid())));
create policy activities_insert on public.activities for insert to authenticated
with check(author_id=(select auth.uid()) and exists(select 1 from public.workspace_members m where
m.workspace_id=activities.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','editor')));

-- CRIAR A ORGANIZAÇÃO DEPOIS DA INSTALAÇÃO:
-- insert into public.workspaces(name) values ('MAS Intelligence') returning id;
--
-- CRIAR UM USUÁRIO EM AUTHENTICATION > USERS E COPIAR SEU UUID.
-- Depois substituir os valores:
-- insert into public.workspace_members(workspace_id,user_id,role)
-- values('UUID_DO_WORKSPACE','UUID_DO_USUARIO','admin');
--
-- Nunca colocar usuário administrador, senha ou secret key em config.js.

-- v1.3.0: histórico atômico das mudanças de etapa. SECURITY INVOKER mantém RLS.
create function public.record_lead_stage_change() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.commercial_status is distinct from old.commercial_status then
    if auth.uid() is null then
      raise exception 'Mudança de etapa exige autoria autenticada';
    end if;
    insert into public.activities(workspace_id,lead_id,type,description,author_id)
    values(new.workspace_id,new.id,'nota',
      'Etapa alterada: '||old.commercial_status||' → '||new.commercial_status||
      '. Alteração de cadastro; não comprova envio de mensagem.',auth.uid());
  end if;
  return new;
end;
$$;
revoke execute on function public.record_lead_stage_change() from public,anon,authenticated;
create trigger leads_record_stage_change after update of commercial_status
on public.leads for each row execute function public.record_lead_stage_change();
