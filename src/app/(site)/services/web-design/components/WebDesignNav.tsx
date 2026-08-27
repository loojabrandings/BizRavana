"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X, PhoneCall, MessageSquare } from "lucide-react";

export default function WebDesignNav() {
  const pathname = usePathname();
  const isPortfolioPage = pathname === "/portfolio";
  const [activeTab, setActiveTab] = useState(isPortfolioPage ? "Portfolio" : "Portfolio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getHref = (hash: string) => {
    return isPortfolioPage ? `/services/web-design${hash}` : hash;
  };

  const navItems = [
    { label: "Portfolio", href: "/portfolio", isDirect: true },
    { label: "Process", href: getHref("#solutions"), id: "solutions" },
    { label: "Features", href: getHref("#features"), id: "features" },
    { label: "Pricing", href: getHref("#pricing"), id: "pricing" },
    { label: "Contact", href: getHref("#contact"), id: "contact" },
  ];

  useEffect(() => {
    if (isPortfolioPage) {
      setActiveTab("Portfolio");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;

      for (let i = navItems.length - 1; i >= 0; i--) {
        const id = navItems[i].id;
        if (id) {
          const section = document.getElementById(id);
          if (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveTab(navItems[i].label);
              return;
            }
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
  }, [isPortfolioPage, navItems]);

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
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#ff6b57] transition-colors leading-none">
              BizRavana
            </span>
            <span className="text-[9px] font-mono text-neutral-400 group-hover:text-[#ff6b57] transition-colors mt-0.5 tracking-wider hidden sm:block">
              &larr; Main Site
            </span>
          </div>
        </Link>

        {/* Center: Dynamic Scroll-Spy / Route Nav Capsule */}
        <nav className="hidden md:flex items-center p-1.5 rounded-full bg-[#12131a]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80">
          {navItems.map((item) => {
            const isActive = isPortfolioPage ? item.label === "Portfolio" : activeTab === item.label;

            if (item.isDirect || isPortfolioPage) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "bg-[#fd3a25] text-white font-bold shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveTab(item.label)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-[#fd3a25] text-white font-bold shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
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
          <Link
            href="/services/web-design#pricing"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#d42c1a] hover:from-[#ff8a7a] hover:to-[#e8321e] text-white text-xs font-black tracking-wide shadow-[0_0_25px_rgba(253,58,37,0.4)] hover:scale-105 transition-all"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2.5 rounded-full bg-white/[0.06] border border-white/10 text-white flex items-center justify-center hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-[#ff6b57]" />
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
            className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-xl mx-auto w-full flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#fd3a25] font-bold mb-8">
                [ NAVIGATION PORTAL ]
              </div>

              <nav className="flex flex-col gap-6 text-2xl sm:text-3xl font-extrabold text-white">
                <Link
                  href="/services/web-design"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between"
                >
                  <span>01. Web Design</span>
                  <span className="text-xs font-mono text-neutral-500">OVERVIEW</span>
                </Link>
                <Link
                  href="/portfolio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between"
                >
                  <span>02. Portfolio</span>
                  <span className="text-xs font-mono text-[#ff6b57]">LIVE DEMOS ↗</span>
                </Link>
                <Link
                  href={getHref("#solutions")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between"
                >
                  <span>03. Process</span>
                  <span className="text-xs font-mono text-neutral-500">5 STEPS</span>
                </Link>
                <Link
                  href={getHref("#features")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between"
                >
                  <span>04. Features</span>
                  <span className="text-xs font-mono text-neutral-500">CAPABILITIES</span>
                </Link>
                <Link
                  href={getHref("#pricing")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between"
                >
                  <span>05. Pricing</span>
                  <span className="text-xs font-mono text-neutral-500">PLANS</span>
                </Link>
                <Link
                  href={getHref("#contact")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#ff6b57] transition-colors flex items-center justify-between text-[#ff6b57]"
                >
                  <span>06. Contact Us</span>
                  <span className="text-xs font-mono text-[#ff6b57]">GET IN TOUCH</span>
                </Link>

                <Link
                  href="/"
                  className="pt-4 mt-2 border-t border-white/10 hover:text-[#ff6b57] transition-colors flex items-center justify-between text-base font-semibold text-neutral-400 font-mono"
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
                className="flex-1 py-3.5 rounded-full bg-[#fd3a25] text-white text-center font-bold text-sm shadow-xl shadow-[#fd3a25]/30 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Consultation</span>
              </a>
              <a
                href="tel:+94750350109"
                className="flex-1 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-white text-center font-semibold text-sm flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#ff6b57]" />
                <span>0750 350 109</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
