/**
 * The table screen.
 *
 * Owns one hand at a time: deals it, drives the bots on a timer, collects
 * hero's action, has it graded before it is applied, and folds the result into
 * the player's profile when the hand ends.
 */

import { handLabel, makeRng } from '../cards.js';
import {
  createTable, startHand, applyAction, legalActions, positionOf,
  totalPot, isHeroToAct,
} from '../engine.js';
import { botAction, pickBots } from '../bots.js';
import { reviewDecision, summariseHand } from '../coach.js';
import { recordHand } from '../stats.js';
import { h, qs, clear, cardNode, cardRow, chips, signed, haptic, openSheet, closeSheet } from './dom.js';

const BOT_THINK_MIN = 420;
const BOT_THINK_MAX = 900;
const STREET_PAUSE = 620;

export class Game {
  constructor(app) {
    this.app = app;
    this.table = null;
    this.rng = makeRng(Date.now());
    this.timers = [];
    this.handRecord = null;
    this.pendingReviews = [];
    this.betAmount = 0;
    this.sizingKey = null;
    this.revealAll = false;
    this.busy = false;
  }

  get settings() { return this.app.settings; }

  // ------------------------------------------------------------ lifecycle --

  /** Seat a new table using the current settings. */
  newSession() {
    this.clearTimers();
    const { playerCount, startingStack, bigBlind } = this.settings;
    const bots = pickBots(playerCount - 1, this.rng);
    this.table = createTable({
      playerCount,
      startingStack,
      bigBlind,
      smallBlind: bigBlind / 2,
      bots,
      heroName: 'You',
      seed: (Math.random() * 1e9) | 0,
    });
    this.sessionNet = 0;
    this.handsThisSession = 0;
    this.dealNextHand();
  }

  dealNextHand() {
    this.clearTimers();
    closeSheet();
    if (!this.table) return this.newSession();

    // Every hand starts at the stack depth the player chose. Training is about
    // the decision in front of you, not about grinding a stack back, and a
    // fixed depth keeps pot-odds and commitment thresholds comparable across
    // hands. Results are tracked separately in the session total.
    for (const p of this.table.players) {
      p.stack = this.settings.startingStack;
      p.sittingOut = false;
    }

    startHand(this.table);
    this.revealAll = false;
    this.pendingReviews = [];
    this.handRecord = {
      handNumber: this.table.handNumber,
      bigBlind: this.table.bigBlind,
      position: positionOf(this.table, 0),
      holeCards: [...this.table.players[0].holeCards],
      vpip: false,
      pfr: false,
      threeBet: false,
      threeBetChance: false,
      sawFlop: false,
      showdown: false,
      postflopBets: 0,
      postflopCalls: 0,
      postflopFolds: 0,
      stackBefore: this.table.players[0].stack + this.table.players[0].committed,
    };
    this.hideCoach();
    this.render();
    this.step();
  }

  clearTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  later(fn, ms) {
    const id = setTimeout(() => {
      this.timers = this.timers.filter((t) => t !== id);
      fn();
    }, ms);
    this.timers.push(id);
    return id;
  }

  /** Advance the hand: either wait for hero, or let a bot act. */
  step() {
    const t = this.table;
    if (!t) return;
    if (t.handComplete) { this.finishHand(); return; }

    if (isHeroToAct(t)) {
      this.renderActions();
      return;
    }

    this.renderActions();          // shows the waiting note
    const delay = BOT_THINK_MIN + this.rng() * (BOT_THINK_MAX - BOT_THINK_MIN);
    this.later(() => {
      if (!this.table || this.table.handComplete) { this.render(); this.step(); return; }
      const before = this.table.street;
      const action = botAction(this.table, this.rng);
      applyAction(this.table, action);
      this.render();
      const streetChanged = this.table.street !== before;
      this.later(() => this.step(), streetChanged ? STREET_PAUSE : 90);
    }, delay);
  }

  // -------------------------------------------------------- hero actions --

