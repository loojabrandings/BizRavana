"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface MarqueeCard {
  id: string;
  title: string;
  category: string;
  image: string;
  url: string;
  isExternal?: boolean;
}

const ROW_1_CARDS: MarqueeCard[] = [
  {
    id: "artofframes",
    title: "Art of Frames",
    category: "E-Commerce",
    image: "/images/web-design/artofframes-preview.png",
    url: "https://artofframes.netlify.app/",
    isExternal: true,
  },
  {
    id: "luxury-jewellery",
    title: "Câlin Atelier",
    category: "Luxury Jewellery",
    image: "/demos/luxury-jewellery/card-preview.png",
    url: "/demos/luxury-jewellery",
  },
  {
    id: "cafevibe",
    title: "Cafe Vibe",
    category: "Restaurant & Cafe",
    image: "/images/web-design/cafevibe-preview.png",
    url: "https://cafevibebg.vercel.app/",
    isExternal: true,
  },
  {
    id: "gym",
    title: "Pulse Fit",
    category: "Fitness Club",
    image: "/demos/gym/card-preview.png",
    url: "/demos/gym",
  },
  {
    id: "salon-boss",
    title: "Salon Boss",
    category: "Salons & Spa",
    image: "/demos/salon-boss/card-preview.png",
    url: "/demos/salon-spa",
  },
  {
    id: "luxury-villa",
    title: "Misty Peaks",
    category: "Hotels & Villa",
    image: "/demos/villa/card-preview.png",
    url: "/demos/luxury-villa",
  },
  {
    id: "bizravana",
    title: "BizRavana OMS",
    category: "SaaS Platform",
    image: "/images/web-design/bizravana-preview.png",
    url: "https://bizravana.com/",
    isExternal: true,
  },
];

const ROW_2_CARDS: MarqueeCard[] = [
  {
    id: "real-estate",
    title: "Aura Estates",
    category: "Real Estate Brokerage",
    image: "/demos/realestate/card-preview.png",
    url: "/demos/real-estate",
  },
  {
    id: "hospital",
    title: "LifeCare Hospitals",
    category: "Healthcare & Channelling",
    image: "/demos/hospital/card-preview.png",
    url: "/demos/hospital",
  },
  {
    id: "dental",
    title: "LumiDent Studio",
    category: "Dental Care Clinic",
    image: "/demos/dental/demo-card.png",
    url: "/demos/dental",
  },
  {
    id: "kinetic-gym",
    title: "Kinetic Gym Arena",
    category: "Strength & Power Club",
    image: "/demos/kinetic-gym/card-preview-kinetic.png",
    url: "/demos/kinetic-gym",
  },
  {
    id: "clothing",
    title: "Nexora Atelier",
    category: "Fashion & Apparel",
    image: "/demos/clothing/card-preview-nexora.png",
    url: "/demos/clothing",
  },
  {
    id: "artofframes-mobile",
    title: "Art of Frames Mobile",
    category: "Product Customizer",
    image: "/images/web-design/artofframes-mobile.png",
    url: "https://artofframes.netlify.app/",
    isExternal: true,
  },
  {
    id: "bizravana-dashboard",
    title: "OMS Live Engine",
    category: "Business Suite",
    image: "/screens/orders.webp",
    url: "https://bizravana.com/",
    isExternal: true,
  },
];

export default function WebDesignMarquee() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top;
            const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.35;
            setScrollOffset(offset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Triple items for continuous seamless scroll
  const row1Triple = [...ROW_1_CARDS, ...ROW_1_CARDS, ...ROW_1_CARDS];
  const row2Triple = [...ROW_2_CARDS, ...ROW_2_CARDS, ...ROW_2_CARDS];

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0C0C0C] pt-20 sm:pt-28 md:pt-36 pb-12 overflow-hidden border-b border-white/[0.04]"
      style={{ overflowX: "clip" }}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#fd3a25]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#ff6b57]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Row 1: Moves RIGHT on scroll (translateX(offset - 200)) */}
      <div className="w-full overflow-hidden mb-3">
        <div
          className="flex gap-3 will-change-transform"
          style={{
            transform: `translate3d(${scrollOffset - 600}px, 0px, 0px)`,
            transition: "transform 0.1s cubic-bezier(0, 0, 0.2, 1)",
            width: "max-content",
          }}
        >
          {row1Triple.map((item, idx) => (
            <MarqueeCardTile key={`row1-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2: Moves LEFT on scroll (translateX(-(offset - 200))) */}
      <div className="w-full overflow-hidden">
        <div
          className="flex gap-3 will-change-transform"
          style={{
            transform: `translate3d(${-(scrollOffset - 200)}px, 0px, 0px)`,
            transition: "transform 0.1s cubic-bezier(0, 0, 0.2, 1)",
            width: "max-content",
          }}
        >
          {row2Triple.map((item, idx) => (
            <MarqueeCardTile key={`row2-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarqueeCardTile({ item }: { item: MarqueeCard }) {
  const content = (
    <div className="relative w-[320px] sm:w-[380px] md:w-[420px] h-[200px] sm:h-[240px] md:h-[270px] rounded-2xl overflow-hidden bg-[#15161c] border border-white/[0.08] shadow-2xl group flex-shrink-0 cursor-pointer">
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 320px, (max-width: 768px) 380px, 420px"
        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

      {/* Card Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between z-10">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#ff8a7a] uppercase tracking-wider mb-1.5">
            {item.category}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white font-kanit tracking-wide">
            {item.title}
          </h3>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );

  if (item.isExternal) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block flex-shrink-0"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.url} className="block flex-shrink-0">
      {content}
    </Link>
  );
}
