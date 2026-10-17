import { BeforeAfter } from "@/components/shop/BeforeAfter";

const VIDEOS = [
  {
    src: "/pijama/casal.mp4",
    poster: "/pijama/casal.jpg",
    title: "Pra usar junto com quem você ama",
    text: "Calça branca com os dragõezinhos ou cinza com o Banguela. Cada um escolhe a sua cor e o seu tamanho, e o casal fica combinando.",
  },
  {
    src: "/pijama/tecido.mp4",
    poster: "/pijama/tecido.jpg",
    title: "Macia de dar vontade de passar a mão",
    text: "Tecido felpudo e macio, estampa do Banguela bem nítida e cós com elástico que não aperta, nem pra dormir nem pro sofá.",
  },
];

/** Vídeos curtos em loop (no lugar de GIF) e o comparador das cores, só nas calças de pijama. */
export function PijamaDestaques() {
  return (
    <section className="mt-14 space-y-10 md:space-y-14">
      {VIDEOS.map((v, i) => (
        <div key={v.src} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
          <video
            src={v.src}
            poster={v.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={v.title}
            className={`mx-auto aspect-square w-full max-w-md rounded-[20px] bg-[var(--tile)] object-cover ${i % 2 ? "md:order-2" : ""}`}
          />
          <div className="text-center md:text-left">
            <h2 className="text-[22px] font-bold text-[var(--night)] md:text-[28px]">{v.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]/75">{v.text}</p>
          </div>
        </div>
      ))}

      <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="mx-auto w-full max-w-md">
          <BeforeAfter
            left={{
              src: "/pijama/compara-branca.jpg",
              label: "Branca",
              alt: "Felpa da calça branca com os dragõezinhos",
            }}
            right={{
              src: "/pijama/compara-cinza.jpg",
              label: "Cinza",
              alt: "Felpa da calça cinza com o Banguela",
            }}
          />
        </div>
        <div className="text-center md:order-first md:text-left">
          <h2 className="text-[22px] font-bold text-[var(--night)] md:text-[28px]">
            Branca ou cinza?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]/75">
            Arraste a barra pra comparar as duas estampas de pertinho. A mesma felpa, a mesma
            modelagem; só muda o dragão.
          </p>
        </div>
      </div>
    </section>
  );
}
