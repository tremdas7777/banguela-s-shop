/**
 * Catálogo da Banguela Shop.
 * O checkout vende um produto por vez (`?plano=<id>&variante=<opções>`); o preço é
 * sempre recalculado no servidor a partir daqui — o cliente só exibe.
 */

export const BUNDLE_IDS = [
  "mdpreto",
  "mdbranco",
  "mdverde",
  "mdgalaxia",
  "mdbrilha",
  "mdrosa",
  "mdfogo",
  "mdazul",
  "pijama",
  "snuggy",
  "pantufa",
  "carro",
  "aneis",
  "colares",
] as const;
export type BundleId = (typeof BUNDLE_IDS)[number];
export const DEFAULT_BUNDLE_ID: BundleId = "pijama";

/** Valor mínimo (produtos, sem frete) para liberar o frete grátis. */
export const FREE_SHIPPING_MIN = 199;
export const FREE_SHIPPING_LABEL = `Frete grátis em compras acima de R$ ${FREE_SHIPPING_MIN}`;

export const isFreeShippingEligible = (subtotal: number) => subtotal >= FREE_SHIPPING_MIN;

/** Selo de frete do produto: grátis quando ele sozinho já passa do mínimo. */
export const bundleShippingLabel = (b: { price: number }) =>
  isFreeShippingEligible(b.price) ? "Frete grátis para todo o Brasil" : FREE_SHIPPING_LABEL;

export type CategoryId = "moletons" | "conforto" | "joias" | "auto";

export const categories: readonly {
  id: CategoryId;
  name: string;
  desc: string;
  img: string;
}[] = [
  {
    id: "moletons",
    name: "Sleepo Dragão",
    desc: "Cobertor vestível com capuz de dragão",
    img: "/produtos/md-preto.jpg",
  },
  {
    id: "conforto",
    name: "Conforto & Dormir",
    desc: "Pijama, pantufas e o Snuggy",
    img: "/produtos/p2_snuggy.jpg",
  },
  {
    id: "joias",
    name: "Joias de Dragão",
    desc: "Anéis e colares para casais",
    img: "/produtos/p5_aneis.jpg",
  },
  {
    id: "auto",
    name: "Para o Carro",
    desc: "Mascotes para carro e moto",
    img: "/produtos/p4_carro.jpg",
  },
];

export type ProductOption = { name: string; values: readonly string[] };

export type Bundle = {
  id: BundleId;
  name: string;
  /** Frase curta do card. */
  tag: string;
  price: number;
  compareAtPrice?: number;
  img: string;
  images: readonly string[];
  /** Opções que o cliente escolhe (cor, tamanho...). Vazio = produto sem variação. */
  options: readonly ProductOption[];
  /** Foto mostrada ao escolher um valor de opção (ex.: a cor). */
  optionImages?: Readonly<Record<string, string>>;
  benefits: readonly string[];
  category: CategoryId;
  checkoutProductName: string;
  checkoutProductDescription: string;
  checkoutUrl: string;
  featured?: boolean;
  badge?: string;
  /** Nome curto da estampa (linha de moletons: "Preto", "Galáxia"...). */
  estampa?: string;
  /** Texto da aba "Descrição" (um parágrafo por item). */
  description?: readonly string[];
  /** Aba "Detalhes e medidas": pares rótulo/valor. */
  specs?: readonly (readonly [string, string])[];
};

const img = (f: string) => `/produtos/${f}`;

/** Linha Sleepo Dragão (cobertor vestível): mesmo modelo, uma estampa por produto. */
const MOLETONS: { id: BundleId; estampa: string; slug: string }[] = [
  { id: "mdpreto", estampa: "Preto", slug: "preto" },
  { id: "mdbranco", estampa: "Branco", slug: "branco" },
  { id: "mdverde", estampa: "Verde", slug: "verde" },
  { id: "mdgalaxia", estampa: "Galáxia", slug: "galaxia" },
  { id: "mdbrilha", estampa: "Brilha no Escuro", slug: "brilha" },
  { id: "mdrosa", estampa: "Rosa", slug: "rosa" },
  { id: "mdfogo", estampa: "Fogo", slug: "fogo" },
  { id: "mdazul", estampa: "Azul", slug: "azul" },
];

