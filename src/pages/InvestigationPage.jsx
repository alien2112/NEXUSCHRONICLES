import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Check,
  UserRound,
  ChevronRight,
} from 'lucide-react';
import useInvestigationAudio from '../hooks/useInvestigationAudio';
import { shouldIgnoreSceneShortcut } from '../utils/keyboard';
import { earnStamp } from '../features/investigation/progress';
import { TRUST_OPTIONS } from '../features/investigation/investigationData';
import CaseBoardView from '../features/investigation/CaseBoardPanel';
import { Test01Workspace } from '../features/investigation/Test01Workspace';
import { Test02Workspace } from '../features/investigation/Test02Workspace';
import { Test03Workspace } from '../features/investigation/Test03Workspace';
import { Test04Workspace } from '../features/investigation/Test04Workspace';

const STEPS = [
  { number: 1, lines: ['The Ground shook'], leftPct: '21.6%' },
  { number: 2, lines: ['Something', 'new formed'], leftPct: '37.2%' },
  { number: 3, lines: ['Can a small', 'Rock do this?'], leftPct: '52.8%' },
  { number: 4, lines: ['Is it really ice?'], leftPct: '68.2%' },
  { number: 5, lines: ['Case Board'], leftPct: '83.8%' },
];

// Scene ordering for sequential navigation & Back button
const SCENE_ORDER = [
  'intro1-1',
  'intro1-2',
  'intro1-3',
  'intro1-4',
  'intro1-5',
  'intro1-6',
  'intro1-7',
  'intro1-8',
  'test-1',
  'intro2-1',
  'intro2-2',
  'test-2',
  'intro3',
  'test-3',
  'intro4',
  'test-4',
  'case-board',
];

const CHAPTER_TOASTS = {
  intro1: { code: 'BRIEFING', title: 'Meet NEXUS · Case 1094' },
  'test-1': { code: 'TEST 01', title: 'Real quake or just noise?' },
  intro2: { code: 'WITNESS 02', title: 'A second witness in orbit' },
  'test-2': { code: 'TEST 02', title: 'Something new, right place & time?' },
  intro3: { code: 'DOUBT CHECK', title: 'Can a small rock do this?' },
  'test-3': { code: 'TEST 03', title: 'Crater scale & impact energy' },
  intro4: { code: 'FINAL CLUE', title: 'White patches around the crater' },
  'test-4': { code: 'TEST 04', title: 'Is it really water ice?' },
  'case-board': { code: 'CASE BOARD', title: 'Final evidence synthesis' },
};

const getChapterGroup = (sceneId) => {
  if (sceneId.startsWith('intro1-')) return 'intro1';
  if (sceneId.startsWith('intro2-')) return 'intro2';
  return sceneId;
};

