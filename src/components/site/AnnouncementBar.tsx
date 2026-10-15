import { useEffect, useState } from "react";
import { FREE_SHIPPING_MIN } from "@/lib/bundles";

const messages = [
  `Frete grátis em compras acima de R$ ${FREE_SHIPPING_MIN}`,
  "Snuggy Dragão — o mais vendido da loja",
  "Pix com desconto · Cartão em até 12x",
  "Envio para todo o Brasil com rastreio",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="bg-[var(--primary)] text-white"
      role="region"
      aria-label="Anúncio da loja"
      aria-live="polite"
    >
      <p
        key={index}
        className="container-edge truncate py-1.5 text-center text-[9px] font-bold uppercase leading-none tracking-[0.11em] md:py-2 md:text-xs md:tracking-[0.18em] animate-in fade-in duration-500"
        title={messages[index]}
      >
        {messages[index]}
      </p>
    </div>
  );
}
