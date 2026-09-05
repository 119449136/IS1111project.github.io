/**
 * Every screen other than the table: setup, progress, practice and the hand
 * history. These are rendered fresh each time they are shown, which is cheap
 * at this size and removes a whole class of stale-view bugs.
 */

import { BOT_PROFILES, pickBots } from '../bots.js';
import {
  computeStats, benchmarkReport, rankLeaks, practicePlan, skillScore,
  streetBreakdown, recentTrend, formatStat,
} from '../stats.js';
import {
  chartGrid, topPercent, openRangePercent,
  actionOrderPositions, POSITION_FULL_NAMES,
} from '../ranges.js';
import { resetProfile } from '../storage.js';
import { h, qs, clear, cardRow, chips, signed, toast, openSheet, closeSheet } from './dom.js';
import { reviewNode } from './game.js';
import { trainingHub, trainingProgress } from './training.js';

// ---------------------------------------------------------------- setup --

export function renderSetup(app) {
  const root = clear(qs('#setup-body'));
  const s = app.settings;

  const playerButtons = h('div', { class: 'chip-row' },
    [2, 3, 4, 5, 6, 7, 8, 9].map((n) => h('button', {
      class: 'chip-toggle',
      text: String(n),
      'aria-pressed': String(s.playerCount === n),
      onClick: () => { app.updateSettings({ playerCount: n }); renderSetup(app); },
    })));

  // Stack depth is chosen in big blinds, which is how players actually think
  // about it, and converted to chips for the engine.
  const stackButtons = h('div', { class: 'chip-row' },
    [40, 75, 100, 200].map((depth) => {
      const target = depth * s.bigBlind;
      return h('button', {
        class: 'chip-toggle',
        text: `${depth}bb`,
        'aria-pressed': String(s.startingStack === target),
        onClick: () => { app.updateSettings({ startingStack: target }); renderSetup(app); },
      });
    }));

  const coachButtons = h('div', { class: 'chip-row' },
    COACH_MODES.map(([key, label]) => h('button', {
      class: 'chip-toggle',
      text: label,
      'aria-pressed': String(s.coachMode === key),
      onClick: () => { app.updateSettings({ coachMode: key }); renderSetup(app); },
    })));

  const lineup = pickBots(s.playerCount - 1, () => 0.5);

  root.append(
    h('div', { class: 'card-panel' },
      h('h2', { text: 'Table' }),
      h('p', { class: 'sub', text: 'Set the game up the way you want to practise it.' }),
      h('div', { class: 'field' },
        h('label', { text: 'Players at the table' }),
        playerButtons,
        h('div', {
          class: 'hint',
          text: s.playerCount === 2
            ? 'Heads up. Both ranges are enormously wider than at a full table.'
            : `Seats run from ${actionOrderPositions(s.playerCount)[0]} round to the big blind, and the button moves every hand.`,
        })),
      h('div', { class: 'field' },
        h('label', { text: 'Starting stacks' }),
        stackButtons,
        h('div', { class: 'hint', text: `${chips(s.startingStack)} chips at blinds of ${chips(s.bigBlind / 2)}/${chips(s.bigBlind)}.` })),
      h('div', { class: 'field', style: { marginBottom: '0' } },
        h('label', { text: 'Coaching' }),
        coachButtons,
        h('div', { class: 'hint', text: coachHint(s.coachMode) }))),

    h('div', { class: 'card-panel' },
      h('h2', { text: 'Your opponents' }),
      h('p', { class: 'sub', text: 'Each bot plays a consistent, recognisable style. Learning to spot them is half the game.' }),
      lineup.map((bot) => h('div', { class: 'opp-row' },
        h('div', { class: 'av', text: bot.emoji }),
        h('div', { style: { flex: '1' } },
          h('div', { class: 'nm', text: bot.name }),
          h('div', { class: 'st', text: bot.style }),
          h('div', { class: 'bl', text: bot.blurb }))))),

  );
}

const COACH_MODES = [
  ['instant', 'After each move'],
  ['end-of-hand', 'End of hand'],
  ['off', 'Silent'],
];

const coachHint = (mode) => ({
  instant: 'Every move is graded the moment you make it. Best for learning.',
  'end-of-hand': 'Play the hand out undisturbed, then review it in full.',
  off: 'No feedback at the table. Your statistics are still tracked.',
}[mode]);

// ------------------------------------------------------------- progress --

