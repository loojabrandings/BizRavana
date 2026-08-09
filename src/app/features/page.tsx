import {
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  Package,
  Settings,
  ShoppingCart,
  SparklesIcon,
  Users,
  Truck,
  MessageCircle,
  Image,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { ShimmerButton } from "@/components/landing/velora/shimmer-button";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { DotPattern } from "@/components/landing/velora/grid-pattern";

const featureGroups = [
  {
    title: "Core Business Operations",
    description: "Everything you need to manage day-to-day operations from one place.",
    features: [
      {
        icon: LayoutDashboard,
        name: "Dashboard",
        description:
          "Get a real-time overview of your entire business. Track orders, revenue, profit, pending payments, deliveries and low stock alerts — all in one live dashboard.",
        highlights: [
          "Revenue & profit tracking",
          "Order & delivery summaries",
          "Low stock alerts",
          "Pending payment indicators",
        ],
      },
      {
        icon: ShoppingCart,
        name: "Orders & Invoices",
        description:
          "Create, track and manage orders from quotation to invoice. Support for COD, credit, bank transfer and partial payments — built for Sri Lankan retail and wholesale.",
        highlights: [
          "Order creation with auto-numbering",
          "Invoice generation",
          "Multiple payment methods",
          "Order status tracking",
        ],
      },
      {
        icon: FileText,
        name: "Quotations",
        description:
          "Create professional quotations, convert them to orders instantly, and track their status from draft to accepted or converted.",
        highlights: [
          "Quotation templates",
          "One-click order conversion",
          "Status tracking",
          "Customer history linked",
        ],
      },
      {
        icon: Users,
        name: "Customers",
        description:
          "Maintain a complete customer database with order history, lifetime spend, pending balances and contact information — all in one place.",
        highlights: [
          "Customer profiles with history",
          "Lifetime spend tracking",
          "Pending balance management",
          "Contact & address management",
        ],
      },
    ],
  },
  {
    title: "Inventory & Products",
    description: "Keep full control over your stock and product catalog.",
    features: [
      {
        icon: Package,
        name: "Products",
        description:
          "Manage your product catalog with categories, size variants, pricing, cost tracking and profit margin calculations.",
        highlights: [
          "Product catalog with categories",
          "Size variant support",
          "Cost & profit tracking",
          "Bulk import via XLSX & CSV",
        ],
      },
      {
        icon: Boxes,
        name: "Inventory",
        description:
          "Track stock levels in real time, receive low-stock alerts, manage suppliers and automate stock-in/out transactions.",
        highlights: [
          "Real-time stock tracking",
          "Low stock alerts",
          "Supplier management",
          "Stock transaction history",
        ],
      },
      {
        icon: Image,
        name: "Image Upload",
        description:
          "Upload product and order images to keep visual records. Supported on the Standard plan and above with dedicated storage.",
        highlights: [
          "Product image uploads",
          "Order image attachments",
          "5 MB – 1 GB storage options",
        ],
      },
    ],
  },
  {
    title: "Financial Management",
    description: "Track every rupee and make data-driven decisions.",
    features: [
      {
        icon: Package,
        name: "Expenses",
        description:
          "Record and categorize business expenses, track payments and get a clear picture of your costs with automated categorization.",
        highlights: [
          "Expense recording & categorization",
          "Payment status tracking",
          "Inventory-linked expenses",
          "Expense reports",
        ],
      },
      {
        icon: BarChart3,
        name: "Reports & Analytics",
        description:
          "Generate profit & loss reports, view order analytics, expense summaries and business insights — all automatically calculated.",
        highlights: [
          "Profit & loss reports",
          "Order analytics",
          "Expense summaries",
          "Business insights dashboard",
        ],
      },
      {
        icon: CreditCard,
        name: "Subscription & Billing",
        description:
          "Manage your plan, view usage limits, upload payment proofs via bank transfer and track your billing history.",
        highlights: [
          "Plan management",
          "Usage limit tracking",
          "Payment proof upload",
          "Billing history",
        ],
      },
    ],
  },
  {
    title: "Integrations & Collaboration",
    description: "Connect your business tools and work together as a team.",
    features: [
      {
        icon: Truck,
        name: "Courier & Deliveries",
        description:
          "Connect with Royal Express and Koombiyo Delivery for instant waybill generation, bulk dispatch and live tracking — all from within BizRavana.",
        highlights: [
          "Royal Express & Koombiyo support",
          "Instant waybill generation",
          "Bulk dispatch",
          "Shipment tracking",
        ],
      },
      {
        icon: MessageCircle,
        name: "WhatsApp Integration",
        description:
          "Send order confirmations, quotations and invoice messages directly via WhatsApp using customizable templates.",
        highlights: [
          "WhatsApp template messaging",
          "Order & quotation notifications",
          "Customizable message templates",
        ],
      },
      {
        icon: Users,
        name: "Team Collaboration",
        description:
          "Invite team members with role-based access. Assign tasks, track activity and work together seamlessly.",
        highlights: [
          "Multi-user support",
          "Role-based access (Owner, Business Manager, Member)",
          "Activity log",
          "Task assignment",
        ],
      },
      {
        icon: Settings,
        name: "Settings & Customization",
        description:
          "Customize your business profile, branding, theme preferences and configure courier accounts, WhatsApp templates and more.",
        highlights: [
          "Business profile & branding",
          "Theme customization",
          "Courier account setup",
          "WhatsApp template configuration",
        ],
      },
    ],
  },
];

export default function FeaturesPage() {
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
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="font-medium">Everything you need</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              Powerful features for{" "}
              <span className="text-primary">your business</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              From orders to inventory, expenses to deliveries — BizRavana brings
              everything together in one organized workspace. No more juggling
              between notebooks, spreadsheets and WhatsApp.
            </p>
          </BlurFade>
          <BlurFade delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <ShimmerButton>
                  <SparklesIcon className="size-4" />
                  Start 3-Day Free Trial
                </ShimmerButton>
              </Link>
              <a
                href="#features"
                className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span className="relative z-10">Explore features</span>
                <span
                  aria-hidden
                  className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </a>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Feature Groups ═══ */}
      <section id="features" className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          {featureGroups.map((group, gIdx) => (
            <div key={group.title} className={gIdx > 0 ? "mt-24 lg:mt-32" : ""}>
              <BlurFade>
                <div className="text-center">
                  <h2 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                    {group.title}
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </BlurFade>

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {group.features.map((feature, fIdx) => {
                  const Icon = feature.icon;
                  return (
                    <BlurFade key={feature.name} delay={fIdx * 0.08}>
                      <div className="group relative h-full rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 sm:p-8">
                        {/* Icon */}
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-6" />
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                          {feature.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Highlights */}
                        <ul className="mt-5 space-y-2">
                          {feature.highlights.map((h) => (
                            <li
                              key={h}
                              className="flex items-center gap-2.5 text-sm"
                            >
                              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <ArrowRight className="size-2.5" />
                              </span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </BlurFade>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden border-t border-border/40 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <BlurFade>
            <h2 className="text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
              Ready to{" "}
              <span className="text-primary">transform your business?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Start your 3-day free trial today. No credit card required.
              Setup takes just minutes.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <ShimmerButton className="h-14 px-10 text-base">
                  <SparklesIcon className="size-5" />
                  Start 3-Day Free Trial
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
