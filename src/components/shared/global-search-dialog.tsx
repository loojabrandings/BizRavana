"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  ShoppingCart,
  User,
  Package,
  Boxes,
  ReceiptText,
  FileText,
  Truck,
  Search,
  Clock,
  X,
  ArrowRight,
  Loader2,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn, formatEnumLabel } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGlobalSearchStore } from "@/stores/global-search-store";

// ─── Types ─────────────────────────────────────────────────────

interface SearchIndex {
  orders: OrderResult[];
  customers: CustomerResult[];
  products: ProductResult[];
  inventory: InventoryResult[];
  expenses: ExpenseResult[];
  quotations: QuotationResult[];
}

interface OrderResult {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  waybill_id: string | null;
}

interface CustomerResult {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  total_orders: number;
}

interface ProductResult {
  id: string;
  name: string;
  category: string | null;
  selling_price: number;
}

interface InventoryResult {
  id: string;
  name: string;
  category: string | null;
  current_stock: number;
  supplier: string | null;
}

interface ExpenseResult {
  id: string;
  item_name: string;
  category: string;
  supplier: string | null;
  total_cost: number;
}

interface QuotationResult {
  id: string;
  quotation_number: string;
  customer_name: string;
  status: string;
  grand_total: number;
}

type SearchCategory =
  | "orders"
  | "customers"
  | "products"
  | "inventory"
  | "expenses"
  | "quotations";

interface CategoryMeta {
  key: SearchCategory;
  label: string;
  icon: typeof ShoppingCart;
  color: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: "orders", label: "Orders", icon: ShoppingCart, color: "text-primary" },
  { key: "customers", label: "Customers", icon: Users, color: "text-success" },
  { key: "products", label: "Products", icon: Package, color: "text-warning" },
  { key: "inventory", label: "Inventory", icon: Boxes, color: "text-info" },
  { key: "expenses", label: "Expenses", icon: ReceiptText, color: "text-destructive" },
  { key: "quotations", label: "Quotations", icon: FileText, color: "text-primary/70" },
];

const MAX_PER_CATEGORY = 5;

// ─── Helpers ───────────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  // Escape special regex characters
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="rounded-sm bg-primary/20 text-foreground px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

import { formatCurrency } from "@/lib/formatters";

// ─── Grouped results ───────────────────────────────────────────

interface GroupedResults {
  category: CategoryMeta;
  items: { id: string; node: React.ReactNode; value: string }[];
  total: number;
}

// ─── Main Component ────────────────────────────────────────────

