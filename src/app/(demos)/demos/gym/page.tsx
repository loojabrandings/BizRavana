'use client';

import React from 'react';
import './gym.css';
import { GymNav } from './components/GymNav';
import { GymHero } from './components/GymHero';
import { GymWhyUs } from './components/GymWhyUs';
import { GymPrograms } from './components/GymPrograms';
import { GymFacilities } from './components/GymFacilities';
import { GymMembership } from './components/GymMembership';
import { GymFinalCTA } from './components/GymFinalCTA';
import { GymContact } from './components/GymContact';
import { GymFooter } from './components/GymFooter';

export default function GymDemoPage() {
  return (
    <div className="gym-root">
      {/* ── Section 1: Navigation Bar ─────────────────────────── */}
      <GymNav />

      {/* ── Main Content Flow ─────────────────────────────────── */}
      <main>
        {/* Section 2: Hero Experience */}
        <GymHero />

        {/* Section 3: Why Choose Us (Editorial Index, No Cards) */}
        <GymWhyUs />

        {/* Section 4: Programs & Training */}
        <GymPrograms />

        {/* Section 5: The Gym & Facility Gallery */}
        <GymFacilities />

        {/* Section 6: Membership Options */}
        <GymMembership />

        {/* Section 7: Final Conversion CTA (No Cards) */}
        <GymFinalCTA />

        {/* Section 8: Contact & Location */}
        <GymContact />
      </main>

      {/* ── Section 9: Simple Footer ──────────────────────────── */}
      <GymFooter />
    </div>
  );
}
