import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrdersSettings {
  orderNumberPrefix: string;
  orderNumberStart: string;
  defaultOrderStatus: string;
  defaultPaymentStatus: string;
  isDefaultLandingPage: boolean;
  enabledStatuses: string[];
  enableInventory: boolean;
  deductStockAt: string;
  /** @deprecated Use waybillMode instead */
  requireWaybillBeforePacked: boolean;
  waybillMode: "manual" | "auto";
  enableBarcodeScanner: boolean;
  defaultCourier: string;
  courierCharge: number;
  defaultSorting: string;
  defaultRowsPerPage: number;
  defaultPaymentMethod: string;
  allowPartialPayments: boolean;
  defaultAdvancePercent: number;
  defaultDeliveryCharge: number;
}

interface OrdersSettingsStore extends OrdersSettings {
  setOrderNumberPrefix: (v: string) => void;
  setOrderNumberStart: (v: string) => void;
  setDefaultOrderStatus: (v: string) => void;
  setDefaultPaymentStatus: (v: string) => void;
  setIsDefaultLandingPage: (v: boolean) => void;
  setEnabledStatuses: (v: string[]) => void;
  toggleStatus: (status: string) => void;
  setEnableInventory: (v: boolean) => void;
  setDeductStockAt: (v: string) => void;
  /** @deprecated Use setWaybillMode instead */
  setRequireWaybillBeforePacked: (v: boolean) => void;
  setWaybillMode: (v: "manual" | "auto") => void;
  setEnableBarcodeScanner: (v: boolean) => void;
  setDefaultCourier: (v: string) => void;
  setCourierCharge: (v: number) => void;
  setDefaultSorting: (v: string) => void;
  setDefaultRowsPerPage: (v: number) => void;
  setDefaultPaymentMethod: (v: string) => void;
  setAllowPartialPayments: (v: boolean) => void;
  setDefaultAdvancePercent: (v: number) => void;
  setDefaultDeliveryCharge: (v: number) => void;
}

const allStatuses = [
  "new_order",
  "ready",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "returned",
];

export const useOrdersSettings = create<OrdersSettingsStore>()(
  persist(
    (set) => ({
      orderNumberPrefix: "",
      orderNumberStart: "1",
      defaultOrderStatus: "new_order",
      defaultPaymentStatus: "pending",
      isDefaultLandingPage: false,
      enabledStatuses: allStatuses,
      enableInventory: true,
      deductStockAt: "packed",
      requireWaybillBeforePacked: true,
      waybillMode: "manual",
      enableBarcodeScanner: false,
      defaultCourier: "",
      courierCharge: 0,
      defaultSorting: "created_at_desc",
      defaultRowsPerPage: 25,
      defaultPaymentMethod: "cash",
      allowPartialPayments: true,
      defaultAdvancePercent: 50,
      defaultDeliveryCharge: 0,

      setOrderNumberPrefix: (v) => set({ orderNumberPrefix: v }),
      setOrderNumberStart: (v) => set({ orderNumberStart: v || "1" }),
      setDefaultOrderStatus: (v) => set({ defaultOrderStatus: v }),
      setDefaultPaymentStatus: (v) => set({ defaultPaymentStatus: v }),
      setIsDefaultLandingPage: (v) => set({ isDefaultLandingPage: v }),
      setEnabledStatuses: (v) => set({ enabledStatuses: v }),
      toggleStatus: (status) =>
        set((state) => {
          const exists = state.enabledStatuses.includes(status);
          return {
            enabledStatuses: exists
              ? state.enabledStatuses.filter((s) => s !== status)
              : [...state.enabledStatuses, status],
          };
        }),
      setEnableInventory: (v) => set({ enableInventory: v }),
      setDeductStockAt: (v) => set({ deductStockAt: v }),
      setRequireWaybillBeforePacked: (v) => set({ requireWaybillBeforePacked: v }),
      setWaybillMode: (v) => set({ waybillMode: v, requireWaybillBeforePacked: v === "manual" }),
      setEnableBarcodeScanner: (v) => set({ enableBarcodeScanner: v }),
      setDefaultCourier: (v) => set({ defaultCourier: v }),
      setCourierCharge: (v) => set({ courierCharge: v }),
      setDefaultSorting: (v) => set({ defaultSorting: v }),
      setDefaultRowsPerPage: (v) => set({ defaultRowsPerPage: v }),
      setDefaultPaymentMethod: (v) => set({ defaultPaymentMethod: v }),
      setAllowPartialPayments: (v) => set({ allowPartialPayments: v }),
      setDefaultAdvancePercent: (v) => set({ defaultAdvancePercent: v }),
      setDefaultDeliveryCharge: (v) => set({ defaultDeliveryCharge: v }),
    }),
    { name: "freebuff-orders-settings" },
  ),
);
