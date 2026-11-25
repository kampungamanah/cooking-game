// Sizzle & Serve — the entry program for the best-cooking-game bounty.
// It hands the game in: copies game/ and screenshots/ from this repository
// into the output directory and writes dossier.json with the kit's library,
// so the judge can read the game from its screenshots and its source outline.
//
// Runs on Node 22 with the standard library only, no network, no installs:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader the output directory is /output instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory this file sits in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The game itself: plain static files, playable offline from game/index.html.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

// The screenshots of the game running, taken by its maker.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier the judge reads, built from exactly what was just copied.
// The caps mirror the gate's own limits, so an entry this program accepts
// is one the gate accepts: at most 4 screenshots of 256 KiB, a game of at
// most 993 files and 48 MiB, and a dossier text of at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
