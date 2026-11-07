import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import CameraView from './components/CameraView';
import MusicPlayer from './components/MusicPlayer';
import FrameCustomizer from './components/FrameCustomizer';
import PhotoPreview from './components/PhotoPreview';
import CanvasExport from './components/CanvasExport';
import type { CustomizationState, ShootMode, Sticker } from './types';
import { PHOTOBOOTH_FRAMES } from './types';

type AppState = 'home' | 'studio';

const DEFAULT_CUSTOMIZATION: CustomizationState = {
  frame: 'strawberry-milk',
  filter: 'normal',
  labelText: PHOTOBOOTH_FRAMES['strawberry-milk'].defaultText,
  stickers: [],
};

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [shootMode, setShootMode] = useState<ShootMode>('strip');
  const [photos, setPhotos] = useState<string[]>([]);
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  const handlePhotosReady = useCallback((newPhotos: string[]) => {
    setPhotos(newPhotos);
    // Auto choose appropriate frame based on shoot mode
    const targetFrame = shootMode === 'grid' ? 'matcha-cozy' : 'strawberry-milk';
    setCustomization({
      frame: targetFrame,
      filter: 'normal',
      labelText: PHOTOBOOTH_FRAMES[targetFrame].defaultText,
      stickers: [],
    });
    setAppState('studio');

    // 🎉 Confetti celebration!
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff6b9d', '#ffd6e0', '#c084fc', '#fbbf24', '#34d399'],
        shapes: ['circle', 'square'],
        ticks: 200,
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#f472b6', '#a78bfa', '#60a5fa'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#f472b6', '#a78bfa', '#60a5fa'],
        });
      }, 300);
    }, 100);
  }, [shootMode]);

  const handleRetake = () => {
    setPhotos([]);
    setCustomization(DEFAULT_CUSTOMIZATION);
    setAppState('home');
  };

  const handleDropSticker = useCallback((emoji: string, x: number, y: number) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      label: emoji,
      x,
      y,
      size: 36,
      rotation: (Math.random() - 0.5) * 20,
    };
    setCustomization(prev => ({
      ...prev,
      stickers: [...prev.stickers, newSticker],
    }));
  }, []);

  const handleRotateSticker = useCallback((id: string) => {
    setCustomization(prev => ({
      ...prev,
      stickers: prev.stickers.map(s =>
        s.id === id ? { ...s, rotation: (s.rotation + 20) % 360 } : s
      ),
    }));
  }, []);

  const currentFrame = PHOTOBOOTH_FRAMES[customization.frame] || PHOTOBOOTH_FRAMES['strawberry-milk'];

  return (
    <div
      className="min-h-dvh transition-colors duration-700"
      style={{
        background:
          appState === 'studio' && customization.frame === 'film-35mm'
            ? 'linear-gradient(135deg, #18181B 0%, #27272A 100%)'
            : 'linear-gradient(135deg, #fdf6f0 0%, #fff0f5 50%, #f5f0ff 100%)',
      }}
    >
      {/* Decorative blobs (hidden in dark mode) */}
      {customization.frame !== 'film-35mm' && (
        <>
          <div
            className="fixed top-0 left-0 w-72 h-72 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #ffd6e0, transparent)',
              borderRadius: '50%',
              transform: 'translate(-30%, -30%)',
            }}
          />
          <div
            className="fixed bottom-0 right-0 w-96 h-96 opacity-15 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #c4b5fd, transparent)',
              borderRadius: '50%',
              transform: 'translate(30%, 30%)',
            }}
          />
        </>
      )}

      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          customization.frame === 'film-35mm' && appState === 'studio'
            ? 'bg-zinc-900/80 border-zinc-800 text-white'
            : 'bg-white/70 border-pink-100/60'
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentFrame.emoji}</span>
            <div>
              <h1
                className={`text-base font-black leading-tight ${
                  customization.frame === 'film-35mm' && appState === 'studio'
                    ? 'text-orange-400'
                    : 'text-pink-600'
                }`}
              >
                Chill Photobooth
              </h1>
              <p
                className={`text-[10px] font-medium leading-none ${
                  customization.frame === 'film-35mm' && appState === 'studio'
                    ? 'text-zinc-500'
                    : 'text-pink-300'
                }`}
              >
                K-Style 4-Cut
              </p>
            </div>
          </div>

          {appState === 'studio' && (
            <span className="text-xs text-green-500 font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200">
              ✅ 4/4 ảnh
            </span>
          )}

          {appState === 'home' && (
            <div className="text-xs text-gray-400 font-medium">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* ===================== HOME SCREEN ===================== */}
        {appState === 'home' && (
          <div className="pt-6 space-y-6 fade-in">
            {/* Hero text */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-gray-700">
                📸 Thời gian chụp hình nào!
              </h2>
              <p className="text-sm text-gray-400">
                Chụp 4 pose liên tiếp theo phong cách Hàn Quốc ✨
              </p>
            </div>

            {/* Shoot mode selector */}
            <div className="flex gap-3 justify-center">
              {[
                { key: 'strip' as ShootMode, label: '4-Cut Dọc', icon: '📷', desc: 'Classic Strip' },
                { key: 'grid' as ShootMode, label: '2×2 Lưới', icon: '🔲', desc: 'Grid Layout' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setShootMode(opt.key)}
                  className={`flex-1 max-w-[160px] flex flex-col items-center gap-1.5 py-3 px-4 rounded-2xl border-2 transition-all ${
                    shootMode === opt.key
                      ? 'border-pink-400 bg-pink-50 shadow-pastel scale-105'
                      : 'border-gray-100 bg-white hover:border-pink-200'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-bold text-gray-700">{opt.label}</span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Camera View */}
            <CameraView shootMode={shootMode} onPhotosReady={handlePhotosReady} />

            {/* Concept preview banner */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-pink-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">5 Concept có sẵn:</span>
              <div className="flex gap-1.5">
                {['🎀 Dâu', '🍵 Matcha', '☀️ Bơ', '🎞️ Film', '🤍 Tối giản'].map(c => (
                  <span
                    key={c}
                    className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== STUDIO SCREEN ===================== */}
        {appState === 'studio' && photos.length === 4 && (
          <div className="pt-6 space-y-6 slide-up">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2
                className={`text-2xl font-black ${
                  customization.frame === 'film-35mm' ? 'text-white' : 'text-gray-700'
                }`}
              >
                🎨 Chọn Concept Khung
              </h2>
              <p
                className={`text-sm ${
                  customization.frame === 'film-35mm' ? 'text-zinc-400' : 'text-gray-400'
                }`}
              >
                Đang áp dụng: <strong>{currentFrame.name}</strong> {currentFrame.emoji}
              </p>
            </div>

            {/* Layout: Preview + Controls */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left: Preview */}
              <div className="w-full lg:w-60 flex-shrink-0 flex flex-col items-center">
                <p
                  className={`text-xs text-center mb-2 font-medium ${
                    customization.frame === 'film-35mm' ? 'text-zinc-500' : 'text-gray-400'
                  }`}
                >
                  Bản xem trước
                </p>
                <PhotoPreview
                  photos={photos}
                  customization={customization}
                  onRemoveSticker={(id) =>
                    setCustomization(prev => ({
                      ...prev,
                      stickers: prev.stickers.filter(s => s.id !== id),
                    }))
                  }
                  onUpdateSticker={(id, x, y) =>
                    setCustomization(prev => ({
                      ...prev,
                      stickers: prev.stickers.map(s => s.id === id ? { ...s, x, y } : s),
                    }))
                  }
                  onDropSticker={handleDropSticker}
                  onRotateSticker={handleRotateSticker}
                />
              </div>

              {/* Right: Customizer Panel */}
              <div className="w-full flex-1">
                <FrameCustomizer
                  customization={customization}
                  onChange={setCustomization}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <CanvasExport photos={photos} customization={customization} />
              <button
                onClick={handleRetake}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 font-semibold text-sm transition-all active:scale-95 ${
                  customization.frame === 'film-35mm'
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-pink-200 text-pink-500 hover:bg-pink-50'
                }`}
              >
                🔄 Chụp lại từ đầu
              </button>
            </div>

            <p
              className={`text-center text-xs pb-4 ${
                customization.frame === 'film-35mm' ? 'text-zinc-600' : 'text-gray-300'
              }`}
            >
              HD Render 1200×3600 px • 100% Client-side 🔒
            </p>
          </div>
        )}
      </main>

      {/* Floating Music Player */}
      <MusicPlayer />
    </div>
  );
}

export default App;
