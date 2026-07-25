"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { DotPattern } from "@/components/landing/velora/grid-pattern";

const sections = [
  {
    title: "1. About BizRavana",
    content: [
      "BizRavana is a cloud-based business management platform designed to help businesses manage orders, customers, products, inventory, quotations, invoices, expenses, courier operations, reports, and other business activities from a single workspace.",
    ],
  },
  {
    title: "2. Eligibility",
    content: [
      "To use BizRavana, you must:",
      "Be at least 18 years of age.",
      "Provide accurate, complete, and up-to-date registration information.",
      "Be legally capable of entering into a binding agreement.",
      "You are responsible for maintaining the confidentiality of your login credentials and for all activities performed under your account.",
    ],
  },
  {
    title: "3. Account Registration",
    content: [
      "When creating an account, you agree to:",
      "Provide accurate information.",
      "Keep your information updated.",
      "Protect your password and account access.",
      "Notify us immediately if you suspect unauthorized access to your account.",
      "BizRavana reserves the right to suspend or terminate accounts that contain false information or are used for fraudulent or unlawful activities.",
    ],
  },
  {
    title: "4. Free Trial",
    content: [
      "New users may receive a 3-day free trial with access to eligible BizRavana features.",
      "At the end of the trial period: Your account may enter Read-Only Mode until an active subscription is purchased. Existing business data will remain available according to our data retention policy.",
      "No payment is required to start the free trial.",
      "BizRavana reserves the right to modify or discontinue the free trial offer at any time.",
    ],
  },
  {
    title: "5. Subscription Plans",
    content: [
      "BizRavana offers subscription plans with different features, limits, and pricing.",
      "Your selected plan determines: Available features, Usage limits, Storage limits, User access, and Other plan-specific benefits.",
      "Plan prices may change from time to time. Existing subscribers will be notified before any pricing changes affecting future billing periods.",
    ],
  },
  {
    title: "6. Payments",
    content: [
      "Subscription payments are processed securely through trusted third-party payment providers, including PayHere.",
      "BizRavana does not store your complete debit or credit card information.",
      "You agree to pay all applicable subscription fees associated with your selected plan.",
    ],
  },
  {
    title: "7. Subscription Renewal",
    content: [
      "Where supported by the selected payment provider, subscriptions may renew automatically at the end of each billing period.",
      "If automatic renewal is not available, users must manually renew their subscription before the expiration date to continue uninterrupted access.",
      "You may cancel your subscription renewal at any time before the next billing cycle.",
    ],
  },
  {
    title: "8. Cancellation",
    content: [
      "You may cancel your subscription at any time.",
      "Cancellation prevents future subscription renewals but does not immediately terminate your access.",
      "You will continue to have access to your subscribed plan until the end of the current billing period.",
      "No partial refunds or credits will be issued for unused subscription periods except where required by applicable law or explicitly stated in our Refund & Cancellation Policy.",
    ],
  },
  {
    title: "9. Subscription Expiry",
    content: [
      "If your subscription expires:",
      "Your account may be placed into Read-Only Mode.",
      "You may continue viewing your existing data during the applicable retention period.",
      "Creating, editing, or deleting business data may be restricted until an active subscription is restored.",
    ],
  },
  {
    title: "10. Data Retention",
    content: [
      "Following subscription expiry or account closure, BizRavana may retain your business data for a limited period to allow account recovery.",
      "After the retention period ends, your data may be permanently deleted and cannot be recovered.",
      "Please ensure you export any required business data before your retention period expires.",
    ],
  },
  {
    title: "11. Acceptable Use",
    content: [
      "You agree not to:",
      "Use BizRavana for unlawful purposes.",
      "Attempt unauthorized access to any account or system.",
      "Distribute malware, spam, or harmful content.",
      "Interfere with the operation or security of the platform.",
      "Upload malicious files or software.",
      "Reverse engineer or attempt to exploit the platform.",
      "Violation of these Terms may result in immediate suspension or termination of your account.",
    ],
  },
  {
    title: "12. Third-Party Services",
    content: [
      "BizRavana may integrate with third-party services such as: Payment providers, Courier service providers, Email delivery services, Messaging services, and Other supported integrations.",
      "BizRavana is not responsible for interruptions, delays, or failures caused by third-party services beyond our reasonable control.",
    ],
  },
  {
    title: "13. Intellectual Property",
    content: [
      "All software, content, branding, trademarks, logos, graphics, text, designs, and source code relating to BizRavana remain the exclusive property of BizRavana or its licensors.",
      "You may not: Copy, Modify, Distribute, Reverse engineer, Resell, or Reproduce any part of the Services without prior written permission.",
    ],
  },
  {
    title: "14. Service Availability",
    content: [
      "While we strive to maintain continuous service availability, BizRavana does not guarantee uninterrupted operation.",
      "Scheduled maintenance, software updates, security improvements, or unexpected technical issues may temporarily affect service availability.",
    ],
  },
  {
    title: "15. Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, BizRavana shall not be liable for indirect, incidental, consequential, or special damages arising from: Use or inability to use the Services, Business interruption, Data loss caused by circumstances beyond our reasonable control, Third-party service failures, or Unauthorized access resulting from compromised user credentials.",
      "Nothing in these Terms excludes liability where such exclusion is prohibited by applicable law.",
    ],
  },
  {
    title: "16. Changes to the Service",
    content: [
      "BizRavana may: Add or remove features, Modify subscription plans, Improve or discontinue functionality, Update pricing, or Introduce new services.",
      "Reasonable notice will be provided where changes materially affect subscribers.",
    ],
  },
  {
    title: "17. Changes to These Terms",
    content: [
      "We may update these Terms from time to time.",
      "Updated versions will be published on our website together with the revised \"Last Updated\" date.",
      "Continued use of the Services after changes become effective constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "18. Governing Law",
    content: [
      "These Terms shall be governed by and interpreted in accordance with the laws of the Democratic Socialist Republic of Sri Lanka.",
      "Any disputes arising from these Terms shall be subject to the jurisdiction of the competent courts of Sri Lanka.",
    ],
  },
  {
    title: "19. Contact Us",
    content: [
      "If you have any questions regarding these Terms & Conditions, please contact us.",
      "BizRavana",
      "Address: Near the temple, Seelagama, Belihuloya",
      "Email: loojabrandings@gmail.com",
    ],
  },
];

export default function TermsPage() {
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
              <FileText className="size-3.5 text-primary" />
              <span className="font-medium">Policies</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              Terms &amp;{" "}
              <span className="text-primary">Conditions</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              These Terms &amp; Conditions govern your access to and use of the
              BizRavana platform, website, and related services. By creating an
              account, accessing, or using BizRavana, you agree to be bound by
              these Terms.
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
                If you have any questions about these Terms &amp; Conditions,
                please{" "}
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
