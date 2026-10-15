import { brand } from "@/lib/brand";

/** Order bumps do checkout. Preços usados no servidor — o cliente só exibe. */
export const BUMP_IDS = ["aneis", "colares"] as const;
export type BumpId = (typeof BUMP_IDS)[number];

export type OrderBumpItem = {
  id: BumpId;
  name: string;
  fullName: string;
  /** Nome genérico enviado ao gateway (fatura). */
  gatewayName: string;
  price: number;
  /** Preço "de" (riscado). Sem ele, a oferta mostra só o preço. */
  compareAt?: number;
  img: string;
};

/** Itens sem variação (não pedem tamanho/cor), por isso cabem como "leve junto". Ajuste preços aqui. */
export const ORDER_BUMPS: readonly OrderBumpItem[] = [
  {
    id: "aneis",
    name: "Anéis Promessa",
    fullName: "Par de Anéis Promessa de Dragão (prata 925)",
    gatewayName: `${brand.gatewayName} Anéis`,
    price: 99.9,
    compareAt: 139.9,
    img: "/produtos/p5_aneis.jpg",
  },
  {
    id: "colares",
    name: "Kit Colares",
    fullName: "Kit Colares de Dragão + caixa de presente",
    gatewayName: `${brand.gatewayName} Colares`,
    price: 89.9,
    compareAt: 129.9,
    img: "/produtos/p6_colares.jpg",
  },
];

/** Bumps escolhidos, na ordem do checkout (ids repetidos ou desconhecidos são ignorados). */
export const getBumps = (ids: readonly string[]) => ORDER_BUMPS.filter((b) => ids.includes(b.id));

/** Soma dos bumps escolhidos, em reais. */
export const bumpsTotal = (ids: readonly string[]) =>
  Math.round(getBumps(ids).reduce((s, b) => s + b.price * 100, 0)) / 100;
