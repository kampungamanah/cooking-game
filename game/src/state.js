// Sizzle & Serve — game state: orders, plate, grill, chopping board, score.
// Pure logic: no drawing here, so the rules are easy to read on their own.

import {
  GRILL_BURN_AFTER,
  INGREDIENTS,
  PREP_TIMES,
  SHIFT_SECONDS,
  availableRecipes,
  maxOpenOrders,
  mulberry32,
  orderPatience,
  orderSpawnInterval,
  recipeById,
} from './config.js';

export function createGameState() {
  return {
    screen: 'title', // title | playing | paused | over
    elapsed: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    nextOrderIn: 2.5,
    orderSerial: 0,
    plate: [], // ingredient ids stacked on the plate, in the order added
    board: null, // { id, progress, duration }
    grill: [null, null], // each { id, progress, duration, state: 'cooking'|'done'|'burnt' }
    popups: [], // floating score text { x, y, text, color, life }
    toast: null, // { text, life }
    rushAnnounced: false,
    random: Math.random,
  };
}

export function startShift(state) {
  const fresh = createGameState();
  Object.assign(state, fresh, { screen: 'playing', random: Math.random });
  spawnOrder(state);
}

export function spawnOrder(state, forcedRecipeId) {
  const pool = availableRecipes(state.elapsed);
  const pick = forcedRecipeId
    ? recipeById(forcedRecipeId)
    : pool[Math.floor(state.random() * pool.length)];
  if (!pick) return;
  state.orderSerial += 1;
  state.orders.push({
    id: state.orderSerial,
    recipe: pick,
    patience: orderPatience(state.elapsed),
    patienceMax: orderPatience(state.elapsed),
    bornAt: state.elapsed,
  });
}

export function matchingOrder(state) {
  // The earliest open order whose recipe exactly equals the plate contents.
  const plateSet = [...state.plate].sort().join(',');
  return state.orders.find((o) => [...o.recipe.needs].sort().join(',') === plateSet) || null;
}

export function plateMatchesAnyOrder(state) {
  return matchingOrder(state) !== null;
}

function addPopup(state, x, y, text, color) {
  state.popups.push({ x, y, text, color: color || '#ffffff', life: 1.4 });
}

function showToast(state, text) {
  state.toast = { text, life: 2.2 };
}

export function addIngredientToPlate(state, id) {
  state.plate.push(id);
}

export function clearPlate(state) {
  state.plate = [];
}

// Clicking an ingredient bin: it goes to the board, the grill, or straight to the plate.
export function pickIngredient(state, id, sounds) {
  if (state.screen !== 'playing') return false;
  const def = INGREDIENTS[id];
  if (!def) return false;
  if (def.prep === 'chop') {
    if (state.board) {
      showToast(state, 'Chopping board is busy — wait for the chop!');
      return false;
    }
    state.board = { id, progress: 0, duration: PREP_TIMES.chop[id] || 1.2 };
    sounds.chop();
    return true;
  }
  if (def.prep === 'grill') {
    const slot = state.grill.findIndex((g) => g === null);
    if (slot === -1) {
      showToast(state, 'Both grill spots are full!');
      return false;
    }
    state.grill[slot] = { id, progress: 0, duration: PREP_TIMES.grill[id] || 3, state: 'cooking' };
    sounds.placeOnGrill();
    sounds.startSizzle();
    return true;
  }
  addIngredientToPlate(state, id);
  sounds.click();
  return true;
}

// Clicking a burnt grill item throws it away.
export function trashGrillSlot(state, slot, sounds) {
  if (state.grill[slot] && state.grill[slot].state === 'burnt') {
    state.grill[slot] = null;
    sounds.click();
    return true;
  }
  return false;
}

export function trashPlate(state, sounds) {
  if (state.plate.length === 0) return false;
  clearPlate(state);
  sounds.click();
  showToast(state, 'Plate cleared — start the dish again.');
  return true;
}

export function servePlate(state, sounds) {
  const order = matchingOrder(state);
  if (!order) {
    if (state.plate.length > 0) showToast(state, 'No order matches this plate — check the recipe board!');
    return false;
  }
  const tip = Math.round((order.patience / order.patienceMax) * 6);
  const comboBonus = Math.min(state.combo, 5);
  const earned = order.recipe.price + tip + comboBonus;
  state.score += earned;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  addPopup(state, 640, 520, `+$${earned}  ${order.recipe.name}`, '#ffd94d');
  if (tip >= 4) addPopup(state, 640, 548, `Great tip! +$${tip}`, '#7be495');
  sounds.serveChime();
  return true;
}

function loseOrder(state, order, sounds) {
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.lost += 1;
  state.combo = 0;
  state.score = Math.max(0, state.score - 5);
  addPopup(state, 220, 130, 'Order walked out! -$5', '#ff6b6b');
  sounds.lostOrder();
}

