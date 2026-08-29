'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, MoveHorizontal, CheckCircle2, ArrowRight } from 'lucide-react';

interface DentalBeforeAfterProps {
  onOpenBooking?: () => void;
}

export function DentalBeforeAfter({ onOpenBooking }: DentalBeforeAfterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scrolling with spring smoothing
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, restDelta: 0.001 });

  const headerY = useTransform(smoothProgress, [0, 1], [60, -60]);
  const canvasY = useTransform(smoothProgress, [0, 1], [90, -90]);
  const bgGlowY = useTransform(smoothProgress, [0, 1], [-130, 130]);

  // Slider position: 0 (all After) to 100 (all Before)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Calculate slider percentage from pointer/touch coordinate
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, percentage)));
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging, handleMove]);

  return (
    <section
      ref={sectionRef}
      id="results"
      className="relative w-full py-20 sm:py-28 lg:py-36 bg-white/40 backdrop-blur-md flex flex-col justify-center overflow-hidden border-t border-slate-100/60 select-none z-40"
    >
      {/* Background Soft Accent Glow with Parallax */}
      <motion.div
        style={{ y: bgGlowY }}
        className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-emerald-100/45 rounded-full blur-3xl opacity-70 pointer-events-none will-change-transform"
      />

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-40">
        
        {/* ── Section Header with Parallax & Viewport Entrance ── */}
        <motion.div
          style={{ y: headerY }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 sm:pb-14 lg:pb-16 border-b border-slate-200/80 will-change-transform"
        >
          <div className="flex flex-col items-start gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMILE TRANSFORMATIONS</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-bold tracking-[-0.035em] text-[#111827] text-[30px] leading-[1.08] sm:text-[42px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]"
            >
              Real Results.<br />
              <span className="text-[#05c989]">Healthy, Bright Smiles.</span>
            </motion.h2>
          </div>

          {/* Quick Preset Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start sm:items-end gap-3"
          >
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs">
              <button
                type="button"
                onClick={() => setSliderPos(100)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  sliderPos >= 90
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Before
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  sliderPos > 10 && sliderPos < 90
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Split Compare
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(0)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  sliderPos <= 10
                    ? 'bg-[#05c989] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                After
              </button>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-normal text-left sm:text-right">
              Drag the center slider or click the buttons above to compare.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Main Comparison Frame with Parallax ───── */}
        <motion.div
          style={{ y: canvasY }}
          initial={{ opacity: 0, scale: 0.97, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 sm:pt-12 max-w-[1140px] mx-auto flex flex-col gap-6 relative z-40 will-change-transform"
        >
          
          {/* Main Comparison Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full aspect-[16/9] sm:aspect-[21/10] rounded-[28px] sm:rounded-[36px] overflow-hidden border-2 border-white/90 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.16)] ring-1 ring-slate-200/80 cursor-ew-resize bg-slate-950 group select-none"
          >
            {/* ── Layer 1: AFTER Image (Underneath) ── */}
            <img
              src="/demos/dental/smile-after.jpg"
              alt="After Teeth Cleaning & Whitening"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* After Pill (Bottom Right) */}
            <div className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-wider shadow-lg pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-[#05c989] shadow-[0_0_6px_#05c989]" />
              <span>AFTER TREATMENT</span>
            </div>

            {/* ── Layer 2: BEFORE Image (Clipped with inset) ── */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <img
                src="/demos/dental/smile-before.jpg"
                alt="Before Teeth Cleaning & Whitening"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Before Pill (Bottom Left) */}
              <div className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg pointer-events-none z-10">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <span>BEFORE</span>
              </div>
            </div>

            {/* ── Slider Divider Line & Floating Handle ── */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex items-center justify-center -translate-x-1/2 transition-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Vertical Glowing Line */}
              <div className="w-[3px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_24px_rgba(5,201,137,0.8)]" />

              {/* Center Draggable Floating Knob */}
              <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-xl border-2 border-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#111827] group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <MoveHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-[#05c989]" />
              </div>
            </div>

          </div>

          {/* Bottom Narrative Badge Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#05c989] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-[#111827] leading-snug text-left">
                Immediate Results • Stain Removal &amp; Laser Whitening • Pain-Free
              </span>
            </div>

            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 rounded-full bg-[#111827] hover:bg-[#05c989] text-white text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <span>Get This Smile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
