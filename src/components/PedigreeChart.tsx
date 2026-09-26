import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitFork,
  Users,
  Compass,
  ArrowRight,
  Flame,
  Check,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Award,
} from 'lucide-react';
import { FamilyMember, Ancestor } from '../types.ts';
import { playBellSound, playChime } from '../utils/audio.ts';

interface PedigreeChartProps {
  familyMembers: FamilyMember[];
  ancestors: Ancestor[];
  activeAncestorId: string;
  onSelectActiveAncestor: (id: string) => void;
  onPlaceOnAltar: (member: FamilyMember) => void;
}

export const PedigreeChart: React.FC<PedigreeChartProps> = ({
  familyMembers,
  ancestors,
  activeAncestorId,
  onSelectActiveAncestor,
  onPlaceOnAltar,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Kinsmanship Relationship Finder State
  const [personAId, setPersonAId] = useState<string>(familyMembers[0]?.id || '');
  const [personBId, setPersonBId] = useState<string>(familyMembers[familyMembers.length - 1]?.id || '');
  const [showKinshipFinder, setShowKinshipFinder] = useState(false);

  // All Branches List
  const branches = useMemo(() => {
    const list = new Set<string>();
    familyMembers.forEach((m) => {
      if (m.branchName) list.add(m.branchName);
    });
    return Array.from(list);
  }, [familyMembers]);

  // Statistics
  const stats = useMemo(() => {
    const total = familyMembers.length;
    const male = familyMembers.filter((m) => m.gender === 'male').length;
    const female = familyMembers.filter((m) => m.gender === 'female').length;
    const deceased = familyMembers.filter((m) => m.isDeceased).length;
    const living = total - deceased;
    const maxGen = Math.max(...familyMembers.map((m) => m.generation || 1), 1);

    return { total, male, female, deceased, living, maxGen };
  }, [familyMembers]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return familyMembers.filter((m) => {
      if (selectedBranch !== 'all' && m.branchName && !m.branchName.includes(selectedBranch)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.relation.toLowerCase().includes(q) ||
          (m.branchName && m.branchName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [familyMembers, selectedBranch, searchQuery]);

  // Group by generation
  const generationGroups = useMemo(() => {
    const groups: Record<number, FamilyMember[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    filteredMembers.forEach((m) => {
      const g = Math.min(5, Math.max(1, m.generation || 1));
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });
    return groups;
  }, [filteredMembers]);

  const selectedMember = useMemo(() => {
    return familyMembers.find((m) => m.id === selectedMemberId) || null;
  }, [familyMembers, selectedMemberId]);

  // Relationship computation between Person A and Person B
  const relationshipAnalysis = useMemo(() => {
    const pA = familyMembers.find((m) => m.id === personAId);
    const pB = familyMembers.find((m) => m.id === personBId);
    if (!pA || !pB || pA.id === pB.id) return null;

    const genDiff = pB.generation - pA.generation;
    let callAtoB = '';
    let callBtoA = '';
    let explanation = '';

    if (genDiff === 0) {
      // Same generation
      if (pA.gender === 'male') {
        callAtoB = 'Anh / Em';
        callBtoA = 'Em / Anh';
      } else {
        callAtoB = 'Chị / Em';
        callBtoA = 'Em / Chị';
      }
      explanation = `Cùng thuộc thế hệ Đời ${pA.generation}. Là hàng anh chị em con chú bác hoặc đồng thế tộc trong dòng họ.`;
    } else if (genDiff === 1) {
      // B is 1 gen below A (A is parent generation to B)
      if (pA.gender === 'male') {
        callAtoB = 'Bác / Chú';
        callBtoA = 'Cháu';
      } else {
        callAtoB = 'Cô / Bác Gái / Dì';
        callBtoA = 'Cháu';
      }
      explanation = `${pA.name} thuộc bậc Trưởng Bối (Đời ${pA.generation}), ${pB.name} thuộc hàng Con Cháu (Đời ${pB.generation}).`;
    } else if (genDiff === 2) {
      // B is 2 gen below A (Grandparent gen)
      callAtoB = pA.gender === 'male' ? 'Ông Nội / Ông Bác' : 'Bà Nội / Bà Cô';
      callBtoA = 'Cháu Nội / Cháu Họ';
      explanation = `${pA.name} thuộc hàng Ông Bà (Đời ${pA.generation}), ${pB.name} là cháu thế hệ Đời ${pB.generation}.`;
    } else if (genDiff >= 3) {
      // B is 3+ gen below A (Great-grandparent)
      callAtoB = pA.gender === 'male' ? 'Cụ Cố / Tiên Tổ' : 'Cụ Cố Bà';
      callBtoA = 'Chắt / Chít';
      explanation = `${pA.name} là bậc Tiên Tổ khởi dựng (Đời ${pA.generation}), ${pB.name} là hậu duệ thừa kế hương hỏa (Đời ${pB.generation}).`;
    } else if (genDiff === -1) {
      // B is 1 gen above A
      callAtoB = 'Cháu';
      callBtoA = pB.gender === 'male' ? 'Bác / Chú' : 'Cô / Bác';
      explanation = `${pB.name} thuộc bậc Trưởng Bối (Đời ${pB.generation}), ${pA.name} thuộc hàng Con Cháu (Đời ${pA.generation}).`;
    } else if (genDiff === -2) {
      callAtoB = 'Cháu';
      callBtoA = pB.gender === 'male' ? 'Ông' : 'Bà';
      explanation = `${pB.name} thuộc hàng Ông Bà, ${pA.name} thuộc hàng Cháu.`;
    } else {
      callAtoB = 'Chắt / Chít';
      callBtoA = pB.gender === 'male' ? 'Cụ Cố Ông' : 'Cụ Cố Bà';
      explanation = `${pB.name} là bậc Tiên Tổ, ${pA.name} là hậu duệ đời sau.`;
    }

    return {
      pA,
      pB,
      callAtoB,
      callBtoA,
      explanation,
    };
  }, [personAId, personBId, familyMembers]);

  // Check if active on altar
  const isMemberActiveOnAltar = (member: FamilyMember) => {
    if (member.ancestorId && member.ancestorId === activeAncestorId) return true;
    const matched = ancestors.find((a) => a.id === activeAncestorId);
    return matched ? matched.name.toLowerCase() === member.name.toLowerCase() : false;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-stone-950 text-stone-100">
      {/* TOP HEADER CONTROLS */}
      <div className="px-4 py-3 bg-stone-900/90 border-b border-amber-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Phả Đồ Hệ Title & Branch filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-serif font-bold text-sm sm:text-base flex items-center gap-1.5">
              <span>📜</span> Phả Đồ Hệ Trực Hệ
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono">
              Đời I ➔ Đời {stats.maxGen}
            </span>
          </div>

          {/* Branch Filter dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-serif">
            <span className="text-stone-400">Chi Phái:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">Toàn Thể Dòng Họ</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Kinship finder button & Search */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKinshipFinder((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-serif transition-all cursor-pointer ${
              showKinshipFinder
                ? 'bg-amber-600 border-amber-400 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 border-amber-800/60 text-amber-200 hover:bg-stone-800'
            }`}
            title="Tra cứu mối quan hệ và cách xưng hô tôn ti dòng họ"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tra Cứu Vai Vế Xưng Hô</span>
            <span className="sm:hidden">Xưng Hô</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra cứu tên vị tổ..."
              className="pl-8 pr-3 py-1.5 w-32 sm:w-44 text-xs rounded-lg bg-stone-950 border border-stone-700 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* CLAN DEMOGRAPHICS SUMMARY BAR */}
      <div className="px-4 py-2 bg-stone-950/90 border-b border-stone-800/80 flex items-center justify-between gap-4 text-xs font-serif overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-4 text-stone-300">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Tổng nhân khẩu: <strong className="text-amber-200">{stats.total}</strong></span>
          </span>
          <span className="text-stone-600">•</span>
          <span className="text-blue-300">Đinh Nam: <strong>{stats.male}</strong></span>
          <span className="text-stone-600">•</span>
          <span className="text-rose-300">Nữ: <strong>{stats.female}</strong></span>
          <span className="text-stone-600">•</span>
          <span className="text-amber-300">Tiên Linh Quy Tiên: <strong>{stats.deceased}</strong></span>
          <span className="text-stone-600">•</span>
          <span className="text-emerald-300">Hậu Duệ Đang Kế Tục: <strong>{stats.living}</strong></span>
        </div>

        <div className="text-[11px] text-stone-400 italic hidden md:block">
          Truyền thừa huyết mạch • Tôn ti trật tự phân minh
        </div>
      </div>

      {/* KINSHIP RELATIONSHIP FINDER DRAWER (if toggled) */}
      <AnimatePresence>
        {showKinshipFinder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-radial from-amber-950/80 via-stone-900 to-stone-950 border-b border-amber-600/50 p-4 shrink-0"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Bộ Tra Cứu Tôn Ti Trật Tự & Xưng Hô Dòng Họ (Huyết Thống)</span>
                </h4>
                <button
                  onClick={() => setShowKinshipFinder(false)}
                  className="text-stone-400 hover:text-stone-200 text-xs font-serif"
                >
                  ✕ Đóng
                </button>
              </div>

              {/* Selector row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-serif text-stone-300 mb-1">
                    Vị Thứ Nhất (Người A):
                  </label>
                  <select
                    value={personAId}
                    onChange={(e) => setPersonAId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-amber-200 text-xs font-serif focus:outline-none focus:border-amber-500"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relation} - Đời {m.generation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center pt-4 sm:pt-0">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-amber-800 text-amber-300 text-xs font-serif">
                    <span>Mối Liên Hệ</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-serif text-stone-300 mb-1">
                    Vị Thứ Hai (Người B):
                  </label>
                  <select
                    value={personBId}
                    onChange={(e) => setPersonBId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-amber-200 text-xs font-serif focus:outline-none focus:border-amber-500"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relation} - Đời {m.generation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result box */}
              {relationshipAnalysis && (
                <div className="mt-3 p-3 rounded-xl bg-stone-950/90 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-serif">
                  <div className="space-y-1">
                    <p className="text-amber-200">
                      <strong className="text-amber-300">{relationshipAnalysis.pA.name}</strong> xưng hô với{' '}
                      <strong className="text-amber-300">{relationshipAnalysis.pB.name}</strong> là:{' '}
                      <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-600/50 text-amber-100 font-bold">
                        {relationshipAnalysis.callAtoB}
                      </span>
                    </p>
                    <p className="text-stone-300">
                      Ngược lại, <strong className="text-amber-300">{relationshipAnalysis.pB.name}</strong> gọi{' '}
                      <strong className="text-amber-300">{relationshipAnalysis.pA.name}</strong> là:{' '}
                      <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-600/50 text-amber-100 font-bold">
                        {relationshipAnalysis.callBtoA}
                      </span>
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 border-l border-stone-800 pl-3 italic max-w-sm">
                    {relationshipAnalysis.explanation}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PEDIGREE LINEAGE MATRIX VIEW */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        {[1, 2, 3, 4, 5].map((genNumber) => {
          const membersInGen = generationGroups[genNumber] || [];
          if (membersInGen.length === 0) return null;

          const GEN_HEADER: Record<number, { title: string; subtitle: string; icon: string }> = {
            1: { title: 'Đời I: Bậc Thủy Tổ & Khởi Tổ', subtitle: 'Khai canh lập nghiệp • Cội nguồn dòng họ', icon: '🪷' },
            2: { title: 'Đời II: Bậc Ông Bà & Trưởng Bối', subtitle: 'Dày công vun bồi gia phong đạo đức, phân định chi phái', icon: '🎋' },
            3: { title: 'Đời III: Bậc Thân Sinh & Cô Chú', subtitle: 'Trụ cột gia đạo, gìn giữ từ đường và hương hỏa gia tiên', icon: '📜' },
            4: { title: 'Đời IV: Thế Hệ Hiện Tại (Trưởng Nam / Thứ Nam)', subtitle: 'Kế thừa đạo hiếu, chăm lo công việc dòng tộc', icon: '🌱' },
            5: { title: 'Đời V: Hậu Duệ Mầm Xanh', subtitle: 'Đời đời hưng thịnh, mầm non tương lai tông miếu', icon: '🌿' },
          };

          const header = GEN_HEADER[genNumber] || {
            title: `Đời ${genNumber}`,
            subtitle: 'Hậu duệ dòng họ',
            icon: '🌱',
          };

          return (
            <div key={genNumber} className="relative">
              {/* Generation Header Pill */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-600/70 flex items-center justify-center text-sm shadow-md text-amber-300">
                  {header.icon}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200">
                    {header.title}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-serif italic">
                    {header.subtitle}
                  </p>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-amber-700/40 via-stone-800 to-transparent ml-2" />
              </div>

              {/* Members in Generation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {membersInGen.map((member) => {
                  const isActive = isMemberActiveOnAltar(member);
                  const isSelected = member.id === selectedMemberId;
                  const parent = familyMembers.find((m) => m.id === member.parentId);
                  const spouse = familyMembers.find((m) => m.id === member.spouseId);

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-radial from-amber-950/80 via-stone-900 to-stone-950 border-amber-400 shadow-xl ring-1 ring-amber-400/50'
                          : isActive
                          ? 'bg-stone-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-stone-900/60 hover:bg-stone-900 border-stone-800 hover:border-amber-700/60'
                      }`}
                    >
                      {/* Active on altar badge */}
                      {isActive && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-600 text-stone-950 font-bold text-[9px] font-serif shadow flex items-center gap-1 z-10">
                          <Flame className="w-2.5 h-2.5 fill-current" />
                          <span>Đang Thờ Phụng</span>
                        </div>
                      )}

                      {/* Header inside card */}
                      <div className="flex items-start gap-2.5">
                        {/* Avatar / Portrait or Inkan Monogram */}
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-amber-600/60 bg-stone-950 shrink-0 shadow-inner flex items-center justify-center">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-serif font-bold text-amber-300 text-lg">
                              {member.name.charAt(0)}
                            </span>
                          )}
                          {member.isDeceased ? (
                            <div className="absolute bottom-0 inset-x-0 bg-stone-950/90 text-stone-300 text-[8px] font-serif text-center py-0.2">
                              Đã khuất
                            </div>
                          ) : (
                            <div className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-emerald-300 text-[8px] font-serif text-center py-0.2">
                              Hậu duệ
                            </div>
                          )}
                        </div>

                        {/* Name and Relation */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-sm text-amber-100 truncate">
                            {member.name}
                          </h4>
                          <p className="text-xs text-amber-300 font-serif truncate font-medium">
                            {member.relation}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400 font-serif truncate">
                            <span className="px-1.5 py-0.2 rounded bg-stone-950 border border-stone-800 text-stone-300">
                              {member.branchName || 'Chi Trưởng'}
                            </span>
                            <span>
                              {member.birthYear ? member.birthYear : '---'}{' '}
                              {member.deathYear ? `- ${member.deathYear}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct Lineage Parent / Spouse Links */}
                      <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-[11px] font-serif space-y-1">
                        {parent && (
                          <div className="flex items-center gap-1.5 text-stone-300 truncate">
                            <span className="text-amber-500 font-bold">Trực hệ:</span>
                            <span className="text-stone-300 truncate">Con của {parent.name}</span>
                          </div>
                        )}
                        {spouse && (
                          <div className="flex items-center gap-1.5 text-stone-300 truncate">
                            <span className="text-rose-400 font-bold">Chính thất:</span>
                            <span className="text-stone-300 truncate">{spouse.name}</span>
                          </div>
                        )}
                        {member.lunarMemorialDate && (
                          <div className="flex items-center gap-1.5 text-amber-300/90 truncate text-[10px]">
                            <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Ngày giỗ: {member.lunarMemorialDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action: Dâng Hương / Đặt Lên Bàn Thờ */}
                      <div className="mt-2.5 pt-2 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-stone-500 font-serif">
                          {member.gender === 'male' ? 'Đinh Nam' : 'Nữ phái'}
                        </span>

                        {member.isDeceased && (
                          <button
                            onClick={() => onPlaceOnAltar(member)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-serif transition-colors shadow-xs ${
                              isActive
                                ? 'bg-amber-950 border border-amber-500 text-amber-200'
                                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                            }`}
                            title="Đặt vị này lên bàn thờ để dâng hương hoa khấn vái"
                          >
                            <Flame className="w-3 h-3 text-current fill-current" />
                            <span>{isActive ? 'Đang Thờ' : 'Dâng Hương'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED MEMBER DETAIL DRAWER */}
      {selectedMember && (
        <div className="p-4 bg-stone-900 border-t border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-600/70 bg-stone-950 shrink-0 flex items-center justify-center">
              {selectedMember.avatarUrl ? (
                <img src={selectedMember.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-300 font-bold font-serif">{selectedMember.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-amber-200">
                {selectedMember.name} • {selectedMember.relation}
              </p>
              <p className="text-xs text-stone-400 font-serif">
                {selectedMember.branchName} • Thế hệ Đời {selectedMember.generation}{' '}
                {selectedMember.lunarMemorialDate ? `• Giỗ: ${selectedMember.lunarMemorialDate}` : ''}
              </p>
              {selectedMember.epitaph && (
                <p className="text-[11px] text-amber-300/80 font-serif italic mt-0.5 line-clamp-1">
                  "{selectedMember.epitaph}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedMember.isDeceased && (
              <button
                onClick={() => onPlaceOnAltar(selectedMember)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs font-serif transition-colors shadow-md"
              >
                <Flame className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span>Đặt Di Ảnh Lên Bàn Thờ</span>
              </button>
            )}
            <button
              onClick={() => setSelectedMemberId(null)}
              className="px-3 py-1.5 rounded-full border border-stone-700 text-stone-400 hover:text-stone-200 text-xs font-serif"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
