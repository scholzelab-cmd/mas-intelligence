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
