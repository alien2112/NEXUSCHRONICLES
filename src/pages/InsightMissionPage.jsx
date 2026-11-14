import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import siteContent from '../data/siteContent.json';

const trailerCopy = siteContent.insightMissionPage;

export default function InsightMissionPage({ onBack, onWatchStory }) {
  const videoRef = useRef(null);
  const userInteractedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptAutoplay = () => {
      if (userInteractedRef.current) return;
      video.defaultMuted = true;
      video.muted = true;
      video.setAttribute('muted', '');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (!video.paused) setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(!video.paused);
      }
    };

    const handleCanPlay = () => {
      if (video.paused) {
        attemptAutoplay();
      }
    };

    attemptAutoplay();
    video.addEventListener('canplay', handleCanPlay);
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    userInteractedRef.current = true;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    userInteractedRef.current = true;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden overflow-y-auto font-public text-white bg-[#0d0705]">
      
      {/* Full-screen optimized InSight mission trailer video (WebM VP9 + H.264 MP4 + WebP poster) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0d07] via-[#2b1409] to-[#0a0605]" />
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          poster={trailerCopy.video.poster}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={trailerCopy.video.webm} type="video/webm" />
          <source src={trailerCopy.video.mp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/50" />
      </div>

      {/* Top Header Row: Back Button & "Insight" Title */}
      <div className="relative z-20 pt-20 sm:pt-24 md:pt-28 px-6 sm:px-10 md:px-14 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={onBack}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/70 hover:border-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label={trailerCopy.backAriaLabel}
            title={trailerCopy.backTitle}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-[38px] font-bold font-orbitron tracking-wider text-white">
            {trailerCopy.title}
          </h1>
        </div>
      </div>

      {/* 
        Main Content Area:
        Right-aligned text block ("A Tiny Listener on a Big Planet") and "Watch the story" hexagonal button
      */}
      <main className="relative z-10 flex-1 flex items-center justify-center lg:justify-end px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 max-w-[1440px] mx-auto w-full pb-16">
        
        <div className="w-full max-w-[520px] flex flex-col items-center text-center">
          
          {/* Heading in Orbitron */}
          <h2 className="text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-bold font-orbitron text-white leading-[1.22] tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]">
            {trailerCopy.headlineLines.map((line, idx) => (
              <span key={idx}>
                {idx > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>

          {/* Subtitle in Exo 2 */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-[18px] text-white/95 font-exo2 font-normal leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            {trailerCopy.subtitleLines.map((line, idx) => (
              <span key={idx}>
                {idx > 0 && <br />}
                {line}
              </span>
            ))}
          </p>

          {/* Pointed Hexagonal Button: "Watch the story ->" */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={onWatchStory}
              className="relative group inline-flex items-center justify-between gap-3.5 px-6 sm:px-7 py-3 w-full max-w-[265px] sm:w-auto sm:max-w-none sm:min-w-[255px] h-[50px] transition-all duration-300 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
              title={trailerCopy.ctaTitle}
            >
              {/* Pointed Hexagon Border SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.45)]"
                viewBox="0 0 255 50"
                preserveAspectRatio="none"
              >
                <path
                  d="M 24 1.5 L 231 1.5 Q 239 1.5 244 9 L 251 20 Q 253.5 25 251 30 L 244 41 Q 239 48.5 231 48.5 L 24 48.5 Q 16 48.5 11 41 L 4 30 Q 1.5 25 4 20 L 11 9 Q 16 1.5 24 1.5 Z"
                  fill="rgba(255, 255, 255, 0.06)"
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth="1.5"
                  className="group-hover:stroke-white group-hover:fill-[rgba(255,255,255,0.14)] transition-all duration-300"
                />
              </svg>

              {/* Left Play Circle Icon */}
              <span className="relative z-10 w-6 h-6 rounded-full border border-white/85 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
              </span>

              {/* Center Button Label */}
              <span className="relative z-10 text-white font-exo2 text-[15px] sm:text-[16px] font-medium tracking-wide">
                {trailerCopy.ctaLabel}
              </span>

              {/* Right Arrow Icon */}
              <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>
          </div>

        </div>

      </main>

      {/* Compact trailer playback & audio controls */}
      <div className="fixed bottom-5 left-5 sm:bottom-7 sm:left-10 z-20 flex items-center gap-2 rounded-full border border-white/25 bg-black/55 backdrop-blur-md px-2.5 py-1.5 shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? trailerCopy.video.pauseAriaLabel : trailerCopy.video.playAriaLabel}
          title={isPlaying ? trailerCopy.video.pauseAriaLabel : trailerCopy.video.playAriaLabel}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="h-4 w-px bg-white/20" aria-hidden="true" />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? trailerCopy.video.unmuteAriaLabel : trailerCopy.video.muteAriaLabel}
          title={isMuted ? trailerCopy.video.unmuteAriaLabel : trailerCopy.video.muteAriaLabel}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
}
