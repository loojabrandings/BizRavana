import type { Metadata } from "next";
import { Send, Headset, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Card from "@/components/card";
import Reveal from "@/components/reveal";
import ContactForm from "@/components/contact-form";
import JsonLd from "@/components/json-ld";
import { CONTACT, SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact — BizRavana",
  description:
    "Get in touch with the BizRavana team — ask a question or book a demo for your business. We typically respond within a few hours.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact BizRavana — Sales & Support",
    description:
      "Have a question or want a demo for your business? Reach out to the BizRavana team via WhatsApp, phone, or email.",
    type: "website",
    url: `${SITE_URL}/contact`,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact BizRavana — Sales & Support",
    description:
      "Have a question or want a demo for your business? Reach out to the BizRavana team via WhatsApp, phone, or email.",
  },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact BizRavana",
  url: `${SITE_URL}/contact`,
  description: "Get in touch with BizRavana for sales, demos, and support.",
  mainEntity: {
    "@type": "Organization",
    name: "BizRavana",
    telephone: `+94${CONTACT.phone.slice(1)}`,
    email: CONTACT.email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+94${CONTACT.phone.slice(1)}`,
      contactType: "customer service",
      email: CONTACT.email,
      availableLanguage: ["en", "si", "ta"],
    },
  },
};

/** Hero copy — one centered statement, matching the Features page rhythm. */
const HERO = {
  eyebrow: "Get in touch",
  title: "We'd love to hear from you",
  desc: "Have a question about BizRavana? Want a demo for your business? Our team is ready to help.",
};

/** Left panel — the channels visitors can reach us through. */
const INFO_PANEL = {
  title: "Contact Information",
  desc: "Reach out to us through any of these channels. We typically respond within a few hours.",
  note: "We typically respond within a few hours during business hours.",
};

/** Right panel — the WhatsApp message form. */
const FORM_PANEL = {
  title: "Send us a message",
  desc: "Fill in the form below and we'll get back to you via WhatsApp.",
  note: "We'll respond via WhatsApp using the number you provide.",
};

/** A reachable channel — rendered as an icon row with a working link. */
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
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT.whatsappDisplay,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    newTab: true,
  },
];

/**
 * Contact page — a centered statement over the ambient blob backdrop, then a
 * two-column split: contact information left, the WhatsApp form right. Uses
 * the same editorial structure as the Features page (hero + shared grid) with
 * the About page's split layout and the reusable Card/Reveal/Button system.
 */
export default function ContactPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the same fixed background layer as the
          Features page, without the three.js laptop canvas. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, over the blobs. */}
      <section className="feat-hero" aria-labelledby="contact-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">{HERO.eyebrow}</p>
            <h1 id="contact-hero-heading" className="feat-hero__title">
              {HERO.title}
            </h1>
            <p className="feat-hero__desc">{HERO.desc}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Two columns — contact info left, message form right. */}
      <section className="about-section contact-section" aria-labelledby="contact-info-heading">
        <div className="about-section__inner about-section__inner--split">
          <Reveal className="contact-col">
            <Card
              icon={Headset}
              title={INFO_PANEL.title}
              description={INFO_PANEL.desc}
              className="contact-col__card"
            >
              <ul className="contact-channels">
                {CHANNELS.map(({ icon: Icon, label, value, href, newTab }) => (
                  <li key={label}>
                    <a
                      className="contact-channels__link"
                      href={href}
                      {...(newTab
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <span className="contact-channels__icon">
                        <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span className="contact-channels__text">
                        <span className="contact-channels__label">{label}</span>
                        <span className="contact-channels__value">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="contact-note">{INFO_PANEL.note}</p>
            </Card>
          </Reveal>

          <Reveal className="contact-col" delay={150}>
            <Card
              icon={Send}
              title={FORM_PANEL.title}
              description={FORM_PANEL.desc}
              className="contact-col__card"
            >
              <ContactForm />
              <p className="contact-note">{FORM_PANEL.note}</p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Structured data — ContactPage */}
      <JsonLd data={contactPageJsonLd} />

      <Footer />
    </main>
  );
}
