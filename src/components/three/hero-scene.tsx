"use client";

import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { DeveloperObject } from "./developer-object";

type SceneInput = { x: number; y: number; scroll: number };

type SceneProfile = {
  dpr: number;
  lowPower: boolean;
  reducedMotion: boolean;
};

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <div className="scene-fallback" aria-hidden="true" /> : this.props.children;
  }
}

function useSceneProfile(): SceneProfile {
  const [profile, setProfile] = useState<SceneProfile>({ dpr: 1, lowPower: true, reducedMotion: false });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateProfile = () => {
      const narrow = window.matchMedia("(max-width: 700px)").matches;
      const lowPower = narrow || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
      setProfile({ dpr: narrow ? 1 : 1.25, lowPower, reducedMotion: reducedMotionQuery.matches });
    };

    updateProfile();
    reducedMotionQuery.addEventListener("change", updateProfile);
    window.addEventListener("resize", updateProfile, { passive: true });
    return () => {
      reducedMotionQuery.removeEventListener("change", updateProfile);
      window.removeEventListener("resize", updateProfile);
    };
  }, []);

  return profile;
}

export default function HeroScene() {
  const profile = useSceneProfile();
  const pointer = useRef<SceneInput>({ x: 0, y: 0, scroll: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!sceneRef.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(sceneRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const updateScroll = () => {
      pointer.current.scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div ref={sceneRef} className="scene-canvas-shell">
      <WebGLBoundary>
        <Canvas
          aria-hidden="true"
          dpr={profile.dpr}
          frameloop={profile.reducedMotion || !visible ? "demand" : "always"}
          gl={{ alpha: true, antialias: !profile.lowPower, powerPreference: profile.lowPower ? "low-power" : "high-performance" }}
          camera={{ fov: 32, position: [0, 0, 5.4] }}
          fallback={<div className="scene-fallback" aria-hidden="true" />}
        >
          <ambientLight intensity={1.3} />
          <pointLight position={[3, 2, 4]} intensity={3.2} color="#c4ff96" distance={7} />
          <pointLight position={[-3, -2, 1]} intensity={1.4} color="#3d6c35" distance={6} />
          <DeveloperObject lowPower={profile.lowPower} reducedMotion={profile.reducedMotion} pointer={pointer} />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
