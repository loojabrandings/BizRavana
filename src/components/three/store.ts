import type * as THREE from "three";
import type Lenis from "lenis";

/** Viewport breakpoints — each section keyframes per device. */
export type Breakpoint = "desktop" | "tablet" | "mobile";

/**
 * Per-section laptop pose, in wrapper-local space.
 * Rotation is stored in degrees (the config convention); the engine converts.
 */
export interface SectionKeyframe {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export const DEFAULT_KEYFRAME: SectionKeyframe = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

/**
 * Module-scoped bridge between the scene, the timeline engine and the dev
 * gizmo. The scene populates the three.js refs; the gizmo flips
 * `gizmoActive` so the timeline pauses while a pose is being composed.
 */
interface ThreeStore {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  /** The laptop root — the gizmo target; the timeline writes keyframes here. */
  modelGroup: THREE.Group | null;
  /** Presentation wrapper — pose normalization only, never keyframed. */
  wrapper: THREE.Group | null;
  /** While true the timeline stops writing so TransformControls can edit. */
  gizmoActive: boolean;
  /** Active viewport breakpoint — the scene and gizmo keyframe by it. */
  breakpoint: Breakpoint;
  /**
   * Simulated device screen aspect (width/height) while composing in the
   * gizmo; `null` = follow the window. The scene letterboxes the canvas to
   * this framing so a pose composed for a device matches that screen.
   */
  deviceAspect: number | null;
  /**
   * Live reference to the Lenis instance, set by SmoothScroll once the
   * (dynamically imported) instance exists. The timeline engine reads
   * `lenis.animatedScroll` — the smoothed value — to drive keyframe progress.
   */
  lenis: Lenis | null;
}

export const threeStore: ThreeStore = {
  scene: null,
  camera: null,
  renderer: null,
  modelGroup: null,
  wrapper: null,
  gizmoActive: false,
  breakpoint: "desktop",
  deviceAspect: null,
  lenis: null,
};
