"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "./theme-provider";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Light/dark mode toggle. The only interactive control on the page:
 * everything else in the navbar is inert UI.
 *
 * The icon and labels depend on the resolved theme, which differs between the
 * server render (always "light") and the client (stored preference, else the
 * system scheme). Rendering that difference during hydration makes React
 * regenerate the tree client-side — which also discards the `data-theme`
 * attribute the theme init script set on <html>. So the toggle renders
 * theme-agnostically until mounted, then shows the correct icon: server and
 * client always render the same initial button.
 */
const emptySubscribe = () => () => {};

/** True only after hydration — renders as false on the server. */
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useMounted();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : undefined}
      aria-pressed={mounted ? isDark : undefined}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : undefined}
    >
      {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : null}
    </button>
  );
}
