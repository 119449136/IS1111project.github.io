/**
 * Player statistics, leak tracking and the practice plan.
 *
 * The numbers here are the ones a serious player actually tracks, computed the
 * standard way so they can be compared against published guidance. Everything
 * is derived from recorded hands, so a profile can always be rebuilt from its
 * hand log.
 */

import { LEAKS } from './coach.js';

export const PROFILE_VERSION = 3;
const MAX_HAND_LOG = 400;

export function createProfile() {
  return {
    version: PROFILE_VERSION,
    createdAt: Date.now(),
    counters: emptyCounters(),
    leaks: {},
    grades: { great: 0, good: 0, ok: 0, inaccuracy: 0, mistake: 0, blunder: 0 },
    streetLoss: { preflop: 0, flop: 0, turn: 0, river: 0 },
    handLog: [],
    sessions: [],
  };
}

function emptyCounters() {
  return {
    hands: 0,
    vpip: 0,
    pfr: 0,
    threeBet: 0,
    threeBetChances: 0,
    foldToThreeBet: 0,
    sawFlop: 0,
    wonWhenSawFlop: 0,
    showdowns: 0,
    showdownWins: 0,
    postflopBets: 0,
    postflopCalls: 0,
    postflopFolds: 0,
    netChips: 0,
    netBB: 0,
    decisions: 0,
    evLoss: 0,
    bigBlindsSeen: 0,
  };
}

/**
 * Fold a completed hand into a profile.
 *
 * @param {object} profile
 * @param {object} hand a record built by the app for one played hand
 */
export function recordHand(profile, hand) {
  const c = profile.counters;
  c.hands++;
  c.netChips += hand.net;
  c.netBB += hand.net / hand.bigBlind;

  if (hand.vpip) c.vpip++;
  if (hand.pfr) c.pfr++;
  if (hand.threeBetChance) c.threeBetChances++;
  if (hand.threeBet) c.threeBet++;
  if (hand.sawFlop) c.sawFlop++;
  if (hand.sawFlop && hand.net > 0) c.wonWhenSawFlop++;
  if (hand.showdown) c.showdowns++;
  if (hand.showdown && hand.net > 0) c.showdownWins++;

  c.postflopBets += hand.postflopBets ?? 0;
  c.postflopCalls += hand.postflopCalls ?? 0;
  c.postflopFolds += hand.postflopFolds ?? 0;

  for (const review of hand.reviews ?? []) {
    if (review.scored === false) continue;
    c.decisions++;
    c.evLoss += review.evLoss;
    const gradeKey = review.gradeKey ?? review.grade?.key;
    profile.grades[gradeKey] = (profile.grades[gradeKey] ?? 0) + 1;
    profile.streetLoss[review.street] = (profile.streetLoss[review.street] ?? 0) + review.evLoss / hand.bigBlind;
    for (const tag of review.tags) {
      const entry = profile.leaks[tag] ?? { count: 0, evLoss: 0, lastSeen: 0, examples: [] };
      entry.count++;
      entry.evLoss += review.evLoss / hand.bigBlind;
      entry.lastSeen = hand.handNumber;
      if (entry.examples.length < 5) {
        entry.examples.push({
          handNumber: hand.handNumber,
          street: review.street,
          summary: review.summary,
        });
      }
      profile.leaks[tag] = entry;
    }
  }

  profile.handLog.unshift(hand.summaryRow);
  if (profile.handLog.length > MAX_HAND_LOG) profile.handLog.length = MAX_HAND_LOG;
  return profile;
}

/**
 * A rate with no sample behind it is unknown, not zero. Returning null keeps
 * the app from telling a player their statistics are "low" before they have
 * played a hand.
 */
const safeRate = (num, den) => (den > 0 ? num / den : null);

