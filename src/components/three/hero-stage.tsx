"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <div className="scene-fallback" aria-hidden="true" />,
});

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <HeroScene />
    </div>
  );
}
