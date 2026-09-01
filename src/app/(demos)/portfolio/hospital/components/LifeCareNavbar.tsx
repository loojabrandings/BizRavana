'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { LifeCareLoginModal } from './LifeCareLoginModal';
import { useLifeCareAuth } from '../hooks/useLifeCareAuth';

const HOME_PATH = '/portfolio/hospital';
const SERVICES_PATH = '/portfolio/hospital/services';
const DOCTORS_PATH = '/portfolio/hospital/doctors';
const CHANNELING_PATH = '/portfolio/hospital/channeling';

const NAV_LINKS: Array<{ label: string; href: string; anchor?: string }> = [
  { label: 'Home', href: HOME_PATH },
  { label: 'About', href: `${HOME_PATH}#about` },
  { label: 'Doctors', href: DOCTORS_PATH, anchor: '#doctors' },
  { label: 'Services', href: SERVICES_PATH, anchor: '#directory' },
  { label: 'Channeling', href: CHANNELING_PATH, anchor: '#specialties' },
  { label: 'Appointments', href: `${HOME_PATH}#appointments` },
  { label: 'Contact', href: `${HOME_PATH}#contact` },
];

interface LifeCareNavbarProps {
  activePage?: 'Home' | 'Services' | 'Doctors' | 'Channeling';
}

export function LifeCareNavbar({ activePage = 'Home' }: LifeCareNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, login, logout } = useLifeCareAuth();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Pill Navbar — Fixed Floating Glass Bar */}
      <header
        className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-5xl transition-all duration-300`}
      >
        <nav
          className={`flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50'
              : 'bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/40'
          }`}
          aria-label="Primary navigation"
        >
          {/* Left: Brand */}
          <Link
            href={HOME_PATH}
            className="flex items-center gap-2 py-1 select-none group shrink-0"
          >
            <span className="font-dm-sans font-bold text-lg sm:text-xl tracking-[-0.04em] leading-none transition-colors">
              <span className="text-[#102BDC] group-hover:text-[#0C22B0]">LifeCare</span>{' '}
              <span className="font-normal text-[#475569]">Hospitals</span>
            </span>
          </Link>

          {/* Center: Desktop Nav Links in Pill Capsule */}
          <div className="hidden lg:flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-black/[0.04] backdrop-blur-sm">
            {NAV_LINKS.map((link) => {
              const isActive = link.label === activePage;
              return (
                <a
                  key={link.label}
                  href={isActive && link.anchor ? link.anchor : link.href}
                  className={`relative px-3.5 xl:px-4 py-2 rounded-full text-[13px] xl:text-[14px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#102BDC] bg-[#102BDC]/10 font-semibold'
                      : 'text-[#475569] hover:text-[#0D1527] hover:bg-black/[0.04]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right: Auth + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Account Menu"
                  className="w-9 h-9 rounded-full bg-[#102BDC] text-white flex items-center justify-center font-dm-sans font-bold text-sm uppercase shadow-sm hover:bg-[#0C22B0] transition-colors"
                >
                  {user.charAt(0)}
                </button>

                {/* User Dropdown */}
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_16px_48px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-fade-up">
                      <div className="px-4 py-3 border-b border-slate-100/80">
                        <p className="font-inter text-[10px] uppercase tracking-wider text-[#94A3B8]">
                          Signed in as
                        </p>
                        <p className="font-dm-sans font-bold text-sm text-[#0D1527] mt-0.5">
                          {user}
                        </p>
                      </div>
                      <Link
                        href="/portfolio/hospital/account"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#475569] hover:bg-slate-50 hover:text-[#102BDC] transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        <span className="font-inter">My Account</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          router.push('/portfolio/hospital');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#475569] hover:bg-slate-50 hover:text-[#102BDC] transition-colors"
                      >
                        <LogOut size={15} />
                        <span className="font-inter">Log out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                aria-label="Log In"
                className="w-9 h-9 rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 flex items-center justify-center text-[#102BDC] hover:bg-[#102BDC] hover:text-white hover:border-[#102BDC] transition-all duration-200"
              >
                <User size={17} strokeWidth={1.75} />
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="lg:hidden w-9 h-9 rounded-full bg-black/[0.04] flex items-center justify-center text-[#0D1527] hover:bg-black/[0.08] transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Dropdown Panel — Frosted Glass Pill */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-3 sm:inset-x-4 top-[68px] sm:top-[76px] z-50 lg:hidden animate-fade-in">
          {/* Backdrop blur layer */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] border border-white/50" />

          {/* Nav Links */}
          <div className="relative z-10 p-3 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = link.label === activePage;
              return (
                <a
                  key={link.label}
                  href={isActive && link.anchor ? link.anchor : link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#102BDC] bg-[#102BDC]/10 font-semibold'
                      : 'text-[#475569] hover:text-[#0D1527] hover:bg-black/[0.04]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            {/* Mobile: My Account link when logged in */}
            {user && (
              <>
                <div className="my-2 mx-2 border-t border-slate-100" />
                <Link
                  href="/portfolio/hospital/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl text-sm font-medium text-[#102BDC] bg-[#102BDC]/10 flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    router.push('/portfolio/hospital');
                  }}
                  className="px-4 py-3 rounded-2xl text-sm font-medium text-[#475569] hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 transition-all duration-200"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {loginOpen && (
        <LifeCareLoginModal
          onClose={() => setLoginOpen(false)}
          onLogin={(name) => {
            login(name);
            setLoginOpen(false);
            router.push('/portfolio/hospital/account');
          }}
        />
      )}
    </>
  );
}
