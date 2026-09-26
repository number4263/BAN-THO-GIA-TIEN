import React, { useState, useEffect, useCallback } from 'react';
import { Ancestor, DailyProgress, HandPoseType, RitualState, FamilyMember, ClanEvent } from './types.ts';
import { INK_THEMES } from './data/backgrounds.ts';
import { getTodayQuote } from './data/quotes.ts';
import { setSoundMuted, isSoundMuted, playBellSound, playIgniteSound, playChime } from './utils/audio.ts';
import { InkWashBackground } from './components/InkWashBackground.tsx';
import { FallingPetalsCanvas, PetalType } from './components/FallingPetalsCanvas.tsx';
import { AltarView } from './components/AltarView.tsx';
import { RitualOverlay } from './components/RitualOverlay.tsx';
import { AncestorManagerModal } from './components/AncestorManagerModal.tsx';
import { FamilyTreeModal } from './components/FamilyTreeModal.tsx';
import { PrayerModal } from './components/PrayerModal.tsx';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.tsx';
import { DailyRewardModal } from './components/DailyRewardModal.tsx';
import { CustomInterfaceModal } from './components/CustomInterfaceModal.tsx';
import { DEFAULT_FAMILY_MEMBERS } from './data/defaultFamilyTree.ts';
import { DEFAULT_CLAN_EVENTS } from './data/defaultClanEvents.ts';
import vintageAncestorRestoredImg from './assets/images/vintage_ancestor_portrait_restored_1790415950712.jpg';
import ancestorThuyToImg from './assets/images/ancestor_thuy_to_1790098069363.jpg';
import ancestorGrandfatherImg from './assets/images/ancestor_grandfather_1790016792874.jpg';
import ancestorGrandmotherImg from './assets/images/ancestor_grandmother_1790016808120.jpg';
import ancestorFatherImg from './assets/images/ancestor_father_portrait_1790096132885.jpg';
import ancestorMotherImg from './assets/images/ancestor_mother_portrait_1790096147513.jpg';
import { AltarDisplayMode, CustomAltarConfig } from './types.ts';

const DEFAULT_ANCESTORS: Ancestor[] = [
  {
    id: 'anc_thuy_to',
    name: 'Cụ Thủy Tổ: Trần Đức Quang',
    relation: 'Tiên Linh Thủy Tổ',
    birthYear: '1895',
    deathYear: '1970',
    avatarUrl: vintageAncestorRestoredImg || ancestorThuyToImg,
    epitaph: 'Khai sơn phá thạch, lập nên tông miếu, lưu truyền phúc đức muôn đời cho hậu thế.',
    isActiveOnAltar: true,
    pyramidTier: 1,
    pyramidOrder: 1,
  },
  {
    id: 'anc_default_1',
    name: 'Cụ Ông: Trần Phúc Đức',
    relation: 'Tiên Linh Cụ Ông',
    birthYear: '1928',
    deathYear: '2012',
    avatarUrl: ancestorGrandfatherImg,
    epitaph: 'Cả đời phúc hậu, dạy dỗ con cháu giữ trọn đạo hiếu và nhân nghĩa.',
    isActiveOnAltar: false,
    pyramidTier: 2,
    pyramidOrder: 1,
  },
  {
    id: 'anc_default_2',
    name: 'Cụ Bà: Lê Thị Diệu Hiền',
    relation: 'Tiên Linh Cụ Bà',
    birthYear: '1932',
    deathYear: '2016',
    avatarUrl: ancestorGrandmotherImg,
    epitaph: 'Đức hạnh vẹn toàn, chở che cháu con qua bao thăng trầm.',
    isActiveOnAltar: false,
    pyramidTier: 2,
    pyramidOrder: 2,
  },
  {
    id: 'anc_father',
    name: 'Cha: Trần Văn An',
    relation: 'Hiển Khảo (Cha)',
    birthYear: '1955',
    deathYear: '2021',
    avatarUrl: ancestorFatherImg,
    epitaph: 'Ân cha như núi Thái Sơn, cần lao vì tương lai con cháu.',
    isActiveOnAltar: false,
    pyramidTier: 3,
    pyramidOrder: 1,
  },
  {
    id: 'anc_mother',
    name: 'Mẹ: Nguyễn Thị Mai',
    relation: 'Hiển Tỷ (Mẹ)',
    birthYear: '1958',
    deathYear: '2023',
    avatarUrl: ancestorMotherImg,
    epitaph: 'Nghĩa mẹ như nước trong nguồn, dịu hiền nhân hậu bao la.',
    isActiveOnAltar: false,
    pyramidTier: 3,
    pyramidOrder: 2,
  },
];

