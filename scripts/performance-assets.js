import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { routes } from '../src/data/routes.js';

// Keep editable public originals; emit byte-identical, content-addressed delivery
// copies. Equal files share a URL, and changed bytes always receive a new URL.
export function collectMedia(publicDir) {
  const assets = new Map();
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.(png|webp|jpe?g|svg|woff2|glb)$/i.test(entry.name)) {
        const source = readFileSync(path);
        const digest = createHash('sha256').update(source).digest('hex').slice(0, 20);
        const url = '/' + relative(publicDir, path).replaceAll('\\', '/');
        assets.set(url, { source, fileName: `media/${digest}${extname(path).toLowerCase()}` });
      }
    }
  }
  visit(publicDir);
  return assets;
}

export function criticalImages(content, page) {
  if (page === 'home') return [content.homePage.backgroundImage];
  if (page === 'missions') return [content.chooseWorldPage.backgroundImage];
  if (page === 'mars') return [content.marsPage.backgroundImage];
  if (page === 'mars-missions' || page === 'mars-insight') {
    return [content.marsMissionsPage.horizonImage, content.marsMissionsPage.backgroundImage];
  }
  if (page === 'insight-mission') return [content.insightMissionPage.video.poster];
  if (page === 'insight-story-1') return [content.insightStory1Page.backgroundImage];
  if (page.startsWith('insight-story-')) {
    const story = content.insightStorySeries?.pages?.find(item => item.page === page);
    return [story?.backgroundImage ?? content.insightStorySeries.backgroundImage];
  }
  if (page.startsWith('go-') || page === 'after-investigation') {
    return [content.insightStorySeries.backgroundImage];
  }
  if (page === 'investigation' || page === 'case-board') return [content.investigation.backgroundImage];
  return [];
}

export default function performanceAssets() {
  let root;
  let media;
  const used = new Set();
  const deliveryUrl = (url) => {
    const asset = media.get(url);
    if (!asset) return url;
    used.add(url);
    return '/' + asset.fileName;
  };
  return {
    name: 'content-addressed-public-media',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) { root = config.root; },
    buildStart() {
      used.clear();
      media = collectMedia(join(root, 'public'));
    },
    transform(code, id) {
      if (!id.replaceAll('\\', '/').startsWith(root.replaceAll('\\', '/') + '/src/')) return;
      let result = code;
      for (const [url] of media) {
        // Exact string literals only: never rewrite partial URLs or external URLs.
        for (const literal of [JSON.stringify(url), `'${url}'`, `\`${url}\``]) {
          if (result.includes(literal)) result = result.replaceAll(literal, JSON.stringify(deliveryUrl(url)));
        }
      }
      if (result !== code) return { code: result, map: null };
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        const content = JSON.parse(readFileSync(join(root, 'src/data/siteContent.json'), 'utf8'));
        const hints = Object.fromEntries(routes.flatMap(route => {
          const images = criticalImages(content, route.page).filter(Boolean).map(deliveryUrl);
          return [route.hash, ...route.aliases].map(hash => [hash, images]);
        }));
        // Discover artwork early without letting multi-megabyte transfers outrank
        // the application and styles needed to paint the first screen.
        const data = JSON.stringify(hints).replaceAll('<', '\\u003c');
        return [{ tag: 'script', injectTo: 'head', children:
          `(()=>{const routes=${data};for(const href of routes[location.hash.toLowerCase()]||routes['#home']){const link=document.createElement('link');link.rel='preload';link.as='image';link.href=href;link.fetchPriority='low';document.head.append(link)}})();`
        }];
      },
    },
    generateBundle() {
      const emitted = new Set();
      for (const url of used) {
        const { fileName, source } = media.get(url);
        if (emitted.has(fileName)) continue;
        emitted.add(fileName);
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
