/**
 * Procedural Web Audio synthesizer for NEXUS — MARS: THE SURVIVAL PROTOCOL.
 * Generates Martian wind ambience, subtle sci-fi pad music, rover drive hum,
 * and gameplay SFX with live mute and volume controls.
 */

export function createSurvivalAudio() {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let roverOsc = null;
  let roverGainNode = null;
  let windSource = null;
  let padOscA = null;
  let padOscB = null;
  let initialized = false;
  let currentSettings = { muted: false, musicVolume: 0.45, sfxVolume: 0.7 };

  function ensureStarted() {
    if (initialized) {
      if (ctx?.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return true;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      musicGain = ctx.createGain();
      sfxGain = ctx.createGain();

      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      applySettings(currentSettings);

      // Subtle Martian wind buffer (low-passed noise)
      const bufSize = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const output = noiseBuf.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufSize; i += 1) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
      }
      windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuf;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 340;
      const windLevel = ctx.createGain();
      windLevel.gain.value = 0.22;

      windSource.connect(windFilter);
      windFilter.connect(windLevel);
      windLevel.connect(musicGain);
      windSource.start();

      // Subtle futuristic low harmonic drone
      padOscA = ctx.createOscillator();
      padOscB = ctx.createOscillator();
      padOscA.type = 'sine';
      padOscB.type = 'triangle';
      padOscA.frequency.value = 65.41; // C2
      padOscB.frequency.value = 98.0; // G2
      const padGain = ctx.createGain();
      padGain.gain.value = 0.08;
      padOscA.connect(padGain);
      padOscB.connect(padGain);
      padGain.connect(musicGain);
      padOscA.start();
      padOscB.start();

      // Rover subtle electric motor hum
      roverOsc = ctx.createOscillator();
      roverOsc.type = 'sawtooth';
      roverOsc.frequency.value = 72;
      const roverFilter = ctx.createBiquadFilter();
      roverFilter.type = 'lowpass';
      roverFilter.frequency.value = 210;
      roverGainNode = ctx.createGain();
      roverGainNode.gain.value = 0;
      roverOsc.connect(roverFilter);
      roverFilter.connect(roverGainNode);
      roverGainNode.connect(sfxGain);
      roverOsc.start();

      initialized = true;
      return true;
    } catch {
      return false;
    }
  }

  function applySettings(settings) {
    currentSettings = { ...currentSettings, ...settings };
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    masterGain.gain.setTargetAtTime(currentSettings.muted ? 0 : 1, now, 0.04);
    musicGain.gain.setTargetAtTime(currentSettings.musicVolume ?? 0.45, now, 0.05);
    sfxGain.gain.setTargetAtTime(currentSettings.sfxVolume ?? 0.7, now, 0.05);
  }

  function updateRoverSpeed(speed) {
    if (!initialized || !roverOsc || !roverGainNode || !ctx) return;
    const absSpeed = Math.abs(speed);
    const now = ctx.currentTime;
    const targetGain = absSpeed > 0.2 ? Math.min(0.11, absSpeed * 0.012) : 0;
    const targetFreq = 68 + absSpeed * 14;
    roverGainNode.gain.setTargetAtTime(targetGain, now, 0.06);
    roverOsc.frequency.setTargetAtTime(targetFreq, now, 0.06);
  }

  function playTone(freq, duration = 0.14, type = 'sine', vol = 0.2, slideTo = null) {
    if (!ensureStarted() || !ctx || currentSettings.muted) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playCollect() {
    playTone(540, 0.12, 'triangle', 0.22, 880);
    setTimeout(() => playTone(880, 0.14, 'sine', 0.16, 1180), 65);
  }

  function playBuild() {
    playTone(140, 0.16, 'sawtooth', 0.22, 260);
    setTimeout(() => playTone(440, 0.18, 'triangle', 0.18, 660), 90);
  }

  function playUpgrade() {
    playTone(392, 0.12, 'sine', 0.2, 523);
    setTimeout(() => playTone(659, 0.2, 'triangle', 0.22, 784), 85);
  }

  function playAlert() {
    playTone(520, 0.16, 'square', 0.12, 410);
    setTimeout(() => playTone(420, 0.18, 'square', 0.1, 320), 170);
  }

  function playLevelComplete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => playTone(f, 0.2, 'triangle', 0.18), idx * 90);
    });
  }

  function dispose() {
    if (!ctx) return;
    try {
      windSource?.stop();
      padOscA?.stop();
      padOscB?.stop();
      roverOsc?.stop();
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    } catch {
      // Ignore cleanup errors
    }
    initialized = false;
    ctx = null;
  }

  return {
    ensureStarted,
    applySettings,
    updateRoverSpeed,
    playCollect,
    playBuild,
    playUpgrade,
    playAlert,
    playLevelComplete,
    dispose,
  };
}
