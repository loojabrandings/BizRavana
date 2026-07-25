"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { DotPattern } from "@/components/landing/velora/grid-pattern";

const sections = [
  {
    title: "1. Free Trial",
    content: [
      "BizRavana offers a 3-day free trial to eligible new users.",
      "The purpose of the free trial is to allow you to evaluate the platform and determine whether it meets your business requirements before purchasing a subscription.",
      "No payment is required to start the free trial.",
    ],
  },
  {
    title: "2. Subscription Payments",
    content: [
      "BizRavana is a subscription-based Software as a Service (SaaS) platform.",
      "Subscription payments provide access to the selected plan and its available features for the chosen billing period.",
      "Subscription fees are charged securely through trusted third-party payment providers, including PayHere.",
    ],
  },
  {
    title: "3. Cancellation",
    content: [
      "You may cancel your subscription at any time.",
      "If you cancel: Your subscription will remain active until the end of your current billing period. You will continue to have access to all features included in your subscription until that period expires. Cancellation prevents future subscription renewals but does not immediately terminate your account.",
      "If automatic recurring billing is available and enabled, cancellation will stop future recurring payments.",
      "If automatic recurring billing is not available, no further action is required after your current subscription expires.",
    ],
  },
  {
    title: "4. Refund Policy",
    content: [
      "Because BizRavana provides a free trial before purchase, subscription payments are generally non-refundable.",
      "Once a subscription payment has been successfully processed and access to the subscribed plan has been provided, refunds will not be issued simply because: You no longer wish to use the Service, You changed your mind after purchasing, You did not use the Service, Your business requirements changed, You forgot to cancel before the next renewal date, or You only used part of your subscription period.",
    ],
  },
  {
    title: "5. Duplicate or Incorrect Payments",
    content: [
      "If you believe you were charged incorrectly or a duplicate payment was processed, you must contact BizRavana within 14 days of the transaction date.",
      "Each request will be reviewed individually.",
      "If BizRavana confirms that a duplicate payment was processed, an incorrect amount was charged due to a billing error, or another payment error occurred that was the responsibility of BizRavana, an appropriate refund may be approved.",
    ],
  },
  {
    title: "6. Approved Refunds",
    content: [
      "Where a refund is approved, BizRavana will initiate the refund within 3 business days after approval.",
      "Refunds will be issued to the original payment method whenever possible.",
      "Please note that the time taken for the refunded amount to appear in your account depends on your payment provider or financial institution and is outside the control of BizRavana.",
    ],
  },
  {
    title: "7. Situations Where Refunds Will Not Be Provided",
    content: [
      "Refunds will generally not be provided in the following situations:",
      "Subscription payments after successful activation.",
      "Partial use of a subscription period.",
      "Failure to cancel before the next billing cycle.",
      "Change of mind after purchasing.",
      "Lack of usage after subscription activation.",
      "Suspension or termination of an account due to violation of our Terms & Conditions.",
      "Service interruptions caused by third-party providers or circumstances beyond our reasonable control.",
    ],
  },
  {
    title: "8. Subscription Expiry",
    content: [
      "If your subscription expires:",
      "Your account may enter Read-Only Mode.",
      "Existing business data may remain available during the applicable retention period.",
      "Certain features, including creating or editing records, may be restricted until your subscription is renewed.",
    ],
  },
  {
    title: "9. How to Request a Refund",
    content: [
      "To request a refund for an eligible payment issue, please contact us with the following information:",
      "Registered email address, Business name, Transaction ID or payment reference, Payment date, Amount paid, and Description of the issue.",
      "Providing complete information helps us process your request more efficiently.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    content: [
      "BizRavana reserves the right to update or modify this Refund & Cancellation Policy at any time.",
      "Any changes will be published on this page together with the revised \"Last Updated\" date.",
      "Continued use of the Services after changes become effective constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "11. Contact Us",
    content: [
      "If you have any questions regarding this Refund & Cancellation Policy, please contact us.",
      "BizRavana",
      "Address: Near the temple, Seelagama, Belihuloya",
      "Email: loojabrandings@gmail.com",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="relative">
      <ScrollProgress />
      <SiteHeader />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_60%)]" />
        <DotPattern className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] stroke-border/20 fill-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 text-center lg:px-8">
          <BlurFade>
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm backdrop-blur">
              <RotateCcw className="size-3.5 text-primary" />
              <span className="font-medium">Our policy</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              <span className="text-primary">Refund</span> &amp;{" "}
              <span className="text-primary">Cancellation</span> Policy
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              This Refund &amp; Cancellation Policy explains how subscription
              cancellations and refund requests are handled when you use our
              Services. By purchasing a BizRavana subscription, you agree to
              this policy.
            </p>
          </BlurFade>
          <BlurFade delay={0.3}>
            <p className="mt-4 text-sm text-muted-foreground/60">
              Last updated: July 2026
            </p>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Content ═══ */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <BlurFade>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="divide-y divide-border/60">
                {sections.map((section, i) => (
                  <BlurFade key={section.title} delay={i * 0.05}>
                    <div className="p-6 sm:p-8">
                      <h2 className="text-xl font-semibold tracking-tight">
                        {section.title}
                      </h2>
                      <div className="mt-4 space-y-3">
                        {section.content.map((item) => (
                          <p
                            key={item}
                            className="text-sm text-muted-foreground leading-relaxed"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="mt-12 rounded-xl border bg-card/50 p-6 text-center sm:p-8">
              <p className="text-sm text-muted-foreground">
                If you have any questions regarding this Refund &amp;
                Cancellation Policy, please{" "}
                <Link
                  href="/contact"
                  className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  contact us
                </Link>
                .
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
