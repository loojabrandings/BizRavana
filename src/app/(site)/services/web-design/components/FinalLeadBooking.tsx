"use client";

import { motion } from "framer-motion";
import { MessageSquare, PhoneCall, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function FinalLeadBooking() {
  return (
    <section className="py-24 relative bg-[#040406]">
      <div className="wd-container max-w-5xl mx-auto">
        {/* High-Contrast Final CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="wd-glass-card border-[#6fc59b]/30 p-8 sm:p-14 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#071a10] via-[#0a140f] to-[#08090d] text-center"
        >
          {/* Subtle glowing ambient orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#6fc59b]/15 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="max-w-2xl mx-auto flex flex-col items-center">
            {/* Monospace Badge */}
            <div className="wd-badge-mono mb-6">
              <span className="wd-dot-pulse" />
              <span>[ GET STARTED TODAY ]</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Ready to Build <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
                Your Website?
              </span>
            </h2>

            {/* Text */}
            <p className="text-base sm:text-xl text-neutral-300 font-normal leading-relaxed mb-8 max-w-lg">
              Let&apos;s turn your business into a better online experience.
            </p>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full sm:w-auto">
              <a
                href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20am%20ready%20to%20start%20my%20website%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] font-black text-sm tracking-wide shadow-[0_10px_35px_rgba(111,197,155,0.45)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:+94750350109"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#8be0b7]" />
                <span>0750 350 109</span>
              </a>
            </div>

            {/* Supporting Text */}
            <div className="pt-6 border-t border-white/[0.08] max-w-lg text-xs sm:text-sm text-neutral-400 font-mono leading-relaxed">
              Not sure which package is right for you? Talk to us and we&apos;ll recommend one based on your business.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
