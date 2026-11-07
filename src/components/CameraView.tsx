import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RotateCcw, Timer, Upload } from 'lucide-react';
import CountdownOverlay from './CountdownOverlay';
import { playBeep, playShutter, playFinalBeep } from '../utils/audio';

interface CameraViewProps {
  shootMode: 'strip' | 'grid';
  onPhotosReady: (photos: string[]) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ shootMode, onPhotosReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureIndex, setCaptureIndex] = useState(0); // which photo (0-3) is being captured
  const [capturedCount, setCapturedCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, 4);
    const promises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((loaded) => {
      if (loaded.length === 0) return;
      while (loaded.length < 4) {
        loaded.push(loaded[loaded.length - 1] || '');
      }
      onPhotosReady(loaded);
    });
  };

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      setCameraError(null);

      // Check secure context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          setCameraError(
            'Trình duyệt điện thoại bắt buộc phải có HTTPS để mở Camera. Hãy truy cập qua link HTTPS hoặc bấm Tải ảnh từ máy!'
          );
        } else {
          setCameraError('Không tìm thấy camera hoặc thiết bị chưa cấp quyền.');
        }
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play warning:', e);
        }
      }

      // Check if device has multiple cameras
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Bạn chưa cấp quyền Camera. Hãy bấm nút "Cấp quyền Camera" bên dưới!');
      } else {
        setCameraError('Không thể mở camera. Hãy bấm "Thử lại" hoặc dùng ảnh từ thiết bị.');
      }
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  const capturePhoto = useCallback((): string => {
    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    if (!video || !canvas) return '';
    
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    
    // Target ratio: portrait 3:4 for strip, square for grid
    const targetRatio = shootMode === 'grid' ? 1 : 3 / 4;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    const sourceRatio = vw / vh;

    if (sourceRatio > targetRatio) {
      // Source is wider → crop sides
      sw = Math.round(vh * targetRatio);
      sx = Math.round((vw - sw) / 2);
    } else {
      // Source is taller → crop top/bottom
      sh = Math.round(vw / targetRatio);
      sy = Math.round((vh - sh) / 2);
    }

    const outW = shootMode === 'grid' ? 800 : 600;
    const outH = shootMode === 'grid' ? 800 : Math.round(outW / targetRatio);
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;
    
    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [shootMode, facingMode]);

  const runShootSequence = useCallback(async () => {
    if (isShooting) return;
    setIsShooting(true);
    setCapturedCount(0);
    const photos: string[] = [];

    for (let i = 0; i < 4; i++) {
      setCaptureIndex(i);
      // Countdown based on timerSeconds (3s or 5s)
      for (let c = timerSeconds; c >= 1; c--) {
        setCountdown(c);
        playBeep(c === 1 ? 1046 : 880, 0.15, 0.3);
        await delay(900);
      }
      setCountdown(0); // "Say cheese!"
      await delay(300);

      // Flash
      setIsFlashing(true);
      playShutter();
      const photo = capturePhoto();
      photos.push(photo);
      await delay(400);
      setIsFlashing(false);
      setCountdown(null);
      setCapturedCount(i + 1);
      await delay(600);
    }

    playFinalBeep();
    setIsShooting(false);
    setCountdown(null);
    onPhotosReady(photos);
  }, [isShooting, timerSeconds, capturePhoto, onPhotosReady]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Camera container */}
      <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl shadow-pastel-lg border-cute bg-black"
           style={{ aspectRatio: shootMode === 'grid' ? '1/1' : '3/4' }}>
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Countdown overlay */}
        {countdown !== null && (
          <CountdownOverlay count={countdown} photoIndex={captureIndex} totalPhotos={4} />
        )}

        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white camera-flash z-30 pointer-events-none" />
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-50/95 z-20 p-6 text-center">
            <div className="text-5xl mb-3 animate-bounce">📷</div>
            <p className="text-pink-700 font-semibold text-sm max-w-xs leading-relaxed mb-4">{cameraError}</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => startCamera()}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-2.5 px-5 rounded-full text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Cấp quyền & Bật Camera 📸
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white border border-pink-200 text-pink-600 py-2 px-5 rounded-full text-xs font-semibold hover:bg-pink-50 transition-colors"
              >
                Tải ảnh có sẵn từ thiết bị 📁
              </button>
            </div>
          </div>
        )}

        {/* Photo counter indicator */}
        {isShooting && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < capturedCount ? 'bg-green-400 scale-110' :
                  i === captureIndex ? 'bg-yellow-300 animate-pulse' :
                  'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Flip camera button (top-left) */}
        {hasMultipleCameras && !isShooting && (
          <button
            onClick={flipCamera}
            className="absolute top-3 left-3 z-20 bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
          >
            <RotateCcw className="w-4 h-4 text-pink-500" />
          </button>
        )}

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-pink-300/60 rounded-tl-lg pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-pink-300/60 rounded-tr-lg pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-pink-300/60 rounded-bl-lg pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-pink-300/60 rounded-br-lg pointer-events-none z-10" />
      </div>

      {/* Controls: Timer & Capture button */}
      <div className="mt-5 flex flex-col items-center gap-3">
        {/* Timer selector */}
        {!isShooting && (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-pink-100 shadow-sm text-xs font-semibold text-gray-600">
            <Timer className="w-3.5 h-3.5 text-pink-500" />
            <span>Hẹn giờ:</span>
            {[3, 5].map(sec => (
              <button
                key={sec}
                onClick={() => setTimerSeconds(sec)}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  timerSeconds === sec
                    ? 'bg-pink-400 text-white shadow-xs font-bold'
                    : 'text-gray-500 hover:text-pink-500'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}

        <button
          onClick={runShootSequence}
          disabled={isShooting || !!cameraError}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-pastel-lg
            transition-all duration-300 select-none
            ${isShooting || cameraError
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:scale-105 hover:shadow-xl active:scale-95'
            }
          `}
        >
          <Camera className="w-6 h-6" />
          {isShooting ? `Đang chụp ${capturedCount + 1}/4...` : 'Chụp ngay! 📸'}
        </button>

        {/* Upload photos from device fallback */}
        {!isShooting && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-pink-200 bg-white/70 backdrop-blur-sm text-pink-500 text-xs font-semibold hover:bg-pink-50 transition-all shadow-xs active:scale-95"
            title="Tải ảnh từ điện thoại hoặc máy tính"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Hoặc tải ảnh từ thiết bị 📁</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={hiddenCanvasRef} className="hidden" />
    </div>
  );
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default CameraView;

