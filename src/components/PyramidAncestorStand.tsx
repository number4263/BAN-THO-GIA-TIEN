import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ancestor, FamilyMember } from '../types.ts';
import { Sparkles, Plus, Edit2, Users, Check, ChevronUp, Info, Eye } from 'lucide-react';
import { playBellSound, playChime } from '../utils/audio.ts';

interface PyramidAncestorStandProps {
  ancestors: Ancestor[];
  activeAncestorId: string;
  onSelectActiveAncestor: (id: string) => void;
  onOpenAncestorManager: () => void;
  onOpenFamilyTree?: () => void;
  familyMembers?: FamilyMember[];
  onUpdateAncestors: (ancestors: Ancestor[]) => void;
  onStartRitual?: () => void;
}

export const PyramidAncestorStand: React.FC<PyramidAncestorStandProps> = ({
  ancestors,
  activeAncestorId,
  onSelectActiveAncestor,
  onOpenAncestorManager,
  onOpenFamilyTree,
  familyMembers = [],
  onUpdateAncestors,
  onStartRitual,
}) => {
  const [selectedAncestor, setSelectedAncestor] = useState<Ancestor | null>(null);
  const [assigningSlot, setAssigningSlot] = useState<{ tier: 1 | 2 | 3; order: number } | null>(null);

  // Filter or group ancestors into pyramid tiers:
  // Tier 1: Apex (1 ancestor)
  // Tier 2: Middle (2 ancestors: left, right)
  // Tier 3: Base (3 ancestors: left, center, right)
  const getSlotAncestor = (tier: 1 | 2 | 3, order: number): Ancestor | undefined => {
    // 1. First check explicit pyramidTier & order
    const explicit = ancestors.find((a) => a.pyramidTier === tier && a.pyramidOrder === order);
    if (explicit) return explicit;

    // 2. If not explicitly assigned, provide smart default fallbacks based on index or relation
    if (tier === 1 && order === 1) {
      return (
        ancestors.find((a) => a.pyramidTier === 1) ||
        ancestors.find((a) => a.relation.toLowerCase().includes('tổ') || a.relation.toLowerCase().includes('cố')) ||
        ancestors[0]
      );
    }
    if (tier === 2) {
      const tier2List = ancestors.filter((a) => a.pyramidTier === 2);
      if (tier2List[order - 1]) return tier2List[order - 1];

      // Fallbacks for grandparents
      const grandAncestors = ancestors.filter(
        (a) =>
          !a.pyramidTier &&
          (a.relation.toLowerCase().includes('cụ') || a.relation.toLowerCase().includes('ông') || a.relation.toLowerCase().includes('bà'))
      );
      if (grandAncestors[order - 1]) return grandAncestors[order - 1];
      if (ancestors[order]) return ancestors[order];
    }
    if (tier === 3) {
      const tier3List = ancestors.filter((a) => a.pyramidTier === 3);
      if (tier3List[order - 1]) return tier3List[order - 1];

      // Fallbacks for parents / uncles
      const parentAncestors = ancestors.filter(
        (a) =>
          !a.pyramidTier &&
          (a.relation.toLowerCase().includes('cha') || a.relation.toLowerCase().includes('mẹ') || a.relation.toLowerCase().includes('bác') || a.relation.toLowerCase().includes('chú'))
      );
      if (parentAncestors[order - 1]) return parentAncestors[order - 1];
      if (ancestors[order + 2]) return ancestors[order + 2];
    }

    return undefined;
  };

  const top1 = getSlotAncestor(1, 1);
  const midLeft = getSlotAncestor(2, 1);
  const midRight = getSlotAncestor(2, 2);
  const botLeft = getSlotAncestor(3, 1);
  const botMid = getSlotAncestor(3, 2);
  const botRight = getSlotAncestor(3, 3);

  const handleSelectSlot = (ancestor: Ancestor | undefined, tier: 1 | 2 | 3, order: number) => {
    if (ancestor) {
      setSelectedAncestor(ancestor);
      onSelectActiveAncestor(ancestor.id);
      playChime();
    } else {
      setAssigningSlot({ tier, order });
    }
  };

  const handleAssignAncestor = (ancestorId: string) => {
    if (!assigningSlot) return;
    const { tier, order } = assigningSlot;

    const updated = ancestors.map((a) => {
      // Clear anyone currently in that tier + order
      if (a.pyramidTier === tier && a.pyramidOrder === order) {
        return { ...a, pyramidTier: undefined, pyramidOrder: undefined };
      }
      if (a.id === ancestorId) {
        return { ...a, pyramidTier: tier, pyramidOrder: order };
      }
      return a;
    });

    onUpdateAncestors(updated);
    setAssigningSlot(null);
    playBellSound();
  };

  // Auto assign from genealogy / generation logic
  const handleAutoOrganizePyramid = () => {
    const updated = [...ancestors];
    // Sort: generation 1 or "Tổ"/"Cố" first, then "Ông"/"Bà", then "Cha"/"Mẹ"
    const sorted = [...updated].sort((a, b) => {
      const getScore = (anc: Ancestor) => {
        const r = anc.relation.toLowerCase();
        if (r.includes('thủy tổ') || r.includes('cao tổ') || r.includes('tổ tiên')) return 1;
        if (r.includes('cụ') || r.includes('cố')) return 2;
        if (r.includes('ông') || r.includes('bà')) return 3;
        if (r.includes('cha') || r.includes('mẹ')) return 4;
        return 5;
      };
      return getScore(a) - getScore(b);
    });

    // Assign top 1
    if (sorted[0]) {
      sorted[0].pyramidTier = 1;
      sorted[0].pyramidOrder = 1;
    }
    // Assign middle 2
    if (sorted[1]) {
      sorted[1].pyramidTier = 2;
      sorted[1].pyramidOrder = 1;
    }
    if (sorted[2]) {
      sorted[2].pyramidTier = 2;
      sorted[2].pyramidOrder = 2;
    }
    // Assign bottom 3
    if (sorted[3]) {
      sorted[3].pyramidTier = 3;
      sorted[3].pyramidOrder = 1;
    }
    if (sorted[4]) {
      sorted[4].pyramidTier = 3;
      sorted[4].pyramidOrder = 2;
    }
    if (sorted[5]) {
      sorted[5].pyramidTier = 3;
      sorted[5].pyramidOrder = 3;
    }

    onUpdateAncestors(sorted);
    playBellSound();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none px-2">
      {/* ======================================================================= */}
      {/* 1. HOÀNH PHI & CÂU ĐỐI GỖ SƠN SON THẾP VÀNG PHÒNG THỜ                    */}
      {/* ======================================================================= */}
      <div className="w-full flex items-center justify-between mb-2 px-1 sm:px-6">
        {/* Câu đối vế trái */}
        <div className="hidden md:flex flex-col items-center justify-center py-2 px-1.5 rounded-sm bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 border border-amber-600/70 shadow-lg text-[10px] font-serif font-bold text-amber-300 tracking-widest leading-loose writing-vertical">
          <span>TỔ</span>
          <span>TÔNG</span>
          <span>CÔNG</span>
          <span>ĐỨC</span>
          <span>THIÊN</span>
          <span>NIÊN</span>
          <span>THỊNH</span>
        </div>

        {/* Hoành Phi Trung Tâm "ĐỨC LƯU QUANG" */}
        <div className="mx-auto flex flex-col items-center">
          <div className="relative px-6 py-1.5 rounded-md bg-gradient-to-r from-red-950 via-stone-950 to-red-950 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center">
            {/* Corner ornaments */}
            <div className="absolute top-0.5 left-1 text-[9px] text-amber-400">❖</div>
            <div className="absolute top-0.5 right-1 text-[9px] text-amber-400">❖</div>
            <div className="absolute bottom-0.5 left-1 text-[9px] text-amber-400">❖</div>
            <div className="absolute bottom-0.5 right-1 text-[9px] text-amber-400">❖</div>

            <div className="text-center">
              <span className="font-serif font-extrabold text-sm sm:text-base tracking-[0.25em] text-amber-200 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                ĐỨC LƯU QUANG
              </span>
              <span className="block text-[8px] font-serif text-amber-400/80 -mt-0.5 tracking-wider">
                德 流 光 • PHỤNG GIA TIÊN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-amber-400 font-serif italic">
              Bàn Thờ Tam Cấp • Tháp Di Ảnh Gia Tiên
            </span>
            <button
              onClick={handleAutoOrganizePyramid}
              className="text-[9px] text-amber-300/80 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-serif cursor-pointer transition-colors"
              title="Tự động xếp đặt ảnh theo tôn ti thứ bậc đời trước đến đời sau"
            >
              ⚡ Sắp xếp tự động
            </button>
          </div>
        </div>

        {/* Câu đối vế phải */}
        <div className="hidden md:flex flex-col items-center justify-center py-2 px-1.5 rounded-sm bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 border border-amber-600/70 shadow-lg text-[10px] font-serif font-bold text-amber-300 tracking-widest leading-loose writing-vertical">
          <span>TỬ</span>
          <span>HIẾU</span>
          <span>TÔN</span>
          <span>HIỀN</span>
          <span>VẠN</span>
          <span>ĐẠI</span>
          <span>VINH</span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. CHÓP THÁP DI ẢNH TAM CẤP (PYRAMID ANCESTOR TIERS)                    */}
      {/* ======================================================================= */}
      <div className="relative w-full flex flex-col items-center pt-2 pb-1">
        {/* Soft Golden Spiritual Halo behind the Pyramid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-80 bg-radial from-amber-600/15 via-amber-800/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* ------------------------------------------------------------------- */}
        {/* TẦNG 1: ĐỈNH THÁP (TIER 1 - APEX: CỤ THỦY TỔ / CAO TẰNG)            */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col items-center relative z-30 mb-2">
          {/* Badge Cấp 1 */}
          <div className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/70 shadow text-[9px] font-serif text-amber-300 font-bold uppercase tracking-wider">
            <span>👑</span>
            <span>Đỉnh Tháp • Tiên Tổ</span>
          </div>

          <PyramidSlot
            ancestor={top1}
            tier={1}
            order={1}
            isActive={top1?.id === activeAncestorId}
            onSelect={() => handleSelectSlot(top1, 1, 1)}
            labelDefault="Cụ Thủy Tổ / Tiên Linh"
            size="large"
          />

          {/* Stepped Pedestal Shelf for Tier 1 */}
          <div className="w-48 sm:w-56 h-3 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 rounded-t-sm border-t border-amber-600/80 shadow-md mt-1 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70" />
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TẦNG 2: TẦNG GIỮA (TIER 2 - MIDDLE: ÔNG BÀ NỘI / NGOẠI)              */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col items-center relative z-25 mb-2 w-full">
          {/* Badge Cấp 2 */}
          <div className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/90 border border-amber-700/70 shadow text-[9px] font-serif text-amber-300/90 tracking-wider">
            <span>Tầng Giữa • Cụ Ông & Cụ Bà</span>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
            <PyramidSlot
              ancestor={midLeft}
              tier={2}
              order={1}
              isActive={midLeft?.id === activeAncestorId}
              onSelect={() => handleSelectSlot(midLeft, 2, 1)}
              labelDefault="Cụ Ông / Ông Nội"
              size="medium"
            />

            <PyramidSlot
              ancestor={midRight}
              tier={2}
              order={2}
              isActive={midRight?.id === activeAncestorId}
              onSelect={() => handleSelectSlot(midRight, 2, 2)}
              labelDefault="Cụ Bà / Bà Nội"
              size="medium"
            />
          </div>

          {/* Stepped Pedestal Shelf for Tier 2 */}
          <div className="w-80 sm:w-96 h-3 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 rounded-t-sm border-t border-amber-600/70 shadow-md mt-1 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent opacity-60" />
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TẦNG 3: TẦNG HẠ / TIỀN CẤP (TIER 3 - BASE: CHA MẸ, CÔ CHÚ BÁC)       */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col items-center relative z-20 w-full">
          {/* Badge Cấp 3 */}
          <div className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/90 border border-stone-800 shadow text-[9px] font-serif text-amber-400/80 tracking-wider">
            <span>Tầng Hạ • Cha Mẹ & Thân Tộc</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
            <PyramidSlot
              ancestor={botLeft}
              tier={3}
              order={1}
              isActive={botLeft?.id === activeAncestorId}
              onSelect={() => handleSelectSlot(botLeft, 3, 1)}
              labelDefault="Cha / Bác Trưởng"
              size="small"
            />

            <PyramidSlot
              ancestor={botMid}
              tier={3}
              order={2}
              isActive={botMid?.id === activeAncestorId}
              onSelect={() => handleSelectSlot(botMid, 3, 2)}
              labelDefault="Mẹ / Thân Tộc"
              size="small"
            />

            <PyramidSlot
              ancestor={botRight}
              tier={3}
              order={3}
              isActive={botRight?.id === activeAncestorId}
              onSelect={() => handleSelectSlot(botRight, 3, 3)}
              labelDefault="Cô Chú / Người Thân"
              size="small"
            />
          </div>

          {/* Wide Base Tabletop Platform for Tier 3 */}
          <div className="w-full max-w-xl h-4 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 rounded-sm border-t-2 border-amber-600 shadow-xl mt-1.5 flex items-center justify-center relative">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <div className="absolute -bottom-1 w-11/12 h-1 bg-stone-950/80 rounded-full blur-xs" />
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. DETAIL DRAWER FOR CURRENTLY SELECTED ANCESTOR IN PYRAMID             */}
      {/* ======================================================================= */}
      <AnimatePresence>
        {selectedAncestor && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full mt-3 p-3 rounded-xl bg-stone-950/95 border border-amber-600/70 shadow-2xl text-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 rounded-md overflow-hidden border border-amber-500/80 shadow shrink-0 bg-stone-900 relative">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={selectedAncestor.id + (selectedAncestor.avatarUrl || 'default')}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    src={selectedAncestor.avatarUrl}
                    alt={selectedAncestor.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm text-amber-200">
                    {selectedAncestor.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 font-serif">
                    {selectedAncestor.relation}
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-serif">
                  Hưởng thọ: {selectedAncestor.birthYear || '?'} — {selectedAncestor.deathYear || '?'}
                </p>
                {selectedAncestor.epitaph && (
                  <p className="text-[11px] text-amber-300/80 italic font-serif truncate max-w-xs sm:max-w-md">
                    "{selectedAncestor.epitaph}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onSelectActiveAncestor(selectedAncestor.id);
                  playChime();
                }}
                className={`px-3 py-1.5 rounded-lg font-serif text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  selectedAncestor.id === activeAncestorId
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-700/60'
                }`}
              >
                <span>🙏</span>
                <span>{selectedAncestor.id === activeAncestorId ? 'Đang Khấn Vị Này' : 'Chuyển Tâm Điểm Khấn'}</span>
              </button>
              {onStartRitual && (
                <button
                  onClick={() => {
                    onSelectActiveAncestor(selectedAncestor.id);
                    onStartRitual();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                  title="Khởi lễ thắp nhang cho vị tiên tổ này"
                >
                  <span>🔥</span>
                  <span>Thắp Nhang</span>
                </button>
              )}
              <button
                onClick={() => setSelectedAncestor(null)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================================= */}
      {/* 4. MODAL / DRAWER TO ASSIGN ANCESTOR TO EMPTY SLOT                      */}
      {/* ======================================================================= */}
      <AnimatePresence>
        {assigningSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-stone-900 border border-amber-600 rounded-xl shadow-2xl p-5 text-stone-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔺</span>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-200">
                      Chọn Di Ảnh Cho {assigningSlot.tier === 1 ? 'Đỉnh Tháp' : assigningSlot.tier === 2 ? 'Tầng Giữa' : 'Tầng Hạ'} (Vị trí {assigningSlot.order})
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Gắn bài vị người thân vào bậc tam cấp của chóp tháp gia tiên
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssigningSlot(null)}
                  className="p-1 rounded-md text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {ancestors.map((anc) => (
                  <button
                    key={anc.id}
                    onClick={() => handleAssignAncestor(anc.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/80 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-11 rounded overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                        <img
                          src={anc.avatarUrl}
                          alt={anc.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="font-serif font-medium text-xs text-amber-100 group-hover:text-amber-300">
                          {anc.name}
                        </p>
                        <p className="text-[10px] text-stone-400 font-serif">
                          {anc.relation} ({anc.birthYear || '?'} - {anc.deathYear || '?'})
                        </p>
                      </div>
                    </div>
                    {anc.pyramidTier ? (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                        Đang ở Cấp {anc.pyramidTier}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-serif font-bold group-hover:translate-x-1 transition-transform">
                        Chọn ➔
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <button
                  onClick={() => {
                    setAssigningSlot(null);
                    onOpenAncestorManager();
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-serif flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm ảnh mới vào danh sách
                </button>
                <button
                  onClick={() => setAssigningSlot(null)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-serif hover:bg-stone-700"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Subcomponent: Individual Slot within the Pyramid Stand
const PyramidSlot: React.FC<{
  ancestor?: Ancestor;
  tier: 1 | 2 | 3;
  order: number;
  isActive: boolean;
  onSelect: () => void;
  labelDefault: string;
  size: 'large' | 'medium' | 'small';
}> = ({ ancestor, tier: _tier, order: _order, isActive, onSelect, labelDefault, size }) => {
  const sizeClasses = {
    large: 'w-24 sm:w-28 aspect-[280/380]',
    medium: 'w-20 sm:w-24 aspect-[280/380]',
    small: 'w-16 sm:w-20 aspect-[280/380]',
  }[size];

  if (!ancestor) {
    return (
      <button
        onClick={onSelect}
        className={`${sizeClasses} rounded-lg border-2 border-dashed border-amber-800/60 hover:border-amber-400 bg-stone-950/60 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group`}
        title="Nhấp để gán di ảnh người thân vào vị trí này"
      >
        <div className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-600/70 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform mb-1">
          <Plus className="w-3.5 h-3.5" />
        </div>
        <span className="text-[9px] font-serif text-amber-300/80 leading-tight">
          {labelDefault}
        </span>
      </button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      onClick={onSelect}
      className={`relative ${sizeClasses} flex flex-col items-center justify-center cursor-pointer group select-none`}
      title={`${ancestor.name} (${ancestor.relation}) - Khung thờ tối giản kiểu Nhật`}
    >
      {/* Active Golden Aura */}
      {isActive && (
        <div className="absolute -inset-2 bg-radial from-amber-500/40 via-amber-600/10 to-transparent rounded-lg blur-md pointer-events-none z-10" />
      )}

      {/* Frame Container - Japanese Graphic Minimalist Style */}
      <div
        className={`relative w-full h-full rounded-sm overflow-hidden border ${
          isActive ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-amber-500/30' : 'border-stone-800 hover:border-amber-500/80'
        } bg-stone-950 shadow-xl transition-all flex flex-col`}
      >
        {/* Top Floating Kasagi Bar with Mini Kamon (Kiểu Nhật) */}
        <div className="relative w-full h-3 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b border-amber-500/60 flex items-center justify-center z-25 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full border border-amber-400/80 bg-stone-950 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-amber-300" />
          </div>
          {/* Subtle gold accent line */}
          <div className="absolute inset-x-2 top-0.5 h-[0.5px] bg-amber-400/40" />
        </div>

        {/* Inner Portrait Area with Matting & Hairline Inlay */}
        <div className="relative flex-1 w-full bg-stone-950 overflow-hidden">
          {/* 1px Gold Hairline Inner Bezel */}
          <div className="absolute inset-1 border border-amber-500/40 pointer-events-none z-20 rounded-xs" />

          {/* Ancestor Photo with Gentle Fade-in */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={ancestor.id + (ancestor.avatarUrl || 'default')}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
            >
              <img
                src={ancestor.avatarUrl}
                alt={ancestor.name}
                className="w-full h-full object-cover filter contrast-[1.03]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {/* Zen Washi Subtle Film */}
          <div className="absolute inset-0 bg-stone-950/15 pointer-events-none z-15" />
        </div>

        {/* Japanese Ihai Style Name Bar at Bottom with Red Seal */}
        <div className="relative w-full bg-stone-950 border-t border-amber-500/50 p-1 z-25 flex items-center gap-1">
          {/* Miniature Inkan Red Stamp '孝' */}
          <div className="w-2.5 h-2.5 rounded-xs bg-red-800 border border-red-500/80 flex items-center justify-center text-[6px] text-red-100 font-serif shrink-0">
            孝
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ancestor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-w-0 flex-1 text-left"
            >
              <p className="font-serif font-bold text-[8px] sm:text-[9px] text-amber-200 truncate leading-tight">
                {ancestor.name.replace(/^(Cụ Ông:|Cụ Bà:|Ông:|Bà:|Cha:|Mẹ:)\s*/i, '')}
              </p>
              <span className="text-[7px] text-amber-400/70 font-serif block leading-none truncate">
                {ancestor.relation}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