const moletons: Bundle[] = MOLETONS.map(({ id, estampa, slug }) => ({
  id,
  name: `Sleepo Dragão ${estampa}`,
  tag: "Cobertor vestível de dragão com sherpa por dentro",
  price: 199.9,
  compareAtPrice: 279.9,
  img: img(`md-${slug}.jpg`),
  images: [img(`md-${slug}.jpg`), img(`md-${slug}-uso.jpg`)],
  options: [
    { name: "Tamanho", values: ["Infantil 4-8 anos", "Infantil 9-14 anos", "Adulto (único)"] },
  ],
  benefits: [
    "Flanela macia por fora e sherpa quentinha por dentro",
    "Capuz gigante com chifres e asinhas de dragão",
    "Bolso canguru e comprimento do pescoço aos joelhos",
  ],
  description: [
    `O Sleepo Dragão ${estampa} é o abraço quentinho que você veste: um cobertor de flanela macia com sherpa felpuda por dentro, em formato de moletom gigante que cobre do pescoço até os joelhos.`,
    "O capuz é de dragão, com chifrinhos, olhos bordados e espinhos macios, e nas costas tem asinhas de tecido. Mangas largas e bolso canguru deixam as mãos quentes, e o tamanho oversized serve para usar no sofá, na cama ou em casa o dia todo.",
    "Tem versão adulta e infantil, para a família inteira virar dragão junto.",
  ],
  specs: [
    ["Estampa", estampa],
    ["Tecido", "Flanela por fora e sherpa por dentro"],
    ["Comprimento", "Do pescoço até a altura dos joelhos"],
    ["Detalhes", "Capuz com chifres e olhos bordados, asinhas nas costas, bolso canguru"],
    ["Tamanhos", "Infantil 4 a 8 anos, infantil 9 a 14 anos e adulto (tamanho único oversized)"],
    [
      "Cuidados",
      "Lavar na máquina no ciclo delicado, com água fria, do avesso. Não usar secadora.",
    ],
  ],
  category: "moletons",
  checkoutProductName: `Sleepo Dragão ${estampa}`,
  checkoutProductDescription:
    "Cobertor vestível de flanela com sherpa, capuz de dragão com chifres e asinhas.",
  checkoutUrl: `/checkout?plano=${id}`,
  estampa,
}));

