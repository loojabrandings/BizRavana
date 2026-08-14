"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { threeStore } from "@/components/three/store";
import type { Breakpoint, SectionKeyframe } from "@/components/three/store";
import {
  BREAKPOINTS,
  buildTimelineConfig,
  clearKeyframeOverrides,
  getConfigKeyframes,
  getEffectiveKeyframes,
  getPinnedKeys,
  getSectionIds,
  resetKeyframeOverride,
  resolveBreakpoint,
  setKeyframeOverride,
} from "@/components/three/keyframes";

/**
 * Dev gizmo controller — never ships in production UI.
 *
 * Access: tap the floating ✥ button (dev) or open the page with `?edit=1`.
 * The laptop is static (no scroll animation yet). To compose keyframes: pick
 * a device (Desktop / Tablet / Mobile) → pick a section → drag the laptop
 * with the move/rotate/scale gizmo → the pose is pinned to that (section,
 * device) pair. Pins persist to localStorage and layer over
 * `config/timeline.json`.
 *
 * "Copy JSON" / "Export JSON" produce the timeline config to hand back, so
 * the animation engine can be built against real keyframes.
 */

type Mode = "translate" | "rotate" | "scale";

const MODES: { id: Mode; label: string }[] = [
  { id: "translate", label: "Move" },
  { id: "rotate", label: "Rotate" },
  { id: "scale", label: "Scale" },
];

const DEG = 180 / Math.PI;

/** Round a number for display in the numeric fields (trailing zeros stripped). */
function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

/**
 * Simulated screen aspect (width/height) per device, applied to the camera
 * while composing so the framing matches the target screen. `desktop` follows
 * the real window.
 */
const DEVICE_ASPECTS: Record<Breakpoint, number | null> = {
  desktop: null,
  tablet: 768 / 1024, // iPad portrait
  mobile: 390 / 844, // phone portrait
};

function applyKeyframe(kf: SectionKeyframe) {
  const model = threeStore.modelGroup;
  if (!model) return;
  model.position.set(kf.position[0], kf.position[1], kf.position[2]);
  model.rotation.set(kf.rotation[0] * (Math.PI / 180), kf.rotation[1] * (Math.PI / 180), kf.rotation[2] * (Math.PI / 180));
  model.scale.set(kf.scale[0], kf.scale[1], kf.scale[2]);
}

