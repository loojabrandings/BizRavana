'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, ChevronRight, X } from 'lucide-react';
import './styles.css';

interface PortfolioProject {
  number: string;
  id: string;
  title: string;
  subtitle: string;
  category: 'wedding' | 'corporate' | 'private' | 'stage';
  categoryLabel: string;
  location: string;
  guestCount: string;
  year: string;
  coverImage: string;
  galleryImages: string[];
  summary: string;
  concept: string;
  highlights: string[];
  tags: string[];
  clientQuote?: {
    text: string;
    author: string;
    role: string;
  };
}

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    number: '01',
    id: 'mirage-palace',
    title: 'The Mirage Palace Wedding',
    subtitle: 'A 3-Day Royal Waterfront Celebration',
    category: 'wedding',
    categoryLabel: 'Royal Wedding',
    location: 'Lake Como, Italy',
    guestCount: '450 Guests',
    year: '2025',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'A fairytale multi-day celebration featuring a custom floating glass marquee over Lake Como, thousands of cascading white florals, and synchronized midnight fireworks.',
    concept: 'Harmonizing classic Italian renaissance architecture with modern transparent glass staging and ethereal candlelight palettes.',
    highlights: [
      'Engineered a 400m² floating glass pavilion over open waters',
      'Curated 14 luxury artisan vendors across 3 European countries',
      'Bespoke culinary experience with 2-Michelin starred guest chef',
      'Flawless water-taxi logistics for 450 international VIP guests',
    ],
    tags: ['Destination Wedding', 'Waterfront Pavilion', 'Fireworks', 'Luxury Floral'],
    clientQuote: {
      text: 'Zee Events made the impossible look effortless. Walking onto that floating pavilion felt like stepping into an ethereal dream.',
      author: 'Elena & Marcus Vance',
      role: 'The Bride & Groom',
    },
  },
  {
    number: '02',
    id: 'lumina-summit',
    title: 'Lumina Global Keynote & Gala',
    subtitle: 'Future Horizons Annual Tech Summit',
    category: 'corporate',
    categoryLabel: 'Corporate Gala',
    location: 'Singapore Expo Hall',
    guestCount: '1,500 Attendees',
    year: '2025',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'A futuristic brand summit combining an ultra-wide 360-degree LED stage arena with an intimate executive gala dinner under interactive fiber-optic ceilings.',
    concept: 'Seamlessly merging high-tech multimedia production with refined executive hospitality and precision stagecraft.',
    highlights: [
      '360° immersive projection-mapped arena keynote hall',
      'Integrated live translation & VIP biometric credentials',
      'Executive networking lounge with holographic interactive installations',
      'Zero-latency worldwide hybrid broadcast to 80,000+ viewers',
    ],
    tags: ['Tech Summit', 'Brand Activation', 'Immersive LED', 'Executive Dinner'],
    clientQuote: {
      text: 'The production standard was nothing short of world-class. Our leadership and investors were thoroughly blown away.',
      author: 'David Chen',
      role: 'VP Global Communications, Lumina Tech',
    },
  },
  {
    number: '03',
    id: 'midnight-emerald',
    title: 'Midnight Emerald Forest Soirée',
    subtitle: 'Private 30th Birthday Celebration',
    category: 'private',
    categoryLabel: 'Private Soirée',
    location: 'Cotswolds Private Estate, UK',
    guestCount: '85 Guests',
    year: '2025',
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'An exclusive private estate celebration transformed into an enchanted botanical dreamscape with thousands of hand-hung pendant lights, vintage jazz, and bespoke mixology.',
    concept: 'Moody emerald green and antique brass textures with organic foliage and bespoke culinary theatre.',
    highlights: [
      'Canopy of 5,000 suspended botanical vines and fairy filaments',
      'Speakeasy cocktail bar hidden behind a historic library bookcase',
      'Acoustic live jazz ensemble and secret midnight DJ set',
      'Customized engraved crystal favors for every attendee',
    ],
    tags: ['Private Milestone', 'Secret Speakeasy', 'Enchanted Forest', 'Bespoke Mixology'],
    clientQuote: {
      text: 'Zee Events turned our private residence into a cinematic wonderland. A night our guests still speak about constantly.',
      author: 'Sophia Sterling',
      role: 'Private Client',
    },
  },
  {
    number: '04',
    id: 'symphony-under-stars',
    title: 'Symphony Under the Stars',
    subtitle: 'Prestige Classical & Contemporary Music Festival',
    category: 'stage',
    categoryLabel: 'Concert & Stage',
    location: 'Red Rocks Amphitheatre, Colorado',
    guestCount: '6,200 Attendees',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'A breathtaking open-air amphitheater production uniting a 60-piece philharmonic orchestra with electronic synth artists and precision laser mapping.',
    concept: 'Architectural landscape illumination reflecting natural canyon contours synchronized with live orchestral crescendos.',
    highlights: [
      '60-piece orchestra sound engineering with acoustic field sensors',
      'Dynamic drone constellation show synchronized to the grand finale',
      'Artist green rooms and hospitality suites across 4 mountain terraces',
      'Flawless crowd flow and cashless VIP lounge logistics',
    ],
    tags: ['Festival Production', 'Laser Stagecraft', 'Philharmonic', 'Drone Light Show'],
    clientQuote: {
      text: 'The acoustic precision and visual grandeur Zee Events engineered against the mountain backdrop was utterly transcendent.',
      author: 'Julian Thorne',
      role: 'Artistic Director, Horizon Arts',
    },
  },
  {
    number: '05',
    id: 'velvet-gold-ballroom',
    title: 'Velvet & Gold Heritage Gala',
    subtitle: 'Golden Anniversary Celebration',
    category: 'wedding',
    categoryLabel: 'Anniversary Gala',
    location: 'Grand Ballroom, Vienna',
    guestCount: '280 Guests',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'An opulent golden anniversary gala in a historic Austrian palace featuring 24k gold leaf tablescapes, classical waltz dancers, and opera performances.',
    concept: 'Old-world European aristocratic luxury infused with sleek modern lighting and floral couture.',
    highlights: [
      'Custom gold-mirrored 40-meter banquet dining table',
      '12-tier artisan hand-sculpted celebration cake',
      'Chamber quartet accompaniment followed by a 14-piece big band',
      'Bespoke calligraphed crests and menu books on handmade linen',
    ],
    tags: ['Heritage Palace', 'Gold Tablescape', 'Ballroom Gala', 'Big Band'],
    clientQuote: {
      text: 'From the first champagne toast to the midnight waltz, every single second was orchestrated with immaculate perfection.',
      author: 'Lord & Lady Harrington',
      role: 'Hosts',
    },
  },
  {
    number: '06',
    id: 'elysian-horizon',
    title: 'Elysian Horizon Sunset Vows',
    subtitle: 'Intimate Coastal Cliffside Wedding',
    category: 'wedding',
    categoryLabel: 'Coastal Wedding',
    location: 'Santorini, Greece',
    guestCount: '60 Guests',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    ],
    summary: 'A sun-drenched cliffside ceremony overlooking the Aegean Sea, followed by an intimate candlelit dinner terrace with sea-breeze drapery and live harp music.',
    concept: 'Organic Mediterranean minimalism featuring neutral linens, olive branch arrangements, and sunset warm illumination.',
    highlights: [
      'Seamless cliffside glass ceremony platform over volcanic caldera',
      'Sunset timing precision down to the second for golden-hour vows',
      'Local Aegean seafood pairing menu with sommelier guide',
      'Private yacht cruise reception for all wedding guests',
    ],
    tags: ['Santorini', 'Sunset Wedding', 'Cliffside Platform', 'Intimate Luxury'],
    clientQuote: {
      text: 'The view was breathtaking, but Zee Events made the entire atmosphere feel surreal and deeply personal.',
      author: 'Chloe & Mateo Rossi',
      role: 'The Bride & Groom',
    },
  },
];