export const bundles: Bundle[] = [
  ...moletons,
  {
    id: "pijama",
    name: "Calça Pijama de Dragão",
    tag: "Do infantil 4 ao XGG",
    price: 129.9,
    compareAtPrice: 179.9,
    img: img("p1_pijama.jpg"),
    images: [img("p1_pijama.jpg"), img("p1_branco.jpg"), img("p1_preto.jpg"), img("p1_casal.jpg")],
    options: [
      { name: "Modelo", values: ["Dragão Branco", "Dragão Preto"] },
      {
        name: "Tamanho",
        values: [
          "Infantil 4",
          "Infantil 6",
          "Infantil 8",
          "Infantil 10",
          "Infantil 12",
          "P",
          "M",
          "G",
          "GG",
          "XGG",
        ],
      },
    ],
    optionImages: { "Dragão Branco": img("p1_branco.jpg"), "Dragão Preto": img("p1_preto.jpg") },
    benefits: [
      "Tamanhos do infantil 4 ao adulto XGG",
      "Algodão felpudo, macio e durável",
      "Cós com elástico e cordão ajustável",
    ],
    description: [
      "A calça de pijama que dá vontade de ficar em casa. Estampa de dragão, tecido felpudo e macio por dentro e caimento solto, do jeito que um pijama tem que ser.",
      "O cós tem elástico e cordão para ajustar na cintura, e a modelagem relaxada não aperta nem para dormir nem para ficar no sofá. Tem versão adulta e infantil, para combinar com a família inteira.",
    ],
    specs: [
      ["Modelos", "Dragão Branco e Dragão Preto"],
      ["Tecido", "Algodão felpudo, macio por dentro"],
      ["Cintura", "Elástico com cordão de ajuste"],
      ["Tamanhos infantis", "4, 6, 8, 10 e 12 (idade aproximada em anos)"],
      ["Tamanhos adultos", "P, M, G, GG e XGG"],
      [
        "Cuidados",
        "Lavar à mão ou na máquina no ciclo delicado, com água fria. Não usar secadora nem alvejante.",
      ],
    ],
    category: "conforto",
    checkoutProductName: "Calça Pijama de Dragão",
    checkoutProductDescription:
      "Calça de pijama com estampa de dragão, algodão felpudo e cós com elástico.",
    checkoutUrl: "/checkout?plano=pijama",
  },
  {
    id: "snuggy",
    name: "Snuggy Dragão",
    tag: "Cobertor vestível com capuz",
    price: 199.9,
    compareAtPrice: 279.9,
    img: img("p2_snuggy.jpg"),
    images: [img("p2_snuggy.jpg"), img("p2b.jpg"), img("p2c.jpg")],
    options: [
      { name: "Cor", values: ["Preto", "Branco"] },
      {
        name: "Tamanho",
        values: ["Infantil 4-8 anos", "Infantil 9-14 anos", "P", "Padrão", "G", "GG"],
      },
    ],
    benefits: [
      "Cobertor e moletom ao mesmo tempo",
      "Capuz amplo e mangas largas",
      "Tamanhos adulto e infantil (4 a 14 anos)",
    ],
    description: [
      "O Snuggy Dragão é cobertor e moletom ao mesmo tempo: você veste e fica quentinho do pescoço aos joelhos, com as mãos livres para o celular, o livro ou o controle.",
      "Capuz amplo de dragão, mangas largas e bolso canguru. É o presente certo para quem sente frio e ama dragões, em tamanho adulto e infantil.",
    ],
    specs: [
      ["Cores", "Preto e Branco"],
      ["Tecido", "Flanela ultramacia"],
      ["Detalhes", "Capuz de dragão, mangas largas e bolso canguru"],
      ["Tamanhos infantis", "4 a 8 anos e 9 a 14 anos"],
      ["Tamanhos adultos", "P, Padrão, G e GG"],
      [
        "Cuidados",
        "Lavar à mão ou na máquina no ciclo delicado, com água fria. Não usar secadora nem alvejante.",
      ],
    ],
    category: "conforto",
    checkoutProductName: "Snuggy Dragão",
    checkoutProductDescription:
      "Cobertor vestível com capuz de dragão, mangas largas e tecido ultramacio.",
    checkoutUrl: "/checkout?plano=snuggy",
    featured: true,
    badge: "Mais vendido",
  },
  {
    id: "pantufa",
    name: "Pantufas de Dragão",
    tag: "Quentinhas e antiderrapantes",
    price: 99.9,
    compareAtPrice: 139.9,
    img: img("p3_pantufas.jpg"),
    images: [img("p3_pantufas.jpg"), img("p3b.jpg"), img("p3c.jpg")],
    options: [
      { name: "Cor", values: ["Branco", "Preto"] },
      {
        name: "Tamanho",
        values: ["28-29", "30-31", "32-33", "34-35", "36-37", "38-39", "40-41", "42-43", "44-45"],
      },
    ],
    optionImages: { Branco: img("p3_pantufas.jpg"), Preto: img("p3c.jpg") },
    benefits: [
      "Solado antiderrapante para piso frio",
      "Forro em pelúcia que segura o calor",
      "Numeração infantil e adulta, do 28 ao 45",
    ],
    description: [
      "Pantufas de dragão fofinhas, com olhinhos bordados e forro de pelúcia que segura o calor nos dias frios.",
      "O solado é antiderrapante, então dá para andar tranquilo no piso frio da cozinha ou do banheiro. Tem numeração infantil e adulta, para a família toda andar de dragão pela casa.",
    ],
    specs: [
      ["Cores", "Branco e Preto"],
      ["Forro", "Pelúcia macia"],
      ["Solado", "Antiderrapante"],
      ["Numeração infantil", "28-29, 30-31, 32-33 e 34-35"],
      ["Numeração adulta", "36-37, 38-39, 40-41, 42-43 e 44-45"],
      ["Dica", "Se estiver entre dois números, escolha o maior"],
      ["Cuidados", "Lavar à mão com água fria e secar à sombra"],
    ],
    category: "conforto",
    checkoutProductName: "Pantufas de Dragão",
    checkoutProductDescription: "Pantufas de dragão com forro em pelúcia e solado antiderrapante.",
    checkoutUrl: "/checkout?plano=pantufa",
  },
  {
    id: "carro",
    name: "Dragão de Carro",
    tag: "Mascote para carro e moto",
    price: 89.9,
    compareAtPrice: 119.9,
    img: img("p4_carro.jpg"),
    images: [img("p4_carro.jpg"), img("p4b.jpg"), img("p4c.jpg")],
    options: [
      { name: "Cor", values: ["Preto", "Branco"] },
      { name: "Fixação", values: ["Adesivo 3M", "Ventosa", "Engate rápido"] },
    ],
    benefits: [
      "Pelúcia resistente para carro e moto",
      "Fixação por adesivo 3M, ventosa ou engate rápido",
      "Fácil de remover e de limpar",
    ],
    description: [
      "Um dragãozinho de pelúcia para acompanhar você no trânsito. Fica no painel, no retrovisor ou no guidão da moto e chama atenção por onde passa.",
      "Você escolhe a cor e o tipo de fixação: adesivo 3M para o painel, ventosa para o vidro ou engate rápido para tirar e colocar quando quiser.",
    ],
    specs: [
      ["Cores", "Preto e Branco"],
      ["Material", "Pelúcia resistente"],
      ["Fixação", "Adesivo 3M, ventosa ou engate rápido"],
      ["Uso", "Carro e moto"],
      ["Cuidados", "Limpar com pano úmido"],
    ],
    category: "auto",
    checkoutProductName: "Dragão de Carro",
    checkoutProductDescription:
      "Mascote de pelúcia de dragão para carro e moto, com fixação à escolha.",
    checkoutUrl: "/checkout?plano=carro",
  },
  {
    id: "aneis",
    name: "Anéis Promessa de Dragão",
    tag: "Par em prata 925",
    price: 139.9,
    compareAtPrice: 189.9,
    img: img("p5_aneis.jpg"),
    images: [img("p5_aneis.jpg"), img("p5b.jpg"), img("p5c.jpg")],
    options: [],
    benefits: [
      "Par de anéis em prata 925",
      "Ajuste livre, serve em qualquer dedo",
      "Acompanha estojo de presente",
    ],
    description: [
      "Um par de anéis de dragão para casais: um dragão escuro e um prateado, que formam par quando as mãos se encontram.",
      "São em prata 925 e têm ajuste livre, então servem em qualquer dedo sem precisar saber a medida. Chegam em estojo de presente, prontos para entregar.",
    ],
    specs: [
      ["Material", "Prata 925"],
      ["Tamanho", "Ajustável, serve em qualquer dedo"],
      ["Vem com", "2 anéis e estojo de presente"],
      ["Cuidados", "Evite contato com perfume e água do mar; guarde no estojo"],
    ],
    category: "joias",
    checkoutProductName: "Anéis Promessa de Dragão",
    checkoutProductDescription:
      "Par de anéis de dragão em prata 925, ajustáveis, com estojo de presente.",
    checkoutUrl: "/checkout?plano=aneis",
  },
  {
    id: "colares",
    name: "Kit Colares de Dragão",
    tag: "Par de colares + caixa",
    price: 129.9,
    compareAtPrice: 199.9,
    img: img("p6_colares.jpg"),
    images: [img("p6_colares.jpg"), img("p6b.jpg"), img("p6c.jpg")],
    options: [],
    benefits: [
      "Par de colares com pingentes que se encaixam",
      "Corrente banhada e antialérgica",
      "Caixa de presente inclusa",
    ],
    description: [
      "Kit com dois colares de dragão cujos pingentes se encaixam e formam um coração, um para cada pessoa do casal.",
      "A corrente é banhada e antialérgica, e o kit vem em caixa de presente.",
    ],
    specs: [
      ["Material", "Corrente banhada, antialérgica"],
      ["Vem com", "2 colares e caixa de presente"],
      ["Cuidados", "Evite contato com perfume, cremes e água"],
    ],
    category: "joias",
    checkoutProductName: "Kit Colares de Dragão",
    checkoutProductDescription:
      "Par de colares de dragão com pingentes que se encaixam e caixa de presente.",
    checkoutUrl: "/checkout?plano=colares",
  },
];

