import { FREE_SHIPPING_MIN } from "@/lib/bundles";
import { CARD_MAX_INSTALLMENTS, PIX_DISCOUNT } from "@/lib/payment-pricing";

/** Perguntas frequentes da loja (home e /faq). */
export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "Qual o prazo de entrega?",
    a: "Os pedidos são despachados em até 1 dia útil após a confirmação do pagamento. A entrega leva em média de 3 a 7 dias úteis, conforme a região.",
  },
  {
    q: "O frete é grátis?",
    a: `Sim, para compras a partir de R$ ${FREE_SHIPPING_MIN} em produtos, para todo o Brasil. Abaixo disso, você escolhe o frete no checkout e vê o valor antes de pagar.`,
  },
  {
    q: "Quais as formas de pagamento?",
    a: `Pix, com ${Math.round(PIX_DISCOUNT * 100)}% de desconto quando o cartão estiver liberado, e cartão de crédito em até ${CARD_MAX_INSTALLMENTS}x.`,
  },
  {
    q: "Como escolho o tamanho?",
    a: "Na página de cada produto você escolhe o tamanho e a cor antes de comprar. Pijamas vão do P ao XGG, e as pantufas do 36 ao 45.",
  },
  {
    q: "Posso trocar se não servir?",
    a: "Sim. Você tem 7 dias para desistir da compra e até 30 dias para trocar pijamas, Snuggy e pantufas por outro tamanho ou cor, sem uso e com a etiqueta.",
  },
  {
    q: "Como acompanho meu pedido?",
    a: "Você recebe o código de rastreio por e-mail assim que o pedido sai. Também dá para consultar na página Rastrear pedido, pelo CPF de quem comprou.",
  },
];
