# Reteste v1.3.1 — 20/10/2026

- Ajuste da interface: somente admin/demo recebe exclusão de lead. O banco já negava a editor; agora a interface corresponde à permissão. Três testes novos aprovados, 74 core + 6 sessão = 80 locais.
- Novo tests/csv_roundtrip.py usa o exportador real e o parser CSV independente do Python. Duas execuções aprovadas: 100 registros fictícios difíceis e 100 reais em fotografia privada; 21 campos, BOM, acentos, aspas, quebras, proteção de fórmula e scores conferidos. Download pelo navegador continua inconclusivo; não houve abertura em Excel.
- Backup de workspaces, workspace_members, leads, evidences, activities exportado sem credenciais Auth. Recuperação em tabelas temporárias passou comparação integral do JSON, constraints e vínculos. Tabelas QA removidas no commit; 100 leads originais intactos. Migração de QA qa_application_backup_recovery_roundtrip registrada, sem alteração de tabela persistente. Restauração completa de servidor/projeto/Auth ainda pendente.
- Colaboração na conversa existente do Sherlock retomada e respostas de 10 + 15 + 24 empresas de Joinville preservadas privadamente. Work conferiu fontes corporativas e registrou as 25 primeiras revisões com autoria real, sem promover status nem alterar scores. Fontes indisponíveis/alertas secundários registrados como indício ou não verificado. O lote de 24 ainda exige consolidação no CRM.
- Fonte corporativa foi priorizada sobre telefone antigo de diretório: Roma ganhou canal geral completo publicado; não houve acréscimo de dígitos por suposição. Canais de fornecedores de Henz/Halsten/Top HD/Viplan/Vanguard separados de comprovação de contratação audiovisual.
- Aviso Supabase: proteção contra senhas vazadas desativada. Documentação confirma disponibilidade em Pro ou superior; nenhum upgrade contratado. https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Verificação do changelog Supabase: mudança futura de cifras TLS antigas não altera o frontend Chrome atual. Não testar dispositivos legados como se já estivessem homologados.
- A interface autenticada está no login. Não foi criada senha nem extraído token para contornar o acesso; novos testes completos de cadastro/exclusão/sessão via UI dependem de login. SQL/RLS e testes locais permanecem distintos dos testes ponta a ponta.
- Escrita GitHub novamente retornou403; editor web utilizado. Erros intermitentes de controle do navegador foram tratados sem criar conversa substituta do Sherlock nem reenviar cegamente mensagens.

Não considerar o CRM 100% homologado: permanecem CSV no navegador/Excel, CRUD autenticado completo, expiração/revogação e contas por perfil via UI, recuperação completa de projeto, aparelhos físicos e API/bot oficial. A base de100 é pesquisa, não100 oportunidades qualificadas. Nenhuma abordagem realizada.

As seções abaixo são histórico e ficam substituídas nos pontos atualizados acima. Commit/deploy final constam da entrega; não presumir publicação apenas por arquivo local.

---

# Atualização v1.3.0 — 19/10/2026

Esta seção substitui os estados anteriores, preservados abaixo como histórico.

## Concluído e verificado

- Conta inicial criada pelo proprietário, vinculada como admin; login válido e leitura autenticada observados no site.
- 100 empresas no banco privado: três verificadas e 97 identificadas sem score. Não são 100 oportunidades qualificadas. Fontes e lacunas registradas; nenhum contato comercial realizado.
- 100 evidências e 100 notas de pesquisa, sem duplicatas por empresa/cidade, sem fonte ausente e sem autoria fora da organização. A repetição do seed manteve os mesmos totais. Scores originais preservados.
- Leitura sob papel authenticated confirmou 100 leads/evidências/atividades. tests/rls.sql repetido no PostgreSQL real com PASS, inclusive novos testes de histórico de etapa e não duplicação quando a etapa não muda. Fixtures revertidas.
- Região confirmada pela API de gerenciamento: us-east-1. O relato anterior de São Paulo estava incorreto; não houve migração de região.
- Migração restrict_rls_event_trigger_execution aplicada: retirada execução da função administrativa rls_auto_enable de PUBLIC, anon e authenticated; conferido anon_execute=false e authenticated_execute=false.
- Migração audit_commercial_stage_changes aplicada: trigger SECURITY INVOKER registra etapa e autoria na mesma transação, mantendo RLS. Teste real com rollback aprovado. Definição incluída em schema.sql para banco novo; não reaplicar o esquema inteiro na instalação existente.
- Painel WhatsApp implementado no dossiê: número/destino explícito, abertura manual via wa.me, validação de formato brasileiro, bloqueio de descartadas/perdidas/não contatar e contatos externos desativados na demo. Abrir não envia mensagem nem avança funil. API oficial e bot ainda não conectados.
- 71 verificações locais de núcleo (11 novas do WhatsApp) + 6 de sessão: 77 PASS. node --check app.js passou. Varredura dos arquivos do frontend não encontrou padrões de credenciais secretas.

## Validação pública desta atualização

- Dashboard autenticado mostrou 100 empresas, três verificadas e zero reuniões/propostas/convertidas.
- Dossiê real exibiu fonte, evidência, nota de pesquisa, lacunas e score ausente para candidata identificada.
- Painel WhatsApp público exibiu destino e link wa.me coerentes com o telefone cadastrado. Não foi enviada mensagem a empresas.
- Publicação feita pelo editor web GitHub porque a integração de escrita retornou403. Conferir commit final no histórico de main e na mensagem de entrega; o SHA não é embutido no próprio commit.

