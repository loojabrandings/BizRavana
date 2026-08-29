'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Star,
  Quote,
  CheckCircle2,
  Award,
  ThumbsUp,
  MessageSquareHeart,
} from 'lucide-react';

const PRESS_QUOTES = [
  {
    quote: 'The crispest, most authentic organic juice of the year.',
    source: 'VOGUE WELLNESS',
    tag: 'Editor’s Choice',
  },
  {
    quote: 'TerraViva redefines canned drinks. Zero sugar, pure botanical vitality.',
    source: 'BON APPÉTIT',
    tag: 'Best Clean Drink',
  },
  {
    quote: 'The gold standard for raw, cold-pressed fruit purity in eco-aluminum.',
    source: 'GQ PURSUITS',
    tag: 'Drink of the Month',
  },
];

const CUSTOMER_REVIEWS = [
  {
    name: 'Elena Rostova',
    role: 'Verified Buyer',
    flavor: 'Alphonso Mango Pack',
    rating: 5,
    date: '2 days ago',
    title: 'Tastes like an actual fresh mango grove.',
    content:
      'I was skeptical about canned juice, but the first sip felt like biting into an actual ripe Alphonso mango under the sun. Pure, thick nectar with zero artificial sweetness.',
    color: '#E58A13',
  },
  {
    name: 'Marcus Thorne',
    role: 'Certified Nutritionist',
    flavor: 'Ruby Delum 12-Pack',
    rating: 5,
    date: '1 week ago',
    title: 'Zero sugar crash, genuine live antioxidants.',
    content:
      'As a sports nutritionist, I inspect every label. TerraViva has 0g added sugar, raw living enzymes, and zero synthetic preservatives. My entire athlete roster is hooked.',
    color: '#BE2B45',
  },
  {
    name: 'Aria Chen',
    role: 'Verified Buyer',
    flavor: 'Discovery Variety Box',
    rating: 5,
    date: '3 days ago',
    title: 'The Pink Guava is unforgettable.',
    content:
      'The Variety Pack is the best purchase I made this year. The Pink Guava is subtly sweet and tart, and the chilled aluminum cans retain incredible carbonation-free freshness.',
    color: '#4E9A68',
  },
  {
    name: 'David Keller',
    role: 'Verified Buyer',
    flavor: 'Wild Passion Pack',
    rating: 5,
    date: '5 days ago',
    title: 'Electric, authentic tropical kick.',
    content:
      'Wild Passion has that authentic zesty passionfruit kick that commercial sodas could never replicate. Fresh, crisp, and no sugar crash afterwards. Subscribed monthly.',
    color: '#e7c818',
  },
  {
    name: 'Sophia Lorenzen',
    role: 'Holistic Health Coach',
    flavor: 'Discovery Variety Box',
    rating: 5,
    date: '2 weeks ago',
    title: 'Finally, real cold-pressed in aluminum.',
    content:
      'Finding true cold-pressed juice in infinitely recyclable aluminum instead of toxic plastic bottles is a game changer for conscious living. 10/10 recommendation.',
    color: '#29B6F6',
  },
  {
    name: 'Julian Vance',
    role: 'Verified Buyer',
    flavor: 'Pink Guava 12-Pack',
    rating: 5,
    date: '1 week ago',
    title: 'You can taste the living enzymes.',
    content:
      'The depth of flavor is astonishing. You can taste the genuine whole fruit pulp and natural mountain water. Once you try TerraViva, standard supermarket juices taste fake.',
    color: '#4E9A68',
  },
];

export function TerraVivaReviews() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [-110, 110]);

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative w-full bg-black text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient Glow with Parallax */}
      <motion.div
        style={{ y: ambientGlowY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div
          style={{
            width: 'clamp(380px, 65vw, 950px)',
            height: 'clamp(380px, 65vw, 950px)',
            background: 'radial-gradient(circle, rgba(229,138,19,0.12) 0%, rgba(78,154,104,0.08) 50%, transparent 75%)',
            filter: 'blur(80px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 1. Header (Animated on Scroll) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              4.9/5 OVER 2,400+ VERIFIED DRINKERS
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            LOVED BY THOUSANDS. BACKED BY TASTE.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
            Over 25,000+ organic cans delivered across the country. See what critics and daily health enthusiasts say about the TerraViva difference.
          </p>
        </motion.div>

        {/* 2. Press Quotes Showcase Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 sm:mb-20">
          {PRESS_QUOTES.map((press, idx) => (
            <motion.div
              key={press.source}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative p-6 sm:p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {press.tag}
                </span>
                <Quote className="w-5 h-5 text-white/20" />
              </div>

              <p className="text-base sm:text-lg font-medium text-white/90 leading-snug my-2">
                &ldquo;{press.quote}&rdquo;
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span
                  className="text-sm font-normal uppercase tracking-widest text-white/60"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  {press.source}
                </span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3. Customer Reviews Grid (6 Reviews with Staggered Parallax Float) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: (idx % 3) * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden cursor-pointer"
            >
              {/* Subtle top-right accent light */}
              <div
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full pointer-events-none blur-2xl opacity-15 group-hover:opacity-35 transition-opacity duration-500"
                style={{ backgroundColor: rev.color }}
              />

              <div>
                {/* Header: Stars & Flavor */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-white/40">{rev.date}</span>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rev.color }} />
                  <span>{rev.flavor}</span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight leading-snug mb-2 group-hover:text-emerald-400 transition-colors">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  {rev.content}
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wide">{rev.name}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {rev.role}
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase text-white/30 px-2 py-0.5 rounded bg-white/5">
                  100% Raw
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. Bottom Satisfaction Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-4 px-8 rounded-2xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>98.6% Customer Satisfaction Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-400" />
              <span>Over 25,000+ Cans Shipped</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-rose-400" />
              <span>30-Day Pure Taste Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TerraVivaReviews;
