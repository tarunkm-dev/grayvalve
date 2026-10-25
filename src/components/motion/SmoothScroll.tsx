"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Inertial page scrolling for the marketing site (Lenis), kept in step with GSAP ScrollTrigger so
 * pinned scenes and parallax read the same scroll position. Off when the viewer prefers reduced
 * motion, and never used inside the dashboard.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // ?smooth=0 keeps native scrolling, for screenshots and debugging.
    if (new URLSearchParams(window.location.search).get("smooth") === "0") return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // In-page links (#waitlist, #body …) glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