export function renderProgress(app) {
  const root = clear(qs('#progress-body'));
  const profile = app.profile;
  const stats = computeStats(profile);

  root.append(trainingProgress(profile));

  if (stats.hands === 0) {
    root.append(h('div', { class: 'empty' },
      h('span', { class: 'big', text: '📈' }),
      'Play a few hands and your numbers will appear here.'));
    return;
  }

  const score = skillScore(profile);
  const trend = recentTrend(profile);
  root.append(h('p', { class: 'sub', text: 'Game grades are simplified chart feedback, not solver EV. New post-flop notes are unscored. Older saved grades remain in historical totals.' }));

  root.append(h('div', { class: 'card-panel', style: { textAlign: 'center' } },
    h('div', { style: { fontSize: '11px', letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: '700' }, text: 'Decision score' }),
    h('div', {
      style: { fontSize: '52px', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-.03em', color: scoreColour(score.score) },
      text: score.score === null ? '-' : String(score.score),
    }),
    h('p', { class: 'sub', style: { marginBottom: '0' }, text: scoreBlurb(score, stats) })));

  root.append(h('div', { class: 'section-title', text: 'Results' }));
  root.append(h('div', { class: 'stat-grid' },
    statTile('Hands', String(stats.hands), 'played so far'),
    statTile('Net', signed(Math.round(profile.counters.netChips)), 'chips', profile.counters.netChips >= 0 ? 'good' : 'bad'),
    stats.bbPer100 === null
      ? statTile('bb/100', '-', `needs ${20 - stats.hands} more hand${20 - stats.hands === 1 ? '' : 's'}`)
      : statTile('bb/100', stats.bbPer100.toFixed(1), 'per hundred hands', stats.bbPer100 >= 0 ? 'good' : 'bad'),
    statTile(
      'Accuracy',
      stats.accuracy === null ? '-' : `${Math.round(stats.accuracy * 100)}%`,
      stats.decisions === 1 ? 'of 1 decision' : `of ${stats.decisions} decisions`,
    )));

  root.append(h('div', { class: 'section-title', text: 'Your game against the benchmarks' }));
  const report = benchmarkReport(stats);
  const panel = h('div', { class: 'card-panel' });
  for (const b of report) {
    const scale = b.format === 'ratio' ? 6 : 0.6;
    const value = Number.isFinite(b.value) ? Math.min(b.value, scale) : 0;
    panel.append(h('div', { class: 'bar-row' },
      h('span', { class: 'lbl', text: b.label }),
      h('div', { class: 'track' },
        h('div', {
          class: 'zone',
          style: { left: `${(b.low / scale) * 100}%`, width: `${((b.high - b.low) / scale) * 100}%` },
        }),
        h('div', {
          class: 'fill',
          style: {
            width: `${Math.min(100, (value / scale) * 100)}%`,
            background: b.verdict === 'on target' ? 'var(--good)' : 'var(--warn)',
          },
        })),
      h('span', { class: 'val', text: formatStat(b.value, b.format) })));
  }
  panel.append(h('div', { class: 'legend' },
    h('span', {}, h('i', { style: { background: 'rgba(67,197,158,.5)' } }), 'Healthy range'),
    h('span', {}, h('i', { style: { background: 'var(--gold)' } }), 'You')));
  root.append(panel);

  const offTarget = report.filter((b) => b.verdict !== 'on target' && b.verdict !== 'no data');
  if (offTarget.length) {
    root.append(h('div', { class: 'card-panel' },
      h('h2', { text: 'What these numbers say' }),
      offTarget.map((b) => h('p', {
        style: { fontSize: '13px', color: 'var(--text-dim)', margin: '0 0 8px' },
      }, h('b', { style: { color: 'var(--text)' }, text: `${b.full} ${b.verdict}. ` }), b.advice))));
  }

  root.append(h('div', { class: 'section-title', text: 'Heuristic penalties by street' }));
  const streets = streetBreakdown(profile);
  const worst = streets.slice().sort((a, b) => b.loss - a.loss)[0];
  const streetPanel = h('div', { class: 'card-panel' });
  for (const s of streets) {
    streetPanel.append(h('div', { class: 'bar-row' },
      h('span', { class: 'lbl', text: s.street[0].toUpperCase() + s.street.slice(1) }),
      h('div', { class: 'track' }, h('div', {
        class: 'fill',
        style: { width: `${Math.round(s.share * 100)}%`, background: s === worst && s.loss > 0 ? 'var(--bad)' : 'var(--gold)' },
      })),
      h('span', { class: 'val', text: `${s.loss.toFixed(1)}` })));
  }
  streetPanel.append(h('p', {
    class: 'sub',
    style: { marginBottom: '0', marginTop: '10px' },
    text: worst && worst.loss > 0.5
      ? `The largest recorded model penalty is on the ${worst.street}. These are study indicators, not calculated money lost.`
      : 'No large model penalties recorded. This does not prove that every decision was correct.',
  }));
  root.append(streetPanel);

  if (trend) {
    root.append(h('div', { class: 'card-panel' },
      h('h2', { text: 'Recent form' }),
      h('p', {
        class: 'sub',
        style: { marginBottom: '0' },
        text: trend.improving
          ? `Recorded heuristic penalties per hand fell from ${trend.older.toFixed(2)} to ${trend.recent.toFixed(2)}. This is not a measured change in profitability.`
          : trend.worsening
            ? `Recorded heuristic penalties per hand rose from ${trend.older.toFixed(2)} to ${trend.recent.toFixed(2)}. Review the saved decisions to understand why.`
            : 'Your play is steady across the session.',
      })));
  }

  root.append(h('button', {
    class: 'btn ghost wide danger',
    style: { marginTop: '8px' },
    text: 'Reset all progress',
    onClick: () => confirmReset(app),
  }));
}

const scoreColour = (n) => (n === null ? 'var(--text-faint)' : n >= 75 ? 'var(--good)' : n >= 55 ? 'var(--gold)' : 'var(--bad)');

function scoreBlurb(score, stats) {
  if (score.score === null) return 'Play a few more hands to get a reading.';
  if (score.confidence < 0.4) return `Based on ${score.sample} decisions so far. This will settle as you play more.`;
  if (score.score >= 80) return 'Very few costly mistakes. Your decisions hold up well.';
  if (score.score >= 65) return 'A solid foundation with some leaks left to close.';
  if (score.score >= 50) return 'Reasonable instincts, undone by a handful of expensive spots.';
  return 'There is a lot of value being left behind. Work through the practice plan.';
}

const statTile = (k, v, n, tone = '') =>
  h('div', { class: 'stat' },
    h('div', { class: 'k', text: k }),
    h('div', { class: `v ${tone}`, text: v }),
    h('div', { class: 'n', text: n }));

// ------------------------------------------------------------- practice --

export function renderPractice(app) {
  const root = clear(qs('#practice-body'));
  root.append(trainingHub(app));
  const profile = app.profile;
  const stats = computeStats(profile);
  const plan = practicePlan(profile, stats);
  const leaks = rankLeaks(profile);

  root.append(h('div', { class: 'section-title', text: 'Work on this next' }));
  for (const item of plan) {
    root.append(h('div', { class: 'leak' },
      h('div', { class: 'lh' },
        h('h3', { text: item.title }),
      item.cost > 0.4 ? h('span', { class: 'cost', text: 'Review' }) : null),
      h('p', { class: 'desc', text: item.detail }),
      h('div', { class: 'drill' }, h('b', { text: 'Drill' }), item.drill),
      item.count > 0
        ? h('p', { style: { fontSize: '11.5px', color: 'var(--text-faint)', margin: '8px 0 0' }, text: `Seen ${item.count} time${item.count === 1 ? '' : 's'} in your hands.` })
        : null));
  }

  root.append(h('div', { class: 'section-title', text: 'Opening ranges' }));
  root.append(rangeTrainer(app));

  if (leaks.length > 3) {
    root.append(h('div', { class: 'section-title', text: 'Everything else showing up' }));
    const panel = h('div', { class: 'card-panel', style: { padding: '4px 14px' } });
    for (const leak of leaks.slice(3)) {
      panel.append(h('div', {
        style: { padding: '11px 0', borderBottom: '1px solid var(--line-soft)' },
      },
      h('div', { style: { display: 'flex', gap: '8px' } },
        h('b', { style: { fontSize: '13.5px', flex: '1' }, text: leak.title }),
        h('span', { style: { fontSize: '12px', color: 'var(--text-faint)' }, text: `${leak.count}x` })),
      h('div', { style: { fontSize: '12.5px', color: 'var(--text-dim)' }, text: leak.short })));
    }
    root.append(panel);
  }

  root.append(h('div', { class: 'section-title', text: 'Know your opponents' }));
  const oppPanel = h('div', { class: 'card-panel' });
  for (const bot of BOT_PROFILES) {
    oppPanel.append(h('div', { class: 'opp-row' },
      h('div', { class: 'av', text: bot.emoji }),
      h('div', { style: { flex: '1' } },
        h('div', { class: 'nm', text: `${bot.name} - ${bot.style}` }),
        h('div', { class: 'bl', text: bot.blurb }),
        h('div', {
          style: { fontSize: '12.5px', color: 'var(--good)', marginTop: '5px' },
          text: `How to beat them: ${bot.counterTip}`,
        }))));
  }
  root.append(oppPanel);
}

/** An interactive 13x13 chart of the opening range for each seat. */
function rangeTrainer(app) {
  const panel = h('div', { class: 'card-panel' });
  const positions = actionOrderPositions(app.settings.playerCount);
  const state = { position: positions.includes('BTN') ? 'BTN' : positions[0], players: app.settings.playerCount };
  const grid = h('div', { class: 'range-grid' });
  const caption = h('p', { class: 'sub', style: { marginBottom: '0', marginTop: '10px' } });

  const draw = () => {
    const pctWidth = openRangePercent(state.position, state.players);
    const inRange = topPercent(pctWidth);
    clear(grid);
    for (const row of chartGrid()) {
      for (const code of row) {
        grid.append(h('div', {
          class: inRange.has(code) ? 'in' : '',
          text: code,
        }));
      }
    }
    caption.textContent = `Simplified raise-first-in chart for ${POSITION_FULL_NAMES[state.position] ?? state.position}, ${state.players}-handed: about ${pctWidth.toFixed(0)}% of combinations. Assumes nobody has entered the pot. This is a teaching baseline, not a solved strategy or a chart for facing a raise.`;
  };

  const buttons = h('div', { class: 'chip-row', style: { marginBottom: '11px' } },
    positions.map((pos) => h('button', {
      class: 'chip-toggle',
      text: pos,
      'aria-pressed': String(pos === state.position),
      onClick: (e) => {
        state.position = pos;
        for (const b of buttons.children) b.setAttribute('aria-pressed', 'false');
        e.currentTarget.setAttribute('aria-pressed', 'true');
        draw();
      },
    })));

  panel.append(
    h('h2', { text: 'Which hands to open' }),
    h('p', { class: 'sub', text: 'Tap a position to see the hands worth raising when nobody has entered the pot.' }),
    buttons, grid, caption,
  );
  draw();
  return panel;
}

// -------------------------------------------------------------- history --

export function renderHistory(app) {
  const root = clear(qs('#history-body'));
  const log = app.profile.handLog;

  if (!log.length) {
    root.append(h('div', { class: 'empty' },
      h('span', { class: 'big', text: '🗂' }),
      'Hands you play will be listed here so you can look back at them.'));
    return;
  }

  root.append(h('p', {
    class: 'sub',
    style: { marginTop: '0' },
    text: `Your last ${log.length} hand${log.length === 1 ? '' : 's'}, newest first. Tap one to see it graded.`,
  }));

  for (const row of log) {
    const tone = row.lossBB < 0.4 ? 'good' : row.lossBB < 2 ? 'warn' : 'bad';
    root.append(h('button', {
      class: 'hand-row',
      onClick: () => showHandDetail(row),
    },
    h('span', { class: 'idx', text: `#${row.handNumber}` }),
    h('span', { class: 'cards' }, cardRow(row.cards ?? [], { size: 'tiny' })),
    h('span', { class: 'mid' },
      h('span', { style: { fontSize: '13px', fontWeight: '620', display: 'block' }, text: row.position ?? '' }),
      h('span', { class: 'desc', text: row.result ?? row.verdict ?? '' })),
    h('span', { class: `grade-badge ${tone}`, text: row.lossBB < 0.4 ? 'Notes' : 'Review' }),
    h('span', { class: `net ${row.net >= 0 ? 'up' : 'down'}`, text: signed(row.net) })));
  }
}

function showHandDetail(row) {
  const body = h('div', {},
    h('div', { class: 'card-panel' },
      h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
        cardRow(row.cards ?? [], { size: 'mini' }),
        h('div', {},
          h('div', { style: { fontWeight: '650' }, text: row.handName ?? '' }),
          h('div', { style: { fontSize: '12px', color: 'var(--text-dim)' }, text: `${row.position ?? ''} - ${row.result ?? 'no showdown'}` }))),
      row.board?.length
        ? h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '11px' } },
          h('span', { style: { fontSize: '12px', color: 'var(--text-faint)' }, text: 'Board' }),
          cardRow(row.board, { size: 'mini' }))
        : null,
      h('div', {
        style: { marginTop: '11px', fontWeight: '700', fontSize: '17px', color: row.net >= 0 ? 'var(--good)' : 'var(--bad)' },
        text: `${signed(row.net)} chips`,
      }),
      h('p', { class: 'sub', style: { marginBottom: '0' }, text: row.verdict ?? '' })),
    h('div', { class: 'section-title', text: 'Decisions' }),
    (row.reviews ?? []).length
      ? row.reviews.map((r) => reviewNode(r))
      : h('div', { class: 'empty', text: 'No decisions were recorded for this hand.' }),
  );
  openSheet({
    title: `Hand ${row.handNumber}`,
    body,
    footer: h('button', { class: 'btn wide', text: 'Close', onClick: () => closeSheet() }),
  });
}

