import { activateOnKeyboard } from '../../utils/keyboard';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, ChevronDown, ExternalLink, Sparkles, Orbit } from 'lucide-react';
import NasaLogo from '../NasaLogo';
import { nasaNavData } from '../../data/nasaNavData';
import siteContent from '../../data/siteContent.json';

const navCopy = siteContent.navigation.navbar;

export default function Navbar({ 
  currentPage = 'home',
  onNavigate
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (key) => {
    if (key === 'missions') {
      if (onNavigate) onNavigate('missions');
      setActiveDropdown(null);
    } else if (key === 'explore') {
      if (onNavigate) onNavigate('home');
      setActiveDropdown(null);
    }
  };

  const handleChevronClick = (e, key) => {
    if (key === 'about') return;
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 w-full select-none pt-[env(safe-area-inset-top)]"
    >
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
              onClick={() => {
                setActiveDropdown(null);
                if (onNavigate) onNavigate('home');
              }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  if (onNavigate) onNavigate('home');
                }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  if (onNavigate) onNavigate('missions');
                }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  if (onNavigate) onNavigate('investigation');
                }}
                className={`px-1 sm:px-2 min-h-[36px] inline-flex items-center text-[10.5px] min-[400px]:text-[11.5px] sm:text-sm font-public font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  currentPage === 'investigation' || currentPage === 'case-board'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                    : 'text-white/95 hover:text-white'
                }`}
                title={navCopy.investigationTitle}
              >
                {navCopy.investigationLabel}
              </button>
            </nav>
          </div>

          {/* 
            Center Navigation Links: Explore, Missions, Investigation, About
            DEAD-CENTER IN THE NAVBAR (Horizontally centered via absolute left-1/2 -translate-x-1/2)
          */}
          <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-7 xl:space-x-9">
            {nasaNavData.map((item) => {
              if (item.key === 'discover') {
                return (
                  <div key="investigation" className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        if (onNavigate) onNavigate('investigation');
                      }}
                      className={`flex items-center gap-1.5 py-2 text-[15px] font-public font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                        currentPage === 'investigation' || currentPage === 'case-board'
                          ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                          : 'text-white/95 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                      }`}
                      title={navCopy.investigationTitle}
                    >
                      <span>{navCopy.investigationLabel}</span>
                    </button>
                    {(currentPage === 'investigation' || currentPage === 'case-board') && (
                      <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8]" />
                    )}
                  </div>
                );
              }

              const isActionDisabled = item.key === 'about';
              const isOpen = !isActionDisabled && activeDropdown === item.key;
              const isCurrent = 
                (item.key === 'missions' && (currentPage === 'missions' || currentPage === 'mars')) ||
                (item.key === 'explore' && currentPage === 'home');

              return (
                <div key={item.key} className="relative">
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={isActionDisabled}
                      type="button"
                      onClick={isActionDisabled ? undefined : () => handleNavClick(item.key)}
                      className={`flex items-center gap-1.5 py-2 text-[15px] font-public font-medium tracking-wide transition-all duration-150 ${
                        isActionDisabled ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isCurrent
                          ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                          : isOpen
                          ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                          : 'text-white/95 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                      <span
                        role={isActionDisabled ? undefined : "button"}
                        aria-expanded={isActionDisabled ? undefined : isOpen}
                        aria-label={isActionDisabled ? undefined : `Open ${item.label} menu`}
                        tabIndex={isActionDisabled ? undefined : 0}
                        onKeyDown={e => activateOnKeyboard(e, () => setActiveDropdown(previous => previous === item.key ? null : item.key))}
                        onClick={isActionDisabled ? undefined : (e) => handleChevronClick(e, item.key)}
                        className={`p-0.5 rounded transition-colors ${isActionDisabled ? '' : 'hover:bg-white/10'}`}
                        title={isActionDisabled ? undefined : `Open ${item.label} menu`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-white' : 'text-white/80 group-hover:text-white'
                          }`}
                          strokeWidth={2}
                        />
                      </span>
                  </div>

                  {/* Active Indicator Underline */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8]" />
                  )}

                  {/* Mega-Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[740px] max-w-[90vw]    duration-200 z-50">
                      <div className="rounded-2xl bg-[#050b1a]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 text-left font-public">
                        
                        {/* Header of dropdown */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                          <div>
                            <h3 className="text-base font-bold text-white tracking-wide">{item.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                          {item.featured && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {item.featured.badge}
                            </span>
                          )}
                        </div>

                        {/* Interactive World Explorer Quick Card for Missions */}
                        {item.key === 'missions' && (
                          <div 
                            onClick={() => {
                              if (onNavigate) onNavigate('missions');
                              setActiveDropdown(null);
                            }}
                            className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-purple-600/25 border border-blue-400/30 flex items-center justify-between hover:border-blue-400/60 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
                                <Orbit className="w-5 h-5 text-cyan-400 " />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                  <span>{navCopy.missionsBanner.title}</span>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">{navCopy.missionsBanner.badge}</span>
                                </div>
                                <div className="text-xs text-slate-300">
                                  {navCopy.missionsBanner.description}
                                </div>
                              </div>
                            </div>

                            <button className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold shadow-lg transition-colors">
                              {navCopy.missionsBanner.cta}
                            </button>
                          </div>
                        )}

                        {/* Multi-column Category Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {item.columns.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                {col.heading}
                              </div>
                              <ul className="space-y-1.5">
                                {col.items.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <a
                                      href={sub.href || '#'}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (item.key === 'missions' && sub.name.toLowerCase().includes('moon')) {
                                          if (onNavigate) onNavigate('missions');
                                        }
                                        setActiveDropdown(null);
                                      }}
                                      className="block p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                      <div className="text-xs font-medium text-gray-200 group-hover:text-white">
                                        {sub.name}
                                      </div>
                                      <div className="text-[11px] text-gray-400 line-clamp-1 group-hover:text-gray-300">
                                        {sub.desc}
                                      </div>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Featured bottom bar if available */}
                        {item.featured && (
                          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                            <div className="text-gray-300">
                              <span className="font-semibold text-white mr-2">{item.featured.title}:</span>
                              <span className="text-gray-400">{item.featured.desc}</span>
                            </div>
                            <a
                              href={item.featured.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium shrink-0 ml-4"
                            >
                              <span>{navCopy.featuredExploreLabel}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                      </div>
                    </div>
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
              onClick={() => {
                setActiveDropdown(null);
                if (onNavigate) onNavigate('home');
              }}
            >
              <NasaLogo className="w-7 h-6 min-[400px]:w-9 min-[400px]:h-7.5 sm:w-11 sm:h-9.5" />
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}
