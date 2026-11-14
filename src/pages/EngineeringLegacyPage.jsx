import { useCallback, useEffect, useMemo, useState } from 'react';
import '../features/legacy/legacyHud.css';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Building2,
  Compass,
  Cpu,
  FlaskConical,
  Info,
  Radar,
  ShieldAlert,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import IsometricMarsCanvas from '../features/legacy/IsometricMarsCanvas';
import {
  EngineeringDecisionPanel,
  InsightLegacyModal,
  MissionSummaryModal,
} from '../features/legacy/LegacyPanels';
import {
  ENGINEERING_SCENARIOS,
  INITIAL_ASTRONAUT,
  INSIGHT_DIAGNOSTICS,
  MISSION_LEVELS,
  MODULE_DEFINITIONS,
  MODULE_ORDER,
  TERRAIN_META,
  applyDecisionOutcome,
  buildMissionAnalysis,
  clampStat,
  computeInitialOutpostStats,
  getMissionTelemetry,
  getTerrainType,
  validatePlacement,
} from '../features/legacy/simulation';
import siteContent from '../data/siteContent.json';

const elCopy = siteContent.engineeringLegacy;
const INTRO_LINES = elCopy.introLines;

const MODULE_ICONS = {
  habitat: Building2,
  solar: Sun,
  science: FlaskConical,
};

