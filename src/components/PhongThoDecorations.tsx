import React from 'react';
import { motion } from 'motion/react';

interface PhongThoDecorationsProps {
  isVisible: boolean;
}

export const PhongThoDecorations: React.FC<PhongThoDecorationsProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. CỬA VÕNG / THIỀU CHÂU CHẠM RỒNG SEN ĐỈNH PHÒNG THỜ        */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-b from-stone-950 via-amber-950/70 to-transparent flex items-start justify-center">
        <svg
          viewBox="0 0 1000 70"
          className="w-full h-full object-cover opacity-85"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cuaVongGrad" x1="0" y1="0" x2="1000" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="25%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>
          {/* Main carved upper valance / frieze */}
          <path
            d="M 0 0 L 1000 0 L 1000 24 C 850 36, 700 20, 500 38 C 300 20, 150 36, 0 24 Z"
            fill="url(#cuaVongGrad)"
          />
          {/* Decorative pendant drops / rèm chạm khắc */}
          <path
            d="M 50 24 Q 100 48 150 24 Q 200 48 250 24 Q 300 48 350 24 Q 400 48 450 24 Q 500 58 550 24 Q 600 48 650 24 Q 700 48 750 24 Q 800 48 850 24 Q 900 48 950 24"
            stroke="#fbbf24"
            strokeWidth="2"
            fill="none"
          />
          {/* Center lotus blossom pendant motif */}
          <circle cx="500" cy="40" r="10" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="500" cy="40" r="5" fill="#f59e0b" />
        </svg>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CỘT GỖ LIM TẢ - HỮU (GRAND WOODEN PILLARS WITH COUPLETS)   */}
      {/* ------------------------------------------------------------- */}
      {/* Left Pillar */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 md:w-20 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/90 border-r border-amber-900/60 shadow-2xl flex flex-col items-center justify-center">
        {/* Wood grain highlight */}
        <div className="absolute inset-y-0 right-1 w-[1px] bg-gradient-to-b from-amber-600/40 via-amber-400/20 to-transparent" />
        
        {/* Carved Vertical Couplet (Vế Trái) */}
        <div className="hidden sm:flex flex-col items-center justify-center py-6 px-1 rounded-sm bg-gradient-to-b from-red-950 via-stone-950 to-red-950 border border-amber-500/70 shadow-xl text-xs md:text-sm font-serif font-bold text-amber-300 tracking-widest leading-loose writing-vertical">
          <span>TỔ</span>
          <span>TÔNG</span>
          <span>CÔNG</span>
          <span>ĐỨC</span>
          <span>THIÊN</span>
          <span>NIÊN</span>
          <span>THỊNH</span>
        </div>
      </div>

      {/* Right Pillar */}
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 md:w-20 bg-gradient-to-l from-stone-950 via-stone-900 to-amber-950/90 border-l border-amber-900/60 shadow-2xl flex flex-col items-center justify-center">
        {/* Wood grain highlight */}
        <div className="absolute inset-y-0 left-1 w-[1px] bg-gradient-to-b from-amber-600/40 via-amber-400/20 to-transparent" />
        
        {/* Carved Vertical Couplet (Vế Phải) */}
        <div className="hidden sm:flex flex-col items-center justify-center py-6 px-1 rounded-sm bg-gradient-to-b from-red-950 via-stone-950 to-red-950 border border-amber-500/70 shadow-xl text-xs md:text-sm font-serif font-bold text-amber-300 tracking-widest leading-loose writing-vertical">
          <span>TỬ</span>
          <span>HIẾU</span>
          <span>TÔN</span>
          <span>HIỀN</span>
          <span>VẠN</span>
          <span>ĐẠI</span>
          <span>VINH</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. LỒNG ĐÈN LỤC GIÁC GỖ PHÒNG THỜ (LANTERNS WITH WARM LIGHT)  */}
      {/* ------------------------------------------------------------- */}
      {/* Left Hanging Lantern */}
      <motion.div
        animate={{ y: [0, 4, 0], rotate: [-0.5, 0.5, -0.5] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-12 left-10 sm:left-20 md:left-24 flex flex-col items-center"
      >
        {/* Hanging brass wire cord */}
        <div className="w-[1.5px] h-10 bg-amber-600/70 shadow" />
        {/* Lantern Cap */}
        <div className="w-10 sm:w-12 h-3 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-t-md border-t border-amber-500/80 shadow" />
        {/* Lantern Glowing Body */}
        <div className="relative w-9 sm:w-11 h-14 sm:h-16 rounded-sm bg-gradient-to-b from-amber-500/80 via-red-600/80 to-amber-600/90 border border-amber-400 shadow-[0_0_20px_5px_rgba(245,158,11,0.4)] flex items-center justify-center">
          {/* Han Character or Lotus Pattern inside lantern */}
          <span className="text-amber-100 font-serif font-bold text-xs select-none opacity-90">
            福
          </span>
          {/* Inner Light source */}
          <div className="absolute inset-2 bg-radial from-amber-200 via-amber-400/50 to-transparent rounded-full animate-pulse" />
        </div>
        {/* Bottom Cap & Red Silk Tassel */}
        <div className="w-8 sm:w-10 h-2 bg-stone-900 rounded-b-md border-b border-amber-500/80" />
        <div className="w-1.5 h-8 bg-red-700 rounded-b-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      </motion.div>

      {/* Right Hanging Lantern */}
      <motion.div
        animate={{ y: [0, 4, 0], rotate: [0.5, -0.5, 0.5] }}
        transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-12 right-10 sm:right-20 md:right-24 flex flex-col items-center"
      >
        {/* Hanging brass wire cord */}
        <div className="w-[1.5px] h-10 bg-amber-600/70 shadow" />
        {/* Lantern Cap */}
        <div className="w-10 sm:w-12 h-3 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-t-md border-t border-amber-500/80 shadow" />
        {/* Lantern Glowing Body */}
        <div className="relative w-9 sm:w-11 h-14 sm:h-16 rounded-sm bg-gradient-to-b from-amber-500/80 via-red-600/80 to-amber-600/90 border border-amber-400 shadow-[0_0_20px_5px_rgba(245,158,11,0.4)] flex items-center justify-center">
          {/* Han Character or Lotus Pattern inside lantern */}
          <span className="text-amber-100 font-serif font-bold text-xs select-none opacity-90">
            壽
          </span>
          {/* Inner Light source */}
          <div className="absolute inset-2 bg-radial from-amber-200 via-amber-400/50 to-transparent rounded-full animate-pulse" />
        </div>
        {/* Bottom Cap & Red Silk Tassel */}
        <div className="w-8 sm:w-10 h-2 bg-stone-900 rounded-b-md border-b border-amber-500/80" />
        <div className="w-1.5 h-8 bg-red-700 rounded-b-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      </motion.div>
    </div>
  );
};
