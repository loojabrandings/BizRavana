'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function JewelleryNavbar() {
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Signature', href: '#signature' },
    { name: 'Collection', href: '#collection' },
    { name: 'Service', href: '#service' },
    { name: 'Story', href: '#story' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6 md:py-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Logo in Custom Font */}
        <Link 
          href="/portfolio/luxury-jewellery" 
          className="group flex items-center transition-transform duration-300 hover:scale-105"
        >
          <span className="font-custom-brand text-3xl sm:text-4xl lg:text-5xl text-[#F6EFE7] tracking-tight lowercase">
            câlin
          </span>
        </Link>

        {/* Center: Floating Pill Navigation Bar */}
        <nav className="hidden lg:flex items-center lux-pill-navbar rounded-full px-2 py-1.5 backdrop-blur-md">
          {navLinks.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                className={`text-xs xl:text-sm font-medium tracking-wide px-3.5 xl:px-5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'lux-pill-active font-semibold shadow-md'
                    : 'lux-pill-link'
                }`}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Right: Glass Rounded Square Social Icons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="lux-social-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="lux-social-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="lux-social-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Vimeo / Video / Pinterest */}
          <a
            href="https://vimeo.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vimeo"
            className="lux-social-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.396 7.164c-.093 2.026-1.507 4.798-4.245 8.32-2.84 3.684-5.241 5.526-7.202 5.526-1.22 0-2.256-1.129-3.109-3.385l-1.69-6.195c-.628-2.261-1.306-3.39-2.036-3.39-.158 0-.712.335-1.66 1.006L1 7.426C2.102 6.45 3.328 5.42 4.678 4.336c1.867-1.528 3.242-2.335 4.125-2.42 2.19-.211 3.541 1.285 4.053 4.492.548 3.427.915 5.549 1.101 6.368.563 2.502 1.18 3.754 1.85 3.754.516 0 1.298-.823 2.348-2.469 1.036-1.647 1.583-2.901 1.64-3.763.099-1.464-.424-2.196-1.572-2.196-.549 0-1.13.125-1.744.376 1.125-3.687 3.245-5.467 6.36-5.342 2.296.095 3.407 1.442 3.333 4.041z" />
            </svg>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lux-social-btn w-10 h-10 rounded-xl flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 mx-auto max-w-sm lux-pill-navbar rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'lux-pill-active font-semibold shadow'
                      : 'lux-pill-link hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </div>
          
          {/* Mobile Socials */}
          <div className="flex items-center justify-center gap-3 pt-4 mt-3 border-t border-black/10">
            <a href="https://facebook.com" className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z" /></svg>
            </a>
            <a href="https://instagram.com" className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://x.com" className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
