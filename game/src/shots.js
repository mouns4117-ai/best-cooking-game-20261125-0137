// Sizzle & Serve — staged scenes for the three screenshots.
// Each scene is the real game world arranged by hand: an order is served,
// a dish is mid-assembly, the kitchen waits at shift start. The scenes are
// built with the same world functions the player triggers, so nothing in
// them is faked.
import { RECIPES, SHIFT_SECONDS, STATIONS } from './config.js';

// Where the chef stands for each scene.
const SCENES = {
  play: {
    name: '1-play.jpg',
    setup(world) {
      const state = world.state;
      state.time = 62;
      state.timeLeft = SHIFT_SECONDS - 62;
      state.score = 480;
      state.combo = 2;
      const salad = world.spawnOrder('salad', 38);
      if (salad !== null) salad.timeLeft = 38;
      const melt = world.spawnOrder('melt', 26);
      if (melt !== null) melt.timeLeft = 26;
      state.plate = { contents: ['bun', 'patty-cooked'] };
      state.player.x = 600;
      state.player.y = 400;
      state.player.dir = 1;
      state.player.hands = { kind: 'item', item: 'cheese' };
      state.board.item = 'tomato';
      state.board.progress = 1.1;
      state.grill[0].item = 'patty';
      state.grill[0].progress = 3.4;
      state.grill[1].item = 'patty';
      state.grill[1].progress = 5.6;
      state.grill[1].done = true;
    },
  },
  serve: {
    name: '2-serve.jpg',
    setup(world) {
      const state = world.state;
      state.time = 148;
      state.timeLeft = SHIFT_SECONDS - 148;
      state.score = 1250;
      state.combo = 4;
      const burger = world.spawnOrder('burger', 18);
      if (burger !== null) burger.timeLeft = 18;
      state.player.x = STATIONS.serve.x + 120;
      state.player.y = STATIONS.serve.y + 200;
      state.player.dir = -1;
      state.player.hands = { kind: 'plate', contents: ['bun', 'patty-cooked', 'cheese'] };
      world.burst(STATIONS.serve.x + STATIONS.serve.w / 2, STATIONS.serve.y + 60, '#ffd94a', 22);
      world.addPopup(STATIONS.serve.x + STATIONS.serve.w / 2, STATIONS.serve.y + 80, '+240', '#ffd94a');
      state.served = 7;
      state.bestCombo = 4;
    },
  },
  start: {
    name: '3-start.jpg',
    setup(world) {
      const state = world.state;
      state.time = 0;
      state.timeLeft = SHIFT_SECONDS;
      state.score = 0;
      const salad = world.spawnOrder('salad', 50);
      if (salad !== null) salad.timeLeft = 50;
      state.player.x = 640;
      state.player.y = 430;
      state.player.dir = 1;
    },
  },
};

export function sceneNames() {
  return Object.values(SCENES).map((scene) => scene.name);
}

export function sceneCount() {
  return Object.keys(SCENES).length;
}

/** Arrange the world for a named scene, or null when the name is unknown. */
export function setupScene(world, key) {
  const scene = SCENES[key];
  if (scene === undefined) return null;
  world.reset();
  scene.setup(world);
  return scene.name;
}

/** Recipe names, for the dossier description. */
export function recipeNames() {
  return RECIPES.map((recipe) => recipe.name);
}
