import React, { useEffect, useRef, useState } from 'react';
import { SmokeConfig } from '../types.ts';
import { DEFAULT_SMOKE_CONFIG, getSavedSmokeConfig } from './SmokeCustomizerModal.tsx';

interface SmokeNode {
  x: number;
  y: number;
  vy: number;
  width: number;
  alpha: number;
  dist: number; // Vertical distance from tip (khoảng cách tính từ đầu nhang)
  age: number;
  maxAge: number;
  seed: number;
}

interface InkMistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  age: number;
  maxAge: number;
}

interface SmokeCanvasProps {
  tips: { x: number; y: number; lit: boolean }[];
  containerWidth: number;
  containerHeight: number;
  intensity?: number;
  config?: SmokeConfig;
}

export const SmokeCanvas: React.FC<SmokeCanvasProps> = ({
  tips,
  containerWidth,
  containerHeight,
  intensity = 1.0,
  config: externalConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const tipsRef = useRef(tips);
  tipsRef.current = tips;
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  // Internal configuration with live storage event listener
  const [internalConfig, setInternalConfig] = useState<SmokeConfig>(() => {
    return externalConfig || getSavedSmokeConfig();
  });

  useEffect(() => {
    if (externalConfig) {
      setInternalConfig(externalConfig);
    }
  }, [externalConfig]);

  useEffect(() => {
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<SmokeConfig>;
      if (customEvent.detail) {
        setInternalConfig(customEvent.detail);
      }
    };
    window.addEventListener('thapnhang_smoke_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('thapnhang_smoke_config_changed', handleConfigChange);
    };
  }, []);

  const configRef = useRef(internalConfig);
  configRef.current = internalConfig;

  // Strands for each incense tip: tipIndex -> SmokeNode[]
  const strandsRef = useRef<{ [tipIndex: number]: SmokeNode[] }>({});
  // Floating ink mist micro-particles
  const mistParticlesRef = useRef<InkMistParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const cfg = configRef.current || DEFAULT_SMOKE_CONFIG;
      const speedMultiplier = cfg.flowSpeed || 1.0;
      timeRef.current += 0.02 * speedMultiplier;
      const t = timeRef.current;
      const currentTips = tipsRef.current;
      const currentIntensity = (intensityRef.current || 1.0) * (cfg.opacity || 1.0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Process smoke streams for all active incense tips
      currentTips.forEach((tip, tipIdx) => {
        if (!strandsRef.current[tipIdx]) {
          strandsRef.current[tipIdx] = [];
        }

        const nodes = strandsRef.current[tipIdx];

        if (tip.lit) {
          const maxAge = Math.floor(290 / speedMultiplier);
          // Independent upward thermal convection speed for each stick
          const baseVy = (tipIdx === 1 ? -2.25 : tipIdx === 0 ? -2.08 : -2.14) * speedMultiplier;

          // Emit new node right at the tip of the incense stick
          nodes.unshift({
            x: tip.x,
            y: tip.y - 3,
            vy: baseVy - Math.random() * 0.12 * speedMultiplier,
            width: 1.5,
            alpha: 0.85,
            dist: 0,
            age: 0,
            maxAge,
            seed: tipIdx * 3.1415 + Math.random() * 0.4,
          });

          // Floating ink wash micro-mist particle (bụi sương khói li ti mờ ảo)
          if (Math.random() < 0.22) {
            mistParticlesRef.current.push({
              x: tip.x + (Math.random() - 0.5) * 4,
              y: tip.y - 12 - Math.random() * 8,
              vx: (tipIdx === 0 ? -0.18 : tipIdx === 2 ? 0.18 : 0) + (Math.random() - 0.5) * 0.25,
              vy: baseVy * 0.65 - Math.random() * 0.25,
              radius: 1.2 + Math.random() * 2.0,
              alpha: 0.32 * (cfg.opacity || 1.0),
              age: 0,
              maxAge: 120 + Math.random() * 60,
            });
          }
        }

        // =====================================================================
        // NODE PHYSICS: Independent 3-stream corridor, waviness & distance opacity
        // Guarantee: 3 streams never coalesce or cross ("không bị chụm dính")
        // =====================================================================
        const survivingNodes: SmokeNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.age++;
          const progress = node.age / node.maxAge;
          const dist = Math.max(0, tip.y - node.y);
          node.dist = dist;

          if (progress >= 1 || node.y < -70) continue;

          // 1. WIDTH GRADIENT: Slender near tip, expands softly like gentle incense smoke
          if (dist < 35) {
            node.width = 1.5 + (dist / 35) * 0.6; // 1.5px -> 2.1px
          } else if (dist < 140) {
            const tMid = (dist - 35) / 105;
            node.width = 2.1 + tMid * 2.8; // 2.1px -> 4.9px
          } else {
            const tHigh = Math.min(1, (dist - 140) / 240);
            node.width = 4.9 + tHigh * (cfg.preset === 'tram_huong' ? 8.5 : 6.2); // Expands up to ~11px
          }

          // 2. DISTANCE-BASED OPACITY: Translucent white ethereal smoke
          const falloff = cfg.inkGradation || 1.0;
          let calculatedAlpha = 0.85;

          if (dist < 16) {
            calculatedAlpha = 0.42 + (dist / 16) * 0.46; // 0.42 -> 0.88
          } else if (dist < 60) {
            calculatedAlpha = 0.90;
          } else if (dist < 180) {
            const tMid = (dist - 60) / 120;
            const easeMid = Math.sin((tMid * Math.PI) / 2);
            calculatedAlpha = 0.90 - easeMid * 0.46 * falloff; // 0.90 -> ~0.44
          } else {
            const tFar = Math.min(1, (dist - 180) / 230);
            const remaining = Math.max(0, 1 - tFar);
            calculatedAlpha = 0.44 * Math.pow(remaining, 1.35);
          }

          node.alpha = Math.max(0, Math.min(1, calculatedAlpha));

          // 3. THREE DISTINCT INDEPENDENT SWAYING CORRIDORS:
          // Mỗi ngọn nhang có kênh dao động độc lập, uốn lượn êm đềm với nhịp riêng
          if (dist > 25) {
            const wavinessFactor = Math.min(1, (dist - 25) / 80) * (cfg.waviness || 1.0);

            // Base spatial corridor:
            // Tip 0 (left): arches gracefully out to the left
            // Tip 1 (center): rises upright along central axis
            // Tip 2 (right): arches gracefully out to the right
            let corridorOffset = 0;
            let primaryWave = 0;
            let secondaryRipple = 0;

            if (tipIdx === 0) {
              // Left stream: gentle left drift corridor + independent frequency
              corridorOffset = -(dist / containerHeight) * 44;
              primaryWave = Math.sin(node.y * 0.0062 + t * 0.74 + 0.4) * (4.5 + (dist / 140) * 3.8);
              secondaryRipple = Math.cos(node.y * 0.015 - t * 0.92 + 1.2) * (1.2 + (dist / 220) * 1.2);
            } else if (tipIdx === 1) {
              // Center stream: serene upright rise + independent counter-phase
              corridorOffset = 0;
              primaryWave = Math.sin(node.y * 0.0051 - t * 0.95 + 2.7) * (3.6 + (dist / 150) * 3.2);
              secondaryRipple = Math.cos(node.y * 0.012 + t * 0.82 + 0.7) * (1.1 + (dist / 240) * 1.0);
            } else {
              // Right stream: gentle right drift corridor + independent frequency
              corridorOffset = (dist / containerHeight) * 44;
              primaryWave = Math.sin(node.y * 0.0058 + t * 0.70 + 4.9) * (4.5 + (dist / 140) * 3.8);
              secondaryRipple = Math.cos(node.y * 0.014 - t * 0.88 + 3.1) * (1.2 + (dist / 220) * 1.2);
            }

            const targetX = tip.x + corridorOffset + (primaryWave + secondaryRipple) * wavinessFactor;
            // Smoothly ease toward target corridor position to prevent accumulating noise
            node.x += (targetX - node.x) * 0.16;
          }

          node.y += node.vy;
          survivingNodes.push(node);
        }

        // =====================================================================
        // ANTI-COALESCENCE ENFORCEMENT:
        // Guarantee that the 3 streams maintain distinct separation and never clump
        // =====================================================================
        if (tipIdx === 0 && currentTips[1]?.lit && strandsRef.current[1]) {
          const centerNodes = strandsRef.current[1];
          for (let i = 0; i < survivingNodes.length; i++) {
            const leftNode = survivingNodes[i];
            const centerNode = centerNodes.find((cn) => Math.abs(cn.y - leftNode.y) < 6);
            if (centerNode) {
              const minGap = 16 + Math.min(26, (leftNode.dist / 120) * 12);
              if (leftNode.x > centerNode.x - minGap) {
                leftNode.x = centerNode.x - minGap;
              }
            }
          }
        } else if (tipIdx === 2 && currentTips[1]?.lit && strandsRef.current[1]) {
          const centerNodes = strandsRef.current[1];
          for (let i = 0; i < survivingNodes.length; i++) {
            const rightNode = survivingNodes[i];
            const centerNode = centerNodes.find((cn) => Math.abs(cn.y - rightNode.y) < 6);
            if (centerNode) {
              const minGap = 16 + Math.min(26, (rightNode.dist / 120) * 12);
              if (rightNode.x < centerNode.x + minGap) {
                rightNode.x = centerNode.x + minGap;
              }
            }
          }
        }

        strandsRef.current[tipIdx] = survivingNodes;

        // =====================================================================
        // RENDER: Multi-pass Ethereal White Incense Smoke ("Khói Trắng Mờ Thanh Thoát")
        // =====================================================================
        if (survivingNodes.length > 2) {
          ctx.save();
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';

          // Color palette: Ethereal translucent pearl white
          const cr = 255;
          const cg = 253;
          const cb = 250;

          // -------------------------------------------------------------------
          // PASS 1: Outer Ink Wash Bloom ("Vựng Mặc" - Lớp sương mờ loang rộng)
          // -------------------------------------------------------------------
          for (let i = 0; i < survivingNodes.length - 1; i += 2) {
            const p0 = survivingNodes[i];
            const p1 = survivingNodes[Math.min(i + 1, survivingNodes.length - 1)];
            const p2 = survivingNodes[Math.min(i + 2, survivingNodes.length - 1)];

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const avgAlpha = (p0.alpha + p1.alpha + p2.alpha) / 3;
            const avgWidth = (p0.width + p1.width) / 2;

            if (avgAlpha > 0.01) {
              const grad = ctx.createLinearGradient(p0.x, p0.y, midX, midY);
              const a0 = p0.alpha * 0.24 * currentIntensity;
              const aMid = avgAlpha * 0.24 * currentIntensity;
              grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a0})`);
              grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, ${aMid})`);

              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
              ctx.strokeStyle = grad;
              ctx.lineWidth = avgWidth * 2.6;
              ctx.stroke();
            }
          }

          // -------------------------------------------------------------------
          // PASS 2: Main Translucent Ribbon ("Nùng Mặc" - Dải khói mực chủ đạo)
          // -------------------------------------------------------------------
          for (let i = 0; i < survivingNodes.length - 1; i += 2) {
            const p0 = survivingNodes[i];
            const p1 = survivingNodes[Math.min(i + 1, survivingNodes.length - 1)];
            const p2 = survivingNodes[Math.min(i + 2, survivingNodes.length - 1)];

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const avgAlpha = (p0.alpha + p1.alpha + p2.alpha) / 3;
            const avgWidth = (p0.width + p1.width) / 2;

            if (avgAlpha > 0.01) {
              const grad = ctx.createLinearGradient(p0.x, p0.y, midX, midY);
              const a0 = p0.alpha * 0.72 * currentIntensity;
              const aMid = avgAlpha * 0.72 * currentIntensity;
              grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a0})`);
              grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, ${aMid})`);

              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
              ctx.strokeStyle = grad;
              ctx.lineWidth = avgWidth * 1.15;
              ctx.stroke();
            }
          }

          // -------------------------------------------------------------------
          // PASS 3: Inner Delicate Spine ("Tiêu Mặc" - Sợi chỉ tơ thanh mảnh ở gốc)
          // Tồn tại chủ yếu ở vùng cự ly gần và giữa (dist < 160px) rồi tan mờ
          // -------------------------------------------------------------------
          for (let i = 0; i < survivingNodes.length - 1; i += 2) {
            const p0 = survivingNodes[i];
            const p1 = survivingNodes[Math.min(i + 1, survivingNodes.length - 1)];
            const p2 = survivingNodes[Math.min(i + 2, survivingNodes.length - 1)];

            if (p0.dist < 170) {
              const spineFade = Math.max(0, 1 - p0.dist / 170);
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const avgAlpha = ((p0.alpha + p1.alpha + p2.alpha) / 3) * spineFade;
              const avgWidth = (p0.width + p1.width) / 2;

              if (avgAlpha > 0.02) {
                const grad = ctx.createLinearGradient(p0.x, p0.y, midX, midY);
                const a0 = p0.alpha * 0.88 * currentIntensity * spineFade;
                const aMid = avgAlpha * 0.88 * currentIntensity;
                grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a0})`);
                grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, ${aMid})`);

                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = Math.max(0.9, avgWidth * 0.42);
                ctx.stroke();
              }
            }
          }

          ctx.restore();
        }
      });

      // =======================================================================
      // FLOATING INK MIST PARTICLES (Bụi sương khói li ti mờ ảo bốc lên nhẹ nhàng)
      // =======================================================================
      const survivingMist: InkMistParticle[] = [];
      const cr = 252;
      const cg = 250;
      const cb = 246;

      ctx.save();
      for (let i = 0; i < mistParticlesRef.current.length; i++) {
        const p = mistParticlesRef.current[i];
        p.age++;
        const prog = p.age / p.maxAge;
        if (prog >= 1 || p.y < -30) continue;

        p.x += p.vx + Math.sin(t * 1.1 + p.y * 0.01) * 0.12;
        p.y += p.vy;

        // Alpha envelope
        let pAlpha = p.alpha;
        if (prog < 0.2) {
          pAlpha = (prog / 0.2) * p.alpha;
        } else if (prog > 0.6) {
          pAlpha = (1 - (prog - 0.6) / 0.4) * p.alpha;
        }

        if (pAlpha > 0.01) {
          const currentRadius = p.radius * (1 + prog * 1.5);
          const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
          radGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${pAlpha * currentIntensity})`);
          radGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        survivingMist.push(p);
      }
      ctx.restore();
      mistParticlesRef.current = survivingMist;

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
