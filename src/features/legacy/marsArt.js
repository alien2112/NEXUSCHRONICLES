export function hash2d(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function drawIsoDiamond(ctx, cx, cy, tileW, tileH) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - tileH / 2);
  ctx.lineTo(cx + tileW / 2, cy);
  ctx.lineTo(cx, cy + tileH / 2);
  ctx.lineTo(cx - tileW / 2, cy);
  ctx.closePath();
}

function drawShadedIsoBox(ctx, cx, cy, w, d, h, topStyle, leftStyle, rightStyle, strokeStyle) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h - d / 2);
  ctx.lineTo(cx + w / 2, cy - h);
  ctx.lineTo(cx, cy - h + d / 2);
  ctx.lineTo(cx - w / 2, cy - h);
  ctx.closePath();
  ctx.fillStyle = topStyle;
  ctx.fill();
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h);
  ctx.lineTo(cx, cy - h + d / 2);
  ctx.lineTo(cx, cy + d / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
  ctx.fillStyle = leftStyle;
  ctx.fill();
  if (strokeStyle) ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy - h);
  ctx.lineTo(cx, cy - h + d / 2);
  ctx.lineTo(cx, cy + d / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.closePath();
  ctx.fillStyle = rightStyle;
  ctx.fill();
  if (strokeStyle) ctx.stroke();
}

/**
 * Casts both a tight ambient-occlusion contact shadow and a long directional
 * Martian sun shadow stretching down-right to match the real terrain lighting.
 */
function drawMartianShadow(ctx, x, y, rx, ry, sunStretch = 1.35) {
  // Tight contact AO shadow
  const ao = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx * 0.95);
  ao.addColorStop(0, 'rgba(12, 4, 2, 0.76)');
  ao.addColorStop(0.65, 'rgba(16, 6, 3, 0.42)');
  ao.addColorStop(1, 'rgba(16, 6, 3, 0)');
  ctx.fillStyle = ao;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.95, ry * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long sun-cast shadow toward bottom-right
  ctx.save();
  ctx.translate(x + rx * 0.45 * sunStretch, y + ry * 0.32 * sunStretch);
  ctx.rotate(0.24);
  const cast = ctx.createRadialGradient(0, 0, rx * 0.12, 0, 0, rx * sunStretch);
  cast.addColorStop(0, 'rgba(14, 5, 3, 0.58)');
  cast.addColorStop(0.7, 'rgba(18, 6, 3, 0.28)');
  cast.addColorStop(1, 'rgba(18, 6, 3, 0)');
  ctx.fillStyle = cast;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * sunStretch, ry * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTargetBrackets(ctx, x, y, rx, ry, color, pulse) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  const s = 0.28;
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (const [cx, cy] of corners) {
    const px = x + cx * rx * pulse * 0.72;
    const py = y + cy * ry * pulse * 0.72;
    ctx.beginPath();
    ctx.moveTo(px - cx * rx * s, py);
    ctx.lineTo(px, py);
    ctx.lineTo(px, py - cy * ry * s);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a photorealistic backdrop using /legacy-mars-terrain.jpg (cover-fitted)
 * with fallback procedural horizon + dust-storm / cold-snap atmospheric color grading.
 */
export function drawMarsEnvironmentBackdrop(ctx, width, height, metrics, terrainImg, phase) {
  if (terrainImg && terrainImg.complete && terrainImg.naturalWidth > 0) {
    const imgRatio = terrainImg.naturalWidth / terrainImg.naturalHeight;
    const viewRatio = width / height;
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (viewRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
      offsetY = (height - drawH) * 0.35;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      offsetX = (width - drawW) * 0.5;
    }

    ctx.drawImage(terrainImg, offsetX, offsetY, drawW, drawH);

    if (phase === 'event_1') {
      const stormSky = ctx.createLinearGradient(0, 0, width, height);
      stormSky.addColorStop(0, 'rgba(130, 50, 18, 0.56)');
      stormSky.addColorStop(0.55, 'rgba(178, 76, 30, 0.42)');
      stormSky.addColorStop(1, 'rgba(92, 34, 14, 0.52)');
      ctx.fillStyle = stormSky;
      ctx.fillRect(0, 0, width, height);
    } else if (phase === 'event_2') {
      const coldSky = ctx.createLinearGradient(0, 0, 0, height);
      coldSky.addColorStop(0, 'rgba(6, 20, 58, 0.62)');
      coldSky.addColorStop(0.6, 'rgba(14, 42, 92, 0.46)');
      coldSky.addColorStop(1, 'rgba(18, 56, 108, 0.36)');
      ctx.fillStyle = coldSky;
      ctx.fillRect(0, 0, width, height);
    } else if (phase === 'event_3') {
      ctx.fillStyle = 'rgba(42, 18, 28, 0.16)';
      ctx.fillRect(0, 0, width, height);
    }
    return;
  }

  const horizonY = metrics.originY + metrics.tileH * 0.8;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#050B1E');
  skyGrad.addColorStop(0.65, '#59291B');
  skyGrad.addColorStop(1, '#B85A34');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY);

  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  groundGrad.addColorStop(0, '#8E3E23');
  groundGrad.addColorStop(1, '#4C1D11');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);
}

