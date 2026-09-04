import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/cards.js';
import { createTable, startHand, applyAction, legalActions } from '../src/engine.js';
import { botAction, BOT_PROFILES, pickBots, profileById } from '../src/bots.js';

/** Run a full bot-only session and report per-profile tendencies. */
function runSession(profileIds, hands, seed) {
  const rng = makeRng(seed);
  const bots = profileIds.slice(1).map((id) => ({ ...profileById(id) }));
  const t = createTable({
    playerCount: profileIds.length, startingStack: 200, bigBlind: 2, seed, bots,
  });
  t.players[0].profile = { ...profileById(profileIds[0]) };
  const startChips = t.players.reduce((s, p) => s + p.stack, 0);

  const stats = t.players.map(() => ({ hands: 0, vpip: 0, pfr: 0, actions: 0 }));

  for (let h = 0; h < hands; h++) {
    for (const p of t.players) if (p.stack < 200) p.stack = 200; // top up, keep it comparable
    startHand(t);
    for (const p of t.players) if (!p.sittingOut) stats[p.seat].hands++;
    const voluntary = new Set();
    const raised = new Set();

    let guard = 0;
    while (!t.handComplete) {
      if (++guard > 400) throw new Error('hand failed to terminate');
      const seat = t.toAct;
      const legal = legalActions(t);
      const action = botAction(t, rng);
      assert.ok(action && typeof action.type === 'string', 'bot returned an action');
      if (action.type === 'fold') assert.ok(legal.canFold, 'bot folded when it could check');
      if (t.street === 'preflop') {
        if (action.type === 'call' || action.type === 'raise') voluntary.add(seat);
        if (action.type === 'raise') raised.add(seat);
      }
      stats[seat].actions++;
      applyAction(t, action);
    }
    for (const seat of voluntary) stats[seat].vpip++;
    for (const seat of raised) stats[seat].pfr++;
  }

  return { table: t, stats, startChips };
}

test('bots play thousands of hands without breaking the rules', () => {
  const ids = ['tag', 'rock', 'lag', 'station', 'maniac', 'passive'];
  const { stats } = runSession(ids, 500, 99);
  for (let i = 0; i < ids.length; i++) {
    assert.ok(stats[i].hands > 0, `${ids[i]} was dealt in`);
    assert.ok(stats[i].actions > 0, `${ids[i]} acted`);
  }
});

test('profiles differ in the way their descriptions promise', () => {
  const ids = ['rock', 'tag', 'lag', 'station', 'maniac', 'passive'];
  const { stats } = runSession(ids, 900, 2024);
  const vpip = stats.map((s) => s.vpip / s.hands);
  const pfr = stats.map((s) => s.pfr / s.hands);
  const [rock, tag, lag, station, maniac] = vpip;

  assert.ok(rock < tag, `the nit plays fewer hands than the regular (${rock.toFixed(2)} vs ${tag.toFixed(2)})`);
  assert.ok(tag < lag, `the regular plays fewer hands than the loose-aggressive player (${tag.toFixed(2)} vs ${lag.toFixed(2)})`);
  assert.ok(maniac > station * 0.8, 'the maniac is among the loosest');
  assert.ok(rock > 0.05 && maniac < 1.0, 'every style is still playing poker');
  // The station enters many pots but rarely raises; the maniac raises constantly.
  assert.ok(pfr[3] < pfr[4], 'the station raises less than the maniac');
  assert.ok(pfr[0] < pfr[2], 'the nit raises less than the loose-aggressive player');
});

test('the bot line-up is varied and every seat is named uniquely', () => {
  const rng = makeRng(3);
  for (const n of [1, 2, 3, 5, 8]) {
    const bots = pickBots(n, rng);
    assert.equal(bots.length, n);
    assert.equal(new Set(bots.map((b) => b.name)).size, n, `names are unique for ${n} bots`);
    for (const b of bots) assert.ok(b.blurb && b.counterTip, 'each bot explains itself');
  }
});

test('every published profile is playable', () => {
  for (const p of BOT_PROFILES) {
    const { stats } = runSession([p.id, 'tag', 'tag'], 60, 5);
    assert.ok(stats[0].actions > 0, `${p.name} acted`);
  }
});
