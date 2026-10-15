import { Children, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Prateleira com deslize lateral: no celular arrasta com o dedo (encaixa card a card),
 * no computador tem setas. `itemClassName` controla a largura de cada card.
 */
export function Shelf({
  children,
  label,
  itemClassName = "w-[64%] sm:w-[42%] md:w-[31%] lg:w-[23.5%]",
}: {
  children: ReactNode;
  label: string;
  itemClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((first?.offsetWidth ?? 280) + 16), behavior: "smooth" });
  };
  const arrow =
    "absolute top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--ink)] shadow-[0_10px_24px_-14px_rgba(16,30,20,0.5)] transition hover:scale-105 md:grid";
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`${label}: anteriores`}
        onClick={() => go(-1)}
        className={cn(arrow, "-left-4")}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div
        ref={ref}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <div className={cn("shrink-0 snap-start", itemClassName)}>{child}</div>
        ))}
      </div>
      <button
        type="button"
        aria-label={`${label}: próximos`}
        onClick={() => go(1)}
        className={cn(arrow, "-right-4")}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
