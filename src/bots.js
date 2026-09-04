/**
 * Bot opponents.
 *
 * Each profile is a small set of numbers describing a recognisable playing
 * style. The decision code is shared; only the parameters change. That matters
 * for training: a leak that only shows up against a calling station should
 * show up consistently, and a bot should never be a different player from one
 * hand to the next.
 *
 * Bots see only their own cards and the public betting history, exactly like
 * hero. Nothing here reads another player's hole cards.
 */

import { handCode } from './cards.js';
import { equity, analyseHand } from './equity.js';
import {
  percentileOf, openRangePercent, threeBetPercent, callRangePercent,
} from './ranges.js';
import { positionOf, contenders, legalActions } from './engine.js';

/**
 * looseness  multiplies every preflop range width
 * aggression how often a marginal spot becomes a bet or raise
 * bluff      how often a hand with no equity fires anyway
 * sticky     extra equity slack before folding to a bet (a station calls light)
 * limpiness  how often a playable hand is limped instead of raised
 * sizing     preferred bet as a fraction of the pot
 */
export const BOT_PROFILES = [
  {
    id: 'rock', name: 'Granite', emoji: '🪨', style: 'Nit',
    blurb: 'Plays very few hands and almost never bluffs. When Granite raises, believe it.',
    looseness: 0.55, aggression: 0.35, bluff: 0.04, sticky: -0.04, sizing: 0.6, limpiness: 0.12,
    counterTip: 'Fold your marginal hands when this player commits chips, and steal relentlessly when they check.',
  },
  {
    id: 'tag', name: 'Mira', emoji: '🎯', style: 'Tight-aggressive',
    blurb: 'Solid, disciplined and hard to read. Opens a sensible range and bets when it connects.',
    looseness: 0.95, aggression: 0.72, bluff: 0.18, sticky: 0.0, sizing: 0.66, limpiness: 0.02,
    counterTip: 'A balanced regular. Do not bluff into her too often and pay attention to her sizing.',
  },
  {
    id: 'lag', name: 'Rey', emoji: '⚡', style: 'Loose-aggressive',
    blurb: 'Applies constant pressure with a wide range. Raises far more than the cards justify.',
    looseness: 1.6, aggression: 0.85, bluff: 0.34, sticky: 0.02, sizing: 0.78, limpiness: 0.02,
    counterTip: 'Widen your calling range and let him bluff into your strong hands rather than raising them.',
  },
  {
    id: 'station', name: 'Bo', emoji: '🍀', style: 'Calling station',
    blurb: 'Calls far too much and folds far too little, but rarely takes the lead.',
    looseness: 1.9, aggression: 0.22, bluff: 0.05, sticky: 0.14, sizing: 0.45, limpiness: 0.82,
    counterTip: 'Value bet thinly and relentlessly. Never bluff a player who will not fold.',
  },
  {
    id: 'maniac', name: 'Vex', emoji: '🔥', style: 'Maniac',
    blurb: 'Raises with anything and pushes every pot. Wildly profitable to play against, if you can take the variance.',
    looseness: 2.6, aggression: 0.95, bluff: 0.5, sticky: 0.06, sizing: 0.95, limpiness: 0.0,
    counterTip: 'Stop bluffing entirely. Trap with strong hands and let the pressure come to you.',
  },
  {
    id: 'passive', name: 'Nils', emoji: '🌱', style: 'Loose-passive',
    blurb: 'Limps in with a lot of hands and plays fit-or-fold after the flop.',
    looseness: 1.5, aggression: 0.3, bluff: 0.08, sticky: 0.06, sizing: 0.5, limpiness: 0.76,
    counterTip: 'Raise his limps and bet when he checks. He tells you when he has something.',
  },
  {
    id: 'shark', name: 'Ada', emoji: '🦈', style: 'Thinking regular',
    blurb: 'Adjusts to the board and to position, mixes her sizing, and punishes predictable play.',
    looseness: 1.1, aggression: 0.8, bluff: 0.26, sizing: 0.7, sticky: -0.01, limpiness: 0.03,
    counterTip: 'Vary your own play. She notices when you only bet with strong hands.',
  },
];

export const profileById = (id) => BOT_PROFILES.find((p) => p.id === id) ?? BOT_PROFILES[1];

