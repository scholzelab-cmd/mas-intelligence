# MAS Intelligence CRM — v1.3.0

CRM B2B exclusivo da MAS — Produção Visual e Audiovisual.

- Aplicação: https://scholzelab-cmd.github.io/mas-intelligence/
- Repositório: https://github.com/scholzelab-cmd/mas-intelligence
- Publicação: GitHub Pages, branch `main`, pasta raiz, HTTPS.
- Banco: projeto Supabase `mas-intelligence`, plano Free, us-east-1 (região confirmada pela API; corrige o relato anterior de São Paulo).

## Estado desta versão

Banco e Auth configurados. Esquema SQL e RLS aplicados em 19/10/2026. 100 empresas pesquisadas foram inseridas somente no banco protegido: três verificadas e 97 identificadas, com fontes e lacunas; não são 100 oportunidades qualificadas. Nenhuma foi contatada e nenhum dado comercial real está na demonstração ou no repositório público.

Conta inicial criada pelo proprietário e vinculada como admin da MAS. Login válido e leitura da base privada observados. O login administrativo no Supabase via GitHub não substitui a conta da aplicação.

Para adicionar equipe, criar contas individuais e vincular seus UUIDs ao workspace em `workspace_members`. Não compartilhar a senha do administrador. Viewer apenas lê, editor cadastra/edita, admin também exclui.

Painel WhatsApp no dossiê abre número validado para envio manual pelo operador. Não envia, não comprova entrega e não muda o funil. API oficial e atendimento automático ainda não conectados; ver WHATSAPP.md. Mudanças de etapa no banco geram histórico atômico com autoria, sob RLS.

A demo permanece explicitamente fictícia, em memória e sem sincronização com o banco real. Recarregar apaga suas alterações.

## Validação

- `node tests/core.test.cjs`: 71 verificações locais aprovadas, incluindo 11 do WhatsApp.
- `node tests/session.test.cjs`: 6 verificações de sessão/configuração/rascunho com cliente simulado aprovadas.
- `tests/rls.sql`: executado no PostgreSQL Supabase real com PASS. Usa usuários sem senha e dados temporários revertidos por rollback; não testa o serviço Auth.
- Importação repetida sem duplicação: 100 leads, 100 evidências, 100 notas; nenhuma fonte ausente ou autoria fora da organização.
- Leitura sob papel authenticated: 100 registros; testes reais de RLS e auditoria de etapa com rollback aprovados.
- Acesso REST anônimo a leads retornou HTTP 401/42501.
- Interface autenticada: navegação, busca, funil, diagnóstico 12/12, edição persistida e logout seguidos de reload aprovados. Viewport 390x844 inspecionado sem overflow horizontal da página; console consultado sem avisos/erros.
- Login de conta inexistente retornou credenciais inválidas na API e na interface pública.

Consulte RELATORIO-TECNICO.md para distinguir testes realizados e pendências. Não considerar testes simulados como validação de login e sessão reais.

## Arquivos

`index.html`, `styles.css`, `app.js`, `config.js`, `.nojekyll`, `supabase/schema.sql`, `supabase/migrations/001_lead_fields.sql`, `tests/core.test.cjs`, `tests/session.test.cjs`, `tests/rls.sql`, `TESTES.md`, `RELATORIO-TECNICO.md`, `WHATSAPP.md`.

`schema.sql` é para banco NOVO; não executar sobre a instalação existente. A migração 001 adiciona porte e estágio em instalações antigas. No banco existente foram aplicadas as migrações restrict_rls_event_trigger_execution e audit_commercial_stage_changes; não reaplicar schema.sql. A função de auditoria consta do esquema atualizado para instalações novas.

## Segurança e acesso

Somente URL e chave publicável estão em config.js. Nenhuma chave administrativa ou senha deve entrar no frontend/repositório. Signup público e login anônimo estão desabilitados. Site URL e redirect URL usam o endereço público completo. As permissões dependem de Auth e RLS no servidor.

A aplicação escuta SIGNED_OUT e limpa dados em memória. Respostas tardias de consultas não podem restaurar o cache após logout. Erros de validação preservam o rascunho do lead.

## Publicação e manutenção

Alterar os arquivos, executar as duas suítes Node, revisar segredos e atualizar o parâmetro de versão dos assets. Enviar commits para main, aguardar sucesso em Actions e testar o endereço publicado. Alterações SQL precisam ser aplicadas separadamente ao banco; publicar arquivos não executa migrações automaticamente.

## Limitações

Sem envio automático de mensagens, pesquisa automática, convite pela interface, sincronização em tempo real ou backup/restauração validado. Dados e fontes precisam de revisão humana. Score não representa probabilidade de compra. Validar CSV em Excel/LibreOffice e os testes autenticados pendentes antes do uso diário.
