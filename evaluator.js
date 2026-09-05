/**
 * Seven-card hand evaluator.
 *
 * evaluate() returns a single integer; a bigger integer is a better hand and
 * equal integers are a genuine tie (chop). Encoding is
 *   category * 16^5 + k1*16^4 + k2*16^3 + k3*16^2 + k4*16 + k5
 * with each kicker a rank 0..12, so ordinary integer comparison ranks hands.
 *
 * No allocation happens on the hot path: scratch arrays are module-level and
 * reused, because the Monte-Carlo simulator calls this millions of times per
 * session on a phone.
 */

import { rankOf, suitOf, RANKS } from './cards.js';

export const CATEGORY = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  TRIPS: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
};

export const CATEGORY_NAMES = [
  'High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight',
  'Flush', 'Full house', 'Four of a kind', 'Straight flush',
];

const rankCounts = new Int32Array(13);
const suitCounts = new Int32Array(13);
const suitMasks = new Int32Array(4);

const encode = (cat, a = 0, b = 0, c = 0, d = 0, e = 0) =>
  cat * 1048576 + a * 65536 + b * 4096 + c * 256 + d * 16 + e;

/**
 * Highest straight contained in a 13-bit rank mask, or -1.
 * Returns the rank index of the straight's top card (3 == the wheel's five).
 */
function straightHigh(mask) {
  // Shift up one bit and hang the ace off the bottom so A-2-3-4-5 is just
  // another run of five consecutive bits.
  const m = ((mask << 1) | ((mask >> 12) & 1)) & 0x3fff;
  for (let top = 13; top >= 4; top--) {
    if (((m >> (top - 4)) & 0b11111) === 0b11111) return top - 1;
  }
  return -1;
}

/** Rank index of the highest set bit in a mask. */
const topBit = (mask) => 31 - Math.clz32(mask);

/**
 * Score a hand of 5, 6 or 7 cards.
 * @param {number[]|Int32Array} cards card integers
 * @param {number} [count] how many entries of `cards` to read
 */
export function evaluate(cards, count = cards.length) {
  rankCounts.fill(0);
  suitCounts[0] = suitCounts[1] = suitCounts[2] = suitCounts[3] = 0;
  suitMasks[0] = suitMasks[1] = suitMasks[2] = suitMasks[3] = 0;
  let rankMask = 0;

  for (let i = 0; i < count; i++) {
    const card = cards[i];
    const r = rankOf(card);
    const s = suitOf(card);
    rankCounts[r]++;
    suitCounts[s]++;
    suitMasks[s] |= 1 << r;
    rankMask |= 1 << r;
  }

  // Flush family. With seven cards at most one suit can reach five.
  for (let s = 0; s < 4; s++) {
    if (suitCounts[s] < 5) continue;
    const fm = suitMasks[s];
    const sf = straightHigh(fm);
    if (sf >= 0) return encode(CATEGORY.STRAIGHT_FLUSH, sf);
    let m = fm;
    const k = [];
    for (let i = 0; i < 5; i++) {
      const t = topBit(m);
      k.push(t);
      m &= ~(1 << t);
    }
    return encode(CATEGORY.FLUSH, k[0], k[1], k[2], k[3], k[4]);
  }

  // Group ranks by multiplicity, highest rank first.
  let quad = -1;
  let trips = -1;
  let tripsLow = -1;
  let pairHi = -1;
  let pairLo = -1;
  for (let r = 12; r >= 0; r--) {
    const c = rankCounts[r];
    if (c === 4) { if (quad < 0) quad = r; }
    else if (c === 3) { if (trips < 0) trips = r; else if (tripsLow < 0) tripsLow = r; }
    else if (c === 2) { if (pairHi < 0) pairHi = r; else if (pairLo < 0) pairLo = r; }
  }

  if (quad >= 0) {
    let best = -1;
    for (let r = 12; r >= 0; r--) {
      if (r !== quad && rankCounts[r] > 0) { best = r; break; }
    }
    return encode(CATEGORY.QUADS, quad, best);
  }

  if (trips >= 0 && (pairHi >= 0 || tripsLow >= 0)) {
    // A second set plays as a pair, and only its top two cards are used.
    const pair = tripsLow > pairHi ? tripsLow : pairHi;
    return encode(CATEGORY.FULL_HOUSE, trips, pair);
  }

  const st = straightHigh(rankMask);
  if (st >= 0) return encode(CATEGORY.STRAIGHT, st);

  if (trips >= 0) {
    const k = [];
    for (let r = 12; r >= 0 && k.length < 2; r--) {
      if (r !== trips && rankCounts[r] > 0) k.push(r);
    }
    return encode(CATEGORY.TRIPS, trips, k[0], k[1]);
  }

  if (pairHi >= 0 && pairLo >= 0) {
    let kicker = -1;
    for (let r = 12; r >= 0; r--) {
      if (r !== pairHi && r !== pairLo && rankCounts[r] > 0) { kicker = r; break; }
    }
    return encode(CATEGORY.TWO_PAIR, pairHi, pairLo, kicker);
  }

  if (pairHi >= 0) {
    const k = [];
    for (let r = 12; r >= 0 && k.length < 3; r--) {
      if (r !== pairHi && rankCounts[r] > 0) k.push(r);
    }
    return encode(CATEGORY.PAIR, pairHi, k[0], k[1], k[2]);
  }

  let m = rankMask;
  const k = [];
  for (let i = 0; i < 5; i++) {
    const t = topBit(m);
    k.push(t);
    m &= ~(1 << t);
  }
  return encode(CATEGORY.HIGH_CARD, k[0], k[1], k[2], k[3], k[4]);
}

export const categoryOf = (score) => Math.floor(score / 1048576);

const kickersOf = (score) => {
  const rest = score % 1048576;
  return [
    Math.floor(rest / 65536) % 16,
    Math.floor(rest / 4096) % 16,
    Math.floor(rest / 256) % 16,
    Math.floor(rest / 16) % 16,
    rest % 16,
  ];
};

const RANK_PLURALS = [
  'Deuces', 'Threes', 'Fours', 'Fives', 'Sixes', 'Sevens', 'Eights', 'Nines',
  'Tens', 'Jacks', 'Queens', 'Kings', 'Aces',
];
const plural = (r) => RANK_PLURALS[r];

/** Singular rank words, so a hand reads as "Ace high", never "A high". */
const RANK_WORDS = [
  'Deuce', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Jack', 'Queen', 'King', 'Ace',
];
const word = (r) => RANK_WORDS[r];

/** Readable name for a score, e.g. "Flush, ace high" or "Kings full of Threes". */
export function describe(score) {
  const cat = categoryOf(score);
  const k = kickersOf(score);
  switch (cat) {
    case CATEGORY.STRAIGHT_FLUSH:
      return k[0] === 12 ? 'Royal flush' : `Straight flush, ${word(k[0])} high`;
    case CATEGORY.QUADS: return `Four ${plural(k[0])}`;
    case CATEGORY.FULL_HOUSE: return `${plural(k[0])} full of ${plural(k[1])}`;
    case CATEGORY.FLUSH: return `Flush, ${word(k[0])} high`;
    case CATEGORY.STRAIGHT: return `Straight, ${word(k[0])} high`;
    case CATEGORY.TRIPS: return `Three ${plural(k[0])}`;
    case CATEGORY.TWO_PAIR: return `Two pair, ${plural(k[0])} and ${plural(k[1])}`;
    case CATEGORY.PAIR: return `Pair of ${plural(k[0])}`;
    default: return `${word(k[0])} high`;
  }
}
