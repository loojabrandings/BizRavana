"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Palette, 
  Code2, 
  Rocket, 
  ArrowRight, 
  ArrowDown, 
  Sparkles 
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Discover & Scope",
    desc: "We learn about your business, target audience, goals, and what your website needs to achieve to turn visitors into buyers.",
    icon: Search,
    timeline: "1–2 DAYS",
  },
  {
    num: "02",
    title: "Design & Style",
    desc: "We create a custom visual direction, typography hierarchy, and structure tailored around your unique brand identity.",
    icon: Palette,
    timeline: "3–6 DAYS",
  },
  {
    num: "03",
    title: "Build & Code",
    desc: "We engineer the approved design into a lightning-fast, mobile-optimized, production-ready Next.js web platform.",
    icon: Code2,
    timeline: "7–11 DAYS",
  },
  {
    num: "04",
    title: "Launch & Scale",
    desc: "We test across all devices, integrate WhatsApp funnels and analytics, and take your business live to the world.",
    icon: Rocket,
    timeline: "12–14 DAYS",
  },
];

export default function ArchitectureFlowDiagram() {
  return (
    <section id="solutions" className="py-28 relative bg-[#0C0C0C] border-t border-white/[0.06]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#fd3a25]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="wd-badge-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ 5-STEP ROADMAP ]</span>
          </div>

          <h2
            className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
          >
            PROCESS
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base font-kanit max-w-xl mx-auto leading-relaxed">
            We keep the roadmap simple, transparent, and focused on delivering a high-converting digital flagship without delays.
          </p>
        </div>

        {/* Horizontal timeline flow on desktop, vertical stack on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-stretch items-center gap-6 lg:gap-4 w-full">
          {STEPS.map((step, idx) => {
            const IconComp = step.icon;
            
            return (
              <Fragment key={idx}>
                {/* Card Container */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="flex-1 w-full p-6 sm:p-8 rounded-[32px] sm:rounded-[44px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/30 hover:border-white transition-all duration-300 flex flex-col justify-between items-start text-left relative z-10 group shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                >
                  {/* Top Bar: Icon + Giant Number */}
                  <div className="w-full flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b57] to-[#fd3a25] shadow-[0_8px_20px_rgba(253,58,37,0.35)] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300">
                      <IconComp className="w-5 h-5 stroke-[2.5px]" />
                    </div>

                    <span className="font-kanit font-black text-3xl text-neutral-600 group-hover:text-[#fd3a25] transition-colors select-none">
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-bold font-kanit uppercase text-white tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>

                  {/* Timeline Badge */}
                  <div className="w-full pt-4 border-t border-white/[0.08]">
                    <span className="px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-neutral-200 text-[10px] font-mono font-bold tracking-widest uppercase select-none">
                      {step.timeline}
                    </span>
                  </div>
                </motion.div>

                {/* Arrow Connector */}
                {idx < 3 && (
                  <div className="flex items-center justify-center text-[#fd3a25] py-2 lg:py-0 px-0 lg:px-2 z-20 flex-shrink-0 lg:self-center">
                    <ArrowRight className="hidden lg:block w-5 h-5 text-[#fd3a25] stroke-[3px] animate-pulse" />
                    <ArrowDown className="lg:hidden w-5 h-5 text-[#fd3a25] stroke-[3px] animate-pulse" />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
