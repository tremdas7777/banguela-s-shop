import { Link } from "@tanstack/react-router";
import { brl, discountPct, type Bundle } from "@/lib/bundles";

/** Card da vitrine: abre a página do produto (onde o cliente escolhe cor/tamanho). */
export function ProductCard({ p }: { p: Bundle }) {
  const off = discountPct(p);
  return (
    <Link to="/produto" search={{ plano: p.id }} className="group block text-center">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[var(--tile)]">
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {p.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--night)] px-2.5 py-1 text-[11px] font-bold text-white">
            {p.badge}
          </span>
        )}
        {off > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-[var(--mint-strong)] px-2.5 py-1 text-[11px] font-bold text-[var(--night)]">
            -{off}% OFF
          </span>
        )}
      </div>
      <h3 className="mt-3 px-1 text-[15px] font-semibold leading-snug text-[var(--ink)]">
        {p.name}
      </h3>
      <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 text-[14px]">
        <span className="font-bold text-[var(--night)]">{brl(p.price)}</span>
        {p.compareAtPrice && (
          <s className="text-[13px] text-[var(--ink)]/45">{brl(p.compareAtPrice)}</s>
        )}
      </div>
    </Link>
  );
}
