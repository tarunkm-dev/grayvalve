"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

/*
 * Aurora: a WebGL band of light that drifts across the top of a section.
 * Adapted from React Bits' Aurora background (reactbits.dev, MIT + Commons Clause), rewritten for
 * the Grayvalve aura palette. Under reduced motion, without WebGL, or before hydration it draws a
 * still CSS gradient instead (the `.auroraStill` layer underneath), so nothing depends on it.
 */

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 ramp(float t) {
  return t < 0.5 ? mix(uStops[0], uStops[1], t * 2.0) : mix(uStops[1], uStops[2], (t - 0.5) * 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 col = ramp(uv.x);
  float h = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  h = exp(h);
  h = (uv.y * 2.0 - h + 0.2);
  float intensity = 0.6 * h;
  float mid = 0.2;
  float alpha = smoothstep(mid - uBlend * 0.5, mid + uBlend * 0.5, intensity);
  vec3 c = intensity * col;
  fragColor = vec4(c * alpha, alpha);
}`;

type Props = {
  /** Three colours, left to right. Hex strings. */
  stops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
};

const DEFAULT_STOPS: [string, string, string] = ["#8d74f0", "#e2fc5b", "#d4553e"];

export function Aurora({ stops = DEFAULT_STOPS, amplitude = 1.1, blend = 0.55, speed = 0.6, className }: Props) {
  const host = useRef<HTMLDivElement>(null);

  const key = stops.join(",");

  useEffect(() => {
    const colours = key.split(",");
    const el = host.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 1.5) });
    } catch {
      return; // No WebGL 2: the still gradient stays.
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete (geometry.attributes as Record<string, unknown>).uv;
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uStops: { value: colours.map((c) => { const k = new Color(c); return [k.r, k.g, k.b]; }) },
        uResolution: { value: [el.offsetWidth, el.offsetHeight] },
        uBlend: { value: blend },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    el.appendChild(gl.canvas);
    gl.canvas.setAttribute("aria-hidden", "true");

    const resize = () => {
      renderer.setSize(el.offsetWidth, el.offsetHeight);
      program.uniforms.uResolution.value = [el.offsetWidth, el.offsetHeight];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Only animate while on screen: no GPU work for a hero that has scrolled away.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let frame = 0;
    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      program.uniforms.uTime.value = (t * 0.001 * speed) % 10000;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(loop);
    el.dataset.live = "true";

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      delete el.dataset.live;
      if (gl.canvas.parentNode === el) el.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [key, amplitude, blend, speed]);

  return (
    <div ref={host} className={`aurora-gl ${className ?? ""}`} aria-hidden="true">
      <div className="aurora-still" style={{ "--s1": stops[0], "--s2": stops[1], "--s3": stops[2] } as React.CSSProperties} />
    </div>
  );
}
