import { useEffect, useRef } from 'react';
import siteContent from '../../data/siteContent.json';
import {
  GRID_SIZE,
  INSIGHT_SITE,
  MODULE_DEFINITIONS,
  ROCK_TILES,
  SURVEY_NODES,
  TERRAIN_META,
  computeIsoMetrics,
  findGridPath,
  getTerrainType,
  isSameTile,
  tileDistance,
  validatePlacement,
} from './simulation';
import {
  drawDetailedAstronaut,
  drawDetailedHabitat,
  drawDetailedInSight,
  drawDetailedRock,
  drawDetailedScienceStation,
  drawDetailedSolarUnit,
  drawIsoDiamond,
  drawMarsEnvironmentBackdrop,
  drawOutpostConduits,
  drawSurveyNodeMarker,
  hash2d,
} from './marsArt';

export default function IsometricMarsCanvas({
  phase,
  buildings,
  selectedBuildModule,
  dragBuildModule,
  highlightedTarget,
  activeEffect,
  appliedUpgrades = {},
  collectedNodes = [],
  scanPulse = 0,
  inspectInsightPanels,
  solarDustLevel = 0,
  reducedMotion = false,
  onAstronautMoveComplete,
  onTileHover,
  onPlaceModule,
  onInspectObject,
  astronautTile,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    phase,
    buildings,
    selectedBuildModule,
    dragBuildModule,
    highlightedTarget,
    activeEffect,
    appliedUpgrades,
    collectedNodes,
    scanPulse,
    inspectInsightPanels,
    solarDustLevel,
    reducedMotion,
    hoverTile: null,
    astroPos: { col: astronautTile.col, row: astronautTile.row },
    path: [],
    pendingAction: null,
    walkBob: 0,
    stepDistAccum: 0,
    footprints: [],
    quakeTimer: 0,
    aftershockCooldown: 2.2,
    effectTimer: 0,
    scanWave: 0,
    dustParticles: Array.from({ length: 88 }, (_, i) => ({
      x: (i * 97) % 1440,
      y: (i * 53) % 860,
      len: 26 + (i % 6) * 14,
      speed: 195 + (i % 6) * 44,
      alpha: 0.24 + (i % 4) * 0.09,
    })),
    iceParticles: Array.from({ length: 50 }, (_, i) => ({
      x: (i * 113) % 1440,
      y: (i * 71) % 860,
      r: 1.5 + (i % 3) * 0.9,
      speedY: 28 + (i % 5) * 11,
      drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 5),
      alpha: 0.38 + (i % 4) * 0.12,
    })),
    ambientMotes: Array.from({ length: 22 }, (_, i) => ({
      x: (i * 131) % 1440,
      y: 120 + ((i * 67) % 620),
      r: 1.2 + (i % 3) * 0.6,
      speed: 18 + (i % 4) * 8,
    })),
  });

  const callbacksRef = useRef({
    onAstronautMoveComplete,
    onTileHover,
    onPlaceModule,
    onInspectObject,
  });

  useEffect(() => {
    callbacksRef.current = {
      onAstronautMoveComplete,
      onTileHover,
      onPlaceModule,
      onInspectObject,
    };
  }, [onAstronautMoveComplete, onTileHover, onPlaceModule, onInspectObject]);

  useEffect(() => {
    const s = stateRef.current;
    const prevPhase = s.phase;
    s.phase = phase;
    s.buildings = buildings;
    s.selectedBuildModule = selectedBuildModule;
    s.dragBuildModule = dragBuildModule;
    s.highlightedTarget = highlightedTarget;
    s.appliedUpgrades = appliedUpgrades;
    s.collectedNodes = collectedNodes;
    s.inspectInsightPanels = inspectInsightPanels;
    s.solarDustLevel = solarDustLevel;
    s.reducedMotion = reducedMotion;

    if (scanPulse && scanPulse !== s.scanPulse) {
      s.scanWave = 1.6;
    }
    s.scanPulse = scanPulse;

    if (activeEffect && activeEffect !== s.activeEffect) {
      s.effectTimer = 1.6;
    }
    s.activeEffect = activeEffect;

    if (phase === 'event_3' && prevPhase !== 'event_3') {
      s.quakeTimer = 1.4;
      s.aftershockCooldown = 2.4;
    }
  }, [
    phase,
    buildings,
    selectedBuildModule,
    dragBuildModule,
    highlightedTarget,
    activeEffect,
    appliedUpgrades,
    collectedNodes,
    scanPulse,
    inspectInsightPanels,
    solarDustLevel,
    reducedMotion,
  ]);

  useEffect(() => {
    const s = stateRef.current;
    if (
      s.path.length === 0 &&
      Math.abs(s.astroPos.col - astronautTile.col) > 0.05 &&
      Math.abs(s.astroPos.row - astronautTile.row) > 0.05
    ) {
      s.astroPos = { col: astronautTile.col, row: astronautTile.row };
      s.pendingAction = null;
      s.footprints = [];
    }
  }, [astronautTile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let metrics = computeIsoMetrics(800, 500);
    const terrainImg = new Image();
    terrainImg.src = '/legacy-mars-terrain.jpg';

    const gridToScreen = (col, row) => ({
      x: metrics.originX + (col - row) * (metrics.tileW / 2),
      y: metrics.originY + (col + row + 1) * (metrics.tileH / 2),
    });

    const screenToGrid = (px, py) => {
      const dx = px - metrics.originX;
      const dy = py - metrics.originY - metrics.tileH / 2;
      const col = Math.round((dx / (metrics.tileW / 2) + dy / (metrics.tileH / 2)) / 2);
      const row = Math.round((dy / (metrics.tileH / 2) - dx / (metrics.tileW / 2)) / 2);
      if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) return null;
      return { col, row };
    };

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      metrics = computeIsoMetrics(rect.width, rect.height);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);

    const detectObjectAtTile = (tile) => {
      if (!tile) return null;
      if (
        isSameTile(tile, INSIGHT_SITE.lander) ||
        isSameTile(tile, INSIGHT_SITE.seis) ||
        isSameTile(tile, INSIGHT_SITE.hp3)
      ) {
        return { kind: 'insight', tile: INSIGHT_SITE.lander };
      }
      for (const [id, pos] of Object.entries(stateRef.current.buildings)) {
        if (pos && isSameTile(tile, pos)) {
          return { kind: 'module', id, tile: pos };
        }
      }
      if (stateRef.current.phase !== 'intro' && stateRef.current.phase !== 'build') {
        const survey = SURVEY_NODES.find((node) => isSameTile(tile, node));
        if (survey) {
          return { kind: 'survey', id: survey.id, node: survey, tile: { col: survey.col, row: survey.row } };
        }
      }
      return null;
    };

    const moveAstronautTo = (targetTile, pendingAction = null) => {
      const s = stateRef.current;
      const currentRounded = {
        col: Math.round(s.astroPos.col),
        row: Math.round(s.astroPos.row),
      };

      if (pendingAction && tileDistance(currentRounded, targetTile) <= 1) {
        s.path = [];
        s.pendingAction = null;
        callbacksRef.current.onInspectObject?.(pendingAction);
        return;
      }

      const path = findGridPath(currentRounded, targetTile, s.buildings);
      s.path = path;
      s.pendingAction = pendingAction;
      if (path.length === 0 && pendingAction) {
        callbacksRef.current.onInspectObject?.(pendingAction);
        s.pendingAction = null;
      }
    };

    const getCanvasPoint = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerMove = (e) => {
      const pt = getCanvasPoint(e.clientX, e.clientY);
      const tile = screenToGrid(pt.x, pt.y);
      const prev = stateRef.current.hoverTile;
      if (tile?.col !== prev?.col || tile?.row !== prev?.row) {
        stateRef.current.hoverTile = tile;
        callbacksRef.current.onTileHover?.(tile);
      }
    };

    const handlePointerLeave = () => {
      stateRef.current.hoverTile = null;
      callbacksRef.current.onTileHover?.(null);
    };

    const handleClick = (e) => {
      const pt = getCanvasPoint(e.clientX, e.clientY);
      const tile = screenToGrid(pt.x, pt.y);
      if (!tile) return;

      const s = stateRef.current;
      const activePlacement = s.selectedBuildModule;
      if (s.phase === 'build' && activePlacement) {
        callbacksRef.current.onPlaceModule?.(activePlacement, tile.col, tile.row);
        return;
      }

      const objectHit = detectObjectAtTile(tile);
      if (objectHit) {
        moveAstronautTo(objectHit.tile, objectHit);
        return;
      }

      const terrain = getTerrainType(tile.col, tile.row);
      if (TERRAIN_META[terrain]?.walkable) {
        moveAstronautTo(tile, null);
      }
    };

    const handleDragOver = (e) => {
      if (stateRef.current.phase !== 'build') return;
      e.preventDefault();
      const pt = getCanvasPoint(e.clientX, e.clientY);
      const tile = screenToGrid(pt.x, pt.y);
      const prev = stateRef.current.hoverTile;
      if (tile?.col !== prev?.col || tile?.row !== prev?.row) {
        stateRef.current.hoverTile = tile;
        callbacksRef.current.onTileHover?.(tile);
      }
    };

    const handleDrop = (e) => {
      if (stateRef.current.phase !== 'build') return;
      e.preventDefault();
      const pt = getCanvasPoint(e.clientX, e.clientY);
      const tile = screenToGrid(pt.x, pt.y);
      const moduleId =
        e.dataTransfer?.getData('text/plain') ||
        stateRef.current.dragBuildModule ||
        stateRef.current.selectedBuildModule;
      if (tile && moduleId) {
        callbacksRef.current.onPlaceModule?.(moduleId, tile.col, tile.row);
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);

    const drawTacticalOverlays = (timeSec) => {
      const { tileW, tileH } = metrics;
      const s = stateRef.current;
      const activeBuild = s.phase === 'build' ? s.dragBuildModule || s.selectedBuildModule : null;

      // Show holographic placement grid ONLY during build mode
      if (activeBuild) {
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            const { x, y } = gridToScreen(col, row);
            const terrain = getTerrainType(col, row);
            const check = validatePlacement(activeBuild, col, row, s.buildings);
            if (!check.valid) continue;

            const isIdeal =
              (activeBuild === 'solar' && terrain === 'ridge') ||
              (activeBuild === 'habitat' && terrain === 'basin') ||
              (activeBuild === 'science' && terrain === 'bedrock');

            drawIsoDiamond(ctx, x, y, tileW * 0.92, tileH * 0.92);
            ctx.fillStyle = isIdeal ? 'rgba(56, 221, 245, 0.19)' : 'rgba(52, 120, 255, 0.08)';
            ctx.fill();
            ctx.strokeStyle = isIdeal ? 'rgba(56, 221, 245, 0.62)' : 'rgba(234, 242, 255, 0.16)';
            ctx.lineWidth = isIdeal ? 1.3 : 0.8;
            ctx.stroke();
          }
        }
      }

      // Hover reticle on active tile
      if (s.hoverTile) {
        const { x, y } = gridToScreen(s.hoverTile.col, s.hoverTile.row);
        drawIsoDiamond(ctx, x, y, tileW * 0.96, tileH * 0.96);
        if (activeBuild) {
          const check = validatePlacement(activeBuild, s.hoverTile.col, s.hoverTile.row, s.buildings);
          ctx.fillStyle = check.valid ? 'rgba(56, 221, 245, 0.25)' : 'rgba(239, 68, 68, 0.26)';
          ctx.fill();
          ctx.strokeStyle = check.valid ? '#38DDF5' : '#F87171';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(234, 242, 255, 0.45)';
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Subtle corner telemetry stakes around InSight Heritage Perimeter
      const corners = [
        gridToScreen(1, 2),
        gridToScreen(3, 2),
        gridToScreen(3, 4),
        gridToScreen(1, 4),
      ];
      ctx.fillStyle = 'rgba(255, 179, 92, 0.72)';
      for (const c of corners) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fading astronaut footprints in Martian dust
      for (const fp of s.footprints) {
        const pt = gridToScreen(fp.col, fp.row);
        ctx.fillStyle = `rgba(42, 16, 10, ${fp.alpha * 0.55})`;
        ctx.beginPath();
        ctx.ellipse(pt.x - 2, pt.y + 1, 2.2, 1.1, 0.3, 0, Math.PI * 2);
        ctx.ellipse(pt.x + 2, pt.y - 1, 2.2, 1.1, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Walk waypoint ring
      if (s.path.length > 0) {
        const dest = s.path[s.path.length - 1];
        const dp = gridToScreen(dest.col, dest.row);
        const pulse = s.reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(timeSec * 5);
        ctx.strokeStyle = `rgba(56, 221, 245, ${0.75 * pulse})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y, tileW * 0.22 * pulse, tileH * 0.22 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawDiegeticLabel = () => {
      const s = stateRef.current;
      if (!s.hoverTile || s.phase === 'intro') return;
      const obj = detectObjectAtTile(s.hoverTile);
      if (!obj) return;

      const labelText =
        obj.kind === 'insight'
          ? siteContent.engineeringLegacy.canvasLabels.insightInspect
          : obj.kind === 'survey'
          ? `${obj.node.title.toUpperCase()} [SAMPLE]`
          : `${MODULE_DEFINITIONS[obj.id]?.name.toUpperCase()} ${siteContent.engineeringLegacy.canvasLabels.moduleInspectSuffix}`;
      const pt = gridToScreen(obj.tile.col, obj.tile.row);

      ctx.save();
      ctx.font = '600 10px "Exo 2", sans-serif';
      const padX = 8;
      const textW = ctx.measureText(labelText).width;
      const boxW = textW + padX * 2;
      const bx = Math.max(8, Math.min(metrics.width - boxW - 8, pt.x - boxW / 2));
      const by = Math.max(8, pt.y - metrics.tileH * 1.65);

      ctx.fillStyle = 'rgba(5, 11, 30, 0.88)';
      ctx.strokeStyle = obj.kind === 'insight' ? 'rgba(255, 179, 92, 0.7)' : 'rgba(56, 221, 245, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#EAF2FF';
      ctx.fillText(labelText, bx + padX, by + 13.5);
      ctx.restore();
    };

    const drawAtmosphereEffects = (dt, timeSec) => {
      const s = stateRef.current;
      const { width, height } = metrics;

      // Expanding Sensor Scan orbital ripple across terrain
      if (s.scanWave > 0) {
        const progress = 1 - s.scanWave / 1.6;
        const center = gridToScreen(4.5, 4.5);
        ctx.save();
        ctx.strokeStyle = `rgba(56, 221, 245, ${0.85 * (1 - progress)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          center.x,
          center.y,
          Math.max(12, progress * width * 0.52),
          Math.max(8, progress * height * 0.42),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // Ambient drifting sun-lit dust motes across the valley
      if (!s.reducedMotion) {
        for (const m of s.ambientMotes) {
          m.x = (m.x + m.speed * dt) % (width + 40);
          ctx.fillStyle = 'rgba(255, 204, 158, 0.16)';
          ctx.beginPath();
          ctx.arc(m.x - 20, m.y % height, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (s.phase === 'event_1') {
        // Thick Martian Dust Storm atmospheric billows + fast sand grit
        ctx.fillStyle = 'rgba(182, 76, 30, 0.28)';
        ctx.fillRect(0, 0, width, height);

        for (let b = 0; b < 4; b++) {
          const drift = s.reducedMotion ? 0 : ((timeSec * (45 + b * 22)) % (width + 420)) - 220;
          const by = height * (0.2 + b * 0.2);
          const billow = ctx.createRadialGradient(drift + width * 0.35, by, 20, drift + width * 0.35, by, width * 0.42);
          billow.addColorStop(0, 'rgba(214, 112, 58, 0.28)');
          billow.addColorStop(1, 'rgba(180, 74, 32, 0)');
          ctx.fillStyle = billow;
          ctx.fillRect(0, 0, width, height);
        }

        for (const p of s.dustParticles) {
          if (!s.reducedMotion) {
            p.x = (p.x + p.speed * dt) % (width + 100);
            p.y = (p.y + p.speed * 0.22 * dt) % height;
          }
          ctx.strokeStyle = `rgba(255, 186, 132, ${p.alpha})`;
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          ctx.moveTo(p.x - 50, p.y);
          ctx.lineTo(p.x - 50 + p.len, p.y + p.len * 0.2);
          ctx.stroke();
        }
      } else if (s.phase === 'event_2') {
        // Extreme Cold Snap: edge frost crystals, icy mist, falling CO2 frost
        const frost = ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          width * 0.18,
          width * 0.5,
          height * 0.5,
          width * 0.66
        );
        frost.addColorStop(0, 'rgba(56, 221, 245, 0)');
        frost.addColorStop(0.7, 'rgba(56, 221, 245, 0.16)');
        frost.addColorStop(1, 'rgba(186, 230, 253, 0.44)');
        ctx.fillStyle = frost;
        ctx.fillRect(0, 0, width, height);

        for (const ice of s.iceParticles) {
          if (!s.reducedMotion) {
            ice.y = (ice.y + ice.speedY * dt) % height;
            ice.x = (ice.x + ice.drift * dt + width) % width;
          }
          ctx.fillStyle = `rgba(224, 242, 254, ${ice.alpha})`;
          ctx.beginPath();
          ctx.arc(ice.x, ice.y, ice.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (s.phase === 'event_3') {
        // Marsquake: propagating ground P-wave & S-wave seismic rings from fault epicenter (7,7)
        const epi = gridToScreen(7, 7);
        for (let w = 0; w < 2; w++) {
          const waveP = s.reducedMotion ? 0.35 + w * 0.3 : (timeSec * 0.55 + w * 0.5) % 1;
          ctx.strokeStyle =
            w === 0
              ? `rgba(248, 113, 113, ${0.8 * (1 - waveP)})`
              : `rgba(56, 221, 245, ${0.7 * (1 - waveP)})`;
          ctx.lineWidth = w === 0 ? 2.6 : 1.8;
          ctx.beginPath();
          ctx.ellipse(
            epi.x,
            epi.y,
            Math.max(8, waveP * width * 0.48),
            Math.max(5, waveP * height * 0.34),
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      // Subtle cinematic vignette grounding the viewport edges
      const vig = ctx.createRadialGradient(
        width * 0.5,
        height * 0.52,
        width * 0.32,
        width * 0.5,
        height * 0.52,
        width * 0.72
      );
      vig.addColorStop(0, 'rgba(5, 11, 30, 0)');
      vig.addColorStop(1, 'rgba(4, 8, 22, 0.42)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    let rafId = 0;
    let lastTs = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const timeSec = now / 1000;
      const s = stateRef.current;

      // Update astronaut path movement outside React state
      if (s.path.length > 0) {
        const nextTile = s.path[0];
        const dx = nextTile.col - s.astroPos.col;
        const dy = nextTile.row - s.astroPos.row;
        const dist = Math.hypot(dx, dy);
        const speed = s.reducedMotion ? 8.0 : 3.2;
        if (dist <= speed * dt) {
          s.astroPos = { col: nextTile.col, row: nextTile.row };
          s.path.shift();
          if (s.path.length === 0) {
            const arrivedAt = { ...s.astroPos };
            const pending = s.pendingAction;
            s.pendingAction = null;
            callbacksRef.current.onAstronautMoveComplete?.(arrivedAt);
            if (pending) {
              callbacksRef.current.onInspectObject?.(pending);
            }
          }
        } else {
          const step = speed * dt;
          s.astroPos.col += (dx / dist) * step;
          s.astroPos.row += (dy / dist) * step;
          s.walkBob += dt;
          s.stepDistAccum += step;
          if (s.stepDistAccum >= 0.42) {
            s.stepDistAccum = 0;
            s.footprints.push({ col: s.astroPos.col, row: s.astroPos.row, alpha: 1 });
            if (s.footprints.length > 18) s.footprints.shift();
          }
        }
      }

      // Fade footprints gradually
      for (const fp of s.footprints) {
        fp.alpha = Math.max(0, fp.alpha - dt * 0.08);
      }
      s.footprints = s.footprints.filter((fp) => fp.alpha > 0.05);

      if (s.quakeTimer > 0) s.quakeTimer = Math.max(0, s.quakeTimer - dt);
      if (s.scanWave > 0) s.scanWave = Math.max(0, s.scanWave - dt);
      if (s.effectTimer > 0) s.effectTimer = Math.max(0, s.effectTimer - dt);
      if (s.phase === 'event_3') {
        s.aftershockCooldown -= dt;
        if (s.aftershockCooldown <= 0) {
          s.quakeTimer = 0.75;
          s.aftershockCooldown = 2.6;
        }
      }

      ctx.save();
      if (s.quakeTimer > 0 && !s.reducedMotion) {
        const mag = Math.min(3.2, s.quakeTimer * 2.4);
        ctx.translate(Math.sin(timeSec * 38) * mag, Math.cos(timeSec * 30) * mag * 0.65);
      }

      drawMarsEnvironmentBackdrop(ctx, metrics.width, metrics.height, metrics, terrainImg, s.phase);

      drawTacticalOverlays(timeSec);
      drawOutpostConduits(ctx, s.buildings, gridToScreen);

      // Depth-sorted entities
      const entities = [];
      for (const rock of ROCK_TILES) {
        const pt = gridToScreen(rock.col, rock.row);
        entities.push({
          depth: rock.col + rock.row,
          draw: () =>
            drawDetailedRock(ctx, pt.x, pt.y, metrics.tileW, metrics.tileH, hash2d(rock.col, rock.row)),
        });
      }

      const landerPt = gridToScreen(INSIGHT_SITE.lander.col, INSIGHT_SITE.lander.row);
      const seisPt = gridToScreen(INSIGHT_SITE.seis.col, INSIGHT_SITE.seis.row);
      const hp3Pt = gridToScreen(INSIGHT_SITE.hp3.col, INSIGHT_SITE.hp3.row);
      entities.push({
        depth: INSIGHT_SITE.lander.col + INSIGHT_SITE.lander.row + 0.25,
        draw: () =>
          drawDetailedInSight(ctx, landerPt, seisPt, hp3Pt, metrics.tileW, metrics.tileH, timeSec, {
            highlighted: s.phase === 'arrival' || s.highlightedTarget === 'insight',
            inspectPanels: s.inspectInsightPanels,
            reducedMotion: s.reducedMotion,
          }),
      });

      if (s.phase !== 'intro' && s.phase !== 'build') {
        for (const node of SURVEY_NODES) {
          const pt = gridToScreen(node.col, node.row);
          entities.push({
            depth: node.col + node.row + 0.05,
            draw: () =>
              drawSurveyNodeMarker(ctx, pt.x, pt.y, metrics.tileW, metrics.tileH, timeSec, {
                collected: s.collectedNodes.includes(node.id),
                scanned: s.scanPulse > 0,
                reducedMotion: s.reducedMotion,
              }),
          });
        }
      }

      if (s.buildings.habitat) {
        const pt = gridToScreen(s.buildings.habitat.col, s.buildings.habitat.row);
        entities.push({
          depth: s.buildings.habitat.col + s.buildings.habitat.row,
          draw: () =>
            drawDetailedHabitat(ctx, pt.x, pt.y, metrics.tileW, metrics.tileH, timeSec, {
              highlighted: s.highlightedTarget === 'habitat',
              activeEffect: s.activeEffect,
              phase: s.phase,
              appliedThermal: s.appliedUpgrades?.thermal,
              appliedSeismic: s.appliedUpgrades?.seismic,
              reducedMotion: s.reducedMotion,
            }),
        });
      }

      if (s.buildings.solar) {
        const pt = gridToScreen(s.buildings.solar.col, s.buildings.solar.row);
        entities.push({
          depth: s.buildings.solar.col + s.buildings.solar.row,
          draw: () =>
            drawDetailedSolarUnit(ctx, pt.x, pt.y, metrics.tileW, metrics.tileH, timeSec, {
              highlighted: s.highlightedTarget === 'solar',
              activeEffect: s.activeEffect,
              appliedSolar: s.appliedUpgrades?.solar,
              dustLevel: s.solarDustLevel,
              reducedMotion: s.reducedMotion,
            }),
        });
      }

      if (s.buildings.science) {
        const pt = gridToScreen(s.buildings.science.col, s.buildings.science.row);
        entities.push({
          depth: s.buildings.science.col + s.buildings.science.row,
          draw: () =>
            drawDetailedScienceStation(ctx, pt.x, pt.y, metrics.tileW, metrics.tileH, timeSec, {
              highlighted: s.highlightedTarget === 'science',
              phase: s.phase,
              activeEffect: s.activeEffect,
              appliedSeismic: s.appliedUpgrades?.seismic,
              reducedMotion: s.reducedMotion,
            }),
        });
      }

      const astroPt = gridToScreen(s.astroPos.col, s.astroPos.row);
      entities.push({
        depth: s.astroPos.col + s.astroPos.row + 0.15,
        draw: () =>
          drawDetailedAstronaut(ctx, astroPt.x, astroPt.y, metrics.tileW, metrics.tileH, timeSec, {
            moving: s.path.length > 0,
            walkPhase: s.walkBob,
            reducedMotion: s.reducedMotion,
          }),
      });

      entities.sort((a, b) => a.depth - b.depth);
      for (const entity of entities) {
        entity.draw();
      }

      // Placement ghost preview on hovered tile
      const activeBuild = s.phase === 'build' ? s.dragBuildModule || s.selectedBuildModule : null;
      if (activeBuild && s.hoverTile) {
        const check = validatePlacement(activeBuild, s.hoverTile.col, s.hoverTile.row, s.buildings);
        const gpt = gridToScreen(s.hoverTile.col, s.hoverTile.row);
        const ghostOpts = { ghost: true, valid: check.valid, reducedMotion: s.reducedMotion };
        if (activeBuild === 'habitat')
          drawDetailedHabitat(ctx, gpt.x, gpt.y, metrics.tileW, metrics.tileH, timeSec, ghostOpts);
        if (activeBuild === 'solar')
          drawDetailedSolarUnit(ctx, gpt.x, gpt.y, metrics.tileW, metrics.tileH, timeSec, ghostOpts);
        if (activeBuild === 'science')
          drawDetailedScienceStation(ctx, gpt.x, gpt.y, metrics.tileW, metrics.tileH, timeSec, ghostOpts);
      }

      drawAtmosphereEffects(dt, timeSec);
      drawDiegeticLabel();
      ctx.restore();

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block touch-manipulation cursor-crosshair"
      aria-label={siteContent.engineeringLegacy.hud.canvasAriaLabel}
    />
  );
}
