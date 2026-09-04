/**
 * The coach.
 *
 * Grades a single hero decision at the moment it is made, in the language a
 * good player would use at the table. Every judgement is anchored to a number
 * the player can check: a chart position before the flop, a pot-odds and
 * equity comparison after it.
 *
 * The estimates here are deliberately honest about their limits. Postflop
 * expected value is computed for the current street only and ignores what
 * happens on later ones, so the coach treats a close call as close rather than
 * pretending to a precision it does not have.
 */

import { handCode, handLabel, cardsToString } from './cards.js';
import { describe } from './evaluator.js';
import { equity, analyseHand, outsToEquity } from './equity.js';
import {
  percentileOf, openRangePercent, threeBetPercent, callRangePercent,
  POSITION_FULL_NAMES,
} from './ranges.js';
import { positionOf, contenders, legalActions } from './engine.js';
import { inferredRangePercent } from './bots.js';

/**
 * The leaks the app can name. Each one carries the drill that fixes it, which
 * is what turns a list of mistakes into something a player can practise.
 */
export const LEAKS = {
  'preflop-loose': {
    title: 'Playing too many hands',
    short: 'Opening or calling with hands outside the chart for your seat.',
    drill: 'Before every preflop decision, name your position out loud and check the hand against that position\'s range. Fold everything outside it for a full session.',
  },
  'preflop-tight': {
    title: 'Folding too much before the flop',
    short: 'Passing up profitable opens, especially in late position.',
    drill: 'From the button and cutoff, raise every hand inside the chart even when it feels marginal. Suited connectors and small aces are opens, not folds.',
  },
  'limping': {
    title: 'Limping instead of raising',
    short: 'Calling the big blind rather than opening for a raise.',
    drill: 'Make it a rule: if a hand is good enough to play when nobody has raised, it is good enough to raise. Fold or raise, never call.',
  },
  'missed-3bet': {
    title: 'Not three-betting strong hands',
    short: 'Flat calling with hands that should be re-raising for value.',
    drill: 'Three-bet your premium hands every time for one session. Getting money in before the flop with the best hand is where most of your edge comes from.',
  },
  'pot-odds': {
    title: 'Calling without the odds',
    short: 'Putting chips in when your equity does not cover the price.',
    drill: 'Say the price out loud before every call: "I am risking X to win Y, so I need Z percent." Then estimate your equity and compare.',
  },
  'over-folding': {
    title: 'Folding hands with enough equity',
    short: 'Passing on calls that show a clear profit.',
    drill: 'When facing a small bet, count your outs before folding. Against half-pot you only need about 25 percent to continue.',
  },
  'missed-value': {
    title: 'Not betting strong hands',
    short: 'Checking hands that should be extracting chips.',
    drill: 'With top pair or better, bet. Ask "what worse hand can call?" - if there is one, there is a bet to make.',
  },
  'over-bluffing': {
    title: 'Bluffing too often',
    short: 'Firing with no equity, often into players who will not fold.',
    drill: 'Bluff only with a plan: a draw that can improve, or a board that genuinely misses the caller. Never bluff more than one opponent at a time.',
  },
  'draw-chasing': {
    title: 'Chasing draws too expensively',
    short: 'Paying more for a draw than the pot is offering.',
    drill: 'Use the rule of four and two. On the flop multiply outs by four, on the turn by two, and only continue when that beats the price.',
  },
  'bet-sizing': {
    title: 'Bet sizing',
    short: 'Betting an amount that does not match the goal of the bet.',
    drill: 'Pick a size for a reason. Value bets should be large enough to be paid, bluffs only large enough to fold out better hands.',
  },
  'passive': {
    title: 'Playing too passively',
    short: 'Checking and calling where betting and raising win more.',
    drill: 'For one session, take the aggressive option whenever it is close. Aggression wins pots you would otherwise lose at showdown.',
  },
  'position': {
    title: 'Ignoring position',
    short: 'Playing wide out of position, tight in position - the wrong way round.',
    drill: 'Tighten up from the blinds and under the gun. Widen on the button, where you act last on every street.',
  },
  'stack-management': {
    title: 'Committing at the wrong moment',
    short: 'Putting a large fraction of your stack in without the hand to back it.',
    drill: 'Check the ratio of your stack to the pot before betting. Below about three, a bet usually means playing for the rest of your chips.',
  },
};

