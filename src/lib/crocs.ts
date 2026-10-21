/** Coleção "Crocs": clogs originais montados a partir de crocs-dados.ts (gerado do site oficial). */
import type { Bundle } from "./bundles";
import { CROCS_MODELOS, CROCS_SECOES } from "./crocs-dados";

export { CROCS_IDS, CROCS_SECOES } from "./crocs-dados";

const img = (f: string) => `/produtos/${f}`;
const nomeSecao = (id: string) => CROCS_SECOES.find((s) => s.id === id)?.nome ?? "";

export const crocs: Bundle[] = CROCS_MODELOS.flatMap((m) =>
  m.versoes.map((v, i): Bundle => {
    const nome = v.linha === "Adulto" ? m.nome : `${m.nome} ${v.linha}`;
    return {
      id: v.id,
      name: nome,
      tag: `Crocs original · ${v.linha}`,
      price: v.preco,
      img: img(v.imgs[0]!),
      images: v.imgs.map(img),
      options: [{ name: "Tamanho", values: v.tamanhos }],
      benefits: m.pontos.length
        ? m.pontos.slice(0, 3)
        : ["Crocs original", "Leve e confortável", "Fácil de limpar"],
      description: [m.descricao, "Produto original Crocs."].filter(Boolean),
      specs: [
        ["Marca", "Crocs (original)"],
        ["Coleção", nomeSecao(m.secao)],
        ["Linha", v.linha],
        ["Numeração", `Do ${v.tamanhos[0]} ao ${v.tamanhos.at(-1)}`],
        ...(v.ref ? ([["Referência", v.ref]] as [string, string][]) : []),
        ["Dica", "Se estiver entre dois números, escolha o maior"],
      ],
      category: "crocs",
      secao: m.secao,
      checkoutProductName: nome,
      checkoutProductDescription: `${nome}, Crocs original.`,
      checkoutUrl: `/checkout?plano=${v.id}`,
      badge: "Original",
      // Infantil, juvenil e adulto do mesmo modelo: uma página com seletor; só a 1ª nas vitrines.
      ...(m.versoes.length > 1
        ? { group: `crocs-${m.grupo}`, groupLabel: v.linha, groupTitle: "Escolha a versão" }
        : {}),
      ...(i > 0 ? { listed: false } : {}),
    };
  }),
);
