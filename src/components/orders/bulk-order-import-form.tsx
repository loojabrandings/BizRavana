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
  ShoppingCart,
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { useOrdersSettings } from "@/stores/orders-settings-store";

// ─── Types ─────────────────────────────────────────────────────────

type WizardStep = "upload" | "preview" | "importing" | "done";

interface ParsedOrderItem {
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

interface ParsedOrder {
  rowNumber: number;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email: string;
  customer_address: string;
  customer_district: string;
  customer_city: string;
  remarks: string;
  created_date: string;
  dispatched_date: string;
  items: ParsedOrderItem[];
  discount: number;
  discount_type: string;
  delivery_charge: number;
  advance_paid: number;
  payment_method: string;
  status: string;
  payment_status: string;
  order_source: string;
  expected_delivery_date: string;
  errors: string[];
}

interface ImportResult {
  succeeded: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// ─── Helpers ───────────────────────────────────────────────────────

const REQUIRED_COLUMNS = [
  "Customer Name",
  "Address",
  "Phone",
  "Items",
  "Quantities",
  "Unit Prices",
];

const VALID_STATUSES = ["new_order", "ready", "packed", "dispatched", "delivered", "cancelled", "returned"];
const VALID_PAYMENT_STATUSES = ["pending", "advanced", "paid"];
const VALID_PAYMENT_METHODS = ["cod", "bank_transfer", "cash", "other"];
const VALID_DISCOUNT_TYPES = ["fixed", "percentage"];
const VALID_ORDER_SOURCES = ["ad", "whatsapp", "facebook", "instagram", "walkin", "referral", "website", "call", "other"];

function normalizeHeader(h: string): string {
  return h
    .trim()
    .replace(/[\u00A0\u2000-\u200A\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of headers) {
    map.set(normalizeHeader(h), h);
  }
  return map;
}

function getColValue(
  row: Record<string, unknown>,
  columnName: string,
  headerMap: Map<string, string>,
): unknown {
  const originalKey = headerMap.get(columnName.toLowerCase());
  return originalKey ? row[originalKey] : undefined;
}

function findMissingColumns(headers: string[], headerMap: Map<string, string>): string[] {
  return REQUIRED_COLUMNS.filter((req) => !headerMap.has(req.toLowerCase()));
}

function splitCSV(val: unknown): string[] {
  return String(val || "")
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseItemArrays(
  names: string[],
  quantities: string[],
  prices: string[],
  categories: string[],
  itemNotes: string[],
): { items: ParsedOrderItem[]; errors: string[] } {
  const items: ParsedOrderItem[] = [];
  const errors: string[] = [];
  const maxLen = Math.max(names.length, quantities.length, prices.length);

  for (let i = 0; i < maxLen; i++) {
    const name = names[i]?.trim();
    if (!name) {
      errors.push(`Item #${i + 1} has no product name`);
      continue;
    }
    const qty = Number(quantities[i]?.trim() || 0);
    if (qty <= 0) {
      errors.push(`"${name}" — quantity must be greater than 0`);
    }
    const price = Number(prices[i]?.trim() || 0);
    if (price <= 0) {
      errors.push(`"${name}" — unit price must be greater than 0`);
    }
    items.push({
      product_name: name,
      category: categories[i]?.trim() || "",
      quantity: qty > 0 ? qty : 1,
      unit_price: price > 0 ? price : 0,
      notes: itemNotes[i]?.trim() || "",
    });
  }
  return { items, errors };
}

function validateRow(row: Record<string, unknown>, _rowIndex: number): string[] {
  const errors: string[] = [];

  const customerName = String(row["Customer Name"] || "").trim();
  if (!customerName) errors.push("Customer Name is required");

  const address = String(row["Address"] || "").trim();
  if (!address) errors.push("Address is required");

  const phone = String(row["Phone"] || "").trim();
  if (!phone) errors.push("Phone is required");

  const itemsRaw = splitCSV(row["Items"]);
  const quantitiesRaw = splitCSV(row["Quantities"]);
  const pricesRaw = splitCSV(row["Unit Prices"]);
  const categoriesRaw = splitCSV(row["Item Categories"]);
  const itemNotesRaw = splitCSV(row["Item Notes"]);

  if (itemsRaw.length === 0) {
    errors.push("At least one item is required");
  }

  // Parse items and collect per-item errors
  const { errors: itemErrors } = parseItemArrays(itemsRaw, quantitiesRaw, pricesRaw, categoriesRaw, itemNotesRaw);
  errors.push(...itemErrors.map((e) => `Item: ${e}`));

  // Validate enum fields if provided
  const status = String(row["Status"] || "new_order").trim().toLowerCase();
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const paymentStatus = String(row["Payment Status"] || "pending").trim().toLowerCase();
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    errors.push(`Payment Status must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`);
  }

  const paymentMethod = String(row["Payment Method"] || "cash").trim().toLowerCase();
  if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`Payment Method must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`);
  }