export default function App() {
  // 1. Ancestors state
  const [ancestors, setAncestors] = useState<Ancestor[]>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_ancestors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map(DEFAULT_ANCESTORS.map((d) => [d.id, d]));
          const list: Ancestor[] = parsed.map((a: Ancestor, idx: number) => {
            const def = defaultMap.get(a.id);
            return {
              ...a,
              avatarUrl: a.avatarUrl && a.avatarUrl.trim() !== '' ? a.avatarUrl : def?.avatarUrl || (idx === 0 ? ancestorGrandfatherImg : ancestorGrandmotherImg),
              pyramidTier: a.pyramidTier || def?.pyramidTier,
              pyramidOrder: a.pyramidOrder || def?.pyramidOrder,
            };
          });

          // Ensure all tiers of the pyramid have default ancestor portraits
          DEFAULT_ANCESTORS.forEach((d) => {
            if (!list.some((item) => item.id === d.id)) {
              list.push(d);
            }
          });

          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to parse ancestors', e);
    }
    return DEFAULT_ANCESTORS;
  });

  const [activeAncestorId, setActiveAncestorId] = useState<string>(() => {
    const active = ancestors.find((a) => a.isActiveOnAltar);
    return active ? active.id : ancestors[0]?.id || '';
  });

  useEffect(() => {
    try {
      localStorage.setItem('thapnhang_ancestors', JSON.stringify(ancestors));
    } catch (e) {
      console.warn('Failed to save ancestors', e);
    }
  }, [ancestors]);

  // Display Mode: 'pyramid' (Chóp tháp gia tiên tam cấp) or 'single' (Đơn ảnh)
  const [displayMode, setDisplayMode] = useState<AltarDisplayMode>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_display_mode');
      if (saved === 'single' || saved === 'pyramid') return saved;
    } catch (e) {}
    return 'pyramid'; // Mặc định hiển thị hình chóp tháp gia tiên
  });

  // Không Gian Phòng Thờ (Bật/tắt kiến trúc gian thờ cổ truyền: cột lim, hoành phi câu đối, lồng đèn)
  const [isPhongThoSpace, setIsPhongThoSpace] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_phong_tho');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Mặc định bật Không Gian Phòng Thờ
  });

  // Family Tree (Gia phả dòng họ dạng cây)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_family_tree');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse family tree', e);
    }
    return DEFAULT_FAMILY_MEMBERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('thapnhang_family_tree', JSON.stringify(familyMembers));
    } catch (e) {
      console.warn('Failed to save family tree', e);
    }
  }, [familyMembers]);

  // Clan Events (Quản lý sự kiện dòng họ & lễ giỗ)
  const [clanEvents, setClanEvents] = useState<ClanEvent[]>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_clan_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse clan events', e);
    }
    return DEFAULT_CLAN_EVENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('thapnhang_clan_events', JSON.stringify(clanEvents));
    } catch (e) {
      console.warn('Failed to save clan events', e);
    }
  }, [clanEvents]);

  // 2. Ink Wash Background Theme state
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('thapnhang_themeId');
    if (saved && INK_THEMES.some((t) => t.id === saved)) return saved;
    return 'theme_phong_tho_real'; // Mặc định chủ đề Gian Thờ Cổ Truyền Chân Thực
  });

  const currentTheme =
    INK_THEMES.find((th) => th.id === currentThemeId) || INK_THEMES[0];

  useEffect(() => {
    localStorage.setItem('thapnhang_themeId', currentThemeId);
  }, [currentThemeId]);

  // 2.1 Custom Altar Interface & User's Real Photos Configuration
  const [customAltarConfig, setCustomAltarConfig] = useState<CustomAltarConfig>(() => {
    try {
      const saved = localStorage.getItem('thapnhang_custom_altar_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse custom altar config', e);
    }
    return {
      mode: 'standard',
      dimOverlay: 20,
      warmthFilter: 15,
      blurBackdrop: 0,
      censerYOffset: 0,
      censerScale: 1,
      hideVirtualTable: false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('thapnhang_custom_altar_config', JSON.stringify(customAltarConfig));
    } catch (e) {
      console.warn('Failed to save custom altar config', e);
    }
  }, [customAltarConfig]);

  const [isCustomInterfaceModalOpen, setIsCustomInterfaceModalOpen] = useState(false);

  const handleTogglePhongThoSpace = () => {
    setIsPhongThoSpace((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('thapnhang_phong_tho', String(next));
      } catch (e) {}
      if (next && currentThemeId !== 'theme_phong_tho_real' && currentThemeId !== 'theme_phong_tho') {
        setCurrentThemeId('theme_phong_tho_real');
      }
      return next;
    });
  };

  // Falling Petals State (Hoa sen / hoa mai rơi nhẹ trên màn hình bàn thờ)
  const [petalType, setPetalType] = useState<PetalType>(() => {
    return (localStorage.getItem('thapnhang_petalType') as PetalType) || 'mixed';
  });

  const [isPetalsEnabled, setIsPetalsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('thapnhang_petalsEnabled') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('thapnhang_petalType', petalType);
  }, [petalType]);

  useEffect(() => {
    localStorage.setItem('thapnhang_petalsEnabled', String(isPetalsEnabled));
  }, [isPetalsEnabled]);

  // 3. Prayer text state
  const [prayerText, setPrayerText] = useState<string>(() => {
    const saved = localStorage.getItem('thapnhang_prayer');
    return (saved || 'Cầu cho hòa bình').normalize('NFC');
  });

  useEffect(() => {
    localStorage.setItem('thapnhang_prayer', prayerText.normalize('NFC'));
  }, [prayerText]);

  // 4. Daily Piety Points (Hiếu Dương)
  const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const today = getTodayDateStr();
    try {
      const saved = localStorage.getItem('thapnhang_daily_progress');
      if (saved) {
        const parsed: DailyProgress = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        } else {
          return {
            date: today,
            todayEarned: 0,
            totalHieuDuong: parsed.totalHieuDuong || 40,
            consecutiveDays: parsed.consecutiveDays ? parsed.consecutiveDays + 1 : 1,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse daily progress', e);
    }
    return {
      date: today,
      todayEarned: 40,
      totalHieuDuong: 70,
      consecutiveDays: 1,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('thapnhang_daily_progress', JSON.stringify(dailyProgress));
    } catch (e) {
      console.warn('Failed to save daily progress', e);
    }
  }, [dailyProgress]);

  // 5. Sound Mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => isSoundMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  // 6. Altar Incense Configuration (1 or 3 sticks, 3 poses, 5/10/15 mins)
  const [sticksCount, setSticksCount] = useState<1 | 3>(3);
  const [selectedPose, setSelectedPose] = useState<HandPoseType>('pose_anjali');
  const [durationMinutes, setDurationMinutes] = useState<5 | 10 | 15>(5);

  // Altar burning state (persists in the censer after ritual)
  const [altarIncenseLit, setAltarIncenseLit] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const [altarBurnProgress, setAltarBurnProgress] = useState<number>(0.15);

  // 7. Interactive 10-step Ritual State
  const [isRitualActive, setIsRitualActive] = useState<boolean>(false);
  const [ritualState, setRitualState] = useState<RitualState>({
    step: 'idle',
    thumbsTouching: { left: false, right: false },
    claspProgress: 0,
    incenseLit: [false, false, false],
    sticksCount: 3,
    durationMinutes: 5,
    burnProgress: 0,
    isFastForward: false,
    selectedPose: 'pose_anjali',
    isBowing: false,
  });

  // 8. Modals
  const [isAncestorModalOpen, setIsAncestorModalOpen] = useState(false);
  const [isFamilyTreeModalOpen, setIsFamilyTreeModalOpen] = useState(false);
  const [familyTreeTab, setFamilyTreeTab] = useState<'tree' | 'pedigree' | 'events' | 'grid'>('tree');
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState(30);

  // Today's wisdom quote
  const todayQuote = getTodayQuote();

  // START RITUAL
  const handleStartRitual = () => {
    playBellSound();
    setRitualState({
      step: 'hands_ready',
      thumbsTouching: { left: false, right: false },
      claspProgress: 0,
      incenseLit: [false, false, false],
      sticksCount,
      durationMinutes,
      burnProgress: 0,
      isFastForward: false,
      selectedPose,
      isBowing: false,
    });
    setIsRitualActive(true);
  };

  // COMPLETE RITUAL (Award Hiếu Dương points according to rule: +30, max 100/day)
  const handleCompleteRitual = useCallback(() => {
    const todayMax = 100;
    const currentToday = dailyProgress.todayEarned;
    const potentialEarn = 30;
    const actualEarn = Math.min(potentialEarn, Math.max(0, todayMax - currentToday));

    setDailyProgress((prev) => ({
      ...prev,
      todayEarned: Math.min(todayMax, prev.todayEarned + actualEarn),
      totalHieuDuong: prev.totalHieuDuong + actualEarn,
      lastRitualTime: new Date().toLocaleTimeString(),
    }));

    setLastEarnedPoints(actualEarn > 0 ? actualEarn : 30);

    // Transfer lit sticks to altar censer
    setAltarIncenseLit(ritualState.incenseLit);
    setAltarBurnProgress(ritualState.burnProgress || 0.1);

    setIsRitualActive(false);
    setIsRewardModalOpen(true);
  }, [dailyProgress.todayEarned, ritualState.incenseLit, ritualState.burnProgress]);

  // Cancel / Close ritual
  const handleCancelRitual = () => {
    setIsRitualActive(false);
  };

  // Direct stick lighting on the altar
  const handleLightAltarStick = (stickIndex: number) => {
    playIgniteSound();
    playChime();
    setAltarIncenseLit((prev) => {
      const copy = [...prev] as [boolean, boolean, boolean];
      copy[stickIndex] = true;
      return copy;
    });
    setAltarBurnProgress((prev) => (prev > 0.8 ? 0.05 : prev));
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-stone-100 text-stone-900 flex flex-col justify-between font-sans">
      {/* Ink wash artistic landscape background */}
      <InkWashBackground theme={currentTheme} customConfig={customAltarConfig} />

      {/* Serene falling lotus & plum petals effect */}
      <FallingPetalsCanvas petalType={petalType} enabled={isPetalsEnabled} density="normal" />

      {/* Main Altar View */}
      <AltarView
        ancestors={ancestors}
        activeAncestorId={activeAncestorId}
        onOpenAncestorManager={() => setIsAncestorModalOpen(true)}
        onOpenFamilyTree={() => {
          setFamilyTreeTab('tree');
          setIsFamilyTreeModalOpen(true);
        }}
        onOpenPedigreeChart={() => {
          setFamilyTreeTab('pedigree');
          setIsFamilyTreeModalOpen(true);
        }}
        onOpenClanEvents={() => {
          setFamilyTreeTab('events');
          setIsFamilyTreeModalOpen(true);
        }}
        prayerText={prayerText}
        onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        sticksCount={sticksCount}
        onChangeSticksCount={setSticksCount}
        durationMinutes={durationMinutes}
        onChangeDuration={setDurationMinutes}
        selectedPose={selectedPose}
        onChangePose={setSelectedPose}
        onStartRitual={handleStartRitual}
        todayQuote={todayQuote}
        todayEarned={dailyProgress.todayEarned}
        totalHieuDuong={dailyProgress.totalHieuDuong}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        altarIncenseLit={altarIncenseLit}
        onLightAltarStick={handleLightAltarStick}
        burnProgress={altarBurnProgress}
        petalType={petalType}
        onChangePetalType={setPetalType}
        isPetalsEnabled={isPetalsEnabled}
        onTogglePetals={setIsPetalsEnabled}
        displayMode={displayMode}
        onChangeDisplayMode={(mode) => {
          setDisplayMode(mode);
          try {
            localStorage.setItem('thapnhang_display_mode', mode);
          } catch (e) {}
        }}
        isPhongThoSpace={isPhongThoSpace}
        onTogglePhongThoSpace={handleTogglePhongThoSpace}
        familyMembers={familyMembers}
        onUpdateAncestors={setAncestors}
        onSelectActiveAncestor={(id) => {
          setActiveAncestorId(id);
          setAncestors((prev) =>
            prev.map((a) => ({ ...a, isActiveOnAltar: a.id === id }))
          );
        }}
        customAltarConfig={customAltarConfig}
        onOpenCustomInterfaceModal={() => setIsCustomInterfaceModalOpen(true)}
      />

      {/* 10-Step Interactive Ritual Overlay with Dual-Thumb Clasping & 3 Hand Poses */}
      {isRitualActive && (
        <RitualOverlay
          ritualState={ritualState}
          setRitualState={setRitualState}
          onCompleteRitual={handleCompleteRitual}
          onCancelRitual={handleCancelRitual}
          prayerText={prayerText}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Modal 1: Ancestor Photo Frames Manager (Unlimited) */}
      <AncestorManagerModal
        isOpen={isAncestorModalOpen}
        onClose={() => setIsAncestorModalOpen(false)}
        ancestors={ancestors}
        onUpdateAncestors={setAncestors}
        activeAncestorId={activeAncestorId}
        onOpenFamilyTree={() => {
          setFamilyTreeTab('tree');
          setIsFamilyTreeModalOpen(true);
        }}
        onSelectActive={(id) => {
          setActiveAncestorId(id);
          setAncestors((prev) =>
            prev.map((a) => ({ ...a, isActiveOnAltar: a.id === id }))
          );
        }}
        onStartRitual={() => {
          setIsAncestorModalOpen(false);
          handleStartRitual();
        }}
      />

      {/* Modal 1.5: Genealogical Family Tree Model (Cây Gia Phả & Phả Đồ Hệ & Sự Kiện Dòng Họ) */}
      <FamilyTreeModal
        isOpen={isFamilyTreeModalOpen}
        onClose={() => setIsFamilyTreeModalOpen(false)}
        familyMembers={familyMembers}
        onUpdateFamilyMembers={setFamilyMembers}
        ancestors={ancestors}
        onUpdateAncestors={setAncestors}
        activeAncestorId={activeAncestorId}
        onSelectActiveAncestor={(id) => {
          setActiveAncestorId(id);
          setAncestors((prev) =>
            prev.map((a) => ({ ...a, isActiveOnAltar: a.id === id }))
          );
        }}
        clanEvents={clanEvents}
        onUpdateClanEvents={setClanEvents}
        initialTab={familyTreeTab}
        onStartRitual={() => {
          setIsFamilyTreeModalOpen(false);
          handleStartRitual();
        }}
      />

      {/* Modal 2: Prayer / Wish Calligraphy Composer */}
      <PrayerModal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
        currentPrayer={prayerText}
        onSavePrayer={setPrayerText}
      />

      {/* Modal 3: Ink Wash Themes & Hiếu Dương Progress */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={(themeId) => {
          setCurrentThemeId(themeId);
          setIsThemeModalOpen(false);
          playBellSound();
        }}
        totalHieuDuong={dailyProgress.totalHieuDuong}
      />

      {/* Modal 4: Daily Piety Reward & Scripture Blessing */}
      <DailyRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        earnedPoints={lastEarnedPoints}
        todayEarned={dailyProgress.todayEarned}
        todayMax={100}
        totalHieuDuong={dailyProgress.totalHieuDuong}
        quote={todayQuote}
      />

      {/* Modal 5: Custom Altar Interface & User's Real Photos */}
      <CustomInterfaceModal
        isOpen={isCustomInterfaceModalOpen}
        onClose={() => setIsCustomInterfaceModalOpen(false)}
        config={customAltarConfig}
        onSaveConfig={setCustomAltarConfig}
        onOpenAncestorManager={() => {
          setIsCustomInterfaceModalOpen(false);
          setIsAncestorModalOpen(true);
        }}
      />
    </div>
  );
}
