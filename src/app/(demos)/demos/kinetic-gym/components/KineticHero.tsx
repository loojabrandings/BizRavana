'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Dumbbell } from 'lucide-react';
import Image from 'next/image';

interface KineticHeroProps {
  onOpenModal: (plan?: string) => void;
}

export function KineticHero({ onOpenModal }: KineticHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transformations
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textLeftY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const floatingCardY = useTransform(scrollYProgress, [0, 1], ['0%', '-45%']);
  const floatingCardRotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full flex flex-col justify-between pt-28 md:pt-32 pb-6 md:pb-12 overflow-hidden bg-[#0D0D0D]"
    >
      {/* Background Hero Image with Strong Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 pointer-events-none origin-top"
      >
        <div className="relative w-full h-[120%] -top-[10%]">
          {/* Athlete Fitness Image */}
          <Image
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000&auto=format&fit=crop"
            alt="Kinetic Gym Athlete"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.72] contrast-[1.12]"
          />

          {/* Moody Red & Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-[#0D0D0D]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/90 via-[#0D0D0D]/20 to-[#0D0D0D]/80" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E10600]/15 rounded-full blur-[140px] pointer-events-none" />
        </div>
      </motion.div>

      {/* Top Content Row: Left Headline + Right Floating Join Card */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-6 md:pt-12">
        {/* Left Side: "BUILD YOUR CONFIDENCE" */}
        <motion.div
          style={{ y: textLeftY }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-6 lg:col-span-5 flex flex-col gap-3"
        >
          <div className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] animate-pulse" />
            <span className="font-poppins text-xs uppercase tracking-[0.25em] text-[#E10600] font-semibold">
              Colombo's #1 Strength Arena
            </span>
          </div>

          <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide leading-none">
            BUILD YOUR CONFIDENCE
          </h2>

          <p className="font-poppins text-xs sm:text-sm lg:text-base text-[#9A9A9A] leading-relaxed max-w-md font-light">
            Transform your body with national champion coaches, imported Eleiko steel, and modern recovery pods in Colombo.
          </p>
        </motion.div>

        {/* Right Side: Floating "JOIN NOW" Card */}
        <motion.div
          style={{ y: floatingCardY, rotate: floatingCardRotate }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="md:col-span-6 lg:col-span-7 flex justify-start md:justify-end"
        >
          <div
            onClick={() => onOpenModal('Performance Plan')}
            className="group relative cursor-pointer p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 hover:border-[#E10600]/60 transition-all duration-500 shadow-2xl hover:shadow-[0_0_35px_rgba(225,6,0,0.35)] flex items-center gap-4 sm:gap-5"
          >
            {/* 3D Red Dumbbell Graphic Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#E10600] to-[#800000] flex items-center justify-center text-white shadow-lg shadow-[#E10600]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 -rotate-45" />
            </div>

            {/* CTA Label & Arrow */}
            <div className="flex flex-col pr-2">
              <span className="font-poppins text-[10px] sm:text-xs text-[#9A9A9A] uppercase tracking-widest">
                Start Today
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wider group-hover:text-[#E10600] transition-colors">
                  JOIN NOW
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#E10600] flex items-center justify-center text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Glowing Corner Indicator */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E10600] animate-ping" />
          </div>
        </motion.div>
      </div>

      {/* Massive Hero Bottom Title: "BUILD YOUR BODY" */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="relative z-10 w-full text-center mt-12 md:mt-20 px-2 select-none pointer-events-none"
      >
        <h1 className="font-bebas text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[180px] xl:text-[230px] 2xl:text-[260px] leading-[0.82] text-white tracking-tight uppercase drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
          BUILD YOUR BODY
        </h1>
      </motion.div>
    </section>
  );
}
