'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface TransformationItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  tag: string;
}

export const SalonBeforeAfter: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const transformations: TransformationItem[] = [
    {
      id: 'colour-balayage',
      title: 'HAIR COLOUR TRANSFORMATION',
      subtitle: 'Colour • Dimensional Styling',
      category: 'HAIR COLOUR',
      beforeImage: '/demos/salon-boss/transformations/before-1.jpg',
      afterImage: '/demos/salon-boss/transformations/after-1.jpg',
      tag: 'Caramel Balayage',
    },
    {
      id: 'keratin-treatment',
      title: 'KERATIN SMOOTHING TRANSFORMATION',
      subtitle: 'Treatment • Frizz Control & Mirror Gloss',
      category: 'KERATIN SMOOTHING',
      beforeImage: '/demos/salon-boss/transformations/before-2.jpg',
      afterImage: '/demos/salon-boss/transformations/after-2.jpg',
      tag: 'Deep Keratin Restructure',
    },
    {
      id: 'styling-volume',
      title: 'PRECISION CUT & BLOWOUT',
      subtitle: 'Cut • Volume & Texture Transformation',
      category: 'HAIR STYLING',
      beforeImage: '/demos/salon-boss/transformations/before-3.jpg',
      afterImage: '/demos/salon-boss/transformations/after-3.jpg',
      tag: 'Layered Volume Styling',
    },
  ];

  const currentItem = transformations[activeItemIndex];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging || e.buttons === 1) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  return (
    <section
      id="transformations"
      className="relative py-24 sm:py-32 bg-[#1C1C1C] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5 select-none"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#ECA53D]/10 blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              THE TRANSFORMATION
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-4"
          >
            See The{' '}
            <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Difference.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-xl mx-auto leading-relaxed"
          >
            Every transformation starts with a vision. See the results for
            yourself.
          </motion.p>
        </div>

        {/* Interactive Split View Slider Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-[#ECA53D]/30 bg-black/40"
        >
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onClick={(e) => handleMove(e.clientX)}
            className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] cursor-ew-resize overflow-hidden"
          >
            {/* After Image (Background Layer) */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={currentItem.afterImage}
                alt={`After ${currentItem.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover object-center"
              />
              <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-[#1C1C1C]/80 border border-[#ECA53D]/40 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#ECA53D] shadow-lg">
                AFTER
              </div>
            </div>

            {/* Before Image (Clipped Overlay Layer) */}
            <div
              className="absolute inset-0 h-full overflow-hidden will-change-transform"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative w-full h-full min-w-[700px] sm:min-w-[900px]">
                <Image
                  src={currentItem.beforeImage}
                  alt={`Before ${currentItem.title}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover object-center"
                />
              </div>
              <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-[#1C1C1C]/80 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white/80 shadow-lg">
                BEFORE
              </div>
            </div>

            {/* Vertical Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-[3px] bg-[#ECA53D] shadow-[0_0_15px_#ECA53D] z-30 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#1C1C1C] border-2 border-[#ECA53D] shadow-2xl flex items-center justify-center text-[#ECA53D] text-xs font-bold">
                <span className="tracking-tighter">◀ ● ▶</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transformation Title & Subtitle */}
        <div className="text-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl sm:text-2xl font-serif-luxury tracking-wide text-[#F5F5F2] uppercase font-bold">
                {currentItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#ECA53D] tracking-widest uppercase mt-1 font-medium">
                {currentItem.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail Selector Cards Below */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-14">
          {transformations.map((item, idx) => {
            const isActive = idx === activeItemIndex;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveItemIndex(idx);
                  setSliderPosition(50);
                }}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left flex items-center gap-4 group ${
                  isActive
                    ? 'bg-white/[0.08] border-[#ECA53D] shadow-lg shadow-[#ECA53D]/20'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={item.afterImage}
                    alt={item.category}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block ${
                      isActive ? 'text-[#ECA53D]' : 'text-white/50'
                    }`}
                  >
                    Before / After
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F2] uppercase tracking-wide group-hover:text-[#ECA53D] transition-colors">
                    {item.category}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Direct Action Trigger */}
        <div className="text-center">
          <button
            onClick={() =>
              showDemoToast(
                'Transformation Inquiry',
                'Redirecting to Salon Boss Transformation Consultation (+94 71 581 6925).'
              )
            }
            className="px-8 py-4 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest border border-[#F5F5F2]/30 shadow-2xl shadow-[#ECA53D]/30 hover:shadow-[#ECA53D]/50 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 group"
          >
            <span>BOOK YOUR TRANSFORMATION</span>
            <span className="transition-transform group-hover:translate-x-1.5 font-sans">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
