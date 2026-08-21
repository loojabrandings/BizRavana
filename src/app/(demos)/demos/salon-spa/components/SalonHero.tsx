'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface SalonHeroProps {
  onBookClick?: () => void;
  onExploreClick?: () => void;
}

export const SalonHero: React.FC<SalonHeroProps> = ({
  onBookClick,
  onExploreClick,
}) => {
  const { showDemoToast } = useDemoToast();

  const handleBooking = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      showDemoToast(
        'Book Appointment',
        'Connecting to Salon Boss Booking line (+94 71 581 6925).'
      );
    }
  };

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        showDemoToast('Explore Services', 'Browsing full unisex service catalog.');
      }
    }
  };

  const stats = [
    { value: '4.4★', label: 'Highly Rated' },
    { value: '280+', label: 'Client Reviews' },
    { value: '3', label: 'Locations' },
    { value: '100%', label: 'Unisex Care' },
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#1C1C1C] font-sans-clean">
      {/* Background Image with Clean Editorial Lighting Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/demos/salon-boss/hero.jpg"
          alt="Salon Boss Unisex Luxury Hair & Beauty Experience"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-right-center"
        />

        {/* Soft, tailored gradient masks to keep couple visible on right while text is crystal clear on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/85 sm:via-[#1C1C1C]/65 to-transparent w-full lg:w-[62%]" />
      </div>

      {/* Decorative Warm Ambient Glows (#ECA53D Gold / Amber) */}
      <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-[#ECA53D]/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-[#C46A3B]/20 blur-[110px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 w-full">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1C1C1C]/70 border border-[#ECA53D]/35 backdrop-blur-md mb-6 shadow-lg shadow-black/30"
          >
            <span className="w-2 h-2 rounded-full bg-[#ECA53D] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              SALON BOSS • UNISEX SALON
            </span>
          </motion.div>

          {/* Main Headline with Luxury Serif + Brand Gold Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl lg:text-7xl font-serif-luxury font-normal text-[#F5F5F2] leading-[1.08] tracking-tight mb-6"
          >
            Your Style.{' '}
            <span className="block font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Your Confidence.
            </span>
          </motion.h1>

          {/* Supporting Text (Clean Modern Sans-Serif) */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="text-sm sm:text-base lg:text-lg text-[#F5F5F2]/85 font-normal leading-relaxed max-w-xl mb-8 drop-shadow-sm"
          >
            From everyday grooming to complete hair transformations, beauty care
            and relaxing wellness treatments — discover professional care, all
            under one roof.
          </motion.p>

          {/* Primary & Secondary CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
          >
            {/* Primary CTA (#ECA53D Brand Golden Amber) */}
            <button
              onClick={handleBooking}
              className="px-8 py-4 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest border border-[#F5F5F2]/30 shadow-2xl shadow-[#ECA53D]/40 hover:shadow-[#ECA53D]/60 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 group"
            >
              <span>BOOK AN APPOINTMENT</span>
              <span className="transition-transform group-hover:translate-x-1.5 font-sans">→</span>
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleExplore}
              className="px-7 py-4 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-[#F5F5F2] font-semibold text-xs sm:text-sm uppercase tracking-wider border border-[#ECA53D]/30 backdrop-blur-md transition-all text-center"
            >
              EXPLORE SERVICES
            </button>
          </motion.div>

          {/* Location Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#E2C391] uppercase mb-10"
          >
            <svg
              className="w-3.5 h-3.5 text-[#ECA53D]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>MAHARAGAMA • NUGEGODA • KOTTAWA</span>
          </motion.div>

          {/* Trust Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-[#ECA53D]/20 max-w-xl"
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#1C1C1C]/60 border border-[#ECA53D]/20 backdrop-blur-md flex flex-col justify-center shadow-lg shadow-black/20"
              >
                <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#F5F5F2] tracking-tight">
                  <span className={stat.value.includes('★') ? 'text-[#ECA53D]' : ''}>
                    {stat.value}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#F5F5F2]/70 uppercase tracking-wider mt-0.5 font-sans-clean">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Elegant Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ECA53D]/30 to-transparent" />
    </section>
  );
};
