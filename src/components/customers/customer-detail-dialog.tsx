"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ExternalLink, MapPin, Phone, Mail, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────

export interface CustomerDetail {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  district: string | null;
  nearest_city: string | null;
  lifetime_spend: number;
  total_orders: number;
  pending_balance: number;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  advance_paid: number;
  status: string;
  payment_status: string;
  created_at: string;
}

// ─── Status Colors ─────────────────────────────────────────────────

const statusColorMap: Record<string, string> = {
  new_order: "text-primary",
  ready: "text-warning",
  packed: "text-orange-500",
  dispatched: "text-success",
  delivered: "text-muted-foreground",
  cancelled: "text-destructive",
  returned: "text-pink-500",
};

const paymentColorMap: Record<string, string> = {
  pending: "text-warning",
  advanced: "text-info",
  paid: "text-success",
};

// ─── Component ─────────────────────────────────────────────────────

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDetail | null;
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailDialogProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders for this customer when dialog opens
  useEffect(() => {
    if (!open || !customer) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .single();

        const bizId = (profile as { business_id: string | null } | null)
          ?.business_id;
        if (!bizId) return;

        // Match orders by phone number (more reliable than customer_id which may be NULL)
        let query = supabase
          .from("orders")
          .select(
            "id, order_number, customer_name, total, advance_paid, status, payment_status, created_at",
          )
          .eq("business_id", bizId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (customer.phone) {
          query = query.eq("customer_phone", customer.phone);
        } else {
          // Fallback: match by name if no phone
          query = query.eq("customer_name", customer.name);
        }

        const { data, error } = await query;

        if (error) throw error;
        setOrders(
          (data || []).map((o) => ({
            id: String(o.id),
            order_number: String(o.order_number),
            customer_name: String(o.customer_name || ""),
            total: Number(o.total || 0),
            advance_paid: Number(o.advance_paid || 0),
            status: String(o.status || "new_order"),
            payment_status: String(o.payment_status || "pending"),
            created_at: String(o.created_at),
          })),
        );
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [open, customer]);

  const orderColumns = useCallback(
    (): ColumnDef<CustomerOrder>[] => [
      {
        id: "order_number",
        label: "Order",
        sortable: true,
        sortKey: "created_at",
        renderCell: (order) => (
          <div>
            <p className="text-sm font-semibold text-foreground">
              {order.order_number}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {formatDate(order.created_at)}
            </p>
          </div>
        ),
      },
      {
        id: "total",
        label: "Total",
        renderCell: (order) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(order.total)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        renderCell: (order) => (
          <span
            className={cn(
              "text-xs font-semibold",
              statusColorMap[order.status] ?? "text-muted-foreground",
            )}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        id: "payment_status",
        label: "Payment",
        renderCell: (order) => (
          <span
            className={cn(
              "text-xs font-semibold",
              paymentColorMap[order.payment_status] ?? "text-muted-foreground",
            )}
          >
            {order.payment_status}
          </span>
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-10",
        renderCell: (order) => (
          <Link
            href={`/dashboard/orders?search=${encodeURIComponent(order.order_number)}`}
            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-3.5" />
          </Link>
        ),
      },
    ],
    [],
  );

  if (!customer) return null;

  const hasContact = customer.phone || customer.whatsapp || customer.email;
  const hasLocation = customer.district || customer.nearest_city || customer.address;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">{customer.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 -mx-6 px-6">
          {/* ─── Stats Cards ─────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center"
            >
              <ShoppingCart className="mx-auto mb-1.5 size-4 text-muted-foreground/60" />
              <p className="text-xl font-bold tabular-nums text-foreground">
                {customer.total_orders}
              </p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center"
            >
              <p className="text-xl font-bold tabular-nums text-foreground">
                {formatCurrency(customer.lifetime_spend)}
              </p>
              <p className="text-xs text-muted-foreground">Lifetime Spend</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center"
            >
              <p
                className={cn(
                  "text-xl font-bold tabular-nums",
                  customer.pending_balance > 0
                    ? "text-warning"
                    : "text-success",
                )}
              >
                {formatCurrency(customer.pending_balance)}
              </p>
              <p className="text-xs text-muted-foreground">Pending Balance</p>
            </motion.div>
          </div>

          {/* ─── Contact & Location ──────────────────────────── */}
          {(hasContact || hasLocation) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hasContact && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </h4>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-3.5 text-muted-foreground/60" />
                      <span className="text-foreground">{customer.phone}</span>
                    </div>
                  )}
                  {customer.whatsapp && customer.whatsapp !== customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-3.5 text-muted-foreground/60" />
                      <span className="text-foreground">
                        {customer.whatsapp}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (WhatsApp)
                      </span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-3.5 text-muted-foreground/60" />
                      <span className="text-foreground">{customer.email}</span>
                    </div>
                  )}
                </div>
              )}

              {hasLocation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </h4>
                  {customer.district && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-3.5 text-muted-foreground/60" />
                      <span className="text-foreground">
                        {customer.district}
                        {customer.nearest_city &&
                          `, ${customer.nearest_city}`}
                      </span>
                    </div>
                  )}
                  {customer.address && (
                    <p className="ml-5.5 text-sm text-muted-foreground">
                      {customer.address}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Order History ───────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Order History
              </h4>
              <Link
                href={`/dashboard/orders?search=${encodeURIComponent(customer.phone || customer.name)}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all in Orders →
              </Link>
            </div>

            <DataTable<CustomerOrder>
              columns={orderColumns()}
              data={orders}
              keyExtractor={(order) => order.id}
              loading={loading}
              empty={{
                icon: ShoppingCart,
                title: "No orders yet",
                description: "This customer hasn't placed any orders yet.",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
