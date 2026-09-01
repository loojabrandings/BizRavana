'use client';

import React from 'react';
import '../hospital.css';
import './services.css';
import { LifeCareNavbar } from '../components/LifeCareNavbar';
import { LifeCareServicesPageHero } from '../components/LifeCareServicesPageHero';
import { LifeCareServicesDirectory } from '../components/LifeCareServicesDirectory';
import { LifeCareEmergencyBand } from '../components/LifeCareEmergencyBand';
import { LifeCareFooter } from '../components/LifeCareFooter';

export default function LifeCareServicesPage() {
  return (
    <div className="svc-page min-h-screen w-full bg-white text-[#0D1527] selection:bg-[#102BDC] selection:text-white flex flex-col justify-start relative">
      <LifeCareNavbar activePage="Services" />

      <main className="w-full">
        {/* Section 1: Futuristic Hero + Services Ticker */}
        <LifeCareServicesPageHero />

        {/* Section 2: The 27-Unit Directory (filterable ledger) */}
        <LifeCareServicesDirectory />

        {/* Section 3: 24 HRS Emergency Band */}
        <LifeCareEmergencyBand />
      </main>

      {/* Global Hospital Footer (id="contact") */}
      <LifeCareFooter />
    </div>
  );
}