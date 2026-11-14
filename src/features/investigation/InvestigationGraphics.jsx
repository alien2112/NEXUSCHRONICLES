import { useEffect, useState } from 'react';

const cutoutCache = new Map();

function isBackgroundPixel(data, offset, bgR, bgG, bgB) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return (
    spread <= 10 &&
    Math.abs(r - bgR) <= 16 &&
    Math.abs(g - bgG) <= 16 &&
    Math.abs(b - bgB) <= 16
  );
}

function stripExteriorBackground(img) {
  const maxDim = 512;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  // Flood-fill only from the 4 corners so interior bright highlights (like a white bus roof) stay solid.
  const visited = new Uint8Array(width * height);
  const stack = [];
  const seeds = [0, width - 1, (height - 1) * width, width * height - 1];
  for (const seed of seeds) {
    if (!visited[seed] && isBackgroundPixel(data, seed * 4, bgR, bgG, bgB)) {
      visited[seed] = 1;
      stack.push(seed);
    }
  }

  while (stack.length > 0) {
    const idx = stack.pop();
    const x = idx % width;
    const y = (idx / width) | 0;

    if (x > 0) {
      const next = idx - 1;
      if (!visited[next] && isBackgroundPixel(data, next * 4, bgR, bgG, bgB)) {
        visited[next] = 1;
        stack.push(next);
      }
    }
    if (x + 1 < width) {
      const next = idx + 1;
      if (!visited[next] && isBackgroundPixel(data, next * 4, bgR, bgG, bgB)) {
        visited[next] = 1;
        stack.push(next);
      }
    }
    if (y > 0) {
      const next = idx - width;
      if (!visited[next] && isBackgroundPixel(data, next * 4, bgR, bgG, bgB)) {
        visited[next] = 1;
        stack.push(next);
      }
    }
    if (y + 1 < height) {
      const next = idx + width;
      if (!visited[next] && isBackgroundPixel(data, next * 4, bgR, bgG, bgB)) {
        visited[next] = 1;
        stack.push(next);
      }
    }
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const p = idx * 4;
      if (visited[idx]) {
        data[p + 3] = 0;
        continue;
      }

      // Soften 1px bright fringe bordering removed background
      const touchesBg =
        (x > 0 && visited[idx - 1]) ||
        (x + 1 < width && visited[idx + 1]) ||
        (y > 0 && visited[idx - width]) ||
        (y + 1 < height && visited[idx + width]);

      if (touchesBg) {
        const dist =
          Math.abs(data[p] - bgR) +
          Math.abs(data[p + 1] - bgG) +
          Math.abs(data[p + 2] - bgB);
        if (dist < 90) {
          data[p + 3] = Math.round((dist / 90) * 255);
        }
      }

      if (data[p + 3] > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (maxX < minX || maxY < minY) return canvas.toDataURL('image/png');

  const pad = 2;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return canvas.toDataURL('image/png');

  outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return outCanvas.toDataURL('image/png');
}

/**
 * Renders a JPEG cutout with its uniform exterior background removed so it sits cleanly on dark HUD surfaces.
 */
export function CutoutImage({ src, alt, className = '', draggable = false }) {
  const [cutout, setCutout] = useState({ src: '', dataUrl: null });
  const cached = src ? cutoutCache.get(src) : null;

  useEffect(() => {
    if (!src || cutoutCache.has(src)) return undefined;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      try {
        const result = stripExteriorBackground(img);
        if (result) {
          cutoutCache.set(src, result);
          setCutout({ src, dataUrl: result });
        }
      } catch {
        // Fallback to raw image if canvas pixel read fails
      }
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  const resolvedSrc = cached || (cutout.src === src ? cutout.dataUrl : null) || src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      draggable={draggable}
    />
  );
}
