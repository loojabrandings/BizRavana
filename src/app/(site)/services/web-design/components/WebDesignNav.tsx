"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Globe,
  Layers,
  Bot,
  Workflow,
  Palette,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Flame,
} from "lucide-react";

interface SubNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

const SERVICES_SUBNAV: SubNavItem[] = [
  {
    title: "Web Design & Development",
    href: "/#pricing",
    icon: Globe,
  },
  {
    title: "BizRavana OMS",
    href: "/services/bizravana-oms",
    icon: Flame,
    highlight: true,
  },
  {
    title: "Custom ORM & CRM",
    href: "/services/custom-crm",
    icon: Layers,
    badge: "Coming Soon",
  },
  {
    title: "AI Chatbots",
    href: "/services/ai-chatbots",
    icon: Bot,
    badge: "Coming Soon",
  },
  {
    title: "Business Automations",
    href: "/services/ai-automations",
    icon: Workflow,
    badge: "Coming Soon",
  },
  {
    title: "Brand Identity Design",
    href: "/services/brand-identity",
    icon: Palette,
    badge: "Coming Soon",
  },
];

export default function WebDesignNav() {
  const pathname = usePathname();
  const isPortfolioPage = pathname === "/portfolio";
  const [activeTab, setActiveTab] = useState("Home");
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getHref = (hash: string) => {
    return pathname === "/" ? hash : `/${hash}`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scrollspy for active tab
  useEffect(() => {
    if (isPortfolioPage) {
      setActiveTab("Portfolio");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;

      if (window.scrollY < 300) {
        setActiveTab("Home");
        return;
      }

      const sections = [
        { id: "solutions", label: "Process" },
        { id: "features", label: "Features" },
        { id: "pricing", label: "Pricing" },
        { id: "contact", label: "Contact" },
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(sections[i].label);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPortfolioPage, pathname]);

  return (
    <>
      <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-8 max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Official Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group py-1"
          title="BizRavana Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/images/bizravana-logo.png"
              alt="BizRavana"
              width={32}
              height={32}
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-kanit font-black text-lg sm:text-xl uppercase tracking-tight text-white group-hover:text-[#ff8a7a] transition-colors leading-none">
              BizRavana
            </span>
            <span className="text-[9px] font-mono text-neutral-400 group-hover:text-[#ff8a7a] transition-colors mt-0.5 tracking-wider hidden sm:block">
              Web &amp; Digital Engineering
            </span>
          </div>
        </Link>

        {/* Center: Dynamic Capsule Navbar */}
        <nav className="hidden md:flex items-center p-1.5 rounded-full bg-[#0C0C0C]/90 backdrop-blur-2xl border-2 border-[#D7E2EA]/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative">
          
          {/* Home Link */}
          <Link
            href="/"
            onClick={() => setActiveTab("Home")}
            className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "Home" && !isPortfolioPage
                ? "bg-[#fd3a25] text-white shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Home
          </Link>

          {/* Services with Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                servicesDropdownOpen
                  ? "bg-white/10 text-white"
                  : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <span>Services</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  servicesDropdownOpen ? "rotate-180 text-[#ff8a7a]" : ""
                }`}
              />
            </button>

            {/* Desktop Dropdown Card */}
            <AnimatePresence>
              {servicesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-4 rounded-[32px] bg-[#0C0C0C]/95 backdrop-blur-3xl border-2 border-[#D7E2EA]/30 shadow-[0_30px_70px_rgba(0,0,0,0.95)] z-50"
                >
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff8a7a]">
                      [ WHAT WE ENGINEER ]
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Custom Digital Solutions
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES_SUBNAV.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <Link
                          key={sub.title}
                          href={sub.href}
                          onClick={() => setServicesDropdownOpen(false)}
                          className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group ${
                            sub.highlight
                              ? "bg-[#140807] border-[#fd3a25]/40 hover:border-[#fd3a25] hover:bg-[#1a0b0a]"
                              : "bg-white/[0.03] border-white/[0.06] hover:border-white/25 hover:bg-white/[0.08]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                                sub.highlight
                                  ? "bg-[#fd3a25] text-white"
                                  : "bg-white/10 text-[#ff8a7a]"
                              }`}
                            >
                              <Icon className="w-4 h-4 stroke-[2.2px]" />
                            </div>

                            <span className="text-xs font-bold font-kanit uppercase tracking-tight text-white group-hover:text-[#ff8a7a] transition-colors truncate">
                              {sub.title}
                            </span>
                          </div>

                          {sub.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider bg-white/[0.06] text-neutral-400 border border-white/10 shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Portfolio */}
          <Link
            href="/portfolio"
            onClick={() => setActiveTab("Portfolio")}
            className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 ${
              isPortfolioPage
                ? "bg-[#fd3a25] text-white shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Portfolio
          </Link>

          {/* Process */}
          <a
            href={getHref("#solutions")}
            onClick={() => setActiveTab("Process")}
            className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "Process" && !isPortfolioPage
                ? "bg-[#fd3a25] text-white shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Process
          </a>

          {/* Pricing */}
          <a
            href={getHref("#pricing")}
            onClick={() => setActiveTab("Pricing")}
            className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "Pricing" && !isPortfolioPage
                ? "bg-[#fd3a25] text-white shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Pricing
          </a>

          {/* Contact */}
          <a
            href={getHref("#contact")}
            onClick={() => setActiveTab("Contact")}
            className={`px-4 py-1.5 rounded-full text-xs font-kanit font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "Contact" && !isPortfolioPage
                ? "bg-[#fd3a25] text-white shadow-[0_0_20px_rgba(253,58,37,0.6)] scale-105"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Right: CTA Pill & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={getHref("#pricing")}
            className="hidden sm:inline-flex wd-contact-pill-btn px-6 py-2.5 text-xs tracking-wider"
          >
            <span className="flex items-center gap-1.5">
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2.5 rounded-full bg-[#0C0C0C]/90 border-2 border-[#D7E2EA]/25 text-white flex items-center justify-center hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#ff8a7a]" />
            ) : (
              <Menu className="w-5 h-5 text-[#ff8a7a]" />
            )}
          </button>
        </div>
      </header>

      {/* Fullscreen Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0C0C0C]/98 backdrop-blur-3xl flex flex-col p-6 pt-24 overflow-y-auto"
          >
            <div className="max-w-md mx-auto w-full flex flex-col justify-between flex-1">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#ff8a7a] font-bold mb-6 pb-2 border-b border-white/10 flex items-center justify-between">
                  <span>[ MENU PORTAL ]</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <nav className="flex flex-col gap-4 font-kanit font-bold text-xl uppercase tracking-tight">
                  {/* Home */}
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#fd3a25] flex items-center justify-between text-white"
                  >
                    <span>01. Home</span>
                    <span className="text-xs font-mono text-neutral-500">ROOT</span>
                  </Link>

                  {/* Services Accordion */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      className="w-full p-3 flex items-center justify-between text-white cursor-pointer"
                    >
                      <span>02. Services</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 text-[#ff8a7a] ${
                          mobileServicesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {mobileServicesOpen && (
                      <div className="p-3 pt-0 space-y-2 border-t border-white/[0.06]">
                        {SERVICES_SUBNAV.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-between text-sm font-normal normal-case text-neutral-300"
                          >
                            <span>{sub.title}</span>
                            {sub.badge && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full text-neutral-400 bg-white/[0.06] border border-white/10 shrink-0">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Portfolio */}
                  <Link
                    href="/portfolio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#fd3a25] flex items-center justify-between text-white"
                  >
                    <span>03. Portfolio</span>
                    <span className="text-xs font-mono text-[#ff8a7a]">LIVE DEMOS ↗</span>
                  </Link>

                  {/* Process */}
                  <a
                    href={getHref("#solutions")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#fd3a25] flex items-center justify-between text-white"
                  >
                    <span>04. Process</span>
                    <span className="text-xs font-mono text-neutral-500">ROADMAP</span>
                  </a>

                  {/* Pricing */}
                  <a
                    href={getHref("#pricing")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#fd3a25] flex items-center justify-between text-white"
                  >
                    <span>05. Pricing</span>
                    <span className="text-xs font-mono text-neutral-500">PACKAGES</span>
                  </a>

                  {/* Contact */}
                  <a
                    href={getHref("#contact")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#fd3a25] flex items-center justify-between text-[#ff8a7a]"
                  >
                    <span>06. Contact Us</span>
                    <span className="text-xs font-mono text-[#ff8a7a]">INQUIRE</span>
                  </a>
                </nav>
              </div>

              {/* Bottom Mobile Action Buttons */}
              <div className="pt-6 mt-6 border-t border-white/10 flex flex-col gap-3">
                <a
                  href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20am%20interested%20in%20a%20website%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wd-contact-pill-btn w-full py-3.5 text-xs"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </span>
                </a>

                <a
                  href="tel:+94750350109"
                  className="wd-ghost-pill-btn w-full py-3 text-xs"
                >
                  <span className="flex items-center justify-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>0750 350 109</span>
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
