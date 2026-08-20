"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Palette, 
  Code2, 
  Rocket,
  ArrowRight,
  ArrowDown
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Discover & Scope",
    desc: "We learn about your business, goals, audience, and what your website needs to achieve.",
    icon: Search,
    timeline: "1–2 DAYS",
  },
  {
    num: "02",
    title: "Design & Style",
    desc: "We create a custom visual direction and structure your website around your brand and customers.",
    icon: Palette,
    timeline: "3–6 DAYS",
  },
  {
    num: "03",
    title: "Build & Code",
    desc: "We turn the approved design into a fast, responsive, production-ready website.",
    icon: Code2,
    timeline: "7–11 DAYS",
  },
  {
    num: "04",
    title: "Launch & Go Live",
    desc: "We test everything across devices, connect your essential tools, and get your website ready to go live.",
    icon: Rocket,
    timeline: "12–14 DAYS",
  },
];

export default function ArchitectureFlowDiagram() {
  return (
    <section id="solutions" className="py-24 relative bg-[#040406]">
      <div className="wd-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ SIMPLE PROCESS ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            From Idea to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-white">
              Launch.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            We keep the process simple, transparent, and focused on getting your business online without unnecessary complexity.
          </p>
        </div>

        {/* Horizontal timeline flow on desktop, vertical stack on mobile */}
        <div className="max-w-6xl mx-auto">
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
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="flex-1 w-full p-7 rounded-[32px] bg-[#0c0d12]/90 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 flex flex-col items-start text-left relative z-10 group backdrop-blur-md"
                  >
                    {/* Glowing Red-Orange Squircle Icon Block */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff5e3a] to-[#ff2a68] shadow-[0_8px_20px_rgba(255,94,58,0.35)] flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform duration-300">
                      <IconComp className="w-5 h-5 stroke-[2.5px]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-3">
                      {step.title}
                    </h3>

                    {/* Gradient Divider Line */}
                    <div className="w-full h-px bg-gradient-to-r from-white/15 via-white/5 to-transparent my-4" />

                    {/* Desc */}
                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-normal mb-8 text-left">
                      {step.desc}
                    </p>

                    {/* Bottom Row Footer (Timeline) */}
                    <div className="w-full flex items-center mt-auto pt-4 border-t border-white/[0.04]">
                      {/* Timeline Badge */}
                      <span className="px-3.5 py-1 rounded-full bg-white text-[#0a0b10] text-[9px] font-black tracking-widest uppercase select-none">
                        {step.timeline}
                      </span>
                    </div>
                  </motion.div>

                  {/* Glowing Arrow Connector (Centered Vertically) */}
                  {idx < 3 && (
                    <div className="flex items-center justify-center text-[#fd3a25] py-2 lg:py-0 px-0 lg:px-2 z-20 flex-shrink-0 lg:self-center">
                      {/* Desktop horizontal right arrow */}
                      <ArrowRight className="hidden lg:block w-6 h-6 text-[#fd3a25] stroke-[3px] drop-shadow-[0_0_8px_rgba(111,197,155,0.5)] animate-pulse" />
                      {/* Mobile vertical down arrow */}
                      <ArrowDown className="lg:hidden w-6 h-6 text-[#fd3a25] stroke-[3px] drop-shadow-[0_0_8px_rgba(111,197,155,0.5)] animate-pulse" />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
