"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface DashboardAd {
  id: string;
  label: string;
  title: string;
  description: string;
  image_url: string | null;
  image_fit: "cover" | "contain";
  cta_text: string | null;
  cta_url: string | null;
}

export function DashboardAdBanner() {
  const [ad, setAd] = useState<DashboardAd | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/ads/current", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { ad?: DashboardAd | null };
        setAd(result.ad ?? null);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const dismiss = () => {
    if (!ad) return;
    const dismissedAd = ad;
    setAd(null);
    void fetch("/api/ads/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: dismissedAd.id }),
    }).catch(() => setAd(dismissedAd));
  };

  if (!ad) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card shadow-sm">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,var(--primary),transparent_28%)]" />
      <div className="relative flex flex-col sm:h-[156px] sm:flex-row sm:items-stretch">
        {ad.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.image_url}
            alt=""
            className={`h-36 w-full border-b border-border/40 bg-white object-center sm:h-full sm:w-[40%] sm:border-b-0 sm:border-r ${
              ad.image_fit === "contain" ? "object-contain p-3" : "object-cover"
            }`}
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center border-b border-border/40 bg-primary/10 sm:h-full sm:w-[40%] sm:border-b-0 sm:border-r">
            <Megaphone className="size-9 text-primary" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center p-5 pr-12 sm:px-6 sm:py-4 sm:pr-5">
          <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {ad.label}
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{ad.title}</h2>
          <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">{ad.description}</p>
        </div>

        {ad.cta_text && ad.cta_url && (
          <div className="flex shrink-0 items-center px-5 pb-5 sm:px-12 sm:pb-0 sm:pl-4 sm:pr-14">
            <a
              href={ad.cta_url}
              target={ad.cta_url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              {ad.cta_text}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide this promotion for seven days"
          className="absolute right-3 top-3 rounded-full border border-border/50 bg-background/70 p-2 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </section>
  );
}
