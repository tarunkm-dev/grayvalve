"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Layered parallax on GSAP ScrollTrigger: every child with `data-depth` moves by that fraction of
 * its height while the section scrolls past (negative moves up). Off under reduced motion.
 */
export function GsapParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const d = Number(layer.dataset.depth) || 0;
        gsap.fromTo(layer, { yPercent: d * 50 }, { yPercent: -d * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
