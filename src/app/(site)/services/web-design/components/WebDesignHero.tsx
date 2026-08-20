"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function WebDesignHero() {
  return (
    <section className="relative min-h-[860px] pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[#000000] text-white">
      {/* Atmospheric Ambient Glow behind mockup */}
      <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-[#fd3a25]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="wd-container relative z-10">
        {/* Hero Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center pt-4">

          {/* Left Column: Core Headline, Copy & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-neutral-300 mb-8 backdrop-blur-md">
              <span className="text-[#fd3a25]">✦</span>
              <span>WEB DESIGN FOR SRI LANKAN BUSINESSES</span>
            </div>

            {/* Headline */}
            <div className="relative mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.6rem] font-extrabold tracking-tight text-white leading-[1.05]">
                Your Business Deserves <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#ff6b57]">
                  More Than
                </span>{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a7a] via-[#fd3a25] to-[#c72515]">
                  a Facebook Page.
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-lg font-normal leading-relaxed mb-10">
              We build fast, modern websites for Sri Lankan businesses that want to look professional, reach more customers, and turn visitors into real enquiries.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#d42c1a] hover:from-[#ff8a7a] hover:to-[#e8321e] text-white text-sm font-black shadow-[0_10px_35px_rgba(253, 58, 37, 0.4)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Get a Free Website Consultation →</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#showcase"
                className="px-7 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-sm font-semibold transition-all"
              >
                View Our Work
              </a>
            </div>

            {/* Small Trust Line */}
            <p className="text-[11px] sm:text-xs font-mono text-neutral-400 mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 leading-none">
              <span>Mobile-first</span>
              <span className="text-[#fd3a25]/50 font-sans">•</span>
              <span>SEO-friendly</span>
              <span className="text-[#fd3a25]/50 font-sans">•</span>
              <span>Built for your business</span>
            </p>
          </div>

          {/* Right Column: CafeVibe Desktop & Mobile Mockup (Further Enlarged & Animated) */}
          <div className="lg:col-span-7 flex flex-col justify-center pt-12 lg:pt-0 z-10 w-full">
            {/* Desktop Mockup (Browser Frame) - Floating Loop */}
            <motion.div
              animate={{ 
                y: [0, -10, 0] 
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-lg mx-auto lg:max-w-none pr-16 sm:pr-24"
            >
              {/* Browser frame container with hover lift */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-2 backdrop-blur-xl shadow-2xl relative z-10"
              >
                {/* Browser address/top bar */}
                <div className="flex items-center gap-1.5 px-3 pb-2 border-b border-white/[0.06] mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <div className="h-4 px-3 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[8px] font-mono text-neutral-500 mx-auto w-32 text-center overflow-hidden">
                    artofframes.lk
                  </div>
                </div>

                {/* Browser viewport */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/5 bg-neutral-900">
                  <Image
                    src="/images/web-design/artofframes-preview.png"
                    alt="Art of Frames Desktop Mockup"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>

              {/* Mobile Mockup (Overlapping Phone Frame) - Independent Floating Parallax Drift */}
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  x: [0, -4, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-6 -right-2 sm:-right-6 w-[155px] sm:w-[190px] aspect-[9/19] rounded-[24px] border-[5px] border-[#1c1d22] bg-[#0c0d12] shadow-[0_25px_50px_rgba(0,0,0,0.7)] p-1 overflow-hidden z-20 flex flex-col"
              >
                {/* Mobile screen */}
                <div className="rounded-[18px] overflow-hidden w-full h-full relative border border-white/5 bg-[#000000]">
                  {/* Camera Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-black rounded-full z-30" />
                  <Image
                    src="/images/web-design/artofframes-mobile.png"
                    alt="Art of Frames Mobile Mockup"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Badge under mockup */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex justify-center lg:justify-start lg:pl-4"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[9px] sm:text-[10px] font-mono font-bold text-neutral-400 tracking-widest uppercase shadow-md backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fd3a25]" />
                <span>Built by BizRavana</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
