import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { CaseBoardStrip } from './CaseBoardPanel';
import { NexusSidePanel } from './WorkspaceLayout';

/**
 * Procedural HiRISE-style Mars Crater Canvas for Test 04:
 * Supports Black & White vs Colour (enhanced IRB) ice highlighting and 11-month sublimation (Feb–Dec 2022).
 */
function WaterIceCraterCanvas({
  falseColor,
  monthProgress,
  compact = false,
  showTarget = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = compact ? 96 : 640;
    const height = compact ? 96 : 250;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);

    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.05,
      width * 0.5,
      height * 0.5,
      width * 0.72
    );
    if (falseColor) {
      bgGrad.addColorStop(0, '#442b3a');
      bgGrad.addColorStop(0.45, '#2b1e3b');
      bgGrad.addColorStop(1, '#120e22');
    } else {
      bgGrad.addColorStop(0, '#363942');
      bgGrad.addColorStop(0.5, '#23262e');
      bgGrad.addColorStop(1, '#101217');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < (compact ? 70 : 220); i++) {
      const sx = ((Math.sin(i * 19.31) + 1) * 0.5) * width;
      const sy = ((Math.cos(i * 47.17) + 1) * 0.5) * height;
      const sr = (i % 3) + 0.6;
      ctx.fillStyle = falseColor
        ? i % 2 === 0
          ? 'rgba(155, 130, 195, 0.09)'
          : 'rgba(40, 22, 58, 0.16)'
        : i % 2 === 0
        ? 'rgba(210, 214, 224, 0.08)'
        : 'rgba(10, 12, 16, 0.22)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    const cx = width * 0.5;
    const cy = height * 0.5;
    const craterR = compact ? 18 : 34;

    const rayAngles = [0.2, 0.72, 1.35, 1.95, 2.55, 3.25, 3.9, 4.7, 5.45, 5.98];
    rayAngles.forEach((angle, idx) => {
      const rayLen = (compact ? 26 : 115) * (0.7 + ((idx * 37) % 10) * 0.05);
      const spread = 0.08 + (idx % 3) * 0.03;
      const rayGrad = ctx.createLinearGradient(
        cx,
        cy,
        cx + Math.cos(angle) * rayLen,
        cy + Math.sin(angle) * rayLen
      );
      rayGrad.addColorStop(0, falseColor ? 'rgba(24, 20, 42, 0.85)' : 'rgba(14, 15, 19, 0.85)');
      rayGrad.addColorStop(0.6, falseColor ? 'rgba(38, 30, 62, 0.35)' : 'rgba(26, 28, 34, 0.35)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle - 0.3) * craterR * 0.8, cy + Math.sin(angle - 0.3) * craterR * 0.8);
      ctx.lineTo(cx + Math.cos(angle - spread) * rayLen, cy + Math.sin(angle - spread) * rayLen);
      ctx.lineTo(cx + Math.cos(angle + spread) * rayLen, cy + Math.sin(angle + spread) * rayLen);
      ctx.lineTo(cx + Math.cos(angle + 0.3) * craterR * 0.8, cy + Math.sin(angle + 0.3) * craterR * 0.8);
      ctx.closePath();
      ctx.fill();
    });

    const fadeFactor = Math.max(0.08, 1 - (monthProgress / 100) * 0.92);
    const scaleFactor = Math.max(0.28, 1 - (monthProgress / 100) * 0.72);
    const iceBlocks = [
      { dx: -craterR * 1.18, dy: -craterR * 0.45, rx: craterR * 0.42, ry: craterR * 0.22, rot: -0.4 },
      { dx: craterR * 1.05, dy: -craterR * 0.65, rx: craterR * 0.36, ry: craterR * 0.2, rot: 0.55 },
      { dx: -craterR * 0.85, dy: craterR * 1.02, rx: craterR * 0.48, ry: craterR * 0.24, rot: 0.28 },
      { dx: craterR * 0.92, dy: craterR * 0.88, rx: craterR * 0.38, ry: craterR * 0.19, rot: -0.5 },
      { dx: 0, dy: -craterR * 1.24, rx: craterR * 0.34, ry: craterR * 0.16, rot: 0.12 },
      { dx: -craterR * 1.75, dy: craterR * 0.25, rx: craterR * 0.22, ry: craterR * 0.12, rot: 0.9 },
      { dx: craterR * 1.68, dy: -craterR * 0.1, rx: craterR * 0.24, ry: craterR * 0.12, rot: -0.75 },
      { dx: -craterR * 0.18, dy: craterR * 0.18, rx: craterR * 0.22, ry: craterR * 0.16, rot: 0.3 },
    ];

    iceBlocks.forEach((patch) => {
      const px = cx + patch.dx;
      const py = cy + patch.dy;
      const prx = patch.rx * scaleFactor;
      const pry = patch.ry * scaleFactor;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(patch.rot);
      ctx.globalAlpha = fadeFactor;

      const patchGrad = ctx.createRadialGradient(0, 0, prx * 0.1, 0, 0, Math.max(prx, pry) * 1.25);
      if (falseColor) {
        patchGrad.addColorStop(0, '#f0fdff');
        patchGrad.addColorStop(0.35, '#7dd3fc');
        patchGrad.addColorStop(0.7, 'rgba(34, 211, 238, 0.58)');
        patchGrad.addColorStop(1, 'rgba(14, 116, 144, 0)');
      } else {
        patchGrad.addColorStop(0, '#ffffff');
        patchGrad.addColorStop(0.45, '#e5e7eb');
        patchGrad.addColorStop(0.8, 'rgba(209, 213, 219, 0.42)');
        patchGrad.addColorStop(1, 'rgba(156, 163, 175, 0)');
      }

      ctx.fillStyle = patchGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, prx * 1.25, pry * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const rimGrad = ctx.createRadialGradient(
      cx - craterR * 0.18,
      cy - craterR * 0.18,
      craterR * 0.12,
      cx,
      cy,
      craterR * 1.15
    );
    if (falseColor) {
      rimGrad.addColorStop(0, '#090b16');
      rimGrad.addColorStop(0.65, '#191c34');
      rimGrad.addColorStop(0.88, '#6a4c6b');
      rimGrad.addColorStop(1, 'rgba(42, 30, 58, 0)');
    } else {
      rimGrad.addColorStop(0, '#090a0d');
      rimGrad.addColorStop(0.65, '#1b1d24');
      rimGrad.addColorStop(0.88, '#686d78');
      rimGrad.addColorStop(1, 'rgba(35, 38, 46, 0)');
    }
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, craterR * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = falseColor ? 'rgba(165, 243, 252, 0.48)' : 'rgba(229, 231, 235, 0.4)';
    ctx.lineWidth = compact ? 1.1 : 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, craterR * 0.9, -Math.PI * 0.85, Math.PI * 0.15);
    ctx.stroke();

    if (showTarget && !compact) {
      const tx = cx - craterR * 1.18;
      const ty = cy - craterR * 0.45;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(tx, ty, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!compact) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(width - 96, height - 22, 68, 2);
      ctx.font = '500 10px "Exo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('100 m', width - 62, height - 28);
    }

    ctx.restore();
  }, [falseColor, monthProgress, compact, showTarget]);

  return <canvas role="img" aria-label={`Crater in ${falseColor ? 'colour' : 'black and white'}; time-lapse progress ${Math.round(monthProgress)} percent`} ref={canvasRef} className="w-full h-full block object-cover" />;
}

