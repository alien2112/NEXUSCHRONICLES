import { ArrowLeft, ArrowRight, Box, Cpu, Layers, Orbit, Sparkles } from 'lucide-react';
import { activateOnKeyboard } from '../utils/keyboard';

export default function ExploreFurtherPage({
  onBackToCaseBoard,
  onGoDeeper,
  onGoTechnical,
  onSurvivalProtocol,
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#02050e]">
      {/* Cosmic Nebula Space Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{
            backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.webp')}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050e]/80 via-[#03081a]/62 to-[#02050e]/92" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-between pt-20 sm:pt-24 pb-10 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div>
          {/* Top Navigation Row */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            <button
              type="button"
              onClick={onBackToCaseBoard}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              aria-label="Back to Case Board"
              title="Back to Case Board"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2} />
            </button>

            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-[#F7961D]">
              Investigation 1 Complete · Case 1094
            </span>
          </div>

          {/* Centered Header */}
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto text-center inv-fade-up">
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold font-orbitron tracking-wider text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
              Choose Your Next Path
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-[18px] font-exo2 text-slate-200/90 leading-relaxed">
              Case 1094 is complete. Dive into the planetary science behind Mars&apos;s quakes, or inspect the 3D InSight lander that recorded them on the Martian surface.
            </p>
          </div>

          {/* Two Primary Choice Cards */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full inv-fade-up">
            {/* Card 1: Go Deeper (Science Behind It) */}
            <div
              role="button"
              tabIndex={0}
              onClick={onGoDeeper}
              onKeyDown={(e) => activateOnKeyboard(e, onGoDeeper)}
              aria-label="Go deeper: Science Behind It"
              className="group relative rounded-[24px] border border-white/20 hover:border-[#F7961D] bg-[#050b1f]/82 hover:bg-[#07102c]/90 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer shadow-[0_18px_48px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(247,150,29,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl border border-[#F7961D]/45 bg-[#F7961D]/12 flex items-center justify-center text-[#F7961D]">
                    <Orbit className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full border border-[#F7961D]/40 bg-[#F7961D]/10 text-[10px] font-mono uppercase tracking-[0.16em] text-[#F7961D]">
                    6 Chapters · Science
                  </span>
                </div>

                <h2 className="mt-5 text-2xl sm:text-[26px] font-bold font-orbitron text-white tracking-wide group-hover:text-[#F7961D] transition-colors">
                  Go Deeper
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-exo2 uppercase tracking-[0.14em] text-[#F7961D]/90 font-semibold">
                  Science Behind It
                </p>

                <p className="mt-3.5 text-sm sm:text-[15px] font-exo2 text-slate-200/90 leading-relaxed">
                  Explore how Mars whispers through cooling faults and meteoroid impacts, how seismic waves map a hidden core, and what Mars reveals about Earth.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/12 text-[11px] font-exo2 text-white/80">
                    1,323 Quakes
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/12 text-[11px] font-exo2 text-white/80">
                    Core Discovery
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/12 text-[11px] font-exo2 text-white/80">
                    Planetary Evolution
                  </span>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-white/55">
                  SCIENCE BRIEFING
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7961D]/90 group-hover:bg-[#F7961D] text-[#1a0d00] font-exo2 font-semibold text-xs sm:text-sm transition-all">
                  <span>Go deeper</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Go Technical (Engineering the Mission + 3D Lander) */}
            <div
              role="button"
              tabIndex={0}
              onClick={onGoTechnical}
              onKeyDown={(e) => activateOnKeyboard(e, onGoTechnical)}
              aria-label="Go technical: Engineering the Mission 3D"
              className="group relative rounded-[24px] border border-[#4DE2E8]/35 hover:border-[#4DE2E8] bg-[#050d22]/85 hover:bg-[#081533]/92 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer shadow-[0_18px_48px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(77,226,232,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl border border-[#4DE2E8]/45 bg-[#39A9FF]/15 flex items-center justify-center text-[#4DE2E8]">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#4DE2E8]/45 bg-[#39A9FF]/12 text-[10px] font-mono uppercase tracking-[0.16em] text-[#4DE2E8]">
                    <Sparkles className="w-3 h-3" />
                    10 Chapters · 3D Model
                  </span>
                </div>

                <h2 className="mt-5 text-2xl sm:text-[26px] font-bold font-orbitron text-white tracking-wide group-hover:text-[#4DE2E8] transition-colors">
                  Go Technical
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-exo2 uppercase tracking-[0.14em] text-[#4DE2E8]/90 font-semibold">
                  Engineering the Mission
                </p>

                <p className="mt-3.5 text-sm sm:text-[15px] font-exo2 text-slate-200/90 leading-relaxed">
                  Orbit the interactive 3D InSight lander on Elysium Planitia&apos;s Martian ground and inspect its solar arrays, robotic arm, SEIS dome, HP³ probe, and antennas.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#39A9FF]/10 border border-[#4DE2E8]/25 text-[11px] font-exo2 text-[#b8f4f8]">
                    <Layers className="w-3 h-3" />
                    3D Mars Terrain
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#39A9FF]/10 border border-[#4DE2E8]/25 text-[11px] font-exo2 text-[#b8f4f8]">
                    <Cpu className="w-3 h-3" />
                    Robotic Arm &amp; SEIS
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/12 text-[11px] font-exo2 text-white/80">
                    Deep Space Link
                  </span>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-white/55">
                  3D HARDWARE TOUR
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39A9FF] group-hover:bg-[#4DE2E8] text-[#06111f] font-exo2 font-semibold text-xs sm:text-sm transition-all">
                  <span>Go technical</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Optional Survival Protocol Strip */}
          {onSurvivalProtocol && (
            <div className="mt-6 max-w-5xl mx-auto rounded-2xl border border-[#4DE2E8]/30 bg-[#050c20]/75 backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4DE2E8]">
                  Optional Interactive Pass · 3D Rover Simulation
                </span>
                <p className="mt-0.5 text-sm font-exo2 text-white/85">
                  Ready to test your engineering instincts? Launch <strong className="text-white">Mars: The Survival Protocol</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={onSurvivalProtocol}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4DE2E8]/70 hover:bg-[#39A9FF]/20 text-[#4DE2E8] font-exo2 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                <span>Play Mars: The Survival Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
