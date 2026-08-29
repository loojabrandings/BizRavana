'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Flame, Zap, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

interface KineticProgramsProps {
  onOpenModal: (program?: string) => void;
}

export function KineticPrograms({ onOpenModal }: KineticProgramsProps) {
  return (
    <section id="programs" className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E10600]/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <span className="font-poppins text-xs uppercase tracking-[0.25em] text-[#E10600] font-semibold block mb-3">
            OUR PROGRAM
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl md:text-7xl lg:text-[76px] text-white tracking-wide leading-[0.95] uppercase">
            PROGRAMS DESIGNED <br />
            <span className="text-white">FOR EVERY FITNESS LEVEL</span>
          </h2>
        </div>

        {/* Asymmetric Bento Grid Matching Reference */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Left Tall Card (Personal Training) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => onOpenModal('Personal Training')}
            className="md:col-span-4 lg:col-span-3 rounded-[28px] bg-black border border-white/10 hover:border-[#E10600]/60 p-7 sm:p-8 flex flex-col justify-between min-h-[460px] md:min-h-[520px] transition-all duration-500 group cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(225,6,0,0.2)]"
          >
            {/* Top Dumbbell Icon */}
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E10600] group-hover:scale-110 transition-transform">
              <Dumbbell className="w-7 h-7 -rotate-45" />
            </div>

            {/* Bottom Content */}
            <div className="flex flex-col gap-3 mt-12">
              <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide group-hover:text-[#E10600] transition-colors leading-none">
                PERSONAL TRAINING
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#9A9A9A] font-light leading-relaxed">
                1-on-1 coaching with SLBF certified national champions and customized Sri Lankan meal planning.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 font-poppins text-xs font-semibold text-[#E10600] tracking-wider uppercase group-hover:underline underline-offset-4">
                <span>VIEW DETAILS</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Middle Column: Stacked 2 Cards (Yoga & Highlighted Fitness Classes) */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-6">
            
            {/* Top Card: Yoga & Flexibility */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => onOpenModal('Power Yoga & Mobility')}
              className="flex-1 rounded-[28px] bg-black border border-white/10 hover:border-[#E10600]/60 p-7 sm:p-8 flex flex-col justify-between transition-all duration-500 group cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(225,6,0,0.2)] min-h-[240px]"
            >
              {/* Top Lotus / Activity Icon */}
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[#E10600] group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>

              {/* Bottom Content */}
              <div className="flex flex-col gap-2 mt-6">
                <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide group-hover:text-[#E10600] transition-colors leading-none">
                  YOGA & MOBILITY
                </h3>
                <p className="font-poppins text-xs text-[#9A9A9A] font-light leading-relaxed">
                  Dynamic power yoga flows, hip & shoulder mobility, and posture correction for desk professionals.
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 font-poppins text-xs font-semibold text-[#E10600] tracking-wider uppercase group-hover:underline underline-offset-4">
                  <span>VIEW DETAILS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Bottom Card: Highlighted Accent Card (Fitness Classes) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => onOpenModal('HIIT & Strength Classes')}
              className="flex-1 rounded-[28px] bg-[#E10600] p-7 sm:p-8 flex flex-col justify-between transition-all duration-500 group cursor-pointer shadow-2xl shadow-[#E10600]/30 hover:shadow-[#E10600]/60 hover:scale-[1.01] min-h-[240px] text-black"
            >
              {/* Top Flexed Bicep / Strength Icon */}
              <div className="w-11 h-11 rounded-xl bg-black/15 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-black" />
              </div>

              {/* Bottom Content */}
              <div className="flex flex-col gap-2 mt-6">
                <h3 className="font-bebas text-2xl sm:text-3xl text-black tracking-wide leading-none">
                  FITNESS CLASSES
                </h3>
                <p className="font-poppins text-xs text-black/85 font-medium leading-relaxed">
                  High-energy Colombo group sessions combining metabolic barbell circuits and endurance sprints.
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 font-poppins text-xs font-bold text-black tracking-wider uppercase group-hover:underline underline-offset-4">
                  <span>VIEW DETAILS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Card 3: Right Featured Card (Weight Loss with Split Photo) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => onOpenModal('Fat Loss Recomposition')}
            className="md:col-span-4 lg:col-span-5 rounded-[28px] bg-black border border-white/10 hover:border-[#E10600]/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 group cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(225,6,0,0.2)] min-h-[460px] md:min-h-[520px]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 h-full items-stretch">
              
              {/* Inner Left Column: Text & Icon */}
              <div className="sm:col-span-5 flex flex-col justify-between py-2 order-2 sm:order-1">
                {/* Top Flame / Cardio Icon */}
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-[#E10600] group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>

                <div className="flex flex-col gap-3 mt-6 sm:mt-0">
                  <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide group-hover:text-[#E10600] transition-colors leading-none">
                    WEIGHT LOSS
                  </h3>
                  <p className="font-poppins text-xs sm:text-sm text-[#9A9A9A] font-light leading-relaxed">
                    Rapid body fat reduction paired with local macro-nutrient dietary plans for lasting transformation.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 font-poppins text-xs font-semibold text-[#E10600] tracking-wider uppercase group-hover:underline underline-offset-4">
                    <span>VIEW DETAILS</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Inner Right Column: Athlete Deadlift Photo */}
              <div className="sm:col-span-7 relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-full bg-neutral-900 border border-white/5 order-1 sm:order-2">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop"
                  alt="Dumbbell Training Athlete"
                  fill
                  sizes="(max-width: 768px) 100vw, 35vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
