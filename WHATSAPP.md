# WhatsApp — MAS Intelligence CRM v1.3.0

Integração atual: abertura manual pelo dossiê, com destino explícito e telefone brasileiro validado. Usa o WhatsApp da sessão do operador; não envia mensagens, não confirma entrega e não altera automaticamente o funil. O registro de contato depende da interação efetivamente realizada. A demonstração não abre números externos; descartadas/perdidas/não contatar ficam bloqueadas. Número público não comprova conta WhatsApp nem autorização para mensagens.

## Segunda etapa — ainda não ativa

A MAS usa WhatsApp Business no celular. Avaliar Cloud API oficial, conta Meta e elegibilidade de coexistência antes de qualquer migração do número. Número corporativo, acesso Meta, provedor, custos e condições operacionais ainda precisam ser definidos.

Arquitetura: webhook HTTPS no servidor, assinatura validada, deduplicação/fila, conversas isoladas por organização, histórico de mensagens e status de entrega, assistente e transferência humana. Tokens e segredos exclusivamente no servidor; nunca em config.js nem no repositório público.

O atendimento será identificado como assistente virtual da MAS, em linguagem natural, com base de conhecimento aprovada e transferência para uma pessoa. Memória por conversa; melhorias sugeridas por respostas passam por revisão antes de entrar na base. Não alterar automaticamente regras, preços ou permissões a partir de mensagens recebidas. Não oferecer GAS Arquitetura e Design. Não disparar mensagens aos leads por causa da importação.

Pendentes testes de envio/recebimento, status, assinatura/repetição de webhook, isolamento, recusa de contato, transferência humana, retenção, recuperação de falhas e aprendizagem revisada. Nenhum bot ou webhook oficial de WhatsApp está ativo.

Referências oficiais:
- https://faq.whatsapp.com/5913398998672934/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/
