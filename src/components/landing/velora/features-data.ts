import {
  BarChart3,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface FeatureItem {
  /** Stable identifier used for aria-controls ids and image preloading keys. */
  id: string;
  title: string;
  description: string;
  /** Placeholder image path — replace with real dashboard screenshots later. */
  image: string;
  alt: string;
  /** Icon used only for the fallback placeholder shown before images are added. */
  icon: LucideIcon;
}

/** Default visual shown when no feature is expanded. */
export const OVERVIEW_IMAGE = {
  image: "/images/landing/features/overview.png",
  alt: "BizRavana unified platform overview showing orders, customers, delivery, inventory, profit and reports in one dashboard",
} as const;

export const FEATURES: FeatureItem[] = [
  {
    id: "orders",
    title: "Order Management",
    description:
      "Create, track and manage orders from quotation to invoice — all in one seamless workflow with status updates and payment history.",
    image: "/images/landing/features/orders.png",
    alt: "BizRavana orders table showing order status workflow and payments",
    icon: ShoppingCart,
  },
  {
    id: "customers",
    title: "Customer Management",
    description:
      "Keep detailed customer profiles with full order history, balances and contact records — so every repeat order takes seconds.",
    image: "/images/landing/features/customers.png",
    alt: "BizRavana customer profiles with order history",
    icon: Users,
  },
  {
    id: "courier",
    title: "Courier & Delivery",
    description:
      "Connect your courier, generate waybills instantly and track every shipment with live courier status and delivery cards.",
    image: "/images/landing/features/courier.png",
    alt: "BizRavana courier status, waybills and delivery cards",
    icon: Truck,
  },
  {
    id: "expenses",
    title: "Income, Expenses & Profit",
    description:
      "Record every rupee and watch revenue, expenses and net profit update in real time with automatic profit and loss analytics.",
    image: "/images/landing/features/expenses.png",
    alt: "BizRavana revenue, expense and net-profit analytics charts",
    icon: Wallet,
  },
  {
    id: "inventory",
    title: "Inventory Management",
    description:
      "Track product stock levels across your business and get low-stock alerts before you run out of your best sellers.",
    image: "/images/landing/features/inventory.png",
    alt: "BizRavana product stock levels and low-stock alerts",
    icon: Package,
  },
  {
    id: "reports",
    title: "Reports & Insights",
    description:
      "Turn your data into decisions with charts, trends and downloadable reports covering every corner of your business.",
    image: "/images/landing/features/reports.png",
    alt: "BizRavana reports showing charts, trends and insights",
    icon: BarChart3,
  },
];
