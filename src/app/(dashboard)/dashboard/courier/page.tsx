"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  Settings2,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface CourierStatus {
  id: string;
  label: string;
  description: string;
  icon: typeof Truck;
  count: number;
  deliveryCharge: number;
  color: {
    bg: string;
    text: string;
    dot: string;
    icon: string;
    badge: string;
  };
}

interface RecentActivity {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  waybill: string;
  date: string;
  statusConfig: CourierStatus;
}

// ─── Status Config ─────────────────────────────────────────────

const COURIER_STATUSES: CourierStatus[] = [
  {
    id: "delivered",
    label: "Delivered",
    description: "Package successfully delivered to the recipient.",
    icon: PackageCheck,
    count: 24,
    deliveryCharge: 14400,
    color: {
      bg: "bg-emerald-500/8",
      text: "text-emerald-500",
      dot: "bg-emerald-500",
      icon: "bg-emerald-500/10 text-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-500",
    },
  },
  {
    id: "in_transit",
    label: "In Transit",
    description: "Package is in transit and moving through the network.",
    icon: Truck,
    count: 18,
    deliveryCharge: 10800,
    color: {
      bg: "bg-blue-500/8",
      text: "text-blue-500",
      dot: "bg-blue-500",
      icon: "bg-blue-500/10 text-blue-500",
      badge: "bg-blue-500/10 text-blue-500",
    },
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    description: "Package is assigned to a rider and out for final delivery.",
    icon: MapPin,
    count: 5,
    deliveryCharge: 3500,
    color: {
      bg: "bg-indigo-500/8",
      text: "text-indigo-500",
      dot: "bg-indigo-500",
      icon: "bg-indigo-500/10 text-indigo-500",
      badge: "bg-indigo-500/10 text-indigo-500",
    },
  },
  {
    id: "picked_up",
    label: "Picked Up",
    description: "Package has been collected from the sender.",
    icon: Package,
    count: 7,
    deliveryCharge: 4200,
    color: {
      bg: "bg-teal-500/8",
      text: "text-teal-500",
      dot: "bg-teal-500",
      icon: "bg-teal-500/10 text-teal-500",
      badge: "bg-teal-500/10 text-teal-500",
    },
  },
  {
    id: "rescheduled",
    label: "Rescheduled",
    description: "Delivery was re-attempted and rescheduled for another day.",
    icon: CalendarClock,
    count: 3,
    deliveryCharge: 1800,
    color: {
      bg: "bg-amber-500/8",
      text: "text-amber-500",
      dot: "bg-amber-500",
      icon: "bg-amber-500/10 text-amber-500",
      badge: "bg-amber-500/10 text-amber-500",
    },
  },
  {
    id: "returned",
    label: "Returned / RTO",
    description: "Package could not be delivered and is being returned to sender.",
    icon: Undo2,
    count: 2,
    deliveryCharge: 1600,
    color: {
      bg: "bg-orange-500/8",
      text: "text-orange-500",
      dot: "bg-orange-500",
      icon: "bg-orange-500/10 text-orange-500",
      badge: "bg-orange-500/10 text-orange-500",
    },
  },
  {
    id: "cancelled",
    label: "Cancelled",
    description: "Shipment was cancelled before delivery was completed.",
    icon: X,
    count: 1,
    deliveryCharge: 0,
    color: {
      bg: "bg-red-500/8",
      text: "text-red-500",
      dot: "bg-red-500",
      icon: "bg-red-500/10 text-red-500",
      badge: "bg-red-500/10 text-red-500",
    },
  },
  {
    id: "on_hold",
    label: "On Hold",
    description: "Delivery is temporarily on hold pending further instructions.",
    icon: Clock,
    count: 2,
    deliveryCharge: 0,
    color: {
      bg: "bg-slate-500/8",
      text: "text-slate-500",
      dot: "bg-slate-500",
      icon: "bg-slate-500/10 text-slate-500",
      badge: "bg-slate-500/10 text-slate-500",
    },
  },
];

const totalOrders = COURIER_STATUSES.reduce((sum, s) => sum + s.count, 0);

const formatCurrency = (amount: number) =>
  "Rs. " + amount.toLocaleString("en-LK");

const formatRatio = (count: number) => {
  if (totalOrders === 0) return "0%";
  return ((count / totalOrders) * 100).toFixed(1) + "%";
};

// ─── Demo Recent Activity ──────────────────────────────────────

const RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: "1",
    orderNumber: "BR-1042",
    customerName: "Nimal Perera",
    status: "In Transit",
    waybill: "CF7294525",
    date: "26 Jul 2026",
    statusConfig: COURIER_STATUSES.find((s) => s.id === "in_transit")!,
  },
  {
    id: "2",
    orderNumber: "BR-1041",
    customerName: "Kasun Silva",
    status: "Delivered",
    waybill: "AF7294526",
    date: "25 Jul 2026",
    statusConfig: COURIER_STATUSES.find((s) => s.id === "delivered")!,
  },
  {
    id: "3",
    orderNumber: "BR-1040",
    customerName: "Amali Fernando",
    status: "Rescheduled",
    waybill: "CF7294527",
    date: "24 Jul 2026",
    statusConfig: COURIER_STATUSES.find((s) => s.id === "rescheduled")!,
  },
  {
    id: "4",
    orderNumber: "BR-1039",
    customerName: "Sajith Kumara",
    status: "Returned / RTO",
    waybill: "AF7294528",
    date: "24 Jul 2026",
    statusConfig: COURIER_STATUSES.find((s) => s.id === "returned")!,
  },
];

