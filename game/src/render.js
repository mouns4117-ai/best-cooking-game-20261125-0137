// Sizzle & Serve — everything the player sees, painted on one canvas.
// The kitchen is drawn from the world state alone: floor, counters, stations,
// order board, the chef and the food. No images, no fonts from the network.
import { CHOPPED, INGREDIENTS, ITEM_NAMES, PLAYER, RECIPES, STATIONS, TOP_BAR, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const FLOOR_A = '#e9cda0';
const FLOOR_B = '#dfbd85';
const WOOD = '#9c6b3f';
const WOOD_DARK = '#7a4e2c';
const STEEL = '#b9c0c7';
const STEEL_DARK = '#8d949c';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** One food item, drawn centred at (x, y) inside a box of `size`. */
export function drawIngredient(ctx, item, x, y, size) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  if (item === 'tomato') {
    ctx.fillStyle = '#e2483d';
    ellipse(ctx, 0, 2, s * 0.42, s * 0.38);
    ctx.fillStyle = '#3f8f3a';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.28);
    ctx.lineTo(-s * 0.22, -s * 0.05);
    ctx.lineTo(0, -s * 0.14);
    ctx.lineTo(s * 0.22, -s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ellipse(ctx, -s * 0.14, -s * 0.1, s * 0.1, s * 0.06);
  } else if (item === 'tomato-chopped') {
    ctx.fillStyle = '#e2483d';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(i * s * 0.26, 2, s * 0.2, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = '#f0837a';
    ctx.fillRect(-s * 0.4, -2, s * 0.8, s * 0.1);
  } else if (item === 'lettuce') {
    ctx.fillStyle = '#69b455';
    ellipse(ctx, -s * 0.16, 0, s * 0.26, s * 0.3);
    ellipse(ctx, s * 0.16, 0, s * 0.26, s * 0.3);
    ellipse(ctx, 0, -s * 0.08, s * 0.28, s * 0.28);
    ctx.fillStyle = '#8ed07e';
    ellipse(ctx, -s * 0.08, -s * 0.12, s * 0.14, s * 0.12);
  } else if (item === 'lettuce-chopped') {
    ctx.fillStyle = '#69b455';
    for (let i = 0; i < 4; i += 1) {
      const dx = (i - 1.5) * s * 0.2;
      ctx.save();
      ctx.translate(dx, 0);
      ctx.rotate((i - 1.5) * 0.35);
      ctx.fillRect(-s * 0.06, -s * 0.22, s * 0.12, s * 0.44);
      ctx.restore();
    }
  } else if (item === 'cheese') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.28);
    ctx.lineTo(s * 0.42, s * 0.28);
    ctx.lineTo(0, -s * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9a41f';
    ellipse(ctx, -s * 0.12, s * 0.1, s * 0.06, s * 0.05);
    ellipse(ctx, s * 0.14, -s * 0.02, s * 0.05, s * 0.04);
  } else if (item === 'bun') {
    ctx.fillStyle = '#e0a458';
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.4, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-s * 0.4, s * 0.08, s * 0.8, s * 0.2);
    ctx.fillStyle = '#fff3d6';
    ellipse(ctx, -s * 0.16, -s * 0.14, s * 0.05, s * 0.03);
    ellipse(ctx, s * 0.1, -s * 0.2, s * 0.05, s * 0.03);
    ellipse(ctx, s * 0.2, -s * 0.08, s * 0.04, s * 0.03);
  } else if (item === 'patty') {
    ctx.fillStyle = '#a05a38';
    roundRect(ctx, -s * 0.42, -s * 0.2, s * 0.84, s * 0.4, s * 0.16);
    ctx.fill();
    ctx.fillStyle = '#c07a52';
    ellipse(ctx, -s * 0.14, -s * 0.06, s * 0.1, s * 0.05);
  } else if (item === 'patty-cooked') {
    ctx.fillStyle = '#6e3b1f';
    roundRect(ctx, -s * 0.42, -s * 0.2, s * 0.84, s * 0.4, s * 0.16);
    ctx.fill();
    ctx.strokeStyle = '#4a2412';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.18);
    ctx.lineTo(-s * 0.2, s * 0.18);
    ctx.moveTo(0, -s * 0.18);
    ctx.lineTo(0, s * 0.18);
    ctx.moveTo(s * 0.2, -s * 0.18);
    ctx.lineTo(s * 0.2, s * 0.18);
    ctx.stroke();
  } else if (item === 'patty-burnt') {
    ctx.fillStyle = '#1d1a18';
    roundRect(ctx, -s * 0.42, -s * 0.2, s * 0.84, s * 0.4, s * 0.16);
    ctx.fill();
    ctx.fillStyle = '#3a3230';
    ellipse(ctx, -s * 0.12, -s * 0.04, s * 0.1, s * 0.06);
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, size, contents) {
  ctx.fillStyle = '#f4f6f8';
  ellipse(ctx, x, y, size * 0.55, size * 0.42);
  ctx.fillStyle = '#d5dae0';
  ellipse(ctx, x, y, size * 0.38, size * 0.28);
  if (contents.length > 0) {
    const top = contents[contents.length - 1];
    drawIngredient(ctx, top, x, y - size * 0.06, size * 0.62);
  }
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.fillStyle = filled ? '#ff5d73' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size * 0.55, y - size * 0.1, x - size * 0.28, y - size * 0.5, x, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.28, y - size * 0.5, x + size * 0.55, y - size * 0.1, x, y + size * 0.35);
  ctx.fill();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawFloor() {
    ctx.fillStyle = FLOOR_A;
    ctx.fillRect(0, TOP_BAR, VIEW.width, VIEW.height - TOP_BAR);
    ctx.fillStyle = FLOOR_B;
    const tile = 64;
    for (let y = TOP_BAR; y < VIEW.height; y += tile) {
      for (let x = 0; x < VIEW.width; x += tile) {
        if (((x / tile) + (y / tile)) % 2 === 0) {
          ctx.fillRect(x, y, tile, tile);
        }
      }
    }
    ctx.strokeStyle = 'rgba(120, 85, 40, 0.18)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= VIEW.width; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, TOP_BAR);
      ctx.lineTo(x, VIEW.height);
      ctx.stroke();
    }
    for (let y = TOP_BAR; y <= VIEW.height; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEW.width, y);
      ctx.stroke();
    }
  }

  function drawCounter(x, y, w, h, top, side, label) {
    ctx.fillStyle = side;
    ctx.fillRect(x, y + 8, w, h - 8);
    ctx.fillStyle = top;
    roundRect(ctx, x, y, w, 18, 6);
    ctx.fill();
    if (label) text(ctx, label, x + w / 2, y + h / 2 + 12, 15, 'rgba(255,255,255,0.85)', '700', 'center');
  }

  function drawStationHighlight(rect) {
    if (rect === null) return;
    ctx.save();
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 6]);
    roundRect(ctx, rect.x - 6, rect.y - 6, rect.w + 12, rect.h + 12, 10);
    ctx.stroke();
    ctx.restore();
  }

  function drawTickets(state) {
    const ticketW = 250;
    const gap = 12;
    const startX = 196;
    state.orders.forEach((order, index) => {
      const x = startX + index * (ticketW + gap);
      const y = 6;
      const urgent = order.timeLeft <= 10;
      ctx.fillStyle = '#fdf6e3';
      roundRect(ctx, x, y, ticketW, 64, 8);
      ctx.fill();
      ctx.fillStyle = order.recipe.color;
      ctx.fillRect(x, y, 8, 64);
      text(ctx, order.recipe.name, x + 18, y + 16, 15, '#2e2a26');
      order.recipe.needs.forEach((item, i) => {
        drawIngredient(ctx, item, x + 30 + i * 34, y + 40, 26);
      });
      const ratio = Math.max(0, order.timeLeft / order.patience);
      ctx.fillStyle = '#e5ddd0';
      roundRect(ctx, x + 150, y + 34, 88, 10, 5);
      ctx.fill();
      ctx.fillStyle = urgent ? '#e2483d' : ratio > 0.5 ? '#5da24a' : '#e8a13a';
      if (ratio > 0) {
        roundRect(ctx, x + 150, y + 34, 88 * ratio, 10, 5);
        ctx.fill();
      }
      text(ctx, `${Math.ceil(order.timeLeft)}s`, x + 194, y + 52, 12, '#6b5d4f', '700', 'center');
      if (urgent && Math.floor(state.time * 4) % 2 === 0) {
        ctx.strokeStyle = '#e2483d';
        ctx.lineWidth = 3;
        roundRect(ctx, x, y, ticketW, 64, 8);
        ctx.stroke();
      }
    });
    if (state.orders.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      roundRect(ctx, startX, 6, ticketW, 64, 8);
      ctx.fill();
      text(ctx, 'No orders yet — get ready!', startX + ticketW / 2, 38, 14, '#fdf6e3', '600', 'center');
    }
  }

  function drawHud(state, best) {
    ctx.fillStyle = '#2e2a26';
    ctx.fillRect(0, 0, VIEW.width, TOP_BAR);
    text(ctx, 'SCORE', 16, 16, 11, '#c9b8a3', '700');
    text(ctx, String(state.score), 16, 42, 26, '#ffd94a');
    if (state.combo >= 2) {
      text(ctx, `COMBO x${(1 + 0.25 * Math.min(state.combo, 8)).toFixed(2).replace(/\.?0+$/, '')}`, 16, 64, 13, '#ff9d5c');
    }
    drawTickets(state);
    text(ctx, formatTime(state.timeLeft), 1170, 30, 30, state.timeLeft <= 30 ? '#ff6b5e' : '#fdf6e3', '800', 'center');
    for (let i = 0; i < 3; i += 1) {
      drawHeart(ctx, 1110 + i * 30, 58, 22, i < state.hearts);
    }
    text(ctx, `BEST ${best}`, 1050, 16, 11, '#c9b8a3', '700', 'center');
  }

  function drawCrates(state, highlight) {
    for (const crate of STATIONS.crates) {
      drawCounter(crate.x, crate.y, crate.w, crate.h, '#a9713f', '#6e4525');
      drawIngredient(ctx, crate.item, crate.x + 34, crate.y + 36, 40);
      text(ctx, INGREDIENTS[crate.item].name, crate.x + 62, crate.y + 30, 15, '#fdf6e3');
      text(ctx, INGREDIENTS[crate.item].chop ? 'chop it' : INGREDIENTS[crate.item].grill ? 'grill it' : 'ready', crate.x + 62, crate.y + 52, 12, '#e8d9b8');
      if (highlight !== null && highlight.id === crate.id) drawStationHighlight(crate);
    }
  }

  function drawBoard(state, highlight) {
    const board = STATIONS.board;
    drawCounter(board.x, board.y, board.w, board.h, '#d9b98a', '#8a6a45', '');
    text(ctx, 'CHOPPING BOARD', board.x + board.w / 2, board.y + 16, 12, '#5d4126', '800', 'center');
    if (state.board.item !== null) {
      drawIngredient(ctx, state.board.item, board.x + 70, board.y + 55, 44);
      if (state.board.progress > 0) {
        ctx.fillStyle = '#e5ddd0';
        roundRect(ctx, board.x + 110, board.y + 48, 80, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#5da24a';
        roundRect(ctx, board.x + 110, board.y + 48, 80 * (state.board.progress / 1.6), 12, 6);
        ctx.fill();
      } else if (Object.values(CHOPPED).includes(state.board.item)) {
        text(ctx, 'ready — take it!', board.x + 150, board.y + 54, 13, '#2f6b23', '700', 'center');
      } else {
        text(ctx, 'chopping…', board.x + 150, board.y + 54, 13, '#5d4126', '600', 'center');
      }
    } else {
      ctx.fillStyle = 'rgba(93,65,38,0.5)';
      ctx.beginPath();
      ctx.arc(board.x + 105, board.y + 55, 26, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, 'drop tomato / lettuce', board.x + 105, board.y + 55, 11, '#fdf6e3', '600', 'center');
    }
    if (highlight !== null && highlight.id === board.id) drawStationHighlight(board);
  }

  function drawGrill(state, highlight) {
    const grill = STATIONS.grill;
    ctx.fillStyle = '#2b2b30';
    roundRect(ctx, grill.x, grill.y, grill.w, grill.h, 10);
    ctx.fill();
    text(ctx, 'GRILL', grill.x + grill.w / 2, grill.y + 16, 12, '#c9c2b8', '800', 'center');
    state.grill.forEach((slot, i) => {
      const sx = grill.x + 24 + i * 108;
      const sy = grill.y + 30;
      ctx.fillStyle = slot.item !== null && slot.burnt ? '#1d1a18' : '#45454c';
      roundRect(ctx, sx, sy, 88, 44, 8);
      ctx.fill();
      if (slot.item !== null) {
        drawIngredient(ctx, slot.burnt ? 'patty-burnt' : slot.done ? 'patty-cooked' : 'patty', sx + 44, sy + 22, 40);
        if (!slot.done && !slot.burnt) {
          ctx.fillStyle = '#e5ddd0';
          roundRect(ctx, sx, sy + 50, 88, 8, 4);
          ctx.fill();
          ctx.fillStyle = '#e8873a';
          roundRect(ctx, sx, sy + 50, 88 * Math.min(1, slot.progress / 5), 8, 4);
          ctx.fill();
        } else if (slot.burnt) {
          text(ctx, 'BURNT!', sx + 44, sy + 62, 12, '#ff6b5e', '800', 'center');
        }
      } else {
        text(ctx, 'patty here', sx + 44, sy + 22, 11, '#8d8680', '600', 'center');
      }
    });
    if (highlight !== null && highlight.id === grill.id) drawStationHighlight(grill);
  }

  function drawSink(highlight) {
    const sink = STATIONS.sink;
    drawCounter(sink.x, sink.y, sink.w, sink.h, STEEL, STEEL_DARK, '');
    ctx.fillStyle = '#7e8894';
    roundRect(ctx, sink.x + 30, sink.y + 30, 140, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#aeb9c4';
    roundRect(ctx, sink.x + 40, sink.y + 36, 120, 28, 6);
    ctx.fill();
    text(ctx, 'SINK', sink.x + sink.w / 2, sink.y + 16, 12, '#4a545e', '800', 'center');
    if (highlight !== null && highlight.id === sink.id) drawStationHighlight(sink);
  }

  function drawServe(state, highlight) {
    const serve = STATIONS.serve;
    ctx.fillStyle = '#f3e2c7';
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 10);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    for (let i = 0; i < 4; i += 1) {
      ctx.fillRect(serve.x + i * 49, serve.y, 24, 26);
    }
    text(ctx, 'SERVE', serve.x + serve.w / 2, serve.y + 48, 18, '#2e2a26', '800', 'center');
    text(ctx, 'bring the plate', serve.x + serve.w / 2, serve.y + 72, 13, '#6b5d4f', '600', 'center');
    ctx.fillStyle = '#8a6a45';
    ctx.fillRect(serve.x + 14, serve.y + 96, serve.w - 28, 10);
    ctx.fillStyle = '#ffd94a';
    ellipse(ctx, serve.x + serve.w / 2, serve.y + 140, 26, 18);
    ctx.fillStyle = '#2e2a26';
    ctx.fillRect(serve.x + serve.w / 2 - 3, serve.y + 122, 6, 12);
    text(ctx, 'ding the bell!', serve.x + serve.w / 2, serve.y + 178, 12, '#6b5d4f', '600', 'center');
    if (highlight !== null && highlight.id === serve.id) drawStationHighlight(serve);
  }

  function drawPlating(state, highlight) {
    const plating = STATIONS.plating;
    drawCounter(plating.x, plating.y, plating.w, plating.h, STEEL, STEEL_DARK, '');
    text(ctx, 'PLATING', plating.x + 60, plating.y + 16, 12, '#4a545e', '800', 'center');
    if (state.plate !== null) {
      drawPlate(ctx, plating.x + 150, plating.y + 52, 64, state.plate.contents);
      if (state.plate.contents.length > 0) {
        text(ctx, state.plate.contents.map((item) => ITEM_NAMES[item]).join(' + '), plating.x + 150, plating.y + 82, 11, '#2e2a26', '600', 'center');
      } else {
        text(ctx, 'empty plate — add food', plating.x + 150, plating.y + 82, 11, '#4a545e', '600', 'center');
      }
    } else {
      text(ctx, 'fresh plate on its way…', plating.x + 150, plating.y + 52, 12, '#4a545e', '600', 'center');
    }
    if (highlight !== null && highlight.id === plating.id) drawStationHighlight(plating);
  }

  function drawTrash(highlight) {
    const trash = STATIONS.trash;
    ctx.fillStyle = '#5a6068';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 10);
    ctx.fill();
    ctx.fillStyle = '#3c4148';
    ctx.fillRect(trash.x + 10, trash.y + 10, trash.w - 20, 12);
    text(ctx, 'TRASH', trash.x + trash.w / 2, trash.y + 52, 13, '#dfe3e8', '800', 'center');
    text(ctx, 'toss it', trash.x + trash.w / 2, trash.y + 72, 11, '#aeb9c4', '600', 'center');
    if (highlight !== null && highlight.id === trash.id) drawStationHighlight(trash);
  }

  function drawChef(state) {
    const player = state.player;
    const bob = player.moving ? Math.sin(state.time * 14) * 2 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ellipse(ctx, player.x, player.y + 20, 24, 8);
    // Body and apron.
    ctx.fillStyle = '#f4f6f8';
    roundRect(ctx, player.x - 20, player.y - 12 + bob, 40, 32, 12);
    ctx.fill();
    ctx.fillStyle = '#3f6fb5';
    ctx.fillRect(player.x - 20, player.y + 6 + bob, 40, 6);
    // Head and toque.
    ctx.fillStyle = '#f2c89b';
    ellipse(ctx, player.x, player.y - 22 + bob, 14, 13);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, player.x - 15, player.y - 44 + bob, 30, 14, 7);
    ctx.fill();
    ellipse(ctx, player.x - 9, player.y - 44 + bob, 8, 7);
    ellipse(ctx, player.x + 9, player.y - 44 + bob, 8, 7);
    // Eyes look where the chef walks.
    ctx.fillStyle = '#2e2a26';
    ellipse(ctx, player.x - 5 + player.dir * 3, player.y - 22 + bob, 2, 3);
    ellipse(ctx, player.x + 5 + player.dir * 3, player.y - 22 + bob, 2, 3);
    // Carried food floats above the toque.
    const hands = player.hands;
    if (hands !== null) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ellipse(ctx, player.x, player.y - 62 + bob, 26, 20);
      if (hands.kind === 'plate') {
        drawPlate(ctx, player.x, player.y - 62 + bob, 36, hands.contents);
      } else {
        drawIngredient(ctx, hands.item, player.x, player.y - 62 + bob, 30);
      }
    }
  }

  function drawPopups(state) {
    for (const popup of state.popups) {
      ctx.globalAlpha = Math.min(1, popup.life);
      text(ctx, popup.text, popup.x, popup.y - (1.2 - popup.life) * 30, 20, popup.color, '800', 'center');
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles(state) {
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      ctx.globalAlpha = 1;
    }
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.45)';
    ctx.fillRect(0, TOP_BAR, VIEW.width, VIEW.height - TOP_BAR);
    ctx.fillStyle = '#2e2a26';
    roundRect(ctx, 340, 250, 600, 210, 16);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(340, 250, 600, 10);
    text(ctx, 'SIZZLE & SERVE', 640, 300, 44, '#ffd94a', '800', 'center');
    text(ctx, 'a rush-hour kitchen game', 640, 340, 18, '#fdf6e3', '600', 'center');
    text(ctx, 'WASD / arrows — move      E — pick up & place      Click — walk & work', 640, 380, 15, '#c9b8a3', '600', 'center');
    text(ctx, 'Chop, grill, plate and serve before the tickets run out!', 640, 408, 15, '#c9b8a3', '600', 'center');
    text(ctx, 'PRESS ENTER TO START', 640, 440, 16, '#9be15d', '800', 'center');
    if (best > 0) text(ctx, `Best shift: ${best}`, 640, 478, 13, '#c9b8a3', '600', 'center');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.55)';
    ctx.fillRect(0, TOP_BAR, VIEW.width, VIEW.height - TOP_BAR);
    text(ctx, 'PAUSED', 640, 340, 44, '#fdf6e3', '800', 'center');
    text(ctx, 'Press P to keep cooking', 640, 390, 17, '#c9b8a3', '600', 'center');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.6)';
    ctx.fillRect(0, TOP_BAR, VIEW.width, VIEW.height - TOP_BAR);
    ctx.fillStyle = '#2e2a26';
    roundRect(ctx, 390, 210, 500, 280, 16);
    ctx.fill();
    text(ctx, state.hearts <= 0 ? 'SHIFT CUT SHORT!' : 'SHIFT OVER!', 640, 260, 34, '#ffd94a', '800', 'center');
    text(ctx, `Score  ${state.score}`, 640, 310, 24, '#fdf6e3', '700', 'center');
    text(ctx, `Dishes served  ${state.served}      Best combo  x${state.bestCombo}`, 640, 350, 16, '#c9b8a3', '600', 'center');
    text(ctx, `Best shift  ${Math.max(best, state.score)}`, 640, 380, 16, '#c9b8a3', '600', 'center');
    text(ctx, 'PRESS ENTER TO COOK AGAIN', 640, 440, 16, '#9be15d', '800', 'center');
  }

  return {
    draw(state, screen, best, highlight) {
      ctx.save();
      if (state.shake > 0) {
        const magnitude = state.shake * 14;
        ctx.translate((Math.random() - 0.5) * magnitude, (Math.random() - 0.5) * magnitude);
      }
      drawFloor();
      drawCrates(state, highlight);
      drawBoard(state, highlight);
      drawGrill(state, highlight);
      drawSink(highlight);
      drawServe(state, highlight);
      drawPlating(state, highlight);
      drawTrash(highlight);
      drawChef(state);
      drawParticles(state);
      drawPopups(state);
      drawHud(state, best);
      if (screen === SCREEN_TITLE) drawTitle(state, best);
      if (screen === SCREEN_PAUSED) drawPaused();
      if (screen === SCREEN_OVER) drawOver(state, best);
      ctx.restore();
      if (screen === SCREEN_PLAY) {
        text(ctx, 'E: pick up / place    P: pause    M: mute', 14, VIEW.height - 12, 12, 'rgba(46,42,38,0.55)', '600');
      }
    },
  };
}
