'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Target, Zap, Users, Rocket, LucideIcon } from 'lucide-react';

interface Program {
  number: string;
  category: string;
  headline: string;
  description: string;
  ctaText: string;
  icon: LucideIcon;
}

const PROGRAMS: Program[] = [
  {
    number: '01',
    category: 'Strength & Muscle',
    headline: 'Build Strength. Build Muscle.',
    description:
      'Structured resistance training designed to help you build strength, increase muscle and become more powerful.',
    ctaText: 'EXPLORE PROGRAM',
    icon: Dumbbell,
  },
  {
    number: '02',
    category: 'Burn Fat. Build Confidence.',
    headline: 'Weight Loss',
    description:
      'A balanced approach combining effective workouts and consistent training to help you work toward a leaner, healthier body.',
    ctaText: 'EXPLORE PROGRAM',
    icon: Flame,
  },
  {
    number: '03',
    category: 'Train With Expert Guidance.',
    headline: 'Personal Training',
    description:
      'One-on-one coaching tailored to your fitness level, goals and progress, with every session focused on getting the most from your training.',
    ctaText: 'BOOK A SESSION',
    icon: Target,
  },
  {
    number: '04',
    category: 'Move Better. Perform Better.',
    headline: 'Functional Fitness',
    description:
      'Improve strength, mobility, endurance and overall movement with dynamic training designed for real-world fitness.',
    ctaText: 'EXPLORE PROGRAM',
    icon: Zap,
  },
  {
    number: '05',
    category: 'Train Together. Push Further.',
    headline: 'Group Training',
    description:
      'High-energy group sessions that combine structured workouts, motivation and a community that keeps you moving.',
    ctaText: 'VIEW SCHEDULE',
    icon: Users,
  },
  {
    number: '06',
    category: 'Start Strong. Start Right.',
    headline: 'Beginner Program',
    description:
      'New to the gym? Build confidence, learn proper technique and develop a strong foundation at your own pace.',
    ctaText: 'START HERE',
    icon: Rocket,
  },
];

export const GymPrograms: React.FC = () => {
  return (
    <section id="programs" className="relative bg-[#050505] text-[#FEF9F5] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-white/10">
      
      {/* ── Ambient Radial Lighting ─────────────────────────── */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#7B7457]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* ── Section Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-[#CCFF00]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
              TRAIN YOUR WAY
            </span>
          </div>

          <h2 className="font-impact italic text-4xl sm:text-6xl lg:text-7xl uppercase leading-[0.95] text-[#FEF9F5] mb-5">
            A PROGRAM FOR <br />
            <span className="text-[#CCFF00]">EVERY GOAL.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#FEF9F5]/70 leading-relaxed font-normal max-w-2xl">
            Whether you&apos;re here to build strength, transform your body, improve your fitness or simply feel better, find a training program built around your goals.
          </p>
        </motion.div>

        {/* ── 6 Programs Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {PROGRAMS.map((prog, idx) => {
            const IconComponent = prog.icon;

            return (
              <motion.div
                key={prog.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[#0e0e0e] hover:bg-[#141414] border border-white/10 hover:border-[#CCFF00]/40 rounded-3xl p-7 sm:p-9 transition-all duration-400 flex flex-col justify-between hover:shadow-2xl hover:shadow-[#CCFF00]/10"
              >
                {/* Card Top: Number & Lucide Icon */}
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="font-impact italic text-2xl sm:text-3xl text-[#FEF9F5]/30 group-hover:text-[#CCFF00] transition-colors">
                        {prog.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FEF9F5]/50">
                        {prog.category}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00] group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Headline & Body */}
                  <h3 className="font-impact italic text-2xl sm:text-3xl uppercase tracking-tight text-[#FEF9F5] mb-3 group-hover:text-[#CCFF00] transition-colors">
                    {prog.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#FEF9F5]/60 leading-relaxed font-normal">
                    {prog.description}
                  </p>
                </div>

                {/* Card Bottom CTA Link */}
                <div className="pt-8 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('membership');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#CCFF00] group-hover:text-white transition-colors"
                  >
                    <span>{prog.ctaText}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </div>

                {/* Corner Glow Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/0 group-hover:bg-[#CCFF00]/10 rounded-tr-3xl rounded-bl-full blur-xl transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA Banner ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-gradient-to-r from-[#101908] via-[#0c1407] to-[#080808] border border-[#CCFF00]/30 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00] block">
                CUSTOM RECOMMENDATION
              </span>
              <h3 className="font-impact italic text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#FEF9F5]">
                NOT SURE WHICH PROGRAM IS RIGHT FOR YOU?
              </h3>
              <p className="text-xs sm:text-sm text-[#FEF9F5]/70 leading-relaxed font-normal">
                Tell us your goal and we&apos;ll help you find the right place to start.
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('contact') || document.getElementById('membership');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs sm:text-sm tracking-[0.15em] uppercase px-7 sm:px-9 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#CCFF00]/20 hover:scale-105"
              >
                <span>FIND MY PROGRAM</span>
                <span className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center text-black text-xs transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
