"use client";

import React, { useCallback, useRef, useState } from "react";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface GlowInputProps {
  children: React.ReactNode;
  /** Wrapper className (e.g. layout/flex classes) */
  className?: string;
  /** Border radius in px to match the wrapped input */
  radius?: number;
  /** Intensity of the glow effect (0.1 - 1.0) */
  glowIntensity?: number;
}

/**
 * GlowInput — a liquid-glass animated wrapper.
 * Adds a cursor-following gradient, an animated border glow on hover/focus,
 * a sweeping shimmer and click ripples around any children (e.g. a text input).
 *
 * Adapted from the "prompt-input-dynamic-grow" Figma export to plain
 * React + Tailwind (no figma:react dependency), tuned to the app's blue theme.
 */
export function GlowInput({ children, className, radius = 26, glowIntensity = 0.5 }: GlowInputProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const throttleRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (throttleRef.current || !ref.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    throttleRef.current = window.setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setPos({
          x: ((clientX - rect.left) / rect.width) * 100,
          y: ((clientY - rect.top) / rect.height) * 100,
        });
      }
      throttleRef.current = null;
    }, 40);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ripple: Ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() };
    setRipples((prev) => (prev.length < 5 ? [...prev, ripple] : prev));
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 650);
  }, []);

  const g = glowIntensity;
  const rounded = { borderRadius: radius } as React.CSSProperties;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={cn("group relative", className)}
      style={rounded}
    >
      {/* content (input lives here, above the effects) */}
      <div className="relative z-10" style={rounded}>
        {children}
      </div>

      {/* animated border glow on hover / focus */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          ...rounded,
          boxShadow: `0 0 0 1px rgba(59,130,246,${0.25 * g}), 0 0 10px rgba(59,130,246,${0.35 * g}), 0 0 22px rgba(99,102,241,${0.25 * g}), 0 0 34px rgba(236,72,153,${0.14 * g})`,
        }}
      />

      {/* cursor-following gradient (subtle tint over the field) */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          ...rounded,
          background: `radial-gradient(circle 150px at ${pos.x}% ${pos.y}%, rgba(59,130,246,0.10) 0%, rgba(99,102,241,0.06) 40%, rgba(236,72,153,0.04) 65%, transparent 80%)`,
        }}
      />

      {/* sweeping shimmer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={rounded}
      >
        <div
          className="absolute inset-y-0 -left-1/3 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[400%]"
          style={{ transition: "transform 1100ms ease-out" }}
        />
      </div>

      {/* click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute z-20 animate-ping rounded-full"
          style={{
            left: r.x - 22,
            top: r.y - 22,
            width: 44,
            height: 44,
            background: "radial-gradient(circle, rgba(59,130,246,0.30) 0%, rgba(99,102,241,0.15) 45%, transparent 70%)",
          }}
        />
      ))}
    </div>
  );
}
