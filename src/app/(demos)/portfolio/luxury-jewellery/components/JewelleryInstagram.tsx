'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { JewelleryTiltCard } from './JewelleryTiltCard';

const INSTA_POSTS = [
  { id: 1, img: '/demos/luxury-jewellery/featured/rings.webp' },
  { id: 2, img: '/demos/luxury-jewellery/featured/necklace.png' },
  { id: 3, img: '/demos/luxury-jewellery/card-1.jpeg' },
  { id: 4, img: '/demos/luxury-jewellery/card-2.jpeg' },
  { id: 5, img: '/demos/luxury-jewellery/hero-3.jpeg' },
  { id: 6, img: '/demos/luxury-jewellery/card-3.jpeg' },
  { id: 7, img: '/demos/luxury-jewellery/card-4.jpeg' },
];

export function JewelleryInstagram() {
  return (
    <section className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] text-[#0D2D25] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── Section Title ────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center space-y-2.5"
        >
          <h2 className="font-italiana text-2xl sm:text-3xl md:text-4xl text-[#0D2D25] tracking-widest uppercase font-normal">
            Follow Us On Instagram
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#C6A05F]" />
            <span className="text-xs text-[#C6A05F]">✦</span>
            <span className="w-8 h-[1px] bg-[#C6A05F]" />
          </div>
        </motion.div>

        {/* ── 7-Item Thumbnail Grid with 3D Tilt Cards ───────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {INSTA_POSTS.map((post, idx) => (
            <motion.a
              key={post.id}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <JewelleryTiltCard maxTilt={15} scaleHover={1.08} className="aspect-square rounded-2xl overflow-hidden bg-white border border-[#0D2D25]/10 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-[#C6A05F]/60">
                <Image
                  src={post.img}
                  alt="Instagram feed"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 160px, 180px"
                  className="object-cover object-center transition-transform duration-700 ease-out hover:scale-115"
                />

                {/* Instagram Icon Hover Overlay with Animated Heart Pop */}
                <div className="absolute inset-0 bg-[#0D2D25]/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-[#F6EFE7] pointer-events-none">
                  <motion.svg 
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="w-7 h-7 fill-current text-[#C6A05F] drop-shadow-md" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </motion.svg>
                </div>
              </JewelleryTiltCard>
            </motion.a>
          ))}
        </div>

        {/* ── Footer Handle & Button ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <span className="text-xs font-mono tracking-widest text-[#0D2D25]/70 uppercase">
            @calinjewelry
          </span>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg border border-[#0D2D25]/20 hover:border-[#C6A05F] text-[#0D2D25] hover:text-[#C6A05F] text-xs font-semibold uppercase tracking-wider transition-all duration-300"
          >
            View More
          </motion.a>
        </div>

      </div>
    </section>
  );
}
