'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { JewelleryParticles } from './JewelleryParticles';

interface FeaturedPiece {
  id: string;
  name: string;
  category: string;
  image: string;
  tag: string;
}

const FEATURED_PIECES: FeaturedPiece[] = [
  {
    id: 'rings',
    name: 'Aura Solitaire',
    category: '18K Yellow Gold Ring',
    image: '/demos/luxury-jewellery/featured/rings.webp',
    tag: 'Signature Cut',
  },
  {
    id: 'necklace-1',
    name: 'Royale Émeraude',
    category: 'Haute Diamond Pendant',
    image: '/demos/luxury-jewellery/featured/necklace.png',
    tag: 'Bespoke',
  },
  {
    id: 'earrings-1',
    name: 'Lumière Drops',
    category: 'Pavé Pear Earrings',
    image: '/demos/luxury-jewellery/featured/earing.webp',
    tag: 'Hand-set',
  },
  {
    id: 'necklace-2',
    name: 'Symphonie Choker',
    category: 'Chiseled Gold Collar',
    image: '/demos/luxury-jewellery/featured/necklace (2).png',
    tag: 'Limited Edition',
  },
  {
    id: 'earrings-2',
    name: 'Étoile Cascade',
    category: 'Diamond Drop Earrings',
    image: '/demos/luxury-jewellery/featured/earing.png',
    tag: 'Haute Joaillerie',
  },
];

function FloatingPieceCard({
  piece,
  index,
  scrollYProgress,
  hoveredIndex,
  setHoveredIndex,
}: {
  piece: FeaturedPiece;
  index: number;
  scrollYProgress: any;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
}) {
  const isOdd = index % 2 === 1;
  const parallaxY = useTransform(scrollYProgress, [0, 1], isOdd ? [-45, 45] : [45, -45]);
  const isHovered = hoveredIndex === index;
  const isAnotherHovered = hoveredIndex !== null && !isHovered;

  return (
    <motion.div
      style={{ y: parallaxY }}
      initial={{ opacity: 0, scale: 0.85, y: 50 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      animate={{
        opacity: isAnotherHovered ? 0.4 : 1,
        scale: isHovered ? 1.1 : isAnotherHovered ? 0.95 : 1,
      }}
      className="group flex flex-col items-center text-center space-y-3.5 cursor-pointer transition-all duration-500"
    >
      {/* Pure Floating Jewellery Visual with Multi-frequency sine float */}
      <motion.div 
        animate={{ y: [0, -10 - (index % 3) * 3, 0] }}
        transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full aspect-square max-w-[180px] sm:max-w-[200px] flex items-center justify-center"
      >
        {/* Ambient Radial Golden Aura Halo */}
        <motion.div 
          animate={isHovered ? { scale: 1.4, opacity: 1 } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-radial from-[#C6A05F]/35 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" 
        />

        <div className="relative w-[88%] h-[88%] transition-transform duration-700 ease-out group-hover:scale-120 group-hover:-translate-y-3">
          <Image
            src={piece.image}
            alt={piece.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 140px, 200px"
            className="object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.7)] transition-all duration-700 group-hover:drop-shadow-[0_22px_45px_rgba(198,160,95,0.6)]"
          />
        </div>
      </motion.div>

      {/* Minimalist Label & Name */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono tracking-widest text-[#C6A05F] uppercase block">
          {piece.tag}
        </span>
        <h3 className="font-italiana text-base sm:text-lg text-[#F6EFE7] font-normal tracking-wide group-hover:text-[#C6A05F] transition-colors">
          {piece.name}
        </h3>
        <p className="text-[11px] text-[#F6EFE7]/65 font-sans font-light">
          {piece.category}
        </p>
      </div>
    </motion.div>
  );
}

export function JewelleryFeatured() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={sectionRef}
      id="signature"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-lux-dark text-[#F6EFE7] overflow-hidden border-t border-[#F6EFE7]/10"
      style={{ backgroundColor: 'var(--lux-bg-dark)' }}
    >
      {/* ── Ambient Floating Diamond Sparkles & Dust ──────────────── */}
      <JewelleryParticles count={18} />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">

        {/* ── Minimalist Low-Height Header Row with Reveal ─────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#F6EFE7]/10"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-[1.5px] bg-[#C6A05F]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#C6A05F] uppercase font-sans">
                Signature Highlights
              </span>
            </div>
            <h2 className="font-custom-brand text-3xl sm:text-4xl md:text-5xl text-[#F6EFE7] lowercase font-normal select-none leading-tight">
              featured masterpieces
            </h2>
          </div>
        </motion.div>

        {/* ── Single-Row Floating Showcase with Focus Spotlight ──── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-6 lg:gap-8 items-center pt-2">
          {FEATURED_PIECES.map((piece, idx) => (
            <FloatingPieceCard 
              key={piece.id} 
              piece={piece} 
              index={idx} 
              scrollYProgress={scrollYProgress} 
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
