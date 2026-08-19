"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function WebDesignIntro() {
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-[#030305] border-y border-white/[0.04]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#6fc59b]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="wd-container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12 lg:space-y-16"
        >
          {/* Monospace Micro-Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-[#8be0b7] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>[ THE PHILOSOPHY ]</span>
          </div>

          {/* Large Editorial Statement */}
          <h2 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-black text-white tracking-tight leading-[1.08]">
            Your website is more than a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-white to-[#8be0b7]">
              digital brochure.
            </span>
          </h2>

          {/* Supporting Text with Generous Whitespace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 border-t border-white/[0.06]">
            <div className="md:col-span-6">
              <p className="text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed">
                It is where customers discover your business, explore what you offer, build trust, and decide whether to contact you.
              </p>
            </div>

            <div className="md:col-span-6">
              <p className="text-lg sm:text-xl text-neutral-400 font-normal leading-relaxed">
                That&apos;s why we build websites with both <span className="text-white font-semibold">design</span> and <span className="text-[#8be0b7] font-semibold">business goals</span> in mind.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
