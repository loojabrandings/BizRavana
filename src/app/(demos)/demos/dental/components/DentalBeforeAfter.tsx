'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Sliders, Eye, Zap, HeartHandshake } from 'lucide-react';

interface DentalBeforeAfterProps {
  onOpenBooking?: () => void;
}

export function DentalBeforeAfter({ onOpenBooking }: DentalBeforeAfterProps) {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

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
      id="results"
      className="relative w-full py-24 sm:py-32 bg-white/40 backdrop-blur-md flex flex-col justify-center overflow-hidden border-t border-slate-100/60 select-none z-40"
    >
      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-40">
        
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-slate-200/80">
          <div className="flex flex-col items-start gap-3.5 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMILE TRANSFORMATIONS</span>
            </div>

            <h2 className="font-bold tracking-[-0.035em] text-[#111827] text-[34px] leading-[1.05] sm:text-[46px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]">
              Real Results.<br />
              <span className="text-[#05c989]">Healthy, Bright Smiles.</span>
            </h2>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-col items-start sm:items-end gap-3">
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
          </div>
        </div>

        {/* ── Main Comparison Frame (Frosted Glass Outer Shell) ───── */}
        <div className="pt-10 sm:pt-14 max-w-[1140px] mx-auto flex flex-col gap-6 relative z-40">
          
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

            {/* AFTER Corner Badge */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide flex items-center gap-2 z-10 pointer-events-none shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#05c989] shadow-[0_0_8px_#05c989]" />
              <span>AFTER • Clean &amp; Bright</span>
            </div>

            {/* ── Layer 2: BEFORE Image (Exact 1:1 Pixel Clip) ── */}
            <div
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
            >
              <img
                src="/demos/dental/smile-before.jpg"
                alt="Before Teeth Cleaning"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* BEFORE Corner Badge */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide flex items-center gap-2 pointer-events-none shadow-xl">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                <span>BEFORE • Stains &amp; Plaque</span>
              </div>
            </div>

            {/* ── Vertical Divider Bar & Ergonomic Drag Pill ──────── */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none -translate-x-1/2 flex items-center justify-center"
            >
              {/* Central Floating Controller Handle */}
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] border-2 border-[#05c989] text-[#111827] flex items-center justify-center gap-1 group-hover:scale-110 active:scale-95 transition-all">
                <span className="text-[12px] font-extrabold tracking-tighter text-[#05c989]">◄►</span>
              </div>
            </div>

            {/* Bottom Guidance Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium tracking-wide pointer-events-none shadow-md">
              Drag left or right to compare
            </div>
          </div>

          {/* ── Clinical Case Highlights Strip (Frosted Glassmorphism) ── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Procedure
              </span>
              <span className="font-bold text-sm sm:text-base text-[#111827] mt-0.5">
                Deep Clean &amp; Polish
              </span>
              <span className="text-xs text-slate-500 mt-0.5">100% Stain &amp; Plaque Removal</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Technology
              </span>
              <span className="font-bold text-sm sm:text-base text-[#111827] mt-0.5">
                Gentle Ultrasonic Care
              </span>
              <span className="text-xs text-slate-500 mt-0.5">Pain-Free &amp; Enamel Safe</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Duration
              </span>
              <span className="font-bold text-sm sm:text-base text-[#111827] mt-0.5">
                Single 45-Min Session
              </span>
              <span className="text-xs text-slate-500 mt-0.5">Instant visible results</span>
            </div>

            <div className="flex items-center sm:justify-end">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#05c989] hover:bg-[#04b37a] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Book Your Clean</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
