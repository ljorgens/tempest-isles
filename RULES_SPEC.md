# Tempest Isles — Rules

These are the rules as Tempest Isles implements them (`src/engine.ts`,
`src/ai.ts`). They follow the manual of the original **Isle Wars Pro**
(v1.01, Soleau Software, 2002). Where the manual is silent, the choice made
here is marked **[INTERPRETATION]** — if you remember the original doing it
differently, please open a rule-correction issue.

## Overview

Risk-style territory conquest for 4 captains: 1 human + 3 AI, or hotseat with
2–4 humans (any remaining seats are AI). Board: **46 countries on 9 islands**,
islands linked by sea lanes. **Win by conquering all nine islands** — i.e.
holding every country (equivalently, being the last captain standing).

## Setup / Options

Title-screen options: number of human crews (1–4), AI rank (Ensign, Captain,
Commodore, Admiral), your color, starting armies, disaster frequency, the
"Exiles can return" comeback rule, and pace (animation speed only).

- The 46 countries are shuffled and dealt round-robin (12/12/11/11). Every
  country starts with 1 army.
- Each captain then gets extra starting armies — **22 / 35 / 50** for
  Lean / Standard / Heavy — scattered at random over their own countries.
  **[INTERPRETATION]**
- **5 production centers** are placed on random countries. **[INTERPRETATION]**
- The first captain is chosen at random; play rotates through the living
  captains.

## Turn structure

1. **Card trade-in:** if you hold a tradeable set you get one chance, at the
   top of your turn, to trade it or keep your hand.
2. **Reinforcements:** floor(countries owned ÷ 3), **minimum 2**, plus the
   bonus of each island you wholly hold, plus any set you just traded. If you
   hold a **Rally** card it is played automatically and doubles that total.
3. **Place armies** on your own countries in any split.
4. **Action phase:** Attack (repeatable), play Bombard cards from the Cards
   button, then end the turn with **Move** or **Pass**.
5. **Move (fortify):** one move of any number of troops from one of your
   countries to an adjacent one of yours, leaving at least 1 behind. This
   ends the turn. **Pass** ends it without moving.
6. **Card draw:** if you captured at least one country this turn, draw one
   card (see Cards).
7. **Random event check** (see Random events), then the next captain plays.

### Islands

| Island | Countries | Bonus |
| --- | --- | --- |
| Stormcrown | 9 | 8 |
| Levanter | 6 | 5 |
| Mistral | 6 | 5 |
| Boreas | 5 | 4 |
| Auster | 5 | 4 |
| Midmark | 4 | 3 |
| Skerryholm | 3 | 2 |
| The Cays | 4 | 2 |
| Ember Atoll | 4 | 2 |

The bonus values {8, 5, 5, 4, 4, 3, 2, 2, 2} are the original's; the map and
names are new. 13 sea lanes connect the islands.

## Combat

- Attack only an **adjacent** country (shared border, or a sea lane).
- **Eligibility rule (differs from Risk):** the attacking country needs at
  least **2 armies** and at least **as many armies as the defender**.
- You pick the target first, then the country to attack from.
- Each clash is a hidden d6 vs d6; the higher roll wins and the loser loses 1
  army. **Ties go to the defender.** **[INTERPRETATION: dice]**
- Each **Attack** click rolls one clash, or **5 clashes** when both stacks
  have 10+ armies. After a click you choose Attack again, **Auto**, or
  **Quit Attack**. Auto keeps rolling until the battle resolves or your stack
  is down to 2.
- If, after a click, your stack is smaller than the defender's, the assault
  stalls and ends (a 5-clash volley always rolls to completion unless the
  battle is decided).
- **Rout rule:** if the attacking stack is worn down to 1 army, you
  **forfeit the rest of your turn** (no move, but you still draw a card if you
  captured earlier this turn) **and the attacking country passes to the
  defender**.
- **Conquest:** when the defender reaches 0, you march in between 1 and
  (attacking armies − 1) troops, your choice.
- A captain with no countries left is eliminated. When every human has been
  eliminated, they may concede or watch the AI play out the rest at speed.

## Cards

- Capture at least one country during your turn to draw **one card** at the
  end of it.
- Draw odds (out of 16): Levy (5) ×3, Muster (8) ×3, Host (15) ×2, Rally ×2,
  Bombard ×2, Ward ×2, Wild ×1, Mutiny ×1. **[INTERPRETATION]**
- Hand limit **5**; on overflow you discard a card of your choice.
- Card types:
  - **Levy / Muster / Host (5 / 8 / 15 army cards)** — no effect on their own;
    they are traded in sets.
  - **Rally (Double)** — played automatically at the start of your next turn,
    doubling that turn's reinforcements (including a traded set).
  - **Bombard (Bomb)** — play during your action phase on any enemy country;
    it is cut to ⅓ of its armies (rounded down, min 1). **[INTERPRETATION]**
  - **Ward (Anti-Bomb)** — automatically blocks one bombardment of any of
    your countries, then is spent.
  - **Mutiny (Lose All Cards)** — never held: drawing it wipes your hand.
  - **Wild (Letter of Marque)** — stands in for any army card in a set.
- **Trade-in:** a set is three army cards of the same value, or two plus a
  Wild, or one plus two Wilds. Three Wilds is not a set, and Rally, Bombard
  and Ward cards cannot be traded. A set is worth **3× its face value**
  (5s → 15, 8s → 24, 15s → 45). **[INTERPRETATION]**
- Eliminated captains lose their hand (it is restored if they return from
  exile).

## Random events

After every captain's turn there is a chance of an event: **8% / 16% / 28% /
45%** for Calm / Restless / Wrathful / Cataclysm. **[INTERPRETATION]** The
event is one of six, equally likely:

1. **Earthquake** — 3–4 random countries each lose roughly half their armies
   (40–60%, min 1 left).
2. **Flood** — same effect as an earthquake.
3. **Rebellion** — one random country loses half its armies (min 1 left).
4. **Rebel takeover** — one random country, with its armies, switches to a
   random other living captain. This can eliminate its former owner.
5. **Production centers move** — all 5 relocate to new random countries.
6. **Production surge** — the armies on every production center double
   (capped at 999).

Production centers are marked with ⚓ and **light-blue** army counts.

**Exiles can return** (optional, off by default): while 3+ captains are
alive, 12% of events are instead a comeback — a captain who was eliminated
(and hasn't returned before) seizes a random country from a living captain who
holds more than one, with at least 3 armies there, and gets back the hand they
held when they fell. Each captain can return only once, and a human who chose to watch the
playout stays a spectator. If no comeback is
possible, a normal event fires instead.

## AI captains

AI captains follow the same rules. They always trade a set when they have
one, and rank changes how they play: Captain and above save Rally for a big
turn and build spearheads; Commodore and above also bombard (once per turn,
before reinforcing), focus on the weakest opponent and look a move ahead;
Admiral looks two moves ahead. AIs break off an attack before the rout rule
can bite.

## Scores

Wins and losses are kept per AI rank in the browser. A human victory is a
win; an AI victory, conceding, or stopping a playout is a loss. Starting a new
game or quitting mid-game while holding **fewer than 10 countries** also
records a loss (in hotseat, judged by the best-placed living human).
