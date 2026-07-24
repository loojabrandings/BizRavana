"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  ShieldCheck,
  User,
  UserPlus,
  Mail,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Ban,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollapsibleCard } from "@/components/shared/collapsible-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  role: "owner" | "admin" | "member";
  avatar_url: string | null;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
}

// ─── Role Icons & Labels ────────────────────────────────────────────

const ROLE_CONFIG = {
  owner: {
    icon: Crown,
    label: "Owner",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  admin: {
    icon: ShieldCheck,
    label: "Admin",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  member: {
    icon: User,
    label: "Member",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border/40",
  },
} as const;

function RoleBadge({ role }: { role: "owner" | "admin" | "member" }) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
        config.color,
        config.bg,
        config.border,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function InvitationStatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    accepted: { label: "Accepted", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    expired: { label: "Expired", color: "text-muted-foreground", bg: "bg-muted", border: "border-border/40" },
    cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  } as const;

  const c = config[status as keyof typeof config] || config.pending;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border", c.color, c.bg, c.border)}>
      {status === "pending" && <Clock className="size-2.5 mr-1" />}
      {status === "accepted" && <CheckCircle2 className="size-2.5 mr-1" />}
      {status === "expired" && <AlertCircle className="size-2.5 mr-1" />}
      {status === "cancelled" && <X className="size-2.5 mr-1" />}
      {c.label}
    </span>
  );
}

// ─── Initials Helper ────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "?";
}

// ─── Team Settings Component ────────────────────────────────────────

