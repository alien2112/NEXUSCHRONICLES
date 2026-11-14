import { useMemo, useState } from 'react';
import { Activity, ChevronRight, ExternalLink, Layers, MapPin, Radio, Waves } from 'lucide-react';
import { IRIS_MONITOR } from '../../data/aboutData';

export function HudMediaFrame({ src, alt, caption, className = '' }) {
  return (
    <figure className={`relative rounded-2xl border border-white/20 bg-[#050b1c]/70 p-2 sm:p-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.6)] ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1.5 -left-1.5 w-7 h-7 rounded-tl-2xl border-t border-l border-[#F7961D]/75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1.5 -right-1.5 w-7 h-7 rounded-tr-2xl border-t border-r border-[#F7961D]/75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-7 h-7 rounded-bl-2xl border-b border-l border-[#F7961D]/75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-br-2xl border-b border-r border-[#F7961D]/75"
      />
      <div className="overflow-hidden rounded-xl bg-black/50">
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 px-1.5 text-[11px] sm:text-xs font-exo2 text-slate-300/90 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function buildSeismicTracePath(eventId, channel, band) {
  const seedMap = {
    S1222a: { amp: 1.0, pX: 165, sX: 305, decay: 0.011, freq: 0.42 },
    S1094b: { amp: 0.72, pX: 190, sX: 355, decay: 0.015, freq: 0.56 },
    S1000a: { amp: 0.62, pX: 215, sX: 395, decay: 0.013, freq: 0.49 },
    S0235b: { amp: 0.68, pX: 150, sX: 280, decay: 0.017, freq: 0.61 },
  };
  const chScale = channel === 'BHZ' ? 1 : channel === 'BHR' ? 0.88 : 0.8;
  const bandFreq = band === 'high' ? 1.55 : 1.0;
  const cfg = seedMap[eventId] ?? seedMap.S1222a;

  const points = [];
  for (let x = 0; x <= 680; x += 3) {
    let y = 70;
    const microNoise = Math.sin(x * 0.73 + chScale * 4) * 2.2 + Math.cos(x * 1.19) * 1.5;

    if (x < cfg.pX) {
      y += microNoise * 0.7;
    } else if (x < cfg.sX) {
      const t = x - cfg.pX;
      const env = Math.exp(-t * 0.014) * cfg.amp * chScale * 24;
      y += Math.sin(t * cfg.freq * bandFreq) * env + microNoise;
    } else {
      const t = x - cfg.sX;
      const env = Math.exp(-t * cfg.decay) * cfg.amp * chScale * 52;
      const mod = 0.65 + 0.35 * Math.sin(t * 0.14);
      y += Math.sin(t * (cfg.freq + 0.22) * bandFreq) * env * mod + microNoise;
    }
    points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
  }
  return {
    path: points.join(' '),
    pX: cfg.pX,
    sX: cfg.sX,
  };
}

export function IrisMarsMonitorPreview() {
  const [selectedEventId, setSelectedEventId] = useState(IRIS_MONITOR.events[0].id);
  const [channel, setChannel] = useState('BHZ');
  const [band, setBand] = useState('low');

  const selectedEvent =
    IRIS_MONITOR.events.find((ev) => ev.id === selectedEventId) ?? IRIS_MONITOR.events[0];

  const trace = useMemo(
    () => buildSeismicTracePath(selectedEvent.id, channel, band),
    [selectedEvent.id, channel, band]
  );

  return (
    <section
      aria-labelledby="iris-monitor-heading"
      className="relative rounded-3xl border border-[#38bdf8]/35 bg-[#050b1c]/82 backdrop-blur-md p-5 sm:p-7 lg:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.72)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -left-2 w-9 h-9 rounded-tl-3xl border-t-2 border-l-2 border-[#38bdf8]/75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 -right-2 w-9 h-9 rounded-br-3xl border-b-2 border-r-2 border-[#F7961D]/80"
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38bdf8]/12 border border-[#38bdf8]/35 text-[11px] font-mono uppercase tracking-wider text-[#38bdf8]">
            <Radio className="w-3.5 h-3.5" />
            <span>{IRIS_MONITOR.sourceLabel}</span>
          </div>
          <h2
            id="iris-monitor-heading"
            className="mt-3 text-xl sm:text-2xl md:text-[28px] font-bold font-orbitron tracking-wide text-white"
          >
            {IRIS_MONITOR.title}
          </h2>
          <p className="mt-1.5 text-sm sm:text-[15px] font-exo2 text-slate-200/90 max-w-3xl leading-relaxed">
            {IRIS_MONITOR.subtitle}
          </p>
        </div>

        {/* Official External CTA Button */}
        <a
          href={IRIS_MONITOR.buttonHref}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#EC6A36] via-[#E95D3A] to-[#E24240] hover:brightness-110 text-white font-orbitron font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_10px_28px_rgba(226,66,64,0.4)] transition-all duration-200 shrink-0 active:scale-[0.98]"
        >
          <span>{IRIS_MONITOR.buttonLabel}</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      {/* Simulated Actual Mars Monitor Interface Frame */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-[#030713] overflow-hidden shadow-inner">
        {/* Browser / App Chrome Header */}
        <div className="px-4 py-2.5 bg-[#0a1326] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="inline-flex gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </span>
            <span className="text-[#38bdf8] font-semibold">IRIS · Mars Monitor</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline text-slate-400">iris.edu/app/mars-monitor</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#F7961D]">
              {IRIS_MONITOR.stationCode}
            </span>
            <span className="hidden md:inline text-slate-400">{IRIS_MONITOR.landingCoords}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Event Selector & Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Catalogued Marsquakes & Impacts
              </div>
              <div className="space-y-2">
                {IRIS_MONITOR.events.map((ev) => {
                  const active = ev.id === selectedEvent.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'border-[#F7961D] bg-[#F7961D]/12 shadow-[0_0_20px_rgba(247,150,29,0.18)]'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-orbitron text-xs font-bold text-white">{ev.id}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8]">
                          {ev.magnitude}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-exo2 text-slate-300 line-clamp-1">
                        {ev.type}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  SEIS Channel
                </div>
                <div className="flex rounded-lg border border-white/15 bg-black/40 p-0.5">
                  {['BHZ', 'BHR', 'BHT'].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`flex-1 py-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                        channel === ch
                          ? 'bg-[#38bdf8] text-[#02050e] font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Bandpass Filter
                </div>
                <div className="flex rounded-lg border border-white/15 bg-black/40 p-0.5">
                  {[
                    { id: 'low', label: '0.05-1Hz' },
                    { id: 'high', label: '1-8Hz' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBand(b.id)}
                      className={`flex-1 py-1 text-[10px] font-mono rounded-md transition-colors cursor-pointer ${
                        band === b.id
                          ? 'bg-[#F7961D] text-[#02050e] font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live-style Seismogram Viewport & Event Readout */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4">
            <div className="rounded-xl border border-white/10 bg-[#020612] p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <Activity className="w-4 h-4 text-[#F7961D]" />
                  <span>{selectedEvent.name}</span>
                </div>
                <span className="text-slate-400">
                  Channel {channel} · {band === 'low' ? selectedEvent.freqLow : selectedEvent.freqHigh}
                </span>
              </div>

              {/* Waveform Graph */}
              <div className="relative rounded-lg border border-white/10 bg-[#01040c] p-2">
                <svg
                  viewBox="0 0 680 140"
                  className="w-full h-[140px] sm:h-[165px]"
                  role="img"
                  aria-label={`Simulated Mars Monitor seismogram for ${selectedEvent.id} on channel ${channel}`}
                >
                  {/* Grid lines */}
                  {[35, 70, 105].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="680"
                      y2={y}
                      stroke="rgba(148,163,184,0.14)"
                      strokeDasharray={y === 70 ? undefined : '4 4'}
                    />
                  ))}
                  {[120, 240, 360, 480, 600].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="140"
                      stroke="rgba(148,163,184,0.1)"
                      strokeDasharray="3 4"
                    />
                  ))}

                  {/* P-wave & S-wave arrival guides */}
                  <line
                    x1={trace.pX}
                    y1="8"
                    x2={trace.pX}
                    y2="134"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text x={trace.pX + 5} y="19" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                    P-wave ({selectedEvent.pArrivalSec}s)
                  </text>

                  <line
                    x1={trace.sX}
                    y1="8"
                    x2={trace.sX}
                    y2="134"
                    stroke="#F7961D"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text x={trace.sX + 5} y="19" fill="#F7961D" fontSize="11" fontFamily="monospace">
                    S-wave ({selectedEvent.sArrivalSec}s)
                  </text>

                  {/* Seismogram trace */}
                  <path
                    d={trace.path}
                    fill="none"
                    stroke={band === 'low' ? '#38bdf8' : '#F7961D'}
                    strokeWidth="1.65"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Event Metadata Strip */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Date / Sol</div>
                  <div className="mt-0.5 font-exo2 font-semibold text-white">{selectedEvent.date}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Epicenter Distance</div>
                  <div className="mt-0.5 font-exo2 font-semibold text-[#F7961D]">{selectedEvent.distance}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Peak Acceleration</div>
                  <div className="mt-0.5 font-exo2 font-semibold text-[#38bdf8]">{selectedEvent.peakAccel}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Catalogue Refs</div>
                  <div className="mt-0.5 font-mono text-white">{selectedEvent.citations.join(' ')}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <p className="text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
                {selectedEvent.summary}
              </p>
              <a
                href={IRIS_MONITOR.buttonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-orbitron font-semibold text-[#F7961D] hover:text-white whitespace-nowrap transition-colors"
              >
                <span>Open Live IRIS App</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WavePropagationInteractive() {
  const [waveMode, setWaveMode] = useState('p');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setWaveMode('p')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-semibold border transition-colors cursor-pointer ${
            waveMode === 'p'
              ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
              : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          P-Waves (Compressional)
        </button>
        <button
          type="button"
          onClick={() => setWaveMode('s')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-semibold border transition-colors cursor-pointer ${
            waveMode === 's'
              ? 'bg-[#F7961D]/20 border-[#F7961D] text-[#F7961D]'
              : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          S-Waves (Shear)
        </button>
      </div>

      {/* Interactive Ray Path Through Mars */}
      <div className="rounded-xl border border-white/15 bg-[#030713] p-4">
        <svg
          viewBox="0 0 360 200"
          className="w-full h-auto"
          role="img"
          aria-label={
            waveMode === 'p'
              ? 'P-wave rays refracting through Mars mantle and liquid core'
              : 'S-wave rays traveling through Mars mantle and stopping at the liquid core boundary'
          }
        >
          {/* Outer crust & mantle */}
          <circle cx="180" cy="100" r="88" fill="#5c2314" stroke="#c88d5c" strokeWidth="3" />
          <circle cx="180" cy="100" r="78" fill="#7c2d12" />
          {/* Molten silicate base */}
          <circle cx="180" cy="100" r="48" fill="#ca8a04" opacity="0.55" />
          {/* Liquid core */}
          <circle cx="180" cy="100" r="42" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />

          {/* Quake source (top-left) */}
          <circle cx="104" cy="54" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          <text x="16" y="48" fill="#fca5a5" fontSize="10" fontFamily="monospace">
            Quake Source
          </text>

          {/* InSight SEIS receiver (top-right) */}
          <polygon points="256,50 262,59 250,59" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          <text x="266" y="54" fill="#bae6fd" fontSize="10" fontFamily="monospace">
            InSight SEIS
          </text>

          {waveMode === 'p' ? (
            <>
              <path d="M 104 54 Q 180 34 256 54" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
              <path d="M 104 54 Q 158 76 144 126 Q 176 142 218 124 Q 214 78 256 54" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="5 3" />
              <path d="M 104 54 L 154 78 L 204 128 L 246 160" fill="none" stroke="#7dd3fc" strokeWidth="1.6" />
              <text x="135" y="103" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                Liquid Core (P passes)
              </text>
            </>
          ) : (
            <>
              <path d="M 104 54 Q 180 34 256 54" fill="none" stroke="#F7961D" strokeWidth="2.2" />
              <path d="M 104 54 Q 134 90 144 79" fill="none" stroke="#F7961D" strokeWidth="2" />
              <line x1="140" y1="74" x2="149" y2="83" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="149" y1="74" x2="140" y2="83" stroke="#ef4444" strokeWidth="2.5" />
              <path d="M 104 54 L 146 84 L 114 148" fill="none" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="128" y="103" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                Liquid Core (S blocked)
              </text>
            </>
          )}
        </svg>
        <p className="mt-2.5 text-xs font-exo2 text-slate-300 leading-relaxed">
          {waveMode === 'p'
            ? 'P-waves travel fastest (~6–10 km/s in the mantle) and refract through Mars’s liquid iron-alloy core as PKP / SKS arrivals.'
            : 'S-waves cannot propagate through liquids. Their core shadow zone and ScS boundary reflections proved Mars has a molten metallic core.'}
        </p>
      </div>
    </div>
  );
}

export function MarsInteriorInteractive({ layers }) {
  const [selectedLayerId, setSelectedLayerId] = useState(layers[0].id);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? layers[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {layers.map((layer) => {
          const active = layer.id === selectedLayer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedLayerId(layer.id)}
              className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'border-[#F7961D] bg-[#F7961D]/15'
                  : 'border-white/15 bg-white/[0.03] hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color }}
                  aria-hidden="true"
                />
                <span className="font-orbitron text-xs font-semibold text-white">{layer.name}</span>
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#F7961D]">{layer.depth}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/15 bg-[#030713] p-3.5">
        <div className="flex items-center gap-2 text-xs font-orbitron text-white">
          <Layers className="w-4 h-4 text-[#F7961D]" />
          <span>{selectedLayer.name}</span>
          <span className="text-slate-400 font-mono">({selectedLayer.depth})</span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
          {selectedLayer.detail}
        </p>
      </div>
    </div>
  );
}

export function CerberusFossaeMapInteractive({ sites }) {
  const [activeSiteId, setActiveSiteId] = useState(sites[1].id);
  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border border-white/20 bg-[#030713] overflow-hidden">
        <img
          src="/story3top.png"
          alt="Global topographic map of Mars showing InSight at Elysium Planitia"
          className="w-full h-auto opacity-85 select-none pointer-events-none"
          loading="lazy"
          decoding="async"
        />
        <svg
          viewBox="0 0 100 50"
          className="absolute inset-0 w-full h-full"
          aria-label="Interactive Marsquake and tectonic region markers"
        >
          {/* Connection arcs from InSight to quake zones */}
          {sites
            .filter((s) => s.id !== 'insight')
            .map((s) => (
              <line
                key={`line-${s.id}`}
                x1="72"
                y1="23.5"
                x2={s.x}
                y2={s.y * 0.5}
                stroke={s.id === activeSite.id ? '#F7961D' : 'rgba(56,189,248,0.45)'}
                strokeWidth={s.id === activeSite.id ? '0.65' : '0.35'}
                strokeDasharray="1.2 1"
              />
            ))}

          {sites.map((site) => {
            const isSelected = site.id === activeSite.id;
            const cy = site.y * 0.5;
            return (
              <g
                key={site.id}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${site.name}`}
                onClick={() => setActiveSiteId(site.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSiteId(site.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <circle
                  cx={site.x}
                  cy={cy}
                  r={isSelected ? '2.6' : '1.9'}
                  fill={site.id === 'insight' ? '#38bdf8' : '#F7961D'}
                  stroke="#ffffff"
                  strokeWidth="0.55"
                />
                {isSelected && (
                  <circle
                    cx={site.x}
                    cy={cy}
                    r="4.2"
                    fill="none"
                    stroke="#F7961D"
                    strokeWidth="0.45"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Site selector chips */}
      <div className="flex flex-wrap gap-1.5">
        {sites.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => setActiveSiteId(site.id)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-exo2 border transition-colors cursor-pointer ${
              site.id === activeSite.id
                ? 'border-[#F7961D] bg-[#F7961D]/15 text-white font-semibold'
                : 'border-white/15 bg-white/[0.03] text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3 text-[#F7961D]" />
            <span>{site.name.split(' (')[0]}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/15 bg-[#030713] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-orbitron text-xs font-bold text-white">{activeSite.name}</span>
          <span className="text-[11px] font-mono text-[#38bdf8]">{activeSite.coords}</span>
        </div>
        <div className="mt-1 text-xs font-mono text-[#F7961D]">{activeSite.role}</div>
        <p className="mt-1.5 text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
          {activeSite.note}
        </p>
      </div>
    </div>
  );
}

export function CoreEvolutionTimeline({ stages }) {
  const maxRadius = 1830;

  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const widthPct = Math.round((stage.radiusKm / maxRadius) * 100);
        return (
          <div
            key={stage.year}
            className="rounded-xl border border-white/15 bg-[#030713] p-3.5 space-y-1.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-orbitron text-xs font-bold text-[#F7961D]">{stage.year}</span>
              <span className="font-mono text-xs font-semibold text-white">{stage.display}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#F7961D] to-[#E24240]"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-[#38bdf8]">{stage.method}</div>
            <p className="text-xs font-exo2 text-slate-300 leading-relaxed">{stage.finding}</p>
          </div>
        );
      })}
    </div>
  );
}

export function MantleDiscovery2025Diagram() {
  const lumps = [
    { cx: 112, cy: 62, r: 4.2 },
    { cx: 145, cy: 48, r: 3.1 },
    { cx: 215, cy: 52, r: 4.5 },
    { cx: 248, cy: 82, r: 3.6 },
    { cx: 92, cy: 105, r: 3.8 },
    { cx: 132, cy: 134, r: 4.4 },
    { cx: 235, cy: 132, r: 3.4 },
    { cx: 186, cy: 148, r: 4.0 },
  ];

  return (
    <div className="rounded-xl border border-white/15 bg-[#030713] p-4">
      <svg
        viewBox="0 0 360 185"
        className="w-full h-auto"
        role="img"
        aria-label="Illustration of Mars 2025 mantle discovery showing ancient 4 km impactor fragments scattered through the mantle"
      >
        <circle cx="180" cy="95" r="78" fill="#451a03" stroke="#c88d5c" strokeWidth="3" />
        <circle cx="180" cy="95" r="68" fill="#7c2d12" />
        <circle cx="180" cy="95" r="34" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />

        {/* Scattered 4 km ancient clasts */}
        {lumps.map((lump, idx) => (
          <g key={idx}>
            <circle cx={lump.cx} cy={lump.cy} r={lump.r} fill="#fdba74" stroke="#fff7ed" strokeWidth="0.9" />
            <circle cx={lump.cx} cy={lump.cy} r={lump.r + 3} fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="2 2" />
          </g>
        ))}

        {/* High-frequency scattered ray */}
        <path
          d="M 118 40 L 145 48 L 112 62 L 132 134 L 215 52 L 245 44"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />

        <text x="12" y="20" fill="#fdba74" fontSize="10" fontFamily="monospace">
          ~4 km Ancient Impactor Lumps (4.5 Gyr)
        </text>
        <text x="12" y="176" fill="#38bdf8" fontSize="10" fontFamily="monospace">
          High-frequency seismic scattering (NASA, Aug 2025)
        </text>
      </svg>
    </div>
  );
}
