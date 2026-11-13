import React, { useState, useEffect } from 'react';
import { ChevronRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function MarsInsightPage({ onBack, onExploreMissions }) {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Smoothly animate from Page 4 full horizon into the bottom-left zoomed Mars view
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsZoomedIn(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col select-none overflow-hidden font-public text-white bg-[#02050e]">
      
      {/* 
        Full-Screen Cosmic Space Nebula Background
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.png')}')`,
        }}
      />

      {/* Subtle upper sky vignette so navbar & header pop cleanly while keeping right-side nebula vibrant */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#02050d]/70 via-[#02050d]/25 to-transparent" />

      {/* 
        Top Header Row: Circular Back Button & "The Mars" Title
        Matches Page 4 & Page 5 reference position on the upper-left
      */}
      <div className="relative z-30 pt-20 sm:pt-24 md:pt-26 px-6 sm:px-10 md:px-14 lg:px-20 max-w-[1440px] w-full">
        <div className="inline-flex items-center gap-3.5 sm:gap-4 group">
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/80 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
            aria-label="Back to Mars Missions"
            title="Back to Mars Missions"
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

          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-bold font-orbitron tracking-wider text-white select-none leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            The Mars
          </h1>
        </div>
      </div>

      {/* 
        LEFT / BOTTOM-LEFT: Zoomed Mars Horizon (0vw to 60vw, 42vh to 100vh)
        - Starts from Page 4 full-width horizon state and smoothly zooms into the bottom-left corner
        - Leaves the right 40% of the screen open starry nebula space for the Insight card
      */}
      <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        <div
          style={{
            left: isZoomedIn ? '-56vw' : '0vw',
            bottom: isZoomedIn ? '-14vh' : '0vh',
            width: isZoomedIn ? '118vw' : '100vw',
            height: isZoomedIn ? '72vh' : '84vh',
          }}
          className="absolute transition-all duration-900 ease-out flex items-end justify-center"
        >
          {/* Mars Horizon Image (public/mars-page4.png) */}
          <img
            src="/mars-page4.png"
            alt="Mars Horizon Zoomed on Left"
            className="w-full h-full object-fill select-none pointer-events-none drop-shadow-[0_-10px_28px_rgba(247,150,29,0.65)]"
          />
        </div>

        {/* 
          "Insight / Full Mission" Pin & Framed Badge on the Left Zoomed Mars Surface
          Positioned at X ≈ 16.2%, Y ≈ 50-52% matching the reference image
        */}
        <div
          style={{
            left: isZoomedIn ? '16.2%' : '24%',
            top: isZoomedIn ? '51%' : '34%',
          }}
          className="absolute z-20 flex items-center gap-2.5 sm:gap-3.5 pointer-events-auto transition-all duration-900 ease-out"
        >
          {/* Teardrop Map Pin SVG */}
          <div className="w-11 h-14 sm:w-13 sm:h-17 md:w-14 md:h-18 shrink-0 drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]">
            <svg
              viewBox="0 0 48 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                d="M24 2.5C12.1 2.5 2.5 12.1 2.5 24C2.5 39.5 24 61.5 24 61.5C24 61.5 45.5 39.5 45.5 24C45.5 12.1 35.9 2.5 24 2.5Z"
                fill="#050811"
                stroke="#F5E6CA"
                strokeWidth="2.8"
              />
              <circle
                cx="24"
                cy="23"
                r="7.5"
                fill="#F5E6CA"
              />
            </svg>
          </div>

          {/* Framed Translucent Label Pill matching Reference */}
          <div className="rounded-[14px] bg-black/35 backdrop-blur-[2px] border border-[#F5E6CA]/75 px-5 sm:px-7 py-2 sm:py-3 text-center shadow-[0_6px_24px_rgba(0,0,0,0.55)]">
            <div className="font-orbitron font-semibold text-white text-base sm:text-[20px] tracking-wider leading-tight">
              Insight
            </div>
            <div className="font-exo2 text-white/90 text-xs sm:text-[13px] tracking-wide mt-1">
              Full Mission
            </div>
          </div>
        </div>
      </div>

      {/* 
        RIGHT SIDE: InSight Mission Detail Card
        Positioned on the right side of the screen (X ≈ 60% to 92%) over the cosmic nebula background
      */}
      <main className="relative z-20 flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 md:px-14 lg:px-20 pb-6 flex items-center justify-end pointer-events-none">
        
        <div className="w-[310px] sm:w-[345px] md:w-[375px] lg:w-[395px] shrink-0 pointer-events-auto animate-in fade-in slide-in-from-right-6 duration-500">
          <div className="rounded-[22px] bg-[#040814]/92 backdrop-blur-xl border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-4 sm:p-5">
            
            {/* Top Lander Photo */}
            <div className="w-full h-[165px] sm:h-[185px] md:h-[195px] rounded-[14px] overflow-hidden mb-3.5 bg-black/60">
              <img
                src="/insight-lander-photo.jpg"
                alt="NASA InSight Lander on Mars"
                className="w-full h-full object-cover object-center select-none pointer-events-none"
              />
            </div>

            {/* Title & Mission Years */}
            <div className="text-left">
              <h2 className="text-xl sm:text-[25px] font-bold font-orbitron text-white tracking-wide leading-tight">
                Insight
              </h2>
              <div className="text-xs sm:text-[14px] text-white/90 font-orbitron tracking-wider mt-1">
                Mars . 2018-2022
              </div>
            </div>

            {/* Mission Description */}
            <p className="text-xs sm:text-[13px] text-white/85 font-exo2 leading-[1.45] mt-2.5 text-left">
              NASA&apos;s Insight was a robotic lander that studied Mars&apos; interior, detecting marsquakes and measuring underground heat flow to understand the planet&apos;s structure.
            </p>

            {/* Mission Status */}
            <div className="text-sm sm:text-[15px] font-orbitron mt-3.5 text-left">
              <span className="text-[#E5C185] font-medium">Status:</span>{' '}
              <span className="text-white font-medium">Mission ended</span>
            </div>

            {/* Explore Missions Hexagonal Button */}
            <div className="mt-4 flex justify-start">
              <button
                onClick={onExploreMissions}
                className="relative group inline-flex items-center justify-between gap-3 px-6 sm:px-7 py-2.5 w-[215px] sm:w-[235px] h-[44px] sm:h-[46px] transition-all duration-300 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
                title="Explore Missions"
              >
                {/* Pointed Hexagon Border SVG */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(229,193,133,0.5)]"
                  viewBox="0 0 235 46" 
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 22 1.5 L 213 1.5 Q 220 1.5 225 8.5 L 231 18.5 Q 233.5 23 231 27.5 L 225 37.5 Q 220 44.5 213 44.5 L 22 44.5 Q 15 44.5 10 37.5 L 4 27.5 Q 1.5 23 4 18.5 L 10 8.5 Q 15 1.5 22 1.5 Z"
                    fill="rgba(4, 8, 20, 0.75)"
                    stroke="#E5C185"
                    strokeWidth="1.4"
                    className="group-hover:stroke-white group-hover:fill-[rgba(229,193,133,0.15)] transition-all duration-300"
                  />
                </svg>

                {/* Button Label & Chevron */}
                <span className="relative z-10 text-white font-exo2 text-sm sm:text-[15px] font-semibold tracking-wide mx-auto pl-1">
                  Explore Missions
                </span>
                <ChevronRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Floating Reference Comparison Control */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowComparison((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-[#F7961D]/60 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-xl cursor-pointer"
          title="Compare with Page 5 reference"
        >
          {showComparison ? <EyeOff className="w-3.5 h-3.5 text-[#F7961D]" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
          <span className="hidden sm:inline">{showComparison ? 'Hide Reference' : 'Compare Reference'}</span>
        </button>
      </div>

      {/* Reference Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl p-6 rounded-2xl bg-[#070b18]/95 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F7961D]" />
                  Page 5 Reference Comparison
                </h4>
                <p className="text-xs text-gray-400">
                  Comparing your uploaded Page 5 reference image against the live component.
                </p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-white/15 bg-black">
                <img
                  src="/page5-reference.jpg"
                  alt="Page 5 Reference"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
