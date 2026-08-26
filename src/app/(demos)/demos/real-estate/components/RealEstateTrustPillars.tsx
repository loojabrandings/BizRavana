'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  Users2, 
  Globe2, 
  Clock4, 
  ShieldCheck, 
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';

const PILLARS = [
  {
    icon: FileCheck2,
    number: '01',
    title: '100% Attorney-Vetted Legal Deeds',
    subtitle: 'Zero Title Risk Guarantee',
    description: 'Every property undergoes comprehensive 30-year title searches, Bim Saviya registration cross-checks, and encumbrance inspections by leading senior attorneys before being accepted into our portfolio.',
    benefits: ['Clear ownership verification', 'No pending court litigation', 'Bank mortgage pre-approved'],
  },
  {
    icon: Users2,
    number: '02',
    title: 'Direct Owner Representation',
    subtitle: 'No Shadow Broker Chains',
    description: 'We represent genuine property owners directly. Say goodbye to informal broker chains that inflate prices and delay transactions. Enjoy transparent, fair-market negotiations with verified paperwork.',
    benefits: ['Transparent commission structure', 'Direct seller meetings', 'Verified valuation benchmark'],
  },
  {
    icon: Globe2,
    number: '03',
    title: 'Diaspora & Expat VIP Concierge',
    subtitle: 'Seamless Remote Acquisition',
    description: 'Tailored for Sri Lankans living in the UK, Australia, USA, Canada, and the UAE. We provide 4K live video inspections, independent structural audits, dual-currency payment channels, and Power of Attorney handling.',
    benefits: ['Live FaceTime/Zoom walkthroughs', 'Escrow legal facilitation', 'Post-purchase tenant management'],
  },
  {
    icon: Clock4,
    number: '04',
    title: 'Fast-Track 30-Day Liquidation',
    subtitle: 'Private High-Net-Worth Network',
    description: 'Looking to sell your luxury home or apartment? Our confidential VIP buyer database consists of over 1,200 verified high-net-worth investors, family offices, and multinational corporate buyers ready to execute.',
    benefits: ['Complimentary professional photoshoot', 'Private discrete matching', 'Targeted international marketing'],
  },
];

export function RealEstateTrustPillars() {
  return (
    <section id="why-us" className="relative w-full py-24 sm:py-32 bg-[#F3F1ED] text-[#141416] select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF] mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
                Security & Transparency
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl text-[#141416] leading-[1.02] tracking-tight">
              <span className="re-font-sans font-light uppercase tracking-wider block text-2xl sm:text-4xl text-[#141416]/70 mb-1">
                The Standard of
              </span>
              <span className="re-font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight block text-[#141416]">
                Legal Integrity
              </span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[#6E7178] max-w-md font-normal leading-relaxed">
            Real estate in Sri Lanka requires uncompromising legal scrutiny. We protect your wealth with unshakeable legal diligence and confidential representation.
          </p>
        </div>

        {/* ── 4 Pillars Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group p-8 sm:p-10 rounded-3xl bg-white border border-[#E8E5DF] shadow-sm hover:shadow-xl hover:border-[#141416]/25 transition-all duration-400 flex flex-col justify-between"
              >
                <div>
                  {/* Top Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#E8E5DF] flex items-center justify-center text-[#141416] group-hover:bg-[#141416] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#A8895E] group-hover:text-[#C5A880] transition-colors" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-mono font-light text-[#141416]/25">
                      {pillar.number}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <span className="text-xs uppercase tracking-widest text-[#A8895E] font-semibold block mb-1">
                    {pillar.subtitle}
                  </span>
                  <h3 className="re-font-serif text-2xl sm:text-3xl text-[#141416] font-normal tracking-tight mb-3">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#6E7178] leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                {/* Benefits Bullet List */}
                <div className="pt-6 border-t border-[#E8E5DF] flex flex-col gap-2.5">
                  {pillar.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#141416] font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
