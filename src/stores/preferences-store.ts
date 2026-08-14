import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "bizravana" | "blue" | "purple" | "rose" | "amber" | "custom";
export type FontFamily = "poppins" | "lora" | "caveat";
export type FontSize = "small" | "medium" | "large";
export type BackgroundStyle = "blobs" | "solid";

interface PreferencesState {
  theme: ThemeMode;
  accent: AccentColor;
  accentCustom: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  currency: string;
  dateFormat: string;
  backgroundStyle: BackgroundStyle;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setAccentCustom: (hex: string) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setFontSize: (fontSize: FontSize) => void;
  setCurrency: (currency: string) => void;
  setDateFormat: (dateFormat: string) => void;
  setBackgroundStyle: (style: BackgroundStyle) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      accent: "bizravana",
      accentCustom: "#6366f1",
      fontFamily: "poppins",
      fontSize: "medium",
      currency: "LKR",
      dateFormat: "YYYY-MM-DD",
      backgroundStyle: "blobs",

      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setAccentCustom: (accentCustom) => set({ accentCustom }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCurrency: (currency) => set({ currency }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setBackgroundStyle: (backgroundStyle) => set({ backgroundStyle }),
    }),
    {
      name: "freebuff-preferences",
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { accent?: string } & Record<string, unknown>;
        // The old "green" (Forest) accent was removed; map it to the new
        // BizRavana (landing-site) default palette.
        if (version < 1 && state.accent === "green") {
          return { ...state, accent: "bizravana" } as unknown as PreferencesState;
        }
        return state as unknown as PreferencesState;
      },
    },
  ),
);
