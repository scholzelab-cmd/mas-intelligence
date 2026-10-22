# MAS Intelligence CRM v1.4.3 —22/10/2026

Frontend: https://scholzelab-cmd.github.io/mas-intelligence/ · branch `main`.

- Interface comercial clara/escura, sem referências aos agentes nas telas de operação. Diagnóstico técnico apenas na navegação administrativa.
- Dashboard e lista Para contato excluem cadastros incompletos e em revisão; Pendências e Todos preservam o acesso aos registros.
- Dossiês exibem resumo de fatos e ressalvas, fontes e histórico comercial. Notas internas e auditoria legada são preservadas, com apresentação separada; edições preservam o histórico original.
- WhatsApp manual com mensagem preenchida e número brasileiro validado sintaticamente. Revisão e envio ficam a cargo do funcionário; não há bot, API ou garantia de conta WhatsApp.
- CSV respeita a lista e a busca. Verificações locais:120 casos nomeados e parser independente; exportação real conferida com100 empresas atuais e21 colunas.
- GitHub Actions executa as cinco suítes, valida JavaScript e CSV antes de publicar apenas os arquivos do frontend.
- Supabase Auth/PostgreSQL/RLS ativos. Sessão real de editor utilizada. Conferência SQL em leitura: editor viu124 registros de uma organização, identidade sem vínculo viu zero, leitura anônima foi negada. Outros13 cenários de RLS/gravação passaram com fixtures temporárias e rollback; o perfil editor e os124 registros foram confirmados após a reversão. Não equivale a teste completo de todas as permissões por API e dispositivo.
- Base comercial privada:124 registros;100 na fila de primeiro contato,24 fora dessa fila (inclui um registro QA fictício). Os100 possuem fonte Maps e canal público.89 registros anteriores foram reconferidos,11 casos sem correspondência segura ficaram pendentes e11 novos foram pesquisados inicialmente no Maps e depois na web. Não são100 oportunidades qualificadas ou telefones testados por ligação.
- Pendências de homologação: sessão revogada na interface, perfil viewer real e gravações negadas via API, restauração integral de backup, Excel e dispositivos físicos. Não declarar homologação integral concluída.
- Nenhuma senha padrão ou credencial administrativa deve ser publicada. Identidades internas de funcionários dependem do administrador para recuperação.

As seções abaixo são histórico e podem conter estados anteriores. Esta seção prevalece para a versão atual.

---

# Atualização v1.4.0 — acesso da equipe (20/10/2026)

- Login aceita e-mail administrativo ou usuário de funcionário, como arch01.
- Área Equipe exclusiva do administrador: consulta acessos e cria funcionários com perfil editor; não permite criar administradores ou reutilizar uma conta existente.
- Senha inicial definida diretamente pelo administrador no formulário, com12 a128 caracteres, maiúscula, minúscula e número. Não há senha padrão publicada.
- Identidades internas usam o domínio reservado mas-crm.invalid, sem envio de e-mail. Recuperação de acesso depende do administrador no Supabase; não há recuperação automática por e-mail para essas identidades.
- Função manage-employees ativa no Supabase, com verificação JWT e conferência de usuário/organização/perfil no servidor. Chave administrativa somente no ambiente da função, nunca no frontend.
- Guia de uso na aplicação para cadastro, fontes, funil, histórico, CSV e limites de qualificação.
- Supabase JS fixado na versão2.118.0, confirmada no CDN durante esta atualização.
- Testes:74 core +6 sessão +12 servidor de equipe +10 interface de equipe =102 verificações locais aprovadas. Os22 novos usam respostas simuladas; não substituem criação/login de funcionário reais.
- Endpoint real sem autenticação negado com HTTP401. Criação e login reais de arch01 ainda precisam ser concluídos e testados; não considerar a conta existente apenas pelo formulário estar disponível.
- Base privada:100 empresas,125 evidências,197 atividades;3 verificadas e97 identificadas sem score. Somente25 revisões conferidas diretamente pelo Work;72 notas do Sherlock A CONFERIR. Nenhuma abordagem realizada.
- WhatsApp fora do escopo desta etapa; abertura manual anterior preservada, sem API/bot.

