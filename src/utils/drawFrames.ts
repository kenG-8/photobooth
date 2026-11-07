// Canvas drawing utilities for all 5 photobooth frame types
import type { FrameId, Sticker, PhotoFilter } from '../types';
import { PHOTO_FILTERS } from '../types';

// ===================== BASE HELPERS =====================

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw image with object-fit: cover logic and optional canvas filter */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
  filterEffect?: string
) {
  const srcRatio = img.naturalWidth / img.naturalHeight;
  const dstRatio = dw / dh;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (srcRatio > dstRatio) {
    sw = Math.round(img.naturalHeight * dstRatio);
    sx = Math.round((img.naturalWidth - sw) / 2);
  } else {
    sh = Math.round(img.naturalWidth / dstRatio);
    sy = Math.round((img.naturalHeight - sh) / 2);
  }
  ctx.save();
  if (filterEffect && filterEffect !== 'none') {
    ctx.filter = filterEffect;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

/** Custom rounded rect path (compatible with all browsers) */
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const cr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + w - cr, y);
  ctx.arcTo(x + w, y, x + w, y + cr, cr);
  ctx.lineTo(x + w, y + h - cr);
  ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
  ctx.lineTo(x + cr, y + h);
  ctx.arcTo(x, y + h, x, y + h - cr, cr);
  ctx.lineTo(x, y + cr);
  ctx.arcTo(x, y, x + cr, y, cr);
  ctx.closePath();
}

// ===================== DECORATION HELPERS =====================

function drawBow(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);

  // Left loop
  ctx.fillStyle = '#FF9FB2';
  ctx.beginPath();
  ctx.ellipse(-size * 0.65, -size * 0.1, size * 0.55, size * 0.28, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Right loop
  ctx.beginPath();
  ctx.ellipse(size * 0.65, -size * 0.1, size * 0.55, size * 0.28, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Left tail
  ctx.beginPath();
  ctx.moveTo(size * 0.08, size * 0.1);
  ctx.lineTo(-size * 0.48, size * 0.72);
  ctx.lineTo(-size * 0.24, size * 0.65);
  ctx.lineTo(size * 0.04, size * 0.15);
  ctx.fill();

  // Right tail
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, size * 0.1);
  ctx.lineTo(size * 0.48, size * 0.72);
  ctx.lineTo(size * 0.24, size * 0.65);
  ctx.lineTo(-size * 0.04, size * 0.15);
  ctx.fill();

  // Center knot
  ctx.fillStyle = '#FF5C8D';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Highlight on knot
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.06, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(cx, cy - size * 0.5);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.8);
  ctx.bezierCurveTo(-size * 0.1, size * 0.3, -size, size * 0.3, -size, -size * 0.1);
  ctx.bezierCurveTo(-size, -size * 0.8, 0, -size * 0.8, 0, -size * 0.1);
  ctx.bezierCurveTo(0, -size * 0.8, size, -size * 0.8, size, -size * 0.1);
  ctx.bezierCurveTo(size, size * 0.3, size * 0.1, size * 0.3, 0, size * 0.8);
  ctx.fill();
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(cx, cy);
  const inner = outer * 0.3;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStar4(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  // 4-pointed star (✦ style)
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 - Math.PI / 4;
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    const a2 = angle + Math.PI / 4;
    ctx.lineTo(Math.cos(a2) * size * 0.25, Math.sin(a2) * size * 0.25);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = color;
  const parts = [
    [0, 0, 1], [size * 0.7, size * 0.2, 0.75], [size * 1.5, 0, 0.85],
    [size * 0.65, -size * 0.55, 0.65], [size * 0.2, -size * 0.4, 0.5], [size * 1.1, -size * 0.4, 0.55],
  ] as [number, number, number][];
  parts.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, size * r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSprocketHoles(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
  const hW = 44, hH = 32, hR = 5, spacing = 92;
  const lx = 10, rx = canvasW - 10 - hW;
  ctx.fillStyle = '#3f3f46';
  for (let y = 32; y < canvasH - 20; y += spacing) {
    rrect(ctx, lx, y, hW, hH, hR); ctx.fill();
    rrect(ctx, rx, y, hW, hH, hR); ctx.fill();
  }
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const pattern = [3, 1, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2];
  const total = pattern.reduce((a, b) => a + b, 0);
  const unit = w / total;
  let bx = x;
  pattern.forEach((u, i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = '#71717A';
      ctx.fillRect(bx, y, u * unit - 0.5, h);
    }
    bx += u * unit;
  });
}

