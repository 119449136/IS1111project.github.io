import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCards, makeRng } from '../src/cards.js';
import { createTable, startHand } from '../src/engine.js';
import { reviewDecision, summariseHand, LEAKS } from '../src/coach.js';

const rng = makeRng(4242);

/**
 * Build a table stopped at an exact spot so a decision can be graded in
 * isolation. `bets` sets each seat's current street contribution.
 */
function spot({
  players = 3, hero, board = '', street = 'flop', pot = 0, bets = {}, stacks = {}, history = [],
} = {}) {
  const t = createTable({
    playerCount: players, startingStack: 200, bigBlind: 2, seed: 77,
    bots: Array.from({ length: players - 1 }, (_, i) => ({ name: `B${i + 1}` })),
  });
  startHand(t);
  for (const p of t.players) { p.bet = 0; p.committed = 0; p.folded = false; p.allIn = false; }
  t.players[0].holeCards = parseCards(hero);
  t.board = board ? parseCards(board) : [];
  t.street = street;
  t.pot = pot;
  t.history = history;
  for (const [seat, amount] of Object.entries(bets)) {
    t.players[seat].bet = amount;
    t.players[seat].committed = amount;
  }
  for (const [seat, amount] of Object.entries(stacks)) t.players[seat].stack = amount;
  t.currentBet = Math.max(0, ...Object.values(bets));
  t.minRaise = t.bigBlind;
  t.toAct = 0;
  return t;
}

const review = (t, action) => reviewDecision(t, action, rng);

test('every leak the coach can raise has a title and a drill', () => {
  for (const [tag, leak] of Object.entries(LEAKS)) {
    assert.ok(leak.title, `${tag} has a title`);
    assert.ok(leak.short, `${tag} explains itself`);
    assert.ok(leak.drill && leak.drill.length > 30, `${tag} has a usable drill`);
  }
});

test('folding the nuts to a small bet is called out as over-folding', () => {
  const t = spot({ hero: 'Ac Ad', board: 'As Kd 7c', pot: 40, bets: { 1: 10 } });
  const r = review(t, { type: 'fold' });
  assert.equal(r.grade.tone, 'bad');
  assert.ok(r.tags.includes('over-folding'), `tags were ${r.tags}`);
  assert.equal(r.ideal, 'raise');
});

test('raising the nuts is graded well and raises no leak', () => {
  const t = spot({ hero: 'Ac Ad', board: 'As Kd 7c', pot: 40, bets: { 1: 10 } });
  const r = review(t, { type: 'raise', amount: 40 });
  assert.equal(r.tags.length, 0, `unexpected tags ${r.tags}`);
  assert.ok(r.evLoss < 1, 'no meaningful value was lost');
});

test('calling a big bet with nothing is called out on pot odds', () => {
  const t = spot({ hero: '7c 2d', board: 'As Kd 9h', pot: 30, bets: { 1: 30 } });
  const r = review(t, { type: 'call' });
  assert.ok(r.tags.includes('pot-odds') || r.tags.includes('draw-chasing'), `tags were ${r.tags}`);
  assert.equal(r.ideal, 'fold');
  assert.ok(r.evLoss > 0, 'the call is shown to cost money');
});

test('folding air to a big bet is correct and costs nothing', () => {
  const t = spot({ hero: '7c 2d', board: 'As Kd 9h', pot: 30, bets: { 1: 30 } });
  const r = review(t, { type: 'fold' });
  assert.equal(r.evLoss, 0);
  assert.equal(r.grade.key, 'great');
});

test('checking a very strong hand is flagged as missed value', () => {
  const t = spot({ hero: 'Ks Kd', board: 'Kh 7c 2d', pot: 30 });
  const r = review(t, { type: 'check' });
  assert.ok(r.tags.includes('missed-value'), `tags were ${r.tags}`);
  assert.equal(r.ideal, 'bet');
});

test('a value bet with a strong hand is approved', () => {
  const t = spot({ hero: 'Ks Kd', board: 'Kh 7c 2d', pot: 30 });
  const r = review(t, { type: 'bet', amount: 20 });
  assert.ok(!r.tags.includes('bet-sizing'), 'two-thirds pot is a sensible size');
  assert.ok(r.evLoss < 0.5);
});

test('a tiny bet with a monster is flagged for sizing, not for value', () => {
  const t = spot({ hero: 'Ks Kd', board: 'Kh 7c 2d', pot: 60 });
  const r = review(t, { type: 'bet', amount: 4 });
  assert.ok(r.tags.includes('bet-sizing'), `tags were ${r.tags}`);
});

