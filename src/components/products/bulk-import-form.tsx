"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileDown,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Package,
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import type { Category } from "@/components/products/category-manager";

// ─── Types ─────────────────────────────────────────────────────────

type WizardStep = "upload" | "preview" | "importing" | "done";

interface ParsedProduct {
  rowNumber: number;
  name: string;
  category: string;
  size_variant: string;
  selling_price: number;
  cost_price: number | null;
  add_to_inventory: boolean;
  is_active: boolean;
  errors: string[];
}

interface ImportResult {
  succeeded: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// ─── Props ─────────────────────────────────────────────────────────

interface BulkImportFormProps {
  businessId: string | null;
  categories: Category[];
  onCategoriesChange: () => void;
  onCancel: () => void;
  onComplete: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ["Product Name", "Category", "Size/Variant", "Selling Price (Rs.)"];

function normalizeStatus(val: unknown): boolean {
  const s = String(val || "").trim().toLowerCase();
  if (s === "inactive") return false;
  return true; // default to active
}

function normalizeLinkToInventory(val: unknown): boolean {
  const s = String(val || "").trim().toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}

function validateRow(row: Record<string, unknown>, rowIndex: number): string[] {
  const errors: string[] = [];
  // Note: row values are accessed by raw keys from XLSX; the header map
  // is built later in handleFile. Since validateRow is called per-row inside
  // the map callback, we access with hardcoded keys (already normalized via
  // getColValue in the caller) OR fall back to raw keys.
  const name = String(row["Product Name"] || "").trim();
  const category = String(row["Category"] || "").trim();
  const size = String(row["Size/Variant"] || "").trim();
  const price = Number(row["Selling Price (Rs.)"] || 0);

  if (!name) errors.push("Product Name is required");
  if (!category) errors.push("Category is required");
  if (!size) errors.push("Size/Variant is required");
  if (price <= 0) errors.push("Selling Price must be greater than 0");

  const status = String(row["Status"] || "").trim().toLowerCase();
  if (status && !["active", "inactive"].includes(status)) {
    errors.push(`Status must be "active" or "inactive" (got "${status}")`);
  }

  return errors;
}

/** Normalize a header string by stripping all Unicode whitespace variants */
function normalizeHeader(h: string): string {
  return h
    .trim()
    // Replace non-breaking spaces and other Unicode whitespace with regular space
    .replace(/[\u00A0\u2000-\u200A\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Build a map: normalized header → original header (as it appears in the XLSX keys) */
function buildHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of headers) {
    map.set(normalizeHeader(h), h);
  }
  return map;
}

/** Look up a value in a parsed row using a canonical column name, via the header map */
function getColValue(
  row: Record<string, unknown>,
  columnName: string,
  headerMap: Map<string, string>,
): unknown {
  const originalKey = headerMap.get(columnName.toLowerCase());
  return originalKey ? row[originalKey] : undefined;
}

function findMissingColumns(headers: string[], headerMap: Map<string, string>): string[] {
  return REQUIRED_COLUMNS.filter(
    (req) => !headerMap.has(req.toLowerCase()),
  );
}

// ─── Component: File Upload Zone ──────────────────────────────────

function FileUploadZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
        toast.error("Unsupported file type", {
          description: "Please upload an .xlsx, .xls, or .csv file.",
        });
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border/50">
        <Upload className="size-7 text-muted-foreground/60" />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drop your XLSX or CSV file here
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        or click to browse
      </p>
      <p className="mt-3 text-xs text-muted-foreground/60">
        Supported: .xlsx, .xls, .csv &nbsp;|&nbsp; Max: 500 rows
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so the same file can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function BulkImportForm({
  businessId,
  categories,
  onCategoriesChange: _onCategoriesChange,
  onCancel,
  onComplete,
}: BulkImportFormProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProduct[]>([]);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ─── Go back safely ──────────────────────────────────────────
  const handleCancel = useCallback(() => {
    if (step === "upload") {
      onCancel();
    } else {
      setShowCancelConfirm(true);
    }
  }, [step, onCancel]);

  // ─── Download Template (2-sheet XLSX) ────────────────────────
  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Instructions — list saved categories
    const instructionsRows: unknown[][] = [["Available Categories"]];
    if (categories.length > 0) {
      categories.forEach((c) => instructionsRows.push([c.name]));
    } else {
      instructionsRows.push([
        "(No categories yet. You can type any category name in your import file.)",
      ]);
    }
    const instSheet = XLSX.utils.aoa_to_sheet(instructionsRows);
    instSheet["!cols"] = [{ wch: 55 }];
    // Bold the header cell while preserving its value
    const instCell = instSheet["A1"];
    if (instCell) instSheet["A1"] = { ...instCell, font: { bold: true } as any };
    XLSX.utils.book_append_sheet(wb, instSheet, "Instructions");

    // Sheet 2: Products Template — headers + example row
    const headers = [
      "Product Name",
      "Category",
      "Size/Variant",
      "Selling Price (Rs.)",
      "Cost Price (Rs.)",
      "Link to Inventory",
      "Status",
    ];
    const exampleRow = [
      "Premium Photo Frame 8x10",
      categories[0]?.name || "Photo Frames",
      "8x10",
      2500,
      1200,
      "FALSE",
      "active",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, 24) }));

