/**
 * No-limit hold'em betting engine.
 *
 * The engine is a pure state machine: it owns the deck, the betting rules and
 * the pot, and it never touches the interface. Every mutation goes through
 * applyAction, which keeps the hand history complete enough for the coach to
 * reconstruct and grade any decision after the fact.
 */

import { freshDeck, shuffle, makeRng } from './cards.js';
import { evaluate, describe } from './evaluator.js';
import { positionsForTable } from './ranges.js';

export const STREETS = ['preflop', 'flop', 'turn', 'river'];

/**
 * @param {object} config
 * @param {number} config.playerCount 2 to 9 including hero
 * @param {number} config.startingStack chips
 * @param {number} config.bigBlind
 * @param {object[]} config.bots profile objects, one per non-hero seat
 */
export function createTable(config) {
  const {
    playerCount = 6,
    startingStack = 200,
    bigBlind = 2,
    smallBlind = bigBlind / 2,
    ante = 0,
    bots = [],
    heroName = 'You',
    seed = Date.now(),
  } = config;

  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      seat: i,
      id: i,
      name: i === 0 ? heroName : (bots[i - 1]?.name ?? `Bot ${i}`),
      profile: i === 0 ? null : bots[i - 1] ?? null,
      isHero: i === 0,
      stack: startingStack,
      bet: 0,
      committed: 0,
      holeCards: [],
      folded: false,
      allIn: false,
      acted: false,
      sittingOut: false,
      lastAction: null,
      wonThisHand: 0,
    });
  }

  return {
    players,
    playerCount,
    bigBlind,
    smallBlind,
    ante,
    startingStack,
    buttonIndex: playerCount - 1 > 0 ? playerCount - 1 : 0,
    handNumber: 0,
    rng: makeRng(seed),
    street: 'idle',
    board: [],
    deck: [],
    deckIndex: 0,
    pot: 0,
    currentBet: 0,
    minRaise: bigBlind,
    toAct: -1,
    lastAggressor: -1,
    lastFullRaiseTo: 0,
    history: [],
    results: null,
    handComplete: true,
  };
}

/** Seats clockwise from the button, so 0 is the button itself. */
export function seatsFromButton(table, seat) {
  return (seat - table.buttonIndex + table.playerCount) % table.playerCount;
}

export function positionOf(table, seat) {
  const labels = positionsForTable(table.playerCount);
  return labels[seatsFromButton(table, seat)];
}

/** Players who have not folded. */
export const contenders = (table) => table.players.filter((p) => !p.folded && !p.sittingOut);

/** Players who can still put chips in. */
export const actors = (table) => contenders(table).filter((p) => !p.allIn);

function nextOccupied(table, from) {
  const n = table.playerCount;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    if (!table.players[idx].sittingOut && table.players[idx].stack > 0) return idx;
  }
  return from;
}

