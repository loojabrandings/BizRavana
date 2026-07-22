"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  accent?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  accent = "blue",
}: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
