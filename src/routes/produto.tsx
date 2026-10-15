import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Lock, RefreshCw, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Shelf } from "@/components/shop/Shelf";
import { brand } from "@/lib/brand";
import { metaTrack } from "@/lib/meta-pixel";
import { trackCheckoutClick } from "@/lib/analytics";
import { bundleIdFromSearch, planSearchSchema } from "@/lib/plan-search";
import { CARD_MAX_INSTALLMENTS } from "@/lib/payment-pricing";
import {
  availableBundles,
  brl,
  bundleShippingLabel,
  categories,
  discountPct,
  encodeVariant,
  getBundle,
  productLabel,
} from "@/lib/bundles";

export const Route = createFileRoute("/produto")({
  validateSearch: planSearchSchema,
  loaderDeps: ({ search }) => ({ plano: search.plano }),
  loader: ({ deps }) => ({ id: bundleIdFromSearch({ plano: deps.plano }) }),
  head: ({ loaderData }) => {
    const p = getBundle(loaderData?.id);
    const title = `${p.name} | ${brand.name}`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${p.name}: ${p.checkoutProductDescription} ${bundleShippingLabel(p)}.`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: p.checkoutProductDescription },
        { property: "og:image", content: p.img },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: `/produto?plano=${p.id}` }],
    };
  },
  component: Page,
});

/** Bolinha de cor para valores como "Preto" / "Branco". */
function Swatch({ value }: { value: string }) {
  const color = /preto/i.test(value) ? "#151515" : /branco/i.test(value) ? "#f2f2f2" : null;
  if (!color) return null;
  return (
    <i className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ background: color }} />
  );
}

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const p = getBundle(bundleIdFromSearch(search));
  const category = categories.find((c) => c.id === p.category);
  const off = discountPct(p);

  const [sel, setSel] = useState<Record<string, string>>({});
  const [img, setImg] = useState(p.img);
  const [nudge, setNudge] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Troca de produto (ex.: pelos relacionados): zera as escolhas e a foto.
  useEffect(() => {
    setSel({});
    setImg(p.img);
    setNudge(false);
  }, [p.id, p.img]);

  useEffect(() => {
    metaTrack("ViewContent", { value: p.price, contentName: p.name });
  }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = p.options.map((o) => sel[o.name]);
  const complete = values.every(Boolean);
  const missing = p.options.filter((o) => !sel[o.name]).map((o) => o.name.toLowerCase());

  const choose = (name: string, value: string) => {
    setSel((s) => ({ ...s, [name]: value }));
    setNudge(false);
    const optionImg = p.optionImages?.[value];
    if (optionImg) setImg(optionImg);
  };

  const buy = () => {
    if (!complete) {
      setNudge(true);
      optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const chosen = values as string[];
    trackCheckoutClick({
      source: "product_page",
      bundleId: p.id,
      bundleName: productLabel(p, chosen),
      value: p.price,
    });
    navigate({
      to: "/checkout",
      search: { plano: p.id, ...(chosen.length ? { variante: encodeVariant(chosen) } : {}) },
    });
  };

  const buyLabel = complete ? `Comprar agora · ${brl(p.price)}` : `Escolha ${missing.join(" e ")}`;
  const related = availableBundles.filter((b) => b.id !== p.id);

  return (
    <SiteLayout>
      <div className="container-edge pb-28 pt-6 md:pb-20 md:pt-10">
        <nav
          aria-label="Navegação"
          className="mb-6 flex flex-wrap items-center gap-1 text-[13px] text-[var(--ink)]/50"
        >
          <Link to="/" className="hover:text-[var(--primary)]">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <a href={`/#cat-${p.category}`} className="hover:text-[var(--primary)]">
            {category?.name}
          </a>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--ink)]/80">{p.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
          <div className="md:sticky md:top-[calc(var(--site-chrome-h,7rem)+1.5rem)] md:self-start">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
              <img src={img} alt={p.name} className="h-full w-full object-cover" />
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-md bg-[var(--sale)] px-2.5 py-1 text-[12px] font-bold text-white">
                  -{off}%
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-2.5 overflow-x-auto [scrollbar-width:none]">
              {p.images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImg(src)}
                  aria-label="Ver foto"
                  className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    img === src
                      ? "border-[var(--primary)]"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow text-[var(--ink)]/50">{category?.name}</span>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-[2.6rem] text-balance">
              {p.name}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--ink)]/60">{p.tag}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-display text-[2rem] font-extrabold leading-none">
                {brl(p.price)}
              </span>
              {p.compareAtPrice && (
                <>
                  <span className="text-[15px] text-[var(--ink)]/45 line-through">
                    {brl(p.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-[var(--sale)]/10 px-3 py-1 text-[12px] font-bold text-[var(--sale)]">
                    Economize {brl(p.compareAtPrice - p.price)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-[13px] text-[var(--ink)]/60">
              Pix com desconto ou até {CARD_MAX_INSTALLMENTS}x no cartão · {bundleShippingLabel(p)}
            </p>

            <ul className="mt-6 space-y-2.5">
              {p.benefits.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px] text-[var(--ink)]/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  {b}
                </li>
              ))}
            </ul>

            {p.options.length > 0 && (
              <div
                ref={optionsRef}
                className={`mt-7 space-y-5 rounded-2xl transition ${nudge ? "bg-[var(--sale)]/5 p-4 ring-2 ring-[var(--sale)]/40" : ""}`}
              >
                {p.options.map((o) => (
                  <div key={o.name}>
                    <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55">
                      {o.name}
                      {sel[o.name] && (
                        <span className="ml-1 normal-case tracking-normal text-[var(--ink)]">
                          : {sel[o.name]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.values.map((v) => {
                        const on = sel[o.name] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => choose(o.name, v)}
                            aria-pressed={on}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-4 text-[14px] font-semibold transition ${
                              on
                                ? "border-[var(--primary)] bg-[var(--brand-tint)]"
                                : "border-[var(--ink)]/12 bg-white hover:border-[var(--ink)]/35"
                            }`}
                          >
                            <Swatch value={v} />
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {nudge && (
                  <p className="text-[13px] font-semibold text-[var(--sale)]">
                    Escolha {missing.join(" e ")} para continuar.
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={buy}
              className={`mt-7 hidden w-full rounded-full py-4 text-[15px] font-bold text-white transition md:block ${
                complete
                  ? "bg-[var(--primary)] hover:opacity-90"
                  : "bg-[var(--ink)]/80 hover:bg-[var(--ink)]"
              }`}
            >
              {buyLabel}
            </button>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-6 text-center text-[12px] text-[var(--ink)]/65">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="h-5 w-5 text-[var(--primary)]" /> Envio rastreado
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Lock className="h-5 w-5 text-[var(--primary)]" /> Pagamento seguro
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw className="h-5 w-5 text-[var(--primary)]" /> Troca em 30 dias
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Você também vai amar
          </h2>
          <Shelf label="Relacionados">
            {related.map((b) => (
              <ProductCard key={b.id} p={b} />
            ))}
          </Shelf>
        </section>
      </div>

      {/* Barra de compra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur md:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="font-display text-lg font-extrabold">{brl(p.price)}</div>
            {p.compareAtPrice && (
              <div className="text-[12px] text-[var(--ink)]/45 line-through">
                {brl(p.compareAtPrice)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={buy}
            className={`flex-1 rounded-full py-3.5 text-[14px] font-bold text-white ${
              complete ? "bg-[var(--primary)]" : "bg-[var(--ink)]/80"
            }`}
          >
            {complete ? "Comprar agora" : buyLabel}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
