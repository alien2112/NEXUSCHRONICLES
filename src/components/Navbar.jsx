import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, ChevronDown, ExternalLink, Sparkles, Orbit } from 'lucide-react';
import NasaLogo from './NasaLogo';
import { nasaNavData } from '../data/nasaNavData';

export default function Navbar({ 
  currentPage = 'home',
  onNavigate,
  onOpenSearch, 
  onOpenDrawer 
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
    } else {
      setActiveDropdown((prev) => (prev === key ? null : key));
    }
  };

  const handleChevronClick = (e, key) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 w-full select-none"
    >
      {/* 
        Navbar Bar Container
        Completely transparent with no background box, border, or blur.
      */}
      <div className="relative w-full h-[70px] bg-transparent">
        
        {/* Foreground Content Container */}
        <div className="relative max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* Left area spacer */}
          <div className="w-12 sm:w-20 md:w-32 flex items-center shrink-0">
            {/* Quick Back indicator if on missions or mars page */}
            {(currentPage === 'missions' || currentPage === 'mars') && (
              <button
                onClick={() => onNavigate && onNavigate(currentPage === 'mars' ? 'missions' : 'home')}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={currentPage === 'mars' ? 'Back to Choose a World' : 'Return to Home Screen'}
              >
                <span className="text-white/40">‹</span>
                <span>{currentPage === 'mars' ? 'Worlds' : 'Home'}</span>
              </button>
            )}
          </div>

          {/* 
            Center Navigation Links: Explore, Missions, Discover, About
            DEAD-CENTER IN THE NAVBAR (Horizontally centered via absolute left-1/2 -translate-x-1/2)
          */}
          <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-7 xl:space-x-9">
            {nasaNavData.map((item) => {
              const isOpen = activeDropdown === item.key;
              const isCurrent = 
                (item.key === 'missions' && (currentPage === 'missions' || currentPage === 'mars')) ||
                (item.key === 'explore' && currentPage === 'home');

              return (
                <div key={item.key} className="relative">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleNavClick(item.key)}
                      className={`flex items-center gap-1.5 py-2 text-[15px] font-public font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                        isCurrent
                          ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold'
                          : isOpen
                          ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                          : 'text-white/95 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                      }`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <span
                        onClick={(e) => handleChevronClick(e, item.key)}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors"
                        title={`Open ${item.label} menu`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-white' : 'text-white/80 group-hover:text-white'
                          }`}
                          strokeWidth={2}
                        />
                      </span>
                    </button>
                  </div>

                  {/* Active Indicator Underline */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8]" />
                  )}

                  {/* Mega-Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[740px] max-w-[90vw] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
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
                                <Orbit className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                  <span>Choose a World: Moon & Mars Explorer</span>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">Interactive</span>
                                </div>
                                <div className="text-xs text-slate-300">
                                  Explore artifacts, rovers, and descent modules left by NASA missions
                                </div>
                              </div>
                            </div>

                            <button className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold shadow-lg transition-colors">
                              Open Page →
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
                              <span>Explore</span>
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
          <div className="ml-auto flex items-center space-x-4 sm:space-x-5 shrink-0">
            
            {/* Search Icon Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-full transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400/50"
              title="Search NASA (Ctrl+K)"
              aria-label="Open Search"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={onOpenDrawer}
              className="p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400/50"
              title="NASA Menu"
              aria-label="Open Menu Drawer"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Vertical Divider Line */}
            <div className="h-6 w-[1px] bg-white/30 hidden xs:block" />

            {/* Official NASA Meatball Logo - Navigates Home */}
            <div
              className="flex items-center pl-1 cursor-pointer transition-transform hover:scale-105"
              title="National Aeronautics and Space Administration (Return Home)"
              onClick={() => {
                setActiveDropdown(null);
                if (onNavigate) onNavigate('home');
              }}
            >
              <NasaLogo className="w-10 h-8.5 sm:w-11 sm:h-9.5" />
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}
