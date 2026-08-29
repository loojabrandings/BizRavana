'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { IMAGES } from '../data/images';
import { CarouselRole } from '../types';

const NOISE_SVG_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

export function TerraVivaHero() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload background image, rock cliff, and all fruit assets on mount
  useEffect(() => {
    const bgHeroImg = new Image();
    bgHeroImg.src = '/demos/drink/hero-bg.webp';

    const rockImg = new Image();
    rockImg.src = '/demos/drink/hero-top.png';

    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
      if (item.bgArtwork) {
        const bgImg = new Image();
        bgImg.src = item.bgArtwork;
      }
    });
  }, []);

  // Handle responsive viewport check (< 640px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // Carousel navigation handler
  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return;

      setIsAnimating(true);
      setActiveIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % IMAGES.length;
        }
        return (prev + 3) % IMAGES.length;
      });

      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      animationTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 650);
    },
    [isAnimating]
  );

  // Auto-play (auto change) interval every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      navigate('next');
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [navigate, isPaused]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const currentItem = IMAGES[activeIndex];

  // Derive role for each item based on activeIndex
  const getRole = (index: number): CarouselRole => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + 3) % IMAGES.length) return 'left';
    if (index === (activeIndex + 1) % IMAGES.length) return 'right';
    return 'back';
  };

  // Get style object for a given role
  const getRoleStyles = (role: CarouselRole): React.CSSProperties => {
    const baseTransition =
      'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1), height 650ms cubic-bezier(0.4, 0, 0.2, 1), bottom 650ms cubic-bezier(0.4, 0, 0.2, 1)';

    switch (role) {
      case 'center':
        return {
          position: 'absolute',
          aspectRatio: '0.45 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMobile ? '58%' : '85%',
          bottom: isMobile ? '4%' : '0%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'left':
        return {
          position: 'absolute',
          aspectRatio: '0.45 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(3px)',
          opacity: 0.7,
          zIndex: 10,
          left: isMobile ? '16%' : '25%',
          height: isMobile ? '28%' : '42%',
          bottom: isMobile ? '10%' : '10%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'right':
        return {
          position: 'absolute',
          aspectRatio: '0.45 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(3px)',
          opacity: 0.7,
          zIndex: 10,
          left: isMobile ? '84%' : '75%',
          height: isMobile ? '28%' : '42%',
          bottom: isMobile ? '10%' : '10%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'back':
      default:
        return {
          position: 'absolute',
          aspectRatio: '0.45 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(6px)',
          opacity: 0.35,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '22%' : '32%',
          bottom: isMobile ? '14%' : '15%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
    }
  };

  return (
    <div
      id="hero"
      className="relative w-full overflow-hidden select-none bg-stone-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
        {/* 0. Main Organic Forest & Tabletop Background */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
          <img
            src="/demos/drink/hero-bg.webp"
            alt="TerraViva organic botanical table background"
            className="w-full h-full object-cover object-bottom"
            draggable={false}
          />
          {/* Subtle mood light tint based on active fruit */}
          <div
            className="absolute inset-0 mix-blend-color transition-colors duration-700 ease-out pointer-events-none"
            style={{
              backgroundColor: currentItem.bg,
              opacity: 0.12,
            }}
          />
          {/* Soft vignette and contrast gradients for readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%), linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>

        {/* 1. Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.2,
            backgroundImage: `url("${NOISE_SVG_DATA_URI}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
          aria-hidden="true"
        />



        {/* 3. Carousel Items */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((item, index) => {
            const role = getRole(index);
            const style = getRoleStyles(role);

            return (
              <div key={item.src} style={style} className="relative flex items-end justify-center">
                {/* Background artwork (e.g. Mango splash / botanicals behind can) */}
                {item.bgArtwork && (
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      width: isMobile ? '205%' : '250%',
                      maxWidth: '980px',
                      left: '50%',
                      bottom: isMobile ? '2%' : '3%',
                      transform: `translateX(-50%) scale(${role === 'center' ? 0.94 : 0.8}) translateY(${role === 'center' ? '0%' : '4%'})`,
                      zIndex: 1,
                      opacity: role === 'center' ? 0.95 : 0,
                      filter: role === 'center' ? 'blur(2.5px)' : 'blur(9px)',
                      transition:
                        'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), filter 750ms ease-out, transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'opacity, filter, transform',
                    }}
                  >
                    <img
                      src={item.bgArtwork}
                      alt={`${item.name} background artwork`}
                      draggable={false}
                      className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] animate-subtle-float"
                    />
                  </div>
                )}

                {/* Main Can / Bottle */}
                <img
                  src={item.src}
                  alt={`TerraViva Organic ${item.name} Bottle`}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                    zIndex: 2,
                  }}
                  className="relative drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]"
                />
              </div>
            );
          })}
        </div>

        {/* 4. Changing title, desc + nav buttons: Top Center on mobile, Bottom Left on desktop */}
        <div
          className="absolute z-60 top-14 sm:top-auto sm:bottom-20 inset-x-0 sm:inset-x-auto sm:left-24 px-4 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left max-w-full sm:max-w-[340px] text-white pointer-events-auto"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-white/85 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              Fresh Harvest
            </span>
          </div>

          <p
            className="font-bold uppercase mb-1 sm:mb-2 text-xl sm:text-[26px] tracking-tight leading-tight transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            style={{
              opacity: 0.98,
              letterSpacing: '0.01em',
            }}
          >
            {currentItem.name}
          </p>

          <p
            className="text-[12px] sm:text-sm text-white/90 leading-[1.45] sm:leading-[1.6] max-w-[290px] sm:max-w-none mb-2.5 sm:mb-5 transition-opacity duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{
              opacity: 0.92,
            }}
          >
            {currentItem.tagline}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('prev')}
              disabled={isAnimating}
              aria-label="Previous organic juice"
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-black/25 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none border-2 border-white text-white cursor-pointer transition-[transform,background-color] duration-150 ease-out hover:scale-108 hover:bg-white/15 active:scale-95 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 sm:w-[26px] sm:h-[26px]" strokeWidth={2.25} />
            </button>

            <button
              type="button"
              onClick={() => navigate('next')}
              disabled={isAnimating}
              aria-label="Next organic juice"
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-black/25 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none border-2 border-white text-white cursor-pointer transition-[transform,background-color] duration-150 ease-out hover:scale-108 hover:bg-white/15 active:scale-95 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
            >
              <ArrowRight className="w-5 h-5 sm:w-[26px] sm:h-[26px]" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* 5. Bottom-right link "DISCOVER TASTE" */}
        <div
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10"
          style={{ zIndex: 60 }}
        >
          <a
            href="#lineup"
            onClick={(e) => {
              e.preventDefault();
              const target = document.querySelector('#lineup');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 sm:gap-3 text-white no-underline uppercase select-none transition-opacity duration-200 ease-out hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm group cursor-pointer"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(20px, 4vw, 56px)',
              fontWeight: 400,
              opacity: 0.95,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            <span>DISCOVER TASTE</span>
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.25} />
          </a>
        </div>
      </div>
    </div>
  );
}
