"use client";

import { useEffect } from "react";

/*
 * Spotlight cards: a soft glow follows the pointer across any `.tile`, `.aura` or `[data-spot]`
 * surface. Adapted from React Bits' SpotlightCard (reactbits.dev, MIT + Commons Clause) as one
 * delegated listener that only sets two CSS variables; the glow itself is in globals.css.
 * Touch and reduced-motion viewers never see it.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".tile, .aura, [data-spot]");
      if (last && last !== el) last.removeAttribute("data-spot-on");
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.setAttribute("data-spot-on", "");
    };
    const onLeave = () => last?.removeAttribute("data-spot-on");
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
