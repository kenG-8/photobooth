import React, { useEffect, useRef } from 'react';

interface CountdownOverlayProps {
  count: number; // 3, 2, 1, 0 (0 = "Smile!")
  photoIndex: number;
  totalPhotos: number;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ count, photoIndex, totalPhotos }) => {
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (numRef.current) {
      numRef.current.classList.remove('countdown-pulse');
      void numRef.current.offsetWidth; // reflow
      numRef.current.classList.add('countdown-pulse');
    }
  }, [count]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {/* Photo index label */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-pink-600">
          Pose {photoIndex + 1} / {totalPhotos} ✨
        </div>
      </div>

      {/* Big countdown number */}
      <div ref={numRef} className="countdown-pulse text-center select-none">
        {count === 0 ? (
          <div>
            <div className="text-6xl mb-1">😊</div>
            <div className="text-3xl font-black text-white drop-shadow-lg">Say Cheese!</div>
          </div>
        ) : (
          <div
            className="font-black text-white"
            style={{
              fontSize: 'clamp(5rem, 20vw, 10rem)',
              textShadow: '0 0 30px rgba(255,182,193,0.8), 0 4px 8px rgba(0,0,0,0.5)',
              lineHeight: 1,
            }}
          >
            {count}
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 flex gap-2">
        {Array.from({ length: totalPhotos }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < photoIndex ? 'w-3 h-3 bg-green-400' :
              i === photoIndex ? 'w-4 h-4 bg-yellow-300 animate-pulse' :
              'w-3 h-3 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CountdownOverlay;

