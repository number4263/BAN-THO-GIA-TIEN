import React from 'react';
import { BackgroundTheme, CustomAltarConfig } from '../types.ts';

interface InkWashBackgroundProps {
  theme: BackgroundTheme;
  customConfig?: CustomAltarConfig;
}

export const InkWashBackground: React.FC<InkWashBackgroundProps> = ({ theme, customConfig }) => {
  const isCustomBackdrop =
    customConfig?.mode === 'real_photo_backdrop' && Boolean(customConfig?.customBackdropUrl);
  const isFullAltarPhoto =
    customConfig?.mode === 'full_altar_photo' && Boolean(customConfig?.fullAltarPhotoUrl);

  const activeImageUrl = isFullAltarPhoto
    ? customConfig?.fullAltarPhotoUrl
    : isCustomBackdrop
    ? customConfig?.customBackdropUrl
    : theme.imageUrl;

  const dimOverlay = customConfig?.dimOverlay ?? 20;
  const warmth = customConfig?.warmthFilter ?? 15;
  const blur = customConfig?.blurBackdrop ?? 0;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
      {/* Background Gradient - Bright, light, ethereal rice-paper atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-colors duration-1000`} />

      {activeImageUrl ? (
        <div className="absolute inset-0">
          <img
            src={activeImageUrl}
            alt={isCustomBackdrop || isFullAltarPhoto ? 'Bàn Thờ Gia Đình Thật' : theme.vietnameseTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-all duration-700"
            style={{
              filter: `brightness(${100 - dimOverlay * 0.7}%) sepia(${warmth}%) blur(${blur}px)`,
            }}
          />
          {/* User-defined dim darkening overlay */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: dimOverlay / 100 }}
          />
          {/* Subtle warm temple lighting vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-transparent to-stone-950/85 pointer-events-none" />
          <div className="absolute inset-0 bg-amber-950/10 mix-blend-color pointer-events-none" />
        </div>
      ) : (
        <>
          {/* Subtle traditional Xuan rice-paper texture overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#a8a29e 0.75px, transparent 0.75px), radial-gradient(#d6d3d1 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          {/* SVG Canvas for Master Ink Wash Landscape & Flowing Chinese/Vietnamese Ink Ribbons */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 1000 1600"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
        <defs>
          <filter id="inkBlurSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="inkBlurDeep" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id="inkDiffuse" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>

          {/* Gradients for Authentic Ink Wash (Mực Tàu) */}
          <linearGradient id="inkRibbonGrad1" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#1c1917" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#292524" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#57534e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a8a29e" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="inkRibbonGrad2" x1="0" y1="0.2" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#292524" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#44403c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#78716c" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="inkMistRibbon" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#1c1917" stopOpacity="0.02" />
            <stop offset="30%" stopColor="#292524" stopOpacity="0.28" />
            <stop offset="65%" stopColor="#44403c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1c1917" stopOpacity="0.01" />
          </linearGradient>

          <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafaf9" stopOpacity="0" />
            <stop offset="50%" stopColor="#f5f5f4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e7e5e4" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="farMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78716c" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#d6d3d1" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="midMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#44403c" stopOpacity="0.48" />
            <stop offset="70%" stopColor="#78716c" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f5f5f4" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="nearMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#292524" stopOpacity="0.55" />
            <stop offset="75%" stopColor="#57534e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d6d3d1" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Soft morning sun in ethereal misty sky */}
        <circle cx="280" cy="340" r="90" fill="url(#sunGlow)" opacity="0.65" filter="url(#inkBlurDeep)" />
        <circle cx="280" cy="340" r="55" fill="#fff7ed" opacity="0.85" filter="url(#inkBlurSoft)" />

        {/* ========================================================== */}
        {/* DẢI MỰC TÀU THỦY MẶC (SWEEPING INK WASH BRUSH RIBBONS)     */}
        {/* ========================================================== */}

        {/* 1. Dải đại bút mực tàu chính (Major Calligraphic Ink Swath in Upper Sky) */}
        <path
          d="M 980 180 
             C 850 210, 720 160, 580 230 
             C 440 300, 380 430, 240 450 
             C 140 464, 40 410, -20 440 
             L -20 480 
             C 60 450, 160 500, 270 480 
             C 430 450, 480 320, 620 260 
             C 740 210, 870 260, 1010 210 Z"
          fill="url(#inkRibbonGrad1)"
          filter="url(#inkDiffuse)"
        />

        {/* Nét xước phi bạch (Dry brush streaks) chạy dọc theo dải mực chính */}
        <path
          d="M 920 200 C 800 220, 680 180, 550 250 C 430 315, 360 420, 260 455"
          stroke="#1c1917"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 15 80 25 30 20"
          opacity="0.35"
          fill="none"
        />
        <path
          d="M 880 215 C 760 232, 640 200, 520 270 C 410 330, 340 435, 220 465"
          stroke="#292524"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="60 20 45 30"
          opacity="0.3"
          fill="none"
        />

        {/* 2. Dải mực tàu thứ hai uốn lượn nhẹ qua chân mây (Secondary Floating Ink Ribbon) */}
        <path
          d="M -30 280 
             C 120 260, 240 340, 390 320 
             C 520 300, 610 230, 750 260 
             C 850 280, 930 350, 1030 330 
             L 1030 355 
             C 920 375, 840 310, 740 285 
             C 600 255, 510 330, 380 345 
             C 230 365, 110 290, -30 305 Z"
          fill="url(#inkRibbonGrad2)"
          filter="url(#inkDiffuse)"
        />

        {/* 3. Dải mực loang ngang chân trời (Broad Horizontal Ink Wash Ribbon across mid-distance) */}
        <path
          d="M -40 520 
             C 160 480, 320 560, 510 510 
             C 700 460, 830 530, 1040 490 
             L 1040 550 
             C 820 590, 690 510, 500 560 
             C 310 610, 150 530, -40 570 Z"
          fill="url(#inkMistRibbon)"
          filter="url(#inkBlurSoft)"
        />

        {/* 4. Dải mực tàu thắt vòng nghệ thuật (Ethereal Calligraphy Ribbon Swirl in Mid-Ground) */}
        <path
          d="M 680 430 
             C 740 390, 840 410, 890 460 
             C 930 500, 910 560, 850 580 
             C 780 600, 720 540, 750 490 
             C 770 460, 820 450, 850 470 
             C 870 485, 875 510, 850 525 
             C 825 540, 790 520, 800 500"
          stroke="#292524"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
          fill="none"
          filter="url(#inkDiffuse)"
        />

        {/* Các vết điểm mực tàu / mực bắn tự nhiên (Natural ink spatter dots) */}
        <g fill="#1c1917" opacity="0.32">
          <circle cx="210" cy="435" r="3.5" />
          <circle cx="225" cy="445" r="2" />
          <circle cx="195" cy="450" r="1.5" />
          <circle cx="560" cy="245" r="3" />
          <circle cx="575" cy="235" r="1.8" />
          <circle cx="730" cy="190" r="2.5" />
          <circle cx="745" cy="205" r="1.5" />
          <circle cx="820" cy="460" r="2.5" />
          <circle cx="835" cy="475" r="1.6" />
        </g>

        {/* Dấu triện son đỏ cổ truyền phương Đông (Traditional Vermilion Seal "Tâm An") */}
        <g transform="translate(890, 80)" opacity="0.65">
          <rect x="0" y="0" width="38" height="38" rx="4" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
          <rect x="3" y="3" width="32" height="32" rx="2" fill="none" stroke="#fecaca" strokeWidth="1" opacity="0.7" />
          {/* Stylized Lotus / Heart Glyph in seal */}
          <path
            d="M19 10 C16 16 11 18 11 23 C11 27 15 29 19 29 C23 29 27 27 27 23 C27 18 22 16 19 10 Z"
            fill="#fef2f2"
            opacity="0.9"
          />
          <circle cx="19" cy="23" r="2" fill="#991b1b" />
        </g>

        {/* Far Distant Mountains (Lớp núi xa mờ ảo) */}
        <path
          d="M-50 680 Q160 480 340 590 T720 520 Q880 470 1050 620 L1050 1100 L-50 1100 Z"
          fill="url(#farMountainGrad)"
          filter="url(#inkBlurSoft)"
        />

        {/* Mid-range Peaks (Dãy núi trùng điệp mực loang) */}
        <path
          d="M-80 820 C120 620 220 740 420 640 C600 550 720 710 890 610 C960 570 1030 650 1100 680 L1100 1300 L-80 1300 Z"
          fill="url(#midMountainGrad)"
        />

        {/* Flying birds / Cranes in distance (Đàn nhạn thiên di) */}
        <g opacity="0.55" fill="#292524">
          <path d="M420 340 Q430 332 440 340 Q450 332 460 340 Q440 338 420 340 Z" />
          <path d="M455 320 Q463 313 471 320 Q479 313 487 320 Q471 318 455 320 Z" />
          <path d="M490 345 Q496 339 502 345 Q508 339 514 345 Q502 343 490 345 Z" />
        </g>

        {/* Specific Theme Flourishes */}
        {theme.mountainSvgStyle === 'bamboo_grove' && (
          <g opacity="0.38" stroke="#065f46" strokeWidth="2.5" fill="none">
            <path d="M80 500 L85 1000 M90 530 L120 515 M80 620 L50 605 M85 750 L125 735" />
            <path d="M140 420 L145 1050 M140 480 L110 460 M145 580 L180 560" />
            <path d="M920 450 L915 1100 M920 520 L880 500 M915 640 L950 620" />
          </g>
        )}

        {theme.mountainSvgStyle === 'lotus_pond' && (
          <g opacity="0.4" fill="#9f1239">
            <path d="M220 1200 C210 1160 235 1140 250 1150 C265 1140 290 1160 280 1200 Z" />
            <path d="M720 1180 C710 1140 735 1120 750 1130 C765 1120 790 1140 780 1180 Z" />
          </g>
        )}

        {/* Closer Ridge and Mist Layer */}
        <path
          d="M-50 960 Q200 840 480 920 T950 860 Q1020 890 1080 940 L1080 1600 L-50 1600 Z"
          fill="url(#nearMountainGrad)"
        />

        {/* Bottom Rising Fog (Lớp sương mờ sáng thanh thoát) */}
        <rect x="0" y="750" width="1000" height="850" fill="url(#fogGrad)" filter="url(#inkBlurSoft)" />
      </svg>
      </>
      )}
    </div>
  );
};
