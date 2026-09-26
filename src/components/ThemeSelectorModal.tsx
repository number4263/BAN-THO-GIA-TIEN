import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BackgroundTheme } from '../types.ts';
import { INK_THEMES } from '../data/backgrounds.ts';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  totalHieuDuong: number;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  totalHieuDuong,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-stone-900 border border-amber-800/60 rounded-xl shadow-2xl text-stone-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/50 bg-stone-950/80">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-serif font-bold text-lg text-amber-100">
                  Không Gian Thủy Mặc & Điểm Hiếu Dương
                </h3>
                <p className="text-xs text-stone-400">
                  Tích lũy Hiếu Dương qua mỗi lần dâng hương để mở khóa các danh thắng thủy mặc
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Points Status Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-b border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-amber-300 font-medium">
                  Tổng Tích Lũy Công Đức
                </p>
                <p className="text-lg font-serif font-bold text-amber-400">
                  {totalHieuDuong}{' '}
                  <span className="text-xs font-normal text-amber-200/80">đồng Hiếu Dương</span>
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-stone-400">
              <p>Mỗi lần thắp: <strong className="text-amber-300">+30 Hiếu Dương</strong></p>
              <p>Tối đa mỗi ngày: <strong className="text-amber-300">100</strong></p>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INK_THEMES.map((th) => {
              const isUnlocked = totalHieuDuong >= th.requiredHieuDuong;
              const isSelected = currentThemeId === th.id;

              return (
                <div
                  key={th.id}
                  onClick={() => isUnlocked && onSelectTheme(th.id)}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-500/50 bg-stone-800/90 shadow-lg'
                      : isUnlocked
                      ? 'border-stone-700 hover:border-amber-600 bg-stone-950/60 cursor-pointer'
                      : 'border-stone-800 bg-stone-950/30 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Visual Preview Swatch */}
                  <div
                    className={`w-full h-28 rounded-lg mb-3 bg-gradient-to-b ${th.gradient} border border-stone-600/30 relative flex items-center justify-center overflow-hidden`}
                  >
                    {th.imageUrl ? (
                      <img
                        src={th.imageUrl}
                        alt={th.vietnameseTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      /* Silhouette landscape preview */
                      <div className="absolute inset-0 flex items-end justify-center opacity-60 pointer-events-none">
                        <svg viewBox="0 0 100 40" className="w-full h-16 fill-stone-700">
                          <path d="M0 40 Q25 15 50 30 T100 20 L100 40 Z" />
                        </svg>
                      </div>
                    )}

                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-amber-300 gap-1">
                        <Lock className="w-6 h-6" />
                        <span className="text-xs font-semibold">
                          Cần {th.requiredHieuDuong} Hiếu Dương
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center gap-1 shadow">
                        <Check className="w-3 h-3" /> Đang dùng
                      </div>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-amber-100">
                        {th.vietnameseTitle}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {th.requiredHieuDuong === 0 ? 'Mặc định' : `${th.requiredHieuDuong} điểm`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {th.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                    {isSelected ? (
                      <span className="text-xs text-amber-400 font-serif font-medium">
                        ✓ Cảnh nền hiện tại
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        className="text-xs text-stone-200 hover:text-amber-300 font-medium cursor-pointer"
                      >
                        Chọn cảnh này
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Còn thiếu{' '}
                        {th.requiredHieuDuong - totalHieuDuong} điểm
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
