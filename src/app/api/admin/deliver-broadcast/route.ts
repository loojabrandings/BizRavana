import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin-authorization";
import { getAdminClient } from "@/lib/supabase/admin";

const requestSchema = z
  .object({
    broadcastId: z.string().uuid(),
  })
  .strict();

type Broadcast = {
  id: string;
  title: string;
  audience_type: string;
  status: string;
};

type DeliveryResult = {
  status:
    | "delivered"
    | "not_found"
    | "conflict"
    | "already_delivered"
    | "invalid_audience";
  delivered?: number;
  broadcast_status?: string;
};

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireSuperAdmin();
    if (!authorization.ok) {
      return errorResponse(authorization.error, authorization.status);
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("A valid broadcastId is required.", 400);
    }

    const { broadcastId } = parsed.data;
    const admin = getAdminClient();
    const { data: broadcastRaw, error: broadcastError } = await admin
      .from("notification_broadcasts")
      .select("id, title, audience_type, status")
      .eq("id", broadcastId)
      .single();

    if (broadcastError || !broadcastRaw) {
      return errorResponse("Broadcast not found.", 404);
    }

    const broadcast = broadcastRaw as unknown as Broadcast;
    if (broadcast.status !== "draft" && broadcast.status !== "scheduled") {
      return errorResponse(
        `A broadcast with status "${broadcast.status}" cannot be delivered.`,
        409,
      );
    }

    // The database function locks the broadcast row for the entire operation.
    // Concurrent manual requests and the scheduled worker therefore cannot
    // create duplicate recipients for the same broadcast.
    const { data: deliveryRaw, error: deliveryError } = await admin.rpc(
      "deliver_notification_broadcast",
      { p_broadcast_id: broadcastId },
    );

    if (deliveryError) {
      console.error("Atomic broadcast delivery failed:", deliveryError);
      return errorResponse("Failed to deliver notifications.", 500);
    }

    const delivery = deliveryRaw as DeliveryResult | null;
    if (!delivery || delivery.status === "not_found") {
      return errorResponse("Broadcast not found.", 404);
    }
    if (delivery.status === "invalid_audience") {
      return errorResponse("The selected audience is invalid or empty.", 400);
    }
    if (delivery.status === "already_delivered") {
      return errorResponse("This broadcast already has delivered recipients.", 409);
    }
    if (delivery.status === "conflict") {
      return errorResponse(
        `A broadcast with status "${delivery.broadcast_status}" cannot be delivered.`,
        409,
      );
    }

    const deliveredCount = delivery.delivered ?? 0;

    // Audit logging should not turn a successful delivery into a failed response.
    const { error: auditError } = await admin.from("admin_activity_log").insert({
      admin_id: authorization.user.id,
      action: "notification_sent",
      target_type: "notification_broadcast",
      target_id: broadcast.id,
      details: {
        title: broadcast.title,
        audience_type: broadcast.audience_type,
        recipient_count: deliveredCount,
      },
    });

    if (auditError) {
      console.error("Broadcast delivery audit logging failed:", auditError);
    }

    return NextResponse.json({
      delivered: deliveredCount,
      ...(deliveredCount === 0
        ? { message: "No businesses matched the audience criteria." }
        : {}),
    });
  } catch (error) {
    console.error("Deliver broadcast error:", error);
    return errorResponse("Internal server error.", 500);
  }
}