/** Deal a new hand, post blinds and set the first player to act. */
export function startHand(table) {
  table.handNumber++;
  table.board = [];
  table.pot = 0;
  table.currentBet = 0;
  table.minRaise = table.bigBlind;
  table.lastAggressor = -1;
  table.history = [];
  table.results = null;
  table.handComplete = false;
  table.street = 'preflop';

  // Anyone who busted sits out; the app tops players up between hands, so this
  // mainly guards against a malformed configuration.
  for (const p of table.players) {
    p.bet = 0;
    p.committed = 0;
    p.holeCards = [];
    p.folded = p.sittingOut || p.stack <= 0;
    p.allIn = false;
    p.acted = false;
    p.lastAction = null;
    p.wonThisHand = 0;
    p.sittingOut = p.stack <= 0;
  }

  if (table.handNumber > 1) table.buttonIndex = nextOccupied(table, table.buttonIndex);

  table.deck = shuffle(freshDeck(), table.rng);
  table.deckIndex = 0;

  const live = table.players.filter((p) => !p.sittingOut);
  for (let round = 0; round < 2; round++) {
    for (const p of live) p.holeCards.push(table.deck[table.deckIndex++]);
  }

  if (table.ante > 0) {
    for (const p of live) postChips(table, p, Math.min(table.ante, p.stack), 'ante');
    for (const p of live) { table.pot += p.bet; p.bet = 0; }
  }

  // Heads up the button posts the small blind and acts first before the flop.
  const n = table.playerCount;
  const sbSeat = n === 2 ? table.buttonIndex : nextOccupied(table, table.buttonIndex);
  const bbSeat = nextOccupied(table, sbSeat);

  postChips(table, table.players[sbSeat], Math.min(table.smallBlind, table.players[sbSeat].stack), 'small blind');
  postChips(table, table.players[bbSeat], Math.min(table.bigBlind, table.players[bbSeat].stack), 'big blind');

  table.currentBet = table.bigBlind;
  table.minRaise = table.bigBlind;
  table.lastFullRaiseTo = table.bigBlind;
  table.blindSeats = { sb: sbSeat, bb: bbSeat };

  table.toAct = nextOccupied(table, bbSeat);
  advancePastIneligible(table);
  return table;
}

function postChips(table, player, amount, label) {
  const paid = Math.min(amount, player.stack);
  player.stack -= paid;
  player.bet += paid;
  player.committed += paid;
  if (player.stack === 0) player.allIn = true;
  if (label) {
    table.history.push({
      street: 'preflop', seat: player.seat, action: label, amount: paid, potBefore: table.pot,
    });
  }
  return paid;
}

/** Skip seats that cannot act (folded, all-in or sitting out). */
function advancePastIneligible(table) {
  const n = table.playerCount;
  for (let i = 0; i < n; i++) {
    const p = table.players[table.toAct];
    if (p && !p.folded && !p.allIn && !p.sittingOut) return;
    table.toAct = (table.toAct + 1) % n;
  }
}

/**
 * What the player to act may legally do.
 * `raiseTo` values are total street bets, which is how a table actually
 * announces a raise ("raise to 30"), not increments.
 */
export function legalActions(table) {
  const p = table.players[table.toAct];
  if (!p || table.handComplete) return null;

  const toCall = Math.max(0, table.currentBet - p.bet);
  const canCheck = toCall === 0;
  const callAmount = Math.min(toCall, p.stack);
  const maxRaiseTo = p.bet + p.stack;

  // A raise must reach the current bet plus the last full raise, unless the
  // player is moving all in for less.
  let minRaiseTo = table.currentBet + table.minRaise;
  if (table.currentBet === 0) minRaiseTo = Math.min(table.bigBlind, maxRaiseTo);
  const canRaise = maxRaiseTo > table.currentBet && actors(table).length > 1;
  if (minRaiseTo > maxRaiseTo) minRaiseTo = maxRaiseTo;

  return {
    seat: p.seat,
    toCall,
    callAmount,
    canFold: toCall > 0,
    canCheck,
    canCall: toCall > 0 && p.stack > 0,
    canRaise,
    isBet: table.currentBet === 0,
    minRaiseTo,
    maxRaiseTo,
    potIfCall: table.pot + streetBets(table) + callAmount,
    pot: table.pot + streetBets(table),
    stack: p.stack,
  };
}

const streetBets = (table) => table.players.reduce((sum, p) => sum + p.bet, 0);

/** Total chips in the middle right now, including this street's bets. */
export const totalPot = (table) => table.pot + streetBets(table);

/**
 * Apply one action for the player to act.
 * @param {object} action {type, amount} where amount is a raise-to total.
 * @returns {object} a record of what happened, for the history and the coach.
 */
