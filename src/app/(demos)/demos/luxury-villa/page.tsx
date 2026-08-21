'use client';

import React from 'react';
import { useDemoToast } from '@/components/demos/DemoToastContext';

export default function LuxuryVillaDemoPage() {
  const { showDemoToast } = useDemoToast();

  return (
    <div className="w-full min-h-screen bg-[#0A1118] text-[#EDF2F7] flex flex-col items-center justify-center p-6 text-center">
      {/* Ready for Section by Section Implementation */}
      <div className="max-w-xl space-y-4 p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
          Demo Landing Page Ready
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Hotels & Villas Demo
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Folder structure and isolated routing setup complete. Ready for section-by-section UI implementation (Hero, Suites/Villas, Amenities, Gallery, Date Reservation).
        </p>
        <div className="pt-4">
          <button
            onClick={() => showDemoToast('Reservation Inquired', 'This demonstrates instant direct booking inquiries.')}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Test Demo Interaction
          </button>
        </div>
      </div>
    </div>
  );
}
