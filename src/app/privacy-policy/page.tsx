"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { DotPattern } from "@/components/landing/velora/grid-pattern";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We collect information necessary to provide and improve our Services.",
      "A. Account Information — When you create an account, we may collect: Full Name, Email Address, Phone Number, Business Name, Business Type, Business Address, District, and Account credentials (encrypted password).",
      "B. Business Information — As you use BizRavana, you may create and store: Customer information, Product information, Inventory records, Orders, Quotations, Invoices, Expenses, Courier details, Reports, Business settings, and Uploaded files and documents. This information belongs to you and remains under your control.",
      "C. Payment Information — Subscription payments are securely processed by trusted third-party payment providers, including PayHere. BizRavana does not store your complete debit or credit card numbers, CVV codes, or other sensitive payment credentials. We may receive limited payment information such as Transaction ID, Payment status, Payment amount, Payment date, and Selected payment method. This information is used solely for subscription management and payment verification.",
      "D. Technical Information — We may automatically collect: IP Address, Browser type, Device information, Operating system, Login history, Activity logs, Error logs, and Cookies and similar technologies. This helps us improve platform performance, reliability, and security.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "We use your information to: Create and manage your account, Provide BizRavana services, Process subscription payments, Activate and manage subscriptions, Deliver customer support, Respond to inquiries, Improve platform performance, Secure user accounts, Detect fraud and unauthorized activity, Maintain audit logs, Send important service-related notifications, and Comply with legal obligations.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "3. Business Data Ownership",
    content: [
      "All business data you create within BizRavana remains your property.",
      "This includes: Customers, Products, Orders, Inventory, Expenses, Reports, Quotations, and Invoices.",
      "BizRavana accesses this data only as necessary to operate, maintain, secure, or support the Services.",
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      "We do not sell or rent your information.",
      "We may share information only when necessary with trusted service providers, including: Payment providers (such as PayHere), Courier service providers connected through BizRavana, Cloud hosting providers, Email service providers, and Security and infrastructure providers.",
      "These providers receive only the information necessary to perform their services and are expected to protect it appropriately.",
      "We may also disclose information where required by applicable law, court order, or lawful government request.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "Protecting your information is important to us.",
      "BizRavana implements reasonable administrative, technical, and organizational measures designed to protect your information from unauthorized access, alteration, disclosure, or destruction.",
      "These measures include: Encrypted passwords, Secure HTTPS connections, Access controls, Tenant-level workspace isolation, Database security policies, and Authentication and authorization controls.",
      "Although we take reasonable precautions, no internet transmission or electronic storage system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "6. Workspace Isolation",
    content: [
      "Each business operates within its own isolated workspace.",
      "BizRavana uses access controls designed to help prevent one business from accessing another business's information.",
    ],
  },
  {
    title: "7. Cookies",
    content: [
      "BizRavana uses cookies and similar technologies to: Keep you signed in, Remember preferences, Improve website functionality, Analyze usage, and Enhance security.",
      "You may disable cookies through your browser settings; however, some features of the platform may not function correctly.",
    ],
  },
  {
    title: "8. Data Retention",
    content: [
      "We retain information only for as long as necessary to provide our Services and comply with legal obligations.",
      "If your subscription expires or your account is closed: Your account may enter Read-Only Mode. Your business data may be retained for a limited period to allow account recovery. After the applicable retention period, your data may be permanently deleted and cannot be recovered.",
    ],
  },
  {
    title: "9. Your Rights",
    content: [
      "Subject to applicable law, you may request to: Access your personal information, Update inaccurate information, Correct account details, Delete your account, and Export your business data where supported.",
      "Some information may be retained where required by law or for legitimate business purposes.",
    ],
  },
  {
    title: "10. Third-Party Services",
    content: [
      "BizRavana may integrate with third-party services such as: PayHere, Courier providers, Email services, and Messaging services.",
      "These services have their own privacy policies. BizRavana is not responsible for the privacy practices of third-party websites or services.",
    ],
  },
  {
    title: "11. Children's Privacy",
    content: [
      "BizRavana is intended for business users and is not directed toward individuals under 18 years of age.",
      "We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "12. Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time.",
      "Updated versions will be published on this page together with the revised \"Last Updated\" date.",
      "Your continued use of BizRavana after changes become effective constitutes acceptance of the revised Privacy Policy.",
    ],
  },
  {
    title: "13. Contact Us",
    content: [
      "If you have any questions about this Privacy Policy or your personal information, please contact us.",
      "BizRavana",
      "Address: Near the temple, Seelagama, Belihuloya",
      "Email: loojabrandings@gmail.com",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="size-3.5 text-primary" />
              <span className="font-medium">Your privacy matters</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              <span className="text-primary">Privacy</span> Policy
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              At BizRavana, we are committed to protecting the privacy and
              security of your personal and business information. This policy
              explains how we collect, use, store, share, and protect your
              information when you use our website and business management
              platform.
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
                Your privacy matters to us. We are committed to protecting your
                personal and business information while providing a secure
                platform for managing your business.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="mt-6 rounded-xl border bg-card/50 p-6 text-center sm:p-8">
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy or your
                personal information, please{" "}
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
