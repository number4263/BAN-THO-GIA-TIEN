import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Check, FastForward, Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { HandPoseType, RitualState } from '../types.ts';
import { HandPoseGraphic } from './HandPrayerView.tsx';
import { SmokeCanvas } from './SmokeCanvas.tsx';
import {
  playBellSound,
  playWoodenFish,
  playSoftWoodenFish,
  triggerHapticPrayer,
  playIgniteSound,
  playChime,
} from '../utils/audio.ts';

interface RitualOverlayProps {
  ritualState: RitualState;
  setRitualState: React.Dispatch<React.SetStateAction<RitualState>>;
  onCompleteRitual: () => void;
  onCancelRitual: () => void;
  prayerText: string;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const RitualOverlay: React.FC<RitualOverlayProps> = ({
  ritualState,
  setRitualState,
  onCompleteRitual,
  onCancelRitual,
  prayerText,
  isMuted,
  onToggleSound,
}) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const claspTimerRef = useRef<number | null>(null);
  const burnTimerRef = useRef<number | null>(null);
  const woodenFishIntervalRef = useRef<number | null>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Dual-Thumb Holding
  const { thumbsTouching, claspProgress, step, incenseLit, sticksCount, durationMinutes, burnProgress, isFastForward, selectedPose, isBowing } =
    ritualState;

  const bothTouching = thumbsTouching.left && thumbsTouching.right;
  const isHoldingPrayer = bothTouching || thumbsTouching.left || thumbsTouching.right;

  // Intermittent soft wooden fish & haptic pulses while holding praying hands
  useEffect(() => {
    if (isHoldingPrayer) {
      // First stroke immediately on contact
      playSoftWoodenFish();
      triggerHapticPrayer();

      // Intermittent strokes alternating at serene temple tempo (~850ms)
      woodenFishIntervalRef.current = window.setInterval(() => {
        playSoftWoodenFish();
        triggerHapticPrayer();
      }, 850);
    } else {
      if (woodenFishIntervalRef.current) {
        clearInterval(woodenFishIntervalRef.current);
        woodenFishIntervalRef.current = null;
      }
    }

    return () => {
      if (woodenFishIntervalRef.current) {
        clearInterval(woodenFishIntervalRef.current);
        woodenFishIntervalRef.current = null;
      }
    };
  }, [isHoldingPrayer]);

  useEffect(() => {
    if (step !== 'hands_ready' && step !== 'holding_thumbs') return;

    if (bothTouching) {
      setRitualState((prev) => ({ ...prev, step: 'holding_thumbs' }));

      claspTimerRef.current = window.setInterval(() => {
        setRitualState((prev) => {
          const next = Math.min(100, prev.claspProgress + 4);
          if (next >= 100) {
            if (claspTimerRef.current) clearInterval(claspTimerRef.current);
            playWoodenFish();
            playChime();
            // Trigger respectful bow
            return {
              ...prev,
              claspProgress: 100,
              step: 'incense_appeared',
              isBowing: true,
            };
          }
          return { ...prev, claspProgress: next };
        });
      }, 45);
    } else {
      if (claspTimerRef.current) clearInterval(claspTimerRef.current);
      if (claspProgress < 100) {
        setRitualState((prev) => ({
          ...prev,
          step: 'hands_ready',
          claspProgress: Math.max(0, prev.claspProgress - 5),
        }));
      }
    }

    return () => {
      if (claspTimerRef.current) clearInterval(claspTimerRef.current);
    };
  }, [bothTouching, step, claspProgress, setRitualState]);

