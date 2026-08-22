'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface PricingPackage {
  id: string;
  title: string;
  badge: string;
  isPopular?: boolean;
  price: string;
  period: string;
  description: string;
  includes: string[];
  ctaText: string;
}

const PACKAGES_DATA: PricingPackage[] = [
  {
    id: 'room-only',
    title: 'Room Only (Cabana Stay)',
    badge: 'Basic Getaway',
    isPopular: false,
    price: 'Rs. 7,000',
    period: '/ per person',
    description: 'Perfect for independent travelers seeking tranquil mountain seclusion.',
    includes: [
      'Full access to the private A-frame cabana & deck',
      'Free high-speed Wi-Fi & secure parking',
      'Complimentary welcome Ceylon tea',
      'Food available to order separately from the menu',
    ],
    ctaText: 'Book Stay Only',
  },
  {
    id: 'bed-breakfast',
    title: 'Bed & Breakfast (BB)',
    badge: 'Most Popular ⭐',
    isPopular: true,
    price: 'Rs. 15,000',
    period: '/ per person',
    description: 'Our signature package with sunrise dining and seamless transfers.',
    includes: [
      'Full access to cabana & scenic viewing deck',
      'Daily fresh breakfast with authentic Sri Lankan or continental options',
      'Morning tea/coffee on the sunrise deck',
      'Free Wi-Fi, secure parking & pick-up service',
    ],
    ctaText: 'Book with Breakfast',
  },
  {
    id: 'full-board',
    title: 'Full Board (FB)',
    badge: 'All Inclusive Luxury',
    isPopular: false,
    price: 'Rs. 25,000',
    period: '/ per person',
    description: 'The ultimate bespoke retreat with culinary dining and guided nature trails.',
    includes: [
      'All 3 meals included (Breakfast, Lunch & Dinner)',
      'Evening snacks & freshly brewed tea',
      'Guided estate walking & hiking trail access',
      'Priority pick-up/drop & laundry service',
    ],
    ctaText: 'Book Full Board',
  },
];

export const VillaRates: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  const handleBookingPackage = (pkgName: string) => {
    showDemoToast(
      'Package Selected',
      `Selected ${pkgName}. Navigating to dates & live calculation...`
    );
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="rates" className="relative py-20 sm:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono font-bold tracking-widest uppercase mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Transparent Pricing</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]"
          >
            Choose Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700">
              Stay Package
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl mx-auto mt-4"
          >
            Flexible stay options tailored to your preference, charged per person per night.
          </motion.p>
        </div>

        {/* ── 3-Column Luxury Pricing Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 sm:gap-8 items-stretch">
          {PACKAGES_DATA.map((pkg, idx) => {
            const isPop = pkg.isPopular;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-9 transition-all duration-500 hover:-translate-y-1.5 ${
                  isPop
                    ? 'bg-gradient-to-b from-white via-white to-emerald-50/40 border-2 border-emerald-600/30 shadow-2xl shadow-emerald-900/10 lg:-translate-y-2'
                    : 'bg-white/90 border border-slate-200/90 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
              >
                {/* Popular Elevated Glow Layer */}
                {isPop && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
                      <span>{pkg.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Badge (For Non-popular cards) */}
                  {!isPop && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-semibold uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  {isPop && <div className="h-2 mb-2" />}

                  {/* Card Title & Subtitle */}
                  <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Price Tag */}
                  <div className="my-6 pb-6 border-b border-slate-100 flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {pkg.price}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wide">
                      {pkg.period}
                    </span>
                  </div>

                  {/* Inclusions Feature List */}
                  <div className="space-y-3.5 pt-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-3">
                      Package Inclusions
                    </span>
                    {pkg.includes.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-light">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="pt-8 mt-8 border-t border-slate-100">
                  <button
                    onClick={() => handleBookingPackage(pkg.title)}
                    className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
                      isPop
                        ? 'villa-btn-primary shadow-emerald-600/30'
                        : 'bg-slate-900 hover:bg-emerald-800 text-white shadow-slate-900/10 hover:shadow-emerald-900/20'
                    }`}
                  >
                    <span>{pkg.ctaText}</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
