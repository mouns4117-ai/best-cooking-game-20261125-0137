// Sizzle & Serve — shared constants: layout, recipes, timings, colours.
// One kitchen, one shift, three recipes. Everything the world and the
// renderer agree on lives here, so a number changes in exactly one place.
export const VIEW = { width: 1280, height: 720 };
export const TOP_BAR = 76;
export const SHIFT_SECONDS = 180;
export const PLAYER = { radius: 22, speed: 275 };

export const INGREDIENTS = {
  tomato: { name: 'Tomato', color: '#e2483d', chop: true, grill: false },
  lettuce: { name: 'Lettuce', color: '#69b455', chop: true, grill: false },
  cheese: { name: 'Cheese', color: '#f2c230', chop: false, grill: false },
  bun: { name: 'Bun', color: '#e0a458', chop: false, grill: false },
  patty: { name: 'Patty', color: '#8a4b2d', chop: false, grill: true },
};

export const CHOPPED = { tomato: 'tomato-chopped', lettuce: 'lettuce-chopped' };
export const ITEM_NAMES = {
  'tomato': 'Tomato',
  'lettuce': 'Lettuce',
  'cheese': 'Cheese',
  'bun': 'Bun',
  'patty': 'Raw patty',
  'tomato-chopped': 'Chopped tomato',
  'lettuce-chopped': 'Chopped lettuce',
  'patty-cooked': 'Grilled patty',
  'patty-burnt': 'Burnt patty',
};

export const RECIPES = [
  {
    id: 'salad',
    name: 'Garden Salad',
    needs: ['lettuce-chopped', 'tomato-chopped'],
    color: '#5da24a',
    patience: 50,
  },
  {
    id: 'burger',
    name: 'Cheeseburger',
    needs: ['bun', 'patty-cooked', 'cheese'],
    color: '#c98a2e',
    patience: 62,
  },
  {
    id: 'melt',
    name: 'Garden Melt',
    needs: ['bun', 'cheese', 'tomato-chopped'],
    color: '#d95f43',
    patience: 55,
  },
];

export const TIMING = {
  chopSeconds: 1.6,
  grillCookSeconds: 5,
  grillBurnSeconds: 11,
  spawnFirstSeconds: 2,
  spawnIntervalStart: 14,
  spawnIntervalEnd: 9,
  patienceStart: 50,
  patienceEnd: 34,
  maxOrders: 3,
  maxHearts: 3,
  serveBase: 100,
  comboStep: 0.25,
  comboCap: 3,
};

// Kitchen floor plan. Counters are obstacles; crates, board, grill, plating
// counter, serving window and trash are the stations the chef works at.
export const STATIONS = {
  crates: [
    { id: 'crate-tomato', item: 'tomato', x: 24, y: 100, w: 150, h: 72 },
    { id: 'crate-lettuce', item: 'lettuce', x: 24, y: 188, w: 150, h: 72 },
    { id: 'crate-cheese', item: 'cheese', x: 24, y: 276, w: 150, h: 72 },
    { id: 'crate-bun', item: 'bun', x: 24, y: 364, w: 150, h: 72 },
    { id: 'crate-patty', item: 'patty', x: 24, y: 452, w: 150, h: 72 },
  ],
  board: { id: 'board', x: 260, y: 100, w: 210, h: 92 },
  grill: { id: 'grill', x: 520, y: 100, w: 240, h: 92, slots: 2 },
  sink: { id: 'sink', x: 810, y: 100, w: 200, h: 92 },
  serve: { id: 'serve', x: 1060, y: 100, w: 196, h: 200 },
  plating: { id: 'plating', x: 260, y: 560, w: 300, h: 92 },
  trash: { id: 'trash', x: 1060, y: 560, w: 90, h: 92 },
};

// Every counter the chef cannot walk through (stations plus the sink block).
export function obstacleRects() {
  const rects = [];
  for (const crate of STATIONS.crates) rects.push(crate);
  rects.push(STATIONS.board, STATIONS.grill, STATIONS.sink, STATIONS.serve);
  rects.push(STATIONS.plating, STATIONS.trash);
  return rects;
}
