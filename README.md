# 🌸 Chill Photobooth — K-Style 4-Cut

> **A cute K-Style photobooth web app** — 100% client-side, runs in the browser, deploys to Cloudflare Pages for free.

![Tech Stack](https://img.shields.io/badge/React_19-Vite_8-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

| Feature | Detail |
|---|---|
| 📸 **4-Cut Shooting** | 3-2-1 countdown per pose, auto-capture 4 photos |
| 🎨 **3 Layout Modes** | Strip (4×1), Grid (2×2), Polaroid vintage |
| 🖼️ **6 Frame Colors** | Classic White, Midnight Black, Pastel Pink, Matcha, Lavender, Butter |
| 🌸 **12 Stickers** | Heart, ribbon, star, cat, sparkle, sakura + more |
| 🎵 **Lofi Music** | Web Audio API generated ambient music, volume control |
| 💾 **Smart Export** | iOS Safari → native Share sheet → Save to Photos; PC → PNG download |
| 🖨️ **HD Canvas Render** | Offscreen canvas at 2× DPI for print-quality output |
| 📱 **Mobile First** | `100dvh` viewport, mirror selfie, flip camera button |

---

## 🚀 Quick Start

```bash
# Install
npm install

# Dev server
npm run dev

# Production build
npm run build
```

---

## 🌐 Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → **Create a project**
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 20
5. Click **Save and Deploy** 🚀

That's it! No environment variables needed — 100% client-side.

---

## 📂 Project Structure

```
src/
├── App.tsx                    # Main app + state machine (home → studio)
├── index.css                  # Tailwind + custom animations
├── types.ts                   # TypeScript types & constants
├── components/
│   ├── CameraView.tsx         # Camera preview, capture sequence
│   ├── CountdownOverlay.tsx   # 3-2-1 countdown UI
│   ├── MusicPlayer.tsx        # Floating lofi music widget
│   ├── FrameCustomizer.tsx    # Layout/color/label/sticker panel
│   ├── PhotoPreview.tsx       # Live CSS preview of photostrip
│   └── CanvasExport.tsx       # HD offscreen canvas renderer + download
└── utils/
    └── audio.ts               # Web Audio API: beep, shutter, lofi synth
```

---

## 🎨 Design System

- **Color palette:** Warm cream `#fdf6f0` + baby pink `#ffd6e0` + lavender `#e8d5f5`
- **Font:** System UI stack (round-friendly)
- **Animations:** CSS keyframes (flash, countdown-pulse, spin-slow, slideUp, bounceIn)
- **Shadows:** Custom `shadow-pastel` / `shadow-pastel-lg` utilities

---

## 📸 Camera Notes

- **Mirror effect:** Front camera is CSS `scaleX(-1)` mirrored for natural selfie view
- **Aspect ratio crop:** Canvas uses `object-fit: cover` algorithm to avoid face distortion across all phone aspect ratios
- **Resolution:** Captured at up to `1920×1080` from device camera; rendered to offscreen canvas at `2×` DPI scale

---

Made with 💕 · Pastel vibes · K-Style ✨
