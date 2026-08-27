"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Palette,
  Smartphone,
  MessageSquare,
  Search,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const LEFT_FEATURES = [
  {
    title: "Custom Design",
    desc: "A website designed around your brand, products, customers, and business goals — not a recycled template.",
    icon: Palette,
  },
  {
    title: "Mobile First",
    desc: "A seamless experience across phones, tablets, and desktops, because your customers are already browsing on mobile.",
    icon: Smartphone,
  },
  {
    title: "WhatsApp Integration",
    desc: "Make it easy for customers to reach you with one tap and turn website visitors into real conversations.",
    icon: MessageSquare,
  },
];

const RIGHT_FEATURES = [
  {
    title: "SEO Ready",
    desc: "A clean technical foundation and structured content that helps search engines understand your business.",
    icon: Search,
  },
  {
    title: "Fast & Secure",
    desc: "Built for speed, reliability, and a smooth experience without unnecessary bloat.",
    icon: Zap,
  },
  {
    title: "Easy to Grow",
    desc: "Start with what you need today and have a website that can evolve as your business grows.",
    icon: TrendingUp,
  },
];

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  side: "left" | "right";
  idx: number;
}

function FeatureCard({ title, desc, icon: Icon, idx }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: idx * 0.07 }}
      className="bg-[#0C0C0C] border-2 border-[#D7E2EA]/30 hover:border-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 flex flex-col justify-between h-[180px] sm:h-[190px] w-full group transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:-translate-y-1.5 cursor-pointer"
    >
      {/* Top Header: Icon + Title */}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#ff6b57] to-[#fd3a25] shadow-[0_6px_16px_rgba(253,58,37,0.3)] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-[18px] h-[18px] stroke-[2.2px]" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold font-kanit uppercase text-white group-hover:text-[#ff8a7a] transition-colors tracking-tight leading-snug">
            {title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light mt-auto">
        {desc}
      </p>
    </motion.div>
  );
}

export default function TechOrbitHub() {
  return (
    <section id="features" className="py-28 relative overflow-hidden bg-[#0C0C0C] border-t border-white/[0.06]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#fd3a25]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="wd-badge-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ BUILT AROUND YOUR BUSINESS ]</span>
          </div>

          <h2
            className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6 px-2"
            style={{ fontSize: "clamp(2.2rem, 7vw, 90px)" }}
          >
            ARCHITECTURE
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base font-kanit max-w-xl mx-auto leading-relaxed">
            Every website is built around your business — with the essential tools, speed, and funnels your customers need to trust and buy.
          </p>
        </div>

        {/* Hub-and-Spoke Layout — Desktop */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] gap-0 items-center max-w-[1100px] mx-auto relative">

          {/* Left Column Cards */}
          <div className="flex flex-col gap-5 pr-6">
            {LEFT_FEATURES.map((feat, idx) => (
              <FeatureCard key={idx} title={feat.title} desc={feat.desc} icon={feat.icon} side="left" idx={idx} />
            ))}
          </div>

          {/* Center Hub with SVG connecting lines */}
          <div className="relative flex items-center justify-center w-[260px] shrink-0">
            {/* SVG Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="50%" y1="50%" x2="0%" y2="16.7%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="0%" y2="50%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="0%" y2="83.3%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="100%" y2="16.7%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="100%" y2="83.3%" stroke="rgba(253, 58, 37, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Center Logo Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative z-10 w-[140px] h-[140px] rounded-[32px] bg-gradient-to-br from-[#fd3a25] via-[#d42c1a] to-[#b31f10] shadow-[0_0_60px_rgba(253,58,37,0.45),0_0_120px_rgba(253,58,37,0.2)] flex flex-col items-center justify-center gap-3 border-2 border-white/20"
            >
              {/* Ambient inner glow */}
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <Image
                src="/images/bizravana-crown-white.png"
                alt="BizRavana"
                width={60}
                height={60}
                className="object-contain relative z-10 drop-shadow-lg"
              />
              <span className="text-white text-[11px] font-bold font-kanit tracking-widest uppercase relative z-10">
                BizRavana
              </span>
            </motion.div>
          </div>

          {/* Right Column Cards */}
          <div className="flex flex-col gap-5 pl-6">
            {RIGHT_FEATURES.map((feat, idx) => (
              <FeatureCard key={idx} title={feat.title} desc={feat.desc} icon={feat.icon} side="right" idx={idx + 3} />
            ))}
          </div>
        </div>

        {/* Mobile fallback */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-[110px] h-[110px] rounded-[28px] bg-gradient-to-br from-[#fd3a25] via-[#d42c1a] to-[#b31f10] shadow-[0_0_40px_rgba(253,58,37,0.35)] flex flex-col items-center justify-center gap-2 border border-white/20"
            >
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <Image
                src="/images/bizravana-crown-white.png"
                alt="BizRavana"
                width={44}
                height={44}
                className="object-contain drop-shadow-lg relative z-10"
              />
              <span className="text-white text-[10px] font-bold font-kanit tracking-widest uppercase relative z-10">
                BizRavana
              </span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...LEFT_FEATURES, ...RIGHT_FEATURES].map((feat, idx) => (
              <FeatureCard key={idx} title={feat.title} desc={feat.desc} icon={feat.icon} side="left" idx={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
