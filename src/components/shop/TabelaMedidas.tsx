import { useState } from "react";
import { Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  CALCA_ADULTO,
  CALCA_INFANTIL,
  CAMISETA_ADULTO,
  CAMISETA_INFANTIL,
  type Peca,
} from "@/lib/medidas";
import { cn } from "@/lib/utils";

type Grade = { colunas: readonly string[]; linhas: readonly (readonly string[])[] };

function Tabela({ titulo, t }: { titulo: string; t: Grade }) {
  return (
    <div>
      <p className="mb-1.5 text-[14px] font-extrabold text-[var(--night)]">{titulo}</p>
      <table className="w-full text-center text-[13px]">
        <thead>
          <tr className="bg-[var(--mint)] text-[var(--night)]">
            {t.colunas.map((c, i) => (
              <th
                key={c}
                className={cn(
                  "px-2 py-2 font-extrabold",
                  i === 0 && "rounded-l-xl text-left",
                  i === t.colunas.length - 1 && "rounded-r-xl",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.linhas.map((l) => (
            <tr key={l[0]} className="border-b border-black/5 last:border-0">
              {l.map((v, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-2 py-2",
                    i === 0 ? "text-left font-bold text-[var(--night)]" : "",
                  )}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Botão "Tabela de medidas" que abre as medidas da camiseta e da calça, adulto e infantil. */
export function TabelaMedidas({
  pecas,
  infantilPrimeiro = false,
}: {
  pecas: readonly Peca[];
  infantilPrimeiro?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [aba, setAba] = useState<"adulto" | "infantil">(infantilPrimeiro ? "infantil" : "adulto");
  const adulto = aba === "adulto";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--night)] underline underline-offset-2"
      >
        <Ruler className="h-4 w-4" /> Tabela de medidas
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-24px)] max-w-md gap-3 overflow-y-auto rounded-3xl p-5">
          <DialogTitle className="text-[20px] font-extrabold text-[var(--night)]">
            Tabela de medidas
          </DialogTitle>
          <DialogDescription className="text-[13px] text-black/60">
            Medidas da peça em centímetros. Compare com um pijama que fica bem em você.
          </DialogDescription>
          <div className="grid grid-cols-2 gap-2 rounded-full bg-black/5 p-1">
            {(["adulto", "infantil"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAba(a)}
                className={cn(
                  "rounded-full py-2 text-[13px] font-extrabold",
                  aba === a ? "bg-[var(--night)] text-white" : "text-[var(--night)]",
                )}
              >
                {a === "adulto" ? "Adulto" : "Infantil"}
              </button>
            ))}
          </div>
          {pecas.includes("camiseta") && (
            <Tabela titulo="Camiseta" t={adulto ? CAMISETA_ADULTO : CAMISETA_INFANTIL} />
          )}
          {pecas.includes("calca") && (
            <Tabela titulo="Calça" t={adulto ? CALCA_ADULTO : CALCA_INFANTIL} />
          )}
          <div className="rounded-2xl bg-[var(--mint)] p-3 text-[12px] leading-relaxed text-[var(--night)]">
            <p className="mb-1 font-extrabold">Como medir (peça esticada na mesa)</p>
            {pecas.includes("camiseta") && (
              <p>
                <b>Largura:</b> de uma axila à outra. <b>Comprimento:</b> do ombro até a barra.
              </p>
            )}
            {pecas.includes("calca") && (
              <p>
                <b>Cintura:</b> de ponta a ponta do cós, sem esticar o elástico.{" "}
                {adulto && (
                  <>
                    <b>Quadril:</b> de lado a lado na parte mais larga.{" "}
                  </>
                )}
                <b>Comprimento:</b> do cós até a barra.
              </p>
            )}
            <p className="mt-1">
              Ficou entre dois tamanhos? Escolha o maior. As medidas podem variar de 1 a 2 cm.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