    // ── Data Validation dropdowns ──
    const validations: Record<string, XLSX.ColInfo> = {};
    // Category column (B) — dropdown from Instructions sheet (only if categories exist)
    if (categories.length > 0) {
      const lastCategoryRow = categories.length + 1; // A1 = header, data starts at A2
      validations["B2:B1048576"] = {
        type: "list",
        formula1: `'Instructions'!$A$2:$A$${lastCategoryRow}`,
        allowBlank: false,
        showErrorMessage: true,
        errorTitle: "Invalid Category",
        error: "Please select a category from the list, or refer to the Instructions sheet.",
      } as any;
    }
    // Link to Inventory column (F) — TRUE/FALSE dropdown
    validations["F2:F1048576"] = {
      type: "list",
      formula1: '"TRUE,FALSE"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid value",
      error: 'Please enter "TRUE" or "FALSE".',
    } as any;
    // Status column (G) — active/inactive dropdown
    validations["G2:G1048576"] = {
      type: "list",
      formula1: '"active,inactive"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error: 'Status must be "active" or "inactive".',
    } as any;
    ws["!dataValidations"] = validations;

    // Bold headers
    headers.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ws[cell]) ws[cell] = { ...ws[cell], font: { bold: true } as any };
    });
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");

    XLSX.writeFile(wb, "product_import_template.xlsx");
    toast.success("Template downloaded", {
      description: "Open the file, fill in your products, and upload it back.",
    });
  }, [categories]);

  // ─── Parse uploaded file ─────────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);

      const ext = file.name.split(".").pop()?.toLowerCase();
      const isCsv = ext === "csv";

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file");

          // CSV must be read as text (readAsText) to preserve UTF-8 encoding.
          // XLSX/XLS are binary ZIP archives and must be read as ArrayBuffer.
          const wb = isCsv
            ? XLSX.read(data, { type: "string" })
            : XLSX.read(data, { type: "array" });

          // Find the first sheet that has data with the expected columns.
          // Our template has "Instructions" (sheet 0) followed by "Products Template" (sheet 1).
          let ws: XLSX.WorkSheet | undefined;
          let json: Record<string, unknown>[] = [];
          let missing: string[] = [];
          const sheetNamesToTry = wb.SheetNames.slice(0, 3);
          for (const name of sheetNamesToTry) {
            const candidateWs = wb.Sheets[name];
            const candidateJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(candidateWs);
            if (candidateJson.length === 0) continue;
            const candidateHeaders = Object.keys(candidateJson[0] || {});
            const candidateMap = buildHeaderMap(candidateHeaders);
            const candidateMissing = findMissingColumns(candidateHeaders, candidateMap);
            if (candidateMissing.length === 0) {
              ws = candidateWs;
              json = candidateJson;
              missing = [];
              break;
            }
            missing = candidateMissing;
          }

          if (!ws || json.length === 0) {
            toast.error("No data found", {
              description: "The file appears to be empty or has no data rows.",
            });
            return;
          }

          if (missing.length > 0) {
            setMissingCols(missing);
            toast.error("Missing required columns", {
              description: `Could not find: ${missing.join(", ")}`,
            });
            return;
          }
          setMissingCols([]);

          // Build header map from the selected sheet
          const headers = Object.keys(json[0] || {});
          const headerMap = buildHeaderMap(headers);

          // Parse & validate rows
          const rows: ParsedProduct[] = json.map((rawRow, i) => {
            // Build a clean row with all keys resolved via headerMap,
            // so both validateRow and field extraction see the same clean values
            const row: Record<string, unknown> = {};
            for (const col of ["Product Name","Category","Size/Variant","Selling Price (Rs.)","Cost Price (Rs.)","Link to Inventory","Status"]) {
              row[col] = getColValue(rawRow, col, headerMap);
            }

            const errors = validateRow(row, i + 2);
            return {
              rowNumber: i + 2,
              name: String(row["Product Name"] || "").trim(),
              category: String(row["Category"] || "").trim(),
              size_variant: String(row["Size/Variant"] || "").trim(),
              selling_price: Number(row["Selling Price (Rs.)"] || 0),
              cost_price: (() => {
                const v = Number(row["Cost Price (Rs.)"] || 0);
                return v > 0 ? v : null;
              })(),
              add_to_inventory: normalizeLinkToInventory(row["Link to Inventory"]),
              is_active: normalizeStatus(row["Status"]),
              errors,
            };
          });

          if (rows.length > 500) {
            toast.error("Too many rows", {
              description: `Found ${rows.length} rows. Maximum is 500.`,
            });
            return;
          }

          setParsedRows(rows);
          setStep("preview");
        } catch (err) {
          console.error("Parse error:", err);
          toast.error("Failed to parse file", {
            description:
              err instanceof Error ? err.message : "Unknown error",
          });
        }
      };
      if (isCsv) {
        reader.readAsText(file); // browser decodes UTF-8 properly
      } else {
        reader.readAsArrayBuffer(file);
      }
    },
    [],
  );

  // ─── Computed preview — count valid vs invalid ──────────────
  const validRows = useMemo(
    () => parsedRows.filter((r) => r.errors.length === 0),
    [parsedRows],
  );
  const invalidRows = useMemo(
    () => parsedRows.filter((r) => r.errors.length > 0),
    [parsedRows],
  );

  // ─── Batch Import ────────────────────────────────────────────
  const handleImport = useCallback(async () => {
    if (!businessId) {
      toast.error("No business found");
      return;
    }

    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setStep("importing");
    setImportProgress(0);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Not authenticated");
        setStep("preview");
        return;
      }

      const results: ImportResult = { succeeded: 0, failed: 0, errors: [] };
      const currentTime = new Date().toISOString();
      const CHUNK_SIZE = 50;
      const total = validRows.length;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = validRows.slice(i, i + CHUNK_SIZE);

        // Insert products
        const dbRows = chunk.map((r) => ({
          business_id: businessId,
          name: r.name,
          category: r.category,
          size_variant: r.size_variant || null,
          selling_price: r.selling_price,
          cost_price: r.cost_price,
          is_active: r.is_active,
          created_by: session.user.id,
          created_at: currentTime,
          updated_at: currentTime,
        }));

        const { data: insertedProducts, error } = await supabase
          .from("products")
          .insert(dbRows)
          .select("id, name");

        if (error) {
          chunk.forEach((r) => {
            results.failed++;
            results.errors.push({
              row: r.rowNumber,
              message: error.message || "Database error",
            });
          });
        } else {
          results.succeeded += chunk.length;

          // Handle Link to Inventory for inserted products
          const inventoryLinks: { productId: string; name: string; category: string | null; size_variant: string | null; cost_price: number | null }[] = [];
          insertedProducts?.forEach((p, idx) => {
            const originalRow = chunk[idx];
            if (originalRow?.add_to_inventory && p?.id) {
              inventoryLinks.push({
                productId: String(p.id),
                name: originalRow.name,
                category: originalRow.category,
                size_variant: originalRow.size_variant || null,
                cost_price: originalRow.cost_price,
              });
            }
          });

          if (inventoryLinks.length > 0) {
            // Create inventory items
            const { data: invItems, error: invError } = await supabase
              .from("inventory_items")
              .insert(
                inventoryLinks.map((link) => ({
                  business_id: businessId,
                  name: link.name,
                  category: link.category,
                  size_variant: link.size_variant,
                  unit_cost: link.cost_price,
                  current_stock: 0,
                })),
              )
              .select("id");

            if (!invError && invItems) {
              // Link each inventory item back to its product
              for (let j = 0; j < inventoryLinks.length; j++) {
                const invId = invItems[j]?.id;
                if (invId) {
                  await supabase
                    .from("products")
                    .update({ inventory_item_id: String(invId) })
                    .eq("id", inventoryLinks[j].productId);
                }
              }
            }
          }
        }

        const progress = Math.min(
          100,
          Math.round(((i + CHUNK_SIZE) / total) * 100),
        );
        setImportProgress(progress);
      }

      setImportResult(results);
      setStep("done");
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
      setStep("preview");
    }
  }, [businessId, validRows]);

  // ─── Reset and go back to upload ────────────────────────────
  const handleReset = useCallback(() => {
    setStep("upload");
    setFileName("");
    setParsedRows([]);
    setMissingCols([]);
    setImportProgress(0);
    setImportResult(null);
  }, []);

  // ─── Keyboard: Escape to go back ─────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleCancel]);

  // ─── Update a specific row field & re-validate ─────────────
  const updateRow = useCallback((index: number, field: keyof ParsedProduct, value: unknown) => {
    setParsedRows((prev) => {
      const next = prev.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: value };
        // Re-validate using a minimal row object
        const row: Record<string, unknown> = {
          "Product Name": updated.name,
          "Category": updated.category,
          "Size/Variant": updated.size_variant,
          "Selling Price (Rs.)": updated.selling_price,
          "Status": updated.is_active ? "active" : "inactive",
        };
        updated.errors = validateRow(row, updated.rowNumber);
        return updated;
      });
      return next;
    });
  }, []);

  // ─── Computed preview counts ─────────────────────────────────
  const totalCount = parsedRows.length;
  const validCount = validRows.length;
  const invalidCount = invalidRows.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className="flex items-start justify-between px-8 pt-7 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Import Products from File
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "upload" && "Upload an XLSX or CSV file with your product data."}
            {step === "preview" && `Review the parsed data before importing.`}
            {step === "importing" && "Importing products into your catalog..."}
            {step === "done" && importResult && "Import complete!"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator />

      {/* ═══════ Body ════════════════════════════════════════════════ */}

      {/* ─── STEP: Upload ──────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-6 px-8 py-8">
          <FileUploadZone onFile={handleFile} disabled={false} />

          <div className="flex items-center justify-center">
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="size-3.5" />
              Download Template
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP: Preview ─────────────────────────────────────── */}
      {step === "preview" && (
        <div className="space-y-6 px-8 py-8">
          {/* File info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="size-4" />
            <span className="font-medium text-foreground">{fileName}</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{totalCount} product{totalCount !== 1 ? "s" : ""} found</span>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-sm font-medium text-success">
              <Check className="size-3.5" />
              {validCount} valid
            </div>
            {invalidCount > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-sm font-medium text-destructive">
                <AlertTriangle className="size-3.5" />
                {invalidCount} with errors
              </div>
            )}
          </div>

          {/* Data table preview */}
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Product Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Size/Variant
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Selling Price
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cost Price
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Link to Inv.
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-t border-border/30 transition-colors",
                        row.errors.length > 0
                          ? "bg-destructive/5"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {row.rowNumber}
                      </td>
                      {/* Product Name */}
                      <td className="px-1 py-1">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateRow(i, "name", e.target.value)}
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-2 text-sm font-medium text-foreground outline-none transition-colors focus:border-ring focus:ring-[2px] focus:ring-ring/40",
                            !row.name ? "border-destructive/50" : "border-border/60",
                          )}
                          placeholder="Product name..."
                        />
                      </td>
                      {/* Category */}
                      <td className="px-1 py-1">
                        <input
                          type="text"
                          value={row.category}
                          onChange={(e) => updateRow(i, "category", e.target.value)}
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-[2px] focus:ring-ring/40",
                            !row.category ? "border-destructive/50" : "border-border/60",
                          )}
                          placeholder="Category..."
                        />
                      </td>
                      {/* Size/Variant */}
                      <td className="px-1 py-1">
                        <input
                          type="text"
                          value={row.size_variant}
                          onChange={(e) => updateRow(i, "size_variant", e.target.value)}
                          className={cn(
                            "h-8 w-full rounded-md border border-border/60 bg-transparent px-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-[2px] focus:ring-ring/40",
                            !row.size_variant ? "border-destructive/50" : "border-border/60",
                          )}
                          placeholder="Size..."
                        />
                      </td>
                      {/* Selling Price */}
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          value={row.selling_price || ""}
                          onChange={(e) => updateRow(i, "selling_price", Number(e.target.value) || 0)}
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-2 text-right text-sm tabular-nums text-foreground outline-none transition-colors focus:border-ring focus:ring-[2px] focus:ring-ring/40",
                            row.selling_price <= 0 ? "border-destructive/50" : "border-border/60",
                          )}
                          placeholder="0"
                          min={0}
                        />
                      </td>
                      {/* Cost Price */}
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          value={row.cost_price ?? ""}
                          onChange={(e) => updateRow(i, "cost_price", e.target.value ? Number(e.target.value) : null)}
                          className="h-8 w-full rounded-md border border-border/60 bg-transparent px-2 text-right text-sm tabular-nums text-muted-foreground outline-none transition-colors focus:border-ring focus:ring-[2px] focus:ring-ring/40"
                          placeholder="—"
                          min={0}
                        />
                      </td>
                      {/* Link to Inventory */}
                      <td className="px-1 py-1 text-center">
                        <select
                          value={row.add_to_inventory ? "TRUE" : "FALSE"}
                          onChange={(e) => updateRow(i, "add_to_inventory", e.target.value === "TRUE")}
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-1 text-center text-xs font-semibold outline-none transition-colors",
                            row.add_to_inventory
                              ? "border-primary/30 text-primary"
                              : "border-border/60 text-muted-foreground",
                          )}
                        >
                          <option value="FALSE">FALSE</option>
                          <option value="TRUE">TRUE</option>
                        </select>
                      </td>
                      {/* Status */}
                      <td className="px-1 py-1 text-center">
                        <select
                          value={row.is_active ? "active" : "inactive"}
                          onChange={(e) => updateRow(i, "is_active", e.target.value === "active")}
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-1 text-center text-xs font-semibold outline-none transition-colors",
                            row.is_active
                              ? "border-success/30 text-success"
                              : "border-border/60 text-muted-foreground",
                          )}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      {/* Valid indicator */}
                      <td className="px-3 py-2.5 text-center">
                        {row.errors.length === 0 ? (
                          <Check className="mx-auto size-4 text-success" />
                        ) : (
                          <div className="group relative inline-flex">
                            <AlertTriangle className="mx-auto size-4 text-destructive" />
                            <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-xs text-popover-foreground shadow-lg group-hover:block">
                              <ul className="list-inside list-disc space-y-0.5">
                                {row.errors.map((err, j) => (
                                  <li key={j}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missing columns warning */}
          {missingCols.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-semibold">Missing required columns</p>
              <p className="mt-1 text-destructive/80">
                The file is missing: <strong>{missingCols.join(", ")}</strong>.
                Please use the template and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP: Importing ───────────────────────────────────── */}
      {step === "importing" && (
        <div className="space-y-8 px-8 py-16 text-center">
          <div className="flex justify-center">
            <Loader2 className="size-12 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Importing products...
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we add your products to the catalog.
            </p>
          </div>
          <div className="mx-auto max-w-sm space-y-2">
            <Progress value={importProgress} />
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (importProgress / 100) * validCount,
              )}{" "}
              of {validCount} imported
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP: Done ────────────────────────────────────────── */}
      {step === "done" && importResult && (
        <div className="space-y-6 px-8 py-10 text-center">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-success/10">
              {importResult.succeeded > 0 ? (
                <Package className="size-8 text-success" />
              ) : (
                <AlertTriangle className="size-8 text-destructive" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Import {importResult.failed > 0 && importResult.succeeded > 0
                ? "completed with errors"
                : importResult.failed > 0
                  ? "failed"
                  : "complete!"}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-success">
                <strong>{importResult.succeeded}</strong> added
              </span>
              {importResult.failed > 0 && (
                <span className="text-destructive">
                  <strong>{importResult.failed}</strong> skipped
                </span>
              )}
            </div>
          </div>

          {/* Error details */}
          {importResult.errors.length > 0 && (
            <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left text-sm">
              <p className="mb-2 font-semibold text-destructive">
                Errors
              </p>
              <ul className="list-inside list-disc space-y-1 text-destructive/80">
                {importResult.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
                {importResult.errors.length > 10 && (
                  <li className="text-muted-foreground">
                    ...and {importResult.errors.length - 10} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* ═══════ Sticky Action Bar ════════════════════════════════ */}
      <div className="flex items-center justify-between px-8 py-4">
        {step === "upload" && (
          <Button variant="ghost" onClick={onCancel} className="text-sm">
            Cancel
          </Button>
        )}

        {step === "preview" && (
          <>
            <Button
              variant="ghost"
              onClick={() => setStep("upload")}
              className="text-sm"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleImport}
                disabled={validCount === 0}
                className="min-w-[160px] text-sm"
              >
                <Upload className="size-3.5" />
                Import {validCount > 0 ? `${validCount} Product${validCount > 1 ? "s" : ""}` : ""}
              </Button>
            </div>
          </>
        )}

        {step === "importing" && (
          <div className="flex w-full justify-center">
            <p className="text-sm text-muted-foreground">
              Importing... please don&apos;t close this page.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-sm"
            >
              <Upload className="size-3.5" />
              Import Another File
            </Button>
            <Button variant="gradient" onClick={onComplete} className="text-sm">
              View Products
            </Button>
          </div>
        )}
      </div>

      {/* ─── Unsaved Progress Confirm Dialog ────────────────────── */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Leave import?"
        description={
          step === "preview"
            ? "You have parsed data that hasn't been imported yet. Are you sure you want to leave?"
            : "Your import progress will be lost. Are you sure you want to leave?"
        }
        confirmLabel="Leave"
        variant="destructive"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onCancel();
        }}
      />
    </motion.div>
  );
}
