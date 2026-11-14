import { activateOnKeyboard } from '../utils/keyboard';

import { MARS_PINS } from '../data/marsMissionPins';

export default function MarsMissionsPage({ 
  onBack, 
  onSelectInsight
}) {
  const handlePinClick = (pin) => {
    if (pin.id === 'insight') {
      onSelectInsight?.();
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col select-none overflow-hidden font-public text-white bg-[#01040d]">
      
      {/* 
        Full-Screen Cosmic Deep Space Background
        Dark starry nebula matching the reference header sky.
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.webp')}')`,
        }}
      />

      {/* Deep space top vignette to ensure high contrast for the stars and navbar */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#02050e] via-[#02050e]/60 to-transparent" />

      {/* 
        Top Header Row: Back Button & "The Mars" Title
        Positioned pixel-perfect on the left below the top navbar:
        - Circle outline with centered thin back arrow
        - Futuristic "The Mars" title in Orbitron
      */}
      <div className="relative z-20 pt-20 sm:pt-24 md:pt-26 px-6 sm:px-10 md:px-14 lg:px-20 max-w-[1440px] w-full">
        <div className="inline-flex items-center gap-3.5 sm:gap-4 group">
          {/* Circular Back Button with thin border matching reference */}
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/80 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
            aria-label="Back to The Mars Overview"
            title="Back to The Mars Overview"
          >
            <svg 
              className="w-4 h-4 text-white transform group-hover:-translate-x-0.5 transition-transform duration-200" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* "The Mars" Heading in Orbitron */}
          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-bold font-orbitron tracking-wider text-white select-none leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            The Mars
          </h1>
        </div>
      </div>

      {/* 
        Mars Horizon Globe & Interactive Mission Location Pins Container
        The Mars curve rises across the lower ~80-85% of the viewport.
      */}
      <div className="fixed inset-x-0 bottom-0 top-0 z-10 pointer-events-none flex flex-col justify-end">
        
        <div className="relative w-full h-[78vh] sm:h-[82vh] md:h-[84vh] lg:h-[86vh] flex items-end justify-center">
          
          {/* Atmospheric Orange Rim Glow above the Mars horizon curve */}
          <div className="absolute inset-x-0 top-[-2%] sm:top-[-1%] h-24 sm:h-32 bg-gradient-to-t from-[#F7961D]/20 via-[#F7961D]/10 to-transparent blur-2xl pointer-events-none" />

          {/* Mars Horizon Image (public/mars-page4.webp) */}
          <img
            src="/mars-page4.webp"
            alt="Mars Horizon Surface"
            className="w-full h-full object-cover object-top select-none pointer-events-none drop-shadow-[0_-8px_25px_rgba(247,150,29,0.55)]"
          />

          {/* Interactive Mission Location Pins Overlay */}
          <div className="absolute inset-0 pointer-events-auto">
            {MARS_PINS.map((pin) => {
              const isInsight = pin.id === 'insight';
              return (
                <div
                  key={pin.id}
                  onClick={isInsight ? () => handlePinClick(pin) : undefined}
                  className={`absolute ${pin.positionClass} flex items-center select-none ${
                    isInsight
                      ? 'cursor-pointer group transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]'
                      : 'cursor-default'
                  }`}
                  role={isInsight ? 'button' : undefined}
                  tabIndex={isInsight ? 0 : undefined}
                  aria-label={`${pin.name} - ${pin.subtitle}`}
                  onKeyDown={isInsight ? (e) => activateOnKeyboard(e, () => handlePinClick(pin)) : undefined}
                >
                {/* 
                  Teardrop Map Pin Marker SVG:
                  - Solid pure black fill (#000000)
                  - Pale golden-cream outer stroke (#F5E6CA)
                  - Pale golden-cream solid inner circle dot (#F5E6CA)
                  - Drop shadow grounding the pin onto the Martian soil
                */}
                <div className={`${pin.pinWidth} ${pin.pinHeight} shrink-0 z-10 drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]`}>
                  <svg
                    viewBox="0 0 48 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    {/* Teardrop Silhouette */}
                    <path
                      d="M24 2.5C12.1 2.5 2.5 12.1 2.5 24C2.5 39.5 24 61.5 24 61.5C24 61.5 45.5 39.5 45.5 24C45.5 12.1 35.9 2.5 24 2.5Z"
                      fill="#000000"
                      stroke="#F5E6CA"
                      strokeWidth="2.8"
                      className="group-hover:stroke-[#F7961D] group-hover:drop-shadow-[0_0_8px_rgba(247,150,29,0.8)] transition-all duration-300"
                    />
                    {/* Inner Golden-Cream Center Dot */}
                    <circle
                      cx="24"
                      cy="23"
                      r="7.5"
                      fill="#F5E6CA"
                      className="group-hover:fill-[#F7961D] transition-colors duration-300"
                    />
                  </svg>
                </div>

                {/* 
                  Dark Frosted Label Badge / Capsule:
                  - Attached directly to the right of the pin (with subtle overlap -ml-2.5)
                  - Translucent dark black background with backdrop-blur
                  - Strictly left-aligned Title + Subtitle
                */}
                <div className={`-ml-2.5 sm:-ml-3 rounded-2xl bg-black/60 group-hover:bg-black/75 backdrop-blur-md border border-white/[0.08] group-hover:border-[#F7961D]/50 ${pin.cardPadding} text-left transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.65)] group-hover:shadow-[0_8px_30px_rgba(247,150,29,0.25)]`}>
                  {/* Mission Title (Orbitron, Bold, White) */}
                  <div className={`font-orbitron font-semibold text-white tracking-wider leading-tight ${pin.titleSizeClass} group-hover:text-white transition-colors`}>
                    {pin.name}
                  </div>
                  {/* Mission Subtitle / Status (Exo 2, Regular, Slate-300) */}
                  <div className={`font-exo2 text-slate-300/90 tracking-wide font-normal mt-0.5 leading-tight ${pin.subSizeClass}`}>
                    {pin.subtitle}
                  </div>
                </div>

              </div>
              );
            })}
          </div>

        </div>

      </div>

    </main>
  );
}
