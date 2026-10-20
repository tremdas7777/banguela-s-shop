import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { brand } from "@/lib/brand";
import { categories, findCollection, getBundle, type CollectionBanner } from "@/lib/bundles";
import { titulo, type MaisVendidos } from "@/lib/mais-vendidos";
import { getMaisVendidos } from "@/lib/mais-vendidos.functions";

/** "Mais vendidos" vem dos pedidos (servidor); as outras coleções saem do catálogo. */
const MAIS_VENDIDOS = "mais-vendidos";
const colecaoMaisVendidos = (m: MaisVendidos) => ({
  id: MAIS_VENDIDOS,
  name: titulo(m),
  desc: m.reais
    ? "Os produtos que os clientes da loja mais estão levando"
    : "Os produtos que a gente mais recomenda",
  img: getBundle(m.ids[0]).img,
  banner: undefined as CollectionBanner | undefined,
  items: m.ids.map((id) => getBundle(id)),
});

export const Route = createFileRoute("/colecao/$id")({
  loader: async ({ params }) => {
    if (params.id === MAIS_VENDIDOS)
      return { id: params.id, maisVendidos: await getMaisVendidos() };
    const c = findCollection(params.id);
    if (!c) throw notFound();
    return { id: c.id, maisVendidos: null };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.maisVendidos
      ? colecaoMaisVendidos(loaderData.maisVendidos)
      : loaderData
        ? findCollection(loaderData.id)
        : undefined;
    if (!c) return {};
    const title = `${c.name} | ${brand.name}`;
    return {
      meta: [
        { title },
        { name: "description", content: `${c.name}: ${c.desc}. Pix ou cartão em até 12x.` },
        { property: "og:title", content: title },
        { property: "og:image", content: c.img },
      ],
      links: [{ rel: "canonical", href: `/colecao/${c.id}` }],
    };
  },
  component: Page,
});

function Page() {
  const { id, maisVendidos } = Route.useLoaderData();
  const c = maisVendidos ? colecaoMaisVendidos(maisVendidos) : findCollection(id)!;
  const items = c.items;

  return (
    <SiteLayout>
      {c.banner && (
        <picture className="block">
          <source media="(min-width: 768px)" srcSet={c.banner.desktop} />
          <img
            src={c.banner.mobile}
            alt={c.banner.alt}
            fetchPriority="high"
            className="aspect-[3/2] w-full object-cover md:aspect-[8/3]"
          />
        </picture>
      )}
      <section className="bg-[var(--mint)]">
        <div className="container-edge py-8 text-center md:py-12">
          <nav
            aria-label="Navegação"
            className="mb-3 flex items-center justify-center gap-1 text-[13px] text-[var(--ink)]/55"
          >
            <Link to="/" className="hover:text-[var(--night)]">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Coleções</span>
          </nav>
          <h1 className="text-[28px] font-bold leading-tight text-[var(--night)] md:text-4xl">
            {c.name}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--ink)]/65">{c.desc}</p>
        </div>
      </section>

      <div className="container-edge py-8 md:py-12">
        <p className="mb-5 text-[13px] text-[var(--ink)]/55">
          {items.length} {items.length === 1 ? "produto" : "produtos"}
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-14 border-t border-[var(--border)] pt-8 text-center">
          <h2 className="text-[20px] font-bold text-[var(--night)]">Outras coleções</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories
              .filter((x) => x.id !== c.id)
              .map((x) => (
                <Link
                  key={x.id}
                  to="/colecao/$id"
                  params={{ id: x.id }}
                  className="rounded-full bg-[var(--mint)] px-5 py-2.5 text-[14px] font-semibold text-[var(--night)] transition hover:bg-[var(--mint-strong)]"
                >
                  {x.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
