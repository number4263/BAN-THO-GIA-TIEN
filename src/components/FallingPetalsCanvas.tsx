import React, { useEffect, useRef } from 'react';

export type PetalType = 'lotus' | 'mai_vang' | 'mai_trang' | 'mixed';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmplitude: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  type: 'lotus' | 'mai_vang' | 'mai_trang';
}

interface FallingPetalsCanvasProps {
  petalType?: PetalType;
  density?: 'gentle' | 'normal' | 'dense';
  enabled?: boolean;
}

export const FallingPetalsCanvas: React.FC<FallingPetalsCanvasProps> = ({
  petalType = 'mixed',
  density = 'normal',
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Determine count based on screen width & density
    const baseCount = width < 768 ? 16 : 28;
    const countMultiplier = density === 'gentle' ? 0.6 : density === 'dense' ? 1.5 : 1.0;
    const petalCount = Math.floor(baseCount * countMultiplier);

    const resolvePetalType = (): 'lotus' | 'mai_vang' | 'mai_trang' => {
      if (petalType === 'lotus') return 'lotus';
      if (petalType === 'mai_vang') return 'mai_vang';
      if (petalType === 'mai_trang') return 'mai_trang';
      // Mixed: 50% lotus, 30% mai vang, 20% mai trang
      const rand = Math.random();
      if (rand < 0.5) return 'lotus';
      if (rand < 0.8) return 'mai_vang';
      return 'mai_trang';
    };

    // Initialize petals scattered across screen
    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 11 + Math.random() * 9,
      speedY: 0.35 + Math.random() * 0.65, // Gentle slow descent
      speedX: -0.2 + Math.random() * 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.02,
      swayAmplitude: 0.6 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.018,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.015 + Math.random() * 0.025,
      opacity: 0.45 + Math.random() * 0.45,
      type: resolvePetalType(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Update physics
        p.swayPhase += p.swaySpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.swayPhase) * p.swayAmplitude + p.speedX;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Reset if drifted beyond canvas
        if (p.y > height + 25) {
          p.y = -20;
          p.x = Math.random() * width;
          p.type = resolvePetalType();
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        // Draw individual petal
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // 3D tumbling simulation: scale along one axis
        const flipScale = Math.cos(p.flip);
        ctx.scale(Math.abs(flipScale) < 0.1 ? 0.1 : flipScale, 1);

        const w = p.size * 0.65;
        const h = p.size;

        ctx.beginPath();
        // Authentic organic petal curve: tapered base, rounded gentle tip
        ctx.moveTo(0, -h / 2);
        ctx.bezierCurveTo(w * 0.9, -h * 0.35, w * 1.1, h * 0.25, 0, h / 2);
        ctx.bezierCurveTo(-w * 1.1, h * 0.25, -w * 0.9, -h * 0.35, 0, -h / 2);
        ctx.closePath();

        // Shading based on petal type
        const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);

        if (p.type === 'lotus') {
          // Lotus petal: soft pink tip fading to pure porcelain pink-white at base
          grad.addColorStop(0, `rgba(244, 114, 182, ${p.opacity})`); // rose pink tip
          grad.addColorStop(0.35, `rgba(251, 146, 198, ${p.opacity * 0.9})`);
          grad.addColorStop(0.85, `rgba(253, 242, 248, ${p.opacity * 0.85})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${p.opacity * 0.9})`);

          ctx.fillStyle = grad;
          ctx.fill();

          // Delicate vein line down petal center
          ctx.beginPath();
          ctx.moveTo(0, -h * 0.35);
          ctx.lineTo(0, h * 0.28);
          ctx.strokeStyle = `rgba(236, 72, 153, ${p.opacity * 0.25})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        } else if (p.type === 'mai_vang') {
          // Yellow Apricot blossom petal: warm golden center to luminous sunlit yellow
          grad.addColorStop(0, `rgba(245, 158, 11, ${p.opacity * 0.95})`); // warm amber tip
          grad.addColorStop(0.4, `rgba(251, 191, 36, ${p.opacity})`); // golden yellow
          grad.addColorStop(0.85, `rgba(254, 240, 138, ${p.opacity * 0.9})`); // soft pale yellow
          grad.addColorStop(1, `rgba(254, 252, 232, ${p.opacity * 0.95})`);

          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle warm glow border
          ctx.strokeStyle = `rgba(217, 119, 6, ${p.opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          // White Plum petal: serene ivory white with gentle silver-grey ink contour
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * 0.95})`);
          grad.addColorStop(0.5, `rgba(250, 250, 249, ${p.opacity * 0.9})`);
          grad.addColorStop(1, `rgba(231, 229, 228, ${p.opacity * 0.7})`);

          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle gold stamen dust point
          ctx.beginPath();
          ctx.arc(0, h * 0.32, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217, 119, 6, ${p.opacity * 0.6})`;
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [petalType, density, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15 overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
