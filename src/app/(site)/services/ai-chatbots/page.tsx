"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles, MessageSquare, ArrowRight, CheckCircle2, Zap, BrainCircuit, ShieldCheck } from "lucide-react";
import WebDesignNav from "@/app/(site)/services/web-design/components/WebDesignNav";
import WebDesignFooter from "@/app/(site)/services/web-design/components/WebDesignFooter";
import { CONTACT } from "@/config/site";
import "@/app/(site)/services/web-design/web-design.css";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "24/7 WhatsApp AI Sales Agent",
    desc: "Speaks fluent Sinhala, Singlish, and English. Automatically answers customer questions, shares product specs, and captures orders while you sleep.",
  },
  {
    icon: BrainCircuit,
    title: "Instant Stock & Order Sync",
    desc: "Directly connected with BizRavana OMS to verify real-time inventory counts and book orders immediately into your delivery queue.",
  },
  {
    icon: Zap,
    title: "Zero-Wait Customer Support",
    desc: "Resolves 90%+ of repetitive inquiries instantly — from shipping rates and branch locations to return policies.",
  },
  {
    icon: ShieldCheck,
    title: "Seamless Human Escalation",
    desc: "Hands over complex inquiries to human agents with full conversation context when needed.",
  },
];

export default function AIChatbotsServicePage() {
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi BizRavana team! I am interested in early access for the upcoming AI Chatbots service. Please notify me."
  )}`;

  return (
    <div className="wd-standalone-root">
      <main className="relative min-h-screen bg-[#0C0C0C] text-white selection:bg-[#fd3a25] selection:text-white flex flex-col justify-between">
        {/* Background Atmosphere */}
        <div className="wd-bg-grid" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#fd3a25]/8 rounded-full blur-[160px] pointer-events-none -z-0" />

        {/* Global Nav */}
        <WebDesignNav />

        {/* Hero Section */}
        <section className="pt-36 sm:pt-44 pb-20 relative z-10">
          <div className="wd-container max-w-6xl mx-auto text-center flex flex-col items-center">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="wd-badge-mono mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ COMING SOON • 2026 ROADMAP ]</span>
            </motion.div>

            {/* Glowing Icon Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] bg-gradient-to-br from-[#fd3a25] via-[#d42c1a] to-[#8f190c] border-2 border-white/25 flex items-center justify-center text-white shadow-[0_0_50px_rgba(253,58,37,0.35)] mb-8"
            >
              <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>

            {/* Massive .hero-heading Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
              style={{ fontSize: "clamp(2.8rem, 9vw, 120px)" }}
            >
              AI CHATBOTS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-neutral-300 text-sm sm:text-base md:text-lg font-kanit font-light max-w-2xl mx-auto leading-relaxed mb-10"
            >
              24/7 intelligent conversational commerce for WhatsApp and web. Native Sinhala and English understanding that turns conversations into instant confirmed orders.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-20"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wd-contact-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Join Early Access on WhatsApp</span>
                </span>
              </a>

              <Link
                href="/#pricing"
                className="wd-ghost-pill-btn px-7 py-3.5 text-xs sm:text-sm tracking-widest"
              >
                Explore Live Web Design
              </Link>
            </motion.div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
              {FEATURES.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="p-7 sm:p-9 rounded-[32px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group hover:border-white/40 transition-all duration-300"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 text-[#ff8a7a] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 stroke-[2.2px]" />
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold font-kanit uppercase text-white tracking-tight mb-2">
                        {feat.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-neutral-400 font-kanit font-light leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-neutral-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8a7a]" />
                      <span>Architecture Phase: In Development</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Footer */}
        <WebDesignFooter />
      </main>
    </div>
  );
}
