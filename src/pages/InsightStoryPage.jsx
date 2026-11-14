import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Pause, Play, Thermometer } from 'lucide-react';
import NasaLogo from '../components/NasaLogo';
import useStoryAudio from '../hooks/useStoryAudio';
import { shouldIgnoreSceneShortcut } from '../utils/keyboard';
import siteContent from '../data/siteContent.json';

const seriesCopy = siteContent.insightStorySeries;

function RichSegments({ segments }) {
  return segments.map((seg, idx) =>
    typeof seg === 'string' ? (
      <span key={idx}>{seg}</span>
    ) : (
      <span key={idx} className="text-[#F7961D] font-medium">
        {seg.text}
      </span>
    ),
  );
}

function StoryTitle({ titleLines }) {
  return (
    <h1 className="text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-bold font-orbitron text-white leading-[1.18] tracking-wide drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] text-left">
      {titleLines.map((lineSegments, idx) => (
        <span key={idx}>
          {idx > 0 && <br />}
          <RichSegments segments={lineSegments} />
        </span>
      ))}
    </h1>
  );
}

const FRAME_VARIANT_CLASSES = {
  hero: 'aspect-[16/10] w-full',
  wide: 'aspect-[16/9] w-full',
  square: 'aspect-[4/3] sm:aspect-square w-full max-w-[260px] lg:max-w-[280px] mx-auto',
  pair: 'aspect-[16/10] w-full',
};

