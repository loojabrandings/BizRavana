import { threeStore } from "./store";
import type { Breakpoint, SectionKeyframe } from "./store";
import { getConfigKeyframes, getSectionIds, getSegmentEasing, resolveBreakpoint } from "./keyframes";
import { setScreenForSection } from "./screen-texture";

/**
 * Scroll-driven keyframe interpolation engine.
 *
 * Each config section owns a keyframe per viewport breakpoint. As the user
 * scrolls, the laptop interpolates linearly from the previous section's
 * keyframe to the section currently on screen, so the laptop stays locked to
 * the page's motion in both directions (easing it per segment would compound
 * with the snap glide's easing and compress the pose change into the first
 * frames). Progress is driven by Lenis's *animated* scroll value (the smoothed
 * position, never raw wheel deltas), read imperatively every frame — no React
 * state, no layout reads inside the loop. The segment's easing still shapes
 * the time-based on-load intro.
 *
 * On load, the intro segment (start → first section) plays once as a timed
 * animation. The first section's scroll segment occupies the viewport above
 * scroll 0 (range `[-vh, 0]`), so at the top of the page the laptop holds the
 * first section's keyframe — the intro pose never snaps back on scroll.
 *
 * Every later segment spans one viewport: it starts where the section's top
 * enters the viewport bottom (never before the previous segment has had its
 * own full viewport, so segments don't overlap) and ends when the section
 * reaches the viewport top. The last completed pose is held in any gap.
 *
 * Reduced motion: no animation loop — the pose for the current scroll position
 * is applied on scroll events (instant snaps, no easing). Resize / orientation
 * change re-measure section tops (rAF-gated); progress is preserved because
 * the loop recomputes from scroll every frame.
 */

const DEG = Math.PI / 180;

/** Fallback easing when a segment omits one (ease-out-expo-like). */
const DEFAULT_EASING = [0.16, 1, 0.3, 1] as const;

/** On-load intro duration for the start → first-section segment (ms). */
const INTRO_MS = 1600;

/**
 * Segment progress at which a section's wallpaper takes the display — the
 * moment half of the section has scrolled into view (below it, the previous
 * section's screen stays up).
 */
const SWAP_AT = 1 / 2;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * CSS-style `cubic-bezier(x1, y1, x2, y2)` solver — sampled lookup table with
 * Newton-Raphson refinement (the standard Web Animations algorithm).
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const SAMPLE_SIZE = 11;
  const STEP = 1 / (SAMPLE_SIZE - 1);
  const samples: number[] = [];
  for (let i = 0; i < SAMPLE_SIZE; i++) samples.push(sampleCurveX(i * STEP));

  const solveX = (x: number) => {
    // Bracket x between two sample points.
    let intervalStart = 0;
    let currentSample = 1;
    const lastSample = SAMPLE_SIZE - 1;
    for (; currentSample !== lastSample && samples[currentSample] <= x; currentSample++) {
      intervalStart += STEP;
    }
    currentSample--;
    const dist = (x - samples[currentSample]) / (samples[currentSample + 1] - samples[currentSample]);
    const guess = intervalStart + dist * STEP;

    const slope = sampleDerivativeX(guess);
    if (slope >= 1e-3) {
      // Newton-Raphson from the linear guess.
      let t = guess;
      for (let i = 0; i < 4; i++) {
        const err = sampleCurveX(t) - x;
        const d = sampleDerivativeX(t);
        if (d === 0) return t;
        t -= err / d;
      }
      return t;
    }
    if (slope === 0) return guess;
    // Flat region — bisect the bracket.
    let lo = intervalStart;
    let hi = intervalStart + STEP;
    let t = guess;
    for (let i = 0; i < 10; i++) {
      t = (lo + hi) / 2;
      if (sampleCurveX(t) - x > 0) hi = t;
      else lo = t;
    }
    return t;
  };

  return (x: number) => {
    if (x === 0 || x === 1) return x;
    return sampleCurveY(solveX(x));
  };
}

/** Parse a segment easing string into an easing function. */
function parseEasing(easing: string | undefined): (t: number) => number {
  if (!easing || easing === "linear") return (t) => t;
  const m = /^bezier\((-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)\)$/.exec(easing);
  if (m) return cubicBezier(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]));
  return cubicBezier(DEFAULT_EASING[0], DEFAULT_EASING[1], DEFAULT_EASING[2], DEFAULT_EASING[3]);
}

interface Stop {
  id: string;
  /** DOM element for real sections; null for the virtual intro stop. */
  el: HTMLElement | null;
  /** Document-space top of the element (measured; unused for virtual stops). */
  top: number;
  /** Config keyframes per breakpoint — gizmo pins never apply here. */
  kf: Record<Breakpoint, SectionKeyframe>;
  /** Segment easing into this stop — applied to the on-load intro only. */
  ease: (t: number) => number;
}

