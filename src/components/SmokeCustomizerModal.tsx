import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Sliders, Wind, Droplets, Feather } from 'lucide-react';
import { SmokeConfig, SmokeStylePreset } from '../types.ts';
import { playChime } from '../utils/audio.ts';

export const DEFAULT_SMOKE_CONFIG: SmokeConfig = {
  preset: 'thuy_mac',
  opacity: 1.0,
  waviness: 1.0,
  flowSpeed: 1.0,
  inkGradation: 1.0,
};

export const getSavedSmokeConfig = (): SmokeConfig => {
  try {
    const raw = localStorage.getItem('thapnhang_smoke_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SMOKE_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SMOKE_CONFIG;
};

export const saveSmokeConfig = (config: SmokeConfig) => {
  try {
    localStorage.setItem('thapnhang_smoke_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('thapnhang_smoke_config_changed', { detail: config }));
  } catch (e) {
    // ignore
  }
};

interface SmokeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmokeConfig;
  onChangeConfig: (newConfig: SmokeConfig) => void;
}

export const SmokeCustomizerModal: React.FC<SmokeCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const handlePresetSelect = (preset: SmokeStylePreset) => {
    let updated: SmokeConfig;
    if (preset === 'thuy_mac') {
      updated = {
        preset: 'thuy_mac',
        opacity: 1.0,
        waviness: 1.1,
        flowSpeed: 0.95,
        inkGradation: 1.1,
      };
    } else if (preset === 'tram_huong') {
      updated = {
        preset: 'tram_huong',
        opacity: 0.75,
        waviness: 1.35,
        flowSpeed: 0.85,
        inkGradation: 1.3,
      };
    } else {
      updated = {
        preset: 'thanh_tinh',
        opacity: 1.15,
        waviness: 0.75,
        flowSpeed: 1.1,
        inkGradation: 0.85,
      };
    }
    onChangeConfig(updated);
    saveSmokeConfig(updated);
    playChime();
  };

  const handleUpdateField = <K extends keyof SmokeConfig>(field: K, value: SmokeConfig[K]) => {
    const updated = { ...config, [field]: value };
    onChangeConfig(updated);
    saveSmokeConfig(updated);
  };

  const handleReset = () => {
    onChangeConfig(DEFAULT_SMOKE_CONFIG);
    saveSmokeConfig(DEFAULT_SMOKE_CONFIG);
    playChime();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg bg-stone-900 border border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-amber-800/60 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 flex items-center gap-2">
                  Khói Nhang Thủy Mặc
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-normal">
                    Biến thiên độ mờ
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400 font-serif">
                  Tùy chỉnh độ trong suốt theo cự ly từ đầu nhang & phong cách họa đồ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-stone-200 text-sm">
            {/* Visual Ink Wash Distance Gradation Indicator */}
            <div className="p-3 bg-stone-950/80 border border-amber-800/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-serif text-amber-300">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  Mô phỏng độ trong suốt theo chiều cao:
                </span>
                <span className="text-stone-400 text-[10px]">Đậm nhạt tự nhiên</span>
              </div>

              {/* Dynamic Gradient Bar representing distance from tip */}
              <div className="h-4 rounded-full overflow-hidden border border-stone-700 bg-stone-900 relative flex items-center">
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(to right, 
                      rgba(255, 255, 255, ${Math.min(1, 0.9 * config.opacity)}) 0%, 
                      rgba(255, 255, 255, ${Math.min(1, 0.85 * config.opacity)}) 18%, 
                      rgba(255, 255, 255, ${Math.min(1, 0.5 * config.opacity)}) 55%, 
                      rgba(255, 255, 255, ${Math.min(1, 0.18 * config.opacity)}) 85%, 
                      rgba(255, 255, 255, 0) 100%)`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-stone-400 font-serif pt-0.5">
                <span className="text-amber-300/90">Gốc nhang: Mực đậm</span>
                <span className="text-amber-200/80">Thân: Loang mờ</span>
                <span className="text-stone-400">Ngọn: Sương mỏng</span>
                <span className="text-stone-500">Tan biến</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-amber-400" />
                Phong Cách Khói Nhang:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Preset 1: Thủy Mặc */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('thuy_mac')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    config.preset === 'thuy_mac'
                      ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400/50 text-amber-100 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-amber-300">Tranh Thủy Mặc</span>
                      <span className="text-xs">🖌️</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-snug">
                      Đậm nét ở gốc, loang mờ theo độ cao như giọt mực hòa giấy xuyến
                    </p>
                  </div>
                  <span className="text-[9px] text-amber-400/80 mt-2 block font-serif">Mờ ảo • Uốn lượn</span>
                </button>

                {/* Preset 2: Trầm Hương Lan Tỏa */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('tram_huong')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    config.preset === 'tram_huong'
                      ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400/50 text-amber-100 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-amber-300">Trầm Lan Tỏa</span>
                      <span className="text-xs">🌫️</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-snug">
                      Khói tản rộng, sương mỏng manh bay bổng, độ trong suốt cao
                    </p>
                  </div>
                  <span className="text-[9px] text-amber-400/80 mt-2 block font-serif">Tản rộng • Dịu êm</span>
                </button>

                {/* Preset 3: Thanh Tịnh Tự Nhiên */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect('thanh_tinh')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    config.preset === 'thanh_tinh'
                      ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400/50 text-amber-100 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-amber-300">Thanh Tịnh</span>
                      <span className="text-xs">🌿</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-snug">
                      Dải khói thon gọn, bay thẳng uyển chuyển với độ gợn êm đềm
                    </p>
                  </div>
                  <span className="text-[9px] text-amber-400/80 mt-2 block font-serif">Thon dài • Tôn nghiêm</span>
                </button>
              </div>
            </div>

            {/* Custom Sliders for Detailed Physics */}
            <div className="space-y-4 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Tinh Chỉnh Chi Tiết:
                </label>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Đặt lại thông số mặc định"
                >
                  <RotateCcw className="w-3 h-3" />
                  Mặc định
                </button>
              </div>

              {/* Slider 1: Opacity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-serif">Độ đậm / Trong suốt tổng thể:</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.round(config.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.5"
                  step="0.05"
                  value={config.opacity}
                  onChange={(e) => handleUpdateField('opacity', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Mờ ảo nhẹ nhàng</span>
                  <span>Rõ nét đậm đà</span>
                </div>
              </div>

              {/* Slider 2: Ink Gradation (Falloff by distance from tip) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-serif">Tốc độ mờ loang theo cự ly (Gradation):</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.round(config.inkGradation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.6"
                  step="0.05"
                  value={config.inkGradation}
                  onChange={(e) => handleUpdateField('inkGradation', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Giữ nét lâu hơn</span>
                  <span>Chuẩn thủy mặc</span>
                  <span>Loang mờ nhanh</span>
                </div>
              </div>

              {/* Slider 3: Waviness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-serif">Biên độ gợn sóng (Waviness):</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.round(config.waviness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.8"
                  step="0.05"
                  value={config.waviness}
                  onChange={(e) => handleUpdateField('waviness', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Thẳng đứng thanh tịnh</span>
                  <span>Uốn lượn bay bổng</span>
                </div>
              </div>

              {/* Slider 4: Flow Speed */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-serif">Tốc độ bốc khói (Rise Speed):</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.round(config.flowSpeed * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={config.flowSpeed}
                  onChange={(e) => handleUpdateField('flowSpeed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Chậm êm đềm</span>
                  <span>Thanh thoát</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-serif">
              Tự động lưu lại và xem trước trực tiếp trên bàn thờ
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-serif font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Hoàn Tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
