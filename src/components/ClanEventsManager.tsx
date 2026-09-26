import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Plus,
  Search,
  Filter,
  Flame,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  X,
  ChevronRight,
  BookmarkCheck,
  Bell,
} from 'lucide-react';
import { ClanEvent, ClanEventType, FamilyMember, Ancestor } from '../types.ts';
import { playBellSound, playChime } from '../utils/audio.ts';

interface ClanEventsManagerProps {
  events: ClanEvent[];
  onUpdateEvents: (events: ClanEvent[]) => void;
  familyMembers: FamilyMember[];
  ancestors: Ancestor[];
  onSelectActiveAncestor: (id: string) => void;
  onCloseParentModal?: () => void;
}

const EVENT_TYPE_LABELS: Record<ClanEventType, { label: string; icon: string; color: string; badgeBg: string }> = {
  gio_to: { label: 'Đại Giỗ Tổ', icon: '🪷', color: 'text-amber-400', badgeBg: 'bg-amber-950/90 border-amber-600/70 text-amber-300' },
  gio_thuong: { label: 'Giỗ Thường Niên', icon: '🕯️', color: 'text-orange-400', badgeBg: 'bg-stone-900 border-amber-700/60 text-amber-200' },
  te_xuan_thu: { label: 'Đại Lễ Tế Họ', icon: '🏛️', color: 'text-red-400', badgeBg: 'bg-red-950/90 border-red-600/60 text-red-200' },
  tao_mo: { label: 'Tảo Mộ Tiết Lễ', icon: '🌿', color: 'text-emerald-400', badgeBg: 'bg-emerald-950/90 border-emerald-600/60 text-emerald-200' },
  mung_tho: { label: 'Lễ Mừng Thọ', icon: '🎋', color: 'text-yellow-400', badgeBg: 'bg-yellow-950/90 border-yellow-600/60 text-yellow-200' },
  khuyen_hoc: { label: 'Khuyến Học', icon: '📜', color: 'text-sky-400', badgeBg: 'bg-sky-950/90 border-sky-600/60 text-sky-200' },
  hop_ho: { label: 'Việc Họ & Từ Đường', icon: '👥', color: 'text-stone-300', badgeBg: 'bg-stone-900 border-stone-600 text-stone-300' },
};

