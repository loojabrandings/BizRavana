"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchTemplates,
  getUserBusinessId,
  type MessageTemplate,
} from "@/lib/supabase/message-templates";
import { sendWhatsAppTemplate } from "./whatsapp-actions";
import { TemplateSelectionDialog } from "./template-selection-dialog";
import { NoTemplateDialog } from "./no-template-dialog";
import type { TemplateData } from "@/lib/template-engine";

// ─── Types ─────────────────────────────────────────────────────────

type TemplateContext = "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";

interface PendingAction {
  context: TemplateContext;
  data: TemplateData;
  phone: string;
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useWhatsAppAction() {
  const router = useRouter();
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [noTemplateDialogOpen, setNoTemplateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef<PendingAction | null>(null);
  const contextRef = useRef<string>("");

  /**
   * Shorthand function to get businessId for the current user.
   * Each integration point can also pass its own businessId if it already has it.
   */
  const getBusinessId = useCallback(async (): Promise<string | null> => {
    return getUserBusinessId();
  }, []);

  /**
   * Main entry point: check templates and either send directly or show a dialog.
   */
  const handleAction = useCallback(
    async (
      context: TemplateContext,
      data: TemplateData,
      phone: string,
      businessId?: string,
    ) => {
      let bid = businessId ?? null;
      if (!bid) {
        bid = await getBusinessId();
      }
      if (!bid) return;

      contextRef.current = context;
      setLoading(true);
      try {
        const tpls = await fetchTemplates(bid, context);
        setTemplates(tpls);

        if (tpls.length === 0) {
          // No template available — show no-template dialog
          pendingRef.current = null;
          setNoTemplateDialogOpen(true);
        } else if (tpls.length === 1) {
          // Only one template — use it immediately
          sendWhatsAppTemplate(tpls[0], data, phone);
        } else {
          // Multiple templates — show selection dialog
          pendingRef.current = { context, data, phone };
          setSelectionDialogOpen(true);
        }
      } catch (err) {
        console.error("WhatsApp action error:", err);
      } finally {
        setLoading(false);
      }
    },
    [getBusinessId],
  );

  /**
   * Called when user selects a template from the dialog.
   */
  const handleTemplateSelect = useCallback((template: MessageTemplate) => {
    const pending = pendingRef.current;
    if (!pending) return;
    sendWhatsAppTemplate(template, pending.data, pending.phone);
    pendingRef.current = null;
  }, []);

  /**
   * Navigate to settings to manage templates.
   */
  const handleManageTemplates = useCallback(() => {
    setSelectionDialogOpen(false);
    const contextParam = contextRef.current.replace("_whatsapp", "");
    const params = new URLSearchParams();
    params.set("tab", "whatsapp-templates");
    params.set("template_context", contextParam);
    router.push(`/dashboard/settings?${params.toString()}`);
  }, [router]);

  /**
   * Render the dialogs. Call this once in the parent component.
   */
  const renderDialogs = () => (
    <>
      <TemplateSelectionDialog
        open={selectionDialogOpen}
        onOpenChange={setSelectionDialogOpen}
        templates={templates}
        onSelect={handleTemplateSelect}
        onManageTemplates={handleManageTemplates}
      />
      <NoTemplateDialog
        open={noTemplateDialogOpen}
        onOpenChange={setNoTemplateDialogOpen}
        context={contextRef.current}
      />
    </>
  );

  return {
    handleAction,
    renderDialogs,
    loading,
  };
}
