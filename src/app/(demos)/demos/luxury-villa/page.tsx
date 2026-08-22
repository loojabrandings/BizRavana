'use client';

import React from 'react';
import './luxury-villa.css';
import { VillaNavbar } from './components/VillaNavbar';
import { VillaHero } from './components/VillaHero';
import { VillaFacilities } from './components/VillaFacilities';
import { VillaActivities } from './components/VillaActivities';
import { VillaSpaces } from './components/VillaSpaces';
import { VillaRates } from './components/VillaRates';
import { VillaBooking } from './components/VillaBooking';
import { VillaFooter } from './components/VillaFooter';

export default function LuxuryVillaDemoPage() {
  return (
    <div className="villa-root min-h-screen">
      {/* ── Section 1: Navigation Bar ─────────────────────────── */}
      <VillaNavbar />

      {/* ── Main Content Flow ─────────────────────────────────── */}
      <main id="top">
        {/* Section 2: Hero Experience */}
        <VillaHero />

        {/* Section 3: Facilities (Subtle Amenity Ribbon) */}
        <VillaFacilities />

        {/* Section 4: Activities & Experiences (3-Column Interactive Cards) */}
        <VillaActivities />

        {/* Section 5: The Sanctuary / Spaces (Reference Layout Carousel) */}
        <VillaSpaces />

        {/* Section 6: Rates & Packages (3-Column Bespoke Pricing Grid) */}
        <VillaRates />

        {/* Section 7: Direct Booking & Check Availability */}
        <VillaBooking />
      </main>

      {/* ── Section 8: Luxury Footer ──────────────────────────── */}
      <VillaFooter />
    </div>
  );
}
