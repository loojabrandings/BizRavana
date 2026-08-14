"use client";

import { useEffect, useState } from "react";

/**
 * TEMP (dev only) — floating button that hides/shows the margin & padding
 * debug overlay defined in globals.css (`html.layout-guides *`).
 * Remove before shipping.
 */
const GUIDE_CLASS = "layout-guides";

export default function LayoutGuidesToggle() {
  // The overlay is on from first paint: `layout-guides` is set on <html> in
  // layout.tsx. This state only tracks it for the button's label/state.
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle(GUIDE_CLASS, enabled);
  }, [enabled]);

  return (
    <button
      type="button"
      className="layout-guides-toggle"
      onClick={() => setEnabled((v) => !v)}
      aria-pressed={enabled}
      title={enabled ? "Hide margin & padding guides" : "Show margin & padding guides"}
    >
      {enabled ? "Hide guides" : "Show guides"}
    </button>
  );
}