const GRADES = [
  { key: 'great', label: 'Great', threshold: 0.05, tone: 'good' },
  { key: 'good', label: 'Good', threshold: 0.35, tone: 'good' },
  { key: 'ok', label: 'Fine', threshold: 1.0, tone: 'neutral' },
  { key: 'inaccuracy', label: 'Inaccuracy', threshold: 2.5, tone: 'warn' },
  { key: 'mistake', label: 'Mistake', threshold: 6, tone: 'bad' },
  { key: 'blunder', label: 'Blunder', threshold: Infinity, tone: 'bad' },
];

const gradeFor = (lossInBB) => GRADES.find((g) => lossInBB < g.threshold) ?? GRADES[GRADES.length - 1];

const pct = (x) => `${Math.round(x * 100)}%`;
const bb = (chips, bigBlind) => `${(chips / bigBlind).toFixed(1)}bb`;

/**
 * Grade a decision. Call this with the table in the state hero faces, before
 * the action is applied.
 *
 * @param {object} table live table state, hero to act
 * @param {{type:string, amount?:number}} action what hero chose
 * @param {function} [rng]
 * @returns {object} a review record
 */
export function reviewDecision(table, action, rng = Math.random) {
  const hero = table.players[table.toAct];
  const legal = legalActions(table);
  if (!hero || !legal) return null;

  const context = buildContext(table, hero, legal, rng);
  const review = table.street === 'preflop'
    ? reviewPreflop(context, action)
    : reviewPostflop(context, action);

  review.context = context;
  review.action = describeAction(action, context);
  review.grade = gradeFor(review.evLoss / table.bigBlind);
  review.street = table.street;
  review.handNumber = table.handNumber;
  return review;
}

function buildContext(table, hero, legal, rng) {
  const opponents = contenders(table).filter((p) => p.seat !== hero.seat);
  const ranges = opponents.map((p) => inferredRangePercent(table, p.seat));
  const pot = legal.pot;
  const toCall = legal.callAmount;

  const board = table.board;
  const read = board.length ? analyseHand(hero.holeCards, board) : null;

  let eq = null;
  if (board.length) {
    eq = equity({
      hero: hero.holeCards,
      board,
      opponents: Math.max(1, opponents.length),
      rangePct: ranges.length ? ranges : 100,
      sims: opponents.length <= 2 ? 4000 : 2500,
      rng,
    }).equity;
  }

  return {
    table,
    hero,
    legal,
    pot,
    toCall,
    board: [...board],
    boardText: cardsToString(board),
    holeText: cardsToString(hero.holeCards),
    handCode: handCode(hero.holeCards[0], hero.holeCards[1]),
    handName: handLabel(hero.holeCards[0], hero.holeCards[1]),
    position: positionOf(table, hero.seat),
    positionName: POSITION_FULL_NAMES[positionOf(table, hero.seat)] ?? positionOf(table, hero.seat),
    opponentCount: opponents.length,
    opponentNames: opponents.map((p) => p.name),
    opponentRanges: ranges,
    bigBlind: table.bigBlind,
    stack: hero.stack,
    spr: pot > 0 ? hero.stack / pot : Infinity,
    read,
    equity: eq,
    requiredEquity: toCall > 0 ? toCall / (pot + toCall) : 0,
    street: table.street,
  };
}

