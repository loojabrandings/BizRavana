"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Zap, Award } from "lucide-react";

const STATS = [
  {
    value: "230K+",
    unit: "USD In Revenue Driven",
    sub: "Directly attributed to high-conversion redesigns",
    icon: TrendingUp,
  },
  {
    value: "0.78s",
    unit: "Average LCP Speed",
    sub: "Benchmarked on Sri Lanka 4G mobile networks",
    icon: Zap,
  },
  {
    value: "14 Days",
    unit: "Average Sprint Velocity",
    sub: "From finalized Figma blueprint to live deployment",
    icon: Clock,
  },
  {
    value: "99.8%",
    unit: "Client Satisfaction",
    sub: "Based on 120+ custom web engineering projects",
    icon: Award,
  },
];

export default function ImpactCounterSection() {
  return (
    <section className="py-28 relative bg-[#040406] border-y border-white/[0.06]">
      <div className="wd-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {STATS.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-2 text-[#6fc59b] mb-3">
                  <IconComp className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    VERIFIED METRIC
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-neutral-200 mb-1">
                  {stat.unit}
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {stat.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
