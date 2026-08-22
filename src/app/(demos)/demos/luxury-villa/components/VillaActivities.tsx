'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  highlight: string;
  image: string;
}

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'tea-trekking',
    tag: 'Estate Walk',
    title: 'Guided Tea Estate Trekking',
    description:
      'Stroll through winding pathways of lush green tea bushes, breathe in the crisp mountain air, and witness the authentic art of tea plucking up close.',
    highlight: 'Easy to Moderate Pace',
    image: '/demos/villa/activity-tea-trek.jpg',
  },
  {
    id: 'ridge-hiking',
    tag: 'Mountain Trail',
    title: 'Mountain Ridge Hiking',
    description:
      'Set out on scenic trails surrounding the peaks. Perfect for nature lovers looking for an exhilarating hike with panoramic valley views.',
    highlight: 'Scenic Viewpoints & Forest Trails',
    image: '/demos/villa/activity-hiking.jpg',
  },
  {
    id: 'sunrise-deck',
    tag: 'Morning Ritual',
    title: 'Sunrise Above the Clouds',
    description:
      'Wake up to golden rays breaking through the sea of mist right outside your deck. Enjoy a freshly brewed cup of Ceylon tea while watching the hills come alive.',
    highlight: 'Best View from Private Deck',
    image: '/demos/villa/activity-sunrise.jpg',
  },
];

export const VillaActivities: React.FC = () => {
  return (
    <section id="activities" className="relative py-20 sm:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono font-bold tracking-widest uppercase mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Experiences &amp; Adventures</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]"
          >
            Immerse Yourself in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700">
              Nature
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl mx-auto mt-4"
          >
            Explore the untouched beauty of the misty hills right from your doorstep.
          </motion.p>
        </div>

        {/* ── 3-Column Interactive Expandable Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-9">
          {ACTIVITIES_DATA.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className="group relative h-[460px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border border-slate-200/80 bg-slate-900 flex flex-col justify-between p-6 sm:p-8 cursor-pointer"
            >
              {/* Background Photograph */}
              <Image
                src={activity.image}
                alt={activity.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay (Darkens bottom in resting state to emphasize title; clears gracefully on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:from-black/85 group-hover:via-black/25 group-hover:to-transparent transition-all duration-500 ease-out" />

              {/* Top Bar: Subtle Category Pill */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-semibold tracking-wider uppercase">
                  {activity.tag}
                </span>

                {/* Micro Expand Indicator Icon */}
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  <span className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                    ↗
                  </span>
                </div>
              </div>

              {/* Bottom Content Container (Reveals Description & Key Highlight on Hover) */}
              <div className="relative z-10 space-y-3 transform transition-all duration-500">
                {/* Main Card Title (Always visible & emphasized) */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] group-hover:text-emerald-200 transition-colors">
                  {activity.title}
                </h3>

                {/* Expandable Short Description (Hidden in resting state, smoothly appears on hover) */}
                <div className="max-h-0 opacity-0 group-hover:max-h-44 group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden">
                  <p className="text-xs sm:text-[13px] text-slate-200 font-light leading-relaxed pt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                    {activity.description}
                  </p>
                </div>

                {/* Key Highlight Badge (Fades in on hover) */}
                <div className="max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 transition-all duration-500 delay-75 ease-out overflow-hidden pt-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activity.highlight}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
