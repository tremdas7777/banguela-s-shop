/**
 * Marca da loja — Banguela Shop.
 * A loja não tem e-mail: o atendimento é pelo WhatsApp (número abaixo ou o do admin).
 */
export const brand = {
  name: "Banguela Shop",
  /** Endereço oficial da loja (o webhook dos gateways sempre aponta para cá). */
  siteUrl: "https://banguelashop.store",
  productName: "Banguela Shop",
  /** Nome genérico que aparece na fatura do cliente (gateways Pix e cartão). */
  gatewayName: "Banguela Shop",
  tagline: "Produtos de dragão para vestir, presentear e levar na estrada",
  taglineShort: "Produtos de dragão",
  manufacturer: "Banguela Shop",
  manufacturerTagline: "Feito para fãs de dragão",
  /** Mesma empresa da BEAM RIVALS (é o CNPJ cadastrado no Merchant Center). */
  cnpj: "64.756.111/0001-05",
  whatsapp: {
    /**
     * Número inicial em E.164 (55 + DDD + número), sem símbolos. Depois de trocado no
     * admin (Configurações da loja → Botão de WhatsApp), vale o do admin. Vazio = oculto.
     */
    phoneE164: "5585958549956",
    /** Mensagem pronta do link. O número atende várias lojas, então ela diz de qual o cliente veio. */
    message: "Olá! Vim pelo site da Banguela Shop e quero tirar uma dúvida.",
  },
  colors: {
    primary: "#1f9d41",
    primaryDark: "#17843a",
    primaryDeep: "#0f5f29",
    onPrimary: "#ffffff",
    surfaceTint: "#e7f6ea",
  },
} as const;