function drawStickers(ctx: CanvasRenderingContext2D, stickers: Sticker[], cW: number, cH: number, footerH: number) {
  if (!stickers.length) return;
  const contentH = cH - footerH;
  stickers.forEach(s => {
    const sx = (s.x / 100) * cW;
    const sy = (s.y / 100) * contentH;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.font = '52px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.emoji, 0, 0);
    ctx.restore();
  });
}

function resetTextState(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 1;
}

// ===================== FRAME 1: STRAWBERRY MILK =====================

async function renderStrawberryMilk(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
) {
  const W = 1200, H = 3600;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const PAD = 60, TOP = 160, GAP = 20, FOOTER = 180;
  const PW = W - PAD * 2;             // 1080
  const PH = Math.round(PW * 3 / 4); // 810
  const filterEffect = PHOTO_FILTERS[filter]?.canvasFilter || 'none';

  // BG gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#FFF5F8');
  bg.addColorStop(0.5, '#FFF0F5');
  bg.addColorStop(1, '#FFE4EF');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Polka dot pattern
  ctx.fillStyle = 'rgba(255, 182, 193, 0.18)';
  for (let y = 20; y < H; y += 48) {
    for (let x = y % 96 === 20 ? 24 : 0; x < W; x += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer border (double)
  ctx.strokeStyle = '#FFB3C1';
  ctx.lineWidth = 10;
  rrect(ctx, 5, 5, W - 10, H - 10, 28);
  ctx.stroke();
  ctx.strokeStyle = '#FFD6E0';
  ctx.lineWidth = 4;
  rrect(ctx, 18, 18, W - 36, H - 36, 22);
  ctx.stroke();

  // Header bows
  drawBow(ctx, 95, 72, 52);
  drawBow(ctx, W - 95, 72, 52);

  // Header text
  ctx.fillStyle = '#FF758F';
  ctx.textAlign = 'center';
  ctx.font = 'italic 32px Georgia, serif';
  ctx.fillText('✿ my photo diary ✿', W / 2, 90);

  // Photos
  for (let i = 0; i < 4; i++) {
    const px = PAD, py = TOP + i * (PH + GAP);

    // Outer glow/shadow
    ctx.shadowColor = 'rgba(255, 105, 135, 0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    rrect(ctx, px - 10, py - 10, PW + 20, PH + 20, 20);
    ctx.fill();
    resetTextState(ctx);

    // Photo
    ctx.save();
    rrect(ctx, px, py, PW, PH, 12);
    ctx.clip();
    if (images[i]) drawCover(ctx, images[i], px, py, PW, PH, filterEffect);
    ctx.restore();

    // Small frame label
    ctx.fillStyle = 'rgba(255,117,143,0.7)';
    ctx.textAlign = 'right';
    ctx.font = '20px Georgia, serif';
    ctx.fillText(`♡ ${i + 1}`, px + PW - 10, py + PH - 10);
  }

  // Footer
  const fy = H - FOOTER;
  // Hearts row
  const heartXs = [150, 350, 600, 850, 1050];
  heartXs.forEach((x, i) => {
    if (i % 3 === 0) drawHeart(ctx, x, fy + 44, 14, '#FF9FB2');
    else if (i % 3 === 1) {
      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍓', x, fy + 52);
    } else {
      ctx.font = '20px serif';
      ctx.fillText('✿', x, fy + 52);
    }
  });

  // Footer label
  ctx.fillStyle = '#FF758F';
  ctx.textAlign = 'center';
  ctx.font = 'italic bold 38px Georgia, serif';
  ctx.fillText(labelText, W / 2, fy + 108);

  // Date
  ctx.font = '24px Segoe UI, sans-serif';
  ctx.fillStyle = '#FFB3C1';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), W / 2, fy + 148);

  drawStickers(ctx, stickers, W, H, FOOTER);
}

