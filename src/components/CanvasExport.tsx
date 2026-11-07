import React, { useCallback, useState } from 'react';
import { Download, Share2, Loader2, Copy, Check } from 'lucide-react';
import type { CustomizationState } from '../types';
import { renderPhotoboothCanvas } from '../utils/drawFrames';

interface CanvasExportProps {
  photos: string[];
  customization: CustomizationState;
}

const CanvasExport: React.FC<CanvasExportProps> = ({ photos, customization }) => {
  const [isRendering, setIsRendering] = useState(false);
  const [copied, setCopied] = useState(false);

  // Common render canvas helper
  const getRenderedCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    await renderPhotoboothCanvas(
      canvas,
      customization.frame,
      photos,
      customization.labelText,
      customization.stickers,
      customization.filter
    );
    return canvas;
  };

  const handleExport = useCallback(async () => {
    setIsRendering(true);
    try {
      const canvas = await getRenderedCanvas();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `chill-photobooth-${customization.frame}-${dateStr}.png`;

      // Native share for iOS Safari / modern Android
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '🌸 Chill Photobooth',
                text: 'K-Style Photobooth Strip! 📸✨',
              });
              return;
            } catch (e) {
              // Share cancelled or failed → fallback to download
            }
          }
          downloadBlob(blob, filename);
        }, 'image/png');
      } else {
        // Fallback: direct download
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi xuất ảnh. Hãy thử lại!');
    } finally {
      setIsRendering(false);
    }
  }, [photos, customization]);

  const handleCopyClipboard = useCallback(async () => {
    if (!navigator.clipboard || !window.ClipboardItem) {
      alert('Trình duyệt của bạn chưa hỗ trợ sao chép ảnh trực tiếp. Hãy dùng nút Tải ảnh!');
      return;
    }

    setIsRendering(true);
    try {
      const canvas = await getRenderedCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.error('Clipboard copy failed:', err);
          alert('Không thể chép vào clipboard trên trình duyệt này. Hãy dùng nút Tải ảnh!');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Export error for clipboard:', err);
    } finally {
      setIsRendering(false);
    }
  }, [photos, customization]);

  return (
    <div className="space-y-2.5 w-full">
      {/* Primary Export Button */}
      <button
        onClick={handleExport}
        disabled={isRendering}
        className={`
          flex items-center gap-3 px-6 py-4 rounded-full font-bold text-base shadow-pastel-lg
          transition-all duration-300 w-full justify-center select-none
          ${isRendering
            ? 'bg-gray-200 text-gray-400 cursor-wait'
            : 'bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 text-white hover:scale-105 hover:shadow-xl active:scale-95'
          }
        `}
      >
        {isRendering ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang vẽ ảnh HD 300 DPI...
          </>
        ) : (
          <>
            {typeof navigator.share === 'function' ? (
              <Share2 className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>
              {typeof navigator.share === 'function'
                ? 'Lưu / Chia sẻ ảnh HD 📲'
                : 'Tải ảnh chất lượng cao 💾'}
            </span>
          </>
        )}
      </button>

      {/* Secondary Copy Button (ideal for PC Messenger/Zalo/Discord) */}
      <button
        onClick={handleCopyClipboard}
        disabled={isRendering}
        className={`
          flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-pink-200
          text-xs font-semibold w-full transition-all active:scale-95 shadow-2xs
          ${copied
            ? 'bg-green-50 text-green-600 border-green-300'
            : 'bg-white/80 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
          }
        `}
        title="Sao chép ảnh vào clipboard để dán trực tiếp vào Zalo, Messenger, Facebook"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span>Đã sao chép ảnh vào bộ nhớ tạm! Dán ngay (Ctrl+V) ✨</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-pink-400" />
            <span>Sao chép ảnh để dán (Ctrl+V) vào Zalo / Messenger 📋</span>
          </>
        )}
      </button>
    </div>
  );
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default CanvasExport;