  /** Grade, record and apply one hero action. */
  heroAct(action) {
    const t = this.table;
    if (!t || !isHeroToAct(t) || this.busy) return;
    this.busy = true;

    const street = t.street;
    const legal = legalActions(t);
    const review = reviewDecision(t, action, this.rng);

    // Track the counting stats before the action changes the state.
    const rec = this.handRecord;
    if (street === 'preflop') {
      const raisesBefore = t.history.filter((x) => x.action === 'raise').length;
      if (raisesBefore >= 1 && legal.toCall > 0) rec.threeBetChance = true;
      if (action.type === 'call' || action.type === 'raise') rec.vpip = true;
      if (action.type === 'raise') {
        rec.pfr = true;
        if (raisesBefore >= 1) rec.threeBet = true;
      }
    } else {
      if (action.type === 'bet' || action.type === 'raise') rec.postflopBets++;
      else if (action.type === 'call') rec.postflopCalls++;
      else if (action.type === 'fold') rec.postflopFolds++;
    }

    if (review) {
      this.pendingReviews.push({
        ...review,
        gradeKey: review.grade.key,
        summary: `${street}: ${review.action} - ${review.headline}`,
      });
    }

    haptic(action.type === 'fold' ? 6 : 12);
    const before = t.street;
    applyAction(t, action);
    this.busy = false;
    this.render();

    if (review && this.settings.coachMode === 'instant') this.showCoach(review);
    else this.hideCoach();

    const streetChanged = t.street !== before;
    this.later(() => this.step(), streetChanged ? STREET_PAUSE : 220);
  }

  // ------------------------------------------------------------ hand end --

  finishHand() {
    const t = this.table;
    const hero = t.players[0];
    const rec = this.handRecord;
    if (!rec || rec.recorded) { this.render(); this.renderActions(); return; }
    rec.recorded = true;

    // Hero "saw a flop" only if they were still in the hand once it came out.
    rec.sawFlop = t.board.length >= 3
      && (!hero.folded || t.history.some((x) => x.seat === 0 && x.street !== 'preflop'));
    rec.showdown = Boolean(t.results?.showdown) && !hero.folded;
    rec.net = hero.wonThisHand - hero.committed;
    rec.reviews = this.pendingReviews;

    const summary = summariseHand(this.pendingReviews, t);
    rec.summaryRow = {
      handNumber: t.handNumber,
      cards: [...rec.holeCards],
      position: rec.position,
      board: [...t.board],
      net: rec.net,
      bigBlind: t.bigBlind,
      lossBB: summary.lossInBB,
      verdict: summary.verdict,
      showdown: rec.showdown,
      handName: handLabel(rec.holeCards[0], rec.holeCards[1]),
      result: t.results?.hands?.find((x) => x.seat === 0)?.description ?? null,
      reviews: this.pendingReviews.map((r) => ({
        street: r.street,
        action: r.action,
        gradeKey: r.grade.key,
        tone: r.grade.tone,
        label: r.grade.label,
        headline: r.headline,
        notes: r.notes,
        idealText: r.idealText,
        evLoss: r.evLoss,
      })),
    };

    this.sessionNet = (this.sessionNet ?? 0) + rec.net;
    this.handsThisSession = (this.handsThisSession ?? 0) + 1;

    recordHand(this.app.profile, rec);
    this.app.persist();

    this.revealAll = Boolean(t.results?.showdown);
    this.render();
    this.renderActions();

    if (this.settings.autoAdvance && summary.lossInBB < 0.4) {
      this.later(() => this.dealNextHand(), 1900);
    }
  }

