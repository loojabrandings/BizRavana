import type { Metadata } from "next";
import {
  Rocket,
  ReceiptText,
  Truck,
  MessageCircle,
  UsersRound,
  CreditCard,
  Phone,
  Mail,
  MessageCircle as WhatsAppIcon,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Card from "@/components/card";
import Reveal from "@/components/reveal";
import FaqList, { type FaqItem } from "@/components/faq-list";
import HelpSearch from "@/components/help-search";
import JsonLd from "@/components/json-ld";
import { CONTACT } from "@/config/site";

export const metadata: Metadata = {
  title: "Help Center — BizRavana",
  description:
    "Find answers fast — search help topics, browse popular guides, and get in touch with the BizRavana team on WhatsApp, email or phone.",
};

/** Hero copy — one centered statement, matching the other editorial pages. */
const HERO = {
  eyebrow: "Help Center",
  title: "How can we help?",
  desc: "Search our help topics for a quick answer, or reach out directly — we typically respond within a few hours during business hours.",
};

/** A popular topic — a compact card linking out to the full guide. */
type Topic = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
};

/** The places most people go first. */
const TOPICS: Topic[] = [
  {
    icon: Rocket,
    title: "Get Started in Minutes",
    desc: "The 5-step setup — from signup to your first order.",
    href: "/getting-started",
  },
  {
    icon: ReceiptText,
    title: "Orders & Invoices",
    desc: "Quotations, orders, invoices and payments.",
    href: "/documentation#docs-sales",
  },
  {
    icon: Truck,
    title: "Courier & Deliveries",
    desc: "Connect couriers, generate waybills, dispatch in bulk.",
    href: "/documentation#docs-courier",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    desc: "Templates and messages for your customers.",
    href: "/documentation#docs-whatsapp",
  },
  {
    icon: UsersRound,
    title: "Team & Roles",
    desc: "Invite teammates and control what each can do.",
    href: "/documentation#docs-team",
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    desc: "Plans, bank transfer payments and billing history.",
    href: "/documentation#docs-billing",
  },
];

/** Top questions — the short answers people ask most. */
const TOP_QUESTIONS: FaqItem[] = [
  {
    question: "Is BizRavana really free?",
    answer:
      "Every new account includes a 3-day free trial with full access to explore the platform. After the trial, simply choose the plan that best fits your business — no hidden fees, cancel anytime.",
  },
  {
    question: "How do I get started?",
    answer:
      "Follow the 5-step setup: create your account, set up your business profile, add your products, make your first sale, and connect couriers, WhatsApp and your team. Most businesses are fully set up in an afternoon.",
  },
  {
    question: "Which courier services are supported?",
    answer:
      "BizRavana currently supports Royal Express and Koombiyo Delivery, with both manual and automated dispatch workflows. More courier integrations will be introduced in future updates.",
  },
  {
    question: "Can my team use BizRavana too?",
    answer:
      "Yes. Invite team members with role-based access — Owner, Business Manager or Member — and track what everyone does in the activity log.",
  },
  {
    question: "How do I pay for my subscription?",
    answer:
      "Pay by bank transfer and upload your payment proof from the subscription page. Your payment is applied to your account once it's confirmed.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Change or cancel your plan from the subscription page — your subscription stays active until the end of the current billing period, and you can restart whenever you like.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes. Every business has its own isolated workspace, ensuring your data remains private and secure.",
  },
  {
    question: "Do I need technical knowledge?",
    answer:
      "No. BizRavana is designed to be simple and easy to use, allowing you to get started in just a few minutes.",
  },
];

/** A way to reach the team — rendered as a full-card link. */
type Channel = {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  /** Open in a new tab (external services only — never tel:/mailto:). */
  newTab?: boolean;
};

const CHANNELS: Channel[] = [
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: CONTACT.whatsappDisplay,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    newTab: true,
  },
];

/** The top questions as schema.org FAQ structured data. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TOP_QUESTIONS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

/**
 * Help Center page — a centered statement with a live help search, a browse
 * grid of popular topics, the top questions as an accordion, and the contact
 * channels as cards. Reuses the editorial hero, the FAQ accordion and the
 * compact link-card grid from the Documentation page.
 */
export default function HelpCenterPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          other editorial pages, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement with the help search front and center. */}
      <section className="feat-hero" aria-labelledby="help-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="help-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
            <HelpSearch />
          </Reveal>
        </div>
      </section>

      {/* 2. Popular topics — compact cards linking out to the full guides. */}
      <section className="about-section help-topics" aria-label="Popular help topics">
        <div className="about-section__inner about-section__inner--wide">
          <ul className="docs-cats__grid">
            {TOPICS.map(({ icon, title, desc, href }, i) => (
              <li key={title}>
                <Reveal className="docs-cats__cell" delay={(i % 3) * 90}>
                  <a className="docs-cats__link" href={href}>
                    <Card
                      className="docs-cats__card"
                      icon={icon}
                      title={title}
                      description={desc}
                    />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Top questions — the short answers, as an accordion. */}
      <section className="about-section help-faq" aria-labelledby="help-faq-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Top questions</p>
            <h2 id="help-faq-heading" className="about-lead">
              Asked &amp; answered
            </h2>
            <p className="about-body">
              The questions we hear most often — in plain words, with no
              jargon. Need the detail? Every topic links into the full
              documentation.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <FaqList items={TOP_QUESTIONS} idPrefix="help-faq" className="docs-faq" />
          </Reveal>
        </div>
      </section>

      {/* 4. Contact us — the channels, as cards. */}
      <section className="about-section help-contact" aria-labelledby="help-contact-heading">
        <div className="about-section__inner about-section__inner--center">
          <Reveal>
            <p className="about-eyebrow">Contact us</p>
            <h2 id="help-contact-heading" className="about-lead">
              Still stuck? Talk to a human
            </h2>
            <p className="about-body">
              If the docs didn&rsquo;t cover it, message us directly — we
              typically respond within a few hours during business hours.
            </p>
          </Reveal>
          <ul className="docs-cats__grid help-contact__grid">
            {CHANNELS.map(({ icon, label, value, href, newTab }, i) => (
              <li key={label}>
                <Reveal className="docs-cats__cell" delay={i * 90}>
                  <a
                    className="docs-cats__link"
                    href={href}
                    {...(newTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <Card
                      className="docs-cats__card help-contact__card"
                      icon={icon}
                      title={label}
                      description={value}
                    />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal delay={180}>
            <p className="help-contact__note">
              Prefer writing a longer message? Use the{" "}
              <a className="help-contact__link" href="/contact">
                contact page
              </a>{" "}
              and we&rsquo;ll reply on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Structured data — the top questions as a schema.org FAQ. */}
      <JsonLd data={faqJsonLd} />

      <Footer />
    </main>
  );
}
