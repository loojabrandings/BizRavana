'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check, ArrowRight, X, Heart, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup, useScroll, useTransform } from 'framer-motion';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  cardBg: string;
  accentColor: string;
  image: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  detail: string;
  shipping: string;
}

const BEST_SELLERS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Cobalt Denim Crop',
    category: 'Outerwear',
    price: 'Rs. 2,450',
    originalPrice: 'Rs. 3,200',
    cardBg: '#8EA2EA',
    accentColor: '#6E85DF',
    image: '/demos/clothing/hero1.webp',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Pastel Cobalt', hex: '#8EA2EA' },
      { name: 'Deep Cobalt', hex: '#4F6BF5' },
      { name: 'Midnight Navy', hex: '#1E2445' },
    ],
    description: 'Long-sleeved cropped denim jacket in a soft, premium textured cotton-selvedge blend with tailored drop shoulders and customized brushed chrome hardware.',
    detail: '100% Organic Selvedge Denim. Pre-shrunk & garment washed. Designed and tailored exclusively in Sri Lanka.',
    shipping: 'Free islandwide courier delivery in 2-3 business days. 7-day easy exchange guarantee on all standard sizes.',
  },
  {
    id: 'prod-2',
    name: 'Blush Silk Bodice',
    category: 'Silhouettes',
    price: 'Rs. 3,950',
    originalPrice: 'Rs. 4,800',
    cardBg: '#EAA4BB',
    accentColor: '#D97295',
    image: '/demos/clothing/hero2.webp',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Pastel Blush', hex: '#EAA4BB' },
      { name: 'Rose Petal', hex: '#E65C8C' },
      { name: 'Velvet Wine', hex: '#9C254F' },
    ],
    description: 'An avant-garde sculpted bodice crafted from pure Mulberry silk blend. Designed for effortless evening movement with delicate contoured bust lines.',
    detail: '100% Mulberry Silk Charmeuse. Contoured internal boning support. Invisible back YKK zipper.',
    shipping: 'Complimentary signature gift packaging. Islandwide delivery within 48 hours.',
  },
  {
    id: 'prod-3',
    name: 'Olive Utility Trench',
    category: 'Outerwear',
    price: 'Rs. 2,950',
    originalPrice: 'Rs. 3,800',
    cardBg: '#98B58E',
    accentColor: '#7B9E70',
    image: '/demos/clothing/hero3.webp',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pastel Olive', hex: '#98B58E' },
      { name: 'Forest Sage', hex: '#526E46' },
      { name: 'Earthy Clay', hex: '#D28C6E' },
    ],
    description: 'Structured lightweight utility trench built for effortless day-to-night layering. Crafted from breathable raw linen and organic cotton with deep storm pockets.',
    detail: '70% Raw Linen, 30% Organic Cotton. Dual storm flaps and removable waist tie belt.',
    shipping: 'Free delivery across Sri Lanka. Express same-day delivery available for Colombo & suburbs.',
  },
  {
    id: 'prod-4',
    name: 'Cyber Lavender Drape',
    category: 'Statement Fit',
    price: 'Rs. 6,750',
    originalPrice: 'Rs. 8,200',
    cardBg: '#A99AF8',
    accentColor: '#8362F4',
    image: '/demos/clothing/hero1.webp',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Pastel Lavender', hex: '#A99AF8' },
      { name: 'Electric Violet', hex: '#8362F4' },
      { name: 'Dark Indigo', hex: '#2A1B5E' },
    ],
    description: 'A futuristic draped statement piece designed with fluid asymmetrical hemlines and breathable luxury micro-modal fabric that drapes effortlessly.',
    detail: 'Luxury Lenzing Micro-Modal. Asymmetric sculpted hemline. Ultra-breathable silky texture.',
    shipping: 'Free islandwide shipping. 7-day hassle-free size exchanges included.',
  },
];