  const discountType = String(row["Discount Type"] || "").trim().toLowerCase();
  if (discountType && !VALID_DISCOUNT_TYPES.includes(discountType)) {
    errors.push(`Discount Type must be \"fixed\" or \"percentage\"`);
  }

  const orderSource = String(row["Order Source"] || "").trim().toLowerCase();
  if (orderSource && !VALID_ORDER_SOURCES.includes(orderSource)) {
    errors.push(`Order Source must be one of: ${VALID_ORDER_SOURCES.join(", ")}`);
  }

  return errors;
}

/** Generate a sequential order number using the configured prefix and start */
function generateOrderNumber(index: number): string {
  const settings = useOrdersSettings.getState();
  const prefix = settings.orderNumberPrefix;
  const startNum = parseInt(settings.orderNumberStart || "1", 10) || 1;
  const padding = (settings.orderNumberStart || "1").length;
  const seq = String(startNum + index).padStart(padding, "0");
  return `${prefix}${seq}`;
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
      <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
      <p className="mt-3 text-xs text-muted-foreground/60">
        Supported: .xlsx, .xls, .csv &nbsp;|&nbsp; Max: 200 orders
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
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

interface BulkOrderImportFormProps {
  businessId: string | null;
  onCancel: () => void;
  onComplete: () => void;
}

export function BulkOrderImportForm({
  businessId,
  onCancel,
  onComplete,
}: BulkOrderImportFormProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedOrder[]>([]);
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

  // ─── Download Template ───────────────────────────────────────
  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Instructions
    const instructionsRows: unknown[][] = [
      ["Orders Bulk Import - Instructions"],
      [],
      ["All columns from the order form are supported. Required columns:"],
      ["  - Customer Name: Name of the customer"],
      ["  - Address: Customer shipping address"],
      ["  - Phone: Customer phone number"],
      ["  - Items: Product names separated by comma (e.g., \"Frame 8x10, Frame A4\")"],
      ["  - Quantities: Quantities in same order as Items, comma-separated"],
      ["  - Unit Prices: Unit prices in same order as Items, comma-separated"],
      [],
      ["Optional Columns:"],
      ["  - WhatsApp, Email: Additional customer contact info"],
      ["  - District, City: Customer location details"],
      ["  - Remarks: Order notes"],
      ["  - Created Date, Dispatched Date: YYYY-MM-DD format"],
      ["  - Item Categories: Comma-separated categories matching Items"],
      ["  - Item Notes: Comma-separated notes matching Items"],
      ["  - Discount: Amount (number)"],
      ["  - Discount Type: \"fixed\" (amount off) or \"percentage\""],
      ["  - Delivery Charge: Delivery fee amount"],
      ["  - Advance Paid: Amount already paid"],
      ["  - Payment Method: cash / cod / bank_transfer / other"],
      ["  - Order Source: ad / whatsapp / facebook / instagram / walkin / referral / website / call / other"],
      ["  - Status: new_order / ready / packed / dispatched / delivered / cancelled / returned"],
      ["  - Payment Status: pending / advanced / paid"],
      ["  - Expected Delivery Date: YYYY-MM-DD format"],
      [],
      ["Tips:"],
      ["  - Each row = one order. Multiple items per order are comma-separated."],
      ["  - Quantities, Unit Prices, Item Categories, and Item Notes must match the order of Items."],
      ["  - Leave cells empty for optional fields you don't need."],
      ["  - The first data sheet found with the required columns will be used."],
    ];
    const instSheet = XLSX.utils.aoa_to_sheet(instructionsRows);
    instSheet["!cols"] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, instSheet, "Instructions");

    // Sheet 2: Orders Template — all fields matching the order form
    const headers = [
      "Customer Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Address",
      "District",
      "City",
      "Remarks",
      "Created Date",
      "Dispatched Date",
      "Items",
      "Item Categories",
      "Quantities",
      "Unit Prices",
      "Item Notes",
      "Discount",
      "Discount Type",
      "Delivery Charge",
      "Advance Paid",
      "Payment Method",
      "Order Source",
      "Status",
      "Payment Status",
      "Expected Delivery Date",
    ];
    const exampleRow = [
      "John Doe",
      "0771234567",
      "0719876543",
      "john@example.com",
      "123 Main Street",
      "Colombo",
      "Colombo 01",
      "Leave at gate",
      "2026-07-14",
      "",
      "Premium Frame 8x10, Deluxe Frame A4",
      "Photo Frames, Photo Frames",
      "2,1",
      "2500,3500",
      ",White border",
      "200",
      "fixed",
      "500",
      "1000",
      "cash",
      "ad",
      "new_order",
      "pending",
      "2026-07-20",
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, 22) }));

    // Data validations
    const validations: Record<string, XLSX.ColInfo> = {};
    // Payment Method dropdown
    validations["T2:T1048576"] = {
      type: "list",
      formula1: '"cash,cod,bank_transfer,other"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Payment Method",
      error: "Please enter: cash, cod, bank_transfer, or other",
    } as any;
    // Discount Type dropdown
    validations["Q2:Q1048576"] = {
      type: "list",
      formula1: '"fixed,percentage"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Discount Type",
      error: 'Please enter: "fixed" or "percentage"',
    } as any;
    // Order Source dropdown
    validations["U2:U1048576"] = {
      type: "list",
      formula1: '"ad,whatsapp,facebook,instagram,walkin,referral,website,call,other"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Order Source",
      error: "Please enter a valid order source",
    } as any;
    // Status dropdown
    validations["V2:V1048576"] = {
      type: "list",
      formula1: '"new_order,ready,packed,dispatched,delivered,cancelled,returned"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error: "Please enter a valid order status",
    } as any;
    // Payment Status dropdown
    validations["W2:W1048576"] = {
      type: "list",
      formula1: '"pending,advanced,paid"',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Payment Status",
      error: "Please enter: pending, advanced, or paid",
    } as any;
    ws["!dataValidations"] = validations;

    // Bold headers
    headers.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ws[cell]) ws[cell] = { ...ws[cell], font: { bold: true } as any };
    });

    XLSX.utils.book_append_sheet(wb, ws, "Orders Template");
    XLSX.writeFile(wb, "order_import_template.xlsx");
    toast.success("Template downloaded", {
      description: "Open the file, fill in your orders, and upload it back.",
    });
  }, []);

  // ─── Parse uploaded file ─────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isCsv = ext === "csv";

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file");

        const wb = isCsv
          ? XLSX.read(data, { type: "string" })
          : XLSX.read(data, { type: "array" });

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
            json = candidateJson;
            missing = [];
            break;
          }
          missing = candidateMissing;
        }

        if (json.length === 0) {
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

        const headers = Object.keys(json[0] || {});
        const headerMap = buildHeaderMap(headers);

        const allCols = [
          "Customer Name", "Phone", "WhatsApp", "Email",
          "Address", "District", "City", "Remarks",
          "Created Date", "Dispatched Date",
          "Items", "Item Categories", "Quantities", "Unit Prices", "Item Notes",
          "Discount", "Discount Type", "Delivery Charge", "Advance Paid",
          "Payment Method", "Order Source", "Status", "Payment Status",
          "Expected Delivery Date",
        ];

        const rows: ParsedOrder[] = json.map((rawRow, i) => {
          const row: Record<string, unknown> = {};
          for (const col of allCols) {
            row[col] = getColValue(rawRow, col, headerMap);
          }

          const errors = validateRow(row, i + 2);

          const itemsRaw = splitCSV(row["Items"]);
          const quantitiesRaw = splitCSV(row["Quantities"]);
          const pricesRaw = splitCSV(row["Unit Prices"]);
          const categoriesRaw = splitCSV(row["Item Categories"]);
          const itemNotesRaw = splitCSV(row["Item Notes"]);
          const { items } = parseItemArrays(itemsRaw, quantitiesRaw, pricesRaw, categoriesRaw, itemNotesRaw);

          const discountType = String(row["Discount Type"] || "fixed").trim().toLowerCase();

          return {
            rowNumber: i + 2,
            customer_name: String(row["Customer Name"] || "").trim(),
            customer_phone: String(row["Phone"] || "").trim(),
            customer_whatsapp: String(row["WhatsApp"] || "").trim(),
            customer_email: String(row["Email"] || "").trim(),
            customer_address: String(row["Address"] || "").trim(),
            customer_district: String(row["District"] || "").trim(),
            customer_city: String(row["City"] || "").trim(),
            remarks: String(row["Remarks"] || "").trim(),
            created_date: String(row["Created Date"] || "").trim(),
            dispatched_date: String(row["Dispatched Date"] || "").trim(),
            items,
            discount: Number(row["Discount"] || 0),
            discount_type: VALID_DISCOUNT_TYPES.includes(discountType) ? discountType : "fixed",
            delivery_charge: Number(row["Delivery Charge"] || 0),
            advance_paid: Number(row["Advance Paid"] || 0),
            payment_method: String(row["Payment Method"] || "cash").trim().toLowerCase(),
            status: String(row["Status"] || "new_order").trim().toLowerCase(),
            payment_status: String(row["Payment Status"] || "pending").trim().toLowerCase(),
            order_source: String(row["Order Source"] || "ad").trim().toLowerCase(),
            expected_delivery_date: String(row["Expected Delivery Date"] || "").trim(),
            errors,
          };
        });

        if (rows.length > 200) {
          toast.error("Too many orders", {
            description: `Found ${rows.length} orders. Maximum is 200.`,
          });
          return;
        }

        setParsedRows(rows);
        setStep("preview");
      } catch (err) {
        console.error("Parse error:", err);
        toast.error("Failed to parse file", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  // ─── Computed preview ────────────────────────────────────────
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
      const CHUNK_SIZE = 25;
      const total = validRows.length;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = validRows.slice(i, i + CHUNK_SIZE);

        for (let j = 0; j < chunk.length; j++) {
          const r = chunk[j];
          try {
            // Calculate subtotal from items
            const subtotal = r.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
            const orderNumber = generateOrderNumber(i + j);

            // Insert order
            const { data: order, error: orderError } = await supabase
              .from("orders")
              .insert({
                business_id: businessId,
                order_number: orderNumber,
                customer_name: r.customer_name,
                customer_phone: r.customer_phone || null,
                customer_whatsapp: r.customer_whatsapp || null,
                customer_email: r.customer_email || null,
                customer_address: r.customer_address || null,
                customer_district: r.customer_district || null,
                customer_city: r.customer_city || null,
                remarks: r.remarks || null,
                created_at: r.created_date || currentTime,
                dispatched_date: r.dispatched_date || null,
                subtotal,
                discount: r.discount,
                discount_type: r.discount_type as any,
                delivery_charge: r.delivery_charge,
                advance_paid: r.advance_paid,
                payment_method: r.payment_method as any,
                status: r.status as any,
                payment_status: r.payment_status as any,
                expected_delivery_date: r.expected_delivery_date || null,
                order_source: r.order_source,
                created_by: session.user.id,
                updated_at: currentTime,
              })
              .select("id")
              .single();

            if (orderError) throw new Error(orderError.message);

            // Insert order items
            if (order && r.items.length > 0) {
              const { error: itemsError } = await supabase.from("order_items").insert(
                r.items.map((item, idx) => ({
                  order_id: String(order.id),
                  business_id: businessId,
                  product_name: item.product_name,
                  category: item.category || null,
                  unit_price: item.unit_price,
                  quantity: item.quantity,
                  notes: item.notes || null,
                  sort_order: idx,
                  created_at: currentTime,
                })),
              );
              if (itemsError) throw new Error(itemsError.message);
            }

            results.succeeded++;
          } catch (err) {
            results.failed++;
            results.errors.push({
              row: r.rowNumber,
              message: err instanceof Error ? err.message : "Unknown error",
            });
          }

          const progress = Math.min(
            100,
            Math.round(((i + j + 1) / total) * 100),
          );
          setImportProgress(progress);
        }
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

  // ─── Reset ───────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep("upload");
    setFileName("");
    setParsedRows([]);
    setMissingCols([]);
    setImportProgress(0);
    setImportResult(null);
  }, []);

  // ─── Keyboard: Escape ────────────────────────────────────────
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

  // ─── Computed counts ─────────────────────────────────────────
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
            Import Orders from File
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "upload" && "Upload an XLSX or CSV file with your order data."}
            {step === "preview" && "Review the parsed data before importing."}
            {step === "importing" && "Importing orders into your system..."}
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
            <span>{totalCount} order{totalCount !== 1 ? "s" : ""} found</span>
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
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subtotal</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advance</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valid</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => {
                    const subtotal = row.items.reduce((s, item) => s + item.quantity * item.unit_price, 0);
                    return (
                      <tr
                        key={i}
                        className={cn(
                          "border-t border-border/30 transition-colors",
                          row.errors.length > 0 ? "bg-destructive/5" : "hover:bg-muted/30",
                        )}
                      >
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{row.rowNumber}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-medium text-foreground">{row.customer_name}</p>
                          {row.customer_city && (
                            <p className="text-xs text-muted-foreground/60">{row.customer_city}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground">{row.customer_phone || "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="space-y-0.5">
                            {row.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-foreground">
                                {item.product_name}
                                <span className="text-muted-foreground/60">
                                  {" "}×{item.quantity} @ Rs.{item.unit_price.toLocaleString()}
                                </span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">
                          Rs.{subtotal.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                          {row.discount > 0 ? `Rs.${row.discount.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                          {row.delivery_charge > 0 ? `Rs.${row.delivery_charge.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                          {row.advance_paid > 0 ? `Rs.${row.advance_paid.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                            {row.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {row.errors.length === 0 ? (
                            <Check className="mx-auto size-4 text-success" />
                          ) : (
                            <div className="group relative inline-flex">
                              <AlertTriangle className="mx-auto size-4 text-destructive" />
                              <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-xs text-popover-foreground shadow-lg group-hover:block">
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
                    );
                  })}
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
            <p className="text-lg font-semibold text-foreground">Importing orders...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we add your orders to the system.
            </p>
          </div>
          <div className="mx-auto max-w-sm space-y-2">
            <Progress value={importProgress} />
            <p className="text-xs text-muted-foreground">
              {Math.round((importProgress / 100) * validCount)} of {validCount} imported
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
                <ShoppingCart className="size-8 text-success" />
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
              <p className="mb-2 font-semibold text-destructive">Errors</p>
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
                Import {validCount > 0 ? `${validCount} Order${validCount > 1 ? "s" : ""}` : ""}
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
              View Orders
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