function describeAction(action, ctx) {
  switch (action.type) {
    case 'fold': return 'Fold';
    case 'check': return 'Check';
    case 'call': return `Call ${ctx.toCall}`;
    case 'bet': return `Bet ${Math.round(action.amount - ctx.hero.bet)}`;
    case 'raise': return `Raise to ${Math.round(action.amount)}`;
    default: return action.type;
  }
}

// ---------------------------------------------------------------------------
// Before the flop
// ---------------------------------------------------------------------------

function reviewPreflop(ctx, action) {
  const { table, legal, position, handCode: code, handName } = ctx;
  const hp = percentileOf(code);
  const n = table.playerCount;
  const raises = table.history.filter((h) => h.action === 'raise').length;
  const facingRaise = legal.toCall > table.bigBlind - 0.001 && raises > 0;
  const bigBlind = table.bigBlind;

  const notes = [];
  let ideal;
  let evLoss = 0;
  const tags = [];

  if (!facingRaise) {
    const openPct = openRangePercent(position, n);
    const inRange = hp <= openPct;
    const clearlyOut = hp > openPct * 1.6;
    const limpersBehind = table.history.filter((h) => h.action === 'call').length;

    ideal = inRange ? 'raise' : (legal.canCheck ? 'check' : 'fold');
    notes.push(`${handName} sits in the top ${hp.toFixed(0)}% of hands. From ${ctx.positionName} with ${n} players you should be opening about the top ${openPct.toFixed(0)}%.`);

    if (action.type === 'raise') {
      if (inRange) {
        const target = bigBlind * (n > 6 ? 3 : 2.5) + bigBlind * limpersBehind;
        const size = action.amount;
        if (size > target * 1.9) {
          evLoss = 0.4 * bigBlind;
          tags.push('bet-sizing');
          notes.push(`The raise is larger than it needs to be. About ${Math.round(target)} does the same job and risks less.`);
        } else {
          notes.push('Opening for a raise is exactly right. You take the betting lead and give yourself two ways to win the pot.');
        }
      } else if (clearlyOut) {
        evLoss = (2 + Math.min(4, (hp - openPct) / 12)) * bigBlind;
        tags.push('preflop-loose', position === 'UTG' || position === 'SB' ? 'position' : null);
        notes.push(`This is well outside the opening range for ${ctx.positionName}. Hands like this are the ones that cost money over a session, because you play them out of position with the worst of it.`);
      } else {
        evLoss = 0.6 * bigBlind;
        tags.push('preflop-loose');
        notes.push('This is a touch wide for the seat. Not a disaster, but the tightest version of this range performs better.');
      }
    } else if (action.type === 'call') {
      // Limping.
      evLoss = inRange ? 1.2 * bigBlind : 2.2 * bigBlind;
      tags.push('limping', 'passive');
      notes.push('Limping surrenders the initiative. Raising folds out hands that would have outdrawn you and builds a pot you are favourite in.');
      if (!inRange) notes.push('This hand is also outside the range for your seat, so folding is the alternative.');
    } else if (action.type === 'fold' || action.type === 'check') {
      if (inRange && hp <= openPct * 0.75) {
        evLoss = (1.5 + (openPct - hp) / 14) * bigBlind;
        tags.push('preflop-tight', 'position');
        notes.push(`Folding here gives up a clearly profitable open. From ${ctx.positionName} this hand makes money.`);
      } else if (inRange) {
        evLoss = 0.5 * bigBlind;
        tags.push('preflop-tight');
        notes.push('This is at the edge of the range, so folding is defensible, but opening is the stronger play.');
      } else {
        notes.push('Correct fold. There is nothing to be gained playing this from here.');
      }
    }
  } else {
    // Facing a raise or a re-raise.
    const openerEntry = [...table.history].reverse().find((h) => h.action === 'raise');
    const openerPos = openerEntry?.position ?? 'CO';
    const threeBet = raises >= 2;
    const threeBetPct = threeBet ? 3 : threeBetPercent(position, openerPos, n);
    const callPct = threeBet ? 8 : callRangePercent(position, openerPos, n);

    notes.push(`${handName} is top ${hp.toFixed(0)}%. Facing a ${threeBet ? 'three-bet' : `raise from ${openerPos}`}, from ${ctx.positionName} roughly the top ${threeBetPct.toFixed(0)}% re-raises and up to the top ${callPct.toFixed(0)}% calls.`);

    const shouldRaise = hp <= threeBetPct;
    const shouldCall = !shouldRaise && hp <= callPct;
    ideal = shouldRaise ? 'raise' : shouldCall ? 'call' : 'fold';

    if (action.type === 'raise') {
      if (shouldRaise) notes.push('Re-raising is right. This hand plays well in a big pot and you want the money in now.');
      else if (hp <= callPct) {
        evLoss = 1.2 * bigBlind;
        tags.push('bet-sizing');
        notes.push('This hand is strong enough to continue but not to re-raise for value. Calling keeps weaker hands in.');
      } else {
        evLoss = 3 * bigBlind;
        tags.push('preflop-loose');
        notes.push('Re-raising with a hand this far outside the range invites exactly the hands that beat it to continue.');
      }
    } else if (action.type === 'call') {
      if (shouldCall) notes.push('A comfortable call. The hand is worth seeing a flop with, at this price and in this seat.');
      else if (shouldRaise) {
        evLoss = 2 * bigBlind;
        tags.push('missed-3bet', 'passive');
        notes.push('This hand wants to re-raise. Flat calling lets other players in behind and wastes the strongest part of your range.');
      } else {
        const priceInBB = ctx.toCall / bigBlind;
        evLoss = (1.2 + Math.min(4, priceInBB * 0.35)) * bigBlind;
        tags.push('preflop-loose', 'pot-odds');
        notes.push(`Calling a raise with this is the most common way to lose money before the flop. It is outside the calling range, and you will often be dominated.`);
      }
    } else if (action.type === 'fold') {
      if (shouldRaise) {
        evLoss = 4 * bigBlind;
        tags.push('preflop-tight', 'missed-3bet');
        notes.push('This is far too strong to fold. Hands this good are where your profit comes from.');
      } else if (shouldCall && hp <= callPct * 0.7) {
        evLoss = 1.2 * bigBlind;
        tags.push('preflop-tight');
        notes.push('This is a fold you can afford to make, but calling is better at this price.');
      } else {
        notes.push('Fine fold. Discipline against a raise is worth more than most people think.');
      }
    } else if (action.type === 'check') {
      notes.push('Checking the option is free.');
    }
  }

  return {
    evLoss,
    ideal,
    idealText: idealLabel(ideal, ctx),
    notes,
    tags: tags.filter(Boolean),
    equity: null,
    headline: headlineFor(evLoss / bigBlind, ideal, ctx),
  };
}

