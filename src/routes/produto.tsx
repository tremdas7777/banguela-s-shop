import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronRight, Lock, RefreshCw, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Shelf } from "@/components/shop/Shelf";
import { brand } from "@/lib/brand";
import { FAQ } from "@/lib/faq";
import { metaTrack } from "@/lib/meta-pixel";
import { trackCheckoutClick } from "@/lib/analytics";
import { bundleIdFromSearch, planSearchSchema } from "@/lib/plan-search";
import { CARD_MAX_INSTALLMENTS } from "@/lib/payment-pricing";
import {
  groupBundles,
  listedBundles,
  brl,
  bundlesByCategory,
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
  const color = /pret[oa]|noturno/i.test(value)
    ? "#151515"
    : /branc[oa]/i.test(value)
      ? "#f2f2f2"
      : /cinza/i.test(value)
        ? "#8a9097"
        : null;
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

  const buyLabel = complete
    ? "Comprar agora"
    : missing.length === 1
      ? `Escolha ${missing[0]}`
      : "Escolha as opções";
  const related = listedBundles.filter((b) => b.id !== p.id && (!p.group || b.group !== p.group));
  const group = groupBundles(p);

  const info: { title: string; body: ReactNode }[] = [
    {
      title: "Descrição",
      body: p.description?.length ? (
        <span className="block space-y-3">
          {p.description.map((t) => (
            <span key={t} className="block">
              {t}
            </span>
          ))}
        </span>
      ) : (
        `${p.checkoutProductDescription} ${p.benefits.join(". ")}.`
      ),
    },
    ...(p.specs?.length
      ? [
          {
            title: "Detalhes e medidas",
            body: (
              <span className="block divide-y divide-[var(--border)]">
                {p.specs.map(([k, v]) => (
                  <span key={k} className="flex gap-4 py-2">
                    <b className="w-32 shrink-0 font-semibold text-[var(--night)]">{k}</b>
                    <span>{v}</span>
                  </span>
                ))}
              </span>
            ),
          },
        ]
      : []),
    { title: "Entrega e frete", body: `${FAQ[0]!.a} ${bundleShippingLabel(p)}.` },
    {
      title: "Trocas e devoluções",
      body:
        p.category === "conforto" || p.category === "moletons"
          ? "Você tem 7 dias para desistir da compra e até 30 dias para trocar por outro tamanho ou cor, sem uso e com a etiqueta."
          : "Você tem 7 dias após o recebimento para desistir da compra, com o produto sem uso e na embalagem original.",
    },
    { title: "Pagamento seguro", body: FAQ[2]!.a },
  ];

  return (
    <SiteLayout>
      <div className="container-edge pb-28 pt-4 md:pb-20 md:pt-8">
        <nav
          aria-label="Navegação"
          className="mb-4 flex flex-wrap items-center gap-1 text-[12.5px] text-[var(--ink)]/50"
        >
          <Link to="/" className="hover:text-[var(--night)]">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/colecao/$id" params={{ id: p.category }} className="hover:text-[var(--night)]">
            {category?.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--ink)]/80">{p.name}</span>
        </nav>

        <div className="grid gap-7 md:grid-cols-2 lg:gap-14">
          <div className="md:sticky md:top-[calc(var(--site-chrome-h,7rem)+1.5rem)] md:self-start">
            <div className="relative -mx-6 aspect-square overflow-hidden bg-[var(--tile)] md:mx-0 md:rounded-[24px]">
              <img src={img} alt={p.name} className="h-full w-full object-cover" />
              {p.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-[var(--night)] px-3 py-1 text-[12px] font-bold text-white">
                  {p.badge}
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
                  aria-current={img === src}
                  className="shrink-0 pb-1.5"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className={`h-16 w-16 rounded-xl object-cover transition md:h-[72px] md:w-[72px] ${
                      img === src ? "" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                  <i
                    className={`mx-auto mt-1.5 block h-[3px] rounded-full transition-all ${
                      img === src ? "w-8 bg-[var(--night)]" : "w-0"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-[26px] font-bold leading-tight text-[var(--night)] md:text-[34px] text-balance">
              {p.name}
            </h1>
            <p className="mt-1 text-[15px] text-[var(--ink)]/60">{p.tag}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[26px] font-extrabold leading-none text-[var(--night)]">
                {brl(p.price)}
              </span>
              {p.compareAtPrice && (
                <>
                  <s className="text-[15px] text-[var(--ink)]/45">{brl(p.compareAtPrice)}</s>
                  <span className="rounded-full bg-[var(--mint-strong)] px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-[0.04em] text-[var(--night)]">
                    {off}% de desconto
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-[13.5px] text-[var(--ink)]/65">
              Pix com desconto ou até {CARD_MAX_INSTALLMENTS}x no cartão
            </p>

            <ul className="mt-5 space-y-2.5">
              {p.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[15px] text-[var(--ink)]/85">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--mint)] text-[var(--night)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {group.length > 1 && (
              <div className="mt-6">
                <div className="mb-2.5 text-[14px] font-bold text-[var(--night)]">
                  Escolha o kit
                </div>
                <div
                  className={`grid gap-2 ${group.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}
                >
                  {group.map((g) => {
                    const on = g.id === p.id;
                    const combo = g.groupLabel === "Combo casal";
                    const avulsos = group.filter(
                      (x) => x.groupLabel === "Só feminino" || x.groupLabel === "Só masculino",
                    );
                    const saving = combo ? avulsos.reduce((s, x) => s + x.price, 0) - g.price : 0;
                    return (
                      <Link
                        key={g.id}
                        to="/produto"
                        search={{ plano: g.id }}
                        replace
                        resetScroll={false}
                        aria-current={on}
                        className={`relative flex flex-col items-center rounded-2xl border-2 px-2 pb-2.5 pt-3 text-center transition ${
                          on
                            ? "border-[var(--night)] bg-[var(--mint)]"
                            : "border-[var(--ink)]/15 bg-white hover:border-[var(--night)]/50"
                        }`}
                      >
                        {combo && saving > 0 && (
                          <span className="absolute -top-2.5 rounded-full bg-[var(--night)] px-2 py-0.5 text-[10.5px] font-bold text-white">
                            Economize {brl(saving)}
                          </span>
                        )}
                        <span className="text-[13px] font-bold leading-tight text-[var(--night)]">
                          {g.groupLabel}
                        </span>
                        <span className="mt-1 text-[14px] font-extrabold text-[var(--night)]">
                          {brl(g.price)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {p.estampa && (
              <div className="mt-6">
                <div className="mb-2.5 text-[14px] font-bold text-[var(--night)]">
                  Estampa<span className="font-normal text-[var(--ink)]/70">: {p.estampa}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                  {bundlesByCategory(p.category).map((b) => (
                    <Link
                      key={b.id}
                      to="/produto"
                      search={{ plano: b.id }}
                      aria-label={b.estampa}
                      title={b.estampa}
                      className={`overflow-hidden rounded-xl border-2 bg-[var(--tile)] transition ${
                        b.id === p.id
                          ? "border-[var(--night)]"
                          : "border-transparent hover:border-[var(--ink)]/25"
                      }`}
                    >
                      <img
                        src={b.img}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {p.options.length > 0 && (
              <div
                ref={optionsRef}
                className={`mt-6 space-y-5 rounded-2xl transition ${nudge ? "bg-[var(--sale)]/5 p-4 ring-2 ring-[var(--sale)]/40" : ""}`}
              >
                {p.options.map((o, i) => {
                  // Combo casal: opções "... dela"/"... dele" agrupadas sob um título por pessoa.
                  const quem = / (dela|dele)$/.exec(o.name)?.[1];
                  const prev =
                    i > 0 ? / (dela|dele)$/.exec(p.options[i - 1]!.name)?.[1] : undefined;
                  return (
                    <div key={o.name}>
                      {quem && quem !== prev && (
                        <div
                          className={`mb-3 border-b border-[var(--border)] pb-1.5 text-[15px] font-extrabold text-[var(--night)] ${i > 0 ? "pt-3" : ""}`}
                        >
                          {quem === "dela" ? "Conjunto dela" : "Conjunto dele"}
                        </div>
                      )}
                      <div className="mb-2.5 text-[14px] font-bold text-[var(--night)]">
                        {quem ? o.name.replace(/ (dela|dele)$/, "") : o.name}
                        {sel[o.name] && (
                          <span className="font-normal text-[var(--ink)]/70">: {sel[o.name]}</span>
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
                              className={`inline-flex h-11 min-w-12 items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition ${
                                on
                                  ? "border-[var(--night)] bg-[var(--night)] text-white"
                                  : "border-[var(--ink)]/20 bg-white text-[var(--night)] hover:border-[var(--night)]"
                              }`}
                            >
                              <Swatch value={v} />
                              {v}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
              className={`mt-7 hidden w-full rounded-full py-4 text-[14px] font-extrabold uppercase tracking-[0.08em] text-white transition md:block ${
                complete
                  ? "bg-[var(--night)] hover:opacity-90"
                  : "bg-[var(--night)]/75 hover:bg-[var(--night)]"
              }`}
            >
              {buyLabel}
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-[var(--ink)]/65 md:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[var(--night)]" /> Envio rastreado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[var(--night)]" /> Pagamento seguro
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-[var(--night)]" /> Troca fácil
              </span>
            </div>

            <div className="mt-7 border-t border-[var(--border)]">
              {info.map((it, i) => (
                <details
                  key={it.title}
                  open={i === 0}
                  className="group border-b border-[var(--border)] py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-[var(--night)] [&::-webkit-details-marker]:hidden">
                    {it.title}
                    <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 text-[14px] leading-relaxed text-[var(--ink)]/70">
                    {it.body}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="mb-5 text-center text-[22px] font-bold text-[var(--night)] md:text-[28px]">
            Complete o visual
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
            <div className="text-[18px] font-extrabold text-[var(--night)]">{brl(p.price)}</div>
            {p.compareAtPrice && (
              <s className="text-[12px] text-[var(--ink)]/45">{brl(p.compareAtPrice)}</s>
            )}
          </div>
          <button
            type="button"
            onClick={buy}
            className={`flex-1 rounded-full py-3.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white ${
              complete ? "bg-[var(--night)]" : "bg-[var(--night)]/75"
            }`}
          >
            {complete ? "Comprar agora" : buyLabel}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
