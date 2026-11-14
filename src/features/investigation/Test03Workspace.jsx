import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CaseBoardStrip } from './CaseBoardPanel';
import { TestHudFrame, NexusSidePanel } from './WorkspaceLayout';
import {
  BusGraphic,
  CraterScaleGraphic,
  MeteorSpeedGraphic,
  PyramidGraphic,
} from './InvestigationGraphics';
import siteContent from '../../data/siteContent.json';

const invCopy = siteContent.investigation;
const test3Copy = invCopy.test03;

/**
 * TEST 03: Can a small rock do this?
 * Matches investigation-3-part1.jpg, part2.jpg, part3.jpg:
 *  - Stage 'bus': Drag (or click) the bus onto the scale bar next to the crater
 *  - Stage 'pyramid': Drag (or click) the Great Pyramid over
 *  - Stage 'speed': Interactive speed slider with quadratic kinetic energy bar + 3 NEXUS lines
 */
export function Test03Workspace({
  confidenceChoice,
  onChangeConfidence,
  earnedStampIds,
  onUnlockStamp3,
  onComplete,
}) {
  const [stage, setStage] = useState('bus'); // 'bus' | 'pyramid' | 'speed'
  const [busPlaced, setBusPlaced] = useState(false);
  const [pyramidPlaced, setPyramidPlaced] = useState(false);
  const [speedVal, setSpeedVal] = useState(35); // 10..100 (default ~28% along track)
  const [speedNarrativeIdx, setSpeedNarrativeIdx] = useState(0); // 0..2

  const speedPct = ((speedVal - 10) / 90) * 100;
  // Energy bar starts ahead (~48% at 28% speed) and grows smoothly toward 100%
  const energyPct = Math.min(100, Math.round(Math.pow((speedVal - 10) / 90, 0.58) * 100));

  const placeItem = (item) => {
    if (item === 'bus' && !busPlaced) {
      setBusPlaced(true);
      setStage('pyramid');
    } else if (item === 'pyramid' && busPlaced && !pyramidPlaced) {
      setPyramidPlaced(true);
    }
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDropOnCrater = (e) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    placeItem(item);
  };

  const handleSpeedChange = (e) => {
    const val = Number(e.target.value);
    setSpeedVal(val);
    if (val >= 75) {
      setSpeedNarrativeIdx(2);
      onUnlockStamp3();
    } else if (val >= 50) {
      setSpeedNarrativeIdx((prev) => Math.max(prev, 1));
    }
  };

  const handleNexusClick = () => {
    if (stage === 'bus') {
      placeItem('bus');
    } else if (stage === 'pyramid') {
      if (!pyramidPlaced) {
        placeItem('pyramid');
      } else {
        setStage('speed');
      }
    } else if (stage === 'speed' && speedNarrativeIdx < 2) {
      const nextIdx = speedNarrativeIdx + 1;
      setSpeedNarrativeIdx(nextIdx);
      if (nextIdx === 2) {
        onUnlockStamp3();
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-end">
        <TestHudFrame title={test3Copy.title}>
          {stage !== 'speed' ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                {/* Crater Scale Diagram Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnCrater}
                  onClick={() => {
                    if (stage === 'bus' && !busPlaced) placeItem('bus');
                    else if (stage === 'pyramid' && !pyramidPlaced) placeItem('pyramid');
                  }}
                  className="sm:col-span-8 relative rounded-2xl overflow-hidden border border-white/25 hover:border-[#F7961D]/70 transition-all cursor-pointer bg-[#040818]"
                  title={test3Copy.dropZoneTitle}
                >
                  <CraterScaleGraphic
                    busPlaced={busPlaced}
                    pyramidPlaced={pyramidPlaced}
                    ariaLabel={test3Copy.craterAlt}
                  />
                </div>

                {/* Scale Objects Container (Bus on top, Pyramid on bottom) */}
                <div className="sm:col-span-4 min-h-[170px] rounded-2xl border border-white/30 bg-[#030717]/90 p-2.5 flex sm:flex-col items-center justify-around gap-2.5">
                  <button
                    type="button"
                    draggable={!busPlaced}
                    onDragStart={(e) => handleDragStart(e, 'bus')}
                    onClick={() => placeItem('bus')}
                    className={`group flex flex-col items-center p-1.5 rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                      busPlaced
                        ? 'opacity-40'
                        : 'hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(247,150,29,0.55)]'
                    }`}
                    title={test3Copy.bus.trayTitle}
                  >
                    <BusGraphic
                      ariaLabel={test3Copy.bus.trayAlt}
                      className="w-24 h-12 pointer-events-none"
                    />
                  </button>

                  <button
                    type="button"
                    draggable={busPlaced && !pyramidPlaced}
                    onDragStart={(e) => handleDragStart(e, 'pyramid')}
                    onClick={() => placeItem('pyramid')}
                    className={`group flex flex-col items-center p-1.5 rounded-lg transition-all ${
                      pyramidPlaced
                        ? 'opacity-40'
                        : busPlaced
                        ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(247,150,29,0.55)]'
                        : 'opacity-85 cursor-pointer'
                    }`}
                    title={test3Copy.pyramid.trayTitle}
                  >
                    <PyramidGraphic
                      ariaLabel={test3Copy.pyramid.trayAlt}
                      className="w-24 h-16 pointer-events-none"
                    />
                  </button>
                </div>
              </div>

              {/* Bottom Caption & Proceed Action */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-[13px] font-exo2 text-white/90 text-left">
                  {stage === 'bus'
                    ? test3Copy.captions.bus
                    : !pyramidPlaced
                    ? test3Copy.captions.pyramid
                    : test3Copy.captions.pyramidPlaced}
                </p>

                {pyramidPlaced && (
                  <button
                    type="button"
                    onClick={() => setStage('speed')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] text-xs font-exo2 font-semibold transition-colors cursor-pointer"
                  >
                    <span>{test3Copy.testSpeedButtonLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Sub-part B: Speed Slider & Kinetic Energy Bar matching reference */
            <div className="flex flex-col items-center text-center">
              <p className="text-xs sm:text-[13.5px] md:text-[14px] font-exo2 text-white/95 mb-2">
                {test3Copy.speedStage.instruction}
              </p>

              <div className="relative w-full max-w-[430px] h-[108px] sm:h-[118px] overflow-hidden bg-transparent">
                <MeteorSpeedGraphic
                  speedVal={speedVal}
                  energyPct={energyPct}
                  ariaLabel={test3Copy.speedStage.meteorAlt}
                />
              </div>

              {/* Speed & Energy Sliders matching reference blue & orange-red bars with white pill thumbs */}
              <div className="mt-3 w-full max-w-[375px] space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <span className="w-14 text-xs sm:text-sm font-exo2 text-white">{test3Copy.speedStage.speedLabel}</span>
                  <div className="relative flex-1 h-5 flex items-center">
                    <div className="w-full h-[5px] rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3b6ff5] to-[#bfdbfe]"
                        style={{ width: `${speedPct}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[14px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)] pointer-events-none"
                      style={{ left: `${speedPct}%` }}
                    />
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={speedVal}
                      onChange={handleSpeedChange}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      aria-label={test3Copy.speedStage.speedSliderAriaLabel}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 text-xs sm:text-sm font-exo2 text-white">{test3Copy.speedStage.energyLabel}</span>
                  <div className="relative flex-1 h-5 flex items-center">
                    <div className="w-full h-[5px] rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#facc15] transition-all duration-150"
                        style={{ width: `${energyPct}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[14px] rounded-full bg-white shadow-[0_0_8px_rgba(255,180,60,0.85)] pointer-events-none transition-all duration-150"
                      style={{ left: `${energyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </TestHudFrame>

        <NexusSidePanel
          robotImage={
            stage === 'speed'
              ? speedNarrativeIdx >= 2
                ? invCopy.robotImages.front
                : speedNarrativeIdx === 1
                ? invCopy.robotImages.amazed
                : invCopy.robotImages.investigate
              : invCopy.robotImages.investigate
          }
          showTrustMeter
          confidenceChoice={confidenceChoice}
          onChangeConfidence={onChangeConfidence}
          onClickDialogue={stage !== 'speed' || speedNarrativeIdx < 2 ? handleNexusClick : undefined}
        >
          {(stage === 'bus'
            ? test3Copy.dialogues.bus
            : stage === 'pyramid'
            ? test3Copy.dialogues.pyramid
            : speedNarrativeIdx === 0
            ? test3Copy.dialogues.speed0
            : speedNarrativeIdx === 1
            ? test3Copy.dialogues.speed1
            : test3Copy.dialogues.speed2
          ).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </NexusSidePanel>
      </div>

      {/* Case Board Stamp Preview Strip aligned directly under TEST 03 on final frame */}
      {stage === 'speed' && speedNarrativeIdx >= 2 && (
        <div className="mt-2 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-end inv-fade-up">
          <div className="lg:col-span-7 xl:col-span-7 w-full lg:w-[103%]">
            <CaseBoardStrip earnedStampIds={earnedStampIds} className="mt-0" />
          </div>

          <div className="lg:col-span-5 xl:col-span-5 flex justify-end lg:pl-5 pb-1">
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs transition-colors cursor-pointer shadow-[0_0_16px_rgba(247,150,29,0.35)]"
            >
              <span>{test3Copy.continueLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

