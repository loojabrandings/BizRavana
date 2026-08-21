'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface SignatureTreatment {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  ctaText: string;
  badge: string;
}

export const SalonSignature: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const treatments: SignatureTreatment[] = [
    {
      id: 'botox',
      number: '01',
      name: 'Hair Botox',
      tagline: 'Smooth. Revive. Transform.',
      description:
        'Give tired, damaged-looking hair a smoother, healthier-looking finish with our deep nourishing Hair Botox treatment, restoring radiant gloss from root to tip.',
      image: '/demos/salon-boss/signature/botox.jpg',
      ctaText: 'Discover Treatment →',
      badge: 'Deep Nourishment',
    },
    {
      id: 'keratin',
      number: '02',
      name: 'Keratin Treatment',
      tagline: 'Smooth Hair. Effortless Style.',
      description:
        'Tame frizz and achieve beautifully smooth, manageable hair with a bespoke Keratin treatment tailored specifically to your hair texture.',
      image: '/demos/salon-boss/signature/keratin.jpg',
      ctaText: 'Discover Treatment →',
      badge: 'Mirror Shine',
    },
    {
      id: 'colour',
      number: '03',
      name: 'Hair Colour',
      tagline: 'A Colour Made for You.',
      description:
        'Refresh your look with a dimensional, high-shine colour that complements your style, personality, and natural beauty with premium salon pigments.',
      image: '/demos/salon-boss/signature/colour.jpg',
      ctaText: 'Explore Colour →',
      badge: 'Custom Tone',
    },
    {
      id: 'ayurvedic',
      number: '04',
      name: 'Ayurvedic Relaxation',
      tagline: 'Pause. Relax. Restore.',
      description:
        'Escape the everyday with soothing Ayurvedic herbal treatments designed to help your body unwind and your mind reset in total tranquility.',
      image: '/demos/salon-boss/signature/ayurveda.jpg',
      ctaText: 'Explore Wellness →',
      badge: 'Pure Wellness',
    },
  ];

  // Auto change every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % treatments.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, treatments.length]);

  const activeTreatment = treatments[currentIndex];

  const handleBooking = () => {
    showDemoToast(
      'Book Transformation Appointment',
      'Redirecting to Salon Boss VIP Scheduling line (+94 71 581 6925).'
    );
  };

  const handleTreatmentClick = (title: string) => {
    showDemoToast(
      `Inquiring: ${title}`,
      `Our stylists will discuss personalized package pricing for ${title}.`
    );
  };

  return (
    <section
      id="signature"
      className="relative py-24 sm:py-32 bg-[#1C1C1C] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-[#ECA53D]/10 blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-[#C46A3B]/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              SIGNATURE SERVICES
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-4"
          >
            Transform Your Look.{' '}
            <span className="block font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Elevate Your Confidence.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-2xl leading-relaxed"
          >
            Discover Salon Boss’s signature treatments, carefully designed to
            refresh your style, transform your hair, and leave you feeling your
            absolute best.
          </motion.p>
        </div>

        {/* Treatment Navigation Pills / Progress Indicators */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-12 sm:mb-16 no-scrollbar">
          {treatments.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative px-4 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#ECA53D] text-[#1C1C1C] font-bold shadow-lg shadow-[#ECA53D]/30'
                    : 'bg-white/[0.04] text-[#F5F5F2]/60 hover:text-[#F5F5F2] hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-[#1C1C1C]' : 'text-[#ECA53D]'
                  }`}
                >
                  {item.number}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Auto Changing Showcase (Left: Text Details, Right: Large Clean Image, No Card Background) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center min-h-[440px]">
          {/* Left Side: Service Details */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTreatment.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Number & Service Title */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tracking-[0.2em] text-[#ECA53D] uppercase">
                    {activeTreatment.number} — {activeTreatment.name}
                  </span>
                  <span className="h-[1px] w-12 bg-[#ECA53D]/40" />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECA53D]/10 text-[#ECA53D] border border-[#ECA53D]/30 font-medium">
                    {activeTreatment.badge}
                  </span>
                </div>

                {/* Secondary Heading (Italic Luxury Script/Serif) */}
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-normal text-[#F5F5F2] leading-tight">
                  <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
                    {activeTreatment.tagline}
                  </span>
                </h3>

                {/* Description */}
                <p className="text-base sm:text-lg text-[#F5F5F2]/80 leading-relaxed max-w-xl font-normal">
                  {activeTreatment.description}
                </p>

                {/* Direct CTA */}
                <div className="pt-4 flex items-center gap-6">
                  <button
                    onClick={() => handleTreatmentClick(activeTreatment.name)}
                    className="px-8 py-4 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-2xl shadow-[#ECA53D]/30 hover:shadow-[#ECA53D]/50 transition-all flex items-center gap-3 group"
                  >
                    <span>{activeTreatment.ctaText}</span>
                    <span className="transition-transform group-hover:translate-x-1.5 font-sans">
                      →
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Clean Large Image (No Card Background, Elegant Borderless Look) */}
          <div className="lg:col-span-6 relative w-full h-[360px] sm:h-[460px] lg:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTreatment.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/80"
              >
                <Image
                  src={activeTreatment.image}
                  alt={`${activeTreatment.name} at Salon Boss`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                {/* Soft natural edge vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/70 via-transparent to-[#1C1C1C]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/40 via-transparent to-transparent lg:block hidden" />

                {/* Subtle Floating Index Badge */}
                <div className="absolute bottom-5 right-5 px-4 py-1.5 rounded-full bg-[#1C1C1C]/80 border border-white/10 backdrop-blur-md text-xs font-bold text-[#F5F5F2] flex items-center gap-2">
                  <span className="text-[#ECA53D]">{activeTreatment.number}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/60">04</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
