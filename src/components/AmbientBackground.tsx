import React, { useEffect, useState } from 'react';
import { ThemeOption } from '../types';

interface AmbientBackgroundProps {
  theme: ThemeOption;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme }) => {
  const [mousePos, setMousePos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
  }));
  const [smoothPos, setSmoothPos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
  }));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Eased trailing cursor glow
  useEffect(() => {
    let animationFrameId: number;
    const ease = 0.08;

    const animate = () => {
      setSmoothPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * ease,
        y: prev.y + (mousePos.y - prev.y) * ease,
      }));
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Dynamic Cursor Soft Glow Trail */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl transition-opacity duration-700 opacity-35"
        style={{
          background: `radial-gradient(circle, ${theme.primary} 0%, ${theme.accent} 50%, transparent 70%)`,
          transform: `translate3d(${smoothPos.x - 192}px, ${smoothPos.y - 192}px, 0)`,
        }}
      />

      {/* Atmospheric Ambient Orbs */}
      <div
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-3xl opacity-40 animate-soft-float"
        style={{
          background: `radial-gradient(circle, ${theme.primary}33 0%, ${theme.accent}22 60%, transparent 80%)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-soft-float"
        style={{
          animationDelay: '-3s',
          background: `radial-gradient(circle, ${theme.accent}44 0%, ${theme.badgeBg}33 60%, transparent 80%)`,
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-3xl opacity-25 animate-soft-float"
        style={{
          animationDelay: '-1.5s',
          background: `radial-gradient(circle, ${theme.primary}22 0%, ${theme.secondary}11 50%, transparent 75%)`,
        }}
      />

      {/* Subtle floating cherry blossom petals & coffee beans SVG motifs */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        <defs>
          <radialGradient id="petal-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        {/* Decorative subtle petal paths placed gracefully */}
        <path
          d="M120 160 C135 140, 155 145, 160 165 C165 185, 145 195, 130 185 C115 175, 110 170, 120 160 Z"
          fill="url(#petal-grad)"
          className="animate-soft-float"
          style={{ animationDuration: '8s' }}
        />
        <path
          d="M85% 220 C87% 195, 90% 200, 91% 225 C92% 245, 89% 255, 86% 245 C84% 235, 83% 230, 85% 220 Z"
          fill="url(#petal-grad)"
          className="animate-soft-float"
          style={{ animationDuration: '10s', animationDelay: '-4s' }}
        />
        <path
          d="M75% 75% C77% 72%, 80% 74%, 81% 78% C82% 82%, 78% 85%, 75% 83% Z"
          fill="url(#petal-grad)"
          className="animate-soft-float"
          style={{ animationDuration: '9s', animationDelay: '-2s' }}
        />
      </svg>
    </div>
  );
};
