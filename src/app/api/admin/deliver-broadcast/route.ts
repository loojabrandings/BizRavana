import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { broadcastId } = await request.json() as { broadcastId: string };

    if (!broadcastId) {
      return NextResponse.json({ error: "Missing broadcastId" }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Fetch the broadcast
    const { data: broadcastRaw, error: broadcastError } = await admin
      .from("notification_broadcasts")
      .select("*")
      .eq("id", broadcastId)
      .single();

    if (broadcastError || !broadcastRaw) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    const broadcast = broadcastRaw as unknown as {
      id: string; title: string; message: string; category: string;
      priority: string; source: string; audience_type: string;
      audience_config: Record<string, unknown>; action_label: string | null;
      action_url: string | null; status: string; created_at: string;
    };

    if (broadcast.status !== "sent" && broadcast.status !== "scheduled" && broadcast.status !== "draft") {
      return NextResponse.json({ error: `Broadcast has status "${broadcast.status}", cannot deliver` }, { status: 400 });
    }

    // 2. Determine target businesses based on audience_type
    // Build query conditions step by step using a simple filter approach
    const bizFilter: Record<string, unknown> = { deleted_at: null };

    if (broadcast.audience_type === "active") {
      bizFilter.account_status = "active";
    } else if (broadcast.audience_type === "trial") {
      bizFilter.account_status = "trial";
    } else if (broadcast.audience_type === "expired") {
      bizFilter.account_status = ["expired", "trial_expired"];
    } else if (broadcast.audience_type === "suspended") {
      bizFilter.account_status = "suspended";
    }

    let bizQuery = admin.from("businesses").select("id, owner_id");
    // Apply filters
    for (const [key, val] of Object.entries(bizFilter)) {
      if (Array.isArray(val)) {
        bizQuery = bizQuery.in(key, val as string[]);
      } else if (val !== null) {
        bizQuery = bizQuery.eq(key, val as string);
      } else {
        bizQuery = bizQuery.is(key, null);
      }
    }

    // Handle plan-based audience
    if (["basic_plan", "standard_plan", "premium_plan", "enterprise_plan"].includes(broadcast.audience_type)) {
      const planName = broadcast.audience_type.replace("_plan", "");
      const capName = planName.charAt(0).toUpperCase() + planName.slice(1);
      const { data: plans } = await admin
        .from("subscription_plans")
        .select("id")
        .ilike("name", capName);
      const planIds = ((plans as { id: string }[]) || []).map((p) => p.id);
      if (planIds.length > 0) {
        bizQuery = bizQuery.in("plan_id", planIds);
      } else {
        return NextResponse.json({ error: `No plans found matching "${capName}"` }, { status: 400 });
      }
    }

    // Handle selected businesses
    if (broadcast.audience_type === "selected") {
      const businessIds = (broadcast.audience_config as Record<string, string[]> | null)?.business_ids || [];
      if (businessIds.length > 0) {
        bizQuery = bizQuery.in("id", businessIds);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: businessesRaw, error: bizError }: any = await bizQuery;

    if (bizError) {
      return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
    }

    const businesses = (businessesRaw || []) as { id: string; owner_id: string }[];

    if (businesses.length === 0) {
      // Mark as sent with 0 recipients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from("notification_broadcasts") as any)
        .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: 0, read_count: 0, updated_at: new Date().toISOString() })
        .eq("id", broadcastId);

      return NextResponse.json({ delivered: 0, message: "No businesses matched the audience criteria" });
    }

    // 3. Get owner profiles for each business
    const ownerIds = [...new Set(businesses.map((b) => b.owner_id).filter(Boolean))];
    const { data: profilesRaw } = await admin
      .from("profiles")
      .select("user_id, business_id")
      .in("user_id", ownerIds);
    const profiles = (profilesRaw || []) as { user_id: string; business_id: string | null }[];

    // 4. Insert notification records for each business
    const now = new Date().toISOString();
    const notificationsToInsert = [];
    const recipientsToInsert = [];

    for (const biz of businesses) {
      // Find the profile for this business (prefer the owner)
      const ownerProfile = profiles?.find((p) => p.business_id === biz.id && p.user_id === biz.owner_id);
      const ownerId = ownerProfile?.user_id || biz.owner_id;
      const bizId = biz.id;

      if (!ownerId) continue;

      notificationsToInsert.push({
        business_id: bizId,
        user_id: ownerId,
        type: "admin_broadcast",
        title: broadcast.title,
        message: broadcast.message,
        category: broadcast.category,
        priority: broadcast.priority,
        source: broadcast.source,
        action_label: broadcast.action_label,
        action_url: broadcast.action_url,
        broadcast_id: broadcast.id,
        data: {},
        created_at: now,
      });
    }

    if (notificationsToInsert.length === 0) {
      return NextResponse.json({ delivered: 0, message: "No valid business owners found" });
    }

    // Batch insert notifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedNotifs, error: insertError }: any = await (admin.from("notifications") as any)
      .insert(notificationsToInsert)
      .select("id, business_id, user_id");

    if (insertError) {
      console.error("Failed to insert notifications:", insertError);
      return NextResponse.json({ error: "Failed to deliver notifications" }, { status: 500 });
    }

    // 5. Create notification_recipients records
    if (insertedNotifs) {
      for (const n of insertedNotifs) {
        recipientsToInsert.push({
          broadcast_id: broadcast.id,
          notification_id: n.id,
          business_id: n.business_id,
          user_id: n.user_id,
          delivered_at: now,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from("notification_recipients") as any).insert(recipientsToInsert);
    }

    // 6. Update broadcast stats
    const deliveredCount = insertedNotifs?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("notification_broadcasts") as any)
      .update({
        status: "sent",
        sent_at: now,
        recipient_count: deliveredCount,
        read_count: 0,
        updated_at: now,
      })
      .eq("id", broadcastId);

    // 7. Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("admin_activity_log") as any).insert({
      admin_id: null,
      action: "notification_sent",
      target_type: "notification_broadcast",
      target_id: broadcast.id,
      details: {
        title: broadcast.title,
        audience_type: broadcast.audience_type,
        recipient_count: deliveredCount,
      },
    });

    return NextResponse.json({ delivered: deliveredCount });
  } catch (err) {
    console.error("Deliver broadcast error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
