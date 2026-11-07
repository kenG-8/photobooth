export type FrameId = 'strawberry-milk' | 'matcha-cozy' | 'butter-sunshine' | 'film-35mm' | 'minimal-white';
export type ShootMode = 'strip' | 'grid';
export type PhotoFilter = 'normal' | 'bw' | 'warm' | 'pastel' | 'vintage' | 'cool';

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
  x: number; // 0-100% relative
  y: number; // 0-100% relative
  size: number; // px
  rotation: number;
}

export interface PhotoboothFrame {
  id: FrameId;
  name: string;
  emoji: string;
  description: string;
  shootHint: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  defaultText: string;
  defaultStickers: string[];
}

export interface PhotoFilterDef {
  id: PhotoFilter;
  name: string;
  css: string;
  canvasFilter: string;
  icon: string;
}

export const PHOTO_FILTERS: Record<PhotoFilter, PhotoFilterDef> = {
  normal: { id: 'normal', name: 'Gốc', css: 'none', canvasFilter: 'none', icon: '✨' },
  bw: { id: 'bw', name: 'Đen Trắng', css: 'grayscale(100%) contrast(120%)', canvasFilter: 'grayscale(100%) contrast(120%)', icon: '🖤' },
  warm: { id: 'warm', name: 'Ấm Lofi', css: 'sepia(30%) saturate(130%) brightness(105%)', canvasFilter: 'sepia(30%) saturate(130%) brightness(105%)', icon: '☕' },
  pastel: { id: 'pastel', name: 'Pastel Hồng', css: 'saturate(110%) brightness(108%) contrast(95%) hue-rotate(345deg)', canvasFilter: 'saturate(110%) brightness(108%) contrast(95%) hue-rotate(345deg)', icon: '🌸' },
  vintage: { id: 'vintage', name: 'Vintage 90s', css: 'sepia(45%) contrast(110%) brightness(95%)', canvasFilter: 'sepia(45%) contrast(110%) brightness(95%)', icon: '🎞️' },
  cool: { id: 'cool', name: 'Trong Trẻo', css: 'contrast(105%) brightness(105%) hue-rotate(15deg) saturate(95%)', canvasFilter: 'contrast(105%) brightness(105%) hue-rotate(15deg) saturate(95%)', icon: '❄️' },
};

export const FILTER_ORDER: PhotoFilter[] = ['normal', 'bw', 'warm', 'pastel', 'vintage', 'cool'];

export interface PhotoSession {
  photos: string[];
  capturedAt: Date;
}

export interface CustomizationState {
  frame: FrameId;
  filter: PhotoFilter;
  labelText: string;
  stickers: Sticker[];
}

export const PHOTOBOOTH_FRAMES: Record<FrameId, PhotoboothFrame> = {
  'strawberry-milk': {
    id: 'strawberry-milk',
    name: 'Strawberry Milk',
    emoji: '🎀',
    description: 'Siêu nữ tính & đáng yêu',
    shootHint: 'Chụp dọc 4 pose',
    bgColor: '#FFF0F5',
    textColor: '#FF758F',
    borderColor: '#FFB3C1',
    accentColor: '#FF9FB2',
    defaultText: 'sweet memories ♡',
    defaultStickers: ['🎀', '🍓'],
  },
  'matcha-cozy': {
    id: 'matcha-cozy',
    name: 'Matcha Chill',
    emoji: '🍵',
    description: 'Chill cafe Seoul vibe',
    shootHint: 'Chụp lưới 2×2',
    bgColor: '#EAF0E4',
    textColor: '#5C6B50',
    borderColor: '#B5CBA6',
    accentColor: '#7A9E6B',
    defaultText: 'chill & cozy cafe ☕',
    defaultStickers: ['🍵', '🌿'],
  },
  'butter-sunshine': {
    id: 'butter-sunshine',
    name: 'Butter Sunshine',
    emoji: '☀️',
    description: 'Vui tươi Gen Z energy',
    shootHint: 'Chụp dọc 4 pose',
    bgColor: '#FEF9C3',
    textColor: '#D97706',
    borderColor: '#FDE68A',
    accentColor: '#F59E0B',
    defaultText: 'you are my sunshine ✦',
    defaultStickers: ['✦', '☀️'],
  },
  'film-35mm': {
    id: 'film-35mm',
    name: 'Vintage Film',
    emoji: '🎞️',
    description: 'Aesthetic cuộn phim 35mm',
    shootHint: 'Chụp dọc 4 pose',
    bgColor: '#18181B',
    textColor: '#E4E4E7',
    borderColor: '#27272A',
    accentColor: '#F97316',
    defaultText: 'KODAK 400',
    defaultStickers: ['🎞️'],
  },
  'minimal-white': {
    id: 'minimal-white',
    name: 'Minimal White',
    emoji: '🤍',
    description: 'Clean girl • tối giản sang',
    shootHint: 'Chụp dọc 4 pose',
    bgColor: '#FAFAFA',
    textColor: '#71717A',
    borderColor: '#E4E4E7',
    accentColor: '#A1A1AA',
    defaultText: 'FOUR CUTS • MOMENTS',
    defaultStickers: [],
  },
};

export const FRAME_ORDER: FrameId[] = [
  'strawberry-milk',
  'matcha-cozy',
  'butter-sunshine',
  'film-35mm',
  'minimal-white',
];

export const STICKER_OPTIONS = [
  { emoji: '❤️',  label: 'Heart' },
  { emoji: '🎀',  label: 'Ribbon' },
  { emoji: '⭐',  label: 'Star' },
  { emoji: '🐱',  label: 'Cat' },
  { emoji: '✨',  label: 'Sparkle' },
  { emoji: '🌸',  label: 'Sakura' },
  { emoji: '🍀',  label: 'Clover' },
  { emoji: '🦋',  label: 'Butterfly' },
  { emoji: '🌈',  label: 'Rainbow' },
  { emoji: '🎵',  label: 'Music' },
  { emoji: '💫',  label: 'Dizzy' },
  { emoji: '🍓',  label: 'Strawberry' },
  { emoji: '🍵',  label: 'Matcha' },
  { emoji: '☀️',  label: 'Sun' },
  { emoji: '☁️',  label: 'Cloud' },
  { emoji: '🎞️',  label: 'Film' },
];
