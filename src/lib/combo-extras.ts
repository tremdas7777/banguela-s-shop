import { encodeVariant, getBundle, PERSONAGENS, type BundleId } from "@/lib/bundles";
import type { CartItem } from "@/lib/cart";

/**
 * Extras dos pijamas kigurumi: ursinhos além do de brinde (na página) e pantufas dos mesmos
 * personagens dos pijamas (popup ao comprar). Viram itens comuns do checkout; o preço de cada um
 * vem do catálogo, no servidor.
 */
export type ComboExtras = { ursinhos: Readonly<Record<string, number>> };
export const SEM_EXTRAS: ComboExtras = { ursinhos: {} };
export const MAX_URSINHOS = 10;

const precoItens = (itens: readonly CartItem[]) =>
  Math.round(itens.reduce((s, it) => s + getBundle(it.plano).price * it.qtd * 100, 0)) / 100;

/** Ursinhos extras como itens do pedido, e o total deles. */
export function comboExtrasItens(e: ComboExtras) {
  const itens: CartItem[] = PERSONAGENS.flatMap((nome) => {
    const qtd = e.ursinhos[nome] ?? 0;
    return qtd > 0 ? [{ plano: "ursinho" as const, variante: nome, qtd }] : [];
  });
  return { itens, total: precoItens(itens) };
}

/** Pantufas vendidas em pacote: 2 ou 4 pares, cada pacote com o seu preço no catálogo. */
export const PANTUFA_PACOTES: readonly { pares: 2 | 4; id: BundleId }[] = [
  { pares: 2, id: "pantufa2" },
  { pares: 4, id: "pantufa4" },
];
export const pacotePantufas = (pares: number) => PANTUFA_PACOTES.find((p) => p.pares === pares);

export type ParPantufa = { personagem: string; numero: string };

/** Pares escolhidos no popup → item do pedido (ou nada, se a quantidade não fecha um pacote). */
export function pantufaItem(pares: readonly ParPantufa[]): CartItem | null {
  const pacote = pacotePantufas(pares.length);
  if (!pacote) return null;
  const values = pares.flatMap((p) => [p.personagem, p.numero]);
  return { plano: pacote.id, variante: encodeVariant(values), qtd: 1 };
}

export const itensTotal = precoItens;