// ------------------------------------------------------------- settings --

export function showSettings(app) {
  const s = app.settings;
  const toggle = (key, title, note) => {
    const btn = h('button', {
      class: 'switch',
      'aria-pressed': String(Boolean(s[key])),
      'aria-label': title,
      onClick: (e) => {
        const next = !app.settings[key];
        app.updateSettings({ [key]: next });
        e.currentTarget.setAttribute('aria-pressed', String(next));
        app.refreshCurrentScreen();
      },
    });
    return h('div', { class: 'switch-row' },
      h('div', { class: 't' }, h('b', { text: title }), h('span', { text: note })), btn);
  };

  const coachButtons = h('div', { class: 'chip-row' },
    COACH_MODES.map(([key, label]) => h('button', {
      class: 'chip-toggle',
      text: label,
      'aria-pressed': String(s.coachMode === key),
      onClick: (e) => {
        app.updateSettings({ coachMode: key });
        for (const b of coachButtons.children) b.setAttribute('aria-pressed', 'false');
        e.currentTarget.setAttribute('aria-pressed', 'true');
        qs('#coach-hint').textContent = coachHint(key);
        app.refreshCurrentScreen();
      },
    })));

  const body = h('div', {},
    h('div', { class: 'card-panel' },
      h('h2', { text: 'Coaching' }),
      coachButtons,
      h('div', { class: 'hint', id: 'coach-hint', style: { marginTop: '9px' }, text: coachHint(s.coachMode) })),
    h('div', { class: 'card-panel' },
      h('h2', { text: 'Display' }),
      toggle('fourColourDeck', 'Four-colour deck', 'Each suit gets its own colour, which makes flush draws obvious.'),
      toggle('autoAdvance', 'Deal the next hand automatically', 'Skips the pause after hands you played cleanly.')),
    h('div', { class: 'card-panel' },
      h('h2', { text: 'About' }),
      h('p', { class: 'sub', style: { marginBottom: '0' } },
        'Hands are dealt from a shuffled deck and the bots see only their own cards, exactly as you do. ',
        'Equity figures come from simulating the rest of the board thousands of times. ',
        'Everything you play is stored on this device only.')),
  );
  openSheet({
    title: 'Settings',
    body,
    footer: h('button', { class: 'btn wide', text: 'Done', onClick: () => closeSheet() }),
  });
}

function confirmReset(app) {
  openSheet({
    title: 'Reset progress',
    body: h('div', {},
      h('p', { text: 'This permanently deletes every hand you have played, along with your statistics and your practice plan.' }),
      h('p', { style: { color: 'var(--text-dim)', fontSize: '13px' }, text: 'It cannot be undone.' })),
    footer: h('div', { style: { display: 'flex', gap: '8px' } },
      h('button', { class: 'btn', style: { flex: '1' }, text: 'Cancel', onClick: () => closeSheet() }),
      h('button', {
        class: 'btn danger',
        style: { flex: '1' },
        text: 'Delete everything',
        onClick: () => {
          app.profile = resetProfile();
          closeSheet();
          app.refreshCurrentScreen();
          toast('Progress reset');
        },
      })),
  });
}
