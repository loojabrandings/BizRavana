'use client';

import React from 'react';
import './terraviva.css';
import { TerraVivaNavbar } from './components/TerraVivaNavbar';
import { TerraVivaHero } from './components/TerraVivaHero';
import { TerraVivaFeatures } from './components/TerraVivaFeatures';
import { TerraVivaCollection } from './components/TerraVivaCollection';
import { TerraVivaComparison } from './components/TerraVivaComparison';
import { TerraVivaProcess } from './components/TerraVivaProcess';
import { TerraVivaReviews } from './components/TerraVivaReviews';
import { TerraVivaFAQ } from './components/TerraVivaFAQ';
import { TerraVivaFooter } from './components/TerraVivaFooter';

export default function DrinkDemoPage() {
  return (
    <>
      {/* Font preconnects & Google Fonts stylesheet */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <main className="w-full min-h-screen overflow-x-hidden bg-black">
        {/* ── TOP FIXED NAVBAR WITH SECTION LINKS ─────────── */}
        <TerraVivaNavbar />

        {/* ── SECTION 1: HERO ──────────────────────────────── */}
        <TerraVivaHero />

        {/* ── SECTION 2: FEATURES (8 features, empty center placeholder, no image) ── */}
        <TerraVivaFeatures />

        {/* ── SECTION 3: FLAVOR COLLECTION & VARIETY PACK ── */}
        <TerraVivaCollection />

        {/* ── SECTION 4: COMPARISON TABLE (TerraViva vs Conventional) ── */}
        <TerraVivaComparison />

        {/* ── SECTION 5: THE FARM-TO-CAN JOURNEY (HOW IT'S MADE) ── */}
        <TerraVivaProcess />

        {/* ── SECTION 6: CUSTOMER LOVE & PRESS QUOTES (SOCIAL PROOF) ── */}
        <TerraVivaReviews />

        {/* ── SECTION 7: FAQ & NUTRITIONAL FACTS ── */}
        <TerraVivaFAQ />

        {/* ── SECTION 8: HIGH-CONVERTING FINAL CTA & LUXURY FOOTER ── */}
        <TerraVivaFooter />
      </main>
    </>
  );
}