export function GlobalSearchDialog() {
  const router = useRouter();
  const { isOpen, setIsOpen, recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } =
    useGlobalSearchStore();

  // ─── Data Fetching & Indexing ──────────────────────────────
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const dataFetched = useRef(false);

  // Fetch all entities on mount
  useEffect(() => {
    if (!isOpen || dataFetched.current) return;
    dataFetched.current = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();
        const bizId = (profile as { business_id: string | null } | null)?.business_id;
        if (!bizId) return;
        setBusinessId(bizId);

        // Fetch up to 500 of each entity
        const limit = 500;

        const [ordersRes, customersRes, productsRes, inventoryRes, expensesRes, quotationsRes] =
          await Promise.all([
            supabase
              .from("orders")
              .select("id, order_number, customer_name, total, status, waybill_id")
              .eq("business_id", bizId)
              .limit(limit)
              .order("created_at", { ascending: false }),
            supabase
              .from("customers")
              .select("id, name, phone, whatsapp, total_orders")
              .eq("business_id", bizId)
              .limit(limit)
              .order("name"),
            supabase
              .from("products")
              .select("id, name, category, selling_price")
              .eq("business_id", bizId)
              .limit(limit)
              .order("name"),
            supabase
              .from("inventory_items")
              .select("id, name, category, current_stock, supplier")
              .eq("business_id", bizId)
              .limit(limit)
              .order("name"),
            supabase
              .from("expenses")
              .select("id, item_name, category, supplier, total_cost")
              .eq("business_id", bizId)
              .limit(limit)
              .order("expense_date", { ascending: false }),
            supabase
              .from("quotations")
              .select("id, quotation_number, customer_name, status, grand_total")
              .eq("business_id", bizId)
              .limit(limit)
              .order("created_at", { ascending: false }),
          ]);

        const mapData = <T,>(res: { data: T[] | null }): T[] => (res.data || []) as T[];

        setIndex({
          orders: mapData(ordersRes) as OrderResult[],
          customers: mapData(customersRes) as CustomerResult[],
          products: mapData(productsRes) as ProductResult[],
          inventory: mapData(inventoryRes) as InventoryResult[],
          expenses: mapData(expensesRes) as ExpenseResult[],
          quotations: mapData(quotationsRes) as QuotationResult[],
        });
      } catch (err) {
        console.error("Global search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen]);

  // Reset fetch flag when dialog closes
  useEffect(() => {
    if (!isOpen) {
      dataFetched.current = false;
    }
  }, [isOpen]);

  // ─── Fuse Instances ────────────────────────────────────────
  const fuseInstances = useMemo(() => {
    if (!index) return null;

    const fuseOptions = {
      threshold: 0.4,
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 1,
    };

    return {
      orders: new Fuse(index.orders, {
        ...fuseOptions,
        keys: [
          { name: "order_number", weight: 3 },
          { name: "customer_name", weight: 2 },
          { name: "waybill_id", weight: 2 },
        ],
      }),
      customers: new Fuse(index.customers, {
        ...fuseOptions,
        keys: [
          { name: "name", weight: 3 },
          { name: "phone", weight: 2 },
          { name: "whatsapp", weight: 2 },
        ],
      }),
      products: new Fuse(index.products, {
        ...fuseOptions,
        keys: [
          { name: "name", weight: 3 },
          { name: "category", weight: 1 },
        ],
      }),
      inventory: new Fuse(index.inventory, {
        ...fuseOptions,
        keys: [
          { name: "name", weight: 3 },
          { name: "category", weight: 1 },
          { name: "supplier", weight: 1 },
        ],
      }),
      expenses: new Fuse(index.expenses, {
        ...fuseOptions,
        keys: [
          { name: "item_name", weight: 3 },
          { name: "category", weight: 1 },
          { name: "supplier", weight: 1 },
        ],
      }),
      quotations: new Fuse(index.quotations, {
        ...fuseOptions,
        keys: [
          { name: "quotation_number", weight: 3 },
          { name: "customer_name", weight: 2 },
        ],
      }),
    };
  }, [index]);

  // ─── Search Input + Debounce ───────────────────────────────
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Reset query when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  // ─── Search Logic ──────────────────────────────────────────
  const results = useMemo((): GroupedResults[] => {
    const q = debouncedQuery.trim();
    if (!q || !fuseInstances) return [];

    const grouped: GroupedResults[] = [];

    for (const cat of CATEGORIES) {
      const fuse = fuseInstances[cat.key];
      if (!fuse) continue;

      const all = fuse.search(q);
      const items = all.slice(0, MAX_PER_CATEGORY).map((result) => {
        const item = result.item as any;
        return {
          id: `${cat.key}-${item.id}`,
          node: <ResultItem category={cat.key} item={item} query={q} />,
          value: item.name || item.order_number || item.quotation_number || item.item_name || "",
        };
      });

      if (items.length === 0) continue;

      grouped.push({
        category: cat,
        items,
        total: all.length,
      });
    }

    return grouped;
  }, [debouncedQuery, fuseInstances]);

  // ─── Handle Select ─────────────────────────────────────────
  const handleSelect = useCallback(
    (value: string) => {
      // value is "category-itemId"
      const [catKey, id] = value.split("-");

      if (query.trim()) {
        addRecentSearch(query.trim());
      }

      setIsOpen(false);

      switch (catKey) {
        case "orders":
          router.push(`/dashboard/orders`);
          break;
        case "customers":
          router.push(`/dashboard/orders?search=${encodeURIComponent(query)}`);
          break;
        case "products":
          router.push(`/dashboard/products`);
          break;
        case "inventory":
          router.push(`/dashboard/inventory`);
          break;
        case "expenses":
          router.push(`/dashboard/expenses`);
          break;
        case "quotations":
          router.push(`/dashboard/quotations`);
          break;
        default:
          break;
      }
    },
    [router, query, addRecentSearch, setIsOpen],
  );

  // ─── Recent Searches Click ─────────────────────────────────
  const handleRecentClick = useCallback(
    (text: string) => {
      setQuery(text);
    },
    [],
  );

  const handleClearSingle = useCallback(
    (text: string) => {
      removeRecentSearch(text);
    },
    [removeRecentSearch],
  );

  // ─── Render ─────────────────────────────────────────────────
  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Global Search"
      description="Search across all modules"
    >
      <Command shouldFilter={false}>
        <div className="relative">
          <CommandInput
            placeholder="Search orders, customers, products, expenses..."
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
        </div>

        <CommandList className="max-h-[70vh]">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading data…
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && results.length === 0 && (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-1 py-4">
                <Search className="size-8 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No results found
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Try a different search term
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Search results grouped by category */}
          {results.map((group) => (
            <CommandGroup key={group.category.key} heading={
              <span className="flex items-center gap-1.5">
                <group.category.icon className={cn("size-3.5", group.category.color)} />
                {group.category.label}
                <span className="text-xs text-muted-foreground/50 ml-auto">
                  ({group.total})
                </span>
              </span>
            }>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="aria-selected:bg-muted/80"
                >
                  {item.node}
                </CommandItem>
              ))}
              {group.total > MAX_PER_CATEGORY && (
                <button
                  type="button"
                  onClick={() => {
                    if (query.trim()) addRecentSearch(query.trim());
                    setIsOpen(false);
                    // Navigate to the category page
                    const routes: Record<string, string> = {
                      orders: "/dashboard/orders",
                      customers: "/dashboard/orders",
                      products: "/dashboard/products",
                      inventory: "/dashboard/inventory",
                      expenses: "/dashboard/expenses",
                      quotations: "/dashboard/quotations",
                    };
                    router.push(routes[group.category.key] || "/dashboard");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground/70 hover:text-foreground transition-colors rounded-sm"
                >
                  <span>View all {group.category.label.toLowerCase()}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </CommandGroup>
          ))}

          {/* Recent searches when input is empty */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="px-1 py-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-0.5">
                {recentSearches.map((s) => (
                  <div
                    key={s.text + s.timestamp}
                    className="group flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleRecentClick(s.text)}
                  >
                    <Clock className="size-3.5 shrink-0 text-muted-foreground/40" />
                    <span className="flex-1 truncate text-sm text-foreground/80">
                      {s.text}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSingle(s.text);
                      }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/70 transition-all"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when first opened */}
          {!query.trim() && recentSearches.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Search className="size-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/60">
                Search across orders, customers, products, expenses, and more
              </p>
              <p className="text-xs text-muted-foreground/40">
                Type to start searching
              </p>
            </div>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// ─── ResultItem Sub-Component ─────────────────────────────────

function ResultItem({
  category,
  item,
  query,
}: {
  category: SearchCategory;
  item: any;
  query: string;
}) {
  switch (category) {
    case "orders":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {highlightText(item.order_number, query)}
              </span>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatEnumLabel(item.status)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              <span>{highlightText(item.customer_name, query)}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/70">{formatCurrency(item.total)}</span>
            </div>
          </div>
        </div>
      );

    case "customers":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <User className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {highlightText(item.name, query)}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              {item.phone && <span>{highlightText(item.phone, query)}</span>}
              {item.phone && <span>•</span>}
              <span>{item.total_orders} orders</span>
            </div>
          </div>
        </div>
      );

    case "products":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Package className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {highlightText(item.name, query)}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              {item.category && <span>{highlightText(item.category, query)}</span>}
              {item.category && <span>•</span>}
              <span className="font-semibold text-foreground/70">{formatCurrency(item.selling_price)}</span>
            </div>
          </div>
        </div>
      );

    case "inventory":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
            <Boxes className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {highlightText(item.name, query)}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              <span>Stock: {item.current_stock}</span>
              {item.supplier && (
                <>
                  <span>•</span>
                  <span>{highlightText(item.supplier, query)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      );

    case "expenses":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ReceiptText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {highlightText(item.item_name, query)}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              {item.category && <span>{highlightText(item.category, query)}</span>}
              <span>•</span>
              <span className="font-semibold text-foreground/70">{formatCurrency(item.total_cost)}</span>
            </div>
          </div>
        </div>
      );

    case "quotations":
      return (
        <div className="flex w-full items-start gap-3 py-0.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {highlightText(item.quotation_number, query)}
              </span>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatEnumLabel(item.status)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground/70">
              <span>{highlightText(item.customer_name, query)}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/70">{formatCurrency(item.grand_total)}</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
