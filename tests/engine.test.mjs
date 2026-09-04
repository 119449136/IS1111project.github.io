import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/cards.js';
import {
  createTable, startHand, applyAction, legalActions, positionOf,
  totalPot, buildPots, contenders, actors,
} from '../src/engine.js';

const table6 = (over = {}) => createTable({
  playerCount: 6, startingStack: 200, bigBlind: 2, seed: 42,
  bots: Array.from({ length: 5 }, (_, i) => ({ name: `Bot ${i + 1}` })),
  ...over,
});

const chipTotal = (t) => t.players.reduce((s, p) => s + p.stack, 0) + totalPot(t);

test('blinds are posted and action starts left of the big blind', () => {
  const t = startHand(table6());
  const sb = t.blindSeats.sb;
  const bb = t.blindSeats.bb;
  assert.equal(t.players[sb].bet, 1);
  assert.equal(t.players[bb].bet, 2);
  assert.equal(t.currentBet, 2);
  assert.equal(t.toAct, (bb + 1) % 6);
  assert.equal(positionOf(t, t.buttonIndex), 'BTN');
});

test('heads up the button posts the small blind and acts first preflop', () => {
  const t = startHand(createTable({ playerCount: 2, startingStack: 200, bigBlind: 2, seed: 7, bots: [{ name: 'Bot' }] }));
  assert.equal(t.blindSeats.sb, t.buttonIndex);
  assert.equal(t.toAct, t.buttonIndex);
  assert.equal(positionOf(t, t.buttonIndex), 'BTN');
});

test('every player is dealt two cards and none repeat', () => {
  const t = startHand(table6());
  const seen = new Set();
  for (const p of t.players) {
    assert.equal(p.holeCards.length, 2);
    for (const c of p.holeCards) {
      assert.ok(!seen.has(c), 'duplicate card dealt');
      seen.add(c);
    }
  }
});

test('chips are conserved through a hand that folds around', () => {
  const t = startHand(table6());
  const start = chipTotal(t);
  while (!t.handComplete) {
    const legal = legalActions(t);
    applyAction(t, legal.canFold ? { type: 'fold' } : { type: 'check' });
  }
  assert.equal(t.players.reduce((s, p) => s + p.stack, 0), start);
  assert.equal(t.results.showdown, false);
});

test('a minimum raise must be at least the previous raise size', () => {
  const t = startHand(table6());
  let legal = legalActions(t);
  assert.equal(legal.minRaiseTo, 4);            // 2 + one big blind
  applyAction(t, { type: 'raise', amount: 8 }); // raise of 6
  legal = legalActions(t);
  assert.equal(legal.minRaiseTo, 14);           // 8 + 6
});

test('an undersized raise is lifted to the legal minimum', () => {
  const t = startHand(table6());
  applyAction(t, { type: 'raise', amount: 3 }); // below the minimum of 4
  assert.equal(t.currentBet, 4);
});

test('the big blind gets an option when everyone limps', () => {
  const t = startHand(table6());
  const bb = t.blindSeats.bb;
  for (let i = 0; i < 5; i++) {
    const legal = legalActions(t);
    applyAction(t, legal.canCall ? { type: 'call' } : { type: 'check' });
  }
  assert.equal(t.street, 'preflop', 'still preflop');
  assert.equal(t.toAct, bb, 'big blind is given the option');
});

test('side pots split correctly when a short stack is all in', () => {
  const t = createTable({
    playerCount: 3, startingStack: 100, bigBlind: 2, seed: 11,
    bots: [{ name: 'A' }, { name: 'B' }],
  });
  t.players[0].stack = 20;
  t.players[1].stack = 60;
  t.players[2].stack = 100;
  const start = t.players.reduce((s, p) => s + p.stack, 0);
  startHand(t);

  while (!t.handComplete) {
    const legal = legalActions(t);
    if (legal.canRaise) applyAction(t, { type: 'raise', amount: legal.maxRaiseTo });
    else applyAction(t, { type: 'call' });
  }

  const pots = buildPots(t);
  assert.ok(pots.length >= 2, 'a side pot was created');
  assert.equal(pots[0].amount, 60, 'main pot is three times the short stack');
  assert.equal(t.players.reduce((s, p) => s + p.stack, 0), start, 'chips conserved');
});

test('a player never wins more than everyone could have matched', () => {
  const t = createTable({ playerCount: 3, startingStack: 100, bigBlind: 2, seed: 5, bots: [{ name: 'A' }, { name: 'B' }] });
  t.players[0].stack = 10;
  t.players[1].stack = 100;
  t.players[2].stack = 100;
  startHand(t);
  while (!t.handComplete) {
    const legal = legalActions(t);
    if (legal.canRaise) applyAction(t, { type: 'raise', amount: legal.maxRaiseTo });
    else applyAction(t, { type: 'call' });
  }
  const short = t.players[0];
  assert.ok(short.stack <= 30, `short stack capped, got ${short.stack}`);
});

// Fuzz: random legal actions across many table sizes must never break an
// invariant, strand chips, or leave the state machine stuck.
test('random play never violates the rules or loses chips', () => {
  const rng = makeRng(20260904);
  for (let trial = 0; trial < 400; trial++) {
    const n = 2 + ((rng() * 8) | 0);
    const t = createTable({
      playerCount: n,
      startingStack: 40 + ((rng() * 400) | 0),
      bigBlind: 2,
      seed: (rng() * 1e9) | 0,
      bots: Array.from({ length: n - 1 }, (_, i) => ({ name: `B${i}` })),
    });
    const start = t.players.reduce((s, p) => s + p.stack, 0);
    startHand(t);

    let guard = 0;
    while (!t.handComplete) {
      if (++guard > 500) throw new Error('hand did not terminate');
      const legal = legalActions(t);
      assert.ok(legal, 'a player must be able to act');
      assert.ok(!t.players[legal.seat].folded, 'a folded player was asked to act');
      assert.ok(!t.players[legal.seat].allIn, 'an all-in player was asked to act');
      assert.ok(legal.minRaiseTo <= legal.maxRaiseTo, 'raise bounds are sane');

      const roll = rng();
      if (roll < 0.15 && legal.canFold) applyAction(t, { type: 'fold' });
      else if (roll < 0.55 && legal.canCheck) applyAction(t, { type: 'check' });
      else if (roll < 0.8 && legal.canCall) applyAction(t, { type: 'call' });
      else if (legal.canRaise) {
        const span = legal.maxRaiseTo - legal.minRaiseTo;
        applyAction(t, { type: 'raise', amount: legal.minRaiseTo + ((rng() * (span + 1)) | 0) });
      } else if (legal.canCheck) applyAction(t, { type: 'check' });
      else if (legal.canCall) applyAction(t, { type: 'call' });
      else applyAction(t, { type: 'fold' });

      for (const p of t.players) {
        assert.ok(p.stack >= 0, 'a stack went negative');
      }
    }

    const end = t.players.reduce((s, p) => s + p.stack, 0);
    assert.equal(end, start, `chips leaked on trial ${trial}`);
    assert.ok(t.results, 'a result was produced');
    assert.ok(contenders(t).length >= 1, 'someone must win the pot');
  }
});

test('the button moves every hand', () => {
  const t = table6();
  startHand(t);
  const first = t.buttonIndex;
  while (!t.handComplete) {
    const legal = legalActions(t);
    applyAction(t, legal.canFold ? { type: 'fold' } : { type: 'check' });
  }
  startHand(t);
  assert.notEqual(t.buttonIndex, first);
});
