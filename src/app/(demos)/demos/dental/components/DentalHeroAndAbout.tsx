'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Cpu, HeartPulse } from 'lucide-react';

interface DentalHeroAndAboutProps {
  onOpenBooking?: () => void;
}

const PILLARS = [
  {
    icon: Cpu,
    title: 'Micro-Precision 3D Diagnostics',
    description: 'Ultra-low radiation 3D CBCT scans & digital intraoral optical impressioning for 0.01mm clinical precision.',
  },
  {
    icon: Sparkles,
    title: 'Painless Laser & Sedation Protocol',
    description: 'Minimally invasive hard & soft tissue laser treatments with calm, needle-free painless anesthesia options.',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime Outcome Warranty',
    description: 'We stand by every restoration, implant, and cosmetic transformation with comprehensive post-care guarantees.',
  },
];

const METRICS = [
  { value: '15+', label: 'Years of Excellence' },
  { value: '99.4%', label: 'Positive Outcomes' },
  { value: '25k+', label: 'Smiles Transformed' },
];

export function DentalHeroAndAbout({ onOpenBooking }: DentalHeroAndAboutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toothContainerRef = useRef<HTMLDivElement>(null);

  // Mouse hover tracking for tooth internal spotlight reveal
  const targetPos = useRef({ x: 50, y: 50, active: false });
  const currentPos = useRef({ x: 50, y: 50, radius: 0 });
  const animFrameId = useRef<number | null>(null);

  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({
    opacity: 0,
    WebkitMaskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
    maskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
  });

  // Scroll tracking across Hero + About container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 20,
    restDelta: 0.001,
  });

  // Responsive transforms for traveling tooth:
  // Progress 0.0 -> In Hero (Right side)
  // Progress 0.7-1.0 -> In About (Left side)
  const toothX = useTransform(smoothProgress, [0, 0.45, 0.9], ['28vw', '0vw', '-25vw']);
  const toothY = useTransform(smoothProgress, [0, 0.45, 0.9], ['50vh', '100vh', '160vh']);
  const toothRotate = useTransform(smoothProgress, [0, 0.45, 0.9], [15, 0, -12]);
  const toothScale = useTransform(smoothProgress, [0, 0.45, 0.9], [1, 1.05, 0.92]);

  const updateAnimation = useCallback(() => {
    const ease = 0.18;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

    const targetRadius = targetPos.current.active ? 180 : 0;
    currentPos.current.radius += (targetRadius - currentPos.current.radius) * 0.14;

    const rad = currentPos.current.radius;
    const x = currentPos.current.x.toFixed(2);
    const y = currentPos.current.y.toFixed(2);

    if (rad > 0.5) {
      const gradient = `radial-gradient(circle ${rad.toFixed(1)}px at ${x}% ${y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.3) 75%, transparent 100%)`;
      setMaskStyle({
        opacity: Math.min(1, rad / 30),
        WebkitMaskImage: gradient,
        maskImage: gradient,
        transition: 'opacity 0.2s ease',
      });
    } else {
      setMaskStyle({
        opacity: 0,
        WebkitMaskImage: 'none',
        maskImage: 'none',
      });
    }

    animFrameId.current = requestAnimationFrame(updateAnimation);
  }, []);

  useEffect(() => {
    animFrameId.current = requestAnimationFrame(updateAnimation);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [updateAnimation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!toothContainerRef.current) return;
    const rect = toothContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX >= rect.left - 40 &&
      clientX <= rect.right + 40 &&
      clientY >= rect.top - 40 &&
      clientY <= rect.bottom + 40
    ) {
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      targetPos.current = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        active: true,
      };
    } else {
      targetPos.current.active = false;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!toothContainerRef.current) return;
    const rect = toothContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    targetPos.current = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      active: true,
    };
  };

  const handleMouseLeave = () => {
    targetPos.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-visible select-none"
    >
      {/* ── Fixed Traveling 3D Tooth Layer ────────────────────── */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
        <motion.div
          style={{
            left: '50%',
            top: 0,
            x: toothX,
            y: toothY,
            rotate: toothRotate,
            scale: toothScale,
            translateX: '-50%',
            translateY: '-50%',
          }}
          className="absolute pointer-events-auto"
        >
          <div
            ref={toothContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex-shrink-0 w-[500px] xl:w-[580px] aspect-[1024/1536] cursor-crosshair group transition-transform duration-500 ease-out hover:scale-105"
          >
            {/* Base Layer: hero-1.png (Clear Crystal Tooth) */}
            <img
              src="/demos/dental/hero-1.png"
              alt="LUMIDENT 3D Crystal Tooth"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none animate-subtle-float"
            />

            {/* Reveal Layer: hero-2.png (Glowing Inner Pulp/Nerve Structure) */}
            <div
              style={maskStyle}
              className="absolute inset-0 w-full h-full pointer-events-none select-none animate-subtle-float z-10"
            >
              <img
                src="/demos/dental/hero-2.png"
                alt="LUMIDENT 3D Illuminated Internal Structure"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Subtle Interactive Radial Glow around cursor when hovering */}
            {targetPos.current.active && (
              <div
                className="absolute pointer-events-none rounded-full blur-xl transition-opacity duration-300 opacity-60 z-20"
                style={{
                  left: `${currentPos.current.x}%`,
                  top: `${currentPos.current.y}%`,
                  width: '220px',
                  height: '220px',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(5, 201, 137, 0.35) 0%, rgba(4, 179, 122, 0.15) 50%, transparent 80%)',
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Section 1: Hero Section (Exact 100vh) ──────────────── */}
      <section className="relative w-full h-screen min-h-[100dvh] max-h-[100dvh] bg-white flex flex-col justify-end overflow-hidden">
        
        {/* Mobile Static Tooth (for screens < 1024px) */}
        <div className="lg:hidden absolute top-20 right-4 sm:right-10 z-10 flex items-center justify-center">
          <div className="w-[220px] sm:w-[300px] aspect-[1024/1536] rotate-[15deg]">
            <img
              src="/demos/dental/hero-1.png"
              alt="LUMIDENT 3D Tooth"
              className="w-full h-full object-contain animate-subtle-float"
            />
          </div>
        </div>

        {/* Hero Left Content: Aligned Bottom */}
        <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 lg:pb-16 z-20 pointer-events-none">
          <div className="flex flex-col items-start gap-4 sm:gap-6 max-w-[680px] pointer-events-auto">
            
            {/* Primary Headline */}
            <h1 className="font-bold tracking-[-0.035em] text-[#111827] text-[42px] leading-[1.02] sm:text-[62px] sm:leading-[1.0] md:text-[76px] md:leading-[0.98] lg:text-[88px] lg:leading-[0.96] xl:text-[100px] xl:leading-[0.94]">
              <span className="block text-[#111827]">Exceptional</span>
              <span className="block mt-0.5">
                <span className="text-[#05c989]">Dental</span>{' '}
                <span className="text-[#111827]">Care</span>
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-slate-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal max-w-[460px]">
              With our team of experienced dentists and state-of-the-art technology, we deliver comprehensive treatments in a comfortable and welcoming environment.
            </p>

            {/* CTA Button: Book Now */}
            <button
              onClick={onOpenBooking}
              className="px-7 sm:px-8 py-3.5 rounded-full border border-slate-200 bg-white hover:border-[#05c989] hover:bg-slate-50 text-[#111827] hover:text-[#05c989] font-medium text-xs sm:text-sm lg:text-[14px] transition-all shadow-xs hover:shadow-md active:scale-95 flex items-center gap-2 cursor-pointer group"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </section>

      {/* ── Section 2: About Us Section (Text on Right, Tooth on Left) ── */}
      <section id="about" className="relative w-full min-h-screen bg-[#FAFCFE] py-24 sm:py-32 flex flex-col justify-center overflow-hidden border-t border-slate-100">
        
        {/* Background Soft Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-emerald-50/60 rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-2xl opacity-60" />
        </div>

        <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
            
            {/* Left Column: Landing Destination for Tooth on Desktop */}
            <div className="lg:col-span-6 flex items-center justify-center min-h-[340px] sm:min-h-[440px] lg:min-h-[560px] relative">
              {/* Visual Frame Badge / Backdrop Aura for the tooth */}
              <div className="relative w-full max-w-[420px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/40 via-blue-50/30 to-transparent border border-emerald-200/40 blur-xs flex items-center justify-center pointer-events-none">
                <div className="w-[80%] h-[80%] rounded-full bg-white/70 backdrop-blur-md shadow-xs border border-white" />
              </div>

              {/* Mobile Static Tooth for < 1024px */}
              <div className="lg:hidden absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] sm:w-[260px] aspect-[1024/1536] -rotate-[12deg]">
                  <img
                    src="/demos/dental/hero-1.png"
                    alt="LUMIDENT 3D Tooth"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Narrative, Pillars & CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start gap-6 sm:gap-8">
              
              {/* Section Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05c989]" />
                <span>ABOUT LUMIDENT CLINIC</span>
              </div>

              {/* Headline */}
              <h2 className="font-bold tracking-[-0.03em] text-[#111827] text-[34px] leading-[1.1] sm:text-[46px] sm:leading-[1.08] lg:text-[54px] lg:leading-[1.05]">
                Where Precision Engineering Meets{' '}
                <span className="text-[#05c989]">Artistic Dentistry</span>
              </h2>

              {/* Narrative Body */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-[16px] leading-relaxed font-normal">
                At LUMIDENT, we believe exceptional dental care begins with absolute clinical accountability. By combining state-of-the-art 3D imaging, microscope-assisted endodontics, and biocompatible restorations, we deliver transformations that look breathtaking and endure for a lifetime.
              </p>

              {/* Stacked Pillars: Icon Left + Title Right, No Background, No Desc */}
              <div className="flex flex-col gap-3.5 sm:gap-4 w-full pt-1">
                {PILLARS.map((pillar) => {
                  const IconComponent = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="flex items-center gap-3.5 sm:gap-4 group"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#05c989] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-[#111827] leading-snug">
                        {pillar.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Metrics Counter Strip */}
              <div className="w-full pt-4 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                {METRICS.map((metric) => (
                  <div key={metric.label}>
                    <div className="font-bold text-2xl sm:text-3xl text-[#111827] tracking-tight">
                      {metric.value}
                    </div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </section>
    </div>
  );
}
