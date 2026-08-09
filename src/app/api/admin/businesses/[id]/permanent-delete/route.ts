import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin-authorization";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

type StorageLocation = {
  bucket: "payment-proofs" | "profile-images" | "order-images";
  prefix: string;
};

type StorageCleanupSummary = {
  files_deleted: number;
  bytes_deleted: number;
  locations: Array<StorageLocation & { files_deleted: number; bytes_deleted: number }>;
};

const COUNT_TABLES = [
  "profiles",
  "orders",
  "products",
  "customers",
  "expenses",
  "quotations",
  "inventory_items",
  "payment_proofs",
  "team_invitations",
] as const;

const deletionSchema = z
  .object({
    confirmation: z.string().trim().min(1).max(320),
  })
  .strict();

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown deletion error";
}

function serializeError(error: unknown): Json {
  if (!error || typeof error !== "object") {
    return { message: String(error ?? "Unknown deletion error") };
  }

  const value = error as Record<string, unknown>;
  const message =
    typeof value.message === "string"
      ? value.message
      : JSON.stringify(value.message ?? "Unknown deletion error");

  return {
    name: typeof value.name === "string" ? value.name : null,
    message,
    code: typeof value.code === "string" ? value.code : null,
    status: typeof value.status === "number" ? value.status : null,
  };
}

