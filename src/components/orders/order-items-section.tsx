"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderFormLineItem } from "./types";
import { OrderItemCard } from "./order-item-card";
import { ProductSearchPopover, type ProductResult } from "./product-search-popover";

interface OrderItemsSectionProps {
  items: OrderFormLineItem[];
  errors: Record<string, string>;
  expectedDeliveryDate: string;
  onUpdateDeliveryDate: (date: string) => void;
  onAddItem: () => void;
  onUpdateItem: (index: number, updates: Partial<OrderFormLineItem>) => void;
  onRemoveItem: (index: number) => void;
  categories: string[];
  businessId: string | null;
  onProductSelect: (product: ProductResult) => void;
}

export function OrderItemsSection({
  items,
  errors,
  expectedDeliveryDate,
  onUpdateDeliveryDate,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  categories,
  businessId,
  onProductSelect,
}: OrderItemsSectionProps) {
  const lastItemRef = useRef<HTMLDivElement>(null);
  const prevItemCount = useRef(items.length);

  // ─── Auto-scroll to newly added item ─────────────────────────
  useEffect(() => {
    if (items.length > prevItemCount.current) {
      // A new item was added — scroll to it after render
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
      {/* ─── Section Title ──────────────────────────────────────── */}
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70">
        <span>Order Items</span>
        {items.length > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary leading-none">
            {items.length}
          </span>
        )}
      </h2>

      {/* ─── Product Search ─────────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">
          Search from Products Catalog
        </span>
        <ProductSearchPopover onSelect={onProductSelect} />
      </div>

      {/* ─── Scheduled Delivery Date ────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">
          Scheduled Delivery Date
        </span>
        <Input
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => onUpdateDeliveryDate(e.target.value)}
          className="h-9"
        />
      </div>

      {/* ─── Item Cards ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-6 text-center">
              <Package className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No items added yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Add items from your product catalog or enter details manually.
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                ref={i === items.length - 1 ? lastItemRef : undefined}
              >
                <OrderItemCard
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

        {/* ─── Items-level error ────────────────────────────────── */}
        {errors.items && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{errors.items}</p>
          </div>
        )}
      </div>

      {/* ─── Add Another Item ─────────────────────────────────── */}
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
