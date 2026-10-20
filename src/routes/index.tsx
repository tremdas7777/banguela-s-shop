import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Shelf } from "@/components/shop/Shelf";
import { brand } from "@/lib/brand";
import { FAQ } from "@/lib/faq";
import { bundlesByCategory, categories, getBundle, type BundleId } from "@/lib/bundles";
import { titulo, type MaisVendidos } from "@/lib/mais-vendidos";
import { getMaisVendidos } from "@/lib/mais-vendidos.functions";

// Sem head() aqui: a home herda título/descrição/og do __root.tsx.
export const Route = createFileRoute("/")({
  loader: () => getMaisVendidos(),
  component: Home,
});

const img = (f: string) => `/produtos/${f}`;

/**
 * Banners do topo: imagens prontas em /public/banners (versão celular 1080×1350 e PC 1920×720).
 * Para trocar um banner, substitua os arquivos mantendo os mesmos tamanhos.
 */
type Banner = {
  key: string;
  alt: string;
  mobile: string;
  desktop: string;
  link: (children: ReactNode) => ReactNode;
};

const linkClass = "block h-full w-full";

const BANNERS: Banner[] = [
  {
    key: "kigurumi",
    alt: "Pijamas Kigurumi Stitch, Angel, Banguela e Fúria da Luz: 2 por R$ 79 ou 4 por R$ 129 com ursinho de brinde",
    mobile: "/banners/kigurumi-m.webp",
    desktop: "/banners/kigurumi-d.webp",
    link: (c) => (
      <Link to="/colecao/$id" params={{ id: "kigurumi" }} className={linkClass}>
        {c}
      </Link>
    ),
  },
  {
    key: "conforto",
    alt: "Coleção Fúria da Noite: Snuggy, pijamas e pantufas de dragão",
    mobile: "/banners/conforto-m.webp",
    desktop: "/banners/conforto-d.webp",
    link: (c) => (
      <Link to="/colecao/$id" params={{ id: "conforto" }} className={linkClass}>
        {c}
      </Link>
    ),
  },
  {
    key: "pantufas",
    alt: "Pantufas de pelúcia Banguela, Fúria da Luz, Stitch e Angel: 2 pares por R$ 49,90 ou 4 por R$ 79,90",
    mobile: "/banners/pantufas2-m.webp",
    desktop: "/banners/pantufas2-d.webp",
    link: (c) => (
      <Link to="/produto" search={{ plano: "pantufa2" }} className={linkClass}>
        {c}
      </Link>
    ),
  },
  {
    key: "joias",
    alt: "Joias para casais: anéis em prata 925 e colares que se encaixam",
    mobile: "/banners/joias-m.webp",
    desktop: "/banners/joias-d.webp",
    link: (c) => (
      <Link to="/colecao/$id" params={{ id: "joias" }} className={linkClass}>
        {c}
      </Link>
    ),
  },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const n = (i + BANNERS.length) % BANNERS.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const el = ref.current;
      if (!el || touched.current || document.hidden) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: ((i + 1) % BANNERS.length) * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const arrow =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--night)] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] transition hover:bg-white md:grid";

  return (
    <section aria-label="Destaques" className="relative">
      <h1 className="sr-only">{brand.name}: produtos de dragão</h1>
      <div
        ref={ref}
        onScroll={(e) =>
          setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
        onPointerDown={() => (touched.current = true)}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BANNERS.map((b, i) => (
          <div
            key={b.key}
            className="aspect-[4/5] w-full shrink-0 snap-start md:aspect-[8/3]"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${BANNERS.length}`}
          >
            {b.link(
              <picture>
                <source media="(min-width: 768px)" srcSet={b.desktop} />
                <img
                  src={b.mobile}
                  alt={b.alt}
                  fetchPriority={i === 0 ? "high" : undefined}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
              </picture>,
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Banner anterior"
        onClick={() => {
          touched.current = true;
          goTo(active - 1);
        }}
        className={`${arrow} left-5`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Próximo banner"
        onClick={() => {
          touched.current = true;
          goTo(active + 1);
        }}
        className={`${arrow} right-5`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {BANNERS.map((b, i) => (
          <button
            key={b.key}
            type="button"
            aria-label={`Ir para o banner ${i + 1}`}
            aria-current={active === i}
            onClick={() => {
              touched.current = true;
              goTo(i);
            }}
            className={`h-1.5 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-all ${
              active === i ? "w-5 bg-white" : "w-1.5 bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/** Título de seção alinhado à esquerda, com "Ver tudo" opcional à direita. */
function SectionHead({ title, more }: { title: string; more?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-[22px] font-bold text-[var(--night)] md:text-[26px]">{title}</h2>
      {more}
    </div>
  );
}

const moreLink =
  "inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--night)] hover:text-[var(--primary)]";

/** "Mais vendidos": pedidos da loja (pagos e pendentes), com os kigurumis na frente. */
function MaisVendidosShelf({ m }: { m: MaisVendidos }) {
  return (
    <section className="container-edge pt-8 md:pt-12">
      <SectionHead
        title={titulo(m)}
        more={
          <Link to="/colecao/$id" params={{ id: "mais-vendidos" }} className={moreLink}>
            Ver tudo <ChevronRight className="h-4 w-4" />
          </Link>
        }
      />
      <Shelf label={titulo(m)}>
        {m.ids.map((id) => (
          <ProductCard key={id} p={getBundle(id)} />
        ))}
      </Shelf>
    </section>
  );
}

/** "Explore por coleção": uma prateleira por coleção, produtos deslizando para o lado. */
function Shelves() {
  return (
    <section id="produtos" className="container-edge scroll-mt-32 pt-8 md:pt-12">
      <p className="mb-6 text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/45">
        Explore por coleção
      </p>
      <div className="space-y-10 md:space-y-12">
        {categories.map((c) => (
          <div key={c.id} id={`cat-${c.id}`} className="scroll-mt-32">
            <SectionHead
              title={c.name}
              more={
                <Link to="/colecao/$id" params={{ id: c.id }} className={moreLink}>
                  Ver tudo <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
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

/** collection: abre a página da coleção em vez de um produto. */
const TYPES: { id: BundleId; label: string; img: string; collection?: string }[] = [
  { id: "kgban2", label: "Kigurumi", img: img("kg-grupo.jpg"), collection: "kigurumi" },
  { id: "mdpreto", label: "Sleepo", img: img("md-preto.jpg"), collection: "moletons" },
  { id: "pijama", label: "Pijamas", img: img("p1_branco.jpg"), collection: "pijamas" },
  { id: "bq15", label: "Brinquedos", img: img("bq15-1.jpg"), collection: "brinquedos" },
  { id: "snuggy", label: "Snuggy", img: img("p2_snuggy.jpg") },
  { id: "pantufa2", label: "Pantufas", img: img("pantufa-furia.jpg"), collection: "pantufas" },
  { id: "aneis", label: "Anéis", img: img("p5_aneis.jpg") },
  { id: "colares", label: "Colares", img: img("p6_colares.jpg") },
  { id: "carro", label: "Para o carro", img: img("p4_carro.jpg") },
];

/** "Compre por categoria": fotos arredondadas com o nome num selo. */
function Categories() {
  return (
    <section id="colecoes" className="container-edge scroll-mt-32 pt-12 md:pt-14">
      <SectionHead title="Compre por categoria" />
      <Shelf label="Categorias" itemClassName="w-[38%] sm:w-[27%] md:w-[calc((100%-5rem)/6)]">
        {TYPES.map((t) =>
          t.collection ? (
            <Link
              key={t.id}
              to="/colecao/$id"
              params={{ id: t.collection }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-[var(--tile)]"
            >
              <img
                src={t.img}
                alt={t.label}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-2 bottom-3 flex justify-center">
                <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-[var(--night)] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]">
                  {t.label}
                </span>
              </span>
            </Link>
          ) : (
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
                <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-[var(--night)] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]">
                  {t.label}
                </span>
              </span>
            </Link>
          ),
        )}
      </Shelf>
    </section>
  );
}

/** Dois banners em imagem no meio da página (1200×900, em /public/banners). */
function PromoBanners() {
  const tile = "block overflow-hidden rounded-[20px] transition hover:opacity-95";
  return (
    <section className="container-edge grid gap-3 pt-12 md:grid-cols-2 md:gap-5 md:pt-14">
      <Link to="/produto" search={{ plano: "snuggy" }} className={tile}>
        <img
          src="/banners/snuggy.webp"
          alt="Snuggy Dragão: cobertor que veste, com capuz, mangas largas e tamanho infantil"
          loading="lazy"
          width={1200}
          height={900}
          className="h-auto w-full"
        />
      </Link>
      <Link to="/produto" search={{ plano: "carro" }} className={tile}>
        <img
          src="/banners/carro.webp"
          alt="Dragão de Carro: mascote de pelúcia para carro e moto"
          loading="lazy"
          width={1200}
          height={900}
          className="h-auto w-full"
        />
      </Link>
    </section>
  );
}

function About() {
  return (
    <section className="container-edge pt-14 md:pt-16">
      <div className="rounded-[20px] bg-[var(--mint)] px-6 py-8 md:flex md:items-center md:justify-between md:gap-10 md:px-10">
        <div className="max-w-2xl">
          <h2 className="text-[20px] font-bold text-[var(--night)] md:text-[24px]">
            Sobre a {brand.name}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink)]/70">
            Loja online de produtos de dragão: calças de pijama, Snuggy, pantufas, joias e mascotes
            para carro. Enviamos para todo o Brasil com código de rastreio.
          </p>
        </div>
        <Link
          to="/sobre"
          className="mt-5 inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--night)] px-6 py-3 text-[13px] font-bold text-white transition hover:opacity-90 md:mt-0"
        >
          Conheça a loja
        </Link>
      </div>
    </section>
  );
}

function FaqPreview() {
  return (
    <section className="container-edge pb-16 pt-14 md:pb-20 md:pt-16">
      <SectionHead
        title="Dúvidas frequentes"
        more={
          <Link to="/faq" className={moreLink}>
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="border-t border-[var(--border)]">
        {FAQ.slice(0, 4).map((f) => (
          <details key={f.q} className="group border-b border-[var(--border)] py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[var(--night)] [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink)]/70">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const maisVendidos = Route.useLoaderData();
  return (
    <SiteLayout>
      <Hero />
      <MaisVendidosShelf m={maisVendidos} />
      <Shelves />
      <Categories />
      <PromoBanners />
      <About />
      <FaqPreview />
    </SiteLayout>
  );
}