/** Pick a varied, deterministic line-up for a given table size. */
export function pickBots(count, rng = Math.random) {
  const preferredOrder = ['tag', 'station', 'lag', 'rock', 'shark', 'passive', 'maniac', 'tag', 'shark'];
  const chosen = [];
  for (let i = 0; i < count; i++) {
    const base = profileById(preferredOrder[i % preferredOrder.length]);
    chosen.push({ ...base, seatTag: i });
  }
  // Shuffle so seat order is not always the same line-up.
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  // Two bots with the same profile need distinguishable names at the table.
  const seen = new Map();
  for (const bot of chosen) {
    const n = (seen.get(bot.id) ?? 0) + 1;
    seen.set(bot.id, n);
    if (n > 1) bot.name = `${bot.name} ${n}`;
  }
  return chosen;
}

/**
 * How wide the betting so far suggests an opponent's range is, as a top
 * percentage. Used to give the bots a coherent read rather than assuming every
 * opponent holds a random hand.
 */
export function inferredRangePercent(table, seat) {
  const history = table.history.filter((h) => h.seat === seat);
  const raised = history.some((h) => h.action === 'raise' || h.action === 'bet');
  const threeBet = history.filter((h) => h.action === 'raise').length >= 2;
  const called = history.some((h) => h.action === 'call');
  if (threeBet) return 7;
  if (raised) return 22;
  if (called) return 45;
  return 60;
}

/** Ranges of every live opponent of `seat`, for the equity simulation. */
function opponentRanges(table, seat) {
  return contenders(table)
    .filter((p) => p.seat !== seat)
    .map((p) => inferredRangePercent(table, p.seat));
}

const jitter = (rng, spread) => 1 + (rng() - 0.5) * 2 * spread;

/**
 * Decide a bot's action.
 * @returns {{type:string, amount?:number, reasoning:string}}
 */
export function botAction(table, rng = Math.random) {
  const player = table.players[table.toAct];
  const legal = legalActions(table);
  const profile = player.profile ?? BOT_PROFILES[1];
  if (!legal) return { type: 'check', reasoning: 'no action available' };

  return table.street === 'preflop'
    ? preflopDecision(table, player, profile, legal, rng)
    : postflopDecision(table, player, profile, legal, rng);
}

function preflopDecision(table, player, profile, legal, rng) {
  const code = handCode(player.holeCards[0], player.holeCards[1]);
  const pct = percentileOf(code);
  const pos = positionOf(table, player.seat);
  const n = table.playerCount;

  const raises = table.history.filter((h) => h.action === 'raise').length;
  const facingRaise = legal.toCall > table.bigBlind - 0.001 && raises > 0;
  const noise = jitter(rng, 0.18);

  // Nobody has raised: open or fold.
  if (!facingRaise) {
    const openPct = openRangePercent(pos, n) * profile.looseness * noise;
    const limpers = table.history.filter((h) => h.action === 'call').length;

    if (pct <= openPct) {
      // Passive styles limp far more than they raise, which is the single
      // clearest tell separating them from a competent regular.
      const limps = rng() < (profile.limpiness ?? 0.03) && legal.canCall
        && legal.toCall <= table.bigBlind;
      if (!limps && legal.canRaise) {
        const open = table.bigBlind * (n > 6 ? 3 : 2.5) + table.bigBlind * limpers;
        return { type: 'raise', amount: clampRaise(legal, open), reasoning: `opens ${code} from ${pos}` };
      }
      if (legal.canCall && legal.toCall <= table.bigBlind) {
        return { type: 'call', reasoning: `limps ${code} from ${pos}` };
      }
      if (legal.canCheck) return { type: 'check', reasoning: 'checks the option' };
    }
    if (legal.canCheck) return { type: 'check', reasoning: 'checks the option' };
    return { type: 'fold', reasoning: `${code} is outside the opening range from ${pos}` };
  }

  // Facing at least one raise.
  const facingThreeBet = raises >= 2;
  if (facingThreeBet) {
    const fourBet = 3 * profile.looseness * noise;
    const callPct = 8 * profile.looseness * noise;
    if (pct <= fourBet && legal.canRaise && rng() < profile.aggression + 0.2) {
      return { type: 'raise', amount: clampRaise(legal, legal.toCall * 2.4 + legal.pot * 0.4), reasoning: `four-bets ${code}` };
    }
    if (pct <= callPct && legal.canCall) return { type: 'call', reasoning: `calls the three-bet with ${code}` };
    return { type: 'fold', reasoning: `folds ${code} to a three-bet` };
  }

  const openerEntry = [...table.history].reverse().find((h) => h.action === 'raise');
  const openerPos = openerEntry ? openerEntry.position : 'CO';
  const threeBetPct = threeBetPercent(pos, openerPos, n) * profile.looseness * noise;
  const callPct = callRangePercent(pos, openerPos, n) * profile.looseness * noise;

  if (pct <= threeBetPct && legal.canRaise && rng() < 0.12 + profile.aggression * 0.75) {
    const size = legal.pot + legal.toCall * (pos === 'SB' || pos === 'BB' ? 1.6 : 1.2);
    return { type: 'raise', amount: clampRaise(legal, size), reasoning: `three-bets ${code} against a ${openerPos} open` };
  }
  if (pct <= callPct && legal.canCall) {
    return { type: 'call', reasoning: `calls the raise with ${code}` };
  }
  if (legal.canCheck) return { type: 'check', reasoning: 'checks' };
  return { type: 'fold', reasoning: `folds ${code} facing a raise from ${openerPos}` };
}

