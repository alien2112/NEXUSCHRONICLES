import { ArrowLeft, ArrowRight } from 'lucide-react';
import siteContent from '../data/siteContent.json';
import { activateOnKeyboard } from '../utils/keyboard';

const cwCopy = siteContent.chooseWorldPage;

const PATH_CARDS = [
  {
    id: 'go-deeper',
    lines: ['GO', 'DEEPER'],
    ariaLabel: 'Go deeper: Science Behind It',
    propKey: 'onGoDeeper',
  },
  {
    id: 'go-technical',
    lines: ['GO', 'TECHNICAL'],
    ariaLabel: 'Go technical: Engineering the Mission 3D',
    propKey: 'onGoTechnical',
  },
];

function PathCard({ lines, ariaLabel, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => activateOnKeyboard(e, onClick)}
      aria-label={ariaLabel}
      className="group relative w-[min(296px,calc(100vw-2.5rem))] h-[300px] min-[600px]:w-[268px] min-[600px]:h-[304px] sm:w-[296px] sm:h-[328px] rounded-[28px] p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer select-none shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      {/* Background 1: Clean Card WITHOUT purple outline (default state) */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{
          backgroundImage: `url('${cwCopy.cardBackgroundClean}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Background 2: Card WITH purple outline (appears on hover/focus) */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: `url('${cwCopy.cardBackgroundHover}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Card Title */}
      <h2 className="relative z-10 text-white font-bold font-orbitron uppercase tracking-wider text-[24px] sm:text-[26px] leading-[1.28] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] pointer-events-none">
        {lines[0]}
        <br />
        {lines[1]}
      </h2>

      {/* Circle Arrow Button */}
      <div className="relative z-10 mt-6 sm:mt-7 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/45 group-hover:border-white group-hover:bg-white/10 flex items-center justify-center text-white/90 group-hover:text-white transition-all duration-300 shrink-0 pointer-events-none">
        <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export default function ExploreFurtherPage({
  onBackToCaseBoard,
  onGoDeeper,
  onGoTechnical,
}) {
  const handlers = { onGoDeeper, onGoTechnical };

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white">
      {/* Full-Screen Cosmic Space Background matching ChooseWorld */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('${cwCopy.backgroundImage}')`,
        }}
      />

      {/* Subtle vignette for atmospheric depth */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-20 sm:pt-24 md:pt-26 lg:pt-28 pb-16 w-full max-w-[1440px] mx-auto">
        {onBackToCaseBoard && (
          <button
            type="button"
            onClick={onBackToCaseBoard}
            className="self-start mb-3 sm:mb-0 sm:absolute sm:top-24 sm:left-8 lg:left-12 w-9 h-9 rounded-full border border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            aria-label="Back to Case Board"
            title="Back to Case Board"
          >
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={2} />
          </button>
        )}

        {/* Header Block: Title & Subtitle */}
        <div className="max-w-2xl mx-auto text-center space-y-2.5 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-bold font-orbitron tracking-wider text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] leading-tight">
            Explore Your Path
          </h1>

          <p className="text-sm sm:text-base md:text-[18px] text-slate-200/90 font-exo2 font-normal tracking-wide leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Dive deeper into the discoveries of Mars, or uncover the
            <br className="hidden sm:inline" />{' '}
            science and technology behind the InSight mission.
            <br className="hidden sm:inline" />{' '}
            Choose how you want to explore.
          </p>
        </div>

        {/* Two Path Cards Row */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col min-[600px]:flex-row items-center justify-center gap-6 min-[600px]:gap-5 sm:gap-9 md:gap-11 w-full max-w-4xl mx-auto">
          {PATH_CARDS.map((card) => (
            <PathCard
              key={card.id}
              lines={card.lines}
              ariaLabel={card.ariaLabel}
              onClick={handlers[card.propKey]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
