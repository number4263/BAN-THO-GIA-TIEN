import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Camera,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  HelpCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { CustomAltarConfig, CustomAltarMode } from '../types.ts';
import bgAltarSanctuaryReal from '../assets/images/altar_sanctuary_vietnam_real_1790415926141.jpg';
import bgAncestralAltarGilded from '../assets/images/ancestral_altar_table_gilded_1790415937805.jpg';
import bgPhongThoHall from '../assets/images/phong_tho_hall_1790098046825.jpg';

interface CustomInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomAltarConfig;
  onSaveConfig: (newConfig: CustomAltarConfig) => void;
  onOpenAncestorManager?: () => void;
}

const PRESET_SANCTUARIES = [
  {
    id: 'preset_real_sanctuary',
    title: 'Gian Thờ Sơn Son Thếp Vàng',
    subtitle: 'Cột gỗ lim, hoành phi dát vàng, ấm cúng trang nghiêm',
    url: bgAltarSanctuaryReal,
    tag: 'Đề xuất',
  },
  {
    id: 'preset_gilded_altar',
    title: 'Án Gian Gỗ Gụ Khắc Long Phụng',
    subtitle: 'Án gian sơn son thếp vàng, đồ thờ tam khí',
    url: bgAncestralAltarGilded,
    tag: 'Hoàng gia',
  },
  {
    id: 'preset_classic_hall',
    title: 'Phòng Thờ Gia Tiên Cổ Điển',
    subtitle: 'Không gian gỗ trầm mặc, lồng đèn tỏa sáng',
    url: bgPhongThoHall,
    tag: 'Cổ điển',
  },
];

