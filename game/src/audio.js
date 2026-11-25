// Sizzle & Serve — sound effects, all synthesized with WebAudio.
// No audio files are shipped: every sound is an oscillator or filtered noise.

export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  // Browsers only allow audio after a user gesture; call from the first click.
  ensureContext() {
    if (!this.context) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) this.context = new Ctor();
      } catch (err) {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  tone(frequency, duration, type, volume, slideTo) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(volume || 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  noiseBurst(duration, filterFrequency, volume) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency || 1200;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume || 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    source.start(now);
  }

  click() {
    this.tone(660, 0.06, 'triangle', 0.08);
  }

  chop() {
    this.noiseBurst(0.09, 900, 0.22);
    this.tone(180, 0.08, 'square', 0.06, 90);
  }

  placeOnGrill() {
    this.noiseBurst(0.35, 2600, 0.12);
  }

  ding() {
    this.tone(880, 0.18, 'sine', 0.12);
    this.tone(1318, 0.3, 'sine', 0.08);
  }

  serveChime() {
    this.tone(523, 0.12, 'triangle', 0.14);
    this.tone(659, 0.12, 'triangle', 0.14);
    setTimeout(() => this.tone(784, 0.28, 'triangle', 0.16), 110);
  }

  lostOrder() {
    this.tone(220, 0.25, 'sawtooth', 0.08, 140);
  }

  burnAlarm() {
    this.tone(440, 0.12, 'square', 0.07);
    setTimeout(() => this.tone(440, 0.12, 'square', 0.07), 150);
  }

  startSizzle() {
    if (!this.context || this.muted || this.sizzleNodes) return;
    const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = this.context.createGain();
    gain.gain.value = 0.035;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    source.start();
    this.sizzleNodes = { source, gain };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try {
      this.sizzleNodes.source.stop();
    } catch (err) {
      // Already stopped; nothing to do.
    }
    this.sizzleNodes = null;
  }
}
