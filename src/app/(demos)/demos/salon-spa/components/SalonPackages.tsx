'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface SpecialOffer {
  id: string;
  number: string;
  category: string;
  headline: string;
  discountBadge: string;
  description: string;
  offerSummary: string;
  ctaText: string;
  smallText: string;
  image: string;
  isPopular?: boolean;
}

export const SalonPackages: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  const offers: SpecialOffer[] = [
    {
      id: 'offer-colour',
      number: '01',
      category: 'Hair Colour',
      headline: 'COLOUR YOUR HAIR RIGHT',
      discountBadge: '50% OFF',
      description:
        'Ready for a fresh new look? Give your hair a beautiful colour transformation with our professional multidimensional hair colouring service.',
      offerSummary: 'Offer: 50% OFF Hair Colour',
      ctaText: 'BOOK THIS OFFER →',
      smallText: 'Limited-time offer • Terms & conditions apply',
      image: '/demos/salon-boss/signature/colour.jpg',
    },
    {
      id: 'offer-botox',
      number: '02',
      category: 'Hair Botox',
      headline: 'HAIR BOTOX TREATMENT',
      discountBadge: '60% OFF',
      description:
        'Give your hair the care it deserves. Experience a smoother, healthier-looking mirror-gloss finish with our deeply restorative Hair Botox treatment.',
      offerSummary: 'Offer: 60% OFF Hair Botox',
      ctaText: 'BOOK THIS OFFER →',
      smallText: 'Limited-time offer • Terms & conditions apply',
      image: '/demos/salon-boss/signature/botox.jpg',
      isPopular: true,
    },
  ];

  const handleClaimOffer = (offerTitle: string, discount: string) => {
    showDemoToast(
      `Claiming ${discount} on ${offerTitle}`,
      `Locking in your ${discount} promotional rate for your upcoming branch appointment.`
    );
  };

  return (
    <section
      id="offers"
      className="relative py-24 sm:py-36 bg-[#161616] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
    >
      {/* Energetic Luxury Ambient Backdrops */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#ECA53D]/12 blur-[190px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-[#C46A3B]/15 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECA53D]/10 border border-[#ECA53D]/35 backdrop-blur-md mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#ECA53D] animate-ping" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              SPECIAL OFFERS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-6"
          >
            A Little More Glam.{' '}
            <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              A Lot More Savings.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-2xl mx-auto leading-relaxed"
          >
            Treat yourself to a fresh new look with our limited-time salon
            offers. Choose your favourite treatment and enjoy more while spending
            less.
          </motion.p>
        </div>

        {/* 2 Featured High-Fashion Promotion Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {offers.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className={`relative rounded-3xl overflow-hidden border backdrop-blur-2xl transition-all duration-500 flex flex-col justify-between group shadow-2xl ${
                offer.isPopular
                  ? 'bg-gradient-to-b from-[#1C1C1C] via-[#1C1C1C]/95 to-black border-[#ECA53D]/50 shadow-[#ECA53D]/10 hover:border-[#ECA53D]'
                  : 'bg-gradient-to-b from-[#1C1C1C] via-[#1C1C1C]/90 to-black border-white/10 hover:border-[#ECA53D]/40'
              }`}
            >
              {/* Top Visual Image with Glow Overlay */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.headline}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-[#1C1C1C]/50 to-transparent" />

                {/* Offer Floating Badge */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-[#1C1C1C]/90 border border-white/20 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                    {offer.number} — {offer.category}
                  </span>
                </div>

                {/* Big Energetic Discount Pill */}
                <div className="absolute top-5 right-5 px-4 sm:px-5 py-2 rounded-2xl bg-[#ECA53D] text-[#1C1C1C] font-extrabold text-base sm:text-lg tracking-tight shadow-xl shadow-[#ECA53D]/30 flex items-center gap-1.5 animate-bounce">
                  <span>{offer.discountBadge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECA53D]/10 border border-[#ECA53D]/25 text-[11px] font-bold text-[#ECA53D] uppercase tracking-wider mb-4">
                    <span>✨ {offer.offerSummary}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif-luxury text-[#F5F5F2] font-bold tracking-tight mb-4">
                    {offer.headline}
                  </h3>

                  <p className="text-sm sm:text-base text-[#F5F5F2]/80 leading-relaxed mb-8">
                    {offer.description}
                  </p>
                </div>

                {/* Action Area */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() =>
                      handleClaimOffer(offer.headline, offer.discountBadge)
                    }
                    className="w-full py-4 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest border border-[#F5F5F2]/40 shadow-2xl shadow-[#ECA53D]/35 hover:shadow-[#ECA53D]/55 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{offer.ctaText}</span>
                    <span className="transition-transform group-hover/btn:translate-x-1.5 font-sans">
                      →
                    </span>
                  </button>

                  <p className="text-[11px] text-[#F5F5F2]/50 text-center tracking-wide">
                    {offer.smallText}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
