"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "./utils";

export interface ProductResult {
  id: string;
  name: string;
  category: string | null;
  selling_price: number;
}

export function ProductSearchPopover({
  onSelect,
}: {
  onSelect: (product: ProductResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.session.user.id)
          .single();
        const businessId = (profile as { business_id: string | null } | null)
          ?.business_id;
        if (!businessId) return;

        const { data } = await supabase
          .from("products")
          .select("id, name, category, selling_price")
          .eq("business_id", businessId)
          .ilike("name", `%${query}%`)
          .is("deleted_at", null)
          .limit(10);

        if (data) {
          setResults(
            data.map((p) => ({
              id: String(p.id),
              name: String(p.name),
              category: p.category ? String(p.category) : null,
              selling_price: Number(p.selling_price || 0),
            })),
          );
          setOpen(data.length > 0);
        }
      } catch (err) {
        console.error("Product search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-8 h-9"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          {loading ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              {query.trim() ? "No products found" : "Type to search products"}
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                onClick={() => {
                  onSelect(product);
                  setQuery("");
                  setOpen(false);
                  inputRef.current?.focus();
                }}
              >
                <Package className="size-3.5 shrink-0 text-muted-foreground/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {product.name}
                  </p>
                  {product.category && (
                    <p className="truncate text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(product.selling_price)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
