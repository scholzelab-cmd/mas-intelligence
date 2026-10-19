# MAS Intelligence CRM — v1.2.2

CRM B2B exclusivo da MAS — Produção Visual e Audiovisual.

- Aplicação: https://scholzelab-cmd.github.io/mas-intelligence/
- Repositório: https://github.com/scholzelab-cmd/mas-intelligence
- Publicação: GitHub Pages, branch `main`, pasta raiz, HTTPS.
- Banco: projeto Supabase `mas-intelligence`, plano Free, São Paulo.

## Estado desta versão

Banco e Auth configurados. Esquema SQL e RLS aplicados em 19/10/2026. Três leads reais pesquisados foram inseridos somente no banco protegido; não constam nos arquivos públicos nem na demonstração.

A conta inicial do CRM deve ser criada pelo proprietário no painel Authentication > Users > Add user > Create new user. O login administrativo no Supabase via GitHub não cria automaticamente uma conta na aplicação.

Após criar a conta, vincular seu UUID ao workspace MAS em `workspace_members`, com papel admin. A vinculação e os testes de login válido precisam ser confirmados antes de declarar operação integral. Não compartilhar senhas; criar contas individuais para a equipe. Viewer apenas lê, editor cadastra/edita, admin também exclui.

A demo permanece explicitamente fictícia, em memória e sem sincronização com o banco real. Recarregar apaga suas alterações.

## Validação

- `node tests/core.test.cjs`: 59 verificações locais aprovadas.
- `node tests/session.test.cjs`: 6 verificações de sessão/configuração/rascunho com cliente simulado aprovadas.
- `tests/rls.sql`: executado no PostgreSQL Supabase real com PASS. Usa usuários sem senha e dados temporários revertidos por rollback; não testa o serviço Auth.
- Acesso REST anônimo a leads retornou HTTP 401/42501.
- Login de conta inexistente retornou credenciais inválidas na API e na interface pública.

Consulte RELATORIO-TECNICO.md para distinguir testes realizados e pendências. Não considerar testes simulados como validação de login e sessão reais.

## Arquivos

`index.html`, `styles.css`, `app.js`, `config.js`, `.nojekyll`, `supabase/schema.sql`, `supabase/migrations/001_lead_fields.sql`, `tests/core.test.cjs`, `tests/session.test.cjs`, `tests/rls.sql`, `TESTES.md`, `RELATORIO-TECNICO.md`.

`schema.sql` é para banco NOVO; não executar sobre a instalação existente. A migração 001 adiciona porte e estágio em instalações antigas.

## Segurança e acesso

Somente URL e chave publicável estão em config.js. Nenhuma chave administrativa ou senha deve entrar no frontend/repositório. Signup público e login anônimo estão desabilitados. Site URL e redirect URL usam o endereço público completo. As permissões dependem de Auth e RLS no servidor.

A aplicação escuta SIGNED_OUT e limpa dados em memória. Respostas tardias de consultas não podem restaurar o cache após logout. Erros de validação preservam o rascunho do lead.

## Publicação e manutenção

Alterar os arquivos, executar as duas suítes Node, revisar segredos e atualizar o parâmetro de versão dos assets. Enviar commits para main, aguardar sucesso em Actions e testar o endereço publicado. Alterações SQL precisam ser aplicadas separadamente ao banco; publicar arquivos não executa migrações automaticamente.

## Limitações

Sem envio automático de mensagens, pesquisa automática, convite pela interface, sincronização em tempo real ou backup/restauração validado. Dados e fontes precisam de revisão humana. Score não representa probabilidade de compra. Validar CSV em Excel/LibreOffice e os testes autenticados pendentes antes do uso diário.