const TEST4_MONTH_LABELS = [
  'Feb 2022',
  'Mar 2022',
  'Apr 2022',
  'May 2022',
  'Jun 2022',
  'Jul 2022',
  'Aug 2022',
  'Sep 2022',
  'Oct 2022',
  'Nov 2022',
  'Dec 2022',
];

const FINGERPRINT_CANDIDATES = [
  {
    id: 'rock',
    label: 'Bright Rock',
    sublabel: 'Silica / Dust',
    // High, relatively flat reflectance without water-ice dips at 1.5 & 2.0 um
    points: '8,26 42,24 72,22 98,25 130,24 162,26 196,25 232,27',
    isMatch: false,
    feedback: 'Mismatch — bright rock lacks the deep 1.5 μm & 2.0 μm dips.',
  },
  {
    id: 'water-ice',
    label: 'Water Ice (H₂O)',
    sublabel: '1.5 & 2.0 μm dips',
    // Matches the crater's measured water-ice absorption bands
    points: '8,22 36,24 58,28 76,68 95,30 124,26 146,74 168,36 198,32 232,38',
    isMatch: true,
    feedback: 'Match confirmed — 1.5 μm & 2.0 μm dips fit water ice.',
  },
  {
    id: 'co2-ice',
    label: 'Dry Ice (CO₂)',
    sublabel: '1.43 & 2.01 μm',
    // Narrow 1.43 um & shifted 2.01 um features — visibly misses the crater curve
    points: '8,20 34,20 56,56 70,22 104,20 132,22 154,60 172,24 202,24 232,26',
    isMatch: false,
    feedback: 'Mismatch — CO₂ dry ice bands are narrower and shifted.',
  },
];

