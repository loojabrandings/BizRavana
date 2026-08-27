'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Check, ArrowUpRight } from 'lucide-react';

interface KineticPricingProps {
  onOpenModal: (plan?: string) => void;
}

export function KineticPricing({ onOpenModal }: KineticPricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'core',
      name: 'CORE ACCESS',
      monthlyPrice: '4,500',
      yearlyPrice: '3,800',
      description: 'Ideal for consistent lifters & cardio builders',
      popular: false,
      features: [
        'Full Gym Access',
        'Cardio Training Zone',
        'Strength Equipment Access',
        'Locker Room Access',
        'Beginner-Friendly Training Guide',
      ],
    },
    {
      id: 'performance',
      name: 'PERFORMANCE',
      monthlyPrice: '8,500',
      yearlyPrice: '7,900',
      description: 'For dedicated athletes & transformation goals',
      popular: true,
      badge: 'MOST POPULAR IN LK',
      features: [
        'Full Gym + Cardio Access',
        'Certified Trainer Support',
        'Structured Workout Programs',
        'Group Training Sessions',
        'Progress & Performance Tracking',
      ],
    },
    {
      id: 'elite',
      name: 'ELITE ATHLETE',
      monthlyPrice: '18,500',
      yearlyPrice: '16,500',
      description: 'VIP 1-on-1 coaching & all-inclusive access',
      popular: false,
      features: [
        'Unlimited Access (Gym, Cardio & Classes)',
        'Dedicated Personal Trainer',
        'Customized Diet & Nutrition Plan',
        'Monthly Body Composition Assessment',
        'Priority Scheduling & Support',
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#E10600]/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Billing Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
              <span className="font-poppins text-xs uppercase tracking-[0.2em] text-[#E10600] font-semibold">
                Membership Options
              </span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-none mb-3">
              CHOOSE <span className="text-[#E10600]">YOUR POWER</span> PLAN
            </h2>
            <p className="font-poppins text-xs sm:text-sm md:text-base text-[#9A9A9A] font-light max-w-lg">
              Flexible memberships for all fitness levels with expert guidance and premium equipment.
            </p>
          </div>

          {/* Monthly / Yearly Toggle Pill */}
          <div className="p-1.5 rounded-full bg-black/80 border border-white/15 flex items-center self-start md:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full font-poppins text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/30'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full font-poppins text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/30'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              YEARLY
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-500 ${
                  isPopular
                    ? 'bg-black border-2 border-[#E10600] shadow-[0_0_40px_rgba(225,6,0,0.3)] lg:-translate-y-2'
                    : 'bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/25 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E10600] text-white font-poppins text-[11px] font-bold tracking-widest uppercase shadow-md shadow-[#E10600]/40">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bebas text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-none">
                      Rs. {price}
                    </span>
                    <span className="font-poppins text-xs sm:text-sm text-[#9A9A9A] uppercase tracking-wider">
                      / MONTH
                    </span>
                  </div>

                  {/* Plan Name & Tagline */}
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider mt-2">
                    {plan.name}
                  </h3>
                  <p className="font-poppins text-xs text-[#9A9A9A] mt-1 font-light min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => onOpenModal(`${plan.name} (Rs. ${price}/mo)`)}
                    className={`w-full mt-6 py-3.5 rounded-full font-poppins text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/40 hover:shadow-[#E10600]/70 hover:scale-[1.02]'
                        : 'bg-white/5 text-white border border-white/20 hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <span>ENROLL NOW</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <div className="w-full h-px bg-white/10 my-6" />

                  {/* Feature List */}
                  <div className="flex flex-col gap-3.5">
                    <span className="font-poppins text-[11px] font-semibold tracking-widest text-[#9A9A9A] uppercase">
                      INCLUDES:
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[#E10600] shrink-0 mt-0.5">
                          <Dumbbell className="w-2.5 h-2.5 -rotate-45" />
                        </div>
                        <span className="font-poppins text-xs sm:text-sm text-white/90 font-light">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 text-center">
                  <span className="font-poppins text-[10px] text-[#9A9A9A]">
                    No long-term contracts • Cancel anytime
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
