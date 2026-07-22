import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_PAYMENT_METHODS = ["cash", "bank_transfer", "card", "online"];

export interface ExpenseSettings {
  expensePaymentMethods: string[];
  defaultExpensePaymentMethod: string;
}

interface ExpenseSettingsStore extends ExpenseSettings {
  addPaymentMethod: (method: string) => void;
  removePaymentMethod: (method: string) => void;
  setDefaultExpensePaymentMethod: (v: string) => void;
  setExpensePaymentMethods: (v: string[]) => void;
}

export const useExpenseSettings = create<ExpenseSettingsStore>()(
  persist(
    (set) => ({
      expensePaymentMethods: DEFAULT_PAYMENT_METHODS,
      defaultExpensePaymentMethod: "cash",

      addPaymentMethod: (method) =>
        set((state) => {
          if (state.expensePaymentMethods.includes(method)) return state;
          return { expensePaymentMethods: [...state.expensePaymentMethods, method] };
        }),
      removePaymentMethod: (method) =>
        set((state) => {
          const updated = state.expensePaymentMethods.filter((m) => m !== method);
          const newDefault =
            state.defaultExpensePaymentMethod === method
              ? updated[0] || "cash"
              : state.defaultExpensePaymentMethod;
          return { expensePaymentMethods: updated, defaultExpensePaymentMethod: newDefault };
        }),
      setDefaultExpensePaymentMethod: (v) => set({ defaultExpensePaymentMethod: v }),
      setExpensePaymentMethods: (v) => set({ expensePaymentMethods: v }),
    }),
    { name: "freebuff-expense-settings" },
  ),
);