  // Reset bowing after brief gesture
  useEffect(() => {
    if (isBowing) {
      const timer = setTimeout(() => {
        setRitualState((prev) => ({ ...prev, isBowing: false }));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isBowing, setRitualState]);

  // Handle burning progress timer
  useEffect(() => {
    const allLit = sticksCount === 1 ? incenseLit[1] : incenseLit[0] && incenseLit[1] && incenseLit[2];

    if (step === 'burning' && allLit) {
      const totalSeconds = durationMinutes * 60;
      // In fast forward mode, burn in 15 seconds; normal mode takes full time
      const speedMultiplier = isFastForward ? totalSeconds / 15 : 1;

      burnTimerRef.current = window.setInterval(() => {
        setRitualState((prev) => {
          const increment = (1 / totalSeconds) * (speedMultiplier * 0.1);
          const nextProgress = Math.min(1, prev.burnProgress + increment);

          if (nextProgress >= 1) {
            if (burnTimerRef.current) clearInterval(burnTimerRef.current);
            playBellSound();
            onCompleteRitual();
          }
          return { ...prev, burnProgress: nextProgress };
        });
      }, 100);
    }

    return () => {
      if (burnTimerRef.current) clearInterval(burnTimerRef.current);
    };
  }, [step, incenseLit, sticksCount, durationMinutes, isFastForward, setRitualState, onCompleteRitual]);

  // Light stick handler
  const handleLightStick = (idx: number) => {
    playIgniteSound();
    playChime();
    setRitualState((prev) => {
      const updatedLit = [...prev.incenseLit] as [boolean, boolean, boolean];
      updatedLit[idx] = true;
      const allLit =
        prev.sticksCount === 1 ? updatedLit[1] : updatedLit[0] && updatedLit[1] && updatedLit[2];

      return {
        ...prev,
        incenseLit: updatedLit,
        step: allLit ? 'burning' : 'lighting',
      };
    });
  };

  const lightAllSticks = () => {
    playIgniteSound();
    playBellSound();
    setRitualState((prev) => ({
      ...prev,
      incenseLit: [true, true, true],
      step: 'burning',
    }));
  };

  // Helper touch handlers for left/right thumbs
  const setThumb = (side: 'left' | 'right', touching: boolean) => {
    setRitualState((prev) => ({
      ...prev,
      thumbsTouching: { ...prev.thumbsTouching, [side]: touching },
    }));
  };

  // Coordinates for Smoke Canvas
  const centerX = windowSize.width / 2;
  const centerY = windowSize.height / 2 + 30;
  // Calculate tips relative to hand center and burn progress
  const stickBurnRatio = Math.max(0.15, 1 - burnProgress * 0.85);
  const tipBaseY = centerY - 210 + (1 - stickBurnRatio) * 170;

  const stickIndices = sticksCount === 1 ? [1] : [0, 1, 2];
  const stickOffsetsX = sticksCount === 1 ? [0] : [-16, 0, 16];

  const smokeTips = stickIndices.map((stickIdx, i) => ({
    x: centerX + stickOffsetsX[i],
    y: tipBaseY,
    lit: incenseLit[stickIdx],
  }));

  const allLit = sticksCount === 1 ? incenseLit[1] : incenseLit[0] && incenseLit[1] && incenseLit[2];

  // Calculate remaining time display
  const totalSeconds = durationMinutes * 60;
  const remainingSecs = Math.max(0, Math.floor(totalSeconds * (1 - burnProgress)));
  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;

  return (
    <motion.div
      animate={
        isHoldingPrayer
          ? {
              x: [0, -1.5, 1.8, -1.2, 1.5, -1.8, 1.2, -0.8, 0],
              y: [0, 1.8, -1.5, 2.0, -1.2, 1.5, -1.8, 1.0, 0],
              scale: [1, 1.002, 0.999, 1.002, 1],
            }
          : { x: 0, y: 0, scale: 1 }
      }
      transition={
        isHoldingPrayer
          ? {
              repeat: Infinity,
              duration: 0.85,
              ease: 'linear',
            }
          : { duration: 0.25 }
      }
      className={`fixed inset-0 z-40 flex flex-col items-center justify-between select-none overflow-hidden bg-stone-950/40 backdrop-blur-[2px] transition-shadow duration-500 ${
        isHoldingPrayer ? 'shadow-[inset_0_0_90px_rgba(245,158,11,0.22)]' : ''
      }`}
    >
      {/* Sacred prayer aura when holding clasp */}
      {isHoldingPrayer && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-radial from-amber-500/10 via-amber-700/5 to-transparent animate-pulse" />
      )}

      {/* Smoke particle canvas */}
      <SmokeCanvas
        tips={smokeTips}
        containerWidth={windowSize.width}
        containerHeight={windowSize.height}
        intensity={allLit ? 1.4 : 0.8}
      />

      {/* Top Floating Prayer Text */}
      <div className="pt-8 px-4 text-center z-30 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-5 py-2 rounded-full bg-stone-900/80 border border-amber-700/60 shadow-xl"
        >
          <p className="font-serif text-amber-200 text-sm sm:text-base font-medium">
            {(prayerText || 'Cầu cho hòa bình & quốc thái dân an').normalize('NFC')}
          </p>
        </motion.div>

        {/* Top Controls: Sound, Close, Pose indicator */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onCancelRitual}
            className="px-3 py-1 rounded-full bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-white text-xs transition-colors"
          >
            Dừng nghi lễ
          </button>
        </div>
      </div>

      {/* Center Ritual Graphic Area */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center z-30">
        {/* Step instruction banner */}
        <div className="mb-4 text-center px-4">
          <AnimatePresence mode="wait">
            {step === 'hands_ready' && (
              <motion.div
                key="step_ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-stone-900/90 border border-amber-600/70 px-4 py-2 rounded-xl shadow-lg"
              >
                <p className="font-serif text-sm font-semibold text-amber-300">
                  Bước 3 & 4: Đặt và giữ 2 ngón tay cái vào 2 vùng cảm ứng
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Giữ đều 2 ngón cái để hai bàn tay từ từ chắp lại thành kính
                </p>
              </motion.div>
            )}

            {step === 'holding_thumbs' && (
              <motion.div
                key="step_holding"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-stone-900/90 border border-amber-500 px-5 py-2 rounded-xl shadow-lg flex flex-col items-center"
              >
                <p className="font-serif text-sm font-bold text-amber-400 animate-pulse">
                  Đang chắp tay khấn vái... {claspProgress}%
                </p>
                <div className="w-48 h-1.5 bg-stone-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-75"
                    style={{ width: `${claspProgress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {(step === 'incense_appeared' || step === 'lighting') && (
              <motion.div
                key="step_lighting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-stone-900/95 border border-amber-500 px-5 py-2.5 rounded-xl shadow-xl flex flex-col items-center gap-1.5"
              >
                <p className="font-serif text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                  Chạm vào đầu cây nhang để thắp lửa
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={lightAllSticks}
                    className="px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Thắp sáng tất cả
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'burning' && (
              <motion.div
                key="step_burning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/90 border border-amber-700/60 px-5 py-2 rounded-xl shadow-lg flex items-center gap-4"
              >
                <div className="text-left">
                  <p className="text-[11px] text-stone-400">Thời gian đốt còn lại</p>
                  <p className="font-mono text-base font-bold text-amber-300">
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-l border-stone-700 pl-3">
                  <button
                    onClick={() => setRitualState((p) => ({ ...p, isFastForward: !p.isFastForward }))}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isFastForward
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:text-white'
                    }`}
                    title="Tăng tốc độ đốt nhang"
                  >
                    <FastForward className="w-3.5 h-3.5" /> {isFastForward ? 'Tua nhanh: Bật' : 'Tua nhanh'}
                  </button>

                  <button
                    onClick={() => {
                      playBellSound();
                      onCompleteRitual();
                    }}
                    className="px-3 py-1 rounded bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-serif font-semibold shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Hoàn thành
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Prayer Feedback Badge */}
          {isHoldingPrayer && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md text-amber-200 text-xs font-serif shadow-lg"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Đang chắp tay khấn vái • Tiếng mõ thanh tịnh nhịp nhàng</span>
            </motion.div>
          )}
        </div>

        {/* The 3 Realistic Hand Postures Graphics */}
        <HandPoseGraphic
          pose={selectedPose}
          claspProgress={claspProgress}
          sticksCount={sticksCount}
          incenseLit={incenseLit}
          isBowing={isBowing}
          onLightIncense={handleLightStick}
          showIncense={claspProgress >= 85}
          burnProgress={burnProgress}
          isHolding={isHoldingPrayer}
        />
      </div>

      {/* Bottom Interactive Dual-Thumb Touch Areas (Ngón cái Trái & Ngón cái Phải) */}
      <div className="w-full max-w-lg px-6 pb-6 pt-2 flex items-center justify-between z-30">
        {/* Left Thumb Touch Zone */}
        <div className="flex flex-col items-center">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              setThumb('left', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setThumb('left', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              setThumb('left', false);
            }}
            onMouseDown={() => setThumb('left', true)}
            onMouseUp={() => setThumb('left', false)}
            onMouseLeave={() => setThumb('left', false)}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none touch-none shadow-2xl ${
              thumbsTouching.left
                ? 'border-amber-400 bg-amber-500/30 ring-4 ring-amber-500/40 scale-95'
                : 'border-amber-600/70 bg-stone-900/80 hover:border-amber-400'
            }`}
          >
            {/* Thumbprint icon */}
            <svg
              viewBox="0 0 24 24"
              className={`w-10 h-10 transition-colors ${
                thumbsTouching.left ? 'text-amber-300' : 'text-stone-400'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10" />
              <path d="M12 6a6 6 0 0 0-6 6c0 3.314 2.686 6 6 6s6-2.686 6-6" />
              <path d="M12 10a2 2 0 0 0-2 2c0 1.105.895 2 2 2s2-.895 2-2" />
            </svg>
            <span className="text-[10px] font-serif font-bold text-amber-200 mt-1 uppercase tracking-wider">
              Ngón Cái Trái
            </span>
          </button>
          <span className="text-[10px] text-stone-400 mt-1">Ấn & Giữ</span>
        </div>

        {/* Center Quick Mode / Touch All toggle for PC / Convenience */}
        <div className="flex flex-col items-center">
          <button
            onMouseDown={() => {
              setThumb('left', true);
              setThumb('right', true);
            }}
            onMouseUp={() => {
              setThumb('left', false);
              setThumb('right', false);
            }}
            onTouchStart={() => {
              setThumb('left', true);
              setThumb('right', true);
            }}
            onTouchEnd={() => {
              setThumb('left', false);
              setThumb('right', false);
            }}
            className={`px-4 py-2 rounded-full border text-xs font-serif shadow-lg transition-all cursor-pointer select-none touch-none ${
              bothTouching
                ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400/50 scale-95'
                : 'bg-stone-800/90 hover:bg-stone-700 border-stone-600 text-stone-200'
            }`}
          >
            {bothTouching ? '🙏 Đang giữ khấn vái' : 'Giữ cả 2 ngón (PC / 1 Chạm)'}
          </button>
          <span className="text-[10px] text-stone-400 mt-1 text-center">
            {isHoldingPrayer
              ? 'Rung nhẹ & Gõ mõ nhịp nhàng'
              : claspProgress >= 100
              ? '✓ Đã chắp tay (Giữ để tiếp tục khấn)'
              : 'Giữ 2 ngón cùng lúc'}
          </span>
        </div>

        {/* Right Thumb Touch Zone */}
        <div className="flex flex-col items-center">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              setThumb('right', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setThumb('right', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              setThumb('right', false);
            }}
            onMouseDown={() => setThumb('right', true)}
            onMouseUp={() => setThumb('right', false)}
            onMouseLeave={() => setThumb('right', false)}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none touch-none shadow-2xl ${
              thumbsTouching.right
                ? 'border-amber-400 bg-amber-500/30 ring-4 ring-amber-500/40 scale-95'
                : 'border-amber-600/70 bg-stone-900/80 hover:border-amber-400'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-10 h-10 transition-colors ${
                thumbsTouching.right ? 'text-amber-300' : 'text-stone-400'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10" />
              <path d="M12 6a6 6 0 0 0-6 6c0 3.314 2.686 6 6 6s6-2.686 6-6" />
              <path d="M12 10a2 2 0 0 0-2 2c0 1.105.895 2 2 2s2-.895 2-2" />
            </svg>
            <span className="text-[10px] font-serif font-bold text-amber-200 mt-1 uppercase tracking-wider">
              Ngón Cái Phải
            </span>
          </button>
          <span className="text-[10px] text-stone-400 mt-1">Ấn & Giữ</span>
        </div>
      </div>
    </motion.div>
  );
};
