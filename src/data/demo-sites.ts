export interface DemoSite {
  id: string;
  slug: string;
  category: 'event-planner' | 'salon-spa' | 'hotel-villa' | 'gym' | 'luxury-jewellery' | 'fashion-clothing' | string;
  categoryLabel: string;
  title: string;
  tagline: string;
  thumbnailUrl: string;
  liveUrl: string;
  accentColor: string;
  status: 'draft' | 'ready';
  features: string[];
}

export const DEMO_SITES: DemoSite[] = [
  {
    id: 'demo-luxury-jewellery',
    slug: 'luxury-jewellery',
    category: 'luxury-jewellery',
    categoryLabel: 'Haute Jewellery',
    title: 'CÂLIN',
    tagline: 'Haute joaillerie, bespoke diamonds, and fine goldsmith atelier concept demo',
    thumbnailUrl: '/demos/luxury-jewellery/card-preview.png',
    liveUrl: '/demos/luxury-jewellery',
    accentColor: '#C6A05F',
    status: 'ready',
    features: [
      'Editorial Dark Elegance & 3D Interactive Parallax',
      'Curated Collections & Split Product Showcase',
      'Exclusive Solitaire 3D Floating Orbit Banner',
      'Bespoke Concierge & Customer Testimonials',
    ],
  },
  {
    id: 'demo-gym',
    slug: 'gym',
    category: 'gym',
    categoryLabel: 'Gym & Fitness',
    title: 'PULSE FIT',
    tagline: 'High-energy fitness club, personal training & membership conversion demo',
    thumbnailUrl: '/demos/gym/card-preview.png',
    liveUrl: '/demos/gym',
    accentColor: '#CCFF00',
    status: 'ready',
    features: ['Bold Dark Mode Hero with Glowing Ring', 'Membership Tiers', 'Trainer Profiles & Tour'],
  },
  {
    id: 'demo-salon-spa',
    slug: 'salon-spa',
    category: 'salon-spa',
    categoryLabel: 'Salons & Spas',
    title: 'SALON BOSS',
    tagline: 'High-converting unisex grooming, hair transformation & 1-click booking concept demo',
    thumbnailUrl: '/demos/salon-boss/card-preview.png',
    liveUrl: '/demos/salon-spa',
    accentColor: '#ECA53D',
    status: 'ready',
    features: [
      'Interactive 5-Category Services Menu',
      'Before / After Hair Transformation Slider',
      '3-Branch Picker & 1-Click WhatsApp Booking',
      'Auto-Rotating Signature Showcase',
    ],
  },
  {
    id: 'demo-luxury-villa',
    slug: 'luxury-villa',
    category: 'hotel-villa',
    categoryLabel: 'Hotels & Villas',
    title: 'MISTY PEAKS',
    tagline: 'Luxury A-frame cabana hideaway nestled in emerald tea hills with 360° cloud views',
    thumbnailUrl: '/demos/villa/card-preview.png',
    liveUrl: '/demos/luxury-villa',
    accentColor: '#10B981',
    status: 'ready',
    features: ['360° Tea Estate Views', 'Private Suspended Wooden Deck', 'Mountain Sunrise Direct Booking'],
  },
  {
    id: 'demo-clothing',
    slug: 'clothing',
    category: 'fashion-clothing',
    categoryLabel: 'Fashion & Apparel',
    title: 'NEXORA',
    tagline: 'Modern clothing atelier with sliding pastel pods, category showcase & best sellers',
    thumbnailUrl: '/demos/clothing/card-preview-nexora.png',
    liveUrl: '/demos/clothing',
    accentColor: '#8362F4',
    status: 'ready',
    features: [
      'Interactive Color-Synchronized Sliding Hero',
      'Dynamic Shop By Category with Hover Preview',
      'Inline Morphing Best Sellers Showcase',
      'Brand Manifesto Banner & Atelier Concierge',
    ],
  },
  {
    id: 'demo-real-estate',
    slug: 'real-estate',
    category: 'real-estate',
    categoryLabel: 'Luxury Real Estate',
    title: 'AURA ESTATES',
    tagline: 'Premier Sri Lankan architectural real estate brokerage with deed-vetted properties & VIP concierge',
    thumbnailUrl: '/demos/realestate/card-preview.png',
    liveUrl: '/demos/real-estate',
    accentColor: '#C5A880',
    status: 'ready',
    features: [
      'Two-Phase Architectural Curtain Reveal Hero',
      'Interactive Signature Places Split Showcase',
      'Deed-Vetted Property Inventory & Multi-District Search',
      'Prime Sri Lankan Hotspot Guides & Seller Lead Engine',
    ],
  },
  {
    id: 'demo-hospital',
    slug: 'hospital',
    category: 'hospital-wellness',
    categoryLabel: 'Hospital & Healthcare',
    title: 'LIFECARE HOSPITALS',
    tagline: 'Modern private hospital landing page with animated hero, endless doctor carousel, 24/7 emergency response & channelling booking',
    thumbnailUrl: '/demos/hospital/card-preview.png',
    liveUrl: '/demos/hospital',
    accentColor: '#102BDC',
    status: 'ready',
    features: [
      'Full-Viewport 100vh Hero with Word Reveal & 3-Panel Metrics Strip',
      'About Us History with Dr. H.M.M.S Bandaranayaka Narrative',
      '8 Clinical Services & Facilities with Overlapping Badges',
      'Truly Endless Seamless Infinite Looping Specialist Doctors Carousel',
      '3-Column Why Choose Us with 24/7 Emergency Hotline Card',
      'Interactive Specialist Channelling & Appointment Booking Engine',
      '60-120 FPS High-Performance Scroll Reveal Architecture',
    ],
  },
];

