"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  Store,
  Tag,
  MapPin,
  Home,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Boxes,
  PackageCheck,
  Clock,
  BadgeCheck,
  Building2,
  Star,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { provisionUser } from "@/lib/supabase/provision-user";
import { uploadFile } from "@/lib/uploads";
import Image from "next/image";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessType: string;
  businessPhone: string;
  district: string;
  address: string;
  logoFile: File | null;
  logoPreviewUrl: string | null;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  businessType: "",
  businessPhone: "",
  district: "",
  address: "",
  logoFile: null,
  logoPreviewUrl: null,
};

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Personal Details", icon: User },
  { number: 2, label: "Business Info", icon: Store },
  { number: 3, label: "Review & Submit", icon: BadgeCheck },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getSignupErrorMessage(error: {
  status?: number;
  code?: string;
  message: string;
}) {
  if (
    error.status === 429 ||
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit"
  ) {
    return "Too many confirmation emails have been requested. Please wait before trying again, or contact support if the problem continues.";
  }

  if (error.code === "email_address_not_authorized") {
    return "This email address is not authorized by the current email provider. Please contact support.";
  }

  return error.message;
}

// ──────────────────────────────────────────────
// Brand Panel (left side)
// ──────────────────────────────────────────────

const highlights = [
  {
    icon: PackageCheck,
    title: "Orders, beautifully organized",
    description: "Follow every order from confirmation through delivery.",
  },
  {
    icon: Boxes,
    title: "Inventory that stays in sync",
    description: "Know what is available before it slows your business down.",
  },
  {
    icon: BarChart3,
    title: "Decisions backed by clarity",
    description: "See the numbers that matter without wrestling spreadsheets.",
  },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center">
        <Image
          src="/lightmode-logo.png"
          alt="BizRavana"
          width={44}
          height={44}
          className="size-full object-contain dark:hidden"
        />
        <Image
          src="/darkmode-logo.png"
          alt="BizRavana"
          width={44}
          height={44}
          className="hidden size-full object-contain dark:block"
        />
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tighter text-hero-foreground">
          BizRavana
        </p>
        <p className="text-sm font-medium tracking-wider text-hero-muted">
          BUSINESS, SIMPLIFIED
        </p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-hero-foreground/10 bg-hero-foreground/[0.07] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="rounded-[18px] border border-hero-foreground/10 bg-hero/90 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="h-2 w-16 rounded-full bg-hero-foreground/20" />
              <div className="mt-2 h-3 w-28 rounded-full bg-hero-foreground/80" />
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
              <TrendingUp className="size-4 text-primary-foreground/80" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              ["Today", "24"],
              ["Revenue", "Rs. 86K"],
              ["Pending", "07"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border p-3",
                  index === 1
                    ? "border-primary/20 bg-primary/10"
                    : "border-hero-foreground/[0.07] bg-hero-foreground/[0.035]",
                )}
              >
                <p className="text-sm text-hero-muted">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-hero-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-hero-foreground/[0.07] bg-hero-foreground/[0.025] p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-2.5 w-20 rounded-full bg-hero-foreground/70" />
              <div className="h-2 w-10 rounded-full bg-primary/50" />
            </div>
            <div className="flex h-20 items-end gap-2">
              {[42, 62, 48, 78, 58, 92, 72, 100, 82, 112].map(
                (height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t bg-gradient-to-t from-revenue/35 to-net-profit/80"
                    style={{ height: `${height / 1.4}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl border border-hero-foreground/10 bg-hero/95 px-3 py-2.5 shadow-xl backdrop-blur-xl">
        <div className="flex size-7 items-center justify-center rounded-lg bg-success/15">
          <Check className="size-3.5 text-success" />
        </div>
        <div>
          <p className="text-sm text-hero-muted">Latest order</p>
          <p className="text-sm font-medium text-hero-foreground">
            Ready to dispatch
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterBrandPanel() {
  return (
    <section className="relative hidden min-h-screen w-[52%] max-w-[760px] overflow-hidden bg-hero lg:flex lg:flex-col">
      {/* Ambient orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,oklch(0.623_0.214_259.815_/_0.22),transparent_34%),radial-gradient(circle_at_90%_70%,oklch(0.715_0.143_311.379_/_0.12),transparent_30%)]" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(oklch(1_0_0_/_0.12)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.12)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

      <div className="relative z-10 flex min-h-screen flex-col px-10 py-9 xl:px-14 xl:py-11">
        <BrandMark />

        <div className="my-auto py-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" />
            Built for ambitious Sri Lankan businesses
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tighter tracking-tightest text-hero-foreground xl:text-hero-lg">
            Start your free trial in under 2 minutes.
          </h1>
          <p className="mt-5 max-w-lg text-body-lg leading-7 text-hero-muted">
            No credit card. No commitment. Just a clean, powerful workspace for
            orders, customers, stock, and the numbers that drive your business.
          </p>

          {/* Free trial benefits */}
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, label: "3-day free trial" },
              { icon: BadgeCheck, label: "Full access" },
              { icon: Star, label: "No payment needed" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-hero-foreground/10 bg-hero-foreground/[0.06] px-3 py-2.5"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-success/15">
                  <Icon className="size-3 text-success" />
                </div>
                <span className="text-sm font-medium text-hero-foreground/90">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-4 text-sm font-semibold tracking-wider text-hero-muted">
              WHAT YOU GET
            </p>
            <div className="grid max-w-lg gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-xl border border-hero-foreground/10 bg-hero-foreground/[0.06]">
                    <Icon className="size-4 text-hero-foreground/80" />
                  </div>
                  <p className="text-sm font-medium leading-5 text-hero-foreground/90">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-hero-muted/80">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <DashboardPreview />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-hero-muted/80">
          <ShieldCheck className="size-3.5" />
          Secure, private, and designed for everyday work.
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Step Transition Variants
// ──────────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ──────────────────────────────────────────────
// Register Form (right side)
// ──────────────────────────────────────────────

function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, GIF, or AVIF).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be smaller than 2MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, logoFile: file, logoPreviewUrl: previewUrl }));
  };

  const handleLogoRemove = () => {
    if (formData.logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setFormData((prev) => ({ ...prev, logoFile: null, logoPreviewUrl: null }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const goToStep = useCallback(
    (nextStep: number) => {
      setDirection(nextStep > step ? 1 : -1);
      setStep(nextStep);
    },
    [step],
  );

  const isGmailAddress = (email: string) => {
    const clean = email.trim().toLowerCase();
    return clean.endsWith("@gmail.com") || clean.endsWith("@googlemail.com");
  };

  const isStep1Valid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    isGmailAddress(formData.email) &&
    formData.phone.trim() !== "" &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const isStep2Valid = formData.businessName.trim() !== "";

  // Progress percentage
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    if (!isGmailAddress(formData.email)) {
      setError("Only Gmail addresses (@gmail.com) are accepted for registration.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              business_name: formData.businessName,
              business_type: formData.businessType,
              business_phone: formData.businessPhone,
              district: formData.district,
              address: formData.address,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        },
      );

      if (signUpError) {
        setError(getSignupErrorMessage(signUpError));
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      if (!authData.session) {
        setNotice(
          "Account created! Please check your email to confirm your account before signing in.",
        );
        setLoading(false);
        return;
      }

      const provisionError = await provisionUser(supabase, authData.user);
      if (provisionError) {
        setError(provisionError);
        setLoading(false);
        return;
      }

      // ── Upload business logo if selected ──
      if (formData.logoFile) {
        try {
          const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", authData.user.id)
            .single();

          if (business) {
            const { publicUrl } = await uploadFile("business-logo", formData.logoFile);
            await supabase
              .from("businesses")
              .update({ logo_url: publicUrl })
              .eq("id", business.id);
          }
        } catch (logoErr) {
          console.error("Logo upload failed:", logoErr);
        }
      }

      // Clean up blob URL
      if (formData.logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.logoPreviewUrl);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      {/* Background blobs */}
      <div className="absolute -right-32 -top-32 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative w-full max-w-[440px]">
        {/* Mobile brand mark */}
        <div className="mb-8 lg:hidden">
          <div className="inline-flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center">
              <Image
                src="/lightmode-logo.png"
                alt="BizRavana"
                width={44}
                height={44}
                className="size-full object-contain dark:hidden"
              />
              <Image
                src="/darkmode-logo.png"
                alt="BizRavana"
                width={44}
                height={44}
                className="hidden size-full object-contain dark:block"
              />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                BizRavana
              </p>
              <p className="text-sm font-medium tracking-widest-alt text-muted-foreground">
                BUSINESS, SIMPLIFIED
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-primary">
            Get started
          </p>
          <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
            Create your free account
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {step === 1 &&
              "Enter your personal details to create an account."}
            {step === 2 && "Tell us about your business."}
            {step === 3 &&
              "Review your information and start your free trial."}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-7">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => (
              <div key={s.number} className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    s.number < step &&
                      "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                    s.number === step &&
                      "border-2 border-primary bg-primary/10 text-primary",
                    s.number > step &&
                      "border-2 border-border bg-card text-muted-foreground",
                  )}
                >
                  {s.number < step ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <s.icon className="size-4" strokeWidth={2} />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-300",
                    s.number <= step
                      ? "text-foreground"
                      : "text-muted-foreground/60",
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Error / Notice */}
        <AnimatePresence>
          {(error || notice) && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                  {error}
                </div>
              )}
              {notice && (
                <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success dark:text-success">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  {notice}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`step-${step}`}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* ── Step 1: Personal Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <InputGroup
                  id="fullName"
                  label="Full Name"
                  required
                  icon={User}
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Your full name"
                />

                <InputGroup
                  id="email"
                  label="Email Address"
                  required
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@gmail.com"
                  error={
                    formData.email.trim() !== "" &&
                    !isGmailAddress(formData.email)
                      ? "Only Gmail addresses (@gmail.com) are accepted"
                      : undefined
                  }
                />

                <InputGroup
                  id="phone"
                  label="Phone / WhatsApp Number"
                  required
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0712345678"
                />

                <InputGroup
                  id="password"
                  label="Password"
                  required
                  type={showPassword ? "text" : "password"}
                  icon={LockKeyhole}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 6 characters"
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/45"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </InputGroup>

                <InputGroup
                  id="confirmPassword"
                  label="Confirm Password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  icon={LockKeyhole}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Repeat your password"
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/45"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </InputGroup>

                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="-mt-2 text-sm text-destructive"
                    >
                      Passwords do not match
                    </motion.p>
                  )}

                <Button
                  className="group w-full"
                  variant="gradient"
                  size="lg"
                  disabled={!isStep1Valid}
                  onClick={() => goToStep(2)}
                >
                  Continue
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            )}

            {/* ── Step 2: Business Details ── */}
            {step === 2 && (
              <div className="space-y-4">
                <InputGroup
                  id="businessName"
                  label="Business Name"
                  required
                  icon={Store}
                  value={formData.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="Your business name"
                />

                <InputGroup
                  id="businessType"
                  label="Business Type"
                  icon={Tag}
                  value={formData.businessType}
                  onChange={(e) => updateField("businessType", e.target.value)}
                  placeholder="Retail, Manufacturing, Service, etc."
                />

                <InputGroup
                  id="businessPhone"
                  label="Business Phone"
                  icon={Phone}
                  value={formData.businessPhone}
                  onChange={(e) =>
                    updateField("businessPhone", e.target.value)
                  }
                  placeholder="Business phone number"
                />

                <InputGroup
                  id="district"
                  label="District"
                  icon={MapPin}
                  value={formData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="e.g., Colombo, Gampaha"
                />

                <InputGroup
                  id="address"
                  label="Address"
                  icon={Home}
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Business address"
                />

                {/* ── Logo Upload ── */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-secondary-foreground">
                    Business Logo{" "}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground/50">
                      (optional)
                    </span>
                  </Label>

                  {formData.logoPreviewUrl ? (
                    <div className="group relative flex items-center gap-4 rounded-xl border-2 border-border/50 bg-card p-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-muted/20">
                        <Image
                          src={formData.logoPreviewUrl}
                          alt="Business logo preview"
                          fill
                          sizes="64px"
                          unoptimized
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {formData.logoFile?.name || "Logo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.logoFile
                            ? `${(formData.logoFile.size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove logo"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-card/50 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-border/30 bg-background">
                        <Upload className="size-5" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Upload your logo</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                          PNG, JPEG, WebP — max 2MB
                        </p>
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => goToStep(1)}
                    className="group flex-1"
                  >
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back
                  </Button>
                  <Button
                    className="group flex-1"
                    variant="gradient"
                    size="lg"
                    disabled={!isStep2Valid}
                    onClick={() => goToStep(3)}
                  >
                    Continue
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review & Submit ── */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Summary card */}
                <div className="rounded-2xl border border-border/30 bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <Row label="Name" value={formData.fullName} />
                    <Row label="Email" value={formData.email} />
                    <Row label="Phone" value={formData.phone} />
                  </div>

                  <div className="my-4 border-t border-border/20" />

                  <div className="mb-4 flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Business Information
                    </h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <Row label="Name" value={formData.businessName} />
                    <Row
                      label="Type"
                      value={formData.businessType || "Not specified"}
                    />
                    <Row
                      label="Phone"
                      value={formData.businessPhone || "Not specified"}
                    />
                    <Row label="District" value={formData.district || "Not specified"} />
                    <Row label="Address" value={formData.address || "Not specified"} />
                  </div>
                </div>

                {/* Free trial banner */}
                <div className="rounded-2xl border border-success/20 bg-gradient-to-br from-success/[0.06] to-success/[0.02] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15">
                      <BadgeCheck className="size-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        3-Day Free Trial — Full Access
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        Your trial starts the moment you create your account.
                        Enjoy unrestricted access to every feature. No payment
                        method required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  className="group w-full"
                  variant="gradient"
                  size="lg"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account — Start Free Trial
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="group w-full"
                  onClick={() => goToStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                  Back
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Already registered?
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Sign in link */}
        <Link
          href="/login"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
        >
          Sign in to your workspace
          <ArrowRight className="size-4" />
        </Link>

        {/* Security footer */}
        <div className="mt-7 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Protected by secure authentication
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

interface InputGroupProps {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  children?: React.ReactNode;
}

function InputGroup({
  id,
  label,
  required = false,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  children,
}: InputGroupProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-secondary-foreground"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive">*</span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground/50">
            (optional)
          </span>
        )}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="h-12 rounded-xl border-border bg-card pl-11 pr-4 text-sm shadow-sm shadow-border/30 transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
        />
        {children}
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[200px] truncate text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Loading Skeleton
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Page Export
// ──────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full">
      <RegisterBrandPanel />
      <RegisterForm />
    </div>
  );
}
