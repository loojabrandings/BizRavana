'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Copy,
  Check,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Save,
  Smartphone,
  Monitor,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DrinkProduct } from '../types';

export interface CanKeyframe {
  id: string;
  name: string;
  progress: number;
  x: number; // in vw
  y: number; // in vh
  rotate: number; // in deg
  scale: number; // in ratio
  zIndex: number; // layer
}

export const DESKTOP_DEFAULT_CAN_KEYFRAMES: CanKeyframe[] = [
  { id: 'hero', name: 'Hero (Tabletop)', progress: 0.0, x: 0, y: 55, rotate: 0, scale: 1.15, zIndex: 40 },
  { id: 'features', name: 'Features Center', progress: 1.0, x: 0, y: 181, rotate: 0, scale: 1.08, zIndex: 40 },
];

export const MOBILE_DEFAULT_CAN_KEYFRAMES: CanKeyframe[] = [
  { id: 'hero', name: 'Hero (Mobile Table)', progress: 0.0, x: 0, y: 58, rotate: 0, scale: 0.85, zIndex: 40 },
  { id: 'features', name: 'Features (Mobile)', progress: 1.0, x: 0, y: 132, rotate: 0, scale: 0.65, zIndex: 40 },
];

interface TerraVivaCanStudioProps {
  currentItem: DrinkProduct;
}

