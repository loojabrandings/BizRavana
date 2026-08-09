-- =============================================
-- BizRavana - Repair request limiter GREATEST resolution
-- Migration 050
-- =============================================

-- GREATEST is a PostgreSQL conditional expression, not a normal function that
-- can be schema-qualified. Replace the migration-049 implementation while
-- retaining its collision-safe PL/pgSQL variable names.
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
        EXTRACT(EPOCH FROM (v_window + v_interval - v_now))
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
