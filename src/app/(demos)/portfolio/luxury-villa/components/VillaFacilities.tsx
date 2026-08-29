'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FacilityItem {
  title: string;
  description: string;
}

const FACILITIES_DATA: FacilityItem[] = [
  {
    title: 'Pick Up & Drop Service',
    description: 'Hassle-free transfers to and from the nearest town or transit points directly to the cabana.',
  },
  {
    title: 'Dedicated Free Parking',
    description: 'Safe and secure private parking space on-site for your personal vehicles.',
  },
  {
    title: 'Laundry Service',
    description: 'Quick and convenient laundry facilities so you can travel light and stay fresh.',
  },
  {
    title: 'High-Speed Starlink',
    description: 'Stay connected with fast, reliable internet across the entire cabana and outdoor deck.',
  },
  {
    title: 'Fresh Food on Order',
    description: 'Delicious home-style meals, local delicacies, and hot beverages prepared fresh upon your request.',
  },
];

export const VillaFacilities: React.FC = () => {
  return (
    <section id="facilities" className="relative z-20 -mt-20 sm:-mt-28 lg:-mt-32 pb-10 sm:pb-14 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Single Row Subtle Editorial Amenity Ribbon ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 divide-y sm:divide-y-0 md:divide-x divide-slate-200/80 border-y border-slate-200/80 py-7 sm:py-8 bg-white/50 backdrop-blur-md rounded-2xl md:rounded-none"
        >
          {FACILITIES_DATA.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center px-4 py-4 group transition-all duration-300"
            >
              <div className="space-y-1.5 max-w-[210px]">
                <h3 className="text-sm sm:text-base font-serif font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Subtle Micro-Note / Footer Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/70 text-[11px] font-medium text-slate-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>24/7 on-call host assistance to cater to your needs.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
