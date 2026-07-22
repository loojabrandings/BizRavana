"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
  businessId?: string | null;
  /** Database table name — defaults to "categories" (product categories).
   *  Use "inventory_categories" or "expense_categories" for their respective tables. */
  tableName?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export function CategoryManager({
  open,
  onOpenChange,
  onCategoriesChange,
  businessId,
  tableName = "categories",
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch categories ─────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from(tableName)
        .select("id, name")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      setCategories((data || []).map((c) => ({
        id: String(c.id),
        name: String(c.name),
      })));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, tableName]);

  useEffect(() => {
    if (open) fetchCategories();
  }, [open, fetchCategories]);

  // ─── Add category ─────────────────────────────────────────────
  const handleAdd = useCallback(async () => {
    const name = newCategoryName.trim();
    if (!name || !businessId) return;

    // Check for duplicates
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from(tableName).insert({
        business_id: businessId,
        name,
      });

      if (error) throw new Error(error.message);

      setNewCategoryName("");
      toast.success(`"${name}" added`);
      onCategoriesChange();
      await fetchCategories();
    } catch (err) {
      console.error("Failed to add category:", err);
      toast.error("Failed to add category");
    } finally {
      setSaving(false);
      inputRef.current?.focus();
    }
  }, [newCategoryName, businessId, categories, onCategoriesChange, fetchCategories, tableName]);

  // ─── Start editing ────────────────────────────────────────────
  const handleStartEdit = useCallback((cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }, []);

  // ─── Save edit ────────────────────────────────────────────────
  const handleSaveEdit = useCallback(async (id: string) => {
    const name = editingName.trim();
    if (!name) {
      toast.error("Category name cannot be empty");
      return;
    }

    // Check for duplicates (excluding current)
    if (categories.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category name already exists");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from(tableName)
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new Error(error.message);

      setEditingId(null);
      setEditingName("");
      toast.success("Category updated");
      onCategoriesChange();
      await fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  }, [editingName, categories, onCategoriesChange, fetchCategories, tableName]);

  // ─── Cancel edit ──────────────────────────────────────────────
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  // ─── Delete category ──────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw new Error(error.message);

      toast.success("Category deleted");
      onCategoriesChange();
      await fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to delete category");
    }
  }, [deleteTargetId, onCategoriesChange, fetchCategories, tableName]);

  // ─── Keyboard: Enter to add ─────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd, saving]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="pb-2">
            <SheetTitle>Manage Categories</SheetTitle>
            <SheetDescription>
              {tableName === "inventory_categories"
                ? "Add, edit, or remove inventory categories."
                : tableName === "expense_categories"
                  ? "Add, edit, or remove expense categories."
                  : "Add, edit, or remove product categories."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* ─── Add new category ─────────────────────────────── */}
            <div className="border-b border-border/50 px-4 pb-4">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-9 flex-1"
                  disabled={saving}
                />
                <Button
                  variant="gradient"
                  size="icon-sm"
                  onClick={handleAdd}
                  disabled={!newCategoryName.trim() || saving}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {/* ─── Category list ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Add your first category above.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group flex items-center gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 transition-colors hover:bg-accent/50"
                      >
                        {editingId === cat.id ? (
                          /* ── Editing mode ────────────────────── */
                          <>
                            <Input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(cat.id);
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              className="h-8 flex-1 text-sm"
                              autoFocus
                              disabled={saving}
                            />
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={!editingName.trim() || saving}
                              className="text-success"
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </>
                        ) : (
                          /* ── Display mode ────────────────────── */
                          <>
                            <Tag className="size-3.5 shrink-0 text-muted-foreground/60" />
                            <span className="flex-1 truncate text-sm font-medium text-foreground">
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleStartEdit(cat)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setDeleteTargetId(cat.id)}
                                className="text-destructive/70 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* ─── Footer ────────────────────────────────────────── */}
            <div className="border-t border-border/50 px-4 py-3">
              <p className="text-xs text-muted-foreground/60">
                {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Delete confirm dialog ──────────────────────────────── */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete this category?"
        description="Products using this category will remain unchanged but will show the raw text instead of a categorized entry."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
