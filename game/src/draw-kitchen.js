// Sizzle & Serve — drawing the kitchen: walls, counters, stations, HUD, screens.
// Layout constants live here and are shared with input.js for hit-testing.

import { CANVAS_HEIGHT, CANVAS_WIDTH, INGREDIENTS, RECIPES, SHIFT_SECONDS, starsForScore } from './config.js';
import { drawIngredient, drawOrderTicket, drawPlate, drawRecipeCard, roundRect } from './draw-food.js';
import { matchingOrder, plateMatchesAnyOrder } from './state.js';

export const LAYOUT = {
  soundBtn: { x: 1146, y: 12, w: 52, h: 40 },
  pauseBtn: { x: 1206, y: 12, w: 52, h: 40 },
  orderBoard: { x: 24, y: 80, w: 400, h: 244 },
  ticket: (i) => ({ x: 36, y: 122 + i * 68, w: 376, h: 62 }),
  board: { x: 448, y: 80, w: 252, h: 130 },
  boardSlot: { x: 468, y: 104, w: 212, h: 92 },
  grill: { x: 724, y: 80, w: 286, h: 130 },
  grillSlot: (i) => ({ x: 746 + i * 128, y: 104, w: 104, h: 92 }),
  recipeBoard: { x: 1034, y: 80, w: 222, h: 244 },
  ingredientBin: (i) => ({ x: 24 + i * 152, y: 356, w: 146, h: 110 }),
  trash: { x: 24, y: 486, w: 140, h: 164 },
  plateCenter: { x: 450, y: 566 },
  serveBtn: { x: 600, y: 522, w: 164, h: 62 },
  statsPanel: { x: 820, y: 486, w: 436, h: 164 },
  startBtn: { x: 490, y: 472, w: 300, h: 64 },
  againBtn: { x: 490, y: 524, w: 300, h: 64 },
};

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawWallAndFloor(ctx) {
  // Warm cream wall with a tile stripe, wooden floor below.
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 470);
  ctx.fillStyle = '#e9d3a7';
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    ctx.fillRect(x, 300, 2, 24);
  }
  ctx.fillStyle = '#d9b98a';
  ctx.fillRect(0, 322, CANVAS_WIDTH, 4);
  // Floor planks.
  ctx.fillStyle = '#a9743f';
  ctx.fillRect(0, 470, CANVAS_WIDTH, CANVAS_HEIGHT - 470);
  ctx.fillStyle = '#96622f';
  for (let y = 500; y < CANVAS_HEIGHT; y += 56) ctx.fillRect(0, y, CANVAS_WIDTH, 3);
  for (let x = 0; x < CANVAS_WIDTH; x += 160) {
    ctx.fillRect(x, 470, 2, CANVAS_HEIGHT - 470);
  }
  // A framed specials poster and a shelf of jars fill the wall between the
  // stations and the ingredient counter.
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, 560, 216, 120, 84, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 568, 224, 104, 68, 6);
  ctx.fill();
  ctx.fillStyle = '#b7791f';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("TODAY'S", 620, 244);
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('SPECIALS', 620, 262);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('fresh · fast · tasty', 620, 280);
  // Shelf with jars under the grill.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(740, 262, 260, 10);
  const jars = [
    [762, '#e74c3c', 'tomatoes'],
    [842, '#58b368', 'pickles'],
    [922, '#f2a93b', 'honey'],
  ];
  for (const [jx, color, label] of jars) {
    ctx.fillStyle = color;
    roundRect(ctx, jx, 216, 56, 46, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(jx + 8, 222, 10, 34);
    ctx.fillStyle = '#5d4037';
    roundRect(ctx, jx - 2, 208, 60, 10, 4);
    ctx.fill();
    ctx.fillStyle = '#5d5346';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, jx + 28, 290);
  }
}

function drawHud(ctx, state, sounds) {
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 64);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍳 SIZZLE & SERVE', 24, 30);
  ctx.fillStyle = '#c9a06a';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Bistro Rush — cook the orders, serve them hot!', 24, 52);
  // Shift timer, centre.
  const low = state.shiftLeft <= 30 && state.screen === 'playing';
  ctx.fillStyle = low ? '#ff6b6b' : '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⏱ ${formatTime(state.shiftLeft)}`, 640, 28);
  ctx.fillStyle = '#4a3524';
  roundRect(ctx, 540, 50, 200, 8, 4);
  ctx.fill();
  ctx.fillStyle = low ? '#ff6b6b' : '#58b368';
  roundRect(ctx, 540, 50, 200 * (state.shiftLeft / SHIFT_SECONDS), 8, 4);
  ctx.fill();
  // Score and combo, right.
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`$${state.score}`, 1010, 30);
  ctx.fillStyle = state.combo >= 2 ? '#ff9f43' : '#9b8b74';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(state.combo >= 2 ? `🔥 COMBO x${state.combo}` : 'no combo yet', 1010, 52);
  // Sound and pause buttons.
  for (const [rect, label] of [
    [LAYOUT.soundBtn, sounds.muted ? '🔇' : '🔊'],
    [LAYOUT.pauseBtn, state.screen === 'paused' ? '▶' : '⏸'],
  ]) {
    ctx.fillStyle = '#4a3524';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }
}

