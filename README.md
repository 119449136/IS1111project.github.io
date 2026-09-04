# Poker Trainer

A no-limit hold'em trainer that runs in a phone browser. Pick the number of
players, play hands against bots with distinct styles, and have every decision
graded as you make it. The app tracks what you did, works out what you keep
getting wrong, and turns that into a short list of things to practise.

It is a static site with no build step, no server and no account. Every hand
you play stays on your device.

## Install it on a phone

The app is served from GitHub Pages at the repository's site URL. Open it in
Safari or Chrome and use **Add to Home Screen**. It then launches full screen
and works with no connection.

## Run it locally

```
npm install       # only needed for the tests and the interface check
npm run serve     # http://localhost:8123/
```

Any static file server works. The app is plain ES modules, so it has to be
served over HTTP rather than opened from the filesystem.

## What it does

**Play.** Choose 2 to 9 players and a stack depth from 40 to 200 big blinds.
Every hand starts at that depth, so the pot odds and commitment decisions stay
comparable from one hand to the next. Results are tracked as a session total
rather than as a stack you have to grind back.

**Coaching.** Each decision is graded from *Great* to *Blunder* against an
estimate of what it cost, in big blinds. Before the flop that means comparing
your hand against the opening, three-betting and calling range for your seat.
After the flop it means simulating the hand to the river against the range each
opponent's betting suggests, then checking your action against the price you
were being offered. The explanation always quotes the numbers, so you can
check the reasoning rather than take it on trust.

**Progress.** The statistics a serious player tracks: VPIP, PFR, three-bet
percentage, went-to-showdown, aggression factor, and big blinds won per hundred
hands. Each is shown against the range a solid small-stakes regular sits in,
with a note when yours is outside it. Losses are also split by street, which
usually points straight at the part of the game that needs work.

**Practice.** Repeated mistakes are grouped into named leaks, ranked by what
they cost rather than by how often they happen, and each comes with a drill.
There is also a chart of which hands to open from every seat, and notes on how
to play against each bot.

**Hands.** Every hand is logged with its cards, board, result and full grading,
so you can go back and look at a spot again.

## The opponents

Seven profiles, each a consistent set of tendencies rather than a difficulty
level. Measured over three thousand hands at a seven-handed table, the share of
hands they play and the share they raise come out like this:

| Bot | Style | VPIP | PFR |
| --- | --- | --- | --- |
| Granite | Nit | 11% | 5% |
| Mira | Tight-aggressive | 22% | 13% |
| Ada | Thinking regular | 26% | 16% |
| Nils | Loose-passive | 34% | 8% |
| Rey | Loose-aggressive | 38% | 25% |
| Bo | Calling station | 46% | 10% |
| Vex | Maniac | 63% | 47% |

The passive styles show up in the gap between the two columns: Bo enters
nearly half the pots but raises one in five of them, while Rey raises most of
the ones he enters.

The bots see only their own cards and the public betting, exactly as you do.
Nothing in the code reads another player's hole cards.

## How it is put together

| File | What it does |
| --- | --- |
| `src/cards.js` | Card model, deck, shuffling, seeded random numbers |
| `src/evaluator.js` | Seven-card hand evaluator |
| `src/equity.js` | Monte-Carlo equity, draw and out counting |
| `src/ranges.js` | The 169-hand ranking and every positional chart |
| `src/engine.js` | Betting rules, blinds, side pots, showdown |
| `src/bots.js` | Opponent profiles and their decisions |
| `src/coach.js` | Grades a decision and names the leak |
| `src/stats.js` | Statistics, benchmarks, leak ranking, practice plan |
| `src/storage.js` | Local persistence |
| `src/ui/` | The screens |

Cards are integers and the evaluator allocates nothing on its hot path,
because the coach runs several thousand simulations for every postflop
decision and has to do it without the interface stuttering.

Every chart in the app is a slice of one ranking of the 169 starting hands.
Working from a single ordering keeps the charts consistent with each other, and
range widths are counted by combination rather than by hand code, since a pair
is six of the 1326 possible combinations and an offsuit hand is twelve.

## Tests

```
npm test          # 69 unit tests
npm run ui-check  # drives the real app in a browser (needs npm run serve)
```

The evaluator is checked against an exhaustive search: for twenty thousand
random seven-card hands, its answer must equal the best of all twenty-one
five-card subsets. The engine is fuzzed over four hundred hands of random legal
actions across every table size, asserting that chips are never created or
destroyed, that no stack goes negative, that a folded or all-in player is never
asked to act, and that every hand terminates. Equity figures are checked against
published numbers, and the range charts are pinned so a future edit cannot
quietly start opening 32s from under the gun.

The interface check plays hands in a real browser at phone size, opens every
screen, verifies nothing overflows at 2, 6 and 9 players down to a 320px wide
screen, and confirms the app still loads with the network switched off.

## A note on the numbers

Postflop expected value is computed for the current street only and ignores
what happens on later ones, so implied odds are approximated rather than
solved. The coach says a close decision is close instead of claiming a
precision it does not have. The preflop charts are conventional ones, not
solver output; they are a good baseline to learn from, not a solved strategy.
