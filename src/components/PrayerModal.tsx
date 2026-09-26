import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Feather, Check } from 'lucide-react';

interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrayer: string;
  onSavePrayer: (text: string) => void;
}

const PRAYER_SUGGESTIONS = [
  'Cầu cho hòa bình',
  'Cầu cho gia đình bình an, tai qua nạn khỏi',
  'Cầu cho cha mẹ dồi dào sức khỏe, sống lâu trăm tuổi',
  'Cầu cho cửu huyền thất tổ vãng sanh tịnh độ',
  'Cầu cho con cháu hiếu thuận, công thành danh toại',
  'Cầu cho tâm an vạn sự an, muôn sự cát tường',
  'Tưởng nhớ ân đức sinh thành và dưỡng dục cao dày',
  'Cầu cho mưa thuận gió hòa, quốc thái dân an',
];

export const PrayerModal: React.FC<PrayerModalProps> = ({
  isOpen,
  onClose,
  currentPrayer,
  onSavePrayer,
}) => {
  const [prayerText, setPrayerText] = useState(currentPrayer);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePrayer((prayerText.trim() || 'Cầu cho bình an').normalize('NFC'));
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-stone-900 border border-amber-800/60 rounded-xl shadow-2xl text-stone-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/50 bg-stone-950/80">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Viết Lời Nguyện Cầu & Khấn Nguyện
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-amber-200/90 mb-1.5 font-serif">
                Lời khấn nguyện hiển thị trên bàn thờ:
              </label>
              <textarea
                rows={3}
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Nhập lời cầu nguyện thành kính của bạn..."
                className="w-full px-3.5 py-2.5 text-sm bg-stone-950 border border-stone-700 rounded-lg focus:outline-hidden focus:border-amber-500 text-stone-100 placeholder-stone-600 font-serif"
              />
            </div>

            {/* Quick suggestions */}
            <div>
              <p className="text-[11px] font-medium text-stone-400 mb-2">
                Gợi ý lời nguyện tâm thành:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRAYER_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrayerText(suggestion)}
                    className="text-xs px-2.5 py-1 rounded-full bg-stone-800 hover:bg-amber-950 hover:text-amber-200 border border-stone-700 hover:border-amber-700 transition-colors text-stone-300 text-left font-serif"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Lưu lời cầu nguyện
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
