export const TRUST_OPTIONS = ['Not yet', 'A little', 'Somewhat', 'Mostly', 'Totally'];

export const CASE_STAMPS = [
  {
    id: 1,
    label: 'THE GROUND SHOOK',
    detail: 'Sol 1094 seismic waveform confirmed a real marsquake, not wind noise.',
  },
  {
    id: 2,
    label: 'SOMETHING NEW FORMED',
    detail: 'MRO orbital before/after imagery reveals a fresh 150 m crater.',
  },
  {
    id: 3,
    label: 'A SMALL ROCK CAN DO THIS',
    detail:
      'High impact velocity (~10+ km/s) multiplies kinetic energy to excavate 21 m deep & fling debris 37 km.',
  },
  {
    id: 4,
    label: 'PROBABLY WATER ICE',
    detail:
      'Blue-white false-color signature and Dec 2022 sublimation match exposed subsurface water ice.',
  },
];

export const CASE_SUSPECTS = [
  {
    id: 'A',
    name: 'Space Rock Impact',
    status: 'Alive',
    alive: true,
    summary: 'Confirmed by Sol 1094 seismic waves, fresh 150 m crater, impact energy & exposed ice.',
  },
  {
    id: 'B',
    name: 'Mars Cracked by Itself',
    status: 'Out',
    alive: false,
    summary: 'Ruled out — MRO orbiter spotted a brand-new impact crater & 37 km ejecta blanket.',
  },
  {
    id: 'C',
    name: 'Just Wind Noise',
    status: 'Out',
    alive: false,
    summary: 'Ruled out — Sol 1094 waveform shows clear surface waves well above Martian wind.',
  },
];

export const VERDICT_SLOTS = [
  {
    id: 'observation',
    label: 'Observation:',
    correctPartId: 'quakes-1319',
    hint: 'What did InSight directly record in its catalog?',
  },
  {
    id: 'evidence',
    label: 'Evidence:',
    correctPartId: 'water-ice',
    hint: 'Which careful orbital finding supports the impact clue?',
  },
  {
    id: 'interpretation',
    label: 'Interpretation:',
    correctPartId: 'rock-estimate',
    hint: 'Which physical value is modeled rather than directly weighed?',
  },
  {
    id: 'conclusion',
    label: 'Conclusion:',
    correctPartId: 'space-rock-verdict',
    hint: 'Which statement sums up the final ruling for Case 1094?',
  },
];

export const VERDICT_PARTS = [
  {
    id: 'rock-estimate',
    text: 'Our rock size is an estimate',
    targetSlot: 'interpretation',
  },
  {
    id: 'quakes-1319',
    text: 'This is one event among 1,319 quakes',
    targetSlot: 'observation',
  },
  {
    id: 'water-ice',
    text: 'The ice is described as consistent with water ice',
    targetSlot: 'evidence',
  },
  {
    id: 'space-rock-verdict',
    text: 'A space rock impact best explains Case 1094',
    targetSlot: 'conclusion',
  },
];
