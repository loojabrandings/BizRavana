"use client";

import { useState } from "react";
import Button from "@/components/button";
import Card from "@/components/card";
import Reveal from "@/components/reveal";

type Billing = "monthly" | "yearly";

/** One standard plan — monthly and yearly pricing, rendered as a card. */
type Plan = {
  name: string;
  /** Accent pill shown above the name (e.g. "Most Popular"). */
  badge?: string;
  /** Monthly headline price + billing suffix, e.g. "Rs. 1,250" + "/month". */
  monthly: { price: string; billing: string };
  /** Yearly headline price + billing suffix, plus the saving + monthly
      equivalent lines shown under the price in yearly mode. */
  yearly: { price: string; billing: string; save?: string; equiv?: string };
  features: string[];
  /** Small line rendered just above the CTA button (e.g. "No credit card required"). */
  note?: string;
  cta: { label: string; href?: string; variant?: "primary" | "secondary" };
};

/** The four standard plans — a 2×2 card grid. */
const PLANS: Plan[] = [
  {
    name: "Trial",
    monthly: { price: "Free", billing: "for 3 days" },
    yearly: { price: "Free", billing: "for 3 days" },
    features: [
      "20 orders & 10 expenses limit",
      "10 products & 5 quotations",
      "5 MB file storage",
      "1 courier account",
      "Community support",
    ],
    note: "No credit card required",
    cta: { label: "Start Free Trial", variant: "primary" },
  },
  {
    name: "Basic",
    monthly: { price: "Rs. 1,250", billing: "/month" },
    yearly: {
      price: "Rs. 12,000",
      billing: "/year",
      save: "Rs. 3,000",
      equiv: "Rs. 1,000/month",
    },
    features: [
      "100 orders, expenses & quotations",
      "10 products & 100 inventory items",
      "Custom branding & shipping labels",
      "1 WhatsApp template & courier account",
      "Image upload & bank transfers",
    ],
    cta: { label: "Choose Plan", variant: "secondary" },
  },
  {
    name: "Standard",
    badge: "Most Popular",
    monthly: { price: "Rs. 2,450", billing: "/month" },
    yearly: {
      price: "Rs. 23,400",
      billing: "/year",
      save: "Rs. 6,000",
      equiv: "Rs. 1,950/month",
    },
    features: [
      "200 orders, expenses & quotations",
      "50 products & 200 inventory items",
      "Bulk XLSX & CSV import",
      "3 WhatsApp templates & courier accounts",
      "250 MB file storage & image upload",
    ],
    cta: { label: "Choose Plan", variant: "primary" },
  },
  {
    name: "Premium",
    monthly: { price: "Rs. 4,450", billing: "/month" },
    yearly: {
      price: "Rs. 42,000",
      billing: "/year",
      save: "Rs. 11,400",
      equiv: "Rs. 3,500/month",
    },
    features: [
      "500 orders, expenses & quotations",
      "100 products & 500 inventory items",
      "Activity log & advanced analytics",
      "5 team members with custom roles",
      "Unlimited WhatsApp templates & courier accounts",
    ],
    cta: { label: "Choose Plan", variant: "secondary" },
  },
];

/**
 * The interactive pricing section: a Monthly/Yearly toggle with a sliding
 * active indicator, the annual commitment banner (yearly mode only) and the
 * four plan cards. Prices swap with the toggle — monthly shows the plain
 * per-month rate, yearly shows the annual total, the amount saved, and the
 * monthly equivalent. Client component so the toggle can re-render the grid
 * without a page reload. Defaults to monthly; the "Save 20%" pill lives in
 * the Yearly tab itself.
 *
 * The thumb is pure CSS: the toggle is an equal-width two-column grid and the
 * indicator just toggles a `translateX` transform, so the slide is
 * compositor-driven and starts the same frame as the click (no measurement,
 * no extra render).
 */
export default function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <>
      {/* 1. Billing toggle — Monthly | Yearly with the "Save 20%" pill on the
          Yearly tab. The active fill is a thumb that glides between tabs. */}
      <div className="pricing-billing">
        <div
          className="pricing-billing__toggle"
          role="group"
          aria-label="Billing period"
        >
          <span
            className={`pricing-billing__thumb${
              billing === "yearly" ? " pricing-billing__thumb--yearly" : ""
            }`}
            aria-hidden="true"
          />
          <button
            type="button"
            className={`pricing-billing__option${
              billing === "monthly" ? " is-active" : ""
            }`}
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`pricing-billing__option${
              billing === "yearly" ? " is-active" : ""
            }`}
            aria-pressed={billing === "yearly"}
            onClick={() => setBilling("yearly")}
          >
            Yearly
            <span
              className={`pricing-billing__save${
                billing === "yearly" ? " is-active" : ""
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 2. Annual commitment banner — yearly mode only. Sells the habit, not
          just the discount: pay once, stay focused, no reminders. */}
      {billing === "yearly" ? (
        <div className="pricing-annual">
          <div className="pricing-annual__copy">
            <div className="pricing-annual__head">
              <span className="pricing-annual__badge">Best value</span>
              <h3 className="pricing-annual__title">Annual</h3>
            </div>
            <p className="pricing-annual__lead">
              Pay once and stay focused on your business for the entire year.
            </p>
          </div>
          <ul className="pricing-annual__points">
            <li>Save up to Rs. 11,400/year</li>
            <li>No monthly payment reminders</li>
            <li>Full access for 12 months</li>
          </ul>
        </div>
      ) : null}

      {/* 3. The four standard plans — same 2×2 grid as before; the price block
          swaps with the billing mode. */}
      <ul className="pricing-grid">
        {PLANS.map((plan, i) => {
          const price = billing === "yearly" ? plan.yearly : plan.monthly;
          const showAnnualLines = billing === "yearly" && !!plan.yearly.save;
          return (
            <li key={plan.name}>
              <Reveal className="pricing-grid__cell" delay={i * 90}>
                <Card
                  className={`pricing-card${plan.badge ? " pricing-card--featured" : ""}`}
                >
                  {plan.badge ? (
                    <span className="pricing-card__badge">{plan.badge}</span>
                  ) : null}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  {/* key={billing} remounts the block on toggle so the price
                      swap re-runs its fade-in. */}
                  <div key={billing} className="pricing-card__price-block">
                    <p className="pricing-card__price">
                      {price.price}
                      {price.billing ? (
                        <span className="pricing-card__billing">
                          {" "}
                          {price.billing}
                        </span>
                      ) : null}
                    </p>
                    {showAnnualLines ? (
                      <>
                        <p className="pricing-card__equiv">
                          {plan.yearly.equiv} equivalent
                        </p>
                        <p className="pricing-card__save">
                          Save {plan.yearly.save}
                        </p>
                      </>
                    ) : null}
                  </div>
                  <ul className="pricing-card__features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <div className="pricing-card__cta">
                    {plan.note ? (
                      <p className="pricing-card__note">{plan.note}</p>
                    ) : null}
                    {/* Spread href only when present: without it Button
                        renders a plain <button> (no dead anchor). */}
                    <Button
                      {...(plan.cta.href ? { href: plan.cta.href } : {})}
                      variant={plan.cta.variant}
                    >
                      {plan.cta.label}
                    </Button>
                  </div>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </>
  );
}
