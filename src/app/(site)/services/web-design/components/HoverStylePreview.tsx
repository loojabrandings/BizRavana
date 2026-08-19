"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function HoverStylePreview() {
  return (
    <section className="py-20 bg-[#020204] border-y border-[#6fc59b]/20 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#6fc59b]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6fc59b]/10 text-[#8be0b7] text-[10px] font-mono font-bold tracking-widest uppercase border border-[#6fc59b]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE HOVER COMPARISON (TRY HOVERING)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Preferred Card Hover Style
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-mono">
            Hover your mouse over each card below to experience the animations &amp; lighting in realtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OPTION 1: Luminous Emerald Mint Aura */}
          <div className="flex flex-col">
            <div className="text-xs font-mono text-[#8be0b7] font-bold mb-2 flex items-center justify-between">
              <span>OPTION 01</span>
              <span className="px-2 py-0.5 rounded bg-[#6fc59b]/15 text-[10px]">RECOMMENDED</span>
            </div>
            <div className="text-sm font-bold text-white mb-3">
              Luminous Emerald Mint Aura
            </div>
            
            {/* The Demo Card 1 */}
            <div className="p-7 rounded-2xl bg-[#090b10] border border-white/[0.08] transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:border-[#6fc59b] hover:shadow-[0_15px_40px_rgba(111,197,155,0.3)] hover:bg-[#0c1310] group flex flex-col justify-between h-72">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#6fc59b]/15 border border-[#6fc59b]/30 text-[#8be0b7] flex items-center justify-center mb-4 group-hover:bg-[#6fc59b] group-hover:text-[#08090d] group-hover:shadow-[0_0_15px_#6fc59b] transition-all">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#8be0b7] transition-colors mb-2">
                  Emerald Radiance
                </h3>
                <p className="text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed">
                  Smooth vertical elevation with a glowing mint perimeter and bioluminescent aura.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-[#8be0b7] transition-colors">
                <span>Try Hovering</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* OPTION 2: Minimalist Matte Glass & Silver Frost */}
          <div className="flex flex-col">
            <div className="text-xs font-mono text-neutral-400 font-bold mb-2">
              <span>OPTION 02</span>
            </div>
            <div className="text-sm font-bold text-white mb-3">
              Matte Glass &amp; Silver Frost
            </div>

            {/* The Demo Card 2 */}
            <div className="p-7 rounded-2xl bg-[#090b10] border border-white/[0.08] transition-all duration-300 cursor-pointer hover:bg-white/[0.08] hover:border-white/35 hover:shadow-2xl hover:shadow-black/90 group flex flex-col justify-between h-72 backdrop-blur-xl">
              <div>
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-white flex items-center justify-center mb-4 group-hover:border-white/30 group-hover:bg-white/[0.12] transition-all">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  Minimalist Frost
                </h3>
                <p className="text-xs text-neutral-400 group-hover:text-white transition-colors leading-relaxed">
                  Apple-inspired subtle frosted glass lighting with crisp silver borders and zero colored glow.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                <span>Try Hovering</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* OPTION 3: Forest Gradient Shift & Icon Invert */}
          <div className="flex flex-col">
            <div className="text-xs font-mono text-neutral-400 font-bold mb-2">
              <span>OPTION 03</span>
            </div>
            <div className="text-sm font-bold text-white mb-3">
              Forest Gradient Shift
            </div>

            {/* The Demo Card 3 */}
            <div className="p-7 rounded-2xl bg-[#090b10] border border-white/[0.08] transition-all duration-500 cursor-pointer hover:border-[#6fc59b]/60 hover:bg-gradient-to-br hover:from-[#0b2418] hover:via-[#091510] hover:to-[#07080c] group flex flex-col justify-between h-72">
              <div>
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-[#8be0b7] flex items-center justify-center mb-4 group-hover:bg-[#6fc59b] group-hover:text-[#08090d] group-hover:scale-110 transition-all">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#8be0b7] transition-colors mb-2">
                  Deep Forest Shift
                </h3>
                <p className="text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed">
                  The entire card background morphs into a rich, deep emerald gradient with an animated solid icon.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-[#8be0b7] transition-colors">
                <span>Try Hovering</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
