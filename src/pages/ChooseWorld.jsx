import { activateOnKeyboard } from '../utils/keyboard';
import { ArrowRight } from 'lucide-react';
import siteContent from '../data/siteContent.json';

const cwCopy = siteContent.chooseWorldPage;

export default function ChooseWorld({ onSelectMars }) {
  const handleMarsClick = () => {
    if (onSelectMars) {
      onSelectMars();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public">
      
      {/* 
        Full-Screen Cosmic Space Background:
        Using public/choose-world-background.webp
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url('${cwCopy.backgroundImage}')`,
        }}
      />

      {/* Subtle vignette for atmospheric depth */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* 
        Main Content Area:
        Positioned higher up on the screen right below the navbar (pt-20 sm:pt-24 md:pt-26 lg:pt-28)
      */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-20 sm:pt-24 md:pt-26 lg:pt-28 pb-16">
        
        {/* Header Block: Title & Subtitle */}
        <div className="max-w-2xl mx-auto text-center space-y-2.5 sm:space-y-3">
          
          <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-bold font-orbitron tracking-wider text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] leading-tight">
            {cwCopy.title}
          </h1>

          <p className="text-sm sm:text-base md:text-[18px] text-slate-200/90 font-exo2 font-normal tracking-wide leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {cwCopy.subtitleLines.map((line, idx) => (
              <span key={idx}>
                {idx > 0 && (
                  <>
                    <br className="hidden sm:inline" />
                    {' '}
                  </>
                )}
                {line}
              </span>
            ))}
          </p>

        </div>

        {/* 
          Two Planet Cards Row:
          - Cards dimensions strictly set to 296px * 328px
          - Without hover: clean card without purple outline
          - On hover: that purple outline illuminates alone as the hover effect
        */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-7 sm:gap-9 md:gap-11 w-full max-w-4xl mx-auto">
          
          {/* Card 1: The Moon (hover glow only, no click action) */}
          <div
            style={{
              width: '296px',
              height: '328px',
            }}
            className="group relative rounded-[28px] p-5 sm:p-6 flex flex-col justify-between items-center cursor-default select-none shrink-0"
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

            {/* Background 2: Card WITH purple outline (appears ALONE on hover) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                backgroundImage: `url('${cwCopy.cardBackgroundHover}')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Top Planet Image */}
            <div className="relative z-10 w-[172px] h-[172px] sm:w-[180px] sm:h-[180px] flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
              <img
                src={cwCopy.cards.moon.image}
                alt={cwCopy.cards.moon.imageAlt}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Bottom Info Row */}
            <div className="relative z-10 w-full flex items-center justify-between px-2 pb-1 pt-2 pointer-events-none">
              <div className="text-left">
                <h2 className="text-white font-medium text-lg sm:text-[20px] leading-tight tracking-wide font-public">
                  {cwCopy.cards.moon.name}
                </h2>
                <p className="text-slate-400 text-xs sm:text-[13px] mt-0.5 font-normal tracking-wide">
                  {cwCopy.cards.moon.countText}
                </p>
              </div>

              {/* Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
          </div>

          {/* Card 2: The Mars */}
          <div
            onClick={handleMarsClick}
            style={{
              width: '296px',
              height: '328px',
            }}
            className="group relative rounded-[28px] p-5 sm:p-6 flex flex-col justify-between items-center cursor-pointer select-none shrink-0"
            role="button"
            tabIndex={0}
            aria-label={cwCopy.cards.mars.ariaLabel}
            onKeyDown={e => activateOnKeyboard(e, handleMarsClick)}
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

            {/* Background 2: Card WITH purple outline (appears ALONE on hover) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                backgroundImage: `url('${cwCopy.cardBackgroundHover}')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Top Planet Image */}
            <div className="relative z-10 w-[172px] h-[172px] sm:w-[180px] sm:h-[180px] flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
              <img
                src={cwCopy.cards.mars.image}
                alt={cwCopy.cards.mars.imageAlt}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Bottom Info Row */}
            <div className="relative z-10 w-full flex items-center justify-between px-2 pb-1 pt-2 pointer-events-none">
              <div className="text-left">
                <h2 className="text-white font-medium text-lg sm:text-[20px] leading-tight tracking-wide font-public">
                  {cwCopy.cards.mars.name}
                </h2>
                <p className="text-slate-400 text-xs sm:text-[13px] mt-0.5 font-normal tracking-wide">
                  {cwCopy.cards.mars.countText}
                </p>
              </div>

              {/* Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
