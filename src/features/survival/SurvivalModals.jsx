import {
  Activity,
  AlertTriangle,
  ArrowUpCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Flame,
  Hammer,
  LogOut,
  Play,
  Radio,
  RotateCcw,
  Settings,
  Shield,
  Sliders,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import {
  INSIGHT_RECORDS,
  MODULE_BY_ID,
  MODULES_LIST,
  RESOURCE_BY_ID,
} from './gameData';
import { hasEnoughResources } from './gameLogic';

function CornerBrackets({ accent = '#4DE2E8' }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span
        className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2"
        style={{ borderColor: accent }}
      />
      <span
        className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2"
        style={{ borderColor: accent }}
      />
      <span
        className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2"
        style={{ borderColor: accent }}
      />
      <span
        className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2"
        style={{ borderColor: accent }}
      />
    </div>
  );
}

function TacticalDialogShell({
  ariaLabel,
  code,
  title,
  subtitle,
  accent = '#4DE2E8',
  closeAriaLabel,
  onClose,
  maxWidth = 'max-w-xl',
  headerRight = null,
  blueprint = false,
  children,
}) {
  return (
    <div
      role="dialog"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#060A13]/82 backdrop-blur-[3px]"
    >
      <div className={`relative w-full ${maxWidth} p-[1px] bg-gradient-to-br from-[#4DE2E8]/60 via-[#39A9FF]/25 to-[#D88752]/45 game-panel-bevel shadow-[0_30px_90px_rgba(0,0,0,0.88)]`}>
        <div
          className={`relative game-panel-bevel ${
            blueprint ? 'game-blueprint-grid' : 'game-scanlines'
          } text-[#F4F7FA] max-h-[89dvh] flex flex-col overflow-hidden`}
        >
          <CornerBrackets accent={accent} />

          {/* Tactical Window Top Bar */}
          <div className="relative px-4 sm:px-6 pt-4 pb-3.5 border-b border-[#39A9FF]/25 bg-gradient-to-r from-[#1A2433]/95 via-[#101827]/95 to-[#1A2433]/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                className="mt-0.5 w-1.5 h-9 shrink-0"
                style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
              />
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#D88752]">
                  <span>{code}</span>
                  {subtitle && (
                    <>
                      <span className="text-slate-600">//</span>
                      <span className="text-slate-400">{subtitle}</span>
                    </>
                  )}
                </div>
                <h2 className="mt-0.5 text-base sm:text-xl font-orbitron font-black tracking-wide text-white uppercase">
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {headerRight}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeAriaLabel}
                  className="game-cmd-btn p-2 bg-[#1A2433] border border-[#39A9FF]/35 hover:border-[#4DE2E8] hover:bg-[#39A9FF]/20 text-slate-200 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CostPills({ cost, inventory }) {
  const entries = Object.entries(cost).filter(([, qty]) => qty > 0);
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([key, qty]) => {
        const have = inventory[key] ?? 0;
        const ok = have >= qty;
        const meta = RESOURCE_BY_ID[key];
        return (
          <span
            key={key}
            className={`px-2 py-0.5 text-[10px] font-mono border uppercase tracking-wider ${
              ok
                ? 'bg-[#0B1322] border-[#45D483]/50 text-[#45D483]'
                : 'bg-[#1D1017] border-[#FF5555]/55 text-[#FF5555]'
            }`}
          >
            {meta?.label}: {have}/{qty}
          </span>
        );
      })}
    </div>
  );
}

