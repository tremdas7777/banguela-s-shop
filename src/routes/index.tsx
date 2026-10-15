import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, CreditCard, Lock, RefreshCw, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
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
  type BundleId,
} from "@/lib/bundles";

// Sem head() aqui: a home herda título/descrição/og do __root.tsx.
export const Route = createFileRoute("/")({
  component: Home,
});

const MAX_OFF = Math.max(...availableBundles.map(discountPct));
const img = (f: string) => `/produtos/${f}`;

const pillCta =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] transition hover:opacity-90";

/** Título de seção centralizado, no estilo das vitrines de moda. */
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 text-center md:mb-8">
      <h2 className="text-[24px] font-bold leading-tight text-[var(--night)] md:text-[30px]">
        {title}
      </h2>
      {sub && <p className="mt-1.5 text-[14px] text-[var(--ink)]/60 md:text-[15px]">{sub}</p>}
    </div>
  );
}

/** Três fotos arredondadas sobrepostas, usadas dentro dos banners. */
function Collage({
  imgs,
  priority,
}: {
  imgs: readonly [string, string, string];
  priority?: boolean;
}) {
  const [a, b, c] = imgs;
  return (
    <div className="relative mx-auto h-[250px] w-full max-w-[330px] md:h-[400px] md:max-w-[470px]">
      <img
        src={a}
        alt=""
        fetchPriority={priority ? "high" : undefined}
        className="absolute left-0 top-0 h-[90%] w-[58%] rounded-[26px] object-cover shadow-[0_20px_40px_-24px_rgba(10,30,18,0.55)]"
      />
      <img
        src={b}
        alt=""
        className="absolute right-0 top-[4%] h-[46%] w-[40%] rounded-[20px] object-cover ring-4 ring-white"
      />
      <img
        src={c}
        alt=""
        className="absolute bottom-0 right-[5%] h-[46%] w-[40%] rounded-[20px] object-cover ring-4 ring-white"
      />
    </div>
  );
}

/** Olho de dragão desenhado (banner sem foto de produto). */
function DragonEye() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto w-[78%] max-w-[380px]" aria-hidden>
      <path
        d="M6 40 C34 8 86 8 114 40 C86 72 34 72 6 40 Z"
        fill="rgba(142,230,160,.08)"
        stroke="rgba(174,247,189,.6)"
        strokeWidth="2.2"
      />
      <ellipse cx="60" cy="40" rx="21" ry="21" fill="#7ee08f" opacity=".9" />
      <ellipse cx="60" cy="40" rx="21" ry="21" fill="url(#bshop-iris)" />
      <path d="M60 18 C51 30 51 50 60 62 C69 50 69 30 60 18 Z" fill="#0a1f13" />
      <circle cx="53" cy="32" r="3.4" fill="#eafff0" opacity=".85" />
      <defs>
        <radialGradient id="bshop-iris">
          <stop offset="0.45" stopColor="rgba(10,40,20,0)" />
          <stop offset="1" stopColor="rgba(10,40,20,.55)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

type Slide = {
  key: string;
  bg: string;
  dark?: boolean;
  pill: string;
  title: ReactNode;
  text: string;
  cta: { label: string; to: "/colecao/$id"; id: string } | { label: string; href: string };
  art: ReactNode;
};

