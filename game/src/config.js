// Sizzle & Serve — configuration: canvas size, ingredients, recipes, timing.
// Every number that tunes the game lives here so the other files stay readable.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const SHIFT_SECONDS = 150;

// An ingredient is either ready to plate, chopped on the board, or grilled.
export const INGREDIENTS = {
  bun:     { name: 'Bun',     key: '1', prep: 'ready', price: 2, color: '#e8a94e', blurb: 'Soft brioche bun' },
  patty:   { name: 'Patty',   key: '2', prep: 'grill', price: 4, color: '#7a4a21', blurb: 'Beef patty, grill it' },
  bacon:   { name: 'Bacon',   key: '3', prep: 'grill', price: 3, color: '#c0392b', blurb: 'Smoky bacon strips' },
  egg:     { name: 'Egg',     key: '4', prep: 'grill', price: 3, color: '#f6e27a', blurb: 'Sunny-side egg' },
  cheese:  { name: 'Cheese',  key: '5', prep: 'ready', price: 2, color: '#f7c948', blurb: 'Melty cheddar' },
  lettuce: { name: 'Lettuce', key: '6', prep: 'chop',  price: 2, color: '#58b368', blurb: 'Crisp lettuce' },
  tomato:  { name: 'Tomato',  key: '7', prep: 'chop',  price: 2, color: '#e74c3c', blurb: 'Ripe tomato' },
  onion:   { name: 'Onion',   key: '8', prep: 'chop',  price: 2, color: '#e8d8f0', blurb: 'Sweet onion rings' },
};

// Prep times in seconds. Grilled food burns if left past burnAfter.
export const PREP_TIMES = {
  chop: { lettuce: 1.1, tomato: 1.2, onion: 1.5 },
  grill: { patty: 3.6, bacon: 3.0, egg: 2.6 },
};
export const GRILL_BURN_AFTER = 3.0; // seconds past done before it burns

// Recipes: the dish name, the exact set of ingredients on the plate, its price.
export const RECIPES = [
  { id: 'garden-salad',   name: 'Garden Salad',   needs: ['lettuce', 'tomato'],                 price: 9,  icon: '🥗' },
  { id: 'cheese-omelette', name: 'Cheese Omelette', needs: ['egg', 'cheese', 'tomato'],         price: 13, icon: '🍳' },
  { id: 'classic-burger',  name: 'Classic Burger',  needs: ['bun', 'patty', 'lettuce', 'cheese'], price: 16, icon: '🍔' },
  { id: 'blt-sandwich',    name: 'BLT Sandwich',    needs: ['bun', 'bacon', 'lettuce', 'tomato'], price: 15, icon: '🥪' },
  { id: 'deluxe-burger',   name: 'Deluxe Burger',   needs: ['bun', 'patty', 'cheese', 'bacon', 'onion', 'tomato'], price: 22, icon: '🍔' },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Order pacing: how often a new ticket appears and how long a guest waits.
export function orderSpawnInterval(elapsedSeconds) {
  if (elapsedSeconds < 45) return 13;
  if (elapsedSeconds < 90) return 10.5;
  return 8;
}
export function orderPatience(elapsedSeconds) {
  if (elapsedSeconds < 45) return 30;
  if (elapsedSeconds < 90) return 25;
  return 20;
}
export function maxOpenOrders() {
  return 3;
}

// Which recipes can appear at this point in the shift (harder dishes unlock later).
export function availableRecipes(elapsedSeconds) {
  if (elapsedSeconds < 30) return RECIPES.slice(0, 3);
  if (elapsedSeconds < 75) return RECIPES.slice(0, 4);
  return RECIPES;
}

// Star thresholds for the end-of-shift summary.
export function starsForScore(score) {
  if (score >= 260) return 3;
  if (score >= 170) return 2;
  if (score >= 90) return 1;
  return 0;
}

// Small deterministic random helper (mulberry32) so staged screenshots replay.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
