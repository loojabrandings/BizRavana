export interface DemoSite {
  id: string;
  slug: string;
  category: 'event-planner' | 'salon-spa' | 'hotel-villa' | string;
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
    id: 'demo-gym',
    slug: 'gym',
    category: 'gym',
    categoryLabel: 'Gym & Fitness',
    title: 'PULSE FIT • High-Performance Club',
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
    title: 'SALON BOSS • Unisex Salon & Spa',
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
    title: 'MISTY PEAKS • Luxury A-Frame Hideaway',
    tagline: 'Luxury A-frame cabana hideaway nestled in emerald tea hills with 360° cloud views',
    thumbnailUrl: '/demos/villa/card-preview.png',
    liveUrl: '/demos/luxury-villa',
    accentColor: '#10B981',
    status: 'ready',
    features: ['360° Tea Estate Views', 'Private Suspended Wooden Deck', 'Mountain Sunrise Direct Booking'],
  },
];
