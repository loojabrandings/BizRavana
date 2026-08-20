"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function WebDesignHero() {
  return (
    <section className="relative min-h-[860px] pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[#000000] text-white">
      {/* Bioluminescent BizRavana Emerald Jellyfish Asset in Center/Right Background */}
      <div className="absolute top-0 right-0 sm:right-10 lg:right-28 w-[450px] sm:w-[600px] lg:w-[760px] h-[550px] sm:h-[720px] lg:h-[880px] pointer-events-none select-none z-0">
        <Image
          src="/images/web-design/emerald-jellyfish.jpg"
          alt="Bioluminescent BizRavana Emerald Jellyfish"
          fill
          priority
          className="object-contain opacity-90 mix-blend-screen"
        />
      </div>

      {/* Atmospheric Ambient Glow behind Jellyfish */}
      <div className="absolute top-20 right-10 w-[520px] h-[520px] bg-[#6fc59b]/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="wd-container relative z-10">
        {/* Temporary Launch Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl border border-[#6fc59b]/25 bg-gradient-to-r from-[#0d1612]/95 to-[#08090d]/95 backdrop-blur-md relative overflow-hidden max-w-4xl"
        >
          {/* Ambient glow inside */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6fc59b]/10 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-2 w-2 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8be0b7] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6fc59b]"></span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Launch Offer: 25% Off Web Design Projects
                </p>
                <p className="text-[11px] text-neutral-400">
                  Introductory rates for the first 10 clients. Lock in your slot.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 flex-shrink-0 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="text-left font-mono">
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Booked Status</span>
                  <span className="text-base font-black text-white">6<span className="text-neutral-500 font-normal">/10</span></span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#6fc59b]/15 border border-[#6fc59b]/30 text-xs font-black font-mono text-[#8be0b7] animate-pulse shadow-[0_0_15px_rgba(111,197,155,0.2)]">
                  🔥 4 SLOTS LEFT!
                </div>
              </div>
              <a
                href="#pricing"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#6fc59b]/35 hover:scale-[1.03] transition-all flex-shrink-0"
              >
                Claim Offer
              </a>
            </div>
          </div>
        </motion.div>

        {/* Hero Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-end pt-4">
          
          {/* Left Column: Core Headline, Copy & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-neutral-300 mb-8 backdrop-blur-md">
              <span className="text-[#6fc59b]">✦</span>
              <span>Modern Web Agency</span>
            </div>

            {/* Headline */}
            <div className="relative mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.6rem] font-extrabold tracking-tight text-white leading-[1.05]">
                Websites That Make <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#8be0b7]">
                  Your Business
                </span>{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9ef0c7] via-[#6fc59b] to-[#3a996c]">
                  Stand Out.
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-lg font-normal leading-relaxed mb-10">
              We design and build modern, fast, mobile-first websites that turn your online visitors into real customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] hover:from-[#9ef0c7] hover:to-[#5eb989] text-[#08090d] text-sm font-black shadow-[0_10px_35px_rgba(111,197,155,0.45)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#showcase"
                className="px-7 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-sm font-semibold transition-all"
              >
                View Our Work
              </a>
            </div>
          </div>

          {/* Right Column: 3 Glass Metric Cards Bottom-Aligned */}
          <div className="lg:col-span-5 flex flex-col justify-end h-full pt-8 lg:pt-32">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 w-full"
            >
              {/* Metric Card 1 */}
              <div className="p-4 rounded-2xl bg-[#0c0d12]/85 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between h-32 hover:border-[#6fc59b]/40 transition-all">
                <span className="text-xs text-neutral-400">Happy Clients</span>
                <div className="mt-auto">
                  <span className="text-2xl font-black text-white">120+</span>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-1">
                    Across LK &amp; Global.
                  </p>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="p-4 rounded-2xl bg-[#0c0d12]/85 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between h-32 hover:border-[#6fc59b]/40 transition-all">
                <span className="text-xs text-neutral-400">ROI Improvement</span>
                <div className="mt-auto">
                  <div className="text-2xl font-black text-white">95%</div>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-1">
                    Better ROI in month 1.
                  </p>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div className="p-4 rounded-2xl bg-[#08140f]/90 border border-[#6fc59b]/30 backdrop-blur-xl flex flex-col justify-between h-32 relative overflow-hidden hover:border-[#6fc59b]/60 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#6fc59b]/20 rounded-full blur-xl" />
                <span className="text-xs text-neutral-400">Client Retention</span>
                <div className="mt-auto relative z-10">
                  <div className="text-2xl font-black text-white">88%</div>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-1">
                    Multi-project clients.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
