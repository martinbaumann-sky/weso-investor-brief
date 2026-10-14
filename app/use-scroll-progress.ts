"use client";

import { useEffect, useState, type RefObject } from "react";

// Pinned chapters report how far the reader has travelled through them (0–1).
// On compact screens nothing is pinned, so progress follows a target element through the viewport instead.
export function useScrollProgress(sectionRef: RefObject<HTMLElement | null>, compactTargetRef?: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 860px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;
      const section = sectionRef.current;
      if (!section) return;
      if (reduceMotion.matches) {
        setProgress(1);
        return;
      }

      if (compact.matches) {
        const top = (compactTargetRef?.current ?? section).getBoundingClientRect().top;
        const start = window.innerHeight * 0.78;
        const end = window.innerHeight * 0.08;
        setProgress(Math.min(Math.max((start - top) / (start - end), 0), 1));
        return;
      }

      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      setProgress(passed / travel);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    compact.addEventListener("change", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      compact.removeEventListener("change", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [sectionRef, compactTargetRef]);

  return progress;
}