// ─── Animations ────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const STATUS_TABLE_COLUMNS = ["Status", "Number of Orders", "Delivery Charge", "Ratio"] as const;

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CourierPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <motion.div
      className="space-y-5 lg:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER                                            */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Courier
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Track and manage your courier deliveries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "group relative inline-flex h-9 shrink-0 select-none items-center justify-center gap-2 overflow-hidden",
              "rounded-[10px] border border-border bg-background px-3.5 text-sm font-medium text-muted-foreground",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:pointer-events-none disabled:opacity-45",
            )}
            aria-label="Refresh courier status"
          >
            {refreshing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span className="relative z-10">Refresh</span>
          </button>
          <Link
            href="/dashboard/settings?tab=courier#courier-provider"
            className={cn(
              "group relative inline-flex h-9 shrink-0 select-none items-center justify-center overflow-hidden",
              "rounded-[10px] border border-border bg-background px-3 text-sm font-medium text-muted-foreground",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Courier settings"
          >
            <Settings2 className="size-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* HERO — CONNECTED COURIER + METRIC                      */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[20px] bg-hero p-5 text-hero-foreground shadow-lg shadow-hero/15 sm:p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,var(--hero-accent),transparent_32%),radial-gradient(circle_at_90%_20%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(oklch(1_0_0_/_0.16)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Courier identity */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-hero-foreground/10 backdrop-blur-sm">
                <Truck className="size-6 text-hero-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success" />
                  <span className="text-sm font-medium text-hero-foreground/60">
                    Connected
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                  You&apos;re connected with <span className="text-hero-foreground">Royal Express</span>
                </h2>
                <p className="mt-0.5 text-sm text-hero-foreground/60">
                  Orders are synced via Curfox API
                </p>
              </div>
            </div>

            {/* Right: Active orders metric */}
            <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.08] p-3.5 backdrop-blur-sm sm:p-4">
              <p className="text-xs font-medium text-hero-foreground/60">
                Total Orders
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-hero-foreground tabular-nums">
                {totalOrders}
              </p>
              <p className="mt-0.5 text-xs text-hero-foreground/50">
                All shipments in the system
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* EVENT STATUS OVERVIEW                                   */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Truck className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Courier Event Status
            </h2>
            <p className="text-sm text-muted-foreground">
              Current status distribution across all shipments
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURIER_STATUSES.map((status, index) => {
            const Icon = status.icon;
            const isHovered = hoveredCard === status.id;

            return (
              <motion.div
                key={status.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                onMouseEnter={() => setHoveredCard(status.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border/30 p-4",
                  "transition-all duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "active:scale-[0.98]",
                  "focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  status.color.bg,
                )}
              >
                {/* Hover glow */}
                <span
                  className={cn(
                    "pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500",
                    status.color.dot,
                    isHovered && "opacity-20",
                  )}
                />

                {/* Top: Icon + Count Badge */}
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200 group-hover:scale-105",
                      status.color.icon,
                      status.color.icon.includes("ring") ? "" : "ring-transparent",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                      status.color.badge,
                    )}
                  >
                    {status.count} {status.count === 1 ? "order" : "orders"}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", status.color.dot)} />
                    <p className="text-base font-semibold text-foreground">
                      {status.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
                    {status.description}
                  </p>
                </div>

                {/* Bottom accent bar on hover */}
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 transition-transform duration-300 ease-out",
                    status.color.dot,
                    isHovered && "scale-x-100",
                  )}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* RECENT ACTIVITY                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="glass-card overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RefreshCw className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Activity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest courier status updates
                </p>
              </div>
            </div>

            <button
              type="button"
              className="group flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/5"
            >
              View All
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Order", "Customer", "Waybill", "Status", "Date"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={cn(
                          "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                          heading === "Status" && "text-center",
                        )}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {RECENT_ACTIVITY.map((item) => {
                  const c = item.statusConfig.color;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        #{item.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">
                        {item.customerName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {item.waybill}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            c.badge,
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full", c.dot)} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {item.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-border/30 sm:hidden">
            {RECENT_ACTIVITY.map((item) => {
              const Icon = item.statusConfig.icon;
              const c = item.statusConfig.color;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      c.icon,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        #{item.orderNumber}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          c.badge,
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {item.customerName} · {item.waybill} · {item.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-11 w-full items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 active:bg-primary/10 disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {refreshing ? "Updating..." : "Refresh Status"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* STATUS STATISTICS TABLE                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="glass-card overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackageCheck className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Status Statistics
                </h3>
                <p className="text-xs text-muted-foreground">
                  Breakdown of orders by courier status
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {STATUS_TABLE_COLUMNS.map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                        heading === "Delivery Charge" && "text-right",
                        heading === "Ratio" && "text-right",
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {COURIER_STATUSES.map((status) => {
                  const c = status.color;
                  const Icon = status.icon;
                  return (
                    <tr
                      key={status.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg",
                              c.icon,
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {status.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {status.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            c.badge,
                          )}
                        >
                          {status.count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">
                        {status.deliveryCharge > 0
                          ? formatCurrency(status.deliveryCharge)
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", c.dot)}
                              style={{
                                width: formatRatio(status.count),
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-foreground">
                            {formatRatio(status.count)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-border/30 sm:hidden">
            {COURIER_STATUSES.map((status) => {
              const c = status.color;
              const Icon = status.icon;
              return (
                <div
                  key={status.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      c.icon,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {status.label}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          c.badge,
                        )}
                      >
                        {status.count}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[13px] text-muted-foreground">
                      <span>
                        {status.deliveryCharge > 0
                          ? formatCurrency(status.deliveryCharge)
                          : "No charge"}
                      </span>
                      <span className="tabular-nums">{formatRatio(status.count)}</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", c.dot)}
                        style={{ width: formatRatio(status.count) }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
