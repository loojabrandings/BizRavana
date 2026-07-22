"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Props ─────────────────────────────────────────────────────────

interface NoTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export function NoTemplateDialog({
  open,
  onOpenChange,
  context,
}: NoTemplateDialogProps) {
  const router = useRouter();

  const handleCreateTemplate = () => {
    onOpenChange(false);
    // Navigate to settings with the template context preselected
    const params = new URLSearchParams();
    if (context) {
      params.set("tab", "whatsapp-templates");
      params.set("template_context", context);
    }
    router.push(`/dashboard/settings?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <DialogHeader className="text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-warning/10">
                  <MessageCircle className="size-4 text-warning" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-semibold">
                    No WhatsApp Template Available
                  </DialogTitle>
                  <DialogDescription className="text-xxs text-muted-foreground/60 mt-0.5">
                    Create a template before sending a WhatsApp message from
                    this section.
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </DialogHeader>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-muted/20 border border-border/10 px-4 py-5 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/30">
              <MessageCircle className="size-4 text-muted-foreground/30" />
            </div>
            <p className="text-xxs text-muted-foreground/50 leading-relaxed max-w-[260px]">
              You haven&apos;t created any WhatsApp templates for this section
              yet. Set one up to quickly message customers.
            </p>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-border/10 px-5 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenChange(false)}
              className="h-7 text-xxs text-muted-foreground/50"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="xs"
              onClick={handleCreateTemplate}
              className="h-7 text-xxs gap-1"
            >
              <Plus className="size-2.5" />
              Create Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
