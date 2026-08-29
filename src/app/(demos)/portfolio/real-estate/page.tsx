'use client';

import React from 'react';
import './real-estate.css';
import { RealEstateNavbar } from './components/RealEstateNavbar';
import { RealEstateHero } from './components/RealEstateHero';
import { RealEstateSignaturePlaces } from './components/RealEstateSignaturePlaces';
import { RealEstatePropertyGrid } from './components/RealEstatePropertyGrid';
import { RealEstateLocations } from './components/RealEstateLocations';
import { RealEstateTrustPillars } from './components/RealEstateTrustPillars';
import { RealEstateListProperty } from './components/RealEstateListProperty';
import { RealEstateTestimonials } from './components/RealEstateTestimonials';
import { RealEstateFooter } from './components/RealEstateFooter';

export default function RealEstateDemoPage() {
  return (
    <div className="realestate-root min-h-screen w-full bg-[#FAF9F6] text-[#141416] flex flex-col justify-start font-sans overflow-x-hidden">
      {/* ── Top Floating Glassmorphic Navbar ────────────────── */}
      <RealEstateNavbar />

      {/* ── Main Landing Page Content ──────────────────────── */}
      <main className="w-full">
        {/* ── Section 1: Hero Section (Two-Phase Curtain Reveal) ── */}
        <RealEstateHero />

        {/* ── Section 2: Signature Places ────────────────────────── */}
        <RealEstateSignaturePlaces />

        {/* ── Section 3: Interactive Sri Lanka Property Finder & Inventory ── */}
        <RealEstatePropertyGrid />

        {/* ── Section 4: Prime Sri Lankan Neighborhoods & Hotspots ── */}
        <RealEstateLocations />

        {/* ── Section 5: Trust & Legal Security Pillars ─────────── */}
        <RealEstateTrustPillars />

        {/* ── Section 6: "List Your Property with Us" Seller Engine ─ */}
        <RealEstateListProperty />

        {/* ── Section 7: Verified Client Testimonials ────────────── */}
        <RealEstateTestimonials />
      </main>

      {/* ── Section 8: Private Viewing Scheduler & Editorial Footer ── */}
      <RealEstateFooter />
    </div>
  );
}


