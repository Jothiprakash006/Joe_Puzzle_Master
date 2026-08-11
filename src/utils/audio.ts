// Web Audio API Synthesizer for instant 60FPS sound feedback without external file latency
class AudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private volume: number = 0.6;
  private bgmGain: GainNode | null = null;
  private bgmInterval: any = null;
  private chordIndex: number = 0;

  constructor() {
    // Lazy init on user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(0.08 * this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playPickup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playDrop() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playSnap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Play a crisp harmonic chime + bass thump
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major chord notes
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);

      gain.gain.setValueAtTime(0.3 * this.volume, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + idx * 0.02);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.3 + idx * 0.02);
    });

    // Satisfying bass thump
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(120, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    bassGain.gain.setValueAtTime(0.4 * this.volume, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    bass.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bass.start(now);
    bass.stop(now + 0.15);
  }

  public playCombo(comboCount: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Scale pitch higher with combo count
    const baseFreq = Math.min(440 * Math.pow(1.059463, (comboCount - 1) * 2), 1760);
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major triad

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);

      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      gain.gain.setValueAtTime(0.25 * this.volume, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.03);
      osc.stop(now + 0.4 + idx * 0.03);
    });
  }

  public playWrong() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.18);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playHint() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 880, 1318.51, 1760]; // Magical ascending arpeggio
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.2 * this.volume, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.35);
    });
  }

  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Triumphant fanfare arpeggio
    const fanfare = [
      { f: 523.25, t: 0, d: 0.15 },    // C5
      { f: 523.25, t: 0.15, d: 0.15 }, // C5
      { f: 523.25, t: 0.3, d: 0.15 },  // C5
      { f: 659.25, t: 0.45, d: 0.4 },  // E5
      { f: 783.99, t: 0.85, d: 0.3 },  // G5
      { f: 1046.50, t: 1.15, d: 0.8 }, // C6
    ];

    fanfare.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.35 * this.volume, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.05);
    });
  }

  // Cyberpunk Ambient Synth Loop
  public startMusic() {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    this.stopMusic();

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Play generative ambient synth chords
    const chords = [
      [220, 261.63, 329.63, 392],    // Am7
      [174.61, 220, 261.63, 349.23], // Fmaj7
      [130.81, 196, 246.94, 293.66], // Cmaj7 / G
      [146.83, 220, 261.63, 329.63], // Dm7
    ];

    const playNextChord = () => {
      if (!this.musicEnabled || !this.ctx || !this.bgmGain) return;
      const currentChord = chords[this.chordIndex % chords.length];
      this.chordIndex++;

      const now = this.ctx.currentTime;
      currentChord.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(800, now + 2);
        filter.frequency.linearRampToValueAtTime(350, now + 4);

        noteGain.gain.setValueAtTime(0.01, now);
        noteGain.gain.linearRampToValueAtTime(0.15, now + 1);
        noteGain.gain.linearRampToValueAtTime(0.01, now + 4);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain!);

        osc.start(now);
        osc.stop(now + 4.1);
      });
    };

    playNextChord();
    this.bgmInterval = setInterval(playNextChord, 4000);
  }

  public stopMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.disconnect();
      } catch (e) {}
      this.bgmGain = null;
    }
  }
}

export const audio = new AudioEngine();