export function drawOutpostConduits(ctx, buildings, gridToScreen) {
  const links = [
    ['solar', 'habitat', '#FFB35C'],
    ['habitat', 'science', '#38DDF5'],
    ['solar', 'science', '#94A3B8'],
  ];

  const activeLinks = [];
  if (buildings.solar && buildings.habitat) activeLinks.push(links[0]);
  if (buildings.habitat && buildings.science) activeLinks.push(links[1]);
  if (!buildings.habitat && buildings.solar && buildings.science) activeLinks.push(links[2]);

  for (const [fromId, toId, accent] of activeLinks) {
    const a = gridToScreen(buildings[fromId].col, buildings[fromId].row);
    const b = gridToScreen(buildings[toId].col, buildings[toId].row);
    const midX = (a.x + b.x) * 0.5;
    const midY = (a.y + b.y) * 0.5 + 8;

    ctx.strokeStyle = 'rgba(16, 6, 3, 0.62)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 4);
    ctx.quadraticCurveTo(midX, midY, b.x, b.y + 4);
    ctx.stroke();

    ctx.strokeStyle = '#2B3547';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 3);
    ctx.quadraticCurveTo(midX, midY - 1, b.x, b.y + 3);
    ctx.stroke();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 2.5);
    ctx.quadraticCurveTo(midX, midY - 1.5, b.x, b.y + 2.5);
    ctx.stroke();
  }
}

/**
 * Low-profile weathered Martian basalt outcrop that blends seamlessly with the
 * natural shadows and rock textures of Elysium Planitia.
 */
export function drawDetailedRock(ctx, x, y, tileW, tileH, seed) {
  const scale = 0.72 + seed * 0.34;
  const rx = tileW * 0.28 * scale;
  const ry = tileH * 0.24 * scale;

  drawMartianShadow(ctx, x, y + tileH * 0.04, rx, ry, 1.35);

  const drawStone = (ox, oy, sw, sh, angleOffset) => {
    ctx.save();
    ctx.translate(ox, oy);

    // Base shadow-drenched dark basalt body
    const stoneGrad = ctx.createLinearGradient(-sw, -sh, sw * 0.9, sh * 0.5);
    stoneGrad.addColorStop(0, '#A85738');
    stoneGrad.addColorStop(0.38, '#5E2B1E');
    stoneGrad.addColorStop(0.78, '#2C130E');
    stoneGrad.addColorStop(1, '#1A0A07');

    ctx.beginPath();
    ctx.moveTo(-sw, sh * 0.2);
    ctx.lineTo(-sw * 0.82, -sh * 0.52);
    ctx.lineTo(-sw * 0.25, -sh * (0.88 + angleOffset));
    ctx.lineTo(sw * 0.42, -sh * 0.7);
    ctx.lineTo(sw * 0.96, -sh * 0.08);
    ctx.lineTo(sw * 0.72, sh * 0.36);
    ctx.lineTo(-sw * 0.45, sh * 0.4);
    ctx.closePath();
    ctx.fillStyle = stoneGrad;
    ctx.fill();

    // Sunlit upper-left sedimentary ledge
    ctx.beginPath();
    ctx.moveTo(-sw * 0.82, -sh * 0.52);
    ctx.lineTo(-sw * 0.25, -sh * (0.88 + angleOffset));
    ctx.lineTo(sw * 0.42, -sh * 0.7);
    ctx.lineTo(sw * 0.05, -sh * 0.25);
    ctx.lineTo(-sw * 0.5, -sh * 0.16);
    ctx.closePath();
    ctx.fillStyle = 'rgba(198, 114, 72, 0.72)';
    ctx.fill();

    ctx.restore();
  };

  drawStone(x - rx * 0.2, y, rx * 0.86, tileH * 0.38 * scale, 0.12);
  drawStone(x + rx * 0.36, y + tileH * 0.08, rx * 0.52, tileH * 0.26 * scale, 0);
}

