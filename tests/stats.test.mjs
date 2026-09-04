import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProfile, recordHand, computeStats, benchmarkReport, rankLeaks,
  practicePlan, skillScore, streetBreakdown, recentTrend, PROFILE_VERSION,
} from '../src/stats.js';

/** A recorded hand with sensible defaults, so tests state only what matters. */
const hand = (over = {}) => ({
  handNumber: 1,
  bigBlind: 2,
  net: 0,
  vpip: false,
  pfr: false,
  threeBet: false,
  threeBetChance: false,
  sawFlop: false,
  showdown: false,
  postflopBets: 0,
  postflopCalls: 0,
  postflopFolds: 0,
  reviews: [],
  summaryRow: { handNumber: 1, lossBB: 0, net: 0 },
  ...over,
});

const decision = (over = {}) => ({
  evLoss: 0, gradeKey: 'great', street: 'preflop', tags: [], summary: '', ...over,
});

test('a fresh profile is empty and versioned', () => {
  const p = createProfile();
  assert.equal(p.version, PROFILE_VERSION);
  assert.equal(computeStats(p).hands, 0);
  assert.deepEqual(rankLeaks(p), []);
});

test('counting stats are computed the standard way', () => {
  const p = createProfile();
  for (let i = 0; i < 10; i++) {
    recordHand(p, hand({
      handNumber: i,
      vpip: i < 4,                 // 4 of 10
      pfr: i < 3,                  // 3 of 10
      threeBetChance: i < 5,       // 5 opportunities
      threeBet: i < 1,             // 1 taken
      sawFlop: i < 6,              // 6 flops
      showdown: i < 2,             // 2 showdowns
      net: i < 5 ? 10 : -6,
      postflopBets: 3,
      postflopCalls: 2,
    }));
  }
  const s = computeStats(p);
  assert.equal(s.hands, 10);
  assert.equal(s.vpip, 0.4);
  assert.equal(s.pfr, 0.3);
  assert.equal(s.threeBet, 0.2, '3-bet is measured against opportunities, not hands');
  assert.ok(Math.abs(s.wtsd - 2 / 6) < 1e-9, 'showdowns are measured against flops seen');
  assert.equal(s.aggressionFactor, 1.5, 'bets and raises per call');
  assert.equal(p.counters.netChips, 20);
});

test('bb per hundred is withheld until the sample can support it', () => {
  const p = createProfile();
  for (let i = 0; i < 19; i++) recordHand(p, hand({ net: -4 }));
  assert.equal(computeStats(p).bbPer100, null);
  recordHand(p, hand({ net: -4 }));
  const s = computeStats(p);
  assert.equal(typeof s.bbPer100, 'number');
  assert.ok(Math.abs(s.bbPer100 - -200) < 1e-6, `got ${s.bbPer100}`);
});

test('an aggression factor with no calls does not report a bogus number', () => {
  const p = createProfile();
  recordHand(p, hand({ postflopBets: 2, postflopCalls: 0 }));
  const s = computeStats(p);
  assert.ok(!Number.isFinite(s.aggressionFactor));
  const af = benchmarkReport(s).find((b) => b.key === 'aggressionFactor');
  assert.equal(af.verdict, 'no data');
});

test('benchmarks name the direction a number is off in', () => {
  const p = createProfile();
  for (let i = 0; i < 30; i++) recordHand(p, hand({ vpip: true, pfr: true }));   // 100% / 100%
  const report = benchmarkReport(computeStats(p));
  assert.equal(report.find((b) => b.key === 'vpip').verdict, 'high');
  assert.equal(report.find((b) => b.key === 'pfr').verdict, 'high');

  const tight = createProfile();
  for (let i = 0; i < 30; i++) recordHand(tight, hand());                        // 0% / 0%
  const tightReport = benchmarkReport(computeStats(tight));
  assert.equal(tightReport.find((b) => b.key === 'vpip').verdict, 'low');
  assert.ok(tightReport.every((b) => b.advice), 'every benchmark carries advice');
});

