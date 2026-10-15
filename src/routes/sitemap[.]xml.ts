import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { availableBundles, categories } from "@/lib/bundles";

const BASE_URL = "";

const paths = [
  "/",
  ...categories.map((c) => `/colecao/${c.id}`),
  ...availableBundles.map((b) => `/produto?plano=${b.id}`),
  "/sobre",
  "/contato",
  "/faq",
  "/rastreio",
  "/politica-envio",
  "/politica-privacidade",
  "/politica-reembolso",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map(
            (p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
