"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Smartphone, 
  ShieldCheck,
  Target,
  Clock,
  Search,
  MessageSquare
} from "lucide-react";

export default function WhyBizRavanaBento() {
  return (
    <section id="why-us" className="py-28 relative bg-[#040406]">
      <div className="wd-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ THE UNFAIR ADVANTAGE ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Why Visionary Sri Lankan Founders <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              Choose BizRavana.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            We don&apos;t build generic WordPress templates. We engineer high-performance bespoke digital assets.
          </p>
        </div>

        {/* 2x2 High-Contrast White Bento Grid matching user's design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* ============================================================
              CARD 1: Outcome over Output (Stacked Progress Bars & Tags)
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#ffffff] text-[#0a0b10] rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/90 flex flex-col justify-between group hover:shadow-[0_25px_60px_rgba(111,197,155,0.18)] transition-all duration-500 hover:-translate-y-1"
          >
            {/* Top Interactive Skeuomorphic Widget */}
            <div className="min-h-[170px] flex flex-col justify-center gap-3.5 mb-8 p-6 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              {/* Bar 1 */}
              <div className="flex items-center gap-3">
                <div className="h-5 flex-1 bg-neutral-200/70 rounded-full" />
                <div className="px-3 py-1 rounded-full bg-white shadow-sm border border-neutral-200/80 text-[11px] font-bold text-neutral-800 flex items-center gap-1.5 flex-shrink-0">
                  <Target className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>Business First</span>
                </div>
              </div>

              {/* Bar 2 */}
              <div className="flex items-center gap-3">
                <div className="h-5 flex-[1.6] bg-neutral-200/70 rounded-full" />
                <div className="px-3 py-1 rounded-full bg-white shadow-sm border border-neutral-200/80 text-[11px] font-bold text-neutral-800 flex items-center gap-1.5 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sub-0.8s Speed</span>
                </div>
              </div>

              {/* Bar 3 */}
              <div className="flex items-center gap-3">
                <div className="h-5 flex-[0.8] bg-neutral-200/70 rounded-full" />
                <div className="px-3 py-1 rounded-full bg-white shadow-sm border border-neutral-200/80 text-[11px] font-bold text-neutral-800 flex items-center gap-1.5 flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Exploits</span>
                </div>
              </div>

              {/* Bar 4 */}
              <div className="flex items-center gap-3">
                <div className="h-5 flex-[1.2] bg-neutral-200/70 rounded-full" />
                <div className="px-3 py-1 rounded-full bg-white shadow-sm border border-neutral-200/80 text-[11px] font-bold text-neutral-800 flex items-center gap-1.5 flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>High ROI</span>
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mb-3">
                Business First &amp; Outcome Focused
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                We don&apos;t start with templates. We first understand your business, audience, and goals — 
                so every sprint delivers real commercial impact, not just vanity features.
              </p>
            </div>
          </motion.div>

          {/* ============================================================
              CARD 2: 100% Bespoke Quality (3D Floating Checkmark Tiles)
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#ffffff] text-[#0a0b10] rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/90 flex flex-col justify-between group hover:shadow-[0_25px_60px_rgba(111,197,155,0.18)] transition-all duration-500 hover:-translate-y-1"
          >
            {/* Top Interactive Skeuomorphic Widget */}
            <div className="min-h-[170px] flex items-center justify-center mb-8 p-6 rounded-2xl bg-neutral-50/80 border border-neutral-100 relative">
              {/* Floating Rail */}
              <div className="w-[85%] h-6 bg-neutral-200/60 rounded-full absolute" />

              {/* 3 Floating 3D Checkmark Tiles */}
              <div className="flex items-center gap-5 sm:gap-6 relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-[0_12px_25px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.04)] border border-neutral-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Check className="w-7 h-7 text-neutral-900 stroke-[3]" />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-[0_12px_25px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.04)] border border-neutral-100 flex items-center justify-center scale-110 group-hover:scale-115 transition-transform duration-300">
                  <Check className="w-7 h-7 text-[#2d6a4f] stroke-[3.5]" />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-[0_12px_25px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.04)] border border-neutral-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Check className="w-7 h-7 text-neutral-900 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mb-3">
                Custom Design &amp; Precision Craft
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Your website shouldn&apos;t look like everyone else&apos;s. We create a visual direction around your 
                brand that establishes undeniable market leadership in Sri Lanka and abroad.
              </p>
            </div>
          </motion.div>

          {/* ============================================================
              CARD 3: Secure by Design & Mobile First (3D Shield & Lock)
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#ffffff] text-[#0a0b10] rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/90 flex flex-col justify-between group hover:shadow-[0_25px_60px_rgba(111,197,155,0.18)] transition-all duration-500 hover:-translate-y-1"
          >
            {/* Top Interactive Skeuomorphic Widget */}
            <div className="min-h-[170px] flex items-center justify-center mb-8 p-6 rounded-2xl bg-neutral-50/80 border border-neutral-100 relative">
              {/* Layered 3D Shield */}
              <div className="w-28 h-32 rounded-3xl bg-white shadow-[0_16px_35px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] border border-neutral-200/80 flex items-center justify-center relative [clip-path:polygon(50%_0%,100%_15%,100%_75%,50%_100%,0%_75%,0%_15%)] group-hover:scale-105 transition-transform duration-300">
                {/* Floating Core Lock Pill */}
                <div className="w-14 h-14 rounded-full bg-neutral-900 shadow-xl flex items-center justify-center text-white">
                  <Lock className="w-6 h-6 text-[#8be0b7]" />
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mb-3">
                Mobile-First &amp; Secure by Design
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Over 70% of customers browse from mobile phones. We build sub-second mobile-first architectures 
                with zero plugin vulnerabilities and enterprise HTTPS encryption from day one.
              </p>
            </div>
          </motion.div>

          {/* ============================================================
              CARD 4: Conversion & Growth (3D Chat Bubble & App Card)
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#ffffff] text-[#0a0b10] rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/90 flex flex-col justify-between group hover:shadow-[0_25px_60px_rgba(111,197,155,0.18)] transition-all duration-500 hover:-translate-y-1"
          >
            {/* Top Interactive Skeuomorphic Widget */}
            <div className="min-h-[170px] flex items-center justify-center gap-4 mb-8 p-6 rounded-2xl bg-neutral-50/80 border border-neutral-100 relative">
              {/* Floating Chat Bubble */}
              <div className="p-3.5 rounded-2xl bg-white shadow-[0_10px_20px_rgba(0,0,0,0.06)] border border-neutral-200 space-y-1.5 w-32 -translate-y-3">
                <div className="h-2 w-full bg-neutral-800 rounded-full" />
                <div className="h-2 w-4/5 bg-neutral-800 rounded-full" />
                <div className="h-2 w-1/2 bg-neutral-400 rounded-full" />
              </div>

              {/* Floating Device / Card Interface */}
              <div className="w-36 h-28 rounded-2xl bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)] border border-neutral-200 p-3 flex flex-col justify-between relative">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#6fc59b]" />
                  </div>
                  <div className="h-1.5 w-10 bg-neutral-200 rounded-full" />
                </div>

                <div className="h-10 w-full bg-neutral-100/90 rounded-xl" />

                {/* Floating Bottom Action Tag */}
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-neutral-900 shadow-md flex items-center justify-center text-[#8be0b7]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Bottom Content */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mb-3">
                Conversion-Focused &amp; Ready to Grow
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Every section has a single purpose — helping visitors understand, trust, and take action. 
                Your platform seamlessly scales as your business expands from a showcase to a complete ecosystem.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
