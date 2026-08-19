"use client";

import { motion } from "framer-motion";

const TECH_ITEMS = [
  { name: "Next.js 15", category: "Engine Framework" },
  { name: "Tailwind CSS", category: "Design System" },
  { name: "Supabase", category: "Database & Auth" },
  { name: "PayHere & MintPay", category: "LK Payment Gateways" },
  { name: "WhatsApp Business API", category: "Direct Lead CRM" },
  { name: "Cloudflare Edge", category: "Sub-second CDN" },
  { name: "Framer Motion", category: "Interactive Physics" },
  { name: "Figma Bespoke UI", category: "Architectural Design" },
];

export default function TechEcosystemMarquee() {
  return (
    <section className="py-12 border-y border-white/[0.06] bg-[#08090d]/60 relative overflow-hidden">
      <div className="wd-container mb-6 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          POWERING SRI LANKA&apos;S HIGHEST CONVERTING DIGITAL EXPERIENCES
        </span>
      </div>

      <div className="flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="flex items-center gap-6 whitespace-nowrap min-w-full flex-shrink-0"
        >
          {[...TECH_ITEMS, ...TECH_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#6fc59b]/40 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fc59b] shadow-[0_0_6px_#6fc59b]" />
              <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
              <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-white/[0.04]">
                {item.category}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