As seções abaixo são histórico; esta seção substitui os estados anteriores nos pontos atualizados. Commit e deploy precisam ser conferidos na entrega. Não declarar homologação integral enquanto os testes reais pendentes não forem concluídos.

---

# MAS Intelligence CRM — v1.3.1

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

- `node tests/core.test.cjs`: 74 verificações locais aprovadas, incluindo 11 do WhatsApp.
- `node tests/session.test.cjs`: 6 verificações de sessão/configuração/rascunho com cliente simulado aprovadas.
- `tests/rls.sql`: executado no PostgreSQL Supabase real com PASS. Usa usuários sem senha e dados temporários revertidos por rollback; não testa o serviço Auth.
- Importação repetida sem duplicação: 100 leads, 100 evidências, 100 notas; nenhuma fonte ausente ou autoria fora da organização.
- Leitura sob papel authenticated: 100 registros; testes reais de RLS e auditoria de etapa com rollback aprovados.
- Acesso REST anônimo a leads retornou HTTP 401/42501.
- Interface autenticada: navegação, busca, funil, diagnóstico 12/12, edição persistida e logout seguidos de reload aprovados. Viewport 390x844 inspecionado sem overflow horizontal da página; console consultado sem avisos/erros.
- Login de conta inexistente retornou credenciais inválidas na API e na interface pública.

Consulte RELATORIO-TECNICO.md para distinguir testes realizados e pendências. Não considerar testes simulados como validação de login e sessão reais.

## Conferência de 20/10/2026

- Perfil editor mantém edição e deixa de receber botão de excluir lead; administrador conserva exclusão. Viewer sem controles de gravação. Três testes novos aprovados.
- `python3 tests/csv_roundtrip.py`: exportador real lido por parser independente, 100 registros fictícios com acentos/aspas/quebras de linha e conteúdo perigoso. Também executado com fotografia privada dos 100 registros reais: PASS. Não comprova download no navegador nem Excel.
- Dados privados: 100 empresas; 25 receberam nova revisão documental com fontes/notas em 20/10. Status e scores preservados. Revalidações do Sherlock exigem conferência antes de incorporar fatos; nenhuma promoção automática.
- Cadastro/exclusão completos e novas sessões reais pela interface aguardam login do proprietário; RLS já testado em SQL. Não declarar homologação integral.

## Arquivos

`index.html`, `styles.css`, `app.js`, `config.js`, `.nojekyll`, `supabase/schema.sql`, `supabase/migrations/001_lead_fields.sql`, `tests/core.test.cjs`, `tests/session.test.cjs`, `tests/rls.sql`, `tests/csv_roundtrip.py`, `TESTES.md`, `RELATORIO-TECNICO.md`, `WHATSAPP.md`.

`schema.sql` é para banco NOVO; não executar sobre a instalação existente. A migração 001 adiciona porte e estágio em instalações antigas. No banco existente foram aplicadas as migrações restrict_rls_event_trigger_execution e audit_commercial_stage_changes; não reaplicar schema.sql. A função de auditoria consta do esquema atualizado para instalações novas.

## Segurança e acesso

Somente URL e chave publicável estão em config.js. Nenhuma chave administrativa ou senha deve entrar no frontend/repositório. Signup público e login anônimo estão desabilitados. Site URL e redirect URL usam o endereço público completo. As permissões dependem de Auth e RLS no servidor.

A aplicação escuta SIGNED_OUT e limpa dados em memória. Respostas tardias de consultas não podem restaurar o cache após logout. Erros de validação preservam o rascunho do lead.

## Publicação e manutenção

Alterar os arquivos, executar as duas suítes Node, revisar segredos e atualizar o parâmetro de versão dos assets. Enviar commits para main, aguardar sucesso em Actions e testar o endereço publicado. Alterações SQL precisam ser aplicadas separadamente ao banco; publicar arquivos não executa migrações automaticamente.

## Limitações

Sem envio automático de mensagens, pesquisa automática, convite pela interface ou sincronização em tempo real. Backup aplicacional das cinco tabelas exportado e restaurado em tabelas temporárias com comparação integral aprovada; restauração completa de projeto/Auth/segredos em ambiente separado ainda não homologada. Dados e fontes precisam de revisão humana. Score não representa probabilidade de compra. Validar CSV em Excel/LibreOffice e os testes autenticados pendentes antes do uso diário.
