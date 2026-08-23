'use client';

import React, { useRef } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, Compass } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PILLARS = [
  {
    icon: Leaf,
    title: '100% Organic',
    subtitle: 'Zero synthetic blends',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime Quality',
    subtitle: 'Reinforced selvedge seams',
  },
  {
    icon: Compass,
    title: 'Local Craft',
    subtitle: 'Artisanal atelier in SL',
  },
];

export function ClothingManifestoBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll Parallax Hooks (No mouse interactions)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const yCard = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25]);
  const yVideo = useTransform(scrollYProgress, [0, 0.5, 1], [35, 0, -35]);
  const scaleVideo = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1.04, 0.98]);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14 sm:pt-4 sm:pb-18 select-none font-lexend bg-white text-[#120F1D] overflow-hidden"
    >
      
      {/* ── Architectural Manifesto Banner Card Wrapper ───── */}
      <motion.div
        style={{ y: yCard }}
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full overflow-visible grid grid-cols-1 lg:grid-cols-12 items-center will-change-transform mt-2 sm:mt-4"
      >
        {/* ── Independent Background Card Layer with 25% Right-Side Fadeout ── */}
        <div 
          style={{ 
            maskImage: 'linear-gradient(to right, black 25%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.15) 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 25%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.15) 88%, transparent 100%)',
          }}
          className="absolute inset-0 z-0 rounded-3xl sm:rounded-[2.8rem] bg-[#F5F3FF] border border-[#E9E4FC] shadow-[0_20px_50px_rgba(131,98,244,0.06)] overflow-hidden pointer-events-none"
        >
          {/* Subtle Decorative Ambient Background Blobs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#E8DEFE]/50 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#EAA4BB]/20 blur-3xl" />
        </div>

        {/* ── Left Column: Statement & Brand Pillars (z-10) ────────── */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4 z-10 text-left p-6 sm:p-10 lg:py-8 lg:px-10 xl:py-9 xl:px-12 relative">
          
          <div>
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#8362F4]/10 text-[#8362F4] text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-[#8362F4]/20">
              <Sparkles className="w-3 h-3 fill-[#8362F4]" />
              <span>Manifesto • Edition 04</span>
            </div>

            {/* Giant Statement Title in Righteous */}
            <h2 className="font-righteous text-2xl sm:text-3xl lg:text-4xl text-[#120F1D] uppercase tracking-tight leading-[1.08] mb-2.5">
              We Do Not Follow Trends. <br />
              <span className="text-[#8362F4]">We Define The Silhouette.</span>
            </h2>

            {/* Subtitle / Philosophy Description */}
            <p className="font-lexend text-xs sm:text-[13px] text-neutral-600 leading-relaxed max-w-xl">
              Crafted at the intersection of raw sustainable materials and avant-garde luxury architecture. Every piece is an intentional extension of individuality, uncompromising form, and timeless expression.
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-xs border border-white rounded-2xl p-3 flex flex-col gap-0.5 shadow-xs transition-transform hover:-translate-y-0.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#8362F4]/10 flex items-center justify-center text-[#8362F4] mb-1">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-righteous text-xs text-[#120F1D] tracking-tight">
                    {pillar.title}
                  </span>
                  <span className="font-lexend text-[10px] text-neutral-500">
                    {pillar.subtitle}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action CTA */}
          <div className="pt-1 flex items-center gap-4 flex-wrap">
            <a
              href="#collections"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#120F1D] hover:bg-[#8362F4] text-white text-xs sm:text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group"
            >
              <span>Explore Atelier Archive</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

        </div>

        {/* ── Right Column: Upper Layer Floating Video (z-30, Completely Free of Card Masking) ──── */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center z-30 overflow-visible p-0 m-0">
          <motion.div
            style={{ y: yVideo, scale: scaleVideo }}
            className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] h-[440px] sm:h-[500px] lg:h-[560px] -my-8 sm:-my-12 lg:-my-16 flex items-center justify-center will-change-transform overflow-visible"
          >
            {/* Multi-Stop Linear Fadeout Mask on the Video itself only */}
            <div 
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.6) 16%, rgba(0,0,0,0.95) 26%, black 35%, black 65%, rgba(0,0,0,0.95) 74%, rgba(0,0,0,0.6) 84%, rgba(0,0,0,0.15) 94%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.6) 16%, rgba(0,0,0,0.95) 26%, black 35%, black 65%, rgba(0,0,0,0.95) 74%, rgba(0,0,0,0.6) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.6) 16%, rgba(0,0,0,0.95) 26%, black 35%, black 65%, rgba(0,0,0,0.95) 74%, rgba(0,0,0,0.6) 84%, rgba(0,0,0,0.15) 94%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.6) 16%, rgba(0,0,0,0.95) 26%, black 35%, black 65%, rgba(0,0,0,0.95) 74%, rgba(0,0,0,0.6) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskComposite: 'destination-in',
              }}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
            >
              <video
                src="/demos/clothing/category-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover block mx-auto transition-transform duration-700 hover:scale-105"
              />
            </div>
          </motion.div>
        </div>

      </motion.div>

    </section>
  );
}
