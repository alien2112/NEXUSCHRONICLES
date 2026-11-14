import { Check } from 'lucide-react';
import { TRUST_OPTIONS } from './investigationData';
import siteContent from '../../data/siteContent.json';

const { trustMeterTitle } = siteContent.investigation;

/**
 * Interactive 5-point Trust Meter displayed beneath the NEXUS dialogue card in Tests 02-04 and Case Board.
 */
export default function TrustMeter({
  value,
  onChange,
  className = 'mt-3',
  variant = 'dark',
}) {
  const activeIdx = TRUST_OPTIONS.indexOf(value);
  const surfaceCls =
    variant === 'slate'
      ? 'bg-[#2a3146]/78'
      : 'bg-[#050a1b]/90';

  return (
    <div
      className={`${className} rounded-[18px] border border-[#F7961D]/80 ${surfaceCls} backdrop-blur-md px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col justify-between`}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-4 h-4 rounded-full bg-[#F7961D] text-[#1a0d00] flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span className="font-exo2 font-semibold text-xs sm:text-[14px] text-[#F7961D] tracking-wide">
          {trustMeterTitle}
        </span>
      </div>

      <div className="relative flex items-start justify-between px-1 my-auto">
        {/* Horizontal connecting line behind circles */}
        <div
          className="absolute top-[9px] left-4 right-4 h-[1px] bg-white/45 pointer-events-none"
        />
        {activeIdx >= 0 && (
          <div
            className="absolute top-[9px] left-4 h-[1.5px] bg-[#F7961D] transition-all duration-300 pointer-events-none"
            style={{
              width: activeIdx === 0 ? '0%' : `calc(${(activeIdx / (TRUST_OPTIONS.length - 1)) * 100}% - ${activeIdx === TRUST_OPTIONS.length - 1 ? '32px' : '16px'})`,
            }}
          />
        )}

        {TRUST_OPTIONS.map((option, idx) => {
          const isSelected = value === option;
          const isPassed = activeIdx >= 0 && idx <= activeIdx;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border transition-all duration-200 flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#F7961D] border-white shadow-[0_0_10px_rgba(247,150,29,0.75)] scale-110'
                    : isPassed
                    ? 'bg-[#F7961D]/45 border-[#F7961D]'
                    : 'bg-[#050a1b] border-white/65 group-hover:border-[#F7961D]'
                }`}
              />
              <span
                className={`text-[10px] sm:text-[11px] font-exo2 whitespace-nowrap transition-colors ${
                  isSelected ? 'text-[#F7961D] font-semibold' : 'text-white/85 group-hover:text-white'
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
