# MAS Intelligence CRM — v1.2.1

Entrega de 19/10/2026. Demonstração publicada; NÃO liberada para produção com dados reais.

- CRM: https://scholzelab-cmd.github.io/mas-intelligence/
- Repositório: https://github.com/scholzelab-cmd/mas-intelligence
- Conta: scholzelab-cmd. Branch: main. Publicação: GitHub Pages, raiz da branch, HTTPS.
- Origem: ZIP MAS-Intelligence-CRM-GitHub-v1.2.zip anexado pelo usuário e inspecionado.
- Commit exato da entrega: consultar o histórico de main; o relatório integra um commit posterior aos arquivos funcionais testados. O SHA final também consta da mensagem de entrega.

## Alterações sobre v1.2

1. Dossiê passa a selecionar efetivamente o lead exibido quando aberto pelo menu; corrigido o funil que antes podia ignorar a operação por selected=null.
2. Corrigida a grade do dossiê no celular, antes fixada por estilo inline em duas colunas.
3. Navegação móvel com rótulos, cabeçalho adaptável e quebra de textos longos.
4. Campos company_size (porte comprovado) e project_stage (estágio atual), no formulário, dossiê, CSV e esquema SQL.
5. Dashboard com contagem separada de reuniões, propostas, negociações e convertidas.
6. Demo registra no histórico as mudanças de etapa e não exige confirmação nativa de interação real para registros fictícios.
7. UF validada com duas letras maiúsculas.
8. Assets versionados em index.html para evitar código antigo no cache durante atualizações.
9. Testes reproduzíveis em tests/core.test.cjs e documentação atualizada.

## Testes executados e aprovados

### Código local

`node --check app.js`: aprovado.

`node tests/core.test.cjs`: 59 verificações aprovadas. Exercita funções reais com DOM mínimo simulado; não é teste visual nem banco real. Inclui diagnóstico embutido 12/12, score zero e máximo 100, score ausente em descartadas, limites negativos/superiores/fracionários/NaN de todos os componentes, bloqueio de qualificação sem URL/data, cadastro, edição, funil pelo dossiê direto, evidência e atividade vinculadas, renderização do dossiê, CSV com campos novos únicos e neutralização de fórmula, exclusão em cascata na demo e reinício fictício.

### Endereço público no Chrome

- Site abriu em HTTPS.
- HTTP 200 de index.html, app.js, styles.css e config.js; conteúdo comparado com arquivos locais (desconsiderando newline final). A primeira verificação foi anterior à inclusão dos parâmetros de versão em index.html; a versão posterior foi aberta novamente no navegador.
- Navegação em Dashboard, Leads, Funil, Dossiês e Diagnóstico.
- Diagnóstico público 12/12.
- Cadastro de empresa QA fictícia verificada, com fonte/data, porte e estágio; score exibido 10/100.
- Edição do nome e departamento comprador.
- Registro de evidência e atividade comercial.
- Qualificação sem URL/data rejeitada pela interface.
- Busca por nome retorna o registro esperado.
- Mudança para Reunião pelo dossiê direto; histórico registrou a etapa após correção e atualização dos assets.
- Recarregar volta aos três registros fictícios: comportamento intencional, sem persistência.
- Desktop inspecionado visualmente; viewport móvel 390x844, dashboard e dossiê inspecionados; dossiê em uma coluna, sem overflow horizontal da página. Funil com dez etapas e rolagem interna, sem alargar a página. Não foi teste em aparelho físico.
- Console da aba final e da aba móvel: nenhum erro/aviso retornado na consulta. Isso não comprova ausência de todos os problemas em qualquer navegador.
- Varredura local de padrões de tokens, chaves privadas, JWTs e secret keys: nenhum valor encontrado. config.js contém URL/chave vazias. Não há dados comerciais reais no código examinado.

## Falhas observadas e retestes

- 404 enquanto o primeiro deploy estava em andamento: resolvido; página pública abriu posteriormente.
- Integração GitHub recusou gravação de árvore com 403 apesar de informar permissões de escrita. Publicação realizada pelo editor web autenticado, sem ampliar permissões.
- Upload do navegador exigia acesso da extensão a file URLs. Não foi ativado; usado editor web.
- Confirmação nativa do funil bloqueou o controle de uma aba. A demo foi ajustada e a mudança de etapa foi retestada com sucesso em nova aba e assets atuais.
- Cópia duplicada de TESTES.md em supabase foi removida. Existe um marcador supabase/.nojekyll redundante e inofensivo, além do marcador correto na raiz.

## Testes inconclusivos e não executados

- CSV: geração, estrutura e escape aprovados localmente; o botão público foi acionado, mas o evento de download expirou na ferramenta. Não foi confirmada a abertura do arquivo em Excel/LibreOffice nem a conclusão do download pelo navegador. Repetir manualmente.
- Não houve auditoria completa de rede/HAR; houve checagem HTTP dos quatro assets e consulta do console.
- Nenhum teste real de login, logout, senha incorreta, sessões expiradas, persistência PostgreSQL, RLS, perfis viewer/editor/admin ou isolamento entre organizações. Não existe Supabase configurado nesta entrega.
- SQL revisado estaticamente; não executado em PostgreSQL/Supabase. Políticas presentes no arquivo não equivalem a políticas implantadas e testadas.
- Não testados outros navegadores, aparelho físico, acessibilidade completa, carga, backup ou restauração.

## Autenticação, banco e produção

Frontend HTML/CSS/JavaScript sem build. Supabase JS v2 carregado de CDN; URL e publishable key ausentes. Demo usa somente memória da aba. Nenhum dado é compartilhado entre usuários. Nenhuma comunicação é enviada automaticamente. A pontuação não representa probabilidade de compra; dados e evidências dependem de revisão humana.

Não havia ferramenta de conexão Supabase disponível. Nenhum projeto, tabela, usuário ou política foi criado externamente. schema.sql destina-se a projeto NOVO. Quem já aplicou o esquema v1.2 deve preparar migração para company_size e project_stage antes de atualizar o frontend conectado; não executar o esquema inteiro sobre banco existente.

Para produção:

1. Criar/configurar projeto Supabase autorizado e aplicar schema.sql em banco novo.
2. Criar organização e contas individuais, associando papéis no workspace_members.
3. Preencher config.js somente com URL e chave publicável; jamais service_role/secret key.
4. Configurar Site URL e Redirect URLs com o endereço público completo.
5. Testar RLS por requisições reais com contas de organizações diferentes, inclusive anon e viewer/editor/admin.
6. Revisar tratamento de expiração/revogação de sessão e limpeza dos dados em memória; testar logout, falhas de rede e sessões.
7. Validar backup/restauração, CSV em planilha e dependência/CDN do Supabase antes de cadastrar dados reais.
8. Melhorar o tratamento de erros do formulário: atualmente uma validação pode reconstruir o modal e perder o texto não salvo.

A GAS Arquitetura e Design não é oferecida no CRM. A operação continua exclusiva da MAS.

## Compartilhar com a direção

Enviar https://scholzelab-cmd.github.io/mas-intelligence/ e informar: “Demonstração com empresas fictícias; sem login e sem salvar alterações ao recarregar.” Funciona como site no computador e celular, sem instalar app.

## Manutenção e publicação

Alterar os arquivos na branch main, rodar `node tests/core.test.cjs`, revisar segredos e incrementar os parâmetros de versão dos assets quando o código mudar. GitHub Pages publica automaticamente após o commit. Aguardar o deploy em Actions e retestar o endereço público; não assumir publicação apenas porque o commit foi salvo. Preservar nomes e pastas. Não inserir leads reais no repositório público.
