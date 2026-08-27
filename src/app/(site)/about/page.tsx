import type { Metadata } from "next";
import Image from "next/image";
import { SITE_URL } from "@/config/site";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Card from "@/components/card";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "About — BizRavana",
  description:
    "BizRavana is a modern business management platform built to help Sri Lankan businesses manage their day-to-day operations, stay organized, and grow with confidence.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About BizRavana — Built for Sri Lankan Commerce",
    description:
      "BizRavana is a modern business management platform built to help Sri Lankan businesses manage day-to-day operations and grow with confidence.",
    type: "website",
    url: `${SITE_URL}/about`,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "About BizRavana — Built for Sri Lankan Commerce",
    description:
      "BizRavana is a modern business management platform built to help Sri Lankan businesses manage day-to-day operations and grow with confidence.",
  },
};

/** The Story — the things a small business juggles every day. */
const DOMAINS = [
  "Orders",
  "Customers",
  "Inventory",
  "Expenses",
  "Deliveries",
  "Payments",
  "Reports",
];

/** The Problem — where business owners' scattered tools live today. */
const SOURCES = ["WhatsApp", "Spreadsheets", "Notes", "Courier Platforms", "Manual Records"];

/** What We Believe — five beliefs, statement + supporting line each. */
const BELIEFS: { statement: string; why: string }[] = [
  {
    statement: "Simple beats complicated.",
    why: "Powerful software shouldn't require a manual.",
  },
  {
    statement: "Your data should work for you.",
    why: "Business information should lead to useful decisions, not just sit in tables.",
  },
  {
    statement: "Automation should save time.",
    why: "Repetitive work belongs to software, not business owners.",
  },
  {
    statement: "Local businesses deserve great technology.",
    why: "Sri Lankan businesses shouldn't have to compromise on quality because they're local.",
  },
  {
    statement: "Built to grow.",
    why: "Your software should grow alongside your business.",
  },
];

/** Built for Sri Lanka — local-first capability badges. */
const BADGES: { code: string; label: string }[] = [
  { code: "LKR", label: "Local currency" },
  { code: "COD", label: "Cash on Delivery" },
  { code: "Royal Express", label: "Courier integration" },
  { code: "Koombiyo", label: "Courier integration" },
  { code: "WhatsApp", label: "Business communication" },
];

/** The Product Philosophy — the flow every order travels. */
const STEPS = ["ORDER", "PAYMENT", "INVENTORY", "DELIVERY", "EXPENSE", "PROFIT"];

/**
 * About page — an editorial, free-scrolling companion to the 3D landing
 * page. Deliberately no fixed 3D laptop backdrop and no section-snap scroll:
 * the story is told in plain, readable sections that share the same type,
 * token and Card system as the other editorial pages (Features, Contact,
 * Pricing) — including the ambient blob backdrop behind the copy.
 */
