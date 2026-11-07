export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string; // File cục bộ: '/music/ten-file.mp3' hoặc URL: 'https://...'
}

/**
 * 🎵 DANH SÁCH BÀI HÁT PHÁT TRONG WEB (PLAYLIST)
 * 
 * ========================================================
 * 💡 HƯỚNG DẪN THÊM NHẠC CỦA BẠN:
 * 
 * Cách 1: Dùng file MP3 từ máy của bạn (Khuyên dùng)
 *   1. Chép file .mp3 vào thư mục: public/music/
 *      (Ví dụ file: public/music/my-lofi.mp3)
 *   2. Thêm vào mảng PLAYLIST bên dưới:
 *      {
 *        id: 'my-lofi',
 *        title: 'Tên bài hát',
 *        artist: 'Nghệ sĩ',
 *        src: '/music/my-lofi.mp3',
 *      },
 * 
 * Cách 2: Dùng link trực tiếp (URL MP3 trên mạng)
 *   Dán link dạng 'https://.../song.mp3' vào src.
 * ========================================================
 */
export const PLAYLIST: Track[] = [
  {
    id: 'lofi-study',
    title: 'Seoul Cafe Lofi',
    artist: 'Chill Vibes',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'tea-time',
    title: 'Tea Time in Seoul',
    artist: 'Cozy Morning',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tea-time-chill-lofi-song-8442.mp3',
  },
  {
    id: 'lofi-chill',
    title: 'Sweet Memories',
    artist: 'Lofi Dreamer',
    src: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c976939634.mp3?filename=lofi-chill-medium-version-159456.mp3',
  },
];