function postflopDecision(table, player, profile, legal, rng) {
  const opponents = contenders(table).length - 1;
  const ranges = opponentRanges(table, player.seat);
  const read = analyseHand(player.holeCards, table.board);
  const sims = opponents <= 2 ? 900 : 500;
  const { equity: eq } = equity({
    hero: player.holeCards,
    board: table.board,
    opponents: Math.max(1, opponents),
    rangePct: ranges.length ? ranges : 100,
    sims,
    rng,
  });

  const pot = legal.pot;
  const noise = jitter(rng, 0.12);

  if (legal.canCheck) {
    // Deciding whether to bet.
    const valueBet = eq > 0.62 && rng() < 0.55 + profile.aggression * 0.45;
    const thinValue = eq > 0.52 && eq <= 0.62 && rng() < profile.aggression * 0.5;
    const semiBluff = read.isDraw && rng() < profile.bluff + profile.aggression * 0.35;
    const airBluff = eq < 0.35 && !read.madeHand && rng() < profile.bluff * (opponents === 1 ? 1 : 0.4);

    if ((valueBet || thinValue || semiBluff || airBluff) && legal.canRaise) {
      const frac = profile.sizing * noise * (read.strongMade ? 1.05 : 1);
      const amount = Math.max(table.bigBlind, Math.round(pot * frac));
      return {
        type: 'bet',
        amount: clampRaise(legal, player.bet + amount),
        reasoning: valueBet || thinValue ? 'bets for value' : semiBluff ? 'semi-bluffs a draw' : 'bluffs',
      };
    }
    return { type: 'check', reasoning: 'checks' };
  }

  // Facing a bet.
  const toCall = legal.callAmount;
  const potOdds = toCall / (pot + toCall);
  const threshold = potOdds - profile.sticky;

  const raiseWorthy = eq > 0.72 && rng() < 0.35 + profile.aggression * 0.5;
  const bluffRaise = read.isDraw && eq < 0.5 && rng() < profile.bluff * 0.6;
  if ((raiseWorthy || bluffRaise) && legal.canRaise) {
    const amount = Math.round(pot * (0.75 + profile.aggression * 0.5) + toCall);
    return {
      type: 'raise',
      amount: clampRaise(legal, player.bet + toCall + amount),
      reasoning: raiseWorthy ? 'raises for value' : 'raises as a semi-bluff',
    };
  }

  if (eq > threshold * noise) {
    return { type: 'call', reasoning: `calls getting ${(potOdds * 100).toFixed(0)}% pot odds with ${(eq * 100).toFixed(0)}% equity` };
  }
  return { type: 'fold', reasoning: `folds, ${(eq * 100).toFixed(0)}% equity is not enough to call` };
}

function clampRaise(legal, target) {
  const rounded = Math.round(target);
  return Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, rounded));
}
