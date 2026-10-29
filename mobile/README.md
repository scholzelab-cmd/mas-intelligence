# MAS CRM para iOS

Este diretório inicia o app nativo com Capacitor, reutilizando os arquivos web do CRM na raiz. Ele não muda o site do GitHub Pages nem contém credenciais administrativas.

## Estado

O scaffold Capacitor e a rotina de sincronização estão preparados. O projeto Xcode e o arquivo `.ipa` ainda não foram gerados ou assinados. A geração para iOS requer macOS e Xcode; a documentação atual do Capacitor indica Xcode 26 ou posterior.

## Preparar e abrir no Mac

Com Node.js, npm, Xcode e CocoaPods instalados:

```sh
cd mobile
npm install
npm run prepare:web
npm run ios:add
npm run ios:open
```

Depois, selecione um simulador ou iPhone conectado no Xcode e execute o app. Nas próximas alterações do CRM:

```sh
npm run ios:sync
```

A rotina `prepare:web` copia somente os arquivos necessários da raiz para `mobile/www`; essa pasta é gerada e não deve ser editada manualmente.

## Distribuição planejada

O destino escolhido é **Custom App privado** para a organização MAS no Apple Business, sem listagem pública na App Store. A publicação ainda passa pela revisão da Apple. A organização precisa estar aprovada no Apple Business, e o identificador da organização será cadastrado no App Store Connect. O beta TestFlight foi descartado por preferência do proprietário.

Antes da distribuição, será necessário concluir a inscrição Apple Developer, configurar o Apple Business e criar o projeto de assinatura no Xcode. Consulte [APP-PRIVATIVO-SHERLOCK.md](../APP-PRIVATIVO-SHERLOCK.md) para arquitetura, custos e pendências.

## Segurança

O app usa o Supabase já configurado pelo CRM. Somente a chave publicável existente pode ir no pacote cliente; nunca inclua service role, segredo de API da OpenAI ou chave privada do Google Maps no app, neste repositório ou em arquivos versionados. As integrações do Sherlock devem passar por um serviço no servidor.
