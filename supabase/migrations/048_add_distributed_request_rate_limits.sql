-- =============================================
-- BizRavana - Distributed public-request rate limits
-- Migration 048
-- =============================================

BEGIN;

-- A single database-backed counter is shared by every application instance.
-- Only hashed request discriminators are stored; raw email/IP values never
-- cross this persistence boundary.
CREATE TABLE public.request_rate_limits (
  scope TEXT NOT NULL CHECK (char_length(scope) BETWEEN 1 AND 100),
  key_hash TEXT NOT NULL CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, key_hash)
);

ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.request_rate_limits
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_request_rate_limit(
  p_scope TEXT,
  p_key_hash TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := pg_catalog.clock_timestamp();
  v_window TIMESTAMPTZ;
  v_count INTEGER;
  v_interval INTERVAL;
BEGIN
  IF p_scope IS NULL OR char_length(p_scope) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid rate-limit scope';
  END IF;
  IF p_key_hash IS NULL OR p_key_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid rate-limit key';
  END IF;
  IF p_limit NOT BETWEEN 1 AND 10000 THEN
    RAISE EXCEPTION 'Invalid rate-limit maximum';
  END IF;
  IF p_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'Invalid rate-limit window';
  END IF;

  v_interval := pg_catalog.make_interval(secs => p_window_seconds);

  INSERT INTO public.request_rate_limits AS limits (
    scope,
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  VALUES (p_scope, p_key_hash, v_now, 1, v_now)
  ON CONFLICT (scope, key_hash) DO UPDATE
  SET window_started_at = CASE
        WHEN limits.window_started_at + v_interval <= v_now
          THEN v_now
        ELSE limits.window_started_at
      END,
      request_count = CASE
        WHEN limits.window_started_at + v_interval <= v_now
          THEN 1
        ELSE limits.request_count + 1
      END,
      updated_at = v_now
  RETURNING window_started_at, request_count
    INTO v_window, v_count;

  allowed := v_count <= p_limit;
  remaining := GREATEST(p_limit - v_count, 0);
  retry_after_seconds := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(
      1,
      pg_catalog.ceil(
        EXTRACT(EPOCH FROM (
          v_window + v_interval - v_now
        ))
      )::INTEGER
    )
  END;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_request_rate_limit(
  TEXT, TEXT, INTEGER, INTEGER
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_request_rate_limit(
  TEXT, TEXT, INTEGER, INTEGER
) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_request_rate_limits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  DELETE FROM public.request_rate_limits
  WHERE updated_at < pg_catalog.now() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_request_rate_limits()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_request_rate_limits()
  TO service_role;

-- Keep the bounded counter table small without making pg_cron a migration
-- requirement for development environments where the extension is absent.
DO $do$
BEGIN
  BEGIN
    PERFORM cron.unschedule('cleanup-request-rate-limits');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  PERFORM cron.schedule(
    'cleanup-request-rate-limits',
    '17 * * * *',
    $$SELECT public.cleanup_request_rate_limits()$$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not schedule request-rate-limit cleanup: %', SQLERRM;
END;
$do$;

COMMIT;
