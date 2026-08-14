import { ImageResponse } from "next/og";

export const alt =
  "BizRavana — Your business. Under control. Orders, inventory, couriers and reports in one workspace.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#08090b";
const CREAM = "#f3f1eb";
const ACCENT = "#6fc59b";

/**
 * Social share image for the public site — the ink/accent brand on a
 * 1200×630 canvas (the @vercel/og default Geist font is used; no font
 * assets needed). Rendered at build time and cached.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: INK,
          color: CREAM,
          padding: 72,
          position: "relative",
        }}
      >
        {/* Ambient accent shapes — muted, behind the copy. */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: "rgba(111, 197, 155, 0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: "46% 54% 58% 42% / 48% 44% 56% 52%",
            background: "rgba(111, 197, 155, 0.16)",
          }}
        />

        {/* Brand row — the logo tile + wordmark. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: ACCENT,
              color: INK,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: 1 }}>
            BizRavana
          </span>
        </div>

        {/* Message — one statement, then the supporting line. */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <span
            style={{
              fontSize: 62,
              lineHeight: 1.08,
              letterSpacing: 1,
              maxWidth: 860,
            }}
          >
            Your business. Under control.
          </span>
          <span
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(243, 241, 235, 0.62)",
              maxWidth: 720,
            }}
          >
            Orders, inventory, couriers and reports — in one workspace.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
