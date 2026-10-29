# Projeto de app privado MAS CRM + Sherlock

**Atualizado em 29/10/2026 · Fase: arquitetura e scaffold iniciados**

## Objetivo

Criar uma aplicação iOS privada para o uso comercial da MAS, inicialmente para Cristian e o irmão, com caminho para aproximadamente 5–10 usuários. O CRM no computador continuará disponível pelo site existente. A aplicação móvel usará a mesma interface e os mesmos dados comerciais, protegidos pelo Supabase Auth e RLS.

## Decisões adotadas

- Empacotar a aplicação web atual com **Capacitor 8**, mantendo a publicação do CRM para desktop independente em GitHub Pages.
- Usar arquivos web locais dentro do pacote iOS, gerados a partir da raiz do repositório por `mobile/scripts/prepare-web.mjs`.
- Distribuir a versão de produção como **Custom App privado** associado à organização MAS no Apple Business. O app não será publicado como app público. O proprietário descartou TestFlight.
- Construir uma aba **Sherlock** dentro do app. Não usar apenas um link externo para o GPT.
- Recriar a operação do Sherlock por meio da API da OpenAI, pois um GPT personalizado do ChatGPT não pode ser incorporado diretamente a um app externo.
- Manter as regras anteriores: prospecção exclusiva da MAS; pesquisa primeiro no Google Maps, depois no site oficial e em outras fontes; separar fatos, indícios, hipóteses e lacunas; não inventar contatos; nenhuma abordagem ou mensagem é enviada automaticamente; leads só entram na base após revisão humana.

## Caminho da pesquisa do Sherlock

1. O funcionário informa segmento, região e quantidade pretendida.
2. Um serviço seguro consulta a **Places API** do Google Maps, mantendo o resultado e a fonte do Maps.
3. O Sherlock verifica cada empresa na web e prioriza o site oficial para confirmar identidade, atividade, empreendimento e contato corporativo.
4. A conversa apresenta os achados, links, datas e classificação de cada informação como fato confirmado, indício, hipótese ou não verificada.
5. O funcionário escolhe quais resultados deseja salvar; nenhum registro entra automaticamente na base comercial.
6. O backend grava pela sessão autenticada, na organização correta, respeitando RLS e registrando fontes/evidências.

O GPT original não fica automaticamente disponível na API. O arquivo técnico anterior `PROMPT-SHERLOCK-CRM-v1.5.1.md` traz regras úteis do CRM, mas não é uma exportação confirmada das instruções completas e dos arquivos de conhecimento do GPT. A migração do comportamento do Sherlock deve ser conferida com a configuração original e seus materiais de referência antes de declarar equivalência.

## Arquitetura planejada

- **iOS:** Capacitor com interface web local e identidade própria do MAS CRM.
- **Computador:** CRM atual hospedado no GitHub Pages.
- **Dados e login:** projeto Supabase existente, Auth e políticas RLS já utilizadas pelo CRM.
- **Chat e pesquisa:** função de servidor, preferencialmente Supabase Edge Function, conectada à OpenAI Responses API e à Places API do Google.
- **Acesso a ferramentas:** backend orquestra Maps primeiro e web depois; não expõe credenciais no iPhone.
- **Proteção:** chave da OpenAI e chave do Google somente como secrets do serviço de servidor; nunca em `app.js`, `config.js`, no bundle iOS ou no GitHub.
- **Persistência:** registros propostos pelo Sherlock precisam de confirmação do funcionário e passam pelas mesmas permissões RLS do CRM.

A Places API exige faturamento habilitado no projeto Google e cobra conforme SKU, volume e campos consultados; a seleção de campos reduz chamadas/custo. A busca web pode usar o recurso `web_search` da Responses API.

## Custos verificados

- **Apple Developer Program:** US$ 99 por ano; a Apple apresenta o valor convertido para moeda local durante a inscrição. A associação é necessária para assinar e distribuir o app.
- **Apple Business:** gratuito para começar. A empresa ainda precisa concluir a verificação e obter o Organization ID para receber o Custom App privado.
- **OpenAI API:** cobrada separadamente da assinatura ChatGPT. A tarifa publicada para Web Search é US$ 10 por 1.000 chamadas, além dos tokens do modelo; a escolha do modelo e o volume de conversas afetam o total.
- **Google Maps Places API:** uso por demanda e por SKU/campos. Há limites gratuitos mensais por SKU; chamadas acima deles podem gerar cobrança. O custo real será calculado após definirmos campos e testarmos uma pesquisa com limites.
- **Construção iOS:** Capacitor requer macOS e Xcode 26 ou posterior. O ambiente desta implementação é Linux; gerar e assinar o `.ipa` exigirá acesso a um Mac ou serviço de build compatível, o que pode ter custo próprio.
- **Supabase:** reaproveitar o projeto atual. Nenhuma mudança paga de plano foi solicitada ou feita.

Nenhuma assinatura, API paga, recurso de cobrança ou serviço externo foi ativado neste início. Antes de ativar qualquer uso pago, serão configurados limites de uso e estimativa por cenário de pesquisa.

Apple Business permite um e-mail público para a conta inicial de administrador e informa que o site é opcional nesse cadastro; a organização ainda precisa passar pela verificação. A associação Developer como organização tem requisitos próprios. Vamos verificar o enquadramento correto (individual ou organização) antes da inscrição, para evitar criar a conta no tipo errado.

## O que foi iniciado nesta fase

- Scaffold isolado do app em `mobile/`: dependências Capacitor 8, configuração de bundle iOS, sincronizador de arquivos e instruções de desenvolvimento.
- Workflow GitHub Pages atualizado para publicar também o manifesto PWA e o ícone, que antes ficavam fora do artefato de deploy.
- Este documento registra arquitetura, custos e pendências sem armazenar credenciais.

## Próximas fases

1. **Compilar e testar a base móvel:** em Mac/Xcode, instalar dependências, gerar o projeto iOS, validar login Supabase, links externos, layout em dois iPhones e atualização da interface.
2. **Preparar a distribuição privada:** confirmar Apple Business da MAS, Organization ID e Developer Program adequado; solicitar análise do Custom App privado.
3. **Migrar o Sherlock:** reunir configuração e arquivos de conhecimento originais, implementar chat e serviço server-side, proteger credenciais, implementar Maps → web, limites de custo, log e consentimento antes de salvar leads.
4. **Homologar:** validar login/logout, isolamento por organização, papéis, erros e limites das APIs, registros/evidências, privacidade, aparelho físico e atualização instalada.

## Referências oficiais

- [Apple: associação e preço do Apple Developer Program](https://developer.apple.com/br/help/account/membership/program-enrollment)
- [Apple: preço do Apple Business](https://business.apple.com/support)
- [Apple: distribuição privada de Custom Apps](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/set-distribution-methods)
- [Apple: requisitos de inscrição do Apple Business](https://support.apple.com/pt-br/guide/business/axm6d9dc7acf/web)
- [Capacitor: adicionar a um app web existente](https://capacitorjs.com/docs/getting-started)
- [Capacitor: ambiente iOS e Xcode](https://capacitorjs.com/docs/ios)
- [OpenAI: GPTs no ChatGPT não são incorporados em apps; use a API](https://help.openai.com/pt-br/articles/8554407-gpts-in-chatgpt)
- [OpenAI: preços da API](https://developers.openai.com/api/docs/pricing)
- [OpenAI: Web Search na Responses API](https://developers.openai.com/api/docs/guides/tools-web-search)
- [Google: Places API Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Google: preços da Places API](https://developers.google.com/maps/billing-and-pricing/pricing)