export function updateGame(state, dt, sounds) {
  if (state.screen !== 'playing') return;
  state.elapsed += dt;
  state.shiftLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

  // Rush hour: the last 30 seconds, orders hurry in.
  if (state.shiftLeft <= 30 && !state.rushAnnounced) {
    state.rushAnnounced = true;
    showToast(state, 'RUSH HOUR! Orders are pouring in!');
  }

  // New orders arrive on a timer while there is room on the board.
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.orders.length < maxOpenOrders()) {
    spawnOrder(state);
    state.nextOrderIn = orderSpawnInterval(state.elapsed);
  }

  // Order patience drains; an empty bar means the guest leaves.
  for (const order of [...state.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) loseOrder(state, order, sounds);
  }

  // Chopping finishes on its own and the chopped food hops onto the plate.
  if (state.board) {
    state.board.progress += dt / state.board.duration;
    if (state.board.progress >= 1) {
      addIngredientToPlate(state, state.board.id);
      addPopup(state, 935, 420, 'Chopped!', '#a8e6a3');
      sounds.ding();
      state.board = null;
    }
  }

  // Grilling: done food hops onto the plate; forgotten food burns.
  let anythingCooking = false;
  for (let i = 0; i < state.grill.length; i += 1) {
    const slot = state.grill[i];
    if (!slot) continue;
    if (slot.state === 'cooking') {
      anythingCooking = true;
      slot.progress += dt / slot.duration;
      if (slot.progress >= 1) {
        slot.state = 'done';
        slot.progress = 1;
        slot.doneFor = 0;
        addIngredientToPlate(state, slot.id);
        addPopup(state, 1150, 420, `${INGREDIENTS[slot.id].name} grilled!`, '#ffd94d');
        sounds.ding();
        state.grill[i] = null;
      }
    }
  }
  if (!anythingCooking) sounds.stopSizzle();

  // Popups and toasts fade out.
  for (const popup of state.popups) popup.life -= dt;
  state.popups = state.popups.filter((p) => p.life > 0);
  if (state.toast) {
    state.toast.life -= dt;
    if (state.toast.life <= 0) state.toast = null;
  }

  // The shift ends when the timer runs out.
  if (state.shiftLeft <= 0) {
    state.screen = 'over';
    sounds.stopSizzle();
    sounds.serveChime();
  }
}

// ---- Staged states for screenshots (deterministic, no timers involved) ----

export function stageShot(state, shot) {
  const seeded = mulberry32(20261125);
  state.random = seeded;
  state.screen = 'playing';
  state.elapsed = 62;
  state.shiftLeft = 88;
  state.score = 74;
  state.coins = 74;
  state.served = 5;
  state.lost = 1;
  state.combo = 3;
  state.bestCombo = 4;
  state.plate = [];
  state.board = null;
  state.grill = [null, null];
  state.popups = [];
  state.toast = null;

  if (shot === 'start') {
    state.screen = 'title';
    state.elapsed = 0;
    state.shiftLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.lost = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.orders = [
      { id: 1, recipe: recipeById('classic-burger'), patience: 26, patienceMax: 30, bornAt: 0 },
      { id: 2, recipe: recipeById('garden-salad'), patience: 18, patienceMax: 30, bornAt: 0 },
    ];
    state.nextOrderIn = 9;
    return;
  }

  state.orders = [
    { id: 1, recipe: recipeById('deluxe-burger'), patience: 14, patienceMax: 20, bornAt: 0 },
    { id: 2, recipe: recipeById('classic-burger'), patience: 21, patienceMax: 25, bornAt: 0 },
    { id: 3, recipe: recipeById('cheese-omelette'), patience: 9, patienceMax: 25, bornAt: 0 },
  ];

  if (shot === 'play') {
    // One dish mid-assembly on the plate, tomato mid-chop, patty on the grill.
    state.plate = ['bun', 'patty', 'lettuce'];
    state.board = { id: 'tomato', progress: 0.55, duration: 1.2 };
    state.grill = [{ id: 'bacon', progress: 0.6, duration: 3.0, state: 'cooking' }, null];
    state.popups = [{ x: 640, y: 500, text: '+$16  Classic Burger', color: '#ffd94d', life: 1.2 }];
    return;
  }

  if (shot === 'serve') {
    // A complete Classic Burger on the plate, ready to serve to the matching order.
    state.plate = ['bun', 'patty', 'lettuce', 'cheese'];
    state.grill = [null, null];
    return;
  }

  if (shot === 'end') {
    state.screen = 'over';
    state.shiftLeft = 0;
    state.elapsed = SHIFT_SECONDS;
    state.score = 212;
    state.coins = 212;
    state.served = 14;
    state.lost = 2;
    state.combo = 0;
    state.bestCombo = 6;
    state.orders = [];
    state.plate = [];
  }
}
