// Sizzle & Serve — input: mouse clicks and keyboard shortcuts, hit-tested
// against the same layout rectangles the kitchen renderer draws.

import { INGREDIENTS } from './config.js';
import { LAYOUT, pointInRect } from './draw-kitchen.js';
import { pickIngredient, servePlate, startShift, trashGrillSlot, trashPlate } from './state.js';

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function attachInput(canvas, state, sounds) {
  canvas.addEventListener('click', (event) => {
    sounds.ensureContext();
    const { x, y } = canvasPoint(canvas, event);
    handleClick(canvas, state, sounds, x, y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      sounds.toggleMute();
      return;
    }
    if (state.screen === 'title' && (key === 'enter' || key === ' ')) {
      sounds.ensureContext();
      startShift(state);
      return;
    }
    if (state.screen === 'over' && (key === 'enter' || key === ' ')) {
      sounds.ensureContext();
      startShift(state);
      return;
    }
    if (key === 'p' || key === 'escape') {
      if (state.screen === 'playing') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'playing';
      return;
    }
    if (state.screen !== 'playing') return;
    if (key === ' ') {
      event.preventDefault();
      servePlate(state, sounds);
      return;
    }
    if (key === 't') {
      trashPlate(state, sounds);
      return;
    }
    const byKey = Object.entries(INGREDIENTS).find(([, def]) => def.key === key);
    if (byKey) pickIngredient(state, byKey[0], sounds);
  });
}

function handleClick(canvas, state, sounds, x, y) {
  // HUD buttons always work.
  if (pointInRect(x, y, LAYOUT.soundBtn)) {
    sounds.toggleMute();
    return;
  }
  if (pointInRect(x, y, LAYOUT.pauseBtn)) {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
    return;
  }
  if (state.screen === 'title') {
    if (pointInRect(x, y, LAYOUT.startBtn)) startShift(state);
    return;
  }
  if (state.screen === 'over') {
    if (pointInRect(x, y, LAYOUT.againBtn)) startShift(state);
    return;
  }
  if (state.screen !== 'playing') return;

  // Ingredient bins along the counter.
  for (let i = 0; i < Object.keys(INGREDIENTS).length; i += 1) {
    if (pointInRect(x, y, LAYOUT.ingredientBin(i))) {
      pickIngredient(state, Object.keys(INGREDIENTS)[i], sounds);
      return;
    }
  }
  // A burnt grill item is clicked to throw it away.
  for (let i = 0; i < state.grill.length; i += 1) {
    if (pointInRect(x, y, LAYOUT.grillSlot(i))) {
      trashGrillSlot(state, i, sounds);
      return;
    }
  }
  // The plate serves when it matches a ticket.
  if (pointInRect(x, y, LAYOUT.serveBtn)) {
    servePlate(state, sounds);
    return;
  }
  // The trash clears the plate.
  if (pointInRect(x, y, LAYOUT.trash)) {
    trashPlate(state, sounds);
  }
}
