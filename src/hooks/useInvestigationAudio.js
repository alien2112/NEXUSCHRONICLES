import { useCallback, useEffect, useRef, useState } from 'react';
import siteContent from '../data/siteContent.json';

export default function useInvestigationAudio() {
  const [playingTrack, setPlayingTrack] = useState(null);
  const [audioError, setAudioError] = useState('');
  const audioCtxRef = useRef(null);
  const activeNodesRef = useRef([]);
  const timerRef = useRef(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(false);

  const stopAudio = useCallback(() => {
    requestRef.current += 1;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    for (const node of activeNodesRef.current) {
      try { node.stop?.(); } catch { /* A source may already have ended. */ }
      try { node.disconnect(); } catch { /* A node may already be disconnected. */ }
    }
    activeNodesRef.current = [];
    if (mountedRef.current) setPlayingTrack(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAudio();
      const context = audioCtxRef.current;
      audioCtxRef.current = null;
      if (context && context.state !== 'closed') {
        void context.close().catch(() => { /* Context may have been closed by the browser. */ });
      }
    };
  }, [stopAudio]);

  // Synthesize sped-up 100x InSight SEIS audio for Recording X or Recording Y
  const togglePlayAudio = async (track) => {
    if (playingTrack === track) {
      stopAudio();
      return;
    }
    stopAudio();
    const request = requestRef.current;
    setAudioError('');

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (!mountedRef.current || request !== requestRef.current) return;

      const duration = 4.5;
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);

      if (track === 'x') {
        filter.frequency.setValueAtTime(110, now);
        filter.Q.setValueAtTime(2.8, now);
        filter.frequency.linearRampToValueAtTime(75, now + 1.5);
        filter.frequency.exponentialRampToValueAtTime(240, now + 3.1);

        gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
        gain.gain.linearRampToValueAtTime(0.45, now + 1.6);
        gain.gain.linearRampToValueAtTime(0.15, now + 2.8);
        gain.gain.linearRampToValueAtTime(0.35, now + 3.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      } else {
        filter.frequency.setValueAtTime(190, now);
        filter.Q.setValueAtTime(1.4, now);
        filter.frequency.linearRampToValueAtTime(320, now + 1.8);
        filter.frequency.linearRampToValueAtTime(140, now + 3.6);

        gain.gain.linearRampToValueAtTime(0.28, now + 0.8);
        gain.gain.linearRampToValueAtTime(0.14, now + 2.1);
        gain.gain.linearRampToValueAtTime(0.25, now + 3.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      activeNodesRef.current.push(noise, filter, gain);
      noise.start(now);
      noise.stop(now + duration);
      setPlayingTrack(track);

      timerRef.current = setTimeout(() => {
        stopAudio();
      }, duration * 1000);
    } catch {
      if (mountedRef.current && request === requestRef.current) {
        stopAudio();
        setAudioError(siteContent.app.audioUnavailableError);
      }
    }
  };


  return { playingTrack, audioError, togglePlayAudio, stopAudio };
}
