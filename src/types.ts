export type HandPoseType = 'pose_anjali' | 'pose_clasped' | 'pose_fingertips';

export type AltarDisplayMode = 'single' | 'pyramid';

export type CustomAltarMode = 'standard' | 'real_photo_backdrop' | 'full_altar_photo';

export interface CustomAltarConfig {
  mode: CustomAltarMode;
  customBackdropUrl?: string; // Base64 or URL for room background
  fullAltarPhotoUrl?: string; // Base64 or URL for entire family altar table
  dimOverlay: number; // 0 to 80% (darkening overlay so candles/smoke stand out)
  warmthFilter: number; // 0 to 100% (warm candlelit tint)
  blurBackdrop: number; // 0 to 8px
  censerYOffset: number; // -120 to 120px (fine tune burner position on real altar photo)
  censerScale: number; // 0.6 to 1.4 (scale of virtual burner & offerings on real photo)
  hideVirtualTable: boolean; // hide synthetic table when using full altar photo
}

export interface Ancestor {
  id: string;
  name: string;
  relation: string; // e.g., 'Ông Nội', 'Bà Ngoại', 'Cha', 'Mẹ', 'Cụ Cố'
  birthYear?: string;
  deathYear?: string;
  avatarUrl?: string; // base64 or placeholder
  epitaph?: string; // Lời tưởng nhớ
  isActiveOnAltar: boolean;
  pyramidTier?: 1 | 2 | 3; // 1 = Đỉnh tháp (1 vị), 2 = Tầng giữa (2 vị), 3 = Tầng hạ (3-4 vị)
  pyramidOrder?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // vai vế, e.g., 'Cụ Cố Ông', 'Cụ Cố Bà', 'Ông Nội', 'Bà Nội', 'Bác Trưởng', 'Cha', 'Mẹ', 'Bản thân'...
  generation: number; // 1 (Tiên tổ), 2 (Ông bà), 3 (Cha mẹ/Cô chú), 4 (Bản thân/Anh chị em), 5 (Con cháu)
  gender: 'male' | 'female';
  birthYear?: string;
  deathYear?: string;
  isDeceased: boolean;
  lunarMemorialDate?: string; // Ngày giỗ âm lịch, e.g., '15 tháng Chạp', 'Mùng 8 tháng 4'
  avatarUrl?: string;
  epitaph?: string;
  branchName?: string; // Chi phái, e.g., 'Chi Trưởng', 'Chi Nhánh Hai'
  parentId?: string; // ID cha/mẹ trực hệ
  spouseId?: string; // ID người phối ngẫu
  ancestorId?: string; // ID liên kết với khung di ảnh trên bàn thờ
}

export interface BackgroundTheme {
  id: string;
  name: string;
  vietnameseTitle: string;
  description: string;
  requiredHieuDuong: number;
  gradient: string;
  mountainSvgStyle: 'misty_peaks' | 'bamboo_grove' | 'cloud_sanctuary' | 'lotus_pond' | 'ancient_temple' | 'grand_landscape' | 'custom_image';
  accentColor: string;
  imageUrl?: string;
}

export interface ScriptureQuote {
  id: number;
  quote: string;
  source: string; // Ví dụ: Ca Dao / Kinh Thánh Châm Ngôn / Khổng Tử / Phật Ngôn
  reflection: string; // Ý nghĩa về đạo hiếu và sự an lành
}

export interface RitualState {
  step: 'idle' | 'hands_ready' | 'holding_thumbs' | 'hands_clasped' | 'incense_appeared' | 'lighting' | 'burning' | 'completed';
  thumbsTouching: { left: boolean; right: boolean };
  claspProgress: number; // 0 to 100%
  incenseLit: [boolean, boolean, boolean]; // for 1 to 3 sticks
  sticksCount: 1 | 3;
  durationMinutes: 5 | 10 | 15;
  burnProgress: number; // 0 to 1
  isFastForward: boolean;
  selectedPose: HandPoseType;
  isBowing: boolean;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  todayEarned: number; // Max 100
  totalHieuDuong: number;
  consecutiveDays: number;
  lastRitualTime?: string;
}

export type SmokeStylePreset = 'thuy_mac' | 'tram_huong' | 'thanh_tinh';

export interface SmokeConfig {
  preset: SmokeStylePreset;
  opacity: number; // 0.3 to 1.5 (default 1.0)
  waviness: number; // 0.3 to 2.0 (default 1.0)
  flowSpeed: number; // 0.6 to 1.6 (default 1.0)
  inkGradation: number; // 0.5 to 1.5 (falloff gradient from tip, default 1.0)
}

export type ClanEventType =
  | 'gio_to'
  | 'gio_thuong'
  | 'te_xuan_thu'
  | 'tao_mo'
  | 'mung_tho'
  | 'hop_ho'
  | 'khuyen_hoc';

export interface ClanEvent {
  id: string;
  title: string;
  type: ClanEventType;
  lunarDate: string; // e.g. "18 tháng Chạp (AL)", "10 tháng Giêng (AL)", "Mùng 3 tháng 3 (Thanh Minh)"
  solarDateApprox?: string; // Dương lịch dự kiến
  location: string;
  organizer: string;
  description: string;
  relatedMemberIds?: string[];
  reminderDaysBefore?: number;
  isAnnual: boolean;
  notes?: string;
}
