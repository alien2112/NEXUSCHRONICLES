import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import EquipmentModal from './EquipmentModal';
import { worldsEquipmentData } from '../data/equipmentData';

export default function ChooseWorld({ onSelectMars }) {
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleCardClick = (worldId) => {
    if (worldId === 'mars' && onSelectMars) {
      onSelectMars();
    } else {
      setSelectedWorld(worldsEquipmentData[worldId]);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public">
      
      {/* 
        Full-Screen Cosmic Space Background:
        Using public/choose-world-background.png
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url('/choose-world-background.png')`,
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
            Choose a World
          </h1>

          <p className="text-sm sm:text-base md:text-[18px] text-slate-200/90 font-exo2 font-normal tracking-wide leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Discover the equipment left behind by NASA's
            <br className="hidden sm:inline" />
            {' '}missions on the Moon and Mars
          </p>

        </div>

        {/* 
          Two Planet Cards Row:
          - Cards dimensions strictly set to 296px * 328px
          - Without hover: clean card without purple outline
          - On hover: that purple outline illuminates alone as the hover effect
        */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-7 sm:gap-9 md:gap-11 w-full max-w-4xl mx-auto">
          
          {/* Card 1: The Moon */}
          <div
            onClick={() => handleCardClick('moon')}
            style={{
              width: '296px',
              height: '328px',
            }}
            className="group relative rounded-[28px] p-5 sm:p-6 flex flex-col justify-between items-center cursor-pointer select-none shrink-0"
            role="button"
            tabIndex={0}
            aria-label="Explore The Moon equipment"
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick('moon')}
          >
            {/* Background 1: Clean Card WITHOUT purple outline (default state) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                backgroundImage: `url('/choose-world-planets-background-clean.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Background 2: Card WITH purple outline (appears ALONE on hover) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                backgroundImage: `url('/choose-world-planets-background.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Top Planet Image */}
            <div className="relative z-10 w-[172px] h-[172px] sm:w-[180px] sm:h-[180px] flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
              <img
                src="/moon.png"
                alt="The Moon"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Bottom Info Row */}
            <div className="relative z-10 w-full flex items-center justify-between px-2 pb-1 pt-2 pointer-events-none">
              <div className="text-left">
                <h2 className="text-white font-medium text-lg sm:text-[20px] leading-tight tracking-wide font-public">
                  The Moon
                </h2>
                <p className="text-slate-400 text-xs sm:text-[13px] mt-0.5 font-normal tracking-wide">
                  3+ equipment
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
            onClick={() => handleCardClick('mars')}
            style={{
              width: '296px',
              height: '328px',
            }}
            className="group relative rounded-[28px] p-5 sm:p-6 flex flex-col justify-between items-center cursor-pointer select-none shrink-0"
            role="button"
            tabIndex={0}
            aria-label="Explore The Mars equipment"
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick('mars')}
          >
            {/* Background 1: Clean Card WITHOUT purple outline (default state) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                backgroundImage: `url('/choose-world-planets-background-clean.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Background 2: Card WITH purple outline (appears ALONE on hover) */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                backgroundImage: `url('/choose-world-planets-background.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Top Planet Image */}
            <div className="relative z-10 w-[172px] h-[172px] sm:w-[180px] sm:h-[180px] flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
              <img
                src="/mars.png"
                alt="The Mars"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Bottom Info Row */}
            <div className="relative z-10 w-full flex items-center justify-between px-2 pb-1 pt-2 pointer-events-none">
              <div className="text-left">
                <h2 className="text-white font-medium text-lg sm:text-[20px] leading-tight tracking-wide font-public">
                  The Mars
                </h2>
                <p className="text-slate-400 text-xs sm:text-[13px] mt-0.5 font-normal tracking-wide">
                  4+ equipment
                </p>
              </div>

              {/* Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0">
                <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Optional reference comparison dialog */}
        {showComparison && (
          <div className="w-full max-w-4xl mx-auto my-auto p-6 rounded-2xl bg-[#070b18]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 mt-10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Choose a World Reference Comparison
                </h4>
                <p className="text-xs text-gray-400">
                  Comparing your uploaded "Choose a World" reference image against the live component.
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
              <div>
                <div className="text-xs text-gray-400 font-mono mb-1.5 text-left">
                  Uploaded Reference Image:
                </div>
                <div className="rounded-xl overflow-hidden border border-white/15 bg-black">
                  <img
                    src="/choose-world-reference.jpg"
                    alt="Choose a World Reference"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Reference Comparison Control */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowComparison(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-cyan-400/50 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-xl cursor-pointer"
          title="Compare with reference"
        >
          {showComparison ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
          <span className="hidden sm:inline">{showComparison ? 'Hide Reference' : 'Compare Reference'}</span>
        </button>
      </div>

      {/* Equipment Interactive Dossier Modal */}
      <EquipmentModal
        world={selectedWorld}
        onClose={() => setSelectedWorld(null)}
      />

    </div>
  );
}