function drawOrderBoard(ctx, state) {
  const b = LAYOUT.orderBoard;
  ctx.fillStyle = '#6b4423';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#7d5230';
  roundRect(ctx, b.x + 6, b.y + 6, b.w - 12, b.h - 12, 9);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📋 ORDER BOARD', b.x + 16, b.y + 22);
  ctx.fillStyle = '#e8c98f';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${state.orders.length}/3 tickets`, b.x + b.w - 14, b.y + 22);
  const match = matchingOrder(state);
  state.orders.forEach((order, i) => {
    drawOrderTicket(ctx, LAYOUT.ticket(i).x, LAYOUT.ticket(i).y, LAYOUT.ticket(i).w, LAYOUT.ticket(i).h, order, match && match.id === order.id);
  });
  if (state.orders.length === 0) {
    ctx.fillStyle = '#e8c98f';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No orders right now — breathe!', b.x + b.w / 2, b.y + 140);
  }
}

function progressRing(ctx, cx, cy, r, ratio, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, ratio));
  ctx.stroke();
}

function drawChoppingBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#5d4037';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔪 CHOPPING BOARD', b.x + 14, b.y + 18);
  // Wooden board.
  ctx.fillStyle = '#c89b62';
  roundRect(ctx, b.x + 20, b.y + 34, b.w - 40, b.h - 48, 8);
  ctx.fill();
  ctx.fillStyle = '#b98a52';
  roundRect(ctx, b.x + 20, b.y + 34, b.w - 40, 10, 8);
  ctx.fill();
  if (state.board) {
    drawIngredient(ctx, state.board.id, b.x + b.w / 2 - 20, b.y + 82, 56);
    progressRing(ctx, b.x + b.w / 2 - 20, b.y + 82, 40, state.board.progress, '#58b368');
    // Little knife.
    ctx.save();
    ctx.translate(b.x + b.w - 52, b.y + 78);
    ctx.rotate(0.5);
    ctx.fillStyle = '#cfd8dc';
    roundRect(ctx, 0, -6, 44, 12, 4);
    ctx.fill();
    ctx.fillStyle = '#4a3524';
    roundRect(ctx, -22, -5, 22, 10, 4);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#8a6a42';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('click a 🔪 ingredient', b.x + b.w / 2, b.y + 82);
  }
}

function drawGrill(ctx, state) {
  const b = LAYOUT.grill;
  ctx.fillStyle = '#37474f';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔥 GRILL', b.x + 14, b.y + 18);
  state.grill.forEach((slot, i) => {
    const s = LAYOUT.grillSlot(i);
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    // Grate.
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 2;
    for (let g = -2; g <= 2; g += 1) {
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy + g * 14);
      ctx.lineTo(cx + 38, cy + g * 14);
      ctx.stroke();
    }
    if (slot) {
      if (slot.state === 'burnt') {
        // Charred lump with smoke.
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURNT!', cx, cy - 34);
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('click to trash', cx, cy + 36);
      } else {
        // Flames while cooking.
        ctx.fillStyle = slot.state === 'done' ? '#ffd94d' : '#ff7043';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy + 18);
        ctx.quadraticCurveTo(cx - 30, cy - 6, cx - 8, cy - 2);
        ctx.quadraticCurveTo(cx - 4, cy - 22, cx + 6, cy - 8);
        ctx.quadraticCurveTo(cx + 18, cy - 18, cx + 22, cy + 4);
        ctx.quadraticCurveTo(cx + 28, cy + 16, cx + 26, cy + 18);
        ctx.closePath();
        ctx.fill();
        drawIngredient(ctx, slot.id, cx, cy - 4, 58);
        progressRing(ctx, cx, cy - 4, 38, slot.progress, slot.state === 'done' ? '#ffd94d' : '#ff7043');
        if (slot.state === 'done') {
          ctx.fillStyle = '#ffd94d';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DONE!', cx, cy + 38);
        }
      }
    } else {
      ctx.fillStyle = '#78909c';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty', cx, cy + 4);
    }
  });
}

function drawRecipeBoard(ctx) {
  const b = LAYOUT.recipeBoard;
  ctx.fillStyle = '#263238';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#eceff1';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📖 RECIPES', b.x + 14, b.y + 20);
  RECIPES.forEach((recipe, i) => {
    drawRecipeCard(ctx, b.x + 10, b.y + 36 + i * 40, b.w - 20, recipe, i);
  });
}

function drawIngredientBins(ctx, state) {
  ctx.fillStyle = '#5d4037';
  roundRect(ctx, 16, 328, 1248, 146, 12);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧺 INGREDIENTS — click one, it goes to the board, grill or plate', 28, 344);
  Object.entries(INGREDIENTS).forEach(([id, def], i) => {
    const bin = LAYOUT.ingredientBin(i);
    const busy = (def.prep === 'chop' && state.board) || (def.prep === 'grill' && state.grill.every(Boolean));
    ctx.fillStyle = busy ? '#d7ccc8' : '#fff8e6';
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.fill();
    ctx.strokeStyle = busy ? '#bcaaa4' : '#d8c9a3';
    ctx.lineWidth = 1.5;
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.stroke();
    drawIngredient(ctx, id, bin.x + bin.w / 2, bin.y + 40, 58);
    ctx.fillStyle = '#33302a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(def.name, bin.x + bin.w / 2, bin.y + 80);
    ctx.fillStyle = '#8a7d63';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(def.prep === 'chop' ? '🔪 chop' : def.prep === 'grill' ? '🔥 grill' : '✓ ready', bin.x + bin.w / 2, bin.y + 98);
    // Keyboard shortcut keycap.
    ctx.fillStyle = '#eceff1';
    roundRect(ctx, bin.x + 6, bin.y + 6, 20, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#455a64';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(def.key, bin.x + 16, bin.y + 17);
  });
}

function drawServingCounter(ctx, state) {
  // Trash bin.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#546e7a';
  roundRect(ctx, t.x + 18, t.y + 26, 104, 110, 10);
  ctx.fill();
  ctx.fillStyle = '#455a64';
  roundRect(ctx, t.x + 10, t.y + 18, 120, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#eceff1';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🗑 TRASH', t.x + t.w / 2, t.y + 84);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('click to clear plate', t.x + t.w / 2, t.y + 106);

  // Serving counter surface.
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, 180, 486, 620, 164, 12);
  ctx.fill();
  ctx.fillStyle = '#a9743f';
  roundRect(ctx, 188, 494, 604, 148, 9);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🍽 YOUR PLATE', 204, 516);
  const ready = plateMatchesAnyOrder(state);
  const pulse = state.screen === 'playing' && ready ? 0.5 + 0.5 * Math.sin(Date.now() / 180) : 0;
  if (ready) {
    ctx.save();
    ctx.shadowColor = '#ffd94d';
    ctx.shadowBlur = 24 + pulse * 20;
    ctx.strokeStyle = `rgba(255,217,77,${0.5 + pulse * 0.5})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(LAYOUT.plateCenter.x, LAYOUT.plateCenter.y, 132, 44, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  drawPlate(ctx, LAYOUT.plateCenter.x, LAYOUT.plateCenter.y, state.plate, ready);
  if (state.plate.length === 0) {
    ctx.fillStyle = '#8a7d63';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('empty plate — add ingredients!', LAYOUT.plateCenter.x, LAYOUT.plateCenter.y + 52);
  }
  // Serve button.
  const s = LAYOUT.serveBtn;
  ctx.fillStyle = ready ? '#f2a93b' : '#bcaaa4';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.strokeStyle = ready ? '#ffd94d' : '#8d6e63';
  ctx.lineWidth = ready ? 3 : 1.5;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SERVE! 🍽', s.x + s.w / 2, s.y + s.h / 2 - 8);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(ready ? 'matches a ticket!' : 'or press Space', s.x + s.w / 2, s.y + s.h / 2 + 16);
  // What the plate still needs, as a hint.
  if (state.plate.length > 0 && !ready) {
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('does not match any ticket yet', 490, 640);
  }
}

function drawStatsPanel(ctx, state) {
  const p = LAYOUT.statsPanel;
  ctx.fillStyle = '#263238';
  roundRect(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  ctx.fillStyle = '#eceff1';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📊 SHIFT STATS', p.x + 16, p.y + 22);
  const rows = [
    ['Dishes served', `${state.served}`],
    ['Orders lost', `${state.lost}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Coins earned', `$${state.coins}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = p.y + 56 + i * 26;
    ctx.fillStyle = '#b0bec5';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, p.x + 16, y);
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, p.x + 200, y);
  });
  // Little chef mascot.
  const cx = p.x + 330;
  const cy = p.y + 72;
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(cx, cy + 18, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 18, cy - 8, 16, 0, Math.PI * 2);
  ctx.arc(cx, cy - 16, 18, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy - 8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#33302a';
  ctx.beginPath();
  ctx.arc(cx - 12, cy + 14, 4, 0, Math.PI * 2);
  ctx.arc(cx + 12, cy + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#33302a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + 22, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#eceff1';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Chef Momo says:', cx, cy + 62);
  ctx.fillStyle = '#b0bec5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(state.combo >= 3 ? 'On fire! Keep it up!' : 'Serve fast, tip big!', cx, cy + 78);
}

function drawPopupsAndToast(ctx, state) {
  for (const popup of state.popups) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, popup.life);
    ctx.fillStyle = popup.color;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    const y = popup.y - (1.4 - popup.life) * 40;
    ctx.strokeText(popup.text, popup.x, y);
    ctx.fillText(popup.text, popup.x, y);
    ctx.restore();
  }
  if (state.toast) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.toast.life);
    ctx.fillStyle = 'rgba(46,33,24,0.92)';
    const w = ctx.measureText(state.toast.text).width + 48;
    roundRect(ctx, 640 - w / 2, 256, w, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.toast.text, 640, 275);
    ctx.restore();
  }
  if (state.screen === 'playing' && state.shiftLeft <= 30) {
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 200);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ RUSH HOUR — orders are pouring in! ⚠', 640, 316);
    ctx.restore();
  }
}

