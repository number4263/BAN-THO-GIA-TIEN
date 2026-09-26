import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ancestor } from '../types.ts';
import { Sparkles } from 'lucide-react';
import { playIgniteSound, playChime } from '../utils/audio.ts';
import defaultAncestorImg from '../assets/images/ancestor_grandfather_1790016792874.jpg';

// 1. Bronze Burner Component matching user's uploaded "luhuong.jpg"
// Realistic antique dark cast bronze tripod censer, authentic ash bed, ambient lighting,
// slender incense sticks, glowing red embers (than đỏ), and tiny flickering flames (ngọn lửa nhỏ).
export const BronzeBurner: React.FC<{
  sticksCount: 1 | 3;
  isBurning: boolean;
  incenseLit: [boolean, boolean, boolean];
  burnProgress: number;
  onLightStick?: (index: number) => void;
  showBurnerSticks?: boolean;
}> = ({
  sticksCount,
  isBurning: _isBurning,
  incenseLit,
  burnProgress,
  onLightStick,
  showBurnerSticks,
}) => {
  const [ignitingIdx, setIgnitingIdx] = useState<number | null>(null);

  const stickIndices = sticksCount === 1 ? [1] : [0, 1, 2];
  const stickAngles = sticksCount === 1 ? [0] : [-7, 0, 7];
  const stickOffsetsX = sticksCount === 1 ? [0] : [-15, 0, 15];
  const remainingLength = Math.max(0.12, 1 - burnProgress * 0.88);

  const handleTouchTip = (e: React.MouseEvent | React.TouchEvent, stickIdx: number) => {
    e.stopPropagation();
    if (!incenseLit[stickIdx] && onLightStick) {
      setIgnitingIdx(stickIdx);
      playIgniteSound();
      playChime();
      onLightStick(stickIdx);
      setTimeout(() => setIgnitingIdx(null), 800);
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* ============================================================= */}
      {/* AMBIENT LIGHTING (Ánh sáng môi trường linh thiêng)            */}
      {/* ============================================================= */}
      {/* Soft warm temple halo radiating behind the incense and censer */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-80 h-72 rounded-full bg-radial from-amber-500/18 via-amber-600/7 to-transparent blur-2xl pointer-events-none z-0" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-radial from-orange-400/12 via-transparent to-transparent blur-xl pointer-events-none z-0" />

      {/* Realistic contact shadow beneath the 3 tripod legs on the tabletop */}
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-44 h-6 rounded-[100%] bg-stone-950/50 blur-md pointer-events-none z-5" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-3.5 rounded-[100%] bg-stone-950/70 blur-xs pointer-events-none z-5" />

      {/* ------------------------------------------------------------- */}
      {/* LAYER 1 (z-5): Back rim and interior incense ash cavity      */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-5 pointer-events-none">
        <svg width="200" height="130" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Dark antique bronze for inner cavity */}
            <linearGradient id="innerCavityGrad" x1="100" y1="20" x2="100" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#141110" />
              <stop offset="100%" stopColor="#28221f" />
            </linearGradient>
            {/* Realistic fine gray incense ash with gentle central mound */}
            <radialGradient id="ashGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#9e948c" />
              <stop offset="45%" stopColor="#756b63" />
              <stop offset="85%" stopColor="#4c433c" />
              <stop offset="100%" stopColor="#2a2420" />
            </radialGradient>
            {/* Back rim highlight */}
            <linearGradient id="backRimGrad" x1="40" y1="22" x2="160" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2a231f" />
              <stop offset="50%" stopColor="#544841" />
              <stop offset="100%" stopColor="#2a231f" />
            </linearGradient>
          </defs>

          {/* Back rim curve */}
          <path d="M42 28 C42 19, 158 19, 158 28" stroke="url(#backRimGrad)" strokeWidth="4" fill="none" />

          {/* Inner dark ash bed */}
          <ellipse cx="100" cy="28" rx="56" ry="12" fill="url(#innerCavityGrad)" />
          <ellipse cx="100" cy="28.5" rx="52" ry="10" fill="url(#ashGrad)" />
          {/* Subtle ash texture specks */}
          <ellipse cx="100" cy="28" rx="42" ry="7" fill="#b0a79f" opacity="0.18" />
        </svg>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LAYER 2 (z-15): 3 Incense Sticks planted DOWN INTO the ash   */}
      {/* Featuring THAN ĐỎ (Red Ember) + NGỌN LỬA NHỎ (Tiny Flame)    */}
      {/* ------------------------------------------------------------- */}
      {showBurnerSticks && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-15 flex items-end justify-center pointer-events-auto"
          style={{
            top: '29px', // Exactly at the ash bed level inside the burner mouth
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          {stickIndices.map((stickIdx, i) => {
            const isLit = incenseLit[stickIdx];
            const angle = stickAngles[i];
            const offsetX = stickOffsetsX[i];
            const isIgniting = ignitingIdx === stickIdx;

            return (
              <div
                key={stickIdx}
                className="relative flex flex-col items-center select-none"
                style={{
                  transform: `translateX(${offsetX}px) rotate(${angle}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Touch / Click target at the tip (clean, elegant, no intrusive tags) */}
                <div
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-9 h-11 rounded-full cursor-pointer z-50 flex items-center justify-center touch-manipulation group"
                  onClick={(e) => handleTouchTip(e, stickIdx)}
                  onTouchEnd={(e) => handleTouchTip(e, stickIdx)}
                  title={isLit ? 'Nén nhang đang tỏa khói thơm' : 'Chạm ngón tay để thắp nhang'}
                >
                  {/* Subtle, reverent shimmer cue when unlit (quiet, not noisy app-demo UI) */}
                  {!isLit && (
                    <motion.div
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-1 h-1 rounded-full bg-amber-300/80" />
                    </motion.div>
                  )}

                  {/* Spark ignition burst when touched */}
                  <AnimatePresence>
                    {isIgniting && (
                      <motion.div
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ========================================================== */}
                {/* THAN ĐỎ + NGỌN LỬA NHỎ LI TI (EMBER + TINY DELICATE FLAME) */}
                {/* ========================================================== */}
                {isLit && (
                  <div className="relative -mb-[1px] flex flex-col items-center pointer-events-none">
                    {/* 1. NGỌN LỬA NHỎ (Delicate Tiny Flickering Flame) */}
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
                      {/* Tiny teardrop flame body */}
                      <div
                        className="w-[3.2px] h-[8px] rounded-t-full rounded-b-xs shadow-[0_0_8px_2px_rgba(245,158,11,0.85),0_0_15px_4px_rgba(239,68,68,0.5)]"
                        style={{
                          background:
                            'linear-gradient(to top, #ea580c 0%, #f59e0b 45%, #fef08a 85%, #ffffff 100%)',
                        }}
                      />
                      {/* White-hot inner core */}
                      <div className="absolute bottom-[1px] w-[1.8px] h-[3.5px] rounded-full bg-white/90" />
                    </motion.div>

                    {/* 2. THAN ĐỎ (Glowing Incandescent Red Ember Coal) */}
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

                    {/* 3. Vành tro xám mịn (Thin Fine Ash Collar) */}
                    <div className="w-[2.2px] h-[0.75px] bg-stone-500/90" />
                  </div>
                )}

                {/* Slender Stick Body - Dài ra & Màu đen (Que nhang trầm đen thanh thoát) */}
                <div
                  className="w-[2.2px] transition-all duration-500 rounded-t-xs relative shadow-2xs"
                  style={{
                    height: `${210 * remainingLength}px`,
                    background: isLit
                      ? 'linear-gradient(to bottom, #27272a 0%, #18181b 35%, #09090b 100%)'
                      : 'linear-gradient(to bottom, #18181b 0%, #09090b 100%)',
                  }}
                >
                  {/* Chân nhang ngắn lại & màu xám (Chân tăm tre xám nhã nhặn) */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.6px] h-3.5 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-600 shadow-2xs" />
                </div>

                {/* Submerged stem extension: chân cắm vào lòng tro censer màu xám */}
                <div className="w-[1.6px] h-2.5 bg-stone-600/90" />
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYER 3 (z-20): Front rim, cauldron belly, ears, and 3 legs   */}
      {/* Meticulously crafted after the uploaded "luhuong.jpg"          */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-20 pointer-events-none">
        <svg
          width="200"
          height="130"
          viewBox="0 0 200 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <defs>
            {/* Antique dark bronze patina with deep charcoal-bronze core */}
            <linearGradient id="censerBronzeBelly" x1="100" y1="28" x2="100" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#352c26" />
              <stop offset="25%" stopColor="#4d3f37" />
              <stop offset="55%" stopColor="#352c26" />
              <stop offset="85%" stopColor="#201a17" />
              <stop offset="100%" stopColor="#110d0c" />
            </linearGradient>

            {/* Specular metallic sheen band across upper belly matching luhuong.jpg */}
            <linearGradient id="bellySheen" x1="45" y1="52" x2="155" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#352c26" stopOpacity="0" />
              <stop offset="35%" stopColor="#87756a" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#b5a498" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#87756a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#352c26" stopOpacity="0" />
            </linearGradient>

            {/* Front Lip / Rim Gradient */}
            <linearGradient id="frontLipGrad" x1="40" y1="28" x2="160" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#241e1a" />
              <stop offset="20%" stopColor="#473a32" />
              <stop offset="50%" stopColor="#736054" />
              <stop offset="80%" stopColor="#473a32" />
              <stop offset="100%" stopColor="#241e1a" />
            </linearGradient>

            {/* Ear Handle Gradients */}
            <linearGradient id="handleGradLeft" x1="12" y1="30" x2="42" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#473b33" />
              <stop offset="50%" stopColor="#241d18" />
              <stop offset="100%" stopColor="#17120f" />
            </linearGradient>
            <linearGradient id="handleGradRight" x1="188" y1="30" x2="158" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#473b33" />
              <stop offset="50%" stopColor="#241d18" />
              <stop offset="100%" stopColor="#17120f" />
            </linearGradient>

            {/* Tripod Feet Gradients */}
            <linearGradient id="footCenterGrad" x1="100" y1="92" x2="100" y2="124" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#332a24" />
              <stop offset="50%" stopColor="#1e1814" />
              <stop offset="100%" stopColor="#0d0a08" />
            </linearGradient>
            <linearGradient id="footLeftGrad" x1="60" y1="88" x2="52" y2="116" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312822" />
              <stop offset="100%" stopColor="#100d0a" />
            </linearGradient>
            <linearGradient id="footRightGrad" x1="140" y1="88" x2="148" y2="116" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312822" />
              <stop offset="100%" stopColor="#100d0a" />
            </linearGradient>
          </defs>

          {/* ========================================================== */}
          {/* 1. THREE TRIPOD LEGS (Chân quỳ tam tinh như luhuong.jpg)   */}
          {/* ========================================================== */}
          {/* Left Rear/Side Foot */}
          <path
            d="M 52 82 
               C 50 94, 52 108, 62 115 
               C 66 116, 70 110, 72 102 
               C 74 94, 76 86, 78 85 Z"
            fill="url(#footLeftGrad)"
          />

          {/* Right Rear/Side Foot */}
          <path
            d="M 148 82 
               C 150 94, 148 108, 138 115 
               C 134 116, 130 110, 128 102 
               C 126 94, 124 86, 122 85 Z"
            fill="url(#footRightGrad)"
          />

          {/* Center Front Foot (Stout rounded knee tapering down to rounded base) */}
          <path
            d="M 90 92 
               C 88 104, 88 116, 96 124 
               C 100 126, 104 126, 107 122 
               C 112 114, 111 103, 109 92 Z"
            fill="url(#footCenterGrad)"
          />
          {/* Knee highlight on center foot */}
          <ellipse cx="98.5" cy="100" rx="6.5" ry="4" fill="#4d4036" opacity="0.6" />

          {/* ========================================================== */}
          {/* 2. TWO EAR HANDLES (Tai quai censer mây triện)             */}
          {/* ========================================================== */}
          {/* Left Handle Outer & Inner Loop */}
          <path
            d="M 40 32 
               C 22 28, 12 36, 12 48 
               C 12 60, 24 68, 38 64 
               C 42 63, 44 58, 42 54 
               C 40 50, 36 49, 34 49 
               C 28 49, 24 45, 25 41 
               C 26 37, 32 36, 40 38 Z"
            fill="url(#handleGradLeft)"
            stroke="#17120f"
            strokeWidth="1.2"
          />
          {/* Left handle hole */}
          <ellipse cx="27" cy="48" rx="6" ry="8" fill="#140f0c" opacity="0.95" />

          {/* Right Handle Outer & Inner Loop */}
          <path
            d="M 160 32 
               C 178 28, 188 36, 188 48 
               C 188 60, 176 68, 162 64 
               C 158 63, 156 58, 158 54 
               C 160 50, 164 49, 166 49 
               C 172 49, 176 45, 175 41 
               C 174 37, 168 36, 160 38 Z"
            fill="url(#handleGradRight)"
            stroke="#17120f"
            strokeWidth="1.2"
          />
          {/* Right handle hole */}
          <ellipse cx="173" cy="48" rx="6" ry="8" fill="#140f0c" opacity="0.95" />

          {/* ========================================================== */}
          {/* 3. MAIN CAULDRON BELLY (Bụng phình tròn dẹt thấp)         */}
          {/* ========================================================== */}
          <path
            d="M 42 34 
               C 40 46, 26 62, 34 82 
               C 42 100, 72 106, 100 106 
               C 128 106, 158 100, 166 82 
               C 174 62, 160 46, 158 34 Z"
            fill="url(#censerBronzeBelly)"
            stroke="#1b1512"
            strokeWidth="1.5"
          />

          {/* Specular metallic sheen band across belly (ánh bóng đồng cổ) */}
          <path
            d="M 44 54 
               C 58 48, 80 46, 100 46 
               C 120 46, 142 48, 156 54 
               C 152 64, 126 70, 100 70 
               C 74 70, 48 64, 44 54 Z"
            fill="url(#bellySheen)"
          />

          {/* Subtle horizontal groove below rim */}
          <path
            d="M 43 40 C 60 45, 140 45, 157 40"
            stroke="#1b1512"
            strokeWidth="2.5"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 43 41.5 C 60 46.5, 140 46.5, 157 41.5"
            stroke="#5c4d42"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />

          {/* ========================================================== */}
          {/* 4. FRONT RIM / LIP (Gờ miệng trước che phủ chân nhang)     */}
          {/* This front lip is in front of the sticks (z-20 vs z-15),   */}
          {/* so the incense stick bases are physically inside the pot!  */}
          {/* ========================================================== */}
          <path
            d="M 40 28 
               C 40 38, 160 38, 160 28 
               L 161 33 
               C 161 43, 39 43, 39 33 Z"
            fill="url(#frontLipGrad)"
            stroke="#16110e"
            strokeWidth="1.2"
          />

          {/* Rounded rolled lip highlight */}
          <ellipse cx="100" cy="29" rx="58" ry="4" fill="#69584d" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
};

// 2. Japanese Minimalist Graphic Ancestor Frame Component
// Khung ảnh thờ gia tiên phong cách Nhật Bản tối giản & đồ họa tinh tế (Japanese Graphic Minimalist Frame):
// Lấy cảm hứng từ kiến trúc mộng gỗ Kigumi, sơn mài đen Urushi dát chỉ vàng,
// thanh xà ngang Kasagi cách điệu, gia huy Kamon hoa cúc/hoa sen hoàng gia,
// góc nối mộc tinh xảo, đệm lụa Washi trang nhã và bài vị Ihai tối giản.
export const AncestorFrame: React.FC<{
  ancestor: Ancestor;
  onClick?: () => void;
  initialStyle?: 'urushi' | 'hinoki';
  frameStyle?: 'urushi' | 'hinoki';
}> = ({ ancestor, onClick, initialStyle = 'urushi', frameStyle: propStyle }) => {
  const [localStyle] = useState<'urushi' | 'hinoki'>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_japanese_frame_style');
      if (saved === 'urushi' || saved === 'hinoki') return saved;
    } catch (e) {}
    return initialStyle;
  });

  const frameStyle = propStyle || localStyle;
  const isUrushi = frameStyle === 'urushi';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      onClick={onClick}
      className="relative cursor-pointer flex flex-col items-center group select-none"
      title="Di ảnh phụng thờ - Nhấp để xem chi tiết / đổi di ảnh"
    >
      {/* Outer Zen Ambient Halo */}
      <div className="absolute -inset-4 bg-radial from-amber-500/15 via-black/40 to-transparent blur-xl pointer-events-none -z-10" />

      {/* Frame Container - Simple, Balanced Japanese Proportions */}
      <div className="relative w-36 sm:w-40 md:w-44 aspect-[280/380] flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
        {/* ==================================================================== */}
        {/* SVG JAPANESE GRAPHIC MINIMALIST FRAME                                */}
        {/* ==================================================================== */}
        <svg
          viewBox="0 0 280 380"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Urushi Lacquer Gradient (Sơn mài đen sâu lắng) */}
            <linearGradient id="jpUrushiBase" x1="0" y1="0" x2="280" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1f1e1c" />
              <stop offset="35%" stopColor="#141312" />
              <stop offset="70%" stopColor="#0c0b0a" />
              <stop offset="100%" stopColor="#181615" />
            </linearGradient>

            {/* Hinoki Cypress Wood Gradient (Gỗ bách Hinoki ấm áp) */}
            <linearGradient id="jpHinokiBase" x1="0" y1="0" x2="280" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5c3b1e" />
              <stop offset="20%" stopColor="#7c4e28" />
              <stop offset="50%" stopColor="#633d1c" />
              <stop offset="85%" stopColor="#87562f" />
              <stop offset="100%" stopColor="#4a2e16" />
            </linearGradient>

            {/* Gold Hairline Maki-e Inlay (Dát vàng kim chỉ mảnh) */}
            <linearGradient id="jpGoldInlay" x1="30" y1="30" x2="250" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Washi / Silk Inner Matting Gradient */}
            <linearGradient id="jpWashiMat" x1="50" y1="70" x2="230" y2="320" gradientUnits="userSpaceOnUse">
              {isUrushi ? (
                <>
                  <stop offset="0%" stopColor="#1a1918" />
                  <stop offset="100%" stopColor="#100f0e" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#2c221a" />
                  <stop offset="100%" stopColor="#1e1610" />
                </>
              )}
            </linearGradient>

            {/* Subtle Drop Shadow Filter */}
            <filter id="jpSoftRelief" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* ------------------------------------------------------------- */}
          {/* 1. TOP KASAGI LINTEL BEAM (Thanh xà ngang kiểu cổng Torii/Kamidana) */}
          {/* ------------------------------------------------------------- */}
          {/* Floating Top Lintel Bar with Chamfered Ends */}
          <path
            d="M 12 32 L 268 32 L 258 44 L 22 44 Z"
            fill={isUrushi ? 'url(#jpUrushiBase)' : 'url(#jpHinokiBase)'}
            stroke={isUrushi ? '#292524' : '#9a3412'}
            strokeWidth="1.2"
            filter="url(#jpSoftRelief)"
          />
          {/* Top Lintel Gold Center Accent Stripe */}
          <line x1="28" y1="38" x2="252" y2="38" stroke="url(#jpGoldInlay)" strokeWidth="1" opacity="0.85" />

          {/* Secondary Sub-Beam (Shimaki bar) */}
          <rect
            x="30"
            y="44"
            width="220"
            height="8"
            fill={isUrushi ? '#141312' : '#4a2e16'}
            stroke={isUrushi ? '#0c0b0a' : '#331e0f'}
            strokeWidth="1"
          />

          {/* ------------------------------------------------------------- */}
          {/* 2. JAPANESE KAMON CREST (Gia Huy Nhật Bản: Hoa Cúc Hoàng Gia / Hoa Sen) */}
          {/* ------------------------------------------------------------- */}
          <g filter="url(#jpSoftRelief)" transform="translate(140, 22)">
            {/* Outer Sacred Kamon Ring */}
            <circle cx="0" cy="0" r="11" fill={isUrushi ? '#141312' : '#3b2010'} stroke="url(#jpGoldInlay)" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="url(#jpGoldInlay)" strokeWidth="0.6" opacity="0.7" />

            {/* Geometric 8-Petal Japanese Kamon Vector Graphic */}
            <path
              d="
                M 0 -7.5 C 1.5 -5, 1.5 -3, 0 -1.5 C -1.5 -3, -1.5 -5, 0 -7.5 Z
                M 0 7.5 C 1.5 5, 1.5 3, 0 1.5 C -1.5 3, -1.5 5, 0 7.5 Z
                M -7.5 0 C -5 1.5, -3 1.5, -1.5 0 C -3 -1.5, -5 -1.5, -7.5 0 Z
                M 7.5 0 C 5 1.5, 3 1.5, 1.5 0 C 3 -1.5, 5 -1.5, 7.5 0 Z
                M -5.3 -5.3 C -3.8 -3.8, -2.5 -2.5, -1.1 -1.1 C -2.5 -2.5, -3.8 -3.8, -5.3 -5.3 Z
                M 5.3 5.3 C 3.8 3.8, 2.5 2.5, 1.1 1.1 C 2.5 2.5, 3.8 3.8, 5.3 5.3 Z
                M -5.3 5.3 C -3.8 3.8, -2.5 2.5, -1.1 1.1 C -2.5 2.5, -3.8 3.8, -5.3 5.3 Z
                M 5.3 -5.3 C 3.8 -3.8, 2.5 -2.5, 1.1 -1.1 C 2.5 -2.5, 3.8 -3.8, 5.3 -5.3 Z
              "
              stroke="url(#jpGoldInlay)"
              strokeWidth="0.8"
              fill={isUrushi ? '#fbbf24' : '#fef08a'}
              fillOpacity="0.4"
            />
            {/* Center Golden Core */}
            <circle cx="0" cy="0" r="1.8" fill="#fef08a" />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* 3. MAIN GEOMETRIC FRAME CHASSIS (Khung chữ nhật tối giản)      */}
          {/* ------------------------------------------------------------- */}
          <rect
            x="32"
            y="52"
            width="216"
            height="286"
            fill={isUrushi ? 'url(#jpUrushiBase)' : 'url(#jpHinokiBase)'}
            stroke={isUrushi ? '#0a0a0a' : '#2b180a'}
            strokeWidth="2"
            filter="url(#jpSoftRelief)"
          />

          {/* Clean Gold Hairline Inlay Boundary (Chỉ vàng dát phẳng) */}
          <rect
            x="37"
            y="57"
            width="206"
            height="276"
            fill="none"
            stroke="url(#jpGoldInlay)"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* ------------------------------------------------------------- */}
          {/* 4. JAPANESE KIGUMI CORNER JOINERY (Góc mộng gỗ Nhật Bản & Kanagu) */}
          {/* ------------------------------------------------------------- */}
          {/* Top-Left Corner Joinery */}
          <g opacity="0.9">
            <path d="M 37 72 L 52 72 M 52 57 L 52 72" stroke="url(#jpGoldInlay)" strokeWidth="1.2" fill="none" />
            <circle cx="44.5" cy="64.5" r="1.4" fill="#fbbf24" />
          </g>
          {/* Top-Right Corner Joinery */}
          <g opacity="0.9">
            <path d="M 243 72 L 228 72 M 228 57 L 228 72" stroke="url(#jpGoldInlay)" strokeWidth="1.2" fill="none" />
            <circle cx="235.5" cy="64.5" r="1.4" fill="#fbbf24" />
          </g>
          {/* Bottom-Left Corner Joinery */}
          <g opacity="0.9">
            <path d="M 37 318 L 52 318 M 52 333 L 52 318" stroke="url(#jpGoldInlay)" strokeWidth="1.2" fill="none" />
            <circle cx="44.5" cy="325.5" r="1.4" fill="#fbbf24" />
          </g>
          {/* Bottom-Right Corner Joinery */}
          <g opacity="0.9">
            <path d="M 243 318 L 228 318 M 228 333 L 228 318" stroke="url(#jpGoldInlay)" strokeWidth="1.2" fill="none" />
            <circle cx="235.5" cy="325.5" r="1.4" fill="#fbbf24" />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* 5. WASHI / SILK INNER MATTING (Lòng đệm tranh/ảnh thanh nhã)    */}
          {/* ------------------------------------------------------------- */}
          <rect
            x="48"
            y="68"
            width="184"
            height="254"
            fill="url(#jpWashiMat)"
            stroke={isUrushi ? '#262422' : '#452b17'}
            strokeWidth="1"
          />

          {/* Delicate Inner Bezel bounding the Portrait */}
          <rect
            x="59"
            y="79"
            width="162"
            height="232"
            fill="none"
            stroke="url(#jpGoldInlay)"
            strokeWidth="1"
            opacity="0.95"
          />

          {/* ------------------------------------------------------------- */}
          {/* 6. PEDESTAL BASE (Dai-za: Chân đế gỗ kiểu Nhật Bản)          */}
          {/* ------------------------------------------------------------- */}
          {/* Stepped Pedestal Base Bar Tier 1 */}
          <path
            d="M 22 338 L 258 338 L 252 346 L 28 346 Z"
            fill={isUrushi ? 'url(#jpUrushiBase)' : 'url(#jpHinokiBase)'}
            stroke={isUrushi ? '#0c0b0a' : '#331e0f'}
            strokeWidth="1"
          />
          <line x1="30" y1="342" x2="250" y2="342" stroke="url(#jpGoldInlay)" strokeWidth="0.8" opacity="0.75" />

          {/* Stepped Pedestal Base Bar Tier 2 */}
          <rect
            x="16"
            y="346"
            width="248"
            height="10"
            rx="1"
            fill={isUrushi ? '#141312' : '#3a210e'}
            stroke={isUrushi ? '#0a0a09' : '#261407'}
            strokeWidth="1"
            filter="url(#jpSoftRelief)"
          />

          {/* Two Sleek Pedestal Feet (Chân đế tả - hữu) */}
          <rect x="36" y="356" width="34" height="6" fill={isUrushi ? '#0c0b0a' : '#261407'} rx="0.5" />
          <rect x="210" y="356" width="34" height="6" fill={isUrushi ? '#0c0b0a' : '#261407'} rx="0.5" />

          {/* Ground Contact Shadow */}
          <ellipse cx="140" cy="365" rx="115" ry="3.5" fill="#000000" opacity="0.6" />
        </svg>

        {/* ==================================================================== */}
        {/* INNER PORTRAIT CONTAINER                                             */}
        {/* Coordinates match x="60" y="80" w="160" h="230" in 280x380 viewBox  */}
        {/* Left: 21.4%, Top: 21.05%, Width: 57.14%, Height: 60.53%              */}
        {/* ==================================================================== */}
        <div
          className="absolute overflow-hidden z-10 bg-stone-950 flex items-center justify-center"
          style={{
            left: '21.43%',
            top: '21.05%',
            width: '57.14%',
            height: '60.53%',
          }}
        >
          {/* Gentle Ethereal Fade-in Portrait of Ancestor */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={ancestor.id + (ancestor.avatarUrl || 'default')}
              initial={{ opacity: 0, scale: 0.985, filter: 'contrast(1.02) brightness(0.92)' }}
              animate={{ opacity: 1, scale: 1, filter: 'contrast(1.03) brightness(1)' }}
              exit={{ opacity: 0, scale: 1.015, filter: 'contrast(1.03) brightness(1.05)' }}
              transition={{
                duration: 1.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
            >
              <img
                src={ancestor.avatarUrl || defaultAncestorImg}
                alt={ancestor.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Ethereal Sacred Golden Bloom upon Portrait Transition */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`halo-${ancestor.id}-${ancestor.avatarUrl || 'default'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 bg-radial from-amber-400/35 via-amber-600/10 to-transparent pointer-events-none z-15"
            />
          </AnimatePresence>

          {/* Soft Zen Washi Film Overlay (Lớp màng phim dịu mắt thanh thoát) */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/20 via-transparent to-stone-950/15 pointer-events-none z-20" />
          <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] pointer-events-none z-20" />
        </div>
      </div>

      {/* ======================================================================= */}
      {/* JAPANESE IHAI MEMORIAL PLAQUE (Bài vị tối giản phong cách Nhật Bản)      */}
      {/* ======================================================================= */}
      <div
        className={`-mt-1.5 z-30 px-3 py-1 rounded-sm shadow-xl flex items-center gap-2 max-w-[170px] backdrop-blur-xs border transition-all ${
          isUrushi
            ? 'bg-stone-950/95 border-amber-500/70 text-amber-100 ring-1 ring-amber-500/20'
            : 'bg-amber-950/95 border-amber-400/80 text-amber-50 ring-1 ring-amber-400/30'
        }`}
      >
        {/* Traditional Red Inkan Seal / Con Dấu Triện Son 'Hiếu' (孝) */}
        <div
          className="w-4 h-4 rounded-xs bg-red-800 border border-red-500/90 flex items-center justify-center text-[9px] font-serif font-bold text-red-100 shrink-0 shadow-xs"
          title="Triện son Đạo Hiếu"
        >
          孝
        </div>

        {/* Text Information with Smooth Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={ancestor.id}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-w-0 flex-1 text-left"
          >
            <p className="font-serif font-bold text-[11px] sm:text-xs text-amber-200 truncate leading-tight tracking-wide">
              {ancestor.name}
            </p>
            <div className="flex items-center gap-1 text-[9px] text-amber-300/80 font-serif leading-none mt-0.5">
              <span className="truncate">{ancestor.relation || 'Tiên Linh'}</span>
              {(ancestor.birthYear || ancestor.deathYear) && (
                <span className="font-mono text-stone-400 text-[8px] shrink-0">
                  • {ancestor.birthYear || '—'}-{ancestor.deathYear || '—'}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 3. Altar Candle (Nến đỏ / Đèn hoa đăng lung linh hai bên)
export const AltarCandle: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  return (
    <div className={`flex flex-col items-center select-none ${side === 'left' ? 'scale-x-100' : 'scale-x-[-1]'}`}>
      {/* Flickering Flame */}
      <motion.div
        animate={{
          scaleY: [1, 1.25, 0.95, 1.2, 1],
          scaleX: [1, 0.9, 1.1, 0.95, 1],
          opacity: [0.9, 1, 0.85, 1],
        }}
        transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
        className="relative -mb-1 flex flex-col items-center"
      >
        <div className="w-2.5 h-4 bg-gradient-to-t from-red-600 via-amber-400 to-amber-100 rounded-t-full shadow-[0_0_12px_4px_rgba(245,158,11,0.6)]" />
        <div className="w-0.5 h-1.5 bg-stone-800 -mt-0.5" />
      </motion.div>

      {/* Red Candle Stick */}
      <div className="w-4 h-12 bg-gradient-to-r from-red-900 via-red-600 to-red-950 rounded-t-xs border-t border-red-400/50 shadow-md" />

      {/* Brass Candle Holder Stand */}
      <div className="w-8 h-3 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 rounded-t-sm shadow-sm" />
      <div className="w-2 h-4 bg-amber-700" />
      <div className="w-10 h-2.5 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900 rounded-full shadow-lg" />
    </div>
  );
};

// 4. Traditional Vietnamese Water Cup Set (Kỷ 3 Chén Nước Thờ Thanh Tịnh - Tam Tài: Thiên, Địa, Nhân)
export const WaterCupSet: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3 Cups on carved wooden pedestal */}
      <div className="flex items-end justify-center gap-2 relative z-10">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Golden cup lid knob */}
            <div className="w-1.5 h-1 rounded-t-full bg-amber-400 shadow-xs" />
            {/* Cup Lid */}
            <div className="w-5 h-1.5 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-800 rounded-t-xs border-t border-amber-300/80 shadow" />
            {/* Cup Body (Porcelain/Brass) */}
            <div className="w-4 h-4 bg-gradient-to-b from-amber-100 via-stone-200 to-amber-200 rounded-b-md border border-amber-600/70 shadow-xs flex items-center justify-center">
              {/* Subtle lotus/blue pattern speck */}
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40 opacity-70" />
            </div>
            {/* Small cup base */}
            <div className="w-2.5 h-1 bg-amber-700 rounded-b-xs" />
          </div>
        ))}
      </div>

      {/* Carved Rosewood Pedestal (Kỷ gỗ đục triện) */}
      <div className="w-24 h-2 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-sm border-t border-amber-600/60 shadow-md -mt-0.5 flex items-center justify-around px-1">
        <div className="w-1.5 h-1 bg-amber-700/60 rounded-xs" />
        <div className="w-1.5 h-1 bg-amber-700/60 rounded-xs" />
        <div className="w-1.5 h-1 bg-amber-700/60 rounded-xs" />
      </div>
      <div className="w-28 h-1 bg-stone-950/80 rounded-full blur-[0.5px] -mt-0.5" />
    </div>
  );
};

// 5. Traditional Fruit Offering Platter (Mâm Bồng Ngũ Quả Dâng Cúng)
export const FruitPlatter: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Five Fruits Arrangement */}
      <div className="relative z-10 -mb-1 flex items-end justify-center">
        {/* Yellow Grapefruit / Bưởi Vàng (Center) */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-lime-200 shadow-md border border-amber-500/40 relative z-20 flex items-center justify-center">
          {/* Leaf stem */}
          <div className="w-1 h-1.5 bg-emerald-700 rounded-t-full -top-1 absolute" />
        </div>

        {/* Green Banana bunch / Nải Chuối Xanh (Behind/Left) */}
        <div className="w-6 h-5 rounded-t-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-400 shadow-xs border border-emerald-900 -mr-2 relative z-10" />

        {/* Red Apple / Quả Hồng Đỏ (Right) */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-800 via-red-500 to-amber-200 shadow-xs border border-red-700 -ml-1 relative z-15" />

        {/* Small Golden Kumquats / Quất Vàng (Flanking) */}
        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-orange-600 via-amber-400 to-yellow-200 shadow-xs -ml-2 mb-0.5 relative z-25" />
      </div>

      {/* Carved Ceramic / Bronze Stem Pedestal Platter (Đĩa Mâm Bồng Chân Cao) */}
      <div className="w-16 h-2 bg-gradient-to-r from-amber-800 via-amber-500 to-amber-900 rounded-t-full border-t border-amber-300 shadow-sm relative z-5" />
      <div className="w-4 h-3 bg-gradient-to-b from-amber-700 to-amber-950 shadow-inner" />
      <div className="w-10 h-1.5 bg-gradient-to-r from-stone-900 via-amber-800 to-stone-900 rounded-full border-t border-amber-600 shadow-md" />
      <div className="w-12 h-1 bg-stone-950/60 rounded-full blur-[0.5px]" />
    </div>
  );
};

// 6. Traditional Sacred Flower Vase (Bình Hoa Sen / Hoa Cúc Thanh Tao)
export const FlowerVase: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Flower Blossoms (Hoa Sen & Nụ Cúc) */}
      <div className="relative z-10 -mb-1 flex flex-col items-center">
        {/* Lotus Blossom */}
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-3.5 rounded-full bg-gradient-to-t from-pink-700 via-rose-300 to-white shadow-xs rotate-[-12deg]" />
          <div className="w-3 h-4 rounded-full bg-gradient-to-t from-rose-700 via-pink-400 to-amber-100 shadow-xs" />
          <div className="w-2.5 h-3.5 rounded-full bg-gradient-to-t from-pink-700 via-rose-300 to-white shadow-xs rotate-[12deg]" />
        </div>
        {/* Green Stem */}
        <div className="w-1 h-3 bg-emerald-800" />
      </div>

      {/* Porcelain Blue-and-White Flower Vase (Lọ hoa gốm men lam) */}
      <div className="w-7 h-2 bg-gradient-to-r from-stone-100 via-sky-100 to-stone-200 rounded-t-md border-t border-sky-300/80 shadow-xs" />
      <div className="w-5 h-2 bg-gradient-to-b from-sky-200 to-stone-100" />
      <div className="w-8 h-9 bg-gradient-to-tr from-stone-100 via-sky-50 to-stone-200 rounded-2xl border border-sky-400/50 shadow-md flex items-center justify-center overflow-hidden">
        {/* Traditional Blue pattern on vase */}
        <div className="w-4 h-4 border border-blue-800/40 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-blue-900/50 rounded-full" />
        </div>
      </div>
      <div className="w-6 h-1.5 bg-gradient-to-r from-stone-200 to-stone-300 rounded-b-sm border-t border-stone-400 shadow-sm" />
      <div className="w-9 h-1 bg-stone-950/60 rounded-full blur-[0.5px]" />
    </div>
  );
};

