'use client';

import React from 'react';
import './clothing.css';
import { ClothingNavbar } from './components/ClothingNavbar';
import { ClothingHero } from './components/ClothingHero';
import { ClothingCategories } from './components/ClothingCategories';
import { ClothingBestSellers } from './components/ClothingBestSellers';
import { ClothingManifestoBanner } from './components/ClothingManifestoBanner';
import { ClothingFooter } from './components/ClothingFooter';

export default function ClothingDemoPage() {
  return (
    <div className="clothing-root min-h-screen !bg-white text-[#120F1D] flex flex-col justify-start font-sans overflow-x-hidden">
      {/* ── Top Navigation Bar ────────────────────────────── */}
      <ClothingNavbar />

      {/* ── Main Landing Page Content ──────────────────────── */}
      <main className="w-full">
        {/* ── Section 1: Hero Section ─────────────────────── */}
        <ClothingHero />
        
        {/* ── Section 2: Shop By Category ─────────────────── */}
        <ClothingCategories />

        {/* ── Section 3: Best Sellers Archive ─────────────── */}
        <ClothingBestSellers />

        {/* ── Section 4: Brand Manifesto Banner ───────────── */}
        <ClothingManifestoBanner />
      </main>

      {/* ── Section 5: Global Clothing Footer ──────────────── */}
      <ClothingFooter />
    </div>
  );
}
