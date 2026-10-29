# MAS Intelligence CRM

CRM web da MAS para prospecção B2B de serviços de produção visual e audiovisual. A demonstração disponível usa somente registros fictícios.

- **Aplicação:** https://scholzelab-cmd.github.io/mas-intelligence/
- **Código-fonte:** https://github.com/scholzelab-cmd/mas-intelligence
- **Publicação:** GitHub Pages pela branch `main`.

## Recursos

- Painel comercial e lista de empresas com filtros por cidade e etapa.
- Cadastro e edição de leads, dossiês, fontes, evidências e histórico.
- Funil de vendas, prioridades e planejamento de próximas ações.
- Pontuação Sherlock apresentada somente no cadastro; não representa probabilidade de compra.
- Ações de contato por WhatsApp, Instagram Direct e e-mail, preparadas para revisão e envio pelo funcionário.
- Exportação CSV e tema claro/escuro.
- Layout responsivo para computador e celular.

A abertura de WhatsApp, Instagram ou e-mail depende dos dados públicos cadastrados e do aplicativo correspondente no dispositivo. O CRM não envia mensagens automaticamente.

## Demonstração

Na tela de acesso, escolha **Conhecer demonstração fictícia**. As empresas da demonstração são exemplos, os dados permanecem apenas na memória do navegador e as alterações desaparecem ao recarregar.

## Arquivos principais

- `index.html`: estrutura da aplicação.
- `styles.css`: estilos e adaptações responsivas.
- `app.js`: navegação, interface e regras do CRM.
- `config.js`: configuração pública do frontend.
- `supabase/schema.sql`: referência do esquema do banco.
- `tests/`: verificações automatizadas.

## Desenvolvimento e publicação

O frontend é estático e publicado pelo GitHub Pages. Para alterações, valide localmente com:

```sh
node --check app.js
node --test tests/core.test.cjs tests/session.test.cjs tests/employees.test.mjs tests/employee-ui.test.cjs tests/operations.test.cjs
python3 tests/csv_roundtrip.py
```

O fluxo de GitHub Actions verifica o código antes da publicação. Confira o resultado da execução após enviar alterações para `main`.

## Banco e autenticação

A demonstração não grava dados. O uso com dados reais requer configuração válida do Supabase Auth, PostgreSQL e políticas RLS para as organizações e usuários autorizados. A publicação do frontend não aplica alterações ao banco. Nunca coloque senhas, tokens, chaves administrativas ou a chave `service_role` no código público.

## Verificação desta versão

A versão publicada foi navegada em desktop nas áreas Início, Minha rotina, Empresas, Funil, Acompanhamento, Dossiês e Guia de uso. Os testes automatizados cobrem regras do CRM, navegação e exportação CSV usando dados fictícios. A demonstração pública não valida gravação no Supabase nem autenticação real. A revisão visual foi feita em desktop; a simulação em viewport móvel e a conferência em aparelho físico ainda precisam ser realizadas.
