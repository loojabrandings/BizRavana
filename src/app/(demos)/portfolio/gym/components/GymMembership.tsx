'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface Plan {
  id: string;
  number: string;
  name: string;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}

const PLANS: Plan[] = [
  {
    id: 'flex',
    number: '01',
    name: 'FLEX',
    period: 'Monthly Membership',
    description: 'Perfect for those who want the freedom to train without a long-term commitment.',
    popular: false,
    features: [
      'Full gym access',
      'All standard equipment',
      'Flexible month-to-month membership',
      'Locker facilities',
    ],
    ctaText: 'JOIN NOW',
  },
  {
    id: 'commit',
    number: '02',
    name: 'COMMIT',
    period: '3 Month Membership',
    description: 'Stay consistent and save more with a membership built for real progress.',
    popular: false,
    features: [
      'Full gym access',
      'All standard equipment',
      'Progress tracking',
      'Member support',
      '3-month commitment',
    ],
    ctaText: 'JOIN NOW',
  },
  {
    id: 'transform',
    number: '03',
    name: 'TRANSFORM',
    period: '6 Month Membership',
    description: 'Commit to your goals and give yourself the time to make a lasting transformation.',
    popular: true,
    features: [
      'Full gym access',
      'All standard equipment',
      'Progress tracking',
      'Priority trainer guidance',
      '6-month commitment',
    ],
    ctaText: 'START YOUR TRANSFORMATION',
  },
];

export const GymMembership: React.FC = () => {
  return (
    <section id="membership" className="relative bg-[#080808] text-[#FEF9F5] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-white/10">
      
      {/* ── Ambient Glows ───────────────────────────────────── */}
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-[#CCFF00]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#7B7457]/10 rounded-full blur-[150px] pointer-events-none" />

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
              MEMBERSHIP
            </span>
          </div>

          <h2 className="font-impact italic text-4xl sm:text-6xl lg:text-7xl uppercase leading-[0.95] text-[#FEF9F5] mb-5">
            CHOOSE YOUR COMMITMENT.<br />
            <span className="text-[#CCFF00]">BUILD YOUR STRENGTH.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#FEF9F5]/70 leading-relaxed font-normal max-w-2xl">
            Simple membership options designed to fit your goals, your schedule and the way you like to train.
          </p>
        </motion.div>

        {/* ── 3 Membership Plans Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, idx) => {
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-400 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#141b0b] to-[#0e1208] border-2 border-[#CCFF00] shadow-2xl shadow-[#CCFF00]/15 lg:-translate-y-3'
                    : 'bg-[#0f0f0f] border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Pill Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black font-bold text-[10px] tracking-[0.2em] uppercase px-4 py-1 rounded-full shadow-lg shadow-[#CCFF00]/40 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 fill-black" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#FEF9F5]/40 block mb-1">
                        PLAN {plan.number}
                      </span>
                      <h3 className="font-impact italic text-3xl sm:text-4xl uppercase tracking-tight text-[#FEF9F5]">
                        {plan.name}
                      </h3>
                    </div>
                    <span
                      className={`font-impact italic text-3xl sm:text-4xl ${
                        isPopular ? 'text-[#CCFF00]' : 'text-[#FEF9F5]/20'
                      }`}
                    >
                      {plan.number}
                    </span>
                  </div>

                  <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#CCFF00] mb-3">
                    {plan.period}
                  </span>

                  <p className="text-xs sm:text-sm text-[#FEF9F5]/60 leading-relaxed font-normal mb-8">
                    {plan.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-3.5 pt-2 mb-8">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPopular
                              ? 'bg-[#CCFF00] text-black'
                              : 'bg-white/10 text-[#CCFF00]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-[#FEF9F5]/80 font-normal leading-tight">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-4 rounded-full font-bold text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group ${
                      isPopular
                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#CCFF00]/25 hover:scale-[1.02]'
                        : 'bg-white/10 hover:bg-[#CCFF00] text-white hover:text-black border border-white/15 hover:border-[#CCFF00]'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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
