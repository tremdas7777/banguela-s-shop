import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Mail,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { brand } from "@/lib/brand";
import { categories, FREE_SHIPPING_LABEL, FREE_SHIPPING_MIN } from "@/lib/bundles";
import { getSiteSettings } from "@/lib/site-settings.functions";

const productLinks = [
  ...categories.map((c) => ({ label: c.name, href: `/#cat-${c.id}` })),
  { label: "Mais vendido", href: "/produto?plano=snuggy" },
];

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Rastrear pedido", href: "/rastreio" },
  { label: "Contato", href: "/contato" },
  { label: "Sobre", href: "/sobre" },
];

const legalLinks = [
  { label: "Envio", href: "/politica-envio" },
  { label: "Privacidade", href: "/politica-privacidade" },
  { label: "Trocas e reembolso", href: "/politica-reembolso" },
];

const highlights = [
  { Icon: Truck, label: `Frete grátis acima de R$ ${FREE_SHIPPING_MIN}` },
  { Icon: CreditCard, label: "Até 12x no cartão" },
  { Icon: RefreshCw, label: "Troca em 30 dias" },
  { Icon: ShieldCheck, label: "SSL seguro" },
  { Icon: Package, label: "Envio rastreado" },
] as const;

function FooterLink({ item }: { item: { label: string; href: string } }) {
  return (
    <a
      href={item.href}
      className="text-sm text-white/65 hover:text-[var(--primary)] transition-colors"
    >
      {item.label}
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
        {title}
      </h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const fetchSettings = useServerFn(getSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
    staleTime: 60_000,
  });
  const whatsappEnabled = (settings?.whatsappEnabled ?? false) && !!brand.whatsapp.phoneE164;
  const whatsappHref = `https://wa.me/${brand.whatsapp.phoneE164}?text=${encodeURIComponent(
    `Olá! Quero tirar uma dúvida sobre um produto da ${brand.name}.`,
  )}`;

  return (
    <footer className="bg-[var(--ink)] text-white">
      <div className="border-b border-white/10 bg-[var(--primary-deep)]">
        <div className="container-edge py-6 md:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-display text-xl md:text-2xl leading-tight text-balance">
            {brand.tagline}.
          </p>
          <a
            href="/#produtos"
            className="inline-flex shrink-0 items-center justify-center bg-[var(--primary)] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] rounded-xl hover:opacity-90"
          >
            Ver produtos
          </a>
        </div>
      </div>

      <div className="container-edge py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6 lg:gap-8">
          <div className="col-span-2 md:col-span-4">
            <Link to="/" aria-label={`${brand.name} — início`} className="inline-block group">
              <span className="inline-flex items-center rounded-xl bg-white px-4 py-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] ring-1 ring-white/15 transition-transform group-hover:scale-[1.01]">
                <img
                  src={logo}
                  alt={brand.name}
                  className="h-8 w-auto max-w-[12rem] md:h-9 object-contain object-left"
                  loading="lazy"
                />
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60 leading-relaxed">
              {brand.manufacturerTagline}.
            </p>
            <a
              href={`mailto:${brand.email}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/75 hover:text-[var(--primary)]"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
              {brand.email}
            </a>
            {whatsappEnabled && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label={`Chamar no WhatsApp ${brand.whatsapp.display}`}
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                WhatsApp {brand.whatsapp.display}
              </a>
            )}
          </div>

          <div className="col-span-1 md:col-span-3">
            <FooterColumn title="Loja">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </FooterColumn>
          </div>

          <div className="col-span-1 md:col-span-2">
            <FooterColumn title="Suporte">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </FooterColumn>
          </div>

          <div className="col-span-2 md:col-span-3">
            <FooterColumn title="Legal">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </FooterColumn>
            <p className="mt-4 text-[10px] leading-relaxed text-white/35 md:max-w-xs">
              {FREE_SHIPPING_LABEL}.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2">
          {highlights.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[10px] text-white/50"
            >
              <Icon className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-edge py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>
            © {year} {brand.name} · CNPJ {brand.cnpj}
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to="/politica-privacidade" className="hover:text-[var(--primary)]">
              Privacidade
            </Link>
            <Link to="/politica-envio" className="hover:text-[var(--primary)]">
              Envio
            </Link>
            <Link to="/contato" className="hover:text-[var(--primary)]">
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
