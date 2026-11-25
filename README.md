[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/kampungamanah/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/kampungamanah/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Built by an AI agent for [make.fun's "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) — $250 in USDC.

# Sizzle & Serve — Bistro Rush

A complete, original, offline HTML5 cooking game. You are the only chef in a
busy bistro: tickets land on the order board, you chop, grill and plate each
dish, and you serve it before the guest's patience runs out.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server) and click **START SHIFT**. A shift lasts 150 seconds.

- **Order board** (top left): each ticket names a dish, shows the ingredients
  it needs, its price, and a patience bar. Serve fast for a bigger tip.
- **Ingredients** (on the counter, keys 1–8): click one and it goes where it
  belongs — choppables to the **chopping board**, grillables to the **grill**,
  the rest straight onto **your plate**. Chopping and grilling finish on their
  own and the food hops onto the plate.
- **Grill**: food left on the grill too long burns — click a burnt item to
  throw it away.
- **Serve**: when the plate matches a ticket exactly, it glows gold — click
  **SERVE!** or press **Space**. A wrong plate matches nothing; press **T**
  to clear it.
- **Rush hour**: the last 30 seconds bring orders in faster. Chain serves
  without losing an order to build a combo.

Five recipes, from Garden Salad to the six-ingredient Deluxe Burger, with
orders arriving faster and guests getting less patient as the shift goes on.
The shift ends with a star rating, dishes served, orders lost, best combo
and coins earned.

## Controls

| Input | Action |
| --- | --- |
| Mouse click | Pick ingredients, serve, trash, buttons |
| Keys 1–8 | Pick an ingredient |
| Space | Serve the plate |
| T | Clear the plate |
| P / Esc | Pause |
| M | Mute |

## Files

- `game/index.html` + `game/styles.css` — the page shell
- `game/src/config.js` — canvas size, ingredients, recipes, pacing
- `game/src/state.js` — orders, plate, grill, board, scoring, staged shots
- `game/src/draw-food.js` — every ingredient, the stacked plate, tickets
- `game/src/draw-kitchen.js` — the kitchen scene, HUD, title/end screens
- `game/src/audio.js` — synthesized WebAudio effects (no audio files)
- `game/src/input.js` — mouse and keyboard handling
- `game/src/main.js` — the game loop and `?shot=` staging for screenshots
- `main.ts` — the entry program: copies `game/` + `screenshots/` to the
  output directory and writes `dossier.json` with `vendor/makefun-game.ts`
- `screenshots/` — four real renders of the game running in Chromium

## Screenshots

`?shot=start|play|serve|end` freezes a deterministic scene for a screenshot:
the title screen, a dish mid-assembly with food on the board and grill, a
plate ready to serve, and the end-of-shift summary.

Everything is drawn with canvas shapes and synthesized with WebAudio — no
network requests, no external assets, no copied art, names or music.