function MenuRailButton({
  indexTag,
  label,
  sublabel,
  icon: Icon,
  primary = false,
  ghost = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative w-full game-cmd-btn px-4 py-3 flex items-center justify-between gap-3 text-left border ${
        primary
          ? 'bg-gradient-to-r from-[#39A9FF] via-[#4DE2E8] to-[#39A9FF] text-[#09111E] border-[#F4F7FA]/60 shadow-[0_0_28px_rgba(77,226,232,0.4)] hover:translate-x-1.5 cursor-pointer'
          : disabled
          ? 'bg-[#101827]/55 border-white/10 text-slate-500 cursor-not-allowed'
          : ghost
          ? 'bg-[#0D1422]/75 border-white/15 hover:border-[#D88752]/70 hover:bg-[#1A2433]/90 text-slate-300 hover:text-white hover:translate-x-1 cursor-pointer'
          : 'bg-[#131E31]/90 border-[#39A9FF]/35 hover:border-[#4DE2E8] hover:bg-[#1A2942] text-white hover:translate-x-1.5 cursor-pointer shadow-[inset_3px_0_0_rgba(77,226,232,0.55)]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden="true"
          className={`text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 border ${
            primary
              ? 'border-[#09111E]/30 bg-[#09111E]/15 text-[#09111E]'
              : disabled
              ? 'border-white/10 text-slate-600'
              : 'border-[#39A9FF]/35 bg-[#09111E]/70 text-[#4DE2E8]'
          }`}
        >
          {indexTag}
        </span>
        <Icon
          className={`w-4 h-4 shrink-0 ${
            primary
              ? 'text-[#09111E] fill-current'
              : disabled
              ? 'text-slate-600'
              : ghost
              ? 'text-[#D88752]'
              : 'text-[#4DE2E8]'
          }`}
        />
        <div className="min-w-0">
          <div className="font-orbitron font-bold text-xs sm:text-sm uppercase tracking-wider leading-snug">
            {label}
          </div>
          {sublabel && (
            <div
              aria-hidden="true"
              className={`text-[10px] font-mono truncate ${
                primary ? 'text-[#09111E]/75 font-semibold' : 'text-slate-400'
              }`}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>

      <ChevronRight
        aria-hidden="true"
        className={`w-4 h-4 shrink-0 transition-transform ${
          primary
            ? 'text-[#09111E] group-hover:translate-x-1'
            : disabled
            ? 'text-slate-700'
            : 'text-[#4DE2E8]/70 group-hover:text-[#4DE2E8] group-hover:translate-x-1'
        }`}
      />
    </button>
  );
}

export function MainMenuOverlay({
  hasSave,
  onStartNew,
  onContinue,
  onOpenHowToPlay,
  onOpenSettings,
  onReturnToNexus,
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 lg:p-10 bg-gradient-to-r from-[#070C16]/96 via-[#0B1220]/76 to-[#070C16]/20 overflow-y-auto">
      {/* Subtle Top/Bottom Cinematic Vignette + Faint Scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 game-scanlines bg-gradient-to-b from-[#070C16]/65 via-transparent to-[#070C16]/85"
      />

      {/* TOP TELEMETRY STRIP */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#39A9FF]/25 pb-3">
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-[#4DE2E8]">
          <span className="w-2 h-2 rounded-full bg-[#45D483] animate-pulse shadow-[0_0_8px_#45D483]" />
          <span>SECTOR // ELYSIUM PLANITIA · 4.502°N 135.623°E</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-300">
          <span>INSIGHT ARCHIVE: SYNCED</span>
          <span className="text-[#D88752]">SIMULATION BUILD v2.0</span>
        </div>
      </div>

      {/* CENTER-LEFT COMMAND INTERFACE + RIGHT LIVE 3D PREVIEW TELEMETRY */}
      <div className="relative z-10 my-auto py-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A2433]/90 border-l-2 border-[#D88752] text-[10px] font-mono uppercase tracking-[0.24em] text-[#D88752]">
            <Cpu className="w-3.5 h-3.5 text-[#4DE2E8]" />
            <span>NEXUS // 3D MARS ENGINEERING CAMPAIGN</span>
          </div>

          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-5xl font-orbitron font-black tracking-wider text-white leading-[1.03] drop-shadow-[0_6px_26px_rgba(57,169,255,0.28)]">
            MARS: THE SURVIVAL PROTOCOL
          </h1>

          <div className="mt-3 flex items-center gap-2" aria-hidden="true">
            <span className="h-[2px] w-16 bg-[#4DE2E8]" />
            <span className="h-[2px] w-8 bg-[#D88752]" />
            <span className="h-[1px] flex-1 bg-white/15" />
          </div>

          <p className="mt-3 text-sm sm:text-base font-exo2 italic text-[#FFB547] tracking-wide">
            “Build Beyond the Impossible.”
          </p>
          <p className="mt-2 border-l-2 border-[#39A9FF]/55 pl-3 text-xs sm:text-sm font-public text-slate-300 leading-relaxed max-w-md">
            Pilot a 6-wheeled rover across Elysium Planitia, inspect NASA’s retired InSight lander, construct a 10-module outpost, and survive Marsquakes, Dust Storms, and Extreme Cold across 20 levels.
          </p>

          {/* Tactical Game Menu Command Rail */}
          <nav aria-label="Game Main Menu" className="mt-6 space-y-2.5">
            <MenuRailButton
              indexTag="01"
              label="START MISSION"
              sublabel="Initialize Sol 001 Elysium Drop"
              icon={Play}
              primary
              onClick={onStartNew}
            />
            <MenuRailButton
              indexTag="02"
              label="CONTINUE"
              sublabel={hasSave ? 'Resume Saved Station Telemetry' : 'No Active Operation Saved'}
              icon={RotateCcw}
              disabled={!hasSave}
              onClick={onContinue}
            />
            <MenuRailButton
              indexTag="03"
              label="HOW TO PLAY"
              sublabel="Controls, Resources & Hazard Protocol"
              icon={BookOpen}
              onClick={onOpenHowToPlay}
            />
            <MenuRailButton
              indexTag="04"
              label="SETTINGS"
              sublabel="Audio Mix & Atmospheric Soundscape"
              icon={Settings}
              onClick={onOpenSettings}
            />
            <MenuRailButton
              indexTag="05"
              label="Exit to NEXUS Case Board"
              icon={LogOut}
              ghost
              onClick={onReturnToNexus}
            />
          </nav>
        </div>

        {/* Bottom-Right Sector Status Reticle (Leaves 3D Rover & Terrain Unobstructed) */}
        <div className="hidden lg:block w-72 game-panel-sm border border-[#39A9FF]/35 p-4 backdrop-blur-sm text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4DE2E8]">
              ORBITAL RECON // LIVE
            </span>
            <span className="text-[10px] font-mono text-[#45D483]">CAM OK</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-[#0A111F]/80 p-2 border border-white/10">
              <div className="text-[9px] text-slate-400">CAMPAIGN</div>
              <div className="text-white font-bold">20 LEVELS</div>
            </div>
            <div className="bg-[#0A111F]/80 p-2 border border-white/10">
              <div className="text-[9px] text-slate-400">OUTPOST GRID</div>
              <div className="text-white font-bold">10 MODULES</div>
            </div>
            <div className="bg-[#0A111F]/80 p-2 border border-white/10">
              <div className="text-[9px] text-slate-400">HAZARDS</div>
              <div className="text-[#FFB547] font-bold">3 THREATS</div>
            </div>
            <div className="bg-[#0A111F]/80 p-2 border border-white/10">
              <div className="text-[9px] text-slate-400">NASA ARCHIVE</div>
              <div className="text-[#4DE2E8] font-bold">INSIGHT</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PROMPT BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 pt-2 border-t border-white/10">
        <span>FICTIONAL FUTURE DEPLOYMENT INSPIRED BY NASA INSIGHT (2018–2022)</span>
        <span className="text-[#4DE2E8]">PRESS START TO DEPLOY ROVER</span>
      </div>
    </div>
  );
}

export function HowToPlayModal({ onClose }) {
  const sections = [
    {
      keys: ['W', 'A', 'S', 'D'],
      title: '1. Rover Exploration',
      body: 'Steer the 6-wheeled Mars rover across Elysium terrain using W/A/S/D or Arrow keys on desktop, or the Touch D-Pad on mobile. Right-Click Drag (or 1-Finger Drag on mobile) to pan camera, and Scroll (or Pinch) to zoom.',
    },
    {
      keys: ['E'],
      title: '2. Resource Collection',
      body: 'Drive near glowing Metal, Energy, Insulation, or Component pods until their ground ring illuminates, then press E (or tap Collect) to harvest.',
    },
    {
      keys: ['B'],
      title: '3. Modular Base Construction',
      body: 'Open Construction (B) to build all 10 research station modules and upgrade them from LV.1 to LV.3. Upgrades raise earthquake, storm, and cold resilience.',
    },
    {
      keys: ['INSIGHT'],
      title: '4. NASA InSight & NEXUS AI',
      body: 'Visit NASA’s InSight lander northwest of the build pad (or click Science Data) to review verified 2018–2022 mission findings translated into strategy.',
    },
    {
      keys: ['ALERT'],
      title: '5. Survive 20 Mission Levels',
      body: 'When Marsquakes, Dust Storms, or Extreme Cold strike, trigger Emergency Engineering Responses in the Hazard panel to protect station integrity.',
    },
  ];

  return (
    <TacticalDialogShell
      ariaLabel="How To Play"
      code="OP-MANUAL // 01"
      subtitle="FIELD OPERATIONS"
      title="HOW TO PLAY — MISSION BRIEFING"
      closeAriaLabel="Close briefing"
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-2.5">
        {sections.map((s) => (
          <div
            key={s.title}
            className="p-3.5 bg-[#131E31]/90 border border-[#39A9FF]/25 border-l-2 border-l-[#4DE2E8] flex flex-col sm:flex-row sm:items-start gap-3"
          >
            <div className="flex flex-wrap gap-1 shrink-0 sm:w-28 pt-0.5">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="px-2 py-0.5 text-[10px] font-orbitron font-bold bg-[#09111E] border border-[#4DE2E8]/55 text-[#4DE2E8] shadow-[0_2px_0_rgba(57,169,255,0.4)]"
                >
                  {k}
                </kbd>
              ))}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-orbitron font-bold text-white uppercase tracking-wide">
                {s.title}
              </h3>
              <p className="text-xs font-public text-slate-300 mt-1 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="game-cmd-btn px-6 py-2.5 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Understood
        </button>
      </div>
    </TacticalDialogShell>
  );
}

export function SettingsModal({ settings, onChangeSettings, onClose }) {
  const musicPct = Math.round((settings.musicVolume ?? 0.45) * 100);
  const sfxPct = Math.round((settings.sfxVolume ?? 0.7) * 100);

  return (
    <TacticalDialogShell
      ariaLabel="Audio Settings"
      code="SYS-CFG // 02"
      subtitle="AUDIO TELEMETRY"
      title="SYSTEM SETTINGS"
      closeAriaLabel="Close settings"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between p-3.5 bg-[#131E31]/90 border border-[#39A9FF]/30">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#4DE2E8]" />
            <span className="text-sm font-orbitron font-bold uppercase tracking-wide">Master Audio</span>
          </div>
          <button
            type="button"
            onClick={() => onChangeSettings({ muted: !settings.muted })}
            className={`game-cmd-btn px-3.5 py-1.5 border text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              settings.muted
                ? 'border-[#FF5555]/65 bg-[#FF5555]/15 text-[#FF5555]'
                : 'border-[#45D483]/65 bg-[#45D483]/15 text-[#45D483]'
            }`}
          >
            {settings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{settings.muted ? 'MUTED' : 'ACTIVE'}</span>
          </button>
        </div>

        <label className="block p-3.5 bg-[#131E31]/90 border border-[#39A9FF]/30 space-y-2.5">
          <div className="flex justify-between text-xs font-mono uppercase tracking-wider">
            <span className="text-slate-200">Ambience & Music Volume</span>
            <span className="text-[#4DE2E8] font-bold">{musicPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume ?? 0.45}
            onChange={(e) => onChangeSettings({ musicVolume: Number(e.target.value) })}
            className="w-full accent-[#4DE2E8] cursor-pointer"
          />
        </label>

        <label className="block p-3.5 bg-[#131E31]/90 border border-[#39A9FF]/30 space-y-2.5">
          <div className="flex justify-between text-xs font-mono uppercase tracking-wider">
            <span className="text-slate-200">Rover & SFX Volume</span>
            <span className="text-[#4DE2E8] font-bold">{sfxPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume ?? 0.7}
            onChange={(e) => onChangeSettings({ sfxVolume: Number(e.target.value) })}
            className="w-full accent-[#4DE2E8] cursor-pointer"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="game-cmd-btn px-6 py-2.5 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Save & Close
        </button>
      </div>
    </TacticalDialogShell>
  );
}

export function PauseModal({ level, onResume, onRestartLevel, onOpenSettings, onSaveAndMenu }) {
  return (
    <TacticalDialogShell
      ariaLabel="Mission Paused"
      code={`LEVEL ${level} // 20`}
      subtitle="SIMULATION STANDBY"
      title="MISSION PAUSED"
      accent="#FFB547"
      maxWidth="max-w-md"
    >
      <div className="space-y-2.5">
        <MenuRailButton
          indexTag="01"
          label="Resume Mission"
          sublabel="Return to Elysium Operations"
          icon={Play}
          primary
          onClick={onResume}
        />
        <MenuRailButton
          indexTag="02"
          label="Restart Level"
          sublabel={`Reset Level ${level} Conditions`}
          icon={RotateCcw}
          onClick={onRestartLevel}
        />
        <MenuRailButton
          indexTag="03"
          label="Settings"
          sublabel="Audio Mix & Controls"
          icon={Settings}
          onClick={onOpenSettings}
        />
        <MenuRailButton
          indexTag="04"
          label="Save & Return to Main Menu"
          icon={LogOut}
          ghost
          onClick={onSaveAndMenu}
        />
      </div>
    </TacticalDialogShell>
  );
}

export function InsightArchiveModal({ consultedIds, onConsultRecord, onClose }) {
  return (
    <TacticalDialogShell
      ariaLabel="InSight Scientific Archive"
      code="JPL-ARCHIVE // 2018–2022"
      subtitle="FICTIONAL ACCESS TO REAL NASA FACTS"
      title="NASA INSIGHT SCIENTIFIC KNOWLEDGE BASE"
      closeAriaLabel="Close InSight archive"
      onClose={onClose}
      maxWidth="max-w-2xl"
      blueprint
    >
      <p className="text-xs font-public text-slate-300 border-l-2 border-[#D88752] pl-3">
        InSight ended science operations in December 2022. Analyze these historical NASA mission records so NEXUS can translate Mars observations into survival engineering strategy.
      </p>

      <div className="mt-4 space-y-3">
        {INSIGHT_RECORDS.map((rec) => {
          const done = consultedIds.includes(rec.id);
          return (
            <div
              key={rec.id}
              className={`p-4 border transition-colors ${
                done
                  ? 'border-[#45D483]/55 bg-[#0F1E24]/90 border-l-4 border-l-[#45D483]'
                  : 'border-[#39A9FF]/35 bg-[#131E31]/92 border-l-4 border-l-[#39A9FF]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#4DE2E8]" />
                  <span className="text-sm font-orbitron font-bold text-white uppercase">{rec.instrument}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#09111E] border border-white/10 text-slate-300">
                  {rec.years}
                </span>
              </div>
              <p className="mt-2.5 text-xs font-public text-slate-200 leading-relaxed">
                <strong className="text-[#4DE2E8]">Scientific discovery:</strong> {rec.discovery}
              </p>
              <p className="mt-1.5 text-xs font-public text-slate-300 leading-relaxed">
                <strong className="text-[#FFB547]">Engineering relevance:</strong> {rec.relevance}
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#4DE2E8]">{rec.bonusHint}</span>
                <button
                  type="button"
                  onClick={() => onConsultRecord(rec.id)}
                  className={`game-cmd-btn px-3.5 py-1.5 text-[11px] font-orbitron uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer ${
                    done
                      ? 'bg-[#45D483]/20 border border-[#45D483]/60 text-[#45D483]'
                      : 'bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-bold'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{done ? 'Analyzed (+60 Earned)' : 'Analyze Record (+60 PTS)'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="game-cmd-btn px-5 py-2 bg-[#1A2433] border border-[#4DE2E8]/55 hover:bg-[#39A9FF]/20 text-white font-orbitron font-semibold text-xs uppercase cursor-pointer"
        >
          Return to Station
        </button>
      </div>
    </TacticalDialogShell>
  );
}

export function ConstructionModal({
  tab,
  onChangeTab,
  level,
  inventory,
  modules,
  stationHealth,
  recommendedModuleId = null,
  onQuickBuild,
  onPickSlotMode,
  onUpgrade,
  onRepair,
  onClose,
}) {
  const tabsHeader = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChangeTab('build')}
        className={`game-cmd-btn px-3 py-1.5 text-xs font-orbitron uppercase cursor-pointer border ${
          tab === 'build'
            ? 'bg-[#39A9FF] border-[#4DE2E8] text-[#09111E] font-bold'
            : 'bg-[#131E31] text-slate-300 border-white/15 hover:border-[#4DE2E8]/50'
        }`}
      >
        Build Modules ({Object.keys(modules).length}/10)
      </button>
      <button
        type="button"
        onClick={() => onChangeTab('upgrade')}
        className={`game-cmd-btn px-3 py-1.5 text-xs font-orbitron uppercase cursor-pointer border ${
          tab === 'upgrade'
            ? 'bg-[#39A9FF] border-[#4DE2E8] text-[#09111E] font-bold'
            : 'bg-[#131E31] text-slate-300 border-white/15 hover:border-[#4DE2E8]/50'
        }`}
      >
        Upgrades & Repairs
      </button>
    </div>
  );

  return (
    <TacticalDialogShell
      ariaLabel="Station Construction & Upgrades"
      code={`FAB-BAY // LEVEL ${level}`}
      subtitle="OUTPOST ARCHITECTURE"
      title="CONSTRUCTION & ENGINEERING BAY"
      closeAriaLabel="Close construction bay"
      onClose={onClose}
      maxWidth="max-w-3xl"
      headerRight={tabsHeader}
      blueprint
    >
      {tab === 'build' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES_LIST.map((mod) => {
            const built = Boolean(modules[mod.id]);
            const unlocked = level >= mod.unlockLevel;
            const affordable = hasEnoughResources(inventory, mod.cost);
            const isTarget = !built && recommendedModuleId === mod.id;
            return (
              <div
                key={mod.id}
                className={`p-3.5 border flex flex-col justify-between gap-2.5 ${
                  built
                    ? 'border-[#45D483]/55 border-t-2 border-t-[#45D483] bg-[#0F1E24]/85'
                    : isTarget
                    ? 'border-[#FFB547] ring-2 ring-[#FFB547]/65 border-t-2 border-t-[#FFB547] bg-[#192338] shadow-[0_0_24px_rgba(255,181,71,0.28)]'
                    : unlocked
                    ? 'border-[#39A9FF]/45 border-t-2 border-t-[#4DE2E8] bg-[#131E31]/95'
                    : 'border-white/10 bg-[#0D1422]/65 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-orbitron font-bold text-white uppercase">{mod.name}</h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 border shrink-0 ${
                        built
                          ? 'bg-[#45D483]/15 border-[#45D483]/45 text-[#45D483]'
                          : isTarget
                          ? 'bg-[#FFB547] border-[#FFB547] text-[#09111E] font-bold'
                          : unlocked
                          ? 'bg-[#39A9FF]/15 border-[#4DE2E8]/45 text-[#4DE2E8]'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {built ? 'BUILT' : isTarget ? '★ RECOMMENDED' : unlocked ? 'UNLOCKED' : `LV.${mod.unlockLevel}`}
                    </span>
                  </div>
                  <p className="text-xs font-public text-slate-300 mt-1.5 leading-snug">{mod.summary}</p>
                </div>

                {!built && (
                  <>
                    <CostPills cost={mod.cost} inventory={inventory} />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={!unlocked || !affordable}
                        onClick={() => onQuickBuild(mod.id)}
                        className={`game-cmd-btn flex-1 py-1.5 px-3 text-[11px] font-orbitron uppercase tracking-wider inline-flex items-center justify-center gap-1.5 ${
                          unlocked && affordable
                            ? 'bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-bold cursor-pointer'
                            : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                        }`}
                      >
                        <Hammer className="w-3.5 h-3.5" />
                        <span>Build</span>
                      </button>
                      <button
                        type="button"
                        disabled={!unlocked || !affordable}
                        onClick={() => onPickSlotMode(mod.id)}
                        className={`game-cmd-btn py-1.5 px-2.5 text-[11px] font-mono border ${
                          unlocked && affordable
                            ? 'border-[#4DE2E8]/60 text-[#4DE2E8] hover:bg-[#4DE2E8]/15 cursor-pointer'
                            : 'border-white/10 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        3D Place
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 border border-[#FFB547]/55 border-l-4 border-l-[#FFB547] bg-[#181B29]/95 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-orbitron font-bold text-[#FFB547] flex items-center gap-1.5 uppercase">
                <Wrench className="w-4 h-4" />
                <span>STATION FIELD REPAIRS (HEALTH: {Math.round(stationHealth)}%)</span>
              </h3>
              <p className="text-xs font-public text-slate-300 mt-1">
                Spend 2 Metal or 15 Energy to restore +22 Station Health and +18 Stability.
              </p>
            </div>
            <button
              type="button"
              onClick={onRepair}
              className="game-cmd-btn px-4 py-2 bg-[#FFB547] hover:bg-amber-300 text-[#09111E] font-orbitron font-bold text-xs uppercase cursor-pointer"
            >
              Repair Outpost
            </button>
          </div>

          {Object.keys(modules).length === 0 ? (
            <p className="text-sm font-public text-slate-400 text-center py-8 border border-white/10 bg-[#0D1422]/60">
              No modules constructed yet. Build Foundation Platform first in the Build tab.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(modules).map(([id, mod]) => {
                const def = MODULE_BY_ID[id];
                const canUp = mod.level < 3 && hasEnoughResources(inventory, def.upgradeCost);
                const isTarget = recommendedModuleId === id;
                return (
                  <div
                    key={id}
                    className={`p-3.5 border space-y-2.5 ${
                      isTarget
                        ? 'border-[#FFB547] ring-2 ring-[#FFB547]/65 bg-[#192338]'
                        : 'border-[#39A9FF]/40 bg-[#131E31]/95'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-orbitron font-bold text-white uppercase">{def.name}</span>
                      <span className="text-xs font-mono text-[#4DE2E8]">
                        LV.{mod.level}/3 · {Math.round(mod.integrity)}%
                      </span>
                    </div>
                    {mod.level < 3 ? (
                      <>
                        <CostPills cost={def.upgradeCost} inventory={inventory} />
                        <button
                          type="button"
                          disabled={!canUp}
                          onClick={() => onUpgrade(id)}
                          className={`game-cmd-btn w-full py-1.5 text-xs font-orbitron uppercase inline-flex items-center justify-center gap-1.5 ${
                            canUp
                              ? 'bg-[#45D483] hover:bg-emerald-300 text-[#09111E] font-bold cursor-pointer'
                              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>Upgrade to LV.{mod.level + 1}</span>
                        </button>
                      </>
                    ) : (
                      <span className="inline-block text-xs font-mono text-[#45D483] uppercase">
                        MAXIMUM PROTECTION ACHIEVED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </TacticalDialogShell>
  );
}

export function EndGameModal({ screen, score, report, level, onRetryLevel, onNewCampaign, onReturnToNexus }) {
  const isWin = screen === 'victory';
  return (
    <TacticalDialogShell
      ariaLabel={isWin ? 'Mission Complete' : 'Mission Failed'}
      code={isWin ? 'PROTOCOL // CERTIFIED' : `OUTPOST // LEVEL ${level}`}
      subtitle="AFTER-ACTION DEBRIEF"
      title={isWin ? 'MARS SURVIVAL PROTOCOL COMPLETE' : `OUTPOST LOST ON LEVEL ${level}`}
      accent={isWin ? '#45D483' : '#FF5555'}
      maxWidth="max-w-xl"
    >
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 border ${
            isWin
              ? 'bg-[#45D483]/15 border-[#45D483]/60'
              : 'bg-[#FF5555]/15 border-[#FF5555]/60'
          }`}
        >
          {isWin ? <Trophy className="w-7 h-7 text-[#FFB547]" /> : <AlertTriangle className="w-7 h-7 text-[#FF5555]" />}
        </div>

        <p className="mt-3 text-xs sm:text-sm font-public text-slate-300">
          {isWin
            ? 'Your modular outpost withstood seismic tremors, choking dust storms, and extreme Martian cold—turning InSight’s legacy into a resilient future.'
            : 'Structural integrity dropped to zero. Review NEXUS hints, gather insulation/metal reserves, and reinforce vulnerable modules.'}
        </p>

        {isWin && report && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
            {[
              { label: 'Stability', val: `${report.stabilityScore}%`, icon: Shield },
              { label: 'Energy', val: `${report.energyScore}%`, icon: Sun },
              { label: 'Thermal', val: `${report.thermalScore}%`, icon: Flame },
              { label: 'Science', val: `${report.scienceScore}%`, icon: Activity },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-2.5 bg-[#131E31] border border-[#39A9FF]/30">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#4DE2E8] uppercase">
                    <Icon className="w-3 h-3" />
                    <span>{m.label}</span>
                  </div>
                  <div className="mt-1 text-lg font-orbitron font-bold">{m.val}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 p-3.5 bg-[#131E31] border border-[#39A9FF]/40 flex items-center justify-between text-xs font-mono">
          <span>TOTAL MISSION SCORE</span>
          <span className="text-base font-orbitron font-bold text-[#4DE2E8]">
            {score} PTS {isWin && report ? `· GRADE ${report.grade}` : ''}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isWin && (
            <button
              type="button"
              onClick={onRetryLevel}
              className="game-cmd-btn px-5 py-2.5 bg-[#FFB547] hover:bg-amber-300 text-[#09111E] font-orbitron font-bold text-xs uppercase cursor-pointer"
            >
              Retry Level {level}
            </button>
          )}
          <button
            type="button"
            onClick={onNewCampaign}
            className="game-cmd-btn px-5 py-2.5 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-xs uppercase cursor-pointer"
          >
            {isWin ? 'Play New Campaign' : 'Restart From Level 1'}
          </button>
          <button
            type="button"
            onClick={onReturnToNexus}
            className="game-cmd-btn px-4 py-2.5 border border-white/25 hover:border-[#D88752] hover:bg-white/5 text-slate-300 font-exo2 font-semibold text-xs uppercase cursor-pointer"
          >
            Exit to NEXUS
          </button>
        </div>
      </div>
    </TacticalDialogShell>
  );
}