export const CustomInterfaceModal: React.FC<CustomInterfaceModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'guide'>('upload');

  // Form draft state
  const [mode, setMode] = useState<CustomAltarMode>(config.mode);
  const [customBackdropUrl, setCustomBackdropUrl] = useState<string>(config.customBackdropUrl || '');
  const [fullAltarPhotoUrl, setFullAltarPhotoUrl] = useState<string>(config.fullAltarPhotoUrl || '');
  const [dimOverlay, setDimOverlay] = useState<number>(config.dimOverlay ?? 25);
  const [warmthFilter, setWarmthFilter] = useState<number>(config.warmthFilter ?? 20);
  const [blurBackdrop, setBlurBackdrop] = useState<number>(config.blurBackdrop ?? 0);
  const [censerYOffset, setCenserYOffset] = useState<number>(config.censerYOffset ?? 0);
  const [censerScale, setCenserScale] = useState<number>(config.censerScale ?? 1);
  const [hideVirtualTable, setHideVirtualTable] = useState<boolean>(config.hideVirtualTable ?? false);

  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process file upload (compress to suitable Data URL if large)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Automatically select target slot based on current mode
        if (mode === 'full_altar_photo') {
          setFullAltarPhotoUrl(result);
        } else {
          setCustomBackdropUrl(result);
          if (mode === 'standard') {
            setMode('real_photo_backdrop');
          }
        }
        setSuccessToast('Đã tải ảnh lên thành công!');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc tệp ảnh. Vui lòng thử lại với ảnh khác.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    if (mode === 'full_altar_photo') {
      setFullAltarPhotoUrl(urlInput.trim());
    } else {
      setCustomBackdropUrl(urlInput.trim());
      if (mode === 'standard') {
        setMode('real_photo_backdrop');
      }
    }
    setUrlInput('');
    setSuccessToast('Đã áp dụng liên kết ảnh thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSave = () => {
    const updated: CustomAltarConfig = {
      mode,
      customBackdropUrl: customBackdropUrl || undefined,
      fullAltarPhotoUrl: fullAltarPhotoUrl || undefined,
      dimOverlay,
      warmthFilter,
      blurBackdrop,
      censerYOffset,
      censerScale,
      hideVirtualTable,
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleResetToStandard = () => {
    setMode('standard');
    setCustomBackdropUrl('');
    setFullAltarPhotoUrl('');
    setDimOverlay(20);
    setWarmthFilter(15);
    setBlurBackdrop(0);
    setCenserYOffset(0);
    setCenserScale(1);
    setHideVirtualTable(false);
    onSaveConfig({
      mode: 'standard',
      customBackdropUrl: undefined,
      fullAltarPhotoUrl: undefined,
      dimOverlay: 20,
      warmthFilter: 15,
      blurBackdrop: 0,
      censerYOffset: 0,
      censerScale: 1,
      hideVirtualTable: false,
    });
    setSuccessToast('Đã khôi phục giao diện mặc định');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const currentPreviewImage =
    mode === 'full_altar_photo'
      ? fullAltarPhotoUrl || bgAncestralAltarGilded
      : customBackdropUrl || bgAltarSanctuaryReal;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-stone-900 border border-amber-600/60 rounded-2xl shadow-2xl text-stone-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/60 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-inner">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 flex items-center gap-2">
                  Đưa Ảnh Của Bạn Làm Giao Diện Bàn Thờ
                </h3>
                <p className="text-xs text-stone-400">
                  Tải ảnh bàn thờ hoặc phòng thờ gia đình bạn để biến app thành không gian thờ thật
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-4 text-xs font-serif font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-amber-400 text-amber-300 bg-stone-900/50'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Tải Ảnh Từ Máy / Chụp Ảnh Thật</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-4 text-xs font-serif font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-amber-400 text-amber-300 bg-stone-900/50'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Bộ Sưu Tập Gian Thờ Cao Cấp</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-4 text-xs font-serif font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-amber-400 text-amber-300 bg-stone-900/50'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hướng Dẫn Từng Bước</span>
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Success toast */}
            {successToast && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* TAB 1: UPLOAD & CUSTOMIZE */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* 1. Select Mode */}
                <div>
                  <label className="block text-xs font-serif font-bold text-amber-200 uppercase tracking-wider mb-2">
                    1. Chọn Hình Thức Sử Dụng Ảnh Của Bạn
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A: Sanctuary Backdrop */}
                    <div
                      onClick={() => setMode('real_photo_backdrop')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        mode === 'real_photo_backdrop'
                          ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/50'
                          : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-sm text-stone-100 flex items-center gap-2">
                          🏛️ Ảnh Nền Phòng Thờ Thật
                        </span>
                        {mode === 'real_photo_backdrop' && (
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Đặt ảnh chụp không gian gian thờ của bạn làm nền chính. Giữ nguyên lư hương đồng và nến ảo để thắp nhang tương tác.
                      </p>
                    </div>

                    {/* Option B: Full Altar Table Photo */}
                    <div
                      onClick={() => setMode('full_altar_photo')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        mode === 'full_altar_photo'
                          ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/50'
                          : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-sm text-stone-100 flex items-center gap-2">
                          📸 Bàn Thờ Thật Toàn Phần (Độc Bản)
                        </span>
                        {mode === 'full_altar_photo' && (
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Chụp trọn vẹn cả bàn thờ gia đình bạn. Hiển thị 100% ảnh thật, phủ khói nhang bay bổng và cắm nhang trực tiếp lên bàn thờ thật.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Drag & Drop Upload Zone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider">
                      2. Tải Ảnh Bàn Thờ / Phòng Thờ Của Bạn
                    </label>
                    <span className="text-[11px] text-stone-400">Hỗ trợ JPG, PNG, WebP (Tự lưu vào máy)</span>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                      isDragging
                        ? 'border-amber-400 bg-amber-950/50'
                        : 'border-stone-700 hover:border-amber-500/80 bg-stone-950/70 hover:bg-stone-950'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-300 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>

                    <p className="font-serif font-bold text-sm text-stone-100 mb-1">
                      Kéo thả ảnh vào đây, hoặc click để chọn tệp từ máy
                    </p>
                    <p className="text-xs text-stone-400 max-w-md">
                      Bạn có thể dùng điện thoại chụp trực tiếp bàn thờ ở nhà rồi tải lên ngay. Ảnh được lưu riêng trên thiết bị của bạn.
                    </p>

                    {/* Camera Button for mobile */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chụp Bằng Máy Ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Chọn Tệp Ảnh</span>
                      </button>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-rose-400 mt-2">{uploadError}</p>
                    )}
                  </div>

                  {/* Or paste URL */}
                  <div className="mt-3 flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="Hoặc dán đường link ảnh trực tuyến (https://...)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                    >
                      Dùng Link Này
                    </button>
                  </div>
                </div>

                {/* 3. Live Preview & Visual Tuning */}
                <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-amber-200">
                        3. Tinh Chỉnh Thị Giác Bàn Thờ
                      </span>
                    </div>
                    {(customBackdropUrl || fullAltarPhotoUrl) && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có ảnh tùy biến
                      </span>
                    )}
                  </div>

                  {/* Visual Preview Box */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-700 bg-stone-900 flex items-center justify-center">
                    <img
                      src={currentPreviewImage}
                      alt="Preview Altar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all"
                      style={{
                        filter: `brightness(${100 - dimOverlay * 0.7}%) sepia(${warmthFilter}%) blur(${blurBackdrop}px)`,
                      }}
                    />

                    {/* Dim Overlay simulator */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                      style={{ opacity: dimOverlay / 100 }}
                    />

                    {/* Mini Incense Censer simulator to preview position */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                      style={{
                        bottom: `${35 - censerYOffset * 0.25}%`,
                        transform: `translateX(-50%) scale(${censerScale})`,
                      }}
                    >
                      <div className="w-2.5 h-10 bg-amber-400/80 blur-xs rounded-full animate-pulse" />
                      <div className="w-12 h-6 bg-gradient-to-b from-amber-700 to-stone-900 rounded-b-md border border-amber-500/70 shadow-lg flex items-center justify-center">
                        <span className="text-[8px] text-amber-300 font-serif">Lư Hương</span>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono text-stone-300 border border-stone-800">
                      Chế độ:{' '}
                      <span className="text-amber-300 font-bold">
                        {mode === 'full_altar_photo' ? 'Bàn Thờ Thật Toàn Phần' : 'Ảnh Nền Gian Thờ'}
                      </span>
                    </div>
                  </div>

                  {/* Fine Tuning Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Dim Overlay */}
                    <div>
                      <div className="flex justify-between text-xs text-stone-300 mb-1">
                        <span>Độ tối hậu cảnh (Dim):</span>
                        <span className="font-mono text-amber-400">{dimOverlay}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="70"
                        value={dimOverlay}
                        onChange={(e) => setDimOverlay(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Tăng độ tối để nến sáng và khói nhang hiển thị rõ nét hơn
                      </p>
                    </div>

                    {/* Warmth Filter */}
                    <div>
                      <div className="flex justify-between text-xs text-stone-300 mb-1">
                        <span>Độ ấm ánh nến (Warmth):</span>
                        <span className="font-mono text-amber-400">{warmthFilter}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={warmthFilter}
                        onChange={(e) => setWarmthFilter(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Tạo tông màu ấm cúng, truyền thống tự nhiên
                      </p>
                    </div>

                    {/* Censer Y Offset (position) */}
                    <div>
                      <div className="flex justify-between text-xs text-stone-300 mb-1">
                        <span>Vị trí Lư Hương ảo:</span>
                        <span className="font-mono text-amber-400">{censerYOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={censerYOffset}
                        onChange={(e) => setCenserYOffset(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Kéo trượt để đặt lư hương khớp vị trí trên bàn thờ thật của bạn
                      </p>
                    </div>

                    {/* Hide virtual table checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        id="hideTableCheckbox"
                        type="checkbox"
                        checked={hideVirtualTable}
                        onChange={(e) => setHideVirtualTable(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="hideTableCheckbox" className="text-xs text-stone-300 cursor-pointer">
                        <strong className="text-amber-200">Ẩn bàn thờ ảo</strong> (Khuyến nghị khi dùng ảnh toàn cảnh bàn thờ thật)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRESET SANCTUARIES */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-200">
                      Bộ Sưu Tập Gian Thờ Cổ Truyền Việt Nam Tuyệt Đẹp
                    </h4>
                    <p className="text-xs text-stone-400">
                      Nếu chưa có ảnh thật, bạn có thể chọn các bối cảnh chuẩn bảo tàng và di sản văn hóa dưới đây (đã loại bỏ giao diện demo)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PRESET_SANCTUARIES.map((preset) => {
                    const isSelected =
                      (mode === 'real_photo_backdrop' && customBackdropUrl === preset.url) ||
                      (mode === 'full_altar_photo' && fullAltarPhotoUrl === preset.url);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setCustomBackdropUrl(preset.url);
                          setMode('real_photo_backdrop');
                          setSuccessToast(`Đã áp dụng ${preset.title}!`);
                          setTimeout(() => setSuccessToast(null), 3000);
                        }}
                        className={`group relative rounded-xl border overflow-hidden flex flex-col cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-500/50 bg-stone-850'
                            : 'border-stone-800 hover:border-amber-600/70 bg-stone-950/60'
                        }`}
                      >
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow">
                            {preset.tag}
                          </span>
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-950/40 border-2 border-amber-400 flex items-center justify-center">
                              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow">
                                <Check className="w-3.5 h-3.5" /> Đang dùng
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h5 className="font-serif font-bold text-xs text-amber-100 group-hover:text-amber-300 transition-colors">
                            {preset.title}
                          </h5>
                          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                            {preset.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STEP BY STEP GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4 text-xs text-stone-300 leading-relaxed font-sans">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Cách đưa hình ảnh bàn thờ thật của gia đình bạn vào ứng dụng:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2.5">
                    <li>
                      <strong className="text-amber-100">Bước 1: Chụp ảnh bàn thờ gia đình</strong>
                      <p className="text-stone-400 mt-0.5">
                        Dùng điện thoại đứng đối diện bàn thờ gia tiên ở nhà bạn (khoảng cách 1.5m - 2.5m). Chụp ngang (tỉ lệ 16:9 hoặc 4:3), bật đèn phòng thờ ấm cúng để ảnh rõ nét, trang nghiêm.
                      </p>
                    </li>
                    <li>
                      <strong className="text-amber-100">Bước 2: Tải ảnh vào ứng dụng</strong>
                      <p className="text-stone-400 mt-0.5">
                        Tại tab <strong className="text-amber-300">"Tải Ảnh Từ Máy"</strong>, bấm vào ô chọn tệp hoặc chụp trực tiếp từ điện thoại. Bạn có thể chọn chế độ <em>"Ảnh Nền Phòng Thờ"</em> hoặc <em>"Bàn Thờ Thật Toàn Phần"</em>.
                      </p>
                    </li>
                    <li>
                      <strong className="text-amber-100">Bước 3: Tinh chỉnh và lưu lại</strong>
                      <p className="text-stone-400 mt-0.5">
                        Kéo thanh trượt điều chỉnh độ tối (Dim) và vị trí lư hương ảo để khớp với bát hương thật trên ảnh. Bấm <strong className="text-amber-300">"Lưu & Áp Dụng Ngay"</strong>.
                      </p>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950/60">
                    <h5 className="font-serif font-bold text-amber-300 mb-1">
                      🔒 Bảo mật hình ảnh thế nào?
                    </h5>
                    <p className="text-stone-400">
                      Hình ảnh của bạn được lưu hoàn toàn trên bộ nhớ thiết bị của bạn (Local Storage trình duyệt). Không có bất kỳ hình ảnh riêng tư nào bị tải lên máy chủ công cộng.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950/60">
                    <h5 className="font-serif font-bold text-amber-300 mb-1">
                      🖼️ Thay di ảnh tổ tiên thế nào?
                    </h5>
                    <p className="text-stone-400">
                      Bạn có thể bấm vào mục <strong>"Di Ảnh Tiên Tổ"</strong> trên thanh điều hướng để tải ảnh chân dung Cụ Thủy Tổ, Ông Bà, Cha Mẹ lên từng khung thờ dát vàng.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
            <button
              onClick={handleResetToStandard}
              className="px-3.5 py-1.5 text-xs rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Mặc Định</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Lưu & Áp Dụng Ngay</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
