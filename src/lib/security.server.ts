// Proteção contra pedidos em massa (só servidor). Três camadas, nesta ordem:
//  1. dados de robô ou falsos (campo escondido, rapidez, nome/e-mail/celular impossíveis);
//  2. captcha Cloudflare Turnstile, quando as chaves estão no /admin;
//  3. limite de tentativas por IP, CPF, celular e e-mail (função security_check no banco).
// Banco fora do ar ou migração ainda não aplicada não derruba a venda: o limite é pulado e logado.
import { brand } from "@/lib/brand";
import {
  buildRules,
  CAPTCHA_MESSAGE,
  RATE_LIMIT_MESSAGE,
  suspiciousReason,
  SUSPICIOUS_MESSAGE,
  type BotSignals,
  type GuardKind,
} from "@/lib/security";

/** Identificador da loja no banco (lojas que dividem o mesmo Supabase não somam tentativas). */
export const STORE_SLUG = brand.name
  .toLowerCase()
  .normalize("NFD")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const BLOCK_BUCKET = `${STORE_SLUG}:bloqueio`;
const TURNSTILE_KEY = "turnstile_keys";
const CACHE_MS = 60_000;

export class GuardError extends Error {}

type Db = {
  from: (t: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any
};
async function db(): Promise<Db> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Db;
}

async function sha(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${STORE_SLUG}|${value}`),
  );
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

async function logBlock(reason: string) {
  try {
    await (await db()).rpc("security_log_block", { p_bucket: BLOCK_BUCKET, p_reason: reason });
  } catch {
    /* só estatística do /admin */
  }
}

// ---------- Turnstile (captcha da Cloudflare) ----------

export type TurnstileKeys = { siteKey: string; secretKey: string };
let tsCache: { value: TurnstileKeys | null; at: number } | null = null;

export async function getTurnstileKeys(): Promise<TurnstileKeys | null> {
  if (tsCache && Date.now() - tsCache.at < CACHE_MS) return tsCache.value;
  let value: TurnstileKeys | null = null;
  try {
    const { data } = await (
      await db()
    )
      .from("private_settings")
      .select("value")
      .eq("key", TURNSTILE_KEY)
      .maybeSingle();
    const v = data?.value as Partial<TurnstileKeys> | null;
    if (v?.siteKey && v?.secretKey) value = { siteKey: v.siteKey, secretKey: v.secretKey };
  } catch (e) {
    console.error("Turnstile keys", e);
  }
  const envSite = process.env["TURNSTILE_SITE_KEY"];
  const envSecret = process.env["TURNSTILE_SECRET_KEY"];
  if (!value && envSite && envSecret) value = { siteKey: envSite, secretKey: envSecret };
  tsCache = { value, at: Date.now() };
  return value;
}

export async function saveTurnstileKeys(keys: TurnstileKeys | null): Promise<void> {
  const d = await db();
  const { error } = keys
    ? await d
        .from("private_settings")
        .upsert({ key: TURNSTILE_KEY, value: keys, updated_at: new Date().toISOString() })
    : await d.from("private_settings").delete().eq("key", TURNSTILE_KEY);
  if (error) throw new Error(error.message);
  tsCache = null;
}

/** Confere o token do captcha na Cloudflare. Cada token vale uma vez só. */
export async function verifyTurnstile(
  secretKey: string,
  token: string | undefined,
  ip: string | null,
): Promise<{ ok: boolean; codes: string[] }> {
  if (!token) return { ok: false, codes: ["missing-input-response"] };
  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const j = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return { ok: !!j.success, codes: j["error-codes"] ?? [] };
  } catch (e) {
    // Cloudflare fora do ar não pode parar a loja: deixa passar e conta só com o limite.
    console.error("Turnstile siteverify", e);
    return { ok: true, codes: ["verify-unavailable"] };
  }
}

// ---------- Guarda das tentativas ----------

export type GuardInput = {
  kind: GuardKind;
  ip: string | null;
  customer?: { name: string; email: string; phone: string; cpf: string };
  bot?: BotSignals;
  captchaToken?: string | undefined;
  /** Admin logado testando (senha do /admin no mesmo navegador): passa direto. */
  bypass?: boolean;
};

/**
 * Lança GuardError com a mensagem para o cliente quando a tentativa é bloqueada.
 * Chamar ANTES de criar a cobrança no gateway.
 */
export async function guardAttempt(input: GuardInput): Promise<void> {
  if (input.bypass) return;
  const c = input.customer;

  if (c) {
    const reason = suspiciousReason(c, input.bot ?? {});
    if (reason) {
      await logBlock(reason);
      throw new GuardError(SUSPICIOUS_MESSAGE[reason]);
    }
  }

  if (input.kind !== "comprovante") {
    const keys = await getTurnstileKeys();
    if (keys) {
      const v = await verifyTurnstile(keys.secretKey, input.captchaToken, input.ip);
      if (!v.ok) {
        await logBlock("captcha");
        throw new GuardError(CAPTCHA_MESSAGE);
      }
    }
  }

  const rules = buildRules(STORE_SLUG, input.kind, {
    ip: input.ip ? await sha(`ip:${input.ip}`) : null,
    cpf: c ? await sha(`cpf:${c.cpf.replace(/\D/g, "")}`) : null,
    phone: c ? await sha(`tel:${c.phone.replace(/\D/g, "")}`) : null,
    email: c ? await sha(`email:${c.email.trim().toLowerCase()}`) : null,
  });
  if (!rules.length) return;
  try {
    const { data, error } = await (
      await db()
    ).rpc("security_check", {
      p_rules: rules,
      p_block_bucket: BLOCK_BUCKET,
    });
    if (error) throw new Error(error.message);
    if (data && data.ok === false) throw new GuardError(RATE_LIMIT_MESSAGE);
  } catch (e) {
    if (e instanceof GuardError) throw e;
    console.error("security_check indisponível (limite pulado)", e);
  }
}

/** Resumo para o /admin: bloqueios nas últimas 24 h por motivo e se o limite está no ar. */
export async function securityStats(): Promise<{
  limitOn: boolean;
  blocked24h: Record<string, number>;
}> {
  const d = await db();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data, error } = await d
    .from("security_hits")
    .select("key_hash")
    .eq("bucket", BLOCK_BUCKET)
    .gte("created_at", since)
    .limit(5000);
  if (error) return { limitOn: false, blocked24h: {} };
  const blocked24h: Record<string, number> = {};
  for (const row of (data ?? []) as { key_hash: string }[]) {
    // Bloqueio por limite guarda o nome da regra ("loja:pix:ip"): mostra só "limite pix (ip)".
    const parts = row.key_hash.split(":");
    const k = parts.length === 3 ? `limite ${parts[1]} (${parts[2]})` : row.key_hash;
    blocked24h[k] = (blocked24h[k] ?? 0) + 1;
  }
  return { limitOn: true, blocked24h };
}

/** Checagem do checkout (Pix e cartão). Admin logado na mesma aba testa sem trava. */
export async function guardCheckout(
  kind: "pix" | "card",
  data: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    hp?: string | undefined;
    fillMs?: number | undefined;
    captcha?: string | undefined;
    adminPassword?: string | undefined;
  },
  ip: string | null,
): Promise<void> {
  const { senhaAdminOk } = await import("@/lib/admin-guard.server");
  await guardAttempt({
    kind,
    ip,
    customer: { name: data.name, email: data.email, phone: data.phone, cpf: data.cpf },
    bot: { hp: data.hp, fillMs: data.fillMs },
    captchaToken: data.captcha,
    bypass: !!data.adminPassword && senhaAdminOk(data.adminPassword),
  });
}
