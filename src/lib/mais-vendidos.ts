import { availableBundles, getBundle, parseBundleId, type BundleId } from "@/lib/bundles";

/**
 * "Mais vendidos": ranking feito com os pedidos da loja, pagos e pendentes (mais-vendidos.functions.ts),
 * com os pijamas kigurumi sempre na frente. Enquanto houver poucos produtos pedidos, a seção vira
 * "Destaques da loja" com a lista abaixo.
 */
export type MaisVendidos = { ids: BundleId[]; reais: boolean };

/** Produtos vendidos diferentes necessários para mostrar o ranking real. */
export const MIN_VENDIDOS = 4;
export const MAX_MAIS_VENDIDOS = 12;

/** Sempre aparecem primeiro, antes do ranking (escolha da loja). */
export const FIXOS: readonly BundleId[] = ["kgban2", "kgsti2", "kgang2", "kgfur2"];

/** Fixos na frente e o resto sem repetir, até o limite. */
export const comFixos = (ids: readonly BundleId[]) =>
  [...FIXOS, ...ids.filter((id) => !FIXOS.includes(id))].slice(0, MAX_MAIS_VENDIDOS);
/** Escolhidos à mão, usados até a loja ter vendas suficientes. */
export const DESTAQUES: readonly BundleId[] = [
  "snuggy",
  "kitcasal",
  "kitcalca",
  "mdpreto",
  "pijama",
  "pantufa2",
];

export const titulo = (m: MaisVendidos) => (m.reais ? "Mais vendidos" : "Destaques da loja");

/**
 * Produto da vitrine que representa um item vendido: a versão infantil conta para a adulta, o
 * combo de 4 para o de 2 e o conjunto avulso para o kit. Itens que só existem como adicional
 * (pantufas e ursinhos do kigurumi) não entram.
 */
export function produtoDaVitrine(raw: string): BundleId | null {
  const id = parseBundleId(raw);
  if (!id) return null;
  const b = getBundle(id);
  if (b.listed !== false) return b.id;
  const doGrupo = b.group
    ? availableBundles.find((x) => x.group === b.group && x.listed !== false)
    : undefined;
  if (doGrupo) return doGrupo.id;
  const destino = b.redirectTo ? getBundle(b.redirectTo) : undefined;
  return destino && destino.category === b.category ? destino.id : null;
}
