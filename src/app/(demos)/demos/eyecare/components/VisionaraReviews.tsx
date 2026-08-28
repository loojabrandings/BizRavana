'use client';

import React from 'react';
import { Star, CheckCircle, MapPin, Quote } from 'lucide-react';

export function VisionaraReviews() {
  const reviews = [
    {
      name: 'Kavinda Alwis',
      location: 'Colombo 05',
      service: 'Computer Screen Glasses',
      badgeColor: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
      rating: 5,
      comment:
        'I am a software engineer working 10+ hours a day. I used to have bad headaches every evening. Dr. Asela recommended their BlueShield glasses. Within 2 days, my eye strain was completely gone. Worth every rupee!',
      time: 'Verified Visit • 2 weeks ago',
    },
    {
      name: 'Malini Rajapakse',
      location: 'Kandy',
      service: 'Senior Glaucoma & Cataract Check',
      badgeColor: 'bg-teal-950/60 text-teal-300 border-teal-800/40',
      rating: 5,
      comment:
        'Dr. Nimalka took great care of my mother. The checkup was totally painless and done in 20 minutes. Very polite staff and everything was explained clearly in Sinhala. Highly recommend to everyone in Kandy.',
      time: 'Verified Visit • 1 month ago',
    },
    {
      name: 'Dharshana Senanayake',
      location: 'Nugegoda',
      service: 'Titanium Prescription Frames',
      badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
      rating: 5,
      comment:
        'The frame is so lightweight that I don’t even feel it on my nose. They cut my lenses and delivered the glasses to my home in Colombo the very same afternoon. Amazing customer service!',
      time: 'Verified Visit • 3 weeks ago',
    },
    {
      name: 'Dr. Shenali De Silva',
      location: 'Galle',
      service: 'Children Eye Exam & Glasses',
      badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
      rating: 5,
      comment:
        'Brought my 7-year-old daughter who was struggling to see the classroom whiteboard. The doctor was so gentle and patient. My daughter loves her flexible pink frame and her school marks improved immediately.',
      time: 'Verified Visit • 2 months ago',
    },
  ];

  // Duplicate for seamless infinite loop (1234 1234 1234 1234...)
  const carouselItems = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <section className="relative w-full py-28 md:py-36 bg-transparent text-white overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10">
      {/* ── CSS KEYFRAMES FOR INFINITE SMOOTH MARQUEE ── */}
      <style jsx>{`
        @keyframes scrollMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-infinite-carousel {
          display: flex;
          width: max-content;
          animation: scrollMarquee 38s linear infinite;
        }
        .animate-infinite-carousel:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-14 lg:px-20">
        {/* ── SECTION HEADER & GOOGLE RATING BADGE ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 md:mb-16 gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-950/60 border border-amber-800/40 text-[11px] font-bold tracking-[0.2em] text-amber-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>06 // REAL PATIENT STORIES</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Loved By Families
              <br />
              <span className="text-amber-400">Across Sri Lanka.</span>
            </h2>
          </div>

          {/* Google 4.9 Stars Badge Banner */}
          <div className="p-5 bg-zinc-950 border border-amber-500/30 flex items-center space-x-6 shrink-0 shadow-2xl">
            <div className="text-center">
              <span className="font-['Syne',sans-serif] text-4xl font-black text-amber-400 block">
                4.9
              </span>
              <div className="flex items-center space-x-1 text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
            <div className="border-l border-white/10 pl-6 text-xs text-white/70 space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">
                Google Verified Reviews
              </p>
              <p>Over 1,850+ 5-Star ratings across Colombo, Kandy & Galle.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── AUTO-MOVING INFINITE CAROUSEL TRACK (1234 1234 1234...) ── */}
      <div className="relative w-full overflow-hidden pt-2">
        {/* Left & Right Soft Fade Gradients (Theme-aware) */}
        <div className="review-fade-left absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none" />
        <div className="review-fade-right absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none" />

        <div className="animate-infinite-carousel flex space-x-6 px-6">
          {carouselItems.map((rev, idx) => (
            <div
              key={idx}
              className="w-[340px] sm:w-[420px] md:w-[460px] shrink-0 p-8 bg-zinc-950 border border-white/10 hover:border-white/40 transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden group select-none shadow-xl"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/[0.03] group-hover:text-blue-500/10 transition-colors" />

              <div className="space-y-4 relative z-10">
                {/* Rating & Service tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${rev.badgeColor}`}>
                    {rev.service}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                  “{rev.comment}”
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-['Syne',sans-serif] font-bold text-white uppercase text-sm">
                    {rev.name}
                  </h4>
                  <div className="flex items-center space-x-1 text-white/50 text-[11px] mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{rev.location}, Sri Lanka</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Patient</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="max-w-7xl mx-auto px-6 md:px-14 lg:px-20 mt-6 text-center">
        <span className="text-[11px] text-white/50 uppercase tracking-widest font-mono">
          • Hover over any card to pause reading •
        </span>
      </div>
    </section>
  );
}
