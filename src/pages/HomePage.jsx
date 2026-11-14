import { ChevronRight } from 'lucide-react';
import siteContent from '../data/siteContent.json';

const homeCopy = siteContent.homePage;

export default function HomePage({ onBeginJourney }) {
  return (
    <>
      {/* 
        Full-Screen Wallpaper Background for Home
        Using user's provided file: public/homepagebg.webp
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-top sm:bg-center bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: `url('${homeCopy.backgroundImage}')`,
        }}
      />

      {/* Subtle bottom vignette */}
      <div className="fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0" />

      {/* 
        Hero Content Section (Positioned Pixel-Perfect on the Left)
        - Empty Logo Placeholder (reserved for user logo)
        - Text: "Every mission leaves a trace... / Are you ready to uncover it ?"
        - Button: "Begin Your Journey >"
      */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-24 sm:pt-28 md:pt-32 lg:pt-36 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        
        <div className="w-full max-w-[340px] sm:max-w-[400px] flex flex-col items-start text-left space-y-4 sm:space-y-5">
          
          {/* 
            Empty Logo Placeholder
            Exact bounding box (~300px x 150px) where the NEXUS CHRONICLES logo goes.
            Left as an empty placeholder as requested by the user.
          */}
          <div 
            className="w-[280px] sm:w-[320px] md:w-[340px] h-[135px] sm:h-[150px] md:h-[155px] rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center transition-colors group relative overflow-hidden"
            title={homeCopy.logoPlaceholder.title}
          >
            <div className="flex flex-col items-center gap-1 text-white/30 group-hover:text-white/50 transition-colors">
              <span className="text-[11px] font-mono tracking-widest uppercase">
                {homeCopy.logoPlaceholder.label}
              </span>
              <span className="text-[10px] text-white/20 font-mono">
                {homeCopy.logoPlaceholder.dimensions}
              </span>
            </div>
          </div>

          {/* 
            Text under the logo (Rendered with Exo 2):
            "Every mission leaves a trace..."
            "Are you ready to uncover it ?"
          */}
          <div className="space-y-1 sm:space-y-1.5 pt-1 font-exo2">
            {homeCopy.taglineLines.map((line, idx) => (
              <p key={idx} className="text-white text-base sm:text-lg md:text-[20px] lg:text-[21px] font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                {line}
              </p>
            ))}
          </div>

          {/* 
            Button under the text:
            "Begin Your Journey >"
            Exact silhouette and solid gradient fill on hover matching user's reference PNG
          */}
          <div className="pt-2">
            <button
              onClick={onBeginJourney}
              className="relative group inline-flex items-center justify-center gap-3.5 px-8 sm:px-9 py-3 min-w-[235px] sm:min-w-[255px] h-[52px] transition-transform duration-300 cursor-pointer select-none active:scale-[0.98]"
              title={homeCopy.ctaButton.title}
            >
              {/* Exact Pointed Pill SVG Silhouette (traced 1:1 from reference PNG) */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 348 71" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="homeBtnHoverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC6A36" />
                    <stop offset="50%" stopColor="#E95D3A" />
                    <stop offset="100%" stopColor="#E24240" />
                  </linearGradient>
                </defs>

                {/* Base Default State (Dark translucent with #E24240 outline) */}
                <path
                  d="M 32 1.5 L 316 1.5 Q 324 1.5 329 8.5 L 344 28.5 Q 347.5 35.5 344 42.5 L 329 62.5 Q 324 69.5 316 69.5 L 32 69.5 Q 24 69.5 19 62.5 L 4 42.5 Q 0.5 35.5 4 28.5 L 19 8.5 Q 24 1.5 32 1.5 Z"
                  fill="rgba(8, 9, 18, 0.55)"
                  stroke="#E24240"
                  strokeWidth="2"
                />

                {/* Solid Orange-to-Red Gradient Hover Fill (Exact match to reference PNG) */}
                <path
                  d="M 32 1.5 L 316 1.5 Q 324 1.5 329 8.5 L 344 28.5 Q 347.5 35.5 344 42.5 L 329 62.5 Q 324 69.5 316 69.5 L 32 69.5 Q 24 69.5 19 62.5 L 4 42.5 Q 0.5 35.5 4 28.5 L 19 8.5 Q 24 1.5 32 1.5 Z"
                  fill="url(#homeBtnHoverGrad)"
                  stroke="url(#homeBtnHoverGrad)"
                  strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                />
              </svg>

              {/* Button Label in Exo 2 and Chevron Icon */}
              <span className="relative z-10 text-white font-exo2 text-[15px] sm:text-[16px] font-semibold tracking-wide">
                Begin Your Journey
              </span>
              <ChevronRight className="relative z-10 w-4 h-4 text-white stroke-[2.4] group-hover:translate-x-1 transition-transform duration-250" />
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