test('bluffing several players with no equity is flagged', () => {
  const t = spot({ players: 4, hero: '7c 2d', board: 'As Kd 9h', pot: 40 });
  const r = review(t, { type: 'bet', amount: 30 });
  assert.ok(r.tags.includes('over-bluffing'), `tags were ${r.tags}`);
});

test('the coach quotes the price and the equity when facing a bet', () => {
  const t = spot({ hero: 'Th 9h', board: 'Ah 5h 2c', pot: 40, bets: { 1: 20 } });
  const r = review(t, { type: 'call' });
  const text = r.notes.join(' ');
  assert.match(text, /costs 20 into a pot of 60/, text);
  assert.match(text, /flush draw/, text);
  assert.match(text, /\d+% to break even/, text);
});

test('a flush draw getting the right price is a correct call', () => {
  const t = spot({ hero: 'Th 9h', board: 'Ah 5h 2c', pot: 60, bets: { 1: 15 } });
  const r = review(t, { type: 'call' });
  assert.ok(r.evLoss < 0.5, 'a well priced draw is not a mistake');
  assert.ok(!r.tags.includes('draw-chasing'));
});

test('a flush draw at a terrible price is chasing', () => {
  const t = spot({ hero: 'Th 9h', board: 'Ah 5h 2c', pot: 10, bets: { 1: 60 } });
  const r = review(t, { type: 'call' });
  assert.ok(r.tags.includes('draw-chasing'), `tags were ${r.tags}`);
});

// ---- before the flop -------------------------------------------------------

test('opening a premium hand is right, folding it is a serious error', () => {
  const t = spot({ players: 6, hero: 'Ac Ks', street: 'preflop', pot: 3, bets: { 1: 1, 2: 2 } });
  const raise = review(t, { type: 'raise', amount: 6 });
  assert.equal(raise.evLoss, 0);
  const fold = review(t, { type: 'fold' });
  assert.ok(fold.evLoss > 1, 'folding a premium open costs real money');
  assert.ok(fold.tags.includes('preflop-tight'));
});

test('limping is always called out', () => {
  const t = spot({ players: 6, hero: 'Ac Ks', street: 'preflop', pot: 3, bets: { 1: 1, 2: 2 } });
  const r = review(t, { type: 'call' });
  assert.ok(r.tags.includes('limping'), `tags were ${r.tags}`);
  assert.equal(r.ideal, 'raise');
});

test('opening junk is called out as playing too many hands', () => {
  const t = spot({ players: 6, hero: '7c 2d', street: 'preflop', pot: 3, bets: { 1: 1, 2: 2 } });
  const r = review(t, { type: 'raise', amount: 6 });
  assert.ok(r.tags.includes('preflop-loose'), `tags were ${r.tags}`);
});

test('folding junk before the flop is free', () => {
  const t = spot({ players: 6, hero: '7c 2d', street: 'preflop', pot: 3, bets: { 1: 1, 2: 2 } });
  const r = review(t, { type: 'fold' });
  assert.equal(r.evLoss, 0);
});

test('flat calling a premium hand against a raise is a missed three-bet', () => {
  const t = spot({
    players: 6, hero: 'Ac Ad', street: 'preflop', pot: 3, bets: { 1: 1, 2: 8 },
    history: [{ street: 'preflop', seat: 2, action: 'raise', position: 'CO', amount: 8 }],
  });
  const r = review(t, { type: 'call' });
  assert.ok(r.tags.includes('missed-3bet'), `tags were ${r.tags}`);
});

test('every review carries the context needed to explain itself', () => {
  const t = spot({ hero: 'Ah Kh', board: 'Qh 7h 2c', pot: 40, bets: { 1: 20 } });
  const r = review(t, { type: 'call' });
  assert.ok(r.notes.length >= 2, 'more than one sentence of reasoning');
  assert.ok(r.headline, 'a headline verdict');
  assert.ok(r.grade.label && r.grade.tone, 'a grade with a tone');
  assert.ok(r.idealText, 'a recommended action');
  assert.equal(typeof r.context.equity, 'number');
  assert.ok(r.context.equity > 0 && r.context.equity < 1);
});

test('a hand summary aggregates its decisions', () => {
  const t = spot({ hero: 'Ac Ad', board: 'As Kd 7c', pot: 40, bets: { 1: 10 } });
  const good = review(t, { type: 'raise', amount: 40 });
  const bad = review(t, { type: 'fold' });
  const clean = summariseHand([good], t);
  assert.match(clean.verdict, /Cleanly played/);
  const messy = summariseHand([good, bad], t);
  assert.ok(messy.totalLoss > clean.totalLoss);
  assert.ok(messy.worst, 'the worst decision is identified');
  assert.equal(messy.decisions, 2);
});
