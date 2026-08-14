import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Reveal from "@/components/reveal";
import PricingPlans from "@/components/pricing-plans";
import PlanComparison from "@/components/plan-comparison";

export const metadata: Metadata = {
  title: "Pricing — BizRavana",
  description:
    "Simple, transparent pricing for Sri Lankan businesses. Start with a free 3-day trial and upgrade when you're ready — from Basic to Enterprise.",
};

/** Hero copy — one centered statement, matching the Features/Contact rhythm. */
const HERO = {
  eyebrow: "Pricing",
  title: "Plans that grow with your business",
  desc: "Start free and upgrade when you're ready. Every plan includes the core BizRavana workspace — no hidden fees, cancel anytime.",
};

/** Enterprise — priced on request, shown as its own full-width band. */
const ENTERPRISE = {
  name: "Enterprise",
  price: "Custom pricing",
  billing: "tailored to your business",
  features: [
    "Unlimited everything — no caps",
    "AI assistant & smart automation",
    "API access & custom integrations",
    "Unlimited users & dedicated environment",
    "Priority support & onboarding",
  ],
  cta: { label: "Contact Us", href: "/contact", variant: "primary" as const },
};

/** Footnote under the grid. */
const FINEPRINT = "Every plan starts with a free 3-day trial. No credit card required.";

/**
 * Pricing page — a centered statement over the ambient blob backdrop, then
 * the plan cards. Shares the Features/Contact structure (hero + one section),
 * the About page's split/wide measures and the Card/Reveal/Button system.
 * The plan grid is interactive (Monthly/Yearly toggle) and lives in the
 * PricingPlans client component; this page keeps the hero, the enterprise
 * band and the footnote.
 */
export default function PricingPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          Features and Contact pages, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="pricing-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="pricing-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Plans — the billing toggle + the four standard plans as a card
          grid (interactive), then the enterprise band, then the footnote. */}
      <section className="about-section pricing-section" aria-label="Plans and pricing">
        <div className="about-section__inner about-section__inner--wide">
          <PricingPlans />

          <Reveal delay={120}>
            <div className="pricing-enterprise">
              <div className="pricing-enterprise__copy">
                <h3 className="pricing-enterprise__name">{ENTERPRISE.name}</h3>
                <p className="pricing-enterprise__price">
                  {ENTERPRISE.price}
                  {ENTERPRISE.billing ? ` — ${ENTERPRISE.billing}` : ""}
                </p>
              </div>
              <ul className="pricing-enterprise__features">
                {ENTERPRISE.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="pricing-enterprise__cta">
                <Button
                  {...(ENTERPRISE.cta.href ? { href: ENTERPRISE.cta.href } : {})}
                  variant={ENTERPRISE.cta.variant}
                >
                  {ENTERPRISE.cta.label}
                </Button>
              </div>
            </div>
          </Reveal>

          <p className="pricing-fineprint">{FINEPRINT}</p>
        </div>
      </section>

      {/* 3. Comparison — the two tables (limits + features) putting all four
          plans side by side. */}
      <PlanComparison />

      <Footer />
    </main>
  );
}
