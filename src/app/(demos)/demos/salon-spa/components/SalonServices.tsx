'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface ServiceCategory {
  id: string;
  number: string;
  categoryName: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  isPremium?: boolean;
  services: string[];
}

export const SalonServices: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [activeTab, setActiveTab] = useState<string>('01');

  const categories: ServiceCategory[] = [
    {
      id: 'hair',
      number: '01',
      categoryName: 'Hair',
      title: 'Hair Care & Styling',
      description:
        "Whether you're after a fresh new look or a complete hair transformation, our experienced team offers professional hair services tailored to your style.",
      image: '/demos/salon-boss/services/hair.jpg',
      ctaText: 'Explore Hair Services →',
      services: [
        'Hair Cutting',
        'Hair Coloring',
        'Hair Straightening',
        'Hair Rebonding',
        'Hair Relaxing',
        'Soft Bonding',
      ],
    },
    {
      id: 'hair-treatments',
      number: '02',
      categoryName: 'Hair Treatments',
      title: 'Advanced Hair Treatments',
      description:
        'Give your hair the care it deserves with specialized deep restorative treatments designed to dramatically improve its shine, texture, and lasting manageability.',
      image: '/demos/salon-boss/services/treatment.jpg',
      ctaText: 'Discover Treatments →',
      isPremium: true,
      services: ['Hair Botox Treatment', 'Keratin Treatment'],
    },
    {
      id: 'beauty',
      number: '03',
      categoryName: 'Beauty',
      title: 'Beauty & Grooming',
      description:
        'From refreshing your skin to perfectly groomed hands and feet, enjoy personalized beauty and aesthetic care tailored to your exact needs.',
      image: '/demos/salon-boss/services/beauty.jpg',
      ctaText: 'Explore Beauty Care →',
      services: [
        'Clean Up',
        'Facial',
        'Oil Massage',
        'Manicure',
        'Pedicure',
        'Threading',
      ],
    },
    {
      id: 'ayurvedic',
      number: '04',
      categoryName: 'Ayurvedic Wellness',
      title: 'Ayurvedic Relaxation',
      description:
        'Slow down, unwind and restore your body with relaxing Ayurvedic herbal treatments designed to help you feel revitalized from head to toe.',
      image: '/demos/salon-boss/services/ayurveda.jpg',
      ctaText: 'Explore Wellness →',
      services: [
        'Head Relaxation',
        'Hand Relaxation',
        'Leg Relaxation',
        'Stomach Relaxation',
        'Full Body Relaxation',
        'Steam Bath',
      ],
    },
    {
      id: 'body-care',
      number: '05',
      categoryName: 'Body Care',
      title: 'Full Body Care',
      description:
        'Refresh, exfoliate and revitalize your skin with a complete organic body care and polishing experience in our private treatment rooms.',
      image: '/demos/salon-boss/services/body.jpg',
      ctaText: 'Book Treatment →',
      services: ['Full Body Scrub'],
    },
  ];

  const currentCategory =
    categories.find((c) => c.number === activeTab) || categories[0];

  const handleServiceClick = (serviceName: string) => {
    showDemoToast(
      `Service Selected: ${serviceName}`,
      `In the live website, this automatically adds ${serviceName} to the customer's WhatsApp appointment inquiry.`
    );
  };

  return (
    <section
      id="services"
      className="relative py-24 sm:py-32 bg-[#1C1C1C] text-[#F5F5F2] font-sans-clean overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-[#ECA53D]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#C46A3B]/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#ECA53D]">
              OUR SERVICE MENU
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-6"
          >
            Everything You Need to{' '}
            <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Look & Feel Your Best
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-2xl mx-auto leading-relaxed"
          >
            From everyday grooming to complete hair transformations and relaxing
            wellness treatments — discover professional care, all under one
            roof.
          </motion.p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-12 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeTab === cat.number;
            return (
              <button
                key={cat.number}
                onClick={() => setActiveTab(cat.number)}
                className={`relative px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 sm:gap-2.5 ${
                  isActive
                    ? 'bg-[#ECA53D] text-[#1C1C1C] font-bold shadow-lg shadow-[#ECA53D]/25'
                    : 'bg-white/[0.04] text-[#F5F5F2]/70 hover:text-[#F5F5F2] hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                <span
                  className={`text-[10px] tracking-wider uppercase ${
                    isActive ? 'text-[#1C1C1C]/70' : 'text-[#ECA53D]'
                  }`}
                >
                  {cat.number}
                </span>
                <span>{cat.categoryName}</span>
                {cat.isPremium && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#1C1C1C] text-[#ECA53D]'
                        : 'bg-[#ECA53D]/20 text-[#ECA53D] border border-[#ECA53D]/30'
                    }`}
                  >
                    ★ Signature
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Category Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.number}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-14 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-[#ECA53D]/25 backdrop-blur-xl shadow-2xl shadow-black/60"
          >
            {/* Left Column: Visual Image with Overlay Badge */}
            <div className="lg:col-span-5 relative w-full h-72 sm:h-96 lg:h-[430px] rounded-2xl overflow-hidden border border-white/10 shadow-xl group">
              <Image
                src={currentCategory.image}
                alt={currentCategory.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-80" />

              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#1C1C1C]/80 border border-[#ECA53D]/40 backdrop-blur-md flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ECA53D]">
                  {currentCategory.number} — {currentCategory.categoryName}
                </span>
              </div>
            </div>

            {/* Right Column: Details, Service Chips, and CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#ECA53D] mb-2">
                {currentCategory.categoryName}
              </div>

              <h3 className="text-2xl sm:text-4xl font-serif-luxury text-[#F5F5F2] mb-4 leading-tight">
                {currentCategory.title}
              </h3>

              <p className="text-sm sm:text-base text-[#F5F5F2]/80 leading-relaxed mb-8">
                {currentCategory.description}
              </p>

              {/* Service List Pill Grid */}
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-[0.16em] font-bold text-[#E2C391] mb-3">
                  Services Included:
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {currentCategory.services.map((service) => (
                    <button
                      key={service}
                      onClick={() => handleServiceClick(service)}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#ECA53D]/15 hover:border-[#ECA53D]/50 border border-white/10 text-xs sm:text-sm font-medium text-[#F5F5F2] transition-all flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] group-hover:scale-125 transition-transform" />
                      <span>{service}</span>
                      <span className="text-xs text-[#ECA53D] opacity-0 group-hover:opacity-100 transition-opacity">
                        +
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() =>
                    showDemoToast(
                      `Inquiring ${currentCategory.title}`,
                      `Redirecting to direct WhatsApp scheduling with Salon Boss (+94 71 581 6925).`
                    )
                  }
                  className="px-7 py-3.5 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-[#ECA53D]/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{currentCategory.ctaText}</span>
                  <span className="transition-transform group-hover:translate-x-1.5">
                    →
                  </span>
                </button>

                <span className="text-xs text-[#F5F5F2]/50 text-center sm:text-left">
                  Unisex Specialists available across all 3 branches
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
