import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Check, Upload, User, Heart, Sparkles } from 'lucide-react';
import { Ancestor } from '../types.ts';
import vintageAncestorRestoredImg from '../assets/images/vintage_ancestor_portrait_restored_1790415950712.jpg';

interface AncestorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ancestors: Ancestor[];
  onUpdateAncestors: (ancestors: Ancestor[]) => void;
  activeAncestorId: string;
  onSelectActive: (id: string) => void;
  onOpenFamilyTree?: () => void;
  onStartRitual?: () => void;
}

export const AncestorManagerModal: React.FC<AncestorManagerModalProps> = ({
  isOpen,
  onClose,
  ancestors,
  onUpdateAncestors,
  activeAncestorId,
  onSelectActive,
  onOpenFamilyTree,
  onStartRitual,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Ông Bà');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pyramidTier, setPyramidTier] = useState<1 | 2 | 3 | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setName('');
    setRelation('Ông Bà');
    setBirthYear('');
    setDeathYear('');
    setEpitaph('');
    setAvatarUrl('');
    setPyramidTier(undefined);
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingId) {
      const updated = ancestors.map((anc) =>
        anc.id === editingId
          ? {
              ...anc,
              name: name.trim(),
              relation: relation.trim(),
              birthYear: birthYear.trim(),
              deathYear: deathYear.trim(),
              epitaph: epitaph.trim(),
              avatarUrl: avatarUrl || anc.avatarUrl,
              pyramidTier,
            }
          : anc
      );
      onUpdateAncestors(updated);
    } else {
      const newAncestor: Ancestor = {
        id: 'anc_' + Date.now(),
        name: name.trim(),
        relation: relation.trim() || 'Người Thân',
        birthYear: birthYear.trim(),
        deathYear: deathYear.trim(),
        epitaph: epitaph.trim(),
        avatarUrl,
        isActiveOnAltar: ancestors.length === 0,
        pyramidTier,
      };
      const updated = [newAncestor, ...ancestors];
      onUpdateAncestors(updated);
      if (ancestors.length === 0) {
        onSelectActive(newAncestor.id);
      }
    }
    resetForm();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = ancestors.filter((a) => a.id !== id);
    onUpdateAncestors(filtered);
    if (activeAncestorId === id && filtered.length > 0) {
      onSelectActive(filtered[0].id);
    }
  };

  const handleEditClick = (anc: Ancestor) => {
    setEditingId(anc.id);
    setName(anc.name);
    setRelation(anc.relation);
    setBirthYear(anc.birthYear || '');
    setDeathYear(anc.deathYear || '');
    setEpitaph(anc.epitaph || '');
    setAvatarUrl(anc.avatarUrl || '');
    setPyramidTier(anc.pyramidTier);
    setIsAddingNew(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-stone-900 border border-amber-700/60 rounded-xl shadow-2xl text-stone-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/50 bg-stone-950/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <div>
                <h3 className="font-serif font-bold text-lg text-amber-100">
                  Di Ảnh Tưởng Nhớ Gia Tiên
                </h3>
                <p className="text-xs text-stone-400">
                  Thêm không giới hạn hình ảnh người thân phụng thờ trên bàn thờ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Japanese Minimalist Frame Style Selector Banner */}
            <div className="p-3 bg-stone-950/70 border border-amber-500/40 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🇯🇵</span> Khung Ảnh Gia Tiên Phong Cách Nhật Bản
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Thiết kế đồ họa tối giản, mộng gỗ Kigumi, thanh xà Kasagi và bài vị Ihai thanh nhã
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    localStorage.setItem('thapnhang_japanese_frame_style', 'urushi');
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="px-2.5 py-1 rounded text-xs font-serif border bg-stone-900 border-amber-500/60 text-amber-200 hover:border-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                  title="Sơn mài đen Urushi chỉ vàng kim"
                >
                  <span>漆</span> Sơn Mài Đen
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('thapnhang_japanese_frame_style', 'hinoki');
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="px-2.5 py-1 rounded text-xs font-serif border bg-amber-950/80 border-amber-600/70 text-amber-100 hover:border-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                  title="Gỗ bách Hinoki tự nhiên mộc mạc"
                >
                  <span>檜</span> Gỗ Mộc Hinoki
                </button>
              </div>
            </div>

            {/* Action Bar */}
            {!isAddingNew && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-stone-400">
                  Đang có <strong className="text-amber-300">{ancestors.length}</strong> bài vị / di ảnh
                </p>
                <div className="flex items-center gap-2">
                  {onOpenFamilyTree && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFamilyTree();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-amber-700/60 text-amber-300 text-xs font-serif transition-colors cursor-pointer"
                      title="Mở mô hình Cây Gia Phả Dòng Họ đầy đủ"
                    >
                      <span>🌳</span>
                      <span>Xem Cây Gia Phả</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAddingNew(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm di ảnh mới
                  </button>
                </div>
              </div>
            )}

            {/* Form to Add or Edit */}
            {isAddingNew ? (
              <div className="p-4 bg-stone-950/60 rounded-lg border border-amber-800/40 space-y-4">
                <h4 className="font-serif text-sm font-semibold text-amber-200">
                  {editingId ? 'Chỉnh sửa thông tin di ảnh' : 'Thêm di ảnh người thân mới'}
                </h4>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Photo Upload Preview */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-28 h-36 rounded-md border-2 border-dashed border-amber-600/60 hover:border-amber-400 flex flex-col items-center justify-center p-2 cursor-pointer bg-stone-900/80 overflow-hidden relative group transition-colors shadow-inner"
                      title="Bấm để chọn ảnh chân dung từ máy tính hoặc điện thoại"
                    >
                      {avatarUrl ? (
                        <>
                          <img
                            src={avatarUrl}
                            alt="preview"
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-amber-200 transition-opacity">
                            Đổi ảnh
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto text-amber-400 mb-1" />
                          <span className="text-[11px] text-stone-300 font-serif">Tải ảnh lên</span>
                          <span className="text-[9px] text-stone-500 block">Từ máy của bạn</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    {/* Quick Preset Restored Portrait Button */}
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(vintageAncestorRestoredImg)}
                      className="text-[10px] text-amber-300 hover:text-amber-100 flex items-center gap-1 cursor-pointer bg-stone-900 px-2 py-0.5 rounded border border-stone-800 hover:border-amber-600 transition-colors"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>Dùng ảnh cổ phục chế</span>
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">
                        Họ và tên người thân *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Trần Văn Phúc, Lê Thị Mai..."
                        className="w-full px-3 py-1.5 text-sm bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-stone-100"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Danh phận
                        </label>
                        <select
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-stone-100"
                        >
                          <option value="Ông Nội">Ông Nội</option>
                          <option value="Bà Nội">Bà Nội</option>
                          <option value="Ông Ngoại">Ông Ngoại</option>
                          <option value="Bà Ngoại">Bà Ngoại</option>
                          <option value="Cha / Ba">Cha / Ba</option>
                          <option value="Mẹ / Má">Mẹ / Má</option>
                          <option value="Cụ Cố">Cụ Cố</option>
                          <option value="Bác / Chú / Cô">Bác / Chú / Cô</option>
                          <option value="Anh / Chị / Em">Anh / Chị / Em</option>
                          <option value="Tiên Linh">Tiên Linh</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Năm sinh
                        </label>
                        <input
                          type="text"
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          placeholder="1935"
                          className="w-full px-2 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Năm mất
                        </label>
                        <input
                          type="text"
                          value={deathYear}
                          onChange={(e) => setDeathYear(e.target.value)}
                          placeholder="2018"
                          className="w-full px-2 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">
                        Lời nguyện tưởng nhớ / Hưởng thọ
                      </label>
                      <input
                        type="text"
                        value={epitaph}
                        onChange={(e) => setEpitaph(e.target.value)}
                        placeholder="Hưởng thọ 86 tuổi. Nguyện cầu an nghỉ cõi lành."
                        className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">
                        🔺 Vị trí trên Bàn Thờ Chóp Tháp Tam Cấp
                      </label>
                      <select
                        value={pyramidTier || ''}
                        onChange={(e) => setPyramidTier(e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : undefined)}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md focus:outline-hidden focus:border-amber-500 text-amber-200 font-serif"
                      >
                        <option value="">Tự động sắp xếp theo thế hệ</option>
                        <option value="1">👑 Cấp 1: Đỉnh Tháp (Cụ Thủy Tổ / Tiên Linh đời cao nhất)</option>
                        <option value="2">✨ Cấp 2: Tầng Giữa (Cụ Ông, Cụ Bà / Ông Bà Nội Ngoại)</option>
                        <option value="3">🌿 Cấp 3: Tầng Hạ (Cha, Mẹ / Thân Tộc Chú Bác Cô Dì)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="px-4 py-1.5 text-xs rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium shadow transition-all cursor-pointer"
                  >
                    {editingId ? 'Cập nhật' : 'Lưu di ảnh'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* List of ancestors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ancestors.map((anc) => {
                const isActive = anc.id === activeAncestorId;
                return (
                  <div
                    key={anc.id}
                    onClick={() => onSelectActive(anc.id)}
                    className={`relative p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                      isActive
                        ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {/* Frame Thumbnail - Black Lacquer Trim */}
                    <div className="w-14 h-18 rounded bg-stone-950 border-2 border-stone-800 ring-1 ring-amber-500/40 overflow-hidden shrink-0 flex items-center justify-center relative shadow-md">
                      {anc.avatarUrl ? (
                        <img
                          src={anc.avatarUrl}
                          alt={anc.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-amber-500/50" />
                      )}
                      {isActive && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-stone-900 rounded-full flex items-center justify-center text-[10px] shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 font-serif">
                          {anc.relation}
                        </span>
                        {anc.pyramidTier && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/70 text-amber-300 font-serif font-medium">
                            🔺 {anc.pyramidTier === 1 ? 'Đỉnh Tháp' : anc.pyramidTier === 2 ? 'Tầng Giữa' : 'Tầng Hạ'}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                            <Heart className="w-3 h-3 fill-emerald-400" /> Trên bàn thờ
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-100 truncate mt-0.5">
                        {anc.name}
                      </h4>
                      {(anc.birthYear || anc.deathYear) && (
                        <p className="text-[11px] text-stone-400 font-mono">
                          {anc.birthYear || '?'} - {anc.deathYear || '?'}
                        </p>
                      )}
                      {anc.epitaph && (
                        <p className="text-[11px] text-stone-400 italic truncate mt-0.5">
                          "{anc.epitaph}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      {onStartRitual && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActive(anc.id);
                            onStartRitual();
                          }}
                          className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                          title="Lên bàn thờ và khởi lễ thắp nhang cho vị này"
                        >
                          <span>🔥</span>
                          <span>Thắp Nhang</span>
                        </button>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(anc);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors text-xs"
                          title="Sửa thông tin"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={(e) => handleDelete(anc.id, e)}
                          className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                          title="Xóa di ảnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>Bấm vào khung để đặt lên bàn thờ thắp nhang</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