/** Start the engine. Returns a cleanup function. Call once the model is loaded. */
export function startTimeline(): () => void {
  const stops: Stop[] = getSectionIds().map((id) => ({
    id,
    el: document.getElementById(id),
    top: 0,
    kf: getConfigKeyframes(id),
    ease: parseEasing(getSegmentEasing(id)),
  }));

  // Indices of DOM-backed stops in config order (the rest are virtual "from"
  // keyframes, e.g. the intro `start` stop).
  const dom: number[] = [];
  stops.forEach((s, i) => {
    if (s.el) dom.push(i);
  });
  if (dom.length === 0) return () => {};

  const vh = { value: window.innerHeight };

  /**
   * Range start (scroll position) of each section's segment. The first
   * section's segment lives in the viewport above scroll 0 — the on-load
   * intro plays there. Each later segment starts where the section's top
   * enters the viewport bottom, but never before the previous segment has had
   * a full viewport of its own, so segments never overlap (that would make
   * two poses fight mid-scroll).
   */
  const ranges: number[] = [];

  /** Re-measure section tops — layout reads stay out of the scroll loop. */
  const measure = () => {
    vh.value = window.innerHeight;
    for (const i of dom) {
      stops[i].top = (stops[i].el as HTMLElement).getBoundingClientRect().top + window.scrollY;
    }
    let prev = -vh.value;
    for (let d = 0; d < dom.length; d++) {
      ranges[d] = d === 0 ? -vh.value : Math.max(stops[dom[d]].top - vh.value, prev + vh.value);
      prev = ranges[d];
    }
  };
  measure();

  const applyPose = (from: SectionKeyframe, to: SectionKeyframe, t: number) => {
    const model = threeStore.modelGroup;
    if (!model) return;
    model.position.set(
      lerp(from.position[0], to.position[0], t),
      lerp(from.position[1], to.position[1], t),
      lerp(from.position[2], to.position[2], t),
    );
    model.rotation.set(
      lerp(from.rotation[0], to.rotation[0], t) * DEG,
      lerp(from.rotation[1], to.rotation[1], t) * DEG,
      lerp(from.rotation[2], to.rotation[2], t) * DEG,
    );
    model.scale.set(
      lerp(from.scale[0], to.scale[0], t),
      lerp(from.scale[1], to.scale[1], t),
      lerp(from.scale[2], to.scale[2], t),
    );
  };

  // The intro plays from the stop before the first DOM section to that
  // section (e.g. `start` → `hero`).
  const introFrom = stops[Math.max(0, dom[0] - 1)];
  const introTo = stops[dom[0]];

  /** Active section + eased progress for a scroll position (null above all). */
  const poseAt = (scrollY: number): { activeD: number; t: number } | null => {
    let activeD = -1;
    let p = 0;
    for (let d = 0; d < dom.length; d++) {
      const pi = (scrollY - ranges[d]) / vh.value;
      if (pi > 0) {
        activeD = d;
        p = pi > 1 ? 1 : pi;
      } else {
        break;
      }
    }
    if (activeD < 0) return null;
    // Linear: no segment easing here — the laptop must move in lockstep with
    // the page glide, or scrolling down (front-loaded glide + front-loaded
    // segment easing) compresses the pose change into the first frames.
    return { activeD, t: p };
  };

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(measure);
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  // The webfonts load asynchronously and shift every section top, which would
  // misalign the pose segments — re-measure once the layout has settled.
  if (document.fonts?.ready) void document.fonts.ready.then(onResize);
  window.addEventListener("load", onResize);

  const removeListeners = () => {
    cancelAnimationFrame(resizeRaf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("load", onResize);
  };

  /** Section whose wallpaper is currently on the display (dedupe swaps). */
  let screenShownFor = "";

  /** Swap the display to a section's wallpaper (once per section). */
  const showScreen = (id: string) => {
    if (id === screenShownFor) return;
    screenShownFor = id;
    setScreenForSection(id);
  };

  /** Lerp and write the pose for an active-section result. */
  const write = (pose: { activeD: number; t: number }) => {
    const to = stops[dom[pose.activeD]];
    const from = stops[Math.max(0, dom[pose.activeD] - 1)];
    const bp = resolveBreakpoint(window.innerWidth);
    applyPose(from.kf[bp], to.kf[bp], pose.t);
    // The wallpaper tracks the section the user has actually scrolled to, not
    // the one merely entering the viewport: it swaps once half of the section
    // has scrolled into view (segment progress past SWAP_AT) and reverts to
    // the previous section below that, so a settle mid-segment always matches
    // the section dominating the screen. `showScreen` dedupes, so re-writes
    // within a segment are no-ops.
    showScreen(pose.t >= SWAP_AT ? to.id : from.id);
  };

  // Reduced motion: no animation loop — apply the pose for the current scroll
  // position on scroll events (instant snap, no easing).
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const onScroll = () => {
      const pose = poseAt(window.scrollY);
      if (pose) write(pose);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeListeners();
      window.removeEventListener("scroll", onScroll);
    };
  }

  // Apply the intro's first frame synchronously so the raw model scale never
  // flashes before the loop's first frame.
  const firstBp = resolveBreakpoint(window.innerWidth);
  applyPose(introFrom.kf[firstBp], introTo.kf[firstBp], 0);

  let raf = 0;
  let lastKey = "";
  let introDone = false;
  const introStart = performance.now();
  const loop = () => {
    raf = requestAnimationFrame(loop);

    // While the dev gizmo is composing a pose, it owns the transform.
    if (threeStore.gizmoActive) return;

    const lenis = threeStore.lenis;
    const scrollY = lenis ? lenis.animatedScroll : window.scrollY;

    // On-load intro: start → first section plays once; the first scroll input
    // hands control straight to the scroll engine.
    if (!introDone) {
      if (scrollY !== 0) {
        introDone = true;
      } else {
        const ratio = Math.min(1, (performance.now() - introStart) / INTRO_MS);
        const bp = resolveBreakpoint(window.innerWidth);
        applyPose(introFrom.kf[bp], introTo.kf[bp], introTo.ease(ratio));
        if (ratio >= 1) {
          introDone = true;
          showScreen(introTo.id);
        }
        return;
      }
    }

    const pose = poseAt(scrollY);
    if (!pose) return;

    // Skip redundant writes when the pose hasn't moved since the last frame.
    const key = `${pose.activeD}:${pose.t.toFixed(5)}`;
    if (key === lastKey) return;
    lastKey = key;
    write(pose);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    removeListeners();
  };
}
