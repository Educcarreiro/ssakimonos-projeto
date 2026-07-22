"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  isRed: boolean;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

/**
 * Campo de partículas vermelho/branco em canvas — a "brasa" da marca SSA
 * subindo lentamente atrás do login. Puramente decorativo: pausa por completo
 * se o usuário pedir menos movimento (prefers-reduced-motion).
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrame = 0;

    function spawnParticle(randomY = true): Particle {
      const isRed = Math.random() < 0.62;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(0.12 + Math.random() * 0.35),
        r: isRed ? 0.8 + Math.random() * 1.8 : 0.6 + Math.random() * 1.2,
        isRed,
        alpha: 0.15 + Math.random() * 0.55,
        twinkleSpeed: 0.4 + Math.random() * 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.min(140, Math.floor((width * height) / 9000));
      particles = Array.from({ length: targetCount }, () => spawnParticle(true));
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      // Desenha um único frame estático e para — respeita a preferência do usuário.
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = p.isRed ? `rgba(255,51,70,${p.alpha})` : `rgba(245,245,247,${p.alpha * 0.8})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resize);
    }

    let t = 0;
    function draw() {
      t += 1;
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx + Math.sin(t * 0.01 + p.twinklePhase) * 0.05;
        p.y += p.vy;

        if (p.y < -10) Object.assign(p, spawnParticle(false));
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.02 * p.twinkleSpeed + p.twinklePhase);
        const alpha = p.alpha * twinkle;

        ctx!.beginPath();
        ctx!.shadowBlur = p.isRed ? 6 : 3;
        ctx!.shadowColor = p.isRed ? "rgba(255,51,70,0.8)" : "rgba(245,245,247,0.6)";
        ctx!.fillStyle = p.isRed ? `rgba(255,59,77,${alpha})` : `rgba(245,245,247,${alpha * 0.8})`;
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    }

    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
