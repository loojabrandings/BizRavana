"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const BENEFITS = [
  {
    number: "01",
    title: "Build Trust",
    description: "Give your business a professional online presence that makes a strong first impression.",
  },
  {
    number: "02",
    title: "Get More Enquiries",
    description: "Make it easy for customers to contact you through WhatsApp, forms, calls, and social channels.",
  },
  {
    number: "03",
    title: "Ready to Grow",
    description: "Start with what your business needs today and build on it as you grow.",
  },
];

export default function WebDesignBenefits() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#030305] border-y border-white/[0.04]">
      {/* Subtle background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#fd3a25]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-24"
          >
            <div className="wd-badge-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ MORE THAN A WEBSITE ]</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Website Should <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-white">
                Work for Your Business.
              </span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              A good website doesn&apos;t just look impressive. It helps customers understand what you offer, trust your brand, and take the next step — whether that&apos;s sending a WhatsApp message, making an enquiry, or visiting your business.
            </p>
          </motion.div>

          {/* Right Column: 3 Stacked Cards */}
          <div className="lg:col-span-7 space-y-4">
            {BENEFITS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ scale: 1.01 }}
                className="wd-glass-card p-5 sm:p-6 lg:p-8 flex gap-4 sm:gap-5 lg:gap-6 items-start transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02]"
              >
                {/* Number tag */}
                <span className="font-mono text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] to-[#d42c1a] select-none flex-shrink-0 mt-0.5">
                  {item.number}
                </span>

                {/* Card copy */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    {item.description}
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
