'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const FEATURES = [
  {
    num: '01',
    title: 'Expert Craftsmanship',
    desc: 'Hand-sculpted & polished by master European goldsmiths.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Premium Quality',
    desc: 'Solid 18K gold & conflict-free certified stones.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Ethical Sourcing',
    desc: '100% traceable diamonds with certified origins.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Timeless Designs',
    desc: 'Heirloom silhouettes made to transcend generations.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function JewelleryStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Scale-up on exit scroll, anchored strictly to bottom center (no rotation)
  const imageScale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 1, 1.4]);

  // Center image mouse interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200 });
  const tiltY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const { width, left } = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    mouseX.set(x);
  };

  return (
    <section 
      ref={sectionRef}
      id="story" 
      onMouseMove={handleMouseMove}
      className="relative w-full pt-10 sm:pt-14 pb-0 px-4 sm:px-6 lg:px-8 bg-white text-[#0D2D25] overflow-hidden border-t border-[#0D2D25]/10"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end relative">
        
        {/* ── Left Column: Title & Description (Vertically Centered with Masked Slide) ── */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 space-y-5 text-left self-center py-6 sm:py-10 relative z-10"
        >
          <div className="flex items-center gap-2.5">
            <motion.span 
              initial={{ width: 0 }}
              whileInView={{ width: 24 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-[1.5px] bg-[#C6A05F]" 
            />
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A05F] uppercase font-sans">
              Our Story
            </span>
          </div>

          <h2 className="font-italiana text-3xl sm:text-4xl lg:text-[2.6rem] text-[#0D2D25] leading-[1.1] font-normal">
            Crafted with Passion, <br className="hidden sm:block" /> Made for You
          </h2>

          <p className="text-xs sm:text-sm text-[#0D2D25]/75 font-light leading-relaxed font-sans">
            At Câlin, every piece of jewelry is a symbol of elegance, crafted with the finest materials by skilled artisans. We believe in creating timeless beauty that becomes a part of your cherished moments.
          </p>

          <div className="pt-2">
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="#collection"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#0D2D25] text-[#F6EFE7] hover:bg-[#154237] transition-all duration-300 font-semibold tracking-wider text-xs uppercase shadow-md hover:shadow-lg"
            >
              <span>Read More</span>
              <span className="text-[#C6A05F]">→</span>
            </motion.a>
          </div>
        </motion.div>

        {/* ── Center Column: Large Cutout Image with Interactive Mouse Tilt & Specular Shine ── */}
        <div className="lg:col-span-4 flex items-end justify-center relative z-20 self-end pointer-events-none lg:-mx-16 xl:-mx-20">
          <motion.div 
            style={{ 
              scale: imageScale, 
              rotateY: tiltY,
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-[320px] sm:w-[420px] lg:w-[540px] h-[380px] sm:h-[480px] lg:h-[560px] flex items-end justify-center -mb-1 origin-bottom [perspective:1000px]"
          >
            <Image
              src="/demos/luxury-jewellery/PngItem_1218125.png"
              alt="Câlin Jewellery Masterpiece"
              fill
              unoptimized
              sizes="(max-width: 768px) 380px, 560px"
              className="object-contain object-bottom drop-shadow-[0_24px_48px_rgba(13,45,37,0.28)]"
            />
          </motion.div>
        </div>

        {/* ── Right Column: Refined Feature Highlights with Hover Expansion ── */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="lg:col-span-4 space-y-6 sm:space-y-7 self-center py-6 sm:py-10 relative z-10"
        >
          {FEATURES.map((item, idx) => (
            <motion.div 
              key={item.title} 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12 * idx, ease: 'easeOut' }}
              whileHover={{ x: 6 }}
              className="group flex items-start gap-4 transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[#C6A05F] mt-0.5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                {item.icon}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#C6A05F] tracking-widest font-semibold">
                    {item.num}
                  </span>
                  <h4 className="font-italiana text-base sm:text-lg text-[#0D2D25] tracking-wide font-normal group-hover:text-[#C6A05F] transition-colors duration-300">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-[13px] text-[#0D2D25]/70 font-sans font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
