'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sliders,
  Copy,
  Check,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Save,
  Shield,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';

export interface SectionKeyframe {
  id: string;
  name: string;
  progress: number;
  x: number; // in vw
  y: number; // in vh
  rotate: number; // in deg
  scale: number; // in ratio
  zIndex: number; // layer
}

const DESKTOP_DEFAULT_KEYFRAMES: SectionKeyframe[] = [
  { id: 'hero', name: 'Hero', progress: 0.0, x: 16.5, y: 80, rotate: 15, scale: 1.58, zIndex: 50 },
  { id: 'about', name: 'About Us', progress: 0.145, x: -19.5, y: 170, rotate: -13, scale: 1.3, zIndex: 35 },
  { id: 'services', name: 'Services', progress: 0.299, x: 7, y: 280, rotate: 14, scale: 1.42, zIndex: 20 },
  { id: 'procedures', name: 'Procedures', progress: 0.457, x: 0, y: 386, rotate: 0, scale: 1.18, zIndex: 35 },
  { id: 'results', name: 'Results', progress: 0.616, x: 0, y: 480, rotate: 0, scale: 0.54, zIndex: 20 },
  { id: 'cta', name: 'CTA Banner', progress: 0.76, x: -29.5, y: 622, rotate: 13, scale: 1.14, zIndex: 20 },
  { id: 'contact', name: 'Contact', progress: 0.895, x: 7.5, y: 710, rotate: -13, scale: 1.28, zIndex: 20 },
  { id: 'footer', name: 'Footer', progress: 1.0, x: 0, y: 842, rotate: 0, scale: 1.39, zIndex: 35 },
];

const MOBILE_DEFAULT_KEYFRAMES: SectionKeyframe[] = [
  { id: 'hero', name: 'Hero', progress: 0.0, x: 0, y: 38, rotate: 8, scale: 0.75, zIndex: 50 },
  { id: 'about', name: 'About Us', progress: 0.145, x: 0, y: 140, rotate: -10, scale: 0.7, zIndex: 35 },
  { id: 'services', name: 'Services', progress: 0.299, x: 0, y: 250, rotate: 10, scale: 0.65, zIndex: 20 },
  { id: 'procedures', name: 'Procedures', progress: 0.457, x: 0, y: 360, rotate: 0, scale: 0.65, zIndex: 35 },
  { id: 'results', name: 'Results', progress: 0.616, x: 0, y: 470, rotate: 0, scale: 0.55, zIndex: 20 },
  { id: 'cta', name: 'CTA Banner', progress: 0.76, x: 0, y: 580, rotate: 8, scale: 0.68, zIndex: 20 },
  { id: 'contact', name: 'Contact', progress: 0.895, x: 0, y: 690, rotate: -8, scale: 0.7, zIndex: 20 },
  { id: 'footer', name: 'Footer', progress: 1.0, x: 0, y: 800, rotate: 0, scale: 0.75, zIndex: 35 },
];

