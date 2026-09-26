import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Clock,
  Edit3,
  Users,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  GitFork,
  Settings2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Wind,
  Camera,
  Menu,
  X,
} from 'lucide-react';
import {
  Ancestor,
  BackgroundTheme,
  HandPoseType,
  ScriptureQuote,
  AltarDisplayMode,
  FamilyMember,
  SmokeConfig,
  CustomAltarConfig,
} from '../types.ts';
import {
  BronzeBurner,
  AncestorFrame,
  AltarCandle,
  WaterCupSet,
  FruitPlatter,
  FlowerVase,
} from './AltarElements.tsx';
import { SmokeCanvas } from './SmokeCanvas.tsx';
import { SmokeCustomizerModal, getSavedSmokeConfig } from './SmokeCustomizerModal.tsx';
import { PetalType } from './FallingPetalsCanvas.tsx';
import { PyramidAncestorStand } from './PyramidAncestorStand.tsx';
import { PhongThoDecorations } from './PhongThoDecorations.tsx';
import {
  playBellSound,
  playWoodenFish,
  playSoftWoodenFish,
  triggerHapticPrayer,
  playChime,
} from '../utils/audio.ts';

interface AltarViewProps {
  ancestors: Ancestor[];
  activeAncestorId: string;
  onOpenAncestorManager: () => void;
  onOpenFamilyTree: () => void;
  prayerText: string;
  onOpenPrayerModal: () => void;
  currentTheme: BackgroundTheme;
  onOpenThemeModal: () => void;
  sticksCount: 1 | 3;
  onChangeSticksCount: (count: 1 | 3) => void;
  durationMinutes: 5 | 10 | 15;
  onChangeDuration: (mins: 5 | 10 | 15) => void;
  selectedPose: HandPoseType;
  onChangePose: (pose: HandPoseType) => void;
  onStartRitual: () => void;
  todayQuote: ScriptureQuote;
  todayEarned: number;
  totalHieuDuong: number;
  isMuted: boolean;
  onToggleSound: () => void;
  altarIncenseLit: [boolean, boolean, boolean];
  onLightAltarStick: (index: number) => void;
  burnProgress: number;
  petalType: PetalType;
  onChangePetalType: (type: PetalType) => void;
  isPetalsEnabled: boolean;
  onTogglePetals: (enabled: boolean) => void;
  displayMode: AltarDisplayMode;
  onChangeDisplayMode: (mode: AltarDisplayMode) => void;
  isPhongThoSpace: boolean;
  onTogglePhongThoSpace: () => void;
  familyMembers?: FamilyMember[];
  onUpdateAncestors: (ancestors: Ancestor[]) => void;
  onSelectActiveAncestor: (id: string) => void;
  onOpenPedigreeChart?: () => void;
  onOpenClanEvents?: () => void;
  customAltarConfig: CustomAltarConfig;
  onOpenCustomInterfaceModal: () => void;
}