export default function InvestigationPage({ onBack }) {
  const [scene, setScene] = useState('intro1-1');
  const [transitionDir, setTransitionDir] = useState('next'); // 'next' | 'prev'
  const [chapterToast, setChapterToast] = useState(null);
  const [codename, setCodename] = useState('');
  const [codenameInput, setCodenameInput] = useState('');
  const [initialConfidence, setInitialConfidence] = useState(null);
  const [confidenceChoice, setConfidenceChoice] = useState(null);
  const [earnedStampIds, setEarnedStampIds] = useState([]);
  const unlockStamp = id => setEarnedStampIds(previous => earnStamp(previous, id));

  const { playingTrack, audioError, togglePlayAudio, stopAudio } = useInvestigationAudio();
  const toastTimerRef = useRef(null);

  const isIntroScene =
    scene.startsWith('intro1-') ||
    scene.startsWith('intro2-') ||
    scene === 'intro3' ||
    scene === 'intro4';

  const displayCodename = codename.trim() ? codename.trim() : '{name}';

  const activeStepNumber = (() => {
    if (scene === 'test-1' || scene.startsWith('intro1-')) return 1;
    if (scene === 'test-2' || scene.startsWith('intro2-')) return 2;
    if (scene === 'test-3' || scene === 'intro3') return 3;
    if (scene === 'test-4' || scene === 'intro4') return 4;
    if (scene === 'case-board') return 5;
    return 1;
  })();

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);
  useEffect(() => { stopAudio(); }, [scene, stopAudio]);

  const navigateToScene = useCallback(
    (targetScene) => {
      if (!targetScene || targetScene === scene) return;
      const curIdx = SCENE_ORDER.indexOf(scene);
      const nextIdx = SCENE_ORDER.indexOf(targetScene);
      setTransitionDir(nextIdx >= 0 && curIdx >= 0 && nextIdx < curIdx ? 'prev' : 'next');

      const prevGroup = getChapterGroup(scene);
      const nextGroup = getChapterGroup(targetScene);
      if (prevGroup !== nextGroup && CHAPTER_TOASTS[nextGroup]) {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setChapterToast(CHAPTER_TOASTS[nextGroup]);
        toastTimerRef.current = setTimeout(() => setChapterToast(null), 2200);
      }

      setScene(targetScene);
    },
    [scene]
  );

  // Advance from current intro scene to next scene
  const handleAdvanceIntro = useCallback(() => {
    if (scene === 'intro1-3') {
      if (codenameInput.trim()) setCodename(codenameInput.trim());
      navigateToScene('intro1-4');
      return;
    }
    if (scene === 'intro1-8') return; // Wait for confidence button pick
    if (scene === 'intro2-2') {
      navigateToScene('test-2');
      return;
    }
    if (scene === 'intro3') {
      navigateToScene('test-3');
      return;
    }
    if (scene === 'intro4') {
      navigateToScene('test-4');
      return;
    }
    const idx = SCENE_ORDER.indexOf(scene);
    if (idx >= 0 && idx < SCENE_ORDER.length - 1) {
      navigateToScene(SCENE_ORDER[idx + 1]);
    }
  }, [scene, codenameInput, navigateToScene]);

  const handleStepForward = useCallback(() => {
    if (isIntroScene) {
      if (scene !== 'intro1-8') handleAdvanceIntro();
      return;
    }
    const idx = SCENE_ORDER.indexOf(scene);
    if (idx >= 0 && idx < SCENE_ORDER.length - 1) {
      navigateToScene(SCENE_ORDER[idx + 1]);
    }
  }, [isIntroScene, scene, handleAdvanceIntro, navigateToScene]);

  // Keyboard navigation across all scenes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (shouldIgnoreSceneShortcut(e) || document.querySelector('dialog[open]')) return;
      if (e.key === 'ArrowRight' || (isIntroScene && (e.key === ' ' || e.key === 'Enter'))) {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = SCENE_ORDER.indexOf(scene);
        if (idx > 0) navigateToScene(SCENE_ORDER[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntroScene, scene, handleStepForward, navigateToScene]);

  const handleCodenameSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (codenameInput.trim()) setCodename(codenameInput.trim());
    navigateToScene('intro1-4');
  };

  const handleSelectInitialConfidence = (option) => {
    setInitialConfidence(option);
    setConfidenceChoice(option);
    navigateToScene('test-1');
  };

  const handleBackClick = () => {
    const idx = SCENE_ORDER.indexOf(scene);
    if (idx > 0) {
      navigateToScene(SCENE_ORDER[idx - 1]);
    } else if (onBack) {
      onBack();
    }
  };

  // Orange progress track width across the 5 stepper nodes (16.2% to 83.8% -> 67.6% span)
  const progressRatio = (activeStepNumber - 1) / (STEPS.length - 1);

  return (
    <div className="relative min-h-screen w-full flex flex-col select-none overflow-x-hidden font-public text-white bg-[#040818]">
      {/* Full-Screen Investigation Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none"
        style={{ backgroundImage: `url('/investigationpage-bg.webp')` }}
      />

      {/* Subtle atmospheric gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(3, 7, 22, 0.52) 0%, rgba(4, 9, 26, 0.18) 45%, rgba(3, 6, 18, 0.42) 100%)',
        }}
      />

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pt-[56px] sm:pt-[60px] lg:pt-[64px] pb-2.5 sm:pb-3 px-4 sm:px-7 md:px-10 lg:px-12 max-w-[1440px] mx-auto w-full">
        {/* 1. UPPER-LEFT HEADER BLOCK */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <button
              onClick={handleBackClick}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[1.5px] border-white/95 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-white" strokeWidth={2} />
            </button>

            <h1 className="text-xl sm:text-2xl md:text-[25px] lg:text-[27px] font-bold font-orbitron tracking-wider text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Investigation
            </h1>
          </div>

          <div className="pl-9 sm:pl-11 mt-1.5 sm:mt-2">
            <h2 className="text-2xl sm:text-[30px] md:text-[32px] lg:text-[34px] font-bold font-orbitron text-[#F7961D] tracking-wide leading-[1.12] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              Prove It: Case 1094
            </h2>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-[15px] md:text-[16px] lg:text-[17px] font-exo2 font-normal text-white/95 tracking-[0.01em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Don&apos;t just trust the mission. Check the evidence
            </p>
          </div>
        </div>

        {/* CHAPTER TRANSITION BANNER TOAST */}
        {chapterToast && (
          <div
            key={`${chapterToast.code}-${chapterToast.title}`}
            className="fixed top-[76px] sm:top-[84px] left-1/2 z-50 pointer-events-none inv-toast-in"
          >
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#060b1c]/92 border border-[#F7961D]/70 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.75)]">
              <span className="w-2 h-2 rounded-full bg-[#F7961D] animate-pulse" />
              <span className="font-orbitron text-[10px] sm:text-[11px] font-bold tracking-widest text-[#F7961D] uppercase">
                {chapterToast.code}
              </span>
              <span className="text-white/35 text-xs">•</span>
              <span className="font-exo2 text-xs sm:text-[13px] font-medium text-white">
                {chapterToast.title}
              </span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* INTRO SCENES: INTRO 1 (0-1..0-8), INTRO 2, INTRO 3, INTRO 4         */}
        {/* =================================================================== */}
        {isIntroScene ? (
          <div
            key={`intro-stage-${getChapterGroup(scene)}`}
            className={`relative flex-1 flex items-center justify-start w-full my-auto py-4 sm:py-6 ${
              transitionDir === 'prev' ? 'inv-stage-prev' : 'inv-stage-next'
            }`}
          >
            <div className="relative w-full max-w-[1180px] ml-0 sm:ml-[5%] lg:ml-[7%] flex items-center">
              <div
                onClick={scene !== 'intro1-8' ? handleAdvanceIntro : undefined}
                className={`group relative w-full max-w-[760px] min-h-[250px] sm:min-h-[290px] md:min-h-[325px] lg:min-h-[350px] pt-5 sm:pt-6 px-7 sm:px-10 md:px-14 pb-10 flex flex-col justify-start ${
                  scene !== 'intro1-8' ? 'cursor-pointer' : ''
                }`}
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 760 350"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 24 2 L 222 2 L 248 28 L 732 28 L 758 54 L 758 324 L 732 348 L 26 348 L 2 324 L 2 24 Z"
                    fill="rgba(6, 11, 28, 0.78)"
                    stroke="#F7961D"
                    strokeOpacity="0.7"
                    strokeWidth="1.5"
                  />
                </svg>

                <div className="relative z-10 flex items-center gap-2 text-[#F7961D] mb-7 sm:mb-9 md:mb-11">
                  <UserRound className="w-4 h-4 sm:w-5 sm:h-5 text-[#F7961D] shrink-0" strokeWidth={2} />
                  <span className="font-exo2 font-medium text-base sm:text-lg md:text-[21px] tracking-wide uppercase">
                    NEXUS
                  </span>
                </div>

                {/* Dialogue Text */}
                <div
                  key={`intro-text-${scene}`}
                  className="relative z-10 text-left font-exo2 font-normal text-white text-xl sm:text-2xl md:text-[31px] lg:text-[34px] leading-[1.32] tracking-[0.01em] pr-16 sm:pr-28 md:pr-36 max-w-[650px] inv-dialogue-swap"
                >
                  {scene === 'intro1-1' && (
                    <div>
                      <p>Hey. I&apos;m NEXUS.</p>
                      <p>I live in the mission archive.</p>
                    </div>
                  )}

                  {scene === 'intro1-2' && (
                    <div>
                      <p>I&apos;ve read every log. I&apos;ve never</p>
                      <p>seen Mars. I need your eyes.</p>
                    </div>
                  )}

                  {scene === 'intro1-3' && (
                    <div>
                      <p>Pick a codename.</p>
                      <form
                        onSubmit={handleCodenameSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-4 sm:mt-5 flex items-center gap-2.5 max-w-[360px]"
                      >
                        <input
                          type="text"
                          value={codenameInput}
                          onChange={(e) => setCodenameInput(e.target.value)}
                          aria-label="Codename"
                          placeholder="Enter codename..."
                          autoFocus
                          className="w-full px-4 py-2 rounded-full bg-[#091330]/90 border border-[#F7961D]/60 focus:border-[#F7961D] text-white text-sm sm:text-base font-exo2 outline-none placeholder:text-white/40 shadow-inner"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full bg-[#F7961D] hover:bg-[#f9a63e] text-[#1a0d00] font-exo2 font-semibold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer shrink-0"
                        >
                          Continue
                        </button>
                      </form>
                    </div>
                  )}

                  {scene === 'intro1-4' && (
                    <div>
                      <p>Okay, {displayCodename}. The story says a</p>
                      <p>space rock hit Mars on</p>
                      <p>Christmas Eve 2021.</p>
                    </div>
                  )}

                  {scene === 'intro1-5' && (
                    <div>
                      <p>Big claim.</p>
                      <p>We check big claims.</p>
                    </div>
                  )}

                  {scene === 'intro1-6' && (
                    <div className="space-y-0.5 text-lg sm:text-2xl md:text-[28px] lg:text-[31px] leading-[1.28]">
                      <p>The Suspects</p>
                      <p>A: a space rock.</p>
                      <p>B: Mars cracked by itself.</p>
                      <p>C: just noise.</p>
                    </div>
                  )}

                  {(scene === 'intro1-7' || scene === 'intro1-8') && (
                    <div>
                      <p>Three suspects.</p>
                      <p>Let&apos;s see who survives.</p>
                    </div>
                  )}

                  {scene === 'intro2-1' && (
                    <div>
                      <p>Suspect B says Mars just</p>
                      <p>cracked. No rock needed.</p>
                      <p>Prove B wrong.</p>
                    </div>
                  )}

                  {scene === 'intro2-2' && (
                    <div>
                      <p>We need a second witness.</p>
                      <p>One that can see.</p>
                    </div>
                  )}

                  {scene === 'intro3' && (
                    <div>
                      <p>Claim three: a rock made this.</p>
                      <p>I&apos;m doubtful. Look at the size</p>
                    </div>
                  )}

                  {scene === 'intro4' && (
                    <div>
                      <p>My favorite. White patches</p>
                      <p>around the crater. NASA says</p>
                      <p>water ice.</p>
                    </div>
                  )}
                </div>

                {scene !== 'intro1-8' && (
                  <div className="absolute bottom-3.5 right-8 z-10 flex items-center gap-1 text-xs font-exo2 text-white/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <span>Click to continue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* SCENE 0-8 BOTTOM CONFIDENCE BAR */}
                {scene === 'intro1-8' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 w-[94%] sm:w-[90%] max-w-[680px] z-30 py-3.5 sm:py-4 px-4 sm:px-6 inv-fade-up"
                  >
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 680 105"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 22 2 L 658 2 L 678 24 L 678 81 L 658 103 L 22 103 L 2 81 L 2 24 Z"
                        fill="rgba(4, 9, 24, 0.96)"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="1.2"
                      />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <p className="font-exo2 text-white text-sm sm:text-base md:text-[19px] font-normal tracking-wide mb-2.5 sm:mb-3">
                        How sure are you a space rock did this?
                      </p>

                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-2.5 w-full">
                        {TRUST_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleSelectInitialConfidence(option)}
                            className="px-3.5 sm:px-4 py-1 sm:py-1.5 min-w-[74px] sm:min-w-[92px] rounded-full border border-white/55 hover:border-[#F7961D] bg-[#09122c]/85 hover:bg-[#F7961D]/20 text-white text-xs sm:text-[13px] font-exo2 whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FULL-BODY INTRO ROBOT (/robot-intro-scences.png) */}
              <div
                onClick={scene !== 'intro1-8' ? handleAdvanceIntro : undefined}
                className={`
                  relative 
                  -ml-14 sm:-ml-22 md:-ml-24 lg:-ml-28 
                  mt-4 sm:mt-8 
                  w-[220px] sm:w-[300px] md:w-[375px] lg:w-[420px] 
                  shrink-0 z-20 select-none
                  ${scene !== 'intro1-8' ? 'cursor-pointer' : 'pointer-events-none'}
                `}
              >
                <img
                  src="/robot-intro-scences.png"
                  alt="NEXUS Companion Robot"
                  className="w-full h-auto object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.85)]"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* TEST 01 - TEST 04 & CASE BOARD WORKSPACES                         */
          /* ================================================================= */
          <>
            {/* 2. 5-STEP HORIZONTAL PROGRESS STEPPER */}
            <div className="relative w-full my-1.5 sm:my-2 lg:my-2.5 h-[66px] sm:h-[70px]">
              {/* Subtle Leading Dot + Line Left of Step 1 */}
              <div
                className="hidden sm:flex items-center absolute top-[16px] sm:top-[18px] -translate-y-1/2 pointer-events-none"
                style={{ left: '16.5%', width: '5.1%' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                <span className="flex-1 h-[1px] bg-white/55" />
              </div>
              {/* Base Connecting Line */}
              <div
                className="absolute top-[16px] sm:top-[18px] -translate-y-1/2 h-[1px] bg-white/55 pointer-events-none"
                style={{ left: '21.6%', width: '62.2%' }}
              />
              {/* Completed Orange Progress Segment */}
              <div
                className="absolute top-[16px] sm:top-[18px] -translate-y-1/2 h-[1.5px] bg-[#F7961D] transition-all duration-300 pointer-events-none"
                style={{ left: '21.6%', width: `${progressRatio * 62.2}%` }}
              />

              {STEPS.map((step) => {
                const isCompleted = earnedStampIds.includes(step.number);
                const isActive = step.number === activeStepNumber;
                return (
                  <button
                    type="button"
                    aria-label={`Go to ${step.number === 5 ? 'Case Board' : `Test ${step.number}`}`}
                    aria-current={isActive ? 'step' : undefined}
                    key={step.number}
                    onClick={() => {
                      if (step.number === 1) navigateToScene('test-1');
                      else if (step.number === 2) navigateToScene('test-2');
                      else if (step.number === 3) navigateToScene('test-3');
                      else if (step.number === 4) navigateToScene('test-4');
                      else if (step.number === 5) navigateToScene('case-board');
                    }}
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center text-center cursor-pointer group"
                    style={{ left: step.leftPct }}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-exo2 text-sm sm:text-[15px] font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#F7961D] text-white shadow-[0_0_12px_rgba(247,150,29,0.45)]'
                          : isActive
                          ? 'bg-[#F7961D] text-white shadow-[0_0_14px_rgba(247,150,29,0.6)]'
                          : 'bg-[#D9D9D9] text-[#222222] group-hover:ring-2 group-hover:ring-[#F7961D]/70'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
                      ) : (
                        step.number
                      )}
                    </div>

                    <div
                      className={`mt-1.5 font-exo2 text-[11px] sm:text-xs md:text-[12.5px] leading-[1.2] whitespace-nowrap transition-colors duration-200 ${
                        isActive || isCompleted
                          ? 'text-[#F7961D] font-medium'
                          : 'text-white/90 font-normal'
                      }`}
                    >
                      {step.lines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 3. ACTIVE STEP WORKSPACE */}
            <div
              key={`workspace-${scene}`}
              className={transitionDir === 'prev' ? 'inv-stage-prev' : 'inv-stage-next'}
            >
              {scene === 'test-1' && (
                <Test01Workspace
                  audioError={audioError}
                  playingTrack={playingTrack}
                  togglePlayAudio={togglePlayAudio}
                  confidenceChoice={confidenceChoice}
                  onChangeConfidence={setConfidenceChoice}
                  earnedStampIds={earnedStampIds}
                  onUnlockStamp1={() => unlockStamp(1)}
                  onContinue={() => {
                    unlockStamp(1);
                    navigateToScene('intro2-1');
                  }}
                />
              )}

              {scene === 'test-2' && (
                <Test02Workspace
                  confidenceChoice={confidenceChoice}
                  onChangeConfidence={setConfidenceChoice}
                  earnedStampIds={earnedStampIds}
                  onUnlockStamp2={() => unlockStamp(2)}
                  onComplete={() => {
                    unlockStamp(2);
                    navigateToScene('intro3');
                  }}
                />
              )}

              {scene === 'test-3' && (
                <Test03Workspace
                  confidenceChoice={confidenceChoice}
                  onChangeConfidence={setConfidenceChoice}
                  earnedStampIds={earnedStampIds}
                  onUnlockStamp3={() => unlockStamp(3)}
                  onComplete={() => {
                    unlockStamp(3);
                    navigateToScene('intro4');
                  }}
                />
              )}

              {scene === 'test-4' && (
                <Test04Workspace
                  confidenceChoice={confidenceChoice}
                  onChangeConfidence={setConfidenceChoice}
                  earnedStampIds={earnedStampIds}
                  onUnlockStamp4={() => unlockStamp(4)}
                  onOpenCaseBoard={() => {
                    navigateToScene('case-board');
                  }}
                />
              )}

              {scene === 'case-board' && (
                <CaseBoardView
                  codename={codename}
                  initialConfidence={initialConfidence}
                  confidenceChoice={confidenceChoice}
                  onChangeConfidence={setConfidenceChoice}
                  earnedStampIds={earnedStampIds}
                  onRestart={() => {
                    setEarnedStampIds([]);
                    setInitialConfidence(null);
                    setConfidenceChoice(null);
                    setCodename('');
                    setCodenameInput('');
                    navigateToScene('intro1-1');
                  }}
                  onExit={onBack}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
