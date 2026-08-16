import { PaymentPageClient } from "./payment-page-client";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string | string[];
    billing?: string | string[];
  }>;
}) {
  const { plan, billing } = await searchParams;
  const initialPlanId = Array.isArray(plan) ? plan[0] : plan;
  const rawBilling = Array.isArray(billing) ? billing[0] : billing;
  const initialBillingPeriod = rawBilling === "yearly" ? "yearly" : "monthly";

  return (
    <PaymentPageClient
      initialPlanId={initialPlanId ?? ""}
      initialBillingPeriod={initialBillingPeriod}
    />
  );
}
