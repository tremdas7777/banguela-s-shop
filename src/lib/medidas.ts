import type { BundleId, ProductOption } from "@/lib/bundles";

/**
 * Tabela de medidas dos pijamas: medidas da PEÇA esticada na mesa, em cm.
 * Camiseta: largura de axila a axila e comprimento do ombro à barra.
 * Calça: meia cintura (cós com elástico, sem esticar), meio quadril e comprimento do cós à barra.
 * Valores de referência da grade brasileira de pijama; troque pelos do fornecedor quando tiver.
 */
type Grade = { colunas: readonly string[]; linhas: readonly (readonly string[])[] };

export const CAMISETA_ADULTO: Grade = {
  colunas: ["Tamanho", "Largura", "Comprimento"],
  linhas: [
    ["P", "49", "68"],
    ["M", "52", "70"],
    ["G", "55", "72"],
    ["GG", "58", "74"],
    ["G1", "61", "76"],
    ["G2", "64", "78"],
    ["G3", "67", "80"],
  ],
};

export const CALCA_ADULTO: Grade = {
  colunas: ["Tamanho", "Cintura", "Quadril", "Comprimento"],
  linhas: [
    ["P", "34", "50", "100"],
    ["M", "36", "52", "102"],
    ["G", "39", "55", "104"],
    ["GG", "42", "58", "106"],
    ["G1", "45", "61", "107"],
    ["G2", "48", "64", "108"],
    ["G3", "51", "67", "109"],
  ],
};

export const CAMISETA_INFANTIL: Grade = {
  colunas: ["Tamanho", "Largura", "Comprimento"],
  linhas: [
    ["2 anos", "32", "40"],
    ["4 anos", "35", "44"],
    ["6 anos", "37", "48"],
    ["8 anos", "39", "51"],
    ["10 anos", "41", "54"],
    ["12 anos", "43", "57"],
    ["14 anos", "46", "61"],
  ],
};

export const CALCA_INFANTIL: Grade = {
  colunas: ["Tamanho", "Cintura", "Comprimento"],
  linhas: [
    ["2 anos", "22", "52"],
    ["4 anos", "24", "60"],
    ["6 anos", "25", "67"],
    ["8 anos", "27", "74"],
    ["10 anos", "28", "80"],
    ["12 anos", "30", "86"],
    ["14 anos", "31", "92"],
  ],
};

export type Peca = "camiseta" | "calca";

/** Pijamas com o botão "Tabela de medidas" e as peças que cada um tem. */
const COM_TABELA: Partial<Record<BundleId, readonly Peca[]>> = {
  kitcalca: ["camiseta", "calca"],
  pijama: ["calca"],
  pijamai: ["calca"],
};
export const pecasComTabela = (id: BundleId) => COM_TABELA[id] ?? null;

/** Opções de tamanho viram menu suspenso na página do produto (as outras continuam como botões). */
export const usaMenuDeTamanho = (o: ProductOption) => /^(Tamanho|Idade)/.test(o.name);
