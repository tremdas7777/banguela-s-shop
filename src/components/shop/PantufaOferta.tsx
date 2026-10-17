import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { brl, isFreeShippingEligible } from "@/lib/bundles";
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
const ADULTO = PANTUFA_TAMANHOS_ADULTO[0];

function TamanhoSelect({
  cor,
  value,
  onChange,
  missing,
  infantil,
}: {
  cor: PantufaCor;
  value: PantufaTamanho | "";
  onChange: (t: PantufaTamanho) => void;
  missing: boolean;
  infantil: boolean;
}) {
  const grupos = [
    { label: "Adulto", tamanhos: PANTUFA_TAMANHOS_ADULTO },
    { label: "Infantil", tamanhos: PANTUFA_TAMANHOS_INFANTIL },
  ];
  if (infantil) grupos.reverse();
  return (
    <select
      aria-label={`Número da pantufa ${COR_LABEL[cor].toLowerCase()}`}
      value={value}
      onChange={(e) => onChange(e.target.value as PantufaTamanho)}
      className={cn(
        "mt-2 block w-full rounded-xl border-2 bg-white px-2 py-2 text-center text-[14px] font-bold text-[var(--night)]",
        missing ? "border-[var(--sale)]" : "border-black/15",
      )}
    >
      <option value="" disabled>
        Número
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
  );
}

/**
 * Popup do "Comprar" nos pijamas. A pessoa toca nas cores que quer (uma ou as duas) e escolhe o
 * número; levando as duas, o desconto entra sozinho.
 */
export function PantufaOferta({
  open,
  productPrice,
  infantil = false,
  onClose,
  onContinue,
}: {
  open: boolean;
  /** Preço do pijama, para avisar quando as pantufas liberam o frete grátis. */
  productPrice: number;
  /** Pijama infantil: numeração infantil aparece primeiro. */
  infantil?: boolean;
  onClose: () => void;
  onContinue: (pares: PantufaPar[]) => void;
}) {
  const [sel, setSel] = useState<PantufaCor[]>([]);
  const [tam, setTam] = useState<Record<PantufaCor, PantufaTamanho | "">>({
    Branco: "",
    Preto: "",
  });
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (open) setNudge(false);
  }, [open]);

  // Mantém a ordem branca, preta.
  const cores = PANTUFA_CORES.filter((c) => sel.includes(c));
  const pares = cores.flatMap((c) => {
    const t = tam[c];
    return t ? [{ cor: c, tamanho: t }] : [];
  });
  const completo = cores.length > 0 && pares.length === cores.length;
  // Antes de escolher o número, conta o preço do par adulto.
  const cheio = cores.reduce((s, c) => s + parPrice(tam[c] || ADULTO), 0);
  const total = completo
    ? pantufasTotal(pares)
    : Math.round((cheio - (cores.length === 2 ? DESCONTO_DOIS_PARES : 0)) * 100) / 100;
  const outra = PANTUFA_CORES.find((c) => !sel.includes(c));
  const freteGratis =
    cores.length > 0 &&
    !isFreeShippingEligible(productPrice) &&
    isFreeShippingEligible(productPrice + total);

  const toggle = (c: PantufaCor) => {
    setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
    setNudge(false);
  };
  const confirmar = () => {
    if (!completo) return setNudge(true);
    onContinue(pares);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-24px)] max-w-md flex-col gap-0 overflow-hidden rounded-3xl p-0">
        <div className="overflow-y-auto px-5 pb-4 pt-6">
          <DialogTitle className="pr-6 text-center text-[22px] font-extrabold leading-tight text-[var(--night)]">
            Quer levar as pantufas?
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-center text-[14px] text-black/65">
            Pode levar <b className="text-[var(--night)]">só uma cor</b> ou as duas. Levando as
            duas, você economiza <b className="text-[var(--night)]">{brl(DESCONTO_DOIS_PARES)}</b>.
          </DialogDescription>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {PANTUFA_CORES.map((c) => {
              const on = sel.includes(c);
              return (
                <div key={c}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c)}
                    className={cn(
                      "relative block w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                      on ? "border-[var(--night)] shadow-md" : "border-black/10",
                    )}
                  >
                    <img
                      src={PANTUFA_IMG[c]}
                      alt={`Pantufa ${COR_LABEL[c].toLowerCase()}`}
                      className="aspect-square w-full object-cover"
                    />
                    <span
                      className={cn(
                        "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2",
                        on
                          ? "border-[var(--night)] bg-[var(--night)] text-white"
                          : "border-white bg-white/80",
                      )}
                    >
                      {on && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "flex items-center justify-between px-3 py-2",
                        on ? "bg-[var(--mint)]" : "bg-white",
                      )}
                    >
                      <b className="text-[15px] text-[var(--night)]">{COR_LABEL[c]}</b>
                      <span className="text-[13px] font-semibold text-black/70">
                        {brl(parPrice(tam[c] || ADULTO))}
                      </span>
                    </span>
                  </button>
                  {on && (
                    <TamanhoSelect
                      cor={c}
                      value={tam[c]}
                      onChange={(t) => {
                        setTam((s) => ({ ...s, [c]: t }));
                        setNudge(false);
                      }}
                      missing={nudge && !tam[c]}
                      infantil={infantil}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {cores.length === 2 && (
            <p className="mt-4 rounded-xl bg-[var(--mint)] px-3 py-2.5 text-center text-[14px] font-bold text-[var(--night)]">
              As duas por <s className="font-semibold text-black/45">{brl(cheio)}</s> {brl(total)} ·
              economia de {brl(DESCONTO_DOIS_PARES)}
            </p>
          )}
          {cores.length === 1 && outra && (
            <button
              type="button"
              onClick={() => toggle(outra)}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-[var(--night)]/40 px-3 py-2.5 text-[14px] font-bold text-[var(--night)]"
            >
              + Levar a {COR_LABEL[outra].toLowerCase()} também e economizar{" "}
              {brl(DESCONTO_DOIS_PARES)}
            </button>
          )}
          {freteGratis && (
            <p className="mt-3 text-center text-[13px] font-bold text-[var(--ok,#1f9d41)]">
              Com as pantufas, seu frete fica grátis
            </p>
          )}
          {nudge && (
            <p className="mt-3 text-center text-[13px] font-semibold text-[var(--sale)]">
              {cores.length ? "Escolha o número da pantufa." : "Toque na cor da pantufa."}
            </p>
          )}
        </div>

        <div className="border-t border-black/10 bg-white px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={confirmar}
            className={cn(
              "w-full rounded-full py-4 text-[14px] font-extrabold uppercase tracking-[0.06em] transition",
              cores.length
                ? "bg-[var(--night)] text-white hover:opacity-90"
                : "bg-black/10 text-black/45",
            )}
          >
            {cores.length ? `Adicionar por + ${brl(total)}` : "Escolha a cor acima"}
          </button>
          <button
            type="button"
            onClick={() => onContinue([])}
            className="mt-2 w-full py-1 text-[13px] font-semibold text-black/55 underline underline-offset-2"
          >
            Não, quero só o pijama
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
