/** Coleção "Crocs": clogs originais montados a partir de crocs-dados.ts (gerado do site oficial). */
import type { Bundle } from "./bundles";
import { CROCS_MODELOS, CROCS_SECOES } from "./crocs-dados";

export { CROCS_IDS, CROCS_SECOES } from "./crocs-dados";

const img = (f: string) => `/produtos/${f}`;
const nomeSecao = (id: string) => CROCS_SECOES.find((s) => s.id === id)?.nome ?? "";
const TAMANHOS_ADULTOS = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"];
const linhaExibida = (linha: string) => (linha === "Juvenil" ? "Adulto" : linha);
const tamanhosCrocs = (linha: string, tamanhos: readonly string[]) =>
  linha === "Infantil" ? tamanhos.filter((t) => Number(t) <= 37) : TAMANHOS_ADULTOS;

export const crocs: Bundle[] = CROCS_MODELOS.flatMap((m) =>
  m.versoes.map((v, i): Bundle => {
    const linha = linhaExibida(v.linha);
    const nome = linha === "Adulto" ? m.nome : `${m.nome} ${linha}`;
    const tamanhos = tamanhosCrocs(v.linha, v.tamanhos);
    return {
      id: v.id,
      name: nome,
      tag: `Crocs original · ${linha}`,
       price: 99,
      compareAtPrice: v.preco,
       img: img(v.imgs[0] ?? "crocs/cr21a-1.jpg"),
      images: v.imgs.map(img),
      options: [{ name: "Tamanho", values: tamanhos }],
      benefits: m.pontos.length
        ? m.pontos.slice(0, 3)
        : ["Crocs original", "Leve e confortável", "Fácil de limpar"],
      description: [m.descricao, "Produto original Crocs."].filter(Boolean),
      specs: [
        ["Marca", "Crocs (original)"],
        ["Coleção", nomeSecao(m.secao)],
        ["Linha", linha],
        ["Numeração", `Do ${tamanhos[0]} ao ${tamanhos.at(-1)}`],
        ...(v.ref ? ([["Referência", v.ref]] as [string, string][]) : []),
        ["Dica", "Se estiver entre dois números, escolha o maior"],
      ],
      category: "crocs",
      secao: m.secao,
      checkoutProductName: nome,
      checkoutProductDescription: `${nome}, Crocs original.`,
      checkoutUrl: `/checkout?plano=${v.id}`,
       badge: "1 por R$ 99",
      semPromo: true,
      // Infantil, juvenil e adulto do mesmo modelo: uma página com seletor; só a 1ª nas vitrines.
      ...(m.versoes.length > 1
        ? { group: `crocs-${m.grupo}`, groupLabel: v.linha, groupTitle: "Escolha a versão" }
        : {}),
      ...(i > 0 ? { listed: false } : {}),
    };
  }),
);

const promoModelos = Array.from(
  new Set(
    CROCS_MODELOS.flatMap((m) =>
      m.versoes.map((v) => {
        const linha = linhaExibida(v.linha);
        return linha === "Adulto" ? m.nome : `${m.nome} ${linha}`;
      }),
    ),
  ),
);
const promoTamanhos = Array.from(
  new Set([
    ...CROCS_MODELOS.flatMap((m) => m.versoes.flatMap((v) => v.tamanhos)),
    ...TAMANHOS_ADULTOS,
  ]),
).sort((a, b) => Number(a) - Number(b));
const promoOpcoes = [
  { name: "Modelo", values: promoModelos },
  { name: "Tamanho", values: promoTamanhos },
];
const promoOpcoesDuas = [
  { name: "Modelo do 1º Crocs", values: promoModelos },
  { name: "Tamanho do 1º Crocs", values: promoTamanhos },
  { name: "Modelo do 2º Crocs", values: promoModelos },
  { name: "Tamanho do 2º Crocs", values: promoTamanhos },
];

const promoBase = {
  name: "Promoção Crocs",
  tag: "Escolha seu modelo e tamanho adulto ou infantil",
  img: img("crocs/cr21a-1.jpg"),
  images: [img("crocs/cr21a-1.jpg")],
  options: promoOpcoes,
  benefits: [
    "Crocs originais",
    "Leves e confortáveis",
    "Tamanhos adultos do 34 ao 43",
    "Escolha entre vários modelos e tamanhos",
  ],
  category: "crocs" as const,
  checkoutProductDescription: "Promoção de Crocs originais.",
  semPromo: true,
  group: "crocs-promocao",
  groupTitle: "Escolha sua promoção",
  secao: "promocao",
};

export const crocsPromo: Bundle[] = [
  {
    ...promoBase,
    id: "crocs1",
    groupLabel: "1 Crocs",
     price: 99,
    unidades: 1,
     badge: "1 por R$ 99",
    checkoutProductName: "Promoção Crocs — 1 unidade",
    checkoutUrl: "/checkout?plano=crocs1",
  },
  {
    ...promoBase,
    id: "crocs2",
    groupLabel: "2 Crocs",
    options: promoOpcoesDuas,
     price: 149,
    unidades: 2,
     badge: "2 por R$ 149",
    checkoutProductName: "Promoção Crocs — 2 unidades",
    checkoutUrl: "/checkout?plano=crocs2",
  },
];
