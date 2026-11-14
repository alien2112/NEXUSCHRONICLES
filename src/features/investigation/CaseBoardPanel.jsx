import Modal from '../../components/Modal';
import { useState, useRef, useEffect } from 'react';
import { activateOnKeyboard } from '../../utils/keyboard';
import confetti from 'canvas-confetti';
import {
  Check,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  UserRound,
  Sparkles,
  X,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import {
  CASE_STAMPS,
  CASE_SUSPECTS,
  TRUST_OPTIONS,
  VERDICT_SLOTS,
  VERDICT_PARTS,
} from './investigationData';
import siteContent from '../../data/siteContent.json';

const invCopy = siteContent.investigation;
const cbCopy = invCopy.caseBoard;

/**
 * Compact 4-slot chamfered Case Board stamp strip shown beneath Tests 01–04 as stamps are earned.
 */
export function CaseBoardStrip({
  earnedStampIds,
  onOpenCaseBoard,
  actionLabel = cbCopy.stripDefaultAction,
  className = 'mt-3',
}) {
  return (
    <div className={`${className} relative w-full h-full pt-2 pb-2.5 px-4 sm:px-5 inv-fade-up flex flex-col justify-between`}>
      {/* Chamfered HUD Border matching the reference Case Board */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 132"
        preserveAspectRatio="none"
      >
        <path
          d="M 14 2 L 138 2 L 160 22 L 784 22 Q 798 22 798 36 L 798 118 Q 798 130 784 130 L 16 130 Q 2 130 2 116 L 2 14 Q 2 2 14 2 Z"
          fill="rgba(4, 9, 27, 0.88)"
          stroke="#F7961D"
          strokeOpacity="0.78"
          strokeWidth="1.4"
        />
      </svg>

      <div className="relative z-10 flex items-start justify-between mb-2">
        <span className="font-exo2 font-semibold text-xs sm:text-[14px] text-[#F7961D] tracking-wide pt-0.5">
          {cbCopy.stripTitle}
        </span>
        {onOpenCaseBoard && (earnedStampIds.length >= 4 || actionLabel !== cbCopy.stripDefaultAction) && (
          <button
            type="button"
            onClick={onOpenCaseBoard}
            className="mt-3 text-[11px] font-exo2 font-semibold text-[#F7961D] hover:text-[#ffb454] hover:underline cursor-pointer transition-colors leading-none"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        {CASE_STAMPS.map((stamp) => {
          const unlocked = earnedStampIds.includes(stamp.id);
          return (
            <div
              key={stamp.id}
              className={`h-[56px] sm:h-[62px] rounded-xl border flex items-center justify-center px-1.5 overflow-hidden transition-all duration-300 ${
                unlocked
                  ? 'border-white/30 bg-[#04091a]/90'
                  : 'border-white/25 bg-[#04091a]/75'
              }`}
            >
              {unlocked ? (
                <div className="-rotate-[18deg] border-[1.5px] border-[#F7961D] rounded-[3px] px-2 py-0.5 text-[9px] sm:text-[9.5px] font-exo2 font-bold text-[#F7961D] tracking-wider text-center leading-[1.15] whitespace-nowrap shadow-[0_0_12px_rgba(247,150,29,0.22)] bg-[#060b1d]/90">
                  {stamp.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mapConfidenceToTrustOption = (val) => {
  if (val < 0.15) return TRUST_OPTIONS[0];
  if (val < 0.4) return TRUST_OPTIONS[1];
  if (val < 0.65) return TRUST_OPTIONS[2];
  if (val < 0.85) return TRUST_OPTIONS[3];
  return TRUST_OPTIONS[4];
};

/**
 * Full Step 5 Case Board view matching the Suspect strip, NEXUS confidence check (C0..C1),
 * interactive Verdict Builder (Observation / Evidence / Interpretation / Conclusion),
 * and Next Case (Open Case 1222).
 */
export default function CaseBoardView({
  codename,
  initialConfidence,
  confidenceChoice,
  onChangeConfidence,
  earnedStampIds,
  initialPlacedParts = {},
  onPlacedPartsChange,
  onGoDeeper,
  onGoTechnical,
  onSurvivalProtocol,
  onRestart,
  onExit,
}) {
  const displayName = codename.trim() || cbCopy.defaultCodename;

  // Confidence slider state (0..1 between C0 and C1)
  const [confidenceValue, setConfidenceValue] = useState(
    () =>
      ({
        [TRUST_OPTIONS[0].label]: 0.08,
        [TRUST_OPTIONS[1].label]: 0.25,
        [TRUST_OPTIONS[2].label]: 0.5,
        [TRUST_OPTIONS[3].label]: 0.75,
        [TRUST_OPTIONS[4].label]: 0.95,
      })[confidenceChoice] ?? 0.08
  );
  const [confidencePhase, setConfidencePhase] = useState('initial'); // 'initial' | 'dragging' | 'settled'
  const settleTimerRef = useRef(null);

  // Suspect strip inspection state
  const [inspectedSuspect, setInspectedSuspect] = useState(null);

  // Verdict Builder drag & click placement state
  const [placedParts, setPlacedParts] = useState(initialPlacedParts); // { [slotId]: partId }
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [draggingPartId, setDraggingPartId] = useState(null);
  const [dragOverSlotId, setDragOverSlotId] = useState(null);
  const [slotFeedback, setSlotFeedback] = useState(null); // { type: 'error' | 'success', message: string }
  // Stamps drawer & Case 1222 modal
  const [showStampsModal, setShowStampsModal] = useState(false);
  const [showCase1222Modal, setShowCase1222Modal] = useState(false);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const placedPartIds = Object.values(placedParts);
  const remainingParts = VERDICT_PARTS.filter((p) => !placedPartIds.includes(p.id));
  const correctSlotCount = VERDICT_SLOTS.filter(
    (slot) => placedParts[slot.id] === slot.correctPartId
  ).length;
  const isVerdictComplete = correctSlotCount === VERDICT_SLOTS.length;

  const commitConfidence = (val) => {
    setConfidencePhase('settled');
    if (onChangeConfidence) {
      onChangeConfidence(mapConfidenceToTrustOption(val));
    }
  };

  const handleSliderChange = (e) => {
    const nextVal = parseFloat(e.target.value);
    setConfidenceValue(nextVal);
    setConfidencePhase('dragging');
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      commitConfidence(nextVal);
    }, 350);
  };

  const handleSliderRelease = () => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    commitConfidence(confidenceValue);
  };

  const assignPartToSlot = (partId, slotId) => {
    if (!partId || !slotId) return;
    const slot = VERDICT_SLOTS.find((s) => s.id === slotId);
    const part = VERDICT_PARTS.find((p) => p.id === partId);
    if (!slot || !part) return;

    if (part.targetSlot !== slotId) {
      setSlotFeedback({
        type: 'error',
        message: `${cbCopy.verdictBuilder.errorPrefix} "${slot.label.replace(':', '')}" — ${slot.hint}`,
      });
      setSelectedPartId(null);
      return;
    }

    const nextPlaced = {
      ...placedParts,
      [slotId]: partId,
    };
    setPlacedParts(nextPlaced);
    onPlacedPartsChange?.(nextPlaced);
    setSelectedPartId(null);
    setSlotFeedback({
      type: 'success',
      message: `${slot.label.replace(':', '')} ${cbCopy.verdictBuilder.lockedInSuffix}`,
    });

    const allCorrect = VERDICT_SLOTS.every(
      (s) => nextPlaced[s.id] === s.correctPartId
    );
    if (allCorrect) {
      try {
        confetti({
          disableForReducedMotion: true,
          particleCount: 55,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#F7961D', '#ffffff', '#60a5fa'],
        });
      } catch {
        // Ignore confetti errors in headless/restricted environments
      }
    }
  };

  const handleRemoveFromSlot = (slotId) => {
    setPlacedParts((prev) => {
      const next = { ...prev };
      delete next[slotId];
      onPlacedPartsChange?.(next);
      return next;
    });
    setSlotFeedback(null);
  };

  const handleResetVerdict = () => {
    setPlacedParts({});
    onPlacedPartsChange?.({});
    setSelectedPartId(null);
    setSlotFeedback(null);
  };

  // Determine NEXUS dialogue and robot image based on state
  const isHighConfidence = confidenceValue >= 0.65;
  let nexusMessage = cbCopy.nexusMessages.initial;
  let robotImage = invCopy.robotImages.investigate;

  if (isVerdictComplete) {
    nexusMessage = cbCopy.nexusMessages.verdictComplete.replace('{name}', displayName);
    robotImage = invCopy.robotImages.front;
  } else if (confidencePhase === 'settled') {
    if (isHighConfidence) {
      nexusMessage = cbCopy.nexusMessages.highConfidence;
      robotImage = invCopy.robotImages.front;
    } else {
      nexusMessage = cbCopy.nexusMessages.lowConfidence;
      robotImage = invCopy.robotImages.amazed;
    }
  }

  const sliderPct = Math.round(confidenceValue * 100);
  const activeSuspectInfo = CASE_SUSPECTS.find((s) => s.id === inspectedSuspect);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* MAIN 2-COLUMN CASE BOARD GRID */}
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: Suspect strip + Verdict Builder                   */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 1. SUSPECT STRIP (Chamfered HUD frame matching screenshots) */}
          <div className="relative w-full pt-4 pb-5 px-5 sm:px-7">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
            >
              <path
                d="M 14 2 L 154 2 Q 162 2 167 7 L 176 16 Q 181 20 189 20 L 584 20 Q 598 20 598 34 L 598 182 Q 598 196 584 196 L 448 196 Q 440 196 435 202 L 427 212 Q 422 218 414 218 L 16 218 Q 2 218 2 204 L 2 14 Q 2 2 14 2 Z"
                fill="rgba(5, 9, 24, 0.84)"
                stroke="#F7961D"
                strokeOpacity="0.8"
                strokeWidth="1.4"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <h3 className="font-exo2 font-semibold text-base sm:text-lg text-white tracking-wide">
                {cbCopy.suspectStripTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowStampsModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F7961D]/12 border border-[#F7961D]/50 text-[#F7961D] text-[11px] font-exo2 font-medium hover:bg-[#F7961D]/20 transition-colors cursor-pointer"
              >
                <Award className="w-3 h-3" />
                <span>{earnedStampIds.length}{cbCopy.stampsSuffix}</span>
              </button>
            </div>

            {/* A / B / C Suspect Boxes */}
            <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-[460px] mx-auto pb-1">
              {CASE_SUSPECTS.map((suspect) => {
                const isSelected = inspectedSuspect === suspect.id;
                return (
                  <button
                    key={suspect.id}
                    type="button"
                    onClick={() =>
                      setInspectedSuspect((prev) => (prev === suspect.id ? null : suspect.id))
                    }
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                    title={`${suspect.id}: ${suspect.name} (${suspect.status})`}
                  >
                    <div
                      className={`w-[72px] h-[64px] sm:w-[88px] sm:h-[76px] rounded-xl border flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-[#F7961D] bg-[#0b1536] shadow-[0_0_16px_rgba(247,150,29,0.28)]'
                          : 'border-white/25 bg-[#050b1f]/90 group-hover:border-[#F7961D]/65'
                      }`}
                    >
                      <span className="font-exo2 font-semibold text-2xl sm:text-3xl text-white">
                        {suspect.id}
                      </span>
                    </div>

                    <div
                      className={`mt-2 inline-flex items-center gap-1 font-exo2 text-sm sm:text-base font-medium ${
                        suspect.alive ? 'text-[#F7961D]' : 'text-white/95'
                      }`}
                    >
                      {suspect.alive && <Check className="w-4 h-4 text-[#F7961D] stroke-[2.6]" />}
                      <span>{suspect.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeSuspectInfo && (
              <div className="relative z-10 mt-3 rounded-xl border border-white/15 bg-[#070e24]/90 px-3.5 py-2 text-left text-xs font-exo2 text-white/85 flex items-center justify-between gap-2 inv-fade-up">
                <div>
                  <span className="text-[#F7961D] font-semibold">
                    {cbCopy.suspectPrefix} {activeSuspectInfo.id} ({activeSuspectInfo.name}):
                  </span>{' '}
                  {activeSuspectInfo.summary}
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedSuspect(null)}
                  className="text-white/50 hover:text-white shrink-0 cursor-pointer"
                  aria-label={cbCopy.closeSuspectNoteAriaLabel}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 2. VERDICT BUILDER */}
          <div className="rounded-[18px] border border-white/25 bg-[#050b1f]/90 backdrop-blur-md p-4 sm:p-5 text-left shadow-[0_14px_36px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-exo2 font-bold text-base sm:text-lg text-[#F7961D] leading-tight">
                  {cbCopy.verdictBuilder.title}
                </h3>
                <p className="text-xs sm:text-[13px] font-exo2 text-white/85 mt-0.5">
                  {cbCopy.verdictBuilder.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-white/60">
                  {correctSlotCount}/{VERDICT_SLOTS.length}
                </span>
                {Object.keys(placedParts).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetVerdict}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/20 hover:border-white/50 text-[11px] font-exo2 text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{cbCopy.verdictBuilder.resetLabel}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Drop Slots: Observation, Evidence, Interpretation, Conclusion */}
            <div className="space-y-2.5">
              {VERDICT_SLOTS.map((slot) => {
                const placedPartId = placedParts[slot.id];
                const placedPart = VERDICT_PARTS.find((p) => p.id === placedPartId);
                const isDragTarget = dragOverSlotId === slot.id;
                const isClickableTarget = Boolean(selectedPartId && !placedPart);

                return (
                  <div key={slot.id} className="flex flex-col min-[380px]:flex-row min-[380px]:items-center gap-1.5 min-[380px]:gap-2.5 sm:gap-3">
                    <div className="w-fit min-[380px]:w-[104px] sm:w-[132px] shrink-0 py-1 min-[380px]:py-1.5 px-3 min-[380px]:px-2.5 rounded-full border border-white/25 bg-[#070d20]/90 text-center font-exo2 font-medium text-xs sm:text-[13px] text-[#F7961D]">
                      {slot.label}
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${slot.label} ${placedPart ? `${cbCopy.verdictBuilder.removeAriaPrefix} ${placedPart.text}` : cbCopy.verdictBuilder.placeAriaLabel}`}
                      onKeyDown={e => activateOnKeyboard(e, () => {
                        if (placedPart) handleRemoveFromSlot(slot.id);
                        else if (selectedPartId) assignPartToSlot(selectedPartId, slot.id);
                      })}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverSlotId !== slot.id) setDragOverSlotId(slot.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverSlotId === slot.id) setDragOverSlotId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedId =
                          e.dataTransfer.getData('text/plain') || draggingPartId;
                        setDragOverSlotId(null);
                        setDraggingPartId(null);
                        assignPartToSlot(droppedId, slot.id);
                      }}
                      onClick={() => {
                        if (placedPart) {
                          handleRemoveFromSlot(slot.id);
                        } else if (selectedPartId) {
                          assignPartToSlot(selectedPartId, slot.id);
                        }
                      }}
                      className={`flex-1 min-h-[36px] py-1.5 px-4 rounded-full border transition-all flex items-center justify-between gap-2 ${
                        placedPart
                          ? 'border-[#F7961D]/80 bg-[#F7961D]/12 text-white cursor-pointer hover:bg-[#F7961D]/18'
                          : isDragTarget
                          ? 'border-[#F7961D] bg-[#F7961D]/15 shadow-[0_0_12px_rgba(247,150,29,0.28)]'
                          : isClickableTarget
                          ? 'border-[#F7961D]/65 border-dashed bg-[#0a1433]/85 text-[#F7961D]/90 cursor-pointer'
                          : 'border-white/25 bg-[#060b1d]/85 text-white/40'
                      }`}
                    >
                      {placedPart ? (
                        <>
                          <span className="font-exo2 text-xs sm:text-[13px] text-white">
                            {placedPart.text}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#F7961D] shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        </>
                      ) : (
                        <span className="font-exo2 text-xs sm:text-[13px]">
                          {isClickableTarget ? cbCopy.verdictBuilder.placeSelectedPrompt : cbCopy.verdictBuilder.dragHerePrompt}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Feedback Message */}
            {slotFeedback && (
              <div
                className={`mt-3 rounded-xl px-3 py-1.5 text-xs font-exo2 flex items-center gap-2 ${
                  slotFeedback.type === 'error'
                    ? 'bg-red-500/12 border border-red-400/40 text-red-200'
                    : 'bg-[#F7961D]/12 border border-[#F7961D]/45 text-[#ffd199]'
                }`}
              >
                {slotFeedback.type === 'error' ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F7961D] shrink-0" />
                )}
                <span>{slotFeedback.message}</span>
              </div>
            )}

            {/* Draggable Parts Bank */}
            {remainingParts.length > 0 ? (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {remainingParts.map((part) => {
                    const isSelected = selectedPartId === part.id;
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onKeyDown={e => activateOnKeyboard(e, () => setSelectedPartId(previous => previous === part.id ? null : part.id))}
                        key={part.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', part.id);
                          setDraggingPartId(part.id);
                          setSelectedPartId(part.id);
                        }}
                        onDragEnd={() => {
                          setDraggingPartId(null);
                          setDragOverSlotId(null);
                        }}
                        onClick={() =>
                          setSelectedPartId((prev) => (prev === part.id ? null : part.id))
                        }
                        className={`rounded-xl border px-3 py-2.5 text-center flex items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                          isSelected
                            ? 'border-[#F7961D] bg-[#F7961D]/15 text-white shadow-[0_0_12px_rgba(247,150,29,0.28)]'
                            : 'border-white/25 bg-[#070d20]/90 hover:border-[#F7961D]/70 text-white/90'
                        }`}
                        title={cbCopy.verdictBuilder.partTitle}
                      >
                        <GripVertical className="w-3 h-3 text-white/35 shrink-0 hidden sm:block" />
                        <span className="font-exo2 text-[11.5px] sm:text-xs leading-snug">
                          {part.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[#F7961D]/60 bg-[#F7961D]/12 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 inv-fade-up">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-exo2 text-white">
                  <Sparkles className="w-4 h-4 text-[#F7961D] shrink-0" />
                  <span>
                    <strong className="text-[#F7961D]">{cbCopy.verdictBuilder.completeStrong}</strong> {cbCopy.verdictBuilder.completeBody}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: NEXUS + Your Confidence (C0–C1) + Next Case      */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4 mt-12 sm:mt-16 lg:mt-0 lg:pl-3">
          {/* Outer Faint HUD Frame wrapping NEXUS & Your Confidence */}
          <div className="relative w-full pt-2.5 px-2.5 pb-3.5">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 420 290"
              preserveAspectRatio="none"
            >
              <path
                d="M 14 2 L 155 2 Q 162 2 167 7 L 176 16 Q 180 20 188 20 L 404 20 Q 418 20 418 34 L 418 274 Q 418 288 404 288 L 16 288 Q 2 288 2 274 L 2 14 Q 2 2 14 2 Z"
                fill="rgba(5, 10, 26, 0.34)"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="1.2"
              />
            </svg>

            {/* Inner Orange-Bordered NEXUS Speech Box */}
            <div className="relative z-10 w-full min-h-[126px] sm:min-h-[138px] p-4 sm:p-5">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 140"
                preserveAspectRatio="none"
              >
                <path
                  d="M 14 2 L 145 2 Q 152 2 157 7 L 165 15 Q 170 19 177 19 L 386 19 Q 398 19 398 31 L 398 126 Q 398 138 386 138 L 14 138 Q 2 138 2 126 L 2 14 Q 2 2 14 2 Z"
                  fill="rgba(7, 12, 30, 0.88)"
                  stroke="#F7961D"
                  strokeOpacity="0.82"
                  strokeWidth="1.35"
                />
              </svg>

              <div className="relative z-10 flex items-center gap-1.5 text-[#F7961D] mb-2">
                <UserRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F7961D] shrink-0" strokeWidth={2} />
                <span className="font-exo2 font-semibold text-xs sm:text-sm md:text-[15px] tracking-wider uppercase">
                  {invCopy.nexusSpeakerLabel}
                </span>
              </div>

              <p
                key={nexusMessage}
                className="relative z-10 text-left font-exo2 text-white text-sm sm:text-[15px] md:text-[16px] leading-[1.38] pr-22 sm:pr-28 inv-dialogue-swap"
              >
                {nexusMessage}
              </p>

              {/* Floating NEXUS Robot */}
              <div
                key={robotImage}
                className="
                  absolute
                  -top-[64px] -right-[4px]
                  sm:-top-[86px] sm:-right-[10px]
                  lg:-top-[102px] lg:-right-[14px]
                  w-[112px] sm:w-[155px] lg:w-[186px]
                  pointer-events-none select-none z-20 inv-robot-swap
                "
              >
                <img
                  src={robotImage}
                  alt={invCopy.robotAlt}
                  className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]"
                  draggable={false}
                />
              </div>
            </div>

            {/* Your Confidence C0 -> C1 Slider Card */}
            <div className="relative z-10 mt-3 rounded-2xl border border-white/25 bg-[#050b1f]/88 backdrop-blur-md px-4 py-3.5 sm:px-5 sm:py-4 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="font-exo2 font-medium text-sm sm:text-[15px] text-white tracking-wide">
                  {cbCopy.confidence.title}
                </span>
                <span className="text-[11px] font-mono text-white/55">
                  {confidencePhase === 'initial'
                    ? cbCopy.confidence.initialHint
                    : `${sliderPct}% (${mapConfidenceToTrustOption(confidenceValue)})`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-exo2 text-xs sm:text-[13px] text-white/85 shrink-0">
                  {cbCopy.confidence.minLabel}
                </span>

                <div className="relative flex-1 h-6 flex items-center">
                  <div className="w-full h-[3px] rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-75"
                      style={{ width: `${sliderPct}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] pointer-events-none transition-all duration-75"
                    style={{ left: `${sliderPct}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={confidenceValue}
                    onChange={handleSliderChange}
                    onPointerUp={handleSliderRelease}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    onKeyUp={handleSliderRelease}
                    aria-label={cbCopy.confidence.sliderAriaLabel}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>

                <span className="font-exo2 text-xs sm:text-[13px] text-white/85 shrink-0">
                  {cbCopy.confidence.maxLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Next case: Open Case 1222 Card */}
          <div className="rounded-[18px] border border-[#F7961D]/80 bg-[#060c1f]/90 backdrop-blur-md p-4 sm:p-5 text-left shadow-[0_14px_34px_rgba(0,0,0,0.45)] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-exo2 font-semibold text-base sm:text-lg text-[#F7961D]">
                {cbCopy.nextCase.title}
              </span>
              <span className="text-[11px] font-mono text-white/55">
                {cbCopy.nextCase.badge}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] font-exo2 text-white/80 leading-relaxed">
              {cbCopy.nextCase.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="text-[11px] font-exo2 text-white/60">
                {cbCopy.nextCase.initialLabel} <span className="text-white/90">{initialConfidence || cbCopy.nextCase.notSetLabel}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowCase1222Modal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs sm:text-sm transition-all shadow-[0_0_18px_rgba(247,150,29,0.35)] cursor-pointer active:scale-95"
              >
                <span>{cbCopy.nextCase.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Post-Investigation Exploration Options: Go deeper, Go technical & Survival Protocol */}
          {(onGoDeeper || onGoTechnical || onSurvivalProtocol) && (
            <div className="rounded-[18px] border border-white/25 bg-[#050b1f]/90 backdrop-blur-md p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.45)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-exo2 font-semibold text-sm sm:text-base text-white">
                  {cbCopy.exploreFurther.title}
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  {cbCopy.exploreFurther.badge}
                </span>
              </div>
              <p className="text-xs font-exo2 text-white/75 leading-relaxed">
                {cbCopy.exploreFurther.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                {onGoDeeper && (
                  <button
                    type="button"
                    onClick={onGoDeeper}
                    className="flex items-center justify-between gap-2 px-4 py-2 rounded-full border border-[#F7961D]/80 bg-[#070e24]/90 hover:bg-[#F7961D]/15 text-[#F7961D] hover:text-[#ffb454] text-xs sm:text-[13px] font-exo2 font-semibold transition-all cursor-pointer active:scale-95"
                    title={cbCopy.exploreFurther.goDeeperTitle}
                  >
                    <span>{cbCopy.exploreFurther.goDeeperLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}
                {onGoTechnical && (
                  <button
                    type="button"
                    onClick={onGoTechnical}
                    className="flex items-center justify-between gap-2 px-4 py-2 rounded-full border border-[#F7961D]/80 bg-[#070e24]/90 hover:bg-[#F7961D]/15 text-[#F7961D] hover:text-[#ffb454] text-xs sm:text-[13px] font-exo2 font-semibold transition-all cursor-pointer active:scale-95"
                    title={cbCopy.exploreFurther.goTechnicalTitle}
                  >
                    <span>{cbCopy.exploreFurther.goTechnicalLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}
              </div>

              {onSurvivalProtocol && (
                <div className="mt-1 pt-3 border-t border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-exo2 font-semibold text-xs sm:text-[13px] text-[#4DE2E8]">
                      {cbCopy.exploreFurther.survivalTitle}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#39A9FF]/15 border border-[#4DE2E8]/40 text-[#4DE2E8]">
                      {cbCopy.exploreFurther.survivalBadge}
                    </span>
                  </div>
                  <p className="text-[11px] font-exo2 text-white/70 leading-relaxed">
                    {cbCopy.exploreFurther.survivalDescription}
                  </p>
                  <button
                    type="button"
                    onClick={onSurvivalProtocol}
                    className="flex items-center justify-between gap-2 px-4 py-2 rounded-full border border-[#4DE2E8]/75 bg-[#081532]/90 hover:bg-[#39A9FF]/20 text-[#4DE2E8] text-xs sm:text-[13px] font-exo2 font-semibold transition-all cursor-pointer active:scale-95"
                    title={cbCopy.exploreFurther.survivalTitle}
                  >
                    <span>{cbCopy.exploreFurther.survivalButtonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Compact Case Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 hover:border-white/60 bg-[#050b1f]/80 text-xs font-exo2 text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{cbCopy.actions.replayLabel}</span>
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#F7961D]/55 hover:border-[#F7961D] bg-[#050b1f]/80 text-xs font-exo2 font-medium text-[#F7961D] transition-colors cursor-pointer"
              >
                <span>{cbCopy.actions.exitLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Evidence Stamps Inspection Modal */}
      {showStampsModal && (
        <Modal label={cbCopy.stampsModal.modalLabel} onClose={() => setShowStampsModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md inv-fade-up">
          <div className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#070b18]/95 border border-[#F7961D]/60 p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <h4 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F7961D]" />
                  <span>{cbCopy.stampsModal.title}</span>
                </h4>
                <p className="text-xs font-exo2 text-white/60 mt-0.5">
                  {cbCopy.stampsModal.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStampsModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
                aria-label={cbCopy.stampsModal.closeAriaLabel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {earnedStampIds.length === 0 && <p role="status">{cbCopy.stampsModal.emptyMessage}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CASE_STAMPS.filter(stamp => earnedStampIds.includes(stamp.id)).map((stamp) => (
                <div
                  key={stamp.id}
                  className="rounded-xl border border-[#F7961D]/50 bg-[#081028]/90 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-block border border-[#F7961D] px-2 py-0.5 text-[10px] font-orbitron font-bold text-[#F7961D] tracking-wider">
                      {stamp.label}
                    </span>
                    <span className="text-[10px] font-mono text-white/45">
                      {cbCopy.stampsModal.testPrefix}{stamp.id}
                    </span>
                  </div>
                  <p className="text-xs font-exo2 text-white/85 leading-relaxed">
                    {stamp.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Case 1222 Dossier Preview Modal */}
      {showCase1222Modal && (
        <Modal label={cbCopy.case1222Modal.modalLabel} onClose={() => setShowCase1222Modal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md inv-fade-up">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#070b18]/95 border border-[#F7961D]/75 p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#F7961D]">
                  {cbCopy.case1222Modal.eyebrow}
                </span>
                <h4 className="text-lg sm:text-xl font-orbitron font-bold text-white mt-0.5">
                  {cbCopy.case1222Modal.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCase1222Modal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
                aria-label={cbCopy.case1222Modal.closeAriaLabel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-exo2 text-sm text-white/85 leading-relaxed">
              <p>
                {cbCopy.case1222Modal.leadBeforeDate}<strong className="text-white">{cbCopy.case1222Modal.dateBold}</strong>{cbCopy.case1222Modal.leadBetween}<strong className="text-[#F7961D]">{cbCopy.case1222Modal.magHighlight}</strong>{cbCopy.case1222Modal.leadAfterMag}
              </p>
              <div className="rounded-xl border border-white/15 bg-[#050b1d] p-3.5 text-xs space-y-1.5">
                <div className="text-[#F7961D] font-semibold uppercase tracking-wider">
                  {cbCopy.case1222Modal.previewHeadingPrefix}{displayName}
                </div>
                <p className="text-white/80">
                  {cbCopy.case1222Modal.bullet1BeforeNone}<strong>{cbCopy.case1222Modal.bullet1NoneBold}</strong>{cbCopy.case1222Modal.bullet1AfterNone}
                </p>
                <p className="text-white/80">
                  {cbCopy.case1222Modal.bullet2}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowCase1222Modal(false);
                  onRestart?.();
                }}
                className="px-4 py-2 rounded-full border border-white/25 hover:border-white text-xs font-exo2 text-white transition-colors cursor-pointer"
              >
                {cbCopy.case1222Modal.replayLabel}
              </button>
              {onExit ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowCase1222Modal(false);
                    onExit();
                  }}
                  className="px-4 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {cbCopy.case1222Modal.returnHomeLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCase1222Modal(false)}
                  className="px-4 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {cbCopy.case1222Modal.closeLabel}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
