import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import MarsThreeScene from '../features/survival/MarsThreeScene';
import SurvivalHud from '../features/survival/SurvivalHud';
import {
  ConstructionModal,
  EndGameModal,
  HowToPlayModal,
  InsightArchiveModal,
  MainMenuOverlay,
  PauseModal,
  SettingsModal,
} from '../features/survival/SurvivalModals';
import {
  applyEmergencyAction,
  applySimulationTick,
  buildModule,
  clearSurvivalSave,
  collectNearbyResource,
  completeFinalMission,
  consultInsight,
  createInitialState,
  getRecommendedGuidance,
  getRoverProximity,
  loadSurvivalGame,
  repairStation,
  saveSurvivalGame,
  stepRoverPhysics,
  upgradeModule,
} from '../features/survival/gameLogic';
import { createSurvivalAudio } from '../features/survival/soundEngine';

export default function SurvivalProtocolPage({ onReturnToNexus }) {
  const [hasSave, setHasSave] = useState(() => Boolean(loadSurvivalGame()));
  const [uiState, setUiState] = useState(() => createInitialState());
  const gameStateRef = useRef(uiState);
  const inputRef = useRef({ forward: false, backward: false, left: false, right: false });
  const cameraControlRef = useRef(null);
  const audioRef = useRef(null);

  const [activeModal, setActiveModal] = useState(null); // null | 'howto' | 'settings' | 'insight' | 'build'
  const [buildTab, setBuildTab] = useState('build');

  // Initialize & dispose Web Audio synthesizer cleanly
  useEffect(() => {
    const audio = createSurvivalAudio();
    audioRef.current = audio;
    return () => {
      audio.dispose();
      audioRef.current = null;
    };
  }, []);

  const commitState = useCallback((nextState) => {
    const prev = gameStateRef.current;
    gameStateRef.current = nextState;
    setUiState(nextState);

    if (nextState.level > prev.level) {
      audioRef.current?.playLevelComplete();
      saveSurvivalGame(nextState);
      setHasSave(true);
    }
    if (nextState.eventState.active && !prev.eventState.active) {
      audioRef.current?.playAlert();
    }
    if (nextState.screen === 'victory' && prev.screen !== 'victory') {
      audioRef.current?.playLevelComplete();
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
  }, []);

  const mutateGame = useCallback(
    (updater) => {
      const next = updater(gameStateRef.current);
      if (next && next !== gameStateRef.current) {
        commitState(next);
      }
    },
    [commitState]
  );

  // Simulation loop: smooth 60fps rover kinematics & ~10Hz HUD sync
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let uiSyncAccum = 0;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      uiSyncAccum += dt;

      const cur = gameStateRef.current;
      if (cur.screen === 'playing' && !activeModal) {
        const afterPhysics = stepRoverPhysics(cur, inputRef.current, dt);
        const afterEnv = applySimulationTick(afterPhysics, dt);
        gameStateRef.current = afterEnv;
        audioRef.current?.updateRoverSpeed(afterEnv.rover.speed);

        if (afterEnv.level > cur.level) {
          audioRef.current?.playLevelComplete();
          saveSurvivalGame(afterEnv);
          setHasSave(true);
        }
        if (afterEnv.eventState.active && !cur.eventState.active) {
          audioRef.current?.playAlert();
        }
        if (afterEnv.screen !== cur.screen || afterEnv.level !== cur.level || uiSyncAccum >= 0.1) {
          uiSyncAccum = 0;
          setUiState(afterEnv);
        }
      } else {
        audioRef.current?.updateRoverSpeed(0);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeModal]);

  const handleCollectNearby = useCallback(
    (explicitNodeId = null) => {
      audioRef.current?.ensureStarted();
      const prevCount = gameStateRef.current.resourcesCollectedCount;
      mutateGame((s) => collectNearbyResource(s, explicitNodeId));
      if (gameStateRef.current.resourcesCollectedCount > prevCount) {
        audioRef.current?.playCollect();
      }
    },
    [mutateGame]
  );

  // Keyboard Controls (WASD, Arrows, E Collect/InSight, B Build, ESC Pause)
  useEffect(() => {
    const mapKey = (code) => {
      if (code === 'KeyW' || code === 'ArrowUp') return 'forward';
      if (code === 'KeyS' || code === 'ArrowDown') return 'backward';
      if (code === 'KeyA' || code === 'ArrowLeft') return 'left';
      if (code === 'KeyD' || code === 'ArrowRight') return 'right';
      return null;
    };

    const onKeyDown = (e) => {
      const dir = mapKey(e.code);
      if (dir) {
        inputRef.current[dir] = true;
        return;
      }

      if (e.repeat) return;
      const st = gameStateRef.current;

      if (e.code === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (st.selectedBuildModuleId) {
          mutateGame((s) => ({ ...s, selectedBuildModuleId: null }));
        } else if (st.screen === 'playing') {
          mutateGame((s) => ({ ...s, screen: 'paused' }));
        } else if (st.screen === 'paused') {
          mutateGame((s) => ({ ...s, screen: 'playing' }));
        }
        return;
      }

      if (st.screen !== 'playing' || activeModal) return;

      if (e.code === 'KeyE') {
        const prox = getRoverProximity(st);
        if (prox.nearestNode) {
          handleCollectNearby(prox.nearestNode.id);
        } else if (prox.nearInsight) {
          setActiveModal('insight');
        }
      } else if (e.code === 'KeyB') {
        setBuildTab('build');
        setActiveModal('build');
      }
    };

    const onKeyUp = (e) => {
      const dir = mapKey(e.code);
      if (dir) {
        inputRef.current[dir] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [activeModal, handleCollectNearby, mutateGame]);

  const handleStartNewMission = useCallback(() => {
    audioRef.current?.ensureStarted();
    clearSurvivalSave();
    setHasSave(false);
    const fresh = createInitialState(gameStateRef.current.settings);
    fresh.screen = 'playing';
    fresh.lastBanner = { type: 'info', text: 'Level 1 started: Collect 3 resource containers using W A S D + E.' };
    commitState(fresh);
  }, [commitState]);

  const handleContinueMission = useCallback(() => {
    audioRef.current?.ensureStarted();
    const loaded = loadSurvivalGame();
    if (loaded) {
      audioRef.current?.applySettings(loaded.settings);
      commitState(loaded);
    }
  }, [commitState]);

  const handleBuildQuick = useCallback(
    (moduleId, slotIndex = null) => {
      audioRef.current?.ensureStarted();
      const res = buildModule(gameStateRef.current, moduleId, slotIndex);
      commitState(res.state);
      if (res.ok) {
        audioRef.current?.playBuild();
        setActiveModal(null);
      }
    },
    [commitState]
  );

  const handleUpgrade = useCallback(
    (moduleId) => {
      audioRef.current?.ensureStarted();
      const res = upgradeModule(gameStateRef.current, moduleId);
      commitState(res.state);
      if (res.ok) {
        audioRef.current?.playUpgrade();
      }
    },
    [commitState]
  );

  const handleRepair = useCallback(() => {
    audioRef.current?.ensureStarted();
    mutateGame((s) => repairStation(s));
  }, [mutateGame]);

  const handleChangeSettings = useCallback(
    (patch) => {
      const nextSettings = { ...gameStateRef.current.settings, ...patch };
      audioRef.current?.applySettings(nextSettings);
      mutateGame((s) => ({ ...s, settings: nextSettings }));
    },
    [mutateGame]
  );

  const handleTouchDrive = useCallback((dir, pressed) => {
    if (pressed) audioRef.current?.ensureStarted();
    inputRef.current[dir] = pressed;
  }, []);

  const proximity = getRoverProximity(uiState);
  const guidance = getRecommendedGuidance(uiState, proximity);

  return (
    <div className="relative h-[100dvh] w-full flex flex-col bg-[#101827] text-[#F4F7FA] font-public select-none overflow-hidden overscroll-none">
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-[58px] lg:top-[68px] overflow-hidden">
          <MarsThreeScene
            gameStateRef={gameStateRef}
            selectedBuildModuleId={uiState.selectedBuildModuleId}
            cameraControlRef={cameraControlRef}
            onSelectSlot={(slotIdx) => {
              const modId = gameStateRef.current.selectedBuildModuleId;
              if (modId) {
                handleBuildQuick(modId, slotIdx);
              }
            }}
            onClickResourceNode={(nodeId) => handleCollectNearby(nodeId)}
            onClickInsight={() => setActiveModal('insight')}
          />

          {uiState.screen === 'menu' && (
            <MainMenuOverlay
              hasSave={hasSave}
              onStartNew={handleStartNewMission}
              onContinue={handleContinueMission}
              onOpenHowToPlay={() => setActiveModal('howto')}
              onOpenSettings={() => setActiveModal('settings')}
              onReturnToNexus={onReturnToNexus}
            />
          )}

          {uiState.screen === 'playing' && (
            <SurvivalHud
              state={uiState}
              proximity={proximity}
              selectedBuildModuleId={uiState.selectedBuildModuleId}
              onCancelBuildPlacement={() => mutateGame((s) => ({ ...s, selectedBuildModuleId: null }))}
              onCollectNearby={() => handleCollectNearby()}
              onOpenBuild={(tab = 'build') => {
                setBuildTab(tab);
                setActiveModal('build');
              }}
              onOpenInsight={() => setActiveModal('insight')}
              onEmergencyAction={(actId) => mutateGame((s) => applyEmergencyAction(s, actId))}
              onCertifyLevel20={() => mutateGame((s) => completeFinalMission(s))}
              onPause={() => mutateGame((s) => ({ ...s, screen: 'paused' }))}
              onToggleMute={() => handleChangeSettings({ muted: !uiState.settings.muted })}
              onZoomIn={() => cameraControlRef.current?.zoomIn()}
              onZoomOut={() => cameraControlRef.current?.zoomOut()}
              onResetFollow={() => cameraControlRef.current?.resetFollow()}
              onTouchDrive={handleTouchDrive}
            />
          )}
        </div>
      </main>

      {activeModal === 'howto' && <HowToPlayModal onClose={() => setActiveModal(null)} />}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={uiState.settings}
          onChangeSettings={handleChangeSettings}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'insight' && (
        <InsightArchiveModal
          consultedIds={uiState.insightConsulted}
          onConsultRecord={(recId) => {
            audioRef.current?.ensureStarted();
            mutateGame((s) => consultInsight(s, recId));
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'build' && (
        <ConstructionModal
          tab={buildTab}
          onChangeTab={setBuildTab}
          level={uiState.level}
          inventory={uiState.inventory}
          modules={uiState.modules}
          stationHealth={uiState.missionStats.stationHealth}
          recommendedModuleId={guidance.targetModuleId}
          onQuickBuild={(modId) => handleBuildQuick(modId)}
          onPickSlotMode={(modId) => {
            setActiveModal(null);
            mutateGame((s) => ({ ...s, selectedBuildModuleId: modId }));
          }}
          onUpgrade={handleUpgrade}
          onRepair={handleRepair}
          onClose={() => setActiveModal(null)}
        />
      )}

      {uiState.screen === 'paused' && !activeModal && (
        <PauseModal
          level={uiState.level}
          onResume={() => mutateGame((s) => ({ ...s, screen: 'playing' }))}
          onRestartLevel={() => {
            mutateGame((s) => ({
              ...s,
              screen: 'playing',
              missionStats: { ...s.missionStats, stationHealth: 100, stability: 90, thermalIntegrity: 90 },
              eventState: { ...s.eventState, active: null },
              lastBanner: { type: 'info', text: `Level ${s.level} reset cleanly.` },
            }));
          }}
          onOpenSettings={() => setActiveModal('settings')}
          onSaveAndMenu={() => {
            saveSurvivalGame(gameStateRef.current);
            setHasSave(true);
            mutateGame((s) => ({ ...s, screen: 'menu' }));
          }}
        />
      )}

      {(uiState.screen === 'victory' || uiState.screen === 'gameover') && (
        <EndGameModal
          screen={uiState.screen}
          score={uiState.score}
          report={uiState.finalReport}
          level={uiState.level}
          onRetryLevel={() => {
            mutateGame((s) => ({
              ...s,
              screen: 'playing',
              missionStats: { ...s.missionStats, stationHealth: 100, stability: 88, thermalIntegrity: 88 },
              eventState: { ...s.eventState, active: null },
            }));
          }}
          onNewCampaign={handleStartNewMission}
          onReturnToNexus={onReturnToNexus}
        />
      )}
    </div>
  );
}
