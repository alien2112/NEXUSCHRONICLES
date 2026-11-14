import { 
  ArrowLeft, 
  ChevronRight, 
  Target, 
} from 'lucide-react';
import siteContent from '../data/siteContent.json';

const marsCopy = siteContent.marsPage;

function FeatureCardIcon({ id }) {
  if (id === 'missions') {
    return <Target className="w-7 h-7 text-white" strokeWidth={1.8} />;
  }
  if (id === 'feature') {
    return (
      <svg 
        className="w-7 h-7 text-white" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg 
      className="w-7 h-7 text-white" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <circle cx="12" cy="5.5" r="1.3" fill="currentColor" />
      <circle cx="12" cy="18.5" r="1.3" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function MarsPage({ onBack, onExploreMissions }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white">
      
      {/* 
        Full-Screen Cosmic Nebula Space Background
        Using user's provided file: خلفية فضائية سينمائية بسديم وكوكب مضيء.png
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url('${encodeURI(marsCopy.backgroundImage)}')`,
        }}
      />

      {/* Subtle atmospheric depth */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-24 sm:pt-28 md:pt-32 px-6 sm:px-10 md:px-14 lg:px-20 max-w-[1280px] mx-auto w-full pb-16">
        
        {/* Top Header Row: Back Button & "The Mars" Title (No glow) */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/70 hover:border-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label={marsCopy.backAriaLabel}
            title={marsCopy.backTitle}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Title in Orbitron without glow */}
          <h1 className="text-2xl sm:text-3xl md:text-[38px] font-bold font-orbitron tracking-wider text-white">
            {marsCopy.title}
          </h1>
        </div>

        {/* 
          Three-Column Layout:
          1. Left: Clean Mars Planet (mars-page-planet3rd.png) without glow
          2. Center: 3 Stacked Feature Badges with #F7961D stroke
          3. Right: "About Mars" Card with #F7961D stroke + "Explore Missions" Button with #F7961D stroke
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-center">
          
          {/* ======================================================== */}
          {/* COLUMN 1: Clean Mars Planet (No glow, no blue box)       */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-start">
            <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[330px] md:h-[330px] flex items-center justify-center">
              <img
                src={marsCopy.planetImage}
                alt={marsCopy.planetAlt}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2: Three Stacked Feature Badges (#F7961D stroke)  */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-5 w-full max-w-[360px] mx-auto">
            {marsCopy.featureCards.map((card) => (
              <div key={card.id} className="relative rounded-2xl border border-[#F7961D] bg-[#050816]/75 backdrop-blur-sm px-5 py-4 flex items-center gap-4 transition-colors duration-200">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <FeatureCardIcon id={card.id} />
                </div>

                <div className="text-left">
                  <div className="text-white font-exo2 font-semibold text-sm sm:text-[15px] tracking-wide">
                    {card.label}
                  </div>
                  <div className={`text-slate-300 font-public text-xs sm:text-[13px] tracking-wide mt-0.5${card.valueLines.length > 1 ? ' leading-snug' : ''}`}>
                    {card.valueLines.map((line, idx) => (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* COLUMN 3: "About Mars" Framed Card & Button (#F7961D)    */}
          {/* Frame sized to the image with top extension for text     */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4">
            
            {/* 
              The "About Mars" Card:
              - Exact width matching the image (w-[260px] sm:w-[275px])
              - Stroke color #F7961D
              - Top extension shows "About Mars" and subtitle on dark background
              - Image (rectangle-page3.png) sits flush edge-to-edge below the text with sharp top corners
            */}
            <div className="w-[260px] sm:w-[275px] rounded-[18px] border border-[#F7961D] bg-[#030617] overflow-hidden flex flex-col">
              
              {/* Top Extension for Text */}
              <div className="px-5 pt-5 pb-4 text-left bg-[#030617]">
                <h2 className="text-white font-orbitron font-bold text-lg sm:text-[20px] tracking-wide leading-tight">
                  {marsCopy.aboutCard.title}
                </h2>
                <p className="text-slate-200 font-exo2 text-xs sm:text-[13px] mt-1.5 leading-snug tracking-wide">
                  {marsCopy.aboutCard.subtitleLines.map((line, idx) => (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              {/* 
                The rectangle-page3 image flush inside the frame:
                - No inner padding
                - No rounded top corners
                - Framed directly by the outer #F7961D card border
              */}
              <img
                src={marsCopy.aboutCard.image}
                alt={marsCopy.aboutCard.imageAlt}
                className="w-full h-auto block select-none pointer-events-none rounded-none"
              />

            </div>

            {/* 
              Hexagonal Button: "Explore Missions >"
              - Stroke color #F7961D matching reference button
              - Transparent / subtle fill so cosmic nebula shows through
              - Opens Page 4 (MarsMissionsPage) when clicked
            */}
            <button
              onClick={onExploreMissions}
              className="relative group inline-flex items-center justify-between px-8 py-2.5 w-[260px] sm:w-[275px] h-[48px] transition-all duration-300 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
              title={marsCopy.ctaButton.title}
            >
              {/* Pointed hexagon border with #F7961D stroke */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(247,150,29,0.55)]"
                viewBox="0 0 227 50" 
                preserveAspectRatio="none"
              >
                <path
                  d="M 22 1.5 L 205 1.5 Q 213 1.5 218 9 L 224 20 Q 226 25 224 30 L 218 41 Q 213 48.5 205 48.5 L 22 48.5 Q 14 48.5 9 41 L 3 30 Q 1 25 3 20 L 9 9 Q 14 1.5 22 1.5 Z"
                  fill="rgba(3, 6, 23, 0.25)"
                  stroke="#F7961D"
                  strokeWidth="1.8"
                  className="group-hover:fill-[rgba(247,150,29,0.15)] transition-all duration-300"
                />
              </svg>

              {/* Button Label & Chevron */}
              <span className="relative z-10 text-white font-exo2 text-[15px] sm:text-[16px] font-semibold tracking-wide mx-auto pl-2">
                {marsCopy.ctaButton.label}
              </span>
              <ChevronRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}
