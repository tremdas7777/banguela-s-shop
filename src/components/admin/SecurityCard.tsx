import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSecurityAdmin, saveSecurityAdmin } from "@/lib/security.functions";
import { Pill, SettingCard, SettingHeader } from "./kit";

const MOTIVOS: Record<string, string> = {
  robo: "Robô (campo escondido ou rápido demais)",
  nome: "Nome falso",
  email: "E-mail descartável/falso",
  celular: "Celular inválido",
  captcha: "Não passou no captcha",
};
const motivo = (k: string) => MOTIVOS[k] ?? k.replace("limite ", "Excesso de tentativas: ");

/** Proteção contra pedidos em massa: bloqueios do dia e captcha (Cloudflare Turnstile). */
export function SecurityCard({ password }: { password: string }) {
  const loadFn = useServerFn(getSecurityAdmin);
  const saveFn = useServerFn(saveSecurityAdmin);
  const [siteKey, setSiteKey] = useState("");
  const [secret, setSecret] = useState("");
  const [secretHint, setSecretHint] = useState("");
  const [limitOn, setLimitOn] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!password) return;
    loadFn({ data: { password } })
      .then((r) => {
        setSiteKey(r.siteKey);
        setSecretHint(r.secretHint);
        setLimitOn(r.limitOn);
        setBlocked(r.blocked24h);
      })
      .catch(() => setMsg("Não foi possível carregar."));
  }, [password, loadFn]);
  useEffect(load, [load]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await saveFn({ data: { password, siteKey, secretKey: secret || undefined } });
      setSecret("");
      setMsg("Salvo. O captcha já vale no checkout.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await saveFn({ data: { password, siteKey: "", remove: true } });
      setSiteKey("");
      setSecretHint("");
      setMsg("Captcha desligado.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao remover.");
    } finally {
      setBusy(false);
    }
  };

  const total = Object.values(blocked).reduce((s, n) => s + n, 0);

  return (
    <SettingCard>
      <SettingHeader
        icon={<ShieldCheck />}
        title="Proteção contra pedidos em massa"
        description="Barra robôs, dados falsos e quem gera Pix ou tenta cartão vezes demais (por IP, CPF, celular e e-mail). Sempre ligada."
        status={
          limitOn === null ? null : limitOn ? (
            <Pill tone="green">Limite ativo</Pill>
          ) : (
            <Pill tone="amber">Falta ativar no banco</Pill>
          )
        }
      />

      <div className="rounded-lg border border-[#e4e7ec] bg-[#f9fafb] p-3 text-[13px] text-[#344054]">
        <p className="font-medium">
          Bloqueados nas últimas 24 h: <b>{total}</b>
        </p>
        {total > 0 && (
          <ul className="mt-1.5 space-y-0.5 text-[12px] text-[#475467]">
            {Object.entries(blocked)
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <li key={k}>
                  {motivo(k)}: <b>{n}</b>
                </li>
              ))}
          </ul>
        )}
      </div>

      <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
        <p className="md:col-span-2 text-[13px] text-[#475467]">
          <b>Captcha (recomendado):</b> crie grátis em{" "}
          <a
            href="https://dash.cloudflare.com/?to=/:account/turnstile"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Cloudflare → Turnstile
          </a>{" "}
          → Add widget, coloque o domínio da loja e o modo <i>Managed</i>. Cole as duas chaves aqui.
          Cliente de verdade quase nunca vê nada.{" "}
          {siteKey && secretHint ? (
            <Pill tone="green">Captcha ligado</Pill>
          ) : (
            <Pill tone="gray">Captcha desligado</Pill>
          )}
        </p>
        <label className="space-y-1.5 text-xs font-medium text-[#344054]">
          <span>Site Key</span>
          <Input
            value={siteKey}
            onChange={(e) => setSiteKey(e.target.value.trim())}
            placeholder="0x4AAAA..."
            autoComplete="off"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-[#344054]">
          <span>Secret Key {secretHint && `(atual ${secretHint})`}</span>
          <Input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value.trim())}
            placeholder={secretHint ? "Deixe vazio para manter" : "0x4AAAA..."}
            autoComplete="off"
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={busy || !siteKey}>
            Salvar captcha
          </Button>
          {secretHint && (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={remove}>
              Desligar captcha
            </Button>
          )}
          {msg && <span className="text-xs text-[#344054]">{msg}</span>}
        </div>
      </form>
    </SettingCard>
  );
}
