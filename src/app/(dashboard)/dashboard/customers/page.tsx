"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  MessageCircle,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useReadOnlyMode } from "@/providers/readonly-mode-provider";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-media-query";
import { useWhatsAppAction } from "@/components/whatsapp/use-whatsapp-action";
import {
  CustomerDetailDialog,
  type CustomerDetail,
} from "@/components/customers/customer-detail-dialog";
import { SRI_LANKA_DISTRICTS } from "@/constants/districts";

// ─── Animations ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ─── Types ─────────────────────────────────────────────────────────

interface Customer {
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

// ─── Helpers ────────────────────────────────────────────────────────

/** Normalize phone for consistent matching (strip spaces, dashes, parens). */
function normalizePhone(phone: string | null): string {
  if (!phone) return "";
  return phone.replace(/[\s\-()]/g, "").replace(/^0/, "");
}

/**
 * Fallback: compute customers from orders when the customers table is empty.
 * This runs client-side and groups orders by normalized phone number.
 */
async function computeCustomersFromOrders(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
): Promise<Customer[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, business_id, customer_name, customer_phone, customer_whatsapp, customer_email, customer_address, customer_district, customer_city, total, advance_paid, payment_status, created_at",
    )
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .not("customer_phone", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !orders || orders.length === 0) return [];

  // Group by normalized phone
  const grouped = new Map<
    string,
    {
      orders: typeof orders;
      latest: (typeof orders)[number];
    }
  >();

  for (const order of orders) {
    const phone = order.customer_phone as string | null;
    const key = normalizePhone(phone);
    if (!key || key.length < 5) continue;

    const existing = grouped.get(key);
    if (existing) {
      existing.orders.push(order);
    } else {
      grouped.set(key, { orders: [order], latest: order });
    }
  }

  return Array.from(grouped.entries()).map(([key, { orders: group, latest }], i) => {
    const totalOrders = group.length;
    const lifetimeSpend = group.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingBalance = group
      .filter((o) => o.payment_status !== "paid")
      .reduce((sum, o) => sum + Math.max(0, Number(o.total || 0) - Number(o.advance_paid || 0)), 0);

    return {
      id: `computed-${key}-${i}`,
      business_id: businessId,
      name: String(latest.customer_name || "Walk-in customer"),
      phone: latest.customer_phone ? String(latest.customer_phone) : null,
      whatsapp: latest.customer_whatsapp ? String(latest.customer_whatsapp) : null,
      email: latest.customer_email ? String(latest.customer_email) : null,
      address: latest.customer_address ? String(latest.customer_address) : null,
      district: latest.customer_district ? String(latest.customer_district) : null,
      nearest_city: latest.customer_city ? String(latest.customer_city) : null,
      lifetime_spend: lifetimeSpend,
      total_orders: totalOrders,
      pending_balance: pendingBalance,
      created_at: String(latest.created_at),
    };
  });
}

// ─── Main Page ─────────────────────────────────────────────────────

