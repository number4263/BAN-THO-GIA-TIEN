import React from 'react';
import { motion } from 'motion/react';
import { HandPoseType } from '../types.ts';

interface HandPoseGraphicProps {
  pose: HandPoseType;
  claspProgress: number; // 0 to 100
  sticksCount: 1 | 3;
  incenseLit: [boolean, boolean, boolean];
  isBowing: boolean;
  onLightIncense: (index: number) => void;
  showIncense: boolean;
  burnProgress: number; // 0 (full) to 1 (burned down)
  isHolding?: boolean;
}

export const HandPoseGraphic: React.FC<HandPoseGraphicProps> = ({
  pose,
  claspProgress,
  sticksCount,
  incenseLit,
  isBowing,
  onLightIncense,
  showIncense,
  burnProgress,
  isHolding = false,
}) => {
  // Clasp progress moves hands closer: 0 = apart, 100 = joined
  const factor = claspProgress / 100;
  const leftX = (1 - factor) * -120;
  const rightX = (1 - factor) * 120;
  const bowY = isBowing ? 22 : 0;
  const bowRotate = isBowing ? 4 : 0;

  // Render sticks (1 or 3)
  const renderSticks = () => {
    if (!showIncense) return null;

    const stickIndices = sticksCount === 1 ? [1] : [0, 1, 2];
    const stickAngles = sticksCount === 1 ? [0] : [-8, 0, 8];
    const stickOffsetsX = sticksCount === 1 ? [0] : [-16, 0, 16];

    // Current length based on burn progress
    const remainingLength = Math.max(0.15, 1 - burnProgress * 0.85);

    return (
      <div className="absolute -top-52 left-1/2 -translate-x-1/2 z-30 flex items-end justify-center pointer-events-auto">
        {stickIndices.map((stickIdx, i) => {
          const isLit = incenseLit[stickIdx];
          const angle = stickAngles[i];
          const offsetX = stickOffsetsX[i];

          return (
            <div
              key={stickIdx}
              className="relative flex flex-col items-center cursor-pointer group select-none transition-transform duration-300"
              style={{
                transform: `translateX(${offsetX}px) rotate(${angle}deg)`,
                transformOrigin: 'bottom center',
              }}
              onClick={() => !isLit && onLightIncense(stickIdx)}
              title={isLit ? 'Nhang đang cháy tỏa hương' : 'Chạm vào đầu nhang để thắp lửa'}
            >
              {/* Click target indicator when not lit */}
              {!isLit && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="absolute -top-7 z-40 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[11px] font-serif shadow-md whitespace-nowrap"
                >
                  Chạm thắp
                </motion.div>
              )}

              {/* Than đỏ + Ngọn lửa nhỏ li ti (Glowing Red Ember + Tiny Flickering Flame) */}
              {isLit && (
                <div className="relative -mb-[1px] flex flex-col items-center pointer-events-none">
                  {/* Ngọn lửa nhỏ li ti */}
                  <motion.div
                    animate={{
                      scaleY: [1, 1.28, 0.92, 1.2, 1],
                      scaleX: [1, 0.88, 1.12, 0.94, 1],
                      rotate: [-2, 3, -1.5, 2.5, -2],
                      opacity: [0.88, 1, 0.82, 0.96, 0.88],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.85 + i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className="relative -mb-[2px] z-10 flex flex-col items-center"
                  >
                    <div
                      className="w-[3.2px] h-[8px] rounded-t-full rounded-b-xs shadow-[0_0_8px_2px_rgba(245,158,11,0.85),0_0_15px_4px_rgba(239,68,68,0.5)]"
                      style={{
                        background:
                          'linear-gradient(to top, #ea580c 0%, #f59e0b 45%, #fef08a 85%, #ffffff 100%)',
                      }}
                    />
                    <div className="absolute bottom-[1px] w-[1.8px] h-[3.5px] rounded-full bg-white/90" />
                  </motion.div>

                  {/* Than đỏ hồng rực */}
                  <motion.div
                    animate={{
                      scale: [1, 1.12, 0.96, 1.08, 1],
                      boxShadow: [
                        '0 0 4px 1.5px rgba(220, 38, 38, 0.95), 0 0 9px 3px rgba(245, 158, 11, 0.7)',
                        '0 0 6px 2px rgba(239, 68, 68, 1), 0 0 13px 4.5px rgba(251, 191, 36, 0.85)',
                        '0 0 4px 1.5px rgba(220, 38, 38, 0.95), 0 0 8px 2.5px rgba(245, 158, 11, 0.65)',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 1.2 + i * 0.2 }}
                    className="w-[2.4px] h-[2.8px] rounded-t-sm bg-gradient-to-t from-red-600 via-amber-500 to-amber-200"
                  />
                  {/* Glowing ash collar */}
                  <div className="w-[2.2px] h-[0.75px] bg-stone-500/90" />
                </div>
              )}

              {/* Incense Stick Body - Dài ra & Màu đen (Que nhang trầm đen dài thanh thoát) */}
              <div
                className="w-[2.2px] transition-all duration-500 rounded-t-xs relative shadow-xs"
                style={{
                  height: `${235 * remainingLength}px`,
                  background: isLit
                    ? 'linear-gradient(to bottom, #27272a 0%, #18181b 30%, #09090b 100%)'
                    : 'linear-gradient(to bottom, #18181b 0%, #09090b 100%)',
                }}
              >
                {/* Chân nhang ngắn lại & màu xám */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-600" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      animate={{
        y: isBowing ? bowY : isHolding ? [0, -2, 1.5, -1.2, 0] : 0,
        x: isHolding ? [0, 0.8, -0.8, 0.5, 0] : 0,
        rotate: isBowing ? bowRotate : isHolding ? [-0.3, 0.3, -0.2, 0.2, 0] : 0,
      }}
      transition={
        isBowing
          ? { duration: 0.6, ease: 'easeInOut' }
          : isHolding
          ? { repeat: Infinity, duration: 0.85, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
      className="relative w-80 h-72 flex items-center justify-center select-none pointer-events-none"
    >
      {/* Incense sticks held between hands */}
      {renderSticks()}

      {/* POSE 1: HAI BÀN TAY CHẮP VÀO NHAU KẸP CÂY NHANG (ANJALI MUDRA) */}
      {pose === 'pose_anjali' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Left Palm */}
          <motion.div
            style={{ x: leftX }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 -translate-x-full origin-right"
          >
            <svg width="130" height="210" viewBox="0 0 130 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              {/* Sleeve / Cổ tay */}
              <path d="M10 210 C15 170 30 150 55 145 C65 143 75 146 85 145 L85 210 Z" fill="#292524" opacity="0.8" />
              <path d="M50 148 C55 142 65 142 80 144" stroke="#a8a29e" strokeWidth="1.5" />
              
              {/* Hand Palm & Fingers - Warm realistic ink-tinted porcelain skin */}
              <path
                d="M55 145 C50 125 45 95 55 45 C60 22 75 8 85 10 C92 12 95 25 93 45 L95 10 C102 12 105 25 103 50 L107 18 C114 20 115 32 113 60 L115 35 C122 38 122 50 119 75 C116 100 112 125 90 145 Z"
                fill="url(#skinGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              {/* Thumb */}
              <path
                d="M58 135 C50 120 40 100 48 85 C53 78 62 82 66 95 C70 108 72 125 65 138 Z"
                fill="url(#skinGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              {/* Palm crease lines */}
              <path d="M68 105 C75 110 82 120 85 132" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <path d="M78 85 C83 95 88 110 87 125" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              {/* Finger joints */}
              <line x1="72" y1="45" x2="80" y2="46" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />
              <line x1="84" y1="42" x2="92" y2="43" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />
              <line x1="94" y1="50" x2="101" y2="51" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />

              <defs>
                <linearGradient id="skinGradLeft" x1="40" y1="20" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef2e6" />
                  <stop offset="70%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#e0a97c" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Right Palm (Mirrored) */}
          <motion.div
            style={{ x: rightX }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 origin-left"
          >
            <svg width="130" height="210" viewBox="0 0 130 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl scale-x-[-1]">
              <path d="M10 210 C15 170 30 150 55 145 C65 143 75 146 85 145 L85 210 Z" fill="#292524" opacity="0.8" />
              <path d="M50 148 C55 142 65 142 80 144" stroke="#a8a29e" strokeWidth="1.5" />
              
              <path
                d="M55 145 C50 125 45 95 55 45 C60 22 75 8 85 10 C92 12 95 25 93 45 L95 10 C102 12 105 25 103 50 L107 18 C114 20 115 32 113 60 L115 35 C122 38 122 50 119 75 C116 100 112 125 90 145 Z"
                fill="url(#skinGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <path
                d="M58 135 C50 120 40 100 48 85 C53 78 62 82 66 95 C70 108 72 125 65 138 Z"
                fill="url(#skinGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <path d="M68 105 C75 110 82 120 85 132" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <path d="M78 85 C83 95 88 110 87 125" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              <line x1="72" y1="45" x2="80" y2="46" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />
              <line x1="84" y1="42" x2="92" y2="43" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />
              <line x1="94" y1="50" x2="101" y2="51" stroke="#a8a29e" strokeWidth="1" opacity="0.7" />

              <defs>
                <linearGradient id="skinGradRight" x1="40" y1="20" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="70%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#d99966" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      )}

      {/* POSE 2: HAI BÀN TAY NẮM VÀO NHAU VÀ NẮM CÂY NHANG (CHẤP THỦ ÔM QUYỀN) */}
      {pose === 'pose_clasped' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Left Clasped Fist */}
          <motion.div
            style={{ x: leftX * 0.85 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 -translate-x-[92%] z-10"
          >
            <svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              {/* Sleeve */}
              <path d="M10 190 C15 150 25 130 50 120 L80 120 C90 145 95 165 95 190 Z" fill="#292524" opacity="0.8" />
              {/* Curved clasped fingers wrapping around stick */}
              <path
                d="M50 120 C45 95 50 65 70 50 C85 40 105 45 112 60 C120 75 118 95 105 105 C118 108 122 120 115 130 C108 138 95 138 85 135 C80 145 65 142 55 135 Z"
                fill="url(#fistGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              {/* Interlocking knuckle arches */}
              <path d="M72 65 C85 62 100 70 102 82" stroke="#78716c" strokeWidth="1.5" fill="none" />
              <path d="M70 85 C82 82 98 88 100 98" stroke="#78716c" strokeWidth="1.5" fill="none" />
              <path d="M68 105 C78 102 92 105 95 115" stroke="#78716c" strokeWidth="1.5" fill="none" />
              {/* Thumb resting firmly on top */}
              <path
                d="M52 105 C50 85 62 65 78 68 C85 70 88 80 82 90 C75 100 68 112 55 115 Z"
                fill="url(#fistGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="fistGradLeft" x1="40" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef2e6" />
                  <stop offset="70%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#d99966" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Right Clasped Fist wrapping the left hand */}
          <motion.div
            style={{ x: rightX * 0.85 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 -translate-x-[15%] z-20"
          >
            <svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl scale-x-[-1]">
              <path d="M10 190 C15 150 25 130 50 120 L80 120 C90 145 95 165 95 190 Z" fill="#292524" opacity="0.8" />
              <path
                d="M50 120 C45 95 50 65 70 50 C85 40 105 45 112 60 C120 75 118 95 105 105 C118 108 122 120 115 130 C108 138 95 138 85 135 C80 145 65 142 55 135 Z"
                fill="url(#fistGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <path d="M72 65 C85 62 100 70 102 82" stroke="#78716c" strokeWidth="1.5" fill="none" />
              <path d="M70 85 C82 82 98 88 100 98" stroke="#78716c" strokeWidth="1.5" fill="none" />
              <path d="M68 105 C78 102 92 105 95 115" stroke="#78716c" strokeWidth="1.5" fill="none" />
              <path
                d="M52 105 C50 85 62 65 78 68 C85 70 88 80 82 90 C75 100 68 112 55 115 Z"
                fill="url(#fistGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="fistGradRight" x1="40" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="70%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#c28353" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      )}

      {/* POSE 3: HAI BÀN TAY CẦM CÂY NHANG VÀ CHỤM CÁC ĐẦU NGÓN TAY VÀO NHAU (CHỤM ĐẦU NGÓN TAY) */}
      {pose === 'pose_fingertips' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Left Hand with arched delicate fingers */}
          <motion.div
            style={{ x: leftX }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 -translate-x-[98%]"
          >
            <svg width="140" height="200" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              <path d="M15 200 C20 160 35 140 60 135 L88 135 C92 160 98 180 98 200 Z" fill="#292524" opacity="0.8" />
              
              {/* Graceful curved palm */}
              <path
                d="M60 135 C55 110 60 85 75 60 C85 45 105 38 120 40 C128 42 128 50 120 58 C105 68 95 85 98 105 L125 75 C132 80 130 90 118 102 C105 112 98 122 92 135 Z"
                fill="url(#tipGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              {/* Thumb curling to meet opposite thumb */}
              <path
                d="M65 125 C60 105 68 85 85 78 C94 82 95 92 88 104 C82 115 78 125 70 132 Z"
                fill="url(#tipGradLeft)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              {/* Finger delicate contour accents */}
              <path d="M85 62 C95 55 110 50 118 52" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" />
              <path d="M88 80 C98 72 115 70 122 75" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" />
              <circle cx="120" cy="40" r="3.5" fill="#fbcfe8" opacity="0.6" />
              <circle cx="125" cy="75" r="3" fill="#fbcfe8" opacity="0.6" />

              <defs>
                <linearGradient id="tipGradLeft" x1="50" y1="30" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef2e6" />
                  <stop offset="65%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#d99966" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Right Hand with arched delicate fingers meeting at tip */}
          <motion.div
            style={{ x: rightX }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute left-1/2 -translate-x-[2%]"
          >
            <svg width="140" height="200" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl scale-x-[-1]">
              <path d="M15 200 C20 160 35 140 60 135 L88 135 C92 160 98 180 98 200 Z" fill="#292524" opacity="0.8" />
              <path
                d="M60 135 C55 110 60 85 75 60 C85 45 105 38 120 40 C128 42 128 50 120 58 C105 68 95 85 98 105 L125 75 C132 80 130 90 118 102 C105 112 98 122 92 135 Z"
                fill="url(#tipGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <path
                d="M65 125 C60 105 68 85 85 78 C94 82 95 92 88 104 C82 115 78 125 70 132 Z"
                fill="url(#tipGradRight)"
                stroke="#78716c"
                strokeWidth="1.5"
              />
              <path d="M85 62 C95 55 110 50 118 52" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" />
              <path d="M88 80 C98 72 115 70 122 75" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" />
              <circle cx="120" cy="40" r="3.5" fill="#fbcfe8" opacity="0.6" />
              <circle cx="125" cy="75" r="3" fill="#fbcfe8" opacity="0.6" />

              <defs>
                <linearGradient id="tipGradRight" x1="50" y1="30" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="65%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#c28353" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
