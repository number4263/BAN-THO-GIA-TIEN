import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Edit2,
  Trash2,
  Upload,
  User,
  Heart,
  Calendar,
  Layers,
  Flame,
  Check,
  ChevronRight,
  GitFork,
  ArrowUpRight,
} from 'lucide-react';
import { FamilyMember, Ancestor, ClanEvent } from '../types.ts';
import { playBellSound, playChime } from '../utils/audio.ts';
import { PedigreeChart } from './PedigreeChart.tsx';
import { ClanEventsManager } from './ClanEventsManager.tsx';

interface FamilyTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  onUpdateFamilyMembers: (members: FamilyMember[]) => void;
  ancestors: Ancestor[];
  onUpdateAncestors: (ancestors: Ancestor[]) => void;
  activeAncestorId: string;
  onSelectActiveAncestor: (id: string) => void;
  clanEvents?: ClanEvent[];
  onUpdateClanEvents?: (events: ClanEvent[]) => void;
  initialTab?: 'tree' | 'pedigree' | 'events' | 'grid';
  onStartRitual?: () => void;
}

export const FamilyTreeModal: React.FC<FamilyTreeModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  onUpdateFamilyMembers,
  ancestors,
  onUpdateAncestors,
  activeAncestorId,
  onSelectActiveAncestor,
  clanEvents = [],
  onUpdateClanEvents = () => {},
  initialTab = 'tree',
  onStartRitual,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'pedigree' | 'events' | 'grid'>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setViewMode(initialTab);
    }
  }, [isOpen, initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('');
  const [formGen, setFormGen] = useState<number>(3);
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formBirthYear, setFormBirthYear] = useState('');
  const [formDeathYear, setFormDeathYear] = useState('');
  const [formIsDeceased, setFormIsDeceased] = useState(true);
  const [formLunarMemorial, setFormLunarMemorial] = useState('');
  const [formBranch, setFormBranch] = useState('Chi Trưởng');
  const [formParentId, setFormParentId] = useState('');
  const [formSpouseId, setFormSpouseId] = useState('');
  const [formEpitaph, setFormEpitaph] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return familyMembers;
    const q = searchQuery.toLowerCase();
    return familyMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.relation.toLowerCase().includes(q) ||
        (m.branchName && m.branchName.toLowerCase().includes(q)) ||
        (m.lunarMemorialDate && m.lunarMemorialDate.toLowerCase().includes(q))
    );
  }, [familyMembers, searchQuery]);

  // Group members by generation for the tree hierarchy
  const generationGroups = useMemo(() => {
    const groups: { [gen: number]: FamilyMember[] } = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    filteredMembers.forEach((m) => {
      const g = Math.min(5, Math.max(1, m.generation || 1));
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });
    return groups;
  }, [filteredMembers]);

  // Generation meta definitions
  const GEN_TITLES: { [gen: number]: { title: string; subtitle: string; icon: string } } = {
    1: { title: 'Đời I: Bậc Tiên Tổ', subtitle: 'Khai canh lập nghiệp • Thủy tổ truyền thừa', icon: '🪷' },
    2: { title: 'Đời II: Bậc Ông Bà', subtitle: 'Dày công vun bồi gia phong đạo đức', icon: '🎋' },
    3: { title: 'Đời III: Bậc Thân Sinh & Cô Chú', subtitle: 'Trụ cột gia đạo, gìn giữ hương hỏa', icon: '📜' },
    4: { title: 'Đời IV: Thế Hệ Hiện Tại', subtitle: 'Kế thừa đạo hiếu, chăm lo việc họ', icon: '🌱' },
    5: { title: 'Đời V: Hậu Duệ Con Cháu', subtitle: 'Mầm xanh tương lai, đời đời nối tiếp', icon: '🌿' },
  };

  const selectedMember = useMemo(() => {
    return familyMembers.find((m) => m.id === selectedMemberId) || null;
  }, [familyMembers, selectedMemberId]);

  // Check if a member is currently active on the altar
  const isMemberActiveOnAltar = (member: FamilyMember) => {
    if (member.ancestorId && member.ancestorId === activeAncestorId) return true;
    const matched = ancestors.find((a) => a.id === activeAncestorId);
    return matched ? matched.name.toLowerCase() === member.name.toLowerCase() : false;
  };

  // Put a member directly on the altar
  const handlePlaceOnAltar = (member: FamilyMember) => {
    playChime();
    playBellSound();

    let targetAncestorId = member.ancestorId;
    let existingAncestor = ancestors.find(
      (a) => a.id === targetAncestorId || a.name.toLowerCase() === member.name.toLowerCase()
    );

    if (existingAncestor) {
      onSelectActiveAncestor(existingAncestor.id);
    } else {
      // Create an ancestor on the altar from this family member
      const newAncestor: Ancestor = {
        id: 'anc_fam_' + member.id,
        name: member.name,
        relation: member.relation,
        birthYear: member.birthYear,
        deathYear: member.deathYear,
        avatarUrl: member.avatarUrl,
        epitaph: member.epitaph || `Tiên linh dòng họ, hưởng thọ phúc ấm tiên tổ.`,
        isActiveOnAltar: true,
      };

      const updatedAncestors = [
        newAncestor,
        ...ancestors.map((a) => ({ ...a, isActiveOnAltar: false })),
      ];
      onUpdateAncestors(updatedAncestors);
      onSelectActiveAncestor(newAncestor.id);

      // Link back to family member
      const updatedMembers = familyMembers.map((m) =>
        m.id === member.id ? { ...m, ancestorId: newAncestor.id } : m
      );
      onUpdateFamilyMembers(updatedMembers);
    }
  };

  // Open Form for Adding
  const handleOpenAddForm = (parentMember?: FamilyMember) => {
    setEditingMember(null);
    setFormName('');
    setFormRelation(parentMember ? `Con của ${parentMember.name}` : 'Thành Viên');
    setFormGen(parentMember ? Math.min(5, parentMember.generation + 1) : 3);
    setFormGender('male');
    setFormBirthYear('');
    setFormDeathYear('');
    setFormIsDeceased(true);
    setFormLunarMemorial('');
    setFormBranch(parentMember?.branchName || 'Chi Trưởng');
    setFormParentId(parentMember?.id || '');
    setFormSpouseId('');
    setFormEpitaph('');
    setFormAvatarUrl('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (member: FamilyMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRelation(member.relation);
    setFormGen(member.generation);
    setFormGender(member.gender);
    setFormBirthYear(member.birthYear || '');
    setFormDeathYear(member.deathYear || '');
    setFormIsDeceased(member.isDeceased);
    setFormLunarMemorial(member.lunarMemorialDate || '');
    setFormBranch(member.branchName || 'Chi Trưởng');
    setFormParentId(member.parentId || '');
    setFormSpouseId(member.spouseId || '');
    setFormEpitaph(member.epitaph || '');
    setFormAvatarUrl(member.avatarUrl || '');
    setIsFormOpen(true);
  };

  // Handle Image Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Form
  const handleSaveMember = () => {
    if (!formName.trim()) return;

    if (editingMember) {
      const updated = familyMembers.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formName.trim(),
              relation: formRelation.trim(),
              generation: formGen,
              gender: formGender,
              birthYear: formBirthYear.trim(),
              deathYear: formIsDeceased ? formDeathYear.trim() : undefined,
              isDeceased: formIsDeceased,
              lunarMemorialDate: formLunarMemorial.trim(),
              branchName: formBranch.trim(),
              parentId: formParentId || undefined,
              spouseId: formSpouseId || undefined,
              epitaph: formEpitaph.trim(),
              avatarUrl: formAvatarUrl || m.avatarUrl,
            }
          : m
      );
      onUpdateFamilyMembers(updated);
    } else {
      const newMember: FamilyMember = {
        id: 'fam_' + Date.now(),
        name: formName.trim(),
        relation: formRelation.trim() || 'Người Thân',
        generation: formGen,
        gender: formGender,
        birthYear: formBirthYear.trim(),
        deathYear: formIsDeceased ? formDeathYear.trim() : undefined,
        isDeceased: formIsDeceased,
        lunarMemorialDate: formLunarMemorial.trim(),
        branchName: formBranch.trim(),
        parentId: formParentId || undefined,
        spouseId: formSpouseId || undefined,
        epitaph: formEpitaph.trim(),
        avatarUrl: formAvatarUrl,
      };
      onUpdateFamilyMembers([...familyMembers, newMember]);
      setSelectedMemberId(newMember.id);
    }

    setIsFormOpen(false);
    playChime();
  };

  // Delete Member
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi cây gia phả?')) {
      onUpdateFamilyMembers(familyMembers.filter((m) => m.id !== memberId));
      if (selectedMemberId === memberId) setSelectedMemberId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-stone-950 text-stone-100 rounded-2xl border-2 border-amber-800/80 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* TOP BANNER / HEADER */}
          <div className="px-4 sm:px-6 py-3 bg-radial from-stone-900 via-stone-950 to-black border-b border-amber-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Left Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-xl text-amber-400 shadow-inner">
                🌳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-base sm:text-lg text-amber-200 tracking-wide">
                    Cây Gia Phả Dòng Họ
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-600/50 text-amber-300 font-serif">
                    {familyMembers.length} thành viên
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-serif italic">
                  Cây có cội mới trổ cành xanh lá • Nước có nguồn mới bủa khắp rạch sông
                </p>
              </div>
            </div>

            {/* Middle Controls: Search & View toggle */}
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, vai vế..."
                  className="pl-8 pr-3 py-1.5 w-36 sm:w-48 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
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

              {/* View Switcher: Tree vs Pedigree vs Events vs Grid */}
              <div className="flex rounded-lg bg-stone-900 border border-stone-800 p-1 overflow-x-auto no-scrollbar gap-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'tree'
                      ? 'bg-amber-950 text-amber-200 border border-amber-600/70 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Xem dạng sơ đồ cây phân nhánh"
                >
                  <GitFork className="w-3.5 h-3.5 rotate-180 text-amber-400" />
                  <span>Cây Gia Phả</span>
                </button>
                <button
                  onClick={() => setViewMode('pedigree')}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'pedigree'
                      ? 'bg-amber-950 text-amber-200 border border-amber-600/70 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Phả đồ hệ trực hệ, tra cứu tôn ti trật tự & xưng hô dòng họ"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phả Đồ Hệ</span>
                </button>
                <button
                  onClick={() => setViewMode('events')}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'events'
                      ? 'bg-amber-950 text-amber-200 border border-amber-600/70 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Quản lý sự kiện, lễ giỗ & tế tự dòng họ"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sự Kiện Dòng Họ</span>
                  {clanEvents && clanEvents.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-amber-300 font-mono">
                      {clanEvents.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'grid'
                      ? 'bg-amber-950 text-amber-200 border border-amber-600/70 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Xem danh bạ phân nhóm theo thế hệ"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Phân Đời</span>
                </button>
              </div>

              {/* Zoom controls (for tree view) */}
              {viewMode === 'tree' && (
                <div className="hidden sm:flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.1))}
                    className="p-1 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
                    title="Thu nhỏ sơ đồ"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-stone-400 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                    className="p-1 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
                    title="Phóng to sơ đồ"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
                    title="Căn giữa / Mặc định"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Thắp Nhang Quick Button */}
              {onStartRitual && (
                <button
                  onClick={() => {
                    onClose();
                    onStartRitual();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md border border-amber-300 cursor-pointer active:scale-95 transition-all"
                  title="Đóng gia phả và vào trang nghi lễ thắp nhang"
                >
                  <Flame className="w-3.5 h-3.5 fill-amber-300 text-stone-950" />
                  <span className="hidden sm:inline">Khởi Lễ Thắp Nhang</span>
                  <span className="sm:hidden">Thắp Nhang</span>
                </button>
              )}

              {/* Add Member Button */}
              <button
                onClick={() => handleOpenAddForm()}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif font-semibold text-xs flex items-center gap-1 shadow-md border border-stone-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thêm Người Thân</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Đóng gia phả"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY AREA: Pedigree Chart vs Clan Events vs Tree/Grid View */}
          {viewMode === 'pedigree' ? (
            <PedigreeChart
              familyMembers={familyMembers}
              ancestors={ancestors}
              activeAncestorId={activeAncestorId}
              onSelectActiveAncestor={onSelectActiveAncestor}
              onPlaceOnAltar={handlePlaceOnAltar}
            />
          ) : viewMode === 'events' ? (
            <ClanEventsManager
              events={clanEvents || []}
              onUpdateEvents={onUpdateClanEvents}
              familyMembers={familyMembers}
              ancestors={ancestors}
              onSelectActiveAncestor={onSelectActiveAncestor}
              onCloseParentModal={onClose}
            />
          ) : (
            <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
              {/* CANVAS / SCROLLABLE VIEW */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:16px_16px] relative">
              {viewMode === 'tree' ? (
                /* ======================================================= */
                /* TREE DIAGRAM VIEW (Hierarchical Generational Flow)     */
                /* ======================================================= */
                <div
                  className="min-w-fit mx-auto transition-transform duration-200 origin-top flex flex-col items-center gap-8 sm:gap-12 pb-16"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {[1, 2, 3, 4, 5].map((gen) => {
                    const membersInGen = generationGroups[gen];
                    if (!membersInGen || membersInGen.length === 0) return null;
                    const meta = GEN_TITLES[gen];

                    return (
                      <div key={gen} className="w-full flex flex-col items-center relative">
                        {/* Generation Tier Header */}
                        <div className="flex items-center gap-2 mb-4 px-4 py-1 rounded-full bg-stone-900/90 border border-amber-700/60 shadow-md backdrop-blur-xs z-10">
                          <span className="text-sm">{meta.icon}</span>
                          <span className="font-serif font-bold text-xs text-amber-200 tracking-wider">
                            {meta.title}
                          </span>
                          <span className="text-[10px] text-stone-400 font-serif hidden md:inline">
                            • {meta.subtitle}
                          </span>
                        </div>

                        {/* Members row for this generation */}
                        <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 relative px-4">
                          {membersInGen.map((member) => {
                            const isSelected = selectedMemberId === member.id;
                            const isOnAltar = isMemberActiveOnAltar(member);

                            return (
                              <div
                                key={member.id}
                                onClick={() => setSelectedMemberId(member.id)}
                                className={`group relative w-44 sm:w-48 rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg ${
                                  isSelected
                                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/50 scale-[1.02]'
                                    : isOnAltar
                                    ? 'bg-stone-900/95 border-amber-600/70 hover:border-amber-400'
                                    : 'bg-stone-900/80 border-stone-800 hover:border-stone-600 hover:bg-stone-900'
                                }`}
                              >
                                {/* On Altar Active Badge */}
                                {isOnAltar && (
                                  <div className="absolute -top-2.5 -right-1 z-20 px-2 py-0.5 rounded-full bg-amber-600 text-stone-950 font-serif font-bold text-[9px] flex items-center gap-1 shadow-md border border-amber-300">
                                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                                    <span>Trên Bàn Thờ</span>
                                  </div>
                                )}

                                {/* Member Header: Avatar + Quick Info */}
                                <div className="flex items-start gap-2.5">
                                  {/* Avatar Frame - Sơn then cổ điển */}
                                  <div className="w-12 h-15 rounded-md bg-stone-950 border border-amber-600/50 overflow-hidden shrink-0 flex items-center justify-center relative shadow">
                                    {member.avatarUrl ? (
                                      <img
                                        src={member.avatarUrl}
                                        alt={member.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover filter contrast-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-500">
                                        <User className="w-6 h-6 text-stone-500" />
                                      </div>
                                    )}
                                    {/* Small deceased lotus marker */}
                                    {member.isDeceased && (
                                      <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-center py-0.2 text-[8px] text-amber-400 font-serif">
                                        🪷
                                      </div>
                                    )}
                                  </div>

                                  {/* Name & Relation */}
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className={`text-[10px] font-serif font-semibold px-1.5 py-0.5 rounded inline-block mb-1 truncate max-w-full ${
                                        member.gender === 'male'
                                          ? 'bg-blue-950/60 text-blue-300 border border-blue-900/60'
                                          : 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                                      }`}
                                    >
                                      {member.relation}
                                    </span>
                                    <h4 className="font-serif font-bold text-xs text-stone-100 truncate leading-tight group-hover:text-amber-300 transition-colors">
                                      {member.name}
                                    </h4>
                                    <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                                      {member.birthYear || '?'} –{' '}
                                      {member.isDeceased ? member.deathYear || 'Đã quy tiên' : 'Tại thế'}
                                    </p>
                                  </div>
                                </div>

                                {/* Lunar Memorial Date or Branch */}
                                <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400 font-serif">
                                  {member.lunarMemorialDate ? (
                                    <span className="flex items-center gap-1 text-amber-400/90 truncate">
                                      <Flame className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate">Giỗ: {member.lunarMemorialDate}</span>
                                    </span>
                                  ) : (
                                    <span className="text-stone-500 truncate">
                                      {member.branchName || 'Chi Trưởng'}
                                    </span>
                                  )}
                                  <ChevronRight className="w-3 h-3 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Connecting Line Downward to Next Generation */}
                        {gen < 4 && generationGroups[gen + 1]?.length > 0 && (
                          <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-amber-600/70 to-amber-700/30 my-1 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500/80" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ======================================================= */
                /* GENERATIONAL GRID VIEW                                  */
                /* ======================================================= */
                <div className="max-w-4xl mx-auto space-y-8 pb-16">
                  {[1, 2, 3, 4, 5].map((gen) => {
                    const membersInGen = generationGroups[gen];
                    if (!membersInGen || membersInGen.length === 0) return null;
                    const meta = GEN_TITLES[gen];

                    return (
                      <div
                        key={gen}
                        className="rounded-xl bg-stone-900/60 border border-stone-800/80 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{meta.icon}</span>
                            <div>
                              <h3 className="font-serif font-bold text-sm text-amber-200">
                                {meta.title}
                              </h3>
                              <p className="text-xs text-stone-400 font-serif">{meta.subtitle}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleOpenAddForm();
                              setFormGen(gen);
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 font-serif flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm vào đời {gen}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {membersInGen.map((member) => {
                            const isSelected = selectedMemberId === member.id;
                            const isOnAltar = isMemberActiveOnAltar(member);

                            return (
                              <div
                                key={member.id}
                                onClick={() => setSelectedMemberId(member.id)}
                                className={`p-3 rounded-lg border flex items-center gap-3 transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-950/40 border-amber-400'
                                    : isOnAltar
                                    ? 'bg-stone-900 border-amber-600/60'
                                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                                }`}
                              >
                                <div className="w-11 h-14 rounded bg-stone-900 border border-amber-700/50 overflow-hidden shrink-0 flex items-center justify-center">
                                  {member.avatarUrl ? (
                                    <img
                                      src={member.avatarUrl}
                                      alt={member.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-5 h-5 text-stone-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-amber-400 font-serif font-semibold">
                                      {member.relation}
                                    </span>
                                    {isOnAltar && (
                                      <span className="text-[9px] text-amber-300 bg-amber-950 px-1 rounded border border-amber-700">
                                        Thờ
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-serif font-bold text-xs text-stone-200 truncate">
                                    {member.name}
                                  </h4>
                                  <p className="text-[10px] font-mono text-stone-400">
                                    {member.birthYear || '?'} - {member.isDeceased ? member.deathYear || 'Quy tiên' : 'Tại thế'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDE PANEL: MEMBER DETAIL DRAWER */}
            <div
              className={`w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-amber-900/50 bg-stone-900/95 flex flex-col transition-all overflow-y-auto ${
                selectedMember ? 'block' : 'hidden md:flex'
              }`}
            >
              {selectedMember ? (
                <div className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {/* Header with Close Detail button (Mobile) */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-serif">
                          Đời thứ {selectedMember.generation}
                        </span>
                        <span className="text-xs text-stone-400 font-serif">
                          {selectedMember.branchName || 'Chi Trưởng'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditForm(selectedMember)}
                          className="p-1 text-stone-400 hover:text-amber-300 rounded cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(selectedMember.id)}
                          className="p-1 text-stone-400 hover:text-rose-400 rounded cursor-pointer"
                          title="Xóa khỏi gia phả"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedMemberId(null)}
                          className="p-1 text-stone-400 hover:text-stone-200 rounded md:hidden cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Member Portrait Frame - Baroque style */}
                    <div className="mt-4 flex flex-col items-center text-center">
                      <div className="w-28 h-36 rounded-lg bg-stone-950 border-2 border-stone-800 ring-1 ring-amber-500/60 overflow-hidden shadow-2xl flex items-center justify-center relative">
                        {selectedMember.avatarUrl ? (
                          <img
                            src={selectedMember.avatarUrl}
                            alt={selectedMember.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover filter contrast-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-stone-500 p-2">
                            <User className="w-10 h-10" />
                            <span className="text-[10px] mt-1 font-serif">Chưa có ảnh</span>
                          </div>
                        )}
                        {/* Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                      </div>

                      {/* Name & Relation */}
                      <span className="mt-3 text-xs font-serif font-bold text-amber-400">
                        {selectedMember.relation}
                      </span>
                      <h3 className="font-serif font-bold text-base text-stone-100 mt-0.5">
                        {selectedMember.name}
                      </h3>
                      <p className="text-xs font-mono text-stone-400 mt-1">
                        Hưởng thọ: {selectedMember.birthYear || '?'} –{' '}
                        {selectedMember.isDeceased ? selectedMember.deathYear || 'Đã quy tiên' : 'Còn tại thế'}
                      </p>
                    </div>

                    {/* Details: Lunar Memorial & Epitaph */}
                    <div className="mt-5 space-y-3 bg-stone-950/60 border border-stone-800 rounded-xl p-3 text-xs font-serif">
                      {selectedMember.lunarMemorialDate && (
                        <div className="flex items-start gap-2 text-stone-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-stone-400 block text-[11px]">Ngày giỗ chính:</span>
                            <span className="font-bold text-amber-300">
                              {selectedMember.lunarMemorialDate}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedMember.epitaph && (
                        <div className="pt-2 border-t border-stone-800/80">
                          <span className="text-stone-400 block text-[11px] mb-1">
                            Tiểu sử & Lời tưởng nhớ:
                          </span>
                          <p className="text-stone-300 italic leading-relaxed text-[11px]">
                            "{selectedMember.epitaph}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Put on Altar + Thắp Nhang + Add Child */}
                  <div className="space-y-2 pt-3 border-t border-stone-800">
                    {onStartRitual && (
                      <button
                        onClick={() => {
                          handlePlaceOnAltar(selectedMember);
                          onClose();
                          onStartRitual();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer active:scale-95"
                        title="Vào nghi lễ thắp nhang cho vị này"
                      >
                        <Flame className="w-4 h-4 text-stone-950 fill-amber-300" />
                        <span>Thắp Nhang Cho Vị Này</span>
                      </button>
                    )}

                    <button
                      onClick={() => handlePlaceOnAltar(selectedMember)}
                      className={`w-full py-2.5 px-3 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                        isMemberActiveOnAltar(selectedMember)
                          ? 'bg-amber-950 text-amber-200 border border-amber-600/70'
                          : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white border border-amber-400/50'
                      }`}
                    >
                      {isMemberActiveOnAltar(selectedMember) ? (
                        <>
                          <Check className="w-4 h-4 text-amber-400" />
                          <span>Đang Thờ Trên Bàn Thờ Chính</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Dâng Di Ảnh Lên Bàn Thờ Chính</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenAddForm(selectedMember)}
                      className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white font-serif text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Con Cháu của vị này</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center h-full text-center text-stone-500">
                  <div className="w-16 h-16 rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-2xl mb-3">
                    🪷
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-300">
                    Chi Tiết Thành Viên
                  </h4>
                  <p className="text-xs text-stone-400 font-serif mt-1 max-w-[200px]">
                    Nhấp vào một vị tiên tổ hoặc thành viên trên sơ đồ cây để xem thông tin và dâng di ảnh lên bàn thờ.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        </motion.div>

        {/* MODAL FORM: ADD / EDIT FAMILY MEMBER */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-stone-950 border border-amber-700/80 rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[90vh] text-stone-100 font-serif"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="font-serif font-bold text-base text-amber-200">
                  {editingMember ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Thành Viên Vào Gia Phả'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                {/* Photo Upload & Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 rounded bg-stone-900 border border-amber-600/50 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {formAvatarUrl ? (
                      <img
                        src={formAvatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-stone-600" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tải ảnh chân dung</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Ảnh chân dung rõ nét, trang nghiêm để lồng vào khung thờ.
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-stone-400 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Trần Văn An"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Relation & Generation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Vai vế / Danh xưng:</label>
                    <input
                      type="text"
                      value={formRelation}
                      onChange={(e) => setFormRelation(e.target.value)}
                      placeholder="Cụ Cố, Ông Nội, Cha..."
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Thế hệ (Đời thứ):</label>
                    <select
                      value={formGen}
                      onChange={(e) => setFormGen(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value={1}>Đời I (Tiên tổ, Cụ Cố)</option>
                      <option value={2}>Đời II (Bậc Ông Bà)</option>
                      <option value={3}>Đời III (Bậc Thân Sinh, Cha Mẹ)</option>
                      <option value={4}>Đời IV (Thế Hệ Hiện Tại)</option>
                      <option value={5}>Đời V (Hậu Duệ Con Cháu)</option>
                    </select>
                  </div>
                </div>

                {/* Gender & Living Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Giới tính:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormGender('male')}
                        className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          formGender === 'male'
                            ? 'bg-blue-950 border-blue-600 text-blue-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormGender('female')}
                        className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          formGender === 'female'
                            ? 'bg-rose-950 border-rose-600 text-rose-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        Nữ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Hiện trạng:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormIsDeceased(true)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          formIsDeceased
                            ? 'bg-amber-950 border-amber-600 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        Đã mất 🪷
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormIsDeceased(false)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          !formIsDeceased
                            ? 'bg-emerald-950 border-emerald-600 text-emerald-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        Còn sống
                      </button>
                    </div>
                  </div>
                </div>

                {/* Years */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Năm sinh:</label>
                    <input
                      type="text"
                      value={formBirthYear}
                      onChange={(e) => setFormBirthYear(e.target.value)}
                      placeholder="1930"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {formIsDeceased && (
                    <div>
                      <label className="block text-stone-400 mb-1">Năm mất:</label>
                      <input
                        type="text"
                        value={formDeathYear}
                        onChange={(e) => setFormDeathYear(e.target.value)}
                        placeholder="2015"
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Lunar Memorial Date */}
                {formIsDeceased && (
                  <div>
                    <label className="block text-stone-400 mb-1">
                      Ngày giỗ âm lịch (kỷ nhật):
                    </label>
                    <input
                      type="text"
                      value={formLunarMemorial}
                      onChange={(e) => setFormLunarMemorial(e.target.value)}
                      placeholder="Ví dụ: 15 tháng Chạp (AL), mùng 8 tháng 4"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Epitaph / Memory */}
                <div>
                  <label className="block text-stone-400 mb-1">Tiểu sử & Lời tưởng nhớ:</label>
                  <textarea
                    rows={2}
                    value={formEpitaph}
                    onChange={(e) => setFormEpitaph(e.target.value)}
                    placeholder="Công đức, phẩm hạnh, lời dặn dò cho con cháu..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveMember}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs shadow-md border border-amber-400/40 cursor-pointer"
                >
                  Lưu Vào Gia Phả
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
