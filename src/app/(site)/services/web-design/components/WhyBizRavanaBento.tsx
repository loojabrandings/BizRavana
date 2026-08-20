"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const POINTS = [
  {
    num: "01",
    title: "Custom, Not Cookie-Cutter",
    desc: "Every website is designed around your business instead of forcing your brand into a generic template.",
  },
  {
    num: "02",
    title: "Mobile-First by Default",
    desc: "Your website is designed to work beautifully on the devices your customers use every day.",
  },
  {
    num: "03",
    title: "Built for Business",
    desc: "From WhatsApp enquiries to product showcases and contact forms, every element has a purpose.",
  },
  {
    num: "04",
    title: "One-on-One Support",
    desc: "You work directly with the people building your website, from the first conversation to launch.",
  },
];

export default function WhyBizRavanaBento() {
  return (
    <section id="why-us" className="py-24 relative bg-[#040406]">
      <div className="wd-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
          
          {/* Left Column: Big Heading & Subtitle Block matching screenshot layout */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Big two-line heading */}
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-12 select-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] to-[#fd3a25]">
                Why
              </span>
              <br />
              <span className="text-white">BizRavana.</span>
            </h2>

            {/* Subtitle Block */}
            <div className="space-y-3.5 mt-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase tracking-wider">
                Built Around Your Business
              </h3>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-sm font-normal">
                We don&apos;t just build websites that look good. We create digital experiences that fit your brand, your customers, and the way your business actually works.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Compact Feature Rows with Circular Check Badges */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            {POINTS.map((point, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex items-start gap-6 group"
                >
                  {/* Circular Check Badge */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-white/[0.04] border border-white/10 text-neutral-400 group-hover:border-[#fd3a25]/30 group-hover:text-white group-hover:bg-white/[0.06]"
                  >
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </div>

                  {/* Content Block */}
                  <div className="flex-1 text-left pt-1">
                    <h4
                      className="text-lg font-bold tracking-tight mb-1.5 transition-colors duration-300 text-white group-hover:text-[#ff6b57]"
                    >
                      {point.title}
                    </h4>
                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-normal">
                      {point.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
