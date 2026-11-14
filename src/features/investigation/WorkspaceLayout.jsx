import { Lightbulb } from 'lucide-react';
import TrustMeter from './TrustMeter';
import siteContent from '../../data/siteContent.json';

const invCopy = siteContent.investigation;

/**
 * Shared Left Chamfered HUD Frame used by the investigation workspaces.
 */
export function TestHudFrame({
  title,
  headerRight,
  titleClassName = 'text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold font-orbitron text-white tracking-wide leading-tight',
  hudVariant = 'default',
  children,
}) {
  return (
    <div className="lg:col-span-7 xl:col-span-7 relative w-full lg:w-[103%] z-10">
      <div className="relative w-full pt-4 pb-5 px-3.5 sm:px-6">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
        >
          {hudVariant === 'test1' ? (
            <path
              d="M 14 2 L 584 2 Q 598 2 598 16 L 598 284 Q 598 298 584 298 L 238 298 L 216 280 L 18 280 Q 6 280 6 268 L 6 70 L 2 64 L 2 14 Q 2 2 14 2 Z"
              fill="rgba(5, 9, 22, 0.78)"
              stroke="#F7961D"
              strokeOpacity="0.8"
              strokeWidth="1.4"
            />
          ) : (
            <path
              d="M 14 2 L 584 2 Q 598 2 598 16 L 598 284 Q 598 298 584 298 L 245 298 Q 238 298 233 293 L 225 285 Q 220 280 214 280 L 14 280 Q 2 280 2 268 L 2 14 Q 2 2 14 2 Z"
              fill="rgba(5, 9, 22, 0.78)"
              stroke="#F7961D"
              strokeOpacity="0.78"
              strokeWidth="1.4"
            />
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div className="flex flex-col items-start text-left">
            <h3 className={titleClassName}>
              {title}
            </h3>
          </div>
          {headerRight}
        </div>

        <div className="relative z-10 rounded-2xl border border-white/30 bg-[#04091b]/70 backdrop-blur-md p-3 sm:p-4 md:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Shared Right Panel containing the outer faint-bordered HUD frame,
 * inner orange-bordered NEXUS speech box, floating robot, optional action pill (QUAKE / Hint),
 * progressive Hints list, and optional Trust Meter.
 */
export function NexusSidePanel({
  children,
  showTrustMeter = false,
  confidenceChoice,
  onChangeConfidence,
  robotImage = invCopy.robotImages.investigate,
  onClickDialogue,
  actionPill = null,
  hints = [],
  hintCount = 0,
  align = 'end',
  topOffsetClassName = '',
  outerMinHeightClassName = '',
}) {
  return (
    <div
      className={`lg:col-span-5 xl:col-span-5 relative w-full mt-12 sm:mt-16 lg:mt-0 lg:pl-4 flex flex-col ${topOffsetClassName} ${
        align === 'start' ? 'justify-start' : 'justify-end'
      }`}
    >
      <div className={`relative w-full pt-3.5 px-3 pb-4 ${outerMinHeightClassName}`}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 420 310"
          preserveAspectRatio="none"
        >
          <path
            d="M 14 2 L 146 2 L 168 20 L 404 20 Q 418 20 418 34 L 418 294 Q 418 308 404 308 L 16 308 Q 2 308 2 294 L 2 14 Q 2 2 14 2 Z"
            fill="rgba(5, 10, 26, 0.28)"
            stroke="rgba(255, 255, 255, 0.30)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Inner Orange-Bordered NEXUS Speech Box */}
        <div
          onClick={onClickDialogue}
          className={`relative z-10 w-full min-h-[138px] sm:min-h-[150px] p-4 sm:p-5 ${
            actionPill ? 'pb-12' : ''
          } ${onClickDialogue ? 'cursor-pointer' : ''}`}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 144"
            preserveAspectRatio="none"
          >
            <path
              d="M 14 2 L 122 2 L 144 20 L 386 20 Q 398 20 398 32 L 398 130 Q 398 142 386 142 L 14 142 Q 2 142 2 130 L 2 14 Q 2 2 14 2 Z"
              fill="rgba(7, 12, 30, 0.85)"
              stroke="#F7961D"
              strokeOpacity="0.82"
              strokeWidth="1.35"
            />
          </svg>

          <div className="relative z-10 flex items-center gap-1.5 text-[#F7961D] mb-2">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F7961D] shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect x="2.5" y="2" width="11" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="8" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 12c.4-1.6 1.6-2.4 3-2.4s2.6.8 3 2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-exo2 font-semibold text-xs sm:text-sm md:text-[15px] tracking-wider uppercase">
              {invCopy.nexusSpeakerLabel}
            </span>
          </div>

          <div
            className="relative z-10 text-left font-exo2 text-white text-sm sm:text-[15px] md:text-[16px] leading-[1.35] pr-22 sm:pr-28 lg:pr-32">
            {onClickDialogue && (
              <button type="button" className="sr-only dialogue-advance" aria-label={invCopy.continueDialogueSrLabel} onClick={event => { event.stopPropagation(); onClickDialogue(); }}>
                {invCopy.continueDialogueSrLabel}
              </button>
            )}
            {children}
          </div>

          {actionPill && (
            <div className="absolute bottom-3.5 right-6 sm:right-7 z-30">{actionPill}</div>
          )}

          {/* Floating Robot Companion */}
          <div
            key={robotImage}
            className="
              absolute
              -top-[64px] -right-[4px]
              sm:-top-[86px] sm:-right-[10px]
              lg:-top-[108px] lg:-right-[14px]
              w-[112px] sm:w-[155px] lg:w-[188px]
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

        {/* Progressive Hints Card inside the outer right frame (Tests 01 & 02) */}
        {hintCount > 0 && hints.length > 0 && (
          <div className="relative z-10 mt-3 rounded-2xl border border-white/25 bg-[#060b1d]/88 backdrop-blur-md px-3.5 py-3 sm:px-4 sm:py-3.5 text-left inv-fade-up">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/15">
              <Lightbulb className="w-4 h-4 text-[#FACC15] fill-[#F7961D]/45 drop-shadow-[0_0_6px_rgba(250,204,21,0.65)] shrink-0" />
              <span className="font-exo2 font-semibold text-xs sm:text-sm text-white tracking-wide">
                {invCopy.hintsTitle}
              </span>
            </div>

            <div className="divide-y divide-white/12">
              {hints.slice(0, hintCount).map((hintText, idx) => (
                <div key={idx} className="flex items-center gap-2.5 py-1.5 first:pt-0.5 last:pb-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#D9D9D9] text-[#1f2937] font-exo2 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-exo2 text-xs sm:text-[13px] text-white/95">
                    {hintText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTrustMeter && (
          <div className="relative z-10">
            <TrustMeter
              value={confidenceChoice}
              onChange={onChangeConfidence}
              className="mt-5 sm:mt-6 w-full sm:w-[90%] max-w-[315px] mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}

