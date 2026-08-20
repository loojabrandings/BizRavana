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
      className="bg-white hover:bg-neutral-50 border border-neutral-200/60 rounded-[22px] p-5 xl:p-6 flex flex-col gap-3 group transition-all duration-300 shadow-sm"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-[13px] bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0 transition-all duration-300">
        <Icon className="w-[18px] h-[18px] stroke-[2px]" />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-[15px] xl:text-[16px] font-bold text-neutral-900 tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-neutral-500 text-[12px] xl:text-[13px] leading-relaxed font-normal">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function TechOrbitHub() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#040406]">
      <div className="wd-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ BUILT AROUND YOUR BUSINESS ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Everything Your Business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-white">
              Needs to Get Online.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-2">
            Every website is built around your business — with the essential tools, integrations, and experiences your customers need to discover, trust, and contact you.
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
              {/* Left side lines — 3 horizontal from center to left cards */}
              {/* These use percentage-based positioning relative to card centers */}
              {/* Top-left line */}
              <line x1="50%" y1="50%" x2="0%" y2="16.7%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Mid-left line */}
              <line x1="50%" y1="50%" x2="0%" y2="50%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Bottom-left line */}
              <line x1="50%" y1="50%" x2="0%" y2="83.3%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Top-right line */}
              <line x1="50%" y1="50%" x2="100%" y2="16.7%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Mid-right line */}
              <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Bottom-right line */}
              <line x1="50%" y1="50%" x2="100%" y2="83.3%" stroke="rgba(253, 58, 37, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Center Logo Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative z-10 w-[140px] h-[140px] rounded-[30px] bg-gradient-to-br from-[#fd3a25] via-[#d42c1a] to-[#b31f10] shadow-[0_0_60px_rgba(253, 58, 37, 0.4),0_0_120px_rgba(253, 58, 37, 0.18)] flex flex-col items-center justify-center gap-3"
            >
              {/* Ambient inner glow */}
              <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <Image
                src="/images/bizravana-crown-white.png"
                alt="BizRavana"
                width={60}
                height={60}
                className="object-contain relative z-10 drop-shadow-lg"
              />
              <span className="text-white/90 text-[11px] font-bold font-mono tracking-widest uppercase relative z-10">
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

        {/* Mobile fallback — brand badge at top, then 2-col card grid */}
        <div className="lg:hidden">
          {/* Mobile center brand badge — shown at top */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-[110px] h-[110px] rounded-[26px] bg-gradient-to-br from-[#fd3a25] via-[#d42c1a] to-[#b31f10] shadow-[0_0_40px_rgba(253,58,37,0.35)] flex flex-col items-center justify-center gap-2"
            >
              <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <Image
                src="/images/bizravana-crown-white.png"
                alt="BizRavana"
                width={44}
                height={44}
                className="object-contain drop-shadow-lg relative z-10"
              />
              <span className="text-white/90 text-[10px] font-bold font-mono tracking-widest uppercase relative z-10">
                BizRavana
              </span>
            </motion.div>
          </div>

          {/* Feature cards grid */}
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
