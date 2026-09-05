import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeOption } from '../types';

export type MoodEffectType =
  | 'calm'
  | 'cozy'
  | 'inspired'
  | 'tender'
  | 'reflective'
  | 'grateful'
  | null;

interface MoodAestheticEffectsProps {
  effect: MoodEffectType;
  triggerKey: number; // Increment to re-trigger even if same effect
  theme: ThemeOption;
  onComplete?: () => void;
}

export const MoodAestheticEffects: React.FC<MoodAestheticEffectsProps> = ({
  effect,
  triggerKey,
  theme,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showHeartPopup, setShowHeartPopup] = useState(false);
  const [thunderFlash, setThunderFlash] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!effect) return;

    // Reset previous states
    setShowHeartPopup(false);
    setThunderFlash(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas sizing
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const startTime = performance.now();
    let duration = 5000; // default 5 seconds

    // -------------------------------------------------------------
    // EFFECT 1: "calm" -> Pink flowers & petals dropping from top
    // -------------------------------------------------------------
    if (effect === 'calm') {
      duration = 5500;
      const count = 42;
      const petals = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.7 - 20,
        size: 10 + Math.random() * 16,
        speedY: 1.5 + Math.random() * 2.2,
        speedX: -0.8 + Math.random() * 1.6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2.5,
        swing: Math.random() * 2 * Math.PI,
        swingSpeed: 0.02 + Math.random() * 0.03,
        color: ['#FFB7C5', '#FFC0CB', '#F8BBD0', '#F48FB1', '#FFD1DC', '#FFE4E1'][
          Math.floor(Math.random() * 6)
        ],
        opacity: 0.75 + Math.random() * 0.25,
        isWholeFlower: Math.random() > 0.65,
      }));

      const drawPetal = (x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        // Curved sakura petal path
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo(size * 0.6, -size * 0.7, size * 0.8, size * 0.4, 0, size);
        ctx.bezierCurveTo(-size * 0.8, size * 0.4, -size * 0.6, -size * 0.7, 0, -size);
        ctx.fill();
        ctx.restore();
      };

      const drawFlower = (x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((i * 72 * Math.PI) / 180);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(0, -size * 0.65, size * 0.4, size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // Center pistil
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const render = (now: number) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const fade = elapsed > duration - 1000 ? Math.max(0, (duration - elapsed) / 1000) : 1;

        petals.forEach((p) => {
          p.y += p.speedY;
          p.swing += p.swingSpeed;
          p.x += p.speedX + Math.sin(p.swing) * 1.2;
          p.rotation += p.rotSpeed;

          if (p.isWholeFlower) {
            drawFlower(p.x, p.y, p.size, p.rotation, p.color, p.opacity * fade);
          } else {
            drawPetal(p.x, p.y, p.size, p.rotation, p.color, p.opacity * fade);
          }
        });

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onComplete?.();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // EFFECT 2: "cozy" -> Little snow falling down from the top
    // -------------------------------------------------------------
    else if (effect === 'cozy') {
      duration = 5500;
      const count = 75;
      const flakes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.8 - 10,
        radius: 1.5 + Math.random() * 4,
        speedY: 1.0 + Math.random() * 1.8,
        speedX: -0.4 + Math.random() * 0.8,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.55,
        isCrystal: Math.random() > 0.7,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
      }));

      const drawCrystal = (x: number, y: number, r: number, rot: number, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, r * 1.6);
          ctx.stroke();
          ctx.rotate((Math.PI / 3));
        }
        ctx.restore();
      };

      const render = (now: number) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fade = elapsed > duration - 1000 ? Math.max(0, (duration - elapsed) / 1000) : 1;

        flakes.forEach((f) => {
          f.y += f.speedY;
          f.sway += f.swaySpeed;
          f.x += f.speedX + Math.sin(f.sway) * 0.8;
          f.rotation += f.rotSpeed;

          if (f.isCrystal) {
            drawCrystal(f.x, f.y, f.radius, f.rotation, f.opacity * fade);
          } else {
            ctx.save();
            ctx.fillStyle = `rgba(255, 250, 245, ${f.opacity * fade})`;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onComplete?.();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // EFFECT 3: "inspired" -> Sparkles on the screen popping
    // -------------------------------------------------------------
    else if (effect === 'inspired') {
      duration = 4500;
      const count = 55;
      const sparkles = Array.from({ length: count }, () => ({
        x: 0.05 * canvas.width + Math.random() * (canvas.width * 0.9),
        y: 0.05 * canvas.height + Math.random() * (canvas.height * 0.85),
        birthTime: Math.random() * 3200, // staggered entrance
        lifeSpan: 900 + Math.random() * 600,
        maxSize: 12 + Math.random() * 20,
        color: ['#FFD700', '#FFA500', '#FF80BF', '#A7F3D0', '#FDE047', '#E0E7FF'][
          Math.floor(Math.random() * 6)
        ],
        rotation: Math.random() * 45,
      }));

      const drawSparkle = (x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        // 4-pointed star burst
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
        ctx.fill();

        // Cross glint in center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      const render = (now: number) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sparkles.forEach((s) => {
          if (elapsed >= s.birthTime && elapsed <= s.birthTime + s.lifeSpan) {
            const progress = (elapsed - s.birthTime) / s.lifeSpan;
            // Pop curve: rise quickly, peak, and fade out
            const scale = Math.sin(progress * Math.PI);
            const size = s.maxSize * scale;
            const alpha = Math.sin(progress * Math.PI);
            drawSparkle(s.x, s.y, size, s.rotation + progress * 40, s.color, alpha);
          }
        });

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onComplete?.();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // EFFECT 4: "tender" -> Rain over whole page for a few seconds + thunder
    // -------------------------------------------------------------
    else if (effect === 'tender') {
      duration = 4800;
      const count = 120;
      const drops = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: 16 + Math.random() * 22,
        speedY: 14 + Math.random() * 10,
        speedX: -2.5,
        opacity: 0.35 + Math.random() * 0.45,
      }));

      // Thunder flash timing (at 500ms and 1100ms)
      const thunderTimers: NodeJS.Timeout[] = [];
      thunderTimers.push(
        setTimeout(() => {
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), 90);
          setTimeout(() => {
            setThunderFlash(true);
            setTimeout(() => setThunderFlash(false), 140);
          }, 160);
        }, 650)
      );

      thunderTimers.push(
        setTimeout(() => {
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), 80);
        }, 2200)
      );

      const render = (now: number) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fade = elapsed > duration - 800 ? Math.max(0, (duration - elapsed) / 800) : 1;

        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';

        drops.forEach((d) => {
          d.y += d.speedY;
          d.x += d.speedX;

          if (d.y > canvas.height) {
            d.y = -20;
            d.x = Math.random() * (canvas.width + 100);
          }

          ctx.strokeStyle = `rgba(147, 197, 253, ${d.opacity * fade})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.speedX * 1.5, d.y + d.len);
          ctx.stroke();
        });

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          thunderTimers.forEach((t) => clearTimeout(t));
          onComplete?.();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // EFFECT 5: "reflective" / pensive -> Dry leaves shuffling through air
    // -------------------------------------------------------------
    else if (effect === 'reflective') {
      duration = 5500;
      const count = 36;
      const leaves = Array.from({ length: count }, () => ({
        x: Math.random() * (canvas.width * 1.2) - canvas.width * 0.1,
        y: Math.random() * -canvas.height * 0.5 - 20,
        size: 14 + Math.random() * 18,
        speedY: 1.8 + Math.random() * 2.2,
        speedX: 2.2 + Math.random() * 3.5, // strong sideways draft
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        color: ['#D97706', '#B45309', '#92400E', '#CA8A04', '#C2410C', '#EA580C'][
          Math.floor(Math.random() * 6)
        ],
        opacity: 0.8 + Math.random() * 0.2,
      }));

      const drawLeaf = (x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;

        // Realistic pointed autumn leaf contour
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size * 0.7, -size * 0.3, size * 0.6, size * 0.5);
        ctx.quadraticCurveTo(size * 0.2, size * 0.8, 0, size);
        ctx.quadraticCurveTo(-size * 0.2, size * 0.8, -size * 0.6, size * 0.5);
        ctx.quadraticCurveTo(-size * 0.7, -size * 0.3, 0, -size);
        ctx.fill();

        // Central vein
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();

        ctx.restore();
      };

      const render = (now: number) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fade = elapsed > duration - 1000 ? Math.max(0, (duration - elapsed) / 1000) : 1;

        leaves.forEach((l) => {
          l.y += l.speedY;
          l.wobble += l.wobbleSpeed;
          l.x += l.speedX + Math.cos(l.wobble) * 2;
          l.rot += l.rotSpeed;

          drawLeaf(l.x, l.y, l.size, l.rot, l.color, l.opacity * fade);
        });

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onComplete?.();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    }

    // -------------------------------------------------------------
    // EFFECT 6: "grateful" / heart -> Big heart beating over the screen
    // -------------------------------------------------------------
    else if (effect === 'grateful') {
      setShowHeartPopup(true);
      const timer = setTimeout(() => {
        setShowHeartPopup(false);
        onComplete?.();
      }, 3800);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', setSize);
      };
    }

    return () => {
      window.removeEventListener('resize', setSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [effect, triggerKey]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Canvas for Particle System Effects (Flowers, Snow, Sparkles, Rain, Leaves) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Thunder Flash Overlay for "Tender Rain" */}
      <div
        className={`absolute inset-0 bg-white/45 backdrop-blur-[1px] transition-opacity duration-75 pointer-events-none ${
          thunderFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Big Heart Beating Popup for "Heart / Grateful" */}
      <AnimatePresence>
        {showHeartPopup && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-50">
            {/* Soft backdrop ambient radial glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-rose-900/20 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{
                scale: [0.9, 1.18, 1, 1.15, 1, 1.2, 1],
                opacity: 1,
              }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{
                duration: 3.2,
                times: [0, 0.2, 0.35, 0.55, 0.7, 0.85, 1],
                ease: 'easeInOut',
              }}
              className="relative flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Outer pulsing glow halo rings */}
              <motion.div
                animate={{
                  scale: [1, 1.6, 2],
                  opacity: [0.6, 0.2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: 'easeOut',
                }}
                style={{
                  background: `radial-gradient(circle, ${theme.primary}66 0%, ${theme.accent}33 50%, transparent 70%)`,
                }}
                className="absolute w-72 h-72 rounded-full -z-10"
              />

              {/* Heart SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-[0_15px_35px_rgba(225,29,72,0.45)]"
                fill="url(#heart-gradient)"
              >
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="50%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#BE123C" />
                  </linearGradient>
                </defs>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>

              {/* Gentle Floating Mini Sparkle Hearts around it */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderColor: theme.borderColor,
                  color: theme.textHeading,
                }}
                className="mt-6 px-6 py-2 rounded-full border shadow-lg text-sm font-serif italic tracking-wide backdrop-blur-md"
              >
                💖 Heart Blossom • Full of Warm Gratitude
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
