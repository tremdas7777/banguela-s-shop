import { useEffect, useState, type ReactNode } from "react";
import { Check, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { brl, FREE_SHIPPING_MIN, isFreeShippingEligible } from "@/lib/bundles";
import {
  DESCONTO_DOIS_PARES,
  PANTUFA_CORES,
  PANTUFA_IMG,
  PANTUFA_TAMANHOS_ADULTO,
  PANTUFA_TAMANHOS_INFANTIL,
  pantufasTotal,
  parPrice,
  type PantufaCor,
  type PantufaPar,
  type PantufaTamanho,
} from "@/lib/pantufa-oferta";
import { cn } from "@/lib/utils";

const COR_LABEL: Record<PantufaCor, string> = { Branco: "Branca", Preto: "Preta" };
type Modo = "um" | "dois";

function TamanhoSelect({
  value,
  onChange,
  label,
  missing,
  infantil,
}: {
  value: PantufaTamanho | "";
  onChange: (t: PantufaTamanho) => void;
  label: string;
  missing: boolean;
  infantil: boolean;
}) {
  const grupos = [
    { label: "Adulto", tamanhos: PANTUFA_TAMANHOS_ADULTO },
    { label: "Infantil", tamanhos: PANTUFA_TAMANHOS_INFANTIL },
  ];
  if (infantil) grupos.reverse();
  return (
    <label className="block flex-1 text-[12px] font-bold text-[var(--night)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PantufaTamanho)}
        className={cn(
          "mt-1 block w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] font-semibold",
          missing ? "border-[var(--sale)]" : "border-black/15",
        )}
      >
        <option value="" disabled>
          Escolha o número
        </option>
        {grupos.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.tamanhos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function Opcao({
  on,
  onSelect,
  children,
}: {
  on: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="radio"
      aria-checked={on}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={cn(
        "cursor-pointer rounded-2xl border-2 p-4 transition",
        on ? "border-[var(--night)] bg-[var(--mint)]" : "border-black/10 bg-white",
      )}
    >
      {children}
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
        on ? "border-[var(--night)] bg-[var(--night)] text-white" : "border-black/30",
      )}
    >
      {on && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

/** Popup do "Comprar" nos pijamas: oferece as pantufas (1 par ou as duas cores com desconto). */
export function PantufaOferta({
  open,
  productPrice,
  infantil = false,
  onClose,
  onContinue,
}: {
  open: boolean;
  /** Pijama infantil: numeração infantil aparece primeiro. */
  infantil?: boolean;
  /** Preço do pijama, para avisar quando as pantufas liberam o frete grátis. */
  productPrice: number;
  onClose: () => void;
  onContinue: (pares: PantufaPar[]) => void;
}) {
  const [modo, setModo] = useState<Modo>("dois");
  const [cor, setCor] = useState<PantufaCor>("Branco");
  const [tam, setTam] = useState<Record<PantufaCor, PantufaTamanho | "">>({
    Branco: "",
    Preto: "",
  });
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (open) setNudge(false);
  }, [open]);

  const cores = modo === "dois" ? PANTUFA_CORES : [cor];
  const pares = cores.flatMap((c) => {
    const t = tam[c];
    return t ? [{ cor: c, tamanho: t }] : [];
  });
  const completo = pares.length === cores.length;
  const adulto = PANTUFA_TAMANHOS_ADULTO[0];
  // Antes de escolher o número, mostra o preço do par adulto.
  const umPreco = parPrice(tam[cor] || adulto);
  const doisCheio = parPrice(tam.Branco || adulto) + parPrice(tam.Preto || adulto);
  const doisPreco = Math.round((doisCheio - DESCONTO_DOIS_PARES) * 100) / 100;
  const extra = completo ? pantufasTotal(pares) : modo === "dois" ? doisPreco : umPreco;
  const freteGratis =
    !isFreeShippingEligible(productPrice) && isFreeShippingEligible(productPrice + extra);

  const setTamanho = (c: PantufaCor, t: PantufaTamanho) => {
    setTam((s) => ({ ...s, [c]: t }));
    setNudge(false);
  };
  const confirmar = () => {
    if (!completo) return setNudge(true);
    onContinue(pares);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-24px)] max-w-md overflow-y-auto rounded-3xl p-5 sm:p-6">
        <DialogTitle className="pr-6 text-center text-[21px] font-extrabold leading-tight text-[var(--night)]">
          Leve as pantufas do Banguela junto?
        </DialogTitle>
        <DialogDescription className="-mt-1 text-center text-[14px] text-black/65">
          Forro de pelúcia e solado antiderrapante. Combinam com o pijama.
        </DialogDescription>

        <div className="grid grid-cols-2 gap-3">
          {PANTUFA_CORES.map((c) => (
            <figure key={c} className="overflow-hidden rounded-2xl bg-[var(--mint)]">
              <img
                src={PANTUFA_IMG[c]}
                alt={`Pantufa ${COR_LABEL[c]}`}
                className="aspect-square w-full object-cover"
              />
              <figcaption className="py-1.5 text-center text-[13px] font-bold text-[var(--night)]">
                {COR_LABEL[c]}
              </figcaption>
            </figure>
          ))}
        </div>

        <div role="radiogroup" className="space-y-3">
          <Opcao on={modo === "dois"} onSelect={() => setModo("dois")}>
            <div className="flex items-start gap-3">
              <Radio on={modo === "dois"} />
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-[var(--night)]">
                  As duas cores (branca + preta)
                </p>
                <p className="mt-0.5 text-[13px]">
                  <s className="text-black/45">{brl(doisCheio)}</s>{" "}
                  <b className="text-[var(--night)]">{brl(doisPreco)}</b>
                </p>
              </div>
              <span className="rounded-full bg-[var(--sale)] px-2.5 py-1 text-[11px] font-extrabold text-white">
                -{brl(DESCONTO_DOIS_PARES)}
              </span>
            </div>
            {modo === "dois" && (
              <div className="mt-3 flex gap-2">
                {PANTUFA_CORES.map((c) => (
                  <TamanhoSelect
                    key={c}
                    label={`Número da ${COR_LABEL[c].toLowerCase()}`}
                    value={tam[c]}
                    onChange={(t) => setTamanho(c, t)}
                    missing={nudge && !tam[c]}
                    infantil={infantil}
                  />
                ))}
              </div>
            )}
          </Opcao>

          <Opcao on={modo === "um"} onSelect={() => setModo("um")}>
            <div className="flex items-start gap-3">
              <Radio on={modo === "um"} />
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-[var(--night)]">Só 1 par</p>
                <p className="mt-0.5 text-[13px] font-bold text-[var(--night)]">{brl(umPreco)}</p>
              </div>
            </div>
            {modo === "um" && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  {PANTUFA_CORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCor(c);
                      }}
                      className={cn(
                        "flex-1 rounded-full border-2 py-2 text-[13px] font-extrabold",
                        cor === c
                          ? "border-[var(--night)] bg-[var(--night)] text-white"
                          : "border-black/15 bg-white text-[var(--night)]",
                      )}
                    >
                      {COR_LABEL[c]}
                    </button>
                  ))}
                </div>
                <TamanhoSelect
                  label="Número"
                  value={tam[cor]}
                  onChange={(t) => setTamanho(cor, t)}
                  missing={nudge && !tam[cor]}
                  infantil={infantil}
                />
              </div>
            )}
          </Opcao>
        </div>

        {freteGratis && (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-[var(--mint)] py-2 text-[13px] font-bold text-[var(--night)]">
            <Truck className="h-4 w-4" /> Com as pantufas, o frete fica grátis
          </p>
        )}
        {nudge && (
          <p className="text-center text-[13px] font-semibold text-[var(--sale)]">
            Escolha o número da pantufa para continuar.
          </p>
        )}

        <button
          type="button"
          onClick={confirmar}
          className="w-full rounded-full bg-[var(--night)] py-4 text-[14px] font-extrabold uppercase tracking-[0.06em] text-white transition hover:opacity-90"
        >
          Adicionar por + {brl(extra)}
        </button>
        <button
          type="button"
          onClick={() => onContinue([])}
          className="-mt-1 w-full py-1 text-[13px] font-semibold text-black/55 underline underline-offset-2"
        >
          Não, quero só o pijama
        </button>
        <p className="-mt-2 text-center text-[11px] text-black/45">
          Frete grátis em compras acima de R$ {FREE_SHIPPING_MIN}
        </p>
      </DialogContent>
    </Dialog>
  );
}
