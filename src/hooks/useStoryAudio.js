import { useCallback, useEffect, useRef, useState } from 'react';
import siteContent from '../data/siteContent.json';

/**
 * Synthesizes InSight mission audio clips ('wind', 'marsquake', 'impact')
 * using the Web Audio API with full unmount and error cleanup.
 */
export default function useStoryAudio() {
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

  const togglePlayAudio = useCallback(async (track) => {
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
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);

      if (track === 'wind') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, now);
        filter.Q.setValueAtTime(1.2, now);
        filter.frequency.linearRampToValueAtTime(95, now + 1.4);
        filter.frequency.linearRampToValueAtTime(210, now + 2.7);
        filter.frequency.linearRampToValueAtTime(110, now + duration);

        gain.gain.linearRampToValueAtTime(0.22, now + 0.9);
        gain.gain.linearRampToValueAtTime(0.32, now + 2.4);
        gain.gain.linearRampToValueAtTime(0.16, now + 3.6);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      } else if (track === 'impact') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(140, now);
        filter.Q.setValueAtTime(2.6, now);
        filter.frequency.exponentialRampToValueAtTime(360, now + 1.1);
        filter.frequency.exponentialRampToValueAtTime(85, now + 2.4);
        filter.frequency.linearRampToValueAtTime(130, now + duration);

        gain.gain.linearRampToValueAtTime(0.14, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.48, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.18, now + 2.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      } else {
        // Default: 'marsquake'
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(100, now);
        filter.Q.setValueAtTime(2.4, now);
        filter.frequency.linearRampToValueAtTime(70, now + 1.6);
        filter.frequency.exponentialRampToValueAtTime(195, now + 3.0);

        gain.gain.linearRampToValueAtTime(0.16, now + 0.7);
        gain.gain.linearRampToValueAtTime(0.38, now + 1.8);
        gain.gain.linearRampToValueAtTime(0.22, now + 3.2);
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
  }, [playingTrack, stopAudio]);

  return { playingTrack, audioError, togglePlayAudio, stopAudio };
}
