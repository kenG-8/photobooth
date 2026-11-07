🎵 Thư mục chứa nhạc nền cho Web Photobooth

Bạn chỉ cần thả các file nhạc .mp3 của bạn vào thư mục này:
Ví dụ:
  - public/music/bai-hat-1.mp3
  - public/music/lofi-chill.mp3

Sau đó mở file:
  src/config/playlist.ts

Và thêm bài hát vào danh sách theo mẫu:
  {
    id: 'my-song-1',
    title: 'Tên bài hát của bạn',
    artist: 'Tên nghệ sĩ',
    src: '/music/bai-hat-1.mp3',
  }

