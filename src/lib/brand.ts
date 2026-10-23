/**
 * Marca da loja — Banguela Shop.
 * PREENCHA `cnpj`, `email` e `whatsapp` com os dados da sua empresa antes de vender.
 */
export const brand = {
  name: "Banguela Shop",
  productName: "Banguela Shop",
  /** Nome genérico que aparece na fatura do cliente (gateways Pix e cartão). */
  gatewayName: "Banguela Shop",
  tagline: "Produtos de dragão para vestir, presentear e levar na estrada",
  taglineShort: "Produtos de dragão",
  manufacturer: "Banguela Shop",
  manufacturerTagline: "Feito para fãs de dragão",
  cnpj: "00.000.000/0000-00",
  email: "contato@seudominio.com.br",
  whatsapp: {
    /**
     * Número inicial em E.164 (55 + DDD + número), sem símbolos. Depois de trocado no
     * admin (Configurações da loja → Botão de WhatsApp), vale o do admin. Vazio = oculto.
     */
    phoneE164: "",
  },
  colors: {
    primary: "#1f9d41",
    primaryDark: "#17843a",
    primaryDeep: "#0f5f29",
    onPrimary: "#ffffff",
    surfaceTint: "#e7f6ea",
  },
} as const;
