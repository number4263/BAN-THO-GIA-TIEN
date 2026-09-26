// Web Audio API Sound Synthesizer for Buddhist / Temple meditation sounds

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isAudioMuted = muted;
}

export function isSoundMuted(): boolean {
  return isAudioMuted;
}

// 1. Tiếng Đại Hồng Chung / Chuông Gia Trì (Deep temple singing bowl with rich harmonics)
export function playBellSound(pitchMultiplier = 1.0) {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Fundamental frequencies of singing bowl
    const baseFreq = 261.63 * pitchMultiplier; // C4
    const partials = [
      { freq: baseFreq, gain: 0.6, decay: 4.5 },
      { freq: baseFreq * 2.76, gain: 0.35, decay: 3.2 },
      { freq: baseFreq * 5.4, gain: 0.15, decay: 2.2 },
      { freq: baseFreq * 8.9, gain: 0.08, decay: 1.4 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(gain, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// 2. Tiếng Mõ tụng kinh (Wooden Fish - resonant hollow timber strike)
let woodenFishStrokeCount = 0;

export function playWoodenFish(volume = 0.7) {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn('Wooden fish audio error:', err);
  }
}

// 2b. Tiếng Mõ nhỏ xen kẽ khi giữ trạng thái chắp tay khấn nguyện (Soft gentle alternating wooden fish)
export function playSoftWoodenFish() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    woodenFishStrokeCount++;
    const isAlternate = woodenFishStrokeCount % 2 === 0;

    // Slight natural pitch variation between alternating strokes (e.g. 520Hz vs 555Hz)
    const baseFreq = isAlternate ? 555 : 520;
    const targetFreq = isAlternate ? 275 : 255;
    const filterFreq = isAlternate ? 670 : 635;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.11);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(3.8, now);

    // Soft volume (nhẹ nhàng, ấm áp, không chói gắt)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn('Soft wooden fish error:', err);
  }
}

// Rung phản hồi xúc giác nhẹ (Haptic feedback for prayer vibration)
export function triggerHapticPrayer() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.([18]);
    } catch {
      // safe fallback on unsupported browsers
    }
  }
}

// 3. Tiếng Đốt Lửa / Bắt Lửa (Match strike / gentle ignition sizzle)
export function playIgniteSound() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // White noise buffer for sizzle
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);
  } catch (err) {
    console.warn('Ignite sound error:', err);
  }
}

// 4. Tiếng Chuông Gió Thanh Tịnh (Bowing chime)
export function playChime() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [880, 1174, 1318];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.8);
    });
  } catch (err) {
    console.warn('Chime sound error:', err);
  }
}
