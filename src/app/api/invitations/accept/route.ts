import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const acceptSchema = z.object({
  token: z.string().trim().min(32).max(256),
});

/** Accept a pending invitation as the verified current user. */
export async function POST(request: NextRequest) {
  try {
    const parsed = acceptSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid invitation token is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 },
      );
    }

    const { data: businessId, error } = await supabase.rpc(
      "accept_invitation",
      {
        invitation_token: parsed.data.token,
        accepting_user_id: user.id,
      },
    );

    if (error) {
      const message = error.message;
      if (message.includes("Invalid or expired")) {
        return NextResponse.json(
          { error: "This invitation is invalid or has expired." },
          { status: 400 },
        );
      }
      if (message.includes("email does not match")) {
        return NextResponse.json(
          { error: "This invitation belongs to a different email address." },
          { status: 403 },
        );
      }
      if (message.includes("already belongs")) {
        return NextResponse.json(
          { error: "This account already belongs to another business." },
          { status: 409 },
        );
      }

      console.error("Invitation acceptance failed:", error);
      return NextResponse.json(
        { error: "Invitation could not be accepted" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: { business_id: businessId },
      message: "Invitation accepted successfully!",
    });
  } catch (error) {
    console.error("Invitation acceptance failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
