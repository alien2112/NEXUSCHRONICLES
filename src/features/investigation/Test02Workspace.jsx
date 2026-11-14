import { useState, useRef, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import TrustMeter from './TrustMeter';
import { TestHudFrame, NexusSidePanel } from './WorkspaceLayout';
import siteContent from '../../data/siteContent.json';

const invCopy = siteContent.investigation;
const test2Copy = invCopy.test02;

/**
 * Orbital Mars Context Camera (CTX) Canvas for Test 02:
 * Renders matching Amazonis Planitia terrain for Before & After 11 February 2022,
 * with the fresh 150 m dark-rayed impact crater appearing ONLY on the After image.
 */
function ContextCameraCanvas({ variant = 'before', craterCircled = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 360;
    const height = 210;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep space-navy CTX orbital terrain matching dark HUD aesthetic
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#070c1e');
    bg.addColorStop(0.5, '#0b1228');
    bg.addColorStop(1, '#050918');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle geological ridges / wind streaks identical in both Before & After
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1.1;
    for (let r = 0; r < 9; r++) {
      ctx.beginPath();
      const y0 = 18 + r * 22;
      ctx.moveTo(0, y0);
      ctx.bezierCurveTo(width * 0.35, y0 - 8, width * 0.65, y0 + 9, width, y0 - 3);
      ctx.stroke();
    }

    // Fine CTX surface grain + pre-existing tiny old craters (identical on both sides)
    for (let i = 0; i < 180; i++) {
      const sx = ((Math.sin(i * 12.9898) + 1) * 0.5) * width;
      const sy = ((Math.cos(i * 78.233) + 1) * 0.5) * height;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(203, 213, 225, 0.055)' : 'rgba(3, 6, 14, 0.22)';
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 2) + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const oldCraters = [
      { x: 64, y: 74, r: 9 },
      { x: 288, y: 52, r: 7 },
      { x: 112, y: 164, r: 6 },
      { x: 302, y: 162, r: 10 },
    ];
    oldCraters.forEach((c) => {
      ctx.fillStyle = 'rgba(4, 7, 16, 0.68)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 198, 224, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, -Math.PI * 0.8, Math.PI * 0.1);
      ctx.stroke();
    });

    // NEW impact crater appears ONLY in After 11 February 2022
    if (variant === 'after') {
      const cx = width * 0.58;
      const cy = height * 0.55;

      // Dark ejecta rays radiating outward
      const angles = [0.15, 0.68, 1.15, 1.72, 2.3, 2.95, 3.55, 4.18, 4.88, 5.55];
      angles.forEach((ang, idx) => {
        const len = 46 + (idx % 3) * 18;
        const grad = ctx.createLinearGradient(
          cx,
          cy,
          cx + Math.cos(ang) * len,
          cy + Math.sin(ang) * len
        );
        grad.addColorStop(0, 'rgba(2, 4, 10, 0.94)');
        grad.addColorStop(0.55, 'rgba(6, 10, 22, 0.48)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang - 0.25) * 8, cy + Math.sin(ang - 0.25) * 8);
        ctx.lineTo(cx + Math.cos(ang - 0.08) * len, cy + Math.sin(ang - 0.08) * len);
        ctx.lineTo(cx + Math.cos(ang + 0.08) * len, cy + Math.sin(ang + 0.08) * len);
        ctx.lineTo(cx + Math.cos(ang + 0.25) * 8, cy + Math.sin(ang + 0.25) * 8);
        ctx.closePath();
        ctx.fill();
      });

      // Crater bowl & subtle bright rim
      const bowl = ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, 16);
      bowl.addColorStop(0, '#02040a');
      bowl.addColorStop(0.65, '#0b1020');
      bowl.addColorStop(0.9, '#64748b');
      bowl.addColorStop(1, 'rgba(100, 116, 139, 0)');
      ctx.fillStyle = bowl;
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();

      if (craterCircled) {
        ctx.strokeStyle = '#F7961D';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [variant, craterCircled]);

  return (
    <canvas
      role="img"
      aria-label={
        variant === 'after'
          ? `${test2Copy.afterAriaPrefix}${craterCircled ? test2Copy.afterCircledSuffix : ''}`
          : test2Copy.beforeAriaLabel
      }
      ref={canvasRef}
      className="w-full h-full block object-cover"
    />
  );
}

const TEST2_HINTS = test2Copy.hints;
const TEST2_CLUE_CARDS = test2Copy.clueCards;

/**
 * TEST 02: Something new, at the right place and time?
 */
export function Test02Workspace({
  confidenceChoice,
  onChangeConfidence,
  onUnlockStamp2,
  onComplete,
}) {
  const [beat, setBeat] = useState(0); // 0..7
  const [hintCount, setHintCount] = useState(0); // 0..3
  const [wipePos, setWipePos] = useState(50);
  const [craterCircled, setCraterCircled] = useState(false);
  const [selectedClues, setSelectedClues] = useState([]);
  const [clueFeedback, setClueFeedback] = useState(null);
  const [whatElseInput, setWhatElseInput] = useState('');

  const handleRevealHint = (e) => {
    e?.stopPropagation();
    setHintCount((prev) => (prev < 3 ? prev + 1 : 3));
  };

  const handleCircleCrater = () => {
    setCraterCircled(true);
    if (beat < 2) {
      setBeat(2);
    } else if (beat === 2) {
      setBeat(3);
    } else if (beat === 3) {
      setBeat(4);
    }
  };

  const handleToggleClue = (id) => {
    if (beat >= 6) return;
    setClueFeedback(null);
    const next = selectedClues.includes(id)
      ? selectedClues.filter((item) => item !== id)
      : [...selectedClues, id];
    setSelectedClues(next);
    if (next.includes('place') && next.includes('time') && !next.includes('looks')) {
      setBeat((b) => (b < 5 ? 5 : b));
      onUnlockStamp2?.();
    } else if (next.includes('looks') && next.length >= 2) {
      setClueFeedback(test2Copy.clueLooksFeedback);
    }
  };

  const handleAdvanceBeat = () => {
    if (beat === 0) {
      setBeat(1);
    } else if (beat === 1) {
      setCraterCircled(true);
      setBeat(2);
    } else if (beat === 2) {
      setBeat(3);
    } else if (beat === 3) {
      setBeat(4);
    } else if (beat === 4) {
      setSelectedClues(['place', 'time']);
      setBeat(5);
      onUnlockStamp2?.();
    } else if (beat === 5) {
      setBeat(6);
      onUnlockStamp2?.();
    } else if (beat === 6) {
      setBeat(7);
      onUnlockStamp2?.();
    }
  };

  const [isSliding, setIsSliding] = useState(false);

  const handleWipeMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setWipePos(pct);
    if (beat === 0) setBeat(1);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-start">
        {/* LEFT COLUMN: TEST 02 Chamfered HUD + Optional "What else would you check?" below */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <TestHudFrame
            title={test2Copy.title}
          >
            {beat <= 3 ? (
              <div className="flex flex-col min-h-[205px] sm:min-h-[218px] justify-between">
                {/* Side-by-side Context Camera Viewports + Interactive Slide */}
                <div
                  onMouseEnter={() => setIsSliding(true)}
                  onMouseLeave={() => setIsSliding(false)}
                  onMouseMove={handleWipeMove}
                  onTouchMove={handleWipeMove}
                  className="relative grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4"
                >
                  {/* BEFORE Card */}
                  <div className="relative h-[156px] sm:h-[172px] rounded-2xl border border-white/30 bg-[#050918]/75 overflow-hidden">
                    <div
                      className="w-full h-full transition-opacity duration-150"
                      style={{ opacity: isSliding ? Math.max(0.45, (100 - wipePos * 0.4) / 100) : 1 }}
                    >
                      <ContextCameraCanvas variant="before" />
                    </div>
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center px-3.5 py-0.5 rounded-full border border-white/45 bg-[#050a1c]/80 text-[10.5px] sm:text-[11px] font-exo2 text-white/95">
                      {test2Copy.beforeBadge}
                    </div>
                  </div>

                  {/* AFTER Card (Clickable to circle the fresh crater) */}
                  <button
                    type="button"
                    onClick={handleCircleCrater}
                    className={`relative h-[156px] sm:h-[172px] rounded-2xl border bg-[#050918]/75 overflow-hidden text-left transition-all cursor-crosshair ${
                      craterCircled
                        ? 'border-[#F7961D] shadow-[0_0_16px_rgba(247,150,29,0.3)]'
                        : 'border-white/30 hover:border-[#F7961D]/75'
                    }`}
                    title={test2Copy.afterTitle}
                  >
                    <ContextCameraCanvas variant="after" craterCircled={craterCircled} />

                    <div className="absolute top-3 left-3 z-10 inline-flex items-center px-3.5 py-0.5 rounded-full border border-white/45 bg-[#050a1c]/80 text-[10.5px] sm:text-[11px] font-exo2 text-white/95">
                      {test2Copy.afterBadge}
                    </div>
                  </button>

                  {/* Subtle wipe hairline indicator only while sliding */}
                  {isSliding && (
                    <div
                      className="hidden sm:block absolute top-1 bottom-1 w-[1.5px] bg-[#F7961D]/70 shadow-[0_0_8px_rgba(247,150,29,0.6)] pointer-events-none z-20"
                      style={{ left: `${wipePos}%` }}
                    />
                  )}
                </div>

                {/* Bottom Instruction Row + Hint Pill (No horizontal divider line, matching screenshots) */}
                <div className="mt-3.5 pt-0.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCircleCrater}
                    className="flex items-center gap-2 text-left cursor-pointer group"
                  >
                    <span className="w-4 h-4 rounded-full border border-[#F7961D] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Crosshair className="w-2.5 h-2.5 text-[#F7961D]" strokeWidth={2.4} />
                    </span>
                    <span className="font-exo2 text-[11px] sm:text-xs text-white/90">
                      {test2Copy.slideInstruction}
                    </span>
                  </button>

                  {beat >= 1 && (
                    <button
                      type="button"
                      onClick={handleRevealHint}
                      className="px-5 py-0.5 rounded-full border border-white/55 hover:border-[#F7961D] bg-[#070d22]/85 hover:bg-[#F7961D]/20 text-white font-exo2 text-xs transition-all cursor-pointer shrink-0"
                    >
                      {test2Copy.hintButtonLabel}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* CLUE MATCH VIEW (beat 4..7) */
              <div className="flex flex-col justify-center min-h-[205px] sm:min-h-[218px] py-1">
                <h4 className="text-center font-exo2 font-medium text-white text-xs sm:text-sm md:text-[16px] tracking-wide mb-3.5 sm:mb-4">
                  {test2Copy.clueMatchHeading}
                </h4>

                <div className="w-full max-w-[540px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
                  {TEST2_CLUE_CARDS.map((card) => {
                    const isSelected = selectedClues.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleToggleClue(card.id)}
                        style={{
                          backgroundColor: isSelected ? '#a6c6ea' : 'rgba(5, 10, 26, 0.88)',
                          borderColor: isSelected ? '#c8dff7' : 'rgba(255, 255, 255, 0.45)',
                        }}
                        className={`min-h-[132px] sm:min-h-[144px] rounded-2xl border px-3.5 py-3.5 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'text-[#071022] shadow-[0_0_18px_rgba(166,198,234,0.28)]'
                            : 'hover:!border-[#F7961D] text-white'
                        }`}
                      >
                        <span
                          className={`font-exo2 font-semibold text-xs sm:text-[13.5px] tracking-wider uppercase mb-2 ${
                            isSelected ? 'text-[#071022]' : 'text-[#F7961D]'
                          }`}
                        >
                          {card.title}
                        </span>
                        <div
                          className={`font-exo2 text-[11.5px] sm:text-xs md:text-[13px] leading-[1.35] ${
                            isSelected ? 'text-[#071022] font-medium' : 'text-white/95'
                          }`}
                        >
                          {card.lines.map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {clueFeedback && (
                  <p className="mt-3 text-center text-[11px] font-exo2 text-[#F7961D]">
                    {clueFeedback}
                  </p>
                )}
              </div>
            )}
          </TestHudFrame>

          {/* BEAT 6 INPUT BELOW TEST 02: "What else would you check?" (Matches Image 12) */}
          {beat === 6 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBeat(7);
                onUnlockStamp2?.();
              }}
              className="mt-3 w-full max-w-[390px] rounded-2xl bg-[#3c4358]/68 backdrop-blur-md border border-white/40 px-5 py-3 shadow-xl inv-fade-up"
            >
              <label htmlFor="additional-evidence" className="block text-center font-exo2 text-xs sm:text-[14px] text-white mb-2">
                {test2Copy.whatElseLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  id="additional-evidence"
                  type="text"
                  value={whatElseInput}
                  onChange={(e) => setWhatElseInput(e.target.value)}
                  placeholder={test2Copy.whatElsePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#161c32]/85 border border-white/35 focus:border-[#F7961D]/75 text-xs sm:text-[13px] text-white font-exo2 placeholder:text-white/55 outline-none pr-9"
                />
                {whatElseInput.trim().length > 0 && (
                  <button
                    type="submit"
                    className="absolute right-1.5 px-2 py-1 rounded-lg bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-[11px] transition-colors cursor-pointer"
                    title={test2Copy.whatElseSubmitTitle}
                  >
                    ↵
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: NEXUS Speech Box + Hint Button + Progressive Hints (Aligned & Sized like Images 3-13) */}
        <NexusSidePanel
          robotImage={invCopy.robotImages.investigate}
          onClickDialogue={beat < 7 ? handleAdvanceBeat : undefined}
          actionPill={
            <button
              type="button"
              onClick={handleRevealHint}
              className="px-5 py-0.5 rounded-full border border-white/55 hover:border-[#F7961D] bg-[#081028]/90 hover:bg-[#F7961D]/20 text-white font-exo2 text-xs transition-all cursor-pointer"
              title={test2Copy.hintButtonTitle}
            >
              {test2Copy.hintButtonLabel}
            </button>
          }
          hints={TEST2_HINTS}
          hintCount={hintCount}
          align="start"
          topOffsetClassName="lg:mt-[50px]"
          outerMinHeightClassName="min-h-[272px] sm:min-h-[288px]"
        >
          {(beat <= 1
            ? test2Copy.beats.intro
            : beat === 2
            ? test2Copy.beats.spotted
            : beat === 3 || beat === 4
            ? test2Copy.beats.question
            : beat === 5
            ? test2Copy.beats.linked
            : test2Copy.beats.orbiter
          ).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </NexusSidePanel>
      </div>

      {/* FINAL BEAT (beat === 7): Trust Meter + Continue button */}
      {beat === 7 && (
        <div className="mt-2.5 w-full flex flex-col sm:flex-row items-stretch sm:items-end justify-end gap-4 inv-fade-up">
          <TrustMeter
            value={confidenceChoice}
            onChange={onChangeConfidence}
            variant="slate"
            className="mt-0 w-full sm:w-[360px]"
          />
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer shadow-[0_0_16px_rgba(247,150,29,0.35)] shrink-0 self-end"
          >
            <span>{test2Copy.continueLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