type CategoryFilter = 'all' | 'wedding' | 'corporate' | 'private' | 'stage';

export default function ZeeEventsPage() {
  const isInitialized = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredProjects = activeCategory === 'all'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter((p) => p.category === activeCategory);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const root = document.documentElement;
    const section = document.querySelector('.cinema-scroll') as HTMLElement | null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const track = document.querySelector('.sights-track') as HTMLElement | null;
    const sightsControls = document.querySelector('.sights-controls') as HTMLElement | null;
    const sightPrev = document.querySelector('.sight-prev') as HTMLElement | null;
    const sightNext = document.querySelector('.sight-next') as HTMLElement | null;
    const originalCards = Array.from(document.querySelectorAll('.sight-card')) as HTMLElement[];
    const originalSightCount = originalCards.length;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;
    let sightCards: HTMLElement[] = [];
    let activeSight = originalSightCount;

    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const segmentInOut = (s: number, a: number, b: number, c: number, d: number) => {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };
    const getScrollDistance = () => {
      if (!section) return 0;
      return clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);
    };

    function update() {
      rafPending = false;

      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1660);
      const frame3 = segmentInOut(smoothScroll, 1660, 2000, 3300, 3400);
      const progress = clamp(smoothScroll / 3300);
      const introExit = smoothstep(90, 650, smoothScroll);
      const splitDrift = smoothstep(60, 600, smoothScroll);
      const splitOpacity = 1 - smoothstep(180, 600, smoothScroll);
      const sightsEnter = smoothstep(1660, 2000, smoothScroll);
      const sightsControlsEnter = smoothstep(1880, 2020, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active;
      const backScale = 1 + progress * 0.16 + frame2.enter * 0.12 + frame3.enter * 0.12;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;

      root.style.setProperty('--mx', (reduceMotion.matches ? 0 : mouseX).toFixed(4));
      root.style.setProperty('--my', (reduceMotion.matches ? 0 : mouseY).toFixed(4));

      root.style.setProperty('--back-opacity', (1 - frame2.active * 0.06).toFixed(4));
      root.style.setProperty('--back-x', '0px');
      root.style.setProperty('--back-y', '0px');
      root.style.setProperty('--back-scale', backScale.toFixed(4));
      root.style.setProperty('--four-y', `${(0 + progress * 10).toFixed(4)}vh`);
      root.style.setProperty('--four-scale', (1 + progress * 0.14).toFixed(4));
      root.style.setProperty('--bazaar-y', `${(0 - progress * 8).toFixed(4)}vh`);
      root.style.setProperty('--blur-px', `${(blurActive * 14).toFixed(4)}px`);
      root.style.setProperty('--back-brightness', (1 - blurActive * 0.255).toFixed(4));
      root.style.setProperty('--bazaar-blur-px', `${(frame2.active * 14).toFixed(4)}px`);
      const bazaarOpacity = 1 - introExit;
      root.style.setProperty('--bazaar-opacity', bazaarOpacity.toFixed(4));
      root.style.setProperty('--bazaar-saturation', (1 + frame3.active * 0.18).toFixed(4));
      root.style.setProperty('--shade-opacity', '1');
      root.style.setProperty('--shade-z', frame2.active > 0.02 ? '2' : '0');
      root.style.setProperty('--shade-top-alpha', (blurActive * 0.465).toFixed(4));
      root.style.setProperty('--shade-mid-alpha', (blurActive * 0.42).toFixed(4));
      root.style.setProperty('--shade-bottom-alpha', (blurActive * 0.51).toFixed(4));

      root.style.setProperty('--title-y', `${(introExit * -210).toFixed(4)}px`);
      root.style.setProperty('--title-scale', (1 - introExit * 0.08).toFixed(4));
      root.style.setProperty('--title-opacity', (1 - introExit).toFixed(4));

      root.style.setProperty('--bridge-x', '-50%');
      root.style.setProperty('--bridge-y', `calc(-50% + ${(sharedHeroY - frame2.exit * 760).toFixed(4)}px)`);
      root.style.setProperty('--bridge-width', `${(50 + frame2.enter * 24).toFixed(4)}vw`);
      root.style.setProperty('--bridge-scale', (1 + sharedHeroScale * 0.35 + frame2.exit * 0.25).toFixed(4));

      root.style.setProperty('--split-left-x', `${(-splitDrift * 65).toFixed(4)}vw`);
      root.style.setProperty('--split-left-y', `${(sharedHeroY - splitDrift * 80).toFixed(4)}px`);
      root.style.setProperty('--split-left-scale', (1 + sharedHeroScale * 0.15).toFixed(4));
      root.style.setProperty('--split-right-x', `${(splitDrift * 65).toFixed(4)}vw`);
      root.style.setProperty('--split-right-y', `${(sharedHeroY - splitDrift * 80).toFixed(4)}px`);
      root.style.setProperty('--split-right-scale', (1 + sharedHeroScale * 0.15).toFixed(4));
      root.style.setProperty('--split-opacity', splitOpacity.toFixed(4));

      root.style.setProperty('--frame2-opacity', frame2Opacity.toFixed(4));
      root.style.setProperty('--frame2-x', '-50%');
      root.style.setProperty('--frame2-y', `calc(-50% + ${(-frame2.exit * 150).toFixed(4)}px)`);
      root.style.setProperty('--frame2-scale', (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

      root.style.setProperty('--intro-copy-y', `${(introExit * 90).toFixed(4)}px`);
      root.style.setProperty('--intro-copy-opacity', (1 - introExit).toFixed(4));
      root.style.setProperty('--panel2-opacity', panel2Opacity.toFixed(4));
      root.style.setProperty('--panel2-y', `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(4)}px)`);
      root.style.setProperty('--panel3-opacity', panel3Opacity.toFixed(4));
      root.style.setProperty('--panel3-y', `${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(4)}px`);

      root.style.setProperty('--sights-opacity', sightsEnter.toFixed(4));
      root.style.setProperty('--sights-controls-opacity', sightsControlsEnter.toFixed(4));
      if (sightsControls) {
        sightsControls.classList.toggle('is-ready', sightsControlsEnter > 0.9);
      }
      root.style.setProperty('--sights-visibility', sightsEnter > 0.01 ? 'visible' : 'hidden');
      root.style.setProperty('--sights-y', `${((1 - sightsEnter) * 50).toFixed(4)}px`);
      root.style.setProperty('--sights-enter-x', `${((1 - sightsEnter) * 45).toFixed(4)}vw`);
      root.style.setProperty('--sights-scale', '1');

      // Horizontal card scroll scrubbing:
      const cardProgress = clamp((smoothScroll - 2000) / 1300);
      if (sightCards.length > 0 && track) {
        const cardWidth = sightCards[0].offsetWidth || 600;
        const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '24');
        const scrollShift = -(cardWidth + gap) * (cardProgress * (sightCards.length - 1));
        root.style.setProperty('--sights-shift', `${scrollShift.toFixed(2)}px`);

        const currentActiveIndex = Math.min(sightCards.length - 1, Math.round(cardProgress * (sightCards.length - 1)));
        activeSight = currentActiveIndex;
        sightCards.forEach((card, index) => {
          card.classList.toggle('is-active', index === activeSight);
        });
        if (sightPrev) sightPrev.style.opacity = activeSight === 0 ? '0.35' : '1';
        if (sightNext) sightNext.style.opacity = activeSight === sightCards.length - 1 ? '0.35' : '1';
      }

      if (Math.abs(smoothScroll - targetScroll) > 0.08) {
        requestTick();
      }
    }

    function requestTick() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    }

    function setupSightSlider() {
      if (!track) return;
      sightCards = Array.from(track.querySelectorAll('.sight-card')) as HTMLElement[];
      activeSight = 0;
      sightCards.forEach((card, index) => {
        card.dataset.sightIndex = index.toString();
        card.addEventListener('click', () => selectSightCard(card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSightCard(card);
          }
        });
      });
      if (sightCards.length > 0) {
        sightCards[0].classList.add('is-active');
      }
      if (sightPrev) sightPrev.style.opacity = '0.35';
    }

    function moveSightSlider(dir: number) {
      if (!sightCards.length) return;
      const next = Math.max(0, Math.min(sightCards.length - 1, activeSight + dir));
      const targetScrollPos = 2000 + (next / (sightCards.length - 1)) * 1300;
      window.scrollTo({ top: targetScrollPos, behavior: 'smooth' });
    }

    function selectSightCard(card: HTMLElement) {
      const index = Number(card.dataset.sightIndex);
      if (Number.isFinite(index) && sightCards.length > 1) {
        const targetScrollPos = 2000 + (index / (sightCards.length - 1)) * 1300;
        window.scrollTo({ top: targetScrollPos, behavior: 'smooth' });
      }
    }

    const sectionScrollMap: Record<string, number> = {
      home: 0,
      about: 1100,
      services: 2000,
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.slice(1);
        if (sectionScrollMap[targetId] !== undefined) {
          e.preventDefault();
          window.scrollTo({ top: sectionScrollMap[targetId], behavior: 'smooth' });
        } else if (targetId === 'portfolio') {
          e.preventDefault();
          const portfolioEl = document.getElementById('portfolio');
          if (portfolioEl) {
            portfolioEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 3800, behavior: 'smooth' });
          }
        }
      }
    };

    const onScroll = () => requestTick();
    const onResize = () => requestTick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('click', handleAnchorClick);

    const handlePrev = () => moveSightSlider(-1);
    const handleNext = () => moveSightSlider(1);

    if (sightPrev) sightPrev.addEventListener('click', handlePrev);
    if (sightNext) sightNext.addEventListener('click', handleNext);

    setupSightSlider();
    requestTick();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('click', handleAnchorClick);
      if (sightPrev) sightPrev.removeEventListener('click', handlePrev);
      if (sightNext) sightNext.removeEventListener('click', handleNext);
    };
  }, []);

  return (
    <main className="site-shell">
      {/* ── Fixed Header (outside overflow containers) ── */}
      <header className="site-header" aria-label="Primary navigation">
        <a className="site-logo" href="#home" onClick={() => setMenuOpen(false)}>
          Zee Events
        </a>
        <nav className="site-nav" aria-label="Main menu">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#process">Process</a>
          <a href="#why">Why Us</a>
        </nav>
        <div className="header-actions">
          <a className="header-cta" href="#portfolio" onClick={() => setMenuOpen(false)}>
            View Showcase
          </a>
          <button
            className={`mobile-menu-toggle ${menuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className={`mobile-menu-overlay ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="mobile-nav-links" aria-label="Mobile navigation">
          <a href="#home" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">01</span>
            <span className="mobile-nav-text">Home</span>
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">02</span>
            <span className="mobile-nav-text">About Us</span>
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">03</span>
            <span className="mobile-nav-text">Services</span>
          </a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">04</span>
            <span className="mobile-nav-text">Portfolio</span>
          </a>
          <a href="#process" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">05</span>
            <span className="mobile-nav-text">Process</span>
          </a>
          <a href="#why" onClick={() => setMenuOpen(false)}>
            <span className="mobile-nav-num">06</span>
            <span className="mobile-nav-text">Why Us</span>
          </a>
        </nav>
        <div className="mobile-menu-footer">
          <a className="mobile-menu-cta" href="#portfolio" onClick={() => setMenuOpen(false)}>
            Explore Showcase ↘
          </a>
          <p className="mobile-menu-copy">Curating extraordinary celebrations worldwide.</p>
        </div>
      </div>

      {/* Cinema Scroll Stage */}
      <section className="cinema-scroll" id="home" aria-label="Zee Events Experience">
        <div className="stage">
          <div className="world">
            <img
              className="scene-img sky-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png"
              alt=""
            />
            <div className="back-stack">
              <img
                className="scene-img back-img back-four"
                src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png"
                alt=""
              />
              <section className="sights-slider" aria-label="Zee Events services slider">
                <div className="sights-track">
                  <article className="sight-card" tabIndex={0} role="button" aria-label="Weddings service card">
                    <div className="sight-card-left">
                      <span className="sight-kicker">01 / Signature</span>
                      <h3>Weddings</h3>
                      <p className="sight-desc">Unforgettable bespoke weddings curated with timeless artistry and flawless coordination.</p>
                      <a className="sight-cta" href="#portfolio">Explore Weddings ↗</a>
                    </div>
                    <div className="sight-card-right">
                      <span className="sight-right-label">Services</span>
                      <ul className="sight-list">
                        <li>Full Wedding Planning</li>
                        <li>Partial Wedding Planning</li>
                        <li>Wedding Day Coordination</li>
                        <li>Destination Weddings</li>
                      </ul>
                    </div>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button" aria-label="Private Parties service card">
                    <div className="sight-card-left">
                      <span className="sight-kicker">02 / Celebrations</span>
                      <h3>Private Parties</h3>
                      <p className="sight-desc">Vibrant, personalized milestone gatherings and unforgettable private occasions.</p>
                      <a className="sight-cta" href="#portfolio">Plan Your Party ↗</a>
                    </div>
                    <div className="sight-card-right">
                      <span className="sight-right-label">Services</span>
                      <ul className="sight-list">
                        <li>Birthday Parties</li>
                        <li>Theme Parties</li>
                        <li>Baby Showers</li>
                        <li>Get-togethers</li>
                      </ul>
                    </div>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button" aria-label="Corporate Events service card">
                    <div className="sight-card-left">
                      <span className="sight-kicker">03 / Corporate</span>
                      <h3>Corporate Events</h3>
                      <p className="sight-desc">Elevated brand activations, seamless conferences, and executive gala productions.</p>
                      <a className="sight-cta" href="#portfolio">Corporate Inquiries ↗</a>
                    </div>
                    <div className="sight-card-right">
                      <span className="sight-right-label">Services</span>
                      <ul className="sight-list">
                        <li>Corporate Parties</li>
                        <li>Conferences</li>
                        <li>Product Launch</li>
                        <li>Retirement Parties</li>
                      </ul>
                    </div>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button" aria-label="Other Events service card">
                    <div className="sight-card-left">
                      <span className="sight-kicker">04 / Occasions</span>
                      <h3>Other Events</h3>
                      <p className="sight-desc">Large-scale concert experiences, cultural celebrations, and prestige public ceremonies.</p>
                      <a className="sight-cta" href="#portfolio">View Productions ↗</a>
                    </div>
                    <div className="sight-card-right">
                      <span className="sight-right-label">Services</span>
                      <ul className="sight-list">
                        <li>Music Concerts</li>
                        <li>Award Ceremonies</li>
                        <li>Public Fairs/Festivals</li>
                        <li>Graduation Balls</li>
                      </ul>
                    </div>
                  </article>
                </div>
              </section>
              <img
                className="scene-img back-img back-bazaar"
                src="/demos/event-planner/land.jpg"
                alt=""
              />
            </div>
            <div className="sights-controls" aria-label="Slider controls">
              <button className="sight-nav sight-prev" type="button" aria-label="Previous service">
                ←
              </button>
              <button className="sight-nav sight-next" type="button" aria-label="Next service">
                →
              </button>
            </div>
            <h1 className="hero-title">
              <span className="hero-title-row">ZEE</span>
              <span className="hero-title-row">EVENTS</span>
            </h1>
            <img
              className="scene-img splitframe-img splitframe-left"
              src="/demos/event-planner/left.png"
              alt=""
            />
            <img
              className="scene-img splitframe-img splitframe-right"
              src="/demos/event-planner/right.png"
              alt=""
            />
            <img
              className="scene-img bridge-img"
              src="/demos/event-planner/back.png"
              alt=""
            />
            <div className="shade" />
          </div>
          <section className="intro-copy" aria-label="Zee Events overview">
            <p>Curating extraordinary celebrations, bespoke weddings, and signature corporate experiences with timeless artistry and flawless precision.</p>
            <div className="hero-cta-wrap">
              <a className="hero-cta" href="#services">
                <span>Explore Services</span>
                <span aria-hidden="true">↘</span>
              </a>
            </div>
          </section>
          <section className="story-panel story-panel-bridge" id="about" aria-label="About Zee Events">
            <h2>Every celebration is an unforgettable story.</h2>
            <p>From intimate beachfront vows to grand arena galas, Zee Events orchestrates every detail with unmatched elegance, passion, and seamless coordination.</p>
            <div className="about-metrics" aria-label="Agency milestones">
              <div className="metric-card">
                <span className="metric-kicker">Experience</span>
                <div className="metric-num">10<span className="metric-plus">+</span></div>
                <div className="metric-label">Years of Event Mastery</div>
              </div>
              <div className="metric-card">
                <span className="metric-kicker">Portfolio</span>
                <div className="metric-num">500<span className="metric-plus">+</span></div>
                <div className="metric-label">Signature Events Produced</div>
              </div>
              <div className="metric-card">
                <span className="metric-kicker">Excellence</span>
                <div className="metric-num">100<span className="metric-plus">%</span></div>
                <div className="metric-label">Bespoke Client Satisfaction</div>
              </div>
            </div>
          </section>
          <section className="story-panel story-panel-bazaar" id="services" aria-label="Zee Events Services">
            <h2>Signature Services for Every Occasion.</h2>
            <p>Explore our tailored planning and production tiers designed to bring your vision to life effortlessly.</p>
          </section>
        </div>
      </section>

      {/* ── STICKY CARD STACKING PORTFOLIO SECTION (MATCHING MAIN LANDING PAGE ARCHITECTURE) ── */}
      <section className="portfolio-stack-section" id="portfolio" aria-label="Selected Event Portfolio">
        <div className="portfolio-stack-glow" />

        <div className="portfolio-container">
          {/* Section Header */}
          <header className="portfolio-header">
            <div className="portfolio-header-lead">
              <div className="portfolio-badge-pill">
                <span className="portfolio-dot-pulse" />
                <span>[ PROVEN LUXURY PORTFOLIO ]</span>
              </div>
              <h2 className="portfolio-title">Moments Crafted into Legend</h2>
              <p className="portfolio-subtitle">
                Explore custom landmark productions curated worldwide. Every celebration is orchestrated for emotional resonance, visual grandeur, and immaculate precision.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="portfolio-filter-bar" role="tablist" aria-label="Filter events by category">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                className={`filter-btn ${activeCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Works <span className="filter-count">({PORTFOLIO_PROJECTS.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'wedding'}
                className={`filter-btn ${activeCategory === 'wedding' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('wedding')}
              >
                Weddings <span className="filter-count">({PORTFOLIO_PROJECTS.filter((p) => p.category === 'wedding').length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'corporate'}
                className={`filter-btn ${activeCategory === 'corporate' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('corporate')}
              >
                Corporate <span className="filter-count">({PORTFOLIO_PROJECTS.filter((p) => p.category === 'corporate').length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'private'}
                className={`filter-btn ${activeCategory === 'private' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('private')}
              >
                Private Soirées <span className="filter-count">({PORTFOLIO_PROJECTS.filter((p) => p.category === 'private').length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'stage'}
                className={`filter-btn ${activeCategory === 'stage' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('stage')}
              >
                Concerts & Stage <span className="filter-count">({PORTFOLIO_PROJECTS.filter((p) => p.category === 'stage').length})</span>
              </button>
            </div>
          </header>

          {/* ── Sticky Stacking Cards Container ── */}
          <div className="portfolio-stack-track">
            {filteredProjects.map((project, idx) => (
              <StickyEventCard
                key={project.id}
                project={project}
                index={idx}
                totalCards={filteredProjects.length}
              />
            ))}
          </div>

          {/* Bottom Callout Banner */}
          <div className="portfolio-callout-banner">
            <div className="callout-pattern-glow" />
            <div className="callout-content">
              <span className="callout-kicker">READY TO CREATE MAGIC?</span>
              <h3 className="callout-heading">Have an extraordinary celebration in mind?</h3>
              <p className="callout-desc">
                From intimate private villas to grand multi-day destination galas, our team transforms visions into breathtaking reality.
              </p>
            </div>
            <a
              className="callout-btn"
              href="mailto:contact@zeeevents.com?subject=Event%20Inquiry%20from%20Portfolio"
            >
              <span>Schedule a Private Consultation</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 4-STEP PLANNING PROCESS SECTION ── */}
      <section className="process-section" id="process" aria-label="Our 4-Step Planning Process">
        <div className="process-container">
          <motion.header
            className="process-header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portfolio-badge-pill">
              <span className="portfolio-dot-pulse" />
              <span>[ HOW WE WORK ]</span>
            </div>
            <h2 className="process-title">The 4-Step Planning Process</h2>
            <p className="process-subtitle">
              From the first conversation to the final farewell, our refined methodology ensures every detail is curated with precision, elegance, and effortless grace.
            </p>
          </motion.header>

          <div className="process-steps">
            {[
              { num: '01', title: 'Discovery & Vision', desc: 'We begin with an intimate consultation to understand your story, style, and aspirations. Every great celebration starts with a deeply personal vision.' },
              { num: '02', title: 'Concept & Design', desc: 'Our creative team crafts a bespoke mood board, venue blueprint, and immersive design narrative tailored exclusively to your celebration.' },
              { num: '03', title: 'Production & Coordination', desc: 'We manage every vendor, timeline, and logistics detail — transforming concepts into a flawlessly choreographed production.' },
              { num: '04', title: 'Flawless Execution', desc: 'On the day itself, our team orchestrates every moment with silent precision — so you can be fully present in the magic.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="process-step"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="process-step-number">{step.num}</div>
                <div className="process-step-content">
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-desc">{step.desc}</p>
                </div>
                {i < 3 && <div className="process-step-line" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US SECTION ── */}
      <section className="why-section" id="why" aria-label="Why Choose Zee Events">
        <div className="why-container">
          <motion.header
            className="why-header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portfolio-badge-pill">
              <span className="portfolio-dot-pulse" />
              <span>[ WHY ZEE EVENTS ]</span>
            </div>
            <h2 className="why-title">Why Choose Us</h2>
            <p className="why-subtitle">
              A decade of relentless craft, an unwavering eye for detail, and a global network of the finest vendors — all dedicated to your singular vision.
            </p>
          </motion.header>

          <div className="why-grid">
            {[
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>, title: 'Bespoke Creativity', desc: 'No templates, no copy-paste. Every event is a one-of-a-kind creative endeavor designed from scratch around your personality and aspirations.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, title: 'Flawless Timing', desc: 'From micro-second cue transitions to multi-day itineraries, our production choreography runs with clockwork precision — every single time.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, title: 'Global Vendor Network', desc: 'Exclusive partnerships with 200+ elite florists, caterers, lighting designers, and entertainers across six continents.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, title: 'White-Glove Care', desc: 'A dedicated concierge team handles every request — from last-minute guest dietary needs to surprise midnight experiences.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, title: 'Award-Winning Standards', desc: 'Recognized by the International Event Excellence Awards three years running — our standard of craft speaks for itself.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, title: 'Destination Expertise', desc: "Whether it's a Tuscan villa, a Maldivian overwater pavilion, or a Moroccan riad — we know every venue intimately." },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="why-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="why-card-icon">{card.icon}</div>
                <h3 className="why-card-title">{card.title}</h3>
                <p className="why-card-desc">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL FOOTER & SOCIAL GRID ── */}
      <footer className="editorial-footer" id="contact" aria-label="Zee Events Footer">
        {/* Social Image Grid */}
        <div className="footer-social-grid">
          {[
            { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', alt: 'Luxury wedding floral arrangement' },
            { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', alt: 'Corporate event stage production' },
            { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', alt: 'Private celebration with lights' },
            { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', alt: 'Concert stage lighting design' },
            { src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80', alt: 'Grand ballroom gala setup' },
            { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', alt: 'Romantic wedding ceremony' },
          ].map((img, i) => (
            <div key={i} className="footer-social-cell">
              <img src={img.src} alt={img.alt} loading="lazy" />
              <div className="footer-social-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Editorial Brand Statement */}
        <div className="footer-editorial">
          <div className="footer-editorial-inner">
            <div className="footer-brand-block">
              <a className="footer-logo" href="#home">Zee Events</a>
              <p className="footer-tagline">
                Curating extraordinary celebrations, bespoke weddings, and signature corporate experiences with timeless artistry and flawless precision.
              </p>
            </div>

            <nav className="footer-nav" aria-label="Footer navigation">
              <div className="footer-nav-col">
                <span className="footer-nav-label">Company</span>
                <a href="#about">About Us</a>
                <a href="#process">Our Process</a>
                <a href="#why">Why Choose Us</a>
                <a href="#portfolio">Portfolio</a>
              </div>
              <div className="footer-nav-col">
                <span className="footer-nav-label">Services</span>
                <a href="#services">Weddings</a>
                <a href="#services">Corporate Events</a>
                <a href="#services">Private Parties</a>
                <a href="#services">Concerts & Stage</a>
              </div>
              <div className="footer-nav-col">
                <span className="footer-nav-label">Connect</span>
                <a href="mailto:contact@zeeevents.com">contact@zeeevents.com</a>
                <a href="tel:+442012345678">+44 20 1234 5678</a>
                <a href="#">Instagram</a>
                <a href="#">Pinterest</a>
              </div>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span className="footer-copyright">© 2026 Zee Events. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StickyEventCard({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
  totalCards: number;
}) {
  return (
    <div
      className="sticky-card-wrapper"
      style={{
        top: `calc(78px + ${index * 26}px)`,
        zIndex: 10 + index,
      }}
    >
      <div className="sticky-event-card">
        {/* Ambient Warm Golden Glow inside Card */}
        <div className="card-ambient-glow" />

        {/* ── Top Header: Centered Title Only ── */}
        <div className="stack-card-header stack-card-header-centered">
          <h3 className="stack-card-title stack-card-title-centered">{project.title}</h3>
        </div>

        {/* ── Main 16:9 Showcase Image Frame ── */}
        <div className="stack-media-frame">
          <img
            src={project.coverImage}
            alt={`${project.title} showcase`}
            className="stack-media-img"
            loading="lazy"
          />

          {/* Bottom Gradient Overlay */}
          <div className="stack-media-gradient" />
        </div>
      </div>
    </div>
  );
}