export const AltarView: React.FC<AltarViewProps> = ({
  ancestors,
  activeAncestorId,
  onOpenAncestorManager,
  onOpenFamilyTree,
  prayerText,
  onOpenPrayerModal,
  currentTheme,
  onOpenThemeModal,
  sticksCount,
  onChangeSticksCount,
  durationMinutes,
  onChangeDuration,
  selectedPose,
  onChangePose,
  onStartRitual,
  todayQuote,
  todayEarned,
  totalHieuDuong,
  isMuted,
  onToggleSound,
  altarIncenseLit,
  onLightAltarStick,
  burnProgress,
  petalType,
  onChangePetalType,
  isPetalsEnabled,
  onTogglePetals,
  displayMode,
  onChangeDisplayMode,
  isPhongThoSpace,
  onTogglePhongThoSpace,
  familyMembers = [],
  onUpdateAncestors,
  onSelectActiveAncestor,
  onOpenPedigreeChart,
  onOpenClanEvents,
  customAltarConfig,
  onOpenCustomInterfaceModal,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Modals & Popovers
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showMindfulnessMenu, setShowMindfulnessMenu] = useState(false);
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false);
  const [showSmokeModal, setShowSmokeModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [smokeConfig, setSmokeConfig] = useState<SmokeConfig>(getSavedSmokeConfig);

  // Japanese Frame Style state (Urushi Lacquer vs Hinoki Cypress)
  const [frameStyle, setFrameStyle] = useState<'urushi' | 'hinoki'>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_japanese_frame_style');
      if (saved === 'hinoki' || saved === 'urushi') return saved;
    } catch (e) {}
    return 'urushi';
  });

  const burnerRef = useRef<HTMLDivElement | null>(null);
  const [burnerPos, setBurnerPos] = useState<{ x: number; ashY: number } | null>(null);
  const [isHoldingPrayer, setIsHoldingPrayer] = useState(false);
  const altarWoodenFishRef = useRef<number | null>(null);

  // Soft wooden fish & haptic pulses while holding prayer on altar
  useEffect(() => {
    if (isHoldingPrayer) {
      playSoftWoodenFish();
      triggerHapticPrayer();
      altarWoodenFishRef.current = window.setInterval(() => {
        playSoftWoodenFish();
        triggerHapticPrayer();
      }, 850);
    } else {
      if (altarWoodenFishRef.current) {
        clearInterval(altarWoodenFishRef.current);
        altarWoodenFishRef.current = null;
      }
    }
    return () => {
      if (altarWoodenFishRef.current) {
        clearInterval(altarWoodenFishRef.current);
        altarWoodenFishRef.current = null;
      }
    };
  }, [isHoldingPrayer]);

  const updateBurnerPosition = useCallback(() => {
    if (burnerRef.current) {
      const rect = burnerRef.current.getBoundingClientRect();
      setBurnerPos({
        x: rect.left + rect.width / 2,
        ashY: rect.top + 29, // Exactly at the ash bed level inside the burner
      });
    }
  }, []);

  useEffect(() => {
    updateBurnerPosition();
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateBurnerPosition();
    };
    window.addEventListener('resize', handleResize);
    const interval = setInterval(updateBurnerPosition, 500);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [updateBurnerPosition]);

  const activeAncestor = ancestors.find((a) => a.id === activeAncestorId) || ancestors[0];

  // Calculate coordinates of altar burner tips for smoke
  const remainingHeightRatio = Math.max(0.12, 1 - burnProgress * 0.88);
  const stickHeight = 210 * remainingHeightRatio;

  const stickOffsetsX = sticksCount === 1 ? [0] : [-15, 0, 15];
  const stickAngles = sticksCount === 1 ? [0] : [-7, 0, 7];
  const stickIndices = sticksCount === 1 ? [1] : [0, 1, 2];

  const censerCenterX = burnerPos ? burnerPos.x : windowSize.width / 2;
  const censerAshY = burnerPos ? burnerPos.ashY : windowSize.height * 0.72;

  const smokeTips = stickIndices.map((idx, i) => {
    const angleRad = (stickAngles[i] * Math.PI) / 180;
    const offsetX = stickOffsetsX[i];
    const tipX = censerCenterX + offsetX + Math.sin(angleRad) * stickHeight;
    const tipY = censerAshY - Math.cos(angleRad) * stickHeight - 6;

    return {
      x: tipX,
      y: tipY,
      lit: altarIncenseLit[idx],
    };
  });

  const hasAnyLit = altarIncenseLit.some((l) => l);

  const handleToggleFrameStyle = (style: 'urushi' | 'hinoki') => {
    setFrameStyle(style);
    try {
      localStorage.setItem('thapnhang_japanese_frame_style', style);
    } catch (e) {}
    playChime();
  };

  return (
    <motion.div
      animate={
        isHoldingPrayer
          ? {
              x: [0, -1.2, 1.4, -0.9, 1.2, -1.4, 0.9, -0.5, 0],
              y: [0, 1.4, -1.2, 1.6, -0.8, 1.2, -1.4, 0.6, 0],
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
      className={`relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none transition-shadow duration-500 bg-stone-950 ${
        isHoldingPrayer ? 'shadow-[inset_0_0_120px_rgba(245,158,11,0.25)]' : ''
      }`}
    >
      {/* Sacred prayer aura when holding clasp */}
      {isHoldingPrayer && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-radial from-amber-500/12 via-amber-700/6 to-transparent animate-pulse" />
      )}

      {/* Floating active prayer notification banner */}
      <AnimatePresence>
        {isHoldingPrayer && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-6 py-2.5 rounded-full bg-stone-950/95 border border-amber-400/80 text-amber-100 text-xs sm:text-sm font-serif shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Thành tâm khấn nguyện trước bàn thờ gia tiên</span>
              <span className="text-amber-400 font-sans text-xs">·</span>
              <span className="text-stone-400 text-xs italic">Tiếng mõ thanh tịnh</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smoke Canvas over altar */}
      <SmokeCanvas
        tips={smokeTips}
        containerWidth={windowSize.width}
        containerHeight={windowSize.height}
        intensity={1.0}
        config={smokeConfig}
      />

      {/* ========================================================================= */}
      {/* 1. TOP BAR CONTRACT (Strict 3-Zone Architecture)                          */}
      {/* Zone 1: Wordmark | Zone 2: 4-6 Clean Text Links | Zone 3: Curated Actions */}
      {/* ========================================================================= */}
      <header className="relative z-40 h-14 px-3 sm:px-6 flex items-center justify-between bg-stone-950/85 border-b border-stone-800/60 backdrop-blur-md">
        {/* ZONE 1: BRAND WORDMARK */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-amber-400 text-base" aria-hidden="true">
            🪷
          </span>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm sm:text-base tracking-widest bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 bg-clip-text text-transparent uppercase">
              Bàn Thờ Gia Tiên
            </span>
            <span className="text-[10px] text-stone-400 font-serif tracking-wider -mt-0.5 hidden sm:inline">
              Không Gian Thờ Tự & Gia Phả Dòng Họ
            </span>
          </div>
        </div>

        {/* ZONE 2: CLEAN TEXT NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-serif font-medium text-stone-300">
          <span className="text-amber-300 relative py-1 cursor-default font-semibold flex items-center gap-1">
            <span>Gian Thờ</span>
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
          </span>

          {/* Primary Nav Action: Trang Thắp Nhang */}
          <button
            onClick={onStartRitual}
            className="text-amber-300 hover:text-amber-100 transition-colors cursor-pointer py-1 flex items-center gap-1 font-bold group"
            title="Mở nghi lễ thắp nhang 10 bước trang nghiêm"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/30" />
            <span>Thắp Nhang</span>
          </button>

          <button
            onClick={onOpenFamilyTree}
            className="text-stone-300 hover:text-amber-200 transition-colors cursor-pointer py-1"
          >
            Cây Gia Phả
          </button>

          {onOpenPedigreeChart && (
            <button
              onClick={onOpenPedigreeChart}
              className="text-stone-300 hover:text-amber-200 transition-colors cursor-pointer py-1"
            >
              Phả Đồ Hệ
            </button>
          )}

          {onOpenClanEvents && (
            <button
              onClick={onOpenClanEvents}
              className="text-stone-300 hover:text-amber-200 transition-colors cursor-pointer py-1"
            >
              Lễ Giỗ Dòng Họ
            </button>
          )}

          <button
            onClick={onOpenPrayerModal}
            className="text-stone-300 hover:text-amber-200 transition-colors cursor-pointer py-1"
          >
            Văn Khấn
          </button>

          <button
            onClick={onOpenAncestorManager}
            className="text-stone-300 hover:text-amber-200 transition-colors cursor-pointer py-1"
          >
            Di Ảnh Tiên Tổ
          </button>

          {/* Dedicated Custom Altar Photo button */}
          <button
            onClick={onOpenCustomInterfaceModal}
            className="text-amber-300 hover:text-amber-100 transition-colors cursor-pointer py-1 flex items-center gap-1 font-bold"
            title="Tải ảnh bàn thờ hoặc phòng thờ gia đình bạn để làm giao diện"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Tải Ảnh Bàn Thờ</span>
          </button>
        </nav>

        {/* ZONE 3: ACTIONS & UTILITIES */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dedicated High-Visibility "Thắp Nhang" Action Button (Always reachable) */}
          <button
            onClick={onStartRitual}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/60 border border-amber-300 transition-all cursor-pointer active:scale-95 animate-pulse"
            title="Khởi Lễ Thắp Nhang - Nghi thức 10 bước trang nghiêm"
          >
            <Flame className="w-4 h-4 text-stone-950 fill-amber-300" />
            <span className="font-bold tracking-wide">Thắp Nhang</span>
          </button>

          {/* Direct Custom Altar Photo button */}
          <button
            onClick={onOpenCustomInterfaceModal}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-lg border text-xs font-serif transition-all items-center gap-1.5 cursor-pointer shadow-sm ${
              customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl
                ? 'bg-amber-950/90 border-amber-400 text-amber-200 ring-1 ring-amber-500/50'
                : 'bg-stone-900/90 hover:bg-stone-850 border-amber-700/60 text-amber-300 hover:text-amber-100'
            }`}
            title="Đưa hình ảnh bàn thờ thật của gia đình bạn vào làm giao diện"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">
              {customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl
                ? 'Ảnh Bàn Thờ Gia Đình'
                : 'Tải Ảnh Bàn Thờ'}
            </span>
          </button>

          {/* Piety Counter (Unboxed clean typography with tabular nums) */}
          <div
            onClick={onOpenThemeModal}
            className="hidden lg:flex items-center gap-1.5 text-xs font-serif text-stone-300 cursor-pointer hover:text-amber-200 transition-colors"
            title="Điểm Hiếu Dưỡng tích lũy"
          >
            <span className="text-amber-400">🪷</span>
            <span className="font-semibold text-amber-300 tabular-nums">{totalHieuDuong}</span>
            <span className="text-stone-500 text-[11px]">· Hôm nay +{todayEarned}</span>
          </div>

          {/* Serenity & Mindfulness Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMindfulnessMenu((prev) => !prev);
                setShowAtmosphereMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-amber-700/60 text-stone-300 hover:text-amber-200 text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Thỉnh chuông, gõ mõ & âm thanh thanh tịnh"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Tĩnh Tâm</span>
            </button>

            {showMindfulnessMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2 z-50 text-xs font-serif">
                <div className="text-[10px] text-stone-400 uppercase tracking-widest px-2 py-1 border-b border-stone-800">
                  Âm Thanh Thanh Tịnh
                </div>
                <button
                  onClick={() => {
                    playBellSound();
                    setShowMindfulnessMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thỉnh Chuông Gia Trì</span>
                </button>
                <button
                  onClick={() => {
                    playWoodenFish();
                    setShowMindfulnessMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="text-amber-400 text-xs">🪵</span>
                  <span>Gõ Mõ Tụng Kinh</span>
                </button>
                <button
                  onClick={() => {
                    onToggleSound();
                    setShowMindfulnessMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center gap-2 transition-colors cursor-pointer border-t border-stone-800 mt-1 pt-1.5"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Bật Âm Thanh</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tắt Âm Thanh</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Atmosphere & Space Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAtmosphereMenu((prev) => !prev);
                setShowMindfulnessMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-amber-700/60 text-stone-300 hover:text-amber-200 text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Tùy chọn không gian phòng thờ, cảnh nền & cánh hoa rơi"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cảnh Sắc</span>
            </button>

            {showAtmosphereMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2 z-50 text-xs font-serif">
                <div className="text-[10px] text-stone-400 uppercase tracking-widest px-2 py-1 border-b border-stone-800">
                  Không Gian & Thị Giác
                </div>
                {/* Phòng thờ không gian */}
                <button
                  onClick={() => {
                    onTogglePhongThoSpace();
                    setShowAtmosphereMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🏛️ Gian Thờ Cổ Truyền</span>
                  <span className="text-[10px] text-amber-400">{isPhongThoSpace ? 'Đang bật' : 'Tắt'}</span>
                </button>

                {/* Theme modal trigger */}
                <button
                  onClick={() => {
                    onOpenThemeModal();
                    setShowAtmosphereMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🎨 Bối Cảnh Thủy Mặc</span>
                  <span className="text-[10px] text-stone-400 truncate max-w-[80px]">
                    {currentTheme.name}
                  </span>
                </button>

                {/* Custom Photo Interface trigger */}
                <button
                  onClick={() => {
                    onOpenCustomInterfaceModal();
                    setShowAtmosphereMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-amber-200 hover:bg-amber-950/60 hover:text-amber-100 flex items-center justify-between transition-colors cursor-pointer bg-amber-950/30 border border-amber-800/40 my-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tải Ảnh Bàn Thờ Của Bạn</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl ? 'Đang bật' : 'Tải lên'}
                  </span>
                </button>

                {/* Smoke physics modal trigger */}
                <button
                  onClick={() => {
                    setShowSmokeModal(true);
                    setShowAtmosphereMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-200 hover:bg-stone-800 hover:text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>💨 Khói Nhang Thủy Mặc</span>
                  <span className="text-[10px] text-stone-400">Tùy biến</span>
                </button>

                <div className="border-t border-stone-800 my-1 pt-1">
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest px-2 pb-1">
                    Cánh Hoa Rơi
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    <button
                      onClick={() => {
                        onTogglePetals(true);
                        onChangePetalType('lotus');
                      }}
                      className={`px-2 py-1 rounded text-[11px] text-left ${
                        isPetalsEnabled && petalType === 'lotus'
                          ? 'bg-amber-950 text-amber-200 font-bold border border-amber-700/60'
                          : 'text-stone-400 hover:bg-stone-850'
                      }`}
                    >
                      🪷 Hoa Sen
                    </button>
                    <button
                      onClick={() => {
                        onTogglePetals(true);
                        onChangePetalType('mai_vang');
                      }}
                      className={`px-2 py-1 rounded text-[11px] text-left ${
                        isPetalsEnabled && petalType === 'mai_vang'
                          ? 'bg-amber-950 text-amber-200 font-bold border border-amber-700/60'
                          : 'text-stone-400 hover:bg-stone-850'
                      }`}
                    >
                      🌼 Mai Vàng
                    </button>
                    <button
                      onClick={() => {
                        onTogglePetals(true);
                        onChangePetalType('mai_trang');
                      }}
                      className={`px-2 py-1 rounded text-[11px] text-left ${
                        isPetalsEnabled && petalType === 'mai_trang'
                          ? 'bg-amber-950 text-amber-200 font-bold border border-amber-700/60'
                          : 'text-stone-400 hover:bg-stone-850'
                      }`}
                    >
                      🌸 Mai Trắng
                    </button>
                    <button
                      onClick={() => {
                        onTogglePetals(!isPetalsEnabled);
                      }}
                      className="px-2 py-1 rounded text-[11px] text-left text-stone-400 hover:bg-stone-850"
                    >
                      {isPetalsEnabled ? '✕ Tắt hoa' : '✓ Bật hoa'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setShowMobileNav((prev) => !prev)}
            className="md:hidden p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
            title="Menu chức năng"
          >
            {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Dropdown */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden relative z-40 bg-stone-950/98 border-b border-amber-800/60 backdrop-blur-md px-4 py-3 overflow-hidden text-xs font-serif shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2 mb-1">
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  onStartRitual();
                }}
                className="col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-amber-300 text-stone-950" />
                <span className="text-sm">Trang Nghi Lễ Thắp Nhang (10 Bước)</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  onOpenFamilyTree();
                }}
                className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5 text-amber-400 rotate-180" />
                <span>Cây Gia Phả</span>
              </button>
              {onOpenPedigreeChart && (
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenPedigreeChart();
                  }}
                  className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phả Đồ Hệ</span>
                </button>
              )}
              {onOpenClanEvents && (
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenClanEvents();
                  }}
                  className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📅 Lễ Giỗ Dòng Họ</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  onOpenPrayerModal();
                }}
                className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>✍️ Soạn Văn Khấn</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  onOpenAncestorManager();
                }}
                className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖼️ Di Ảnh Tiên Tổ</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  onOpenCustomInterfaceModal();
                }}
                className="py-2 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải Ảnh Bàn Thờ</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phòng Thờ Cổ Truyền Decorations (Pillars, couplets, carved frieze, hanging lanterns) */}
      <PhongThoDecorations isVisible={isPhongThoSpace} />

      {/* ========================================================================= */}
      {/* 2. SACRED HANGING PRAYER BANNER (Biển Khấn Treo Cung Kính)                */}
      {/* Styled as a lacquered plaque / silk scroll suspended above the altar      */}
      {/* ========================================================================= */}
      <div className="relative z-30 pt-3 px-4 flex flex-col items-center">
        {/* Gilded Lacquered Prayer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onOpenPrayerModal}
          className="group cursor-pointer max-w-lg px-6 py-2 rounded-sm bg-gradient-to-r from-stone-950 via-amber-950/80 to-stone-950 border-y border-amber-500/50 shadow-xl flex items-center gap-3 backdrop-blur-xs hover:border-amber-400 transition-all text-center"
          title="Nhấp để soạn lại văn khấn / tâm nguyện"
        >
          <span className="text-amber-500/80 text-xs select-none">✦</span>
          <p className="font-serif text-sm sm:text-base text-amber-100 font-medium tracking-wide">
            {(prayerText || 'Cầu cho hòa bình, gia đạo bình yên').normalize('NFC')}
          </p>
          <span className="text-amber-500/80 text-xs select-none">✦</span>
          <Edit3 className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-colors shrink-0 ml-1 opacity-0 group-hover:opacity-100" />
        </motion.div>

        {/* Active Custom Altar indicator badge */}
        {(customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl) && (
          <div
            onClick={onOpenCustomInterfaceModal}
            className="cursor-pointer mt-2 px-3.5 py-1 rounded-full bg-stone-900/90 hover:bg-stone-850 border border-amber-500/70 text-[11px] font-serif text-amber-200 flex items-center gap-2 shadow-lg backdrop-blur-xs transition-colors"
            title="Nhấp để tùy chỉnh độ sáng, vị trí hoặc đổi ảnh bàn thờ"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {customAltarConfig.mode === 'full_altar_photo'
                ? 'Đang dùng ảnh bàn thờ gia đình thật'
                : 'Đang dùng ảnh phòng thờ gia đình'}
            </span>
            <span className="text-amber-400 font-bold underline text-[10px]">Tùy Chỉnh</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN ALTAR CENTRAL SANCTUM                                             */}
      {/* Pure, uncluttered presentation of Ancestor(s) and Sacred Tabletop         */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-end pb-2 z-20 min-h-0 overflow-y-auto sm:overflow-visible">
        {/* Ancestor Display: Chóp Tháp Tam Cấp HOẶC Khung Đơn Ảnh */}
        {displayMode === 'pyramid' ? (
          <div className="mb-2 w-full">
            <PyramidAncestorStand
              ancestors={ancestors}
              activeAncestorId={activeAncestorId}
              onSelectActiveAncestor={onSelectActiveAncestor}
              onOpenAncestorManager={onOpenAncestorManager}
              onOpenFamilyTree={onOpenFamilyTree}
              familyMembers={familyMembers}
              onUpdateAncestors={onUpdateAncestors}
              onStartRitual={onStartRitual}
            />
          </div>
        ) : (
          <div className="mb-8 sm:mb-12 flex flex-col items-center">
            {activeAncestor ? (
              <div className="flex flex-col items-center">
                <AncestorFrame
                  ancestor={activeAncestor}
                  onClick={onOpenAncestorManager}
                  frameStyle={frameStyle}
                />

                {/* Subtle ancestor quick switcher when multiple ancestors exist */}
                {ancestors.length > 1 && (
                  <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/85 border border-amber-800/40 text-xs font-serif shadow-lg backdrop-blur-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = ancestors.findIndex((a) => a.id === activeAncestor.id);
                        const prevIndex = (currentIndex - 1 + ancestors.length) % ancestors.length;
                        onSelectActiveAncestor(ancestors[prevIndex].id);
                        playChime();
                      }}
                      className="p-1 rounded-full hover:bg-stone-800 text-amber-400 hover:text-amber-200 cursor-pointer transition-colors"
                      title="Chuyển sang di ảnh vị trước"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onOpenAncestorManager}
                      className="text-[11px] text-amber-200/90 hover:text-amber-100 flex items-center gap-1.5 cursor-pointer px-1"
                      title="Nhấp để mở danh sách quản lý di ảnh tiên tổ"
                    >
                      <span>Tiên Tổ</span>
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-700/50">
                        {ancestors.findIndex((a) => a.id === activeAncestor.id) + 1}/{ancestors.length}
                      </span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = ancestors.findIndex((a) => a.id === activeAncestor.id);
                        const nextIndex = (currentIndex + 1) % ancestors.length;
                        onSelectActiveAncestor(ancestors[nextIndex].id);
                        playChime();
                      }}
                      className="p-1 rounded-full hover:bg-stone-800 text-amber-400 hover:text-amber-200 cursor-pointer transition-colors"
                      title="Chuyển sang di ảnh vị kế tiếp"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAncestorManager}
                className="p-6 rounded-xl border border-dashed border-amber-700/60 bg-stone-950/80 text-amber-200 flex flex-col items-center gap-2 cursor-pointer hover:border-amber-400"
              >
                <Users className="w-8 h-8 text-amber-400" />
                <span className="font-serif text-xs">Dâng di ảnh tiên tổ lên bàn thờ</span>
              </button>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* 4. COMPLETE TRADITIONAL ALTAR TABLETOP                                */}
        {/* Bronze Censer, Water Cups, 5-Fruit Platter, Flower Vase & Candles     */}
        {/* ===================================================================== */}
        <div
          className="relative flex items-end justify-center w-full max-w-2xl px-4 transition-transform duration-300"
          style={{
            transform:
              customAltarConfig.mode === 'full_altar_photo'
                ? `translateY(${customAltarConfig.censerYOffset || 0}px)`
                : undefined,
          }}
        >
          {/* Left Flank: Candle + Fruit Platter (Hidden if user chooses to hide virtual table for full altar photo) */}
          {!(customAltarConfig.mode === 'full_altar_photo' && customAltarConfig.hideVirtualTable) && (
            <div className="flex items-end gap-3 sm:gap-6 mr-3 sm:mr-6">
              <div className="hidden sm:block pb-1">
                <FruitPlatter />
              </div>
              <div className="pb-1">
                <AltarCandle side="left" />
              </div>
            </div>
          )}

          {/* Centerpiece: Bronze Censer + Water Cup Offering Set */}
          <div
            ref={burnerRef}
            className="relative z-20 flex flex-col items-center transition-transform duration-300"
            style={{
              transform:
                customAltarConfig.censerScale && customAltarConfig.censerScale !== 1
                  ? `scale(${customAltarConfig.censerScale})`
                  : undefined,
            }}
          >
            {/* Bronze Incense Burner */}
            <BronzeBurner
              sticksCount={sticksCount}
              isBurning={hasAnyLit}
              incenseLit={altarIncenseLit}
              burnProgress={burnProgress}
              onLightStick={onLightAltarStick}
              showBurnerSticks={true}
            />

            {/* Traditional Carved Base under Censer */}
            <div className="w-36 h-2 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-sm border-t border-amber-700/60 shadow-lg -mt-1" />

            {/* Front Offering: Kỷ 3 Chén Nước Thờ Thanh Tịnh */}
            <div className="mt-1">
              <WaterCupSet />
            </div>
          </div>

          {/* Right Flank: Candle + Porcelain Lotus Flower Vase (Hidden if user chooses to hide virtual table) */}
          {!(customAltarConfig.mode === 'full_altar_photo' && customAltarConfig.hideVirtualTable) && (
            <div className="flex items-end gap-3 sm:gap-6 ml-3 sm:mr-6">
              <div className="pb-1">
                <AltarCandle side="right" />
              </div>
              <div className="hidden sm:block pb-1">
                <FlowerVase />
              </div>
            </div>
          )}
        </div>

        {/* Altar Master Wooden Tabletop Edge (Hidden if user chooses to hide virtual table) */}
        {!(customAltarConfig.mode === 'full_altar_photo' && customAltarConfig.hideVirtualTable) && (
          <div className="w-full max-w-3xl h-4 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 border-t border-amber-600/70 shadow-2xl mt-1 rounded-xs flex items-center justify-center">
            <div className="w-2/3 h-0.5 bg-amber-500/40" />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CEREMONIAL DOCK (Thanh Hành Lễ Tôn Nghiêm)                             */}
      {/* Anchored bottom bar: Clear visual hierarchy, no cluttered debug tables    */}
      {/* ========================================================================= */}
      <footer className="relative shrink-0 sticky bottom-0 z-30 px-3 sm:px-4 pt-2.5 pb-3 sm:pb-3.5 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {/* Main Action Strip */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Primary Action: KHỞI LỄ THẮP NHANG (10-Step Ritual) */}
            <button
              onClick={onStartRitual}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-serif font-bold text-xs sm:text-sm shadow-xl border border-amber-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] group"
            >
              <Flame className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
              <span>Khởi Lễ Thắp Nhang</span>
              <span className="text-[11px] text-amber-200/90 font-normal hidden sm:inline">
                · Nghi lễ 10 bước
              </span>
            </button>

            {/* 2. Tactile Gesture: CHẮP TAY KHẤN NGUYỆN (Hold to Bow & Pray) */}
            <button
              onMouseDown={() => setIsHoldingPrayer(true)}
              onMouseUp={() => {
                setIsHoldingPrayer(false);
                playChime();
              }}
              onMouseLeave={() => setIsHoldingPrayer(false)}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsHoldingPrayer(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setIsHoldingPrayer(false);
                playChime();
              }}
              onTouchCancel={() => setIsHoldingPrayer(false)}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all cursor-pointer select-none touch-none flex items-center justify-center gap-2 ${
                isHoldingPrayer
                  ? 'bg-amber-600 text-white border-amber-300 ring-2 ring-amber-400/60 scale-[0.98]'
                  : 'bg-stone-900 hover:bg-stone-850 border-amber-700/60 text-amber-200 hover:text-amber-100'
              }`}
              title="Ấn và giữ để chắp tay khấn vái trước bàn thờ"
            >
              <span className="text-base">🙏</span>
              <span className="font-serif font-bold text-xs sm:text-sm">
                {isHoldingPrayer ? 'Đang Khấn Vái...' : 'Chắp Tay Khấn'}
              </span>
              <span className="text-[10px] text-amber-400/80 font-serif hidden sm:inline">
                (Giữ để lạy)
              </span>
            </button>

            {/* 3. Ceremonial Configuration Drawer Trigger */}
            <button
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              className={`p-3 rounded-xl border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                showSettingsDrawer
                  ? 'bg-amber-950 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 hover:text-amber-200'
              }`}
              title="Cài đặt lễ nghi: Số nén, tư thế chắp tay, thời gian & kiểu bài vị"
            >
              <Settings2 className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Editorial Wisdom Pull-Quote */}
          <div className="text-center">
            <p className="font-serif text-xs text-stone-400 italic">
              “{(todayQuote.quote).normalize('NFC')}”
              <span className="text-[10px] text-stone-500 not-italic ml-2 font-sans">
                — {todayQuote.source}
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 6. CEREMONIAL SETTINGS DRAWER / POPOVER                                   */}
      {/* Curated configuration: Sticks, Poses, Display Mode, Frame Style, Duration */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs">
            {/* Backdrop click dismiss */}
            <div
              className="absolute inset-0"
              onClick={() => setShowSettingsDrawer(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-stone-950 text-stone-100 rounded-t-2xl sm:rounded-2xl border border-amber-700/60 shadow-2xl p-5 z-10 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-sm text-amber-200">
                    Tùy Thiết Nghi Lễ Thờ Tự
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-stone-400 hover:text-stone-200 text-sm px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* 0. Tùy Biến Bằng Ảnh Thật Của Gia Đình */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-600/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-900/90 border border-amber-500/70 flex items-center justify-center text-amber-300 shadow">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-xs text-amber-100 flex items-center gap-1.5">
                      Ảnh Bàn Thờ / Phòng Thờ Gia Đình
                    </h5>
                    <p className="text-[11px] text-stone-400">
                      {customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl
                        ? 'Đang dùng hình ảnh riêng do bạn tải lên'
                        : 'Tự tải ảnh bàn thờ thật tại nhà làm giao diện'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsDrawer(false);
                    onOpenCustomInterfaceModal();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-serif font-bold transition-all cursor-pointer shrink-0 shadow active:scale-95"
                >
                  {customAltarConfig.customBackdropUrl || customAltarConfig.fullAltarPhotoUrl
                    ? 'Chỉnh Sửa'
                    : 'Tải Ảnh'}
                </button>
              </div>

              {/* 1. Bố Cục Bàn Thờ (Đơn Ảnh vs Chóp Tháp Tam Cấp) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif text-stone-400">Bố Cục Bàn Thờ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeDisplayMode('single')}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      displayMode === 'single'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>🖼️ Đơn Ảnh Thờ</span>
                    {displayMode === 'single' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => onChangeDisplayMode('pyramid')}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      displayMode === 'pyramid'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>🔺 Chóp Tháp Tam Cấp</span>
                    {displayMode === 'pyramid' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* 2. Số Nén Nhang */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif text-stone-400">Số Nén Nhang</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeSticksCount(1)}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      sticksCount === 1
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>1 Nén (Tâm Hương)</span>
                    {sticksCount === 1 && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => onChangeSticksCount(3)}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      sticksCount === 3
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>3 Nén (Tam Bảo & Gia Tiên)</span>
                    {sticksCount === 3 && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* 3. Tư Thế Chắp Tay */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif text-stone-400">Tư Thế Chắp Tay Khấn</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onChangePose('pose_anjali')}
                    className={`py-2 px-2 rounded-lg border text-xs font-serif flex flex-col items-center gap-0.5 transition-colors ${
                      selectedPose === 'pose_anjali'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>Kẹp Nhang</span>
                    <span className="text-[10px] text-stone-500">Liên Hoa</span>
                  </button>
                  <button
                    onClick={() => onChangePose('pose_clasped')}
                    className={`py-2 px-2 rounded-lg border text-xs font-serif flex flex-col items-center gap-0.5 transition-colors ${
                      selectedPose === 'pose_clasped'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>Nắm Nhang</span>
                    <span className="text-[10px] text-stone-500">Cung Bái</span>
                  </button>
                  <button
                    onClick={() => onChangePose('pose_fingertips')}
                    className={`py-2 px-2 rounded-lg border text-xs font-serif flex flex-col items-center gap-0.5 transition-colors ${
                      selectedPose === 'pose_fingertips'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>Chụm Đầu Ngón</span>
                    <span className="text-[10px] text-stone-500">Âm Dương</span>
                  </button>
                </div>
              </div>

              {/* 4. Phong Cách Khung Ảnh Nhật Bản (Urushi vs Hinoki) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif text-stone-400">Phong Cách Khung Ảnh Thờ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleFrameStyle('urushi')}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      frameStyle === 'urushi'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>漆 Sơn Mài Đen Urushi</span>
                    {frameStyle === 'urushi' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => handleToggleFrameStyle('hinoki')}
                    className={`py-2 px-3 rounded-lg border text-xs font-serif flex items-center justify-center gap-1.5 transition-colors ${
                      frameStyle === 'hinoki'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>檜 Gỗ Mộc Hinoki</span>
                    {frameStyle === 'hinoki' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* 5. Thời Gian Tàn Nhang */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif text-stone-400">Thời Gian Tàn Nhang</label>
                <div className="grid grid-cols-3 gap-2">
                  {([5, 10, 15] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => onChangeDuration(m)}
                      className={`py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                        durationMinutes === m
                          ? 'bg-amber-950 border-amber-500 text-amber-200 font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {m} Phút
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Quick Ancestor Management Access */}
              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowSettingsDrawer(false);
                    onOpenAncestorManager();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-serif text-stone-300 hover:text-amber-200 transition-colors"
                >
                  Quản Lý Di Ảnh Tiên Tổ...
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smoke Customizer Modal */}
      <SmokeCustomizerModal
        isOpen={showSmokeModal}
        onClose={() => setShowSmokeModal(false)}
        config={smokeConfig}
        onChangeConfig={setSmokeConfig}
      />
    </motion.div>
  );
};
