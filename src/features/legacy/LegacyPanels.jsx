import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Eye,
  FlaskConical,
  Globe2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import Modal from '../../components/Modal';
import EarthTransferPanel from './EarthTransferPanel';
import siteContent from '../../data/siteContent.json';
import {
  INSIGHT_DIAGNOSTICS,
  INSIGHT_HISTORICAL_FACTS,
  MODULE_DEFINITIONS,
} from './simulation';

const elCopy = siteContent.engineeringLegacy;
const insightCopy = elCopy.panels.insightModal;
const decisionCopy = elCopy.panels.decisionPanel;
const summaryCopy = elCopy.panels.summaryModal;

/**
 * InSight Historical Inspection & Legacy Analysis Modal.
 * Preserves InSight as a real, retired NASA mission (ended Dec 2022) while allowing
 * students to extract engineering lessons for their fictional future outpost.
 */
export function InsightLegacyModal({
  phase,
  discoveredLessons,
  inspectInsightPanels,
  onToggleInspectPanels,
  onRunDiagnostic,
  onStartConstruction,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <Modal
      label={insightCopy.modalLabel}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#02050E]/82 backdrop-blur-md"
    >
      <div className="game-frame game-frame-amber w-full max-w-2xl shadow-[0_24px_70px_rgba(0,0,0,0.92)]">
        <div className="game-frame-inner max-h-[90vh] overflow-y-auto text-left text-[#EAF2FF]">
          <div className="game-console-bar px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-2 text-[#FFB35C]">
              <span className="w-2 h-2 rounded-full bg-[#FFB35C]" />
              <span>ARCHIVE // {insightCopy.badge}</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="game-btn-ghost p-1.5 text-white/80 hover:text-white cursor-pointer"
              aria-label={insightCopy.closeAriaLabel}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative z-10 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#38DDF5]/20">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#38DDF5]">
                  // {insightCopy.subBadge}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-orbitron font-bold uppercase tracking-wide text-white mt-1">
                {insightCopy.title}
              </h2>
            </div>
          </div>

          {/* Tab switch: Mission Record vs Hypothetical Diagnostics */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 text-[11px] font-orbitron uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'game-btn-cyan'
                  : 'game-btn-ghost text-slate-300 hover:text-white'
              }`}
            >
              {insightCopy.historyTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-1.5 text-[11px] font-orbitron uppercase tracking-wider font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'game-btn-cyan'
                  : 'game-btn-ghost text-slate-300 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{insightCopy.diagnosticsTabPrefix} ({discoveredLessons.length}/3)</span>
            </button>
          </div>

          {activeTab === 'history' ? (
            <div className="mt-4 space-y-4">
              <div className="relative overflow-hidden border border-[#38DDF5]/35 bg-[#030916] h-32 sm:h-36">
                <img
                  src={insightCopy.imageSrc}
                  alt={insightCopy.imageAlt}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B1E]/92 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFB35C]">
                    {insightCopy.imageCaption}
                  </span>
                </div>
              </div>

              {/* Concise 4-point historical summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-public">
                <div className="border-l-2 border-[#FFB35C] border border-[#38DDF5]/20 bg-[#08132B]/85 p-3">
                  <span className="text-[#FFB35C] font-mono text-[11px] uppercase tracking-wider font-bold block">{insightCopy.arrivalTitle}</span>
                  <p className="text-slate-200 mt-1">
                    {insightCopy.arrivalText}
                  </p>
                </div>
                <div className="border-l-2 border-[#D87545] border border-[#38DDF5]/20 bg-[#08132B]/85 p-3">
                  <span className="text-[#FFB35C] font-mono text-[11px] uppercase tracking-wider font-bold block">{insightCopy.endTitle}</span>
                  <p className="text-slate-200 mt-1">
                    {insightCopy.endText}
                  </p>
                </div>
              </div>

              {/* Authentic NASA Historical Power Comparison */}
              <div className="border border-[#3478FF]/45 bg-[#071127]/95 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-orbitron uppercase tracking-wider font-bold text-[#38DDF5] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-[#FFB35C]" />
                    <span>{insightCopy.powerTitle}</span>
                  </span>
                  <button
                    type="button"
                    onClick={onToggleInspectPanels}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-orbitron uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      inspectInsightPanels
                        ? 'game-btn-cyan'
                        : 'game-btn-ghost text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{inspectInsightPanels ? insightCopy.panelsHighlighted : insightCopy.inspectPanels}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {INSIGHT_HISTORICAL_FACTS.powerComparison.map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-public">
                        <span className="text-slate-200">{row.label}</span>
                        <span className="font-mono text-[#FFB35C] font-semibold">
                          ~{row.whPerSol.toLocaleString()} {insightCopy.powerUnitSuffix}
                        </span>
                      </div>
                      <div className="game-meter-track h-2.5">
                        <div
                          className={`h-full transition-all duration-500 ${
                            row.pct > 50
                              ? 'bg-gradient-to-r from-[#3478FF] to-[#38DDF5]'
                              : 'bg-gradient-to-r from-[#D87545] to-[#FFB35C]'
                          }`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">{row.detail}</p>
                    </div>
                  ))}
                </div>

                {inspectInsightPanels && (
                  <div className="border-l-2 border-[#38DDF5] border border-[#38DDF5]/35 bg-[#040B1A]/95 p-2.5 text-xs text-slate-200">
                    <strong className="text-[#38DDF5] font-orbitron uppercase text-[11px] tracking-wider">{insightCopy.panelInspectionLabel}</strong>{' '}
                    {insightCopy.panelInspectionText}
                  </div>
                )}
              </div>

              <p className="text-[11px] font-mono text-slate-400">
                {INSIGHT_HISTORICAL_FACTS.note}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-public text-slate-300">
                {insightCopy.diagnosticsIntro}
              </p>
              {INSIGHT_DIAGNOSTICS.map((diag) => {
                const unlocked = discoveredLessons.includes(diag.id);
                return (
                  <div
                    key={diag.id}
                    className={`game-option-card p-3.5 ${
                      unlocked
                        ? '!border-[#38DDF5]/65 bg-[#091836]/95'
                        : 'bg-[#071127]/75'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-orbitron font-bold uppercase tracking-wide text-white">
                        {diag.title}
                      </h3>
                      {unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38DDF5]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{diag.lesson} {insightCopy.appliedSuffix}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRunDiagnostic(diag.id)}
                          className="game-btn-cyan px-3.5 py-1 text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          {insightCopy.runDiagnosticLabel}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {diag.evidence}
                    </p>
                    {unlocked && (
                      <p className="text-[11px] font-mono text-[#FFB35C] mt-1.5 font-medium">
                        {diag.application}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer prompt */}
          <div className="mt-5 pt-4 border-t border-[#38DDF5]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-orbitron uppercase tracking-wide font-semibold text-[#FFB35C]">
              {insightCopy.footerPrompt}
            </p>
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {activeTab === 'history' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('diagnostics')}
                  className="game-btn-ghost px-3.5 py-2 text-[11px] font-orbitron uppercase tracking-wider text-[#38DDF5] cursor-pointer"
                >
                  {insightCopy.analyzeLessonsLabel}
                </button>
              )}
              {phase === 'arrival' ? (
                <button
                  type="button"
                  onClick={onStartConstruction}
                  className="game-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>{insightCopy.buildOutpostLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="game-btn-ghost px-4 py-2 text-xs font-orbitron uppercase tracking-wider text-white cursor-pointer"
                >
                  {insightCopy.resumeMissionLabel}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Phase 3 & Phase 4 Interactive Engineering Choice Panel.
 */
export function EngineeringDecisionPanel({
  scenario,
  decisionResult,
  onSelectOption,
  onContinue,
  onClose,
}) {
  if (!scenario) return null;
  const targetName = MODULE_DEFINITIONS[scenario.targetModule]?.name ?? elCopy.banners.defaultOutpostModule;

  return (
    <Modal
      label={scenario.title}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#02050E]/78 backdrop-blur-sm"
    >
      <div className="game-frame game-frame-amber w-full max-w-xl shadow-[0_24px_70px_rgba(0,0,0,0.92)]">
        <div className="game-frame-inner max-h-[90vh] overflow-y-auto text-left text-[#EAF2FF]">
          <div className="game-console-bar px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-2 text-[#38DDF5]">
              <span className="w-2 h-2 rounded-full bg-[#FFB35C] animate-pulse" />
              <span>// {scenario.phaseLabel} · {targetName}</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="game-btn-ghost p-1.5 text-white/80 hover:text-white cursor-pointer"
              aria-label={decisionCopy.closeAriaLabel}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative z-10 p-4 sm:p-6">
          <div className="pb-3 border-b border-[#38DDF5]/20">
            <h2 className="text-lg sm:text-xl font-orbitron font-bold uppercase tracking-wide text-white">
              {scenario.title}
            </h2>
          </div>

          {/* Alert banner */}
          <div className="mt-3.5 border-l-2 border-[#FFB35C] border border-[#FFB35C]/40 bg-[#FFB35C]/10 p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FFB35C] shrink-0 mt-0.5" />
            <div className="text-xs font-public space-y-1">
              <p className="text-white font-semibold">{scenario.alertText}</p>
              <p className="text-slate-300 text-[11px]">{scenario.disclaimer}</p>
            </div>
          </div>

          {!decisionResult ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[11px] font-orbitron font-bold text-[#38DDF5] uppercase tracking-[0.16em]">
                {scenario.prompt}
              </p>
              {scenario.options.map((opt, idx) => {
                const keyBadge = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectOption(opt.id)}
                    className="game-option-card w-full text-left p-3.5 cursor-pointer group flex items-start gap-3"
                  >
                    <span className="game-keycap w-7 h-7 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:bg-[#38DDF5]/30">
                      {keyBadge}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-orbitron font-bold text-white group-hover:text-[#38DDF5] transition-colors">
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#FFB35C]/15 border border-[#FFB35C]/45 text-[#FFB35C] shrink-0">
                          {opt.tradeoff}
                        </span>
                      </div>
                      <p className="text-xs font-public text-slate-300 mt-1.5 leading-relaxed">
                        {opt.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-[#38DDF5] border border-[#38DDF5]/45 bg-[#08132B]/92 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#38DDF5]">
                    {decisionCopy.actionExecutedPrefix} {decisionResult.option.label}
                  </span>
                  {decisionResult.lessonApplied && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#8B5CF6]/25 border border-[#8B5CF6]/55 text-[#EAF2FF]">
                      <Sparkles className="w-3 h-3 text-[#FFB35C]" />
                      {decisionCopy.lessonBonusLabel}
                    </span>
                  )}
                </div>
                <p className="text-sm font-public text-white leading-relaxed">
                  {decisionResult.option.outcome}
                </p>
                <p className="text-xs font-mono text-[#FFB35C]">
                  {decisionCopy.insightPrefix} {decisionResult.option.strength}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#38DDF5]">
                  // SYSTEM UPGRADE APPLIED TO OUTPOST
                </span>
                <button
                  type="button"
                  onClick={onContinue}
                  className="game-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  <span>{decisionCopy.continueLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Phase 5: MISSION ANALYSIS COMPLETE & Earth Knowledge Transfer Ending.
 */
export function MissionSummaryModal({
  analysis,
  onRetry,
  onReturnToNexus,
}) {
  const [showEarthTransfer, setShowEarthTransfer] = useState(false);

  return (
    <Modal
      label={summaryCopy.modalLabel}
      onClose={onReturnToNexus}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#02050E]/82 backdrop-blur-md"
    >
      <div className="game-frame w-full max-w-3xl shadow-[0_24px_80px_rgba(0,0,0,0.94)]">
        <div className="game-frame-inner max-h-[90vh] overflow-y-auto text-left text-[#EAF2FF]">
          <div className="game-console-bar px-5 sm:px-7 py-2.5 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#38DDF5]">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>// {summaryCopy.eyebrow}</span>
            </span>
            <span className="text-[#FFB35C]">SOL 028 // DEBRIEF</span>
          </div>

          <div className="relative z-10 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#38DDF5]/20">
            <div>
              <h2 className="text-xl sm:text-2xl font-orbitron font-bold uppercase tracking-wide text-white">
                {summaryCopy.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEarthTransfer(false)}
                className={`px-3.5 py-1.5 text-[11px] font-orbitron uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  !showEarthTransfer
                    ? 'game-btn-cyan'
                    : 'game-btn-ghost text-slate-300 hover:text-white'
                }`}
              >
                {summaryCopy.outpostSummaryTab}
              </button>
              <button
                type="button"
                onClick={() => setShowEarthTransfer(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-orbitron uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  showEarthTransfer
                    ? 'game-btn-cyan'
                    : 'game-btn-ghost text-slate-300 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>{summaryCopy.earthSolutionsTab}</span>
              </button>
            </div>
          </div>

          {!showEarthTransfer ? (
            <div className="mt-5 space-y-5">
              {/* Final 3 Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border-l-2 border-[#FFB35C] border border-[#38DDF5]/25 bg-[#08132B]/88 p-3.5">
                  <div className="flex items-center justify-between text-xs font-orbitron uppercase tracking-wider text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-4 h-4 text-[#FFB35C]" />
                      {summaryCopy.energyLabel}
                    </span>
                    <span className="font-mono font-bold text-white">{analysis.stats.energy}%</span>
                  </div>
                  <div className="game-meter-track mt-2.5 h-2">
                    <div className="h-full bg-[#FFB35C]" style={{ width: `${analysis.stats.energy}%` }} />
                  </div>
                </div>

                <div className="border-l-2 border-[#38DDF5] border border-[#38DDF5]/25 bg-[#08132B]/88 p-3.5">
                  <div className="flex items-center justify-between text-xs font-orbitron uppercase tracking-wider text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#38DDF5]" />
                      {summaryCopy.safetyLabel}
                    </span>
                    <span className="font-mono font-bold text-white">{analysis.stats.safety}%</span>
                  </div>
                  <div className="game-meter-track mt-2.5 h-2">
                    <div className="h-full bg-[#38DDF5]" style={{ width: `${analysis.stats.safety}%` }} />
                  </div>
                </div>

                <div className="border-l-2 border-[#8B5CF6] border border-[#38DDF5]/25 bg-[#08132B]/88 p-3.5">
                  <div className="flex items-center justify-between text-xs font-orbitron uppercase tracking-wider text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-[#8B5CF6]" />
                      {summaryCopy.scienceLabel}
                    </span>
                    <span className="font-mono font-bold text-white">{analysis.stats.science}%</span>
                  </div>
                  <div className="game-meter-track mt-2.5 h-2">
                    <div className="h-full bg-[#8B5CF6]" style={{ width: `${analysis.stats.science}%` }} />
                  </div>
                </div>
              </div>

              {/* Worked Well & Could Be Improved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="border-l-2 border-[#38DDF5] border border-[#38DDF5]/35 bg-[#071127]/80 p-4 space-y-2">
                  <h3 className="text-xs font-orbitron font-bold uppercase tracking-wider text-[#38DDF5] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{summaryCopy.workedWellHeading}</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs font-public text-slate-200 list-disc pl-4">
                    {analysis.workedWell.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-l-2 border-[#FFB35C] border border-[#FFB35C]/35 bg-[#071127]/80 p-4 space-y-2">
                  <h3 className="text-xs font-orbitron font-bold uppercase tracking-wider text-[#FFB35C] flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>{summaryCopy.couldImproveHeading}</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs font-public text-slate-200 list-disc pl-4">
                    {analysis.couldImprove.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Decisions Log */}
              {analysis.decisions.length > 0 && (
                <div className="border border-[#38DDF5]/20 bg-[#071127]/70 p-3.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#38DDF5] mb-2">
                    {summaryCopy.decisionsHeading}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.decisions.map((d, idx) => (
                      <div key={idx} className="border-l-2 border-[#FFB35C] border border-white/10 bg-[#040B1A]/85 px-3 py-2 text-xs">
                        <span className="text-[#FFB35C] font-semibold block">{d.eventTitle}</span>
                        <span className="text-slate-200">{d.choiceLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEarthTransfer(true)}
                  className="game-btn-cyan inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>{summaryCopy.seeEarthLegacyLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <EarthTransferPanel />

              <div className="border border-[#FFB35C]/40 bg-[#071127]/88 p-4 text-center space-y-1">
                <p className="text-sm sm:text-base font-orbitron font-bold uppercase tracking-wide text-white">
                  {summaryCopy.closingTitle}
                </p>
                <p className="text-xs sm:text-sm font-mono text-[#FFB35C]">
                  {summaryCopy.closingSubtitle}
                </p>
              </div>
            </div>
          )}

          {/* Final Footer Actions */}
          <div className="mt-6 pt-4 border-t border-[#38DDF5]/20 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-public text-slate-400">
              {summaryCopy.footerDisclaimer}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onRetry}
                className="game-btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-xs font-orbitron uppercase tracking-wider font-semibold text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{summaryCopy.retryLabel}</span>
              </button>
              <button
                type="button"
                onClick={onReturnToNexus}
                className="game-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>{summaryCopy.returnLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
