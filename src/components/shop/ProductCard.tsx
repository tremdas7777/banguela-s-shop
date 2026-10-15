import { Link } from "@tanstack/react-router";
import { brl, discountPct, type Bundle } from "@/lib/bundles";

/** Card da vitrine: abre a página do produto (onde o cliente escolhe cor/tamanho). */
export function ProductCard({ p }: { p: Bundle }) {
  const off = discountPct(p);
  return (
    <Link
      to="/produto"
      search={{ plano: p.id }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-24px_rgba(16,30,20,0.4)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {p.badge && (
            <span className="rounded-md bg-[var(--primary)] px-2 py-1 text-[11px] font-bold text-white">
              {p.badge}
            </span>
          )}
          {off > 0 && (
            <span className="rounded-md bg-[var(--sale)] px-2 py-1 text-[11px] font-bold text-white">
              -{off}%
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[17px] font-bold leading-tight">{p.name}</h3>
        <p className="mt-1 text-[13px] text-[var(--ink)]/60">{p.tag}</p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-4">
          <span className="font-display text-xl font-extrabold">{brl(p.price)}</span>
          {p.compareAtPrice && (
            <span className="text-[13px] text-[var(--ink)]/45 line-through">
              {brl(p.compareAtPrice)}
            </span>
          )}
        </div>
        <span className="mt-3 inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2.5 text-[13px] font-bold text-white transition group-hover:opacity-90">
          {p.options.length ? "Escolher opções" : "Comprar"}
        </span>
      </div>
    </Link>
  );
}