export function DentalToothStudio() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [manualMode, setManualMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active Selected Section
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [currentScroll, setCurrentScroll] = useState(0);

  // Detect screen size on mount
  useEffect(() => {
    const checkWidth = () => {
      setIsMobileMode(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Desktop Keyframes
  const [desktopData, setDesktopData] = useState<SectionKeyframe[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('LUMIDENT_SECTION_KEYFRAMES_V2');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DESKTOP_DEFAULT_KEYFRAMES;
  });

  // Mobile Keyframes
  const [mobileData, setMobileData] = useState<SectionKeyframe[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('LUMIDENT_MOBILE_KEYFRAMES_V1');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return MOBILE_DEFAULT_KEYFRAMES;
  });

  const activeData = isMobileMode ? mobileData : desktopData;

  // Active Tooth Live Sliders Values
  const [xVal, setXVal] = useState<number>(0);
  const [yVal, setYVal] = useState<number>(38);
  const [rotateVal, setRotateVal] = useState<number>(8);
  const [scaleVal, setScaleVal] = useState<number>(0.75);
  const [zIndexVal, setZIndexVal] = useState<number>(50);

  const toothContainerRef = useRef<HTMLDivElement>(null);

  // Track global scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const prog = totalH > 0 ? window.scrollY / totalH : 0;
      setCurrentScroll(Math.max(0, Math.min(1, prog)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interpolate tooth position during scroll when not in manual mode
  useEffect(() => {
    if (manualMode) return;

    const data = isMobileMode ? mobileData : desktopData;
    const sorted = [...data].sort((a, b) => a.progress - b.progress);

    let lower = sorted[0];
    let upper = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (currentScroll >= sorted[i].progress && currentScroll <= sorted[i + 1].progress) {
        lower = sorted[i];
        upper = sorted[i + 1];
        break;
      }
    }

    const range = upper.progress - lower.progress;
    const factor = range > 0.0001 ? Math.max(0, Math.min(1, (currentScroll - lower.progress) / range)) : 0;

    setXVal(lower.x + (upper.x - lower.x) * factor);
    setYVal(lower.y + (upper.y - lower.y) * factor);
    setRotateVal(lower.rotate + (upper.rotate - lower.rotate) * factor);
    setScaleVal(lower.scale + (upper.scale - lower.scale) * factor);
    setZIndexVal(factor < 0.5 ? lower.zIndex : upper.zIndex);
  }, [currentScroll, manualMode, isMobileMode, mobileData, desktopData]);

  // Load section values when switching section
  const handleSelectSection = (sec: SectionKeyframe) => {
    setSelectedSectionId(sec.id);
    setManualMode(true);

    const currentSec = (isMobileMode ? mobileData : desktopData).find((s) => s.id === sec.id) || sec;

    setXVal(currentSec.x);
    setYVal(currentSec.y);
    setRotateVal(currentSec.rotate);
    setScaleVal(currentSec.scale);
    setZIndexVal(currentSec.zIndex);

    if (sec.id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sec.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save current slider adjustments to selected section
  const handleSaveToSelectedSection = () => {
    const targetSetter = isMobileMode ? setMobileData : setDesktopData;
    const targetData = isMobileMode ? mobileData : desktopData;
    const storageKey = isMobileMode ? 'LUMIDENT_MOBILE_KEYFRAMES_V1' : 'LUMIDENT_SECTION_KEYFRAMES_V2';

    const updated = targetData.map((sec) => {
      if (sec.id === selectedSectionId) {
        return {
          ...sec,
          progress: parseFloat(currentScroll.toFixed(3)),
          x: parseFloat(xVal.toFixed(1)),
          y: parseFloat(yVal.toFixed(1)),
          rotate: Math.round(rotateVal),
          scale: parseFloat(scaleVal.toFixed(2)),
          zIndex: zIndexVal,
        };
      }
      return sec;
    });

    targetSetter(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (isMobileMode) {
      setMobileData(MOBILE_DEFAULT_KEYFRAMES);
      localStorage.removeItem('LUMIDENT_MOBILE_KEYFRAMES_V1');
      const heroSec = MOBILE_DEFAULT_KEYFRAMES[0];
      setXVal(heroSec.x);
      setYVal(heroSec.y);
      setRotateVal(heroSec.rotate);
      setScaleVal(heroSec.scale);
      setZIndexVal(heroSec.zIndex);
    } else {
      setDesktopData(DESKTOP_DEFAULT_KEYFRAMES);
      localStorage.removeItem('LUMIDENT_SECTION_KEYFRAMES_V2');
      const heroSec = DESKTOP_DEFAULT_KEYFRAMES[0];
      setXVal(heroSec.x);
      setYVal(heroSec.y);
      setRotateVal(heroSec.rotate);
      setScaleVal(heroSec.scale);
      setZIndexVal(heroSec.zIndex);
    }
  };

  // Generate code block
  const generateCode = () => {
    const data = isMobileMode ? mobileData : desktopData;
    const sorted = [...data].sort((a, b) => a.progress - b.progress);
    const progressArr = sorted.map((k) => k.progress);
    const xArr = sorted.map((k) => `'${k.x}vw'`);
    const yArr = sorted.map((k) => `'${k.y}vh'`);
    const rotArr = sorted.map((k) => k.rotate);
    const scaleArr = sorted.map((k) => k.scale);
    const zIndexArr = sorted.map((k) => k.zIndex);

    const prefix = isMobileMode ? 'mobileTooth' : 'tooth';

    return `// ${isMobileMode ? 'Mobile' : 'Desktop'} Tooth Scroll Keyframes (Section & Z-Index Tuned):
const ${prefix}X = useTransform(smoothProgress, [${progressArr.join(', ')}], [${xArr.join(', ')}]);
const ${prefix}Y = useTransform(smoothProgress, [${progressArr.join(', ')}], [${yArr.join(', ')}]);
const ${prefix}Rotate = useTransform(smoothProgress, [${progressArr.join(', ')}], [${rotArr.join(', ')}]);
const ${prefix}Scale = useTransform(smoothProgress, [${progressArr.join(', ')}], [${scaleArr.join(', ')}]);
const ${prefix}ZIndex = useTransform(smoothProgress, [${progressArr.join(', ')}], [${zIndexArr.join(', ')}]);`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSection = activeData.find((s) => s.id === selectedSectionId) || activeData[0];

  return (
    <>
      {/* ── Document-Absolute Travelling Tooth Layer (Active on Mobile and Desktop) ── */}
      <div 
        style={{ zIndex: zIndexVal }}
        className="absolute inset-0 pointer-events-none overflow-visible"
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: `translate(calc(-50% + ${xVal}vw), calc(-50% + ${yVal}vh)) rotate(${rotateVal}deg) scale(${scaleVal})`,
            transition: manualMode ? 'none' : 'transform 0.04s linear',
          }}
          className="pointer-events-auto"
        >
          <div
            ref={toothContainerRef}
            className="relative flex-shrink-0 w-[380px] sm:w-[460px] lg:w-[520px] aspect-[1024/1536] cursor-crosshair group select-none"
          >
            {/* Real-Time Layer Status Badge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/50 text-[#05c989] font-mono text-[10px] sm:text-[11px] font-bold shadow-lg pointer-events-none z-30 whitespace-nowrap">
              <span>{isMobileMode ? '📱 Mobile' : '💻 Desktop'} • z-{zIndexVal}</span>
            </div>

            {/* Base Layer: hero-1.png (Clear Crystal Tooth) */}
            <img
              src="/demos/dental/hero-1.png"
              alt="LUMIDENT 3D Crystal Tooth"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none animate-subtle-float"
            />
          </div>
        </div>
      </div>

      {/* ── Floating Visual Studio Control GUI ─────────────────────── */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[120] flex flex-col items-end gap-2 font-sans select-none max-w-[95vw]">
        
        {isOpen ? (
          <div className="w-[330px] sm:w-[390px] bg-slate-950/95 text-white backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 text-xs max-h-[85vh] overflow-y-auto">
            
            {/* Header with Device Mode Switch */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#05c989] animate-pulse" />
                <span className="font-bold text-sm text-white tracking-tight">
                  Tooth Controller
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Device Mode Switch Button */}
                <button
                  onClick={() => {
                    const newMode = !isMobileMode;
                    setIsMobileMode(newMode);
                    const defaultSet = newMode ? mobileData : desktopData;
                    const sec = defaultSet.find(s => s.id === selectedSectionId) || defaultSet[0];
                    setXVal(sec.x);
                    setYVal(sec.y);
                    setRotateVal(sec.rotate);
                    setScaleVal(sec.scale);
                    setZIndexVal(sec.zIndex);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isMobileMode ? 'bg-[#05c989] text-white shadow-xs' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isMobileMode ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                  <span>{isMobileMode ? 'Mobile' : 'Desktop'}</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Minimize Studio"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Section Select Tab Bar (8 Sections Linked) ─────────── */}
            <div className="flex flex-col gap-1.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                <span className="flex items-center gap-1 font-semibold text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-[#05c989]" /> Section Target:
                </span>
                <span className="font-mono text-[#05c989] text-[10px]">
                  Scroll: {(currentScroll * 100).toFixed(0)}%
                </span>
              </div>

              {/* Section Buttons Grid (4x2) */}
              <div className="grid grid-cols-4 gap-1.5">
                {activeData.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSection(sec)}
                      className={`px-1.5 py-1.5 rounded-xl text-[10.5px] font-semibold text-center transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#05c989] text-white shadow-md ring-2 ring-[#05c989]/40'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {sec.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Z-Index Level & Active Target */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Section: <strong className="text-white">{activeSection.name}</strong></span>
              
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Layer:</span>
                {[20, 35, 50].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => {
                      setManualMode(true);
                      setZIndexVal(z);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      zIndexVal === z
                        ? 'bg-[#05c989] text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    z-{z}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders with direct numeric inputs */}
            <div className="flex flex-col gap-2.5 bg-slate-900/40 p-2.5 sm:p-3 rounded-2xl border border-slate-800/60">
              
              {/* X Position (-80vw to +80vw) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3 text-[#05c989]" /> X Position:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={xVal}
                      onChange={(e) => {
                        setManualMode(true);
                        setXVal(parseFloat(e.target.value) || 0);
                      }}
                      className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-right text-[11px]"
                    />
                    <span className="text-slate-400">vw</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="0.5"
                  value={xVal}
                  onChange={(e) => {
                    setManualMode(true);
                    setXVal(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#05c989] cursor-pointer"
                />
              </div>

              {/* Y Position (0vh to 950vh) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3 text-[#05c989]" /> Y Position:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={yVal}
                      onChange={(e) => {
                        setManualMode(true);
                        setYVal(parseFloat(e.target.value) || 0);
                      }}
                      className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-right text-[11px]"
                    />
                    <span className="text-slate-400">vh</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="950"
                  step="1"
                  value={yVal}
                  onChange={(e) => {
                    setManualMode(true);
                    setYVal(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#05c989] cursor-pointer"
                />
              </div>

              {/* Rotation (-180deg to +180deg) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1"><RotateCw className="w-3 h-3 text-[#05c989]" /> Rotation:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={rotateVal}
                      onChange={(e) => {
                        setManualMode(true);
                        setRotateVal(parseFloat(e.target.value) || 0);
                      }}
                      className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-right text-[11px]"
                    />
                    <span className="text-slate-400">deg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotateVal}
                  onChange={(e) => {
                    setManualMode(true);
                    setRotateVal(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#05c989] cursor-pointer"
                />
              </div>

              {/* Scale (0.2x to 2.2x) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3 text-[#05c989]" /> Scale Size:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={scaleVal}
                      onChange={(e) => {
                        setManualMode(true);
                        setScaleVal(parseFloat(e.target.value) || 1);
                      }}
                      className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-right text-[11px]"
                    />
                    <span className="text-slate-400">x</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.2"
                  step="0.02"
                  value={scaleVal}
                  onChange={(e) => {
                    setManualMode(true);
                    setScaleVal(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#05c989] cursor-pointer"
                />
              </div>

            </div>

            {/* Action Buttons: Save Keyframe & Copy Code */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleSaveToSelectedSection}
                className={`w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  savedSuccess ? 'bg-emerald-600' : 'bg-[#05c989] hover:bg-[#04b37a]'
                }`}
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>
                  {savedSuccess
                    ? `Saved to ${activeSection.name}!`
                    : `Save Position to "${activeSection.name}" (${isMobileMode ? 'Mobile' : 'Desktop'})`}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#05c989]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Code!' : `Copy ${isMobileMode ? 'Mobile' : 'Desktop'} Code`}</span>
                </button>

                <button
                  onClick={handleResetDefaults}
                  title="Reset to Defaults"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Minimized Floating Studio Capsule */
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2.5 rounded-full bg-slate-950/90 hover:bg-black text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#05c989] animate-pulse" />
            <Sliders className="w-4 h-4 text-[#05c989]" />
            <span className="font-bold text-xs">
              {isMobileMode ? '📱 Mobile Tooth Tuner' : '💻 Desktop Tooth Tuner'}
            </span>
          </button>
        )}

      </div>
    </>
  );
}
