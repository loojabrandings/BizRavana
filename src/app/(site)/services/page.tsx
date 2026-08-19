import type { Metadata } from "next";
import {
  Layers,
  Globe,
  Bot,
  Workflow,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Services — BizRavana",
  description:
    "Explore BizRavana's full business solutions ecosystem — BizRavana OMS for order and business management, custom web design & development, intelligent AI chatbots, and automated business workflows.",
};

const SERVICES = [
  {
    badge: "Active Platform",
    badgeType: "active",
    icon: Layers,
    title: "BizRavana OMS",
    subtitle: "Order & Business Management System",
    desc: "The all-in-one operating system for Sri Lankan commerce. Real-time order tracking, automated invoicing, inventory control, expense logging, and 1-click courier integrations with Royal Express & Koombiyo.",
    bullets: [
      "Orders, quotations & invoice generation",
      "Real-time inventory & low-stock alerts",
      "Courier API integrations (Royal Express, Koombiyo)",
      "Automated WhatsApp customer dispatch notifications",
      "Team collaboration with role permissions",
    ],
    ctaText: "Explore Features & Demo",
    ctaHref: "/features",
    isExternal: false,
  },
  {
    badge: "Coming Soon",
    badgeType: "upcoming",
    icon: Bot,
    title: "AI Chatbots",
    subtitle: "24/7 Intelligent Conversational Commerce",
    desc: "Intelligent AI assistants trained to handle customer inquiries, recommend products, answer FAQs, and capture orders on WhatsApp in Sinhala, Singlish, and English without human intervention.",
    bullets: [
      "24/7 WhatsApp AI sales & support agent",
      "Native Sinhala & Singlish language understanding",
      "Instant stock inquiry & order entry to OMS",
      "Automated customer notification flows",
    ],
    ctaText: "Learn More & Join Waitlist",
    ctaHref: "/services/ai-chatbots",
    isExternal: false,
  },
  {
    badge: "Coming Soon",
    badgeType: "upcoming",
    icon: Workflow,
    title: "AI Automations",
    subtitle: "End-to-End Operational Pipeline Automation",
    desc: "Custom AI workflow pipelines that automate bank slip OCR validation, multi-channel lead routing, automated repeat customer marketing, and smart inventory restocking triggers.",
    bullets: [
      "Bank slip OCR & payment reconciliation AI",
      "Automated lead capture & CRM synchronization",
      "Predictive demand & inventory reorder triggers",
      "Event-driven WhatsApp retargeting flows",
    ],
    ctaText: "Learn More & Inquire",
    ctaHref: "/services/ai-automations",
    isExternal: false,
  },
];

export default function ServicesPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient background accent blobs */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* Hero */}
      <section className="feat-hero" aria-labelledby="services-hub-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">Solutions Ecosystem</p>
            <h1 id="services-hub-heading" className="feat-hero__title">
              Services built to scale your business.
            </h1>
            <p className="feat-hero__desc">
              From our flagship Order Management System to bespoke web development and cutting-edge conversational AI, BizRavana provides the technology foundation your business needs to grow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="about-section pt-0" aria-label="Services list">
        <div className="about-section__inner about-section__inner--center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 90}>
                <div className="card p-6 md:p-8 h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="card__glow" aria-hidden="true" />
                  <div className="card__shimmer" aria-hidden="true" />
                  <div className="card__line" aria-hidden="true" />

                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="card__badge">
                        <service.icon size={22} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          service.badgeType === "active"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {service.badge}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight mb-1">
                      {service.title}
                    </h2>
                    <p className="text-xs font-semibold text-[var(--accent)] mb-3">
                      {service.subtitle}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                      {service.desc}
                    </p>

                    <ul className="space-y-2 mb-8 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      {service.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant={service.badgeType === "active" ? "primary" : "secondary"}
                      href={service.ctaHref}
                      className="w-full justify-center"
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Synergistic Ecosystem Section */}
      <section className="about-section" aria-labelledby="ecosystem-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Connected Architecture</p>
            <h2 id="ecosystem-heading" className="about-lead">
              A unified operating stack for modern commerce
            </h2>
            <p className="about-body">
              Instead of duct-taping five disconnected tools, BizRavana offers a cohesive platform where your website captures orders, AI chatbots converse with shoppers, and the OMS handles inventory, dispatch and profits.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 text-left">
            <Reveal delay={60}>
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--fill-hover)] h-full">
                <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  Stage 1 · Capture
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
                  Bespoke Website &amp; WhatsApp AI
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Attract shoppers with an ultrafast website while the AI Chatbot qualifies buyers and answers inquiries 24/7 on WhatsApp.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--fill-hover)] h-full">
                <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  Stage 2 · Fulfill
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
                  BizRavana OMS Engine
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  All orders automatically stream into your central OMS. Generate courier waybills, reserve stock, and log customer balances with zero manual copy-pasting.
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--fill-hover)] h-full">
                <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                  Stage 3 · Scale
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
                  Analytics &amp; Profit Tracking
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Monitor net profit after courier fees, expense deductions, and payment reconciliations. Understand exactly what makes your business grow.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section section--cta" aria-labelledby="services-cta-heading">
        <div className="cta">
          <h2 id="services-cta-heading" className="cta__title">
            Ready to upgrade your business technology?
          </h2>
          <p className="cta__desc">
            Start with our 3-day free trial of BizRavana OMS, or reach out to our team to discuss custom development.
          </p>
          <div className="cta__actions">
            <Button variant="primary" href="/login">
              Start 3-Day Free Trial →
            </Button>
            <Button variant="secondary" href="/contact">
              Contact Our Team
            </Button>
          </div>
          <p className="cta__fineprint">No credit card required · Instant setup</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
