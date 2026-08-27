"use client";

import Link from "next/link";
import Image from "next/image";

export default function WebDesignFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="pt-28 pb-12 relative bg-[#060608] overflow-hidden text-white border-t border-white/[0.06]">
      {/* Massive Background Watermark Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none -z-0">
        <span className="text-[14vw] font-black font-kanit tracking-tighter text-white/[0.02] uppercase whitespace-nowrap">
          BizRavana
        </span>
      </div>

      <div className="wd-container relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Center Official BizRavana Logo */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-6">
          <Image
            src="/images/bizravana-logo.png"
            alt="BizRavana Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl font-bold font-kanit uppercase tracking-tight text-white mb-2">
          Connect with BizRavana on social
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-400 font-kanit font-light mb-10">
          Follow our latest design launches, case studies, and engineering updates.
        </p>

        {/* 4 Stark White Social Pill Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-24">
          
          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20am%20interested%20in%20a%20website%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-full bg-white hover:bg-neutral-100 text-[#0a0b10] font-bold font-kanit text-sm shadow-xl flex items-center justify-between gap-4 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <span>WhatsApp</span>
            <div className="w-8 h-8 rounded-full bg-[#0a0b10] text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
          </a>

          {/* Facebook */}
          <a
            href="https://web.facebook.com/bizravana"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-full bg-white hover:bg-neutral-100 text-[#0a0b10] font-bold font-kanit text-sm shadow-xl flex items-center justify-between gap-4 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <span>Facebook</span>
            <div className="w-8 h-8 rounded-full bg-[#0a0b10] text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/bizravana/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-full bg-white hover:bg-neutral-100 text-[#0a0b10] font-bold font-kanit text-sm shadow-xl flex items-center justify-between gap-4 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <span>Instagram</span>
            <div className="w-8 h-8 rounded-full bg-[#0a0b10] text-[#E4405F] group-hover:bg-[#E4405F] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </a>

          {/* Email Support */}
          <a
            href="mailto:support@bizravana.com"
            className="px-6 py-4 rounded-full bg-white hover:bg-neutral-100 text-[#0a0b10] font-bold font-kanit text-sm shadow-xl flex items-center justify-between gap-4 transition-all duration-300 hover:scale-105 group cursor-pointer"
          >
            <span>Email</span>
            <div className="w-8 h-8 rounded-full bg-[#0a0b10] text-[#fd3a25] group-hover:bg-[#fd3a25] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
          </a>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="w-full pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400 font-kanit">
          {/* Left: Nav Links */}
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="text-[#ff6b57] hover:text-white transition-colors">
              Web Design
            </Link>
            <Link href="/services/bizravana-oms" className="hover:text-white transition-colors">
              BizRavana OMS
            </Link>
            <a href="#solutions" className="hover:text-white transition-colors">
              Process
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              Showcase
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Center: Copyright */}
          <div className="font-mono text-neutral-400">
            &copy; {new Date().getFullYear()} BizRavana. All Rights Reserved.
          </div>

          {/* Right: Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors font-medium cursor-pointer"
          >
            <span>Back to top</span>
            <span>&uarr;</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
