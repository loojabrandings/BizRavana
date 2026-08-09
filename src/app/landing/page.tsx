"use client";

import {
  CheckIcon,
  Clock,
  FileText,
  GaugeIcon,
  MoonIcon,
  MousePointerClickIcon,
  RocketIcon,
  ShoppingCart,
  SparklesIcon,
  StarIcon,
  TrendingUp,
  TruckIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { IntegrationsBeam } from "@/components/landing/velora/integrations-beam";
import { ActivityList } from "@/components/landing/velora/activity-list";
import { AvatarCircles } from "@/components/landing/velora/avatar-circles";
import { BentoCard, BentoGrid } from "@/components/landing/velora/bento-grid";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { BorderBeam } from "@/components/landing/velora/border-beam";
import { DotPattern } from "@/components/landing/velora/grid-pattern";
import { Marquee } from "@/components/landing/velora/marquee";
import { NumberTicker } from "@/components/landing/velora/number-ticker";
import { OrbitingCircles } from "@/components/landing/velora/orbiting-circles";

import { FeaturesShowcase } from "@/components/landing/velora/features-showcase";
import { RetroGrid } from "@/components/landing/velora/retro-grid";
import { ShimmerButton } from "@/components/landing/velora/shimmer-button";
import { SpotlightCard } from "@/components/landing/velora/spotlight-card";
import { TextReveal } from "@/components/landing/velora/text-reveal";
import { TiltCard } from "@/components/landing/velora/tilt-card";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { cn } from "@/lib/utils";

const logos = [
  "Art of Frames", "Cafe Vibe", "Looja Branding", "Tharu Graphicz",
];

const testimonials = [
  {
    quote: "BizRavana replaced our spreadsheets and WhatsApp chaos. Now everything runs from one place.",
    name: "Kasun Perera",
    role: "Owner, City Mart Galle",
  },
  {
    quote: "Inventory tracking alone saved us hours every week. The courier integration was a game changer.",
    name: "Priya Jayawardena",
    role: "Operations, Lanka Retail",
  },
  {
    quote: "I manage orders, expenses and reports from my phone. I can't imagine going back.",
    name: "Rohan Silva",
    role: "CEO, S&R Traders",
  },
  {
    quote: "Setup took minutes. My team was onboarded by lunch. The billing features are brilliant.",
    name: "Dilani Fernando",
    role: "Finance Lead, EcoMart",
  },
  {
    quote: "Finally — a platform built for how Sri Lankan businesses actually work.",
    name: "Saman de Silva",
    role: "Founder, Island Commerce",
  },
  {
    quote: "The customer management and quotation tools alone are worth it. Excellent product.",
    name: "Nadeeka Wickramasinghe",
    role: "Operations Manager, Blue Ocean",
  },
];

const faqs = [
  {
    q: "Is BizRavana really free?",
    a: "Every new account includes a 3-day free trial with full access to explore the platform. After the trial, simply choose the plan that best fits your business.",
  },
  {
    q: "How is BizRavana different from using Excel or notebooks?",
    a: "BizRavana brings orders, customers, inventory, expenses, quotations and reports together in one organized workspace. Everything stays connected automatically, reducing manual work and saving time.",
  },
  {
    q: "Which courier services are supported?",
    a: "BizRavana currently supports Royal Express and Koombiyo Delivery, with both manual and automated dispatch workflows. More courier integrations will be introduced in future updates.",
  },
  {
    q: "Can I manage inventory and products?",
    a: "Yes. Track stock levels, organize products, receive low-stock alerts and manage your inventory from one place.",
  },
  {
    q: "Is my business data secure?",
    a: "Yes. Every business has its own isolated workspace, ensuring your data remains private and secure.",
  },
  {
    q: "Do I need technical knowledge?",
    a: "No. BizRavana is designed to be simple and easy to use, allowing you to get started in just a few minutes.",
  },
];

const plans = [
  {
    name: "Trial",
    price: "Free",
    period: "for 3 days",
    cta: "Start Free Trial",
    href: "/register",
    popular: false,
    features: [
      "20 orders & 10 expenses limit",
      "10 products & 5 quotations",
      "5 MB file storage",
      "1 courier account",
      "Community support",
    ],
  },
  {
    name: "Basic",
    price: "Rs. 1,250",
    period: "/month",
    cta: "Choose Basic",
    href: "/register",
    popular: false,
    features: [
      "100 orders, expenses & quotations",
      "10 products & 100 inventory items",
      "Custom branding & shipping labels",
      "1 WhatsApp template & courier account",
      "Image upload & bank transfers",
    ],
  },
  {
    name: "Standard",
    price: "Rs. 2,450",
    period: "/month",
    cta: "Choose Standard",
    href: "/register",
    popular: true,
    features: [
      "200 orders, expenses & quotations",
      "50 products & 200 inventory items",
      "Bulk XLSX & CSV import",
      "3 WhatsApp templates & courier accounts",
      "250 MB file storage & image upload",
    ],
  },
  {
    name: "Premium",
    price: "Rs. 4,450",
    period: "/month",
    cta: "Choose Premium",
    href: "/register",
    popular: false,
    features: [
      "500 orders, expenses & quotations",
      "100 products & 500 inventory items",
      "Activity log & advanced analytics",
      "5 team members with custom roles",
      "Unlimited WhatsApp templates & courier accounts",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    cta: "Contact Sales",
    href: "/register",
    popular: false,
    features: [
      "Unlimited everything — no caps",
      "AI assistant & smart automation",
      "API access & custom integrations",
      "Unlimited users & dedicated environment",
      "Priority support & onboarding",
    ],
  },
];

export default function LandingPage() {
  return (
    <main className="relative">
      <ScrollProgress />
      <SiteHeader />

      {/* ═══ Hero ═══ */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-20">
        <Image
          src="/images/landing/hero-bg.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 text-left lg:px-8">
          <BlurFade delay={0} direction="down">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm backdrop-blur">
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="font-medium">
                Built for Sri Lankan Businesses &#127473;&#127472;
              </span>
            </span>
          </BlurFade>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
            <span className="block">
              <TextReveal text="Work" />
            </span>
            <span className="block text-[1.4em] sm:text-[1.75em] lg:text-[1.95em] [font-family:var(--font-mohave)]">
              <span className="shimmer-text">
                SMARTER,
              </span>
            </span>
            <span className="block">
              <TextReveal text="Grow" />
            </span>
            <span className="block text-[1.4em] sm:text-[1.75em] lg:text-[1.95em] [font-family:var(--font-mohave)]">
              <span className="shimmer-text">
                FASTER
              </span>
            </span>
          </h1>

          <BlurFade delay={0.35}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Manage orders, customers, inventory, expenses, quotations,
              deliveries and reports — all from one powerful platform built
              for Sri Lankan businesses.
            </p>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="mt-10 flex flex-wrap items-center justify-start gap-4">
              <ShimmerButton>
                <RocketIcon className="size-4" />
                Start 3-Day Free Trial
              </ShimmerButton>
              <Link
                href="/features"
                className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="relative z-10">Explore Features</span>
                <span
                  aria-hidden
                  className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </Link>
            </div>
          </BlurFade>

        </div>
      </section>

      {/* ═══ Logo marquee ═══ */}
      <section className="border-y border-border/40 py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Trusted by businesses across Sri Lanka
          </p>
          <Marquee pauseOnHover className="[--duration:30s]">
            {logos.map((logo) => (
              <span
                key={logo}
                className="mx-8 text-xl font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {logo}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ═══ Interactive features showcase ═══ */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
              Explore the platform{" "}
              <span className="text-primary">feature by feature</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Tap a module to see how it works — orders, customers, courier,
              profit, inventory and reports in one connected workspace.
            </p>
          </BlurFade>

          <BlurFade delay={0.15} className="mt-14">
            <FeaturesShowcase />
          </BlurFade>
        </div>
      </section>

      {/* ═══ Bento features ═══ */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
              Everything you need to{" "}
              <span className="text-primary">run your business</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Every feature works together — no more juggling between notebooks,
              spreadsheets and WhatsApp.
            </p>
          </BlurFade>

          <BlurFade delay={0.15}>
            <BentoGrid className="mt-16">
              <BentoCard
                name="Orders & Invoices"
                description="Create, track and manage orders from quotation to invoice—all in one seamless workflow."
                className="md:col-span-1"
                background={
                  <div className="relative flex size-full items-center justify-center pt-6">
                    <ZapIcon className="size-8 text-primary" />
                    <OrbitingCircles radius={90} iconSize={28} duration={24}>
                      <ShoppingCart className="size-5 text-muted-foreground" />
                      <FileText className="size-5 text-muted-foreground" />
                      <Clock className="size-5 text-muted-foreground" />
                    </OrbitingCircles>
                  </div>
                }
              />
              <BentoCard
                name="Courier Integration That Actually Saves Time"
                description="Connect your preferred courier service, generate waybills instantly, and manage every shipment without leaving BizRavana."
                className="md:col-span-2"
                background={
                  <div className="absolute inset-6 flex items-start justify-between pt-8 sm:pt-12">
                    <ul className="space-y-3">
                      {[
                        "Instant Waybill Generation",
                        "Multiple Courier Support",
                        "Bulk Order Creation",
                        "One-Click Dispatch",
                        "Shipment Tracking",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                            <CheckIcon className="size-3" />
                          </span>
                          <span className="text-card-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="hidden sm:flex items-center justify-center size-20 shrink-0 mt-4">
                      <motion.div
                        aria-hidden
                        className="text-primary/30"
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <TruckIcon className="size-14" />
                      </motion.div>
                    </div>
                  </div>
                }
              />
              <BentoCard
                name="Your Business at a Glance"
                description="See the numbers that matter most—orders, revenue, profit, payments and deliveries—all in one live dashboard."
                className="md:col-span-2"
                background={
                  <div className="absolute inset-x-10 top-4 bottom-24">
                    <Marquee
                      vertical
                      pauseOnHover
                      className="h-full [--duration:30s]"
                    >
                      {[
                        { label: "Total Orders", value: "1,284" },
                        { label: "New Order", value: "18" },
                        { label: "Net Profit", value: "LKR 285,400" },
                        { label: "Pending Payments", value: "LKR 42,500" },
                        { label: "Scheduled Deliveries", value: "23" },
                        { label: "Low Stock Alerts", value: "7" },
                        { label: "Business Insights", value: "Live" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-xl border bg-card/80 p-4 text-sm backdrop-blur"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-card-foreground">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </Marquee>
                  </div>
                }
              />
              <BentoCard
                name="Expenses & Reports"
                description="Track every rupee. Profit & loss reports generated automatically."
                className="md:col-span-1"
                background={
                  <div className="absolute inset-x-6 top-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-emerald-500" />
                      <span className="text-xs font-medium text-card-foreground/60 uppercase tracking-wider">
                        Profit & Loss Summary
                      </span>
                    </div>

                    {/* Animated rows */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex items-center justify-between rounded-lg border bg-card/80 px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold text-card-foreground">
                        LKR <NumberTicker value={500000} />
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center justify-between rounded-lg border bg-card/80 px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">Expenses</span>
                      <span className="font-semibold text-card-foreground">
                        LKR <NumberTicker value={350000} />
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Net Profit
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        LKR <NumberTicker value={150000} />
                      </span>
                    </motion.div>
                  </div>
                }
              />
            </BentoGrid>

            <BlurFade delay={0.3}>
              <div className="mt-12 text-center">
                <Link
                  href="/features"
                  className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span className="relative z-10">Explore All Features</span>
                  <span
                    aria-hidden
                    className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </Link>
              </div>
            </BlurFade>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Integrations beam ═══ */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <BlurFade direction="right">
            <div>
              <span className="text-sm font-medium text-primary">
                All connected
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                Your whole business{" "}
                <span className="text-primary">in one place</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Orders connect to inventory. Expenses flow into reports.
                Deliveries link to customer records. No more manual syncing
                between different tools.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Orders auto-update inventory levels",
                  "Expenses categorized and report-ready",
                  "Courier integration with live tracking",
                  "Customer history across every touchpoint",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <CheckIcon className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
          <BlurFade direction="left" delay={0.15}>
            <IntegrationsBeam />
          </BlurFade>
        </div>
      </section>

      {/* ═══ Live activity ═══ */}
      <section className="relative overflow-hidden py-24 lg:py-32 hidden">
        <RetroGrid />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <BlurFade direction="right" className="order-2 lg:order-1">
            <ActivityList />
          </BlurFade>
          <BlurFade direction="left" delay={0.15} className="order-1 lg:order-2">
            <div>
              <span className="text-sm font-medium text-primary">
                Live activity
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                See your business{" "}
                <span className="text-primary">come alive</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                New orders, customer signups, inventory updates — watch your
                business activity stream in real time. Every notification tells
                a story.
              </p>
              <p className="mt-4 text-muted-foreground">
                Behind it: the retro grid backdrop, scrolling forever toward the
                horizon.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Spotlight cards ═══ */}
      <section className="relative py-24 lg:py-32 hidden">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <GaugeIcon className="size-6" />,
                title: "Performance first",
                body: "CSS-driven animations wherever possible, Motion only where it earns its bytes. No layout shift, ever.",
              },
              {
                icon: <MousePointerClickIcon className="size-6" />,
                title: "Accessible by default",
                body: "Every component respects prefers-reduced-motion, keeps keyboard focus visible and ships semantic markup.",
              },
              {
                icon: <MoonIcon className="size-6" />,
                title: "Dark mode native",
                body: "Designed dark-first with oklch color tokens. Flip one class and every gradient adapts.",
              },
            ].map((card, i) => (
              <BlurFade key={card.title} delay={i * 0.12}>
                <SpotlightCard className="h-full p-8">
                  <div className="mb-4 w-fit rounded-xl bg-primary/10 p-3 text-primary">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {card.body}
                  </p>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
              Business owners{" "}
              <span className="text-primary">love BizRavana</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Hover the cards — they tilt in 3D. Real feedback from real Sri
              Lankan business owners.
            </p>
          </BlurFade>

          <BlurFade delay={0.15}>
            <div className="mt-16">
              <Marquee pauseOnHover className="[--duration:40s]">
                {testimonials.map((t) => (
                  <div key={t.name} className="mx-3 w-[340px] shrink-0">
                    <TiltCard>
                      <figure className="rounded-2xl border bg-card p-6">
                        <span className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <StarIcon
                              key={s}
                              className="size-3.5 fill-current"
                            />
                          ))}
                        </span>
                        <blockquote className="mt-4 text-sm text-card-foreground">
                          \u201C{t.quote}\u201D
                        </blockquote>
                        <figcaption className="mt-4 flex items-center gap-3">
                          <AvatarCircles
                            people={[t.name]}
                            className="[&>span]:size-8 [&>span]:text-[10px]"
                          />
                          <div>
                            <p className="text-sm font-medium">{t.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.role}
                            </p>
                          </div>
                        </figcaption>
                      </figure>
                    </TiltCard>
                  </div>
                ))}
              </Marquee>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
              Plans for{" "}
              <span className="text-primary">every stage</span> of growth
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Start free, upgrade when you need more. All plans include core business features.
            </p>
          </BlurFade>

          <div className="mt-16 space-y-8">
            {/* ── Trial Row ── */}
            <BlurFade delay={0.05}>
              <div className="w-full">
                {(() => {
                  const p = plans[0];
                  return (
                    <div className="rounded-2xl border bg-card p-6 md:p-8">
                      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
                        {/* Left: name + price + CTA */}
                        <div className="flex flex-col">
                          <h3 className="text-xl font-semibold">{p.name}</h3>
                          <p className="mt-6">
                            <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                            <span className="ml-2 text-base font-normal text-muted-foreground">{p.period}</span>
                          </p>
                          <div className="mt-auto pt-6">
                            <a
                              href={p.href}
                              className="group relative inline-flex h-10 w-full max-w-[220px] items-center justify-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <span className="relative z-10">{p.cta}</span>
                              <span
                                aria-hidden
                                className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              />
                            </a>
                          </div>
                        </div>

                        {/* Right: features */}
                        <div className="mt-6 md:mt-0">
                          <ul className="space-y-3 text-sm">
                            {p.features.map((f) => (
                              <li key={f} className="flex items-center gap-3">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                  <CheckIcon className="size-3" />
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </BlurFade>

            {/* ── Middle Row: Basic | Standard | Premium ── */}
            <div className="grid gap-6 md:grid-cols-3">
              {plans.slice(1, 4).map((p, i) => (
                <BlurFade key={p.name} delay={0.1 + i * 0.08}>
                  <div
                    className={cn(
                      "flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-200",
                      p.popular && "shadow-lg shadow-primary/10 scale-[1.02] md:scale-105 relative overflow-hidden",
                    )}
                  >
                    {p.popular && <BorderBeam size={80} duration={8} />}

                    {/* Gradient header */}
                    {p.popular && (
                      <div className="absolute inset-x-0 top-0 h-28 rounded-t-2xl bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
                    )}

                    {/* Title row with badge */}
                    <div className="relative z-10 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      {p.popular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
                          <SparklesIcon className="size-3" />
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-6">
                      <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                      <span className="ml-1 text-base font-normal text-muted-foreground">{p.period}</span>
                    </p>

                    <ul className="mt-8 flex-1 space-y-3 text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <CheckIcon className="size-3" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      {p.popular ? (
                        <ShimmerButton className="h-10 w-full rounded-lg px-5 text-sm font-medium">{p.cta}</ShimmerButton>
                      ) : (
                        <a
                          href={p.href}
                          className="group relative inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <span className="relative z-10">{p.cta}</span>
                          <span
                            aria-hidden
                            className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>

            {/* ── Enterprise Row ── */}
            <BlurFade delay={0.35}>
              <div className="w-full">
                {(() => {
                  const p = plans[4];
                  return (
                    <div className="rounded-2xl border bg-card p-6 md:p-8">
                      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
                        {/* Left: name + price + CTA */}
                        <div className="flex flex-col">
                          <h3 className="text-xl font-semibold">{p.name}</h3>
                          <p className="mt-6">
                            <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                            <span className="ml-2 text-base font-normal text-muted-foreground">{p.period}</span>
                          </p>
                          <div className="mt-auto pt-6">
                            <a
                              href={p.href}
                              className="group relative inline-flex h-10 w-full max-w-[220px] items-center justify-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <span className="relative z-10">{p.cta}</span>
                              <span
                                aria-hidden
                                className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              />
                            </a>
                          </div>
                        </div>

                        {/* Right: features */}
                        <div className="mt-6 md:mt-0">
                          <ul className="space-y-3 text-sm">
                            {p.features.map((f) => (
                              <li key={f} className="flex items-center gap-3">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                  <CheckIcon className="size-3" />
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="text-center text-3xl font-semibold tracking-tight lg:text-4xl">
              Frequently asked questions
            </h2>
          </BlurFade>
          <BlurFade delay={0.15}>
            <Accordion type="single" collapsible className="mt-12">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </BlurFade>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_60%)]" />
        <DotPattern className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] stroke-border/20 fill-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <BlurFade>
            <h2 className="text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
              Stop juggling{" "}
              <span className="text-primary">five different tools.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              BizRavana gives you everything you need — orders, inventory,
              expenses, deliveries and reports — in one organized workspace.
              Free to start.
            </p>
            <div className="mt-10">
              <ShimmerButton className="h-14 px-10 text-base">
                <RocketIcon className="size-5" />
                Start 3-Day Free Trial
              </ShimmerButton>
            </div>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div className="mt-16">
              <p className="text-xs text-muted-foreground">
                No credit card required &bull; Setup in minutes
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