function drawHintBar(ctx) {
  ctx.fillStyle = 'rgba(46,33,24,0.85)';
  ctx.fillRect(0, 664, CANVAS_WIDTH, 56);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'Keys 1–8 pick ingredients  •  Space serves the plate  •  T clears the plate  •  P pauses  •  M mutes',
    640,
    692,
  );
}

function drawTitleScreen(ctx, state) {
  ctx.fillStyle = 'rgba(30,20,12,0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 290, 110, 700, 470, 18);
  ctx.fill();
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 4;
  roundRect(ctx, 290, 110, 700, 470, 18);
  ctx.stroke();
  ctx.fillStyle = '#b7791f';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍳 SIZZLE & SERVE', 640, 190);
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('Bistro Rush — a one-chef cooking game', 640, 232);
  ctx.fillStyle = '#5d5346';
  ctx.font = '17px system-ui, sans-serif';
  const lines = [
    'Guests order from the board — each ticket lists what the dish needs.',
    'Click ingredients: choppables go to the board, grillables to the grill,',
    'the rest straight onto your plate. Match a ticket exactly, then SERVE!',
    'Serve fast for bigger tips. Don’t let a ticket’s patience run out,',
    'and never leave food on the grill — it burns!',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 272 + i * 26));
  const b = LAYOUT.startBtn;
  ctx.fillStyle = '#f2a93b';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3;
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('▶  START SHIFT', b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.fillStyle = '#8a7d63';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('150-second shift • 5 recipes • how many dishes can you serve?', 640, 560);
}

