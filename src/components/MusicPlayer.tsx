import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Disc3, SkipForward, SkipBack, ListMusic, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { PLAYLIST } from '../config/playlist';
import type { Track } from '../config/playlist';
import { startLofi, stopLofi, setLofiVolume } from '../utils/audio';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [usingSynthFallback, setUsingSynthFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack: Track | undefined = PLAYLIST[trackIndex] || PLAYLIST[0];

  // Initialize or update audio source
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleEnded = () => {
      // Auto play next track
      setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    const handleError = () => {
      console.warn('Audio source failed to load, falling back to Lofi synth');
      setUsingSynthFallback(true);
      if (isPlaying) {
        startLofi(volume * 0.4);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isPlaying, isMuted, volume]);

  // Handle track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (usingSynthFallback) {
      stopLofi();
      setUsingSynthFallback(false);
    }

    audio.src = currentTrack.src;
    audio.load();

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Direct audio play failed, using synth fallback:', err);
        setUsingSynthFallback(true);
        startLofi(volume * 0.4);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  // Handle play/pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (isPlaying) {
      if (audio) audio.pause();
      stopLofi();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audio && currentTrack) {
        try {
          if (!audio.src || audio.src === '') {
            audio.src = currentTrack.src;
          }
          await audio.play();
          setUsingSynthFallback(false);
        } catch (e) {
          console.warn('Audio play error, falling back to synth:', e);
          setUsingSynthFallback(true);
          startLofi(volume * 0.4);
        }
      } else {
        setUsingSynthFallback(true);
        startLofi(volume * 0.4);
      }
    }
  };

  const handleNext = () => {
    if (PLAYLIST.length === 0) return;
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = () => {
    if (PLAYLIST.length === 0) return;
    setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setLofiVolume(val * 0.4);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
      setLofiVolume(volume * 0.4);
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
      setLofiVolume(0);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      stopLofi();
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded player panel */}
      {showPanel && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-pastel-lg p-3.5 border border-pink-100 flex flex-col gap-2.5 slide-up min-w-[240px] max-w-[280px]">
          {/* Header & Track info */}
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate pr-2">
              <p className="text-xs font-bold text-gray-800 truncate">
                {currentTrack?.title || 'Lofi Chill'}
              </p>
              <p className="text-[10px] text-pink-400 truncate">
                {usingSynthFallback ? 'Lofi Synth Generator' : currentTrack?.artist || 'Photobooth Music'}
              </p>
            </div>
            <button
              onClick={() => setShowPlaylist((prev) => !prev)}
              className={`p-1.5 rounded-full transition-colors ${
                showPlaylist ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-pink-500'
              }`}
              title="Danh sách bài hát"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

          {/* Playlist popup dropdown */}
          {showPlaylist && (
            <div className="bg-pink-50/80 rounded-2xl p-2 max-h-36 overflow-y-auto space-y-1 text-xs border border-pink-100">
              <p className="text-[10px] font-bold text-pink-600 px-1 mb-1">
                🎵 Danh sách phát ({PLAYLIST.length} bài):
              </p>
              {PLAYLIST.map((t, idx) => (
                <button
                  key={t.id || idx}
                  onClick={() => {
                    setTrackIndex(idx);
                    if (!isPlaying) togglePlay();
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                    trackIndex === idx
                      ? 'bg-pink-400 text-white font-semibold'
                      : 'hover:bg-pink-100/70 text-gray-700'
                  }`}
                >
                  <span className="truncate flex-1">{t.title}</span>
                  {trackIndex === idx && isPlaying && (
                    <span className="text-[10px] ml-1">♫</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Controls: Prev / Play / Next */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              className="p-1.5 text-gray-500 hover:text-pink-500 hover:scale-110 transition-transform active:scale-95"
              title="Bài trước"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 text-gray-500 hover:text-pink-500 hover:scale-110 transition-transform active:scale-95"
              title="Bài kế tiếp"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 pt-1 border-t border-pink-100/80">
            <button onClick={toggleMute} className="text-gray-400 hover:text-pink-500">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              className="flex-1 accent-pink-400 h-1 bg-pink-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Floating mini trigger button */}
      <div className="flex items-center gap-2">
        {/* Track title badge */}
        {isPlaying && (
          <div
            onClick={() => setShowPanel((p) => !p)}
            className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-pink-600 font-medium shadow-sm border border-pink-100 fade-in flex items-center gap-1.5 hover:bg-white"
          >
            <span className="animate-pulse">🎵</span>
            <span className="max-w-[120px] truncate">{currentTrack?.title || 'Lofi chill'}</span>
          </div>
        )}

        {/* Vinyl Disc Button */}
        <button
          onClick={togglePlay}
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 via-rose-200 to-amber-100 shadow-pastel-lg border-2 border-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
          title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc chill'}
        >
          <Disc3
            className={`w-7 h-7 text-rose-500 transition-all ${isPlaying ? 'spin-slow' : 'opacity-80'}`}
          />
          {/* Status badge */}
          <div
            className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-xs ${
              isPlaying ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {isPlaying ? '♫' : '▶'}
          </div>
        </button>

        {/* Panel toggle arrow */}
        <button
          onClick={() => setShowPanel((p) => !p)}
          className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm border border-pink-100 text-pink-400"
          title={showPanel ? 'Đóng bảng điều khiển' : 'Mở chỉnh nhạc'}
        >
          {showPanel ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