const SLIDES: Slide[] = [
  {
    key: "conforto",
    bg: "bg-[var(--mint)]",
    pill: "Coleção Fúria da Noite",
    title: "Conforto de dragão para os dias frios",
    text: "Pijamas, pantufas e o Snuggy: macios, quentinhos e com a carinha do seu dragão favorito.",
    cta: { label: "Explore a coleção", to: "/colecao/$id", id: "conforto" },
    art: (
      <Collage
        priority
        imgs={[img("p2_snuggy.jpg"), img("p3_pantufas.jpg"), img("p1_casal.jpg")]}
      />
    ),
  },
  {
    key: "oferta",
    bg: "bg-[radial-gradient(120%_120%_at_80%_20%,#1f6b3c_0%,#123a24_45%,#0b2216_100%)]",
    dark: true,
    pill: "Oferta da coleção",
    title: (
      <>
        Até <span className="text-[#9ff0b0]">{MAX_OFF}% OFF</span> na Coleção Dragão
      </>
    ),
    text: `Frete grátis acima de R$ ${FREE_SHIPPING_MIN}, Pix com desconto e até 12x no cartão.`,
    cta: { label: "Ver ofertas", href: "#produtos" },
    art: <DragonEye />,
  },
  {
    key: "joias",
    bg: "bg-[#f4eee6]",
    pill: "Para presentear",
    title: "Joias para casais que voam juntos",
    text: "Anéis em prata 925 e colares que se encaixam, com caixa de presente.",
    cta: { label: "Ver joias", to: "/colecao/$id", id: "joias" },
    art: <Collage imgs={[img("p6b.jpg"), img("p5_aneis.jpg"), img("p5c.jpg")]} />,
  },
];

