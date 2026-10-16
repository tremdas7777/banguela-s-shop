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
  "mdpretoi",
  "mdbrancoi",
  "mdverdei",
  "mdgalaxiai",
  "mdbrilhai",
  "mdrosai",
  "mdfogoi",
  "mdazuli",
  "pijama",
  "pijamai",
  "kitcasal",
  "kitshortf",
  "kitshortm",
  "kitshorti",
  "kitcalca",
  "kitcalcaf",
  "kitcalcam",
  "kitcalcai",
  "snuggy",
  "snuggyi",
  "pantufa",
  "pantufai",
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
    id: "conforto",
    name: "Conforto & Dormir",
    desc: "Pijama, pantufas e o Snuggy",
    img: "/produtos/p2_snuggy.jpg",
  },
  {
    id: "moletons",
    name: "Sleepo Dragão",
    desc: "Cobertor vestível com capuz de dragão",
    img: "/produtos/md-preto.jpg",
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
  /** Produtos do mesmo grupo aparecem como opções na mesma página (ex.: combo casal / só feminino). */
  group?: string;
  /** Rótulo da opção dentro do grupo ("Combo casal", "Só feminino"...). */
  groupLabel?: string;
  /** false = não aparece nas vitrines (só pela página do grupo). */
  listed?: boolean;
  /** Versão infantil: vira um produto irmão ("Adulto" / "Infantil") com preço e tamanhos próprios. */
  kids?: {
    id: BundleId;
    price: number;
    compareAtPrice?: number;
    options: readonly ProductOption[];
  };
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
  kids: {
    id: `${id}i` as BundleId,
    price: 169.9,
    compareAtPrice: 239.9,
    options: [{ name: "Idade", values: ["4 a 8 anos", "9 a 14 anos"] }],
  },
  name: `Sleepo Dragão ${estampa}`,
  tag: "Cobertor vestível de dragão com sherpa por dentro",
  price: 199.9,
  compareAtPrice: 279.9,
  img: img(`md-${slug}.jpg`),
  images: [img(`md-${slug}.jpg`), img(`md-${slug}-uso.jpg`)],
  options: [],
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
    ["Tamanhos", "Adulto: tamanho único oversized. Infantil: 4 a 8 anos e 9 a 14 anos"],
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

/**
 * Kits de pijama de casal. Cada kit vira 4 produtos do mesmo grupo, escolhidos na página:
 * combo casal (com desconto), só feminino, só masculino e infantil. Cada um tem preço próprio,
 * calculado no servidor como qualquer produto.
 */
type KitModo = "casal" | "f" | "m" | "i";
type KitDef = {
  group: string;
  ids: Record<KitModo, BundleId>;
  title: string;
  peca: "short" | "calça";
  prices: Record<"casal" | "avulso" | "infantil", [number, number]>;
  imgs: string[];
  /** Cores/modelo de um conjunto, escolhidos antes do tamanho. */
  cores: (quem: "dela" | "dele" | "infantil") => ProductOption[];
  /** Texto do modelo/cores, usado na descrição. */
  coresTexto: string;
  material: string;
  clima: string;
  specsPeca: (readonly [string, string])[];
};

const TAM_INF = ["4 anos", "6 anos", "8 anos", "10 anos", "12 anos"];
const TAM_F = ["PP", "P", "M", "G", "GG"];
const TAM_M = ["P", "M", "G", "GG"];
const CUIDADOS = "Lavar na máquina com água fria, do avesso. Não usar alvejante nem secadora.";

function kit(k: KitDef): Bundle[] {
  const pecas = k.peca === "short" ? "shorts" : "calças";
  const base = {
    img: img(k.imgs[0]!),
    images: k.imgs.map(img),
    category: "conforto" as const,
    group: k.group,
  };
  const label: Record<KitModo, string> = {
    casal: "Combo casal",
    f: "Só feminino",
    m: "Só masculino",
    i: "Infantil",
  };
  const conjunto: Record<KitModo, string> = {
    casal: "Combo casal",
    f: "Conjunto feminino",
    m: "Conjunto masculino",
    i: "Conjunto infantil",
  };
  const sem = (o: ProductOption): ProductOption => ({
    ...o,
    name: o.name.replace(/ (dela|dele|infantil)$/, ""),
  });
  const options: Record<KitModo, ProductOption[]> = {
    casal: [
      ...k.cores("dela"),
      { name: "Tamanho dela", values: TAM_F },
      ...k.cores("dele"),
      { name: "Tamanho dele", values: TAM_M },
    ],
    f: [...k.cores("dela").map(sem), { name: "Tamanho", values: TAM_F }],
    m: [...k.cores("dele").map(sem), { name: "Tamanho", values: TAM_M }],
    i: [...k.cores("infantil").map(sem), { name: "Idade", values: TAM_INF }],
  };
  const tamanhos: Record<KitModo, (readonly [string, string])[]> = {
    casal: [
      ["Tamanhos dela", "PP, P, M, G e GG"],
      ["Tamanhos dele", "P, M, G e GG"],
    ],
    f: [["Tamanhos", "PP, P, M, G e GG"]],
    m: [["Tamanhos", "P, M, G e GG"]],
    i: [["Tamanhos", "4, 6, 8, 10 e 12 anos"]],
  };
  const make = (modo: KitModo): Bundle => {
    const casal = modo === "casal";
    const [price, compareAtPrice] =
      modo === "casal" ? k.prices.casal : modo === "i" ? k.prices.infantil : k.prices.avulso;
    const quem = { casal: "", f: "feminino", m: "masculino", i: "infantil" }[modo];
    return {
      ...base,
      id: k.ids[modo],
      name: `${k.title} · ${conjunto[modo]}`,
      groupLabel: label[modo],
      tag: casal ? `2 camisetas + 2 ${pecas}, para ela e para ele` : `1 camiseta + 1 ${k.peca}`,
      price,
      compareAtPrice,
      options: options[modo],
      benefits: casal
        ? [
            `Combo completo: 2 camisetas e 2 ${pecas}, um conjunto para cada um`,
            "Sai mais barato que comprar os dois conjuntos separados",
            "Cada um escolhe o seu modelo e o seu tamanho",
          ]
        : [
            `${conjunto[modo]}: 1 camiseta e 1 ${k.peca}`,
            "Camiseta de algodão jersey fio 24/1",
            modo === "i"
              ? "Tamanhos de 4 a 12 anos"
              : "Quer para os dois? O combo casal sai com desconto",
          ],
      description: [
        casal
          ? `O pijama perfeito para usar junto com aquela pessoa especial: dois conjuntos de dragão, um para cada um. ${k.coresTexto}`
          : `Conjunto ${quem} de camiseta e ${k.peca} com estampa de dragão. ${k.coresTexto}`,
        `${k.material} ${k.clima}`,
        casal
          ? "Os tamanhos dela e dele são escolhidos separadamente, e o combo sai mais barato que os dois conjuntos avulsos. Um presente lindo para namorados, aniversário de namoro ou casamento."
          : "Também dá para levar o combo casal, com os dois conjuntos e desconto, ou o conjunto infantil para as crianças combinarem com os pais.",
      ],
      specs: [
        [
          "Vem no pedido",
          casal ? `2 camisetas + 2 ${pecas} (dela e dele)` : `1 camiseta + 1 ${k.peca}`,
        ],
        ...k.specsPeca,
        ...tamanhos[modo],
        ["Medidas", "Podem variar de 1 a 2 cm"],
        ["Cuidados", CUIDADOS],
      ],
      checkoutProductName: `${k.title} - ${conjunto[modo]}`,
      checkoutProductDescription: casal
        ? `Combo casal: 2 camisetas de algodão e 2 ${pecas} de pijama.`
        : `${conjunto[modo]} de pijama: 1 camiseta de algodão e 1 ${k.peca}.`,
      checkoutUrl: `/checkout?plano=${k.ids[modo]}`,
      ...(casal ? { badge: "Kit casal" } : { listed: false }),
    };
  };
  return (["casal", "f", "m", "i"] as const).map(make);
}

const MODELOS = ["Dragão branco", "Dragão noturno"];

const kits: Bundle[] = [
  ...kit({
    group: "kitshort",
    ids: { casal: "kitcasal", f: "kitshortf", m: "kitshortm", i: "kitshorti" },
    title: "Pijama Casal Dragões Short",
    peca: "short",
    prices: { casal: [179.9, 249.9], avulso: [99.9, 129.9], infantil: [89.9, 119.9] },
    imgs: ["kit-casal.jpg", "kit-casal-b.jpg", "kit-casal-c.jpg"],
    cores: (quem) => [
      {
        name: `Modelo ${quem}`,
        values: quem === "dele" ? [...MODELOS].reverse() : MODELOS,
      },
    ],
    coresTexto:
      "São dois modelos: o dragão branco, de camiseta branca com olhinhos azuis e short branco estampado, e o dragão noturno, de camiseta preta com olhinhos verdes e short cinza estampado.",
    material:
      "A camiseta é de algodão jersey fio 24/1, macia e respirável, e o short é de algodão leve com elástico na cintura.",
    clima: "Perfeito para as noites quentes.",
    specsPeca: [
      ["Modelo dragão branco", "Camiseta branca com olhos azuis e short branco estampado"],
      ["Modelo dragão noturno", "Camiseta preta com olhos verdes e short cinza estampado"],
      ["Camiseta", "Algodão jersey fio 24/1"],
      ["Short", "Algodão, com elástico na cintura"],
    ],
  }),
  ...kit({
    group: "kitcalca",
    ids: { casal: "kitcalca", f: "kitcalcaf", m: "kitcalcam", i: "kitcalcai" },
    title: "Pijama Casal Dragões Calça",
    peca: "calça",
    prices: { casal: [189.9, 259.9], avulso: [104.9, 134.9], infantil: [94.9, 124.9] },
    imgs: ["kit-casal-calca.jpg", "kit-casal-calca-b.jpg"],
    cores: (quem) => [
      {
        name: `Camiseta ${quem}`,
        values: quem === "dele" ? ["Preta", "Branca"] : ["Branca", "Preta"],
      },
      {
        name: `Calça ${quem}`,
        values: quem === "dele" ? ["Cinza", "Branca"] : ["Branca", "Cinza"],
      },
    ],
    coresTexto:
      "Você combina as cores: camiseta preta com olhos verdes ou branca com olhos azuis, e calça branca com dragões brancos ou cinza com dragões pretos.",
    material:
      "A camiseta é de algodão jersey fio 24/1, macia e respirável, e a calça é de felpa antialérgica com elástico na cintura e corte reto.",
    clima: "Quentinho para as noites frias.",
    specsPeca: [
      ["Camiseta", "Algodão jersey fio 24/1: preta com olhos verdes ou branca com olhos azuis"],
      ["Calça", "Felpa antialérgica, elástico na cintura e corte reto"],
      ["Cores da calça", "Branca com dragões brancos ou cinza com dragões pretos"],
    ],
  }),
];

export const bundles: Bundle[] = [
  ...moletons,
  {
    id: "pijama",
    kids: {
      id: "pijamai",
      price: 109.9,
      compareAtPrice: 149.9,
      options: [
        { name: "Modelo", values: ["Dragão Branco", "Dragão Preto"] },
        { name: "Idade", values: ["4 anos", "6 anos", "8 anos", "10 anos", "12 anos"] },
      ],
    },
    name: "Calça Pijama de Dragão",
    tag: "Do infantil 4 ao XGG",
    price: 129.9,
    compareAtPrice: 179.9,
    img: img("p1_pijama.jpg"),
    images: [img("p1_pijama.jpg"), img("p1_branco.jpg"), img("p1_preto.jpg"), img("p1_casal.jpg")],
    options: [
      { name: "Modelo", values: ["Dragão Branco", "Dragão Preto"] },
      { name: "Tamanho", values: ["P", "M", "G", "GG", "XGG"] },
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
  ...kits,
  {
    id: "snuggy",
    kids: {
      id: "snuggyi",
      price: 169.9,
      compareAtPrice: 239.9,
      options: [
        { name: "Cor", values: ["Preto", "Branco"] },
        { name: "Idade", values: ["4 a 8 anos", "9 a 14 anos"] },
      ],
    },
    name: "Snuggy Dragão",
    tag: "Cobertor vestível com capuz",
    price: 199.9,
    compareAtPrice: 279.9,
    img: img("p2_snuggy.jpg"),
    images: [img("p2_snuggy.jpg"), img("p2b.jpg"), img("p2c.jpg")],
    options: [
      { name: "Cor", values: ["Preto", "Branco"] },
      { name: "Tamanho", values: ["P", "Padrão", "G", "GG"] },
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
    kids: {
      id: "pantufai",
      price: 89.9,
      compareAtPrice: 119.9,
      options: [
        { name: "Cor", values: ["Branco", "Preto"] },
        { name: "Tamanho", values: ["28-29", "30-31", "32-33", "34-35"] },
      ],
    },
    name: "Pantufas de Dragão",
    tag: "Quentinhas e antiderrapantes",
    price: 99.9,
    compareAtPrice: 139.9,
    img: img("p3_pantufas.jpg"),
    images: [img("p3_pantufas.jpg"), img("p3b.jpg"), img("p3c.jpg")],
    options: [
      { name: "Cor", values: ["Branco", "Preto"] },
      { name: "Tamanho", values: ["36-37", "38-39", "40-41", "42-43", "44-45"] },
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

/**
 * Produto com versão infantil vira dois irmãos do mesmo grupo: "Adulto" (aparece nas vitrines)
 * e "Infantil" (só pela página, no seletor de versão), cada um com preço e tamanhos próprios.
 */
function expandKids(list: Bundle[]): Bundle[] {
  return list.flatMap((b) => {
    if (!b.kids) return [b];
    const { kids, ...adult } = b;
    const group = b.group ?? `v-${b.id}`;
    return [
      { ...adult, group, groupLabel: "Adulto" },
      {
        ...adult,
        id: kids.id,
        name: `${b.name} Infantil`,
        group,
        groupLabel: "Infantil",
        price: kids.price,
        compareAtPrice: kids.compareAtPrice,
        options: kids.options,
        checkoutProductName: `${b.checkoutProductName} Infantil`,
        checkoutUrl: `/checkout?plano=${kids.id}`,
        badge: undefined,
        listed: false,
      },
    ];
  });
}

/** Produtos visíveis na loja. */
export const availableBundles = expandKids(bundles);

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

/** Produtos que aparecem nas vitrines (sem os avulsos dos kits). */
export const listedBundles = availableBundles.filter((b) => b.listed !== false);

export const bundlesByCategory = (cat: CategoryId) =>
  listedBundles.filter((b) => b.category === cat);

/** Opções do mesmo grupo (combo casal / avulsos), na ordem do catálogo. */
export const groupBundles = (b: Bundle) =>
  b.group ? availableBundles.filter((x) => x.group === b.group) : [];

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

/**
 * Variação legível. Com o produto, inclui o nome de cada opção ("Tamanho dela: M"),
 * para o pedido não ficar ambíguo em kits com várias opções do mesmo tipo.
 */
export const variantLabel = (values: readonly string[], b?: Bundle) =>
  values.map((v, i) => (b?.options[i] ? `${b.options[i]!.name}: ${v}` : v)).join(" · ");

/** Nome do item com a variação, como vai para o pedido no admin. */
export const productLabel = (b: Bundle, values: readonly string[]) =>
  values.length ? `${b.name} — ${variantLabel(values, b)}` : b.name;

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