/** Produtos visíveis na loja. */
export const availableBundles = bundles;

export function parseBundleId(raw: string | undefined | null): BundleId | undefined {
  return (BUNDLE_IDS as readonly string[]).includes(raw ?? "") ? (raw as BundleId) : undefined;
}

export function getBundle(id: string | undefined | null): Bundle {
  const parsed = parseBundleId(id);
  return availableBundles.find((b) => b.id === parsed) ?? availableBundles[0];
}

export function getCheckoutUrl(id: string | undefined) {
  return getBundle(id).checkoutUrl;
}

export const bundlesByCategory = (cat: CategoryId) =>
  availableBundles.filter((b) => b.category === cat);

export const discountPct = (b: Pick<Bundle, "price" | "compareAtPrice">) =>
  b.compareAtPrice ? Math.round((1 - b.price / b.compareAtPrice) * 100) : 0;

/** Variação escolhida na URL: valores na ordem das opções, separados por "|". */
export const encodeVariant = (values: readonly string[]) => values.join("|");

/**
 * Valida a variação contra as opções do produto.
 * Devolve os valores escolhidos (`[]` para produto sem variação) ou `null` se faltar/for inválida.
 */
export function parseVariant(b: Bundle, raw: string | undefined | null): string[] | null {
  if (!b.options.length) return [];
  if (!raw) return null;
  const values = raw.split("|");
  if (values.length !== b.options.length) return null;
  return b.options.every((o, i) => o.values.includes(values[i]!)) ? values : null;
}

export const variantLabel = (values: readonly string[]) => values.join(" · ");

/** Nome do item com a variação, como vai para o pedido no admin. */
export const productLabel = (b: Bundle, values: readonly string[]) =>
  values.length ? `${b.name} — ${variantLabel(values)}` : b.name;

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
