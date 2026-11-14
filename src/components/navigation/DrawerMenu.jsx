import Modal from '../../components/Modal';
import { useState } from 'react';
import { X, ChevronDown, ExternalLink, Radio, Orbit } from 'lucide-react';
import NasaLogo from '../NasaLogo';
import { nasaNavData } from '../../data/nasaNavData';

export default function DrawerMenu({ isOpen, onClose, onOpenSearch, onNavigate }) {
  const [expandedSection, setExpandedSection] = useState('missions');

  if (!isOpen) return null;

  const handleSelectPage = (page) => {
    if (onNavigate) onNavigate(page);
    onClose();
  };

  return (
    <Modal label="Navigation menu" onClose={onClose} className="fixed inset-0 z-50 flex justify-end   duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-[#050914] border-l border-white/15 shadow-[-20px_0_60px_rgba(0,0,0,0.9)] flex flex-col z-10 font-public text-left text-gray-200">
        
        {/* Drawer Header with NASA Logo and Close Button */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleSelectPage('home')}
            title="Return to NASA Home"
          >
            <NasaLogo className="w-9 h-8" />
            <div>
              <div className="text-sm font-bold text-white tracking-wide">NASA</div>
              <div className="text-[11px] text-gray-400">National Aeronautics and Space Administration</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Quick Search Shortcut */}
          <button
            onClick={() => {
              onClose();
              if (onOpenSearch) onOpenSearch();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Search NASA archives & missions...</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300">Ctrl+K</span>
          </button>

          {/* Featured Choose a World Card */}
          <div 
            onClick={() => handleSelectPage('missions')}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/30 border border-blue-400/40 hover:border-blue-400/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase text-cyan-400 font-bold tracking-wider">
                <Orbit className="w-3.5 h-3.5 " />
                Featured Experience
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/30 text-white font-semibold">
                Explore Worlds
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
              Choose a World: Moon & Mars
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Discover the historic equipment and rovers left behind by NASA missions on the lunar regolith and Martian surface.
            </p>
          </div>

          {/* Collapsible Accordions for Explore, Missions, Discover, About */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-2">
              Navigation
            </div>

            {nasaNavData.map((section) => {
              const isExpanded = expandedSection === section.key;
              return (
                <div key={section.key} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="w-full flex items-center justify-between text-left font-semibold text-sm text-white hover:bg-white/5 transition-colors">
                    <button
                      onClick={() => {
                        if (section.key === 'missions') {
                          handleSelectPage('missions');
                        } else if (section.key === 'explore') {
                          handleSelectPage('home');
                        } else {
                          setExpandedSection(isExpanded ? null : section.key);
                        }
                      }}
                      className="flex-1 px-4 py-3 text-left cursor-pointer"
                    >
                      {section.label}
                    </button>
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                      className="p-3 text-gray-400 hover:text-white cursor-pointer"
                      title="Toggle subcategories"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5 bg-black/20">
                      {section.columns.map((col, cIdx) => (
                        <div key={cIdx} className="space-y-1.5">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                            {col.heading}
                          </div>
                          <div className="space-y-1 pl-1">
                            {col.items.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                onClick={() => {
                                  if (section.key === 'missions') {
                                    handleSelectPage('missions');
                                  } else {
                                    onClose();
                                  }
                                }}
                                className="block py-1 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
                              >
                                {sub.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Feeds and Portals */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-2">
              Official Live Services
            </div>
            
            <a
              href="https://plus.nasa.gov"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-white">NASA+ Streaming</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>

            <a
              href="https://www.nasa.gov/live"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">NASA TV & Coverage</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] text-xs text-gray-400 flex items-center justify-between">
          <span>nasa.gov</span>
          <span>Official US Government Space Agency</span>
        </div>

      </div>
    </Modal>
  );
}
