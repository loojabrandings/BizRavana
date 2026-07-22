import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuotationSettings {
  quotationNumberPrefix: string;
  quotationNumberStart: string;
  quotationExpiryDays: number;
}

interface QuotationSettingsStore extends QuotationSettings {
  setQuotationNumberPrefix: (v: string) => void;
  setQuotationNumberStart: (v: string) => void;
  setQuotationExpiryDays: (v: number) => void;
}

export const useQuotationSettings = create<QuotationSettingsStore>()(
  persist(
    (set) => ({
      quotationNumberPrefix: "",
      quotationNumberStart: "1",
      quotationExpiryDays: 14,

      setQuotationNumberPrefix: (v) => set({ quotationNumberPrefix: v }),
      setQuotationNumberStart: (v) => set({ quotationNumberStart: v || "1" }),
      setQuotationExpiryDays: (v) => set({ quotationExpiryDays: v }),
    }),
    { name: "freebuff-quotation-settings" },
  ),
);
