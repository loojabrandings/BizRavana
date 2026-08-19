"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, PhoneCall, MessageSquare } from "lucide-react";

const NAV_ITEMS = [
  { label: "Works", href: "#showcase", id: "showcase" },
  { label: "Process", href: "#solutions", id: "solutions" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function WebDesignNav() {
  const [activeTab, setActiveTab] = useState("Works");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const section = document.getElementById(NAV_ITEMS[i].id);
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(NAV_ITEMS[i].label);
            return;
          }
        }
      }

      // If at the very top of the page
      if (window.scrollY < 400) {
        setActiveTab("Works");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Official BizRavana Logo linking to Main Platform */}
        <Link
          href="/"
          title="Return to BizRavana Main Platform"
          className="flex items-center gap-2.5 group"
        >
          <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/images/bizravana-logo.png"
              alt="BizRavana Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#8be0b7] transition-colors leading-none">
              BizRavana
            </span>
            <span className="text-[9px] font-mono text-neutral-400 group-hover:text-[#8be0b7] transition-colors mt-0.5 tracking-wider hidden sm:block">
              &larr; Main Site
            </span>
          </div>
        </Link>

        {/* Center: Dynamic Scroll-Spy Nav Capsule */}
        <nav className="hidden md:flex items-center p-1.5 rounded-full bg-[#12131a]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveTab(item.label)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-[#6fc59b] text-[#08090d] font-bold shadow-[0_0_20px_rgba(111,197,155,0.6)] scale-105"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right: High-Impact "Start Project" Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] hover:from-[#9ef0c7] hover:to-[#5eb989] text-[#08090d] text-xs font-black tracking-wide shadow-[0_0_25px_rgba(111,197,155,0.45)] hover:scale-105 transition-all"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2.5 rounded-full bg-white/[0.06] border border-white/10 text-white flex items-center justify-center hover:bg-white/[0.12] transition-colors"
          >
            <Menu className="w-5 h-5 text-[#8be0b7]" />
          </button>
        </div>
      </header>

      {/* Fullscreen Drawer for Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050507]/95 backdrop-blur-3xl flex flex-col p-8 pt-28">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Mobile Menu"
            className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-xl mx-auto w-full flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#6fc59b] font-bold mb-8">
                [ NAVIGATION PORTAL ]
              </div>

              <nav className="flex flex-col gap-6 text-2xl sm:text-3xl font-extrabold text-white">
                <a
                  href="#"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between"
                >
                  <span>01. Home</span>
                  <span className="text-xs font-mono text-neutral-500">OVERVIEW</span>
                </a>
                <a
                  href="#showcase"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between"
                >
                  <span>02. Works</span>
                  <span className="text-xs font-mono text-neutral-500">PORTFOLIO</span>
                </a>
                <a
                  href="#solutions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between"
                >
                  <span>03. Process</span>
                  <span className="text-xs font-mono text-neutral-500">5 STEPS</span>
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between"
                >
                  <span>04. Features</span>
                  <span className="text-xs font-mono text-neutral-500">CAPABILITIES</span>
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between"
                >
                  <span>05. Pricing</span>
                  <span className="text-xs font-mono text-neutral-500">PLANS</span>
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#8be0b7] transition-colors flex items-center justify-between text-[#8be0b7]"
                >
                  <span>06. Contact Us</span>
                  <span className="text-xs font-mono text-[#8be0b7]">GET IN TOUCH</span>
                </a>

                <Link
                  href="/"
                  className="pt-4 mt-2 border-t border-white/10 hover:text-[#8be0b7] transition-colors flex items-center justify-between text-base font-semibold text-neutral-400 font-mono"
                >
                  <span>&larr; Return to Main Platform</span>
                  <span className="text-xs text-neutral-500">BIZRAVANA.COM</span>
                </Link>
              </nav>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20am%20interested%20in%20a%20high-performance%20website%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 rounded-full bg-[#6fc59b] text-[#08090d] text-center font-bold text-sm shadow-xl shadow-[#6fc59b]/30 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Consultation</span>
              </a>
              <a
                href="tel:+94750350109"
                className="flex-1 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-white text-center font-semibold text-sm flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#8be0b7]" />
                <span>0750 350 109</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
