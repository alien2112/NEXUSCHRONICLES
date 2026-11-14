import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { shouldIgnoreSceneShortcut } from '../utils/keyboard';
import siteContent from '../data/siteContent.json';

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

const bodyCopyClass =
  'text-left font-exo2 font-normal text-[15px] sm:text-[17px] md:text-[19px] lg:text-[20px] leading-[1.4] tracking-[0.01em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]';

function ParagraphList({ items, className = '' }) {
  return (
    <div className={`space-y-5 sm:space-y-6 ${bodyCopyClass} ${className}`}>
      {items.map((segments, idx) => (
        <p key={idx} className="whitespace-pre-line">
          <RichText segments={segments} />
        </p>
      ))}
    </div>
  );
}

function BulletList({ items, className = '' }) {
  return (
    <ul className={`space-y-2.5 sm:space-y-3 ${bodyCopyClass} leading-[1.38] ${className}`}>
      {items.map((bullet, idx) => (
        <li key={idx} className="flex items-start gap-2.5">
          <span className="text-[#F7961D] font-bold leading-[1.38]" aria-hidden="true">
            •
          </span>
          <span>
            <RichText segments={bullet} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function SeriesMediaFrame({ src, alt, variant = 'brackets', maxWidth = 'max-w-[360px]' }) {
  return (
    <div className={`relative w-full ${maxWidth} mx-auto`}>
      {variant === 'brackets' && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 -right-2.5 h-8 w-8 rounded-tr-xl border-t border-r border-[#c88d5c]/65"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2.5 -left-2.5 h-8 w-8 rounded-bl-xl border-b border-l border-[#c88d5c]/65"
          />
        </>
      )}
      <div
        className={`overflow-hidden rounded-xl ${
          variant === 'blue-border'
            ? 'border-2 border-[#38bdf8]/80 shadow-[0_12px_30px_rgba(0,0,0,0.55)]'
            : ''
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

function renderSlot(slot, content) {
  if (slot.kind === 'image') {
    return (
      <SeriesMediaFrame
        src={slot.src}
        alt={slot.alt}
        variant={slot.variant}
        maxWidth={slot.maxWidth}
      />
    );
  }
  if (slot.kind === 'paragraphs') {
    const items = (slot.indices ?? []).map((i) => content.paragraphs?.[i]).filter(Boolean);
    return <ParagraphList items={items} />;
  }
  if (slot.kind === 'bullets') {
    const items = (slot.indices ?? []).map((i) => content.bullets?.[i]).filter(Boolean);
    return <BulletList items={items} />;
  }
  return null;
}

function SeriesSections({ sections, content }) {
  return (
    <div className="mt-5 sm:mt-6 space-y-6 sm:space-y-8">
      {sections.map((section, idx) => {
        if (section.type === 'split') {
          return (
            <div
              key={idx}
              className={`grid grid-cols-1 ${
                section.cols ?? 'lg:grid-cols-2'
              } gap-6 sm:gap-8 lg:gap-12 items-center`}
            >
              <div>{renderSlot(section.left, content)}</div>
              <div>{renderSlot(section.right, content)}</div>
            </div>
          );
        }
        if (section.type === 'paragraphs') {
          const items = (section.indices ?? []).map((i) => content.paragraphs?.[i]).filter(Boolean);
          return <ParagraphList key={idx} items={items} className={section.maxWidth ?? ''} />;
        }
        if (section.type === 'bullets') {
          const items = (section.indices ?? []).map((i) => content.bullets?.[i]).filter(Boolean);
          return <BulletList key={idx} items={items} className={section.align ?? ''} />;
        }
        return null;
      })}
    </div>
  );
}

/**
 * Shared multi-page cosmic briefing layout used by both Go Deeper (Science Behind It)
 * and Go Technical (Engineering the Mission).
 */
export default function MissionSeriesPage({
  pages,
  pageNumber = 1,
  sectionLabel,
  backRootLabel = 'Case Board',
  onBack,
  onNext,
  onSelectPage,
  secondaryAction,
  finalAction,
  onOptionalGame,
}) {
  const content = pages[pageNumber - 1] ?? pages[0];
  const isLastPage = pageNumber >= pages.length;

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

  const backgroundPosition =
    content.bgVariant === 'nebula' ? 'right top' : '22% 18%';

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#02050e]">
      {/* Cosmic Nebula Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-500 ${
            content.bgVariant === 'deep' ? 'scale-110 opacity-75' : 'opacity-90'
          }`}
          style={{
            backgroundImage: `url('${encodeURI('/خلفية فضائية سينمائية بسديم وكوكب مضيء.webp')}')`,
            backgroundPosition,
          }}
        />
        <div
          className={`absolute inset-0 ${
            content.bgVariant === 'deep'
              ? 'bg-gradient-to-r from-[#020617]/88 via-[#03091e]/68 to-[#050b20]/55'
              : 'bg-gradient-to-r from-[#020512]/88 via-[#020617]/55 to-transparent'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e]/85 via-transparent to-[#02050e]/55" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-between pt-20 sm:pt-24 md:pt-26 pb-10 px-5 sm:px-10 md:px-14 lg:px-16 xl:px-20 max-w-[1440px] mx-auto w-full">
        <div>
          {/* Top Back Navigation Row */}
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

            <span className="text-lg sm:text-xl md:text-[23px] font-bold font-orbitron uppercase tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {sectionLabel}
            </span>
          </div>

          {/* Primary Content Column */}
          <div
            key={content.page}
            className={`${content.sections ? 'max-w-[1140px]' : 'max-w-[700px]'} inv-fade-up`}
          >
            <h1 className="mt-5 sm:mt-6 md:mt-7 text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-bold font-orbitron text-white leading-[1.18] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-left">
              {content.title}
            </h1>

            {content.subtitle && (
              <p className="mt-2 sm:mt-2.5 text-base sm:text-lg md:text-[20px] font-exo2 font-medium text-[#F7961D] leading-snug tracking-[0.01em] text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {content.subtitle}
              </p>
            )}

            {content.sections ? (
              <SeriesSections sections={content.sections} content={content} />
            ) : (
              <>
                {content.bullets && <BulletList items={content.bullets} className="mt-5 sm:mt-6" />}
                {content.paragraphs && (
                  <ParagraphList items={content.paragraphs} className="mt-5 sm:mt-6" />
                )}
              </>
            )}

            {content.promptBox && (
              <div className="mt-6 sm:mt-7 rounded-xl border border-white/25 bg-[#050b1f]/50 backdrop-blur-sm px-4 sm:px-5 py-3.5 text-left font-exo2 text-[14px] sm:text-[16px] md:text-[17px] leading-[1.42] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                <span className="text-[#F7961D] font-semibold uppercase tracking-wide">
                  {content.promptBox.label}
                </span>{' '}
                <span className="text-white/95">{content.promptBox.text}</span>
              </div>
            )}

            {content.secondarySection && (
              <section className="mt-8 sm:mt-10 text-left">
                <h2 className="text-xl sm:text-2xl md:text-[30px] lg:text-[34px] font-bold font-orbitron text-white leading-[1.2] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]">
                  {content.secondarySection.title}
                </h2>

                {content.secondarySection.questions && (
                  <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4 font-exo2 text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] leading-[1.38] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {content.secondarySection.questions.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-[#F7961D] font-semibold">
                          {item.question}
                        </h3>
                        <p className="text-white/95 font-normal">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {content.secondarySection.paragraphs && (
                  <div className="mt-4 sm:mt-5 space-y-4 sm:space-y-5 font-exo2 text-[15px] sm:text-[17px] md:text-[18px] leading-[1.4] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
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
                    ? 'mt-7 sm:mt-8 text-lg sm:text-xl md:text-[24px] font-orbitron font-bold tracking-wide'
                    : content.secondarySection
                    ? 'mt-6 sm:mt-7 text-base sm:text-lg md:text-[21px] font-exo2 font-medium tracking-[0.01em]'
                    : 'mt-1.5 sm:mt-2 text-[15px] sm:text-[17px] md:text-[19px] lg:text-[20px] font-exo2 font-medium tracking-[0.01em]'
                } text-left text-[#F7961D] leading-[1.4] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]`}
              >
                {content.closing}
              </p>
            )}

            {isLastPage && onOptionalGame && optionalGame && (
              <section
                aria-label="Optional Game Pass"
                className="mt-8 game-panel-sm border border-[#4DE2E8]/45 border-l-4 border-l-[#4DE2E8] p-4 sm:p-5 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-[#39A9FF]/15 border border-[#4DE2E8]/45 text-[#4DE2E8]">
                    {optionalGame.badge}
                  </span>
                </div>
                <h2 className="mt-2.5 text-lg sm:text-xl font-orbitron font-bold text-white uppercase tracking-wide">
                  {optionalGame.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm font-exo2 text-slate-300 leading-relaxed">
                  {optionalGame.description}
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onOptionalGame}
                    className="game-cmd-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#39A9FF] hover:bg-[#4DE2E8] text-[#09111E] font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(77,226,232,0.3)]"
                  >
                    <span>{optionalGame.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Bottom Pagination & Progression Bar */}
        <div className="mt-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={`${sectionLabel} pages`} className="flex flex-wrap items-center gap-2">
            {pages.map((item) => {
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
