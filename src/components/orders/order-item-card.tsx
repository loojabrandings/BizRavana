"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronsUpDown,
  ImagePlus,
  Package,
  Trash2,
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
import type { OrderFormLineItem } from "./types";
import { formatCurrency } from "./utils";

interface OrderItemCardProps {
  item: OrderFormLineItem;
  index: number;
  errors?: Record<string, string>;
  categories: string[];
  businessId: string | null;
  onUpdate: (index: number, updates: Partial<OrderFormLineItem>) => void;
  onRemove: (index: number) => void;
}

export function OrderItemCard({
  item,
  index,
  errors,
  categories,
  businessId,
  onUpdate,
  onRemove,
}: OrderItemCardProps) {
  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const [products, setProducts] = useState<
    { id: string; name: string; selling_price: number }[]
  >([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const lineTotal = item.quantity * item.unit_price;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous preview URL if exists
      if (item.imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(item.imagePreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      onUpdate(index, { imageFile: file, imagePreviewUrl: previewUrl });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveItemImage = () => {
    if (item.imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(item.imagePreviewUrl);
    }
    onUpdate(index, { imageFile: null, imagePreviewUrl: null });
  };

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
      {/* ─── Card header ─────────────────────────────────────── */}
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
                errors?.[`items.${index}.product_name`] && "border-destructive",
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
          {errors?.[`items.${index}.product_name`] && (
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
            className={cn("h-9", errors?.[`items.${index}.quantity`] && "border-destructive")}
          />
          {errors?.[`items.${index}.quantity`] && (
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
      <div className="mb-3 space-y-1.5">
        <span className="text-sm text-muted-foreground">Item Notes</span>
        <Textarea
          placeholder="Notes for this item (optional)"
          value={item.notes}
          onChange={(e) => onUpdate(index, { notes: e.target.value })}
          className="min-h-[62px]"
        />
      </div>

      {/* ─── Row 4: Attach Image ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        <label className={cn(
          "flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-sm font-medium text-muted-foreground transition-all",
          "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
          item.imagePreviewUrl && "border-primary/30",
        )}>
          <ImagePlus className="size-3.5" />
          {item.imagePreviewUrl ? "Change Image" : "Attach Image"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleItemImageChange}
          />
        </label>
        {item.imagePreviewUrl && (
          <button
            type="button"
            onClick={handleRemoveItemImage}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* ─── Image Preview ──────────────────────────────────── */}
      {item.imagePreviewUrl && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imagePreviewUrl}
            alt={`Item ${index + 1}`}
            className="max-h-24 w-full object-cover"
          />
        </div>
      )}
    </motion.div>
  );
}
