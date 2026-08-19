"use client";

import { motion } from "framer-motion";
import { 
  Smartphone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Share2, 
  Search, 
  BarChart3, 
  Zap, 
  Lock, 
  Globe, 
  Server, 
  FileText,
  Sparkles
} from "lucide-react";

const FEATURES = [
  {
    num: "01",
    title: "Responsive Design",
    desc: "Looks great on mobile, tablet and desktop.",
    icon: Smartphone,
    category: "EXPERIENCE",
  },
  {
    num: "02",
    title: "WhatsApp Integration",
    desc: "Let customers contact you instantly.",
    icon: MessageSquare,
    category: "CONVERSIONS",
  },
  {
    num: "03",
    title: "Contact Forms",
    desc: "Capture customer enquiries.",
    icon: Mail,
    category: "LEAD GENERATION",
  },
  {
    num: "04",
    title: "Google Maps",
    desc: "Make your location easy to find.",
    icon: MapPin,
    category: "LOCAL PRESENCE",
  },
  {
    num: "05",
    title: "Social Integration",
    desc: "Connect your social media presence.",
    icon: Share2,
    category: "BRANDING",
  },
  {
    num: "06",
    title: "Basic SEO",
    desc: "Search-engine-friendly foundations.",
    icon: Search,
    category: "VISIBILITY",
  },
  {
    num: "07",
    title: "Analytics",
    desc: "Understand how visitors use your website.",
    icon: BarChart3,
    category: "INSIGHTS",
  },
  {
    num: "08",
    title: "Speed Optimization",
    desc: "Faster and smoother browsing.",
    icon: Zap,
    category: "PERFORMANCE",
  },
  {
    num: "09",
    title: "SSL Setup",
    desc: "Secure HTTPS website.",
    icon: Lock,
    category: "SECURITY",
  },
  {
    num: "10",
    title: "Domain Setup",
    desc: "Help connecting your domain.",
    icon: Globe,
    category: "INFRASTRUCTURE",
  },
  {
    num: "11",
    title: "Hosting Setup",
    desc: "Deployment and hosting configuration.",
    icon: Server,
    category: "DEPLOYMENT",
  },
  {
    num: "12",
    title: "Content Integration",
    desc: "Add your supplied text, images and information.",
    icon: FileText,
    category: "CONTENT",
  },
];

export default function TechOrbitHub() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#060608]">
      <div className="wd-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ FEATURES ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Everything You Need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              Launch With Confidence.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            A comprehensive, battle-tested foundation included in our website development sprints.
          </p>
        </div>

        {/* 12-Item Editorial Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {FEATURES.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                className="wd-glass-card p-6 border-white/[0.08] hover:border-[#6fc59b]/40 flex flex-col justify-between group transition-all relative overflow-hidden"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-[#8be0b7] flex items-center justify-center group-hover:bg-[#6fc59b] group-hover:text-[#08090d] group-hover:scale-105 transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 group-hover:text-[#8be0b7] transition-colors">
                      {feat.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mb-1.5 group-hover:text-[#8be0b7] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.04] mt-5 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase">
                  <span>{feat.category}</span>
                  <span className="text-[#6fc59b] font-bold">INCLUDED</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
