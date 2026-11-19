/**
 * Proteção contra pedidos em massa: regras puras (sem banco), testadas em security.test.ts.
 * O servidor usa em security.server.ts; nada aqui confia no navegador.
 */

/** Limites por tipo de tentativa. w = janela (segundos), m = máximo de tentativas na janela. */
export const LIMITS = {
  pix: {
    // IP com folga: celulares na mesma operadora às vezes saem pelo mesmo IP.
    ip: [
      { w: 10 * 60, m: 6 },
      { w: 24 * 3600, m: 20 },
    ],
    // Mesma pessoa: dá para refazer o Pix algumas vezes (trocar kit, frete), não dezenas.
    pessoa: [
      { w: 30 * 60, m: 4 },
      { w: 24 * 3600, m: 8 },
    ],
  },
  card: {
    // Cartão: teste de cartão roubado faz muitas tentativas seguidas.
    ip: [
      { w: 30 * 60, m: 5 },
      { w: 24 * 3600, m: 12 },
    ],
    pessoa: [
      { w: 30 * 60, m: 4 },
      { w: 24 * 3600, m: 8 },
    ],
  },
  comprovante: {
    ip: [{ w: 3600, m: 10 }],
    pessoa: [],
  },
} as const;

export type GuardKind = keyof typeof LIMITS;

/** Menos de 3 s entre abrir o checkout e pagar: só robô preenche tão rápido. */
export const MIN_FILL_MS = 3000;

// DDDs válidos no Brasil (Anatel).
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Celular/fixo brasileiro plausível: DDD existe, celular começa com 9, não é tudo igual. */
export function phoneOk(raw: string): boolean {
  const p = raw.replace(/\D/g, "");
  if (p.length !== 10 && p.length !== 11) return false;
  if (!DDDS.has(Number(p.slice(0, 2)))) return false;
  const num = p.slice(2);
  if (p.length === 11 && num[0] !== "9") return false;
  if (/^(\d)\1+$/.test(num)) return false;
  if ("0123456789".includes(num.slice(-8)) || "9876543210".includes(num.slice(-8))) return false;
  return true;
}

// E-mails descartáveis mais usados por robôs.
const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "yopmail.com",
  "yopmail.net",
  "trashmail.com",
  "getnada.com",
  "nada.email",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "emailondeck.com",
  "mohmal.com",
  "mintemail.com",
  "mail.tm",
  "tmail.ws",
  "tmpmail.org",
  "burnermail.io",
  "spamgourmet.com",
  "example.com",
  "example.org",
  "teste.com",
  "test.com",
]);

export function emailOk(raw: string): boolean {
  const e = raw.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return false;
  const domain = e.slice(at + 1);
  if (!domain.includes(".")) return false;
  return !DISPOSABLE.has(domain);
}

/** Nome de gente: tem letras, sem números nem links, sem a mesma letra repetida sem parar. */
export function nameOk(raw: string): boolean {
  const n = raw.trim();
  if ((n.match(/\p{L}/gu) ?? []).length < 3) return false;
  if (/\d/.test(n)) return false;
  if (/https?:|www\.|\.com|@/i.test(n)) return false;
  if (/(\p{L})\1{3,}/iu.test(n)) return false;
  return true;
}

export type BotSignals = {
  /** Campo escondido que gente de verdade não vê nem preenche. */
  hp?: string | undefined;
  /** Tempo entre abrir o checkout e pedir o pagamento (ms), medido no navegador. */
  fillMs?: number | undefined;
};

/** Motivo do bloqueio (para o /admin) ou null se os dados parecem de uma pessoa. */
export function suspiciousReason(
  c: { name: string; email: string; phone: string },
  bot: BotSignals,
): "robo" | "nome" | "email" | "celular" | null {
  if (bot.hp) return "robo";
  if (typeof bot.fillMs === "number" && bot.fillMs < MIN_FILL_MS) return "robo";
  if (!nameOk(c.name)) return "nome";
  if (!emailOk(c.email)) return "email";
  if (!phoneOk(c.phone)) return "celular";
  return null;
}

export const SUSPICIOUS_MESSAGE: Record<
  NonNullable<ReturnType<typeof suspiciousReason>>,
  string
> = {
  robo: "Não foi possível gerar o pagamento agora. Recarregue a página e tente de novo.",
  nome: "Confira seu nome completo (sem números) e tente de novo.",
  email: "Use um e-mail válido que você acessa para receber o pedido.",
  celular: "Confira seu celular com DDD e tente de novo.",
};

export const RATE_LIMIT_MESSAGE =
  "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo, ou fale com a gente no WhatsApp.";

export const CAPTCHA_MESSAGE =
  "Confirme que você não é um robô (a caixinha no topo do pagamento) e tente de novo.";

/** Regras de contagem para uma tentativa. Chaves já embaralhadas (hash) pelo servidor. */
export function buildRules(
  slug: string,
  kind: GuardKind,
  keys: { ip?: string | null; cpf?: string | null; phone?: string | null; email?: string | null },
) {
  const lim = LIMITS[kind];
  const rules: { b: string; k: string; w: number; m: number }[] = [];
  if (keys.ip) for (const l of lim.ip) rules.push({ b: `${slug}:${kind}:ip`, k: keys.ip, ...l });
  for (const [campo, k] of [
    ["cpf", keys.cpf],
    ["tel", keys.phone],
    ["email", keys.email],
  ] as const) {
    if (k) for (const l of lim.pessoa) rules.push({ b: `${slug}:${kind}:${campo}`, k, ...l });
  }
  return rules;
}
