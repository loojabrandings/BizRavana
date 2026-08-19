"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Globe, 
  ArrowRight, 
  Layers, 
  Package, 
  Boxes, 
  Receipt, 
  Truck, 
  BarChart3, 
  MessageSquare, 
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react";

const OMS_PILLARS = [
  { label: "Order Management", desc: "Centralized multi-channel orders", icon: Package },
  { label: "Inventory Tracking", desc: "Live stock depletion & alerts", icon: Boxes },
  { label: "Expense Management", desc: "Realtime cash flow & overheads", icon: Receipt },
  { label: "Delivery Tracking", desc: "Waybill & courier sync across LK", icon: Truck },
  { label: "Automated Reports", desc: "Daily P&L & revenue dashboards", icon: BarChart3 },
  { label: "WhatsApp Automation", desc: "Automated receipts & tracking pings", icon: MessageSquare },
  { label: "Profit Tracking", desc: "Net margins per item & campaign", icon: TrendingUp },
];

export default function BizRavanaOmsBridge() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#040406]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6fc59b]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="wd-container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ NATIVE ECOSYSTEM EXPANSION ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Your Website Gets Customers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              BizRavana Helps You Manage Them.
            </span>
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            If your business receives orders through your website, WhatsApp or social media, 
            you can take your workflow further with BizRavana.
          </p>
        </div>

        {/* Visual Relationship Diagram */}
        <div className="wd-glass-card p-8 sm:p-12 border-[#6fc59b]/30 bg-gradient-to-b from-[#0a1610] via-[#090d0b] to-[#060709] relative overflow-hidden mb-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Node: Front Stage Website */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center lg:text-left relative">
              <div className="w-12 h-12 rounded-xl bg-[#6fc59b]/20 border border-[#6fc59b]/40 text-[#8be0b7] flex items-center justify-center mb-4 mx-auto lg:mx-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-[#8be0b7] uppercase tracking-widest mb-1">
                FRONT STAGE
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                WEBSITE
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                &ldquo;Bring customers in&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1 text-xs text-neutral-400">
                <div>• Sub-0.8s High-Converting UI</div>
                <div>• Direct WhatsApp Inquiries</div>
                <div>• PayHere &amp; MintPay Gateway</div>
              </div>
            </div>

            {/* Center Sync Rail */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center py-4 lg:py-0">
              <div className="hidden lg:flex items-center gap-3 w-full justify-center">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#6fc59b]" />
                <div className="px-3.5 py-1.5 rounded-full bg-[#6fc59b]/15 border border-[#6fc59b]/40 text-[11px] font-mono text-[#8be0b7] font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#6fc59b]/20">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  <span>Realtime Sync</span>
                </div>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#6fc59b]" />
              </div>

              {/* Mobile Arrow */}
              <div className="lg:hidden flex flex-col items-center gap-2">
                <div className="w-0.5 h-8 bg-gradient-to-b from-[#6fc59b] to-transparent" />
                <span className="px-3 py-1 rounded-full bg-[#6fc59b]/15 border border-[#6fc59b]/30 text-[10px] font-mono text-[#8be0b7] font-bold">
                  REALTIME SYNC
                </span>
                <div className="w-0.5 h-8 bg-gradient-to-t from-[#6fc59b] to-transparent" />
              </div>
            </div>

            {/* Right Node: Operations Hub BizRavana */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.03] border border-[#6fc59b]/40 text-center lg:text-left relative shadow-lg shadow-[#6fc59b]/10">
              <div className="w-12 h-12 rounded-xl bg-[#6fc59b] text-[#08090d] flex items-center justify-center mb-4 mx-auto lg:mx-0 shadow-lg shadow-[#6fc59b]/30">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-[#8be0b7] uppercase tracking-widest mb-1">
                OPERATIONS HUB
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                BIZRAVANA
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                &ldquo;Manage the business behind it&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1 text-xs text-neutral-400">
                <div>• Order &amp; Stock Auto-Depletion</div>
                <div>• Automated Waybills &amp; Courier</div>
                <div>• Live Daily Profit &amp; Losses</div>
              </div>
            </div>
          </div>

          {/* 7 Core OMS Pillars Strip */}
          <div className="mt-10 pt-8 border-t border-white/[0.08]">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-5 text-center lg:text-left">
              Integrated Operations Ecosystem:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {OMS_PILLARS.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#6fc59b]/30 transition-colors group flex flex-col justify-between"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] text-[#8be0b7] group-hover:bg-[#6fc59b] group-hover:text-[#08090d] flex items-center justify-center mb-2.5 transition-colors">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {pillar.label}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 leading-tight font-mono">
                        {pillar.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="text-center sm:text-left">
            <span className="text-xs font-mono text-neutral-400">
              Already using BizRavana?
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              Build your custom website with direct synchronization to your OMS database.
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] font-bold text-xs shadow-lg shadow-[#6fc59b]/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Explore BizRavana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