// ===================== FRAME 2: MATCHA COZY =====================

async function renderMatchaCozy(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
) {
  const W = 2000, H = 2500;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const PAD = 90, TOP = 140, GAP = 28, FOOTER = 240;
  const COL = (W - PAD * 2 - GAP) / 2;   // 891
  const ROW = (H - TOP - FOOTER - GAP) / 2; // roughly 1046
  const filterEffect = PHOTO_FILTERS[filter]?.canvasFilter || 'none';

  // BG
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#EDF2E8');
  bg.addColorStop(1, '#E5EDE0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle leaf tiling
  ctx.globalAlpha = 0.06;
  ctx.font = '36px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5C6B50';
  for (let y = 40; y < H; y += 90) {
    for (let x = 45; x < W; x += 90) {
      ctx.fillText('🍃', x, y);
    }
  }
  ctx.globalAlpha = 1;

  // Outer dashed border
  ctx.strokeStyle = '#A8C99A';
  ctx.lineWidth = 6;
  ctx.setLineDash([22, 12]);
  rrect(ctx, 10, 10, W - 20, H - 20, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Header
  ctx.fillStyle = '#5C6B50';
  ctx.textAlign = 'center';
  ctx.font = 'italic 40px Georgia, serif';
  ctx.fillText('☕  chill moments  ☕', W / 2, 85);
  ctx.font = '26px Segoe UI, sans-serif';
  ctx.fillStyle = '#8FAD7E';
  ctx.fillText('slow life · cafe vibes · matcha dreams', W / 2, 125);

  const positions: [number, number][] = [
    [PAD, TOP], [PAD + COL + GAP, TOP],
    [PAD, TOP + ROW + GAP], [PAD + COL + GAP, TOP + ROW + GAP],
  ];

  for (let i = 0; i < 4; i++) {
    const [px, py] = positions[i];

    // Dashed outer frame
    ctx.strokeStyle = '#8FAD7E';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 10]);
    rrect(ctx, px - 12, py - 12, COL + 24, ROW + 24, 22);
    ctx.stroke();
    ctx.setLineDash([]);

    // White photo bg
    ctx.shadowColor = 'rgba(90,120,70,0.12)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#FFFFFF';
    rrect(ctx, px - 5, py - 5, COL + 10, ROW + 10, 16);
    ctx.fill();
    resetTextState(ctx);

    // Photo
    ctx.save();
    rrect(ctx, px, py, COL, ROW, 12);
    ctx.clip();
    if (images[i]) drawCover(ctx, images[i], px, py, COL, ROW, filterEffect);
    ctx.restore();

    // Frame number
    ctx.fillStyle = 'rgba(92,107,80,0.6)';
    ctx.textAlign = 'left';
    ctx.font = '22px Courier New, monospace';
    ctx.fillText(`0${i + 1}`, px + 10, py + ROW - 10);
  }

  // Footer separator
  const fy = H - FOOTER;
  ctx.strokeStyle = '#B5CBA6';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(PAD, fy + 24); ctx.lineTo(W - PAD, fy + 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Footer icons
  ['🍵', '🌿', '☕', '🌱', '🍃'].forEach((e, i) => {
    ctx.font = '44px serif';
    ctx.textAlign = 'center';
    ctx.fillText(e, 180 + i * 410, fy + 100);
  });

  ctx.fillStyle = '#5C6B50';
  ctx.textAlign = 'center';
  ctx.font = '600 44px Segoe UI, sans-serif';
  ctx.fillText(labelText.toUpperCase(), W / 2, fy + 170);
  ctx.font = '28px Segoe UI, sans-serif';
  ctx.fillStyle = '#8FAD7E';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), W / 2, fy + 215);

  drawStickers(ctx, stickers, W, H, FOOTER);
}

// ===================== FRAME 3: BUTTER SUNSHINE =====================

