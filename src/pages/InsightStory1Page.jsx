import { ArrowLeft } from 'lucide-react';

export default function InsightStory1Page({ onBack }) {
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
            backgroundImage: `url('/story1bg.webp')`,
          }}
        />
        {/* Subtle left-side dark vignette to ensure crisp text readability */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-2/3 bg-gradient-to-r from-[#030611]/70 via-[#030611]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* 
        Main Story 1 Content Container
        Positioned on the left matching the exact layout & proportions of the design.
      */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-20 sm:pt-24 md:pt-26 pb-12 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 max-w-[1440px] mx-auto w-full">
        
        {/* Top Back Navigation Row: (<-) Mission Chronicles */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            aria-label="Back to Insight Trailer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2} />
          </button>

          <span className="text-lg sm:text-xl md:text-[23px] font-bold font-orbitron tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Mission Chronicles
          </span>
        </div>

        {/* Main Story Title: "The Machine That / Took Mars’s Pulse" */}
        <h1 className="mt-5 sm:mt-6 md:mt-7 text-2xl sm:text-3xl md:text-[38px] lg:text-[44px] font-bold font-orbitron text-white leading-[1.18] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-left">
          The Machine That
          <br />
          Took Mars’s Pulse
        </h1>

        {/* Story Narrative Paragraphs in Exo 2 matching exact line breaks & orange highlights */}
        <div className="mt-5 sm:mt-6 md:mt-7 space-y-5 sm:space-y-6 md:space-y-7 text-left font-exo2 font-normal text-[15px] sm:text-[17px] md:text-[19px] lg:text-[20px] leading-[1.38] tracking-[0.01em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          
          {/* Paragraph 1 */}
          <p>
            <span className="text-[#F7961D] font-medium">“I’m here. I’m home.”</span>
            <br />
            That is what NASA’s InSight account
            <br className="hidden sm:inline" />{' '}
            posted, in the lander’s own voice, on the
            <br className="hidden sm:inline" />{' '}
            day it landed on Mars:{' '}
            <span className="text-[#F7961D] font-medium">26 November 2018</span>
          </p>

          {/* Paragraph 2 */}
          <p>
            Today that machine is still there, and it
            <br className="hidden sm:inline" />{' '}
            hasn&apos;t said a word in almost four years.
            <br className="hidden sm:inline" />{' '}
            Dust covers its solar panels. NASA last
            <br className="hidden sm:inline" />{' '}
            heard from it on{' '}
            <span className="text-[#F7961D] font-medium">15 December 2022</span>
          </p>

          {/* Paragraph 3 */}
          <p className="max-w-[680px]">
            But before it went quiet, it did something NASA calls a first:
            <br className="hidden sm:inline" />{' '}
            <span className="text-[#F7961D] font-medium">
              it studied the inside of Mars in depth
            </span>{' '}
            . For decades, we met
            <br className="hidden sm:inline" />{' '}
            Mars the way you meet a stranger, by its face: canyons,
          </p>

        </div>

      </main>

    </div>
  );
}
