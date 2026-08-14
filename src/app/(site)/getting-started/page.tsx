import type { Metadata } from "next";
import { Sparkles, BadgeDollarSign, Headset, type LucideIcon } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Card from "@/components/card";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Getting Started — BizRavana",
  description:
    "Get set up in minutes — create your account, set up your business, add products, make your first sale, and connect couriers, WhatsApp and your team.",
};

/** Hero copy — one centered statement, matching the Features/Contact rhythm. */
const HERO = {
  eyebrow: "Getting Started",
  title: "Up and running in minutes",
  desc: "A simple path from signup to your first order — no manual required. Follow the steps below and you'll be set up before your next customer walks in.",
};

/** One setup step — a numbered card in the journey. */
type SetupStep = {
  /** Short step name (rendered as the card title). */
  title: string;
  desc: string;
  checklist: string[];
  /** Optional accent-tinted tip under the checklist. */
  tip?: string;
};

/** The setup journey — each step a card on a numbered rail. */
const STEPS: SetupStep[] = [
  {
    title: "Create your account",
    desc: "Sign up in under a minute and start your 3-day free trial — no credit card required.",
    checklist: [
      "Sign up with your email",
      "Verify your account",
      "Start your 3-day free trial",
    ],
    tip: "Choose your plan any time during the trial — your data carries over.",
  },
  {
    title: "Set up your business profile",
    desc: "Make BizRavana yours in Settings — your branding, theme and defaults, once.",
    checklist: [
      "Business name & logo",
      "Currency (LKR) & date format",
      "Theme preference",
      "Order & quotation numbering",
    ],
    tip: "Your logo appears on every invoice and quotation you send.",
  },
  {
    title: "Add your products",
    desc: "Add your catalog once — manually or with a bulk XLSX/CSV import — so stock, prices and profit are ready to go.",
    checklist: [
      "Create products with categories",
      "Set selling price & cost for profit margins",
      "Add size variants",
      "Record opening stock",
    ],
    tip: "Already have a spreadsheet? Use the bulk import and skip the typing.",
  },
  {
    title: "Make your first sale",
    desc: "Run the full flow once and it becomes second nature: quotation → order → invoice → payment.",
    checklist: [
      "Create a professional quotation",
      "Convert it to an order in one click",
      "Generate the invoice",
      "Record the payment (COD, credit, bank transfer)",
    ],
    tip: "Send quotations to customers on WhatsApp before they leave the shop.",
  },
  {
    title: "Connect your workflow",
    desc: "Add the pieces that make you faster — couriers, WhatsApp messaging and your team.",
    checklist: [
      "Connect Royal Express or Koombiyo",
      "Generate waybills & dispatch in bulk",
      "Set up WhatsApp message templates",
      "Invite team members with roles",
    ],
    tip: "Invite your team with roles — Owner, Business Manager or Member.",
  },
];

/** Next step — a destination card under the journey. */
type NextStep = {
  icon: LucideIcon;
  title: string;
  desc: string;
  label: string;
  href: string;
};

/** Where to go after the setup — real routes only. */
const NEXT_STEPS: NextStep[] = [
  {
    icon: Sparkles,
    title: "Explore Features",
    desc: "See everything BizRavana can do for your business — from reports to automation.",
    label: "View Features",
    href: "/features",
  },
  {
    icon: BadgeDollarSign,
    title: "Choose a Plan",
    desc: "Pick the plan that fits your business — from Basic to Enterprise, cancel anytime.",
    label: "See Pricing",
    href: "/pricing",
  },
  {
    icon: Headset,
    title: "Talk to Us",
    desc: "Questions along the way? Message the team — we typically respond within a few hours.",
    label: "Contact Us",
    href: "/contact",
  },
];

/**
 * Getting Started page — a centered statement over the ambient blob
 * backdrop, then the numbered setup journey and destination cards. Uses the
 * same editorial structure as Features (hero + sections) with the About
 * page's Card/Reveal/Button system and the shared closing CTA.
 */
export default function GettingStartedPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          Features, Contact and Pricing pages, without the three.js laptop
          canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="gs-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="gs-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
            <div className="feat-hero__actions">
              {/* Placeholder target — swap for the signup route when it exists. */}
              <Button variant="primary">Start Free Trial →</Button>
              <Button href="/features" variant="secondary">
                Explore Features
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. The setup journey — numbered step cards on a connecting rail. */}
      <section className="about-section gs-section" aria-labelledby="gs-steps-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">The 5-step setup</p>
            <h2 id="gs-steps-heading" className="about-lead">
              From signup to first order
            </h2>
            <p className="about-body">
              Work through these in order — most businesses are fully set up in
              an afternoon. Each step builds on the last, so everything stays
              connected from day one.
            </p>
          </Reveal>
          <ol className="gs-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="gs-steps__item">
                <Reveal className="gs-steps__num-wrap" delay={i * 60}>
                  <span className="gs-steps__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Reveal>
                <Reveal className="gs-steps__cell" delay={i * 60}>
                  <Card
                    className="gs-steps__card"
                    title={step.title}
                    description={step.desc}
                  >
                    <ul className="about-checks gs-steps__checklist">
                      {step.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {step.tip ? (
                      <p className="gs-tip">
                        <strong>Tip:</strong> {step.tip}
                      </p>
                    ) : null}
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Where to go next — destination cards with real routes. */}
      <section className="about-section gs-next" aria-labelledby="gs-next-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Where to go next</p>
            <h2 id="gs-next-heading" className="about-lead">
              You&rsquo;re set up. Now what?
            </h2>
            <p className="about-body">
              The journey doesn&rsquo;t end at setup — these pages will help you
              get the most out of BizRavana.
            </p>
          </Reveal>
          <ul className="gs-next__grid">
            {NEXT_STEPS.map(({ icon, title, desc, label, href }, i) => (
              <li key={title}>
                <Reveal className="gs-next__cell" delay={i * 90}>
                  <Card
                    className="gs-next__card"
                    icon={icon}
                    title={title}
                    description={desc}
                  >
                    <div className="gs-next__actions">
                      <Button href={href} variant="secondary" size="sm">
                        {label} →
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Final CTA — the shared inverted closing band, so this page ends
          in the site's common visual language. */}
      <section
        id="cta"
        className="section section--cta"
        aria-labelledby="gs-cta-heading"
      >
        <div className="cta">
          <h2 id="gs-cta-heading" className="cta__title">
            Ready to take control of your business?
          </h2>
          <p className="cta__desc">
            Start your 3-day free trial and see everything in one place.
          </p>
          <div className="cta__actions">
            {/* Placeholder target — swap for the signup route when it exists. */}
            <Button variant="primary">Start Free Trial →</Button>
          </div>
          <p className="cta__fineprint">3-day free trial · No credit card required</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
