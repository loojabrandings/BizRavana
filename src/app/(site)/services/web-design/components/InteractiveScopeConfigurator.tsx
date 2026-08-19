"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, MessageSquare, ArrowRight, Layers, Smartphone, ShieldCheck, Zap } from "lucide-react";

const PROJECT_TYPES = [
  { id: "corporate", label: "Corporate Authority Site", desc: "For established businesses & export companies needing world-class credibility." },
  { id: "ecommerce", label: "High-Converting E-Commerce", desc: "For retail & D2C brands wanting PayHere, MintPay, and sub-second checkout." },
  { id: "hospitality", label: "Villa & Hospitality Booking", desc: "For luxury resorts, villas, and travel companies needing direct bookings." },
  { id: "webapp", label: "Custom SaaS & Web App", desc: "For startups and digital platforms requiring custom database and user portals." },
];

const CAPABILITIES = [
  { id: "whatsapp", label: "1-Click WhatsApp CRM Lead Automation" },
  { id: "payment", label: "PayHere / MintPay Gateway Integration" },
  { id: "seo", label: "Enterprise Local & Global SEO Matrix" },
  { id: "cms", label: "Custom Headless CMS for Team Updates" },
  { id: "multilang", label: "Multi-Language Support (English / Sinhala)" },
  { id: "3d", label: "Interactive 3D / WebGL Micro-Physics" },
];

export default function InteractiveScopeConfigurator() {
  const [selectedType, setSelectedType] = useState("corporate");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "whatsapp",
    "payment",
    "seo",
  ]);
  const [timeline, setTimeline] = useState("standard");

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const selectedTypeName =
    PROJECT_TYPES.find((t) => t.id === selectedType)?.label || "Corporate Authority Site";

  const selectedFeatureNames = CAPABILITIES.filter((c) =>
    selectedFeatures.includes(c.id)
  )
    .map((c) => c.label)
    .join(", ");

  const waMessage = encodeURIComponent(
    `Hi BizRavana! I generated a custom Project Blueprint on your website:\n\n` +
      `• Platform Type: ${selectedTypeName}\n` +
      `• Timeline: ${timeline === "express" ? "Express Sprint (14 Days)" : "Standard Sprint (3-4 Weeks)"}\n` +
      `• Capabilities: ${selectedFeatureNames}\n\n` +
      `I would like to discuss exact scope and pricing for my business.`
  );

  return (
    <section id="blueprint" className="py-24 relative bg-[#060608]">
      {/* Background glow */}
      <div className="wd-radial-glow wd-radial-glow-hero" />

      <div className="wd-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ INTERACTIVE BLUEPRINT CONFIGURATOR ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Engineer Your Custom <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              Project Blueprint.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Select your platform requirements below to instantly configure your tailored architecture summary.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Configuration Steps */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Platform Type */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#6fc59b] font-bold mb-4 block">
                01 // Select Platform Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECT_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? "bg-[#0b1f15] border-[#6fc59b] text-white shadow-[0_0_20px_rgba(111,197,155,0.25)]"
                          : "bg-white/[0.02] border-white/[0.08] text-neutral-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">{type.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#8be0b7]" />}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Capabilities */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#6fc59b] font-bold mb-4 block">
                02 // Select Essential Integrations
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CAPABILITIES.map((cap) => {
                  const isSelected = selectedFeatures.includes(cap.id);
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => toggleFeature(cap.id)}
                      className={`p-4 rounded-xl text-left transition-all border flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-white/[0.06] border-[#6fc59b]/80 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:border-white/15"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border flex-shrink-0 ${
                          isSelected
                            ? "bg-[#6fc59b] border-[#8be0b7] text-[#08090d]"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium text-neutral-200">{cap.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Timeline */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#6fc59b] font-bold mb-4 block">
                03 // Delivery Velocity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTimeline("express")}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    timeline === "express"
                      ? "bg-[#0b1f15] border-[#6fc59b] text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-white">
                    <span>Express Sprint (14 Days)</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400">High priority dedicated launch sprint</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTimeline("standard")}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    timeline === "standard"
                      ? "bg-[#0b1f15] border-[#6fc59b] text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-white">
                    <span>Standard Sprint (3-4 Weeks)</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8be0b7]" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Full discovery, prototyping &amp; QA</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Blueprint Summary Card */}
          <div className="lg:col-span-5">
            <div className="wd-glass-card p-8 border-[#6fc59b]/30 bg-[#0e1017] shadow-2xl relative">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#8be0b7]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Live Blueprint Summary
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#6fc59b]/10 text-[#8be0b7] border border-[#6fc59b]/20">
                  READY
                </span>
              </div>

              {/* Blueprint Details */}
              <div className="space-y-5 mb-8">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Selected Architecture</div>
                  <div className="text-lg font-bold text-white mt-1">{selectedTypeName}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Velocity</div>
                  <div className="text-sm font-semibold text-neutral-200 mt-1">
                    {timeline === "express" ? "Express Sprint (14 Days)" : "Standard Sprint (3-4 Weeks)"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase mb-2.5">Selected Modules ({selectedFeatures.length})</div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-2">
                    {CAPABILITIES.filter((c) => selectedFeatures.includes(c.id)).map((cap) => (
                      <div key={cap.id} className="text-xs text-neutral-300 flex items-center gap-2">
                        <Check className="w-3 h-3 text-[#8be0b7] flex-shrink-0" />
                        <span>{cap.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-neutral-300 leading-relaxed">
                  <div className="text-white font-bold mb-1.5">Guaranteed Deliverables:</div>
                  • Sub-0.8s Load Speed Guarantee <br />
                  • 100% Mobile Responsive <br />
                  • Lifetime Source Code Ownership
                </div>
              </div>

              {/* Action Button */}
              <a
                href={`https://wa.me/94750350109?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] font-bold text-center flex items-center justify-center gap-2 text-sm shadow-xl shadow-[#6fc59b]/30 hover:scale-[1.02] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Transmit Blueprint to WhatsApp</span>
              </a>

              <p className="text-[10px] text-center text-neutral-400 mt-4 font-mono">
                Instant reply from our Lead Architect within 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
