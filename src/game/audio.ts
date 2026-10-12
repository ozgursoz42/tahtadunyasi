/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private lastSplashTime: number = 0;
  private lastTickTime: number = 0;

  constructor() {
    const saved = localStorage.getItem('tahta_sound_muted');
    this.muted = saved === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('tahta_sound_muted', String(this.muted));
    if (!this.muted) {
      this.playWoodClick();
    }
    return this.muted;
  }

  // Crisp wooden block click when tapping / selecting pieces
  public playWoodClick(pitchMod: number = 1.0) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 * pitchMod, t);
      osc.frequency.exponentialRampToValueAtTime(120 * pitchMod, t + 0.04);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  // Satisfying wooden snap / notch sound
  public playWoodSnap() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(320, t);
      osc1.frequency.exponentialRampToValueAtTime(80, t + 0.06);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(680, t);
      osc2.frequency.exponentialRampToValueAtTime(180, t + 0.07);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.08);
      osc2.stop(t + 0.08);
    } catch {
      // Silent
    }
  }

  // Soft water droplet splash (throttled to avoid cacophony)
  public playWaterSplash() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastSplashTime < 90) return;
    this.lastSplashTime = now;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startFreq = 600 + Math.random() * 400;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 350, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Silent
    }
  }

  // Wooden gear / ratchet tick
  public playGearTick() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastTickTime < 60) return;
    this.lastTickTime = now;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540 + Math.random() * 60, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.025);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Silent
    }
  }

  // Brass bell ring when log hits goal bell
  public playBellRing() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const freqs = [1046.5, 2093.0, 3135.9]; // High C harmonic bell
      const gains = [0.35, 0.18, 0.08];

      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        g.gain.setValueAtTime(gains[i], t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(g);
        g.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 1.2);
      });
    } catch {
      // Silent
    }
  }

  // Start simulation lever sound
  public playRunStart() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // Silent
    }
  }

  // Cheerful xylophone & wooden marimba victory fanfare!
  public playVictory() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.0 }, // C5
        { f: 659.25, d: 0.1 }, // E5
        { f: 783.99, d: 0.2 }, // G5
        { f: 1046.5, d: 0.3 }, // C6
        { f: 1318.5, d: 0.45 }, // E6
      ];

      notes.forEach(({ f, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + d);

        g.gain.setValueAtTime(0.3, t + d);
        g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.35);

        osc.connect(g);
        g.connect(this.ctx.destination);

        osc.start(t + d);
        osc.stop(t + d + 0.4);
      });
    } catch {
      // Silent
    }
  }

  // Delete / Trash piece whoosh
  public playTrash() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Silent
    }
  }
}

export const sound = new SoundEngine();
