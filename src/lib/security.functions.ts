import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { senhaAdminOk } from "@/lib/admin-guard.server";
import {
  getTurnstileKeys,
  saveTurnstileKeys,
  securityStats,
  verifyTurnstile,
} from "@/lib/security.server";

const pwd = z.object({ password: z.string().min(1).max(200) });
function assertAdmin(password: string) {
  if (!senhaAdminOk(password)) throw new Error("Não autorizado");
}

export const getSecurityAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pwd.parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const [keys, stats] = await Promise.all([getTurnstileKeys(), securityStats()]);
    return {
      siteKey: keys?.siteKey ?? "",
      secretHint: keys ? `••••${keys.secretKey.slice(-4)}` : "",
      ...stats,
    };
  });

export const saveSecurityAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    pwd
      .extend({
        siteKey: z.string().trim().max(200),
        secretKey: z.string().trim().max(200).optional(),
        remove: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.remove) {
      await saveTurnstileKeys(null);
      return { ok: true };
    }
    if (!/^0x[\w-]{10,}$/.test(data.siteKey)) {
      throw new Error("A chave do site da Cloudflare começa com 0x.");
    }
    const secretKey = data.secretKey || (await getTurnstileKeys())?.secretKey;
    if (!secretKey || !/^0x[\w-]{10,}$/.test(secretKey)) {
      throw new Error("Cole a chave secreta (também começa com 0x).");
    }
    // Confere se a chave secreta é aceita pela Cloudflare (token falso deve voltar "invalid-input-response").
    const v = await verifyTurnstile(secretKey, "teste-de-chave", null);
    if (v.codes.includes("invalid-input-secret")) {
      throw new Error("A Cloudflare recusou a chave secreta. Confira e cole de novo.");
    }
    await saveTurnstileKeys({ siteKey: data.siteKey, secretKey });
    return { ok: true };
  });
