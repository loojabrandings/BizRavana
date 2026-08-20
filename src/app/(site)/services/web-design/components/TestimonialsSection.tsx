"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "BizRavana gave Art of Frames a website that finally feels like an extension of our brand. Customers can easily explore our products, browse our gallery, check details and get in touch with us. The overall experience feels clean, modern and professional.",
    author: "Founder",
    role: "Art of Frames",
    image: "/images/web-design/artofframes-preview.png",
  },
  {
    quote: "The new Cafe Vibe website gave our business a much stronger online presence. It presents our brand, menu and atmosphere in a simple and engaging way, while making it much easier for customers to discover and contact us.",
    author: "Manager",
    role: "Cafe Vibe",
    image: "/images/web-design/cafevibe-preview.png",
  },
];

export default function TestimonialsSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto-play / Rotate reviews every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const activeTestimonial = TESTIMONIALS[currentIdx];

  return (
    <section id="testimonials" className="py-28 relative bg-[#040406] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#fd3a25]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading, Rating, Quote, Author & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div>
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-300 mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#fd3a25] animate-pulse" />
                <span className="text-[#ff6b57] font-black uppercase tracking-wider">[ CLIENT FEEDBACK ]</span>
              </div>

              {/* Large Main Heading */}
              <h2 className="text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08] mb-10">
                What Our <br />
                Clients Say
              </h2>

              {/* Dynamic Quote & Author Area */}
              <div className="min-h-[160px] relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <p className="text-base sm:text-lg text-neutral-200 font-normal leading-relaxed">
                      &ldquo;{activeTestimonial.quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-1 h-5 bg-[#fd3a25] rounded-full" />
                      <div className="text-sm font-bold text-white">
                        {activeTestimonial.author}
                        <span className="text-xs font-normal text-neutral-400 ml-2 font-mono">
                          | {activeTestimonial.role}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Slider Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] max-w-md">
              <div className="flex items-center gap-3">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Testimonial"
                  className="w-12 h-12 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Testimonial"
                  className="w-12 h-12 rounded-full bg-white hover:bg-neutral-200 text-white flex items-center justify-center font-bold shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Number Index Indicator */}
              <div className="text-sm font-mono tracking-widest text-neutral-400">
                <span className="text-white font-bold">0{currentIdx + 1}</span>
                <span className="text-neutral-600 mx-1">/</span>
                <span>0{TESTIMONIALS.length}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Frame with Live Client Website Screenshot */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] aspect-[16/11] rounded-[32px] sm:rounded-[36px] bg-[#0d0e14] p-3 border border-white/[0.1] shadow-2xl shadow-black/90 relative overflow-hidden group">
              <div className="w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden relative bg-[#000000] border border-white/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={activeTestimonial.image}
                      alt={activeTestimonial.role}
                      fill
                      priority
                      className="object-cover object-top opacity-95 group-hover:scale-102 transition-transform duration-500"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
