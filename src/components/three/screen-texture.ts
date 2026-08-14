import * as THREE from "three";

/**
 * Per-section laptop screen manager.
 *
 * The display is the LCD panel inside the lid: mesh `Object_56`, mounted at
 * node `Object_123` under `VQmfhbMzfNAuKAD_57`. In Spline this object is
 * named `sfCQkHOWyrsLmor` (owner-provided ID). On export Spline flattens the
 * single-child chain, so that ID survives only as the **material name** — the
 * node/mesh keep the generic `Object_123`/`Object_56` names and there is no
 * runtime object named `sfCQkHOWyrsLmor`. The material name is unique (used
 * by exactly this one mesh), so we match on it.
 *
 * The stock material is a glossy black display (metallic 0.9, roughness 0.1)
 * with the environment map as emissive (strength 8), so the screen reads as a
 * dark mirror reflecting the studio. We replace the base color with the
 * wallpaper, drop the metalness, and reuse the wallpaper as the emissive map
 * so the screen reads as a lit display.
 *
 * The timeline engine calls `setScreenForSection(id)` once half of a section
 * has scrolled into view (segment progress past the swap threshold); every
 * section's wallpaper is preloaded up front so the swap is instant. Swaps are
 * **crossfaded**: the display material's shader samples the previous and next
 * wallpaper and mixes them by `uScreenMix` over CROSSFADE_MS, so the screen
 * glides between sections instead of snapping. Reduced motion skips the fade.
 * Sections without an entry keep showing the previous screen.
 */

/** Material name of the display (the Spline object id `sfCQkHOWyrsLmor`). */
const SCREEN_MATERIAL = "sfCQkHOWyrsLmor";

/**
 * Wallpaper per timeline section id, served from `public/screens/v1/`. Sections
 * with no entry keep the previous section's screen.
 */
const SCREEN_BY_SECTION: Record<string, string> = {
  hero: "/screens/v1/hero.webp",
  "features-order": "/screens/v1/orders.webp",
  "features-courier": "/screens/v1/courier.webp",
  "features-metrix": "/screens/v1/metrix.webp",
  "features-inventory": "/screens/v1/inventory.webp",
  "features-reports": "/screens/v1/reports.webp",
  "features-smart": "/screens/v1/smart.webp",
  pricing: "/screens/v1/pricing.webp",
  reviews: "/screens/v1/reviews.webp",
  faq: "/screens/v1/faq.webp",
};

/** Duration of the wallpaper crossfade (ms). */
const CROSSFADE_MS = 400;

/** The display material once found — screen swaps mutate it in place. */
let screenMaterial: THREE.MeshStandardMaterial | null = null;

/** Loaded textures by URL — all wallpapers are preloaded up front. */
const textureCache = new Map<string, THREE.Texture>();

/** The hero wallpaper — statically bound to the material's map/emissiveMap. */
let heroTexture: THREE.Texture | null = null;

/**
 * Crossfade uniforms injected into the display material's shader. The screen
 * samples the previous and next wallpaper and mixes them by `uScreenMix`
 * (0 → 1), so a swap is a smooth crossfade rather than an instant bind.
 * `map`/`emissiveMap` stay bound to the hero wallpaper forever — that keeps
 * USE_MAP / USE_EMISSIVEMAP (and `vMapUv`) defined so the program compiles
 * once; every swap only updates these uniforms.
 */
interface ScreenUniforms {
  uScreenFrom: { value: THREE.Texture | null };
  uScreenTo: { value: THREE.Texture | null };
  uScreenMix: { value: number };
}

let screenUniforms: ScreenUniforms | null = null;

/** The wallpaper the display settles on (updated the moment a swap starts). */
let shownTexture: THREE.Texture | null = null;

/** In-flight crossfade (null when the display is settled on `shownTexture`). */
let fade: { from: THREE.Texture; to: THREE.Texture } | null = null;
let fadeRaf = 0;

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Load (or return the cached) wallpaper; the onLoad hook tunes it. */
function loadTexture(url: string): THREE.Texture {
  const cached = textureCache.get(url);
  if (cached) return cached;
  const texture = new THREE.TextureLoader().load(
    url,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    },
    undefined,
    (err) => console.error("Failed to load screen wallpaper:", url, err),
  );
  textureCache.set(url, texture);
  return texture;
}

