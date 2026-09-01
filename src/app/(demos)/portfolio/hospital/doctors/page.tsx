'use client';

import React from 'react';
import '../hospital.css';
import '../services/services.css';
import { LifeCareNavbar } from '../components/LifeCareNavbar';
import { LifeCareDoctorsPageHero } from '../components/LifeCareDoctorsPageHero';
import { LifeCareDoctorsGrid } from '../components/LifeCareDoctorsGrid';
import { LifeCareDoctorsCTA } from '../components/LifeCareDoctorsCTA';
import { LifeCareFooter } from '../components/LifeCareFooter';

export default function LifeCareDoctorsPage() {
  return (
    <div className="svc-page min-h-screen w-full bg-white text-[#0D1527] selection:bg-[#102BDC] selection:text-white flex flex-col justify-start relative">
      <LifeCareNavbar activePage="Doctors" />

      <main className="w-full">
        {/* Section 1: Doctors Hero */}
        <LifeCareDoctorsPageHero />

        {/* Section 2: The Team Grid */}
        <LifeCareDoctorsGrid />

        {/* Section 3: Booking CTA */}
        <LifeCareDoctorsCTA />
      </main>

      {/* Global Hospital Footer (id="contact") */}
      <LifeCareFooter />
    </div>
  );
}