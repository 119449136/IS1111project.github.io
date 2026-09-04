import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAND_RANKING, percentileOf, topPercent, comboCount, TOTAL_COMBOS,
  openRangePercent, positionsForTable, combosOf, chartGrid, strengthIndex,
} from '../src/ranges.js';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function allHandCodes() {
  const out = new Set();
  for (let i = 12; i >= 0; i--) {
    for (let j = i; j >= 0; j--) {
      if (i === j) out.add(RANKS[i] + RANKS[j]);
      else { out.add(RANKS[i] + RANKS[j] + 's'); out.add(RANKS[i] + RANKS[j] + 'o'); }
    }
  }
  return out;
}

test('the ranking contains all 169 starting hands exactly once', () => {
  assert.equal(HAND_RANKING.length, 169);
  assert.equal(new Set(HAND_RANKING).size, 169);
  assert.deepEqual(new Set(HAND_RANKING), allHandCodes());
});

test('combination counts add up to a full deck of match-ups', () => {
  const total = HAND_RANKING.reduce((s, c) => s + comboCount(c), 0);
  assert.equal(total, TOTAL_COMBOS);
  assert.equal(TOTAL_COMBOS, (52 * 51) / 2);
});

test('every hand code expands to the right number of real combinations', () => {
  for (const code of HAND_RANKING) {
    const combos = combosOf(code);
    assert.equal(combos.length, comboCount(code), code);
    for (const [a, b] of combos) assert.notEqual(a, b, `${code} used a card twice`);
    assert.equal(new Set(combos.map(([a, b]) => `${a}-${b}`)).size, combos.length, `${code} repeated a combination`);
  }
});

test('better hands rank ahead of worse ones', () => {
  const ordered = [
    ['AA', 'KK'], ['KK', 'QQ'], ['AKs', 'AKo'], ['AKo', 'AQo'],
    ['AQs', 'AJs'], ['JJ', '99'], ['99', '55'], ['KQs', 'KJs'],
    ['AJs', 'A9s'], ['T9s', 'T7s'], ['A5s', 'A5o'], ['76s', '76o'],
    ['QJs', 'Q9s'], ['A2s', '32s'], ['A2o', '72o'],
  ];
  for (const [better, worse] of ordered) {
    assert.ok(
      percentileOf(better) < percentileOf(worse),
      `${better} (${percentileOf(better).toFixed(1)}%) should rank above ${worse} (${percentileOf(worse).toFixed(1)}%)`,
    );
  }
});

test('percentiles rise monotonically down the ranking', () => {
  let previous = 0;
  for (const code of HAND_RANKING) {
    const p = percentileOf(code);
    assert.ok(p >= previous, `${code} broke the ordering`);
    previous = p;
  }
  assert.equal(Math.round(previous), 100);
});

test('a top-percent range holds roughly that share of all hands', () => {
  for (const target of [5, 10, 15, 25, 46, 80]) {
    const set = topPercent(target);
    const combos = [...set].reduce((s, c) => s + comboCount(c), 0);
    const share = (combos / TOTAL_COMBOS) * 100;
    assert.ok(Math.abs(share - target) < 2, `top ${target}% held ${share.toFixed(1)}%`);
  }
});

test('ranges nest: a wider range contains every hand of a narrower one', () => {
  const narrow = topPercent(12);
  const wide = topPercent(40);
  for (const code of narrow) assert.ok(wide.has(code), `${code} fell out of the wider range`);
});

test('opening ranges widen as position improves', () => {
  const seats = ['UTG', 'MP', 'HJ', 'CO', 'BTN'];
  for (let i = 1; i < seats.length; i++) {
    assert.ok(
      openRangePercent(seats[i], 9) > openRangePercent(seats[i - 1], 9),
      `${seats[i]} should open wider than ${seats[i - 1]}`,
    );
  }
});

test('the button opening range looks like a real chart', () => {
  const range = topPercent(openRangePercent('BTN', 6));
  // Hands a competent button always opens.
  for (const code of ['A2s', 'A2o', 'K9s', 'K8o', 'QJo', 'T9o', '98o', '54s', '22', 'J9s']) {
    assert.ok(range.has(code), `${code} should be a button open`);
  }
  // Hands nobody opens, even on the button.
  for (const code of ['72o', '82o', '92s', '72s', 'J2o', '32o']) {
    assert.ok(!range.has(code), `${code} should not be a button open`);
  }
});

test('an early-position range is tight and contains only strong hands', () => {
  const range = topPercent(openRangePercent('UTG', 9));
  for (const code of ['AA', 'AKs', 'AQo', 'JJ', 'KQs']) assert.ok(range.has(code), `${code} should open under the gun`);
  for (const code of ['K2s', '54s', 'A2o', 'J9s', 'T8s']) assert.ok(!range.has(code), `${code} is too weak for under the gun`);
});

test('heads up the button plays almost everything', () => {
  assert.ok(openRangePercent('BTN', 2) > 70);
  assert.ok(openRangePercent('BTN', 2) > openRangePercent('BTN', 6));
});

test('position labels are consistent for every table size', () => {
  for (let n = 2; n <= 9; n++) {
    const labels = positionsForTable(n);
    assert.equal(labels.length, n, `${n}-handed table has ${n} seats`);
    assert.equal(labels[0], 'BTN', 'the first seat clockwise from the button is the button');
    assert.ok(labels.includes('BB'), `${n}-handed table has a big blind`);
    if (n > 2) assert.equal(labels[1], 'SB');
    assert.equal(new Set(labels).size, n, 'no duplicate position names');
  }
});

test('the chart grid is the conventional 13x13 layout', () => {
  const grid = chartGrid();
  assert.equal(grid.length, 13);
  assert.equal(grid[0][0], 'AA');
  assert.equal(grid[0][1], 'AKs');
  assert.equal(grid[1][0], 'AKo');
  assert.equal(grid[12][12], '22');
  assert.equal(new Set(grid.flat()).size, 169, 'every hand appears once');
});

test('an unknown hand code does not crash the ranking lookup', () => {
  assert.equal(strengthIndex('ZZ'), 168);
});