export default function EngineeringLegacyPage({ onReturnToNexus }) {
  const [phase, setPhase] = useState('intro'); // intro | arrival | build | build_ready | engineering | event_1 | event_2 | event_3 | summary
  const [introStep, setIntroStep] = useState(0);
  const [astronautTile, setAstronautTile] = useState(INITIAL_ASTRONAUT);
  const [buildings, setBuildings] = useState({});
  const [selectedBuildModule, setSelectedBuildModule] = useState('habitat');
  const [dragBuildModule, setDragBuildModule] = useState(null);
  const [hoverTile, setHoverTile] = useState(null);
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  const [stats, setStats] = useState({ energy: 68, safety: 70, science: 66 });
  const [discoveredLessons, setDiscoveredLessons] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const [showInsightModal, setShowInsightModal] = useState(false);
  const [inspectInsightPanels, setInspectInsightPanels] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [decisionResult, setDecisionResult] = useState(null);
  const [activeEffect, setActiveEffect] = useState(null);
  const [appliedUpgrades, setAppliedUpgrades] = useState({});
  const [collectedNodes, setCollectedNodes] = useState([]);
  const [scanPulse, setScanPulse] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Gentle auto-advance for the 4 short intro lines unless reduced motion or skipped
  useEffect(() => {
    if (phase !== 'intro') return undefined;
    if (introStep >= INTRO_LINES.length - 1) return undefined;
    const timer = setTimeout(() => {
      setIntroStep((prev) => Math.min(INTRO_LINES.length - 1, prev + 1));
    }, reducedMotion ? 900 : 1800);
    return () => clearTimeout(timer);
  }, [phase, introStep, reducedMotion]);

  const placedCount = Object.keys(buildings).length;
  const isOutpostBuilt = placedCount === MODULE_ORDER.length;

  const hoverCheck = useMemo(() => {
    if (phase !== 'build' || !hoverTile) return null;
    const mod = dragBuildModule || selectedBuildModule;
    if (!mod) return null;
    const terrain = getTerrainType(hoverTile.col, hoverTile.row);
    const result = validatePlacement(mod, hoverTile.col, hoverTile.row, buildings);
    return {
      ...result,
      terrainLabel: TERRAIN_META[terrain]?.label ?? elCopy.banners.defaultTerrainShort,
      moduleName: MODULE_DEFINITIONS[mod]?.shortName ?? elCopy.banners.defaultModuleShort,
    };
  }, [phase, hoverTile, dragBuildModule, selectedBuildModule, buildings]);

  const highlightedTarget = useMemo(() => {
    if (phase === 'arrival') return 'insight';
    if (phase === 'engineering' || phase === 'event_1') return 'solar';
    if (phase === 'event_2') return 'habitat';
    if (phase === 'event_3') return 'science';
    return null;
  }, [phase]);

  const solarDustLevel = useMemo(() => {
    if (phase === 'engineering') return 0.7;
    if (phase === 'event_1') return 0.95;
    if (activeEffect === 'clean') return 0.15;
    if (phase === 'event_2' || phase === 'event_3' || phase === 'summary') return 0.3;
    return 0;
  }, [phase, activeEffect]);

  const handlePlaceModule = useCallback(
    (moduleId, col, row) => {
      if (phase !== 'build') return;
      const check = validatePlacement(moduleId, col, row, buildings);
      if (!check.valid) {
        setFeedbackBanner({ type: 'error', text: check.reason });
        return;
      }

      const nextBuildings = { ...buildings, [moduleId]: { col, row } };
      setBuildings(nextBuildings);
      setDragBuildModule(null);

      const nextRemaining = MODULE_ORDER.find((id) => !nextBuildings[id]);
      setSelectedBuildModule(nextRemaining ?? null);

      const modName = MODULE_DEFINITIONS[moduleId]?.name ?? elCopy.banners.defaultModuleShort;
      setFeedbackBanner({
        type: 'success',
        text: `${modName} ${elCopy.banners.installedSuffix} ${check.hint}`,
      });

      if (Object.keys(nextBuildings).length === MODULE_ORDER.length) {
        const initialStats = computeInitialOutpostStats(nextBuildings, discoveredLessons);
        setStats({
          ...initialStats,
          science: clampStat(initialStats.science + collectedNodes.length * 4),
        });
        setPhase('build_ready');
      }
    },
    [phase, buildings, discoveredLessons, collectedNodes.length]
  );

  const handleInspectObject = useCallback(
    (obj) => {
      if (!obj) return;
      if (obj.kind === 'insight') {
        setShowInsightModal(true);
        return;
      }

      if (obj.kind === 'survey' && obj.node) {
        if (collectedNodes.includes(obj.node.id)) {
          setFeedbackBanner({
            type: 'info',
            text: `${obj.node.title}: Already sampled (${collectedNodes.length}/3 geological logs).`,
          });
          return;
        }
        setCollectedNodes((prev) => [...prev, obj.node.id]);
        if (isOutpostBuilt) {
          setStats((prev) => ({
            ...prev,
            science: clampStat(prev.science + obj.node.scienceBonus),
          }));
        }
        setFeedbackBanner({
          type: 'success',
          text: `${obj.node.title} sampled — ${obj.node.finding}`,
        });
        return;
      }

      if (obj.kind === 'module') {
        const currentScenario = ENGINEERING_SCENARIOS[phase];
        if (currentScenario && currentScenario.targetModule === obj.id) {
          setDecisionResult(null);
          setActiveScenarioId(currentScenario.id);
          return;
        }

        const pos = buildings[obj.id];
        const terrain = pos ? TERRAIN_META[getTerrainType(pos.col, pos.row)] : null;
        setFeedbackBanner({
          type: 'info',
          text: `${MODULE_DEFINITIONS[obj.id]?.name}${elCopy.banners.operationalInfix}${terrain?.label ?? elCopy.banners.defaultTerrain}.`,
        });
      }
    },
    [phase, buildings, collectedNodes, isOutpostBuilt]
  );

  const handleRunDiagnostic = useCallback(
    (diagId) => {
      if (discoveredLessons.includes(diagId)) return;
      const nextLessons = [...discoveredLessons, diagId];
      setDiscoveredLessons(nextLessons);

      const diag = INSIGHT_DIAGNOSTICS.find((d) => d.id === diagId);
      if (diag && isOutpostBuilt) {
        setStats((prev) => ({
          energy: clampStat(prev.energy + diag.bonus.energy),
          safety: clampStat(prev.safety + diag.bonus.safety),
          science: clampStat(prev.science + diag.bonus.science),
        }));
      }
      if (diag) {
        setFeedbackBanner({
          type: 'success',
          text: `${elCopy.banners.legacyUnlockedPrefix} ${diag.lesson}. ${diag.application}`,
        });
      }
    },
    [discoveredLessons, isOutpostBuilt]
  );

  const handleStartConstruction = useCallback(() => {
    setShowInsightModal(false);
    setPhase('build');
    setSelectedBuildModule('habitat');
    setFeedbackBanner({
      type: 'info',
      text: elCopy.banners.startConstruction,
    });
  }, []);

  const enterScenarioPhase = useCallback((nextPhase) => {
    const scenario = ENGINEERING_SCENARIOS[nextPhase];
    setPhase(nextPhase);
    setActiveEffect(null);
    setDecisionResult(null);
    setActiveScenarioId(null);

    if (scenario?.initialDrop) {
      setStats((prev) => ({
        energy: clampStat(prev.energy + scenario.initialDrop.energy),
        safety: clampStat(prev.safety + scenario.initialDrop.safety),
        science: clampStat(prev.science + scenario.initialDrop.science),
      }));
    }

    if (scenario) {
      const targetName = MODULE_DEFINITIONS[scenario.targetModule]?.name ?? elCopy.banners.defaultOutpostModule;
      setFeedbackBanner({
        type: 'warning',
        text: elCopy.banners.scenarioPromptTemplate
          .replace('{title}', scenario.title)
          .replace('{target}', targetName),
      });
    }
  }, []);

  const handleSelectOption = useCallback(
    (optionId) => {
      if (!activeScenarioId) return;
      const outcome = applyDecisionOutcome(stats, activeScenarioId, optionId, discoveredLessons);
      if (!outcome.option) return;

      setStats(outcome.nextStats);
      setActiveEffect(outcome.option.animation);
      setDecisionResult(outcome);
      setAppliedUpgrades((prev) => {
        if (activeScenarioId === 'engineering' || activeScenarioId === 'event_1') {
          return { ...prev, solar: outcome.option.animation };
        }
        if (activeScenarioId === 'event_2') {
          return { ...prev, thermal: outcome.option.animation };
        }
        if (activeScenarioId === 'event_3') {
          return { ...prev, seismic: outcome.option.animation };
        }
        return prev;
      });

      const scenario = ENGINEERING_SCENARIOS[activeScenarioId];
      setDecisions((prev) => [
        ...prev,
        {
          scenarioId: activeScenarioId,
          eventTitle: scenario.title,
          choiceLabel: outcome.option.label,
        },
      ]);
    },
    [activeScenarioId, stats, discoveredLessons]
  );

  const handleContinueAfterDecision = useCallback(() => {
    setActiveScenarioId(null);
    setDecisionResult(null);

    if (phase === 'engineering') {
      enterScenarioPhase('event_1');
    } else if (phase === 'event_1') {
      enterScenarioPhase('event_2');
    } else if (phase === 'event_2') {
      enterScenarioPhase('event_3');
    } else if (phase === 'event_3') {
      setPhase('summary');
      setShowSummaryModal(true);
      setFeedbackBanner({
        type: 'success',
        text: elCopy.banners.summaryComplete,
      });
    }
  }, [phase, enterScenarioPhase]);

  const handleRetryMission = useCallback(() => {
    setPhase('arrival');
    setAstronautTile(INITIAL_ASTRONAUT);
    setBuildings({});
    setSelectedBuildModule('habitat');
    setDragBuildModule(null);
    setHoverTile(null);
    setStats({ energy: 68, safety: 70, science: 66 });
    setDiscoveredLessons([]);
    setDecisions([]);
    setShowInsightModal(false);
    setInspectInsightPanels(false);
    setActiveScenarioId(null);
    setDecisionResult(null);
    setActiveEffect(null);
    setAppliedUpgrades({});
    setCollectedNodes([]);
    setScanPulse(0);
    setShowSummaryModal(false);
    setFeedbackBanner({
      type: 'info',
      text: elCopy.banners.missionReset,
    });
  }, []);

  const activeObjective = useMemo(() => {
    if (phase === 'arrival') {
      return {
        label: elCopy.objectives.arrival.label,
        text: elCopy.objectives.arrival.text,
        actionLabel: elCopy.objectives.arrival.actionLabel,
        onAction: () => setShowInsightModal(true),
      };
    }
    if (phase === 'build') {
      return {
        label: elCopy.objectives.build.labelTemplate.replace('{count}', placedCount),
        text: elCopy.objectives.build.text,
        actionLabel: null,
      };
    }
    if (phase === 'build_ready') {
      return {
        label: elCopy.objectives.buildReady.label,
        text: elCopy.objectives.buildReady.text,
        actionLabel: elCopy.objectives.buildReady.actionLabel,
        onAction: () => enterScenarioPhase('engineering'),
      };
    }
    if (phase === 'engineering' || phase === 'event_1' || phase === 'event_2' || phase === 'event_3') {
      const sc = ENGINEERING_SCENARIOS[phase];
      const modName = MODULE_DEFINITIONS[sc.targetModule]?.shortName ?? elCopy.banners.defaultModuleShort;
      return {
        label: sc.phaseLabel,
        text: sc.alertText,
        actionLabel: `${elCopy.objectives.openModulePrefix}${modName}`,
        onAction: () => {
          setDecisionResult(null);
          setActiveScenarioId(sc.id);
        },
      };
    }
    if (phase === 'summary') {
      return {
        label: elCopy.objectives.summary.label,
        text: elCopy.objectives.summary.text,
        actionLabel: elCopy.objectives.summary.actionLabel,
        onAction: () => setShowSummaryModal(true),
      };
    }
    return null;
  }, [phase, placedCount, enterScenarioPhase]);

  const analysis = useMemo(
    () => buildMissionAnalysis(stats, buildings, decisions, discoveredLessons),
    [stats, buildings, decisions, discoveredLessons]
  );

  const telemetry = useMemo(() => getMissionTelemetry(phase), [phase]);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050B1E] text-[#EAF2FF] font-public select-none overflow-hidden">
      {/* Main Interactive Game Container */}
      <main className="relative flex-1 flex flex-col pt-[68px] h-screen min-h-[600px]">
        {/* Full-bleed Isometric Mars Playfield */}
        <div className="relative flex-1 w-full overflow-hidden">
          <IsometricMarsCanvas
            phase={phase}
            buildings={buildings}
            astronautTile={astronautTile}
            selectedBuildModule={selectedBuildModule}
            dragBuildModule={dragBuildModule}
            highlightedTarget={highlightedTarget}
            activeEffect={activeEffect}
            appliedUpgrades={appliedUpgrades}
            collectedNodes={collectedNodes}
            scanPulse={scanPulse}
            inspectInsightPanels={inspectInsightPanels}
            solarDustLevel={solarDustLevel}
            reducedMotion={reducedMotion}
            onAstronautMoveComplete={setAstronautTile}
            onTileHover={setHoverTile}
            onPlaceModule={handlePlaceModule}
            onInspectObject={handleInspectObject}
          />

          {/* Responsive Floating Game HUD Wrapper: Desktop left/right split, Mobile clean stack */}
          <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-5 z-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 pointer-events-none">
            {/* Floating Top-Left Game HUD: Mission Wing + Level Progress + Active Objective */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full lg:w-auto lg:max-w-[490px] pointer-events-auto">
              <div className="game-hud-pill">
                <div className="game-hud-pill-inner px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={onReturnToNexus}
                        className="w-7 h-7 game-btn-ghost flex items-center justify-center shrink-0 cursor-pointer"
                        aria-label={elCopy.header.returnAriaLabel}
                        title={elCopy.header.returnTitle}
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-[#38DDF5]" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h1 className="text-xs sm:text-sm font-orbitron font-bold tracking-wider text-white truncate">
                            {elCopy.header.title}
                          </h1>
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#8B5CF6]/25 border border-[#8B5CF6]/55 text-[#EAF2FF] shrink-0">
                            {elCopy.header.badge}
                          </span>
                        </div>
                        <p className="text-[10px] font-exo2 text-slate-300/85 hidden md:block truncate">
                          {elCopy.header.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 bg-[#38DDF5]/15 border border-[#38DDF5]/45 text-[#38DDF5]">
                      SOL {String(telemetry.sol).padStart(2, '0')}/28
                    </span>
                  </div>

                  {/* 6-Level Mission Progression Stepper */}
                  <div
                    className="grid grid-cols-6 gap-1"
                    aria-label="Mission level progression"
                  >
                    {MISSION_LEVELS.map((lvl) => {
                      const isDone = telemetry.level > lvl.level || phase === 'summary';
                      const isCurrent = phase !== 'summary' && telemetry.level === lvl.level;
                      return (
                        <div
                          key={lvl.id}
                          className={`game-level-pip px-1 py-0.5 text-center text-[8px] sm:text-[9px] font-mono uppercase truncate ${
                            isCurrent
                              ? 'game-level-pip-active font-bold'
                              : isDone
                              ? 'game-level-pip-done'
                              : ''
                          }`}
                          title={`Level ${lvl.level} (Sol ${lvl.sol}): ${lvl.shortLabel}`}
                        >
                          <span className="hidden sm:inline">{lvl.shortLabel}</span>
                          <span className="sm:hidden">L{lvl.level}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Objective Directive */}
              {activeObjective && phase !== 'intro' && (
                <div
                  className={`game-frame ${
                    telemetry.hazardState === 'danger'
                      ? 'game-frame-danger'
                      : telemetry.hazardState === 'amber'
                      ? 'game-frame-amber game-hazard-pulse'
                      : ''
                  }`}
                >
                  <div className="game-frame-inner p-2.5 sm:p-3">
                    <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#38DDF5] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB35C]" />
                          <span>{activeObjective.label}</span>
                        </span>
                        <p className="text-xs sm:text-[13px] font-exo2 font-semibold text-white mt-0.5 leading-snug">
                          {activeObjective.text}
                        </p>
                      </div>
                      {activeObjective.actionLabel && (
                        <button
                          type="button"
                          onClick={activeObjective.onAction}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 game-btn-primary text-[11px] sm:text-xs font-exo2 uppercase cursor-pointer"
                        >
                          <span>{activeObjective.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="relative z-10 mt-1.5 text-[10px] font-mono text-slate-300/90 leading-snug">
                      {telemetry.triggerInfo}
                    </p>

                    {phase === 'event_3' && (
                      <div className="relative z-10 mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-[#38DDF5]">
                        <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>{elCopy.hud.seismicMonitorLabel}</span>
                        <svg viewBox="0 0 120 20" className="w-28 h-4" aria-hidden="true">
                          <polyline
                            fill="none"
                            stroke="#38DDF5"
                            strokeWidth="1.5"
                            points="0,10 18,10 24,4 30,17 36,2 42,18 48,7 54,13 62,10 80,10 86,6 92,14 98,10 120,10"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Top-Right Game HUD: Segmented Resource Gauges + InSight Console + Hover Telemetry */}
            <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto pointer-events-auto">
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
                {isOutpostBuilt && (
                  <div
                    className="game-hud-pill"
                    aria-label={elCopy.hud.statusAriaLabel}
                  >
                    <div className="game-hud-pill-inner px-2.5 sm:px-3 py-1.5 flex items-center gap-2.5 sm:gap-4">
                      {/* Energy Gauge */}
                      <div className="flex flex-col gap-1 min-w-[54px] sm:min-w-[84px]">
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                            <BatteryCharging className="w-3 h-3 text-[#FFB35C]" />
                            <span className="hidden sm:inline">{elCopy.hud.energyLabel}</span>
                          </span>
                          <span className="font-mono font-bold text-[#FFB35C]">{stats.energy}%</span>
                        </div>
                        <div className="h-1.5 w-full game-meter-track">
                          <div
                            className="h-full bg-gradient-to-r from-[#D87545] to-[#FFB35C] transition-all duration-300"
                            style={{ width: `${stats.energy}%` }}
                          />
                        </div>
                      </div>

                      {/* Habitat Safety Gauge */}
                      <div className="flex flex-col gap-1 min-w-[54px] sm:min-w-[96px]">
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                            <ShieldAlert className="w-3 h-3 text-[#38DDF5]" />
                            <span className="hidden sm:inline">{elCopy.hud.safetyLabel}</span>
                          </span>
                          <span className="font-mono font-bold text-[#38DDF5]">{stats.safety}%</span>
                        </div>
                        <div className="h-1.5 w-full game-meter-track">
                          <div
                            className="h-full bg-gradient-to-r from-[#3478FF] to-[#38DDF5] transition-all duration-300"
                            style={{ width: `${stats.safety}%` }}
                          />
                        </div>
                      </div>

                      {/* Science Gauge */}
                      <div className="flex flex-col gap-1 min-w-[54px] sm:min-w-[84px]">
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                            <FlaskConical className="w-3 h-3 text-[#8B5CF6]" />
                            <span className="hidden sm:inline">{elCopy.hud.scienceLabel}</span>
                          </span>
                          <span className="font-mono font-bold text-[#EAF2FF]">{stats.science}%</span>
                        </div>
                        <div className="h-1.5 w-full game-meter-track">
                          <div
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#38DDF5] transition-all duration-300"
                            style={{ width: `${stats.science}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {phase !== 'intro' && (
                  <button
                    type="button"
                    onClick={() => setShowInsightModal(true)}
                    className="game-hud-pill cursor-pointer group ml-auto lg:ml-0"
                  >
                    <span className="game-hud-pill-inner px-3 py-1.5 sm:py-2 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-exo2 font-semibold text-[#FFB35C] group-hover:text-white transition-colors">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{elCopy.hud.legacyButtonPrefix} ({discoveredLessons.length}/3)</span>
                    </span>
                  </button>
                )}
              </div>

              {phase !== 'intro' && (
                <div className="hidden sm:flex flex-wrap items-center justify-end gap-1.5">
                  <span className="game-telemetry-chip px-2.5 py-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-200">
                    <Thermometer className="w-3 h-3 text-[#38DDF5]" />
                    <span>{telemetry.temp}</span>
                  </span>
                  <span className="game-telemetry-chip px-2.5 py-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-200">
                    <Sun className="w-3 h-3 text-[#FFB35C]" />
                    <span>{telemetry.solarFlux}</span>
                  </span>
                  <span className="game-telemetry-chip px-2.5 py-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-200">
                    <Wind className="w-3 h-3 text-[#FFB35C]" />
                    <span>{telemetry.wind}</span>
                  </span>
                  <span className="game-telemetry-chip px-2.5 py-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-200">
                    <Activity className="w-3 h-3 text-[#8B5CF6]" />
                    <span>{telemetry.seismic}</span>
                  </span>
                </div>
              )}

              {phase !== 'intro' && (
                hoverCheck ? (
                  <div
                    className={`game-hud-pill self-end max-w-xs ${
                      hoverCheck.valid ? '' : 'game-frame-danger'
                    }`}
                  >
                    <div className="game-hud-pill-inner px-3 py-2 text-xs">
                      <div className="font-exo2 font-semibold text-white">
                        {hoverCheck.moduleName} → {hoverCheck.terrainLabel}
                      </div>
                      <div className="text-[11px] mt-0.5 text-slate-300">
                        {hoverCheck.valid ? hoverCheck.hint : hoverCheck.reason}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2 game-hud-pill">
                    <div className="game-hud-pill-inner px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-slate-300">
                      <Compass className="w-3.5 h-3.5 text-[#38DDF5]" />
                      <span>{elCopy.hud.controlsHint}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Contextual Tactical Feedback Banner */}
          {feedbackBanner && phase !== 'intro' && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-lg pointer-events-none ${
                phase === 'build' ? 'bottom-36 sm:bottom-44' : 'bottom-16 sm:bottom-20'
              }`}
            >
              <div
                className={`game-hud-pill ${
                  feedbackBanner.type === 'error'
                    ? 'game-frame-danger'
                    : feedbackBanner.type === 'warning'
                    ? 'game-frame-amber'
                    : ''
                }`}
              >
                <div
                  role="status"
                  className="game-hud-pill-inner px-4 py-2 text-xs sm:text-sm font-exo2 text-center text-[#EAF2FF]"
                >
                  {feedbackBanner.text}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Tactical Ops & Event Forecast Bar (active in exploration & hazard phases) */}
          {phase !== 'intro' && phase !== 'build' && (
            <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-3xl game-hud-pill">
              <div className="game-hud-pill-inner px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#FFB35C]/15 border border-[#FFB35C]/45 text-[#FFB35C] shrink-0">
                    NEXT EVENT
                  </span>
                  <span className="text-[11px] font-mono text-slate-200 truncate">
                    {telemetry.nextForecast}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScanPulse((prev) => prev + 1);
                    setFeedbackBanner({
                      type: 'info',
                      text: `Orbital scan complete (${collectedNodes.length}/3 geological samples logged). Click highlighted ground nodes to collect +4% Science.`,
                    });
                  }}
                  className="game-btn-cyan px-3 py-1 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-orbitron uppercase tracking-wider cursor-pointer shrink-0 ml-auto"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Scan Terrain ({collectedNodes.length}/3)</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 2 Tactical Construction Deck */}
          {phase === 'build' && (
            <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-3xl game-frame">
              <div className="game-frame-inner p-2.5 sm:p-3.5">
                <div className="relative z-10 flex items-center justify-between gap-2 mb-2 sm:mb-2.5 px-1">
                  <span className="text-[10px] sm:text-[11px] font-orbitron font-bold uppercase tracking-wider text-[#38DDF5]">
                    {elCopy.constructionDock.heading}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 hidden sm:inline">
                    {elCopy.constructionDock.subtext}
                  </span>
                </div>
                <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-3">
                  {MODULE_ORDER.map((id) => {
                    const mod = MODULE_DEFINITIONS[id];
                    const Icon = MODULE_ICONS[id];
                    const isPlaced = Boolean(buildings[id]);
                    const isSelected = selectedBuildModule === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={isPlaced}
                        draggable={!isPlaced}
                        onDragStart={(e) => {
                          setDragBuildModule(id);
                          setSelectedBuildModule(id);
                          e.dataTransfer?.setData('text/plain', id);
                        }}
                        onDragEnd={() => setDragBuildModule(null)}
                        onClick={() => setSelectedBuildModule(id)}
                        className={`text-left game-option-card p-2 sm:p-3 ${
                          isPlaced
                            ? 'opacity-55 cursor-default border-emerald-400/50'
                            : isSelected
                            ? 'border-[#38DDF5] shadow-[0_0_20px_rgba(56,221,245,0.28)] cursor-pointer'
                            : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-orbitron font-bold text-white min-w-0 max-w-full">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#050B1E] border border-white/15 flex items-center justify-center shrink-0">
                              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB35C]" />
                            </span>
                            <span className="truncate">{mod.shortName}</span>
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 shrink-0 ${
                              isPlaced
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : isSelected
                                ? 'bg-[#38DDF5]/20 text-[#38DDF5] border border-[#38DDF5]/50'
                                : 'bg-white/5 text-slate-300 border border-white/15'
                            }`}
                          >
                            {isPlaced
                              ? elCopy.constructionDock.statusBuilt
                              : isSelected
                              ? elCopy.constructionDock.statusSelected
                              : elCopy.constructionDock.statusSelect}
                          </span>
                        </div>
                        <p className="text-[11px] font-public text-slate-300 mt-1.5 line-clamp-2 hidden sm:block">
                          {mod.idealHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 1 Game Briefing Launch Menu */}
          {phase === 'intro' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gradient-to-t from-[#030714]/90 via-[#050B1E]/60 to-[#050B1E]/78 backdrop-blur-[3px]">
              <div className="w-full max-w-xl game-frame game-frame-amber">
                <div className="game-frame-inner overflow-hidden text-center">
                  <div className="game-console-bar px-5 py-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[#38DDF5]">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FFB35C] animate-pulse" />
                      <span>{elCopy.introOverlay.badge}</span>
                    </span>
                    <span className="text-[#FFB35C]">SOL 001 // BRIEFING</span>
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 space-y-5">
                    <div className="space-y-2.5 min-h-[120px] flex flex-col justify-center">
                      {INTRO_LINES.slice(0, introStep + 1).map((line, idx) => (
                        <p
                          key={line}
                          className={`font-exo2 text-base sm:text-lg transition-opacity duration-500 ${
                            idx === introStep ? 'text-white font-semibold' : 'text-slate-300'
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="border-l-2 border-[#FFB35C] border border-[#38DDF5]/20 bg-[#08132B]/85 px-3.5 py-2.5 text-xs font-public text-slate-300 flex items-start gap-2 text-left">
                      <Info className="w-4 h-4 text-[#FFB35C] shrink-0 mt-0.5" />
                      <span>{elCopy.introOverlay.disclaimer}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      {introStep < INTRO_LINES.length - 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setIntroStep((prev) => prev + 1)}
                            className="px-6 py-2.5 game-btn-cyan text-xs sm:text-sm font-orbitron uppercase cursor-pointer"
                          >
                            {elCopy.introOverlay.nextLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPhase('arrival');
                              setFeedbackBanner({
                                type: 'info',
                                text: elCopy.introOverlay.beginBannerText,
                              });
                            }}
                            className="px-5 py-2.5 game-btn-ghost text-xs sm:text-sm font-orbitron uppercase cursor-pointer"
                          >
                            {elCopy.introOverlay.skipLabel}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPhase('arrival');
                            setFeedbackBanner({
                              type: 'info',
                              text: elCopy.introOverlay.beginBannerText,
                            });
                          }}
                          className="inline-flex items-center gap-2 px-7 py-2.5 game-btn-primary text-xs sm:text-sm font-orbitron uppercase cursor-pointer"
                        >
                          <span>{elCopy.introOverlay.beginLabel}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showInsightModal && (
        <InsightLegacyModal
          phase={phase}
          discoveredLessons={discoveredLessons}
          inspectInsightPanels={inspectInsightPanels}
          onToggleInspectPanels={() => setInspectInsightPanels((prev) => !prev)}
          onRunDiagnostic={handleRunDiagnostic}
          onStartConstruction={handleStartConstruction}
          onClose={() => setShowInsightModal(false)}
        />
      )}

      {activeScenarioId && (
        <EngineeringDecisionPanel
          scenario={ENGINEERING_SCENARIOS[activeScenarioId]}
          decisionResult={decisionResult}
          onSelectOption={handleSelectOption}
          onContinue={handleContinueAfterDecision}
          onClose={() => setActiveScenarioId(null)}
        />
      )}

      {showSummaryModal && (
        <MissionSummaryModal
          analysis={analysis}
          onRetry={handleRetryMission}
          onReturnToNexus={onReturnToNexus}
        />
      )}
    </div>
  );
}
