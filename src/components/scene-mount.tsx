"use client";

import dynamic from "next/dynamic";

// The three.js stack is heavy and browser-only: load it in a separate chunk
// and never prerender it (see docs/architecture.md — performance budget).
const SceneCanvas = dynamic(() => import("./three/scene"), { ssr: false });

// The dev keyframe gizmo (components/dev/gizmo-panel.tsx) is intentionally
// NOT mounted — deactivated and hidden. Re-mount it here to compose keyframes
// again during development.

export default function SceneMount() {
  return <SceneCanvas />;
}