// ---------------------------------------------------------------------------
// After the flop
// ---------------------------------------------------------------------------

function reviewPostflop(ctx, action) {
  const { pot, toCall, read, equity: eq, bigBlind, opponentCount } = ctx;
  const notes = [];
  const tags = [];
  let evLoss = 0;
  let ideal;

  const madeText = read ? describe(read.score) : '';
  notes.push(`You hold ${madeText.toLowerCase()} on ${ctx.boardText}. Against ${opponentCount === 1 ? 'one opponent' : `${opponentCount} opponents`} that is worth about ${pct(eq)} equity.`);

  if (read?.isDraw) {
    const drawName = read.flushDraw && read.openEnded ? 'a flush draw and an open-ended straight draw'
      : read.flushDraw ? 'a flush draw'
        : read.openEnded ? 'an open-ended straight draw' : 'a gutshot';
    notes.push(`You are drawing: ${drawName}, roughly ${read.outs} outs, about ${pct(outsToEquity(read.outs, read.cardsToCome))} to get there by the river.`);
  }

  if (toCall > 0) {
    // Facing a bet: the price is explicit, so grade against it.
    const required = ctx.requiredEquity;
    const evCall = eq * pot - (1 - eq) * toCall;
    const impliedBonus = read?.isDraw && ctx.spr > 1.5 ? 0.04 : 0;
    notes.push(`It costs ${toCall} into a pot of ${pot}, so you need ${pct(required)} to break even. You have ${pct(eq)}.`);

    ideal = eq + impliedBonus > required ? (eq > 0.72 ? 'raise' : 'call') : 'fold';

    if (action.type === 'call') {
      if (eq + impliedBonus >= required) {
        notes.push(`Correct call, worth about ${bb(evCall, bigBlind)} on this street alone.`);
        if (eq > 0.75) {
          evLoss = 0.8 * bigBlind;
          tags.push('passive', 'missed-value');
          notes.push('With a hand this strong, raising wins more than calling does. You are only letting them off cheaply.');
        }
      } else {
        evLoss = Math.abs(evCall);
        tags.push(read?.isDraw ? 'draw-chasing' : 'pot-odds');
        notes.push(`The price is worse than your equity, so this call loses about ${bb(Math.abs(evCall), bigBlind)} every time you make it.`);
        if (read?.isDraw) notes.push('A draw is only worth calling when the pot is offering the right price, or when a big enough bet is likely to be paid off later.');
      }
    } else if (action.type === 'fold') {
      if (eq + impliedBonus > required + 0.06) {
        evLoss = evCall;
        tags.push('over-folding');
        notes.push(`Folding gives up about ${bb(evCall, bigBlind)}. At this price the call shows a clear profit.`);
      } else if (eq > required) {
        evLoss = Math.max(0, evCall) * 0.5;
        notes.push('This is close to break even, so folding is defensible, though calling is marginally better.');
      } else {
        notes.push('Good discipline. There was no price here and no reason to continue.');
      }
    } else if (action.type === 'raise') {
      if (eq > 0.7) {
        notes.push('Raising for value with a hand this strong is exactly right.');
      } else if (read?.isDraw && eq > 0.35) {
        notes.push('A semi-bluff raise. You have outs if called and you can win the pot right now, which is a good combination.');
        evLoss = 0.2 * bigBlind;
      } else if (eq < required) {
        evLoss = (2 + toCall / bigBlind) * bigBlind * 0.5;
        tags.push('over-bluffing');
        notes.push('Raising here with no equity commits chips to a pot you will usually have to give up. There is little that folds which was beating you.');
      } else {
        evLoss = 1.0 * bigBlind;
        tags.push('bet-sizing');
        notes.push('This hand is good enough to call but turning it into a raise mostly folds out worse and keeps in better.');
      }
    }
  } else {
    // Nobody has bet. The choice is between checking and betting.
    const strong = eq > 0.65;
    const decent = eq > 0.5;
    const betAmount = action.type === 'bet' || action.type === 'raise'
      ? Math.round(action.amount - ctx.hero.bet) : 0;
    const sizeFraction = pot > 0 ? betAmount / pot : 0;

    ideal = strong || (read?.isDraw && opponentCount === 1) ? 'bet' : 'check';

    if (action.type === 'check') {
      if (strong) {
        const missed = pot * 0.55 * Math.min(1, eq);
        evLoss = missed;
        tags.push('missed-value', 'passive');
        notes.push(`Checking a hand this strong leaves money behind. A bet of around ${Math.round(pot * 0.6)} gets called by plenty of worse hands.`);
      } else if (read?.isDraw && opponentCount === 1) {
        evLoss = 0.5 * bigBlind;
        tags.push('passive');
        notes.push('Against one opponent this draw is a good candidate to bet. You can win the pot immediately and still have outs when called.');
      } else {
        notes.push('Checking is right. There is not enough here to bet for value and not enough reason to bluff.');
      }
    } else if (action.type === 'bet' || action.type === 'raise') {
      if (strong) {
        if (sizeFraction < 0.3) {
          evLoss = pot * 0.2;
          tags.push('bet-sizing');
          notes.push(`A bet this small does not charge anyone. With ${pct(eq)} equity you want closer to ${Math.round(pot * 0.66)}.`);
        } else if (sizeFraction > 1.6) {
          evLoss = 0.7 * bigBlind;
          tags.push('bet-sizing');
          notes.push('An overbet this large usually folds out the hands you were hoping would call.');
        } else {
          notes.push('A clear value bet, and the sizing is sensible.');
        }
      } else if (decent) {
        notes.push('A thin value bet. Reasonable against opponents who call too much, though it will sometimes run into better.');
      } else if (read?.isDraw) {
        if (opponentCount > 2) {
          evLoss = 1.2 * bigBlind;
          tags.push('over-bluffing');
          notes.push('Semi-bluffing into three or more players rarely works. Somebody has a hand.');
        } else {
          notes.push('A fair semi-bluff. You have equity when called and folds when you are behind.');
        }
      } else {
        evLoss = (1.5 + sizeFraction * 2) * bigBlind * (opponentCount > 1 ? 1.6 : 1);
        tags.push('over-bluffing');
        notes.push(`A bluff with ${pct(eq)} equity and no draw is unlikely to work${opponentCount > 1 ? ', least of all against several players' : ''}. Checking keeps the pot small and lets you give up cheaply.`);
      }

      if (ctx.spr < 3 && sizeFraction > 0.8 && !strong) {
        tags.push('stack-management');
        notes.push(`With only ${ctx.spr.toFixed(1)} times the pot behind, a bet this size commits you to the hand.`);
      }
    }
  }

  return {
    evLoss: Math.max(0, evLoss),
    ideal,
    idealText: idealLabel(ideal, ctx),
    notes,
    tags: [...new Set(tags)],
    equity: eq,
    headline: headlineFor(evLoss / bigBlind, ideal, ctx),
  };
}

