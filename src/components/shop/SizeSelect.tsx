import { ChevronDown } from "lucide-react";
import type { ProductOption } from "@/lib/bundles";
import { cn } from "@/lib/utils";

const ADULTO = new Set(["PP", "P", "M", "G", "GG"]);

/** Grupo e rótulo de cada tamanho no menu: "Infantil • 2", "Adulto • M", "Plus Size • G1". */
function rotulo(v: string, numeracao: boolean): { grupo: string; label: string } {
  const idade = /^(\d+) anos?$/.exec(v);
  if (idade) return { grupo: "Infantil", label: `Infantil • ${idade[1]}` };
  if (ADULTO.has(v)) return { grupo: "Adulto", label: `Adulto • ${v}` };
  if (/^G\d$/.test(v)) return { grupo: "Plus Size", label: `Plus Size • ${v}` };
  // Numeração de pantufa: infantil até o 34, adulto do 35 em diante. Em "Tamanho" (ex.: Crocs, que
  // já separam infantil, juvenil e adulto em versões), o número aparece sozinho.
  if (numeracao && /^\d{2}$/.test(v)) {
    const grupo = Number(v) <= 34 ? "Infantil" : "Adulto";
    return { grupo, label: `${grupo} • ${v}` };
  }
  return { grupo: "", label: v };
}

/** Menu "Escolha o tamanho" agrupado por Infantil / Adulto / Plus Size, no visual da loja. */
export function SizeSelect({
  option,
  value,
  onChange,
  missing,
}: {
  option: ProductOption;
  value: string | undefined;
  onChange: (v: string) => void;
  missing: boolean;
}) {
  const grupos: { nome: string; itens: { v: string; label: string }[] }[] = [];
  for (const v of option.values) {
    const { grupo, label } = rotulo(v, /^Numeração/.test(option.name));
    const atual = grupos.at(-1);
    if (atual && atual.nome === grupo) atual.itens.push({ v, label });
    else grupos.push({ nome: grupo, itens: [{ v, label }] });
  }
  const opcoes = (itens: { v: string; label: string }[]) =>
    itens.map((i) => (
      <option key={i.v} value={i.v}>
        {i.label}
      </option>
    ));
  return (
    <div className="relative">
      <select
        aria-label={option.name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full cursor-pointer appearance-none rounded-full border-2 bg-white pl-5 pr-12 text-[15px] font-semibold text-[var(--night)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--night)]/30",
          value ? "border-[var(--night)] bg-[var(--mint)]" : "border-[var(--ink)]/20",
          missing && !value && "border-[var(--sale)]",
        )}
      >
        <option value="" disabled>
          {/^Numeração/.test(option.name) ? "Escolha a numeração" : "Escolha o tamanho"}
        </option>
        {grupos.map((g) =>
          g.nome ? (
            <optgroup key={g.nome} label={g.nome}>
              {opcoes(g.itens)}
            </optgroup>
          ) : (
            opcoes(g.itens)
          ),
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--night)]" />
    </div>
  );
}
