import React, { useState } from 'react';
import { X, Shuffle, Sparkles } from 'lucide-react';
import type { CustomizationState, FrameId, PhotoFilter, Sticker } from '../types';
import { PHOTOBOOTH_FRAMES, FRAME_ORDER, STICKER_OPTIONS, PHOTO_FILTERS, FILTER_ORDER } from '../types';

interface FrameCustomizerProps {
  customization: CustomizationState;
  onChange: (c: CustomizationState) => void;
}

const FrameCustomizer: React.FC<FrameCustomizerProps> = ({ customization, onChange }) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'filter' | 'label' | 'sticker'>('concept');

  const update = (patch: Partial<CustomizationState>) => onChange({ ...customization, ...patch });

  const selectFrame = (frameId: FrameId) => {
    const frame = PHOTOBOOTH_FRAMES[frameId];
    // Automatically suggest BW for 35mm film if still normal, or keep filter
    const suggestedFilter = frameId === 'film-35mm' && customization.filter === 'normal' ? 'vintage' : customization.filter;
    update({
      frame: frameId,
      labelText: frame.defaultText,
      filter: suggestedFilter,
    });
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      label: emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 36,
      rotation: (Math.random() - 0.5) * 30,
    };
    update({ stickers: [...customization.stickers, newSticker] });
  };

  const removeSticker = (id: string) => {
    update({ stickers: customization.stickers.filter(s => s.id !== id) });
  };

  const randomizeStickers = () => {
    const updated = customization.stickers.map(s => ({
      ...s,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      rotation: (Math.random() - 0.5) * 40,
    }));
    update({ stickers: updated });
  };

  const clearStickers = () => update({ stickers: [] });

  const currentFrame = PHOTOBOOTH_FRAMES[customization.frame] || PHOTOBOOTH_FRAMES['strawberry-milk'];

  const tabs = [
    { key: 'concept', label: '🎨 Khung' },
    { key: 'filter',  label: '🪄 Bộ Lọc' },
    { key: 'label',   label: '✏️ Nhãn' },
    { key: 'sticker', label: '🌸 Sticker' },
  ] as const;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-pastel border border-pink-100 overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-pink-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 text-xs font-bold transition-all ${
              activeTab === t.key
                ? 'bg-gradient-to-b from-pink-50 to-white text-pink-600 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-pink-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {/* ===================== CONCEPT TAB ===================== */}
        {activeTab === 'concept' && (
          <div className="space-y-2.5">
            <p className="text-xs text-gray-400 font-medium">
              Chọn 1 trong 5 concept Hàn Quốc được thiết kế sẵn:
            </p>

            <div className="space-y-2">
              {FRAME_ORDER.map(id => {
                const f = PHOTOBOOTH_FRAMES[id];
                const isSelected = customization.frame === id;

                return (
                  <button
                    key={id}
                    onClick={() => selectFrame(id)}
                    className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-pink-400 bg-pink-50/70 shadow-md scale-[1.01]'
                        : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini color dot & emoji */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border flex-shrink-0"
                        style={{ backgroundColor: f.bgColor, borderColor: f.borderColor }}
                      >
                        {f.emoji}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-gray-800">{f.name}</span>
                          {id === 'film-35mm' && (
                            <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-mono font-bold">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{f.description}</p>
                      </div>
                    </div>

                    {/* Radio circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-200'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== FILTER TAB ===================== */}
        {activeTab === 'filter' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Bộ lọc ảnh (Photo Grading):</span>
              <span className="text-xs text-pink-500 font-medium">
                {PHOTO_FILTERS[customization.filter]?.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {FILTER_ORDER.map(fId => {
                const f = PHOTO_FILTERS[fId];
                const isSelected = customization.filter === fId;

                return (
                  <button
                    key={fId}
                    onClick={() => update({ filter: fId as PhotoFilter })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-pink-400 bg-pink-50/80 shadow-md scale-105'
                        : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                    }`}
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{f.name}</span>
                  </button>
                );
              })}
            </div>

            {customization.frame === 'film-35mm' && (
              <div className="bg-orange-50 rounded-2xl p-3 border border-orange-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-800 leading-relaxed">
                  <strong>Gợi ý Pro:</strong> Khung <strong>Vintage Film 35mm</strong> phối cực đẹp với filter <strong>Đen Trắng</strong> hoặc <strong>Vintage 90s</strong>!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== LABEL TAB ===================== */}
        {activeTab === 'label' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-600">
              Dòng chữ hiển thị trên khung ({currentFrame.name})
            </label>
            <input
              type="text"
              value={customization.labelText}
              onChange={e => update({ labelText: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 outline-none text-sm bg-pink-50 text-gray-800 font-medium"
              placeholder={currentFrame.defaultText}
              maxLength={50}
            />

            {/* Presets based on current frame */}
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-1.5">Gợi ý nhãn nhanh:</p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  currentFrame.defaultText,
                  'sweet memories ♡',
                  'life four cuts ✨',
                  'happy vibes ✦',
                  'bff forever 👭',
                  'chill with me ☕',
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => update({ labelText: preset })}
                    className="px-2.5 py-1 text-xs bg-pink-50 text-pink-600 rounded-full border border-pink-200 hover:bg-pink-100 transition-colors font-medium"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400">{customization.labelText.length}/50 ký tự</p>
          </div>
        )}

        {/* ===================== STICKER TAB ===================== */}
        {activeTab === 'sticker' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Bấm hoặc Kéo thả vào ảnh:</span>
              {customization.stickers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={randomizeStickers}
                    className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-700 font-medium"
                  >
                    <Shuffle className="w-3 h-3" />
                    Trộn
                  </button>
                  <button
                    onClick={clearStickers}
                    className="text-xs text-gray-400 hover:text-red-400"
                  >
                    Xoá hết
                  </button>
                </div>
              )}
            </div>

            {/* Recommended stickers for this frame */}
            {currentFrame.defaultStickers.length > 0 && (
              <div className="bg-pink-50/60 rounded-2xl p-2.5 border border-pink-100">
                <span className="text-[11px] text-pink-600 font-semibold block mb-1.5">
                  🌸 Gợi ý cho {currentFrame.name} (kéo hoặc bấm):
                </span>
                <div className="flex gap-2">
                  {currentFrame.defaultStickers.map(emoji => (
                    <button
                      key={emoji}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', emoji);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => addSticker(emoji)}
                      className="text-2xl bg-white rounded-xl w-10 h-10 flex items-center justify-center shadow-sm border border-pink-200 hover:scale-125 transition-transform cursor-grab active:cursor-grabbing"
                      title="Kéo thả trực tiếp vào ảnh hoặc bấm để thêm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker grid */}
            <div className="grid grid-cols-8 gap-1.5">
              {STICKER_OPTIONS.map(s => (
                <button
                  key={s.emoji}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', s.emoji);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => addSticker(s.emoji)}
                  className="sticker-hover aspect-square flex items-center justify-center text-xl bg-pink-50/60 rounded-xl hover:bg-pink-100 transition-all border border-pink-100 hover:scale-125 cursor-grab active:cursor-grabbing"
                  title="Kéo thả trực tiếp vào ảnh hoặc bấm để thêm"
                >
                  {s.emoji}
                </button>
              ))}
            </div>

            {/* Added stickers list */}
            {customization.stickers.length > 0 && (
              <div className="pt-2 border-t border-pink-50">
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Đã thêm ({customization.stickers.length}) — bấm vào sticker trên ảnh để xoá:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {customization.stickers.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1 bg-white border border-pink-100 rounded-full px-2 py-0.5 text-xs shadow-sm"
                    >
                      <span>{s.emoji}</span>
                      <button
                        onClick={() => removeSticker(s.id)}
                        className="text-gray-300 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FrameCustomizer;