test('leaks are ranked by what they cost, not only how often they happen', () => {
  const p = createProfile();
  // A cheap mistake made often, and an expensive one made rarely.
  for (let i = 0; i < 8; i++) {
    recordHand(p, hand({ reviews: [decision({ tags: ['limping'], evLoss: 0.4, gradeKey: 'ok' })] }));
  }
  recordHand(p, hand({ reviews: [decision({ tags: ['pot-odds'], evLoss: 40, gradeKey: 'blunder' })] }));

  const ranked = rankLeaks(p);
  assert.equal(ranked[0].tag, 'pot-odds', 'the expensive leak comes first');
  assert.equal(ranked[0].count, 1);
  assert.equal(ranked[1].tag, 'limping');
  assert.equal(ranked[1].count, 8);
  for (const leak of ranked) assert.ok(leak.title && leak.drill, 'each leak explains itself');
});

test('the practice plan is short, actionable and never empty', () => {
  const empty = practicePlan(createProfile(), computeStats(createProfile()));
  assert.equal(empty.length, 1);
  assert.match(empty[0].title, /Nothing standing out/);

  const p = createProfile();
  for (const tag of ['limping', 'pot-odds', 'over-bluffing', 'missed-value', 'passive']) {
    recordHand(p, hand({ reviews: [decision({ tags: [tag], evLoss: 8, gradeKey: 'mistake' })] }));
  }
  const plan = practicePlan(p, computeStats(p));
  assert.ok(plan.length <= 4, 'a plan is short enough to act on');
  for (const item of plan) assert.ok(item.drill, `${item.title} has a drill`);
});

test('the skill score needs a sample and stays inside its range', () => {
  const p = createProfile();
  assert.equal(skillScore(p).score, null);

  const good = createProfile();
  for (let i = 0; i < 200; i++) {
    recordHand(good, hand({ reviews: [decision({ evLoss: 0, gradeKey: 'great' })] }));
  }
  const bad = createProfile();
  for (let i = 0; i < 200; i++) {
    recordHand(bad, hand({ reviews: [decision({ evLoss: 12, gradeKey: 'blunder' })] }));
  }
  const g = skillScore(good).score;
  const b = skillScore(bad).score;
  assert.ok(g > b, `clean play should score above careless play (${g} vs ${b})`);
  for (const n of [g, b]) assert.ok(n >= 1 && n <= 99, `score ${n} is in range`);
  assert.equal(skillScore(good).confidence, 1);
});

test('lost value is attributed to the street it happened on', () => {
  const p = createProfile();
  recordHand(p, hand({ reviews: [
    decision({ street: 'preflop', evLoss: 2 }),
    decision({ street: 'river', evLoss: 18 }),
  ] }));
  const breakdown = streetBreakdown(p);
  const river = breakdown.find((b) => b.street === 'river');
  assert.equal(river.loss, 9);            // 18 chips at a big blind of 2
  assert.ok(river.share > 0.8);
  assert.equal(breakdown.reduce((s, b) => s + b.share, 0).toFixed(4), '1.0000');
});

test('recent form compares the latest hands against the earlier ones', () => {
  const p = createProfile();
  for (let i = 0; i < 20; i++) recordHand(p, hand({ summaryRow: { handNumber: i, lossBB: 5 } }));
  for (let i = 0; i < 20; i++) recordHand(p, hand({ summaryRow: { handNumber: 20 + i, lossBB: 0.1 } }));
  const trend = recentTrend(p);
  assert.ok(trend.improving, 'a player who stopped making mistakes is improving');
  assert.ok(trend.recent < trend.older);
});

test('the hand log keeps newest first and stays bounded', () => {
  const p = createProfile();
  for (let i = 0; i < 450; i++) recordHand(p, hand({ handNumber: i, summaryRow: { handNumber: i, lossBB: 0 } }));
  assert.equal(p.handLog.length, 400, 'the log is capped');
  assert.equal(p.handLog[0].handNumber, 449, 'newest hand is first');
});