export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          Features, Contact and Pricing pages, without the three.js laptop
          canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — statement + the product itself (a framed dashboard
          screenshot, not a stock image). */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="about-hero__inner">
          <Reveal className="about-hero__copy">
            <p className="about-eyebrow">About BizRavana</p>
            <h1 id="about-hero-heading" className="about-hero__title">
              Built to make business simpler.
            </h1>
            <p className="about-hero__desc">
              BizRavana is a modern business management platform built to help
              Sri Lankan businesses manage their day-to-day operations, stay
              organized, and grow with confidence.
            </p>
          </Reveal>

          <Reveal className="about-hero__visual" delay={150}>
            {/* Cinematic product shot: the live dashboard in a browser frame,
                with floating activity chips — no generic office stock. */}
            <div className="about-browser" aria-hidden="true">
              <div className="about-browser__bar">
                <span className="about-browser__dots" aria-hidden="true">
                  <span className="about-browser__dot" />
                  <span className="about-browser__dot" />
                  <span className="about-browser__dot" />
                </span>
                <span className="about-browser__url">app.bizravana.com</span>
              </div>
              <div className="about-browser__screen">
                <Image
                  src="/screens/v1/hero.webp"
                  alt=""
                  width={2559}
                  height={1706}
                  priority
                />
              </div>
            </div>
            <div className="about-hero__chip about-hero__chip--order" aria-hidden="true">
              <strong>Order #1042</strong>
              <span>Confirmed · WhatsApp sent</span>
            </div>
            <div className="about-hero__chip about-hero__chip--paid" aria-hidden="true">
              <strong>Rs 86,400</strong>
              <span>Payment collected</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. The Story — why BizRavana exists. */}
      <section className="about-section about-story" aria-labelledby="about-story-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">The Story</p>
            <h2 id="about-story-heading" className="about-lead">
              Business shouldn&rsquo;t feel this complicated.
            </h2>
            <p className="about-body">
              Running a small business often means jumping between WhatsApp
              messages, spreadsheets, notebooks, courier websites, payment
              records and countless little tasks.
            </p>
            <p className="about-body">We built BizRavana to bring those scattered pieces together.</p>

            <ul className="about-story__domains">
              {DOMAINS.map((domain) => (
                <li key={domain}>{domain}</li>
              ))}
            </ul>

            <p className="about-story__closing">One connected workspace.</p>
            <p className="about-body">
              Less time managing the mess. More time growing the business.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. The Problem — then the flow: scattered tools → BizRavana →
          one workspace. */}
      <section className="about-section about-problem" aria-labelledby="about-problem-heading">
        <div className="about-section__inner about-section__inner--split">
          <Reveal className="about-problem__copy">
            <p className="about-eyebrow">The Problem</p>
            <h2 id="about-problem-heading" className="about-lead">
              We saw a better way.
            </h2>
            <p className="about-body">
              A lot of growing businesses don&rsquo;t need complicated
              enterprise software. They need something that is:
            </p>
            <ul className="about-checks">
              <li>Simple enough to use every day.</li>
              <li>Powerful enough to grow with them.</li>
              <li>Built around the way they actually work.</li>
            </ul>
            <p className="about-body">BizRavana is designed around that idea.</p>
          </Reveal>

          <Reveal className="about-problem__visual" delay={150}>
            <div className="about-flow" aria-hidden="true">
              <ul className="about-sources">
                {SOURCES.map((source, i) => (
                  <li key={source} className="about-sources__row">
                    <span className="about-sources__pill">{source}</span>
                    {i < SOURCES.length - 1 ? (
                      <span className="about-sources__plus">+</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <span className="about-flow__connector" />
              <span className="about-flow__brand">BIZRAVANA</span>
              <span className="about-flow__connector" />
              <p className="about-flow__result">One connected business workspace</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Mission. */}
      <section className="about-section about-mission" aria-labelledby="about-mission-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Our mission</p>
            <h2 id="about-mission-heading" className="about-lead">
              To give every growing business the tools and clarity they need to
              operate better and grow faster.
            </h2>
            <p className="about-body">
              We&rsquo;re building technology that removes unnecessary
              complexity from business management — making powerful tools
              accessible to businesses of all sizes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 5. What We Believe. */}
      <section className="about-section about-beliefs" aria-labelledby="about-beliefs-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">What we believe</p>
            <h2 id="about-beliefs-heading" className="about-lead">
              Principles we build around
            </h2>
          </Reveal>
          <ul className="about-beliefs__grid">
            {BELIEFS.map(({ statement, why }, i) => (
              <li key={statement}>
                <Reveal className="about-beliefs__cell" delay={i * 90}>
                  <Card
                    className="about-beliefs__card"
                    title={statement}
                    description={why}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Built for Sri Lanka. */}
      <section className="about-section about-srilanka" aria-labelledby="about-srilanka-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Built for Sri Lanka 🇱🇰</p>
            <h2 id="about-srilanka-heading" className="about-lead">
              Made for the way Sri Lankan businesses work.
            </h2>
            <p className="about-body">
              From local payment methods and courier services to the everyday
              realities of running a small business, BizRavana is designed with
              Sri Lankan businesses in mind.
            </p>
            <ul className="about-badges">
              {BADGES.map(({ code, label }) => (
                <li key={code}>
                  <Card
                    className="about-badges__card"
                    title={code}
                    description={label}
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 7. The Product Philosophy — copy left, the animated order flow right. */}
      <section className="about-section about-philosophy" aria-labelledby="about-philosophy-heading">
        <div className="about-section__inner about-section__inner--split">
          <Reveal className="about-philosophy__copy">
            <p className="about-eyebrow">The Product Philosophy</p>
            <h2 id="about-philosophy-heading" className="about-lead">
              Technology should disappear into the workflow.
            </h2>
            <p className="about-body">
              You shouldn&rsquo;t have to think about where your information lives.
            </p>
            <ul className="about-checks">
              <li>When an order comes in, inventory should know.</li>
              <li>When inventory is purchased, expenses should know.</li>
              <li>When an order is dispatched, delivery should know.</li>
              <li>When everything is complete, your reports should know.</li>
            </ul>
            <p className="about-body">
              That&rsquo;s the experience we&rsquo;re building with BizRavana.
            </p>
          </Reveal>

          <Reveal className="about-philosophy__visual" delay={150}>
            {/* Animated flow — a pulse travels down the spine from ORDER to
                PROFIT, so the data's journey through the business is visible. */}
            <ol className="about-flow about-flow--steps">
              {STEPS.map((step, i) => (
                <li key={step} className="about-flow__row">
                  {i > 0 ? <span className="about-flow__link" aria-hidden="true" /> : null}
                  <span className="about-flow__step">{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 8. Future / Vision. */}
      <section className="about-section about-future" aria-labelledby="about-future-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">The Future</p>
            <h2 id="about-future-heading" className="about-lead">
              We&rsquo;re just getting started.
            </h2>
            <p className="about-body">
              BizRavana is being built to become more than a collection of
              business tools.
            </p>
            <p className="about-body">
              We&rsquo;re working toward a smarter business platform where
              automation, insights and AI can help business owners spend less
              time managing operations and more time making decisions.
            </p>
            <p className="about-future__closing">
              The goal isn&rsquo;t to replace the business owner.
            </p>
            <p className="about-future__closing about-future__closing--payoff">
              It&rsquo;s to give them a better view of their business.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 9. Final CTA — same inverted closing band as the landing page, so
          the About page ends in the site's shared visual language. */}
      <section
        id="cta"
        className="section section--cta"
        aria-labelledby="about-cta-heading"
      >
        <div className="cta">
          <h2 id="about-cta-heading" className="cta__title">
            Ready to run your business with less complexity?
          </h2>
          <p className="cta__desc">
            Experience a simpler way to manage your business with BizRavana.
          </p>
          <div className="cta__actions">
            {/* Placeholder target — swap for the signup route when it exists. */}
            <Button variant="primary">Start Your Free Trial →</Button>
          </div>
          <p className="cta__fineprint">3-day free trial · No credit card required</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
