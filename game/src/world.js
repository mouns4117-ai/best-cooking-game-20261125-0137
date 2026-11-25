// Sizzle & Serve — the kitchen itself: orders, stations, cooking, scoring.
// The world advances in fixed steps; the renderer only paints what is here,
// and the main loop only feeds it movement and the one interact key.
import {
  CHOPPED,
  INGREDIENTS,
  PLAYER,
  RECIPES,
  SHIFT_SECONDS,
  STATIONS,
  TIMING,
  TOP_BAR,
  VIEW,
  obstacleRects,
} from './config.js';

const INTERACT_RANGE = 78;

const CHOPPED_ITEMS = new Set(Object.values(CHOPPED));

function multisetEquals(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createWorld(random) {
  const obstacles = obstacleRects();
  let orderId = 0;

  function freshState() {
    return {
      time: 0,
      timeLeft: SHIFT_SECONDS,
      score: 0,
      served: 0,
      combo: 0,
      bestCombo: 0,
      hearts: TIMING.maxHearts,
      over: false,
      player: { x: 640, y: 430, dir: 1, moving: false, hands: null },
      orders: [],
      board: { item: null, progress: 0 },
      grill: [
        { item: null, progress: 0, done: false, burnt: false, announced: false },
        { item: null, progress: 0, done: false, burnt: false, announced: false },
      ],
      plate: { contents: [] },
      plateRespawn: 0,
      popups: [],
      particles: [],
      nextOrderIn: TIMING.spawnFirstSeconds,
      shake: 0,
      chopSoundIn: 0,
    };
  }

  const world = {
    state: freshState(),
    random,

    reset() {
      orderId = 0;
      world.state = freshState();
    },

    // The plate on the plating counter, or null while a fresh one is on its way.
    plateOnCounter() {
      return world.state.plate;
    },

    // Is anything sizzling right now (for the grill sound loop)?
    grillBusy() {
      return world.state.grill.some((slot) => slot.item !== null && !slot.burnt);
    },

    spawnOrder(recipeId, patienceOverride) {
      const state = world.state;
      if (state.orders.length >= TIMING.maxOrders) return null;
      const recipe = RECIPES.find((r) => r.id === recipeId)
        ?? random.pick(RECIPES.filter((r) => state.orders.length === 0 || state.orders[state.orders.length - 1].recipe.id !== r.id));
      const progress = clamp(state.time / SHIFT_SECONDS, 0, 1);
      const patience = patienceOverride ?? Math.round(recipe.patience * (1 - 0.3 * progress));
      const order = {
        id: orderId,
        recipe,
        timeLeft: patience,
        patience,
        lastTick: -1,
      };
      orderId += 1;
      state.orders.push(order);
      return order;
    },

    // The station nearest the chef, when one is close enough to work at.
    nearestStation() {
      const { x, y } = world.state.player;
      let best = null;
      let bestDistance = INTERACT_RANGE;
      const consider = (rect, type, extra) => {
        const cx = clamp(x, rect.x, rect.x + rect.w);
        const cy = clamp(y, rect.y, rect.y + rect.h);
        const distance = Math.hypot(x - cx, y - cy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { ...rect, type, ...extra };
        }
      };
      for (const crate of STATIONS.crates) consider(crate, 'crate', { item: crate.item });
      consider(STATIONS.board, 'board');
      consider(STATIONS.grill, 'grill');
      consider(STATIONS.serve, 'serve');
      consider(STATIONS.plating, 'plating');
      consider(STATIONS.trash, 'trash');
      return best;
    },

    addPopup(x, y, text, color) {
      world.state.popups.push({ x, y, text, life: 1.2, color });
    },

    burst(x, y, color, count = 14) {
      for (let i = 0; i < count; i += 1) {
        const angle = random.next() * Math.PI * 2;
        const speed = 60 + random.next() * 160;
        world.state.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          life: 0.6 + random.next() * 0.4,
          color,
          size: 3 + random.next() * 4,
        });
      }
    },

    interact(audio) {
      const state = world.state;
      if (state.over) return;
      const station = world.nearestStation();
      if (station === null) return;
      const hands = state.player.hands;

      if (station.type === 'crate') {
        if (hands !== null) return;
        state.player.hands = { kind: 'item', item: station.item };
        audio.pickup();
        return;
      }

      if (station.type === 'board') {
        if (state.board.item === null && hands !== null && hands.kind === 'item'
          && INGREDIENTS[hands.item]?.chop) {
          state.board.item = hands.item;
          state.board.progress = 0;
          state.player.hands = null;
          audio.place();
          return;
        }
        if (state.board.item !== null && hands === null && CHOPPED_ITEMS.has(state.board.item)) {
          state.player.hands = { kind: 'item', item: state.board.item };
          state.board.item = null;
          state.board.progress = 0;
          audio.pickup();
          return;
        }
        return;
      }

      if (station.type === 'grill') {
        // Holding a raw patty, the chef wants an empty slot; empty-handed,
        // the chef wants the patty that is ready (or burnt) first.
        const slot = hands !== null && hands.kind === 'item' && hands.item === 'patty'
          ? state.grill.find((s) => s.item === null)
          : state.grill.find((s) => s.done && !s.burnt)
            ?? state.grill.find((s) => s.burnt)
            ?? state.grill.find((s) => s.item === null);
        if (slot === undefined) return;
        if (slot.item === null && hands !== null && hands.kind === 'item' && hands.item === 'patty') {
          slot.item = 'patty';
          slot.progress = 0;
          slot.done = false;
          slot.burnt = false;
          slot.announced = false;
          state.player.hands = null;
          audio.place();
          return;
        }
        if (slot.item !== null && hands === null && (slot.done || slot.burnt)) {
          state.player.hands = { kind: 'item', item: slot.burnt ? 'patty-burnt' : 'patty-cooked' };
          slot.item = null;
          slot.progress = 0;
          slot.done = false;
          slot.burnt = false;
          slot.announced = false;
          audio.pickup();
          return;
        }
        return;
      }

      if (station.type === 'plating') {
        if (hands !== null && hands.kind === 'item' && state.plate !== null
          && state.plate.contents.length < 4) {
          state.plate.contents.push(hands.item);
          state.player.hands = null;
          audio.place();
          return;
        }
        if (hands === null && state.plate !== null) {
          state.player.hands = { kind: 'plate', contents: state.plate.contents };
          state.plate = null;
          state.plateRespawn = 2;
          audio.pickup();
          return;
        }
        if (hands !== null && hands.kind === 'plate' && state.plate === null) {
          state.plate = { contents: hands.contents };
          state.player.hands = null;
          audio.place();
          return;
        }
        return;
      }

      if (station.type === 'serve') {
        if (hands === null || hands.kind !== 'plate') return;
        const match = state.orders.find((order) => multisetEquals(order.recipe.needs, hands.contents));
        if (match === undefined) {
          state.shake = 0.35;
          audio.error();
          world.addPopup(state.player.x, state.player.y - 44, 'Wrong dish!', '#ff6b5e');
          state.combo = 0;
          return;
        }
        const multiplier = Math.min(
          TIMING.comboCap,
          1 + TIMING.comboStep * state.combo,
        );
        const points = Math.round(
          (TIMING.serveBase + Math.round(match.timeLeft) * 2) * multiplier,
        );
        state.score += points;
        state.served += 1;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.orders = state.orders.filter((order) => order !== match);
        state.player.hands = null;
        audio.serve();
        world.burst(station.x + station.w / 2, station.y + 40, '#ffd94a', 22);
        world.addPopup(station.x + station.w / 2, station.y + 70, `+${points}`, '#ffd94a');
        return;
      }

      if (station.type === 'trash') {
        if (hands === null) return;
        state.player.hands = null;
        audio.place();
        return;
      }
    },

    step(dt, move, interactPressed, audio) {
      const state = world.state;
      if (state.over) {
        for (const popup of state.popups) popup.life -= dt;
        state.popups = state.popups.filter((p) => p.life > 0);
        for (const particle of state.particles) {
          particle.life -= dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vy += 260 * dt;
        }
        state.particles = state.particles.filter((p) => p.life > 0);
        return;
      }

      state.time += dt;
      state.timeLeft = Math.max(0, SHIFT_SECONDS - state.time);
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);

      // Move the chef, sliding along counters.
      const player = state.player;
      if (move !== null) {
        player.moving = true;
        player.dir = move.x < -0.1 ? -1 : move.x > 0.1 ? 1 : player.dir;
        let nx = player.x + move.x * PLAYER.speed * dt;
        let ny = player.y + move.y * PLAYER.speed * dt;
        nx = clamp(nx, 30, VIEW.width - 30);
        ny = clamp(ny, TOP_BAR + 30, VIEW.height - 30);
        for (const rect of obstacles) {
          const cx = clamp(nx, rect.x, rect.x + rect.w);
          const cy = clamp(ny, rect.y, rect.y + rect.h);
          const dx = nx - cx;
          const dy = ny - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < PLAYER.radius) {
            if (dist === 0) {
              ny = rect.y + rect.h + PLAYER.radius;
            } else {
              nx = cx + (dx / dist) * PLAYER.radius;
              ny = cy + (dy / dist) * PLAYER.radius;
            }
          }
        }
        player.x = clamp(nx, 30, VIEW.width - 30);
        player.y = clamp(ny, TOP_BAR + 30, VIEW.height - 30);
      } else {
        player.moving = false;
      }

      if (interactPressed) world.interact(audio);

      // Chopping finishes on its own once started.
      if (state.board.item !== null && CHOPPED[state.board.item]) {
        state.board.progress += dt;
        state.chopSoundIn -= dt;
        if (state.chopSoundIn <= 0) {
          audio.chop();
          state.chopSoundIn = 0.45;
        }
        if (state.board.progress >= TIMING.chopSeconds) {
          state.board.item = CHOPPED[state.board.item];
          state.board.progress = 0;
          audio.chopDone();
          world.addPopup(STATIONS.board.x + 105, STATIONS.board.y - 8, 'Chopped!', '#9be15d');
        }
      }

      // Patties cook, then burn if forgotten.
      for (const slot of state.grill) {
        if (slot.item === null || slot.burnt) continue;
        slot.progress += dt;
        if (!slot.done && slot.progress >= TIMING.grillCookSeconds) {
          slot.done = true;
          if (!slot.announced) {
            slot.announced = true;
            audio.grillDone();
          }
        }
        if (slot.progress >= TIMING.grillBurnSeconds) {
          slot.burnt = true;
          slot.done = false;
        }
      }

      // A fresh empty plate arrives on the plating counter.
      if (state.plate === null) {
        state.plateRespawn -= dt;
        if (state.plateRespawn <= 0) state.plate = { contents: [] };
      }

      // Orders arrive, tick down, and expire.
      state.nextOrderIn -= dt;
      if (state.nextOrderIn <= 0 && state.orders.length < TIMING.maxOrders) {
        world.spawnOrder();
        const progress = clamp(state.time / SHIFT_SECONDS, 0, 1);
        state.nextOrderIn = TIMING.spawnIntervalStart
          - (TIMING.spawnIntervalStart - TIMING.spawnIntervalEnd) * progress;
      }
      for (const order of [...state.orders]) {
        order.timeLeft -= dt;
        if (order.timeLeft <= 10 && order.timeLeft > 0) {
          const whole = Math.ceil(order.timeLeft);
          if (order.lastTick !== whole) {
            order.lastTick = whole;
            audio.tick();
          }
        }
        if (order.timeLeft <= 0) {
          state.orders = state.orders.filter((o) => o !== order);
          state.hearts -= 1;
          state.combo = 0;
          state.shake = 0.4;
          audio.expire();
          world.addPopup(640, 130, 'Order expired!', '#ff6b5e');
        }
      }

      // Popups and particles fade.
      for (const popup of state.popups) popup.life -= dt;
      state.popups = state.popups.filter((p) => p.life > 0);
      for (const particle of state.particles) {
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 260 * dt;
      }
      state.particles = state.particles.filter((p) => p.life > 0);

      if (state.hearts <= 0 || state.timeLeft <= 0) {
        state.over = true;
        audio.stopSizzle();
      }
    },
  };

  return world;
}