/** The headline numbers, formatted for display. */
export function computeStats(profile) {
  const c = profile.counters;
  // No postflop action at all means the ratio is unknown; all bets and no
  // calls means it is unbounded. Neither is a number worth reporting.
  const aggressionFactor = c.postflopCalls > 0
    ? c.postflopBets / c.postflopCalls
    : (c.postflopBets > 0 ? Infinity : null);

  return {
    hands: c.hands,
    vpip: safeRate(c.vpip, c.hands),
    pfr: safeRate(c.pfr, c.hands),
    threeBet: safeRate(c.threeBet, c.threeBetChances),
    wtsd: safeRate(c.showdowns, c.sawFlop),
    wsd: safeRate(c.showdownWins, c.showdowns),
    wwsf: safeRate(c.wonWhenSawFlop, c.sawFlop),
    aggressionFactor,
    netBB: c.netBB,
    // Over a handful of hands this number is noise, so it is withheld rather
    // than reported as a wild figure the player might take seriously.
    bbPer100: c.hands >= 20 ? (c.netBB / c.hands) * 100 : null,
    evLossPerHand: safeRate(c.evLoss, c.hands),
    decisions: c.decisions,
    accuracy: safeRate(profile.grades.great + profile.grades.good, c.decisions),
  };
}

/**
 * Benchmarks for a solid small-stakes six-max regular, with the direction that
 * counts as an error in each case. Used to turn a raw percentage into advice.
 */
export const BENCHMARKS = [
  { key: 'vpip', label: 'VPIP', full: 'Hands played', low: 0.18, high: 0.28, format: 'pct',
    tooLow: 'You are folding a lot. Widen up in late position.',
    tooHigh: 'You are entering too many pots. Tighten your opening range.' },
  { key: 'pfr', label: 'PFR', full: 'Hands raised first in', low: 0.14, high: 0.26, format: 'pct',
    tooLow: 'Raise more of the hands you choose to play, rather than calling with them.',
    tooHigh: 'Slightly wild before the flop. Make sure your raises have a plan.' },
  { key: 'threeBet', label: '3-bet', full: 'Re-raises when facing a raise', low: 0.05, high: 0.11, format: 'pct',
    tooLow: 'Re-raise your strongest hands more often. Flat calling wastes them.',
    tooHigh: 'You are re-raising very often, which builds big pots with marginal holdings.' },
  { key: 'wtsd', label: 'WTSD', full: 'Reached showdown after seeing a flop', low: 0.24, high: 0.32, format: 'pct',
    tooLow: 'You may be giving up on hands with real showdown value.',
    tooHigh: 'You are paying to see too many showdowns. Fold earlier when you are beaten.' },
  { key: 'aggressionFactor', label: 'AF', full: 'Bets and raises per call after the flop', low: 1.6, high: 3.5, format: 'ratio',
    tooLow: 'Too passive after the flop. Betting wins pots that checking does not.',
    tooHigh: 'Very aggressive. Make sure the bluffs have equity behind them.' },
];

/** Compare the player's numbers against the benchmarks. */
export function benchmarkReport(stats) {
  return BENCHMARKS.map((b) => {
    const value = stats[b.key];
    const finite = value !== null && Number.isFinite(value);
    let verdict = 'on target';
    let advice = 'This is where it should be.';
    if (!finite || value === null) { verdict = 'no data'; advice = 'Play more hands to measure this.'; }
    else if (value < b.low) { verdict = 'low'; advice = b.tooLow; }
    else if (value > b.high) { verdict = 'high'; advice = b.tooHigh; }
    return { ...b, value, verdict, advice };
  });
}

/**
 * Rank the player's leaks. Cost matters more than frequency, but a mistake
 * made constantly is worth naming even when each instance is cheap.
 */
