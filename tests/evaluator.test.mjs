import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCards, freshDeck, shuffle, makeRng } from '../src/cards.js';
import { evaluate, describe as describeHand, categoryOf, CATEGORY } from '../src/evaluator.js';

const score = (s) => evaluate(parseCards(s));

test('categories are ordered correctly', () => {
  const ladder = [
    'Ac Kd 9h 5s 2c',   // high card
    'Ac Ad 9h 5s 2c',   // pair
    'Ac Ad 9h 9s 2c',   // two pair
    'Ac Ad Ah 9s 2c',   // trips
    '5c 6d 7h 8s 9c',   // straight
    'Ac 9c 7c 5c 2c',   // flush
    'Ac Ad Ah 9s 9c',   // full house
    'Ac Ad Ah As 9c',   // quads
    '5c 6c 7c 8c 9c',   // straight flush
  ];
  const scores = ladder.map(score);
  for (let i = 1; i < scores.length; i++) {
    assert.ok(scores[i] > scores[i - 1], `${ladder[i]} should beat ${ladder[i - 1]}`);
  }
  assert.equal(categoryOf(scores[8]), CATEGORY.STRAIGHT_FLUSH);
});

test('the wheel is a five-high straight and loses to a six-high one', () => {
  assert.equal(describeHand(score('Ac 2d 3h 4s 5c')), 'Straight, Five high');
  assert.ok(score('2c 3d 4h 5s 6c') > score('Ac 2d 3h 4s 5c'));
});

test('the wheel does not wrap around the ace', () => {
  // Q-K-A-2-3 is not a straight.
  assert.ok(categoryOf(score('Qc Kd Ah 2s 3c')) < CATEGORY.STRAIGHT);
});

test('steel wheel is a straight flush', () => {
  assert.equal(describeHand(score('Ac 2c 3c 4c 5c')), 'Straight flush, Five high');
});

test('royal flush is named', () => {
  assert.equal(describeHand(score('Ac Kc Qc Jc Tc')), 'Royal flush');
});

test('kickers break ties', () => {
  assert.ok(score('Ac Ad Kh 5s 2c') > score('Ac Ad Qh 5s 2c'));
  assert.equal(score('Ac Ad Kh 5s 2c'), score('As Ah Kd 5c 2d'));
});

test('seven cards pick the best five', () => {
  // A flush is available and must be chosen over the pair.
  assert.equal(categoryOf(evaluate(parseCards('Ac Kc 7c 4c 2c Ad Kd'))), CATEGORY.FLUSH);
  // Two sets make a full house using only the top two ranks.
  assert.equal(describeHand(evaluate(parseCards('9c 9d 9h 5c 5d 5h 2c'))), 'Nines full of Fives');
});

test('quads with a set on board keeps the best kicker', () => {
  assert.equal(describeHand(evaluate(parseCards('7c 7d 7h 7s Kc Qd 2h'))), 'Four Sevens');
  assert.ok(evaluate(parseCards('7c 7d 7h 7s Kc Qd 2h')) > evaluate(parseCards('7c 7d 7h 7s Qc Jd 2h')));
});

test('two pair uses the top two pairs and one kicker', () => {
  assert.equal(describeHand(evaluate(parseCards('Ac Ad Kc Kd 3c 3d 9h'))), 'Two pair, Aces and Kings');
});

// Brute force: the 7-card result must equal the best of all 21 five-card subsets.
test('seven-card evaluation matches exhaustive five-card search', () => {
  const rng = makeRng(20260904);
  const five = new Array(5);
  for (let trial = 0; trial < 20000; trial++) {
    const deck = shuffle(freshDeck(), rng);
    const seven = deck.slice(0, 7);
    let best = -1;
    for (let a = 0; a < 3; a++) {
      for (let b = a + 1; b < 4; b++) {
        for (let c = b + 1; c < 5; c++) {
          for (let d = c + 1; d < 6; d++) {
            for (let e = d + 1; e < 7; e++) {
              five[0] = seven[a]; five[1] = seven[b]; five[2] = seven[c];
              five[3] = seven[d]; five[4] = seven[e];
              const s = evaluate(five, 5);
              if (s > best) best = s;
            }
          }
        }
      }
    }
    assert.equal(evaluate(seven, 7), best, `mismatch on ${seven}`);
  }
});
