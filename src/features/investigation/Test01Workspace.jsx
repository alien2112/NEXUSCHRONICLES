import { activateOnKeyboard } from '../../utils/keyboard';
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import TrustMeter from './TrustMeter';
import { TestHudFrame, NexusSidePanel } from './WorkspaceLayout';
import siteContent from '../../data/siteContent.json';

const invCopy = siteContent.investigation;
const test1Copy = invCopy.test01;
const TEST1_HINTS = test1Copy.hints;

/**
 * TEST 01: Real quake or just noise?
 * Matches all uploaded Test 01 reference frames:
 *  - Beat 0: "Mars has wind. Wind shakes sensors too. Which recording is a quake?"
 *  - Beat 1: "drag the label QUAKE onto X or Y." + draggable/clickable orange QUAKE pill
 *  - Beat 2: QUAKE badge dropped onto X or Y; if Y -> "Interesting pick. Look at how the wiggles start." + Hint
 *  - Beat 3: "InSight carried a weather station for this. It tells quakes from wind." + Hint
 *  - Beat 4: Robot switches to /robot-amazed.png (with ?), "tap where the shaking starts." + Hint (reveals 1..3 + glow)
 *  - Beat 5: "A magnitude 4 quake, about 3,500 km away."
 *  - Beat 6: "NASA says it was the first quake seen with surface waves. They ripple along the ground."
 *  - Beat 7: "A seismometer tells us when and how hard. Not why." + bottom Case Board (Stamp 1) & Trust Meter
 */
