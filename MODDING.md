# Making your own version of Tempest Isles

Tempest Isles is open source under the MIT License, so you're welcome to copy it, change it and share
your own version: a new map, new rules, new disasters, a tougher AI, anything. If you make something
you're proud of, send it in through the form on the
[Driftwood Games community page](https://driftwood-games.onrender.com/community.html). The best ones get
featured there.

## Get it running

You need [Node.js](https://nodejs.org) 20 or newer.

```sh
git clone https://github.com/ljorgens/tempest-isles.git my-mod
cd my-mod
npm install
npm run dev        # serves the game at http://localhost:5173 and reloads as you edit
```

Before sharing, run the same checks the project's CI runs:

```sh
npm run typecheck  # TypeScript errors
npm run validate   # the map grid is well formed
npm run sim -- 50  # 50 all-AI games per difficulty: watch for "HIT TURN CAP" (a game that never ends)
npm run build      # the finished site, in dist/
```

## Where things live

| To change… | Look in |
| --- | --- |
| **The map**: island shapes, countries, island names and bonuses, sea lanes | `src/mapdata.ts` |
| **Reinforcements, attacking, conquest, card sets** | `src/engine.ts`: `reinforcementsFor`, `canAttack`, `rollBatch`, `conquer`, `setValue` |
| **Which cards can be drawn**, and how often | `DRAW_POOL` at the top of `src/engine.ts` |
| **Card names and descriptions**, hand limit, player colors, AI captain names | `src/types.ts` |
| **Disasters**: earthquakes, floods, rebellions, drifting production centers | `maybeEvent` in `src/engine.ts` |
| **The AI** | `src/ai.ts`. `caps` turns behaviors on per difficulty level |
| **Title-screen options** (starting armies, disaster frequency…) | the `.seg` buttons in `index.html` |
| **Help text** | the How to Play dialog in `src/main.ts` |
| **Colors, fonts, layout** | `src/style.css` |
| **Sound effects** (generated in code, no audio files) | `src/sfx.ts` |
| **How the map is drawn** from the grid | `src/geometry.ts` and `src/render.ts` |

`RULES_SPEC.md` describes every rule as the code implements it.

### Editing the map

The map is drawn as text. In `GRID`, each character is one cell, `.` is sea, and every distinct letter
or digit is one country. Shapes, borders, coastlines and neighbors are all worked out from the grid,
so you only edit text:

- To reshape an island, change which cells hold its country symbols.
- To change an island's name or bonus, edit `ISLANDS`. Its `symbols` list the countries on it.
- To add or move a sea lane, edit `LANES`. Each lane joins two coastal countries on different islands.

Run `npm run validate` after each change. It checks that every country is in one piece and that
islands and lanes match the grid.

A map with a different number of countries or islands needs a few more edits:

- `ALPHABET` in `src/mapdata.ts` must list exactly one symbol per country.
- `scripts/validate.mjs` expects 46 countries in three places; search it for `46`.
- The words "nine islands" and "Forty-six countries" appear in `index.html`, the help text in
  `src/main.ts`, the victory text in `src/ui.ts` and `public/manifest.webmanifest`.

## Before you share it

- **Give it its own name.** A brand-new title, or a subtitle like "Tempest Isles: Archipelago", is
  fine, as long as it says it's based on Tempest Isles. Change it in `index.html`,
  `public/manifest.webmanifest` and `public/og.png` (the image shown when the link is shared).
- **Keep the credits.** The MIT License asks you to keep the `LICENSE` file and its copyright line. Keep
  the credit to the original *Isle Wars Pro* by Soleau Software too. Don't present your version as
  official or as made by Driftwood Games or Soleau Software.
- **Only use material you have the right to use.** Don't add art, sound, text or files from the
  original *Isle Wars Pro* or any other commercial game, and don't use "Isle Wars" in your mod's name.
- **Swap out our details.** Several files speak as Driftwood Games or point to our site:
  - `src/about.ts`: set `TIP_URL` to `''` (this hides the tip button) or to your own link, set
    `SOURCE_URL` to your repository, and rewrite the About panel. It has our story, our signature and
    our email address.
  - `public/privacy.html` and `public/terms.html` describe our site and give our email. Rewrite them, or
    delete them and remove the links to them in `index.html` and `src/about.ts`.
  - Delete `public/presskit.html` and `public/press/` (our press kit), and update or delete
    `public/humans.txt`.
  - Change the `tempest-isles.onrender.com` addresses in `index.html`, `public/robots.txt` and
    `public/sitemap.xml`.
- **Saved scores.** Scores and the sound setting are saved in the browser under `tempest-isles-scores`
  (`src/engine.ts`) and `tempest-isles-muted` (`src/sfx.ts`). If you host several versions on one
  site, such as one github.io account, rename the keys so they don't share scores.
- **Keep it free and clean.** To be featured, a mod must be free to play, with no ads, no trackers,
  no sign-up and nothing to download.

## Putting it online for free

The game is a static site, so any free static host works.

- **GitHub Pages**: build with relative paths so it works from a subfolder:
  `npm run build -- --base=./`, then publish the `dist/` folder (for example with the
  `actions/deploy-pages` GitHub Action).
- **Render, Netlify or Cloudflare Pages**: build command `npm ci && npm run build`, publish
  directory `dist`. `render.yaml` is a ready-made Render setup; change its `name` first.
- **itch.io**: run `npm run build -- --base=./`, zip the *contents* of `dist/`, and upload it
  as an HTML game.

## Sending it in

Share the link through the
[community page](https://driftwood-games.onrender.com/community.html). Tell us what you changed and,
if you like, a name to credit you by. We'll play it, and the best ones get featured with a link to
yours.

Fixes and improvements to Tempest Isles itself are welcome as pull requests here too.
