"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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
import { useGlobalSearchStore } from "@/stores/global-search-store";

// ─── Reuse the same types from the dialog ─────────────────────

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

type SearchCategory = "orders" | "customers" | "products" | "inventory" | "expenses" | "quotations";

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

const MAX_PER_CATEGORY = 4;

// ─── Helpers ───────────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="rounded-sm bg-primary/20 text-foreground px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

import { formatCurrency } from "@/lib/formatters";

// ─── Expose a ref-focusing imperative handle ───────────────────

export interface GlobalSearchPopoverHandle {
  focus: () => void;
}

// ─── Main Component ────────────────────────────────────────────

export const GlobalSearchPopover = forwardRef<{ focus: () => void }>(function GlobalSearchPopover(_props, ref) {
  const router = useRouter();
  const { addRecentSearch, recentSearches, removeRecentSearch, clearRecentSearches } =
    useGlobalSearchStore();

  // ─── Data Fetching ──────────────────────────────────────────
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const dataFetched = useRef(false);

  const fetchData = useCallback(async () => {
    if (dataFetched.current || index) return;
    dataFetched.current = true;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
      const bizId = (profile as { business_id: string | null } | null)?.business_id;
      if (!bizId) return;
      const limit = 500;
      const [ordersRes, customersRes, productsRes, inventoryRes, expensesRes, quotationsRes] = await Promise.all([
        supabase.from("orders").select("id, order_number, customer_name, total, status, waybill_id").eq("business_id", bizId).limit(limit).order("created_at", { ascending: false }),
        supabase.from("customers").select("id, name, phone, whatsapp, total_orders").eq("business_id", bizId).limit(limit).order("name"),
        supabase.from("products").select("id, name, category, selling_price").eq("business_id", bizId).limit(limit).order("name"),
        supabase.from("inventory_items").select("id, name, category, current_stock, supplier").eq("business_id", bizId).limit(limit).order("name"),
        supabase.from("expenses").select("id, item_name, category, supplier, total_cost").eq("business_id", bizId).limit(limit).order("expense_date", { ascending: false }),
        supabase.from("quotations").select("id, quotation_number, customer_name, status, grand_total").eq("business_id", bizId).limit(limit).order("created_at", { ascending: false }),
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
      console.error("Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [index]);

  // ─── Fuzzy Indexes ──────────────────────────────────────────
  const fuseInstances = useMemo(() => {
    if (!index) return null;
    const opts = { threshold: 0.4, distance: 100, ignoreLocation: true, minMatchCharLength: 1 };
    return {
      orders: new Fuse(index.orders, { ...opts, keys: [{ name: "order_number", weight: 3 }, { name: "customer_name", weight: 2 }, { name: "waybill_id", weight: 2 }] }),
      customers: new Fuse(index.customers, { ...opts, keys: [{ name: "name", weight: 3 }, { name: "phone", weight: 2 }, { name: "whatsapp", weight: 2 }] }),
      products: new Fuse(index.products, { ...opts, keys: [{ name: "name", weight: 3 }, { name: "category", weight: 1 }] }),
      inventory: new Fuse(index.inventory, { ...opts, keys: [{ name: "name", weight: 3 }, { name: "category", weight: 1 }, { name: "supplier", weight: 1 }] }),
      expenses: new Fuse(index.expenses, { ...opts, keys: [{ name: "item_name", weight: 3 }, { name: "category", weight: 1 }, { name: "supplier", weight: 1 }] }),
      quotations: new Fuse(index.quotations, { ...opts, keys: [{ name: "quotation_number", weight: 3 }, { name: "customer_name", weight: 2 }] }),
    };
  }, [index]);

  // ─── Input State & Debounce ─────────────────────────────────
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const popoverRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
      setIsFocused(true);
    },
  }));

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 250);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  useEffect(() => {
    if (query && !dataFetched.current) fetchData();
  }, [query, fetchData]);

  // ─── Close on click outside ─────────────────────────────────
  useEffect(() => {
    if (!isFocused) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFocused]);

  // ─── Flatten results for keyboard nav ───────────────────────
  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q || !fuseInstances) return [];
    const grouped: { cat: CategoryMeta; items: { id: string; node: React.ReactNode }[]; total: number }[] = [];
    for (const cat of CATEGORIES) {
      const fuse = fuseInstances[cat.key];
      if (!fuse) continue;
      const all = fuse.search(q);
      const items = all.slice(0, MAX_PER_CATEGORY).map((result) => {
        const item = result.item as any;
        return { id: `${cat.key}-${item.id}`, node: <ResultItem category={cat.key} item={item} query={q} /> };
      });
      if (items.length) grouped.push({ cat, items, total: all.length });
    }
    return grouped;
  }, [debouncedQuery, fuseInstances]);

  const flatItems = useMemo(() => {
    const flat: { id: string; catKey: SearchCategory }[] = [];
    for (const group of results) {
      for (const item of group.items) {
        flat.push({ id: item.id, catKey: group.cat.key });
      }
    }
    return flat;
  }, [results]);

  // ─── Handle Result Select ───────────────────────────────────
  const handleResultSelect = useCallback((id: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    setIsFocused(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    setQuery("");

    const catKey = id.split("-")[0] as SearchCategory;
    const routes: Record<string, string> = {
      orders: "/dashboard/orders",
      customers: "/dashboard/orders",
      products: "/dashboard/products",
      inventory: "/dashboard/inventory",
      expenses: "/dashboard/expenses",
      quotations: "/dashboard/quotations",
    };
    router.push(routes[catKey] || "/dashboard");
  }, [router, query, addRecentSearch]);

  // ─── Keyboard navigation ────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && flatItems[selectedIndex]) {
      e.preventDefault();
      handleResultSelect(flatItems[selectedIndex].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  }, [flatItems, selectedIndex, handleResultSelect]);

  const resultCount = flatItems.length;

  // ─── Render ─────────────────────────────────────────────────
  const showDropdown = isFocused && (query.trim() || recentSearches.length > 0);

  return (
    <div ref={popoverRef} className="relative hidden md:block flex-1 max-w-md">
      <div className="relative flex h-10 items-center gap-3 rounded-2xl border border-border/50 bg-muted/50 px-3 text-sm text-muted-foreground transition-all focus-within:border-primary/30 focus-within:bg-muted/80 focus-within:shadow-xs">
        <Search className="size-4 shrink-0 text-muted-foreground/60" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search orders, customers, products..."
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}
            className="shrink-0 rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
        <kbd className="shrink-0 rounded-md bg-card px-1.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm">
          /
        </kbd>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl border border-border/50 bg-popover shadow-xl"
          >
            {/* Header showing result count */}
            {query.trim() && (
              <div className="flex items-center gap-2 border-b border-border/30 px-3.5 py-2">
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground/60" />
                ) : (
                  <Search className="size-3.5 text-muted-foreground/60" />
                )}
                <span className="text-xs text-muted-foreground/70">
                  {loading ? "Searching…" : resultCount > 0 ? `${resultCount} results` : "No results"}
                </span>
              </div>
            )}

            {/* Results */}
            {query.trim() && results.length > 0 && (
              <div className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((group) => (
                  <div key={group.cat.key}>
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5">
                      <group.cat.icon className={cn("size-3", group.cat.color)} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {group.cat.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 ml-auto">{group.total}</span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item, i) => {
                        const flatIdx = flatItems.findIndex((f) => f.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleResultSelect(item.id)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                            className={cn(
                              "flex w-full items-center gap-2 px-3.5 py-1.5 text-left text-sm transition-colors",
                              selectedIndex === flatIdx ? "bg-muted/70" : "hover:bg-muted/30",
                            )}
                          >
                            {item.node}
                          </button>
                        );
                      })}
                      {group.total > MAX_PER_CATEGORY && (
                        <button
                          type="button"
                          onClick={() => {
                            if (query.trim()) addRecentSearch(query.trim());
                            setIsFocused(false);
                            setQuery("");
                            inputRef.current?.blur();
                            router.push(
                              group.cat.key === "orders" ? "/dashboard/orders" :
                              group.cat.key === "customers" ? "/dashboard/orders" :
                              group.cat.key === "products" ? "/dashboard/products" :
                              group.cat.key === "inventory" ? "/dashboard/inventory" :
                              group.cat.key === "expenses" ? "/dashboard/expenses" :
                              group.cat.key === "quotations" ? "/dashboard/quotations" : "/dashboard"
                            );
                          }}
                          className="flex w-full items-center justify-between px-3.5 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          <span>View all {group.cat.label.toLowerCase()}</span>
                          <ArrowRight className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent searches when input is empty */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="py-1">
                <div className="flex items-center justify-between px-3.5 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Recent
                  </span>
                  <button type="button" onClick={clearRecentSearches} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground/70">
                    Clear
                  </button>
                </div>
                {recentSearches.map((s) => (
                  <button
                    key={s.text + s.timestamp}
                    type="button"
                    onClick={() => { setQuery(s.text); inputRef.current?.focus(); }}
                    className="group flex w-full items-center gap-2 px-3.5 py-1.5 text-sm text-foreground/70 hover:bg-muted/30 transition-colors"
                  >
                    <Clock className="size-3 shrink-0 text-muted-foreground/40" />
                    <span className="flex-1 truncate text-left">{s.text}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(s.text); }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/60 transition-all"
                    >
                      <X className="size-2.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── ResultItem ────────────────────────────────────────────────

function ResultItem({ category, item, query: q }: { category: SearchCategory; item: any; query: string }) {
  switch (category) {
    case "orders":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ShoppingCart className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{highlightText(item.order_number, q)}</span>
              <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{formatEnumLabel(item.status)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span className="truncate">{highlightText(item.customer_name, q)}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/60">{formatCurrency(item.total)}</span>
            </div>
          </div>
        </div>
      );
    case "customers":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-success/10 text-success"><User className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{highlightText(item.name, q)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              {item.phone && <span>{highlightText(item.phone, q)}</span>}
              <span>•</span>
              <span>{item.total_orders} orders</span>
            </div>
          </div>
        </div>
      );
    case "products":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning"><Package className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{highlightText(item.name, q)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              {item.category && <span>{highlightText(item.category, q)}</span>}
              <span>•</span>
              <span className="font-semibold text-foreground/60">{formatCurrency(item.selling_price)}</span>
            </div>
          </div>
        </div>
      );
    case "inventory":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-info/10 text-info"><Boxes className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{highlightText(item.name, q)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span>Stock: {item.current_stock}</span>
              {item.supplier && <><span>•</span><span>{highlightText(item.supplier, q)}</span></>}
            </div>
          </div>
        </div>
      );
    case "expenses":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive"><ReceiptText className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{highlightText(item.item_name, q)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span>{highlightText(item.category, q)}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/60">{formatCurrency(item.total_cost)}</span>
            </div>
          </div>
        </div>
      );
    case "quotations":
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="size-3.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{highlightText(item.quotation_number, q)}</span>
              <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{formatEnumLabel(item.status)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span className="truncate">{highlightText(item.customer_name, q)}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/60">{formatCurrency(item.grand_total)}</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