export const ClanEventsManager: React.FC<ClanEventsManagerProps> = ({
  events,
  onUpdateEvents,
  familyMembers,
  ancestors,
  onSelectActiveAncestor,
  onCloseParentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ClanEventType | 'all'>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClanEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ClanEventType>('gio_thuong');
  const [formLunarDate, setFormLunarDate] = useState('');
  const [formSolarDate, setFormSolarDate] = useState('');
  const [formLocation, setFormLocation] = useState('Từ Đường Dòng Họ');
  const [formOrganizer, setFormOrganizer] = useState('Ban Trị Sự Họ Tộc');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formRelatedMembers, setFormRelatedMembers] = useState<string[]>([]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchType = selectedType === 'all' || evt.type === selectedType;
      if (!matchType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.lunarDate.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q)
      );
    });
  }, [events, selectedType, searchQuery]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormType('gio_thuong');
    setFormLunarDate('');
    setFormSolarDate('');
    setFormLocation('Từ Đường Dòng Họ');
    setFormOrganizer('Ban Trị Sự Họ Tộc');
    setFormDescription('');
    setFormNotes('');
    setFormRelatedMembers([]);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (evt: ClanEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormType(evt.type);
    setFormLunarDate(evt.lunarDate);
    setFormSolarDate(evt.solarDateApprox || '');
    setFormLocation(evt.location);
    setFormOrganizer(evt.organizer);
    setFormDescription(evt.description);
    setFormNotes(evt.notes || '');
    setFormRelatedMembers(evt.relatedMemberIds || []);
    setIsFormOpen(true);
  };

  // Save Event
  const handleSave = () => {
    if (!formTitle.trim() || !formLunarDate.trim()) return;

    if (editingEvent) {
      const updated = events.map((e) =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: formTitle.trim(),
              type: formType,
              lunarDate: formLunarDate.trim(),
              solarDateApprox: formSolarDate.trim() || undefined,
              location: formLocation.trim(),
              organizer: formOrganizer.trim(),
              description: formDescription.trim(),
              notes: formNotes.trim() || undefined,
              relatedMemberIds: formRelatedMembers,
            }
          : e
      );
      onUpdateEvents(updated);
    } else {
      const newEvt: ClanEvent = {
        id: 'evt_' + Date.now(),
        title: formTitle.trim(),
        type: formType,
        lunarDate: formLunarDate.trim(),
        solarDateApprox: formSolarDate.trim() || undefined,
        location: formLocation.trim(),
        organizer: formOrganizer.trim(),
        description: formDescription.trim(),
        notes: formNotes.trim() || undefined,
        relatedMemberIds: formRelatedMembers,
        isAnnual: true,
      };
      onUpdateEvents([newEvt, ...events]);
    }
    setIsFormOpen(false);
  };

  // Delete Event
  const handleDelete = (id: string) => {
    if (confirm('Quý vị có chắc muốn xóa sự kiện dòng họ này?')) {
      const updated = events.filter((e) => e.id !== id);
      onUpdateEvents(updated);
      if (selectedEventId === id) setSelectedEventId(null);
    }
  };

  // Connect to Altar: Place ancestor of this event on the altar for prayer
  const handlePrayForEventAncestor = (memberId: string) => {
    playBellSound();
    playChime();
    const mem = familyMembers.find((m) => m.id === memberId);
    if (!mem) return;

    // Check if ancestor exists
    let existing = ancestors.find(
      (a) => (mem.ancestorId && a.id === mem.ancestorId) || a.name.toLowerCase() === mem.name.toLowerCase()
    );

    if (existing) {
      onSelectActiveAncestor(existing.id);
    }

    if (onCloseParentModal) {
      onCloseParentModal();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-stone-950 text-stone-100">
      {/* HEADER CONTROLS */}
      <div className="px-4 py-3 bg-stone-900/90 border-b border-amber-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Summary and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-serif font-bold text-sm sm:text-base flex items-center gap-1.5">
              <span>🏛️</span> Quản Lý Sự Kiện & Lễ Giỗ Dòng Họ
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono">
              {filteredEvents.length} sự kiện
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-xs font-serif shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Sự Kiện</span>
          </button>
        </div>

        {/* Right: Search & Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm lễ giỗ, địa điểm..."
              className="pl-8 pr-3 py-1.5 w-36 sm:w-48 text-xs rounded-lg bg-stone-950 border border-stone-700 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="px-4 py-2 bg-stone-950/80 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-serif">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            selectedType === 'all'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'bg-stone-900/90 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          Tất Cả ({events.length})
        </button>

        {(Object.keys(EVENT_TYPE_LABELS) as ClanEventType[]).map((type) => {
          const meta = EVENT_TYPE_LABELS[type];
          const count = events.filter((e) => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-amber-700 text-white font-bold shadow-sm'
                  : 'bg-stone-900/90 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Events List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-stone-500 font-serif">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Không tìm thấy sự kiện dòng họ nào phù hợp.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/70 border border-amber-600/60 text-amber-200 text-xs font-serif"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm sự kiện mới</span>
              </button>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const meta = EVENT_TYPE_LABELS[evt.type] || EVENT_TYPE_LABELS.gio_thuong;
              const isSelected = evt.id === selectedEventId;
              const relatedMembers = (evt.relatedMemberIds || [])
                .map((id) => familyMembers.find((m) => m.id === id))
                .filter(Boolean) as FamilyMember[];

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-radial from-amber-950/70 via-stone-900 to-stone-950 border-amber-500 shadow-xl ring-1 ring-amber-500/40'
                      : 'bg-stone-900/70 hover:bg-stone-900 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-serif font-medium ${meta.badgeBg}`}>
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>

                      {evt.isAnnual && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-serif">
                          Hàng năm
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
                        title="Chỉnh sửa sự kiện"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id)}
                        className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-red-400 transition-colors"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Lunar Date */}
                  <div className="mb-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 leading-snug">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs font-serif text-amber-300/90 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Âm lịch: {evt.lunarDate}</span>
                      </span>
                      {evt.solarDateApprox && (
                        <span className="text-stone-400 text-[11px]">
                          ({evt.solarDateApprox})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Organizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-stone-400 font-serif mb-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <UserCheck className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="truncate">{evt.organizer}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-300 font-serif line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Related ancestors preview */}
                  {relatedMembers.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-stone-400 font-serif">Tiên linh liên quan:</span>
                        {relatedMembers.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/50 text-[11px] text-amber-200 font-serif"
                          >
                            <span>🕯️</span>
                            <span>{m.name}</span>
                          </span>
                        ))}
                      </div>

                      {/* Quick Pray Button */}
                      {relatedMembers[0] && (
                        <button
                          onClick={() => handlePrayForEventAncestor(relatedMembers[0].id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px] font-serif transition-colors shadow-xs"
                          title="Đặt vị này lên bàn thờ để thắp hương tưởng niệm"
                        >
                          <Flame className="w-3 h-3 text-amber-200 fill-amber-200" />
                          <span>Dâng Hương Giỗ</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Event Detail Inspection (on desktop) */}
        {selectedEvent && (
          <div className="w-full md:w-80 lg:w-96 bg-stone-900/90 border-t md:border-t-0 md:border-l border-amber-900/40 p-4 overflow-y-auto shrink-0 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs font-serif text-amber-400 font-bold flex items-center gap-1">
                <span>📜</span> Chi Tiết Nghi Lễ Dòng Họ
              </span>
              <button
                onClick={() => setSelectedEventId(null)}
                className="text-stone-400 hover:text-stone-200 text-xs md:hidden"
              >
                Đóng
              </button>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-serif font-medium mb-2 ${EVENT_TYPE_LABELS[selectedEvent.type].badgeBg}`}>
                <span>{EVENT_TYPE_LABELS[selectedEvent.type].icon}</span>
                <span>{EVENT_TYPE_LABELS[selectedEvent.type].label}</span>
              </span>
              <h2 className="font-serif font-bold text-lg text-amber-100">
                {selectedEvent.title}
              </h2>
            </div>

            {/* Date and Location Card */}
            <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2 text-xs font-serif">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-200">Ngày Âm Lịch: {selectedEvent.lunarDate}</p>
                  {selectedEvent.solarDateApprox && (
                    <p className="text-stone-400 text-[11px]">Dương lịch: {selectedEvent.solarDateApprox}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-300 font-medium">Địa Điểm:</p>
                  <p className="text-stone-400">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-300 font-medium">Chủ Trì / Ban Tổ Chức:</p>
                  <p className="text-stone-400">{selectedEvent.organizer}</p>
                </div>
              </div>
            </div>

            {/* Ritual Description */}
            <div>
              <h4 className="text-xs font-serif font-bold text-amber-300 mb-1.5">
                Ý Nghĩa & Nghi Thức Tổ Chức:
              </h4>
              <p className="text-xs text-stone-300 font-serif leading-relaxed bg-stone-950/50 p-3 rounded-xl border border-stone-800/80">
                {selectedEvent.description}
              </p>
            </div>

            {/* Ritual Notes / Preparation */}
            {selectedEvent.notes && (
              <div>
                <h4 className="text-xs font-serif font-bold text-amber-300 mb-1.5">
                  Lễ Vật & Ghi Chú Chuẩn Bị:
                </h4>
                <div className="text-xs text-stone-300 font-serif leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-900/40">
                  {selectedEvent.notes}
                </div>
              </div>
            )}

            {/* Related Ancestors & Pray Button */}
            {selectedEvent.relatedMemberIds && selectedEvent.relatedMemberIds.length > 0 && (
              <div>
                <h4 className="text-xs font-serif font-bold text-amber-300 mb-2">
                  Tiên Nhân / Bậc Trưởng Bối Tưởng Niệm:
                </h4>
                <div className="space-y-2">
                  {selectedEvent.relatedMemberIds.map((memId) => {
                    const mem = familyMembers.find((m) => m.id === memId);
                    if (!mem) return null;
                    return (
                      <div
                        key={mem.id}
                        className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-bold text-amber-200 truncate">{mem.name}</p>
                          <p className="text-[10px] text-stone-400 font-serif truncate">{mem.relation} • {mem.branchName}</p>
                        </div>
                        <button
                          onClick={() => handlePrayForEventAncestor(mem.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-[11px] font-serif transition-colors shrink-0 shadow-xs"
                        >
                          <Flame className="w-3 h-3 text-amber-200 fill-amber-200" />
                          <span>Dâng Hương</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-stone-950 text-stone-100 rounded-2xl border-2 border-amber-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-5 py-3.5 bg-stone-900 border-b border-amber-900/50 flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <span>{editingEvent ? '✏️ Chỉnh Sửa Sự Kiện' : '➕ Thêm Sự Kiện Dòng Họ Mới'}</span>
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-stone-400 hover:text-stone-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs font-serif">
                {/* Title */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Tên Sự Kiện / Lễ Giỗ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Đại Lễ Tế Tổ Tiết Xuân, Ngày Giỗ Cụ Cố..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Type & Lunar Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Phân Loại Sự Kiện</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ClanEventType)}
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="gio_to">🪷 Đại Giỗ Tổ</option>
                      <option value="gio_thuong">🕯️ Giỗ Thường Niên</option>
                      <option value="te_xuan_thu">🏛️ Đại Lễ Tế Họ (Xuân/Thu)</option>
                      <option value="tao_mo">🌿 Lễ Tảo Mộ / Chạp Mả</option>
                      <option value="mung_tho">🎋 Lễ Mừng Thọ Bậc Cao Niên</option>
                      <option value="khuyen_hoc">📜 Lễ Khuyến Học Dòng Họ</option>
                      <option value="hop_ho">👥 Họp Mặt & Tu Bổ Từ Đường</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Ngày Âm Lịch <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formLunarDate}
                      onChange={(e) => setFormLunarDate(e.target.value)}
                      placeholder="VD: 18 tháng Chạp (AL), Mùng 5 tháng 5..."
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Solar Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Dương Lịch Tương Ứng (Dự kiến)</label>
                    <input
                      type="text"
                      value={formSolarDate}
                      onChange={(e) => setFormSolarDate(e.target.value)}
                      placeholder="VD: Tháng 1 hàng năm, 15/02/2026..."
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Địa Điểm Tổ Chức</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="VD: Từ Đường Dòng Họ, Khu Lăng Mộ..."
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Organizer */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Người Chủ Trì / Ban Tổ Chức</label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    placeholder="VD: Trưởng Tộc, Trưởng Chi, Ban Khuyến Học..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Nội Dung Nghi Lễ & Ý Nghĩa</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả ý nghĩa buổi lễ, thứ tự nghi thức cúng kiến..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Chuẩn Bị & Lễ Vật</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Lễ vật, đèn nến, sớ văn khấn..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-5 py-3 bg-stone-900 border-t border-amber-900/50 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-serif"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle.trim() || !formLunarDate.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs font-serif shadow-md transition-colors"
                >
                  {editingEvent ? 'Lưu Thay Đổi' : 'Thêm Sự Kiện'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
