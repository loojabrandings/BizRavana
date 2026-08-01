import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuotationSettings {
  quotationNumberPrefix: string;
  quotationNumberStart: string;
  quotationExpiryDays: number;
  defaultDiscountMode: "percentage" | "fixed";

  // Bank details
  showBankDetails: boolean;
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  branch: string;
}

interface QuotationSettingsStore extends QuotationSettings {
  setQuotationNumberPrefix: (v: string) => void;
  setQuotationNumberStart: (v: string) => void;
  setQuotationExpiryDays: (v: number) => void;
  setDefaultDiscountMode: (v: "percentage" | "fixed") => void;

  setShowBankDetails: (v: boolean) => void;
  setBankAccountName: (v: string) => void;
  setBankName: (v: string) => void;
  setAccountNumber: (v: string) => void;
  setBranch: (v: string) => void;
}

export const useQuotationSettings = create<QuotationSettingsStore>()(
  persist(
    (set) => ({
      quotationNumberPrefix: "",
      quotationNumberStart: "1",
      quotationExpiryDays: 14,
      defaultDiscountMode: "percentage",

      showBankDetails: false,
      bankAccountName: "",
      bankName: "",
      accountNumber: "",
      branch: "",

      setQuotationNumberPrefix: (v) => set({ quotationNumberPrefix: v }),
      setQuotationNumberStart: (v) => set({ quotationNumberStart: v || "1" }),
      setQuotationExpiryDays: (v) => set({ quotationExpiryDays: v }),
      setDefaultDiscountMode: (v) => set({ defaultDiscountMode: v }),

      setShowBankDetails: (v) => set({ showBankDetails: v }),
      setBankAccountName: (v) => set({ bankAccountName: v }),
      setBankName: (v) => set({ bankName: v }),
      setAccountNumber: (v) => set({ accountNumber: v }),
      setBranch: (v) => set({ branch: v }),
    }),
    { name: "freebuff-quotation-settings" },
  ),
);
