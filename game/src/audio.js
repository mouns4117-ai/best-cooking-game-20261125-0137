// All sound is synthesised with WebAudio — no audio files, nothing fetched.
// The context is created on the first user gesture, so the game stays silent
// until the player touches it.
export function createAudio() {
  let context = null;
  let muted = false;
  let sizzle = null;

  function ensure() {
    if (context === null) {
      try {
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        context = new Ctor();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    return context;
  }

  function tone(freq, seconds, type, volume, when = 0) {
    const ctx = ensure();
    if (ctx === null || muted) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  function noise(seconds, volume, filterFreq) {
    const ctx = ensure();
    if (ctx === null || muted) return;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  return {
    unlock() {
      ensure();
    },
    setMuted(value) {
      muted = value;
      if (muted) this.stopSizzle();
    },
    isMuted() {
      return muted;
    },
    pickup() {
      tone(520, 0.08, 'sine', 0.12);
    },
    place() {
      tone(340, 0.07, 'sine', 0.1);
    },
    chop() {
      noise(0.09, 0.25, 1800);
      tone(180, 0.06, 'triangle', 0.12);
    },
    chopDone() {
      tone(660, 0.09, 'sine', 0.12);
      tone(880, 0.12, 'sine', 0.1, 0.07);
    },
    grillDone() {
      tone(740, 0.1, 'sine', 0.12);
      tone(990, 0.14, 'sine', 0.1, 0.08);
    },
    serve() {
      tone(523, 0.12, 'sine', 0.14);
      tone(659, 0.12, 'sine', 0.14, 0.09);
      tone(784, 0.2, 'sine', 0.14, 0.18);
    },
    error() {
      tone(140, 0.18, 'square', 0.08);
    },
    expire() {
      tone(220, 0.15, 'sawtooth', 0.07);
      tone(165, 0.22, 'sawtooth', 0.07, 0.12);
    },
    tick() {
      tone(980, 0.05, 'square', 0.05);
    },
    click() {
      tone(440, 0.05, 'sine', 0.08);
    },
    startSizzle() {
      const ctx = ensure();
      if (ctx === null || muted || sizzle !== null) return;
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4200;
      filter.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.045;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      sizzle = { source, gain };
    },
    stopSizzle() {
      if (sizzle === null) return;
      try {
        sizzle.source.stop();
      } catch {
        // Already stopped.
      }
      sizzle = null;
    },
  };
}
