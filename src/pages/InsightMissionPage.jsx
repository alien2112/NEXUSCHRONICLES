import { ArrowLeft, ArrowRight, Play } from 'lucide-react';

export default function InsightMissionPage({ onBack, onWatchStory }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-hidden font-public text-white bg-[#0d0705]">
      
      {/* 
        Trailer Video / Background Container
        Reserved for the full-screen InSight mission trailer video.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle dark Martian atmospheric gradient placeholder until trailer video is attached */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0d07] via-[#2b1409] to-[#0a0605]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50" />
      </div>

      {/* Top Header Row: Back Button & "Insight" Title */}
      <div className="relative z-20 pt-20 sm:pt-24 md:pt-28 px-6 sm:px-10 md:px-14 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={onBack}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/70 hover:border-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-[38px] font-bold font-orbitron tracking-wider text-white">
            Insight
          </h1>
        </div>
      </div>

      {/* 
        Main Content Area:
        Right-aligned text block ("A Tiny Listener on a Big Planet") and "Watch the story" hexagonal button
      */}
      <main className="relative z-10 flex-1 flex items-center justify-center lg:justify-end px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 max-w-[1440px] mx-auto w-full pb-16">
        
        <div className="w-full max-w-[520px] flex flex-col items-center text-center">
          
          {/* Heading in Orbitron */}
          <h2 className="text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-bold font-orbitron text-white leading-[1.22] tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]">
            A Tiny Listener
            <br />
            on a Big Planet
          </h2>

          {/* Subtitle in Exo 2 */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-[18px] text-white/95 font-exo2 font-normal leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Insight landed on Mars to listen
            <br />
            to the planet&apos;s natural quakes
          </p>

          {/* Pointed Hexagonal Button: "Watch the story ->" */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={onWatchStory}
              className="relative group inline-flex items-center justify-between gap-3.5 px-6 sm:px-7 py-3 min-w-[235px] sm:min-w-[255px] h-[50px] transition-all duration-300 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
              title="Watch the story"
            >
              {/* Pointed Hexagon Border SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.45)]"
                viewBox="0 0 255 50"
                preserveAspectRatio="none"
              >
                <path
                  d="M 24 1.5 L 231 1.5 Q 239 1.5 244 9 L 251 20 Q 253.5 25 251 30 L 244 41 Q 239 48.5 231 48.5 L 24 48.5 Q 16 48.5 11 41 L 4 30 Q 1.5 25 4 20 L 11 9 Q 16 1.5 24 1.5 Z"
                  fill="rgba(255, 255, 255, 0.06)"
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth="1.5"
                  className="group-hover:stroke-white group-hover:fill-[rgba(255,255,255,0.14)] transition-all duration-300"
                />
              </svg>

              {/* Left Play Circle Icon */}
              <span className="relative z-10 w-6 h-6 rounded-full border border-white/85 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
              </span>

              {/* Center Button Label */}
              <span className="relative z-10 text-white font-exo2 text-[15px] sm:text-[16px] font-medium tracking-wide">
                Watch the story
              </span>

              {/* Right Arrow Icon */}
              <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
