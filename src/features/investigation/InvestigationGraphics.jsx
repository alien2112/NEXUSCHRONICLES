import { useEffect, useRef } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function setupHiDpiCanvas(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.floor(width * dpr);
  const targetH = Math.floor(height * dpr);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.save();
  ctx.scale(dpr, dpr);
  return ctx;
}

/**
 * Computes spectrogram intensity (0..1) for Recording X (Sol 1094 marsquake)
 * or Recording Y (windy-day atmospheric noise).
 */
function getSpectrogramEnergy(variant, t, freqNorm) {
  if (variant === 'x') {
    // Calm baseline with faint murmur around t=0.35, then sharp surface-wave burst at t=0.62..0.78
    const baseHum = 0.08 * Math.exp(-Math.pow((t - 0.35) / 0.06, 2)) * (1 - freqNorm * 0.5);
    const onset = t >= 0.61 ? Math.exp(-Math.max(0, t - 0.64) * 9.5) : 0;
    const burst =
      t >= 0.61 && t <= 0.84
        ? onset * (0.65 + 0.35 * Math.sin(freqNorm * 5.2 + t * 18)) * (1 - freqNorm * 0.35)
        : 0;
    const micro = 0.05 * Math.abs(Math.sin(t * 43 + freqNorm * 11));
    return Math.min(1, Math.max(0.03, baseHum + burst + micro));
  }

  // Recording Y: scattered wind gusts across the full timeline, stronger at lower frequencies
  const gust1 = 0.42 * Math.exp(-Math.pow((t - 0.16) / 0.09, 2));
  const gust2 = 0.5 * Math.exp(-Math.pow((t - 0.44) / 0.11, 2));
  const gust3 = 0.38 * Math.exp(-Math.pow((t - 0.72) / 0.1, 2));
  const gust4 = 0.32 * Math.exp(-Math.pow((t - 0.91) / 0.07, 2));
  const turbulence = 0.14 * Math.abs(Math.sin(t * 31 + freqNorm * 7));
  return Math.min(0.82, Math.max(0.05, (gust1 + gust2 + gust3 + gust4 + turbulence) * (1 - freqNorm * 0.42)));
}

/**
 * Computes normalized seismic waveform amplitude (-1..1) for Recording X or Y.
 */
function getWaveformSample(variant, t) {
  if (variant === 'x') {
    const ambient = 0.04 * Math.sin(t * 170) * Math.cos(t * 63);
    const mildRipple = 0.12 * Math.exp(-Math.pow((t - 0.35) / 0.045, 2)) * Math.sin(t * 210);
    // Sudden quake onset at t = 0.62, peaking strongly in 0.62..0.78
    let quake = 0;
    if (t >= 0.62) {
      const env = Math.exp(-(t - 0.62) * 10.5) * Math.min(1, (t - 0.62) / 0.018);
      quake = env * (0.72 * Math.sin(t * 360) + 0.28 * Math.cos(t * 530));
    }
    return Math.max(-1, Math.min(1, ambient + mildRipple + quake));
  }

  // Recording Y: continuous irregular wind gusts throughout the recording
  const envelope =
    0.22 +
    0.26 * Math.sin(t * Math.PI * 5.2) * Math.sin(t * Math.PI * 5.2) +
    0.16 * Math.cos(t * Math.PI * 11.4) * Math.cos(t * Math.PI * 11.4);
  const carrier = 0.65 * Math.sin(t * 240) + 0.35 * Math.cos(t * 390 + 1.1);
  return Math.max(-0.85, Math.min(0.85, envelope * carrier));
}

