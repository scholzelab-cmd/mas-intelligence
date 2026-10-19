-- Migração aditiva para instalações v1.2 já existentes.
alter table public.leads add column if not exists company_size text;
alter table public.leads add column if not exists project_stage text;