const CRATER_MEASURED_SPECTRUM =
  '8,23 36,25 58,29 76,68 95,31 124,27 146,74 168,37 198,33 232,39';

/**
 * Interactive IR Spectrometer ("Light Fingerprint") Matcher for Test 04 (Beats 2–4).
 */
function LightFingerprintMatcher({ selectedId, onSelect }) {
  const active = FINGERPRINT_CANDIDATES.find((c) => c.id === selectedId) || null;

  return (
    <div className="flex flex-col justify-between h-full p-3 bg-[#050b1d]/95">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-orbitron uppercase tracking-wider text-cyan-300">
          Light Fingerprint (1.0 – 2.5 μm)
        </span>
        {active && (
          <span
            className={`text-[10px] font-exo2 font-semibold px-2 py-0.5 rounded-full border ${
              active.isMatch
                ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                : 'border-amber-400/60 bg-amber-500/15 text-amber-200'
            }`}
          >
            {active.isMatch ? 'Match!' : 'No Match'}
          </span>
        )}
      </div>

      {/* Spectrum Comparison SVG */}
      <div className="relative rounded-lg border border-white/15 bg-[#030714] px-2 pt-2 pb-1">
        <svg viewBox="0 0 240 88" className="w-full h-[76px] sm:h-[84px] overflow-visible">
          {/* Subtle grid & absorption markers */}
          <line x1="76" y1="8" x2="76" y2="78" stroke="rgba(125,211,252,0.22)" strokeDasharray="2 2" />
          <line x1="146" y1="8" x2="146" y2="78" stroke="rgba(125,211,252,0.22)" strokeDasharray="2 2" />
          <line x1="8" y1="78" x2="234" y2="78" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

          <text x="76" y="86" fill="rgba(186,230,253,0.7)" fontSize="7" textAnchor="middle">
            1.5 μm
          </text>
          <text x="146" y="86" fill="rgba(186,230,253,0.7)" fontSize="7" textAnchor="middle">
            2.0 μm
          </text>
          <text x="12" y="12" fill="rgba(255,255,255,0.45)" fontSize="6.5">
            Crater patch
          </text>

          {/* Measured crater light fingerprint */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={CRATER_MEASURED_SPECTRUM}
          />

          {/* Selected candidate overlay */}
          {active && (
            <polyline
              fill="none"
              stroke={active.isMatch ? '#34d399' : '#F7961D'}
              strokeWidth="2"
              strokeDasharray={active.isMatch ? '4 2' : '5 3'}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={active.points}
            />
          )}
        </svg>
      </div>

      {/* Reference Material Buttons */}
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {FINGERPRINT_CANDIDATES.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(item)}
              className={`rounded-lg border px-1.5 py-1.5 text-center transition-all cursor-pointer ${
                isSelected
                  ? item.isMatch
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_12px_rgba(52,211,153,0.28)]'
                    : 'border-[#F7961D] bg-[#F7961D]/15 text-white'
                  : 'border-white/25 bg-[#081026]/85 hover:border-[#F7961D]/75 text-white/85'
              }`}
            >
              <div className="font-exo2 font-semibold text-[10px] sm:text-[11px] leading-tight">
                {item.label}
              </div>
              <div className="font-exo2 text-[8.5px] sm:text-[9px] text-white/60 mt-0.5 leading-tight">
                {item.sublabel}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 text-[10px] font-exo2 text-white/75 truncate">
        {active
          ? active.feedback
          : 'Pick a mineral spectrum to match the crater dips.'}
      </div>
    </div>
  );
}

/**
 * TEST 04: Is it really ice?
 * Matches Investigation 4 reference flow:
 *  - Beats 0–1: Black & White -> Colour view ("switch from black and white to colour")
 *  - Beats 2–3: Light fingerprint matcher ("Light fingerprint: Match the crater's fingerprint.") +
 *               Months time-lapse slider ("If this is ice, what happens over months?" Feb 2022 – Dec 2022)
 *  - Beat 4: Final Test 04 synthesis + Case Board strip with 4th stamp ("THE EVIDENCE POINTS TO ICE")
 */
export function Test04Workspace({
  confidenceChoice,
  onChangeConfidence,
  earnedStampIds,
  onUnlockStamp4,
  onOpenCaseBoard,
}) {
  const [falseColor, setFalseColor] = useState(false);
  const [monthIdx, setMonthIdx] = useState(0); // 0 = Feb 2022 .. 10 = Dec 2022
  const [selectedFingerprint, setSelectedFingerprint] = useState(null);
  const [beat, setBeat] = useState(0); // 0..4

  const monthProgress = (monthIdx / 10) * 100;
  const currentMonthLabel = TEST4_MONTH_LABELS[monthIdx] || 'Feb 2022';

  const handleToggleColor = (nextMode) => {
    const target = typeof nextMode === 'boolean' ? nextMode : !falseColor;
    setFalseColor(target);
    if (beat === 0 && target) {
      setBeat(1);
    }
  };

  const handleSelectFingerprint = (candidate) => {
    setSelectedFingerprint(candidate.id);
    if (candidate.isMatch) {
      onUnlockStamp4();
      if (beat === 2 && monthIdx >= 5) {
        setBeat(3);
      }
    }
  };

  const handleMonthSlider = (e) => {
    const val = Number(e.target.value);
    setMonthIdx(val);
    if (val >= 6 && beat < 3 && selectedFingerprint === 'water-ice') {
      setBeat(3);
      onUnlockStamp4();
    } else if (val >= 8 && beat < 3) {
      setBeat(3);
    } else if (beat < 2) {
      setBeat(2);
    }
  };

  const handleAdvanceBeat = () => {
    if (beat === 0) {
      setFalseColor(true);
      setBeat(1);
    } else if (beat === 1) {
      setFalseColor(true);
      setBeat(2);
      setMonthIdx(4);
    } else if (beat === 2) {
      setSelectedFingerprint('water-ice');
      setMonthIdx((prev) => Math.max(prev, 7));
      setBeat(3);
      onUnlockStamp4();
    } else if (beat === 3) {
      setSelectedFingerprint('water-ice');
      setMonthIdx(10);
      setBeat(4);
      onUnlockStamp4();
    }
  };

  const bottomPrompt =
    beat <= 1
      ? 'switch from black and white to colour'
      : "Light fingerprint: Match the crater's fingerprint.";

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-start">
        {/* Left Column: TEST 04 HUD Frame + Timeline Slider Card */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <div className="relative w-full lg:w-[103%] z-10">
            <div className="relative w-full pt-3.5 pb-5 px-4 sm:px-6">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 600 300"
                preserveAspectRatio="none"
              >
                <path
                  d="M 14 2 L 88 2 Q 94 2 98 7 L 106 16 Q 110 20 116 20 L 584 20 Q 598 20 598 34 L 598 282 Q 598 296 584 296 L 42 296 Q 35 296 30 290 L 24 282 Q 20 278 14 278 L 10 278 Q 2 278 2 268 L 2 14 Q 2 2 14 2 Z"
                  fill="rgba(5, 9, 22, 0.78)"
                  stroke="#F7961D"
                  strokeOpacity="0.78"
                  strokeWidth="1.4"
                />
              </svg>

              <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[11px] sm:text-xs md:text-[13px] font-exo2 font-medium uppercase tracking-wider text-[#F7961D]">
                    TEST 04
                  </span>
                  <h3 className="mt-0.5 text-lg sm:text-xl md:text-[23px] lg:text-[25px] font-bold font-orbitron text-white tracking-wide leading-tight">
                    Is it really ice?
                  </h3>
                </div>
              </div>

              {/* Inner HiRISE Viewport */}
              <div className="relative z-10 rounded-2xl border border-white/30 bg-[#050a18]/85 overflow-hidden">
                {beat <= 1 ? (
                  <div
                    onClick={() => handleToggleColor(!falseColor)}
                    className="relative w-full h-[185px] sm:h-[205px] md:h-[215px] cursor-pointer"
                  >
                    <WaterIceCraterCanvas falseColor={falseColor} monthProgress={0} />
                    <div className="absolute top-2.5 left-3 px-2.5 py-0.5 rounded-full bg-black/65 border border-white/25 text-[10px] font-exo2 tracking-wide text-white/90 pointer-events-none">
                      {falseColor ? 'HiRISE · Colour Mode' : 'HiRISE · Black & White'}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[195px] sm:h-[215px]">
                    <div className="sm:col-span-5 relative h-[145px] sm:h-full border-b sm:border-b-0 sm:border-r border-white/15">
                      <WaterIceCraterCanvas
                        falseColor
                        monthProgress={monthProgress}
                        showTarget
                      />
                      <div className="absolute top-2 left-2.5 px-2 py-0.5 rounded-full bg-black/70 border border-white/25 text-[10px] font-exo2 text-white/90 pointer-events-none">
                        {currentMonthLabel}
                      </div>
                    </div>
                    <div className="sm:col-span-7">
                      <LightFingerprintMatcher
                        selectedId={selectedFingerprint}
                        onSelect={handleSelectFingerprint}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom-left prompt bar inside TEST 04 matching reference */}
                <div className="px-4 py-2 border-t border-white/15 bg-[#040816]/90 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (beat <= 1) handleToggleColor(!falseColor);
                    }}
                    className={`text-left text-[11px] sm:text-xs font-exo2 transition-colors ${
                      beat <= 1
                        ? 'text-white/85 hover:text-[#F7961D] cursor-pointer'
                        : 'text-white/85 cursor-default'
                    }`}
                  >
                    {bottomPrompt}
                  </button>

                  {beat <= 1 ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleColor(!falseColor)}
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-exo2 transition-all cursor-pointer ${
                          falseColor
                            ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200'
                            : 'border-white/35 text-white/80 hover:border-[#F7961D] hover:text-white'
                        }`}
                      >
                        {falseColor ? 'Colour ON' : 'Black & White'}
                      </button>
                      {beat === 1 && (
                        <button
                          type="button"
                          onClick={handleAdvanceBeat}
                          className="px-2.5 py-0.5 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  ) : (
                    selectedFingerprint === 'water-ice' && (
                      <span className="px-2.5 py-0.5 rounded-full border border-emerald-400/60 bg-emerald-500/15 text-emerald-200 text-[10px] font-exo2 shrink-0">
                        H₂O Matched
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Slider Card shown in beats 2–3 matching reference slate card */}
          {(beat === 2 || beat === 3) && (
            <div className="mt-2.5 w-full sm:w-[76%] md:w-[66%] rounded-xl border border-white/25 bg-[#464e62]/90 backdrop-blur-md px-4 py-2.5 shadow-xl inv-fade-up">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-exo2 text-xs sm:text-[13px] text-white">
                  If this is ice, what happens over months?
                </div>
                <span className="text-[10px] font-mono text-cyan-200/90 shrink-0">
                  {currentMonthLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-md overflow-hidden border border-white/60 bg-[#120e22]">
                    <WaterIceCraterCanvas falseColor monthProgress={0} compact />
                  </div>
                  <span className="text-[10px] font-exo2 text-white/90 mt-1">Feb 2022</span>
                </div>

                <div className="relative flex-1 h-5 flex items-center">
                  <div className="w-full h-1.5 rounded-full bg-[#1e293b]/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5b8def] to-[#93c5fd]"
                      style={{ width: `${monthProgress}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-3.5 rounded-full bg-white shadow-md pointer-events-none"
                    style={{ left: `${monthProgress}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={monthIdx}
                    onChange={handleMonthSlider}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    aria-label="Time-lapse ice sublimation slider from Feb 2022 to Dec 2022"
                  />
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-md overflow-hidden border border-white/40 bg-[#120e22]">
                    <WaterIceCraterCanvas falseColor monthProgress={100} compact />
                  </div>
                  <span className="text-[10px] font-exo2 text-white/90 mt-1">Dec 2022</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: NEXUS Dialogue + Trust Meter */}
        <NexusSidePanel
          robotImage={
            beat === 0
              ? '/robot-amazed.png'
              : beat >= 3
              ? '/robot-front.png'
              : '/robot-investigate-page.png'
          }
          showTrustMeter
          confidenceChoice={confidenceChoice}
          onChangeConfidence={onChangeConfidence}
          onClickDialogue={beat < 4 ? handleAdvanceBeat : undefined}
        >
          {beat === 0 && (
            <div className="space-y-1.5">
              <p>Could be bright rock.</p>
              <p>How would we tell?</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleColor(true);
                }}
                className="mt-1 inline-flex items-center gap-1 text-xs text-[#F7961D] hover:underline cursor-pointer"
              >
                <span>Switch to Colour →</span>
              </button>
            </div>
          )}

          {beat === 1 && (
            <div className="space-y-1.5">
              <p>In this colour mode, ice looks</p>
              <p>blue-white.</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvanceBeat();
                }}
                className="mt-1 inline-flex items-center gap-1 text-xs text-[#F7961D] hover:underline cursor-pointer"
              >
                <span>Check light fingerprint →</span>
              </button>
            </div>
          )}

          {beat === 2 && (
            <div className="space-y-1">
              <p>Nobody touched it.</p>
              <p>Scientists say the evidence</p>
              <p>is consistent with water ice.</p>
              <p>That&apos;s careful wording</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvanceBeat();
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#F7961D] hover:underline cursor-pointer"
              >
                <span>Verify &amp; continue →</span>
              </button>
            </div>
          )}

          {(beat === 3 || beat === 4) && (
            <div className="space-y-2">
              <p>
                It&apos;s the lowest-latitude ice exposed by an impact seen on Mars.
              </p>
              {beat === 3 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceBeat();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Stamp Case Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCaseBoard();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Open Case Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </NexusSidePanel>
      </div>

      {/* Bottom Case Board Stamp Strip appears on Frame 6 (beat === 4) with all 4 stamps */}
      {beat === 4 && (
        <CaseBoardStrip
          earnedStampIds={earnedStampIds}
          onOpenCaseBoard={onOpenCaseBoard}
        />
      )}
    </div>
  );
}