export function ClothingBestSellers() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    'prod-1': 'M',
    'prod-2': 'S',
    'prod-3': 'M',
    'prod-4': 'S',
  });
  const [addedState, setAddedState] = useState<Record<string, boolean>>({});

  // Expanded Details State
  const [expandedColor, setExpandedColor] = useState<number>(0);
  const [expandedTab, setExpandedTab] = useState<'desc' | 'detail' | 'shipping'>('desc');
  const [expandedAdded, setExpandedAdded] = useState(false);
  const [expandedWishlist, setExpandedWishlist] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  // Scroll Parallax Hooks (No mouse interaction)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const yHeader = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);
  const yCards = useTransform(scrollYProgress, [0, 1], [40, -30]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1.05, 0.98]);

  const activeProduct = BEST_SELLERS.find((p) => p.id === selectedProductId) || null;

  const handleCardClick = (prod: ProductItem) => {
    if (selectedProductId === prod.id) {
      setSelectedProductId(null);
    } else {
      setSelectedProductId(prod.id);
      setExpandedColor(0);
      setExpandedTab('desc');
      setExpandedAdded(false);
      setExpandedWishlist(false);
    }
  };

  const handleClose = () => {
    setSelectedProductId(null);
  };

  const handleSizeSelect = (e: React.MouseEvent, prodId: string, size: string) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [prodId]: size }));
  };

  const handleAddToCart = (e: React.MouseEvent, prodId: string) => {
    e.stopPropagation();
    setAddedState((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedState((prev) => ({ ...prev, [prodId]: false }));
    }, 2000);
  };

  const handleExpandedAdd = () => {
    setExpandedAdded(true);
    setTimeout(() => {
      setExpandedAdded(false);
    }, 2000);
  };

  const currentActiveCardBg = activeProduct
    ? (activeProduct.colors[expandedColor]?.hex || activeProduct.cardBg)
    : '#8EA2EA';

  return (
    <LayoutGroup id="bestsellers-inline-layout">
      <section 
        ref={sectionRef}
        id="shop" 
        className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-10 sm:pb-16 select-none font-lexend bg-white text-[#120F1D] overflow-hidden"
      >
        
        {/* ── Section Header ───────────────────────────────────── */}
        <motion.div 
          style={{ y: yHeader }}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-left mb-6 sm:mb-8 will-change-transform flex items-end justify-between gap-4"
        >
          <div>
            <span className="font-lexend text-xs uppercase tracking-[0.25em] text-[#8362F4] font-bold block mb-1.5">
              Signature Releases
            </span>
            <h2 className="font-righteous text-3xl sm:text-5xl lg:text-6xl text-[#120F1D] uppercase tracking-tight leading-none">
              Best Sellers
            </h2>
          </div>

          {selectedProductId && (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:border-[#8362F4] text-xs font-bold text-[#120F1D] hover:text-[#8362F4] transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Show All Products</span>
            </button>
          )}
        </motion.div>

        {/* ── Main Dynamic Area: Grid or Left-Aligned Card + Right Details ── */}
        <motion.div 
          style={{ y: yCards }}
          layout
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="relative w-full will-change-transform"
        >
          {/* When NO card is selected: 4 Column Grid */}
          {!selectedProductId ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-stretch">
              {BEST_SELLERS.map((prod, index) => {
                const isAdded = addedState[prod.id];
                const currentSize = selectedSizes[prod.id] || prod.sizes[0];

                return (
                  <motion.div
                    key={prod.id}
                    layoutId={`best-seller-pod-${prod.id}`}
                    onClick={() => handleCardClick(prod)}
                    transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    className="group relative flex flex-col justify-between pt-14 sm:pt-16 cursor-pointer"
                  >
                    {/* ── The Same Pastel Card ── */}
                    <motion.div 
                      layoutId={`card-shape-${prod.id}`}
                      style={{ backgroundColor: prod.cardBg }}
                      className="relative w-full h-[285px] sm:h-[315px] rounded-[2.2rem] p-5 text-white flex flex-col justify-end overflow-visible transition-transform duration-500 group-hover:-translate-y-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                    >
                      {/* Fashion Model Image */}
                      <div 
                        style={{
                          clipPath: 'inset(-250px 0px 0px 0px round 0px 0px 2.2rem 2.2rem)',
                          WebkitClipPath: 'inset(-250px 0px 0px 0px round 0px 0px 2.2rem 2.2rem)',
                        }}
                        className="absolute inset-0 pointer-events-none z-10 flex items-end justify-center overflow-visible"
                      >
                        <motion.div 
                          layoutId={`card-model-${prod.id}`}
                          style={{ scale: scaleImage, transformOrigin: 'bottom center' }}
                          className="w-full h-[380px] sm:h-[415px] flex items-end justify-center will-change-transform"
                        >
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            width={550}
                            height={800}
                            priority={index < 2}
                            className="w-auto h-full object-contain object-bottom block mx-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:scale-105"
                          />
                        </motion.div>
                      </div>

                      {/* Price Pill (shown on grid view) */}
                      <div className="relative z-30 flex items-center justify-end">
                        <motion.div 
                          layoutId={`card-price-${prod.id}`}
                          className="font-righteous text-xl tracking-tight text-white drop-shadow-md bg-black/15 backdrop-blur-xs px-3.5 py-1 rounded-full border border-white/20"
                        >
                          {prod.price}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Metadata Below Card (Category & Title) */}
                    <div className="mt-4 px-1 flex flex-col gap-2.5 font-lexend">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                          {prod.category}
                        </span>
                        <motion.h3 
                          layoutId={`card-name-${prod.id}`}
                          className="font-righteous text-lg sm:text-xl text-[#120F1D] group-hover:text-[#8362F4] transition-colors leading-tight"
                        >
                          {prod.name}
                        </motion.h3>
                      </div>

                      {/* Size Selector & Add to Bag Row */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1">
                          {prod.sizes.map((sz) => {
                            const isSelected = currentSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={(e) => handleSizeSelect(e, prod.id, sz)}
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] font-bold transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-[#120F1D] text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, prod.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all duration-300 ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#8362F4] hover:bg-[#724ee6] text-white shadow-sm hover:shadow-md active:scale-95'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          ) : activeProduct ? (
            /* ── When card is selected: Card height reduced 30%, Image matches right side card height ── */
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
              
              {/* ── Left Side: The SAME Card (Card Height 30% Reduced, Image Matches Right Card Height) ── */}
              <motion.div
                layoutId={`best-seller-pod-${activeProduct.id}`}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="lg:col-span-5 flex flex-col justify-end pt-14 sm:pt-16"
              >
                <motion.div 
                  layoutId={`card-shape-${activeProduct.id}`}
                  style={{ backgroundColor: currentActiveCardBg }}
                  className="relative w-full h-[265px] sm:h-[320px] lg:h-[350px] rounded-[2.5rem] p-0 text-white flex flex-col justify-end overflow-visible shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-colors duration-500"
                >
                  {/* Model Image - Scaled to match the full height of the right details card */}
                  <div 
                    style={{
                      clipPath: 'inset(-380px 0px 0px 0px round 0px 0px 2.5rem 2.5rem)',
                      WebkitClipPath: 'inset(-380px 0px 0px 0px round 0px 0px 2.5rem 2.5rem)',
                    }}
                    className="absolute inset-0 pointer-events-none z-10 flex items-end justify-center overflow-visible"
                  >
                    <motion.div 
                      layoutId={`card-model-${activeProduct.id}`}
                      className="w-full h-[520px] sm:h-[580px] lg:h-[630px] flex items-end justify-center will-change-transform"
                    >
                      <Image
                        src={activeProduct.image}
                        alt={activeProduct.name}
                        width={650}
                        height={950}
                        priority
                        className="w-auto h-full object-contain object-bottom block mx-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ── Right Side: Product Details Panel (No socials, no size guide, no reviews) ── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 bg-neutral-50/80 border border-neutral-200/80 rounded-[2.5rem] p-6 sm:p-10 flex flex-col justify-between gap-6 text-left font-lexend relative shadow-sm"
              >
                {/* Close Button Top Right */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-[#120F1D] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  {/* Category */}
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#8362F4] font-bold">
                      {activeProduct.category}
                    </span>
                  </div>

                  {/* Title in Righteous */}
                  <motion.h3 
                    layoutId={`card-name-${activeProduct.id}`}
                    className="font-righteous text-3xl sm:text-4xl text-[#120F1D] uppercase tracking-tight mb-3 leading-tight"
                  >
                    {activeProduct.name}
                  </motion.h3>

                  {/* Price Row & Offer Badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FF4D4D] text-white text-[11px] font-extrabold uppercase tracking-wider">
                      Special Drop
                    </span>
                    <span className="font-righteous text-2xl sm:text-3xl text-[#120F1D]">
                      {activeProduct.price}
                    </span>
                    <span className="font-lexend text-sm text-neutral-400 line-through">
                      {activeProduct.originalPrice}
                    </span>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold text-neutral-700">
                      Color: <span className="font-medium text-neutral-500">{activeProduct.colors[expandedColor]?.name}</span>
                    </span>
                    <div className="flex items-center gap-2.5">
                      {activeProduct.colors.map((c, i) => {
                        const isColorActive = expandedColor === i;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setExpandedColor(i)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer ${
                              isColorActive 
                                ? 'ring-2 ring-offset-2 ring-[#120F1D] scale-110 shadow-xs' 
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            title={c.name}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector (No size guide link) */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-neutral-700 mb-2">
                      Available Sizes
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeProduct.sizes.map((sz) => {
                        const isSel = (selectedSizes[activeProduct.id] || activeProduct.sizes[0]) === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [activeProduct.id]: sz }))}
                            className={`min-w-10 h-10 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                              isSel
                                ? 'border-2 border-[#120F1D] bg-[#120F1D] text-white shadow-xs'
                                : 'border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons: Buy Now + Add to Cart + Heart */}
                  <div className="flex items-center gap-3 pt-2 mb-6">
                    <button
                      type="button"
                      style={{ backgroundColor: currentActiveCardBg }}
                      className="flex-1 py-3.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer hover:brightness-95"
                    >
                      Buy Now
                    </button>

                    <button
                      type="button"
                      onClick={handleExpandedAdd}
                      className={`flex-1 py-3.5 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        expandedAdded
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-white hover:bg-neutral-100 text-[#120F1D] border-neutral-300 active:scale-95'
                      }`}
                    >
                      {expandedAdded ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Added to Cart ✓</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-neutral-700" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedWishlist(!expandedWishlist)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        expandedWishlist
                          ? 'bg-rose-50 border-rose-300 text-rose-500'
                          : 'border-neutral-300 bg-white text-neutral-400 hover:text-rose-500 hover:border-rose-200'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${expandedWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Switchable Tabs: Product Description / Detail / Shipping */}
                  <div className="border-t border-neutral-200/80 pt-4">
                    <div className="flex items-center gap-6 text-xs font-semibold pb-2 border-b border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setExpandedTab('desc')}
                        className={`pb-1 transition-colors cursor-pointer ${
                          expandedTab === 'desc'
                            ? 'text-[#120F1D] border-b-2 border-[#120F1D] font-bold'
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        Product Description
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedTab('detail')}
                        className={`pb-1 transition-colors cursor-pointer ${
                          expandedTab === 'detail'
                            ? 'text-[#120F1D] border-b-2 border-[#120F1D] font-bold'
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        Detail & Fabric
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedTab('shipping')}
                        className={`pb-1 transition-colors cursor-pointer ${
                          expandedTab === 'shipping'
                            ? 'text-[#120F1D] border-b-2 border-[#120F1D] font-bold'
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        Shipping & Returns
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-3.5 min-h-[60px] text-xs text-neutral-600 leading-relaxed font-normal">
                      {expandedTab === 'desc' && <p>{activeProduct.description}</p>}
                      {expandedTab === 'detail' && <p>{activeProduct.detail}</p>}
                      {expandedTab === 'shipping' && <p>{activeProduct.shipping}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          ) : null}
        </motion.div>

        {/* ── View Full Collection CTA ──────────────────────────── */}
        {!selectedProductId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 sm:mt-14 text-center"
          >
            <a
              href="#collections"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-neutral-300 hover:border-[#8362F4] text-[#120F1D] hover:text-[#8362F4] text-sm font-bold transition-all duration-300 hover:shadow-md group"
            >
              <span>Explore All 120+ Signature Styles</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        )}

      </section>
    </LayoutGroup>
  );
}
