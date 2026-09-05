/**
 * Monte-Carlo equity and draw analysis.
 *
 * Everything the coach says about a decision ultimately rests on a number from
 * here, so this module is written for speed: fixed scratch buffers, a bitmask
 * of dead cards and no allocation inside the simulation loop. A few thousand
 * trials run in single-digit milliseconds, which keeps the interface
 * responsive on a phone.
 */

import { rankOf, suitOf } from './cards.js';
import { evaluate, categoryOf, CATEGORY } from './evaluator.js';
import { rangeCombos } from './ranges.js';

const heroBuf = new Int32Array(7);
const oppBuf = new Int32Array(7);
const boardBuf = new Int32Array(5);
const dead = new Uint8Array(52);

/**
 * Hero's share of the pot against `opponents` unknown hands.
 *
 * @param {object} spec
 * @param {number[]} spec.hero two hole cards
 * @param {number[]} [spec.board] zero, three, four or five board cards
 * @param {number} [spec.opponents] how many hands to run hero against
 * @param {number|number[]} [spec.rangePct] opponent range width, as a top
 *   percentage of all starting hands. 100 means any two cards. An array
 *   assigns a different width to each opponent.
 * @param {number} [spec.sims] trials to run
 * @param {function} [spec.rng]
 * @returns {{equity:number, win:number, tie:number, lose:number, sims:number}}
 */
export function equity({ hero, board = [], opponents = 1, rangePct = 100, sims = 3000, rng = Math.random }) {
  const pcts = Array.isArray(rangePct)
    ? rangePct
    : new Array(opponents).fill(rangePct);

  dead.fill(0);
  dead[hero[0]] = 1;
  dead[hero[1]] = 1;
  for (const c of board) dead[c] = 1;

  const known = board.length;
  const toCome = 5 - known;
  const oppCards = new Int32Array(opponents * 2);

  let win = 0;
  let tie = 0;
  let lose = 0;

  for (let s = 0; s < sims; s++) {
    // Undo the previous trial rather than rebuilding the mask from scratch.
    let placed = 0;
    let failed = false;

    for (let o = 0; o < opponents && !failed; o++) {
      const combos = rangeCombos(pcts[o] ?? 100);
      let a = -1;
      let b = -1;
      for (let attempt = 0; attempt < 24; attempt++) {
        const combo = combos[(rng() * combos.length) | 0];
        if (!dead[combo[0]] && !dead[combo[1]]) { a = combo[0]; b = combo[1]; break; }
      }
      if (a < 0) {
        // The range is blocked by known cards; fall back to any live cards so
        // a trial is never silently dropped.
        a = drawFree(rng);
        b = drawFree(rng);
        if (a < 0 || b < 0) { failed = true; break; }
      }
      dead[a] = 1;
      dead[b] = 1;
      oppCards[o * 2] = a;
      oppCards[o * 2 + 1] = b;
      placed += 2;
    }

    if (!failed) {
      for (let i = 0; i < known; i++) boardBuf[i] = board[i];
      for (let i = known; i < 5; i++) {
        const c = drawFree(rng);
        boardBuf[i] = c;
        dead[c] = 1;
      }

      heroBuf[0] = hero[0];
      heroBuf[1] = hero[1];
      for (let i = 0; i < 5; i++) heroBuf[i + 2] = boardBuf[i];
      const heroScore = evaluate(heroBuf, 7);

      let bestOpp = -1;
      let tiedOpponents = 0;
      for (let o = 0; o < opponents; o++) {
        oppBuf[0] = oppCards[o * 2];
        oppBuf[1] = oppCards[o * 2 + 1];
        for (let i = 0; i < 5; i++) oppBuf[i + 2] = boardBuf[i];
        const sc = evaluate(oppBuf, 7);
        if (sc > bestOpp) { bestOpp = sc; tiedOpponents = 1; }
        else if (sc === bestOpp) tiedOpponents++;
      }

      if (heroScore > bestOpp) win++;
      else if (heroScore < bestOpp) lose++;
      else tie += 1 / (tiedOpponents + 1);

      for (let i = known; i < 5; i++) dead[boardBuf[i]] = 0;
    }

    for (let o = 0; o < placed / 2; o++) {
      dead[oppCards[o * 2]] = 0;
      dead[oppCards[o * 2 + 1]] = 0;
    }
  }

  const total = win + lose + tie;
  const denom = total > 0 ? sims : 1;
  return {
    equity: (win + tie) / denom,
    win: win / denom,
    tie: tie / denom,
    lose: lose / denom,
    sims,
  };
}

