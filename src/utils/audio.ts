// Sound utilities using Web Audio API (no external files needed)
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Beep countdown sound
export function playBeep(frequency = 880, duration = 0.12, volume = 0.3) {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio not available', e);
  }
}

// Shutter click sound
export function playShutter() {
  try {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.warn('Audio not available', e);
  }
}

// Final beep (longer, celebratory)
export function playFinalBeep() {
  playBeep(1046, 0.25, 0.4);
  setTimeout(() => playBeep(1318, 0.25, 0.3), 150);
  setTimeout(() => playBeep(1568, 0.4, 0.4), 300);
}

// Lofi music generator using Web Audio API
let lofiGainNode: GainNode | null = null;

function createLofiChord(ctx: AudioContext, frequencies: number[], startTime: number, duration: number, volume: number) {
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(lofiGainNode!);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

let lofiInterval: ReturnType<typeof setInterval> | null = null;
let lofiPlaying = false;

export function startLofi(volume = 0.15) {
  if (lofiPlaying) return;
  lofiPlaying = true;
  try {
    const ctx = getAudioCtx();
    lofiGainNode = ctx.createGain();
    lofiGainNode.gain.setValueAtTime(volume, ctx.currentTime);
    lofiGainNode.connect(ctx.destination);

    // Chord progressions (Cmaj7, Am7, Fmaj7, G7)
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 440.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 391.0],  // G7
    ];

    let chordIdx = 0;
    const beatDuration = 1.8;

    function playNextChord() {
      if (!lofiPlaying) return;
      const chord = chords[chordIdx % chords.length];
      createLofiChord(ctx, chord, ctx.currentTime, beatDuration * 2, 0.06);
      chordIdx++;
    }

    playNextChord();
    lofiInterval = setInterval(playNextChord, beatDuration * 2 * 1000);
  } catch (e) {
    console.warn('Lofi audio not available', e);
  }
}

export function stopLofi() {
  lofiPlaying = false;
  if (lofiInterval) {
    clearInterval(lofiInterval);
    lofiInterval = null;
  }
  if (lofiGainNode) {
    try {
      lofiGainNode.gain.linearRampToValueAtTime(0, getAudioCtx().currentTime + 0.3);
    } catch {}
    lofiGainNode = null;
  }
}

export function setLofiVolume(vol: number) {
  if (lofiGainNode) {
    try {
      lofiGainNode.gain.setValueAtTime(vol, getAudioCtx().currentTime);
    } catch {}
  }
}
