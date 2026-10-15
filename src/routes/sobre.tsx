import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre a ${brand.name}` },
      {
        name: "description",
        content: `A ${brand.name} reúne produtos de dragão para vestir, presentear e decorar.`,
      },
      { property: "og:title", content: `Sobre a ${brand.name}` },
      {
        property: "og:description",
        content: "Produtos de dragão escolhidos a dedo, com troca fácil e atendimento humano.",
      },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: Page,
});

const VALUES = [
  [
    "Curadoria",
    "Cada produto é escolhido a dedo pensando em conforto, qualidade e no detalhe que faz os olhos brilharem.",
  ],
  ["Troca fácil", "Errou o tamanho? Pijamas, Snuggy e pantufas podem ser trocados em até 30 dias."],
  ["Envio rastreado", "Pedidos despachados em até 1 dia útil, com código de rastreio por e-mail."],
  ["Atendimento", "Gente de verdade do outro lado, para resolver o que você precisar."],
] as const;

function Page() {
  return (
    <SiteLayout>
      <section className="container-edge grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
        <div>
          <span className="eyebrow text-[var(--ink)]/50">Sobre</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl text-balance">
            Feita para quem ama dragões
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--ink)]/65">
            A {brand.name} nasceu de uma ideia simples: transformar o fascínio por dragões em coisas
            que você usa de verdade — do pijama de domingo ao mascote no para-brisa.
          </p>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-[var(--ink)]/65">
            Cada pedido é conferido antes de sair e chega com rastreio. Se não amar, a gente
            resolve.
          </p>
        </div>
        <img
          src="/produtos/p1_casal.jpg"
          alt="Casal com pijamas de dragão"
          className="aspect-[4/5] max-h-[520px] w-full rounded-3xl border border-[var(--border)] object-cover"
        />
      </section>
      <section className="border-t border-[var(--border)] bg-white">
        <div className="container-edge grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([t, d]) => (
            <div key={t} className="border-l-[3px] border-[var(--primary)] pl-4">
              <h2 className="font-display text-xl font-bold">{t}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/65">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
