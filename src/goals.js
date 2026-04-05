// Static goal definitions — no backend, data lives in IndexedDB (Dexie)
export const GOALS = [
  {
    id: 'gym',
    name: 'Gym',
    emoji: '🏋️',
    target: 4,       // 4x per week
    period: 'week',
    days: null,      // any day of the week
    hasNotes: false,
    color: '#00ff88', // neon green
  },
  {
    id: 'dj-practice',
    name: 'DJ Practice',
    emoji: '🎧',
    target: 7,       // every day
    period: 'week',
    days: null,
    hasNotes: false,
    color: '#00e5ff', // neon cyan
  },
  {
    id: 'dj-gigs',
    name: 'Vinyl DJ Gigs',
    emoji: '🎶',
    target: null,    // no fixed target
    period: null,
    days: null,
    hasNotes: true,  // venue, event name, free text
    color: '#bf5fff', // neon purple
  },
  {
    id: 'duolingo',
    name: 'Duolingo Italian',
    emoji: '🇮🇹',
    target: 7,
    period: 'week',
    days: null,
    hasNotes: false,
    color: '#ffee00', // neon yellow
  },
  {
    id: 'piano',
    name: 'Piano Lessons',
    emoji: '🎹',
    target: 5,
    period: 'week',
    days: [1, 2, 3, 4, 5], // Mon–Fri only (0 = Sun, 6 = Sat)
    hasNotes: false,
    color: '#ff2d78', // neon pink
  },
];

export const GOAL_MAP = Object.fromEntries(GOALS.map((g) => [g.id, g]));