export function TeamSettings({ activeSection }: { activeSection?: string | null }) {
  const supabase = useMemo(() => createClient(), []);

  // Auth state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);

  // Cancel invitation confirmation
  const [cancelTarget, setCancelTarget] = useState<Invitation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Promote/Demote state
  const [changingRole, setChangingRole] = useState<string | null>(null);

  // Remove member confirmation
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  // ── Fetch Data ──────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setCurrentUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id, role")
        .eq("user_id", session.user.id)
        .single();

      if (!profile?.business_id) return;

      setBusinessId(profile.business_id);
      setCurrentUserRole(profile.role);

      // Fetch all members of this business
      const { data: membersData } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, role, avatar_url, created_at")
        .eq("business_id", profile.business_id)
        .order("created_at", { ascending: true });

      if (membersData) setMembers(membersData);

      // Fetch invitations
      const response = await fetch(`/api/invitations?business_id=${profile.business_id}`);
      if (response.ok) {
        const { data: invites } = await response.json();
        if (invites) setInvitations(invites);
      }
    } catch (err) {
      console.error("Failed to load team data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Promote/Demote Member ────────────────────────────────────────

  const handleChangeRole = useCallback(async (member: TeamMember, newRole: "admin" | "member") => {
    if (!businessId) return;
    setChangingRole(member.id);

    try {
      const response = await fetch("/api/invitations/member-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: member.id,
          business_id: businessId,
          new_role: newRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to change role", {
          description: result.error || "An error occurred.",
        });
        return;
      }

      toast.success(result.message || "Role updated successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to change role");
    } finally {
      setChangingRole(null);
    }
  }, [businessId, fetchData]);

  // ── Invite Member ───────────────────────────────────────────────

  const handleInvite = useCallback(async () => {
    if (!businessId || !currentUserId || !inviteEmail.trim()) return;
    setInviting(true);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          email: inviteEmail.trim(),
          role: inviteRole,
          invited_by: currentUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("Already invited", {
            description: "A pending invitation already exists for this email.",
          });
        } else {
          toast.error("Failed to invite member", {
            description: result.error || "An error occurred.",
          });
        }
        return;
      }

      toast.success("Invitation sent!", {
        description: `An invitation has been sent to ${inviteEmail.trim()}.`,
      });

      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      fetchData();
    } catch (err) {
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }, [businessId, currentUserId, inviteEmail, inviteRole, fetchData]);

  // ── Cancel Invitation ───────────────────────────────────────────

  const handleCancelInvitation = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      const response = await fetch(`/api/invitations?id=${cancelTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to cancel invitation");
        return;
      }

      toast.success("Invitation cancelled");
      setCancelTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel invitation");
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, fetchData]);

  // ── Remove Member ───────────────────────────────────────────────

  const handleRemoveMember = useCallback(async () => {
    if (!removeTarget) return;
    setRemoving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ business_id: null, role: "member" })
        .eq("id", removeTarget.id);

      if (error) {
        toast.error("Failed to remove member");
        return;
      }

      toast.success(`${removeTarget.full_name} has been removed from the team`);
      setRemoveTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setRemoving(false);
    }
  }, [removeTarget, supabase, fetchData]);

  // ── Loading State ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/20" />
        ))}
      </div>
    );
  }

  // ── Member view (read-only team list) ───────────────────────────

  if (!canManage) {
    return (
      <div className="space-y-4">
        {/* Team Members Card — read-only for members */}
        {(!activeSection || activeSection === "team-management") && (
        <CollapsibleCard
          id="settings-team-management"
          collapsible={false}
          icon={User}
          title="Team Members"
          description={`${members.length} member${members.length !== 1 ? "s" : ""} in your business`}
        >
          <div className="space-y-1.5">
            {members.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground/60">
                No team members yet.
              </p>
            ) : (
              members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border p-3.5",
                    member.role === "owner" && "border-amber-500/20 bg-amber-500/[0.02]",
                  )}
                >
                  <Avatar className="size-10 shrink-0 ring-2 ring-border/20">
                    <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {member.full_name}
                      </span>
                      <RoleBadge role={member.role} />
                      {member.user_id === currentUserId && (
                        <span className="text-[10px] text-muted-foreground/40 font-medium">(you)</span>
                      )}
                    </div>
                    {member.phone && (
                      <span className="text-xs text-muted-foreground/60">{member.phone}</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CollapsibleCard>
      )}
      </div>
    );
  }

  // ── Render (owner/admin view) ────────────────────────────────────

  const pendingInvites = invitations.filter((i) => i.status === "pending");

  return (
    <div className="space-y-4">
      {/* ── Confirmation Dialogs ── */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={() => setCancelTarget(null)}
        title="Cancel Invitation"
        description={`Cancel the invitation for ${cancelTarget?.email}? They will no longer be able to join your business through this invitation.`}
        confirmLabel="Cancel Invitation"
        variant="destructive"
        loading={cancelling}
        onConfirm={handleCancelInvitation}
      />
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove Team Member"
        description={`Remove ${removeTarget?.full_name} from your business? They will lose access to all business data.`}
        confirmLabel="Remove Member"
        variant="destructive"
        loading={removing}
        onConfirm={handleRemoveMember}
      />

      {/* ── Invite Dialog ── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your business. They will receive access based on their role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "admin" | "member")}
              >
                <SelectTrigger id="invite-role" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <span className="flex items-center gap-2">
                      <User className="size-3.5" />
                      Member — View & create records
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="size-3.5" />
                      Admin — Full access (except billing)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
            >
              {inviting ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <UserPlus className="size-4 mr-1.5" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Team Members Card ── */}
      {(!activeSection || activeSection === "team-management") && (
      <CollapsibleCard
        id="settings-team-management"
        collapsible={false}
        icon={User}
        title="Team Members"
        description={`${members.length} member${members.length !== 1 ? "s" : ""} in your business`}
      >
        {/* Invite button for owners/admins */}
        {canManage && (
          <div className="mb-4">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="gap-1.5"
            >
              <UserPlus className="size-3.5" />
              Invite Member
            </Button>
          </div>
        )}

        <div className="space-y-1.5">
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground/60">
              No team members yet. Invite someone to get started.
            </p>
          ) : (
            members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl border p-3.5 transition-all duration-200",
                  "hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                  member.role === "owner" && "border-amber-500/20 bg-amber-500/[0.02]",
                )}
              >
                {/* Avatar */}
                <Avatar className="size-10 shrink-0 ring-2 ring-border/20">
                  <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {getInitials(member.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {member.full_name}
                    </span>
                    <RoleBadge role={member.role} />
                    {member.user_id === currentUserId && (
                      <span className="text-[10px] text-muted-foreground/40 font-medium">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.phone && (
                      <span className="text-xs text-muted-foreground/60">{member.phone}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/40">
                      Joined {formatDateTime(member.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions (owner/admin only, not for self or owner) */}
                {canManage && member.user_id !== currentUserId && member.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/40 hover:text-foreground"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {member.role === "member" && (
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleChangeRole(member, "admin")}
                          disabled={changingRole === member.id}
                        >
                          {changingRole === member.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="size-3.5 text-blue-500" />
                          )}
                          Promote to Admin
                        </DropdownMenuItem>
                      )}
                      {member.role === "admin" && (
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleChangeRole(member, "member")}
                          disabled={changingRole === member.id}
                        >
                          {changingRole === member.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <User className="size-3.5" />
                          )}
                          Demote to Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => setRemoveTarget(member)}
                      >
                        <Ban className="size-3.5" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CollapsibleCard>
      )}

      {/* ── Pending Invitations Card ── */}
      {pendingInvites.length > 0 && (
        <CollapsibleCard
          icon={Mail}
          title="Pending Invitations"
          description={`${pendingInvites.length} invitation${pendingInvites.length !== 1 ? "s" : ""} awaiting response`}
        >
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/10 p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
                  <Mail className="size-4 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {invite.email}
                    </span>
                    <InvitationStatusBadge status={invite.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RoleBadge role={invite.role} />
                    <span className="text-[10px] text-muted-foreground/40">
                      Expires {formatDateTime(invite.expires_at)}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground/60 hover:text-destructive"
                    onClick={() => setCancelTarget(invite)}
                  >
                    <X className="size-3.5" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* ── Past Invitations Card ── */}
      {invitations.filter((i) => i.status !== "pending").length > 0 && (
        <CollapsibleCard
          icon={RefreshCw}
          title="Invitation History"
          description="Past invitations that were accepted, expired, or cancelled"
        >
          <div className="space-y-2">
            {invitations
              .filter((i) => i.status !== "pending")
              .map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground/70 truncate">
                        {invite.email}
                      </span>
                      <InvitationStatusBadge status={invite.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RoleBadge role={invite.role} />
                      <span className="text-[10px] text-muted-foreground/40">
                        {formatDateTime(invite.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CollapsibleCard>
      )}
    </div>
  );
}
