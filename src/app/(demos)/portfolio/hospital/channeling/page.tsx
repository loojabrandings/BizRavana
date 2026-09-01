'use client';

import React from 'react';
import '../hospital.css';
import '../services/services.css';
import { LifeCareNavbar } from '../components/LifeCareNavbar';
import { LifeCareChannelingHero } from '../components/LifeCareChannelingHero';
import { LifeCareChannelingList } from '../components/LifeCareChannelingList';
import { LifeCareFooter } from '../components/LifeCareFooter';

export default function LifeCareChannelingPage() {
  return (
    <div className="svc-page min-h-screen w-full bg-white text-[#0D1527] selection:bg-[#102BDC] selection:text-white flex flex-col justify-start relative">
      <LifeCareNavbar activePage="Channeling" />

      <main className="w-full">
        {/* Section 1: Channeling Hero */}
        <LifeCareChannelingHero />

        {/* Section 2: Specialty Panel (expandable cards) */}
        <LifeCareChannelingList />
      </main>

      {/* Global Hospital Footer (id="contact") */}
      <LifeCareFooter />
    </div>
  );
}