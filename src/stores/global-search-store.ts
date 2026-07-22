"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentSearch {
  text: string;
  timestamp: number;
}

interface GlobalSearchState {
  isOpen: boolean;
  recentSearches: RecentSearch[];
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addRecentSearch: (text: string) => void;
  removeRecentSearch: (text: string) => void;
  clearRecentSearches: () => void;
}

const MAX_RECENT = 10;

export const useGlobalSearchStore = create<GlobalSearchState>()(
  persist(
    (set) => ({
      isOpen: false,
      recentSearches: [],

      setIsOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

      addRecentSearch: (text) =>
        set((state) => {
          const trimmed = text.trim();
          if (!trimmed) return state;
          const filtered = state.recentSearches.filter(
            (s) => s.text.toLowerCase() !== trimmed.toLowerCase(),
          );
          const next = [{ text: trimmed, timestamp: Date.now() }, ...filtered];
          return { recentSearches: next.slice(0, MAX_RECENT) };
        }),

      removeRecentSearch: (text) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter(
            (s) => s.text.toLowerCase() !== text.toLowerCase(),
          ),
        })),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "bizravana-global-search",
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
