"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate as fmtDate } from "@/lib/formatters";
import type { OrderFormData } from "./types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import domtoimage from "dom-to-image-more";
import { jsPDF } from "jspdf";
import {
  InvoiceDocument,
  type BusinessProfile,
} from "@/components/invoices/invoice-document";

// ─── Re-export BusinessProfile ─────────────────────────────────────
export type { BusinessProfile };

// ─── Fetch Business Profile ────────────────────────────────────────

export async function fetchBusinessProfile(): Promise<BusinessProfile> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", session.user.id)
    .single();

  if (!profile?.business_id) {
    return {
      name: "",
      logo_url: null,
      phone: null,
      email: null,
      website: null,
      address: null,
      city: null,
      postal_code: null,
      registration_number: null,
    };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name, logo_url, phone, address, district")
    .eq("id", profile.business_id)
    .single();

  const { data: settings } = await supabase
    .from("business_settings")
    .select("key, value")
    .eq("business_id", profile.business_id);

  const map: Record<string, string> = {};
  if (settings) {
    settings.forEach((s) => { map[s.key] = String(s.value); });
  }

  return {
    name: business?.name || "",
    logo_url: business?.logo_url || null,
    phone: business?.phone || map.business_phone || null,
    email: map.business_email || null,
    website: map.website || null,
    address: business?.address || null,
    city: map.city || null,
    postal_code: map.postal_code || null,
    registration_number: map.registration_number || null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// ON-SCREEN INVOICE COMPONENT
// Wraps the reusable InvoiceDocument with an action toolbar
// (Print / Download PDF buttons) and a motion container.
// ═══════════════════════════════════════════════════════════════════

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return fmtDate(dateStr);
}

interface InvoiceTemplateProps {
  data: OrderFormData;
  businessProfile?: BusinessProfile;
  loading?: boolean;
}

export function InvoiceTemplate({
  data,
  businessProfile,
  loading,
}: InvoiceTemplateProps) {
  const [business, setBusiness] = useState<BusinessProfile | null>(businessProfile || null);
  const [fetching, setFetching] = useState(!businessProfile);
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Fetch business profile if not provided
  useEffect(() => {
    if (businessProfile) {
      setBusiness(businessProfile);
      return;
    }
    if (!fetching) return;
    const load = async () => {
      try {
        const profile = await fetchBusinessProfile();
        setBusiness(profile);
      } catch (err) {
        console.error("Failed to fetch business profile:", err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [businessProfile, fetching]);

  // ─── Download as PDF via dom-to-image-more + jsPDF ─────────
  const handleDownloadPdf = useCallback(async () => {
    if (!invoiceRef.current) return;
    setGenerating(true);
    try {
      // Capture the invoice DOM node as a PNG image
      // dom-to-image-more auto-detects the node dimensions
      const node = invoiceRef.current;
      const dataUrl = await domtoimage.toPng(node);

      // Calculate aspect-ratio-preserving dimensions for A4 (210mm wide)
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const pdfWidth = 210; // mm
      const pdfHeight = (img.height / img.width) * pdfWidth;

      // Build the PDF
      const doc = new jsPDF("p", "mm", "a4");
      // Add white background in case the capture has any transparency
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pdfWidth, pdfHeight, "F");
      doc.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`invoice-${data.order_number}.pdf`);

      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Failed to generate PDF", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setGenerating(false);
    }
  }, [data.order_number]);

  const isLoading = fetching || loading || !business;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/50" />
          <p className="text-sm text-muted-foreground/60">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[210mm] mx-auto"
    >
      {/* ─── Action Bar ────────────────────────────────────────── */}
      <div
        data-print-hide
        className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl border border-border/30 bg-card shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="size-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Invoice #{data.order_number}</p>
            <p className="text-xs text-muted-foreground/60">{formatDate(data.created_date)}</p>
          </div>
        </div>
        <Button
            variant="gradient"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={generating}
            className="gap-1.5 text-xs"
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {generating ? "Generating..." : "Download PDF"}
          </Button>
      </div>

      {/* ═══════ Invoice Document ════════════════════════════════ */}
      <div
        ref={invoiceRef}
        className="print:shadow-none print:border-0 print:rounded-none"
      >
        <InvoiceDocument data={data} business={business} />
      </div>
    </motion.div>
  );
}
