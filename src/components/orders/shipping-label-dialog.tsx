"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileText,
  Printer,
  Download,
  X,
  Loader2,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateShippingLabelPdf } from "@/lib/shipping-label/generate-pdf";
import type { ShippingLabelData } from "@/lib/shipping-label/types";

// ─── Props ─────────────────────────────────────────────────────────

interface ShippingLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Data used to generate the label. If null, shows loading/error state. */
  labelData: ShippingLabelData | null;
  /** Optional: pre-generated PDF data URL to avoid re-generating */
  initialDataUrl?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export function ShippingLabelDialog({
  open,
  onOpenChange,
  labelData,
  initialDataUrl,
}: ShippingLabelDialogProps) {
  const [generating, setGenerating] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(initialDataUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── Generate label on open ──────────────────────────────────
  const generateLabel = useCallback(async () => {
    if (!labelData) return;
    if (dataUrl) return; // Already generated

    setGenerating(true);
    setError(null);
    try {
      const result = await generateShippingLabelPdf(labelData);
      setDataUrl(result.dataUrl);
      setBlob(result.pdfBlob);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate shipping label";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [labelData, dataUrl]);

  // Generate when dialog opens; reset on close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        if (labelData && !dataUrl && !generating) {
          generateLabel();
        }
      } else {
        // Reset state on close so re-opening for a different order
        // always generates a fresh label
        setDataUrl(null);
        setBlob(null);
        setError(null);
      }
      onOpenChange(open);
    },
    [labelData, dataUrl, generating, generateLabel, onOpenChange],
  );

  // ─── Print ───────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (!dataUrl) return;

    // Open the PDF in a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      // Fallback: try printing from the iframe
      iframeRef.current?.contentWindow?.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            @page { size: A5 portrait; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            embed, object { width: 148mm; height: 210mm; }
            @media print {
              body { margin: 0; }
              embed, object { width: 148mm; height: 210mm; }
            }
          </style>
        </head>
        <body>
          <embed src="${dataUrl}" type="application/pdf" width="148mm" height="210mm" />
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 500); };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [dataUrl]);

  // ─── Download ─────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `shipping-label-${labelData?.orderNumber || "label"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [dataUrl, labelData]);

  // ─── Render ──────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[560px] max-h-[85vh]"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="size-4.5 text-primary" />
              Shipping Label
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          {labelData && (
            <p className="text-sm text-muted-foreground">
              Order #{labelData.orderNumber} &middot; Waybill: {labelData.waybillId || "—"}
            </p>
          )}
        </DialogHeader>

        {/* ─── PDF Preview ──────────────────────────────────────── */}
        <div className="flex justify-center py-2">
          {generating && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Generating shipping label...</p>
            </div>
          )}

          {error && !generating && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                <FileText className="size-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Failed to generate label</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!generating && !error && dataUrl && (
            <div className="w-full overflow-y-auto rounded-lg border border-border/50 bg-white shadow-sm" style={{ maxHeight: "60vh" }}>
              <iframe
                ref={iframeRef}
                src={dataUrl}
                className="mx-auto w-full"
                style={{
                  height: "calc(60vh - 4px)",
                  minHeight: "300px",
                  background: "#ffffff",
                }}
                title="Shipping Label Preview"
              />
            </div>
          )}

          {!generating && !error && !dataUrl && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Truck className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Preview Label" to generate the shipping label.
              </p>
            </div>
          )}
        </div>

        {/* ─── Action Buttons ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-sm"
          >
            <X className="size-3.5" />
            Close
          </Button>

          <div className="flex items-center gap-2">
            {!dataUrl && !generating && !error && (
              <Button
                variant="gradient"
                size="sm"
                onClick={generateLabel}
                className="gap-1.5 text-sm"
              >
                <FileText className="size-3.5" />
                Preview Label
              </Button>
            )}

            {error && !generating && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateLabel}
                className="gap-1.5 text-sm"
              >
                <Loader2 className="size-3.5" />
                Retry
              </Button>
            )}

            {dataUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5 text-sm"
                >
                  <Printer className="size-3.5" />
                  Print Label
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5 text-sm"
                >
                  <Download className="size-3.5" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
