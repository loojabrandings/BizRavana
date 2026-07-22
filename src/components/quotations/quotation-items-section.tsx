"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronsUpDown,
  Package,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductSearchPopover, type ProductResult } from "@/components/orders/product-search-popover";
import type { QuotationFormLineItem } from "./types";
import { formatCurrency } from "./utils";

interface QuotationItemsSectionProps {
  items: QuotationFormLineItem[];
  errors: Record<string, string>;
  expiryDate: string;
  onUpdateExpiryDate: (date: string) => void;
  onAddItem: () => void;
  onUpdateItem: (index: number, updates: Partial<QuotationFormLineItem>) => void;
  onRemoveItem: (index: number) => void;
  categories: string[];
  businessId: string | null;
  onProductSelect: (product: ProductResult) => void;
}

function QuotationItemCard({
  item,
  index,
  errors,
  categories,
  businessId,
  onUpdate,
  onRemove,
}: {
  item: QuotationFormLineItem;
  index: number;
  errors: Record<string, string>;
  categories: string[];
  businessId: string | null;
  onUpdate: (index: number, updates: Partial<QuotationFormLineItem>) => void;
  onRemove: (index: number) => void;
}) {
  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const [products, setProducts] = useState<
    { id: string; name: string; selling_price: number }[]
  >([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const lineTotal = item.quantity * item.unit_price;

  // ─── Fetch products when category changes ─────────────────────
  useEffect(() => {
    if (!businessId || !item.category.trim()) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);

    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, selling_price")
        .eq("business_id", businessId)
        .eq("category", item.category)
        .is("deleted_at", null)
        .order("name", { ascending: true })
        .limit(50);

      if (!cancelled) {
        setProducts(
          (data || []).map((p) => ({
            id: String(p.id),
            name: String(p.name),
            selling_price: Number(p.selling_price || 0),
          })),
        );
        setLoadingProducts(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [businessId, item.category]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative rounded-xl border border-border/80 bg-muted/15 p-4 shadow-xs"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground/70">
          Item #{index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(index)}
          className="opacity-40 transition-opacity hover:opacity-100"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* ─── Row 1: Category + Product (searchable dropdowns) ──── */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* ─── Category Searchable Dropdown ──────────────────── */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Category</span>
          <Popover open={catOpen} onOpenChange={setCatOpen}>
            <PopoverTrigger
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors hover:bg-accent focus:border-ring focus:ring-[3px] focus:ring-ring/50",
                !item.category && "text-muted-foreground",
              )}
            >
              {item.category || "Select category..."}
              <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat}
                        value={cat}
                        onSelect={() => {
                          onUpdate(index, { category: cat, product_name: "", unit_price: 0 });
                          setCatOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            item.category === cat ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {cat}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* ─── Product Searchable Dropdown ───────────────────── */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Product <span className="text-destructive">*</span>
          </span>
          <Popover open={prodOpen} onOpenChange={setProdOpen}>
            <PopoverTrigger
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors hover:bg-accent focus:border-ring focus:ring-[3px] focus:ring-ring/50",
                errors[`items.${index}.product_name`] && "border-destructive",
                !item.product_name && "text-muted-foreground",
              )}
            >
              <span className="truncate">
                {item.product_name || (item.category ? "Search products..." : "Select a category first")}
              </span>
              <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search products..." />
                <CommandList>
                  <CommandEmpty>
                    {loadingProducts
                      ? "Loading..."
                      : item.category
                        ? "No products found in this category."
                        : "Select a category first."}
                  </CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={() => {
                          onUpdate(index, {
                            product_name: product.name,
                            category: item.category,
                            unit_price: product.selling_price,
                            quantity: 1,
                          });
                          setProdOpen(false);
                        }}
                      >
                        <Package className="mr-2 size-3.5 shrink-0 text-muted-foreground/60" />
                        <div className="flex flex-1 items-center justify-between">
                          <span className="truncate">{product.name}</span>
                          <span className="ml-2 shrink-0 text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(product.selling_price)}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors[`items.${index}.product_name`] && (
            <p className="text-sm text-destructive">{errors[`items.${index}.product_name`]}</p>
          )}
        </div>
      </div>

      {/* ─── Row 2: Qty + Unit Price + Line Total ───────────── */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Qty <span className="text-destructive">*</span>
          </span>
          <Input
            type="number"
            min={1}
            placeholder="1"
            value={item.quantity || ""}
            onChange={(e) =>
              onUpdate(index, {
                quantity: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className={cn("h-9", errors[`items.${index}.quantity`] && "border-destructive")}
          />
          {errors[`items.${index}.quantity`] && (
            <p className="text-sm text-destructive">{errors[`items.${index}.quantity`]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Unit Price</span>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={item.unit_price || ""}
            onChange={(e) =>
              onUpdate(index, {
                unit_price: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Line Total</span>
          <div className="flex h-9 items-center rounded-lg border border-input bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(lineTotal)}
          </div>
        </div>
      </div>

      {/* ─── Row 3: Item Notes ───────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">Item Notes</span>
        <Textarea
          placeholder="Notes for this item (optional)"
          value={item.notes}
          onChange={(e) => onUpdate(index, { notes: e.target.value })}
          className="min-h-[62px]"
        />
      </div>
    </motion.div>
  );
}

export function QuotationItemsSection({
  items,
  errors,
  expiryDate,
  onUpdateExpiryDate,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  categories,
  businessId,
  onProductSelect,
}: QuotationItemsSectionProps) {
  const lastItemRef = useRef<HTMLDivElement>(null);
  const prevItemCount = useRef(items.length);

  useEffect(() => {
    if (items.length > prevItemCount.current) {
      requestAnimationFrame(() => {
        lastItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
    prevItemCount.current = items.length;
  }, [items.length]);

  return (
    <>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
        Quotation Items
      </h2>

      {/* ─── Product Search ─────────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">
          Search from Products Catalog
        </span>
        <ProductSearchPopover onSelect={onProductSelect} />
      </div>

      {/* Expiry Date */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">Expiry Date</span>
        <Input
          type="date"
          value={expiryDate}
          onChange={(e) => onUpdateExpiryDate(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Item Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-6 text-center">
              <Package className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No items added yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Add items to this quotation manually.
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                ref={i === items.length - 1 ? lastItemRef : undefined}
              >
                <QuotationItemCard
                  item={item}
                  index={i}
                  errors={errors}
                  categories={categories}
                  businessId={businessId}
                  onUpdate={onUpdateItem}
                  onRemove={onRemoveItem}
                />
              </div>
            ))
          )}
        </AnimatePresence>

        {errors.items && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{errors.items}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-1">
        <Button
          variant="outline"
          onClick={onAddItem}
          className="w-full border-dashed text-sm font-medium"
        >
          <Plus className="size-3.5" />
          Add Another Item
          {items.length > 0 && (
            <span className="ml-1 text-muted-foreground">
              ({items.length})
            </span>
          )}
        </Button>
      </div>
    </>
  );
}
