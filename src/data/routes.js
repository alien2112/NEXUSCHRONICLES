// Existing public hashes and canonical destinations live in one place.
export const routes = [
  { page: 'home', hash: '#home', aliases: ['', '#explore'] },
  { page: 'missions', hash: '#missions', aliases: ['#choose-world', '#worlds', '#page2'] },
  { page: 'mars', hash: '#mars', aliases: ['#the-mars', '#page3'] },
  { page: 'mars-missions', hash: '#mars-missions', aliases: ['#mars-page4', '#page4'] },
  { page: 'mars-insight', hash: '#mars-insight', aliases: ['#page5', '#insight'] },
  { page: 'insight-mission', hash: '#insight-mission', aliases: ['#page6'] },
  { page: 'insight-story-1', hash: '#story-1', aliases: ['#insight-story-1', '#story1', '#page7'] },
  { page: 'investigation', hash: '#investigation', aliases: ['#investigate', '#case-1094', '#page8'] },
];

export function resolveHash(hash) {
  const normalized = hash.toLowerCase();
  return routes.find(route => route.hash === normalized || route.aliases.includes(normalized))?.page ?? 'home';
}

export function canonicalHash(page) {
  return routes.find(route => route.page === page)?.hash ?? '#home';
}
