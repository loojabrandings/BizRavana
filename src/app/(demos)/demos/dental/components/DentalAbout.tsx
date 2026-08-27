'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

interface DentalAboutProps {
  onOpenBooking?: () => void;
}

const PILLARS = [
  {
    icon: Cpu,
    title: 'Modern 3D Digital Scans',
  },
  {
    icon: Sparkles,
    title: 'Gentle & Pain-Free Treatments',
  },
  {
    icon: ShieldCheck,
    title: 'Highest Quality Materials & Care',
  },
];

const METRICS = [
  { value: '15+', label: 'Years in Colombo' },
  { value: '99.4%', label: 'Happy Patients' },
  { value: '25k+', label: 'Smiles Brightened' },
];

export function DentalAbout({ onOpenBooking }: DentalAboutProps) {
  const aboutRef = useRef<HTMLDivElement>(null);

  // Parallax for background glows and distinct section layer drift
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, restDelta: 0.001 });

  const glowY1 = useTransform(smoothProgress, [0, 1], [-140, 140]);
  const glowY2 = useTransform(smoothProgress, [0, 1], [140, -140]);
  const contentParallax = useTransform(smoothProgress, [0, 1], [80, -80]);
  const metricsParallax = useTransform(smoothProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={aboutRef}
      id="about"
      className="relative w-full min-h-screen bg-[#FAFCFE] py-20 sm:py-28 lg:py-36 flex flex-col justify-center overflow-hidden border-t border-slate-100 select-none"
    >
      {/* Background Soft Accent Glows with Prominent Parallax Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ y: glowY1 }}
          className="absolute top-1/4 left-10 w-[550px] h-[550px] bg-emerald-100/50 rounded-full blur-3xl opacity-75 will-change-transform"
        />
        <motion.div
          style={{ y: glowY2 }}
          className="absolute bottom-10 right-16 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-3xl opacity-70 will-change-transform"
        />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-20">
        {/* Main Grid: Left (Desktop Reserved Space for Traveling 3D Tooth) | Right (Text & Narrative) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
          
          {/* Left Column: Reserved Space for Traveling Tooth with Animated Aura (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 items-center justify-center lg:min-h-[560px] relative">
            {/* Visual Backdrop Aura with Soft Floating Pulse */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[440px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/40 via-blue-50/30 to-transparent border border-emerald-200/40 blur-xs flex items-center justify-center pointer-events-none"
            >
              <div className="w-[80%] h-[80%] rounded-full bg-white/70 backdrop-blur-md shadow-xs border border-white" />
            </motion.div>
          </div>

          {/* Right Column: Narrative, Pillars & CTAs with Smooth Parallax Drift */}
          <motion.div
            style={{ y: contentParallax }}
            className="col-span-1 lg:col-span-6 flex flex-col items-start gap-6 sm:gap-8 will-change-transform"
          >
            
            {/* Section Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wide"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#05c989]" />
              <span>ABOUT LUMIDENT SRI LANKA</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-bold tracking-[-0.03em] text-[#111827] text-[30px] leading-[1.12] sm:text-[42px] sm:leading-[1.08] lg:text-[54px] lg:leading-[1.05]"
            >
              World-Class Dentistry,<br />
              <span className="text-[#05c989]">Right Here in Colombo.</span>
            </motion.h2>

            {/* Narrative Body in Simple English */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-slate-600 text-xs sm:text-base lg:text-[16px] leading-relaxed font-normal"
            >
              At LUMIDENT, we make dental visits comfortable and stress-free. Whether you need a regular checkup, gentle teeth cleaning, or a complete smile makeover, our caring Sri Lankan dental specialists use the latest equipment to give you the best results.
            </motion.p>

            {/* Stacked Pillars: Staggered Entrance & Frosted Glass Hover Rows */}
            <div className="flex flex-col gap-3 sm:gap-3.5 w-full pt-1">
              {PILLARS.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.5,
                      delay: 0.22 + idx * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-xs hover:bg-white/85 hover:shadow-md hover:border-emerald-200/60 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#05c989] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#05c989] group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-2xs">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold text-sm sm:text-base lg:text-[17px] text-[#111827] group-hover:text-[#05c989] transition-colors tracking-tight leading-snug">
                      {pillar.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Key Metrics Counter Strip (Frosted Glass Container with Distinct Parallax & Pop-in Entrance) */}
            <motion.div
              style={{ y: metricsParallax }}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-10 p-5 sm:p-7 lg:p-8 rounded-3xl bg-white/65 backdrop-blur-2xl border border-white/90 shadow-lg w-full will-change-transform"
            >
              {METRICS.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.08 }}
                  className="flex flex-col"
                >
                  <span className="font-extrabold text-xl sm:text-3xl lg:text-4xl text-[#111827] tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                    {metric.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