function drawSeismogramFrame(canvas, variant, playhead) {
  const width = 460;
  const height = 190;
  const ctx = setupHiDpiCanvas(canvas, width, height);
  if (!ctx) return;

  // Deep space-navy telemetry background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#040817');
  bg.addColorStop(0.5, '#071028');
  bg.addColorStop(1, '#04091a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const padL = 14;
  const padR = 14;
  const plotW = width - padL - padR;

  // 1. TOP BAND: Spectrogram heatmap
  const specTop = 18;
  const specH = 66;
  const cols = 68;
  const rows = 12;
  const cellW = plotW / cols;
  const cellH = specH / rows;

  ctx.fillStyle = 'rgba(2, 6, 18, 0.75)';
  ctx.fillRect(padL, specTop, plotW, specH);

  for (let c = 0; c < cols; c++) {
    const t = c / (cols - 1);
    for (let r = 0; r < rows; r++) {
      const freqNorm = 1 - r / (rows - 1);
      const energy = getSpectrogramEnergy(variant, t, freqNorm);
      let fill;
      if (energy > 0.72) {
        fill = `rgba(249, 115, 22, ${0.45 + energy * 0.55})`;
      } else if (energy > 0.45) {
        fill = `rgba(247, 150, 29, ${0.3 + energy * 0.55})`;
      } else if (energy > 0.24) {
        fill = `rgba(56, 189, 248, ${0.22 + energy * 0.65})`;
      } else {
        fill = `rgba(30, 64, 175, ${0.18 + energy * 0.75})`;
      }
      ctx.fillStyle = fill;
      ctx.fillRect(padL + c * cellW, specTop + r * cellH, cellW + 0.6, cellH + 0.5);
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  ctx.strokeRect(padL, specTop, plotW, specH);

  // Spectrogram header & channel badge
  ctx.font = '600 9px "Exo 2", sans-serif';
  ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
  ctx.textAlign = 'left';
  ctx.fillText('SPECTROGRAM · FREQ (Hz)', padL, 12);

  ctx.font = '700 9px monospace';
  ctx.fillStyle = variant === 'x' ? '#F7961D' : '#60a5fa';
  ctx.textAlign = 'right';
  ctx.fillText(variant === 'x' ? 'CH · X' : 'CH · Y', width - padR, 12);

  // Time axis strip
  const timeLabels = ['00:00', '00:15', '00:30', '00:45'];
  ctx.font = '500 8px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  timeLabels.forEach((lbl, idx) => {
    const tx = padL + (idx / (timeLabels.length - 1)) * (plotW - 26);
    ctx.textAlign = 'left';
    ctx.fillText(lbl, tx, specTop + specH + 11);
  });

  // 2. BOTTOM BAND: Seismic waveform trace
  const waveTop = 106;
  const waveH = 72;
  const waveMid = waveTop + waveH / 2;

  ctx.fillStyle = 'rgba(3, 7, 20, 0.85)';
  ctx.fillRect(padL, waveTop, plotW, waveH);

  // Subtle gridlines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 1;
  for (let gx = 1; gx < 4; gx++) {
    const x = padL + (plotW * gx) / 4;
    ctx.beginPath();
    ctx.moveTo(x, waveTop);
    ctx.lineTo(x, waveTop + waveH);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  ctx.moveTo(padL, waveMid);
  ctx.lineTo(padL + plotW, waveMid);
  ctx.stroke();

  // Waveform stroke
  const steps = 220;
  const waveGrad = ctx.createLinearGradient(padL, 0, padL + plotW, 0);
  if (variant === 'x') {
    waveGrad.addColorStop(0, '#38bdf8');
    waveGrad.addColorStop(0.59, '#38bdf8');
    waveGrad.addColorStop(0.63, '#F7961D');
    waveGrad.addColorStop(0.76, '#facc15');
    waveGrad.addColorStop(1, '#38bdf8');
  } else {
    waveGrad.addColorStop(0, '#60a5fa');
    waveGrad.addColorStop(0.5, '#38bdf8');
    waveGrad.addColorStop(1, '#60a5fa');
  }

  ctx.strokeStyle = waveGrad;
  ctx.lineWidth = 1.7;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = padL + t * plotW;
    const amp = getWaveformSample(variant, t);
    const y = waveMid - amp * (waveH * 0.44);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  ctx.strokeRect(padL, waveTop, plotW, waveH);

  ctx.font = '600 8.5px "Exo 2", sans-serif';
  ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
  ctx.textAlign = 'left';
  ctx.fillText('WAVEFORM · VELOCITY', padL + 6, waveTop + 11);

  // Playback scanline when active
  if (playhead !== null) {
    const px = padL + playhead * plotW;
    ctx.strokeStyle = 'rgba(247, 150, 29, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, specTop);
    ctx.lineTo(px, waveTop + waveH);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Interactive graphical Seismogram + Spectrogram card visual for Step 1.
 */
export function SeismogramGraphic({ variant = 'x', isPlaying = false, ariaLabel }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (!isPlaying) {
      drawSeismogramFrame(canvas, variant, null);
      return undefined;
    }

    if (prefersReducedMotion()) {
      drawSeismogramFrame(canvas, variant, 0.66);
      return undefined;
    }

    let frameId = 0;
    const start = performance.now();
    // The heatmap, waveform and labels do not change during playback.
    // Keep their exact pixels and composite only the moving cursor each frame.
    const backdrop = document.createElement('canvas');
    let cachedDpr = 0;
    let fontsDirty = true;
    const invalidateFonts = () => { fontsDirty = true; };
    document.fonts?.addEventListener('loadingdone', invalidateFonts);
    const render = (now) => {
      const playhead = ((now - start) % 4500) / 4500;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cachedDpr !== dpr || fontsDirty) {
        drawSeismogramFrame(backdrop, variant, null);
        cachedDpr = dpr;
        fontsDirty = false;
      }
      const ctx = setupHiDpiCanvas(canvas, 460, 190);
      if (ctx) {
        ctx.clearRect(0, 0, 460, 190);
        ctx.drawImage(backdrop, 0, 0, backdrop.width, backdrop.height, 0, 0, 460, 190);
        const px = 14 + playhead * (460 - 28);
        ctx.strokeStyle = 'rgba(247, 150, 29, 0.9)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(px, 18);
        ctx.lineTo(px, 178);
        ctx.stroke();
        ctx.restore();
      }
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      document.fonts?.removeEventListener('loadingdone', invalidateFonts);
    };
  }, [variant, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className="w-full h-[126px] sm:h-[138px] md:h-[146px] block"
    />
  );
}

/**
 * Vector ~12 m Bus graphic used in Step 3 scale comparison tray and crater overlay.
 */
export function BusGraphic({ compact = false, ariaLabel, className = '' }) {
  return (
    <svg
      viewBox={compact ? '0 0 110 46' : '0 0 120 62'}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id="busBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="65%" stopColor="#F7961D" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Main chassis */}
      <rect x="10" y="9" width="88" height="26" rx="5" fill="url(#busBodyGrad)" stroke="#fde68a" strokeWidth="1.2" />
      {/* Roof strip */}
      <rect x="18" y="6" width="66" height="4" rx="2" fill="#e2e8f0" opacity="0.85" />
      {/* Windows */}
      <rect x="15" y="13" width="12" height="9" rx="1.8" fill="#07112b" stroke="#7dd3fc" strokeWidth="0.8" />
      <rect x="30" y="13" width="12" height="9" rx="1.8" fill="#07112b" stroke="#7dd3fc" strokeWidth="0.8" />
      <rect x="45" y="13" width="12" height="9" rx="1.8" fill="#07112b" stroke="#7dd3fc" strokeWidth="0.8" />
      <rect x="60" y="13" width="12" height="9" rx="1.8" fill="#07112b" stroke="#7dd3fc" strokeWidth="0.8" />
      {/* Front windshield */}
      <path d="M 76 13 L 92 13 Q 95 13 95 16 L 95 22 L 76 22 Z" fill="#07112b" stroke="#7dd3fc" strokeWidth="0.9" />
      {/* Trim stripe */}
      <rect x="11" y="26" width="86" height="2.4" fill="#0f172a" opacity="0.7" />
      {/* Headlight & taillight */}
      <rect x="95" y="28" width="4" height="3.5" rx="1" fill="#fef08a" />
      <rect x="9" y="28" width="3" height="3.5" rx="1" fill="#ef4444" />

      {/* Wheels */}
      <circle cx="29" cy="36" r="6.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.3" />
      <circle cx="29" cy="36" r="2.4" fill="#e2e8f0" />
      <circle cx="78" cy="36" r="6.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.3" />
      <circle cx="78" cy="36" r="2.4" fill="#e2e8f0" />

      {!compact && (
        <g>
          <line x1="10" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          <line x1="10" y1="47" x2="10" y2="53" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          <line x1="98" y1="47" x2="98" y2="53" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          <text x="54" y="59" textAnchor="middle" fill="#f8fafc" fontSize="9" fontFamily="monospace">
            ~12 m
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * Vector ~146 m Great Pyramid graphic used in Step 3 scale comparison tray.
 */
export function PyramidGraphic({ ariaLabel, className = '' }) {
  return (
    <svg viewBox="0 0 128 84" role="img" aria-label={ariaLabel} className={className}>
      <defs>
        <linearGradient id="pyrLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#F7961D" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="pyrShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#291407" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="64" cy="64" rx="50" ry="5" fill="rgba(0,0,0,0.45)" />

      {/* Left sunlit face */}
      <polygon points="64,10 14,62 68,66" fill="url(#pyrLight)" stroke="#fef3c7" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* Right shaded face */}
      <polygon points="64,10 68,66 114,60" fill="url(#pyrShade)" stroke="#F7961D" strokeOpacity="0.35" strokeWidth="0.9" />

      {/* Subtle masonry step lines */}
      <g stroke="rgba(255,248,220,0.22)" strokeWidth="0.7">
        <line x1="51" y1="24" x2="65" y2="25" />
        <line x1="40" y1="35" x2="66" y2="37" />
        <line x1="30" y1="46" x2="67" y2="49" />
        <line x1="21" y1="55" x2="67" y2="58" />
      </g>

      <line x1="14" y1="71" x2="114" y2="71" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <text x="64" y="81" textAnchor="middle" fill="#f8fafc" fontSize="9" fontFamily="monospace">
        ~146 m
      </text>
    </svg>
  );
}

/**
 * Graphical Martian Crater Cross-Section & Scale Diagram for Step 3.
 * Replaces static crater/bus/pyramid photos with proportional vector comparisons.
 */
export function CraterScaleGraphic({ busPlaced = false, pyramidPlaced = false, ariaLabel }) {
  return (
    <svg
      viewBox="0 0 560 220"
      role="img"
      aria-label={ariaLabel}
      className="w-full h-auto aspect-[560/220] sm:aspect-auto sm:h-[188px] block select-none overflow-hidden"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="marsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040818" />
          <stop offset="60%" stopColor="#170f1d" />
          <stop offset="100%" stopColor="#3b1b19" />
        </linearGradient>
        <linearGradient id="marsSurface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9c492b" />
          <stop offset="35%" stopColor="#6a2c1c" />
          <stop offset="100%" stopColor="#26100e" />
        </linearGradient>
        <linearGradient id="craterInterior" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#b85d38" />
          <stop offset="45%" stopColor="#3c1812" />
          <stop offset="100%" stopColor="#1b0b0a" />
        </linearGradient>
        <linearGradient id="pyrOverlayGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(247, 150, 29, 0.36)" />
          <stop offset="100%" stopColor="rgba(247, 150, 29, 0.1)" />
        </linearGradient>
      </defs>

      {/* Sky & subtle stars */}
      <rect width="560" height="220" fill="url(#marsSky)" />
      {[
        [45, 22], [95, 36], [170, 18], [240, 28], [335, 16], [420, 32], [505, 22], [532, 46],
      ].map(([sx, sy], idx) => (
        <circle key={idx} cx={sx} cy={sy} r={idx % 2 === 0 ? 1.1 : 0.75} fill="rgba(255,255,255,0.45)" />
      ))}

      {/* Distant horizon terrain ridge */}
      <path
        d="M 0 102 Q 70 94 140 100 T 280 96 T 430 101 T 560 95 L 560 120 L 0 120 Z"
        fill="#47201a"
        opacity="0.65"
      />

      {/* Martian crust & crater profile (rim at x=115 and x=445 -> 330px = 150m) */}
      <path
        d="M 0 108 L 88 106 Q 104 97 115 98 Q 134 100 156 135 Q 204 168 280 168 Q 356 168 404 135 Q 426 100 445 98 Q 456 97 472 106 L 560 108 L 560 220 L 0 220 Z"
        fill="url(#marsSurface)"
      />

      {/* Shaded crater bowl */}
      <path
        d="M 115 98 Q 134 100 156 135 Q 204 168 280 168 Q 356 168 404 135 Q 426 100 445 98 Q 375 112 280 113 Q 185 112 115 98 Z"
        fill="url(#craterInterior)"
        opacity="0.88"
      />

      {/* Geological strata lines */}
      <path d="M 0 145 Q 110 142 152 158 M 408 158 Q 450 142 560 145" stroke="rgba(255, 195, 160, 0.14)" strokeWidth="1.1" fill="none" />
      <path d="M 0 176 Q 180 186 280 184 T 560 176" stroke="rgba(255, 195, 160, 0.1)" strokeWidth="1" fill="none" />

      {/* Crater rim highlight */}
      <path
        d="M 115 98 Q 134 100 156 135 Q 204 168 280 168 Q 356 168 404 135 Q 426 100 445 98"
        stroke="#f59e0b"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Great Pyramid (~146 m) comparison overlay when placed */}
      {pyramidPlaced && (
        <g>
          <polygon
            points="280,22 120,166 440,166"
            fill="url(#pyrOverlayGrad)"
            stroke="#F7961D"
            strokeWidth="1.6"
            strokeDasharray="5 3"
          />
          <line x1="280" y1="22" x2="294" y2="166" stroke="rgba(247, 150, 29, 0.45)" strokeWidth="1.1" />
          <rect x="206" y="128" width="148" height="20" rx="10" fill="rgba(4, 9, 24, 0.88)" stroke="#F7961D" strokeWidth="1.1" />
          <text x="280" y="141" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="600">
            Great Pyramid ~146 m
          </text>
        </g>
      )}

      {/* 150 m width callout */}
      <g>
        <line x1="115" y1="40" x2="115" y2="92" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="445" y1="40" x2="445" y2="92" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="119" y1="46" x2="441" y2="46" stroke="#ffffff" strokeWidth="1.4" />
        <polygon points="115,46 123,42 123,50" fill="#ffffff" />
        <polygon points="445,46 437,42 437,50" fill="#ffffff" />
        <rect x="250" y="35" width="60" height="20" rx="6" fill="rgba(4, 9, 24, 0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <text x="280" y="48.5" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="700">
          150 m
        </text>
      </g>

      {/* 21 m depth callout */}
      <g>
        <line x1="280" y1="102" x2="280" y2="164" stroke="#38bdf8" strokeWidth="1.5" />
        <polygon points="280,98 276,105 284,105" fill="#38bdf8" />
        <polygon points="280,168 276,161 284,161" fill="#38bdf8" />
        <rect x="289" y="103" width="48" height="18" rx="5" fill="rgba(4, 9, 24, 0.88)" stroke="rgba(56,189,248,0.55)" strokeWidth="1" />
        <text x="313" y="115.5" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="monospace" fontWeight="700">
          21 m
        </text>
      </g>

      {/* Proportional 12 m Bus placed on the left rim/scale */}
      {busPlaced && (
        <g transform="translate(116, 79)">
          <rect x="0" y="2" width="26" height="9" rx="2" fill="#F7961D" stroke="#fef3c7" strokeWidth="0.9" />
          <rect x="3" y="4" width="16" height="3.5" rx="0.8" fill="#07112b" />
          <circle cx="6" cy="11.5" r="2.1" fill="#0f172a" stroke="#e2e8f0" strokeWidth="0.7" />
          <circle cx="20" cy="11.5" r="2.1" fill="#0f172a" stroke="#e2e8f0" strokeWidth="0.7" />
          <rect x="-8" y="-19" width="42" height="15" rx="4" fill="rgba(4, 9, 24, 0.9)" stroke="#F7961D" strokeWidth="1" />
          <text x="13" y="-8.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
            12 m
          </text>
        </g>
      )}

      {/* Bottom 150 m scale ruler */}
      <g>
        <line x1="115" y1="196" x2="445" y2="196" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        {[
          { x: 115, label: '0 m' },
          { x: 225, label: '50 m' },
          { x: 335, label: '100 m' },
          { x: 445, label: '150 m' },
        ].map((tick) => (
          <g key={tick.label}>
            <line x1={tick.x} y1="191" x2={tick.x} y2="200" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
            <text x={tick.x} y="211" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="monospace">
              {tick.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function drawMeteorSpeedFrame(canvas, speedVal, energyPct, tick) {
  const width = 430;
  const height = 118;
  const ctx = setupHiDpiCanvas(canvas, width, height);
  if (!ctx) return;

  const speedNorm = (speedVal - 10) / 90; // 0..1
  const energyNorm = energyPct / 100;

  // Space backdrop
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#030716');
  bg.addColorStop(0.65, '#091129');
  bg.addColorStop(1, '#261114');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Stars
  for (let i = 0; i < 28; i++) {
    const sx = ((Math.sin(i * 19.7) + 1) * 0.5) * width;
    const sy = ((Math.cos(i * 41.3) + 1) * 0.5) * height;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + (i % 3) * 0.18})`;
    ctx.fillRect(sx, sy, 1.3, 1.3);
  }

  // Curved Martian atmospheric limb at bottom-right
  const marsGlow = ctx.createRadialGradient(width + 20, height + 130, 60, width + 20, height + 130, 220);
  marsGlow.addColorStop(0, 'rgba(217, 119, 6, 0.55)');
  marsGlow.addColorStop(0.55, 'rgba(154, 52, 18, 0.28)');
  marsGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = marsGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(width + 30, height + 150, 195, Math.PI, Math.PI * 1.65);
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Meteoroid position advances slightly toward target with speed
  const mx = 118 + speedNorm * 140;
  const my = 56;

  // Dynamic plasma wake trail (scales with speed & energy)
  const trailLen = 75 + energyNorm * 165;
  const wakeGrad = ctx.createLinearGradient(mx, my, mx - trailLen, my);
  wakeGrad.addColorStop(0, 'rgba(254, 249, 195, 0.96)');
  wakeGrad.addColorStop(0.22, 'rgba(247, 150, 29, 0.85)');
  wakeGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.42)');
  wakeGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = wakeGrad;
  ctx.beginPath();
  ctx.moveTo(mx + 4, my - (9 + energyNorm * 7));
  ctx.lineTo(mx - trailLen, my - (2 + energyNorm * 12));
  ctx.lineTo(mx - trailLen, my + (2 + energyNorm * 12));
  ctx.lineTo(mx + 4, my + (9 + energyNorm * 7));
  ctx.closePath();
  ctx.fill();

  // Mach shockwave cone ahead of meteoroid
  const coneSpread = 16 + energyNorm * 20;
  ctx.strokeStyle = `rgba(186, 230, 253, ${0.28 + speedNorm * 0.5})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mx - 22 - speedNorm * 35, my - coneSpread);
  ctx.quadraticCurveTo(mx + 26, my, mx - 22 - speedNorm * 35, my + coneSpread);
  ctx.stroke();

  // Streaming spark particles
  const sparkCount = Math.round(6 + energyNorm * 16);
  for (let s = 0; s < sparkCount; s++) {
    const phase = ((s * 0.23 + tick * (0.4 + speedNorm * 1.4)) % 1);
    const px = mx - phase * trailLen * 0.92;
    const py = my + Math.sin(s * 7.3) * (4 + phase * (10 + energyNorm * 12));
    ctx.fillStyle = s % 2 === 0 ? 'rgba(253, 224, 71, 0.8)' : 'rgba(249, 115, 22, 0.75)';
    ctx.beginPath();
    ctx.arc(px, py, 1.1 + (1 - phase) * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Faceted rocky meteoroid (~12 m)
  ctx.save();
  ctx.translate(mx, my);
  const glow = ctx.createRadialGradient(4, 0, 2, 0, 0, 22 + energyNorm * 12);
  glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
  glow.addColorStop(0.55, 'rgba(247, 150, 29, 0.45)');
  glow.addColorStop(1, 'rgba(247, 150, 29, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 22 + energyNorm * 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#57534e';
  ctx.strokeStyle = '#fdba74';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-11, -7);
  ctx.lineTo(2, -11);
  ctx.lineTo(13, -3);
  ctx.lineTo(11, 7);
  ctx.lineTo(-2, 11);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Telemetry readouts
  const kms = Math.round(4 + speedNorm * 16);
  ctx.font = '600 9.5px monospace';
  ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
  ctx.textAlign = 'left';
  ctx.fillText(`VELOCITY ~${kms} km/s`, 10, 16);

  ctx.fillStyle = 'rgba(253, 186, 116, 0.9)';
  ctx.fillText(`EJECTA ENERGY ${energyPct}%`, 10, height - 10);

  ctx.restore();
}

/**
 * Interactive graphical meteoroid speed & kinetic energy canvas for Step 3.
 */
export function MeteorSpeedGraphic({ speedVal, energyPct, ariaLabel }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (prefersReducedMotion()) {
      drawMeteorSpeedFrame(canvas, speedVal, energyPct, 0.25);
      return undefined;
    }

    let frameId = 0;
    const start = performance.now();
    const render = (now) => {
      const tick = (now - start) / 1000;
      drawMeteorSpeedFrame(canvas, speedVal, energyPct, tick);
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [speedVal, energyPct]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className="w-full h-full block rounded-xl border border-white/15"
    />
  );
}