export default function GizmoPanel() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("translate");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => resolveBreakpoint(window.innerWidth));
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [valuesOpen, setValuesOpen] = useState(true);
  const [pos, setPos] = useState<[string, string, string]>(["0", "0", "0"]);
  const [rot, setRot] = useState<[string, string, string]>(["0", "0", "0"]);
  const [scale, setScale] = useState("1");

  const controlsRef = useRef<TransformControls | null>(null);
  const modeRef = useRef<Mode>("translate");
  const activeSectionRef = useRef<string | null>(null);
  const breakpointRef = useRef<Breakpoint>(resolveBreakpoint(window.innerWidth));
  const autoSelectedRef = useRef(false);

  // Enter edit mode via ?edit=1 or the floating dev button (dev only).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("edit")) {
      setOpen(true);
    }
  }, []);

  // Keep the pinned (section/device) list in sync with persisted overrides.
  useEffect(() => {
    if (open) setPinnedKeys(getPinnedKeys());
  }, [open]);

  // Wait for the model to load so sections can be selected.
  useEffect(() => {
    let raf = 0;
    const poll = () => {
      if (threeStore.modelGroup) {
        setModelReady(true);
        return;
      }
      raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Pin the model's current transform as the active section's keyframe. */
  const pinPose = useCallback(() => {
    const model = threeStore.modelGroup;
    const id = activeSectionRef.current;
    if (!model || !id) return;

    const kf: SectionKeyframe = {
      position: [model.position.x, model.position.y, model.position.z],
      rotation: [model.rotation.x * DEG, model.rotation.y * DEG, model.rotation.z * DEG],
      scale: [model.scale.x, model.scale.y, model.scale.z],
    };
    setKeyframeOverride(id, breakpointRef.current, kf);
    setPinnedKeys(getPinnedKeys());
    setPinned(true);
    window.setTimeout(() => setPinned(false), 1500);
  }, []);

  /** Mirror the model's current transform into the numeric fields. */
  const syncFromModel = useCallback(() => {
    const model = threeStore.modelGroup;
    if (!model) return;
    setPos([fmt(model.position.x), fmt(model.position.y), fmt(model.position.z)]);
    setRot([fmt(model.rotation.x * DEG), fmt(model.rotation.y * DEG), fmt(model.rotation.z * DEG)]);
    setScale(fmt(model.scale.x));
  }, []);

  // Create the TransformControls instance once the scene is up.
  useEffect(() => {
    if (!open || controlsRef.current) return;
    const { scene, camera, renderer } = threeStore;
    if (!scene || !camera || !renderer) return;

    const controls = new TransformControls(camera, renderer.domElement);
    controls.setMode("translate");
    controls.setSize(0.9);
    scene.add(controls.getHelper());

    // Uniform scale only: TransformControls scales per axis, which would
    // distort the laptop. Collapse any scale drag to a single factor — the
    // dragged axis's value when growing, the reduced axis's value when
    // shrinking (TransformControls recomputes from its drag-start scale each
    // frame, so collapsing mid-drag stays stable).
    let scaleStart = 1;
    controls.addEventListener("mouseDown", () => {
      if (modeRef.current !== "scale") return;
      const s = threeStore.modelGroup?.scale;
      scaleStart = s ? Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) : 1;
    });
    controls.addEventListener("objectChange", () => {
      if (modeRef.current === "scale") {
        const s = threeStore.modelGroup?.scale;
        if (s) {
          const cur = Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z));
          const min = Math.min(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z));
          const factor = cur > scaleStart ? cur : min;
          if (factor > 0) s.setScalar(factor);
        }
      }
      syncFromModel();
    });

    // Releasing a drag = intent to pin; capture the pose automatically.
    controls.addEventListener("dragging-changed", (event) => {
      const dragging = (event as { value: boolean }).value;
      threeStore.gizmoActive = dragging;
      if (!dragging) pinPose();
    });
    controlsRef.current = controls;
  }, [open, pinPose, syncFromModel]);

  // Keep the gizmo mode in sync.
  useEffect(() => {
    modeRef.current = mode;
    controlsRef.current?.setMode(mode);
  }, [mode]);

  // Tear down when leaving edit mode / unmounting.
  useEffect(() => {
    if (open) return;
    controlsRef.current?.detach();
    controlsRef.current?.getHelper().removeFromParent();
    controlsRef.current?.dispose();
    controlsRef.current = null;
    threeStore.gizmoActive = false;
    threeStore.deviceAspect = null; // release the simulated device frame
    activeSectionRef.current = null;
    setActiveSection(null);
    autoSelectedRef.current = false;
    document.documentElement.classList.remove("is-editing");
  }, [open]);

  const selectSection = useCallback((id: string) => {
    const controls = controlsRef.current;
    const model = threeStore.modelGroup;
    if (!controls || !model) return;

    // Start from the section's stored keyframe (for the active device) so
    // edits are incremental.
    applyKeyframe(getEffectiveKeyframes(id)[breakpointRef.current]);
    syncFromModel();
    activeSectionRef.current = id;
    setActiveSection(id);
    threeStore.gizmoActive = true;
    controls.attach(model);
    // Let pointer events reach the canvas so the 3D gizmo is draggable.
    document.documentElement.classList.add("is-editing");
  }, [syncFromModel]);

  const deselect = useCallback(() => {
    controlsRef.current?.detach();
    activeSectionRef.current = null;
    setActiveSection(null);
    threeStore.gizmoActive = false;
    document.documentElement.classList.remove("is-editing");
  }, []);

  /** Switch the composed device: re-frame the view and re-apply its pose. */
  const switchBreakpoint = useCallback((bp: Breakpoint) => {
    setBreakpoint(bp);
    breakpointRef.current = bp;
    threeStore.breakpoint = bp;
    // Letterbox the 3D view to the target device's screen aspect.
    threeStore.deviceAspect = DEVICE_ASPECTS[bp];
    const id = activeSectionRef.current;
    if (id) {
      applyKeyframe(getEffectiveKeyframes(id)[bp]);
    } else {
      applyKeyframe(getConfigKeyframes("hero")[bp]);
    }
    syncFromModel();
  }, [syncFromModel]);

  // Note: no auto-follow of live viewport breakpoints here — the device
  // switcher is an explicit override, so composing for desktop on a mobile
  // window must not be yanked back on resize. The scene tracks real
  // breakpoints for the load pose when the gizmo is closed.

  // When the gizmo opens, select the hero section right away so the 3D
  // transform handles are immediately visible (the laptop already sits at the
  // hero keyframe, so the pose doesn't jump).
  useEffect(() => {
    if (!open || autoSelectedRef.current) return;
    if (!modelReady || !controlsRef.current) return;
    autoSelectedRef.current = true;
    selectSection("hero");
  }, [open, modelReady, selectSection]);

  const copyConfig = useCallback(() => {
    const config = buildTimelineConfig();
    void navigator.clipboard
      .writeText(JSON.stringify(config, null, 2))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard may be unavailable (permissions) — fall back to download.
        downloadConfig();
      });
  }, []);

  /** Apply a typed numeric value to the model (position, or rotation in degrees). */
  const setNumeric = useCallback((group: "position" | "rotation", index: number, raw: string) => {
    const setter = group === "position" ? setPos : setRot;
    setter((prev) => {
      const next = prev.slice() as [string, string, string];
      next[index] = raw;
      return next;
    });
    const n = parseFloat(raw);
    const model = threeStore.modelGroup;
    if (Number.isNaN(n) || !model) return;
    if (group === "position") {
      if (index === 0) model.position.x = n;
      else if (index === 1) model.position.y = n;
      else model.position.z = n;
    } else {
      const rad = n * (Math.PI / 180);
      if (index === 0) model.rotation.x = rad;
      else if (index === 1) model.rotation.y = rad;
      else model.rotation.z = rad;
    }
  }, []);

  /** Apply a typed scale factor — always uniform. */
  const setNumericScale = useCallback((raw: string) => {
    setScale(raw);
    const n = parseFloat(raw);
    const model = threeStore.modelGroup;
    if (Number.isNaN(n) || n <= 0 || !model) return;
    model.scale.setScalar(n);
  }, []);

  /** Commit numeric edits: normalize the fields to the model and pin the pose. */
  const commitNumeric = useCallback(() => {
    if (!activeSectionRef.current) return;
    syncFromModel();
    pinPose();
  }, [pinPose, syncFromModel]);

  const downloadConfig = useCallback(() => {
    const config = buildTimelineConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2000);
  }, []);

  /** Clear one section's pin (for the active device) and snap it to config. */
  const resetSection = useCallback(
    (id: string) => {
      resetKeyframeOverride(id, breakpointRef.current);
      if (activeSectionRef.current === id) {
        applyKeyframe(getConfigKeyframes(id)[breakpointRef.current]);
      }
      syncFromModel();
      setPinnedKeys(getPinnedKeys());
    },
    [syncFromModel]
  );

  /** Clear every pin and return the laptop to the config pose. */
  const resetAllPins = useCallback(() => {
    clearKeyframeOverrides();
    const active = activeSectionRef.current;
    applyKeyframe(getConfigKeyframes(active ?? "hero")[breakpointRef.current]);
    syncFromModel();
    setPinnedKeys([]);
  }, [syncFromModel]);

  if (!open) {
    return (
      <button
        type="button"
        className="gizmo-fab"
        onClick={() => setOpen(true)}
        aria-label="Open 3D keyframe gizmo"
        title="Transform the laptop (dev tool)"
      >
        ✥
      </button>
    );
  }

  return (
    <aside className="gizmo">
      <div className="gizmo__head">
        <span className="gizmo__title">Keyframe Gizmo</span>
        <button type="button" className="gizmo__close" onClick={() => setOpen(false)} aria-label="Close gizmo">
          ×
        </button>
      </div>

      <p className="gizmo__hint">
        Pick a device and a section, drag the laptop into place — it pins on release — or type exact numbers in the
        fields below. Scale is always uniform. ↺ resets one section; reset all pins clears every device.
      </p>

      <div className="gizmo__group" role="group" aria-label="Device breakpoint">
        {BREAKPOINTS.map((bp) => (
          <button
            key={bp}
            type="button"
            className={`gizmo__device ${breakpoint === bp ? "is-active" : ""}`}
            onClick={() => switchBreakpoint(bp)}
          >
            {bp}
          </button>
        ))}
      </div>

      <div className="gizmo__group" role="group" aria-label="Transform mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`gizmo__mode ${mode === m.id ? "is-active" : ""}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="gizmo__values">
        <button
          type="button"
          className="gizmo__values-toggle"
          onClick={() => setValuesOpen((v) => !v)}
          aria-expanded={valuesOpen}
        >
          <span aria-hidden>{valuesOpen ? "▾" : "▸"}</span> Numeric values
        </button>
        {valuesOpen && (
          <div className="gizmo__values-body">
            <div className="gizmo__value-row">
              <span className="gizmo__value-label">pos</span>
              {(["x", "y", "z"] as const).map((axis, i) => (
                <input
                  key={axis}
                  type="number"
                  step="any"
                  className="gizmo__value-input"
                  value={pos[i]}
                  disabled={!activeSection || !modelReady}
                  aria-label={`Position ${axis}`}
                  onChange={(e) => setNumeric("position", i, e.target.value)}
                  onBlur={commitNumeric}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              ))}
            </div>
            <div className="gizmo__value-row">
              <span className="gizmo__value-label">rot°</span>
              {(["x", "y", "z"] as const).map((axis, i) => (
                <input
                  key={axis}
                  type="number"
                  step="any"
                  className="gizmo__value-input"
                  value={rot[i]}
                  disabled={!activeSection || !modelReady}
                  aria-label={`Rotation ${axis} (degrees)`}
                  onChange={(e) => setNumeric("rotation", i, e.target.value)}
                  onBlur={commitNumeric}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              ))}
            </div>
            <div className="gizmo__value-row gizmo__value-row--scale">
              <span className="gizmo__value-label">scale</span>
              <input
                type="number"
                step="any"
                className="gizmo__value-input"
                value={scale}
                disabled={!activeSection || !modelReady}
                aria-label="Scale"
                onChange={(e) => setNumericScale(e.target.value)}
                onBlur={commitNumeric}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
            </div>
          </div>
        )}
      </div>

      <ul className="gizmo__sections">
        {getSectionIds().map((id) => {
          const isPinned = pinnedKeys.includes(`${id}/${breakpoint}`);
          return (
            <li key={id} className="gizmo__section-row">
              <button
                type="button"
                disabled={!modelReady}
                className={`gizmo__section ${activeSection === id ? "is-active" : ""} ${isPinned ? "is-pinned" : ""}`}
                onClick={() => (activeSection === id ? deselect() : selectSection(id))}
              >
                {id}
              </button>
              <button
                type="button"
                className="gizmo__section-reset"
                disabled={!isPinned}
                onClick={() => resetSection(id)}
                title={isPinned ? `Reset ${id} (${breakpoint}) to its config keyframe` : `No ${breakpoint} pin for ${id}`}
                aria-label={`Reset ${id} pose`}
              >
                ↺
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className="gizmo__pin" onClick={pinPose} disabled={!activeSection || !modelReady}>
        {pinned ? "Pinned ✓" : "Pin pose"}
      </button>

      <div className="gizmo__actions">
        <button type="button" className="gizmo__btn" onClick={copyConfig}>
          {copied ? "Copied ✓" : "Copy JSON"}
        </button>
        <button type="button" className="gizmo__btn" onClick={downloadConfig}>
          {exported ? "Exported ✓" : "Download"}
        </button>
      </div>
      <div className="gizmo__actions">
        <button
          type="button"
          className="gizmo__btn gizmo__btn--danger"
          onClick={resetAllPins}
          title="Clear every pinned pose (all devices) and return the laptop to its config keyframe"
        >
          {pinnedKeys.length > 0 ? `Reset pins (${pinnedKeys.length})` : "Reset pins"}
        </button>
      </div>
    </aside>
  );
}
