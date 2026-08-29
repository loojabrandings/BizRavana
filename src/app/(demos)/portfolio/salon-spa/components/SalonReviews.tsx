'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface ReviewItem {
  id: string;
  stars: number;
  quote: string;
  author: string;
  service: string;
  branch: string;
  avatarInitial: string;
  relativeTime: string;
}

export const SalonReviews: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  const reviews: ReviewItem[] = [
    {
      id: 'r1',
      stars: 5,
      quote:
        'Very good service by Christine. I did a colour and a keratin. She has done a great job. Atmosphere to be improved',
      author: 'Sasitha Hettiwatta',
      service: 'Hair Service',
      branch: 'Maharagama Branch',
      avatarInitial: 'D',
      relativeTime: '2 weeks ago',
    },
    {
      id: 'r2',
      stars: 5,
      quote:
        'I had a great experience at Saloon Boss. They styled my hair very beautifully, and I also did keratin treatment and rebonding. The results were amazing — my hair looks smooth, shiny, and very beautiful now. ',
      author: 'Sachinthra Ashani',
      service: 'Hair Treatment',
      branch: 'Nugegoda Branch',
      avatarInitial: 'S',
      relativeTime: '3 weeks ago',
    },
    {
      id: 'r3',
      stars: 5,
      quote:
        'A great place for both beauty and relaxation. The service was professional, the atmosphere was comfortable, and I left feeling completely refreshed.',
      author: 'Kasun Wijesinghe',
      service: 'Beauty & Wellness',
      branch: 'Kottawa Branch',
      avatarInitial: 'K',
      relativeTime: '1 month ago',
    },
    {
      id: 'r4',
      stars: 5,
      quote:
        'Had my keratin treatment done by Salon Boss Maharagama. My hair feels soft, smooth n much more manageable now. The best thing is the staff was friendly and professional.',
      author: 'Imasha Sashini',
      service: 'Keratine Treatment',
      branch: 'Maharagama Branch',
      avatarInitial: 'I',
      relativeTime: '1 month ago',
    },
    {
      id: 'r5',
      stars: 5,
      quote:
        'Salon Boss Nugegoda branch service is truly exceptional. The staff are very friendly and helpful. I would highly recommend this place to anyone. It will definitely change your day!',
      author: 'Lakeesha Harshani',
      service: 'Hairstyling',
      branch: 'Nugegoda Branch',
      avatarInitial: 'L',
      relativeTime: '2 months ago',
    },
  ];

  // Duplicate for seamless infinite marquee scroll
  const marqueeItems = [...reviews, ...reviews, ...reviews];

  return (
    <section
      id="reviews"
      className="relative py-24 sm:py-36 bg-[#1C1C1C] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
    >
      {/* Background Lighting Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#ECA53D]/10 blur-[190px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              WHAT OUR CLIENTS SAY
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-6"
          >
            Loved by Clients.{' '}
            <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Trusted for Their Style.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            From everyday grooming to special occasions, our clients leave with
            a fresh look, a great experience, and a reason to come back.
          </motion.p>

          {/* Aggregate Rating Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-3 sm:gap-4 px-6 py-2.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/35 backdrop-blur-xl shadow-lg shadow-black/40"
          >
            <div className="flex items-center gap-1 text-[#ECA53D] text-sm">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <span className="h-4 w-[1px] bg-white/20" />
            <div className="text-xs font-semibold text-[#F5F5F2]">
              <span className="text-[#ECA53D] font-bold">4.4 / 5.0</span>
              <span className="text-white/60 ml-1.5 font-normal">
                (280+ Verified Reviews)
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Single Row Infinite Marquee */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent z-20 pointer-events-none" />

        <div className="flex w-max gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {marqueeItems.map((review, idx) => (
            <div
              key={`single-row-${idx}`}
              className="w-[360px] sm:w-[440px] p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-[#ECA53D]/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-2xl shrink-0 group"
            >
              <div>
                {/* Stars & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#ECA53D] text-sm tracking-wider">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#ECA53D]/10 text-[#ECA53D] border border-[#ECA53D]/25">
                    {review.service}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-[#F5F5F2]/85 leading-relaxed italic mb-6">
                  {review.quote}
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ECA53D] text-[#1C1C1C] font-extrabold text-xs flex items-center justify-center shadow-md">
                    {review.avatarInitial}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F2]">
                      {review.author}
                    </h4>
                    <p className="text-[11px] text-[#E2C391]">
                      {review.branch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-white/50">
                  <span className="text-emerald-400">✓</span>
                  <span>Verified Google Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Google Review Link */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mt-12 text-center">
        <button
          onClick={() =>
            showDemoToast(
              'Google Reviews',
              'Connecting to Salon Boss official Google Business reviews.'
            )
          }
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#ECA53D] hover:text-[#F5B453] transition-colors"
        >
          <span>Read all 280+ Reviews on Google</span>
          <span className="font-sans">↗</span>
        </button>
      </div>
    </section>
  );
};
