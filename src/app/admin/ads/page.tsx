"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ImagePlus, Loader2, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type AdCampaign = Database["public"]["Tables"]["ad_campaigns"]["Row"];
type WebsiteTarget = AdCampaign["website_target"];
type AdLabel = AdCampaign["label"];
type ImageFit = AdCampaign["image_fit"];
interface Option { id: string; name: string }

interface AdForm {
  title: string;
  description: string;
  label: AdLabel;
  imageFit: ImageFit;
  ctaText: string;
  ctaUrl: string;
  planIds: string[];
  websiteTarget: WebsiteTarget;
  businessId: string;
  priority: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const emptyForm: AdForm = {
  title: "",
  description: "",
  label: "Special Offer",
  imageFit: "cover",
  ctaText: "",
  ctaUrl: "",
  planIds: [],
  websiteTarget: "all",
  businessId: "",
  priority: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AdminAdsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [plans, setPlans] = useState<Option[]>([]);
  const [businesses, setBusinesses] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdCampaign | null>(null);
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const selectedImagePreview = useMemo(
    () => image ? URL.createObjectURL(image) : null,
    [image],
  );

  useEffect(() => {
    return () => {
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    };
  }, [selectedImagePreview]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: adData, error }, { data: planData }, { data: businessData }] = await Promise.all([
        supabase.from("ad_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("subscription_plans").select("id, name").order("sort_order"),
        supabase.from("businesses").select("id, name").is("deleted_at", null).order("name").limit(500),
      ]);
      if (error) throw error;
      setAds(adData ?? []);
      setPlans(planData ?? []);
      setBusinesses(businessData ?? []);
    } catch (error) {
      console.error("Ads load failed:", error);
      toast.error("Ads could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setOpen(true);
  };

  const startEdit = (ad: AdCampaign) => {
    setEditing(ad);
    setForm({
      title: ad.title,
      description: ad.description,
      label: ad.label,
      imageFit: ad.image_fit,
      ctaText: ad.cta_text ?? "",
      ctaUrl: ad.cta_url ?? "",
      planIds: ad.target_plan_ids,
      websiteTarget: ad.website_target,
      businessId: ad.target_business_id ?? "",
      priority: String(ad.priority),
      startsAt: toLocalDateTime(ad.starts_at),
      endsAt: toLocalDateTime(ad.ends_at),
      isActive: ad.is_active,
    });
    setImage(null);
    setOpen(true);
  };

  const save = async () => {
    if (form.title.trim().length < 3 || form.description.trim().length < 3) {
      toast.error("Add an ad title and description.");
      return;
    }
    if ((form.ctaText && !form.ctaUrl) || (!form.ctaText && form.ctaUrl)) {
      toast.error("CTA button text and link must both be provided.");
      return;
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      toast.error("End date must be after the start date.");
      return;
    }

    setSaving(true);
    let imagePath = editing?.image_path ?? null;
    let uploadedImagePath: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");

      if (image) {
        const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
        const newPath = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("dashboard-ads")
          .upload(newPath, image, { contentType: image.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedImagePath = newPath;
        imagePath = newPath;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        label: form.label,
        image_path: imagePath,
        image_fit: form.imageFit,
        cta_text: form.ctaText.trim() || null,
        cta_url: form.ctaUrl.trim() || null,
        target_plan_ids: form.planIds,
        website_target: form.websiteTarget,
        target_business_id: form.businessId || null,
        priority: Math.min(100, Math.max(0, Number(form.priority) || 0)),
        starts_at: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        is_active: form.isActive,
        updated_at: new Date().toISOString(),
      };

      const result = editing
        ? await supabase.from("ad_campaigns").update(payload).eq("id", editing.id)
        : await supabase.from("ad_campaigns").insert({ ...payload, created_by: user.id });
      if (result.error) throw result.error;
      if (uploadedImagePath && editing?.image_path) {
        await supabase.storage.from("dashboard-ads").remove([editing.image_path]);
      }

      toast.success(editing ? "Ad updated." : "Ad created.");
      setOpen(false);
      await load();
    } catch (error) {
      if (uploadedImagePath) {
        await supabase.storage.from("dashboard-ads").remove([uploadedImagePath]);
      }
      console.error("Ad save failed:", error);
      toast.error(error instanceof Error ? error.message : "Ad could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: AdCampaign) => {
    const { error } = await supabase
      .from("ad_campaigns")
      .update({ is_active: !ad.is_active, updated_at: new Date().toISOString() })
      .eq("id", ad.id);
    if (error) return toast.error("Ad status could not be updated.");
    await load();
  };

  const remove = async (ad: AdCampaign) => {
    if (!window.confirm(`Delete "${ad.title}"?`)) return;
    setDeletingId(ad.id);
    const { error } = await supabase.from("ad_campaigns").delete().eq("id", ad.id);
    if (!error && ad.image_path) {
      await supabase.storage.from("dashboard-ads").remove([ad.image_path]);
    }
    setDeletingId(null);
    if (error) return toast.error("Ad could not be deleted.");
    toast.success("Ad deleted.");
    await load();
  };

  const imageUrl = (path: string | null) => path
    ? supabase.storage.from("dashboard-ads").getPublicUrl(path).data.publicUrl
    : null;
  const previewImageUrl = selectedImagePreview || imageUrl(editing?.image_path ?? null);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ads"
        subtitle="Create targeted promotions for business dashboards."
        customAction={<Button onClick={startCreate}><Plus className="size-4" />Create Ad</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : ads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Megaphone className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No ad campaigns yet.</p>
          <Button className="mt-4" onClick={startCreate}><Plus className="size-4" />Create your first ad</Button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {ads.map((ad) => {
            const url = imageUrl(ad.image_path);
            const business = businesses.find((item) => item.id === ad.target_business_id);
            const planNames = plans.filter((plan) => ad.target_plan_ids.includes(plan.id)).map((plan) => plan.name);
            return (
              <article key={ad.id} className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-36 w-full object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{ad.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                    </div>
                    <Switch checked={ad.is_active} onCheckedChange={() => void toggleActive(ad)} aria-label="Toggle ad" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1">Priority {ad.priority}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">{ad.label}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      {planNames.length ? planNames.join(", ") : "All plans"}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      Website: {ad.website_target}
                    </span>
                    {business && <span className="rounded-full bg-muted px-2.5 py-1">{business.name}</span>}
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                    <Button size="sm" variant="outline" onClick={() => startEdit(ad)}>
                      <Pencil className="size-3.5" />Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" disabled={deletingId === ad.id} onClick={() => void remove(ad)}>
                      {deletingId === ad.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ad" : "Create Ad"}</DialogTitle>
            <DialogDescription>Choose the message, audience, and delivery schedule.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Live Preview</p>
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card shadow-sm">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,var(--primary),transparent_28%)]" />
              <div className="relative flex h-[156px] items-stretch">
                {previewImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImageUrl}
                    alt=""
                    className={`h-full w-[40%] border-r border-border/40 bg-white object-center ${
                      form.imageFit === "contain" ? "object-contain p-3" : "object-cover"
                    }`}
                  />
                ) : (
                  <div className="flex h-full w-[40%] items-center justify-center border-r border-border/40 bg-primary/10">
                    <Megaphone className="size-8 text-primary" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 pr-10">
                  <span className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {form.label}
                  </span>
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {form.title || "Your ad title"}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {form.description || "Your ad description will appear here."}
                  </p>
                  {form.ctaText && form.ctaUrl && (
                    <span className={`${buttonVariants({ size: "xs" })} mt-2 w-fit`}>
                      {form.ctaText}
                      <ArrowUpRight className="size-3" />
                    </span>
                  )}
                </div>
                <span className="absolute right-2.5 top-2.5 rounded-full border border-border/50 bg-background/70 p-1.5 text-muted-foreground">
                  <X className="size-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} maxLength={150} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea className="min-h-24" value={form.description} maxLength={1000} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ad label</label>
              <Select value={form.label} onValueChange={(value) => value && setForm({ ...form, label: value as AdLabel })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Special Offer", "Announcement", "New Feature", "Upgrade", "Recommended for You"].map((label) => (
                    <SelectItem key={label} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Image display</label>
              <Select value={form.imageFit} onValueChange={(value) => value && setForm({ ...form, imageFit: value as ImageFit })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Fill / Crop</SelectItem>
                  <SelectItem value="contain">Fit / Show full image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Ad image <span className="text-muted-foreground">(optional)</span></label>
              <p className="text-xs text-muted-foreground">Recommended: at least 800 × 450px in 16:9 or 3:2 ratio · JPG, PNG or WEBP · max 5 MB</p>
              <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-muted/15 px-4 text-sm text-muted-foreground hover:bg-muted/30">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5 MB.");
                    setImage(file);
                  }}
                />
                <ImagePlus className="mr-2 size-4" />
                {image?.name || (editing?.image_path ? "Replace current image" : "Choose an image")}
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Button text</label>
              <Input value={form.ctaText} maxLength={50} placeholder="Get Offer" onChange={(event) => setForm({ ...form, ctaText: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Button link</label>
              <Input value={form.ctaUrl} maxLength={1000} placeholder="/contact or https://..." onChange={(event) => setForm({ ...form, ctaUrl: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Website targeting</label>
              <Select value={form.websiteTarget} onValueChange={(value) => value && setForm({ ...form, websiteTarget: value as WebsiteTarget })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All businesses</SelectItem>
                  <SelectItem value="missing">Website missing</SelectItem>
                  <SelectItem value="present">Website present</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Specific business <span className="text-muted-foreground">(optional)</span></label>
              <Select value={form.businessId || "all"} onValueChange={(value) => setForm({ ...form, businessId: value === "all" || !value ? "" : value })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All matching businesses</SelectItem>
                  {businesses.map((business) => <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Subscription plans <span className="text-muted-foreground">(none selected = all plans)</span></label>
              <div className="flex flex-wrap gap-2">
                {plans.map((plan) => {
                  const selected = form.planIds.includes(plan.id);
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        planIds: selected ? form.planIds.filter((id) => id !== plan.id) : [...form.planIds, plan.id],
                      })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {plan.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start date <span className="text-muted-foreground">(optional)</span></label>
              <Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">End date <span className="text-muted-foreground">(optional)</span></label>
              <Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority (0–100)</label>
              <Input type="number" min={0} max={100} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Allow this ad to be delivered.</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>
          </div>

          <Button className="w-full" disabled={saving} onClick={() => void save()}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Megaphone className="size-4" />}
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Ad"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