export function applyAction(table, action) {
  const p = table.players[table.toAct];
  const legal = legalActions(table);
  if (!p || !legal) throw new Error('No player to act');

  const potBefore = totalPot(table);
  const toCall = legal.toCall;
  let record;

  switch (action.type) {
    case 'fold': {
      if (!legal.canFold) throw new Error('Cannot fold when checking is free');
      p.folded = true;
      p.lastAction = 'Fold';
      record = { action: 'fold', amount: 0 };
      break;
    }
    case 'check': {
      if (!legal.canCheck) throw new Error('Cannot check facing a bet');
      p.lastAction = 'Check';
      record = { action: 'check', amount: 0 };
      break;
    }
    case 'call': {
      const paid = postChips(table, p, Math.min(toCall, p.stack));
      p.lastAction = p.allIn ? 'All in' : 'Call';
      record = { action: 'call', amount: paid };
      break;
    }
    case 'bet':
    case 'raise': {
      if (!legal.canRaise) throw new Error('Cannot raise');
      let raiseTo = Math.round(action.amount);
      raiseTo = Math.max(raiseTo, Math.min(legal.minRaiseTo, legal.maxRaiseTo));
      raiseTo = Math.min(raiseTo, legal.maxRaiseTo);
      const increment = raiseTo - table.currentBet;
      const paid = postChips(table, p, raiseTo - p.bet);

      // A short all-in does not reopen the betting for players who already
      // called the previous full raise.
      const isFullRaise = increment >= table.minRaise;
      if (isFullRaise) {
        table.minRaise = increment;
        for (const other of table.players) {
          if (other !== p && !other.folded && !other.allIn) other.acted = false;
        }
      }
      table.currentBet = Math.max(table.currentBet, raiseTo);
      table.lastAggressor = p.seat;
      p.lastAction = p.allIn ? 'All in' : (legal.isBet ? 'Bet' : 'Raise');
      record = { action: legal.isBet ? 'bet' : 'raise', amount: paid, raiseTo };
      break;
    }
    default:
      throw new Error(`Unknown action ${action.type}`);
  }

  p.acted = true;
  const entry = {
    street: table.street,
    seat: p.seat,
    name: p.name,
    position: positionOf(table, p.seat),
    action: record.action,
    amount: record.amount,
    raiseTo: record.raiseTo ?? null,
    toCall,
    potBefore,
    stackBefore: p.stack + record.amount,
    allIn: p.allIn,
  };
  table.history.push(entry);

  advanceGame(table);
  return entry;
}

function bettingRoundComplete(table) {
  const live = contenders(table);
  if (live.length <= 1) return true;
  const able = live.filter((p) => !p.allIn);
  if (able.length === 0) return true;
  for (const p of able) {
    if (!p.acted) return false;
    if (p.bet < table.currentBet) return false;
  }
  return true;
}

function advanceGame(table) {
  if (contenders(table).length <= 1) {
    collectBets(table);
    finishHand(table);
    return;
  }

  if (!bettingRoundComplete(table)) {
    const n = table.playerCount;
    let idx = table.toAct;
    for (let i = 0; i < n; i++) {
      idx = (idx + 1) % n;
      const p = table.players[idx];
      if (!p.folded && !p.allIn && !p.sittingOut) { table.toAct = idx; return; }
    }
  }

  collectBets(table);
  nextStreet(table);
}

function collectBets(table) {
  for (const p of table.players) {
    table.pot += p.bet;
    p.bet = 0;
  }
  table.currentBet = 0;
  table.minRaise = table.bigBlind;
}

function nextStreet(table) {
  const idx = STREETS.indexOf(table.street);
  if (idx < 0 || idx === STREETS.length - 1) { finishHand(table); return; }

  // With at most one player able to act, the rest of the board just runs out.
  const runOut = actors(table).length <= 1;

  table.street = STREETS[idx + 1];
  if (table.street === 'flop') {
    table.deckIndex++; // burn
    table.board.push(table.deck[table.deckIndex++], table.deck[table.deckIndex++], table.deck[table.deckIndex++]);
  } else {
    table.deckIndex++;
    table.board.push(table.deck[table.deckIndex++]);
  }

  for (const p of table.players) p.acted = false;
  table.lastAggressor = -1;

  if (runOut) { nextStreet(table); return; }

  // Postflop the first live seat left of the button acts first.
  let idx2 = table.buttonIndex;
  for (let i = 0; i < table.playerCount; i++) {
    idx2 = (idx2 + 1) % table.playerCount;
    const p = table.players[idx2];
    if (!p.folded && !p.allIn && !p.sittingOut) { table.toAct = idx2; return; }
  }
  finishHand(table);
}

