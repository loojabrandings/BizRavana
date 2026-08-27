"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Flame, ShieldCheck, ArrowUpRight, CheckCircle2 } from "lucide-react";

// 4 Core Advantage Pillars
const ADVANTAGES = [
  {
    num: "01",
    title: "Custom, Not Cookie-Cutter",
    tagline: "100% Tailored Build",
    desc: "Every website is engineered from the ground up around your specific brand identity, products, and customer journey. Zero recycled templates, zero bloated plugins.",
    metric: "0% Template Bloat",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Sub-Second Mobile Velocity",
    tagline: "Next.js App Router Core",
    desc: "Engineered for instant speed across smartphones and tablets where over 80% of your real customers browse, interact, and buy in Sri Lanka.",
    metric: "< 0.8s Load Speed",
    icon: Zap,
  },
  {
    num: "03",
    title: "Conversion-Obsessed Architecture",
    tagline: "High-Trust Funnels",
    desc: "From 1-click WhatsApp checkout funnels to fast quote inquiries, every element is strategically positioned to turn visitors into paying customers.",
    metric: "Maximum ROI",
    icon: Flame,
  },
  {
    num: "04",
    title: "Direct Engineering Partnership",
    tagline: "Senior Tech Team",
    desc: "You collaborate directly with senior engineers building your platform — from discovery and design to deployment, technical SEO, and post-launch growth.",
    metric: "Direct WhatsApp Line",
    icon: ShieldCheck,
  },
];

export default function WhyBizRavanaBento() {
  return (
    <section
      id="why-us"
      className="relative bg-[#FFFFFF] text-[#0C0C0C] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] px-5 sm:px-8 md:px-12 py-24 sm:py-28 md:py-32 z-20 shadow-[0_-25px_60px_rgba(0,0,0,0.35),0_25px_60px_rgba(0,0,0,0.35)] my-6 sm:my-10"
    >
      <div className="wd-container max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono font-bold text-neutral-800 uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fd3a25]" />
            <span>[ THE BIZRAVANA ADVANTAGE ]</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-kanit font-black uppercase text-[#0C0C0C] leading-none tracking-tight text-center mb-6 select-none"
            style={{ fontSize: "clamp(2.5rem, 8vw, 100px)" }}
          >
            WHY BIZRAVANA
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-neutral-700 text-sm sm:text-base md:text-lg font-kanit font-light max-w-2xl mx-auto leading-relaxed"
          >
            We don&apos;t just build websites that look pretty. We create high-performance digital engines that build trust, capture leads, and scale your brand with measurable results.
          </motion.p>
        </div>

        {/* 2x2 Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {ADVANTAGES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="bg-neutral-50 hover:bg-white border-2 border-black/10 hover:border-black rounded-[32px] sm:rounded-[44px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 group cursor-pointer min-h-[320px] sm:min-h-[340px]"
              >
                {/* Top Row: Icon Badge + Giant Number */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-black/5 group-hover:bg-[#fd3a25] text-black group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                    <Icon className="w-6 h-6 stroke-[2.2px]" />
                  </div>

                  <span className="font-kanit font-black text-3xl sm:text-4xl text-neutral-300 group-hover:text-[#fd3a25] transition-colors select-none">
                    {item.num}
                  </span>
                </div>

                {/* Middle Row: Tag + Title + Description */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/5 group-hover:bg-[#fd3a25]/10 group-hover:text-[#fd3a25] text-neutral-700 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors">
                      {item.tagline}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-kanit uppercase text-[#0C0C0C] group-hover:text-[#fd3a25] transition-colors tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-light font-kanit">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Row: Metric Highlight Badge */}
                <div className="pt-4 border-t border-black/8 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#fd3a25]" />
                    <span>{item.metric}</span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#fd3a25] text-neutral-700 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-black/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-600"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fd3a25] animate-pulse" />
            <span className="uppercase tracking-wider font-bold text-neutral-900">
              Engineered in Sri Lanka for Global Scale
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
            <span>99.9% Uptime SLA</span>
            <span>•</span>
            <span>Zero Vendor Lock-in</span>
            <span>•</span>
            <span>100% Code Ownership</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
