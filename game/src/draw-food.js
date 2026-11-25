// Sizzle & Serve — drawing food: every ingredient, the stacked plate, order tickets.
// All art is drawn with canvas shapes (no image files), so the game ships offline.

import { INGREDIENTS, RECIPES } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
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
}

// Draw one ingredient centred at (cx, cy), roughly `size` pixels wide.
export function drawIngredient(ctx, id, cx, cy, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    // Golden dome with sesame seeds.
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, s * 0.25, s * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d18a2e';
    ctx.fillRect(-s * 0.95, s * 0.2, s * 1.9, s * 0.18);
    ctx.fillStyle = '#fff3d6';
    const seeds = [[-0.45, -0.35], [0, -0.55], [0.45, -0.35], [-0.2, -0.15], [0.25, -0.12]];
    for (const [sx, sy] of seeds) {
      ctx.beginPath();
      ctx.ellipse(sx * s, sy * s, s * 0.1, s * 0.06, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#7a4a21';
    roundRect(ctx, -s, -s * 0.42, s * 2, s * 0.84, s * 0.3);
    ctx.fill();
    ctx.fillStyle = '#5d3413';
    for (const [dx, dy] of [[-0.5, -0.1], [0.1, 0.15], [0.55, -0.15], [-0.1, 0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(-s * 0.9, -s * 0.42, s * 1.8, s * 0.14);
  } else if (id === 'bacon') {
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = s * 0.42;
    ctx.lineCap = 'round';
    for (const row of [-0.42, 0.08, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, row * s);
      ctx.quadraticCurveTo(-s * 0.3, row * s - s * 0.28, 0, row * s);
      ctx.quadraticCurveTo(s * 0.35, row * s + s * 0.28, s * 0.85, row * s);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e88a7a';
    ctx.lineWidth = s * 0.1;
    for (const row of [-0.42, 0.08, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, row * s);
      ctx.quadraticCurveTo(-s * 0.3, row * s - s * 0.28, 0, row * s);
      ctx.quadraticCurveTo(s * 0.35, row * s + s * 0.28, s * 0.85, row * s);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fdfdf2';
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, s * 0.1);
    ctx.bezierCurveTo(-s * 1.05, -s * 0.7, -s * 0.4, -s * 0.95, 0, -s * 0.85);
    ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 1.0, -s * 0.6, s * 0.9, s * 0.1);
    ctx.bezierCurveTo(s * 0.8, s * 0.6, -s * 0.8, s * 0.6, -s * 0.9, s * 0.1);
    ctx.fill();
    ctx.fillStyle = '#f6c945';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.05, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.12, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.save();
    ctx.rotate(-0.06);
    roundRect(ctx, -s * 0.95, -s * 0.55, s * 1.9, s * 1.1, s * 0.18);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e0a92e';
    for (const [hx, hy] of [[-0.5, -0.2], [0.35, 0.15], [0.05, -0.3]]) {
      ctx.beginPath();
      ctx.arc(hx * s, hy * s, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#58b368';
    for (const [lx, ly, r] of [[-0.45, 0.1, 0.55], [0, -0.25, 0.62], [0.45, 0.15, 0.55], [0, 0.35, 0.5]]) {
      ctx.beginPath();
      ctx.arc(lx * s, ly * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#3d8b4a';
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.1, 0, 0, s * 0.7);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f08a7d';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6b8ae';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * s * 0.38, Math.sin(a) * s * 0.38, s * 0.2, s * 0.1, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.strokeStyle = '#d9b8e6';
    ctx.lineWidth = s * 0.22;
    for (const r of [0.85, 0.58, 0.32]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#b07fc4';
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// One ingredient as a flat layer in the dish stack on the plate: each layer is
// a thin band, so every ingredient in the dish stays visible as it grows.
export function drawStackLayer(ctx, id, cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, 6, 46, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d18a2e';
    ctx.fillRect(-46, 6, 92, 6);
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-22, -8], [0, -14], [22, -8]]) {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#7a4a21';
    roundRect(ctx, -50, -7, 100, 14, 6);
    ctx.fill();
    ctx.fillStyle = '#5d3413';
    for (const dx of [-30, -5, 22, 38]) {
      ctx.beginPath();
      ctx.arc(dx, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'bacon') {
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (const row of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(-46, row);
      ctx.quadraticCurveTo(-16, row - 6, 0, row);
      ctx.quadraticCurveTo(18, row + 6, 46, row);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fdfdf2';
    ctx.beginPath();
    ctx.ellipse(0, 0, 50, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6c945';
    ctx.beginPath();
    ctx.arc(8, -1, 11, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.save();
    ctx.rotate(-0.04);
    roundRect(ctx, -52, -6, 104, 12, 3);
    ctx.fill();
    ctx.restore();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#58b368';
    for (const lx of [-34, -12, 10, 32]) {
      ctx.beginPath();
      ctx.arc(lx, 0, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 46, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f08a7d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.strokeStyle = '#d9b8e6';
    ctx.lineWidth = 5;
    for (const r of [42, 28, 14]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// The plate: a white plate with the dish stacked on it, layer by layer.
export function drawPlate(ctx, cx, cy, plate, ready) {
  ctx.save();
  // Shadow under the plate.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ellipse(ctx, cx, cy + 26, 118, 16);
  ctx.fill();
  // Plate itself.
  ctx.fillStyle = ready ? '#fff6cf' : '#f8f8f8';
  ellipse(ctx, cx, cy, 118, 34);
  ctx.fill();
  ctx.strokeStyle = ready ? '#f2c14e' : '#d9d9d9';
  ctx.lineWidth = ready ? 4 : 2;
  ellipse(ctx, cx, cy, 118, 34);
  ctx.stroke();
  ctx.fillStyle = '#e9e9e9';
  ellipse(ctx, cx, cy, 88, 24);
  ctx.fill();
  // Stacked layers, bottom layer first, each peeking out above the last.
  const stack = [...plate];
  stack.forEach((id, i) => {
    drawStackLayer(ctx, id, cx, cy - 8 - i * 15);
  });
  ctx.restore();
}

// One order ticket: dish name, ingredient icons, patience bar, price.
export function drawOrderTicket(ctx, x, y, w, h, order, highlighted) {
  const ratio = Math.max(0, order.patience / order.patienceMax);
  ctx.save();
  ctx.fillStyle = highlighted ? '#fff8dc' : '#fffdf5';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = highlighted ? '#f2c14e' : '#d8c9a3';
  ctx.lineWidth = highlighted ? 3 : 1.5;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  // Ticket holes on the left edge.
  ctx.fillStyle = '#e8dcc0';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x + 8, y + 14 + i * ((h - 28) / 2), 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dish name and price.
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${order.recipe.icon} ${order.recipe.name}`, x + 22, y + 16);
  ctx.fillStyle = '#b7791f';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`$${order.recipe.price}`, x + w - 12, y + 16);
  // Ingredient icons needed.
  let ix = x + 22;
  for (const id of order.recipe.needs) {
    drawIngredient(ctx, id, ix + 12, y + 38, 22);
    ix += 28;
  }
  // Patience bar: green while fresh, red when the guest is about to leave.
  const barX = x + 22;
  const barY = y + h - 10;
  const barW = w - 72;
  ctx.fillStyle = '#eadfce';
  roundRect(ctx, barX, barY, barW, 7, 3);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? '#58b368' : ratio > 0.25 ? '#f2a93b' : '#e74c3c';
  if (ratio > 0) {
    roundRect(ctx, barX, barY, barW * ratio, 7, 3);
    ctx.fill();
  }
  ctx.fillStyle = '#8a7d63';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(order.patience)}s`, x + w - 12, y + h - 6);
  ctx.restore();
}

export function drawRecipeCard(ctx, x, y, w, recipe, index) {
  ctx.save();
  ctx.fillStyle = index % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
  roundRect(ctx, x, y, w, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#f5ead2';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${recipe.icon} ${recipe.name}`, x + 10, y + 10);
  let ix = x + w - 12;
  for (let i = recipe.needs.length - 1; i >= 0; i -= 1) {
    drawIngredient(ctx, recipe.needs[i], ix - 10, y + 26, 18);
    ix -= 22;
  }
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`$${recipe.price}`, x + w - 12, y + 10);
  ctx.restore();
}

export { INGREDIENTS, RECIPES };
