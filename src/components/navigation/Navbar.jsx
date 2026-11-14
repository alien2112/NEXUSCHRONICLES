import { Search, Menu } from 'lucide-react';
import NasaLogo from '../NasaLogo';
import { nasaNavData } from '../../data/nasaNavData';
import siteContent from '../../data/siteContent.json';

const navCopy = siteContent.navigation.navbar;

export default function Navbar({
  currentPage = 'home',
  onNavigate,
}) {
  const handleNavClick = (key) => {
    if (!onNavigate) return;
    if (key === 'missions') {
      onNavigate('missions');
    } else if (key === 'explore') {
      onNavigate('home');
    } else if (key === 'discover') {
      onNavigate('investigation');
    } else if (key === 'about') {
      onNavigate('about');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full select-none pt-[env(safe-area-inset-top)]">
      {/* Converts dark N/U/S strokes of nnLogo 1B_.png to crisp white on dark space backgrounds while keeping orange E/X */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="nexusNavbarLogoFilter" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="-0.04 0 0 0.96 0  -0.65 0 0 0.96 0  -0.88 0 0 0.96 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {/*
        Navbar Bar Container
        Transparent on desktop; subtle top scrim on compact screens so scrolled content remains readable.
      */}
      <div className="relative w-full h-[56px] lg:h-[70px] bg-gradient-to-b from-[#02050d]/85 via-[#02050d]/45 to-transparent lg:bg-none lg:bg-transparent">
        {/* Foreground Content Container */}
        <div className="relative max-w-[1440px] mx-auto h-full px-2 min-[400px]:px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-1 min-[360px]:gap-1.5 lg:gap-0">
          {/* Left brand logo + quick back indicator (desktop) / compact nav (mobile/tablet) */}
          <div className="min-w-0 lg:min-w-32 flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('explore')}
              className="flex items-center shrink-0 cursor-pointer transition-transform hover:scale-105"
              aria-label={navCopy.brandLogo.alt}
              title={navCopy.brandLogo.title}
            >
              <img
                src={encodeURI(navCopy.brandLogo.src)}
                alt={navCopy.brandLogo.alt}
                style={{ filter: 'url(#nexusNavbarLogoFilter)' }}
                className="h-4 min-[400px]:h-5 sm:h-7 lg:h-9 w-auto object-contain select-none pointer-events-none"
                draggable={false}
              />
            </button>

            {/* Quick Back indicator on desktop lg+ if on missions or mars page */}
            {(currentPage === 'missions' || currentPage === 'mars') && (
              <button
                onClick={() => onNavigate && onNavigate(currentPage === 'mars' ? 'missions' : 'home')}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={currentPage === 'mars' ? navCopy.backToWorldsTitle : navCopy.backToHomeTitle}
              >
                <span className="text-white/40">‹</span>
                <span>{currentPage === 'mars' ? navCopy.backToWorlds : navCopy.backToHome}</span>
              </button>
            )}

            {/* Compact mobile/tablet navigation bar for destinations hidden inside lg:flex */}
            <nav aria-label="Compact navigation" className="lg:hidden flex items-center gap-0.5 min-[400px]:gap-1 sm:gap-3">
              <button
                type="button"
                onClick={() => handleNavClick('explore')}
                className={`px-1 sm:px-2 min-h-[36px] inline-flex items-center text-[10.5px] min-[400px]:text-[11.5px] sm:text-sm font-public font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentPage === 'home'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                Explore
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('missions')}
                className={`px-1 sm:px-2 min-h-[36px] inline-flex items-center text-[10.5px] min-[400px]:text-[11.5px] sm:text-sm font-public font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentPage === 'missions' || currentPage === 'mars'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                Missions
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('discover')}
                className={`px-1 sm:px-2 min-h-[36px] inline-flex items-center text-[10.5px] min-[400px]:text-[11.5px] sm:text-sm font-public font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentPage === 'investigation' || currentPage === 'case-board'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                    : 'text-white/95 hover:text-white'
                }`}
                title={navCopy.investigationTitle}
              >
                {navCopy.investigationLabel}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className={`px-1 sm:px-2 min-h-[36px] inline-flex items-center text-[10.5px] min-[400px]:text-[11.5px] sm:text-sm font-public font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentPage === 'about'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
                title="About Us, IRIS Mars Monitor & Sources"
              >
                About
              </button>
            </nav>
          </div>

          {/*
            Center Navigation Links: Explore, Missions, Investigation, About
            Direct links without toggle-down dropdowns.
          */}
          <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-7 xl:space-x-9">
            {nasaNavData.map((item) => {
              const isInvestigation = item.key === 'discover';
              const label = isInvestigation ? navCopy.investigationLabel : item.label;
              const isCurrent =
                (item.key === 'missions' && (currentPage === 'missions' || currentPage === 'mars')) ||
                (item.key === 'explore' && currentPage === 'home') ||
                (isInvestigation && (currentPage === 'investigation' || currentPage === 'case-board')) ||
                (item.key === 'about' && currentPage === 'about');

              const title = isInvestigation
                ? navCopy.investigationTitle
                : item.key === 'about'
                ? 'About Us, IRIS Mars Monitor & Sources'
                : undefined;

              return (
                <div key={item.key} className="relative">
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center gap-1.5 py-2 text-[15px] font-public font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                      isCurrent
                        ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                        : 'text-white/95 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                    }`}
                    title={title}
                  >
                    <span>{label}</span>
                  </button>

                  {/* Active Indicator Underline */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8]" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Group: Search Icon, Hamburger Menu, Divider, NASA Meatball Logo */}
          <div className="ml-auto flex items-center space-x-0.5 min-[400px]:space-x-1 sm:space-x-5 shrink-0">
            {/* Search Icon Button (Action disabled) */}
            <button
              type="button"
              className="p-0.5 min-[400px]:p-1.5 sm:p-2 text-white/90 rounded-full transition-all duration-150 cursor-default focus:outline-none"
              disabled
              aria-label={navCopy.searchAriaLabel}
            >
              <Search className="w-3.5 h-3.5 min-[400px]:w-4 min-[400px]:h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
            </button>

            {/* Hamburger Menu Button (Action disabled) */}
            <button
              type="button"
              className="p-0.5 min-[400px]:p-1.5 sm:p-2 text-white/90 rounded-lg transition-all duration-150 cursor-default focus:outline-none"
              disabled
              aria-label={navCopy.menuAriaLabel}
            >
              <Menu className="w-4 h-4 min-[400px]:w-[18px] min-[400px]:h-[18px] sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            {/* Vertical Divider Line */}
            <div className="h-6 w-[1px] bg-white/30 hidden sm:block" />

            {/* Official NASA Meatball Logo - Navigates Home */}
            <button
              type="button"
              aria-label={navCopy.returnHomeAriaLabel}
              className="flex items-center pl-0.5 sm:pl-1 cursor-pointer transition-transform hover:scale-105"
              title={navCopy.returnHomeTitle}
              onClick={() => handleNavClick('explore')}
            >
              <NasaLogo className="w-7 h-6 min-[400px]:w-9 min-[400px]:h-7.5 sm:w-11 sm:h-9.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
