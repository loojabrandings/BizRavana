"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send, Sparkles } from "lucide-react";

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
    <section id="contact" className="py-28 relative bg-[#0C0C0C] border-t border-white/[0.06]">
      <div className="wd-container max-w-6xl mx-auto">
        {/* Obsidian Curved Outer Container */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[36px] sm:rounded-[52px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/30 p-8 sm:p-12 lg:p-16 shadow-[0_35px_80px_rgba(0,0,0,0.9)] relative overflow-hidden text-white"
        >
          {/* Subtle Ambient Flare inside container */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#fd3a25]/10 rounded-full blur-[140px] pointer-events-none -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Heading & Contact Tiles */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8">
              <div>
                {/* Pill Tag */}
                <div className="wd-badge-mono mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
                  <span>[ DIRECT CHANNELS ]</span>
                </div>

                {/* Main Large Heading */}
                <h2
                  className="font-kanit font-black uppercase text-white tracking-tight leading-[1.05] mb-4 select-none"
                  style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)" }}
                >
                  LET&apos;S BUILD <br />
                  <span className="hero-heading">
                    SOMETHING
                  </span> <br />
                  <span className="hero-heading-accent">
                    INCREDIBLE.
                  </span>
                </h2>

                <p className="text-neutral-400 text-sm sm:text-base font-kanit font-light max-w-md leading-relaxed">
                  Have an idea, project, or question? Send us a message and our team will get back to you within 2 hours.
                </p>
              </div>

              {/* 3 Stacked Contact Tiles */}
              <div className="space-y-3 pt-2">
                {/* WhatsApp Tile */}
                <a
                  href="https://wa.me/94750350109?text=Hi%20BizRavana,%20I%20would%20like%20to%20discuss%20a%20website%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-[22px] bg-white/[0.04] border border-white/10 hover:border-[#fd3a25] hover:bg-white/[0.08] transition-all duration-300 group max-w-md cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      WhatsApp Direct
                    </div>
                    <div className="text-sm sm:text-base font-bold font-kanit text-white group-hover:text-[#ff8a7a] transition-colors mt-0.5">
                      0750 350 109
                    </div>
                  </div>
                </a>

                {/* Phone Hotline Tile */}
                <a
                  href="tel:+94750350109"
                  className="flex items-center gap-4 p-4 rounded-[22px] bg-white/[0.04] border border-white/10 hover:border-[#fd3a25] hover:bg-white/[0.08] transition-all duration-300 group max-w-md cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-white group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#ff8a7a]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      Direct Hotline
                    </div>
                    <div className="text-sm sm:text-base font-bold font-kanit text-white group-hover:text-[#ff8a7a] transition-colors mt-0.5">
                      0750 350 109
                    </div>
                  </div>
                </a>

                {/* Email Tile */}
                <a
                  href="mailto:support@bizravana.com"
                  className="flex items-center gap-4 p-4 rounded-[22px] bg-white/[0.04] border border-white/10 hover:border-[#fd3a25] hover:bg-white/[0.08] transition-all duration-300 group max-w-md cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-white group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#ff8a7a]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      Official Email
                    </div>
                    <div className="text-sm sm:text-base font-bold font-kanit text-white group-hover:text-[#ff8a7a] transition-colors mt-0.5">
                      support@bizravana.com
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Dark Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#0C0C0C] rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 border-2 border-[#D7E2EA]/25 shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-bold font-kanit uppercase text-white tracking-tight mb-8">
                  Send a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pb-3 pt-1 border-b-2 border-white/15 focus:border-[#fd3a25] bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 outline-none transition-colors font-kanit"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 077 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pb-3 pt-1 border-b-2 border-white/15 focus:border-[#fd3a25] bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 outline-none transition-colors font-kanit"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      Project Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your business, website goals, or questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pb-2 pt-1 border-b-2 border-white/15 focus:border-[#fd3a25] bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 outline-none resize-none transition-colors font-kanit"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="wd-contact-pill-btn w-full py-4 text-xs sm:text-sm tracking-wider group cursor-pointer"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>Send Message via WhatsApp</span>
                        <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