async function renderButterSunshine(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
) {
  const W = 1200, H = 3700;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const PAD = 65, TOP = 170, GAP = 24, FOOTER = 200;
  const PW = W - PAD * 2;
  const PH = Math.round(PW * 3 / 4);
  const filterEffect = PHOTO_FILTERS[filter]?.canvasFilter || 'none';

  // Warm gradient BG
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#FFFDE7');
  bg.addColorStop(0.5, '#FEF9C3');
  bg.addColorStop(1, '#FEF08A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Scattered sparkles (background decorations)
  const sparkles: [number, number, number][] = [
    [70, 90, 32], [1130, 95, 26], [45, 480, 22],
    [1155, 420, 30], [55, 1180, 24], [1145, 1200, 28],
    [65, 2000, 26], [1135, 1960, 22], [600, 72, 36],
    [80, 2800, 30], [1120, 2810, 24], [300, 50, 20],
    [900, 50, 18], [1160, 1600, 20], [40, 1600, 22],
  ];
  sparkles.forEach(([x, y, size]) => {
    drawStar4(ctx, x, y, size, '#F59E0B');
    drawStar4(ctx, x + 18, y - 16, size * 0.4, '#FDE68A');
  });

  // Clouds
  drawCloud(ctx, 60, 200, 28, 'rgba(255,255,255,0.75)');
  drawCloud(ctx, W - 220, 185, 32, 'rgba(255,255,255,0.72)');
  drawCloud(ctx, 80, 2960, 26, 'rgba(255,255,255,0.65)');
  drawCloud(ctx, W - 240, 2900, 24, 'rgba(255,255,255,0.65)');

  // Outer borders (thick layered)
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 14;
  rrect(ctx, 7, 7, W - 14, H - 14, 32);
  ctx.stroke();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  rrect(ctx, 20, 20, W - 40, H - 40, 24);
  ctx.stroke();

  // Header
  ctx.fillStyle = '#D97706';
  ctx.textAlign = 'center';
  ctx.font = 'bold 46px Segoe UI, sans-serif';
  ctx.fillText('✦  SUNSHINE  ✦', W / 2, 90);
  ctx.font = '24px Segoe UI, sans-serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('happy vibes only ☀️', W / 2, 130);

  for (let i = 0; i < 4; i++) {
    const px = PAD, py = TOP + i * (PH + GAP);

    // Drop shadow
    ctx.shadowColor = 'rgba(217,119,6,0.25)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    rrect(ctx, px - 12, py - 12, PW + 24, PH + 24, 28);
    ctx.fill();
    resetTextState(ctx);

    // Photo with large radius
    ctx.save();
    rrect(ctx, px, py, PW, PH, 22);
    ctx.clip();
    if (images[i]) drawCover(ctx, images[i], px, py, PW, PH, filterEffect);
    ctx.restore();

    // Corner sparkle decorations
    drawStar4(ctx, px - 2, py - 2, 18, '#F59E0B');
    drawStar4(ctx, px + PW + 2, py - 2, 14, '#F59E0B');
    drawStar4(ctx, px - 2, py + PH + 2, 14, '#FDE68A');
    drawStar4(ctx, px + PW + 2, py + PH + 2, 18, '#F59E0B');
  }

  // Footer
  const fy = H - FOOTER;
  drawStar4(ctx, W / 2 - 300, fy + 50, 20, '#F59E0B');
  drawStar4(ctx, W / 2 + 300, fy + 50, 20, '#F59E0B');
  ctx.fillStyle = '#D97706';
  ctx.textAlign = 'center';
  ctx.font = 'italic bold 42px Georgia, serif';
  ctx.fillText(labelText, W / 2, fy + 70);
  ctx.font = '30px Segoe UI, sans-serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('✦  ' + new Date().toLocaleDateString('vi-VN') + '  ✦', W / 2, fy + 130);

  // Sun doodle
  drawSparkle(ctx, W / 2, fy + 170, 18, '#FDE68A');

  drawStickers(ctx, stickers, W, H, FOOTER);
}

// ===================== FRAME 4: VINTAGE FILM 35MM =====================

async function renderFilm35mm(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
) {
  const W = 1200, H = 3700;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const SPRW = 68;    // sprocket zone width
  const PX = SPRW;
  const PW = W - SPRW * 2;   // 1064
  const PH = Math.round(PW * 3 / 4); // 798
  const GAP = 18;
  const TOP = 192;
  const FOOTER = 230;
  const filterEffect = PHOTO_FILTERS[filter]?.canvasFilter || 'none';

  // Dark background (whole canvas)
  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, 0, W, H);

  // Film edge strips (slightly lighter)
  ctx.fillStyle = '#1f1f23';
  ctx.fillRect(0, 0, SPRW, H);
  ctx.fillRect(W - SPRW, 0, SPRW, H);

  // Film edge lines
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(SPRW, 0); ctx.lineTo(SPRW, H);
  ctx.moveTo(W - SPRW, 0); ctx.lineTo(W - SPRW, H);
  ctx.stroke();

  // Sprocket holes
  drawSprocketHoles(ctx, W, H);

  // ---- Film header zone ----
  // Top KODAK strip
  ctx.fillStyle = '#F97316'; // KODAK orange
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('KODAK', PX + 20, 55);

  ctx.fillStyle = '#E4E4E7';
  ctx.font = '34px Arial, sans-serif';
  ctx.fillText(' 400 ULTRAMAX', PX + 160, 55);

  // Film info line
  ctx.fillStyle = '#71717A';
  ctx.font = '22px Courier New, monospace';
  ctx.fillText('35mm • COLOR NEGATIVE FILM • PROCESS C-41', PX + 20, 95);

  // Thin separator
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PX, 118); ctx.lineTo(W - PX, 118);
  ctx.stroke();

  // Frame index markers above each photo
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#52525B';
    ctx.textAlign = 'left';
    ctx.font = '20px Courier New, monospace';
    const markerY = TOP + i * (PH + GAP) - 6;
    ctx.fillText(`▸ ${String(i + 1).padStart(2, '0')}A`, PX + 8, markerY);
  }

  // Photos (raw, no border - authentic film look)
  for (let i = 0; i < 4; i++) {
    const py = TOP + i * (PH + GAP);
    ctx.save();
    ctx.rect(PX, py, PW, PH);
    ctx.clip();
    if (images[i]) drawCover(ctx, images[i], PX, py, PW, PH, filterEffect);
    ctx.restore();

    // Vignette overlay per photo
    const vig = ctx.createRadialGradient(
      PX + PW / 2, py + PH / 2, Math.min(PW, PH) * 0.28,
      PX + PW / 2, py + PH / 2, Math.max(PW, PH) * 0.72
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = vig;
    ctx.fillRect(PX, py, PW, PH);
  }

  // ---- Footer / Film tail ----
  const fy = H - FOOTER;
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PX, fy); ctx.lineTo(W - PX, fy);
  ctx.stroke();

  // Film info
  ctx.fillStyle = '#52525B';
  ctx.textAlign = 'left';
  ctx.font = '20px Courier New, monospace';
  ctx.fillText('EXPOSURES 4 • DX 400-27 • LATITUDE', PX + 20, fy + 38);

  // Main label (left-aligned, like film annotations)
  ctx.fillStyle = '#F97316';
  ctx.font = 'bold 32px Courier New, monospace';
  ctx.fillText(labelText, PX + 20, fy + 90);

  // LED date stamp (right-aligned, orange glow)
  const dateStr = (() => {
    const d = new Date();
    return `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}`;
  })();
  ctx.save();
  ctx.font = 'bold 52px Courier New, monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F97316';
  ctx.shadowColor = '#F97316';
  ctx.shadowBlur = 18;
  ctx.fillText(dateStr, W - PX - 24, fy + 155);
  ctx.restore();

  // Bottom film edge line
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PX, fy + 180); ctx.lineTo(W - PX, fy + 180);
  ctx.stroke();

  // Frame numbers (decorative bottom)
  ctx.fillStyle = '#3f3f46';
  ctx.textAlign = 'left';
  ctx.font = '18px Courier New, monospace';
  ctx.fillText('01   02   03   04   05   06   07   08   09   10   11   12', PX + 10, fy + 215);

  drawStickers(ctx, stickers, W, H, FOOTER);
}