function idealLabel(ideal, ctx) {
  switch (ideal) {
    case 'raise': return ctx.toCall > 0 ? 'Raise' : 'Bet';
    case 'bet': return 'Bet';
    case 'call': return `Call ${ctx.toCall}`;
    case 'check': return 'Check';
    default: return 'Fold';
  }
}

function headlineFor(lossBB, ideal, ctx) {
  const grade = gradeFor(lossBB);
  if (grade.key === 'great') return 'Well played.';
  if (grade.key === 'good') return 'Solid, with a small edge left behind.';
  if (grade.key === 'ok') return 'Playable, but not the best option.';
  return `${idealLabel(ideal, ctx)} was better here.`;
}

/**
 * A short verdict on a whole hand, built from the decisions inside it.
 */
export function summariseHand(reviews, table) {
  const graded = reviews.filter(Boolean);
  const worst = graded.slice().sort((a, b) => b.evLoss - a.evLoss)[0];
  const totalLoss = graded.reduce((s, r) => s + r.evLoss, 0);
  const tags = [...new Set(graded.flatMap((r) => r.tags))];

  let verdict;
  if (graded.length === 0) verdict = 'No decisions to review.';
  else if (totalLoss / table.bigBlind < 0.4) verdict = 'Cleanly played from start to finish.';
  else if (totalLoss / table.bigBlind < 1.5) verdict = 'Well played overall, with one small leak.';
  else if (totalLoss / table.bigBlind < 5) verdict = 'A reasonable hand with a costly moment in it.';
  else verdict = 'This hand cost you chips it did not have to.';

  return {
    verdict,
    totalLoss,
    lossInBB: totalLoss / table.bigBlind,
    worst: worst && worst.evLoss > 0.3 * table.bigBlind ? worst : null,
    tags,
    decisions: graded.length,
  };
}
