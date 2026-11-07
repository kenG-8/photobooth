import React, { useRef, useState } from 'react';
import type { CustomizationState } from '../types';
import { PHOTO_FILTERS } from '../types';

interface PhotoPreviewProps {
  photos: string[];
  customization: CustomizationState;
  onRemoveSticker?: (id: string) => void;
  onUpdateSticker?: (id: string, x: number, y: number) => void;
  onDropSticker?: (emoji: string, x: number, y: number) => void;
  onRotateSticker?: (id: string) => void;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photos,
  customization,
  onRemoveSticker,
  onUpdateSticker,
  onDropSticker,
  onRotateSticker,
}) => {
  const { frame: frameId, labelText, stickers, filter } = customization;
  const filterCss = PHOTO_FILTERS[filter]?.css || 'none';
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragMovedRef = useRef(false);

  // Drag over frame to allow dropping from sticker panel
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Drop sticker onto specific (x, y) location on the frame
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData('text/plain');
    if (!emoji || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(5, Math.min(95, Math.round(rawX)));
    const y = Math.max(5, Math.min(95, Math.round(rawY)));
    onDropSticker?.(emoji, x, y);
  };

  // Pointer dragging existing stickers around
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
    setSelectedId(id);
    dragMovedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (draggingId !== id || !containerRef.current) return;
    dragMovedRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(4, Math.min(96, Math.round(rawX)));
    const clampedY = Math.max(4, Math.min(96, Math.round(rawY)));
    onUpdateSticker?.(id, clampedX, clampedY);
  };

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    if (draggingId === id) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingId(null);
    }
  };

  const renderStickers = () => (
    <>
      {stickers.map((s) => {
        const isSelected = selectedId === s.id;
        const isDragging = draggingId === s.id;

        return (
          <div
            key={s.id}
            onPointerDown={(e) => handlePointerDown(e, s.id)}
            onPointerMove={(e) => handlePointerMove(e, s.id)}
            onPointerUp={(e) => handlePointerUp(e, s.id)}
            onPointerCancel={(e) => handlePointerUp(e, s.id)}
            className={`absolute select-none cursor-grab active:cursor-grabbing touch-none transition-transform group ${
              isDragging ? 'scale-150 z-40 opacity-90' : isSelected ? 'scale-115 z-30' : 'hover:scale-125 z-20'
            }`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
              touchAction: 'none',
            }}
            title="Kéo thả để di chuyển vị trí sticker"
          >
            {/* Sticker emoji */}
            <div
              className={`text-2xl p-0.5 rounded-full transition-all ${
                isSelected
                  ? 'ring-2 ring-pink-400 bg-white/60 shadow-sm'
                  : 'hover:bg-white/40'
              }`}
            >
              {s.emoji}
            </div>

            {/* Quick delete button */}
            {isSelected && (
              <>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onRemoveSticker?.(s.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-rose-600 transition-colors"
                  title="Xoá sticker này"
                >
                  ×
                </button>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onRotateSticker?.(s.id);
                  }}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-md hover:bg-pink-600 transition-colors"
                  title="Xoay sticker 20°"
                >
                  ↻
                </button>
              </>
            )}
          </div>
        );
      })}
    </>
  );

  const containerCommonProps = {
    ref: containerRef,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onClick: () => setSelectedId(null),
  };

  // ===================== STRAWBERRY MILK PREVIEW =====================
  if (frameId === 'strawberry-milk') {
    return (
      <div
        {...containerCommonProps}
        className="relative mx-auto rounded-3xl overflow-hidden shadow-pastel-lg select-none transition-all duration-300"
        style={{
          backgroundColor: '#FFF0F5',
          border: '5px solid #FFB3C1',
          maxWidth: 220,
          width: '100%',
        }}
      >
        {/* Bows header */}
        <div className="flex justify-between items-center px-3 pt-2 text-base">
          <span className="transform -rotate-12">🎀</span>
          <span className="text-[10px] text-pink-400 font-serif italic">✿ photo diary ✿</span>
          <span className="transform rotate-12">🎀</span>
        </div>

        {/* Photos */}
        <div className="p-2 space-y-1.5">
          {photos.map((src, i) => (
            <div
              key={i}
              className="bg-white p-1 rounded-xl shadow-sm border border-pink-100 relative overflow-hidden"
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-lg transition-all duration-300"
                style={{ filter: filterCss }}
              />
              <span className="absolute bottom-1.5 right-2 text-[9px] text-pink-400 font-serif">
                ♡ {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-2 pb-3 text-center">
          <div className="flex justify-center gap-2 text-xs mb-1">
            <span>🍓</span>
            <span>♡</span>
            <span>✿</span>
            <span>♡</span>
            <span>🍓</span>
          </div>
          <div className="text-[11px] font-bold text-rose-400 italic tracking-wide">
            {labelText}
          </div>
          <div className="text-[9px] text-pink-300 font-medium">
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        {renderStickers()}
      </div>
    );
  }

  // ===================== MATCHA COZY PREVIEW =====================
  if (frameId === 'matcha-cozy') {
    return (
      <div
        {...containerCommonProps}
        className="relative mx-auto rounded-3xl overflow-hidden shadow-pastel-lg select-none transition-all duration-300"
        style={{
          backgroundColor: '#EAF0E4',
          border: '3px dashed #A8C99A',
          maxWidth: 240,
          width: '100%',
        }}
      >
        {/* Header */}
        <div className="text-center pt-2 pb-1">
          <span className="text-[10px] text-[#5C6B50] font-serif italic">☕ chill with me · slow life ☕</span>
        </div>

        {/* 2x2 Grid */}
        <div className="p-2 grid grid-cols-2 gap-1.5">
          {photos.map((src, i) => (
            <div
              key={i}
              className="bg-white p-0.5 rounded-lg shadow-sm border border-dashed border-[#A8C99A] overflow-hidden"
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-square object-cover rounded transition-all duration-300"
                style={{ filter: filterCss }}
              />
              <span className="block text-[8px] text-[#5C6B50] text-right pr-1 font-mono">0{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-2 pb-2 text-center border-t border-dashed border-[#B5CBA6] mx-2 pt-1.5">
          <div className="flex justify-center gap-2 text-xs mb-0.5">
            <span>🍵</span><span>🌿</span><span>☕</span>
          </div>
          <div className="text-[10px] font-bold text-[#5C6B50] tracking-wider uppercase">
            {labelText}
          </div>
          <div className="text-[8px] text-[#8FAD7E] font-medium">
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        {renderStickers()}
      </div>
    );
  }

  // ===================== BUTTER SUNSHINE PREVIEW =====================
  if (frameId === 'butter-sunshine') {
    return (
      <div
        {...containerCommonProps}
        className="relative mx-auto rounded-3xl overflow-hidden shadow-pastel-lg select-none transition-all duration-300"
        style={{
          backgroundColor: '#FEF9C3',
          border: '5px solid #FDE68A',
          maxWidth: 220,
          width: '100%',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-3 pt-2 text-xs">
          <span>✦</span>
          <span className="text-[10px] font-bold text-amber-600 tracking-wider">SUNSHINE ☀️</span>
          <span>✦</span>
        </div>

        {/* Photos */}
        <div className="p-2 space-y-1.5">
          {photos.map((src, i) => (
            <div
              key={i}
              className="bg-white p-1 rounded-2xl shadow-sm border border-amber-200 overflow-hidden relative"
            >
              <img
                src={src}
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-xl transition-all duration-300"
                style={{ filter: filterCss }}
              />
              <span className="absolute top-1.5 right-2 text-[9px] text-amber-400">✦</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-2 pb-3 text-center">
          <div className="text-[11px] font-bold text-amber-700 italic tracking-wide">
            {labelText}
          </div>
          <div className="text-[9px] text-amber-500 font-medium">
            ✦ {new Date().toLocaleDateString('vi-VN')} ✦
          </div>
        </div>

        {renderStickers()}
      </div>
    );
  }

  // ===================== FILM 35MM PREVIEW =====================
  if (frameId === 'film-35mm') {
    return (
      <div
        {...containerCommonProps}
        className="relative mx-auto rounded-xl overflow-hidden shadow-2xl select-none transition-all duration-300"
        style={{
          backgroundColor: '#18181B',
          border: '3px solid #27272A',
          maxWidth: 220,
          width: '100%',
        }}
      >
        {/* Film header */}
        <div className="px-3 pt-2 pb-1 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-orange-500 font-mono">KODAK </span>
            <span className="text-[10px] text-zinc-400 font-mono">400</span>
          </div>
          <span className="text-[8px] text-zinc-500 font-mono">35mm FILM</span>
        </div>

        {/* Photos with sprocket hole mock */}
        <div className="p-1.5 space-y-1 relative">
          {photos.map((src, i) => (
            <div key={i} className="relative">
              <span className="text-[7px] text-zinc-600 font-mono block pl-1">▸ 0{i + 1}A</span>
              <img
                src={src}
                alt=""
                className="w-full aspect-[4/3] object-cover transition-all duration-300"
                style={{ filter: filterCss }}
              />
            </div>
          ))}
        </div>

        {/* Film footer with LED date stamp */}
        <div className="px-3 pb-2 pt-1 border-t border-zinc-800">
          <div className="text-[9px] text-zinc-400 font-mono truncate">{labelText}</div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-[7px] text-zinc-600 font-mono">ISO 400</span>
            <span
              className="text-[11px] font-bold text-orange-500 font-mono tracking-widest"
              style={{ textShadow: '0 0 6px rgba(249,115,22,0.8)' }}
            >
              '{new Date().getFullYear().toString().slice(2)} {String(new Date().getMonth() + 1).padStart(2, '0')} {String(new Date().getDate()).padStart(2, '0')}
            </span>
          </div>
        </div>

        {renderStickers()}
      </div>
    );
  }

  // ===================== MINIMAL WHITE PREVIEW =====================
  return (
    <div
      {...containerCommonProps}
      className="relative mx-auto rounded-lg overflow-hidden shadow-lg select-none transition-all duration-300"
      style={{
        backgroundColor: '#FAFAFA',
        border: '1px solid #E4E4E7',
        maxWidth: 220,
        width: '100%',
      }}
    >
      {/* Header */}
      <div className="text-center pt-2 pb-1 border-b border-zinc-200 mx-3">
        <span className="text-[8px] text-zinc-400 tracking-[0.2em] font-sans">P H O T O B O O T H</span>
      </div>

      {/* Photos */}
      <div className="p-2 space-y-1.5">
        {photos.map((src, i) => (
          <div key={i} className="bg-white p-0.5 shadow-sm border border-zinc-100 relative">
            <img
              src={src}
              alt=""
              className="w-full aspect-[4/3] object-cover transition-all duration-300"
              style={{ filter: filterCss }}
            />
            <span className="absolute bottom-1 right-1.5 text-[8px] text-zinc-400 font-mono">
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Footer with barcode */}
      <div className="px-3 pb-3 text-center border-t border-zinc-200 pt-2">
        <div className="text-[9px] font-semibold text-zinc-600 tracking-wider uppercase mb-1">
          {labelText}
        </div>
        {/* Mock barcode */}
        <div className="flex justify-center items-center h-4 gap-0.5 my-1">
          {[2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 2, 1, 2, 1, 3].map((w, i) => (
            <div
              key={i}
              className="bg-zinc-600 h-full"
              style={{ width: `${w * 1.5}px` }}
            />
          ))}
        </div>
        <div className="text-[8px] text-zinc-400 font-mono">
          {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {renderStickers()}
    </div>
  );
};

export default PhotoPreview;
