"use client";

import {
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  SparklesIcon,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ShimmerButton } from "@/components/landing/velora/shimmer-button";
import { DotPattern } from "@/components/landing/velora/grid-pattern";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";

const values = [
  {
    icon: Target,
    title: "Built for Sri Lanka",
    description:
      "Every feature is designed for how local businesses actually operate — from COD and bank transfer payments to courier integrations with Royal Express and Koombiyo.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity First",
    description:
      "We believe powerful software shouldn't be complicated. BizRavana is intuitive enough for anyone to start using in minutes, with no training required.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Security",
    description:
      "Every business gets its own isolated workspace. Your data stays private and secure — we never share or sell customer information.",
  },
  {
    icon: HeartHandshake,
    title: "Community Driven",
    description:
      "We listen to our users. Features like WhatsApp integration, courier dispatch, and bulk import were built because Sri Lankan business owners asked for them.",
  },
  {
    icon: Users,
    title: "Made for Teams",
    description:
      "Whether you run a small shop or a growing enterprise, BizRavana scales with you. Add team members, assign roles, and work together seamlessly.",
  },
];

const milestones = [
  { year: "2024", event: "BizRavana was born — built to solve real problems faced by Sri Lankan small businesses." },
  { year: "Early 2025", event: "Launched core features: orders, customers, inventory, expenses and quotations." },
  { year: "Mid 2025", event: "Added courier integration with Royal Express and Koombiyo, WhatsApp templates, and multi-user support." },
  { year: "Today", event: "Serving businesses across Sri Lanka with a complete platform for orders, deliveries, inventory, reports and team collaboration." },
];

export default function AboutPage() {
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
              <span className="font-medium">Our story</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              Simplifying business management for{" "}
              <span className="text-primary">Sri Lankan entrepreneurs</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              BizRavana was built because we saw small business owners juggling
              notebooks, spreadsheets and WhatsApp — and we knew there had to be
              a better way.
            </p>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Mission ═══ */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <div className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12 lg:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_60%)]" />
              <div className="relative">
                <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                  Our Mission
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                  We believe every business deserves simple, powerful tools —
                  without enterprise complexity or enterprise pricing. BizRavana
                  brings orders, customers, inventory, expenses, quotations,
                  deliveries and reports together in one organized workspace, so
                  Sri Lankan business owners can spend less time on paperwork and
                  more time growing their business.
                </p>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Values ═══ */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="text-center text-3xl font-semibold tracking-tight lg:text-4xl">
              What we stand for
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              These values guide every decision we make at BizRavana.
            </p>
          </BlurFade>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <BlurFade key={value.title} delay={i * 0.08}>
                  <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 sm:p-8">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Timeline ═══ */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <BlurFade>
            <h2 className="text-center text-3xl font-semibold tracking-tight lg:text-4xl">
              Our journey
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              From an idea to a platform serving businesses across Sri Lanka.
            </p>
          </BlurFade>

          <div className="relative mx-auto mt-12 max-w-3xl">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <BlurFade key={m.year} delay={i * 0.1}>
                  <div className="relative flex items-start gap-6">
                    {/* Dot */}
                    <div className="relative z-10 mt-1 flex size-[38px] shrink-0 items-center justify-center rounded-full border bg-card">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5">
                      <span className="inline-flex items-center rounded-full border bg-card/80 px-3 py-0.5 text-sm font-semibold text-primary">
                        {m.year}
                      </span>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {m.event}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden border-t border-border/40 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <BlurFade>
            <h2 className="text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
              Ready to take your business{" "}
              <span className="text-primary">to the next level?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Join hundreds of Sri Lankan businesses already using BizRavana.
              Start your 3-day free trial today.
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
