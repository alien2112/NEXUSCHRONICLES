import { lazy, Suspense, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { GO_TECHNICAL_PAGES } from '../data/goTechnicalPages';
import { shouldIgnoreSceneShortcut } from '../utils/keyboard';
import siteContent from '../data/siteContent.json';

const InsightLanderViewer = lazy(() => import('../components/3d/InsightLanderViewer'));

const goTechnicalCopy = siteContent.goTechnical;
const { previousLabel, nextLabel, optionalGame } = siteContent.missionSeriesUi;

function RichText({ segments }) {
  return segments.map((segment, index) =>
    typeof segment === 'string' ? (
      segment
    ) : (
      <span key={index} className="text-[#F7961D] font-medium">
        {segment.text}
      </span>
    )
  );
}

export default function GoTechnicalPage({
  pageNumber = 1,
  onBack,
  onNext,
  onSelectPage,
  onGoDeeper,
  onBackToCaseBoard,
  onChoosePath,
  onSurvivalProtocol,
}) {
  const content = GO_TECHNICAL_PAGES[pageNumber - 1] ?? GO_TECHNICAL_PAGES[0];
  const isLastPage = pageNumber >= GO_TECHNICAL_PAGES.length;
  const sectionLabel = goTechnicalCopy.sectionLabel;
  const backRootLabel = goTechnicalCopy.backRootLabel;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (shouldIgnoreSceneShortcut(event) || document.querySelector('dialog[open]')) {
        return;
      }
      if (event.key === 'ArrowRight' && !isLastPage && onNext) {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowLeft' && onBack) {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLastPage, onBack, onNext]);

  const secondaryAction =
    isLastPage && onGoDeeper
      ? {
          label: goTechnicalCopy.secondaryActions.lastPage.label,
          title: goTechnicalCopy.secondaryActions.lastPage.title,
          onClick: onGoDeeper,
        }
      : null;

  const finalAction = onBackToCaseBoard && {
    label: goTechnicalCopy.finalAction.label,
    title: goTechnicalCopy.finalAction.title,
    onClick: onBackToCaseBoard,
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#02050e]">
      {/* Cosmic Nebula Space Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat opacity-45 scale-105"
          style={{
            backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.webp')}')`,
            backgroundPosition: content.bgVariant === 'nebula' ? 'right top' : '22% 18%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#03081a]/88 to-[#050b1c]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e]/90 via-transparent to-[#02050e]/65" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-between pt-20 sm:pt-24 pb-8 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div>
          {/* Top Back Navigation Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                aria-label={
                  pageNumber === 1
                    ? `Back to ${backRootLabel}`
                    : `Back to ${sectionLabel} page ${pageNumber - 1}`
                }
                title={pageNumber === 1 ? `Back to ${backRootLabel}` : 'Previous page'}
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2} />
              </button>

              <span className="text-lg sm:text-xl md:text-[22px] font-bold font-orbitron uppercase tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {sectionLabel}
              </span>
            </div>

            {onChoosePath && (
              <button
                type="button"
                onClick={onChoosePath}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 hover:border-[#F7961D]/75 bg-[#060b1d]/80 text-xs font-exo2 text-white/80 hover:text-[#F7961D] transition-colors cursor-pointer"
                title="Choose between Go Deeper and Go Technical"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Choose Path</span>
              </button>
            )}
          </div>

          {/* 2-Column Interactive Engineering Briefing + 3D InSight Mars Scene */}
          <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Engineering Narrative */}
            <div key={content.page} className="lg:col-span-5 inv-fade-up order-2 lg:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[34px] font-bold font-orbitron text-white leading-[1.18] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-left">
                {content.title}
              </h1>

              {content.subtitle && (
                <p className="mt-2 text-base sm:text-lg font-exo2 font-medium text-[#F7961D] leading-snug tracking-[0.01em] text-left">
                  {content.subtitle}
                </p>
              )}

              {content.bullets && (
                <ul className="mt-4 sm:mt-5 space-y-2.5 text-left font-exo2 font-normal text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.42] tracking-[0.01em] text-white/95">
                  {content.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#F7961D] font-bold leading-[1.42]" aria-hidden="true">
                        •
                      </span>
                      <span>
                        <RichText segments={bullet} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {content.paragraphs && (
                <div className="mt-4 sm:mt-5 space-y-4 text-left font-exo2 font-normal text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.45] tracking-[0.01em] text-white/95">
                  {content.paragraphs.map((segments, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      <RichText segments={segments} />
                    </p>
                  ))}
                </div>
              )}

              {content.promptBox && (
                <div className="mt-5 rounded-xl border border-[#F7961D]/35 bg-[#060d22]/75 backdrop-blur-sm px-4 py-3.5 text-left font-exo2 text-[14px] sm:text-[15px] leading-[1.45]">
                  <span className="text-[#F7961D] font-semibold uppercase tracking-wide">
                    {content.promptBox.label}
                  </span>{' '}
                  <span className="text-white/95">{content.promptBox.text}</span>
                </div>
              )}

              {content.secondarySection && (
                <section className="mt-6 text-left">
                  <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white leading-[1.2] tracking-wide">
                    {content.secondarySection.title}
                  </h2>

                  {content.secondarySection.paragraphs && (
                    <div className="mt-3 space-y-3.5 font-exo2 text-[15px] sm:text-[16px] leading-[1.45] text-white/95">
                      {content.secondarySection.paragraphs.map((segments, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          <RichText segments={segments} />
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {content.closing && (
                <p
                  className={`${
                    content.closingStyle === 'orbitron'
                      ? 'mt-6 text-lg sm:text-xl font-orbitron font-bold tracking-wide'
                      : content.secondarySection
                      ? 'mt-5 text-base sm:text-lg font-exo2 font-medium tracking-[0.01em]'
                      : 'mt-3 text-[15px] sm:text-[17px] font-exo2 font-medium tracking-[0.01em]'
                  } text-left text-[#F7961D] leading-[1.4]`}
                >
                  {content.closing}
                </p>
              )}

              {isLastPage && onSurvivalProtocol && optionalGame && (
                <section
                  aria-label="Optional Game Pass"
                  className="mt-6 game-panel-sm border border-[#4DE2E8]/45 border-l-4 border-l-[#4DE2E8] p-4 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-[#39A9FF]/15 border border-[#4DE2E8]/45 text-[#4DE2E8]">
                      {optionalGame.badge}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base sm:text-lg font-orbitron font-bold text-white uppercase tracking-wide">
                    {optionalGame.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
                    {optionalGame.description}
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={onSurvivalProtocol}
                      className="game-cmd-btn inline-flex items-center gap-2 px-4 py-2 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(77,226,232,0.3)]"
                    >
                      <span>{optionalGame.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Persistent 3D InSight Lander + Martian Ground */}
            <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-24 h-[340px] sm:h-[430px] lg:h-[calc(100vh-225px)] lg:min-h-[480px] lg:max-h-[660px]">
              <Suspense
                fallback={
                  <div className="w-full h-full min-h-[340px] rounded-2xl border border-[#F7961D]/40 bg-[#050b1d]/80 flex items-center justify-center font-orbitron text-xs uppercase tracking-widest text-[#F7961D]">
                    Initializing 3D Mars Viewport...
                  </div>
                }
              >
                <InsightLanderViewer
                  pageNumber={pageNumber}
                  onSelectPage={onSelectPage}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Bottom Pagination & Progression Bar */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={`${sectionLabel} pages`} className="flex flex-wrap items-center gap-2">
            {GO_TECHNICAL_PAGES.map((item) => {
              const isActive = item.number === pageNumber;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onSelectPage?.(item.number)}
                  aria-label={`${sectionLabel} page ${item.number}: ${item.title}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={`Page ${item.number}: ${item.title}`}
                  className={`h-8 min-w-8 px-2.5 rounded-full text-xs font-orbitron font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F7961D] text-[#1a0f00] shadow-[0_0_12px_rgba(247,150,29,0.45)]'
                      : 'border border-white/25 bg-[#060b1d]/70 text-white/75 hover:text-white hover:border-white/60'
                  }`}
                >
                  {item.number}
                </button>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto sm:ml-auto">
            {pageNumber > 1 && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-full border border-white/30 hover:border-white/70 bg-[#060b1d]/75 text-white text-xs sm:text-sm font-exo2 font-medium transition-all cursor-pointer active:scale-95"
                title={`Previous ${sectionLabel} page`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{previousLabel}</span>
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-full border border-[#F7961D]/70 hover:border-[#F7961D] bg-[#060b1d]/80 text-[#F7961D] hover:bg-[#F7961D]/15 text-xs sm:text-sm font-exo2 font-semibold transition-all cursor-pointer active:scale-95"
                title={secondaryAction.title}
              >
                <span>{secondaryAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {!isLastPage ? (
              <button
                type="button"
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 sm:py-1.5 rounded-full bg-[#F7961D]/90 hover:bg-[#F7961D] text-[#1a0f00] text-xs sm:text-sm font-exo2 font-semibold transition-all shadow-xl cursor-pointer active:scale-95"
                title={`Next: ${sectionLabel} page ${pageNumber + 1}`}
              >
                <span>{nextLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              finalAction && (
                <button
                  type="button"
                  onClick={finalAction.onClick}
                  className="flex items-center gap-2 px-4 py-2 sm:py-1.5 rounded-full bg-[#F7961D]/90 hover:bg-[#F7961D] text-[#1a0f00] text-xs sm:text-sm font-exo2 font-semibold transition-all shadow-xl cursor-pointer active:scale-95"
                  title={finalAction.title}
                >
                  <span>{finalAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
