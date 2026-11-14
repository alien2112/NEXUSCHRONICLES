# Production performance fixes

## Implemented

- `scripts/performance-assets.js` emits content-addressed delivery copies of referenced public images and GLB models during the existing Vite build. Originals remain untouched. Equal files share a URL; changed bytes receive a new URL.
- `vercel.json` gives only generated `/assets/` and `/media/` URLs one-year immutable browser caching. HTML and unversioned public URLs retain their existing behavior.
- Initial hash-aware image discovery starts the appropriate artwork before React renders. Low priority prevents large images from intentionally outranking application scripts/styles. Aliases are generated from the actual route registry.
- Seismogram playback caches its static heatmap/waveform layer and composites the moving cursor. Font completion and DPR changes invalidate the cache.
- Existing Three.js scenes dispose owned GPU resources on removal/unmount. A model arriving after its viewer unmounts is disposed as well.

## Validation

- Production build and lint passed. Vite still warns about the approximately 584 KB uncompressed shared Three.js chunk, loaded by the existing lazy 3D experiences.
- 13 unit tests passed.
- 33 browser tests passed; one mobile-only test was skipped in the desktop project.
- Mars mission screen screenshots were pixel-identical at widths 390 and 1440 against the saved pre-change build, with external fonts mocked consistently.
- 23 generated asset references were verified byte-identical to their public sources.
- Final low-priority preload smoke check verified two correct mission images, each requested once.
- No deployment occurred. Vercel header behavior and warm-cache improvement require deployed validation.

## Measurement limits and remaining costs

An exploratory local cold-load comparison at 1.6 Mbps, 150 ms configured latency and 4x CPU slowdown found Mars LCP around 18.9 seconds before and 18.6 seconds with high-priority image hints. First paint worsened from 1.58 to 1.98 seconds, so high-priority hints were rejected in favor of low-priority discovery. Those numbers are not a benchmark for the final version or a claim of production improvement; unrelated workspace changes also occurred between snapshots.

Large backgrounds still contain the original full-resolution bytes. Re-encoding the existing Home WebP losslessly produced no size saving; a tested lossless AVIF was larger. No lossy replacements or reduced resolution were introduced. The new InSight GLB is approximately 22.4 MB, making its first visit network-heavy even with repeat-visit caching. The unreferenced 134 MB T.mp4 is not a current page-download bottleneck.

Local preview does not simulate Vercel response headers. After an approved deployment, verify immutable headers on generated media/scripts, revalidating HTML, cache reuse, direct-route resource loading, and cold/warm mobile traces. Do not claim that all slow-network performance problems are solved by caching.

Other concurrent workspace changes were preserved; this report covers only the performance work above.