function CustomersPageInner() {
  const { guard } = useReadOnlyMode();

  // ─── Data ────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── UI State ────────────────────────────────────────────────
  const [activeSort, setActiveSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({ key: "total_orders", direction: "desc" });
  const [districtFilter, setDistrictFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Detail Dialog ───────────────────────────────────────────
  const [detailCustomer, setDetailCustomer] = useState<CustomerDetail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  // ─── Delete State ────────────────────────────────────────────
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ─── Mobile ──────────────────────────────────────────────────
  const isMobile = useIsMobile();

  // ─── WhatsApp ────────────────────────────────────────────────
  const {
    handleAction: handleWhatsAppAction,
    renderDialogs: renderWhatsAppDialogs,
  } = useWhatsAppAction();

  // ─── Read query params ──────────────────────────────────────
  const searchParams = useSearchParams();

  useEffect(() => {
    const taskId = window.setTimeout(() => {
      const search = searchParams.get("search");
      if (search) setSearchQuery(search);
      const district = searchParams.get("district");
      if (district) setDistrictFilter(district);
    }, 0);
    return () => window.clearTimeout(taskId);
  }, [searchParams]);

  // ─── Data Fetching ──────────────────────────────────────────
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.replace("/login?redirect=/dashboard/customers");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();
        const bizId = (
          profile as { business_id: string | null } | null
        )?.business_id;
        if (!bizId) throw new Error("No business found for your account.");

        const { data, error: fetchError } = await supabase
          .from("customers")
          .select(
            "id, business_id, name, phone, whatsapp, email, address, district, nearest_city, lifetime_spend, total_orders, pending_balance, created_at",
          )
          .eq("business_id", bizId)
          .is("deleted_at", null)
          .order("total_orders", { ascending: false })
          .limit(500);

        if (fetchError) throw new Error(fetchError.message);

        let customersList = (data || []).map((c) => ({
          id: String(c.id),
          business_id: String(c.business_id),
          name: String(c.name || "Walk-in customer"),
          phone: c.phone ? String(c.phone) : null,
          whatsapp: c.whatsapp ? String(c.whatsapp) : null,
          email: c.email ? String(c.email) : null,
          address: c.address ? String(c.address) : null,
          district: c.district ? String(c.district) : null,
          nearest_city: c.nearest_city ? String(c.nearest_city) : null,
          lifetime_spend: Number(c.lifetime_spend || 0),
          total_orders: Number(c.total_orders || 0),
          pending_balance: Number(c.pending_balance || 0),
          created_at: String(c.created_at),
        }));

        // ── Fallback: compute customers from orders if table is empty ──
        if (customersList.length === 0) {
          customersList = await computeCustomersFromOrders(supabase, bizId);
        }

        setCustomers(customersList);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Customers fetch error", err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [fetchTrigger]);

  // ─── District Tabs ──────────────────────────────────────────
  const districtTabs = useMemo(() => {
    const present = new Set(
      customers.map((c) => c.district).filter(Boolean),
    );
    const tabs: { value: string; label: string }[] = [
      { value: "all", label: "All" },
      ...SRI_LANKA_DISTRICTS.filter((d) => present.has(d)).map((d) => ({
        value: d,
        label: d,
      })),
    ];
    return tabs;
  }, [customers]);

  // ─── Filtering & Sorting ─────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let r = [...customers];
    if (districtFilter !== "all") {
      r = r.filter((c) => c.district === districtFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.district && c.district.toLowerCase().includes(q)) ||
          (c.nearest_city && c.nearest_city.toLowerCase().includes(q)),
      );
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "name") cmp = a.name.localeCompare(b.name);
        else if (activeSort.key === "phone")
          cmp = (a.phone ?? "").localeCompare(b.phone ?? "");
        else if (activeSort.key === "district")
          cmp = (a.district ?? "").localeCompare(b.district ?? "");
        else if (activeSort.key === "total_orders")
          cmp = a.total_orders - b.total_orders;
        else if (activeSort.key === "lifetime_spend")
          cmp = a.lifetime_spend - b.lifetime_spend;
        else if (activeSort.key === "pending_balance")
          cmp = a.pending_balance - b.pending_balance;
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [customers, districtFilter, searchQuery, activeSort]);

  // ─── Sorting ─────────────────────────────────────────────────
  const handleSortToggle = (key: string) =>
    setActiveSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );

  // ─── Selection helpers ──────────────────────────────────────
  const addDeletingIds = useCallback((ids: string[]) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const removeDeletingIds = useCallback((ids: string[]) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  // ─── Delete ──────────────────────────────────────────────────
  const deleteCustomersFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    // Separate real DB IDs from computed (fallback) IDs
    const realIds = ids.filter((id) => !id.startsWith("computed-"));
    if (realIds.length > 0) {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: now, updated_at: now })
        .in("id", realIds);
      if (error) throw error;
    }
  }, []);

  const confirmSingleDelete = useCallback(() => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    addDeletingIds([id]);
    deleteCustomersFromDb([id])
      .then(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        removeDeletingIds([id]);
        const isComputed = id.startsWith("computed-");
        toast.success("Customer removed", {
          description: isComputed
            ? "Removed from view. Run the customer migration to persist changes."
            : "Customer has been permanently deleted.",
        });
      })
      .catch((err) => {
        removeDeletingIds([id]);
        toast.error("Failed to delete customer", {
          description:
            err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [deleteTargetId, deleteCustomersFromDb, addDeletingIds, removeDeletingIds]);

  const confirmBulkDelete = useCallback(() => {
    if (guard("bulk deleting")) return;
    const ids = [...selectedIds].filter(
      (id): id is string => typeof id === "string",
    );
    setShowBulkDelete(false);
    if (ids.length === 0) return;
    addDeletingIds(ids);
    setSelectedIds(new Set());
    const hasComputed = ids.some((id) => id.startsWith("computed-"));
    deleteCustomersFromDb(ids)
      .then(() => {
        setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
        removeDeletingIds(ids);
        toast.success("Customers removed", {
          description: hasComputed
            ? `Removed ${ids.length} customer${ids.length > 1 ? "s" : ""} from view. Run the customer migration to persist changes.`
            : `${ids.length} customer${ids.length > 1 ? "s" : ""} permanently deleted.`,
        });
      })
      .catch((err) => {
        removeDeletingIds(ids);
        toast.error("Failed to delete customers", {
          description:
            err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [
    selectedIds,
    deleteCustomersFromDb,
    addDeletingIds,
    removeDeletingIds,
    guard,
  ]);

  // ─── Keyboard: Delete selected rows ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Del") return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      )
        return;
      if (selectedIds.size > 0) {
        e.preventDefault();
        setShowBulkDelete(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds]);

  // ─── WhatsApp ────────────────────────────────────────────────
  const handleWhatsAppClick = useCallback(
    (customer: Customer) => {
      const phone = customer.whatsapp || customer.phone;
      if (!phone) return;
      handleWhatsAppAction(
        "order_whatsapp",
        {
          customer_name: customer.name,
          phone: customer.phone || "",
        },
        phone,
      );
    },
    [handleWhatsAppAction],
  );

  // ─── Detail Dialog ──────────────────────────────────────────
  const handleViewCustomer = useCallback((customer: Customer) => {
    setDetailCustomer(customer);
    setDetailOpen(true);
  }, []);

  // ─── Pagination ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFiltered, setPreviousFiltered] = useState(filteredCustomers);
  const [pageSize, setPageSize] = useState(25);
  if (filteredCustomers !== previousFiltered) {
    setPreviousFiltered(filteredCustomers);
    setCurrentPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(
    () =>
      filteredCustomers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredCustomers, currentPage, pageSize],
  );

  // ─── Active Filter Count ─────────────────────────────────────
  const activeFilterCount =
    (districtFilter !== "all" ? 1 : 0) + (searchQuery.trim() !== "" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setDistrictFilter("all");
    setSearchQuery("");
  }, []);

  // ─── Columns ─────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: "name",
        label: "Customer",
        sortable: true,
        sortKey: "name",
        className: "min-w-[180px]",
        renderCell: (customer) => (
          <div>
            <p className="text-sm font-semibold text-foreground">
              {customer.name}
            </p>
            {customer.phone && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {customer.phone}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "district",
        label: "District",
        sortable: true,
        sortKey: "district",
        hideOnMobile: true,
        renderCell: (customer) => (
          <span className="text-sm text-foreground">
            {customer.district || "—"}
          </span>
        ),
      },
      {
        id: "nearest_city",
        label: "City",
        hideOnMobile: true,
        renderCell: (customer) => (
          <span className="text-sm text-foreground">
            {customer.nearest_city || "—"}
          </span>
        ),
      },
      {
        id: "total_orders",
        label: "Orders",
        sortable: true,
        sortKey: "total_orders",
        renderCell: (customer) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {customer.total_orders}
          </span>
        ),
      },
      {
        id: "lifetime_spend",
        label: "Lifetime Spend",
        sortable: true,
        sortKey: "lifetime_spend",
        hideOnMobile: true,
        renderCell: (customer) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(customer.lifetime_spend)}
          </span>
        ),
      },
      {
        id: "pending_balance",
        label: "Pending",
        sortable: true,
        sortKey: "pending_balance",
        renderCell: (customer) => (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              customer.pending_balance > 0
                ? "text-warning"
                : "text-success",
            )}
          >
            {formatCurrency(customer.pending_balance)}
          </span>
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-24",
        renderCell: (customer) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleViewCustomer(customer);
              }}
              title="View details"
            >
              <Eye className="size-3.5" />
            </Button>
            {(customer.phone || customer.whatsapp) && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppClick(customer);
                }}
                title="Send WhatsApp"
              >
                <MessageCircle className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (guard("deleting customers")) return;
                setDeleteTargetId(customer.id);
              }}
              title="Delete customer"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [guard, handleViewCustomer, handleWhatsAppClick],
  );

  // ─── Mobile Card ─────────────────────────────────────────────
  const renderMobileCard = useCallback(
    (customer: Customer) => (
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {customer.name}
            </p>
            {customer.phone && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {customer.phone}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {customer.total_orders} order{customer.total_orders !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          {customer.district && (
            <p className="text-muted-foreground">
              {customer.district}
              {customer.nearest_city && `, ${customer.nearest_city}`}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">
              {formatCurrency(customer.lifetime_spend)}
            </span>
            {customer.pending_balance > 0 && (
              <span className="text-xs font-medium text-warning">
                {formatCurrency(customer.pending_balance)} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleViewCustomer(customer);
              }}
            >
              <Eye className="size-3.5" />
            </Button>
            {(customer.phone || customer.whatsapp) && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppClick(customer);
                }}
              >
                <MessageCircle className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTargetId(customer.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    ),
    [handleViewCustomer, handleWhatsAppClick],
  );

  // ─── Bulk Actions ────────────────────────────────────────────
  const bulkActions = useMemo(
    () => (
      <>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBulkDelete(true)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </>
    ),
    [],
  );

  // ─── Empty State ─────────────────────────────────────────────
  const emptyState = useMemo(
    () => ({
      icon: Users,
      title:
        customers.length > 0 && districtFilter !== "all"
          ? `No customers in ${districtFilter}`
          : "No customers yet",
      description:
        customers.length > 0 && districtFilter !== "all"
          ? "No customers match this district filter."
          : "Customers will appear here automatically as you create orders with phone numbers.",
    }),
    [customers.length, districtFilter],
  );

  // ─── Render ──────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your customer directory.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span className="font-medium tabular-nums">
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </motion.div>

      {/* ─── Filter Bar ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name, phone, email, or city..."
          status={{
            value: districtFilter,
            onChange: (v) => v && setDistrictFilter(v),
            options: districtTabs,
            label: "District",
          }}
          activeFilterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      {/* ─── Data Table ─────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <DataTable<Customer>
          columns={columns}
          data={paginatedCustomers}
          keyExtractor={(customer) => customer.id}
          loading={loading}
          error={error}
          empty={emptyState}
          sort={{ active: activeSort, onToggle: handleSortToggle }}
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredCustomers.length,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
          renderMobileCard={renderMobileCard}
          onRowDoubleClick={(customer) => handleViewCustomer(customer)}
          selection={{
            selectedIds,
            onSelectionChange: setSelectedIds,
            bulkActions,
          }}
          deletingKeys={deletingIds}
        />
      </motion.div>

      {/* ─── Delete Confirm Dialogs ─────────────────────────── */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete this customer?"
        description="This cannot be undone. Their order history will remain intact."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={
          selectedIds.size === 1
            ? "Delete this customer?"
            : `Delete ${selectedIds.size} customers?`
        }
        description="This cannot be undone. Their order history will remain intact."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />

      {/* ─── Customer Detail Dialog ──────────────────────────── */}
      <CustomerDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        customer={detailCustomer}
      />

      {/* ─── WhatsApp Dialogs ────────────────────────────────── */}
      {renderWhatsAppDialogs()}
    </motion.div>
  );
}

// ─── Exported Page (wrapped in Suspense for useSearchParams) ───────
export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Users className="size-6 animate-pulse" />
            <p className="text-sm font-medium">Loading customers…</p>
          </div>
        </div>
      }
    >
      <CustomersPageInner />
    </Suspense>
  );
}