/**
 * Build main and side pots from what each player put in, then award each pot
 * to the best hand eligible for it.
 */
export function buildPots(table) {
  const live = table.players.filter((p) => p.committed > 0);
  const levels = [...new Set(live.map((p) => p.committed))].sort((a, b) => a - b);
  const pots = [];
  let previous = 0;
  for (const level of levels) {
    let amount = 0;
    for (const p of live) amount += Math.min(p.committed, level) - Math.min(p.committed, previous);
    const eligible = table.players
      .filter((p) => !p.folded && p.committed >= level)
      .map((p) => p.seat);
    if (amount > 0) pots.push({ amount, eligible });
    previous = level;
  }
  // Fold neighbouring pots with identical eligibility together so the summary
  // does not invent side pots nobody was ever contesting.
  const merged = [];
  for (const pot of pots) {
    const last = merged[merged.length - 1];
    if (last && last.eligible.length === pot.eligible.length
      && last.eligible.every((s, i) => s === pot.eligible[i])) {
      last.amount += pot.amount;
    } else merged.push({ ...pot });
  }
  return merged;
}

function finishHand(table) {
  collectBets(table);
  const live = contenders(table);
  const showdown = live.length > 1;
  const pots = buildPots(table);
  const payouts = new Map();

  const scores = new Map();
  if (showdown) {
    for (const p of live) {
      scores.set(p.seat, evaluate(p.holeCards.concat(table.board), 2 + table.board.length));
    }
  }

  for (const pot of pots) {
    const eligible = pot.eligible.filter((s) => !table.players[s].folded);
    if (eligible.length === 0) continue;
    let winners;
    if (!showdown) {
      winners = [live[0].seat];
    } else {
      let best = -1;
      winners = [];
      for (const seat of eligible) {
        const sc = scores.get(seat);
        if (sc > best) { best = sc; winners = [seat]; }
        else if (sc === best) winners.push(seat);
      }
    }
    const share = Math.floor(pot.amount / winners.length);
    let remainder = pot.amount - share * winners.length;
    for (const seat of winners) {
      let amount = share;
      // Odd chips go to the first winner left of the button.
      if (remainder > 0) { amount += 1; remainder -= 1; }
      payouts.set(seat, (payouts.get(seat) ?? 0) + amount);
    }
  }

  for (const [seat, amount] of payouts) {
    table.players[seat].stack += amount;
    table.players[seat].wonThisHand = amount;
  }

  table.results = {
    showdown,
    pots,
    board: [...table.board],
    payouts: [...payouts.entries()].map(([seat, amount]) => ({ seat, amount })),
    hands: showdown
      ? live.map((p) => ({
        seat: p.seat,
        name: p.name,
        cards: [...p.holeCards],
        score: scores.get(p.seat),
        description: describe(scores.get(p.seat)),
      })).sort((a, b) => b.score - a.score)
      : [],
    net: table.players.map((p) => ({
      seat: p.seat,
      name: p.name,
      net: (payouts.get(p.seat) ?? 0) - p.committed,
      committed: p.committed,
    })),
  };
  table.street = 'complete';
  table.handComplete = true;
  table.toAct = -1;
}

/** Convenience for the interface: is it hero's turn? */
export const isHeroToAct = (table) =>
  !table.handComplete && table.toAct >= 0 && table.players[table.toAct]?.isHero;

/** Chips a seat has yet to match on this street. */
export const amountToCall = (table, seat) =>
  Math.max(0, table.currentBet - table.players[seat].bet);
