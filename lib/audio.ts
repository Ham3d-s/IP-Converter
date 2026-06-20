/**
 * IP Plus 2.0 Audio Effector
 * Safe, lazy-loaded retro 8-bit audio generator using Web Audio API.
 * Prevents SSR failures by checking if window is active.
 */

let audioCtx: AudioContext | null = null;
let enabled = true;

function initAudioContext() {
  if (typeof window !== 'undefined' && !audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
    }
  }
}

export const SoundFX = {
  isEnabled(): boolean {
    return enabled;
  },

  setEnabled(val: boolean) {
    enabled = val;
    this.click();
  },

  playTone(freq: number, type: OscillatorType, duration: number, gainVal = 0.05) {
    if (!enabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio play failed or blocked by autoplay browser restrictions
    }
  },

  click() {
    this.playTone(850, 'sine', 0.08, 0.03);
  },

  bitToggle() {
    this.playTone(400, 'triangle', 0.1, 0.04);
  },

  quizSuccess() {
    this.playTone(523.25, 'triangle', 0.08, 0.04); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.08, 0.04), 60); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.04), 120); // G5
  },

  quizFail() {
    this.playTone(180, 'sawtooth', 0.25, 0.05);
  },
};
