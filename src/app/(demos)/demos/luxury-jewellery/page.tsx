'use client';

import React from 'react';
import './luxury-jewellery.css';
import { JewellerySmoothScroll } from './components/JewellerySmoothScroll';
import { JewelleryNavbar } from './components/JewelleryNavbar';
import { JewelleryHero } from './components/JewelleryHero';
import { JewelleryCollections } from './components/JewelleryCollections';
import { JewelleryStory } from './components/JewelleryStory';
import { JewelleryFeatured } from './components/JewelleryFeatured';
import { JewelleryProducts } from './components/JewelleryProducts';
import { JewelleryBanner } from './components/JewelleryBanner';
import { JewelleryReviews } from './components/JewelleryReviews';
import { JewelleryInstagram } from './components/JewelleryInstagram';
import { JewelleryFooter } from './components/JewelleryFooter';

export default function LuxuryJewelleryDemoPage() {
  return (
    <div className="lux-root min-h-screen bg-[#071713] text-[#F6EFE7]">
      {/* ── Inertial Butter-Smooth Lenis Scrolling ─────────────── */}
      <JewellerySmoothScroll />

      {/* ── Section 1: Top Navigation Bar ──────────────────────── */}
      <JewelleryNavbar />

      {/* ── Main Content Flow ──────────────────────────────────── */}
      <main id="top">
        {/* Section 2: Hero Visual Experience with Auto-Cycling Cards */}
        <JewelleryHero />

        {/* Section 3: Curated Collections (Designed To Shine) ──── */}
        <JewelleryCollections />

        {/* Section 4: Our Story (Crafted with Passion, Made for You) */}
        <JewelleryStory />

        {/* Section 5: Signature Highlights (5 Pieces Single-Row) ── */}
        <JewelleryFeatured />

        {/* Section 6: Best Sellers & New Arrivals Split Grids ───── */}
        <JewelleryProducts />

        {/* Section 7: Exclusive Collection Promotional Banner ──── */}
        <JewelleryBanner />

        {/* Section 8: What Our Customers Say (Testimonials) ─────── */}
        <JewelleryReviews />

        {/* Section 9: Follow Us on Instagram (7-Image Gallery) ─── */}
        <JewelleryInstagram />
      </main>

      {/* ── Section 10: Luxury Footer & Newsletter ─────────────── */}
      <JewelleryFooter />
    </div>
  );
}
