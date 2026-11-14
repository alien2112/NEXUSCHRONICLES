import { Sun, BatteryCharging, ShieldCheck, Radio } from 'lucide-react';
import { EARTH_TRANSFER_CONNECTIONS } from './simulation';
import siteContent from '../../data/siteContent.json';

const CONNECTION_ICONS = {
  earth_solar: Sun,
  earth_microgrid: BatteryCharging,
  earth_resilient: ShieldCheck,
  earth_sensors: Radio,
};

const etCopy = siteContent.engineeringLegacy.panels.earthTransfer;

/**
 * Phase 5 visual transition from Mars Outpost to a terrestrial solar & resilient
 * infrastructure installation on Earth.
 */
export default function EarthTransferPanel() {
  return (
    <div className="space-y-4">
      {/* Isometric / Vector Earth Solar Installation Illustration */}
      <div className="relative border-l-2 border-[#38DDF5] border border-[#38DDF5]/35 bg-gradient-to-br from-[#071633] via-[#0A1430] to-[#050B1E] p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <img
            src={etCopy.imageSrc}
            alt={etCopy.imageAlt}
            className="w-full max-w-[280px] aspect-video object-cover shrink-0 border border-[#38DDF5]/45 shadow-lg"
          />

          <div className="space-y-2 text-left">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.18em] text-[#38DDF5] px-2.5 py-0.5 bg-[#38DDF5]/10 border border-[#38DDF5]/40">
              // {etCopy.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-orbitron font-bold uppercase tracking-wide text-[#EAF2FF] leading-snug">
              {etCopy.title}
            </h3>
            <p className="text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
              {etCopy.description}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Real-World Earth Connections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EARTH_TRANSFER_CONNECTIONS.map((item) => {
          const Icon = CONNECTION_ICONS[item.id] ?? Sun;
          return (
            <div
              key={item.id}
              className="game-option-card p-3.5 text-left flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-[#3478FF]/20 border border-[#38DDF5]/45 flex items-center justify-center shrink-0 text-[#38DDF5]">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-orbitron font-bold uppercase tracking-wide text-[#EAF2FF]">
                  {item.title}
                </h4>
                <p className="text-xs font-public text-slate-300 mt-1 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
