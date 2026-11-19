-- Proteção contra pedidos em massa (2026-11-19).
-- Cada tentativa de Pix/cartão/comprovante grava uma linha com o IP, CPF, celular e e-mail
-- embaralhados (hash SHA-256 com o nome da loja). A função security_check confere os limites
-- e grava as tentativas numa transação só, travando por chave para rajadas em paralelo não passarem.
-- Pode rodar de novo sem erro, e várias lojas no mesmo banco dividem a tabela (o "bucket" leva o nome da loja).

CREATE TABLE IF NOT EXISTS public.security_hits (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  key_hash text NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_hits_lookup
  ON public.security_hits (bucket, key_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS security_hits_created
  ON public.security_hits (created_at);

-- Só o servidor (service role) lê e grava.
ALTER TABLE public.security_hits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_hits FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.security_hits_id_seq FROM anon, authenticated;

-- p_rules: [{"b": "loja:pix:ip", "k": "<hash>", "w": 600, "m": 6}, ...]
--   b = bucket, k = hash da chave, w = janela em segundos, m = máximo de tentativas na janela.
-- Devolve {"ok": true} ou {"ok": false, "rule": "<bucket>"} (a tentativa bloqueada também é registrada).
CREATE OR REPLACE FUNCTION public.security_check(p_rules jsonb, p_block_bucket text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
  n integer;
  violated text := NULL;
BEGIN
  -- Trava cada chave (sempre na mesma ordem) até o fim da transação.
  FOR r IN
    SELECT DISTINCT ON (e->>'b', e->>'k') e
    FROM jsonb_array_elements(p_rules) e
    ORDER BY e->>'b', e->>'k'
  LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended((r->>'b') || ':' || (r->>'k'), 0));
  END LOOP;

  FOR r IN SELECT * FROM jsonb_array_elements(p_rules) LOOP
    SELECT count(*) INTO n
    FROM public.security_hits
    WHERE bucket = r->>'b'
      AND key_hash = r->>'k'
      AND NOT blocked
      AND created_at > now() - make_interval(secs => (r->>'w')::int);
    IF n >= (r->>'m')::int THEN
      violated := r->>'b';
      EXIT;
    END IF;
  END LOOP;

  IF violated IS NULL THEN
    INSERT INTO public.security_hits (bucket, key_hash)
    SELECT DISTINCT e->>'b', e->>'k' FROM jsonb_array_elements(p_rules) e;
  ELSE
    INSERT INTO public.security_hits (bucket, key_hash, blocked)
    VALUES (coalesce(p_block_bucket, violated), violated, true);
  END IF;

  -- Limpeza de vez em quando: guarda só 3 dias.
  IF random() < 0.02 THEN
    DELETE FROM public.security_hits WHERE created_at < now() - interval '3 days';
  END IF;

  RETURN CASE WHEN violated IS NULL
    THEN jsonb_build_object('ok', true)
    ELSE jsonb_build_object('ok', false, 'rule', violated) END;
END;
$$;

-- Bloqueios que não passam pela contagem (dados falsos, robô, captcha), para o /admin mostrar.
CREATE OR REPLACE FUNCTION public.security_log_block(p_bucket text, p_reason text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.security_hits (bucket, key_hash, blocked) VALUES (p_bucket, p_reason, true);
$$;

REVOKE ALL ON FUNCTION public.security_check(jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.security_log_block(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.security_check(jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.security_log_block(text, text) TO service_role;