function drawFree(rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const c = (rng() * 52) | 0;
    if (!dead[c]) return c;
  }
  for (let c = 0; c < 52; c++) if (!dead[c]) return c;
  return -1;
}

/**
 * Structural read of hero's hand on a board: what is made now, what is drawing
 * and how many cards improve it. The coach quotes these in plain language, so
 * they are described as a player would say them out loud.
 */
export function analyseHand(hero, board) {
  const all = hero.concat(board);
  const made = evaluate(all, all.length);
  const category = categoryOf(made);

  const suitCount = [0, 0, 0, 0];
  const rankMask = { board: 0, all: 0 };
  for (const c of board) rankMask.board |= 1 << rankOf(c);
  for (const c of all) { suitCount[suitOf(c)]++; rankMask.all |= 1 << rankOf(c); }

  const heroSuits = [suitOf(hero[0]), suitOf(hero[1])];
  let flushDraw = false;
  let backdoorFlush = false;
  for (let s = 0; s < 4; s++) {
    if (!heroSuits.includes(s)) continue;
    if (suitCount[s] === 4 && board.length >= 3 && board.length < 5) flushDraw = true;
    if (suitCount[s] === 3 && board.length === 3) backdoorFlush = true;
  }

  const straight = straightDraws(rankMask.all);
  const openEnded = straight.openEnded && category < CATEGORY.STRAIGHT;
  const gutshot = !openEnded && straight.gutshot && category < CATEGORY.STRAIGHT;

  // Overcards only count when hero has no pair to speak of.
  let overcards = 0;
  if (category <= CATEGORY.HIGH_CARD && board.length >= 3) {
    let topBoard = -1;
    for (const c of board) topBoard = Math.max(topBoard, rankOf(c));
    for (const c of hero) if (rankOf(c) > topBoard) overcards++;
  }

  let outs = 0;
  if (flushDraw) outs += 9;
  if (openEnded) outs += flushDraw ? 6 : 8;      // discount shared cards
  else if (gutshot) outs += flushDraw ? 3 : 4;
  if (!flushDraw && !openEnded && !gutshot) outs += overcards * 3;

  const cardsToCome = board.length === 3 ? 2 : board.length === 4 ? 1 : 0;

  return {
    score: made,
    category,
    flushDraw,
    backdoorFlush,
    openEnded,
    gutshot,
    overcards,
    outs,
    cardsToCome,
    isDraw: flushDraw || openEnded || gutshot,
    madeHand: category >= CATEGORY.PAIR,
    strongMade: category >= CATEGORY.TWO_PAIR,
    pairKind: pairKind(hero, board, category),
  };
}

/** Which pair hero holds: top, second, under, pocket over, or none. */
function pairKind(hero, board, category) {
  if (category !== CATEGORY.PAIR || board.length === 0) return null;
  const boardRanks = board.map(rankOf).sort((a, b) => b - a);
  const hr = [rankOf(hero[0]), rankOf(hero[1])];
  if (hr[0] === hr[1]) {
    return hr[0] > boardRanks[0] ? 'overpair' : 'underpair';
  }
  const paired = hr.find((r) => boardRanks.includes(r));
  if (paired === undefined) return null;
  const idx = boardRanks.indexOf(paired);
  if (idx === 0) return 'top pair';
  if (idx === 1) return 'second pair';
  return 'weak pair';
}

/** Does a rank mask contain an open-ended draw or a gutshot? */
function straightDraws(mask) {
  const m = ((mask << 1) | ((mask >> 12) & 1)) & 0x3fff;
  let openEnded = false;
  let gutshot = false;
  for (let top = 13; top >= 4; top--) {
    const window = (m >> (top - 4)) & 0b11111;
    const bits = popcount(window);
    if (bits === 5) return { openEnded: false, gutshot: false, made: true };
    if (bits === 4) {
      // Four to a straight. It is open ended when the missing card sits at
      // either end and both extensions are live.
      if ((window & 0b00001) === 0 || (window & 0b10000) === 0) openEnded = true;
      else gutshot = true;
    }
  }
  return { openEnded, gutshot, made: false };
}

function popcount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  return (((x + (x >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/**
 * The classic rule of thumb, kept honest: a rough equity from an out count.
 * Used only to explain a decision in words, never to make one.
 */
export const outsToEquity = (outs, cardsToCome) =>
  Math.min(0.95, cardsToCome === 2 ? outs * 0.04 : outs * 0.02);
