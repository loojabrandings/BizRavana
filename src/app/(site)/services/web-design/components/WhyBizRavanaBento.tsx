"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const POINTS = [
  {
    num: "01",
    title: "Custom, Not Cookie-Cutter",
    desc: "Every website is engineered around your specific brand and audience, with zero bloated templates.",
  },
  {
    num: "02",
    title: "Mobile-First Velocity",
    desc: "Sub-second speed across mobile devices where over 80% of your real customers browse.",
  },
  {
    num: "03",
    title: "Conversion-Obsessed Architecture",
    desc: "From 1-click WhatsApp checkout funnels to fast forms, every detail is engineered to convert visitors.",
  },
  {
    num: "04",
    title: "Dedicated Direct Engineering Support",
    desc: "You collaborate directly with the engineers crafting your site, from discovery to post-launch growth.",
  },
];

export default function WhyBizRavanaBento() {
  return (
    <section id="why-us" className="py-28 relative bg-[#0C0C0C] border-t border-white/[0.06]">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[300px] bg-[#fd3a25]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <div className="wd-badge-mono mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ THE BIZRAVANA ADVANTAGE ]</span>
            </div>

            <h2
              className="font-kanit font-black uppercase text-white tracking-tight leading-none mb-8 select-none"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              WHY <br />
              <span className="hero-heading">BIZRAVANA.</span>
            </h2>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold font-kanit text-white uppercase tracking-wider">
                Engineered For Measurable Growth
              </h3>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-light font-kanit max-w-sm">
                We don&apos;t just build websites that look pretty. We create high-performance digital engines that build trust, capture leads, and scale your brand.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Feature Rows */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {POINTS.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 sm:p-7 rounded-[28px] sm:rounded-[36px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/20 hover:border-white/40 transition-all duration-300 flex items-start gap-5 group shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              >
                {/* Circular Check Badge */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#fd3a25]/15 border border-[#fd3a25]/30 text-[#ff8a7a] group-hover:scale-110 transition-transform">
                  <Check className="w-4 h-4 stroke-[3px]" />
                </div>

                {/* Content Block */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base sm:text-lg font-bold font-kanit uppercase tracking-tight text-white group-hover:text-[#ff8a7a] transition-colors">
                      {point.title}
                    </h4>
                    <span className="text-xs font-mono font-bold text-neutral-600">
                      {point.num}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
