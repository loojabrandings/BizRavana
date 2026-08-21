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
    id: 'demo-event-planner',
    slug: 'event-planner',
    category: 'event-planner',
    categoryLabel: 'Event Planners',
    title: 'ZEE EVENTS • Luxury Weddings & Concerts',
    tagline: 'High-converting luxury event production & bespoke celebration experience demo',
    thumbnailUrl: '/demos/zee-events/hero-bg.jpg',
    liveUrl: '/demos/event-planner',
    accentColor: '#C8A96B',
    status: 'ready',
    features: ['Editorial Wedding & Concert Showcase', 'Interactive Consultation Inquiries', 'Asymmetric Storytelling Layout'],
  },
  {
    id: 'demo-gym',
    slug: 'gym',
    category: 'gym',
    categoryLabel: 'Gym & Fitness',
    title: 'PULSE FIT • High-Performance Club',
    tagline: 'High-energy fitness club, personal training & membership conversion demo',
    thumbnailUrl: '/demos/gym/hero-athlete.jpg',
    liveUrl: '/demos/gym',
    accentColor: '#CCFF00',
    status: 'ready',
    features: ['Bold Dark Mode Hero with Glowing Ring', 'Membership Tiers', 'Trainer Profiles & Tour'],
  },
  {
    id: 'demo-luxury-villa',
    slug: 'luxury-villa',
    category: 'hotel-villa',
    categoryLabel: 'Hotels & Villas',
    title: 'Boutique Luxury Villa & Resort Retreat',
    tagline: 'Immersive hospitality & direct reservation booking landing page',
    thumbnailUrl: '/demos/salon-boss/services/ayurveda.jpg',
    liveUrl: '/demos/luxury-villa',
    accentColor: '#2A9D8F',
    status: 'draft',
    features: ['Suite Showcase & Tour', 'Live Amenity Highlights', 'Direct Date Reservation'],
  },
];