export function Test01Workspace({
  playingTrack,
  togglePlayAudio,
  audioError,
  confidenceChoice,
  onChangeConfidence,
  onUnlockStamp1,
  onContinue,
}) {
  const [beat, setBeat] = useState(0); // 0..7
  const [hintCount, setHintCount] = useState(0); // 0..3
  const [quakeLabelOn, setQuakeLabelOn] = useState(null); // 'x' | 'y' | null
  const [tapMarker, setTapMarker] = useState(false);
  const [tapHintMsg, setTapHintMsg] = useState(null);

  const handleRevealHint = (e) => {
    e?.stopPropagation();
    setHintCount((prev) => (prev < 3 ? prev + 1 : 3));
  };

  const handleDropQuake = (target) => {
    setQuakeLabelOn(target);
    setTapHintMsg(null);
    if (target === 'y') {
      setBeat(2);
    } else {
      onUnlockStamp1?.();
      setBeat((prev) => (prev < 3 ? 3 : prev));
    }
  };

  const handleSeismogramClick = (e, track, keyboard = false) => {
    // Beat 0 or 1: clicking a seismogram places QUAKE on it (or starts drag flow)
    if (beat <= 2) {
      handleDropQuake(track);
      return;
    }

    // Beat 4: "tap where the shaking starts."
    if (beat === 4) {
      if (track === 'y') {
        setTapHintMsg(test1Copy.tapHints.wrongTrackY);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPct = ((e.clientX - rect.left) / rect.width) * 100;
      if (keyboard || (clickPct >= 48 && clickPct <= 86)) {
        setTapMarker(true);
        setTapHintMsg(null);
        onUnlockStamp1?.();
        setBeat(5);
      } else {
        setTapHintMsg(test1Copy.tapHints.wrongRegionX);
      }
      return;
    }

    if (beat === 3) {
      setBeat(4);
    }
  };

  const handleAdvanceBeat = () => {
    setTapHintMsg(null);
    if (beat === 0) {
      setBeat(1);
    } else if (beat === 1) {
      handleDropQuake('y');
    } else if (beat === 2) {
      setQuakeLabelOn(null);
      setBeat(3);
    } else if (beat === 3) {
      setBeat(4);
    } else if (beat === 4) {
      setTapMarker(true);
      onUnlockStamp1?.();
      setBeat(5);
    } else if (beat === 5) {
      setBeat(6);
    } else if (beat === 6) {
      onUnlockStamp1?.();
      setBeat(7);
    }
  };

  const robotImg =
    hintCount > 0
      ? invCopy.robotImages.amazed
      : beat === 2 || beat >= 5
      ? invCopy.robotImages.front
      : invCopy.robotImages.investigate;

  const actionPill =
    beat === 1 ? (
      <button
        type="button"
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', 'QUAKE')}
        onClick={(e) => {
          e.stopPropagation();
          handleDropQuake('x');
        }}
        className="px-5 py-1 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-white font-exo2 font-bold text-xs tracking-wider uppercase shadow-[0_0_16px_rgba(247,150,29,0.55)] cursor-grab active:cursor-grabbing transition-transform active:scale-95"
        title={test1Copy.quakeButtonTitle}
      >
        {test1Copy.quakeButtonLabel}
      </button>
    ) : beat >= 2 && beat <= 7 ? (
      <button
        type="button"
        onClick={handleRevealHint}
        className="px-5 py-0.5 rounded-full border border-white/60 hover:border-[#F7961D] bg-[#060b1d]/90 hover:bg-[#F7961D]/20 text-white font-exo2 text-xs transition-all cursor-pointer"
        title={test1Copy.hintButtonTitle}
      >
        {test1Copy.hintButtonLabel}
      </button>
    ) : null;

  return (
    <div className="w-full flex flex-col">
      {audioError && <p role="status" className="text-sm text-white mb-2">{audioError}</p>}
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-start">
        <TestHudFrame
          title={test1Copy.title}
          hudVariant="test1"
          titleClassName="text-lg sm:text-xl md:text-[22px] lg:text-[23px] font-bold font-exo2 text-white tracking-normal leading-tight"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Recording X */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={() => togglePlayAudio('x')}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    playingTrack === 'x'
                      ? 'border-[#F7961D] bg-[#F7961D]/20 text-[#F7961D]'
                      : 'border-white/75 hover:border-white hover:bg-white/10 text-white'
                  }`}
                  title={test1Copy.recordingX.playTitle}
                >
                  {playingTrack === 'x' ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <span className="text-[11px] sm:text-[11.5px] font-exo2 text-white/90 text-left leading-tight">
                  {test1Copy.audioCaption}
                </span>
              </div>

              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropQuake('x');
                }}
                onClick={(e) => handleSeismogramClick(e, 'x')}
                onKeyDown={(e) => {
                  activateOnKeyboard(e, () => handleSeismogramClick(e, 'x', true));
                }}
                className={`group relative w-full rounded-[14px] overflow-hidden bg-white border border-white/25 transition-all duration-200 cursor-pointer ${
                  quakeLabelOn === 'x' && beat <= 2
                    ? 'ring-2 ring-[#F7961D] shadow-[0_0_20px_rgba(247,150,29,0.45)]'
                    : tapMarker && beat === 5
                    ? 'ring-2 ring-[#F7961D]/80 shadow-[0_0_16px_rgba(247,150,29,0.35)]'
                    : playingTrack === 'x'
                    ? 'ring-2 ring-[#F7961D]/75 shadow-[0_0_16px_rgba(247,150,29,0.3)]'
                    : 'hover:ring-2 hover:ring-white/65'
                }`}
              >
                <img
                  src={test1Copy.recordingX.image}
                  alt={test1Copy.recordingX.imageAlt}
                  className="w-full h-[126px] sm:h-[138px] md:h-[146px] object-fill scale-[1.03] block pointer-events-none"
                  draggable={false}
                />

                {/* QUAKE dropped badge on Recording X */}
                {quakeLabelOn === 'x' && beat <= 2 && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full bg-[#F7961D] text-white font-exo2 font-bold text-xs tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.65)] pointer-events-none inv-fade-up">
                    {test1Copy.quakeButtonLabel}
                  </span>
                )}

                {/* Hint 3 glow / tapped onset marker on Recording X wave burst (~67% X) */}
                {((beat === 4 && hintCount >= 3) || (tapMarker && beat <= 5)) && (
                  <div
                    className="absolute top-[10%] bottom-[10%] left-[62%] w-[16%] rounded-xl border-2 border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_22px_rgba(56,189,248,0.75)] pointer-events-none animate-pulse"
                    title={test1Copy.recordingX.onsetTitle}
                  />
                )}
              </div>

              {beat === 0 && (
                <p className="mt-2.5 text-center font-exo2 text-xs sm:text-[13px] md:text-[13.5px] text-white/95 leading-[1.3]">
                  {test1Copy.recordingX.captionLines.map((line, idx) => (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* Recording Y */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={() => togglePlayAudio('y')}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    playingTrack === 'y'
                      ? 'border-[#F7961D] bg-[#F7961D]/20 text-[#F7961D]'
                      : 'border-white/75 hover:border-white hover:bg-white/10 text-white'
                  }`}
                  title={test1Copy.recordingY.playTitle}
                >
                  {playingTrack === 'y' ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <span className="text-[11px] sm:text-[11.5px] font-exo2 text-white/90 text-left leading-tight">
                  {test1Copy.audioCaption}
                </span>
              </div>

              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropQuake('y');
                }}
                onClick={(e) => handleSeismogramClick(e, 'y')}
                onKeyDown={(e) => {
                  activateOnKeyboard(e, () => handleSeismogramClick(e, 'y', true));
                }}
                className={`group relative w-full rounded-[14px] overflow-hidden bg-white border border-white/25 transition-all duration-200 cursor-pointer ${
                  beat === 6
                    ? 'ring-[2.5px] ring-[#38bdf8] shadow-[0_0_22px_rgba(56,189,248,0.85)]'
                    : playingTrack === 'y'
                    ? 'ring-2 ring-[#F7961D]/75 shadow-[0_0_16px_rgba(247,150,29,0.3)]'
                    : 'hover:ring-2 hover:ring-white/65'
                }`}
              >
                <img
                  src={test1Copy.recordingY.image}
                  alt={test1Copy.recordingY.imageAlt}
                  className="w-full h-[126px] sm:h-[138px] md:h-[146px] object-fill scale-[1.03] block pointer-events-none"
                  draggable={false}
                />

                {quakeLabelOn === 'y' && beat <= 2 && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full bg-[#F7961D] text-white font-exo2 font-bold text-xs tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.65)] pointer-events-none inv-fade-up">
                    {test1Copy.quakeButtonLabel}
                  </span>
                )}
              </div>

              {beat === 0 && (
                <p className="mt-2.5 text-center font-exo2 text-xs sm:text-[13px] md:text-[13.5px] text-white/95 leading-[1.3]">
                  {test1Copy.recordingY.captionLines.map((line, idx) => (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>

          {tapHintMsg && (
            <p className="mt-2.5 text-center text-xs font-exo2 text-[#F7961D] inv-fade-up">
              {tapHintMsg}
            </p>
          )}
        </TestHudFrame>

        <NexusSidePanel
          robotImage={robotImg}
          onClickDialogue={beat < 7 ? handleAdvanceBeat : onContinue}
          actionPill={actionPill}
          hints={TEST1_HINTS}
          hintCount={beat >= 2 ? hintCount : 0}
          align="start"
          topOffsetClassName="lg:mt-7"
          outerMinHeightClassName="min-h-[305px] sm:min-h-[322px]"
        >
          {(test1Copy.beats[String(beat)] || []).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </NexusSidePanel>
      </div>

      {/* Final Test 01 beat: Trust Meter + Continue button */}
      {beat === 7 && (
        <div className="mt-3 w-full flex flex-col sm:flex-row items-stretch sm:items-end justify-end gap-4 inv-fade-up">
          <TrustMeter
            value={confidenceChoice}
            onChange={onChangeConfidence}
            className="mt-0 w-full sm:w-[360px]"
          />
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer shadow-[0_0_16px_rgba(247,150,29,0.35)] shrink-0 self-end"
          >
            <span>{test1Copy.continueLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

