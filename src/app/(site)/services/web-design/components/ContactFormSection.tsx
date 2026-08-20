"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send } from "lucide-react";

export default function ContactFormSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waText = encodeURIComponent(
      `Hi BizRavana!\n\nName: ${name || "Client"}\nPhone: ${phone || "N/A"}\nProject Details: ${message || "Website inquiry"}`
    );
    window.open(`https://wa.me/94750350109?text=${waText}`, "_blank");
  };

  return (
    <section id="contact" className="py-24 relative bg-[#040406]">
      <div className="wd-container max-w-6xl mx-auto">
        {/* Soft Silver-Gray Outer Curved Container */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[40px] bg-[#c8cbcf] p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden text-[#111216]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading & Contact Tiles */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8">
              <div>
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-black/5 text-xs font-bold text-neutral-800 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#fd3a25] animate-pulse" />
                  <span>Contact</span>
                </div>

                {/* Main Large Heading with Signature Gradient */}
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#111216] leading-[1.08]">
                  Let&apos;s Build <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7a160a] via-[#b31f10] to-[#111216]">
                    Something Great
                  </span>
                </h2>
              </div>

              {/* 3 Stacked Contact Tiles with Signature Smooth Hover Effect */}
              <div className="space-y-3.5 pt-2">
                {/* WhatsApp Tile */}
                <a
                  href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20would%20like%20to%20discuss%20a%20website%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-white/80 hover:border-[#fd3a25] hover:shadow-[0_15px_35px_rgba(253, 58, 37, 0.2)] hover:-translate-y-1 transition-all duration-500 group max-w-md cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      WhatsApp Direct
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#111216] group-hover:text-[#b31f10] transition-colors mt-0.5">
                      0750 350 109
                    </div>
                  </div>
                </a>

                {/* Phone Hotline Tile */}
                <a
                  href="tel:+94750350109"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-white/80 hover:border-[#fd3a25] hover:shadow-[0_15px_35px_rgba(253, 58, 37, 0.2)] hover:-translate-y-1 transition-all duration-500 group max-w-md cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-[#111216] group-hover:text-[#ff6b57] group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      Phone Hotline
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#111216] group-hover:text-[#b31f10] transition-colors mt-0.5">
                      0750 350 109
                    </div>
                  </div>
                </a>

                {/* Email Tile */}
                <a
                  href="mailto:support@bizravana.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-white/80 hover:border-[#fd3a25] hover:shadow-[0_15px_35px_rgba(253, 58, 37, 0.2)] hover:-translate-y-1 transition-all duration-500 group max-w-md cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-[#111216] group-hover:text-[#ff6b57] group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      E-mail address
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#111216] group-hover:text-[#b31f10] transition-colors mt-0.5">
                      support@bizravana.com
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Stark White Floating Form Card with Signature Smooth Hover Effect */}
            <div className="lg:col-span-6">
              <div className="bg-[#ffffff] rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.14)] border border-white hover:border-[#fd3a25]/60 hover:shadow-[0_30px_70px_rgba(111,197,155,0.22)] hover:-translate-y-1 transition-all duration-500">
                <h3 className="text-2xl sm:text-3xl font-black text-[#111216] tracking-tight mb-8">
                  Fill this form below
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pb-3 pt-1 border-b border-neutral-300 focus:border-[#b31f10] bg-transparent text-sm text-[#111216] placeholder-neutral-400 outline-none transition-colors"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Your Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter your phone or WhatsApp number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pb-3 pt-1 border-b border-neutral-300 focus:border-[#b31f10] bg-transparent text-sm text-[#111216] placeholder-neutral-400 outline-none transition-colors"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 block">
                      More About The Project
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your business, timeline, and goals..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pb-2 pt-1 border-b border-neutral-300 focus:border-[#b31f10] bg-transparent text-sm text-[#111216] placeholder-neutral-400 outline-none resize-none transition-colors"
                    />
                  </div>

                  {/* WhatsApp Direct Option with Official SVG Icon */}
                  <div className="flex items-center justify-between text-xs text-neutral-600 pt-2">
                    <a
                      href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20would%20like%20to%20discuss%20a%20website%20project."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#25D366]">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </div>
                      <span>Prefer direct WhatsApp? Tap here</span>
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#111216] hover:bg-gradient-to-r hover:from-[#8f1a0d] hover:via-[#b31f10] hover:to-[#0d0506] text-white font-bold text-sm tracking-wide shadow-xl shadow-black/30 hover:shadow-[0_10px_30px_rgba(45,106,79,0.4)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <span>Submit Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
