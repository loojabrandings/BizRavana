import { DEFAULT_KEYFRAME } from "./store";
import type { Breakpoint, SectionKeyframe } from "./store";
import timelineConfig from "@/config/timeline.json";

/**
 * Per-section laptop keyframes, per viewport breakpoint — the handoff
 * artifact. The owner pins poses in the dev gizmo (✥ / `?edit=1`) with the
 * device switcher set to Desktop / Tablet / Mobile, then hands the exported
 * JSON back, which is baked into `config/timeline.json`.
 *
 * Config shape: `sections[].keyframes = { desktop, tablet, mobile }`.
 * Gizmo pins layer per (section, breakpoint) over the config.
 */

/** The three viewport breakpoints, in device-size order (UI order too). */
export const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

/** Resolve the breakpoint for a viewport width in px. */
export function resolveBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export interface SectionConfig {
  id: string;
  /** Per-breakpoint keyframes; a legacy single `keyframe` is folded in. */
  keyframes: Record<Breakpoint, SectionKeyframe>;
}

export interface KeyframeConfig {
  sections: SectionConfig[];
  segments: { from: string; to: string; easing?: string }[];
  reveals: { block: string; section: string; at: number; slide: number }[];
}

const CONFIG = timelineConfig as unknown as KeyframeConfig;

const STORAGE_KEY = "landing.timeline.keyframes";

/** Section ids in config order (the `start` entry has no DOM element). */
const SECTION_IDS = CONFIG.sections.map((s) => s.id);

/**
 * Gizmo-authored overrides, persisted to localStorage and layered over the
 * config: `sectionId → { breakpoint → keyframe }`.
 */
let overrides: Record<string, Partial<Record<Breakpoint, SectionKeyframe>>> | null = null;

/** Lazily load persisted gizmo overrides (browser only — guarded by try/catch). */
function ensureLoaded() {
  if (overrides !== null) return;
  overrides = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [id, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      if ("position" in (value as object)) {
        // Legacy single-keyframe pin (pre-breakpoints) → treat as desktop only.
        overrides[id] = { desktop: value as SectionKeyframe };
      } else {
        overrides[id] = value as Partial<Record<Breakpoint, SectionKeyframe>>;
      }
    }
  } catch {
    // Corrupt/inaccessible storage — fall back to the config defaults.
  }
}

/* --------------------------------------------------------------------------
 * Keyframe access
 * ------------------------------------------------------------------------ */

/** The raw config keyframes for a section — never layered with gizmo pins. */
export function getConfigKeyframes(id: string): Record<Breakpoint, SectionKeyframe> {
  const section = CONFIG.sections.find((s) => s.id === id);
  if (section?.keyframes) return section.keyframes;
  // Legacy config: a single `keyframe` applies to every breakpoint.
  const legacy = (section as { keyframe?: SectionKeyframe } | undefined)?.keyframe;
  if (legacy) return { desktop: legacy, tablet: legacy, mobile: legacy };
  return { desktop: DEFAULT_KEYFRAME, tablet: DEFAULT_KEYFRAME, mobile: DEFAULT_KEYFRAME };
}

/** The config keyframe for a section at one breakpoint. */
export function getConfigKeyframe(id: string, bp: Breakpoint): SectionKeyframe {
  return getConfigKeyframes(id)[bp];
}

/**
 * The keyframes for a section with gizmo pins layered on: override if pinned
 * for a breakpoint, else the config value.
 */
export function getEffectiveKeyframes(id: string): Record<Breakpoint, SectionKeyframe> {
  ensureLoaded();
  const config = getConfigKeyframes(id);
  const pinned = overrides?.[id];
  if (!pinned) return config;
  return {
    desktop: pinned.desktop ?? config.desktop,
    tablet: pinned.tablet ?? config.tablet,
    mobile: pinned.mobile ?? config.mobile,
  };
}

/** The effective keyframe for a section at one breakpoint. */
export function getEffectiveKeyframe(id: string, bp: Breakpoint): SectionKeyframe {
  return getEffectiveKeyframes(id)[bp];
}

/** Store a gizmo-pinned keyframe for a section + breakpoint and persist it. */
export function setKeyframeOverride(id: string, bp: Breakpoint, kf: SectionKeyframe) {
  ensureLoaded();
  if (!overrides) return;
  overrides[id] = { ...overrides[id], [bp]: kf };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Persistence is best-effort (e.g. private mode).
  }
}

export function clearKeyframeOverrides() {
  ensureLoaded();
  overrides = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

/** Pinned (section, breakpoint) keys, e.g. `["hero/desktop", "start/mobile"]`. */
export function getPinnedKeys(): string[] {
  ensureLoaded();
  const keys: string[] = [];
  for (const [id, bps] of Object.entries(overrides ?? {})) {
    for (const bp of BREAKPOINTS) {
      if (bps[bp]) keys.push(`${id}/${bp}`);
    }
  }
  return keys;
}

/**
 * Clear the pin for a section at one breakpoint (or every breakpoint of that
 * section when `bp` is omitted), falling back to its config keyframes.
 */
export function resetKeyframeOverride(id: string, bp?: Breakpoint) {
  ensureLoaded();
  if (!overrides || !overrides[id]) return;
  if (bp) {
    delete overrides[id][bp];
    if (Object.keys(overrides[id]).length === 0) delete overrides[id];
  } else {
    delete overrides[id];
  }
  persistOverrides();
}

function persistOverrides() {
  if (!overrides) return;
  try {
    if (Object.keys(overrides).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch {
    // Persistence is best-effort (e.g. private mode).
  }
}

export function getSectionIds(): string[] {
  return SECTION_IDS;
}

/** The easing string for the segment ending at `to` (undefined = default). */
export function getSegmentEasing(to: string): string | undefined {
  return CONFIG.segments.find((s) => s.to === to)?.easing;
}

/** Assemble the config JSON the gizmo exports (live overrides baked in). */
export function buildTimelineConfig(): KeyframeConfig {
  return {
    sections: CONFIG.sections.map((s) => ({
      id: s.id,
      keyframes: getEffectiveKeyframes(s.id),
    })),
    segments: CONFIG.segments,
    reveals: CONFIG.reveals,
  };
}
