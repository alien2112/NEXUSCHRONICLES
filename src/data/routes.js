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
  { page: 'case-board', hash: '#case-board', aliases: ['#investigation-case-board'] },
  { page: 'go-deeper-1', hash: '#go-deeper', aliases: ['#go-deeper-1', '#science-behind-it', '#science-behind-it-1'] },
  { page: 'go-deeper-2', hash: '#go-deeper-2', aliases: ['#science-behind-it-2'] },
  { page: 'go-deeper-3', hash: '#go-deeper-3', aliases: ['#science-behind-it-3'] },
  { page: 'go-deeper-4', hash: '#go-deeper-4', aliases: ['#science-behind-it-4'] },
  { page: 'go-deeper-5', hash: '#go-deeper-5', aliases: ['#science-behind-it-5'] },
  { page: 'go-deeper-6', hash: '#go-deeper-6', aliases: ['#science-behind-it-6'] },
  { page: 'go-technical-1', hash: '#go-technical', aliases: ['#go-technical-1', '#engineering-the-mission', '#engineering-the-mission-1'] },
  { page: 'go-technical-2', hash: '#go-technical-2', aliases: ['#engineering-the-mission-2'] },
  { page: 'go-technical-3', hash: '#go-technical-3', aliases: ['#engineering-the-mission-3'] },
  { page: 'go-technical-4', hash: '#go-technical-4', aliases: ['#engineering-the-mission-4'] },
  { page: 'go-technical-5', hash: '#go-technical-5', aliases: ['#engineering-the-mission-5'] },
  { page: 'go-technical-6', hash: '#go-technical-6', aliases: ['#engineering-the-mission-6'] },
  { page: 'go-technical-7', hash: '#go-technical-7', aliases: ['#engineering-the-mission-7'] },
  { page: 'go-technical-8', hash: '#go-technical-8', aliases: ['#engineering-the-mission-8'] },
  { page: 'go-technical-9', hash: '#go-technical-9', aliases: ['#engineering-the-mission-9'] },
  { page: 'go-technical-10', hash: '#go-technical-10', aliases: ['#engineering-the-mission-10'] },
  { page: 'engineering-legacy', hash: '#engineering-legacy', aliases: ['#legacy', '#mars-legacy-outpost', '#outpost'] },
];

export function resolveHash(hash) {
  const normalized = hash.toLowerCase();
  return routes.find(route => route.hash === normalized || route.aliases.includes(normalized))?.page ?? 'home';
}

export function canonicalHash(page) {
  return routes.find(route => route.page === page)?.hash ?? '#home';
}
