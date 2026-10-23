import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteRotasyncKeyFn,
  getRotasyncStatus,
  saveRotasyncKeyFn,
  testRotasyncKeyFn,
} from "@/lib/rotasync.functions";

export interface RotasyncCardProps {
  password: string;
}

/** Integração RotaSync: chave da loja salva no banco, com troca, exclusão e teste (sem criar pedido). */
export function RotasyncCard({ password }: RotasyncCardProps) {
  const statusFn = useServerFn(getRotasyncStatus);
  const saveFn = useServerFn(saveRotasyncKeyFn);
  const deleteFn = useServerFn(deleteRotasyncKeyFn);
  const testFn = useServerFn(testRotasyncKeyFn);

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [source, setSource] = useState<"admin" | "env" | null>(null);
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () =>
    statusFn({ data: { password } })
      .then((r) => {
        setConfigured(r.configured);
        setMaskedKey(r.maskedKey);
        setSource(r.source);
      })
      .catch(() => setConfigured(false));

  useEffect(() => {
    if (!password) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const save = async () => {
    if (!key.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const r = await saveFn({ data: { password, key: key.trim() } });
      if (!r.ok) {
        setMsg(`A RotaSync recusou essa chave: ${r.error ?? "chave inválida"}`);
        return;
      }
      setKey("");
      setMsg(
        r.test?.ok
          ? "Chave salva e aceita pela RotaSync. Os próximos pedidos pagos já vão para lá."
          : `Chave salva, mas não deu para confirmar agora (${r.test?.error ?? "sem resposta"}). Use "Testar".`,
      );
      refresh();
    } catch {
      setMsg("Falhou ao salvar a chave.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setMsg(null);
    try {
      await deleteFn({ data: { password } });
      setMsg("Chave apagada. Os pedidos pagos não vão mais para a RotaSync.");
      refresh();
    } catch {
      setMsg("Falhou ao apagar a chave.");
    } finally {
      setDeleting(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setMsg(null);
    try {
      const r = await testFn({ data: { password } });
      setMsg(
        r.ok
          ? "Conexão OK: a RotaSync aceitou a chave. (Teste sem criar pedido.)"
          : `A RotaSync recusou${r.status ? ` (HTTP ${r.status})` : ""}: ${r.error ?? "sem detalhes"}`,
      );
    } catch {
      setMsg("Falhou ao testar.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="mt-3 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Truck className="w-5 h-5 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <div className="font-medium">Envio pela RotaSync</div>
          <div className="text-xs text-muted-foreground">
            Cada pedido pago vai para a RotaSync com endereço e itens (com tamanho e cor), e o
            código de rastreio volta para a página de rastreio do cliente.
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="password"
          placeholder={
            configured ? "Chave salva — cole uma nova para trocar" : "Cole a chave da loja na RotaSync"
          }
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={!key.trim() || saving} onClick={save}>
            {saving ? "Conferindo…" : "Salvar"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={source !== "admin" || deleting}
            onClick={remove}
          >
            {deleting ? "Apagando…" : "Apagar"}
          </Button>
          <Button size="sm" variant="outline" disabled={!configured || testing} onClick={runTest}>
            {testing ? "Testando…" : "Testar"}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">
          {configured === null
            ? "…"
            : configured
              ? source === "env"
                ? "Conectada (chave da variável RASTREIO_API_KEY)"
                : "Conectada"
              : "Sem chave: os pedidos não vão para a RotaSync"}
        </span>
        {maskedKey && (
          <span className="font-mono text-muted-foreground">Chave atual: {maskedKey}</span>
        )}
        {msg && <span className="text-foreground">{msg}</span>}
      </div>
    </Card>
  );
}
