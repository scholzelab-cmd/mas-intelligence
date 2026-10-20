# Reteste v1.3.1 — 20/10/2026

- Núcleo: 74 PASS; sessão simulada: 6 PASS. Total 80 verificações locais, sem equivalência a 80 testes ponta a ponta.
- Três novas verificações: editor edita sem botão de exclusão, viewer sem gravação, admin com exclusão.
- CSV: parser independente leu o exportador real com 100 casos fictícios e com 100 registros do backup privado. Aprovados 21 campos únicos, quantidade, UTF-8/BOM e preservação de conteúdo/score. Download no navegador novamente inconclusivo. Excel/LibreOffice não executados.
- Recuperação aplicacional: cinco tabelas exportadas para JSON privado e restauradas em tabelas temporárias PostgreSQL. Comparação integral de linhas, campos, scores e vínculos: PASS. Zero tabelas QA remanescentes; produção intacta. Não inclui restauração de contas Auth, senhas, configuração de projeto ou segredos.
- Banco mantém 100 leads. Novas revisões documentais: 25 fontes e 25 notas, sem pontuar identificadas nem simular contato.
- Revisão de segurança manteve aviso de proteção de senhas vazadas. Recurso exige Pro ou superior; plano Free preservado.
- Pendentes: CRUD autenticado completo pela UI, sessão revogada/expirada e perfis reais pela UI/Auth; login do proprietário necessário. Teste físico e API/bot WhatsApp também não executados.

As seções abaixo são histórico; estados e contagens desta seção prevalecem.

---

# Atualização de testes v1.3.0

- node tests/core.test.cjs: 71 PASS, incluindo 11 novos testes WhatsApp.
- node tests/session.test.cjs: 6 PASS.
- tests/rls.sql:PASS no Supabase real, com fixtures em transação/rollback. Inclui auditoria da etapa e ausência de histórico duplicado quando etapa não muda.
- Seed privado executado e repetido:100 leads/100 evidências/100 notas, zero duplicatas/fontes ausentes/erros de autoria. Novas identificadas sem score, três scores anteriores preservados.
- Leitura sob papel authenticated:100/100/100.
- Login válido e dashboard público autenticado com100 observados. Dossiê e link WhatsApp público conferidos; nenhum envio realizado.
- Logout real: Sessão encerrada; reload permaneceu no login, sem leads. Navegação, busca Exatus, funil com 100 não contatadas, diagnóstico 12/12 e edição persistida conferidos.
- Viewport 390x844: dossiê/WhatsApp em uma coluna, largura 375<=390, sem overflow horizontal da página. Console consultado: nenhum aviso/erro.
- Download CSV retentado: evento novamente inconclusivo; abertura em planilha não executada.
- Migrações de restrição de função administrativa e auditoria atômica de etapas aplicadas e verificadas.

Ver RELATORIO-TECNICO.md para os retestes visuais e limitações. API oficial, envio/recebimento, bot, CSV aberto em planilha, backup/restauração, sessão revogada e aparelhos físicos continuam sem aprovação. Não confundir as77 verificações locais com 77 testes ponta a ponta.

---

# TESTES DE ACEITACAO — MAS Intelligence CRM

Antes de utilizar dados reais, execute em um ambiente Supabase controlado:

[ ] index.html abre em HTTPS no GitHub Pages.
[ ] styles.css e app.js carregam sem erro no console.
[ ] Conta inexistente nao consegue autenticar.
[ ] Conta criada, mas sem workspace, nao acessa leads.
[ ] Usuario admin autenticado consegue criar lead.
[ ] Lead salvo permanece apos atualizar a pagina.
[ ] Editar dados modifica o registro no PostgreSQL.
[ ] Score de lead identificado aparece como nao pontuado.
[ ] Verificacao sem URL e data e bloqueada.
[ ] Score fora de cada limite e bloqueado.
[ ] Fit estrutural nao aceita pontos de sinal de compra.
[ ] Lead acionavel exige canal e proxima acao.
[ ] Evidencia salva fica vinculada ao lead correto.
[ ] Historico salvo possui autor autenticado.
[ ] Mudanca manual de funil persiste.
[ ] CSV abre com acentos corretamente.
[ ] Conta viewer nao pode inserir, alterar ou excluir.
[ ] Conta editor nao pode excluir leads.
[ ] Conta admin pode excluir lead da sua organizacao.
[ ] Usuario de OUTRA organizacao nao visualiza leads da MAS.
[ ] Requisicao anon sem login nao le tabelas via REST.
[ ] Campos workspace_id e id nao podem ser transferidos.
[ ] O sistema nao dispara contato externo.
[ ] Faca logout e confirme que a tela exige novo login.

OBSERVACOES
RLS deve ser testada efetivamente com requisicoes autenticadas
de contas de organizacoes diferentes. Interface sem botoes de edicao
nao substitui politicas do banco.
Teste restauracao e backup antes de migrar dados importantes.
