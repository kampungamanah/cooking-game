// Sizzle & Serve — entry point: the game loop, the canvas, and staged screenshots.
// Open with ?shot=start|play|serve|end to freeze a deterministic scene for a screenshot.

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { SoundEngine } from './audio.js';
import { drawScene } from './draw-kitchen.js';
import { attachInput } from './input.js';
import { createGameState, stageShot, updateGame } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const state = createGameState();
const sounds = new SoundEngine();
attachInput(canvas, state, sounds);

// A staged shot freezes the game in a hand-picked moment: the kitchen, the
// order board, a dish mid-assembly, the timer and a plate ready to serve.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(state, shot);
} else {
  // A fresh visit starts with two tickets already on the board, behind the title.
  stageShot(state, 'start');
}

let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!shot) updateGame(state, dt, sounds);
  drawScene(ctx, state, sounds);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