export function drawDetailedInSight(ctx, landerPt, seisPt, hp3Pt, tileW, tileH, timeSec, opts) {
  const { highlighted, inspectPanels, reducedMotion } = opts;

  // Rocket-exhaust scoured landing dust ring
  const scour = ctx.createRadialGradient(
    landerPt.x,
    landerPt.y + tileH * 0.06,
    tileW * 0.1,
    landerPt.x,
    landerPt.y + tileH * 0.06,
    tileW * 0.9
  );
  scour.addColorStop(0, 'rgba(26, 11, 8, 0.54)');
  scour.addColorStop(0.55, 'rgba(48, 20, 14, 0.26)');
  scour.addColorStop(1, 'rgba(48, 20, 14, 0)');
  ctx.fillStyle = scour;
  ctx.beginPath();
  ctx.ellipse(landerPt.x, landerPt.y + tileH * 0.06, tileW * 0.9, tileH * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kapton tether cables
  ctx.save();
  ctx.strokeStyle = 'rgba(198, 102, 56, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(landerPt.x + tileW * 0.14, landerPt.y + tileH * 0.05);
  ctx.quadraticCurveTo((landerPt.x + seisPt.x) * 0.5, seisPt.y + tileH * 0.24, seisPt.x, seisPt.y + tileH * 0.04);
  ctx.moveTo(landerPt.x - tileW * 0.05, landerPt.y + tileH * 0.12);
  ctx.quadraticCurveTo(landerPt.x - tileW * 0.12, (landerPt.y + hp3Pt.y) * 0.55, hp3Pt.x, hp3Pt.y);
  ctx.stroke();
  ctx.restore();

  // SEIS Wind & Thermal Shield Dome
  drawMartianShadow(ctx, seisPt.x, seisPt.y + tileH * 0.04, tileW * 0.18, tileH * 0.15, 1.3);
  ctx.fillStyle = '#705D52';
  ctx.beginPath();
  ctx.ellipse(seisPt.x, seisPt.y + tileH * 0.04, tileW * 0.19, tileH * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  const seisGrad = ctx.createLinearGradient(
    seisPt.x - tileW * 0.15,
    seisPt.y - tileH * 0.28,
    seisPt.x + tileW * 0.15,
    seisPt.y
  );
  seisGrad.addColorStop(0, '#EDE1D5');
  seisGrad.addColorStop(0.55, '#BE9679');
  seisGrad.addColorStop(1, '#6E402B');
  ctx.fillStyle = seisGrad;
  ctx.beginPath();
  ctx.ellipse(seisPt.x, seisPt.y - tileH * 0.12, tileW * 0.15, tileH * 0.22, 0, Math.PI, 0);
  ctx.lineTo(seisPt.x + tileW * 0.15, seisPt.y + tileH * 0.02);
  ctx.ellipse(seisPt.x, seisPt.y + tileH * 0.02, tileW * 0.15, tileH * 0.1, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // HP3 Mole Support Frame
  drawMartianShadow(ctx, hp3Pt.x, hp3Pt.y + tileH * 0.04, tileW * 0.12, tileH * 0.1, 1.25);
  ctx.fillStyle = '#4B1F14';
  ctx.beginPath();
  ctx.ellipse(hp3Pt.x, hp3Pt.y + tileH * 0.04, tileW * 0.15, tileH * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  drawShadedIsoBox(ctx, hp3Pt.x, hp3Pt.y, tileW * 0.19, tileH * 0.19, tileH * 0.22, '#CBD5E1', '#7E8FA6', '#334155');

  // Lander directional shadow
  drawMartianShadow(ctx, landerPt.x, landerPt.y + tileH * 0.12, tileW * 0.45, tileH * 0.3, 1.45);

  // 3 Hydraulic landing struts
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.6;
  for (const [lx, ly] of [
    [-0.25, 0.09],
    [0.25, 0.09],
    [0, 0.24],
  ]) {
    ctx.beginPath();
    ctx.moveTo(landerPt.x, landerPt.y - tileH * 0.25);
    ctx.lineTo(landerPt.x + tileW * lx, landerPt.y + tileH * ly);
    ctx.stroke();
    ctx.fillStyle = '#263244';
    ctx.beginPath();
    ctx.ellipse(landerPt.x + tileW * lx, landerPt.y + tileH * ly, 4.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Twin 2.2 m decagonal circular solar arrays with heavy dust coating
  const drawCircularWing = (px, py) => {
    const rx = tileW * 0.32;
    const ry = tileH * 0.34;

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(px, py + 3, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const panelGrad = ctx.createLinearGradient(px - rx, py - ry, px + rx, py + ry);
    panelGrad.addColorStop(0, '#1C3668');
    panelGrad.addColorStop(0.5, '#0F1E3E');
    panelGrad.addColorStop(1, '#182A4F');
    ctx.fillStyle = panelGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const dustGrad = ctx.createRadialGradient(px - rx * 0.15, py - ry * 0.1, rx * 0.1, px, py, rx);
    dustGrad.addColorStop(0, 'rgba(196, 102, 58, 0.85)');
    dustGrad.addColorStop(0.75, 'rgba(176, 84, 46, 0.72)');
    dustGrad.addColorStop(1, 'rgba(130, 58, 32, 0.55)');
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = inspectPanels ? '#38DDF5' : 'rgba(230, 198, 168, 0.45)';
    ctx.lineWidth = inspectPanels ? 1.7 : 0.9;
    for (let a = 0; a < 10; a++) {
      const ang = (a * Math.PI) / 5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang) * rx, py + Math.sin(ang) * ry);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  drawCircularWing(landerPt.x - tileW * 0.39, landerPt.y - tileH * 0.3);
  drawCircularWing(landerPt.x + tileW * 0.39, landerPt.y - tileH * 0.3);

  // Crinkled Gold Kapton MLI Lander Deck
  const deckTop = ctx.createLinearGradient(
    landerPt.x - tileW * 0.2,
    landerPt.y - tileH * 0.54,
    landerPt.x + tileW * 0.2,
    landerPt.y
  );
  deckTop.addColorStop(0, '#F5C178');
  deckTop.addColorStop(0.45, '#C96D3E');
  deckTop.addColorStop(1, '#7D371B');
  drawShadedIsoBox(
    ctx,
    landerPt.x,
    landerPt.y - tileH * 0.16,
    tileW * 0.4,
    tileH * 0.4,
    tileH * 0.28,
    deckTop,
    '#944A29',
    '#4A1F10',
    'rgba(255, 206, 140, 0.45)'
  );

  // UHF mast & 1.8 m robotic arm
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(landerPt.x - tileW * 0.08, landerPt.y - tileH * 0.46);
  ctx.lineTo(landerPt.x - tileW * 0.08, landerPt.y - tileH * 0.8);
  ctx.stroke();

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(landerPt.x + tileW * 0.05, landerPt.y - tileH * 0.44);
  ctx.lineTo(landerPt.x + tileW * 0.16, landerPt.y - tileH * 0.68);
  ctx.lineTo(landerPt.x + tileW * 0.22, landerPt.y - tileH * 0.42);
  ctx.stroke();

  if (highlighted || inspectPanels) {
    const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSec * 3.6);
    drawTargetBrackets(ctx, landerPt.x, landerPt.y, tileW * 0.64, tileH * 0.48, '#38DDF5', pulse);
  }
}

export function drawDetailedHabitat(ctx, x, y, tileW, tileH, timeSec, opts) {
  const { ghost, valid, highlighted, activeEffect, reducedMotion } = opts;
  ctx.save();
  if (ghost) ctx.globalAlpha = 0.68;

  if (!ghost) {
    drawMartianShadow(ctx, x, y + tileH * 0.08, tileW * 0.44, tileH * 0.36, 1.4);
  }

  // Sintered regolith dust apron + foundation pad
  if (!ghost) {
    drawIsoDiamond(ctx, x, y + tileH * 0.05, tileW * 1.0, tileH * 1.0);
    ctx.fillStyle = 'rgba(112, 52, 30, 0.52)';
    ctx.fill();
  }
  drawIsoDiamond(ctx, x, y + tileH * 0.03, tileW * 0.86, tileH * 0.86);
  ctx.fillStyle = ghost ? (valid ? 'rgba(56,221,245,0.28)' : 'rgba(239,68,68,0.28)') : '#3E3940';
  ctx.fill();
  ctx.strokeStyle = ghost ? (valid ? '#38DDF5' : '#F87171') : 'rgba(234, 242, 255, 0.22)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Sun-lit left hull & shadow-side right hull (weathered aerospace titanium)
  const topGrad = ghost ? (valid ? '#38DDF5' : '#F87171') : '#D9E2EE';
  const leftGrad = ghost
    ? valid
      ? '#1D6FA5'
      : '#991B1B'
    : (() => {
        const g = ctx.createLinearGradient(x, y - tileH * 0.7, x, y + tileH * 0.35);
        g.addColorStop(0, '#CBD5E1');
        g.addColorStop(0.7, '#94A3B8');
        g.addColorStop(1, '#785042'); // Martian dust settling on base skirt
        return g;
      })();
  const rightGrad = ghost
    ? valid
      ? '#154B75'
      : '#7F1D1D'
    : (() => {
        const g = ctx.createLinearGradient(x, y - tileH * 0.7, x, y + tileH * 0.35);
        g.addColorStop(0, '#64748B');
        g.addColorStop(0.72, '#3D4B61');
        g.addColorStop(1, '#4A2B22');
        return g;
      })();

  drawShadedIsoBox(
    ctx,
    x,
    y,
    tileW * 0.7,
    tileH * 0.7,
    tileH * 0.66,
    topGrad,
    leftGrad,
    rightGrad,
    'rgba(15, 23, 42, 0.35)'
  );

  if (!ghost) {
    // Segmented geodesic pressure dome with panel ribs
    const domeGrad = ctx.createRadialGradient(
      x - tileW * 0.1,
      y - tileH * 0.94,
      tileW * 0.03,
      x,
      y - tileH * 0.74,
      tileW * 0.34
    );
    domeGrad.addColorStop(0, '#F1F5F9');
    domeGrad.addColorStop(0.55, '#AEBCCD');
    domeGrad.addColorStop(1, '#475569');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - tileH * 0.74, tileW * 0.29, tileH * 0.44, 0, Math.PI, 0);
    ctx.ellipse(x, y - tileH * 0.74, tileW * 0.29, tileH * 0.2, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // Panel seam lines on dome
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y - tileH * 0.74, tileW * 0.14, tileH * 0.42, 0, Math.PI, 0);
    ctx.stroke();

    // Copper thermal-control structural collar
    ctx.strokeStyle = '#D87545';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - tileW * 0.35, y - tileH * 0.56);
    ctx.lineTo(x, y - tileH * 0.38);
    ctx.lineTo(x + tileW * 0.35, y - tileH * 0.56);
    ctx.stroke();

    // Illuminated armored viewport windows
    const appliedThermal = opts.appliedThermal;
    const isHeated = activeEffect === 'heat' || appliedThermal === 'heat';
    const isInsulated = activeEffect === 'insulate' || appliedThermal === 'insulate';
    const isThrottled = activeEffect === 'throttle' || appliedThermal === 'throttle';
    const isColdSnap = opts.phase === 'event_2';

    // Frost rim on dome during extreme cold if unheated
    if (isColdSnap && !isHeated && !isInsulated) {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - tileH * 0.74, tileW * 0.3, tileH * 0.45, 0, Math.PI, 0);
      ctx.stroke();
    }

    // Active thermal heating warm glow halo around the habitat
    if (isHeated) {
      const pulseR = reducedMotion ? 1 : 0.92 + 0.1 * Math.sin(timeSec * 4.5);
      const heatHalo = ctx.createRadialGradient(
        x,
        y - tileH * 0.35,
        tileW * 0.1,
        x,
        y - tileH * 0.35,
        tileW * 0.68 * pulseR
      );
      heatHalo.addColorStop(0, 'rgba(255, 179, 92, 0.42)');
      heatHalo.addColorStop(0.55, 'rgba(249, 115, 22, 0.18)');
      heatHalo.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = heatHalo;
      ctx.beginPath();
      ctx.ellipse(x, y - tileH * 0.25, tileW * 0.72, tileH * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const winColor = isHeated ? '#FFB35C' : isThrottled ? '#64748B' : '#38DDF5';
    ctx.fillStyle = winColor;
    for (let i = 0; i < 2; i++) {
      const wx = x - tileW * (0.25 - i * 0.11);
      const wy = y - tileH * (0.35 - i * 0.055);
      ctx.beginPath();
      ctx.roundRect(wx - 4.2, wy - 3, 7.5, 5, 1.4);
      ctx.fill();
    }

    // External ECLSS Cryo Tank Skid
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(x - tileW * 0.32, y - tileH * 0.16, tileW * 0.072, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pressurized Airlock Vestibule
    drawShadedIsoBox(
      ctx,
      x + tileW * 0.23,
      y + tileH * 0.07,
      tileW * 0.23,
      tileH * 0.23,
      tileH * 0.32,
      '#CBD5E1',
      '#64748B',
      '#283344'
    );

    if (isInsulated) {
      ctx.strokeStyle = '#FFB35C';
      ctx.lineWidth = 2.4;
      drawIsoDiamond(ctx, x, y - tileH * 0.24, tileW * 0.84, tileH * 0.84);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 212, 128, 0.55)';
      ctx.lineWidth = 1.2;
      drawIsoDiamond(ctx, x, y - tileH * 0.36, tileW * 0.78, tileH * 0.78);
      ctx.stroke();
    }

    if (opts.appliedSeismic === 'reinforce' || activeEffect === 'reinforce') {
      ctx.strokeStyle = '#38DDF5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - tileW * 0.42, y + tileH * 0.04);
      ctx.lineTo(x - tileW * 0.3, y - tileH * 0.45);
      ctx.moveTo(x + tileW * 0.42, y + tileH * 0.04);
      ctx.lineTo(x + tileW * 0.3, y - tileH * 0.45);
      ctx.stroke();
    }

    const blink = reducedMotion ? 1 : 0.45 + 0.55 * Math.abs(Math.sin(timeSec * 2.5));
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - tileH * 1.15);
    ctx.lineTo(x, y - tileH * 1.38);
    ctx.stroke();
    ctx.fillStyle = `rgba(56, 221, 245, ${blink})`;
    ctx.beginPath();
    ctx.arc(x, y - tileH * 1.4, 2.6, 0, Math.PI * 2);
    ctx.fill();

    if (highlighted) {
      const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSec * 4);
      drawTargetBrackets(ctx, x, y, tileW * 0.62, tileH * 0.52, '#FFB35C', pulse);
    }
  }

  ctx.restore();
}

export function drawDetailedSolarUnit(ctx, x, y, tileW, tileH, timeSec, opts) {
  const { ghost, valid, highlighted, activeEffect, dustLevel = 0, reducedMotion } = opts;
  ctx.save();
  if (ghost) ctx.globalAlpha = 0.68;

  if (!ghost) {
    drawMartianShadow(ctx, x, y + tileH * 0.08, tileW * 0.44, tileH * 0.32, 1.4);
    drawIsoDiamond(ctx, x, y + tileH * 0.04, tileW * 0.84, tileH * 0.84);
    ctx.fillStyle = 'rgba(54, 42, 38, 0.48)';
    ctx.fill();
  }

  drawShadedIsoBox(
    ctx,
    x,
    y,
    tileW * 0.38,
    tileH * 0.38,
    tileH * 0.32,
    ghost ? (valid ? '#38DDF5' : '#F87171') : '#CBD5E1',
    ghost ? '#1D6FA5' : '#64748B',
    ghost ? '#154B75' : '#2C384B',
    'rgba(15, 23, 42, 0.35)'
  );

  const tilt = activeEffect === 'orient' || opts.appliedSolar === 'orient' ? -tileH * 0.12 : 0;
  const py = y - tileH * 0.54 + tilt;
  const p1 = { x: x - tileW * 0.46, y: py + tileH * 0.07 };
  const p2 = { x: x + tileW * 0.04, y: py - tileH * 0.39 };
  const p3 = { x: x + tileW * 0.48, y: py - tileH * 0.02 };
  const p4 = { x: x - tileW * 0.02, y: py + tileH * 0.44 };

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();

  if (ghost) {
    ctx.fillStyle = valid ? '#2563EB' : '#B91C1C';
    ctx.fill();
    ctx.strokeStyle = valid ? '#38DDF5' : '#FCA5A5';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
    return;
  }

  const pvGrad = ctx.createLinearGradient(p1.x, p2.y, p3.x, p4.y);
  pvGrad.addColorStop(0, '#2052A3');
  pvGrad.addColorStop(0.4, '#0D214A');
  pvGrad.addColorStop(0.58, '#3474D4');
  pvGrad.addColorStop(1, '#0B1938');
  ctx.fillStyle = pvGrad;
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
  ctx.lineWidth = 0.85;
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    ctx.beginPath();
    ctx.moveTo(p1.x + (p2.x - p1.x) * t, p1.y + (p2.y - p1.y) * t);
    ctx.lineTo(p4.x + (p3.x - p4.x) * t, p4.y + (p3.y - p4.y) * t);
    ctx.moveTo(p1.x + (p4.x - p1.x) * t, p1.y + (p4.y - p1.y) * t);
    ctx.lineTo(p2.x + (p3.x - p2.x) * t, p2.y + (p3.y - p2.y) * t);
    ctx.stroke();
  }

  if (dustLevel > 0) {
    ctx.fillStyle = `rgba(202, 102, 56, ${Math.min(0.68, dustLevel * 0.62)})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
  }

  if (activeEffect === 'clean') {
    const sweep = reducedMotion ? 0.5 : (Math.sin(timeSec * 6) + 1) * 0.5;
    const ax = p1.x + (p2.x - p1.x) * sweep;
    const ay = p1.y + (p2.y - p1.y) * sweep;
    const bx = p4.x + (p3.x - p4.x) * sweep;
    const by = p4.y + (p3.y - p4.y) * sweep;
    ctx.strokeStyle = '#38DDF5';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  ctx.fillStyle = dustLevel > 0.6 ? '#FFB35C' : '#38DDF5';
  ctx.beginPath();
  ctx.arc(x - tileW * 0.09, y - tileH * 0.09, 2.2, 0, Math.PI * 2);
  ctx.fill();

  if (highlighted) {
    const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSec * 4);
    drawTargetBrackets(ctx, x, y, tileW * 0.62, tileH * 0.52, '#FFB35C', pulse);
  }

  ctx.restore();
}

export function drawDetailedScienceStation(ctx, x, y, tileW, tileH, timeSec, opts) {
  const { ghost, valid, highlighted, phase, activeEffect, reducedMotion } = opts;
  ctx.save();
  if (ghost) ctx.globalAlpha = 0.68;

  if (!ghost) {
    drawMartianShadow(ctx, x, y + tileH * 0.08, tileW * 0.38, tileH * 0.3, 1.35);
    drawIsoDiamond(ctx, x, y + tileH * 0.04, tileW * 0.78, tileH * 0.78);
    ctx.fillStyle = 'rgba(48, 46, 56, 0.52)';
    ctx.fill();
  }

  drawShadedIsoBox(
    ctx,
    x,
    y,
    tileW * 0.54,
    tileH * 0.54,
    tileH * 0.36,
    ghost ? (valid ? '#38DDF5' : '#F87171') : '#CBD5E1',
    ghost ? '#1D6FA5' : '#64748B',
    ghost ? '#154B75' : '#2C384B',
    'rgba(15, 23, 42, 0.35)'
  );

  if (!ghost) {
    drawShadedIsoBox(
      ctx,
      x - tileW * 0.09,
      y - tileH * 0.36,
      tileW * 0.24,
      tileH * 0.24,
      tileH * 0.2,
      '#F5C178',
      '#C96D3E',
      '#7D371B'
    );

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + tileW * 0.1, y - tileH * 0.4);
    ctx.lineTo(x + tileW * 0.1, y - tileH * 0.96);
    ctx.stroke();

    const dishTilt = reducedMotion ? -0.35 : -0.35 + Math.sin(timeSec * 0.8) * 0.08;
    const dishGrad = ctx.createRadialGradient(
      x + tileW * 0.14,
      y - tileH * 1.0,
      1,
      x + tileW * 0.14,
      y - tileH * 1.0,
      tileW * 0.17
    );
    dishGrad.addColorStop(0, '#F8FAFC');
    dishGrad.addColorStop(1, '#475569');
    ctx.fillStyle = dishGrad;
    ctx.beginPath();
    ctx.ellipse(x + tileW * 0.14, y - tileH * 1.0, tileW * 0.16, tileH * 0.12, dishTilt, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38DDF5';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#C96D3E';
    ctx.beginPath();
    ctx.ellipse(x - tileW * 0.26, y + tileH * 0.13, tileW * 0.1, tileH * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    if (phase === 'event_3' || activeEffect === 'secure' || opts.appliedSeismic === 'secure') {
      const rp = reducedMotion ? 0.55 : (timeSec * 0.95) % 1;
      const col = opts.appliedSeismic === 'secure' || activeEffect === 'secure'
        ? `rgba(56, 221, 245, ${0.95 - rp * 0.85})`
        : `rgba(248, 113, 113, ${0.95 - rp * 0.85})`;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, tileW * (0.3 + rp * 0.52), tileH * (0.26 + rp * 0.44), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (opts.appliedSeismic === 'secure' || activeEffect === 'secure') {
      ctx.strokeStyle = '#38DDF5';
      ctx.lineWidth = 2.2;
      drawIsoDiamond(ctx, x, y + tileH * 0.04, tileW * 0.68, tileH * 0.68);
      ctx.stroke();
    }

    if (highlighted) {
      const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSec * 4);
      drawTargetBrackets(ctx, x, y, tileW * 0.58, tileH * 0.48, '#FFB35C', pulse);
    }
  }

  ctx.restore();
}

export function drawDetailedAstronaut(ctx, x, y, tileW, tileH, timeSec, opts) {
  const { moving, walkPhase, reducedMotion } = opts;
  const stride = moving && !reducedMotion ? Math.sin(walkPhase * 12) : 0;
  const bob = moving && !reducedMotion ? Math.abs(stride) * 3.5 : Math.sin(timeSec * 2) * 0.8;

  drawMartianShadow(ctx, x, y + 2, tileW * 0.12, tileH * 0.1, 1.45);

  const footY = y - bob;

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 3.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 3.8, footY - 13);
  ctx.lineTo(x - 4.8 + stride * 3.4, footY);
  ctx.moveTo(x + 3.8, footY - 13);
  ctx.lineTo(x + 4.8 - stride * 3.4, footY);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.roundRect(x - 9.2, footY - 28, 6.5, 14, 2);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 6.5, footY - 28);
  ctx.lineTo(x - 6.5, footY - 38);
  ctx.stroke();

  const suitGrad = ctx.createLinearGradient(x - 6.5, footY - 28, x + 6.5, footY - 12);
  suitGrad.addColorStop(0, '#F1F5F9');
  suitGrad.addColorStop(1, '#94A3B8');
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.roundRect(x - 7, footY - 28, 14, 16, 4.5);
  ctx.fill();

  ctx.fillStyle = '#D87545';
  ctx.fillRect(x - 6.5, footY - 20.5, 13, 2.8);

  ctx.fillStyle = '#38DDF5';
  ctx.fillRect(x + 0.5, footY - 25.5, 3.2, 2.4);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 5, footY - 24);
  ctx.lineTo(x + 8 - stride * 2.6, footY - 15);
  ctx.stroke();

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(x, footY - 34, 8, 0, Math.PI * 2);
  ctx.fill();

  const visorGrad = ctx.createLinearGradient(x - 2, footY - 38, x + 6, footY - 30);
  visorGrad.addColorStop(0, '#FFD480');
  visorGrad.addColorStop(0.5, '#C96D3E');
  visorGrad.addColorStop(1, '#4B2314');
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.ellipse(x + 1.8, footY - 34, 5.2, 4.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(x + 3.4, footY - 35.5, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Interactive Mars geological field sample node for bonus exploration gameplay.
 */
export function drawSurveyNodeMarker(ctx, x, y, tileW, tileH, timeSec, opts) {
  const { collected, scanned, reducedMotion } = opts;
  ctx.save();

  const pulse = reducedMotion ? 0.5 : (Math.sin(timeSec * 3.4) + 1) * 0.5;
  if (collected) {
    // Small deployed flag / marker post
    ctx.strokeStyle = 'rgba(56, 221, 245, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x, y - tileH * 0.42);
    ctx.stroke();
    ctx.fillStyle = '#38DDF5';
    ctx.beginPath();
    ctx.arc(x, y - tileH * 0.42, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Glowing ground ring (brighter after Sensor Scan)
  ctx.strokeStyle = scanned
    ? `rgba(255, 179, 92, ${0.5 + pulse * 0.45})`
    : `rgba(56, 221, 245, ${0.32 + pulse * 0.35})`;
  ctx.lineWidth = scanned ? 2.2 : 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, tileW * (0.24 + pulse * 0.08), tileH * (0.2 + pulse * 0.07), 0, 0, Math.PI * 2);
  ctx.stroke();

  // Crystalline outcrop mineral core
  ctx.fillStyle = scanned ? '#FFB35C' : '#38DDF5';
  ctx.beginPath();
  ctx.moveTo(x, y - tileH * 0.36);
  ctx.lineTo(x + 6, y - tileH * 0.14);
  ctx.lineTo(x, y - 1);
  ctx.lineTo(x - 6, y - tileH * 0.14);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