/**
 * Inject the crossfade into the display material's shader: after the map is
 * sampled, diffuse and emissive are re-pointed at `mix(uScreenFrom, uScreenTo,
 * uScreenMix)`. Runs before the lighting chunks, so the whole lit+emissive
 * screen blends as one. (Guarded by USE_MAP — `vMapUv` only exists then; the
 * map stays bound, so the guard is always active.)
 */
function setupScreenMaterial(material: THREE.MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    // Start settled on whatever the display currently shows (hero on first
    // paint; a directly-bound texture if a swap ever beat the first compile).
    shader.uniforms.uScreenFrom = { value: shownTexture };
    shader.uniforms.uScreenTo = { value: shownTexture };
    shader.uniforms.uScreenMix = { value: 1 };
    shader.fragmentShader =
      `
      uniform sampler2D uScreenFrom;
      uniform sampler2D uScreenTo;
      uniform float uScreenMix;
    ` + shader.fragmentShader
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          #ifdef USE_MAP
            vec3 screenFromColor = texture2D( uScreenFrom, vMapUv ).rgb;
            vec3 screenToColor = texture2D( uScreenTo, vMapUv ).rgb;
            diffuseColor.rgb = mix( screenFromColor, screenToColor, uScreenMix );
          #endif`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          #ifdef USE_MAP
            totalEmissiveRadiance = mix( screenFromColor, screenToColor, uScreenMix );
          #endif`,
        );
    screenUniforms = shader.uniforms as unknown as ScreenUniforms;
  };
}

/**
 * Find the display material and preload every section's wallpaper. The laptop
 * starts showing the hero screen (it loads at the hero/start pose).
 */
export function applyScreenTexture(model: THREE.Object3D): void {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material || material.name !== SCREEN_MATERIAL) return;
    screenMaterial = material;
  });
  if (!screenMaterial) return;

  for (const url of new Set(Object.values(SCREEN_BY_SECTION))) loadTexture(url);

  // The display is driven by the crossfade uniforms; the static map keeps the
  // program compiled with USE_MAP / USE_EMISSIVEMAP so swaps never recompile.
  heroTexture = loadTexture(SCREEN_BY_SECTION.hero);
  screenMaterial.map = heroTexture;
  screenMaterial.emissiveMap = heroTexture;
  screenMaterial.color.set(0xffffff);
  screenMaterial.metalness = 0;
  screenMaterial.emissive.set(0xffffff);
  screenMaterial.emissiveIntensity = 1;
  setupScreenMaterial(screenMaterial);
  screenMaterial.needsUpdate = true;
  shownTexture = heroTexture;
}

/** Crossfade the display from the current wallpaper to the section's. */
export function setScreenForSection(sectionId: string): void {
  const url = SCREEN_BY_SECTION[sectionId];
  if (!url || !screenMaterial) return;
  const texture = loadTexture(url);

  // Already the settled display, or the current fade target — nothing to do.
  if (texture === shownTexture) return;
  if (fade && fade.to === texture) return;

  // Retarget an in-flight fade from its end state (a hair of pop, but the
  // fade direction stays) rather than interrupting it mid-blend.
  const from = fade ? fade.to : (shownTexture ?? texture);
  shownTexture = texture;
  fade = { from, to: texture };

  if (reducedMotion) {
    // No animation — snap straight to the new wallpaper.
    fade = null;
    cancelAnimationFrame(fadeRaf);
    if (screenUniforms) {
      screenUniforms.uScreenFrom.value = texture;
      screenUniforms.uScreenTo.value = texture;
      screenUniforms.uScreenMix.value = 1;
    }
    return;
  }

  // Defensive: before the shader compiled, bind the texture directly.
  if (!screenUniforms) {
    fade = null;
    screenMaterial.map = texture;
    screenMaterial.emissiveMap = texture;
    screenMaterial.needsUpdate = true;
    return;
  }

  startFade();
}

/** Drive uScreenMix from 0 → 1, crossfading `fade.from` into `fade.to`. */
function startFade(): void {
  if (!fade || !screenUniforms) return;
  cancelAnimationFrame(fadeRaf);
  const { from, to } = fade;
  const start = performance.now();
  const step = () => {
    if (!fade || !screenUniforms) return;
    const t = Math.min(1, (performance.now() - start) / CROSSFADE_MS);
    screenUniforms.uScreenFrom.value = from;
    screenUniforms.uScreenTo.value = to;
    screenUniforms.uScreenMix.value = t;
    if (t < 1) {
      fadeRaf = requestAnimationFrame(step);
    } else {
      fade = null;
    }
  };
  step();
}
