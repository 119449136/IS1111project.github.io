/**
 * Preflop ranges.
 *
 * Every chart in the app is expressed as a slice of one curated ordering of
 * the 169 starting hands. Working from a single ordering keeps charts mutually
 * consistent: a hand that opens from under the gun always opens on the button,
 * and "top 15%" means the same thing everywhere.
 *
 * Percentages are combination weighted, not hand weighted. A pair is 6 of the
 * 1326 possible combinations, a suited hand 4 and an offsuit hand 12, so
 * counting hand codes would badly misreport how wide a range really is.
 */

import { RANKS, makeCard } from './cards.js';

/** Strongest to weakest. Ordering follows standard 6-max cash-game charts. */
export const HAND_RANKING = `
AA KK QQ JJ AKs AKo AQs TT AQo AJs KQs 99 ATs KJs AJo 88 QJs KTs
ATo KQo QTs JTs 77 A9s A8s KJo K9s T9s QJo A7s A5s 66 J9s Q9s A6s
A4s A3s A2s K8s JTo QTo KTo T8s 98s 55
K7s Q8s J8s 87s A9o 44 K6s K5s Q7s T7s 76s 33 K4s J7s 97s A8o 22
K3s K2s Q6s Q5s 65s 86s Q4s J6s T6s 54s A7o
Q3s Q2s J5s 96s 75s K9o J4s T5s 64s A6o 85s Q9o J9o A5o 53s T9o
J3s A4o 95s 43s K8o A3o T4s 98o A2o 74s K7o 84s Q8o 63s J8o T3s
Q7o 94s T8o J7o 52s T2s 93s K6o 42s 87o 73s 97o 32s 83s J6o Q6o
62s J2s 92s 82s 72s
K5o K4o K3o K2o Q5o Q4o Q3o Q2o J5o J4o J3o J2o T7o T6o T5o T4o
T3o T2o 96o 95o 94o 93o 92o 86o 85o 84o 83o 82o 76o 75o 74o 73o
72o 65o 64o 63o 62o 54o 53o 52o 43o 42o 32o
`.trim().split(/\s+/);

export const TOTAL_COMBOS = 1326;

/** Number of the 1326 two-card combinations a hand code covers. */
export function comboCount(code) {
  if (code.length === 2) return 6;
  return code[2] === 's' ? 4 : 12;
}

const RANK_INDEX = new Map();
const CUMULATIVE = new Float64Array(HAND_RANKING.length);
{
  let combos = 0;
  for (let i = 0; i < HAND_RANKING.length; i++) {
    RANK_INDEX.set(HAND_RANKING[i], i);
    combos += comboCount(HAND_RANKING[i]);
    CUMULATIVE[i] = (combos / TOTAL_COMBOS) * 100;
  }
}

/** 0 = the very best hand, 168 = the worst. */
export const strengthIndex = (code) => RANK_INDEX.get(code) ?? HAND_RANKING.length - 1;

/**
 * The narrowest top-of-range percentage that still contains this hand.
 * AA is about 0.45, 72o is 100.
 */
export const percentileOf = (code) => CUMULATIVE[strengthIndex(code)];

/** Set of hand codes making up the strongest `pct` percent of all hands. */
export function topPercent(pct) {
  const set = new Set();
  if (pct <= 0) return set;
  for (let i = 0; i < HAND_RANKING.length; i++) {
    set.add(HAND_RANKING[i]);
    if (CUMULATIVE[i] >= pct) break;
  }
  return set;
}

// ---------------------------------------------------------------------------
// Table positions
// ---------------------------------------------------------------------------

/**
 * Position labels indexed by seats clockwise from the button, so index 0 is
 * always the button, 1 the small blind and 2 the big blind. Heads up the
 * button posts the small blind and there is no separate small-blind seat.
 */
