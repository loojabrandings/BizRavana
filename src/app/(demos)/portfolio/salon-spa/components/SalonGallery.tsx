'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'hair' | 'treatments' | 'wellness';
  categoryLabel: string;
  image: string;
  branch: string;
  aspectClass: string;
}

export const SalonGallery: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [activeFilter, setActiveFilter] = useState<'all' | 'hair' | 'treatments' | 'wellness'>('all');

  const galleryItems: GalleryItem[] = [
    {
      id: 'g1',
      title: 'Dimensional Honey Caramel Balayage',
      category: 'hair',
      categoryLabel: 'Hair Color',
      image: '/demos/salon-boss/signature/colour.jpg',
      branch: 'Maharagama',
      aspectClass: 'lg:col-span-7 lg:row-span-2 h-[340px] sm:h-[460px] lg:h-[540px]',
    },
    {
      id: 'g2',
      title: 'Keratin Mirror Gloss Transformation',
      category: 'treatments',
      categoryLabel: 'Advanced Treatment',
      image: '/demos/salon-boss/services/treatment.jpg',
      branch: 'Nugegoda',
      aspectClass: 'lg:col-span-5 h-[280px] sm:h-[260px]',
    },
    {
      id: 'g3',
      title: 'Luxury Skin Rejuvenation Facial',
      category: 'wellness',
      categoryLabel: 'Beauty & Skin',
      image: '/demos/salon-boss/services/beauty.jpg',
      branch: 'Kottawa',
      aspectClass: 'lg:col-span-5 h-[280px] sm:h-[260px]',
    },
    {
      id: 'g4',
      title: 'Ayurvedic Herbal Steam & Oil Therapy',
      category: 'wellness',
      categoryLabel: 'Wellness',
      image: '/demos/salon-boss/services/ayurveda.jpg',
      branch: 'Maharagama',
      aspectClass: 'lg:col-span-4 h-[280px]',
    },
    {
      id: 'g5',
      title: 'Hair Botox Deep Restorative Care',
      category: 'treatments',
      categoryLabel: 'Hair Botox',
      image: '/demos/salon-boss/signature/botox.jpg',
      branch: 'Nugegoda',
      aspectClass: 'lg:col-span-4 h-[280px]',
    },
    {
      id: 'g6',
      title: 'Unisex Signature Blowout & Style',
      category: 'hair',
      categoryLabel: 'Hair Styling',
      image: '/demos/salon-boss/services/hair.jpg',
      branch: 'Kottawa',
      aspectClass: 'lg:col-span-4 h-[280px]',
    },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  const handleItemClick = (title: string) => {
    showDemoToast(
      `Viewing: ${title}`,
      'In production, this opens high-resolution client case studies or Instagram Reels.'
    );
  };

  return (
    <section
      id="gallery"
      className="relative py-24 sm:py-32 bg-[#1C1C1C] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
    >
      {/* Background Ambient Accents */}
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-[#ECA53D]/10 blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-[#C46A3B]/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 sm:mb-18">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
                OUR WORK & GALLERY
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15]"
            >
              Crafted With Passion.{' '}
              <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
                Styled to Perfection.
              </span>
            </motion.h2>
          </div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
          >
            {[
              { id: 'all', label: 'All Work' },
              { id: 'hair', label: 'Hair & Color' },
              { id: 'treatments', label: 'Treatments' },
              { id: 'wellness', label: 'Wellness' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-[#ECA53D] text-[#1C1C1C] font-bold shadow-md shadow-[#ECA53D]/25'
                      : 'bg-white/[0.04] text-[#F5F5F2]/70 hover:text-[#F5F5F2] hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Bento Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => handleItemClick(item.title)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-black/40 border border-white/10 hover:border-[#ECA53D]/60 shadow-xl transition-all duration-500 ${item.aspectClass}`}
              >
                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#1C1C1C]/80 border border-white/15 text-[10px] sm:text-[11px] font-bold text-[#ECA53D] uppercase tracking-wider backdrop-blur-md">
                    {item.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white/80 text-[10px] font-medium backdrop-blur-md">
                    📍 {item.branch}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-xl font-serif-luxury text-[#F5F5F2] font-normal leading-snug group-hover:text-[#ECA53D] transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-white/[0.08] group-hover:bg-[#ECA53D] border border-white/20 group-hover:border-[#ECA53D] flex items-center justify-center text-[#F5F5F2] group-hover:text-[#1C1C1C] transition-all shrink-0">
                    <span className="text-xs font-bold transition-transform group-hover:translate-x-0.5 font-sans">
                      ↗
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
