// Sizzle & Serve — boots the canvas, runs the loop, owns the input.
// Modes: ?shot=<name> renders one staged scene and sets window.__shotReady
// for screenshots; ?seed=N makes the run deterministic. Otherwise it is the
// playable game: title screen, three-minute shift, game over, play again.
import { SHIFT_SECONDS } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createRandom } from './random.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, createRenderer } from './render.js';
import { sceneCount, setupScene } from './shots.js';
import { createWorld } from './world.js';

const BEST_KEY = 'sizzle-and-serve-best';
const STEP = 1 / 60;

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // A private window is fine — the best score just does not persist.
  }
}

function main() {
  const canvas = document.getElementById('game');
  const renderer = createRenderer(canvas);
  const audio = createAudio();
  const input = createInput(canvas);
  const params = new URLSearchParams(window.location.search);
  const seedParam = Number(params.get('seed'));
  const seed = Number.isFinite(seedParam) ? seedParam : 20261125;
  const random = createRandom(seed);
  const world = createWorld(random);
  const shot = params.get('shot');
  let best = loadBest();

  // Screenshot mode: stage one scene, draw it once, and tell the harness.
  if (shot !== null) {
    const name = setupScene(world, shot);
    if (name === null) {
      document.title = 'Sizzle & Serve — unknown shot';
    } else {
      renderer.draw(world.state, SCREEN_PLAY, best, null);
      document.title = `Sizzle & Serve — ${name}`;
    }
    window.__shotReady = true;
    window.__sceneCount = sceneCount();
    return;
  }

  let screen = SCREEN_TITLE;
  let last = performance.now();
  let accumulator = 0;
  let overAnnounced = false;
  let stuckTime = 0;
  let lastChaseX = 0;
  let lastChaseY = 0;

  function startShift() {
    world.reset();
    screen = SCREEN_PLAY;
    overAnnounced = false;
    stuckTime = 0;
    input.clearClickTarget();
    audio.resume();
  }

  function tick(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;

    if (input.consumePressed('Enter')) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startShift();
    }
    if (input.consumePressed('KeyP') || input.consumePressed('Escape')) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        audio.stopSizzle();
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        audio.resume();
      }
    }
    if (input.consumePressed('KeyM')) audio.toggleMute();

    if (screen === SCREEN_PLAY) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        accumulator -= STEP;
        // Keyboard wins; otherwise walk toward the clicked point, and work
        // the station once the chef arrives.
        let move = input.moveVector();
        let autoInteract = false;
        if (move === null && input.hasClickTarget()) {
          const target = input.clickTarget();
          const player = world.state.player;
          const dx = target.x - player.x;
          const dy = target.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 10) {
            move = { x: dx / dist, y: dy / dist };
            if (Math.hypot(player.x - lastChaseX, player.y - lastChaseY) < 1) {
              stuckTime += STEP;
              if (stuckTime > 0.6) {
                input.clearClickTarget();
                stuckTime = 0;
              }
            } else {
              stuckTime = 0;
            }
            lastChaseX = player.x;
            lastChaseY = player.y;
          } else {
            input.clearClickTarget();
            autoInteract = world.nearestStation() !== null;
          }
        }
        const interact = input.consumePressed('KeyE')
          || input.consumePressed('Space') || autoInteract;
        world.step(STEP, move, interact, audio);
        if (world.state.grillBusy()) audio.startSizzle();
        else audio.stopSizzle();
      }
      if (world.state.over && !overAnnounced) {
        overAnnounced = true;
        screen = SCREEN_OVER;
        audio.stopSizzle();
        audio.gameOver();
        if (world.state.score > best) {
          best = world.state.score;
          saveBest(best);
        }
      }
    }

    const highlight = screen === SCREEN_PLAY ? world.nearestStation() : null;
    renderer.draw(world.state, screen, best, highlight);
    requestAnimationFrame(tick);
  }

  // The title screen shows the kitchen at shift start behind its banner.
  setupScene(world, 'start');
  world.state.time = 0;
  world.state.timeLeft = SHIFT_SECONDS;
  requestAnimationFrame(tick);
}

main();
