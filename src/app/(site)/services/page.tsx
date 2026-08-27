"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Globe,
  Bot,
  Workflow,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Flame,
} from "lucide-react";
import WebDesignNav from "@/app/(site)/services/web-design/components/WebDesignNav";
import WebDesignFooter from "@/app/(site)/services/web-design/components/WebDesignFooter";
import "@/app/(site)/services/web-design/web-design.css";

const SERVICES = [
  {
    badge: "Active Service",
    badgeType: "active",
    icon: Globe,
    title: "Web Design & Development",
    subtitle: "Custom, High-Performance Digital Flagships",
    desc: "Custom, sub-second web platforms, landing pages, and web applications engineered with Next.js & React for ambitious Sri Lankan businesses and global brands.",
    bullets: [
      "Sub-second loading with Next.js App Router",
      "Interactive 3D showcases & scroll experiences",
      "WhatsApp ordering & lead automation funnels",
      "Tailored for mobile, tablet, and ultra-wide screens",
      "Full technical SEO and Google schema architecture",
    ],
    ctaText: "Explore Web Design Packages",
    ctaHref: "/#pricing",
    isExternal: false,
    highlight: true,
  },
  {
    badge: "Active Platform",
    badgeType: "active",
    icon: Flame,
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
    ctaHref: "/services/bizravana-oms",
    isExternal: false,
    highlight: true,
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
    highlight: false,
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
    highlight: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="wd-standalone-root">
      <main className="relative min-h-screen bg-[#0C0C0C] text-white selection:bg-[#fd3a25] selection:text-white flex flex-col justify-between">
        {/* Atmosphere */}
        <div className="wd-bg-grid" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#fd3a25]/8 rounded-full blur-[160px] pointer-events-none -z-0" />

        {/* Global Nav */}
        <WebDesignNav />

        {/* Hero Section */}
        <section className="pt-36 sm:pt-44 pb-16 relative z-10">
          <div className="wd-container max-w-6xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="wd-badge-mono mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ SOLUTIONS ECOSYSTEM ]</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
              style={{ fontSize: "clamp(2.8rem, 10vw, 130px)" }}
            >
              SERVICES
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-neutral-400 text-sm sm:text-base md:text-lg font-kanit font-light max-w-2xl mx-auto leading-relaxed"
            >
              From our flagship Order Management System to custom web development and cutting-edge conversational AI, BizRavana provides the technology foundation your business needs to grow.
            </motion.p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="pb-24 relative z-10">
          <div className="wd-container max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {SERVICES.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`p-7 sm:p-9 rounded-[36px] sm:rounded-[48px] flex flex-col justify-between transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.85)] ${
                      service.highlight
                        ? "border-2 border-[#fd3a25]/40 bg-[#120807] hover:border-[#fd3a25]"
                        : "border-2 border-[#D7E2EA]/20 bg-[#0C0C0C] hover:border-white/40"
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            service.highlight
                              ? "bg-[#fd3a25] text-white shadow-lg shadow-[#fd3a25]/30"
                              : "bg-white/[0.06] border border-white/10 text-[#ff8a7a]"
                          }`}
                        >
                          <Icon className="w-6 h-6 stroke-[2.2px]" />
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            service.badgeType === "active"
                              ? "bg-[#fd3a25]/20 text-[#ff8a7a] border border-[#fd3a25]/30"
                              : "bg-white/[0.04] text-neutral-400 border border-white/10"
                          }`}
                        >
                          {service.badge}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black font-kanit uppercase text-white tracking-tight mb-1">
                        {service.title}
                      </h2>
                      <p className="text-xs font-mono font-semibold text-[#ff8a7a] mb-4">
                        {service.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-300 font-kanit font-light leading-relaxed mb-6">
                        {service.desc}
                      </p>

                      {/* Bullet points */}
                      <ul className="space-y-2.5 mb-8 pt-5 border-t border-white/[0.08]">
                        {service.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-xs text-neutral-300 font-light font-kanit"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8a7a] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={service.ctaHref}
                        className={`w-full py-3.5 rounded-full font-kanit font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          service.highlight
                            ? "wd-contact-pill-btn"
                            : "wd-ghost-pill-btn"
                        }`}
                      >
                        <span>{service.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global Footer */}
        <WebDesignFooter />
      </main>
    </div>
  );
}
