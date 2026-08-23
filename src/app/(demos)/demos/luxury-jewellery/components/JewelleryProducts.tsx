'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { JewelleryTiltCard } from './JewelleryTiltCard';

interface ProductItem {
  id: string;
  name: string;
  price: string;
  rating: number;
  image: string;
}

const BEST_SELLERS: ProductItem[] = [
  {
    id: 'bs-1',
    name: 'Diamond Solitaire Ring',
    price: '$1,250.00',
    rating: 5,
    image: '/demos/luxury-jewellery/featured/rings.webp',
  },
  {
    id: 'bs-2',
    name: 'Classic Pendant Necklace',
    price: '$880.00',
    rating: 5,
    image: '/demos/luxury-jewellery/featured/necklace.png',
  },
  {
    id: 'bs-3',
    name: 'Pearl Drop Earrings',
    price: '$750.00',
    rating: 5,
    image: '/demos/luxury-jewellery/featured/earing.webp',
  },
  {
    id: 'bs-4',
    name: 'Tennis Bracelet',
    price: '$1,120.00',
    rating: 5,
    image: '/demos/luxury-jewellery/card-3.jpeg',
  },
];

const NEW_ARRIVALS: ProductItem[] = [
  {
    id: 'na-1',
    name: 'Floral Diamond Ring',
    price: '$1,520.00',
    rating: 5,
    image: '/demos/luxury-jewellery/card-1.jpeg',
  },
  {
    id: 'na-2',
    name: 'Gold Chain Necklace',
    price: '$990.00',
    rating: 5,
    image: '/demos/luxury-jewellery/featured/necklace (2).png',
  },
  {
    id: 'na-3',
    name: 'Hoop Earrings',
    price: '$620.00',
    rating: 5,
    image: '/demos/luxury-jewellery/featured/earing.png',
  },
  {
    id: 'na-4',
    name: 'Charm Bracelet',
    price: '$830.00',
    rating: 5,
    image: '/demos/luxury-jewellery/card-4.jpeg',
  },
];

function ProductCard({ product, index }: { product: ProductItem; index: number }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col space-y-3"
    >
      <JewelleryTiltCard maxTilt={10} scaleHover={1.04} className="w-full aspect-square rounded-2xl bg-white border border-[#0D2D25]/10 overflow-hidden flex items-center justify-center transition-all duration-500 shadow-sm hover:shadow-xl hover:border-[#C6A05F]/50 cursor-pointer">
        
        {/* Heart Wishlist Button with Burst */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-[#FAF6F0]/90 backdrop-blur-sm flex items-center justify-center text-[#0D2D25]/60 hover:text-red-500 transition-colors shadow-sm"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </motion.button>

        {/* Heart Particle Burst on click */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute pointer-events-none text-red-500 text-3xl z-30"
            >
              ♥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image */}
        <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-112 pointer-events-none">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 140px, 180px"
            className="object-cover object-center"
          />
        </div>
      </JewelleryTiltCard>

      {/* Product Details */}
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-medium text-[#0D2D25] truncate group-hover:text-[#84642c] transition-colors font-sans">
          {product.name}
        </h4>
        <p className="text-xs font-semibold text-[#C6A05F] font-mono">
          {product.price}
        </p>

        {/* 5 Stars */}
        <div className="flex items-center gap-0.5 text-[#C6A05F] text-xs">
          {[...Array(product.rating)].map((_, i) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i + 0.3 }}
            >
              ★
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function JewelleryProducts() {
  return (
    <section className="relative w-full py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] text-[#0D2D25] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* ── 2-Column Split Grid: BEST SELLERS & NEW ARRIVALS ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14">
          
          {/* Column 1: BEST SELLERS */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#0D2D25]/15">
              <h3 className="font-italiana text-xl sm:text-2xl text-[#0D2D25] tracking-wider uppercase font-normal">
                Best Sellers
              </h3>
              <motion.a
                whileHover={{ x: 3 }}
                href="#collection"
                className="text-xs uppercase font-semibold tracking-widest text-[#C6A05F] hover:text-[#0D2D25] transition-colors"
              >
                View All →
              </motion.a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {BEST_SELLERS.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </motion.div>

          {/* Column 2: NEW ARRIVALS */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#0D2D25]/15">
              <h3 className="font-italiana text-xl sm:text-2xl text-[#0D2D25] tracking-wider uppercase font-normal">
                New Arrivals
              </h3>
              <motion.a
                whileHover={{ x: 3 }}
                href="#collection"
                className="text-xs uppercase font-semibold tracking-widest text-[#C6A05F] hover:text-[#0D2D25] transition-colors"
              >
                View All →
              </motion.a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {NEW_ARRIVALS.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
