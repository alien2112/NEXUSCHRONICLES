import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  ChevronDown,
  ChevronUp,
  Compass,
  Cpu,
  Flame,
  Hammer,
  Layers,
  Pause,
  Pickaxe,
  Radio,
  Shield,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CHALLENGES,
  LEVELS,
  NEXUS_DIALOGUES,
  RESOURCE_TYPES,
  getLevelDef,
} from './gameData';
import { isLevelConditionMet } from './gameLogic';

function StatGauge({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[66px] sm:min-w-[82px]">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="inline-flex items-center gap-1 text-slate-300">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="hidden md:inline">{label}</span>
        </span>
        <span className="font-bold" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#101827] overflow-hidden border border-white/10">
        <div
          className="h-full transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function SurvivalHud({
  state,
  proximity,
  selectedBuildModuleId,
  onCancelBuildPlacement,
  onCollectNearby,
  onOpenBuild,
  onOpenInsight,
  onEmergencyAction,
  onCertifyLevel20,
  onPause,
  onToggleMute,
  onZoomIn,
  onZoomOut,
  onResetFollow,
  onTouchDrive,
}) {
  const [showLevelsList, setShowLevelsList] = useState(false);
  const [nexusExpanded, setNexusExpanded] = useState(true);

  const levelDef = getLevelDef(state.level);
  const activeChallenge = state.eventState.active ? CHALLENGES[state.eventState.active.type] : null;
  const nexusText = activeChallenge
    ? NEXUS_DIALOGUES[state.eventState.active.type]
    : levelDef.nexusHint;
  const level20Ready = state.level === 20 && isLevelConditionMet(state);

  const bindTouchKey = (key) => ({
    onPointerDown: () => onTouchDrive(key, true),
    onPointerUp: () => onTouchDrive(key, false),
    onPointerLeave: () => onTouchDrive(key, false),
    onPointerCancel: () => onTouchDrive(key, false),
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col p-2 sm:p-3.5 text-[#F4F7FA]">
      {/* TOP HUD */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
        {/* Top-Left: Title + Level + Resource Inventory */}
        <div className="pointer-events-auto game-panel-sm border border-[#39A9FF]/45 px-3 py-2 flex flex-wrap items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#39A9FF]/20 border border-[#39A9FF]/60 text-[10px] font-orbitron font-bold text-[#4DE2E8]">
                LEVEL {state.level} / 20
              </span>
              <span className="text-xs font-orbitron font-bold tracking-wide text-white hidden sm:inline">
                MARS: THE SURVIVAL PROTOCOL
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
              {RESOURCE_TYPES.map((res) => (
                <span
                  key={res.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-white/15"
                  style={{ backgroundColor: res.badgeBg }}
                >
                  <span className="text-slate-300">{res.label}:</span>
                  <span className="font-bold" style={{ color: res.color }}>
                    {state.inventory[res.id] ?? 0}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Right: Station Condition + Energy + Score + Audio/Pause */}
        <div className="pointer-events-auto game-panel-sm border border-[#39A9FF]/45 px-3 py-2 flex flex-wrap items-center gap-3 sm:gap-4">
          <StatGauge icon={Activity} label="HEALTH" value={state.missionStats.stationHealth} color="#45D483" />
          <StatGauge icon={Shield} label="STABILITY" value={state.missionStats.stability} color="#39A9FF" />
          <StatGauge icon={Flame} label="THERMAL" value={state.missionStats.thermalIntegrity} color="#FFB547" />
          <StatGauge
            icon={BatteryCharging}
            label="ENERGY"
            value={(state.missionStats.energy / Math.max(1, state.missionStats.energyMax)) * 100}
            color="#4DE2E8"
          />
          <div className="pl-2 border-l border-white/15 text-right">
            <div className="text-[9px] font-mono text-slate-400">SCORE</div>
            <div className="text-xs font-orbitron font-bold text-[#4DE2E8]">{state.score}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={state.settings.muted ? 'Unmute audio' : 'Mute audio'}
              className="p-1.5 rounded bg-[#1A2433] border border-white/15 hover:border-[#4DE2E8] cursor-pointer"
            >
              {state.settings.muted ? <VolumeX className="w-3.5 h-3.5 text-[#FF5555]" /> : <Volume2 className="w-3.5 h-3.5 text-[#4DE2E8]" />}
            </button>
            <button
              type="button"
              onClick={onPause}
              aria-label="Pause mission"
              className="p-1.5 rounded bg-[#1A2433] border border-white/15 hover:border-[#39A9FF] cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: LEFT MISSION/HAZARDS + RIGHT NEXUS/ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-1.5 sm:my-auto py-1 sm:py-2">
        {/* Left Panel */}
        <div className="pointer-events-auto w-full sm:w-[290px] lg:w-[310px] space-y-2">
          <div className="game-panel-sm border border-[#39A9FF]/45 border-l-2 border-l-[#4DE2E8] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4DE2E8]">
                {levelDef.act}
              </span>
              <button
                type="button"
                onClick={() => setShowLevelsList((v) => !v)}
                className="text-[10px] font-mono inline-flex items-center gap-1 px-2 py-0.5 bg-[#131E31] border border-[#39A9FF]/30 hover:border-[#4DE2E8] text-slate-200 cursor-pointer"
              >
                <Layers className="w-3 h-3 text-[#39A9FF]" />
                <span>20 Levels</span>
                {showLevelsList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <h2 className="mt-1 text-xs sm:text-sm font-orbitron font-bold text-white uppercase">{levelDef.title}</h2>
            <p className="mt-1 text-[11px] font-public text-slate-300 leading-snug">{levelDef.objective}</p>

            {state.level === 20 && (
              <button
                type="button"
                onClick={onCertifyLevel20}
                className={`game-cmd-btn mt-2.5 w-full py-2 font-orbitron font-bold text-[11px] uppercase cursor-pointer ${
                  level20Ready
                    ? 'bg-[#45D483] hover:bg-emerald-300 text-[#101827]'
                    : 'bg-[#1A2433] border border-[#FFB547]/50 text-[#FFB547]'
                }`}
              >
                Run Final Certification
              </button>
            )}

            {showLevelsList && (
              <div className="mt-2.5 pt-2 border-t border-white/10 max-h-44 overflow-y-auto space-y-1">
                {LEVELS.map((lvl) => {
                  const done = state.level > lvl.level;
                  const current = state.level === lvl.level;
                  return (
                    <div
                      key={lvl.level}
                      className={`px-2 py-1 rounded text-[10px] font-mono flex items-center justify-between ${
                        current
                          ? 'bg-[#39A9FF]/25 border border-[#4DE2E8]/60 text-white font-bold'
                          : done
                          ? 'bg-[#45D483]/15 text-[#45D483]'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="truncate">{lvl.title}</span>
                      <span>{done ? 'DONE' : current ? 'ACTIVE' : 'LOCKED'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {activeChallenge && (
            <div
              role="alert"
              className="game-panel-sm border border-[#FF5555]/75 border-l-4 border-l-[#FF5555] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-orbitron font-bold text-[#FF5555]">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span>{activeChallenge.title}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF5555]/20 text-[#FFB547]">
                  {state.eventState.active.phase.toUpperCase()} · {Math.ceil(state.eventState.active.timer)}s
                </span>
              </div>
              <p className="mt-1 text-[11px] font-public text-slate-200 leading-snug">
                {state.eventState.active.phase === 'warning'
                  ? activeChallenge.warningText
                  : activeChallenge.activeText}
              </p>
              <div className="mt-2 space-y-1.5">
                {activeChallenge.actions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => onEmergencyAction(act.id)}
                    className="w-full text-left p-2 rounded bg-[#1A2433] hover:bg-[#39A9FF]/20 border border-[#4DE2E8]/40 cursor-pointer transition-colors"
                  >
                    <div className="text-[11px] font-orbitron font-bold text-[#4DE2E8]">{act.label}</div>
                    <div className="text-[10px] font-mono text-slate-300">{act.detail}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: NEXUS Hologram + Quick Menus + Camera */}
        <div className="pointer-events-auto w-full sm:w-[270px] lg:w-[290px] space-y-2">
          <div className="hidden sm:block game-panel-sm border border-[#4DE2E8]/50 border-r-2 border-r-[#4DE2E8] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Animated NEXUS Circular Hologram */}
                <div className="relative w-7 h-7 rounded-full border border-[#4DE2E8] flex items-center justify-center bg-[#39A9FF]/15">
                  <span className="absolute inset-0 rounded-full border border-[#39A9FF]/50 animate-ping" />
                  <Cpu className="w-3.5 h-3.5 text-[#4DE2E8]" />
                </div>
                <div>
                  <div className="text-[11px] font-orbitron font-bold text-[#4DE2E8]">NEXUS AI</div>
                  <div className="text-[9px] font-mono text-slate-400">ADVISOR ONLINE</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNexusExpanded((v) => !v)}
                aria-label="Toggle NEXUS dialogue"
                className="text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
              >
                {nexusExpanded ? 'Hide' : 'Show'}
              </button>
            </div>
            {nexusExpanded && (
              <p className="mt-2 text-[11px] font-public text-slate-200 leading-relaxed border-t border-white/10 pt-2">
                {nexusText}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenBuild('build')}
              className="game-cmd-btn py-2 px-3 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-[11px] uppercase inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_16px_rgba(57,169,255,0.35)]"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Build (B)</span>
            </button>

            <button
              type="button"
              onClick={onOpenInsight}
              className={`game-cmd-btn py-2 px-3 border font-orbitron font-bold text-[11px] uppercase inline-flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                proximity.nearInsight
                  ? 'bg-[#4DE2E8] text-[#09111E] border-white animate-pulse'
                  : 'bg-[#131E31]/95 hover:border-[#4DE2E8] text-[#4DE2E8] border-[#4DE2E8]/55'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{proximity.nearInsight ? 'InSight (E)' : `InSight (${state.insightConsulted.length}/3)`}</span>
            </button>
          </div>

          {/* 3D Placement Prompt if selecting a slot on Mars */}
          {selectedBuildModuleId && (
            <div className="rounded-lg border border-[#45D483]/60 bg-[#101827]/95 p-2.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-mono text-[#45D483]">
                Click a green 3D pad slot on Mars to place module.
              </span>
              <button
                type="button"
                onClick={onCancelBuildPlacement}
                className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Camera Zoom & Follow Controls */}
          <div className="hidden sm:flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom camera in"
              className="p-1.5 rounded bg-[#101827]/85 border border-white/15 hover:border-[#4DE2E8] cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom camera out"
              className="p-1.5 rounded bg-[#101827]/85 border border-white/15 hover:border-[#4DE2E8] cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onResetFollow}
              className="px-2 py-1 rounded bg-[#101827]/85 border border-white/15 hover:border-[#4DE2E8] text-[10px] font-mono inline-flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3 h-3 text-[#4DE2E8]" />
              <span>Follow Rover</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM INTERFACE: FEEDBACK BANNER + INTERACTION PROMPT + CONTROLS + MOBILE D-PAD */}
      <div className="mt-auto flex flex-col items-center gap-2">
        {state.lastBanner && (
          <div
            role="status"
            className={`pointer-events-none px-4 py-1.5 rounded-full border text-xs font-exo2 font-semibold shadow-lg ${
              state.lastBanner.type === 'error'
                ? 'bg-[#101827]/95 border-[#FF5555]/70 text-[#FF5555]'
                : state.lastBanner.type === 'warning'
                ? 'bg-[#101827]/95 border-[#FFB547]/70 text-[#FFB547]'
                : 'bg-[#101827]/95 border-[#4DE2E8]/60 text-[#F4F7FA]'
            }`}
          >
            {state.lastBanner.text}
          </div>
        )}

        <div className="pointer-events-auto w-full max-w-4xl flex flex-wrap items-center justify-between gap-2">
          {/* Touch D-Pad for Mobile / Tablet */}
          <div className="flex lg:hidden items-center gap-1 bg-[#101827]/85 p-1 rounded-lg border border-white/15">
            <button
              type="button"
              aria-label="Steer Left"
              {...bindTouchKey('left')}
              className="p-2 rounded bg-[#1A2433] active:bg-[#39A9FF]/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Drive Forward"
              {...bindTouchKey('forward')}
              className="p-2 rounded bg-[#1A2433] active:bg-[#39A9FF]/40"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Drive Backward"
              {...bindTouchKey('backward')}
              className="p-2 rounded bg-[#1A2433] active:bg-[#39A9FF]/40"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Steer Right"
              {...bindTouchKey('right')}
              className="p-2 rounded bg-[#1A2433] active:bg-[#39A9FF]/40"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Controls Hint */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#101827]/85 border border-white/15 text-[11px] font-mono text-slate-300">
            <span><strong className="text-[#4DE2E8]">W A S D</strong> Drive Rover</span>
            <span><strong className="text-[#4DE2E8]">E</strong> Collect / InSight</span>
            <span><strong className="text-[#4DE2E8]">B</strong> Build Base</span>
            <span><strong className="text-[#4DE2E8]">Right-Drag / Scroll</strong> Camera</span>
            <span><strong className="text-[#4DE2E8]">ESC</strong> Pause</span>
          </div>

          {/* Contextual Action Trigger */}
          <div className="flex items-center gap-2 ml-auto">
            {proximity.nearestNode && (
              <button
                type="button"
                onClick={onCollectNearby}
                className="px-3.5 py-1.5 rounded-lg bg-[#45D483] hover:bg-emerald-300 text-[#101827] font-orbitron font-bold text-xs uppercase inline-flex items-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
              >
                <Pickaxe className="w-3.5 h-3.5" />
                <span>Collect {proximity.nearestNode.type.toUpperCase()} (E)</span>
              </button>
            )}
            {proximity.nearInsight && (
              <button
                type="button"
                onClick={onOpenInsight}
                className="px-3.5 py-1.5 rounded-lg bg-[#4DE2E8] hover:bg-cyan-200 text-[#101827] font-orbitron font-bold text-xs uppercase inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>ACCESS INSIGHT DATA (E)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
