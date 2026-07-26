import { PaymentPageClient } from "./payment-page-client";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const { plan } = await searchParams;
  const initialPlanId = Array.isArray(plan) ? plan[0] : plan;

  return <PaymentPageClient initialPlanId={initialPlanId ?? ""} />;
}
