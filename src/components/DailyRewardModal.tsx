import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { ScriptureQuote } from '../types.ts';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedPoints: number;
  todayEarned: number;
  todayMax: number;
  totalHieuDuong: number;
  quote: ScriptureQuote;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  earnedPoints,
  todayEarned,
  todayMax,
  totalHieuDuong,
  quote,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-stone-900 border-2 border-amber-600/70 rounded-2xl shadow-2xl text-stone-100 overflow-hidden text-center p-6"
        >
          {/* Ornate Gold Corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

          {/* Icon Badge */}
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg flex items-center justify-center mb-4">
            <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h3 className="font-serif font-bold text-xl text-amber-100 tracking-wide">
            Hoàn Thành Lễ Thắp Nhang
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Lòng thành kính đã được chứng giám, nguyện cầu an lành
          </p>

          {/* Specific user requested tally format:
              +30 Hiếu dương
              Hôm nay: 70/100
          */}
          <div className="my-5 p-4 rounded-xl bg-stone-950/80 border border-amber-900/60 shadow-inner">
            <div className="text-2xl sm:text-3xl font-serif font-extrabold text-amber-400 tracking-wide">
              +{earnedPoints} Hiếu dương
            </div>
            <div className="text-sm font-serif font-medium text-amber-200/90 mt-1.5">
              Hôm nay: <span className="font-bold text-amber-300">{todayEarned}/{todayMax}</span>
            </div>

            {/* Daily progress bar */}
            <div className="w-full bg-stone-800 h-2 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (todayEarned / todayMax) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              />
            </div>

            <p className="text-[11px] text-stone-400 mt-2">
              Tổng tích lũy: <strong className="text-amber-300 font-serif">{totalHieuDuong}</strong> Hiếu dương
            </p>
          </div>

          {/* Daily scripture / wisdom quote */}
          <div className="p-3.5 bg-stone-950/50 rounded-lg border border-stone-800 text-left mb-5">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-serif font-medium mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lời Dạy Tinh Thần Hôm Nay</span>
            </div>
            <p className="font-serif text-xs text-stone-200 italic leading-relaxed">
              "{quote.quote}"
            </p>
            <p className="text-[11px] text-amber-400/80 text-right mt-1 font-mono">
              — {quote.source}
            </p>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Trở về không gian bàn thờ
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
