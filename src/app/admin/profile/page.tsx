"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function formatAccountDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA"
  );
}

export default function AdminProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || user.app_metadata?.is_super_admin !== true) {
        toast.error("Your Super Admin profile could not be loaded.");
        setLoading(false);
        return;
      }

      const fallbackName = user.email?.split("@")[0] || "Super Admin";
      setUserId(user.id);
      setEmail(user.email ?? "");
      setDisplayName(
        typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name.trim()
          ? user.user_metadata.full_name.trim()
          : fallbackName,
      );
      setAvatarUrl(
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
      );
      setCreatedAt(user.created_at ?? null);
      setLastSignInAt(user.last_sign_in_at ?? null);
      setLoading(false);
    };

    void loadProfile();
  }, [supabase]);

  const notifyProfileUpdated = () => {
    window.dispatchEvent(new Event("admin-profile-updated"));
  };

  const saveProfile = async () => {
    const cleanName = displayName.trim();
    if (cleanName.length < 2) {
      toast.error("Enter a display name with at least 2 characters.");
      return;
    }

    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });
    setSavingProfile(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setDisplayName(cleanName);
    notifyProfileUpdated();
    toast.success("Admin profile updated.");
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("The profile image must be smaller than 2 MB.");
      return;
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    };
    const extension = extensionByType[file.type];
    if (!extension) {
      toast.error("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }

    setUploadingAvatar(true);
    const folder = `avatars/${userId}`;
    const filePath = `${folder}/admin-avatar.${extension}`;

    const { data: existingFiles } = await supabase.storage
      .from("profile-images")
      .list(folder, { limit: 20 });
    const oldAvatarPaths = (existingFiles ?? [])
      .filter((item) => item.name.startsWith("admin-avatar."))
      .map((item) => `${folder}/${item.name}`);

    if (oldAvatarPaths.length > 0) {
      await supabase.storage.from("profile-images").remove(oldAvatarPaths);
    }

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      setUploadingAvatar(false);
      toast.error(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });
    setUploadingAvatar(false);

    if (metadataError) {
      toast.error(metadataError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    notifyProfileUpdated();
    toast.success("Admin avatar updated.");
  };

  const removeAvatar = async () => {
    setUploadingAvatar(true);
    const folder = `avatars/${userId}`;
    const { data: existingFiles } = await supabase.storage
      .from("profile-images")
      .list(folder, { limit: 20 });
    const avatarPaths = (existingFiles ?? [])
      .filter((item) => item.name.startsWith("admin-avatar."))
      .map((item) => `${folder}/${item.name}`);

    if (avatarPaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("profile-images")
        .remove(avatarPaths);
      if (removeError) {
        setUploadingAvatar(false);
        toast.error(removeError.message);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    });
    setUploadingAvatar(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setAvatarUrl(null);
    notifyProfileUpdated();
    toast.success("Admin avatar removed.");
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Use a password with at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("The passwords do not match.");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setSavingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed successfully.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the identity and security of your Super Admin account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/30">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                Profile details
              </CardTitle>
              <CardDescription>
                This identity is kept separately from business user profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar className="size-24 ring-4 ring-primary/10">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAvatar(file);
                      event.target.value = "";
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingAvatar || !userId}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 size-4" />
                      )}
                      Change photo
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={uploadingAvatar}
                        onClick={() => void removeAvatar()}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP, GIF, or AVIF. Maximum size 2 MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-display-name">Display name</Label>
                  <Input
                    id="admin-display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Super Admin"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      value={email}
                      readOnly
                      className="bg-muted/40 pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email changes are managed through Supabase Authentication.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => void saveProfile()}
                >
                  {savingProfile ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  Save profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/30">
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                Change password
              </CardTitle>
              <CardDescription>
                Choose a strong password used only for this admin account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-new-password">New password</Label>
                  <Input
                    id="admin-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password">
                    Confirm new password
                  </Label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat the new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    savingPassword || !newPassword || !confirmPassword
                  }
                  onClick={() => void changePassword()}
                >
                  {savingPassword && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Account access
            </CardTitle>
            <CardDescription>
              Security and role information for this account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Role
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Super Admin
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Platform administration only. This account does not have a
                business dashboard.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Account created</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {formatAccountDate(createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last sign in</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {formatAccountDate(lastSignInAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="mt-0.5 break-all font-mono text-xs text-foreground">
                  {userId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