  /** The end-of-hand review sheet. */
  showHandReview() {
    const t = this.table;
    const rec = this.handRecord;
    if (!rec?.summaryRow) return;
    const summary = summariseHand(this.pendingReviews, t);
    const body = h('div', {},
      h('div', { class: 'card-panel' },
        h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' } },
          cardRow(rec.holeCards, { size: 'mini' }),
          h('div', {},
            h('div', { style: { fontWeight: '650' }, text: rec.summaryRow.handName }),
            h('div', { style: { fontSize: '12px', color: 'var(--text-dim)' }, text: `${rec.position} - ${rec.summaryRow.result ?? 'did not reach showdown'}` }))),
        t.board.length ? h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
          h('span', { style: { fontSize: '12px', color: 'var(--text-faint)' }, text: 'Board' }),
          cardRow(t.board, { size: 'mini' })) : null,
        h('div', {
          style: { marginTop: '11px', fontWeight: '700', fontSize: '17px', color: rec.net >= 0 ? 'var(--good)' : 'var(--bad)' },
          text: `${signed(rec.net)} chips`,
        }),
        h('p', { class: 'sub', style: { marginBottom: '0' }, text: summary.verdict })),
      h('div', { class: 'section-title', text: 'Your decisions' }),
      this.pendingReviews.length
        ? this.pendingReviews.map((r) => reviewNode(r))
        : h('div', { class: 'empty', text: 'You had no decisions to make in this hand.' }),
      t.results?.showdown ? h('div', {},
        h('div', { class: 'section-title', text: 'Showdown' }),
        h('div', { class: 'card-panel', style: { padding: '6px 13px' } },
          t.results.hands.map((entry, i) => h('div', {
            style: {
              display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0',
              borderBottom: i < t.results.hands.length - 1 ? '1px solid var(--line-soft)' : 'none',
            },
          },
          cardRow(entry.cards, { size: 'tiny' }),
          h('div', { style: { flex: '1', minWidth: '0' } },
            h('div', { style: { fontSize: '13px', fontWeight: '620' }, text: entry.name }),
            h('div', { style: { fontSize: '12px', color: 'var(--text-dim)' }, text: entry.description })),
          i === 0 ? h('span', { class: 'grade-badge good', text: 'Wins' }) : null)))) : null,
    );

    openSheet({
      title: `Hand ${rec.handNumber}`,
      body,
      footer: h('button', { class: 'btn primary wide', text: 'Next hand', onClick: () => this.dealNextHand() }),
    });
  }

  // -------------------------------------------------------------- render --

  render() {
    const t = this.table;
    if (!t) return;
    const hero = t.players[0];

    qs('#hand-no').textContent = `Hand ${t.handNumber}`;
    qs('#blind-info').innerHTML = `Blinds <b>${chips(t.smallBlind)}/${chips(t.bigBlind)}</b>`;
    const net = this.sessionNet ?? 0;
    const netNode = qs('#session-net');
    netNode.innerHTML = `Session <b>${signed(net)}</b>`;
    netNode.style.color = net > 0 ? 'var(--good)' : net < 0 ? 'var(--bad)' : '';

    this.renderSeats();
    this.renderBoard();
  }

  renderSeats() {
    const t = this.table;
    const layer = clear(qs('#seats'));
    const n = t.playerCount;

    t.players.forEach((p, seat) => {
      const relative = (seat - 0 + n) % n;                  // hero sits at index 0
      const angle = (90 + (relative * 360) / n) * (Math.PI / 180);
      // Kept inside the felt so a seat plate never runs off a narrow screen.
      const x = 50 + Math.cos(angle) * (n <= 3 ? 32 : 37);
      const y = 50 + Math.sin(angle) * (n <= 3 ? 30 : 36);

      const classes = ['seat'];
      if (p.isHero) classes.push('hero');
      if (p.folded) classes.push('folded');
      if (t.toAct === seat && !t.handComplete) classes.push('acting');
      const won = t.results?.payouts?.some((x) => x.seat === seat && x.amount > 0);
      if (t.handComplete && won) classes.push('winner');

      const pos = positionOf(t, seat);
      const showCards = p.isHero || this.revealAll;
      const aggressive = ['Bet', 'Raise', 'All in'].includes(p.lastAction);

      layer.append(h('div', {
        class: classes.join(' '),
        style: { '--x': `${x}%`, '--y': `${y}%` },
      },
      h('div', { class: 'seat-cards' },
        p.folded || !p.holeCards.length
          ? null
          : p.holeCards.map((c) => cardNode(showCards ? c : null, {
            size: p.isHero ? 'hole' : 'tiny',
            faceDown: !showCards,
            fourColour: this.settings.fourColourDeck,
          }))),
      h('div', { class: 'plate' },
        h('span', { class: `pos${pos === 'BTN' ? ' dealer' : ''}`, text: pos }),
        h('div', { class: 'nm', text: p.name }),
        h('div', { class: 'stk', text: chips(p.stack) })),
      p.bet > 0
        ? h('div', { class: 'bet' }, h('i', { class: 'disc' }), chips(p.bet))
        : p.lastAction
          ? h('div', { class: `act${aggressive ? ' aggressive' : ' passive'}`, text: p.lastAction })
          : null));
    });
  }

  renderBoard() {
    const t = this.table;
    const area = clear(qs('#board'));
    const pot = totalPot(t);
    area.append(h('div', { class: 'street-tag', text: t.handComplete ? 'Showdown' : t.street }));
    area.append(h('div', { class: 'card-row' },
      t.board.map((c) => cardNode(c, { size: '', fourColour: this.settings.fourColourDeck, animate: true }))));
    if (pot > 0) area.append(h('div', { class: 'pot-line', text: `Pot ${chips(pot)}` }));
  }

  renderActions() {
    const t = this.table;
    const bar = clear(qs('#actionbar'));
    if (!t) return;

    if (t.handComplete) {
      const hero = t.players[0];
      const net = hero.wonThisHand - hero.committed;
      bar.append(h('div', {
        style: { textAlign: 'center', fontWeight: '700', fontSize: '15px', color: net >= 0 ? 'var(--good)' : 'var(--bad)' },
        text: net >= 0 ? `You win ${chips(hero.wonThisHand)}` : `You lose ${chips(-net)}`,
      }));
      bar.append(h('div', { class: 'action-row' },
        h('button', { class: 'btn', text: 'Review hand', onClick: () => this.showHandReview() }),
        h('button', { class: 'btn primary', text: 'Next hand', onClick: () => this.dealNextHand() })));
      return;
    }

    if (!isHeroToAct(t)) {
      const p = t.players[t.toAct];
      bar.append(h('div', { class: 'waiting-note', text: p ? `${p.name} is thinking...` : 'Dealing...' }));
      return;
    }

    const legal = legalActions(t);
    const hero = t.players[0];
    const pot = legal.pot;
    const canRaise = legal.canRaise;

    if (canRaise) {
      const presets = legal.isBet
        ? [['⅓', 1 / 3], ['½', 0.5], ['¾', 0.75], ['Pot', 1], ['All in', null]]
        : [['½', 0.5], ['¾', 0.75], ['Pot', 1], ['2x', 2], ['All in', null]];

      const clampTo = (v) => Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, Math.round(v)));
      const forFraction = (f) => (f === null
        ? legal.maxRaiseTo
        : clampTo(hero.bet + legal.toCall + (pot + legal.toCall) * f));

      if (!this.betAmount || this.betAmount < legal.minRaiseTo || this.betAmount > legal.maxRaiseTo) {
        this.betAmount = forFraction(legal.isBet ? 0.5 : 0.75);
      }

      const output = h('output', { text: chips(this.betAmount) });
      const slider = h('input', {
        type: 'range',
        min: legal.minRaiseTo,
        max: legal.maxRaiseTo,
        step: 1,
        value: this.betAmount,
        'aria-label': 'Bet size',
      });
      const raiseBtn = h('button', {
        class: 'btn bet',
        onClick: () => this.heroAct({ type: legal.isBet ? 'bet' : 'raise', amount: this.betAmount }),
      }, h('span', { text: legal.isBet ? 'Bet' : 'Raise' }), h('small', { text: chips(this.betAmount) }));

      const sync = (value) => {
        this.betAmount = clampTo(value);
        output.textContent = chips(this.betAmount);
        slider.value = this.betAmount;
        raiseBtn.querySelector('small').textContent = chips(this.betAmount);
        for (const b of bar.querySelectorAll('.sizing-row button')) {
          b.setAttribute('aria-pressed', String(Number(b.dataset.amount) === this.betAmount));
        }
      };
      slider.addEventListener('input', () => sync(Number(slider.value)));

      bar.append(h('div', { class: 'sizing-row' }, presets.map(([label, f]) => {
        const amount = forFraction(f);
        return h('button', {
          text: label,
          data: { amount },
          'aria-pressed': String(amount === this.betAmount),
          onClick: () => { haptic(5); sync(amount); },
        });
      })));
      bar.append(h('div', { class: 'slider-row' }, slider, output));
      bar.append(h('div', { class: 'action-row' },
        h('button', {
          class: 'btn fold',
          onClick: () => this.heroAct({ type: legal.canFold ? 'fold' : 'check' }),
        }, h('span', { text: legal.canFold ? 'Fold' : 'Check' })),
        legal.canCall
          ? h('button', { class: 'btn check', onClick: () => this.heroAct({ type: 'call' }) },
            h('span', { text: 'Call' }), h('small', { text: chips(legal.callAmount) }))
          : h('button', { class: 'btn check', onClick: () => this.heroAct({ type: 'check' }) },
            h('span', { text: 'Check' })),
        raiseBtn));
    } else {
      bar.append(h('div', { class: 'action-row' },
        legal.canFold ? h('button', { class: 'btn fold', onClick: () => this.heroAct({ type: 'fold' }) }, h('span', { text: 'Fold' })) : null,
        legal.canCheck ? h('button', { class: 'btn check', onClick: () => this.heroAct({ type: 'check' }) }, h('span', { text: 'Check' })) : null,
        legal.canCall ? h('button', { class: 'btn primary', onClick: () => this.heroAct({ type: 'call' }) },
          h('span', { text: 'Call' }), h('small', { text: chips(legal.callAmount) })) : null));
    }
  }

  showCoach(review) {
    const strip = qs('#coach');
    clear(strip);
    strip.append(
      h('div', { class: 'hd' },
        h('span', { class: `grade-badge ${review.grade.tone}`, text: review.grade.label }),
        h('span', { class: 'hl', text: review.action })),
      h('div', { class: 'bd', style: { color: 'var(--text)', fontWeight: '620' }, text: review.headline }),
      h('div', { class: 'bd', text: review.notes[review.notes.length - 1] ?? '' }),
      h('button', {
        class: 'more',
        text: 'Why?',
        onClick: () => openSheet({
          title: `${review.street} - ${review.action}`,
          body: h('div', {}, reviewNode(review, true)),
          footer: h('button', { class: 'btn wide', text: 'Close', onClick: () => closeSheet() }),
        }),
      }),
    );
    strip.classList.add('show');
  }

  hideCoach() {
    qs('#coach')?.classList.remove('show');
  }
}

/** One graded decision, rendered for a review list. */
export function reviewNode(review, expanded = false) {
  const tone = review.grade?.tone ?? review.tone ?? 'neutral';
  const label = review.grade?.label ?? review.label ?? '';
  const notes = review.notes ?? [];
  return h('div', { class: `review ${tone}` },
    h('div', { class: 'rhead' },
      h('span', { class: 'street', text: review.street }),
      h('span', { class: 'did', text: review.action }),
      h('span', { class: `grade-badge ${tone}`, text: label })),
    (expanded ? notes : notes.slice(0, 2)).map((n) => h('div', { class: 'note', text: n })),
    review.grade?.key && review.grade.key !== 'great' && review.grade.key !== 'good' && review.idealText
      ? h('div', { class: 'better', text: `Better: ${review.idealText}` })
      : (review.idealText && ['inaccuracy', 'mistake', 'blunder'].includes(review.gradeKey)
        ? h('div', { class: 'better', text: `Better: ${review.idealText}` })
        : null));
}
