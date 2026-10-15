import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, Gift } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { TrustStrip } from "@/components/site/TrustStrip";
import { ProductCard } from "@/components/shop/ProductCard";
import { Shelf } from "@/components/shop/Shelf";
import { brand } from "@/lib/brand";
import { FAQ } from "@/lib/faq";
import {
  availableBundles,
  brl,
  bundlesByCategory,
  categories,
  discountPct,
  FREE_SHIPPING_MIN,
  getBundle,
} from "@/lib/bundles";

// Sem head() aqui: a home herda título/descrição/og do __root.tsx.
export const Route = createFileRoute("/")({
  component: Home,
});

const MAX_OFF = Math.max(...availableBundles.map(discountPct));
const MOSAIC = ["snuggy", "pantufa", "pijama", "aneis"] as const;
const MARQUEE = [
  "Envio em até 24h",
  "Troca em 30 dias",
  "Pagamento seguro",
  `Frete grátis acima de R$ ${FREE_SHIPPING_MIN}`,
  "Pix ou cartão em até 12x",
];

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <span className="eyebrow text-[var(--ink)]/50">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl text-balance">
        {title}
      </h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]/60">{sub}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="container-edge grid items-center gap-10 py-10 md:grid-cols-2 md:py-16 lg:gap-16">
      <div className="text-center md:text-left">
        <span className="eyebrow text-[var(--ink)]/50">
          Coleção <span className="text-[var(--primary)]">Fúria da Noite</span>
        </span>
        <h1 className="mt-4 font-display text-[2.5rem] font-extrabold leading-[1.02] tracking-tight md:text-6xl text-balance">
          O seu lado dragão, em cada detalhe
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-[var(--ink)]/65 md:mx-0">
          Pijamas, pantufas, joias e mascotes selecionados para quem vive a lenda. Conforto e
          atitude, do sofá ao para-brisa.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <a
            href="#produtos"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            Ver produtos <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#colecoes"
            className="inline-flex items-center rounded-full border border-[var(--ink)]/15 bg-white px-7 py-3.5 text-sm font-bold transition hover:bg-[var(--muted)]"
          >
            Explorar categorias
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--ink)]/65 md:justify-start">
          {[
            `Frete grátis acima de R$ ${FREE_SHIPPING_MIN}`,
            "Troca em 30 dias",
            "Até 12x no cartão",
          ].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[var(--primary)]" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 md:max-w-none">
        {MOSAIC.map((id, i) => {
          const p = getBundle(id);
          return (
            <Link
              key={id}
              to="/produto"
              search={{ plano: id }}
              className={`group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_16px_34px_-22px_rgba(16,30,20,0.4)] ${i % 2 ? "translate-y-5" : ""}`}
            >
              <img
                src={p.img}
                alt={p.name}
                fetchPriority={i === 0 ? "high" : undefined}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="overflow-hidden border-y border-[var(--border)] bg-white py-3" aria-hidden>
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <span
            key={i}
            className="font-display text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/55"
          >
            {t} <span className="ml-8 text-[var(--primary)]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** "Explore por coleção": uma prateleira por coleção, produtos deslizando para o lado. */
function Shelves() {
  return (
    <section id="produtos" className="container-edge scroll-mt-32 py-12 md:py-16">
      <SectionHead
        eyebrow="A loja"
        title="Explore por coleção"
        sub="Deslize cada prateleira para o lado e toque num produto para escolher cor e tamanho."
      />
      <div className="space-y-12">
        {categories.map((c) => {
          const items = bundlesByCategory(c.id);
          return (
            <div key={c.id} id={`cat-${c.id}`} className="scroll-mt-32">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  {c.name}
                </h3>
                <span className="shrink-0 text-[13px] font-semibold text-[var(--ink)]/50">
                  {items.length} {items.length > 1 ? "produtos" : "produto"}
                </span>
              </div>
              <Shelf label={c.name}>
                {items.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </Shelf>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** "Compre por categoria": banners de atalho para cada prateleira. */
function Categories() {
  return (
    <section id="colecoes" className="container-edge scroll-mt-32 pb-12 md:pb-16">
      <SectionHead eyebrow="Coleções" title="Compre por categoria" />
      <Shelf label="Categorias" itemClassName="w-[78%] sm:w-[48%] md:w-[32%]">
        {categories.map((c) => {
          const n = bundlesByCategory(c.id).length;
          return (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="group relative flex min-h-[300px] items-end overflow-hidden rounded-2xl border border-[var(--border)]"
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/90" />
              <div className="relative p-6 text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b9f5c6]">
                  Coleção
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold">{c.name}</h3>
                <p className="mt-1 text-[14px] text-white/85">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold">
                  Ver {n} {n > 1 ? "produtos" : "produto"} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          );
        })}
      </Shelf>
    </section>
  );
}

/** Banner gráfico de campanha (sem foto de produto). */
function CampaignBanner() {
  return (
    <section className="container-edge pb-12 md:pb-16">
      <div className="relative flex min-h-[280px] items-center overflow-hidden rounded-3xl bg-[radial-gradient(130%_150%_at_86%_8%,#23ad48_0%,#12502f_46%,#0b2719_100%)] p-7 md:p-14">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <pattern id="bshop-scales" width="34" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M-17 20 Q0 3 17 20 M17 20 Q34 3 51 20"
                fill="none"
                stroke="rgba(255,255,255,.08)"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="600" height="300" fill="url(#bshop-scales)" />
        </svg>
        <svg
          className="absolute -right-6 top-1/2 w-[44%] max-w-[400px] -translate-y-1/2 opacity-25 md:opacity-60"
          viewBox="0 0 120 80"
          aria-hidden
        >
          <path
            d="M6 40 C34 10 86 10 114 40 C86 70 34 70 6 40 Z"
            fill="none"
            stroke="rgba(174,247,189,.55)"
            strokeWidth="2.5"
          />
          <ellipse cx="60" cy="40" rx="20" ry="20" fill="rgba(142,230,160,.22)" />
          <path d="M60 19 C51 30 51 50 60 61 C69 50 69 30 60 19 Z" fill="rgba(12,43,27,.55)" />
          <circle cx="60" cy="40" r="3.2" fill="#aef7bd" />
        </svg>
        <div className="relative max-w-xl text-white">
          <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8ee6a0]">
            Oferta da coleção
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.03] tracking-tight md:text-5xl">
            Até <span className="text-[#aef7bd]">{MAX_OFF}% OFF</span> na Coleção Dragão
          </h2>
          <p className="mt-3 max-w-md text-[15px] text-[#cfe6d6]">
            Frete grátis acima de R$ {FREE_SHIPPING_MIN} e Pix com desconto. Desperte o dragão que
            vive em você.
          </p>
          <a
            href="#produtos"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#0c2719] transition hover:bg-[#eafff0]"
          >
            Ver ofertas <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Banners de campanha com foto: pijamas e pantufas. */
function Promos() {
  const promos = [
    {
      id: "pijama",
      img: "/produtos/p1_casal.jpg",
      text: "Algodão felpudo e macio, do P ao XGG. Para hibernar com estilo.",
    },
    {
      id: "pantufa",
      img: "/produtos/p3_pantufas.jpg",
      text: "Solado antiderrapante e forro em pelúcia. Numeração do 36 ao 45.",
    },
  ] as const;
  return (
    <section className="container-edge pb-12 md:pb-16">
      <SectionHead eyebrow="Em destaque" title="Esquenta dragão" sub="Os queridinhos da estação." />
      <div className="grid gap-4 md:grid-cols-2">
        {promos.map(({ id, img, text }) => {
          const p = getBundle(id);
          return (
            <Link
              key={id}
              to="/produto"
              search={{ plano: id }}
              className="group relative flex min-h-[440px] items-end overflow-hidden rounded-3xl border border-[var(--border)]"
            >
              <img
                src={img}
                alt={p.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/45 to-black/90" />
              <div className="relative w-full p-6 text-white md:p-8">
                {discountPct(p) > 0 && (
                  <span className="rounded-md bg-[var(--sale)] px-2.5 py-1 font-display text-[13px] font-extrabold">
                    -{discountPct(p)}% OFF
                  </span>
                )}
                <h3 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1.5 max-w-sm text-[15px] text-white/85">{text}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold">
                    Comprar agora
                  </span>
                  <span className="font-display text-lg font-extrabold">
                    {brl(p.price)}{" "}
                    {p.compareAtPrice && (
                      <s className="ml-1 text-[14px] font-medium text-white/60">
                        {brl(p.compareAtPrice)}
                      </s>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function GiftSpotlight() {
  const p = getBundle("aneis");
  return (
    <section className="container-edge pb-12 md:pb-16">
      <div className="grid overflow-hidden rounded-3xl border border-[var(--border)] bg-white md:grid-cols-[0.9fr_1.1fr]">
        <img
          src="/produtos/p5b.jpg"
          alt={p.name}
          loading="lazy"
          className="h-72 w-full object-cover md:h-full"
        />
        <div className="flex flex-col justify-center p-7 md:p-12">
          <span className="eyebrow inline-flex items-center gap-2 text-[var(--ink)]/50">
            <Gift className="h-4 w-4 text-[var(--primary)]" /> Para presentear
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-4xl text-balance">
            Uma promessa que brilha no escuro
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--ink)]/65">
            O par de Anéis Promessa em prata 925, com ajuste livre e estojo de presente. Feito para
            casais que voam juntos.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              to="/produto"
              search={{ plano: p.id }}
              className="rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Ver produto
            </Link>
            <span className="font-display text-xl font-extrabold">
              {brl(p.price)}{" "}
              {p.compareAtPrice && (
                <s className="ml-1 text-[14px] font-medium text-[var(--ink)]/45">
                  {brl(p.compareAtPrice)}
                </s>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="container-edge grid items-center gap-10 pb-12 md:grid-cols-[0.85fr_1.15fr] md:pb-16 lg:gap-16">
      <img
        src="/produtos/p2c.jpg"
        alt="Snuggy Dragão"
        loading="lazy"
        className="aspect-[4/5] max-h-[480px] w-full rounded-3xl border border-[var(--border)] object-cover"
      />
      <div>
        <span className="eyebrow text-[var(--ink)]/50">Sobre a {brand.name}</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-4xl text-balance">
          Feita para quem ama dragões
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink)]/65">
          A {brand.name} nasceu de uma ideia simples: transformar o fascínio por dragões em coisas
          que você usa de verdade, do pijama de domingo ao mascote no para-brisa. Escolhemos cada
          produto pensando em conforto, qualidade e naquele detalhe que faz os olhos brilharem.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
          {[
            ["Curadoria", "Cada peça escolhida a dedo"],
            ["Troca fácil", "30 dias para trocar"],
            ["Atendimento", "Gente de verdade, sempre"],
          ].map(([t, s]) => (
            <div key={t} className="border-l-[3px] border-[var(--primary)] pl-3">
              <b className="block font-display text-[16px]">{t}</b>
              <span className="text-[13px] text-[var(--ink)]/60">{s}</span>
            </div>
          ))}
        </div>
        <Link
          to="/sobre"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)]"
        >
          Conheça a loja <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function FaqPreview() {
  return (
    <section className="container-edge pb-16 md:pb-24">
      <SectionHead eyebrow="Dúvidas" title="Perguntas frequentes" />
      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {FAQ.slice(0, 4).map((f) => (
          <details key={f.q} className="group px-5 py-4 md:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink)]/65">{f.a}</p>
          </details>
        ))}
      </div>
      <Link
        to="/faq"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)]"
      >
        Ver todas as perguntas <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Marquee />
      <div className="container-edge py-8">
        <TrustStrip />
      </div>
      <Shelves />
      <Categories />
      <CampaignBanner />
      <Promos />
      <GiftSpotlight />
      <About />
      <FaqPreview />
    </SiteLayout>
  );
}
