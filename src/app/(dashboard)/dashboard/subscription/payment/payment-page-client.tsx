"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Eye,
  Landmark,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type SubscriptionPlan =
  Database["public"]["Tables"]["subscription_plans"]["Row"];

type PaymentMethod = "card" | "bank";

interface CardCustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface AdminSettings {
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  payment_instructions: string;
  support_whatsapp: string;
}

interface PayHereInitiationResponse {
  error?: string;
  payment?: PayHerePayment;
}

interface PayHereStatusResponse {
  error?: string;
  payment?: {
    orderId: string;
    status:
      | "created"
      | "pending"
      | "success"
      | "canceled"
      | "failed"
      | "chargedback"
      | "invalid";
    statusMessage: string | null;
    activated: boolean;
  };
}

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  bank_name: "Commercial Bank of Ceylon",
  bank_account_name: "BizRavana Technologies",
  bank_account_number: "1234567890",
  bank_branch: "Colombo 01",
  payment_instructions: "",
  support_whatsapp: "94750350109",
};

const EMPTY_CARD_CUSTOMER_DETAILS: CardCustomerDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Sri Lanka",
};

function formatLimit(value: number) {
  return value >= 999999 ? "Unlimited" : value.toLocaleString();
}

function getCardCustomerFieldError(
  field: keyof CardCustomerDetails,
  value: string,
) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "This field is required.";

  if (
    field === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
  ) {
    return "Enter a valid email address.";
  }

  if (field === "phone") {
    const digits = trimmedValue.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      return "Enter a valid phone number.";
    }
  }

  return null;
}