const POSITION_TABLE = {
  2: ['BTN', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'CO'],
  5: ['BTN', 'SB', 'BB', 'HJ', 'CO'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
  7: ['BTN', 'SB', 'BB', 'UTG', 'MP', 'HJ', 'CO'],
  8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO'],
  9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO'],
};

export const POSITION_FULL_NAMES = {
  BTN: 'the button', SB: 'the small blind', BB: 'the big blind',
  UTG: 'under the gun', 'UTG+1': 'under the gun plus one', MP: 'middle position',
  LJ: 'the lojack', HJ: 'the hijack', CO: 'the cutoff',
};

export function positionsForTable(playerCount) {
  const n = Math.max(2, Math.min(9, playerCount | 0));
  return POSITION_TABLE[n];
}

/**
 * Label for a seat, given how many seats clockwise it sits from the button.
 */
export function positionLabel(seatsFromButton, playerCount) {
  const table = positionsForTable(playerCount);
  return table[seatsFromButton % table.length];
}

/**
 * Positions in the order they act before the flop, from first to last, with
 * the big blind left out because it never opens the pot.
 */
export function actionOrderPositions(playerCount) {
  const labels = positionsForTable(playerCount);
  return [...labels.slice(3), ...labels.slice(0, 3)].filter((p) => p !== 'BB');
}

/**
 * How wide each position opens when nobody has entered the pot yet.
 * Blind-versus-blind play is much wider than a full-ring open, which is why
 * the small blind is looser here than the cutoff.
 */
const RFI_PERCENT = {
  UTG: 15, 'UTG+1': 16.5, MP: 18.5, LJ: 21, HJ: 24, CO: 30, BTN: 46, SB: 42, BB: 100,
};

/** Raise-first-in range for a position, adjusted for a short-handed table. */
export function openRangePercent(pos, playerCount) {
  let pct = RFI_PERCENT[pos] ?? 20;
  if (playerCount === 2) {
    // Heads up the button opens close to any two cards and the big blind
    // defends enormously wide.
    if (pos === 'BTN') pct = 82;
    if (pos === 'BB') pct = 100;
  } else if (playerCount <= 4 && pos !== 'BB') {
    pct = Math.min(100, pct * 1.2);
  }
  return pct;
}

/** Value-plus-bluff three-betting range facing a single raise. */
export function threeBetPercent(pos, openerPos, playerCount) {
  const base = { BTN: 9, CO: 7.5, HJ: 6.5, LJ: 6, MP: 6, UTG: 5, 'UTG+1': 5, SB: 8, BB: 10 };
  let pct = base[pos] ?? 6;
  // Punish late-position steals harder than an early-position open.
  if (openerPos === 'BTN' || openerPos === 'SB') pct *= 1.5;
  else if (openerPos === 'CO') pct *= 1.25;
  else if (openerPos === 'UTG' || openerPos === 'UTG+1') pct *= 0.75;
  if (playerCount === 2) pct *= 1.8;
  return Math.min(100, pct);
}

/**
 * Flat-calling range facing a raise. Cold calling out of position is a losing
 * habit, so the range narrows sharply outside the blinds and the button.
 */
export function callRangePercent(pos, openerPos, playerCount) {
  if (pos === 'BB') return playerCount === 2 ? 78 : 42;
  if (pos === 'SB') return 14;
  if (pos === 'BTN') return 26;
  if (pos === 'CO') return 20;
  return 15;
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

/**
 * All two-card combinations for a hand code, as [cardA, cardB] pairs.
 */
export function combosOf(code) {
  const hi = RANKS.indexOf(code[0]);
  const lo = RANKS.indexOf(code[1]);
  const out = [];
  if (code.length === 2) {
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) out.push([makeCard(hi, a), makeCard(lo, b)]);
    }
  } else if (code[2] === 's') {
    for (let s = 0; s < 4; s++) out.push([makeCard(hi, s), makeCard(lo, s)]);
  } else {
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) if (a !== b) out.push([makeCard(hi, a), makeCard(lo, b)]);
    }
  }
  return out;
}

/**
 * Pre-expand a percentage range into a flat list of concrete combinations so
 * the simulator can pick one with a single random index.
 */
export function expandRange(pct) {
  const out = [];
  for (const code of topPercent(pct)) {
    for (const combo of combosOf(code)) out.push(combo);
  }
  return out;
}

const rangeCache = new Map();

/** Cached combination list for a top-`pct` range, rounded to half a percent. */
export function rangeCombos(pct) {
  const key = Math.round(pct * 2) / 2;
  let list = rangeCache.get(key);
  if (!list) {
    list = expandRange(key);
    rangeCache.set(key, list);
  }
  return list;
}

/** Grid of all 169 hands laid out as the conventional 13x13 chart. */
export function chartGrid() {
  const rows = [];
  for (let i = 12; i >= 0; i--) {
    const row = [];
    for (let j = 12; j >= 0; j--) {
      if (i === j) row.push(RANKS[i] + RANKS[j]);
      else if (i > j) row.push(RANKS[i] + RANKS[j] + 's');
      else row.push(RANKS[j] + RANKS[i] + 'o');
    }
    rows.push(row);
  }
  return rows;
}