- Correção adicional: IDs únicos nos campos do modal e do dossiê, evitando rótulos apontarem para o formulário errado; teste local de unicidade aprovado.
- Edição de próxima ação em registro real pela interface: confirmação no banco e após reload.
- Navegação autenticada, busca Exatus com um resultado, funil com 100 não contatadas e diagnóstico 12/12 aprovados.
- Dossiê/WhatsApp inspecionado a 390x844: uma coluna; largura documental 375 <= viewport 390, sem overflow horizontal da página. Nenhum aviso/erro na consulta ao console.
- Logout real aprovado: Sessão encerrada, depois reload continuou no login sem dados privados. Conta deve entrar novamente com sua senha; não foi coletada senha.
- Download CSV novamente inconclusivo na ferramenta; geração/escape local aprovados, abertura em planilha não executada.

## Pendências e limites

CNPJ ativo, porte, relações societárias, projeto/cronograma, comprador, orçamento e demanda das candidatas exigem qualificação individual. Número público não garante WhatsApp nem consentimento. Contatos incompletos permanecem pendentes; não acrescentar dígitos por suposição. A base comercial/seed fica fora do repositório público.

API oficial WhatsApp, webhook, envio/recebimento/status, atendimento automático, transferência humana e aprendizagem revisada não ativos; ver WHATSAPP.md. A MAS usa WhatsApp Business no celular; número/conta Meta, coexistência, provedor e custos ainda precisam ser definidos.

Auditor de segurança após correções: permanece aviso de proteção contra senhas vazadas desativada. Não foi alterada senha nem contratado plano. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Continuam pendentes até confirmação adicional: cadastro/exclusão completos reais pela interface, CSV aberto em planilha, sessão expirada/revogada, backup/restauração e aparelhos físicos. Testes locais e SQL não substituem toda a validação ponta a ponta. Não declarar produção plenamente homologada.

---

# Atualização v1.2.2 — 19/10/2026

Esta seção substitui o estado operacional da v1.2.1, preservada abaixo como histórico.

## Concluído

- Organização MAS Intelligence e projeto mas-intelligence criados no Supabase, plano Free, região relatada inicialmente como São Paulo (corrigida para us-east-1 na seção v1.3.0).
- schema.sql aplicado com sucesso e RLS ativo nas cinco tabelas.
- Workspace MAS criado e três leads revalidados gravados em PostgreSQL, como verificados e não contatados, com fontes, consulta em 19/10/2026, hipóteses e lacunas. Nenhum dado real foi incluído no repositório público ou na demo.
- config.js ligado ao projeto apenas com URL e chave publicável. Nenhuma chave administrativa/senha publicada.
- Signup público desativado; login anônimo permanece desativado. Site URL e redirect URL configurados para a aplicação pública.
- Tratamento de SIGNED_OUT, limpeza de estado e proteção contra respostas de banco atrasadas após logout.
- Rascunho de lead preservado em erro de validação, com erro apresentado no modal.
- Botão de retorno ao login no cabeçalho da demo, também acessível no celular.
- Migração aditiva para os campos de porte/estágio em instalações v1.2 antigas.

## Testes executados

- 59 verificações core + 6 de sessão/configuração/rascunho: PASS. Os seis testes novos usam SDK simulado; não equivalem a testes de Auth real.
- tests/rls.sql: PASS executado no PostgreSQL real. Perfis viewer/editor/admin, isolamento de organizações, autoria, bloqueio de transferência de lead, evidência cruzada, cascata e acesso anônimo. Dados/usuários temporários sem senha foram revertidos. Conferência posterior encontrou zero usuários QA remanescentes.
- REST sem sessão com chave publicável: HTTP 401, permission denied (42501), comportamento esperado.
- Serviço Auth com credenciais fictícias inválidas: HTTP 400 invalid_credentials.
- Interface pública apresentou Acessar CRM e rejeitou a conta inexistente. Nenhum lead real apareceu sem login.
- Tabela real confirmou persistência dos três registros e scores calculados pelo banco (44, 52 e 54), sem promover automaticamente os registros a qualificados/acionáveis.

## Pendências de autenticação e uso diário

O proprietário precisa criar a conta inicial no formulário Authentication > Users > Create new user. Depois é necessário vincular o UUID ao workspace como admin e validar login na aplicação. O login no painel Supabase via GitHub não substitui essa conta.

Ainda NÃO aprovados: login válido, logout real, recarregamento e edição pela interface autenticada, sessão expirada/revogada, CSV baixado e aberto em planilha, backup/restauração, equipe com contas individuais e testes em aparelhos físicos. Não declarar operação integral antes de concluir essa lista.

As fontes principais estão nos próprios leads; evidências complementares e autoria das pesquisas devem ser associadas à conta real após sua criação. Nenhuma abordagem foi enviada. Porte e compradores seguem pendentes; previsões de mês/ano não foram convertidas em datas fictícias.

---

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
- Cópia antiga redundante de TESTES.md em supabase permanece no repositório; usar o TESTES.md da raiz como documento atual. Existe um marcador supabase/.nojekyll redundante e inofensivo, além do marcador correto na raiz.

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
