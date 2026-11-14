import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CaseBoardStrip } from './CaseBoardPanel';
import { TestHudFrame, NexusSidePanel } from './WorkspaceLayout';

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
        <TestHudFrame testLabel="TEST 03" title="Can a small rock do this?">
          {stage !== 'speed' ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                {/* Crater Scale Image Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnCrater}
                  onClick={() => {
                    if (stage === 'bus' && !busPlaced) placeItem('bus');
                    else if (stage === 'pyramid' && !pyramidPlaced) placeItem('pyramid');
                  }}
                  className="sm:col-span-8 relative rounded-2xl overflow-hidden hover:ring-1 hover:ring-[#F7961D]/70 transition-all cursor-pointer bg-black"
                  title="Drop scale object here (or click)"
                >
                  <img
                    src="/crater-scale.png"
                    alt="150m wide, 21m deep Martian crater"
                    className="w-full h-[170px] sm:h-[188px] object-cover block"
                    draggable={false}
                  />

                  {/* Placed Bus directly along the 150 m scale bar */}
                  {busPlaced && (
                    <div className="absolute top-[11%] left-[12%] flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/75 border border-[#F7961D]/80 inv-robot-swap">
                      <img src="/scale-bus.png" alt="12m Bus" className="w-7 h-3.5 object-contain mix-blend-lighten" />
                      <span className="text-[10px] font-mono text-white">12 m</span>
                    </div>
                  )}

                  {/* Placed Great Pyramid spanning ~146 m next to the 150 m crater */}
                  {pyramidPlaced && (
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none inv-robot-swap">
                      <img
                        src="/scale-pyramid.png"
                        alt="146m Great Pyramid"
                        className="w-28 h-20 object-contain opacity-95 drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]"
                      />
                      <span className="mt-0.5 px-2 py-0.5 rounded bg-black/75 border border-[#F7961D]/80 text-[10px] font-mono text-white">
                        Great Pyramid ~146 m
                      </span>
                    </div>
                  )}
                </div>

                {/* Scale Objects Container (Bus on top, Pyramid on bottom — clean matching reference) */}
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
                    title="Drag or click Bus (~12 m)"
                  >
                    <img
                      src="/scale-bus.png"
                      alt="Bus (~12m)"
                      className="w-20 h-12 object-contain pointer-events-none mix-blend-lighten"
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
                    title="Drag or click Great Pyramid (~146 m)"
                  >
                    <img
                      src="/scale-pyramid.png"
                      alt="Great Pyramid (~146m)"
                      className="w-24 h-20 object-contain pointer-events-none mix-blend-lighten"
                    />
                  </button>
                </div>
              </div>

              {/* Bottom Caption & Proceed Action */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-[13px] font-exo2 text-white/90 text-left">
                  {stage === 'bus'
                    ? 'drag the bus onto the scale bar next to the crater'
                    : !pyramidPlaced
                    ? 'drag the Great Pyramid over.'
                    : 'Compare the 12 m rock to the 150 m crater — next, test its impact speed.'}
                </p>

                {pyramidPlaced && (
                  <button
                    type="button"
                    onClick={() => setStage('speed')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] text-xs font-exo2 font-semibold transition-colors cursor-pointer"
                  >
                    <span>Test Impact Speed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Sub-part B: Speed Slider & Kinetic Energy Bar matching reference */
            <div className="flex flex-col items-center text-center">
              <p className="text-xs sm:text-[13.5px] md:text-[14px] font-exo2 text-white/95 mb-2">
                speed slider. Energy bar grows as the rock speeds up.
              </p>

              <div className="relative w-full max-w-[430px] h-[108px] sm:h-[118px] overflow-hidden bg-transparent">
                <img
                  src="/meteor-speed.png"
                  alt="High-speed meteoroid impact energy visualization"
                  className="w-full h-full object-cover transition-transform duration-200 mix-blend-lighten"
                  style={{
                    transform: `scale(${1 + (speedVal / 100) * 0.08})`,
                    filter: `brightness(${0.92 + (speedVal / 100) * 0.42})`,
                    maskImage:
                      'radial-gradient(ellipse 88% 85% at 50% 50%, black 55%, transparent 100%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 88% 85% at 50% 50%, black 55%, transparent 100%)',
                  }}
                  draggable={false}
                />
              </div>

              {/* Speed & Energy Sliders matching reference blue & orange-red bars with white pill thumbs */}
              <div className="mt-3 w-full max-w-[375px] space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <span className="w-14 text-xs sm:text-sm font-exo2 text-white">Speed</span>
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
                      aria-label="Meteoroid speed slider"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 text-xs sm:text-sm font-exo2 text-white">Energy</span>
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
                ? '/robot-front.png'
                : speedNarrativeIdx === 1
                ? '/robot-amazed.png'
                : '/robot-investigate-page.png'
              : '/robot-investigate-page.png'
          }
          showTrustMeter
          confidenceChoice={confidenceChoice}
          onChangeConfidence={onChangeConfidence}
          onClickDialogue={stage !== 'speed' || speedNarrativeIdx < 2 ? handleNexusClick : undefined}
        >
          {stage === 'bus' ? (
            <>
              <p>NASA estimates the rock at</p>
              <p>5 to 12 meters.</p>
              <p>A bus is about 12.</p>
            </>
          ) : stage === 'pyramid' ? (
            <>
              <p>About as wide as the Great</p>
              <p>Pyramid was tall.</p>
            </>
          ) : speedNarrativeIdx === 0 ? (
            <>
              <p>Double the speed, four</p>
              <p>times the energy.</p>
            </>
          ) : speedNarrativeIdx === 1 ? (
            <>
              <p>Debris flew up to 37 km.</p>
            </>
          ) : (
            <>
              <p>Plausible isn&apos;t proof. But</p>
              <p>every piece fits so far.</p>
            </>
          )}
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
              <span>Continue to Step 4 Intro</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

