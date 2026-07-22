"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Truck, Package, Clock, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackShipment, loadCourierConfig, type TrackingEvent } from "@/lib/delivery/courier-utils";

interface TrackShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waybillNumber: string;
}

export function TrackShipmentDialog({
  open,
  onOpenChange,
  waybillNumber,
}: TrackShipmentDialogProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await loadCourierConfig();
      if (!config?.provider || !config.credentials.email) {
        throw new Error("Courier not configured. Set up Royal Express in Settings first.");
      }
      const result = await trackShipment(waybillNumber, config.credentials);
      setEvents(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch tracking info";
      setError(msg);
      toast.error("Tracking failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [waybillNumber]);

  useEffect(() => {
    if (open) {
      fetchTracking();
    } else {
      setEvents([]);
      setError(null);
    }
  }, [open, fetchTracking]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-4.5 text-primary" />
            Track Shipment
          </DialogTitle>
          <DialogDescription>
            Tracking history for waybill <strong>{waybillNumber}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground/60" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Unable to track</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Package className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No tracking events found for this waybill.</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-border/60" />

              <div className="space-y-0">
                {events.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-background">
                      <Package className="size-3.5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-semibold text-foreground">
                        {event.status}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {event.dateTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(event.dateTime).toLocaleString()}
                          </span>
                        )}
                        {event.dateTimeAgo && (
                          <span className="text-muted-foreground/60">
                            ({event.dateTimeAgo})
                          </span>
                        )}
                      </div>
                      {event.user && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/60">
                          <User className="size-3" />
                          {event.user}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && !loading && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchTracking}>
              <Loader2 className="size-3.5" />
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
