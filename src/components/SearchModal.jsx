import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight, ExternalLink, Rocket } from 'lucide-react';
import { popularSearchSuggestions, nasaNavData } from '../data/nasaNavData';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input and handle shortcuts
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search items across all navigation data
  const allNavItems = [];
  nasaNavData.forEach(section => {
    section.columns.forEach(col => {
      col.items.forEach(item => {
        allNavItems.push({
          ...item,
          category: col.heading,
          section: section.label
        });
      });
    });
  });

  const filteredItems = query.trim() === ''
    ? []
    : allNavItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 animate-in fade-in duration-200">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#060a17]/95 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 text-left font-public">
        
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.03]">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search NASA missions, science, news, and multimedia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-[15px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-white mr-2 transition-colors cursor-pointer"
              title="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-gray-400 bg-white/10 px-2 py-0.5 rounded border border-white/10 select-none">
            ESC
          </span>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          
          {/* If search query has results */}
          {query.trim() !== '' && (
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-2 pb-1">
                {filteredItems.length > 0 ? `Results for "${query}"` : 'No direct matches found'}
              </div>

              {filteredItems.slice(0, 8).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (
                      item.name.toLowerCase().includes('moon') || 
                      item.name.toLowerCase().includes('mars') ||
                      item.section.toLowerCase().includes('mission')
                    ) {
                      if (onNavigate) onNavigate('missions');
                    }
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.category} · {item.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}

          {/* Popular searches / Suggested queries */}
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Popular Topics
            </div>
            <div className="flex flex-wrap gap-2 px-1">
              {popularSearchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(item)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 hover:border-blue-400/40 transition-all cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links to explore */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2">
              Official Portals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://plus.nasa.gov"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">NASA+ Streaming</div>
                  <div className="text-[11px] text-gray-400">Ad-free live events and shows</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>

              <a
                href="https://earth.gov"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">Earth Information Center</div>
                  <div className="text-[11px] text-gray-400">Climate data & satellite views</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
