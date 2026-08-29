'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Play, Pause } from 'lucide-react';
import Image from 'next/image';

interface KineticTrainersProps {
  onOpenModal: (trainer?: string) => void;
}

export function KineticTrainers({ onOpenModal }: KineticTrainersProps) {
  const [activeTrainerIndex, setActiveTrainerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const trainers = [
    {
      id: 1,
      name: 'KAVINDA SILVA',
      indexLabel: '/1',
      title: 'Strength & Hypertrophy Specialist',
      bio: 'National bodybuilding podium coach, progressive overload architect, and precision physique sculpting in Colombo.',
      experience: '9+ Years Exp.',
      rating: '4.9 ★★★★★',
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=900&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'DINESH PERERA',
      indexLabel: '/2',
      title: 'Cricket & Rugby Athletic Conditioning',
      bio: 'Former national club strength coach, explosive power output, sprint mechanics, and sports injury prevention.',
      experience: '7+ Years Exp.',
      rating: '5.0 ★★★★★',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'SHENAL FERNANDO',
      indexLabel: '/3',
      title: 'MetCon & Rapid Fat Loss Coach',
      bio: 'Metabolic conditioning expert, customized Sri Lankan macronutrient planning, and rapid body recomposition.',
      experience: '8+ Years Exp.',
      rating: '4.9 ★★★★★',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=900&auto=format&fit=crop',
    },
    {
      id: 4,
      name: 'ROSHAN JAYASURIYA',
      indexLabel: '/4',
      title: 'Mobility & Olympic Weightlifting',
      bio: 'Joint longevity, clean & jerk / snatch biomechanics, and corrective rehabilitation for corporate professionals.',
      experience: '11+ Years Exp.',
      rating: '5.0 ★★★★★',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=900&auto=format&fit=crop',
    },
  ];

  // Auto change trainers every 4.5 seconds (pauses on mouse hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTrainerIndex((prev) => (prev + 1) % trainers.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, trainers.length]);

  const currentTrainer = trainers[activeTrainerIndex];

  return (
    <section
      id="trainers"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#E10600]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Auto-play Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-7xl mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
              <span className="font-poppins text-xs uppercase tracking-[0.2em] text-[#E10600] font-semibold">
                Master Coaches
              </span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-none mb-4">
              EXPERT <span className="text-[#E10600]">TRAINERS</span>
            </h2>
            <p className="font-poppins text-xs sm:text-sm md:text-base text-[#9A9A9A] font-light leading-relaxed">
              Certified national trainers guide you step-by-step for safe workouts and faster results.
            </p>
          </div>

          {/* Micro Auto-rotation Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-poppins text-neutral-400 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">
              {isPaused ? 'Paused (Hovering)' : 'Auto-Rotating (4.5s)'}
            </span>
          </div>
        </div>

        {/* 3-Column Interactive Trainer Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Trainer List Selector (Clean Typography with Auto-Progress Bars) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            {trainers.map((t, idx) => {
              const isActive = idx === activeTrainerIndex;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTrainerIndex(idx);
                  }}
                  className="group w-full text-left py-2 px-0 bg-transparent border-0 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span
                        className={`font-bebas text-2xl sm:text-3xl transition-colors duration-300 ${
                          isActive ? 'text-[#E10600]' : 'text-neutral-600 group-hover:text-neutral-400'
                        }`}
                      >
                        {t.indexLabel}
                      </span>
                      <span
                        className={`font-bebas text-3xl sm:text-4xl lg:text-[42px] tracking-wider transition-all duration-300 ${
                          isActive
                            ? 'text-white translate-x-2'
                            : 'text-[#9A9A9A] group-hover:text-white'
                        }`}
                      >
                        {t.name}
                      </span>
                    </div>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#E10600] shadow-[0_0_12px_#E10600]" />
                    )}
                  </div>

                  {/* Dynamic Progress Bar for active coach during auto-change */}
                  {isActive && !isPaused && (
                    <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden mt-2">
                      <motion.div
                        key={idx}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        className="h-full bg-[#E10600]"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Center Column: Featured Trainer Photo (Clean, Borderless, Background-Free with Smooth Crossfade) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTrainer.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentTrainer.image}
                    alt={currentTrainer.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center filter brightness-95 contrast-105"
                    priority
                  />
                  {/* Subtle bottom vignette to blend naturally into dark background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-80 pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Trainer Details & CTA */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrainer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-3 w-full"
              >
                <span className="font-poppins text-xs uppercase tracking-widest text-[#E10600] font-semibold">
                  Specialization
                </span>
                
                <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide leading-tight">
                  {currentTrainer.title}
                </h3>

                <p className="font-poppins text-sm sm:text-base text-[#9A9A9A] font-light leading-relaxed">
                  {currentTrainer.bio}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => onOpenModal(`Personal Session with ${currentTrainer.name}`)}
              className="mt-2 px-8 py-3.5 rounded-full bg-[#E10600] text-white font-poppins text-sm font-semibold uppercase tracking-wider overflow-hidden group shadow-lg shadow-[#E10600]/40 hover:shadow-[#E10600]/70 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span>GET IN TOUCH</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
