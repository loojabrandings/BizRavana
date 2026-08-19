"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

export default function FinalLeadBooking() {
  return (
    <section className="py-28 lg:py-36 relative bg-[#040406] overflow-hidden text-center">
      {/* Seamless Ambient Radial Energy Flare in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-r from-[#6fc59b]/15 via-[#429e71]/20 to-[#8be0b7]/15 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#6fc59b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.06] pointer-events-none" />

      <div className="wd-container max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-3xl mx-auto"
        >
          {/* Live Operational Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#6fc59b]/30 text-xs font-mono text-[#8be0b7] mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(111,197,155,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6fc59b] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6fc59b]" />
            </span>
            <span className="font-semibold tracking-wide">SYSTEM ACTIVE &bull; ACCEPTING NEW PROJECTS</span>
          </div>

          {/* Giant Futuristic Headline — Open & Borderless */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.06] mb-6">
            Ready to Upgrade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#9ef0c7] to-[#6fc59b] drop-shadow-[0_0_35px_rgba(111,197,155,0.35)]">
              Your Digital Presence?
            </span>
          </h2>

          {/* Sub-copy */}
          <p className="text-base sm:text-xl text-neutral-300 font-normal leading-relaxed mb-10 max-w-xl">
            Turn your business into a high-speed, modern customer magnet. We handle design, engineering, and deployment from start to finish.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            {/* Primary Glowing Action Button */}
            <a
              href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20am%20ready%20to%20build%20a%20modern%20website%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 px-9 py-4 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#43a172] hover:from-[#9ef0c7] hover:to-[#5eb989] text-[#050907] font-black text-sm tracking-wide shadow-[0_0_35px_rgba(111,197,155,0.45)] hover:shadow-[0_0_50px_rgba(111,197,155,0.65)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group/btn"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>

            {/* Secondary Hotline Button */}
            <a
              href="tel:+94750350109"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-[#6fc59b]/40 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg"
            >
              <Phone className="w-4 h-4 text-[#8be0b7]" />
              <span className="font-mono text-xs sm:text-sm">0750 350 109</span>
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
