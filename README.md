# MAS Intelligence CRM
Projeto web responsivo da MAS - Producao Visual e Audiovisual.
Versão v1.2.1 — demonstração para GitHub Pages; Supabase ainda não configurado.

CRM: https://scholzelab-cmd.github.io/mas-intelligence/
Repositório: https://github.com/scholzelab-cmd/mas-intelligence

A demo não exige login. Alterações ficam na memória desta aba e são perdidas ao recarregar. Não use dados reais.

Validação local: `node tests/core.test.cjs` — 59 verificações aprovadas.
Consulte RELATORIO-TECNICO.md para o resultado dos testes públicos e pendências.

Alterações sobre o ZIP v1.2: correção da seleção no dossiê, layout móvel, campos de porte e estágio, indicadores separados no dashboard, histórico de mudanças do funil na demo e exportação dos novos campos.

ARQUIVOS
- index.html: entrada do aplicativo
- styles.css: layout responsivo
- app.js: operacoes do CRM
- config.js: URL e publishable key do Supabase
- supabase/schema.sql: tabelas, score, RLS e politicas
- TESTES.md: validacao manual antes do uso real
- .nojekyll: instrui o GitHub Pages a publicar os arquivos como estaticos

1. CRIE O BANCO DE DADOS
Acesse https://supabase.com/dashboard e crie um projeto.
Abra SQL Editor e execute o arquivo supabase/schema.sql em um
projeto NOVO. Esse script nao e migracao para banco ja existente.

2. CRIE A ORGANIZACAO
No SQL Editor, execute:
    insert into public.workspaces(name)
    values ('MAS Intelligence') returning id;
Guarde o UUID retornado.

3. CRIE O USUARIO ADMINISTRADOR
Em Authentication > Users, crie um usuario da sua equipe.
Copie o UUID do usuario. No SQL Editor, execute:
    insert into public.workspace_members(workspace_id,user_id,role)
    values('UUID_DO_WORKSPACE','UUID_DO_USUARIO','admin');
Substitua os dois UUIDs pelos valores corretos.
Para o chefe, crie outro usuario e vincule como 'viewer', 'editor' ou 'admin'.
Apenas 'admin' pode apagar leads.

4. CONFIGURE O APLICATIVO
Abra config.js e preencha:
    supabaseUrl: "https://seu-projeto.supabase.co"
    supabasePublishableKey: "sb_publishable_..."
Nunca use service_role ou uma secret key.
A URL e a chave publicavel nao sao segredos; a seguranca
depende da autenticacao e das politicas RLS do Supabase.

5. PUBLIQUE NO GITHUB
Crie um repositorio (por exemplo mas-intelligence).
Extraia o ZIP e envie os ARQUIVOS e PASTAS para a RAIZ do repositorio.
Em Settings > Pages > Build and deployment:
  Source: Deploy from a branch
  Branch: main
  Folder: /(root)
  Save.
O endereco esperado sera:
https://SEU-USUARIO.github.io/mas-intelligence/
A publicacao depende da execucao do GitHub Pages.
Nao se deve enviar o arquivo ZIP fechado como unico arquivo do repositorio.

6. CONFIGURACAO DE AUTH
Supabase > Authentication > URL Configuration:
  Site URL: URL PUBLICADA no GitHub Pages
  Redirect URLs: inclua a URL completa com a barra final.
Para o login por senha implementado, nao ha callback OAuth.
O usuario precisa existir e estar autorizado no workspace.

7. CHECKLIST DE ENTREGA
Leia TESTES.md e execute TODOS os testes reais, com duas contas.
Nao utilize dados comerciais reais antes de concluir os testes RLS.
O projeto contem DEMONSTRACAO com empresas inteiramente ficticias
e nao sincroniza a demo com a base real.

8. LIMITACOES DA V1
- Nao envia e-mails, WhatsApp ou mensagens automaticamente.
- Nao pesquisa empresas automaticamente (Sherlock assistido/manual).
- Nao existe backup remoto configurado, apenas exportacao CSV.
- Nao possui convite de usuarios na interface; configurar no Supabase.
- Nao comprova autenticidade da URL de evidencia por si so.
- Recarregar a pagina atualiza a lista; alteracoes de colegas nao sao
  sincronizadas em tempo real.
- A persistencia de sessao e controlada pelo cliente Supabase no navegador.
  Use contas individuais e nao compartilhe o dispositivo sem sair.

DOCUMENTACAO OFICIAL
https://docs.github.com/en/pages
https://supabase.com/docs/guides/auth
https://supabase.com/docs/guides/database/postgres/row-level-security
