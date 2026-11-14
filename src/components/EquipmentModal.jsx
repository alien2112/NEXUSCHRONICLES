import Modal from './Modal';
import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Compass, 
  Radio, 
  Rocket, 
  Activity, 
  Plane, 
  Crosshair, 
  Award, 
  Info,
  CheckCircle2
} from 'lucide-react';

const iconMap = {
  Rocket,
  Radio,
  Activity,
  Compass,
  Plane,
  Crosshair,
  Award,
};

export default function EquipmentModal({ world, onClose }) {
  const [selectedId, setSelectedId] = useState(null);

  if (!world) return null;

  const selectedEquipment = world.equipment.find(item => item.id === selectedId) || world.equipment[0];

  return (
    <Modal label="Equipment details" onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8   duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#070c1a]/95 border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden font-public text-white z-10">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <img 
              src={world.image} 
              alt={world.name} 
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-orbitron tracking-wide text-white">
                  {world.name}
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300">
                  {world.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NASA Surface Equipment & Heritage Artifacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two columns on medium+ screens */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          {/* Equipment Selector List (Left Column) */}
          <div className="md:col-span-5 p-4 sm:p-5 space-y-2.5 bg-black/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Documented Equipment ({world.equipment.length})
            </div>

            <div className="space-y-2">
              {world.equipment.map((item) => {
                const isSelected = selectedEquipment.id === item.id;
                const ItemIcon = iconMap[item.icon] || Rocket;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all duration-200 flex items-start gap-3 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/15'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'
                    }`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {item.category}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="font-mono">{item.mission}</span>
                        <span>•</span>
                        <span>{item.landingDate}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* World Environmental Telemetry Specs */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-2">
              <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                Planetary Environment
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Distance:</span>
                <span className="text-white font-mono">{world.distance}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Surface Gravity:</span>
                <span className="text-white font-mono">{world.gravity}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Atmosphere:</span>
                <span className="text-white font-mono">{world.atmosphere}</span>
              </div>
            </div>
          </div>

          {/* Equipment Detailed Dossier (Right Column) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            {selectedEquipment && (
              <div className="space-y-6">
                
                {/* Title & Badge */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedEquipment.status}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {selectedEquipment.name}
                  </h3>
                  <p className="text-sm text-blue-300/90 font-medium mt-1">
                    {selectedEquipment.category}
                  </p>
                </div>

                {/* Site & Telemetry Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 text-[11px] uppercase font-semibold">Landing Location</div>
                      <div className="text-white font-medium mt-0.5">{selectedEquipment.site}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5">{selectedEquipment.coordinates}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 text-[11px] uppercase font-semibold">Deployment Date</div>
                      <div className="text-white font-medium mt-0.5">{selectedEquipment.landingDate}</div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5">Program: {selectedEquipment.mission}</div>
                    </div>
                  </div>
                </div>

                {/* Summary Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    Equipment Mission Profile
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {selectedEquipment.summary}
                  </p>
                </div>

                {/* Key Facts / Engineering Achievements */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Historical & Scientific Milestones
                  </h4>
                  <ul className="space-y-2">
                    {selectedEquipment.keyFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* Footer action buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                NASA Planetary Data System (PDS)
              </span>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
              >
                Close Explorer
              </button>
            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
}
