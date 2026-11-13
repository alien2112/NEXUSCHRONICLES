import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import DrawerMenu from "./components/DrawerMenu";
import ChooseWorld from "./components/ChooseWorld";
import MarsPage from "./components/MarsPage";
import MarsMissionsPage from "./components/MarsMissionsPage";
import MarsInsightPage from "./components/MarsInsightPage";
import InsightMissionPage from "./components/InsightMissionPage";
import InsightStory1Page from "./components/InsightStory1Page";
import { ChevronRight, Eye, EyeOff, Sparkles } from "lucide-react";
import ExperiencePage from "./pages/ExperiencePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  // 'home' | 'missions' | 'mars' | 'mars-missions' | 'mars-insight' | 'insight-mission' | 'insight-story-1'

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === "#insight-story-1" ||
        hash === "#story-1" ||
        hash === "#story1" ||
        hash === "#page7"
      ) {
        setCurrentPage("insight-story-1");
      } else if (hash === "#3d") {
        setCurrentPage("3d");
      } else if (hash === "#insight-mission" || hash === "#page6") {
        setCurrentPage("insight-mission");
      } else if (
        hash === "#mars-insight" ||
        hash === "#page5" ||
        hash === "#insight"
      ) {
        setCurrentPage("mars-insight");
      } else if (
        hash === "#mars-missions" ||
        hash === "#mars-page4" ||
        hash === "#page4"
      ) {
        setCurrentPage("mars-missions");
      } else if (
        hash === "#mars" ||
        hash === "#the-mars" ||
        hash === "#page3"
      ) {
        setCurrentPage("mars");
      } else if (
        hash === "#missions" ||
        hash === "#choose-world" ||
        hash === "#worlds" ||
        hash === "#page2"
      ) {
        setCurrentPage("missions");
      } else if (hash === "#home" || hash === "" || hash === "#explore") {
        setCurrentPage("home");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    if (page === "insight-story-1") {
      window.location.hash = "#story-1";
    } else if (page === "insight-mission") {
      window.location.hash = "#insight-mission";
    } else if (page === "mars-insight") {
      window.location.hash = "#mars-insight";
    } else if (page === "mars-missions") {
      window.location.hash = "#mars-missions";
    } else if (page === "mars") {
      window.location.hash = "#mars";
    } else if (page === "missions") {
      window.location.hash = "#missions";
    } else if (page === "3d") {
      window.location.hash = "#3d";
    } else {
      window.location.hash = "#home";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-public select-none overflow-x-hidden bg-[#030611]">
      {/* 
        The Navigation Bar
        - Centers nav links (Explore, Missions, Discover, About)
        - Clean transparent background (no borders, no blur, no vignette)
        - Right icons: Search, Drawer Menu, Divider, Meatball Logo
      */}

      {currentPage !== "3d" && (
        <Navbar
          currentPage={currentPage}
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      )}

      {/* 
        CONDITIONAL PAGE RENDERING:
        0. 'insight-story-1' -> Page 7 ("The Machine That Took Mars's Pulse" - Story 1)
        1. 'insight-mission' -> Page 6 ("A Tiny Listener on a Big Planet" - Trailer Page)
        2. 'mars-insight'    -> Page 5 (Mars zoomed in with InSight card on the left of Mars)
        3. 'mars-missions'   -> Page 4 (Mars Horizon Map with 4 location pins)
        4. 'mars'            -> Page 3 (The Mars Planet Overview with 3 badges)
        5. 'missions'        -> Page 2 (Choose a World: Moon, Mars)
        6. 'home'            -> Page 1 (Main Hero with homepagebg.png, logo placeholder, Begin Your Journey)
      */}
      {currentPage === "insight-story-1" ? (
        <InsightStory1Page onBack={() => navigate("insight-mission")} />
      ) : currentPage === "insight-mission" ? (
        <InsightMissionPage
          onBack={() => navigate("mars-insight")}
          onWatchStory={() => navigate("insight-story-1")}
        />
      ) : currentPage === "3d" ? (
        <ExperiencePage onBack={() => navigate("mars-insight")} />
      ) : currentPage === "mars-insight" ? (
        <MarsInsightPage
          onBack={() => navigate("mars-missions")}
          onExploreMissions={() => navigate("insight-mission")}
          onExplore3D={() => navigate("3d")}
        />
      ) : currentPage === "mars-missions" ? (
        <MarsMissionsPage
          onBack={() => navigate("mars")}
          onSelectInsight={() => navigate("mars-insight")}
          onExploreInsight={() => navigate("mars-insight")}
          onOpenInsightMission={() => navigate("mars-insight")}
        />
      ) : currentPage === "mars" ? (
        <MarsPage
          onBack={() => navigate("missions")}
          onExploreMissions={() => navigate("mars-missions")}
          onNavigateHome={() => navigate("home")}
        />
      ) : currentPage === "missions" ? (
        <ChooseWorld
          onSelectMars={() => navigate("mars")}
          onNavigateHome={() => navigate("home")}
        />
      ) : (
        <>
          {/* 
            Full-Screen Wallpaper Background for Home
            Using user's provided file: public/homepagebg.png
          */}
          <div
            className="fixed inset-0 z-0 bg-cover bg-top sm:bg-center bg-no-repeat pointer-events-none select-none"
            style={{
              backgroundImage: `url('/homepagebg.png')`,
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
                title="Empty Logo Placeholder - Logo will be placed here">
                <div className="flex flex-col items-center gap-1 text-white/30 group-hover:text-white/50 transition-colors">
                  <span className="text-[11px] font-mono tracking-widest uppercase">
                    [ Logo Placeholder ]
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">
                    340 × 155 px
                  </span>
                </div>
              </div>

              {/* 
                Text under the logo (Rendered with Exo 2):
                "Every mission leaves a trace..."
                "Are you ready to uncover it ?"
              */}
              <div className="space-y-1 sm:space-y-1.5 pt-1 font-exo2">
                <p className="text-white text-base sm:text-lg md:text-[20px] lg:text-[21px] font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                  Every mission leaves a trace...
                </p>
                <p className="text-white text-base sm:text-lg md:text-[20px] lg:text-[21px] font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                  Are you ready to uncover it ?
                </p>
              </div>

              {/* 
                Button under the text:
                "Begin Your Journey >"
                Pointed corners with corner radius 10, hovering to deep vibrant red(#E24240)
              */}
              <div className="pt-2">
                <button
                  onClick={() => navigate("missions")}
                  className="relative group inline-flex items-center justify-between gap-4 px-8 sm:px-9 py-3 min-w-[230px] sm:min-w-[250px] h-[52px] transition-all duration-300 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
                  title="Begin Your Journey">
                  {/* Pointed hexagon border with corner radius 10 and intense #E24240 hover glow */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 drop-shadow-[0_0_10px_rgba(226,66,64,0.45)] group-hover:drop-shadow-[0_0_18px_#E24240] group-hover:drop-shadow-[0_0_35px_rgba(226,66,64,0.85)]"
                    viewBox="0 0 250 50"
                    preserveAspectRatio="none">
                    <path
                      d="M 29 1 L 221 1 Q 231 1 238 10 L 244 20 Q 249 25 244 30 L 238 40 Q 231 49 221 49 L 29 49 Q 19 49 12 40 L 6 30 Q 1 25 6 20 L 12 10 Q 19 1 29 1 Z"
                      fill="rgba(6, 8, 18, 0.55)"
                      stroke="rgba(226, 66, 64, 0.8)"
                      strokeWidth="1.6"
                      className="group-hover:stroke-[#E24240] group-hover:stroke-[2.2px] group-hover:fill-[rgba(226,66,64,0.35)] transition-all duration-300"
                    />
                  </svg>

                  {/* Button Label in Exo 2 and Chevron Icon */}
                  <span className="relative z-10 text-white font-exo2 text-[15px] sm:text-base font-semibold tracking-wide drop-shadow-md group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-300">
                    Begin Your Journey
                  </span>
                  <ChevronRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Optional comparison dialog if user toggles it */}
            {showComparison && (
              <div className="w-full max-w-4xl mx-auto my-auto p-6 rounded-2xl bg-[#070b18]/90 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 mt-12">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Reference Composition Comparison
                    </h4>
                    <p className="text-xs text-gray-400">
                      Comparing your uploaded composition against the live
                      implementation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer">
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1.5 text-left">
                      Uploaded Reference:
                    </div>
                    <div className="rounded-xl overflow-hidden border border-white/15 bg-black">
                      <img
                        src="/navbar-reference.jpg"
                        alt="Original Reference"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* 
            Bottom Floating Control (Discreet)
            Allows toggling comparison overlay
          */}
          <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
            <button
              onClick={() => setShowComparison((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-cyan-400/50 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-xl cursor-pointer"
              title="Compare with reference">
              {showComparison ? (
                <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="hidden sm:inline">
                {showComparison ? "Hide Reference" : "Compare Reference"}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Interactive NASA Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Interactive NASA Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </div>
  );
}
