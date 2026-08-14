"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

type IdleCallbackWindow = {
  requestIdleCallback?: typeof window.requestIdleCallback;
  cancelIdleCallback?: typeof window.cancelIdleCallback;
};

const ACTIVATION_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

/**
 * Keeps the browser-only 3D experience out of the initial hydration path.
 * It loads during idle time for typical connections, while data-saving and
 * very slow connections opt in only after an intentional user interaction.
 */
export default function DeferredSceneMount() {
  const [SceneMount, setSceneMount] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;
    const idleWindow = window as unknown as IdleCallbackWindow;

    const loadScene = () => {
      if (cancelled) return;
      void import("./scene-mount").then(({ default: SceneMountComponent }) => {
        if (!cancelled) setSceneMount(() => SceneMountComponent);
      });
    };

    const connection = (navigator as NavigatorWithConnection).connection;
    const waitForInteraction =
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";

    const activate = () => {
      loadScene();
      removeActivationListeners();
    };

    const removeActivationListeners = () => {
      for (const event of ACTIVATION_EVENTS) {
        window.removeEventListener(event, activate);
      }
    };

    for (const event of ACTIVATION_EVENTS) {
      window.addEventListener(event, activate, { once: true, passive: true });
    }

    if (!waitForInteraction) {
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(loadScene, { timeout: 3000 });
      } else {
        idleId = window.setTimeout(loadScene, 2000);
      }
    }

    return () => {
      cancelled = true;
      removeActivationListeners();
      if (idleId === null) return;
      if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  return SceneMount ? <SceneMount /> : null;
}
