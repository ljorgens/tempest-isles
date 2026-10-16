# Tempest Isles — A War of Nine Islands

**▶ Play online: https://tempest-isles-ugbl.onrender.com/**

A browser-based tribute to **Isle Wars Pro** (Soleau Software, 2002): a
Risk-style island-conquest game where earthquakes, floods, rebellions and
wandering production centers answer to no admiral. All-new code, map, art and
name — the rules follow the original's manual (see `RULES_SPEC.md`).

**Free to play, free to fork.** I played Isle Wars Pro as a kid and rebuilt it
so I (and anyone else who misses it) could play it again. Bug reports, rule
corrections and pull requests are all welcome — open an
[issue](https://github.com/ljorgens/tempest-isles/issues) or fork away.

> Tempest Isles is an unofficial fan tribute. It is not affiliated with or
> endorsed by Soleau Software; all credit for the original game's design goes
> to William Soleau and Soleau Software.

## The game

- **46 countries on 9 islands**, 4 fleets — solo vs. three AI captains, or
  **hotseat with 2–4 human players** on one device (the original's
  registered-version feature).
- Conquer all nine islands to win.
- Reinforcements each turn: countries ÷ 3 (min 2) + island bonuses
  (8/5/5/4/4/3/2/2/2).
- Attacks need an **equal-or-larger** stack than the defender; ties favor the
  defender; an attacking force worn down to 1 forfeits the turn **and the
  country**.
- Capture a country to draw a card: army cards (trade three of a kind at turn
  start), Rally (×2 reinforcements), Bombard, Ward, Wild — and Mutiny, which
  costs your whole hand. A **card reference** is in the menu bar.
- Random disasters strike between turns: earthquakes, floods, rebellions,
  rebel takeovers, and production centers (⚓, light-blue counts) that move
  around the map or double the armies stationed on them.
- Optional **"Exiles can return"** comeback rule: a rare event can bring a
  defeated captain back once, with the hand they held when they fell.
- A running **game log** records every deployment, battle, card and disaster.
- Plays on phones: pinch or drag to zoom and pan the map, or use the
  **+ / − / fit** buttons.
- Synthesized sound effects (WebAudio, no assets) — toggle with the Sound
  button in the menu bar.
- Wins/losses per rank are kept in your browser's localStorage. No accounts,
  ads or tracking ([privacy page](public/privacy.html)); an optional tip jar
  (via Stripe) is linked from the About panel and never unlocks anything.

### Title-screen options

- **Crews at the table** — 1 human vs. 3 AI, or 2, 3 or 4 humans.
- **Rank of your foes** — Ensign, Captain, Commodore, Admiral.
- **Your colors** — Cobalt, Gold, Crimson, Jade.
- **Starting armies** — Lean, Standard, Heavy.
- **Temper of the isles** (disasters) — Calm, Restless, Wrathful, Cataclysm.
- **Exiles can return** — Off / On.
- **Pace** — Stately, Brisk, Gale.

## Interpretations & tuned constants

Spots where the original manual is silent (marked `[INTERPRETATION]` in
`RULES_SPEC.md`) use these choices:

- Combat resolution: hidden d6 vs d6 per clash, loser drops one army.
- Bombard reduces the target to ⅓ of its armies (min 1); a Ward blocks one.
- Army-card sets pay 3× face value (8/8/8 → 24).
- Disaster chance per turn-end: 8/16/28/45% by setting; earthquakes and
  floods cut 3–4 random countries to roughly half.
- 5 production centers.

## Development

Requires Node 20+ (CI uses the version in `.node-version`).

```sh
npm ci
npm run dev           # then open http://localhost:5173
npm run build         # typecheck + static bundle in dist/ (host anywhere)
npm run validate      # map integrity checks
npm run sim -- 200    # headless all-AI games: 200 per difficulty rank
npm run sim -- ladder 200   # mixed-rank head-to-head win rates
npm run playtest      # headless Chrome smoke test (see below)
```

`npm run playtest` drives a real Google Chrome through a few human turns and
fails on any page error. It needs **Google Chrome installed locally** and a
running game — by default `http://localhost:5173/`, so start `npm run dev`
first. Pass another URL to test elsewhere:
`npm run playtest -- https://tempest-isles-ugbl.onrender.com/ shot.png`
(the optional second argument saves a screenshot).

## Project layout

- `src/mapdata.ts` — the map as an ASCII cell grid (one char = one cell, one
  symbol = one country); islands, bonuses and sea lanes.
- `src/geometry.ts` — grid → smoothed organic coastlines, centroids,
  adjacency graph.
- `src/engine.ts` — rules engine and turn loop.
- `src/ai.ts` — AI captains (difficulty scales discipline and strategy).
- `src/render.ts` / `src/ui.ts` / `src/mapview.ts` — SVG map, DOM
  interaction layer, pan & pinch-zoom.
- `src/sfx.ts` — synthesized WebAudio sound effects.
- `scripts/validate.mjs` — map integrity checks.
- `scripts/sim.ts` — headless all-AI simulator for stability/balance.
- `scripts/playtest.mjs` — headless Chrome smoke test.

## Contributing

Fork the repo, make your change, and open a pull request. Before submitting,
run `npm run build` (typecheck + bundle), `npm run validate` (map integrity) and
`npm run sim -- 50` (headless AI games, catches hangs and rule violations) —
CI runs the same checks on every pull request. Remember a rule differently
from the original? Open a **Rule correction** issue, ideally quoting the
manual.

## License

[MIT](LICENSE) — use, modify and share freely; just keep the copyright notice.