function drawPausedOverlay(ctx) {
  ctx.fillStyle = 'rgba(30,20,12,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⏸ PAUSED', 640, 330);
  ctx.fillStyle = '#5d5346';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Press P or click the pause button to keep cooking.', 640, 372);
}

function drawEndScreen(ctx, state) {
  ctx.fillStyle = 'rgba(30,20,12,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 340, 96, 600, 500, 18);
  ctx.fill();
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 4;
  roundRect(ctx, 340, 96, 600, 500, 18);
  ctx.stroke();
  ctx.fillStyle = '#b7791f';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 SHIFT COMPLETE!', 640, 160);
  const stars = starsForScore(state.score);
  ctx.font = '44px system-ui, sans-serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 220);
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(
    stars === 3 ? 'Three stars — a legendary shift!' : stars === 2 ? 'Two stars — the guests loved it!' : stars === 1 ? 'One star — a solid shift!' : 'No stars yet — the kitchen beat you this time!',
    640,
    256,
  );
  const rows = [
    ['Coins earned', `$${state.coins}`],
    ['Dishes served', `${state.served}`],
    ['Orders lost', `${state.lost}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Final score', `${state.score}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 300 + i * 34;
    ctx.fillStyle = '#5d5346';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 440, y);
    ctx.fillStyle = '#b7791f';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, 840, y);
  });
  const b = LAYOUT.againBtn;
  ctx.fillStyle = '#f2a93b';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('↻  COOK AGAIN', b.x + b.w / 2, b.y + b.h / 2 + 1);
}

export function drawScene(ctx, state, sounds) {
  drawWallAndFloor(ctx);
  drawOrderBoard(ctx, state);
  drawChoppingBoard(ctx, state);
  drawGrill(ctx, state);
  drawRecipeBoard(ctx);
  drawIngredientBins(ctx, state);
  drawServingCounter(ctx, state);
  drawStatsPanel(ctx, state);
  drawPopupsAndToast(ctx, state);
  drawHud(ctx, state, sounds);
  drawHintBar(ctx);
  if (state.screen === 'title') drawTitleScreen(ctx, state);
  else if (state.screen === 'paused') drawPausedOverlay(ctx);
  else if (state.screen === 'over') drawEndScreen(ctx, state);
}