async function listStorageFiles(
  bucket: StorageLocation["bucket"],
  prefix: string,
): Promise<Array<{ path: string; size: number }>> {
  const admin = getAdminClient();
  const files: Array<{ path: string; size: number }> = [];
  const folders = [prefix];

  while (folders.length > 0) {
    const currentPrefix = folders.pop()!;
    let offset = 0;

    while (true) {
      const { data, error } = await admin.storage
        .from(bucket)
        .list(currentPrefix, {
          limit: 1000,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        throw new Error(`Could not inspect ${bucket}/${currentPrefix}: ${error.message}`);
      }

      for (const item of data ?? []) {
        const itemPath = `${currentPrefix}/${item.name}`;
        if (item.id) {
          files.push({
            path: itemPath,
            size: Number(item.metadata?.size ?? 0),
          });
        } else {
          folders.push(itemPath);
        }
      }

      if (!data || data.length < 1000) break;
      offset += data.length;
    }
  }

  return files;
}

async function removeStorageFiles(
  businessId: string,
  ownerId: string,
): Promise<StorageCleanupSummary> {
  const admin = getAdminClient();
  const locations: StorageLocation[] = [
    { bucket: "payment-proofs", prefix: `proofs/${businessId}` },
    { bucket: "profile-images", prefix: `logos/${businessId}` },
    { bucket: "profile-images", prefix: `avatars/${ownerId}` },
    { bucket: "order-images", prefix: `orders/${businessId}` },
    // Retain support for receipts/images uploaded by older path conventions.
    { bucket: "order-images", prefix: businessId },
  ];

  const summary: StorageCleanupSummary = {
    files_deleted: 0,
    bytes_deleted: 0,
    locations: [],
  };

  for (const location of locations) {
    const files = await listStorageFiles(location.bucket, location.prefix);

    for (let index = 0; index < files.length; index += 100) {
      const batch = files.slice(index, index + 100);
      const { error } = await admin.storage
        .from(location.bucket)
        .remove(batch.map((file) => file.path));

      if (error) {
        throw new Error(`Could not delete files from ${location.bucket}: ${error.message}`);
      }
    }

    const bytesDeleted = files.reduce((total, file) => total + file.size, 0);
    summary.files_deleted += files.length;
    summary.bytes_deleted += bytesDeleted;
    summary.locations.push({
      ...location,
      files_deleted: files.length,
      bytes_deleted: bytesDeleted,
    });
  }

  return summary;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = await requireSuperAdmin();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const currentAdmin = authorization.user;

  const businessId = z.string().uuid().safeParse((await params).id);
  if (!businessId.success) {
    return errorResponse("Invalid business ID.", 400);
  }

  const body = deletionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return errorResponse("Type the owner email to confirm permanent deletion.", 400);
  }

  const admin = getAdminClient();
  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id, name, owner_id, account_status, created_at")
    .eq("id", businessId.data)
    .single();

  if (businessError || !business) {
    return errorResponse("Business not found.", 404);
  }

  if (business.owner_id === currentAdmin.id) {
    return errorResponse("You cannot permanently delete your own account.", 403);
  }

  const { data: targetUserData, error: targetUserError } =
    await admin.auth.admin.getUserById(business.owner_id);
  const targetUser = targetUserData?.user;

  if (
    targetUserError &&
    typeof targetUserError.status === "number" &&
    targetUserError.status !== 404
  ) {
    return errorResponse("The business owner Auth account could not be checked.", 500);
  }

  if (targetUser?.app_metadata?.is_super_admin === true) {
    return errorResponse("Super admin accounts cannot be deleted from the Businesses page.", 403);
  }

  let ownerEmail = targetUser?.email?.trim() ?? "";
  if (!ownerEmail) {
    const { data: previousDeletionLog } = await admin
      .from("admin_activity_log")
      .select("details")
      .eq("target_type", "business")
      .eq("target_id", business.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const previousDetails =
      previousDeletionLog?.details &&
      typeof previousDeletionLog.details === "object" &&
      !Array.isArray(previousDeletionLog.details)
        ? (previousDeletionLog.details as Record<string, Json | undefined>)
        : null;
    ownerEmail =
      typeof previousDetails?.owner_email === "string"
        ? previousDetails.owner_email
        : "";
  }

  if (!ownerEmail || body.data.confirmation.toLowerCase() !== ownerEmail.toLowerCase()) {
    return errorResponse("The confirmation email does not match the business owner.", 400);
  }

  const countResults = await Promise.all(
    COUNT_TABLES.map(async (table) => {
      const result = await admin
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId.data);

      return [table, result.count ?? 0] as const;
    }),
  );
  const recordCounts = Object.fromEntries(countResults);

  const baseDetails = {
    status: "in_progress",
    business_name: business.name,
    business_id: business.id,
    owner_id: business.owner_id,
    owner_email: ownerEmail,
    admin_email: currentAdmin.email ?? null,
    previous_account_status: business.account_status,
    business_created_at: business.created_at,
    record_counts: recordCounts,
    auth_user_found: Boolean(targetUser),
    started_at: new Date().toISOString(),
  };

  const { data: auditLog, error: auditError } = await admin
    .from("admin_activity_log")
    .insert({
      admin_id: currentAdmin.id,
      action: "business_permanent_delete_started",
      target_type: "business",
      target_id: business.id,
      details: {
        ...baseDetails,
        stage: "storage_cleanup",
        storage_cleanup: { status: "pending" },
      } as Json,
    })
    .select("id")
    .single();

  if (auditError || !auditLog) {
    return errorResponse(
      "The audit record could not be created. The user and database records were not deleted.",
      500,
    );
  }

  const { data: actorLogs, error: actorLogsError } = await admin
    .from("admin_activity_log")
    .select("id, details")
    .eq("admin_id", business.owner_id);

  if (actorLogsError) {
    await admin
      .from("admin_activity_log")
      .update({
        action: "business_permanent_delete_failed",
        details: {
          ...baseDetails,
          status: "failed",
          stage: "audit_identity_snapshot",
          error: serializeError(actorLogsError),
          failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("id", auditLog.id);

    return errorResponse(
      "The former admin identity could not be preserved in the Activity Log. Nothing was deleted.",
      500,
    );
  }

  const actorLogUpdates = await Promise.all(
    (actorLogs ?? []).map((log) => {
      const existingDetails =
        log.details &&
        typeof log.details === "object" &&
        !Array.isArray(log.details)
          ? (log.details as Record<string, Json | undefined>)
          : {};

      return admin
        .from("admin_activity_log")
        .update({
          details: {
            ...existingDetails,
            admin_email:
              typeof existingDetails.admin_email === "string"
                ? existingDetails.admin_email
                : ownerEmail,
            deleted_admin_user_id: business.owner_id,
          } as Json,
        })
        .eq("id", log.id);
    }),
  );
  const actorLogUpdateError = actorLogUpdates.find((result) => result.error)?.error;

  if (actorLogUpdateError) {
    await admin
      .from("admin_activity_log")
      .update({
        action: "business_permanent_delete_failed",
        details: {
          ...baseDetails,
          status: "failed",
          stage: "audit_identity_snapshot",
          error: serializeError(actorLogUpdateError),
          failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("id", auditLog.id);

    return errorResponse(
      "The former admin identity could not be preserved in the Activity Log. Nothing was deleted.",
      500,
    );
  }

  let storageSummary: StorageCleanupSummary;
  try {
    storageSummary = await removeStorageFiles(businessId.data, business.owner_id);
  } catch (error) {
    await admin
      .from("admin_activity_log")
      .update({
        action: "business_permanent_delete_failed",
        details: {
          ...baseDetails,
          status: "failed",
          stage: "storage_cleanup",
          error: safeErrorMessage(error),
          failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("id", auditLog.id);

    return errorResponse(
      "Storage cleanup failed. The user and database records were not deleted.",
      500,
    );
  }

  const { data: databaseCleanup, error: databaseCleanupError } = await admin.rpc(
    "purge_business_data",
    {
      p_business_id: business.id,
      p_delete_root: false,
    },
  );

  if (databaseCleanupError) {
    await admin
      .from("admin_activity_log")
      .update({
        action: "business_permanent_delete_failed",
        details: {
          ...baseDetails,
          status: "failed",
          stage: "database_cleanup",
          storage_cleanup: storageSummary,
          error: serializeError(databaseCleanupError),
          failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("id", auditLog.id);

    return errorResponse(
      "Database cleanup failed. The Auth user and business root were not deleted.",
      500,
    );
  }

  const startedDetails = {
    ...baseDetails,
    stage: "auth_user_deletion",
    storage_cleanup: storageSummary,
    database_cleanup: databaseCleanup,
  };

  await admin
    .from("admin_activity_log")
    .update({ details: startedDetails as Json })
    .eq("id", auditLog.id);

  if (targetUser) {
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(business.owner_id);
    if (deleteUserError) {
      const serializedDeleteError = serializeError(deleteUserError);
      console.error("Supabase Auth user deletion failed:", serializedDeleteError);
      await admin
        .from("admin_activity_log")
        .update({
          action: "business_permanent_delete_failed",
          details: {
            ...startedDetails,
            status: "failed",
            stage: "auth_user_deletion",
            error: serializedDeleteError,
            failed_at: new Date().toISOString(),
          } as Json,
        })
        .eq("id", auditLog.id);

      return errorResponse(
        "The Auth user could not be deleted. Business data cleanup completed; review the Activity Log.",
        500,
      );
    }
  }

  const { data: rootCleanup, error: rootCleanupError } = await admin.rpc(
    "purge_business_data",
    {
      p_business_id: business.id,
      p_delete_root: true,
    },
  );

  if (rootCleanupError) {
    await admin
      .from("admin_activity_log")
      .update({
        action: "business_permanent_delete_failed",
        details: {
          ...startedDetails,
          status: "partial_failure",
          stage: "business_root_cleanup",
          auth_user_deleted: Boolean(targetUser),
          auth_user_already_missing: !targetUser,
          error: serializeError(rootCleanupError),
          failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("id", auditLog.id);

    return errorResponse(
      "The Auth user was deleted, but the business root cleanup failed. Review the Activity Log.",
      500,
    );
  }

  const completedAt = new Date().toISOString();
  const { error: completedAuditError } = await admin
    .from("admin_activity_log")
    .update({
      action: "business_permanently_deleted",
      details: {
        ...startedDetails,
        status: "completed",
        auth_user_deleted: Boolean(targetUser),
        auth_user_already_missing: !targetUser,
        root_cleanup: rootCleanup,
        completed_at: completedAt,
      } as Json,
    })
    .eq("id", auditLog.id);

  if (completedAuditError) {
    return NextResponse.json({
      success: true,
      warning: "The user was deleted, but the final audit status could not be updated.",
    });
  }

  return NextResponse.json({
    success: true,
    deleted: {
      business_id: business.id,
      business_name: business.name,
      owner_email: ownerEmail,
      record_counts: recordCounts,
      storage_files: storageSummary.files_deleted,
    },
  });
}