/** Banner principal: slides que passam sozinhos e deslizam com o dedo. */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const el = ref.current;
      if (!el || touched.current || document.hidden) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: ((i + 1) % SLIDES.length) * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-label="Destaques" className="relative">
      <h1 className="sr-only">{brand.name} — produtos de dragão</h1>
      <div
        ref={ref}
        onScroll={(e) =>
          setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
        onPointerDown={() => (touched.current = true)}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s, i) => (
          <div
            key={s.key}
            className={`w-full shrink-0 snap-start ${s.bg}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}`}
          >
            <div className="container-edge grid h-full items-center gap-7 pb-12 pt-8 md:grid-cols-2 md:gap-10 md:py-14">
              <div className={`text-center md:text-left ${s.dark ? "text-white" : ""}`}>
                <span
                  className={`inline-block rounded-full px-4 py-1.5 text-[12px] font-bold ${
                    s.dark ? "bg-white/12 text-[#c9f5d3]" : "bg-white text-[var(--night)]"
                  }`}
                >
                  {s.pill}
                </span>
                <h2
                  className={`mx-auto mt-4 max-w-[17ch] text-[30px] font-extrabold leading-[1.1] md:mx-0 md:text-[48px] ${
                    s.dark ? "" : "text-[var(--night)]"
                  }`}
                >
                  {s.title}
                </h2>
                <p
                  className={`mx-auto mt-3 max-w-md text-[15px] leading-relaxed md:mx-0 md:text-[17px] ${
                    s.dark ? "text-white/75" : "text-[var(--ink)]/70"
                  }`}
                >
                  {s.text}
                </p>
                {"to" in s.cta ? (
                  <Link
                    to={s.cta.to}
                    params={{ id: s.cta.id }}
                    className={`${pillCta} mt-6 bg-[var(--night)] text-white`}
                  >
                    {s.cta.label}
                  </Link>
                ) : (
                  <a
                    href={s.cta.href}
                    className={`${pillCta} mt-6 ${
                      s.dark ? "bg-white text-[var(--night)]" : "bg-[var(--night)] text-white"
                    }`}
                  >
                    {s.cta.label}
                  </a>
                )}
              </div>
              {s.art}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`Ir para o banner ${i + 1}`}
            aria-current={active === i}
            onClick={() => {
              touched.current = true;
              goTo(i);
            }}
            className={`h-2 rounded-full transition-all ${
              active === i
                ? `w-6 ${SLIDES[active]?.dark ? "bg-white" : "bg-[var(--night)]"}`
                : `w-2 ${SLIDES[active]?.dark ? "bg-white/40" : "bg-[var(--night)]/25"}`
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { Icon: Truck, title: "Frete grátis", sub: `Acima de R$ ${FREE_SHIPPING_MIN}` },
    { Icon: CreditCard, title: "Até 12x", sub: "no cartão ou Pix" },
    { Icon: RefreshCw, title: "Trocas", sub: "de tamanho em 30 dias" },
    { Icon: Lock, title: "Compra segura", sub: "dados protegidos" },
  ] as const;
  return (
    <div className="container-edge grid grid-cols-2 gap-x-3 gap-y-4 border-b border-[var(--border)] py-6 md:grid-cols-4">
      {items.map(({ Icon, title, sub }) => (
        <div key={title} className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--mint)] text-[var(--night)]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <span className="leading-tight">
            <b className="block text-[13.5px] text-[var(--night)]">{title}</b>
            <span className="text-[12.5px] text-[var(--ink)]/60">{sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** "Explore por coleção": uma prateleira por coleção, produtos deslizando para o lado. */
function Shelves() {
  return (
    <section id="produtos" className="container-edge scroll-mt-32 pt-10 md:pt-14">
      <SectionTitle
        title="Explore por coleção"
        sub="Deslize para o lado para ver todos os produtos."
      />
      <div className="space-y-10 md:space-y-14">
        {categories.map((c) => (
          <div key={c.id} id={`cat-${c.id}`} className="scroll-mt-32">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-[20px] font-bold text-[var(--night)] md:text-[24px]">{c.name}</h3>
              <Link
                to="/colecao/$id"
                params={{ id: c.id }}
                className="inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--night)] hover:text-[var(--primary)]"
              >
                Ver tudo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Shelf label={c.name}>
              {bundlesByCategory(c.id).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </Shelf>
          </div>
        ))}
      </div>
    </section>
  );
}

const TYPES: { id: BundleId; label: string; img: string }[] = [
  { id: "pijama", label: "Pijamas", img: img("p1_branco.jpg") },
  { id: "snuggy", label: "Snuggy", img: img("p2_snuggy.jpg") },
  { id: "pantufa", label: "Pantufas", img: img("p3b.jpg") },
  { id: "aneis", label: "Anéis", img: img("p5_aneis.jpg") },
  { id: "colares", label: "Colares", img: img("p6_colares.jpg") },
  { id: "carro", label: "Para o carro", img: img("p4_carro.jpg") },
];

/** "Compre por categoria": fotos arredondadas com o nome num selo. */
function Categories() {
  return (
    <section id="colecoes" className="container-edge scroll-mt-32 pt-12 md:pt-16">
      <SectionTitle title="Compre por categoria" />
      <Shelf label="Categorias" itemClassName="w-[38%] sm:w-[27%] md:w-[calc((100%-5rem)/6)]">
        {TYPES.map((t) => (
          <Link
            key={t.id}
            to="/produto"
            search={{ plano: t.id }}
            className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-[var(--tile)]"
          >
            <img
              src={t.img}
              alt={t.label}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-x-2 bottom-3 flex justify-center">
              <span className="rounded-full bg-[var(--mint)] px-4 py-1.5 text-[13px] font-bold text-[var(--night)] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]">
                {t.label}
              </span>
            </span>
          </Link>
        ))}
      </Shelf>
    </section>
  );
}

const LOOKS: { id: BundleId; img: string }[] = [
  { id: "pijama", img: img("p1_casal.jpg") },
  { id: "snuggy", img: img("p2c.jpg") },
  { id: "pantufa", img: img("p3_pantufas.jpg") },
  { id: "carro", img: img("p4_carro.jpg") },
  { id: "aneis", img: img("p5c.jpg") },
  { id: "pijama", img: img("p1_preto.jpg") },
];

/** Faixa em menta com fotos verticais e o produto de cada uma. */
function Lookbook() {
  return (
    <section className="mt-12 bg-[var(--mint)] py-10 md:mt-16 md:py-14">
      <div className="container-edge">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="text-[22px] font-extrabold uppercase tracking-[0.04em] text-[var(--night)] md:text-[28px]">
            Vista o dragão
          </h2>
          <p className="mt-1 text-[14px] text-[var(--ink)]/65">
            Do sofá ao para-brisa: como fica no dia a dia.
          </p>
        </div>
        <Shelf label="Looks" itemClassName="w-[46%] sm:w-[30%] md:w-[calc((100%-5rem)/6)]">
          {LOOKS.map((l, i) => {
            const p = getBundle(l.id);
            return (
              <Link key={i} to="/produto" search={{ plano: p.id }} className="group block">
                <div className="aspect-[3/4.4] overflow-hidden rounded-[20px] bg-white">
                  <img
                    src={l.img}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white p-1.5 pr-3">
                  <img
                    src={p.img}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-xl object-cover"
                  />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12px] font-semibold">{p.name}</span>
                    <span className="text-[12px] font-bold text-[var(--night)]">
                      {brl(p.price)}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </Shelf>
      </div>
    </section>
  );
}

/** Dois banners grandes com selo, para o mais vendido e os presentes. */
function Spotlights() {
  const snuggy = getBundle("snuggy");
  const tiles = [
    {
      key: "snuggy",
      label: "Mais vendido",
      sub: `${snuggy.name} · ${brl(snuggy.price)}`,
      img: img("p2b.jpg"),
      link: (
        <Link
          to="/produto"
          search={{ plano: "snuggy" }}
          className="absolute inset-0"
          aria-label={snuggy.name}
        />
      ),
    },
    {
      key: "joias",
      label: "Para presentear",
      sub: "Anéis e colares para casais",
      img: img("p6b.jpg"),
      link: (
        <Link
          to="/colecao/$id"
          params={{ id: "joias" }}
          className="absolute inset-0"
          aria-label="Joias de Dragão"
        />
      ),
    },
  ];
  return (
    <section className="container-edge grid gap-4 pt-12 md:grid-cols-2 md:gap-5 md:pt-16">
      {tiles.map((t) => (
        <div
          key={t.key}
          className="group relative aspect-[5/4] overflow-hidden rounded-[24px] bg-[var(--tile)]"
        >
          <img
            src={t.img}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-1.5">
            <span className="rounded-full bg-[var(--mint)] px-6 py-2 text-[15px] font-bold text-[var(--night)] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.4)]">
              {t.label}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[var(--ink)]">
              {t.sub}
            </span>
          </div>
          {t.link}
        </div>
      ))}
    </section>
  );
}

function About() {
  return (
    <section className="container-edge pt-14 text-center md:pt-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-[24px] font-bold leading-tight text-[var(--night)] md:text-[30px]">
          Feita para quem ama dragões
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]/70 md:text-[16px]">
          A {brand.name} nasceu de uma ideia simples: transformar o fascínio por dragões em coisas
          que você usa de verdade, do pijama de domingo ao mascote no para-brisa. Cada produto é
          escolhido pensando em conforto, qualidade e naquele detalhe que faz os olhos brilharem.
        </p>
        <Link to="/sobre" className={`${pillCta} mt-6 bg-[var(--mint)] text-[var(--night)]`}>
          Conheça a loja
        </Link>
      </div>
    </section>
  );
}

function FaqPreview() {
  return (
    <section className="container-edge pb-16 pt-14 md:pb-24 md:pt-20">
      <SectionTitle title="Dúvidas frequentes" />
      <div className="mx-auto max-w-3xl border-t border-[var(--border)]">
        {FAQ.slice(0, 4).map((f) => (
          <details key={f.q} className="group border-b border-[var(--border)] py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[var(--night)] [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink)]/70">{f.a}</p>
          </details>
        ))}
        <div className="pt-6 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-0.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--night)]"
          >
            Ver todas as dúvidas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Benefits />
      <Shelves />
      <Categories />
      <Lookbook />
      <Spotlights />
      <About />
      <FaqPreview />
    </SiteLayout>
  );
}
