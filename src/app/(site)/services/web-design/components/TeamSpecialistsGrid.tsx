"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Terminal, Palette } from "lucide-react";

const SPECIALISTS = [
  {
    role: "Lead UI/UX Architect",
    focus: "Conversion Psychology & Design Systems",
    icon: Palette,
    badge: "EX-ENTERPRISE",
    description: "Designs wireframes and visual systems optimized to turn Sri Lankan and global visitors into paying clients.",
  },
  {
    role: "Principal Full-Stack Engineer",
    focus: "Next.js 15, APIs & Edge Architecture",
    icon: Terminal,
    badge: "REACT & NEXT.JS SPECIALIST",
    description: "Builds clean, modular, sub-second codebases with zero bloat and seamless third-party API connectivity.",
  },
  {
    role: "Performance & Security Lead",
    focus: "PayHere, MintPay & Core Web Vitals",
    icon: Shield,
    badge: "100/100 LIGHTHOUSE",
    description: "Hardens security, optimizes image CDNs, and integrates local payment gateways with bank-grade reliability.",
  },
];

export default function TeamSpecialistsGrid() {
  return (
    <section className="py-24 sm:py-28 relative bg-[#060608]">
      <div className="wd-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="wd-badge-mono mb-4">
              <span className="wd-dot-pulse" />
              <span>[ ELITE CRAFTSMANSHIP ]</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Direct Access to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
                Senior Web Specialists.
              </span>
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
            No inexperienced interns or outsourced middlemen. You work directly with battle-tested senior engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SPECIALISTS.map((spec, idx) => {
            const IconComp = spec.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="wd-glass-card p-8 sm:p-9 border-white/[0.08] hover:border-[#6fc59b]/40 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#8be0b7] group-hover:bg-[#6fc59b] group-hover:text-[#08090d] transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[#6fc59b]/10 text-[#8be0b7] border border-[#6fc59b]/20">
                      {spec.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-1.5 group-hover:text-[#8be0b7] transition-colors">
                    {spec.role}
                  </h3>
                  <div className="text-xs font-mono text-neutral-400 mb-4">
                    {spec.focus}
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                    {spec.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span>Dedicated Sprint Allocation</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
