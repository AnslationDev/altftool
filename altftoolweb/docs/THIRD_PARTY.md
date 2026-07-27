# Third-Party & Open-Source Provenance

Policy: see `docs/ALTFTOOL_EXPANSION_BLUEPRINT.md` (license rules). Only MIT / Apache-2.0 /
BSD / ISC / CC0 / Unlicense code ships to the browser. Every ported or inspired project gets
a row here: what we used, where it came from, its license, and what we changed.

## Games (Wave 1 — added 2026-07-22)

All 16 Wave-1 games are **original clean-room implementations** written for ALTFTool
(game *rules/mechanics* are not copyrightable; no upstream code, art, or audio was copied).
Classic-game inspirations are noted for transparency. All UI uses ALTFTool design tokens;
all art is original geometric/canvas drawing; sounds are Web Audio synthesis only.

| Tool slug | Inspired by (mechanic) | Upstream code used | Trademark handling |
|---|---|---|---|
| minesweeper | Classic minesweeper (generic) | none — original | generic name, safe |
| block-stacker | Falling-tetromino genre | none — original | renamed, original palette (no "T-word") |
| brick-breaker | Breakout genre (generic) | none — original | generic name |
| paddle-ball | Classic paddle rally | none — original | renamed (no Atari mark) |
| four-in-a-row | Connect-four disc drop | none — original | generic name (no Hasbro mark) |
| typing-speed-test | WPM typing tests | none — original | generic |
| dino-runner | Endless-runner genre | none — original | original art, no Chrome dino sprite |
| tap-glider | One-tap flyer genre | none — original | renamed, original art |
| sliding-puzzle | 15-puzzle (public domain) | none — original | generic |
| nonogram | Nonogram logic puzzles | none — original | "nonogram" generic (no "Picross") |
| maze-muncher | Maze-chase genre | none — original | original maze + art (no Bandai Namco IP) |
| klondike-solitaire | Klondike (public domain) | none — original | generic |
| hangman | Hangman (public domain) | none — original | generic |
| aim-trainer | Aim-training genre | none — original | generic |
| word-search | Word search (public domain) | none — original | generic |
| space-rocks | Vector space shooter genre | none — original | renamed (no Atari mark) |

## Platform npm dependencies with notice obligations

Tracked at build level; a generated `/licenses` credits page is planned (blueprint Phase 0).
Known flagged deps needing remediation (see blueprint):

| Package | License | Status |
|---|---|---|
| @imgly/background-removal | AGPL-3.0 | ⚠️ REMEDIATE — used by 5 surfaces; migrate to Transformers.js + permissive model |
| @ffmpeg/ffmpeg (+ default core) | MIT wrapper / GPL core binary | ⚠️ REMEDIATE — 4 tools; migrate to MP4Box.js + WebCodecs or custom LGPL-only core |

## How to add a row

When porting any external project: record repo URL, commit hash, exact license (read the
LICENSE file — GitHub's label is often wrong), date pulled, files vendored, and modifications.
No row = not shippable.
