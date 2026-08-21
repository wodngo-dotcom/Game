// Small WebAudio-based sound effects. No external audio files needed,
// so the game works fully offline. All sounds are short and gentle —
// there is no "wrong answer" sound; retry is always a soft, friendly cue.

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { webkitAudioContext?: AudioCtor };
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

interface ToneOptions {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playTone(audio: AudioContext, { freq, start, duration, type = 'sine', gain = 0.14 }: ToneOptions) {
  const osc = audio.createOscillator();
  const gainNode = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  gainNode.gain.setValueAtTime(0, audio.currentTime + start);
  gainNode.gain.linearRampToValueAtTime(gain, audio.currentTime + start + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);
  osc.connect(gainNode);
  gainNode.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

let soundEnabled = true;
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

function run(effect: (audio: AudioContext) => void) {
  if (!soundEnabled) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    effect(audio);
  } catch {
    // ignore audio failures (autoplay restrictions etc.)
  }
}

export function playTap() {
  run((audio) => playTone(audio, { freq: 520, start: 0, duration: 0.08, gain: 0.08 }));
}

export function playSuccess() {
  run((audio) => {
    playTone(audio, { freq: 523.25, start: 0, duration: 0.14 });
    playTone(audio, { freq: 659.25, start: 0.09, duration: 0.16 });
    playTone(audio, { freq: 783.99, start: 0.18, duration: 0.22 });
  });
}

export function playGentleRetry() {
  // A soft, friendly "hmm, try again" dip — never harsh or buzzer-like.
  run((audio) => {
    playTone(audio, { freq: 392, start: 0, duration: 0.16, type: 'sine', gain: 0.1 });
    playTone(audio, { freq: 330, start: 0.1, duration: 0.2, type: 'sine', gain: 0.1 });
  });
}

export function playDoorOpen() {
  run((audio) => {
    playTone(audio, { freq: 220, start: 0, duration: 0.3, type: 'triangle', gain: 0.1 });
    playTone(audio, { freq: 330, start: 0.12, duration: 0.3, type: 'triangle', gain: 0.1 });
    playTone(audio, { freq: 440, start: 0.24, duration: 0.35, type: 'triangle', gain: 0.1 });
  });
}

export function playCoin() {
  run((audio) => playTone(audio, { freq: 988, start: 0, duration: 0.12, type: 'square', gain: 0.06 }));
}

export function playStar() {
  run((audio) => {
    playTone(audio, { freq: 659.25, start: 0, duration: 0.12, gain: 0.12 });
    playTone(audio, { freq: 987.77, start: 0.08, duration: 0.28, gain: 0.14 });
  });
}

export function playLevelUp() {
  run((audio) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      playTone(audio, { freq, start: i * 0.11, duration: 0.2, gain: 0.13 });
    });
  });
}