export function TerraVivaCanStudio({ currentItem }: TerraVivaCanStudioProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
  const [desktopData, setDesktopData] = useState<CanKeyframe[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('TERRAVIVA_DESKTOP_KEYFRAMES_V1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DESKTOP_DEFAULT_CAN_KEYFRAMES;
  });

  // Mobile Keyframes
  const [mobileData, setMobileData] = useState<CanKeyframe[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('TERRAVIVA_MOBILE_KEYFRAMES_V1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return MOBILE_DEFAULT_CAN_KEYFRAMES;
  });

  const activeData = isMobileMode ? mobileData : desktopData;

  // Active Can Live Slider Values
  const [xVal, setXVal] = useState<number>(0);
  const [yVal, setYVal] = useState<number>(55);
  const [rotateVal, setRotateVal] = useState<number>(0);
  const [scaleVal, setScaleVal] = useState<number>(1.15);
  const [zIndexVal, setZIndexVal] = useState<number>(40);

  const canContainerRef = useRef<HTMLDivElement>(null);

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

  // Interpolate Can position during scroll when not in manual mode
  useEffect(() => {
    if (manualMode) return;

    const data = isMobileMode ? mobileData : desktopData;
    const sorted = [...data].sort((a, b) => a.progress - b.progress);

    if (sorted.length === 0) return;

    if (currentScroll <= sorted[0].progress) {
      const first = sorted[0];
      setXVal(first.x);
      setYVal(first.y);
      setRotateVal(first.rotate);
      setScaleVal(first.scale);
      setZIndexVal(first.zIndex);
      return;
    }

    if (currentScroll >= sorted[sorted.length - 1].progress) {
      const last = sorted[sorted.length - 1];
      setXVal(last.x);
      setYVal(last.y);
      setRotateVal(last.rotate);
      setScaleVal(last.scale);
      setZIndexVal(last.zIndex);
      return;
    }

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
  const handleSelectSection = (sec: CanKeyframe) => {
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
    const storageKey = isMobileMode ? 'TERRAVIVA_MOBILE_KEYFRAMES_V1' : 'TERRAVIVA_DESKTOP_KEYFRAMES_V1';

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
      setMobileData(MOBILE_DEFAULT_CAN_KEYFRAMES);
      localStorage.removeItem('TERRAVIVA_MOBILE_KEYFRAMES_V1');
      const heroSec = MOBILE_DEFAULT_CAN_KEYFRAMES[0];
      setXVal(heroSec.x);
      setYVal(heroSec.y);
      setRotateVal(heroSec.rotate);
      setScaleVal(heroSec.scale);
      setZIndexVal(heroSec.zIndex);
    } else {
      setDesktopData(DESKTOP_DEFAULT_CAN_KEYFRAMES);
      localStorage.removeItem('TERRAVIVA_DESKTOP_KEYFRAMES_V1');
      const heroSec = DESKTOP_DEFAULT_CAN_KEYFRAMES[0];
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

    const prefix = isMobileMode ? 'mobileCan' : 'can';

    return `// ${isMobileMode ? 'Mobile' : 'Desktop'} TerraViva Can Scroll Keyframes:
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

  return (
    <>
      {/* ── Document-Absolute Travelling Can Layer ── */}
      {isVisible && (
        <div
          style={{ zIndex: zIndexVal }}
          className="absolute inset-0 pointer-events-none overflow-visible select-none"
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
              ref={canContainerRef}
              className="relative flex-shrink-0 w-[240px] sm:w-[320px] lg:w-[360px] aspect-[0.45/1] cursor-grab group select-none"
            >
              {/* Real-Time Layer Status Badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] sm:text-[11px] font-bold shadow-xl pointer-events-none z-30 whitespace-nowrap">
                <span>{isMobileMode ? '📱 Mobile' : '💻 Desktop'} • z-{zIndexVal}</span>
              </div>

              {/* Active Flavor Can */}
              <img
                src={currentItem.src}
                alt={`TerraViva ${currentItem.name}`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Visual Studio Control GUI ── */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[120] flex flex-col items-end gap-2 font-sans select-none max-w-[95vw]">
        {isOpen ? (
          <div className="w-[320px] sm:w-[380px] bg-stone-950/95 text-white backdrop-blur-2xl border border-stone-700/80 rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 text-xs max-h-[85vh] overflow-y-auto">
            {/* Header with Device Mode Switch */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sm text-white tracking-tight">
                  Can Keyframe Studio
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isVisible
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                  title={isVisible ? 'Hide Travelling Can' : 'Show Travelling Can'}
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsMobileMode(false)}
                    className={`p-1.5 rounded-md transition-colors ${
                      !isMobileMode
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Desktop Presets"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileMode(true)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isMobileMode
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Mobile Presets"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                >
                  <Minimize2 size={14} />
                </button>
              </div>
            </div>

            {/* Scroll Status & Mode Indicator */}
            <div className="flex items-center justify-between bg-stone-900/90 rounded-xl p-2.5 border border-stone-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Page Scroll
                </span>
                <span className="font-mono text-emerald-400 text-xs font-semibold">
                  {(currentScroll * 100).toFixed(1)}% ({(currentScroll).toFixed(3)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] border transition-all ${
                    manualMode
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                  }`}
                >
                  {manualMode ? '🛠 Manual Mode' : '🌊 Live Scroll Track'}
                </button>
              </div>
            </div>

            {/* Section Target Quick Jump / Select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Keyframe Target Station
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {activeData.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSelectSection(sec)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all text-left flex items-center justify-between ${
                      selectedSectionId === sec.id
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{sec.name}</span>
                    <span className="text-[9px] opacity-70 font-mono">
                      {Math.round(sec.progress * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Fine-Tuning Sliders */}
            <div className="flex flex-col gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800/80">
              {/* X Offset (vw) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Move size={12} className="text-emerald-400" />
                    <span>X Offset</span>
                  </span>
                  <span className="font-mono text-emerald-400">{xVal.toFixed(1)}vw</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="0.5"
                  value={xVal}
                  onChange={(e) => {
                    setXVal(parseFloat(e.target.value));
                    setManualMode(true);
                  }}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Y Position (vh) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Move size={12} className="text-emerald-400 rotate-90" />
                    <span>Y Position (Absolute Height)</span>
                  </span>
                  <span className="font-mono text-emerald-400">{yVal.toFixed(1)}vh</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="280"
                  step="1"
                  value={yVal}
                  onChange={(e) => {
                    setYVal(parseFloat(e.target.value));
                    setManualMode(true);
                  }}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Rotation */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <RotateCw size={12} className="text-emerald-400" />
                    <span>Rotation</span>
                  </span>
                  <span className="font-mono text-emerald-400">{Math.round(rotateVal)}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotateVal}
                  onChange={(e) => {
                    setRotateVal(parseFloat(e.target.value));
                    setManualMode(true);
                  }}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Scale */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span>Scale</span>
                  </span>
                  <span className="font-mono text-emerald-400">{scaleVal.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.02"
                  value={scaleVal}
                  onChange={(e) => {
                    setScaleVal(parseFloat(e.target.value));
                    setManualMode(true);
                  }}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Z-Index */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Layers size={12} className="text-emerald-400" />
                    <span>Layer (Z-Index)</span>
                  </span>
                  <span className="font-mono text-emerald-400">z-{zIndexVal}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={zIndexVal}
                  onChange={(e) => {
                    setZIndexVal(parseInt(e.target.value, 10));
                    setManualMode(true);
                  }}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Action Buttons: Save to Section / Reset / Copy */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveToSelectedSection}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Saved to &apos;{selectedSectionId}&apos;!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save to &apos;{selectedSectionId}&apos; Station</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw size={13} />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-950/90 text-white border border-emerald-500/50 backdrop-blur-xl shadow-2xl hover:scale-105 transition-all group"
          >
            <Sliders size={15} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold text-xs">Can Keyframe Studio</span>
            <Maximize2 size={13} className="text-stone-400" />
          </button>
        )}
      </div>
    </>
  );
}

export default TerraVivaCanStudio;