// ===================== FRAME 5: MINIMAL WHITE =====================

async function renderMinimalWhite(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
) {
  const W = 1200, H = 3400;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const PAD = 72, TOP = 110, GAP = 20, FOOTER = 220;
  const PW = W - PAD * 2; // 1056
  const PH = Math.round(PW * 3 / 4); // 792
  const filterEffect = PHOTO_FILTERS[filter]?.canvasFilter || 'none';

  // Clean white background
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, W, H);

  // Ultra-thin outer border
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 2;
  rrect(ctx, 2, 2, W - 4, H - 4, 4);
  ctx.stroke();

  // Header — minimalist typography
  ctx.fillStyle = '#D4D4D8';
  ctx.textAlign = 'center';
  ctx.font = '300 26px Segoe UI, Helvetica Neue, sans-serif';
  ctx.fillText('P  H  O  T  O  B  O  O  T  H', W / 2, 65);

  // Header divider
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD * 2, 82); ctx.lineTo(W - PAD * 2, 82);
  ctx.stroke();

  // Photos with soft shadows
  for (let i = 0; i < 4; i++) {
    const px = PAD, py = TOP + i * (PH + GAP);

    // Layered soft shadow
    for (let s = 3; s >= 0; s--) {
      ctx.shadowColor = `rgba(0,0,0,${0.03 - s * 0.005})`;
      ctx.shadowBlur = 20 + s * 8;
      ctx.shadowOffsetY = 4 + s * 2;
      ctx.fillStyle = '#FFFFFF';
      rrect(ctx, px, py, PW, PH, 4);
      ctx.fill();
    }
    resetTextState(ctx);

    ctx.save();
    rrect(ctx, px, py, PW, PH, 4);
    ctx.clip();
    if (images[i]) drawCover(ctx, images[i], px, py, PW, PH, filterEffect);
    ctx.restore();

    // Hair-line border
    ctx.strokeStyle = 'rgba(228,228,231,0.8)';
    ctx.lineWidth = 1;
    rrect(ctx, px, py, PW, PH, 4);
    ctx.stroke();

    // Frame number (subtle)
    ctx.fillStyle = '#D4D4D8';
    ctx.textAlign = 'right';
    ctx.font = '20px Courier New, monospace';
    ctx.fillText(`${i + 1}`, px + PW - 12, py + PH - 10);
  }

  // Footer
  const fy = H - FOOTER;
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, fy + 20); ctx.lineTo(W - PAD, fy + 20);
  ctx.stroke();

  // Main label
  ctx.fillStyle = '#71717A';
  ctx.textAlign = 'center';
  ctx.font = '600 36px Segoe UI, sans-serif';
  ctx.fillText(labelText.toUpperCase(), W / 2, fy + 80);

  // Thin divider before barcode
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 220, fy + 100); ctx.lineTo(W / 2 + 220, fy + 100);
  ctx.stroke();

  // Barcode
  drawBarcode(ctx, W / 2 - 200, fy + 112, 400, 55);

  // Date below barcode
  ctx.font = '22px Courier New, monospace';
  ctx.fillStyle = '#A1A1AA';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), W / 2, fy + 190);

  drawStickers(ctx, stickers, W, H, FOOTER);
}

// ===================== MAIN DISPATCHER =====================

export async function renderPhotoboothCanvas(
  canvas: HTMLCanvasElement,
  frameId: FrameId,
  photos: string[],
  labelText: string,
  stickers: Sticker[],
  filter: PhotoFilter = 'normal'
): Promise<void> {
  const images = await Promise.all(photos.map(loadImage));
  switch (frameId) {
    case 'strawberry-milk':   return renderStrawberryMilk(canvas, images, labelText, stickers, filter);
    case 'matcha-cozy':       return renderMatchaCozy(canvas, images, labelText, stickers, filter);
    case 'butter-sunshine':   return renderButterSunshine(canvas, images, labelText, stickers, filter);
    case 'film-35mm':         return renderFilm35mm(canvas, images, labelText, stickers, filter);
    case 'minimal-white':     return renderMinimalWhite(canvas, images, labelText, stickers, filter);
    default:                  return renderStrawberryMilk(canvas, images, labelText, stickers, filter);
  }
}