export function rankLeaks(profile) {
  return Object.entries(profile.leaks)
    .map(([tag, entry]) => ({
      tag,
      ...LEAKS[tag],
      count: entry.count,
      evLoss: entry.evLoss,
      examples: entry.examples ?? [],
      weight: entry.evLoss + entry.count * 0.35,
      costPerOccurrence: entry.count > 0 ? entry.evLoss / entry.count : 0,
    }))
    .filter((l) => l.title)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * The practice plan: the few things worth working on next, each with a drill.
 * Deliberately short. A list of twelve weaknesses is not a plan.
 */
export function practicePlan(profile, stats) {
  const leaks = rankLeaks(profile).slice(0, 3);
  const items = leaks.map((leak) => ({
    kind: 'leak',
    tag: leak.tag,
    title: leak.title,
    detail: leak.short,
    drill: leak.drill,
    cost: leak.evLoss,
    count: leak.count,
  }));

  // Add a statistical note when a headline number is clearly off, and the
  // decision-by-decision leaks have not already said the same thing.
  const covered = new Set(items.map((i) => i.tag));
  for (const b of benchmarkReport(stats)) {
    if (items.length >= 4) break;
    if (b.verdict === 'on target' || b.verdict === 'no data') continue;
    if (b.key === 'vpip' && (covered.has('preflop-loose') || covered.has('preflop-tight'))) continue;
    if (b.key === 'aggressionFactor' && covered.has('passive')) continue;
    items.push({
      kind: 'stat',
      tag: b.key,
      title: `${b.full} is ${b.verdict}`,
      detail: `Yours is ${formatStat(b.value, b.format)}, against a healthy range of ${formatStat(b.low, b.format)} to ${formatStat(b.high, b.format)}.`,
      drill: b.advice,
      cost: 0,
      count: 0,
    });
  }

  if (items.length === 0) {
    items.push({
      kind: 'ok',
      tag: 'none',
      title: 'Nothing standing out yet',
      detail: 'No repeated mistake has shown up in your hands so far.',
      drill: 'Keep playing. Patterns need a few dozen hands before they mean anything.',
      cost: 0,
      count: 0,
    });
  }
  return items;
}

export function formatStat(value, format) {
  if (!Number.isFinite(value)) return '-';
  if (format === 'ratio') return value.toFixed(1);
  return `${Math.round(value * 100)}%`;
}

/**
 * A single 0-100 number for the progress screen.
 *
 * It rewards accurate decisions and punishes expensive ones, then eases in
 * from a neutral starting point so a handful of hands cannot swing it wildly.
 */
export function skillScore(profile) {
  const c = profile.counters;
  if (c.decisions < 5) return { score: null, confidence: 0, sample: c.decisions };

  const lossPerDecision = c.evLoss / Math.max(1, c.decisions) / 2; // in big blinds
  const fromLoss = Math.max(0, 100 - lossPerDecision * 55);
  const accuracy = (profile.grades.great + profile.grades.good) / c.decisions;
  const blunderRate = (profile.grades.blunder + profile.grades.mistake) / c.decisions;
  const raw = fromLoss * 0.5 + accuracy * 100 * 0.4 + Math.max(0, 1 - blunderRate * 3) * 100 * 0.1;

  const confidence = Math.min(1, c.decisions / 120);
  const score = 55 + (raw - 55) * confidence;
  return {
    score: Math.max(1, Math.min(99, Math.round(score))),
    confidence,
    sample: c.decisions,
  };
}

/** Where the money is being lost, by street. */
export function streetBreakdown(profile) {
  const entries = Object.entries(profile.streetLoss);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return entries.map(([street, loss]) => ({
    street,
    loss,
    share: total > 0 ? loss / total : 0,
  }));
}

/** Recent form: average EV loss per decision over the last N hands. */
export function recentTrend(profile, window = 25) {
  const log = profile.handLog.slice(0, window * 2);
  if (log.length < 6) return null;
  const half = Math.floor(log.length / 2);
  const avg = (rows) => rows.reduce((s, r) => s + (r.lossBB ?? 0), 0) / Math.max(1, rows.length);
  const recent = avg(log.slice(0, half));      // handLog is newest first
  const older = avg(log.slice(half));
  return {
    recent,
    older,
    improving: recent < older - 0.05,
    worsening: recent > older + 0.05,
    delta: older - recent,
  };
}
