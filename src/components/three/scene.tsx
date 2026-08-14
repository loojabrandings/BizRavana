"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { threeStore } from "./store";
import { resolveBreakpoint } from "./keyframes";
import { startTimeline } from "./timeline";
import { applyScreenTexture } from "./screen-texture";

/**
 * Fixed full-viewport WebGL backdrop. Loads the MacBook model, then hands the
 * pose to the timeline engine (scroll-driven keyframe interpolation). The dev
 * gizmo (?edit=1) pauses the engine while composing.
 *
 * Rendering is imperative: a single rAF loop, no per-frame React state.
 */

/** Presentation pose for the wrapper — normalize the shipped model pose here. */
const WRAPPER_ROTATION: [number, number, number] = [0, 0, 0];

/** Normalize the model so its largest dimension fits this many world units. */
const MODEL_TARGET_SIZE = 40;

export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

    // Simple studio lighting (no shadow maps in v1).
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(60, 80, 110);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9db4ff, 0.7);
    fill.position.set(-90, -40, 60);
    scene.add(fill);

    const wrapper = new THREE.Group();
    wrapper.rotation.set(
      THREE.MathUtils.degToRad(WRAPPER_ROTATION[0]),
      THREE.MathUtils.degToRad(WRAPPER_ROTATION[1]),
      THREE.MathUtils.degToRad(WRAPPER_ROTATION[2]),
    );
    scene.add(wrapper);

    // Populate the store before the model loads so the dev gizmo can attach.
    threeStore.scene = scene;
    threeStore.camera = camera;
    threeStore.renderer = renderer;
    threeStore.wrapper = wrapper;

    let disposed = false;
    let stopTimeline: (() => void) | null = null;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      "/models/v1/macbook.meshopt.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Center the model within its own bounding box (local space — the
        // wrapper has no transform yet, so world == wrapper-local here).
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);

        // Scale so the largest dimension fits MODEL_TARGET_SIZE units.
        const scale = MODEL_TARGET_SIZE / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);

        wrapper.add(model);
        threeStore.modelGroup = model;

        // Wallpaper the screen with the hero texture.
        applyScreenTexture(model);

        // Fit the camera: distance = halfSize / tan(fov/2) with margin.
        const half = (MODEL_TARGET_SIZE / 2) * 1.6;
        camera.position.set(0, 0, half / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));

        // Hand the pose to the scroll engine — it plays the start → hero
        // intro on load, then drives each section's pose from scroll. Config
        // keyframes only (gizmo pins are dev-local).
        threeStore.breakpoint = resolveBreakpoint(window.innerWidth);
        stopTimeline = startTimeline();
      },
      undefined,
      (err) => console.error("Failed to load laptop model:", err),
    );

    // Size the canvas to the mount, letterboxing to the simulated device
    // aspect when the gizmo locks one (`threeStore.deviceAspect`; null =
    // follow the window).
    const fitCanvas = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const aspect = threeStore.deviceAspect ?? w / h;
      let cw = w;
      let ch = h;
      if (threeStore.deviceAspect) {
        if (w / h > aspect) {
          ch = h;
          cw = h * aspect;
        } else {
          cw = w;
          ch = w / aspect;
        }
      }
      renderer.setSize(cw, ch, false);
      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.margin = "auto";
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      mount.classList.toggle("is-device-frame", threeStore.deviceAspect !== null);
    };

    // Render loop (runs even before the model arrives — the scene is empty).
    let raf = 0;
    let lastDeviceAspect = threeStore.deviceAspect;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      // Re-frame when the gizmo picks or releases a device.
      if (threeStore.deviceAspect !== lastDeviceAspect) {
        lastDeviceAspect = threeStore.deviceAspect;
        fitCanvas();
      }
      renderer.render(scene, camera);
    };
    loop();

    // Resize / orientation change: re-measure, resize, re-apply aspect, and
    // hop the pose when the viewport crosses a breakpoint (unless the gizmo
    // is composing — it owns the pose then).
    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        fitCanvas();
        const bp = resolveBreakpoint(mount.clientWidth);
        if (bp !== threeStore.breakpoint) threeStore.breakpoint = bp;
      });
    };
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      disposed = true;
      stopTimeline?.();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      renderer.domElement.remove();
      threeStore.scene = null;
      threeStore.camera = null;
      threeStore.renderer = null;
      threeStore.modelGroup = null;
      threeStore.wrapper = null;
    };
  }, []);

  return <div ref={mountRef} className="scene-canvas" aria-hidden="true" />;
}
