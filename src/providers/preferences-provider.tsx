"use client";

import { useCallback, useEffect } from "react";
import { usePreferences } from "@/stores/preferences-store";

// ─── Color helpers ────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return { r: 0, g: 0, b: 0 };
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
}

// ─── Provider ─────────────────────────────────────────────────────

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { accent, accentCustom, fontFamily, fontSize } = usePreferences();

  const applyCustomAccent = useCallback((hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const lum = luminance(r, g, b);
    const fg = lum > 0.5 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";

    document.documentElement.style.setProperty("--primary", hex);
    document.documentElement.style.setProperty("--primary-foreground", fg);
    document.documentElement.style.setProperty("--ring", hex);
    document.documentElement.style.setProperty("--sidebar-primary", hex);
    document.documentElement.style.setProperty("--chart-1", hex);
    document.documentElement.style.setProperty("--sidebar-primary-foreground", fg);

    // Hero section accent colors
    document.documentElement.style.setProperty("--hero-accent", `rgba(${r}, ${g}, ${b}, 0.45)`);
    document.documentElement.style.setProperty("--brand-accent", hex);
    document.documentElement.style.setProperty("--brand-accent-foreground", fg);

  }, []);

  const CUSTOM_ACCENT_VARS = [
    "--primary",
    "--primary-foreground",
    "--ring",
    "--sidebar-primary",
    "--chart-1",
    "--sidebar-primary-foreground",
    "--hero-accent",
    "--brand-accent",
    "--brand-accent-foreground",
  ] as const;

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    document.documentElement.setAttribute("data-font-family", fontFamily);
    document.documentElement.setAttribute("data-font-size", fontSize);

    if (accent === "custom" && accentCustom) {
      applyCustomAccent(accentCustom);
    } else {
      // Clear custom inline styles so named CSS rules take over
      CUSTOM_ACCENT_VARS.forEach((v) =>
        document.documentElement.style.removeProperty(v)
      );
    }
  }, [accent, accentCustom, fontFamily, fontSize, applyCustomAccent]);

  return <>{children}</>;
}
