/**
 * Captcha Cloudflare Turnstile. Na maioria das pessoas não aparece nada (confere sozinho);
 * só mostra a caixinha quando desconfia. Cada token vale uma vez: depois de tentar pagar, `reset()`.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
  getResponse: (id?: string) => string | undefined;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile"));
    s.onerror = () => {
      loading = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type TurnstileHandle = {
  /** Token atual (espera até 8 s ficar pronto). Vazio se o captcha não carregou. */
  getToken: () => Promise<string>;
  reset: () => void;
};

export const Turnstile = forwardRef<TurnstileHandle, { siteKey: string }>(function Turnstile(
  { siteKey },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const token = useRef("");

  useEffect(() => {
    let alive = true;
    loadTurnstile()
      .then((ts) => {
        if (!alive || !box.current || widget.current) return;
        widget.current = ts.render(box.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          language: "pt-br",
          callback: (t: string) => (token.current = t),
          "expired-callback": () => (token.current = ""),
          "error-callback": () => (token.current = ""),
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      for (let i = 0; i < 40 && !token.current; i++) {
        await new Promise((r) => setTimeout(r, 200));
      }
      return token.current;
    },
    reset: () => {
      token.current = "";
      if (widget.current) window.turnstile?.reset(widget.current);
    },
  }));

  return <div ref={box} className="flex justify-center empty:hidden" />;
});
