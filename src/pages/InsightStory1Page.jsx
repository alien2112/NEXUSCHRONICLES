import { useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { shouldIgnoreSceneShortcut } from '../utils/keyboard';
import siteContent from '../data/siteContent.json';

const storyCopy = siteContent.insightStory1Page;

function StoryLine({ line }) {
  return (
    <>
      {line.segments.map((seg, idx) =>
        typeof seg === 'string' ? (
          seg
        ) : (
          <span key={idx} className={seg.highlight ? 'text-[#F7961D] font-medium' : undefined}>
            {seg.text}
          </span>
        ),
      )}
      {line.breakMode === 'always' && <br />}
      {line.breakMode === 'responsive' && (
        <>
          <br className="hidden sm:inline" />{' '}
        </>
      )}
    </>
  );
}

export default function InsightStory1Page({ onBack, onNext }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (shouldIgnoreSceneShortcut(event) || document.querySelector('dialog[open]')) {
        return;
      }
      if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowLeft' && onBack) {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onNext]);

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#040711]">
      
      {/* 
        Full-Screen Story 1 Background:
        Using public/story1bg.webp
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${storyCopy.backgroundImage}')`,
          }}
        />
        {/* Subtle left-side dark vignette to ensure crisp text readability */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-2/3 bg-gradient-to-r from-[#030611]/82 via-[#030611]/50 lg:from-[#030611]/70 lg:via-[#030611]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* 
        Main Story 1 Content Container
        Positioned on the left matching the exact layout & proportions of the design.
      */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-20 sm:pt-24 md:pt-26 pb-12 px-5 sm:px-10 md:px-14 lg:px-16 xl:px-20 max-w-[1440px] mx-auto w-full">
        
        {/* Top Back Navigation Row: (<-) Mission Chronicles */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            aria-label={storyCopy.backAriaLabel}
            title={storyCopy.backTitle}
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2} />
          </button>

          <span className="text-lg sm:text-xl md:text-[23px] font-bold font-orbitron tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {storyCopy.headerTitle}
          </span>
        </div>

        {/* Main Story Title: "The Machine That / Took Mars’s Pulse" */}
        <h1 className="mt-5 sm:mt-6 md:mt-7 text-2xl sm:text-3xl md:text-[38px] lg:text-[44px] font-bold font-orbitron text-white leading-[1.18] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-left">
          {storyCopy.titleLines.map((line, idx) => (
            <span key={idx}>
              {idx > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>

        {/* Story Narrative Paragraphs in Exo 2 matching exact line breaks & orange highlights */}
        <div className="mt-5 sm:mt-6 md:mt-7 space-y-5 sm:space-y-6 md:space-y-7 text-left font-exo2 font-normal text-[15px] sm:text-[17px] md:text-[19px] lg:text-[20px] leading-[1.38] tracking-[0.01em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {storyCopy.paragraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className={paragraph.maxWidth ? 'max-w-[680px]' : undefined}>
              {paragraph.lines.map((line, lIdx) => (
                <StoryLine key={lIdx} line={line} />
              ))}
            </p>
          ))}
        </div>

        {/* Right-edge Next Story Button */}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="fixed right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-[#040917]/65 backdrop-blur-sm hover:border-[#F7961D] hover:bg-[#F7961D]/15 text-white/90 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.65)]"
            aria-label={storyCopy.nextAriaLabel}
            title={storyCopy.nextTitle}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
          </button>
        )}

      </main>

    </div>
  );
}
