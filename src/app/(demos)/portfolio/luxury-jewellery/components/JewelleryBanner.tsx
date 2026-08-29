'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { JewelleryParticles } from './JewelleryParticles';

export function JewelleryBanner() {
  const bannerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start end', 'end start'],
  });

  // High-impact 3D scroll rotation and scaling for the solitaire ring
  const ringY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);
  const ringRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-25, 0, 25]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.85]);

  return (
    <section 
      ref={bannerRef}
      id="service" 
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#071713] text-[#F6EFE7] overflow-hidden border-y border-[#F6EFE7]/10"
    >
      {/* ── Ambient Floating Diamond Sparkles ────────────────────── */}
      <JewelleryParticles count={20} />

      {/* ── Ambient Glow Background Accents ──────────────────────── */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(198,160,95,0.25),_transparent_70%)] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Dramatic Diamond Ring Showcase with 3D Rotation & Orbit Parallax (30% Bigger) */}
        <div className="md:col-span-6 flex items-center justify-center">
          <motion.div 
            style={{ y: ringY, rotate: ringRotate, scale: ringScale }}
            className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] lg:w-[540px] lg:h-[540px]"
          >
            {/* Continuous Orbit Wobble Animation */}
            <motion.div
              animate={{ 
                y: [0, -14, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full relative"
            >
              <Image
                src="/demos/luxury-jewellery/featured/rings.webp"
                alt="Exclusive Solitaire Ring"
                fill
                unoptimized
                sizes="(max-width: 768px) 340px, 540px"
                className="object-contain drop-shadow-[0_24px_50px_rgba(198,160,95,0.6)]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Editorial Banner Copy with Masked Reveal & Interactive CTA */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <motion.span 
              animate={{ scale: [1, 1.4, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#C6A05F]" 
            />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-[#C6A05F] uppercase font-sans">
              Limited Time Only
            </span>
          </div>

          <h2 className="font-italiana text-3xl sm:text-5xl md:text-6xl text-[#F6EFE7] tracking-wider uppercase font-normal leading-tight">
            Exclusive Collection
          </h2>

          <p className="text-sm sm:text-base text-[#F6EFE7]/80 font-light font-sans max-w-lg leading-relaxed">
            Discover rare high-jewellery designs crafted with precision and uncompromised brilliance for those who value uniqueness.
          </p>

          <div className="pt-3">
            <motion.a
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              href="#collection"
              className="relative group overflow-hidden inline-flex items-center gap-3 px-9 py-4 rounded-xl bg-gradient-to-r from-[#dfbe82] via-[#C6A05F] to-[#9e7a3a] text-[#071713] font-bold text-xs sm:text-sm uppercase tracking-widest shadow-[0_8px_30px_rgba(198,160,95,0.45)] hover:shadow-[0_12px_40px_rgba(198,160,95,0.7)] transition-all duration-300"
            >
              {/* Shimmer Light Bar */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative z-10">Discover Now</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
            </motion.a>
          </div>
        </motion.div>

      </div>

    </section>
  );
}
