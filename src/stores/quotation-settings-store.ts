import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuotationSettings {
  quotationNumberPrefix: string;
  quotationNumberStart: string;
  quotationExpiryDays: number;
  defaultDiscountMode: "percentage" | "fixed";
}

interface QuotationSettingsStore extends QuotationSettings {
  setQuotationNumberPrefix: (v: string) => void;
  setQuotationNumberStart: (v: string) => void;
  setQuotationExpiryDays: (v: number) => void;
  setDefaultDiscountMode: (v: "percentage" | "fixed") => void;
}

export const useQuotationSettings = create<QuotationSettingsStore>()(
  persist(
    (set) => ({
      quotationNumberPrefix: "",
      quotationNumberStart: "1",
      quotationExpiryDays: 14,
      defaultDiscountMode: "percentage",

      setQuotationNumberPrefix: (v) => set({ quotationNumberPrefix: v }),
      setQuotationNumberStart: (v) => set({ quotationNumberStart: v || "1" }),
      setQuotationExpiryDays: (v) => set({ quotationExpiryDays: v }),
      setDefaultDiscountMode: (v) => set({ defaultDiscountMode: v }),
    }),
    { name: "freebuff-quotation-settings" },
  ),
);