export function PaymentPageClient({
  initialPlanId,
}: {
  initialPlanId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptPreviewUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardCustomer, setCardCustomer] = useState<CardCustomerDetails>(
    EMPTY_CARD_CUSTOMER_DETAILS,
  );
  const [cardValidationAttempted, setCardValidationAttempted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [adminSettings, setAdminSettings] = useState(DEFAULT_ADMIN_SETTINGS);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(
    null,
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payHereReady, setPayHereReady] = useState(false);
  const [payHereScriptFailed, setPayHereScriptFailed] = useState(false);
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [submittedPayment, setSubmittedPayment] = useState<{
    planName: string;
    amount: number;
  } | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  useEffect(
    () => () => {
      if (receiptPreviewUrlRef.current) {
        URL.revokeObjectURL(receiptPreviewUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const loadPaymentPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/dashboard/subscription/payment");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id, full_name, phone")
        .eq("user_id", user.id)
        .single();

      if (!profile?.business_id) {
        toast.error("Your business account could not be found.");
        router.replace("/dashboard/subscription");
        return;
      }

      const [
        plansResult,
        businessResult,
        settingsResult,
        pendingResult,
        businessSettingsResult,
      ] =
        await Promise.all([
          supabase
            .from("subscription_plans")
            .select("*")
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("businesses")
            .select("name, phone, district, address")
            .eq("id", profile.business_id)
            .single(),
          supabase
            .from("admin_settings")
            .select("value")
            .eq("key", "admin_settings")
            .maybeSingle(),
          supabase
            .from("payment_proofs")
            .select("id")
            .eq("business_id", profile.business_id)
            .eq("status", "pending")
            .limit(1)
            .maybeSingle(),
          supabase
            .from("business_settings")
            .select("key, value")
            .eq("business_id", profile.business_id)
            .in("key", ["business_email", "city", "country"]),
        ]);

      const availablePlans = (plansResult.data ?? []).filter(
        (plan) =>
          plan.monthly_price > 0 &&
          !["trial", "enterprise"].includes(plan.name.toLowerCase()),
      );
      setPlans(availablePlans);
      setBusinessName(businessResult.data?.name ?? "");
      setPendingPayment(Boolean(pendingResult.data));

      const businessSettings = Object.fromEntries(
        (businessSettingsResult.data ?? []).map((setting) => [
          setting.key,
          String(setting.value ?? ""),
        ]),
      );
      const fullName = profile.full_name.trim();
      const lastSpaceIndex = fullName.lastIndexOf(" ");
      const firstName =
        lastSpaceIndex > 0 ? fullName.slice(0, lastSpaceIndex) : fullName;
      const lastName =
        lastSpaceIndex > 0 ? fullName.slice(lastSpaceIndex + 1) : "";

      setCardCustomer({
        firstName,
        lastName,
        email: user.email ?? businessSettings.business_email ?? "",
        phone: profile.phone ?? businessResult.data?.phone ?? "",
        address: businessResult.data?.address ?? "",
        city: businessSettings.city || businessResult.data?.district || "",
        country: businessSettings.country || "Sri Lanka",
      });

      if (settingsResult.data?.value) {
        setAdminSettings({
          ...DEFAULT_ADMIN_SETTINGS,
          ...(settingsResult.data.value as Partial<AdminSettings>),
        });
      }

      const requestedPlanExists = availablePlans.some(
        (plan) => plan.id === initialPlanId,
      );
      setSelectedPlanId(
        requestedPlanExists ? initialPlanId : (availablePlans[0]?.id ?? ""),
      );
      setLoading(false);
    };

    void loadPaymentPage();
  }, [initialPlanId, router, supabase]);

  const selectReceipt = useCallback((file: File | undefined) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Upload a JPG, PNG, WEBP, or PDF receipt.");
      return;
    }
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
      toast.error("The receipt must be smaller than 5 MB.");
      return;
    }

    if (receiptPreviewUrlRef.current) {
      URL.revokeObjectURL(receiptPreviewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    receiptPreviewUrlRef.current = previewUrl;
    setReceiptPreviewUrl(previewUrl);
    setReceipt(file);
  }, []);

  const clearReceipt = useCallback(() => {
    if (receiptPreviewUrlRef.current) {
      URL.revokeObjectURL(receiptPreviewUrlRef.current);
      receiptPreviewUrlRef.current = null;
    }
    setReceiptPreviewUrl(null);
    setReceipt(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const copyBankDetail = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedBankField(label);
      toast.success(`${label} copied.`);
      setTimeout(() => {
        setCopiedBankField((current) => (current === label ? null : current));
      }, 2000);
    } catch {
      toast.error(`${label} could not be copied.`);
    }
  }, []);

  const updateCardCustomer = useCallback(
    (field: keyof CardCustomerDetails, value: string) => {
      setCardCustomer((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const waitForPayHereConfirmation = useCallback(async (orderId: string) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(
        `/api/payments/payhere/status?orderId=${encodeURIComponent(orderId)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as PayHereStatusResponse;

      if (!response.ok || !result.payment) {
        throw new Error(result.error || "Payment status could not be checked.");
      }

      if (
        result.payment.status === "success" &&
        result.payment.activated
      ) {
        return result.payment;
      }
      if (
        ["canceled", "failed", "chargedback", "invalid"].includes(
          result.payment.status,
        )
      ) {
        return result.payment;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    return null;
  }, []);

  const continueToPayHere = useCallback(async () => {
    const customerFields: Array<
      [string, keyof CardCustomerDetails, string]
    > = [
      ["first name", "firstName", cardCustomer.firstName],
      ["last name", "lastName", cardCustomer.lastName],
      ["email", "email", cardCustomer.email],
      ["phone", "phone", cardCustomer.phone],
      ["address", "address", cardCustomer.address],
      ["city", "city", cardCustomer.city],
      ["country", "country", cardCustomer.country],
    ];
    const invalidFields = customerFields
      .filter(([, field, value]) => getCardCustomerFieldError(field, value))
      .map(([label]) => label);

    setCardValidationAttempted(true);

    if (!selectedPlan) {
      toast.error("Select a subscription plan.");
      return;
    }
    if (invalidFields.length > 0) {
      toast.error("Check the customer details.", {
        description: `Review: ${invalidFields.join(", ")}.`,
      });
      return;
    }

    if (!payHereReady || !window.payhere) {
      toast.error("PayHere checkout is still loading.", {
        description: "Please wait a moment and try again.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/payments/payhere/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customer: cardCustomer,
        }),
      });
      const result = (await response.json()) as PayHereInitiationResponse;

      if (!response.ok || !result.payment) {
        throw new Error(result.error || "PayHere checkout could not be prepared.");
      }

      const payment = result.payment;
      const payhere = window.payhere;
      const recordClientEvent = async (
        event: "completed" | "dismissed" | "sdk_error",
        message?: string,
      ) => {
        const eventResponse = await fetch(
          "/api/payments/payhere/client-event",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: payment.order_id,
              event,
              message,
            }),
          },
        );

        if (!eventResponse.ok) {
          console.error("PayHere client event could not be recorded.");
        }
      };

      payhere.onCompleted = () => {
        void recordClientEvent("completed");
        const loadingToast = toast.loading("Confirming your payment...", {
          description: "This normally takes less than 30 seconds.",
        });

        void waitForPayHereConfirmation(payment.order_id)
          .then((confirmedPayment) => {
            toast.dismiss(loadingToast);

            if (
              confirmedPayment?.status === "success" &&
              confirmedPayment.activated
            ) {
              toast.success("Payment successful.", {
                description: "Your subscription is now active.",
              });
              router.replace(
                `/dashboard/subscription?payment=success&order_id=${encodeURIComponent(payment.order_id)}`,
              );
              router.refresh();
              return;
            }

            if (confirmedPayment) {
              toast.error("Payment was not successful.", {
                description:
                  confirmedPayment.statusMessage ||
                  "No charge was confirmed by PayHere.",
              });
              setSubmitting(false);
              return;
            }

            toast.info("Payment confirmation is taking longer than expected.", {
              description:
                "Do not pay again. Check your subscription page in a moment.",
            });
            router.replace(
              `/dashboard/subscription?payment=pending&order_id=${encodeURIComponent(payment.order_id)}`,
            );
            router.refresh();
          })
          .catch((error) => {
            toast.dismiss(loadingToast);
            toast.error("Payment status could not be confirmed.", {
              description:
                error instanceof Error ? error.message : "Please try again.",
            });
            setSubmitting(false);
          });
      };

      payhere.onDismissed = () => {
        setSubmitting(false);
        void recordClientEvent("dismissed");
        toast.info("PayHere checkout was closed.", {
          description: "No completed payment was confirmed.",
        });
      };

      payhere.onError = (error) => {
        setSubmitting(false);
        void recordClientEvent("sdk_error", error);
        toast.error("PayHere checkout could not be opened.", {
          description: error || "Please check the payment details and try again.",
        });
      };

      payhere.startPayment({
        ...payment,
        // The popup SDK requires these to be undefined to avoid a page redirect.
        return_url: undefined,
        cancel_url: undefined,
      });
    } catch (error) {
      setSubmitting(false);
      toast.error("Card payment could not be started.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [
    cardCustomer,
    payHereReady,
    router,
    selectedPlan,
    waitForPayHereConfirmation,
  ]);

  const submitPayment = useCallback(async () => {
    if (!selectedPlan || !receipt) {
      toast.error("Select a plan and attach your bank-transfer receipt.");
      return;
    }
    if (pendingPayment) {
      toast.error("You already have a payment waiting for review.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("planId", selectedPlan.id);
      payload.set("notes", notes);
      payload.set("receipt", receipt);

      const response = await fetch("/api/payments/bank-transfer", {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as {
        error?: string;
        payment?: { planName: string; amount: number };
      };

      if (!response.ok || !result.payment) {
        throw new Error(result.error || "Payment submission failed.");
      }

      setSubmittedPayment(result.payment);
      setPendingPayment(true);
      clearReceipt();
      setNotes("");
      toast.success("Payment receipt submitted for review.");
    } catch (error) {
      toast.error("Payment could not be submitted.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }, [clearReceipt, notes, pendingPayment, receipt, selectedPlan]);

  const informAdmin = useCallback(() => {
    if (!submittedPayment) return;
    const message = [
      "*New Payment Receipt - BizRavana*",
      "",
      `Business: ${businessName || "—"}`,
      `Plan: ${submittedPayment.planName}`,
      `Amount: Rs. ${submittedPayment.amount.toLocaleString()}`,
      "",
      "Please review and approve.",
    ].join("\n");
    window.open(
      `https://wa.me/${adminSettings.support_whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }, [adminSettings.support_whatsapp, businessName, submittedPayment]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submittedPayment) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center p-4 sm:p-6">
        <div className="glass-card w-full rounded-3xl p-6 text-center sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-foreground">
            Payment submitted
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Your receipt for the {submittedPayment.planName} plan is waiting
            for admin review. The plan will be activated after approval.
          </p>
          <div className="mt-6 rounded-2xl border border-border/30 bg-muted/10 p-4">
            <p className="text-sm text-muted-foreground">Submitted amount</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              Rs. {submittedPayment.amount.toLocaleString()}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="gradient" onClick={informAdmin}>
              <MessageCircle className="size-4" />
              Inform Admin on WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/subscription")}
            >
              Back to Subscription
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        id="payhere-sdk"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onReady={() => {
          setPayHereReady(Boolean(window.payhere));
          setPayHereScriptFailed(false);
        }}
        onError={() => {
          setPayHereReady(false);
          setPayHereScriptFailed(true);
          toast.error("PayHere checkout could not be loaded.");
        }}
      />
      <div className="space-y-6 p-4 pb-24 sm:p-6">
      <button
        type="button"
        onClick={() => router.push("/dashboard/subscription")}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Subscription
      </button>

      <PageHeader
        title="Complete your payment"
        description="Confirm your plan and choose how you want to pay."
      />

      {pendingPayment && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/[0.06] p-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-warning">
              Payment already under review
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wait for the current payment to be approved or rejected before
              submitting another payment.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="glass-card rounded-2xl p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground">
              Choose a payment method
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay securely with PayHere or submit a bank-transfer receipt.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "relative rounded-2xl border p-4 text-left transition-all",
                  paymentMethod === "card"
                    ? "border-2 border-primary bg-primary/[0.04] shadow-sm shadow-primary/10"
                    : "border-border/30 bg-muted/10 hover:border-primary/30 hover:bg-primary/[0.02]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      paymentMethod === "card"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CreditCard className="size-5" />
                  </div>
                  {paymentMethod === "card" && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Card Payment
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Secure online payment with PayHere.
                </p>
                <div
                  className={cn(
                    "mt-4 flex items-center gap-1.5 text-xs font-medium",
                    paymentMethod === "card"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <BadgeCheck className="size-3.5" />
                  {paymentMethod === "card" ? "Selected" : "Select method"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={cn(
                  "relative rounded-2xl border p-4 text-left transition-all",
                  paymentMethod === "bank"
                    ? "border-2 border-primary bg-primary/[0.04] shadow-sm shadow-primary/10"
                    : "border-border/30 bg-muted/10 hover:border-primary/30 hover:bg-primary/[0.02]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      paymentMethod === "bank"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Landmark className="size-5" />
                  </div>
                  {paymentMethod === "bank" && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Bank Transfer
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transfer manually and attach your receipt.
                </p>
                <div
                  className={cn(
                    "mt-4 flex items-center gap-1.5 text-xs font-medium",
                    paymentMethod === "bank"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <BadgeCheck className="size-3.5" />
                  {paymentMethod === "bank" ? "Selected" : "Select method"}
                </div>
              </button>
            </div>
          </section>

          {paymentMethod === "card" ? (
            <CardCustomerForm
              details={cardCustomer}
              showValidation={cardValidationAttempted}
              onChange={updateCardCustomer}
            />
          ) : (
          <div className="grid items-stretch gap-6 xl:grid-cols-2">
            <BankDetails
              settings={adminSettings}
              businessName={businessName}
              copiedField={copiedBankField}
              onCopy={copyBankDetail}
            />

            <section className="glass-card flex h-full flex-col rounded-2xl p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground">
              Attach payment receipt
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a clear transfer receipt or bank confirmation.
            </p>

            {receipt && receiptPreviewUrl ? (
              <div className="relative mt-5 h-36 overflow-hidden rounded-2xl border border-primary/25 bg-muted/10">
                {receipt.type.startsWith("image/") ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${receiptPreviewUrl}")`,
                    }}
                    role="img"
                    aria-label={`Preview of ${receipt.name}`}
                  />
                ) : (
                  <iframe
                    src={`${receiptPreviewUrl}#toolbar=0&navpanes=0`}
                    title={`Preview of ${receipt.name}`}
                    className="pointer-events-none h-full w-full border-0 bg-background"
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      receiptPreviewUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/80 via-transparent to-transparent p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
                  aria-label={`Open ${receipt.name} preview`}
                >
                  <span className="flex items-center gap-2 rounded-full border border-border/40 bg-background/85 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition-colors group-hover:border-primary/30 group-hover:text-primary">
                    <Eye className="size-3.5" />
                    Click to open preview
                  </span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingPayment}
                className={cn(
                  "mt-5 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors",
                  "border-border/40 hover:border-primary/40 hover:bg-primary/[0.02]",
                  pendingPayment && "cursor-not-allowed opacity-50",
                )}
              >
                <Upload className="size-8 text-muted-foreground/50" />
                <span className="mt-3 text-sm font-medium text-foreground">
                  Click to attach your receipt
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WEBP, or PDF · maximum 5 MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => selectReceipt(event.target.files?.[0])}
            />

            {receipt && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                <span className="min-w-0 truncate text-sm text-muted-foreground">
                  {receipt.name}
                </span>
                <button
                  type="button"
                  onClick={clearReceipt}
                  className="ml-3 shrink-0 rounded-lg p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                  aria-label="Remove receipt"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <label
                htmlFor="payment-notes"
                className="text-sm font-medium text-foreground"
              >
                Notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="payment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Add any information that may help verify the transfer."
                className="w-full resize-none rounded-xl border border-border/40 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            </section>
          </div>
          )}
        </div>

        <OrderSummary
          plans={plans}
          selectedPlan={selectedPlan}
          selectedPlanId={selectedPlanId}
          paymentMethod={paymentMethod}
          pendingPayment={pendingPayment}
          receipt={receipt}
          submitting={submitting}
          payHereReady={payHereReady}
          payHereScriptFailed={payHereScriptFailed}
          onPlanChange={setSelectedPlanId}
          onBankSubmit={submitPayment}
          onCardContinue={continueToPayHere}
        />
      </div>
      </div>
    </>
  );
}

function CardCustomerForm({
  details,
  showValidation,
  onChange,
}: {
  details: CardCustomerDetails;
  showValidation: boolean;
  onChange: (field: keyof CardCustomerDetails, value: string) => void;
}) {
  const fields: Array<{
    field: keyof CardCustomerDetails;
    label: string;
    type?: "text" | "email" | "tel";
    autoComplete: string;
    placeholder: string;
    fullWidth?: boolean;
  }> = [
    {
      field: "firstName",
      label: "First name",
      autoComplete: "given-name",
      placeholder: "Enter first name",
    },
    {
      field: "lastName",
      label: "Last name",
      autoComplete: "family-name",
      placeholder: "Enter last name",
    },
    {
      field: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
      placeholder: "name@example.com",
    },
    {
      field: "phone",
      label: "Phone number",
      type: "tel",
      autoComplete: "tel",
      placeholder: "07X XXX XXXX",
    },
    {
      field: "address",
      label: "Address",
      autoComplete: "street-address",
      placeholder: "Enter billing address",
      fullWidth: true,
    },
    {
      field: "city",
      label: "City",
      autoComplete: "address-level2",
      placeholder: "Enter city",
    },
    {
      field: "country",
      label: "Country",
      autoComplete: "country-name",
      placeholder: "Enter country",
    },
  ];

  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Card-payment customer details
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm the details that will be sent securely to PayHere.
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="size-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((item) => {
          const validationError = getCardCustomerFieldError(
            item.field,
            details[item.field],
          );
          const invalid = showValidation && Boolean(validationError);
          const id = `payhere-${item.field}`;

          return (
            <div
              key={item.field}
              className={item.fullWidth ? "sm:col-span-2" : undefined}
            >
              <label
                htmlFor={id}
                className="text-sm font-medium text-foreground"
              >
                {item.label} <span className="text-destructive">*</span>
              </label>
              <Input
                id={id}
                type={item.type ?? "text"}
                value={details[item.field]}
                onChange={(event) => onChange(item.field, event.target.value)}
                autoComplete={item.autoComplete}
                placeholder={item.placeholder}
                required
                aria-invalid={invalid}
                className="mt-2 h-11 rounded-xl border-border/40 bg-background/40 px-3"
              />
              {invalid && (
                <p className="mt-1.5 text-xs text-destructive">
                  {validationError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/[0.03] p-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        Your card number and CVV will be entered only in PayHere&apos;s secure
        checkout. BizRavana does not collect or store card details.
      </div>
    </section>
  );
}

function BankDetails({
  settings,
  businessName,
  copiedField,
  onCopy,
}: {
  settings: AdminSettings;
  businessName: string;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
}) {
  const paymentRemark = `BzR_${businessName || "Business"}`;

  return (
    <section className="glass-card h-full rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Bank account details
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Transfer the exact amount shown in your order summary.
          </p>
        </div>
        <Building2 className="size-5 text-primary" />
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-border/30 bg-muted/10 p-4">
        {[
          ["Bank", settings.bank_name],
          ["Account name", settings.bank_account_name],
          ["Account number", settings.bank_account_number],
          ["Branch", settings.bank_branch || "—"],
          ["Remark", paymentRemark],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "mt-1 break-words text-sm font-semibold text-foreground",
                  label === "Account number" &&
                    "font-mono text-base font-bold tracking-wide",
                )}
              >
                {value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(label, value)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={`Copy ${label.toLowerCase()}`}
              title={`Copy ${label.toLowerCase()}`}
            >
              {copiedField === label ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {settings.payment_instructions && (
        <p className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.03] p-3 text-sm leading-6 text-muted-foreground">
          {settings.payment_instructions}
        </p>
      )}
    </section>
  );
}

function OrderSummary({
  plans,
  selectedPlan,
  selectedPlanId,
  paymentMethod,
  pendingPayment,
  receipt,
  submitting,
  payHereReady,
  payHereScriptFailed,
  onPlanChange,
  onBankSubmit,
  onCardContinue,
}: {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  selectedPlanId: string;
  paymentMethod: PaymentMethod;
  pendingPayment: boolean;
  receipt: File | null;
  submitting: boolean;
  payHereReady: boolean;
  payHereScriptFailed: boolean;
  onPlanChange: (id: string) => void;
  onBankSubmit: () => void;
  onCardContinue: () => void;
}) {
  return (
    <aside className="glass-card rounded-2xl p-5 lg:sticky lg:top-24 sm:p-6">
      <p className="text-sm font-semibold text-foreground">Order summary</p>
      <div className="mt-5 space-y-2">
        <p className="text-sm font-medium text-foreground">
          Subscription plan
        </p>
        <Dropdown
          value={selectedPlanId}
          onChange={(value) => value && onPlanChange(value)}
          options={plans.map((plan) => ({
            value: plan.id,
            label: `${plan.name} — Rs. ${plan.monthly_price.toLocaleString()}`,
          }))}
          placeholder="Select a subscription plan"
          disabled={pendingPayment || submitting}
          className="h-11 w-full rounded-xl"
          fullWidth
        />
      </div>

      {selectedPlan && (
        <>
          <div className="mt-5 space-y-3 rounded-2xl border border-border/30 bg-muted/10 p-4">
            {[
              ["Orders", formatLimit(selectedPlan.order_limit)],
              ["Expenses", formatLimit(selectedPlan.expense_limit)],
              ["Products", formatLimit(selectedPlan.product_limit)],
              [
                "Storage",
                selectedPlan.storage_limit_mb >= 999999
                  ? "Unlimited"
                  : `${selectedPlan.storage_limit_mb} MB`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border/30 pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  30-day subscription
                </p>
              </div>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                Rs. {selectedPlan.monthly_price.toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}

      <Button
        variant="gradient"
        className="mt-6 w-full"
        disabled={
          submitting ||
          pendingPayment ||
          !selectedPlan ||
          (paymentMethod === "card" && !payHereReady) ||
          (paymentMethod === "bank" && !receipt)
        }
        onClick={() =>
          paymentMethod === "card"
            ? onCardContinue()
            : void onBankSubmit()
        }
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : paymentMethod === "card" ? (
          <CreditCard className="size-4" />
        ) : (
          <Upload className="size-4" />
        )}
        {submitting
          ? paymentMethod === "card"
            ? "Opening PayHere..."
            : "Submitting..."
          : pendingPayment
            ? "Payment under review"
            : paymentMethod === "card"
              ? payHereScriptFailed
                ? "PayHere unavailable"
                : payHereReady
                  ? "Continue to PayHere"
                  : "Loading PayHere..."
              : "Submit for Review"}
      </Button>
      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        {paymentMethod === "card"
          ? "You will enter your card details securely in the PayHere checkout."
          : "The amount and plan are verified securely before activation."}
      </div>
    </aside>
  );
}
