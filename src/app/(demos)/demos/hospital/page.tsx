'use client';

import React from 'react';
import './hospital.css';
import { LifeCareNavbar } from './components/LifeCareNavbar';
import { LifeCareHero } from './components/LifeCareHero';
import { LifeCarePanelGrid } from './components/LifeCarePanelGrid';
import { LifeCareAbout } from './components/LifeCareAbout';
import { LifeCareServices } from './components/LifeCareServices';
import { LifeCareDoctors } from './components/LifeCareDoctors';
import { LifeCareWhyChooseUs } from './components/LifeCareWhyChooseUs';
import { LifeCareAppointment } from './components/LifeCareAppointment';
import { LifeCareFooter } from './components/LifeCareFooter';

export default function LifeCareHospitalLandingPage() {
  return (
    <div className="min-h-screen w-full bg-white text-[#0D1527] selection:bg-[#102BDC] selection:text-white flex flex-col justify-start relative">
      {/* ── Hero Section (Exact 100vh Full Viewport) ─────────────── */}
      <div className="h-screen min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between relative overflow-hidden bg-white">
        {/* Clean Hero Background Image (No color overlay) */}
        <img
          src="/demos/hospital/hero1.jpeg"
          alt="LifeCare Hospital Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 select-none pointer-events-none"
        />

        {/* Top Sticky Navbar */}
        <div className="relative z-30">
          <LifeCareNavbar />
        </div>

        {/* Hero Center Content with Standard Margins */}
        <div className="relative z-10 my-auto">
          <LifeCareHero />
        </div>

        {/* 3-Panel Bottom Strip with Standard Margins */}
        <div className="relative z-20">
          <LifeCarePanelGrid />
        </div>
      </div>

      {/* ── Main Landing Page Content ────────────────────────────── */}
      <main className="w-full">
        {/* Section 2: About Us */}
        <LifeCareAbout />

        {/* Section 3: Our Services and Facilities */}
        <LifeCareServices />

        {/* Section 4: Meet Our Doctors */}
        <LifeCareDoctors />

        {/* Section 5: Why Choose Us */}
        <LifeCareWhyChooseUs />

        {/* Section 6: Book an Appointment */}
        <LifeCareAppointment />
      </main>

      {/* ── Global Hospital Footer (id="contact") ─────────────────── */}
      <LifeCareFooter />
    </div>
  );
}
