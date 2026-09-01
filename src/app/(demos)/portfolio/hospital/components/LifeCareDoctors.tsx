'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const DOCTORS = [
  {
    name: 'Dr. H.M.M.S Bandaranayaka',
    specialty: 'Chief Medical Consultant',
    image: '/demos/hospital/doctor-1.jpeg',
  },
  {
    name: 'Dr. Anura Wickramasinghe',
    specialty: 'Consultant Cardiologist',
    image: '/demos/hospital/doctor-3.jpeg',
  },
  {
    name: 'Dr. Samanthi Fernando',
    specialty: 'Pediatric Specialist',
    image: '/demos/hospital/doctor-2.jpeg',
  },
  {
    name: 'Dr. Priyantha Dissanayake',
    specialty: 'General & Laparoscopic Surgeon',
    image: '/demos/hospital/doctor-4.jpeg',
  },
  {
    name: 'Dr. Menaka Ratnayake',
    specialty: 'Consultant Physician (VOG)',
    image: '/demos/hospital/doctor-5.jpeg',
  },
  {
    name: 'Dr. Kanishka Jayasuriya',
    specialty: 'Consultant Eye Surgeon',
    image: '/demos/hospital/doctor-6.jpeg',
  },
];

// Tripled list for infinite seamless loop without jump
const EXTENDED_DOCTORS = [...DOCTORS, ...DOCTORS, ...DOCTORS];

export function LifeCareDoctors() {
  const ref = useScrollReveal();
  const [currentIndex, setCurrentIndex] = useState(DOCTORS.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // Seamless silent jump at edges
  const handleTransitionEnd = () => {
    if (currentIndex >= DOCTORS.length * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - DOCTORS.length);
    } else if (currentIndex < DOCTORS.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + DOCTORS.length);
    }
  };

  // Restore transition after silent reset
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Auto-play every 3500ms
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section
      id="doctors"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Column: Editorial & Action Button ─────────────── */}
          <div className="lg:col-span-4 flex flex-col items-start z-10 reveal-slide-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Doctors</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-dm-sans font-bold text-3xl sm:text-4xl lg:text-[38px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
              Experienced Specialist <span className="text-[#102BDC]">Doctors</span>
            </h2>

            {/* Narrative Subtitle */}
            <p className="font-inter font-normal text-sm sm:text-base text-[#475569] leading-[1.6] mb-8 max-w-md">
              Our team of dedicated consultants and medical specialists is ready to provide the finest clinical care and specialized treatment for you and your family.
            </p>

            {/* Primary Action Button */}
            <Link
              href="/portfolio/hospital/doctors"
              className="inline-flex items-center gap-2.5 bg-[#102BDC] text-white px-7 py-4 rounded-xl font-inter font-medium text-sm sm:text-base hover:bg-[#0C22B0] active:scale-[0.98] shadow-lg shadow-[#102BDC]/25 transition-all group"
            >
              <span>View All Doctors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Right Column: Truly Endless Infinite Carousel ───────── */}
          <div
            className="lg:col-span-8 w-full overflow-hidden py-4 -my-4 relative reveal-slide-right"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Floating Navigation Controls */}
            <div className="hidden sm:flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-2 right-2 pointer-events-none z-20">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Doctor"
                className="w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#0D1527] hover:text-[#102BDC] hover:scale-110 active:scale-95 transition-all pointer-events-auto shadow-slate-300/60"
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Doctor"
                className="w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#0D1527] hover:text-[#102BDC] hover:scale-110 active:scale-95 transition-all pointer-events-auto shadow-slate-300/60"
              >
                <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            </div>

            {/* Sliding Continuous Track */}
            <div
              onTransitionEnd={handleTransitionEnd}
              className="flex will-change-transform"
              style={{
                transform: `translateX(calc(-${currentIndex} * (100% / 3)))`,
                transition: isTransitioning
                  ? 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)'
                  : 'none',
              }}
            >
              {EXTENDED_DOCTORS.map((doc, idx) => (
                <div
                  key={idx}
                  className="w-[80%] sm:w-[50%] lg:w-[33.333%] flex-shrink-0 px-2 sm:px-2.5"
                >
                  <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#102BDC]/30 transition-all duration-300 flex flex-col justify-between h-full">
                    {/* Top: Flush Image with Zero Padding */}
                    <div className="w-full aspect-[3/4] bg-slate-100 overflow-hidden relative">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Bottom: Doctor Credentials Base */}
                    <div className="p-4 sm:p-5 text-center flex flex-col items-center bg-white">
                      <h3 className="font-dm-sans font-bold text-sm sm:text-base text-[#0D1527] leading-snug group-hover:text-[#102BDC] transition-colors line-clamp-1">
                        {doc.name}
                      </h3>
                      <p className="font-inter text-xs text-[#64748B] mt-1 leading-tight line-clamp-1">
                        {doc.specialty}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Carousel Navigation Controls */}
            <div className="flex sm:hidden items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Doctor"
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0D1527] active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Doctor"
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0D1527] active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
