import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Compass, ExternalLink, Search, Sparkles } from 'lucide-react';
import {
  ABOUT_HERO,
  ABOUT_SOURCES,
  DESIGN_PRIORITIES,
  IRIS_MONITOR,
  SOURCE_CATEGORIES,
} from '../data/aboutData';
import {
  CerberusFossaeMapInteractive,
  CoreEvolutionTimeline,
  HudMediaFrame,
  IrisMarsMonitorPreview,
  MantleDiscovery2025Diagram,
  MarsInteriorInteractive,
  WavePropagationInteractive,
} from '../components/about/AboutVisuals';

export default function AboutPage({ onBack, onExploreInvestigation, onExploreMissions }) {
  const [sourceCategory, setSourceCategory] = useState('all');
  const [sourceQuery, setSourceQuery] = useState('');

  const filteredSources = useMemo(() => {
    const query = sourceQuery.trim().toLowerCase();
    return ABOUT_SOURCES.filter((src) => {
      const matchesCat = sourceCategory === 'all' || src.category === sourceCategory;
      if (!matchesCat) return false;
      if (!query) return true;
      return (
        src.title.toLowerCase().includes(query) ||
        src.url.toLowerCase().includes(query) ||
        `[${src.num}]`.includes(query)
      );
    });
  }, [sourceCategory, sourceQuery]);

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#02050e]">
      {/* Cosmic Nebula Space Background matching MissionSeriesPage / MarsPage */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat opacity-70 scale-105"
          style={{
            backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.webp')}')`,
            backgroundPosition: 'right top',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020512]/92 via-[#03081a]/80 to-[#050b1c]/78" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e]/92 via-transparent to-[#02050e]/65" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-20 sm:pt-24 md:pt-26 pb-16 px-5 sm:px-10 md:px-14 lg:px-16 xl:px-20 max-w-[1360px] mx-auto w-full space-y-14 sm:space-y-16">
        {/* Hero & Mission Overview */}
        <section className="inv-fade-up">
          <div className="flex items-center gap-3 sm:gap-3.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                aria-label="Back to Home"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            )}
            <span className="text-lg sm:text-xl md:text-[23px] font-bold font-orbitron uppercase tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {ABOUT_HERO.sectionLabel}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold font-orbitron text-white leading-[1.15] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]">
                {ABOUT_HERO.title}
              </h1>
              <p className="text-base sm:text-lg md:text-[19px] font-exo2 font-medium text-[#F7961D] leading-snug">
                {ABOUT_HERO.subtitle}
              </p>
              <div className="space-y-4 pt-1 text-[15px] sm:text-[17px] font-exo2 text-slate-200 leading-relaxed">
                {ABOUT_HERO.missionStatement.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ABOUT_HERO.vitals.map((vital) => (
                <div
                  key={vital.label}
                  className="relative rounded-2xl border border-[#F7961D]/45 bg-[#050b1c]/75 backdrop-blur-md p-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {vital.label}
                  </div>
                  <div className="mt-1.5 text-2xl sm:text-[26px] font-bold font-orbitron text-white">
                    {vital.value}
                  </div>
                  <div className="mt-1 text-xs font-exo2 text-[#F7961D] leading-snug">
                    {vital.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured IRIS — Mars Monitor Interactive Experience */}
        <IrisMarsMonitorPreview />

        {/* Design Priority Visual Archive (All 7 Priority Topics) */}
        <section aria-labelledby="design-priority-heading" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#F7961D]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scientific Visuals &amp; Telemetry</span>
              </div>
              <h2
                id="design-priority-heading"
                className="mt-1.5 text-2xl sm:text-3xl font-bold font-orbitron text-white tracking-wide"
              >
                Core Visuals &amp; Telemetry Diagrams
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-exo2 text-slate-300 max-w-md">
              Seven essential seismic diagrams, waveforms, planetary maps, and discoveries powering the Nexus Chronicles experience.
            </p>
          </div>

          <div className="space-y-8">
            {/* 01. P-wave and S-wave propagation diagram */}
            <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[0].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[0].title}
                  </h3>
                  <p className="text-sm sm:text-base font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[0].summary}
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm font-exo2 text-slate-300">
                    {DESIGN_PRIORITIES[0].highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#F7961D] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1 text-xs font-mono text-slate-400">
                    Refs: {DESIGN_PRIORITIES[0].citations.join(' ')}
                  </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5">
                    <HudMediaFrame
                      src={DESIGN_PRIORITIES[0].image}
                      alt={DESIGN_PRIORITIES[0].imageAlt}
                      caption="Compressional P-wave vs. shear S-wave ground motion"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <WavePropagationInteractive />
                  </div>
                </div>
              </div>
            </article>

            {/* 02. Mars interior cross-section */}
            <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-4">
                  <HudMediaFrame
                    src={DESIGN_PRIORITIES[1].image}
                    alt={DESIGN_PRIORITIES[1].imageAlt}
                    caption="Cutaway cross-section: crust, mantle, basal molten layer & liquid core"
                  />
                </div>
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[1].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[1].title}
                  </h3>
                  <p className="text-sm sm:text-base font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[1].summary}
                  </p>
                  <MarsInteriorInteractive layers={DESIGN_PRIORITIES[1].layers} />
                  <div className="text-xs font-mono text-slate-400">
                    Refs: {DESIGN_PRIORITIES[1].citations.join(' ')}
                  </div>
                </div>
              </div>
            </article>

            {/* 03. S1222a seismic waveform */}
            <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[2].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[2].title}
                  </h3>
                  <p className="text-sm sm:text-base font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[2].summary}
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm font-exo2 text-slate-300">
                    {DESIGN_PRIORITIES[2].highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#F7961D] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1 text-xs font-mono text-slate-400">
                    Refs: {DESIGN_PRIORITIES[2].citations.join(' ')}
                  </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-7">
                    <HudMediaFrame
                      src={DESIGN_PRIORITIES[2].image}
                      alt={DESIGN_PRIORITIES[2].imageAlt}
                      caption="R/T/Z acceleration traces: S1222a vs. impacts S1094b & S1000a"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <HudMediaFrame
                      src={DESIGN_PRIORITIES[2].secondaryImage}
                      alt={DESIGN_PRIORITIES[2].secondaryImageAlt}
                      caption="SEIS Wind & Thermal Shield with S1222a peak waveform"
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* 04. Cerberus Fossae marsquake map */}
            <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <CerberusFossaeMapInteractive sites={DESIGN_PRIORITIES[3].sites} />
                </div>
                <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[3].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[3].title}
                  </h3>
                  <p className="text-sm sm:text-base font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[3].summary}
                  </p>
                  <p className="text-xs font-exo2 text-slate-400">
                    Click any marker or region pill on the map to inspect its seismic role relative to InSight.
                  </p>
                  <div className="pt-1 text-xs font-mono text-slate-400">
                    Refs: {DESIGN_PRIORITIES[3].citations.join(' ')}
                  </div>
                </div>
              </div>
            </article>

            {/* 05 & 06 Side-by-Side Row: Core evolution + 2025 mantle discovery */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {/* 05. Core evolution comparison */}
              <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[4].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[4].title}
                  </h3>
                  <p className="text-sm sm:text-[15px] font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[4].summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5">
                    <HudMediaFrame
                      src={DESIGN_PRIORITIES[4].image}
                      alt={DESIGN_PRIORITIES[4].imageAlt}
                      caption="Earth, Mars & Moon core ray comparison"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <CoreEvolutionTimeline stages={DESIGN_PRIORITIES[4].stages} />
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Refs: {DESIGN_PRIORITIES[4].citations.join(' ')}
                </div>
              </article>

              {/* 06. 2025 mantle discovery illustration */}
              <article className="rounded-3xl border border-white/15 bg-[#050b1c]/70 backdrop-blur-md p-5 sm:p-7 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                      {DESIGN_PRIORITIES[5].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                    {DESIGN_PRIORITIES[5].title}
                  </h3>
                  <p className="text-sm sm:text-[15px] font-exo2 text-slate-200 leading-relaxed">
                    {DESIGN_PRIORITIES[5].summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-6">
                    <MantleDiscovery2025Diagram />
                  </div>
                  <div className="sm:col-span-6">
                    <HudMediaFrame
                      src={DESIGN_PRIORITIES[5].image}
                      alt={DESIGN_PRIORITIES[5].imageAlt}
                      caption="Homogeneous vs. heterogeneous mantle & molten basal layer"
                    />
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs sm:text-sm font-exo2 text-slate-300">
                  {DESIGN_PRIORITIES[5].highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#F7961D] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-xs font-mono text-slate-400">
                  Refs: {DESIGN_PRIORITIES[5].citations.join(' ')}
                </div>
              </article>
            </div>

            {/* 07. IRIS Mars Monitor interactive experience summary banner */}
            <article className="rounded-2xl border border-[#38bdf8]/35 bg-[#050b1c]/75 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div>
                  <span className="text-xs font-mono text-[#F7961D] uppercase tracking-wider">
                    {DESIGN_PRIORITIES[6].tag}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white">
                  {DESIGN_PRIORITIES[6].title}
                </h3>
                <p className="text-sm font-exo2 text-slate-300 leading-relaxed">
                  {DESIGN_PRIORITIES[6].summary} Refs: {DESIGN_PRIORITIES[6].citations.join(' ')}
                </p>
              </div>
              <a
                href={IRIS_MONITOR.buttonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-[#F7961D] bg-[#F7961D]/15 hover:bg-[#F7961D] hover:text-[#02050e] text-white font-orbitron text-xs font-bold tracking-wider uppercase transition-all shrink-0"
              >
                <span>{IRIS_MONITOR.buttonLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </article>
          </div>
        </section>

        {/* Sources Section (Only those cited above) */}
        <section
          aria-labelledby="sources-heading"
          className="rounded-3xl border border-white/15 bg-[#050b1c]/80 backdrop-blur-md p-5 sm:p-7 lg:p-8 space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8]">
                <BookOpen className="w-4 h-4" />
                <span>Verified Reference Archive</span>
              </div>
              <h2
                id="sources-heading"
                className="mt-1.5 text-2xl sm:text-3xl font-bold font-orbitron text-white tracking-wide"
              >
                Sources (only those cited above)
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-exo2 text-slate-300">
                Showing {filteredSources.length} of {ABOUT_SOURCES.length} primary mission pages, press releases, datasets, and peer-reviewed papers.
              </p>
            </div>

            {/* Search input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
                placeholder="Filter by title, author, or [number]..."
                aria-label="Filter sources"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020612] border border-white/15 focus:border-[#F7961D] text-sm font-exo2 text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {SOURCE_CATEGORIES.map((cat) => {
              const active = sourceCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSourceCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-exo2 font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F7961D] border-[#F7961D] text-[#02050e] font-bold'
                      : 'bg-white/[0.04] border-white/15 text-slate-300 hover:text-white hover:border-white/30'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sources List */}
          {filteredSources.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm font-exo2 text-slate-300">
              No cited sources matched your filter. Try clearing the search box or choosing &ldquo;All Sources&rdquo;.
            </div>
          ) : (
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSources.map((src) => (
                <li
                  key={src.num}
                  className="rounded-xl border border-white/10 bg-[#020612]/80 hover:border-[#F7961D]/55 p-3.5 flex items-start gap-3 transition-colors"
                >
                  <span className="px-2 py-0.5 rounded-md bg-[#F7961D]/15 border border-[#F7961D]/40 text-[#F7961D] font-mono text-xs font-bold shrink-0">
                    [{src.num}]
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="text-xs sm:text-[13px] font-exo2 font-medium text-white leading-snug">
                      {src.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38bdf8] hover:text-white break-all transition-colors"
                      >
                        <span className="truncate max-w-[260px] sm:max-w-[320px]">{src.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      {src.secondaryUrl && (
                        <a
                          href={src.secondaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 border border-white/15 text-[10px] font-mono text-[#F7961D] transition-colors"
                        >
                          <span>{src.secondaryLabel}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Bottom Cross-Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white/10 text-xs sm:text-sm font-orbitron uppercase tracking-wider text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {onExploreMissions && (
              <button
                type="button"
                onClick={onExploreMissions}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#38bdf8]/50 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-xs sm:text-sm font-orbitron uppercase tracking-wider text-white transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#38bdf8]" />
                <span>Explore Missions</span>
              </button>
            )}
            {onExploreInvestigation && (
              <button
                type="button"
                onClick={onExploreInvestigation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#EC6A36] to-[#E24240] hover:brightness-110 text-xs sm:text-sm font-orbitron uppercase tracking-wider text-white font-semibold shadow-lg transition-all cursor-pointer"
              >
                <span>Open Investigation</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
