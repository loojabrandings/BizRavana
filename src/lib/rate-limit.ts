import "server-only";

import { createHash } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class RateLimitUnavailableError extends Error {
  constructor() {
    super("The request rate limiter is unavailable.");
    this.name = "RateLimitUnavailableError";
  }
}

export function getClientAddress(request: Pick<Request, "headers">) {
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedAddress ||
    "unknown";

  return address.slice(0, 200);
}

function hashDiscriminator(value: string) {
  return createHash("sha256")
    .update(value.trim().toLowerCase(), "utf8")
    .digest("hex");
}

export async function consumeRateLimit({
  scope,
  discriminator,
  limit,
  windowSeconds,
}: {
  scope: string;
  discriminator: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const admin = getAdminClient();
  const { data, error } = await admin.rpc("consume_request_rate_limit", {
    p_scope: scope,
    p_key_hash: hashDiscriminator(discriminator),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  const result = data?.[0];
  if (error || !result) {
    console.error("Request rate limiter failed:", error);
    throw new RateLimitUnavailableError();
  }

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    retryAfterSeconds: result.retry_after_seconds,
  };
}