function StoryMediaFrame({ frame }) {
  const sizeClass = FRAME_VARIANT_CLASSES[frame.variant] ?? FRAME_VARIANT_CLASSES.hero;

  return (
    <div
      className={`relative ${sizeClass} rounded-2xl border border-white/25 bg-[#050b1c]/50 backdrop-blur-[2px] shadow-[0_14px_40px_rgba(0,0,0,0.55)] overflow-visible`}
      role="img"
      aria-label={frame.alt}
      data-placeholder={frame.src ? 'false' : 'true'}
    >
      {/* Decorative HUD corner brackets matching mission frame styling */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1.5 -left-1.5 w-8 h-8 rounded-tl-2xl border-t border-l border-[#F7961D]/65"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1.5 -right-1.5 w-8 h-8 rounded-tr-2xl border-t border-r border-[#F7961D]/65"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-8 h-8 rounded-bl-2xl border-b border-l border-[#F7961D]/65"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-br-2xl border-b border-r border-[#F7961D]/65"
      />

      {frame.src ? (
        <img
          src={frame.src}
          alt={frame.alt}
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-[#F7961D]/[0.03]" />
      )}
    </div>
  );
}

function VitalSignIcon({ type }) {
  if (type === 'pulse') {
    return (
      <svg
        viewBox="0 0 40 40"
        className="w-9 h-9 text-[#F7961D] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="4" y1="20" x2="4" y2="20" />
        <line x1="8" y1="17" x2="8" y2="23" />
        <line x1="12" y1="13" x2="12" y2="27" />
        <line x1="16" y1="8" x2="16" y2="32" />
        <line x1="20" y1="5" x2="20" y2="35" />
        <line x1="24" y1="11" x2="24" y2="29" />
        <line x1="28" y1="15" x2="28" y2="25" />
        <line x1="32" y1="18" x2="32" y2="22" />
        <line x1="36" y1="20" x2="36" y2="20" />
      </svg>
    );
  }
  if (type === 'reflexes') {
    return (
      <svg
        viewBox="0 0 40 40"
        className="w-9 h-9 text-[#F7961D] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="9" />
        <ellipse cx="20" cy="20" rx="16" ry="5.5" transform="rotate(-25 20 20)" />
        <line x1="20" y1="5" x2="20" y2="35" strokeDasharray="2 3" />
      </svg>
    );
  }
  return <Thermometer className="w-9 h-9 text-[#F7961D] shrink-0" strokeWidth={1.8} aria-hidden="true" />;
}

function VitalSignsCard({ block }) {
  return (
    <section className="rounded-2xl border border-[#F7961D]/35 bg-[#050a18]/75 backdrop-blur-md px-5 sm:px-8 py-6 sm:py-7 shadow-[0_16px_44px_rgba(0,0,0,0.55)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <NasaLogo className="w-12 h-10 sm:w-14 sm:h-11 shrink-0" />
        <p className="font-exo2 text-[15px] sm:text-[17px] md:text-[18px] leading-[1.45] text-white/95">
          <RichSegments segments={block.intro} />
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-[#F7961D]/25">
        {block.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 md:px-6 first:md:pl-0 last:md:pr-0"
          >
            <VitalSignIcon type={item.icon} />
            <div className="font-exo2 text-[14px] sm:text-[15px] md:text-[16px] leading-[1.4]">
              <div className="text-[#F7961D] font-semibold">{item.title}</div>
              <div className="text-white/90 mt-0.5">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 pt-4 border-t border-white/10 font-exo2 text-[14px] sm:text-[15px] md:text-[16px] text-white/85 leading-[1.45] text-left md:text-center">
        {block.footer}
      </p>
    </section>
  );
}

function AudioBanner({ block, playingTrack, onToggleTrack }) {
  const isPlaying = playingTrack === block.trackId;
  const isPill = block.variant === 'pill';

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggleTrack(block.trackId)}
        aria-pressed={isPlaying}
        aria-label={block.ariaLabel}
        className={`group text-left transition-all duration-200 cursor-pointer active:scale-[0.99] flex items-center gap-4 ${
          isPill
            ? 'rounded-xl border px-4 sm:px-5 py-3 inline-flex w-full sm:w-auto sm:min-w-[380px]'
            : 'rounded-2xl border px-5 sm:px-6 py-4 w-full'
        } ${
          isPlaying
            ? 'border-[#F7961D] bg-[#F7961D]/15 shadow-[0_0_24px_rgba(247,150,29,0.28)]'
            : 'border-[#F7961D]/55 bg-[#080e1f]/75 hover:border-[#F7961D] hover:bg-[#0d1630]/80'
        } backdrop-blur-sm`}
      >
        <span
          className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            isPlaying
              ? 'border-[#F7961D] bg-[#F7961D] text-[#050811]'
              : 'border-[#F7961D]/85 text-[#F7961D] group-hover:bg-[#F7961D]/15'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </span>

        <div className="font-exo2 text-[14px] sm:text-[16px] md:text-[17px] leading-[1.42] text-white">
          {block.lines.map((line, idx) => (
            <div key={idx}>
              <RichSegments segments={line} />
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}

function AudioPlaylistCard({ block, playingTrack, onToggleTrack }) {
  const [selectedTrack, setSelectedTrack] = useState(block.tracks[0]?.id ?? 'wind');
  const activeTrack = playingTrack ?? selectedTrack;
  const isAnyPlaying = Boolean(playingTrack);

  const handleTrackClick = (trackId) => {
    setSelectedTrack(trackId);
    onToggleTrack(trackId);
  };

  return (
    <div className="rounded-2xl border border-[#F7961D]/40 bg-[#070d1e]/75 backdrop-blur-md px-5 sm:px-7 py-5 max-w-[660px] flex items-center justify-between gap-5 shadow-[0_12px_36px_rgba(0,0,0,0.55)]">
      <div>
        <div className="font-exo2 text-[17px] sm:text-[19px] font-medium text-white">
          <RichSegments segments={block.heading} />
        </div>

        <ul className="mt-2.5 pl-4 sm:pl-6 space-y-1.5">
          {block.tracks.map((track) => {
            const isPlaying = playingTrack === track.id;
            const isSelected = activeTrack === track.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => handleTrackClick(track.id)}
                  aria-pressed={isPlaying}
                  className={`text-left font-exo2 text-[14px] sm:text-[16px] transition-colors cursor-pointer rounded px-1.5 py-0.5 -ml-1.5 ${
                    isPlaying
                      ? 'text-[#F7961D] bg-[#F7961D]/15 font-medium'
                      : isSelected
                      ? 'text-white hover:text-[#F7961D]'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  <span>{track.label} </span>
                  <span className="text-[#F7961D] font-medium">{track.date}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onToggleTrack(activeTrack)}
        aria-pressed={isAnyPlaying}
        aria-label={block.playButtonAriaLabel}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95 ${
          isAnyPlaying
            ? 'border-[#F7961D] bg-[#F7961D] text-[#050811] shadow-[0_0_18px_rgba(247,150,29,0.5)]'
            : 'border-[#F7961D]/85 text-[#F7961D] hover:bg-[#F7961D]/15'
        }`}
      >
        {isAnyPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
}

function TextColumn({ column }) {
  return (
    <div className="space-y-4">
      {column.titleLines && <StoryTitle titleLines={column.titleLines} />}
      {column.paragraphs?.map((segments, idx) => (
        <p
          key={idx}
          className="font-exo2 font-normal text-[15px] sm:text-[17px] md:text-[18.5px] lg:text-[19.5px] leading-[1.42] tracking-[0.01em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] whitespace-pre-line"
        >
          <RichSegments segments={segments} />
        </p>
      ))}
    </div>
  );
}

function ColumnSlot({ slot }) {
  if (slot.kind === 'media') {
    return <StoryMediaFrame frame={slot.frame} />;
  }
  return <TextColumn column={slot} />;
}

function StoryBlock({ block, playingTrack, onToggleTrack }) {
  if (block.type === 'paragraph') {
    return (
      <p
        className={`${block.maxWidth ?? 'max-w-[780px]'} font-exo2 font-normal text-[15px] sm:text-[17px] md:text-[18.5px] lg:text-[19.5px] leading-[1.42] tracking-[0.01em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] whitespace-pre-line text-left`}
      >
        <RichSegments segments={block.segments} />
      </p>
    );
  }

  if (block.type === 'split') {
    const colTemplate =
      block.layout === 'story2-hero' || block.layout === 'story6-hero'
        ? 'lg:grid-cols-[0.95fr_1.15fr]'
        : block.layout === 'media-left-text-right'
        ? 'lg:grid-cols-[0.95fr_1.1fr]'
        : 'lg:grid-cols-[1.15fr_0.85fr]';

    return (
      <div className={`grid grid-cols-1 ${colTemplate} gap-6 sm:gap-8 lg:gap-10 items-center text-left`}>
        <ColumnSlot slot={block.left} />
        <ColumnSlot slot={block.right} />
      </div>
    );
  }

  if (block.type === 'triple') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[230px_1fr_230px] gap-6 sm:gap-7 items-center text-left">
        <div className="order-2 md:order-1 lg:order-1">
          <ColumnSlot slot={block.left} />
        </div>
        <div className="order-1 md:col-span-2 lg:col-span-1 lg:order-2">
          <ColumnSlot slot={block.center} />
        </div>
        <div className="order-3 md:order-2 lg:order-3">
          <ColumnSlot slot={block.right} />
        </div>
      </div>
    );
  }

  if (block.type === 'media-pair') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {block.frames.map((frame, idx) => (
          <StoryMediaFrame key={idx} frame={frame} />
        ))}
      </div>
    );
  }

  if (block.type === 'vital-signs-card') {
    return <VitalSignsCard block={block} />;
  }

  if (block.type === 'audio-banner') {
    return (
      <AudioBanner
        block={block}
        playingTrack={playingTrack}
        onToggleTrack={onToggleTrack}
      />
    );
  }

  if (block.type === 'audio-playlist-card') {
    return (
      <AudioPlaylistCard
        block={block}
        playingTrack={playingTrack}
        onToggleTrack={onToggleTrack}
      />
    );
  }

  if (block.type === 'tagline') {
    return (
      <p className="font-exo2 font-semibold text-[18px] sm:text-[21px] md:text-[23px] text-[#F7961D] tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] text-left">
        {block.text}
      </p>
    );
  }

  return null;
}

export default function InsightStoryPage({ storyNumber = 2, onBack, onNext }) {
  const story =
    seriesCopy.pages.find((item) => item.storyNumber === storyNumber) ?? seriesCopy.pages[0];
  const { playingTrack, audioError, togglePlayAudio, stopAudio } = useStoryAudio();

  useEffect(() => {
    stopAudio();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [storyNumber, stopAudio]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (shouldIgnoreSceneShortcut(event) || document.querySelector('dialog[open]')) {
        return;
      }
      if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowLeft' && onBack) {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onNext]);

  const bgPosition =
    story.bgVariant === 'mars-glow'
      ? 'right bottom'
      : story.bgVariant === 'mars-horizon'
      ? 'center bottom'
      : story.bgVariant === 'deep'
      ? '20% 15%'
      : 'right top';

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#02050e]">
      {/* Cosmic Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-500 ${
            story.bgVariant === 'deep' ? 'scale-110 opacity-75' : 'opacity-90'
          }`}
          style={{
            backgroundImage: `url('${encodeURI(seriesCopy.backgroundImage)}')`,
            backgroundPosition: bgPosition,
          }}
        />
        {(story.bgVariant === 'mars-glow' || story.bgVariant === 'mars-horizon') && (
          <div
            className="absolute inset-0"
            style={{
              background:
                story.bgVariant === 'mars-horizon'
                  ? 'radial-gradient(ellipse 90% 55% at 75% 92%, rgba(234, 88, 12, 0.42), rgba(154, 52, 18, 0.22) 45%, transparent 75%)'
                  : 'radial-gradient(ellipse 65% 55% at 88% 72%, rgba(234, 88, 12, 0.36), transparent 72%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020512]/82 via-[#020617]/55 to-[#020512]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e]/85 via-transparent to-[#02050e]/60" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-20 sm:pt-24 md:pt-26 pb-16 px-5 sm:px-10 md:px-14 lg:px-16 xl:px-20 max-w-[1280px] mx-auto w-full">
        {/* Top Back Navigation Row: (<-) Mission Chronicles */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white/85 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            aria-label={story.backAriaLabel}
            title={story.backTitle}
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2} />
          </button>

          <span className="text-lg sm:text-xl md:text-[23px] font-bold font-orbitron tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {seriesCopy.headerTitle}
          </span>
        </div>

        {/* Page Blocks */}
        <div key={story.storyNumber} className="mt-6 sm:mt-8 space-y-6 sm:space-y-8 inv-fade-up pr-4 sm:pr-10">
          {story.titleLines && <StoryTitle titleLines={story.titleLines} />}

          {story.blocks.map((block, idx) => (
            <StoryBlock
              key={`${story.storyNumber}-${idx}`}
              block={block}
              playingTrack={playingTrack}
              onToggleTrack={togglePlayAudio}
            />
          ))}

          {audioError && (
            <div
              role="status"
              className="rounded-xl border border-[#F7961D]/45 bg-[#1a0f00]/80 px-4 py-2.5 text-sm font-exo2 text-[#F7961D]"
            >
              {audioError}
            </div>
          )}
        </div>

        {/* Right-edge Next Story / Investigation Button */}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="fixed right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-[#040917]/65 backdrop-blur-sm hover:border-[#F7961D] hover:bg-[#F7961D]/15 text-white/90 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.65)]"
            aria-label={story.nextAriaLabel}
            title={story.nextTitle}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
          </button>
        )}
      </main>
    </div>
  );
}
