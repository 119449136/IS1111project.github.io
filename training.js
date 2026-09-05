import { HAND_RANKING, topPercent, openRangePercent, comboCount, combosOf } from './ranges.js';
import { parseCards } from './cards.js';

export const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
export const pick = (items, rng = Math.random) => items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
export function openingAnswer(code, position) {
  return topPercent(openRangePercent(position, 6)).has(code) ? 'Raise' : 'Fold';
}
export function preflopQuestion(position = 'Mixed', rng = Math.random) {
  const pos = position === 'Mixed' ? pick(POSITIONS, rng) : position;
  const code = pick(HAND_RANKING, rng);
  const range = topPercent(openRangePercent(pos, 6));
  const width = [...range].reduce((s, c) => s + comboCount(c), 0) / 1326 * 100;
  return { id: `open-${pos}-${code}`, topic: 'preflop', title: 'Folded to you',
    setup: `6 players · 100bb effective · ${pos} · no antes`, cards: pick(combosOf(code), rng),
    prompt: `${code}: what is your opening action?`, choices: ['Fold', 'Call', 'Raise'],
    answer: openingAnswer(code, pos),
    explanation: `${code} is ${range.has(code) ? 'inside' : 'outside'} the app’s ${pos} opening chart (about ${width.toFixed(1)}% of combinations). ${pos === 'SB' ? 'This drill uses a simplified raise-or-fold small-blind strategy; limping can also be part of a sound strategy.' : 'With nobody in the pot, this baseline uses raise or fold.'} This is a teaching chart, not a solved range.`,
    comparisons: POSITIONS.map(p => `${p}: ${openingAnswer(code, p).toLowerCase()}`).join(' · ') };
}

export const LESSONS = [
  { id: 'position', topic: 'position', title: 'Position changes your options',
    lesson: 'Acting later gives you more information. Before the flop, fewer players behind you also means fewer chances someone holds a strong hand.',
    prompt: 'Why can the button generally open wider than UTG?', choices: ['Fewer players behind and position after the flop', 'Suited cards become more likely', 'The button must defend a blind'], answer: 'Fewer players behind and position after the flop', explanation: 'The button has only the blinds behind and acts last after the flop. UTG must get through the whole table.' },
  { id: 'value', topic: 'value', title: 'Who calls with worse?', lesson: 'Value betting depends on the hands that call your bet. A strong-looking hand alone does not prove that betting is best.', prompt: 'Before making a river value bet, ask…', choices: ['Which worse hands call this size?', 'How big was the last pot I lost?', 'Can I make every better hand call?'], answer: 'Which worse hands call this size?', explanation: 'Name the worse hands and choose a size they will actually call. Checking can be right when those hands are scarce.' },
  { id: 'bluff', topic: 'bluffing', title: 'Bluffs need folds', lesson: 'A bluff earns money when enough better hands fold. Low showdown equity alone cannot tell you whether a bluff is good.', prompt: 'An opponent repeatedly calls large bets with weak pairs. What adjustment makes sense?', choices: ['Bluff less and value-bet suitable hands', 'Bluff larger every hand', 'Stop value betting'], answer: 'Bluff less and value-bet suitable hands', explanation: 'Use observed calling behaviour. Their age or appearance is not evidence of how often they fold.' },
  { id: 'ranges', topic: 'ranges', title: 'Keep more than one possibility', lesson: 'A range is a distribution of possible hands. An action can make a hand less likely without making it impossible.', prompt: 'An opponent bets the flop. Should you remove all missed AK hands?', choices: ['No; missed AK can still bet', 'Yes; a bet always means a pair', 'Only if the player is older'], answer: 'No; missed AK can still bet', explanation: 'Weight AK according to how often this opponent bets it here. Do not erase every bluff after one bet.' },
  { id: 'future', topic: 'odds', title: 'Equity is not guaranteed profit', lesson: 'Call ÷ (pot already including the bet + call) gives the showdown break-even threshold. On the flop or turn, later bets and unrealised equity also matter.', prompt: 'You have 35% equity and a 25% threshold on the flop. Is calling certainly profitable?', choices: ['No; future betting and the range estimate matter', 'Yes, in every situation', 'No; you always need 50%'], answer: 'No; future betting and the range estimate matter', explanation: 'The simple comparison works directly when calling closes the action and no further betting is possible, subject to the assumed range, eligible pot and costs.' },
  { id: 'river', topic: 'ranges', title: 'Bluff catching', lesson: 'On the river, a bluff-catcher beats bluffs but loses to value hands. Compare the estimated bluff share with the price.', prompt: 'Heads up: pot 100, opponent bets 100. Your hand beats only bluffs. What bluff share makes calling break even?', choices: ['About 33%', '50%', 'About 67%'], answer: 'About 33%', explanation: 'Risk 100 to contest 300 after calling: 100 / 300 = 33.3%. This assumes no ties or rake and that your call closes the action.' },
  { id: 'combos', topic: 'preflop', title: 'Count combinations', lesson: 'A pair has 6 combinations, a suited hand 4, and an offsuit hand 12 before any known cards are removed.', prompt: 'Which occupies more of a pre-flop range?', choices: ['AKo: 12 combinations', 'AKs: 4 combinations', 'They occupy the same amount'], answer: 'AKo: 12 combinations', explanation: 'AKo occurs three times as often as AKs. Range percentages should weight combinations, not count grid squares equally.' },
  { id: 'blockers', topic: 'ranges', title: 'Known cards remove combinations', lesson: 'Your cards and the board cannot also be in an opponent’s hand.', prompt: 'You hold one ace. How many AA combinations can an opponent have pre-flop?', choices: ['3', '6', '12'], answer: '3', explanation: 'Only three aces remain. There are three ways to choose two of them, compared with six before your ace was known.' },
  { id: 'outcome', topic: 'discipline', title: 'Judge the decision', lesson: 'A single result cannot prove a decision was good or bad. Review the information available when you acted.', prompt: 'You made a justified all-in call and lost. What should your review focus on?', choices: ['The range and price at the decision', 'Whether the next river would win', 'Winning the money back immediately'], answer: 'The range and price at the decision', explanation: 'Good decisions can lose. Keep results separate from decision quality, and check whether your assumptions were reasonable.' },
  { id: 'check', topic: 'value', title: 'Checking is an option', lesson: 'When nobody has bet, checking lets you continue without adding chips. Uncertainty does not automatically mean folding.', prompt: 'You are unsure whether to bet a medium-strength hand, and checking is legal. What should you consider?', choices: ['Check and retain showdown value', 'Fold automatically', 'Always shove'], answer: 'Check and retain showdown value', explanation: 'Compare the available actions. Folding when a free check is available gives up your chance to win for no benefit.' },
];

export function oddsQuestion(rng = Math.random) {
  const pot = pick([20, 40, 60, 100], rng);
  const fraction = pick([0.25, 0.5, 0.75, 1, 1.5], rng);
  const bet = pot * fraction;
  const threshold = Math.round(bet / (pot + bet * 2) * 100);
  const values = [...new Set([threshold, Math.max(1, threshold - 10), threshold + 10, 50])].sort((a,b) => a-b);
  return { id: `odds-${pot}-${bet}`, topic: 'odds', title: 'Pot-odds sprint',
    setup: 'Heads up · river · call closes the action · no rake or ties',
    prompt: `Pot ${pot}. Opponent bets ${bet}. What equity makes a call break even?`,
    choices: values.map(v => `${v}%`), answer: `${threshold}%`,
    explanation: `Call ${bet} ÷ final pot ${pot + 2 * bet} = ${(100 * bet / (pot + 2 * bet)).toFixed(1)}%. The pot before your call is ${pot + bet}, including the opponent’s bet.` };
}

// Deliberately small teaching models. Likelihoods are authored assumptions,
// not measured player frequencies or solver output. Categories are disjoint.
export const RANGE_GROUPS = [
  { label: 'AA / KK / QQ', codes: ['AA', 'KK', 'QQ'] },
  { label: 'JJ / 77', codes: ['JJ', '77'] },
  { label: 'AJs / KJs / QJs', codes: ['AJs', 'KJs', 'QJs'] },
  { label: 'AK / AQ / KQs', codes: ['AKs', 'AKo', 'AQs', 'AQo', 'KQs'] },
  { label: 'TT / 99 / 88', codes: ['TT', '99', '88'] },
];
export const RANGE_SCENARIOS = [
  { id: 'selective', title: 'The selective bettor', note: 'Observed: often checks missed hands; few large river bluffs in the hands you have seen.',
    rates: [[0.85,0.9,0.7,0.35,0.3], [0.8,0.95,0.5,0.15,0.12], [0.65,0.95,0.2,0.07,0.03]] },
  { id: 'barrels', title: 'The frequent bluffer', note: 'Observed: has shown missed ace-high after betting all three streets several times.',
    rates: [[0.85,0.9,0.7,0.8,0.4], [0.8,0.95,0.5,0.65,0.2], [0.65,0.95,0.2,0.5,0.08]] },
  { id: 'thin', title: 'The thin value bettor', note: 'Observed: bets top pair for value on several streets, including large river bets.',
    rates: [[0.85,0.9,0.9,0.45,0.4], [0.85,0.95,0.85,0.25,0.2], [0.8,0.95,0.75,0.12,0.06]] },
];
export const RANGE_HERO = parseCards('As Js');
export const RANGE_BOARD = parseCards('Jd 7s 2c 4h 2h');
export const RANGE_STREETS = [
  { name: 'Pre-flop', board: [], action: '6-handed, 150bb stacks. UTG opens to 4bb. You call BTN with A♠ J♠. Blinds fold. Pot 9.5bb.' },
  { name: 'Flop', board: RANGE_BOARD.slice(0,3), action: 'UTG bets 6bb into 9.5bb. You call. Pot becomes 21.5bb.' },
  { name: 'Turn', board: RANGE_BOARD.slice(0,4), action: 'UTG bets 17.5bb into 21.5bb. You call. Pot becomes 56.5bb.' },
  { name: 'River', board: RANGE_BOARD, action: 'UTG bets 55bb into 56.5bb. Estimate their range before any showdown.' },
];
export function rangeDistribution(scenario, street) {
  const blocked = new Set([...RANGE_HERO, ...RANGE_STREETS[street].board]);
  const groups = RANGE_GROUPS.map((group, i) => {
    const combos = group.codes.flatMap(combosOf).filter(c => c.every(card => !blocked.has(card)));
    let likelihood = 1;
    for (let s = 0; s < street; s++) likelihood *= scenario.rates[s][i];
    return { ...group, combos, likelihood, weight: combos.length * likelihood };
  });
  const total = groups.reduce((s,g) => s+g.weight, 0);
  return groups.map(g => ({ ...g, probability: g.weight / total }));
}
export function distributionScore(guess, target) {
  if (guess.length !== target.length || guess.some(v => !Number.isFinite(v) || v < 0) || Math.abs(guess.reduce((a,b)=>a+b,0)-100)>0.01) return null;
  return Math.round(100 * (1 - guess.reduce((s,v,i) => s + Math.abs(v/100-target[i]),0)/2));
}
export function sampleRangeHand(groups, rng = Math.random) {
  let n = rng();
  for (const group of groups) {
    n -= group.probability;
    if (n <= 0) return pick(group.combos, rng);
  }
  return pick(groups.at(-1).combos, rng);
}
export function recordAttempt(profile, mode, question, score, seconds) {
  profile.training ??= { attempts: [] };
  if (!Array.isArray(profile.training.attempts)) profile.training.attempts = [];
  profile.training.attempts.unshift({ mode, id: question.id, topic: question.topic ?? mode, score, seconds: Math.max(0, seconds), at: Date.now() });
  profile.training.attempts.length = Math.min(profile.training.attempts.length, 500);
}
export function trainingSummary(profile) {
  const attempts = Array.isArray(profile.training?.attempts) ? profile.training.attempts : [];
  return ['preflop','ranges','theory','odds','review'].map(mode => {
    const rows = attempts.filter(a => a.mode === mode);
    return { mode, count: rows.length, score: rows.length ? Math.round(rows.reduce((s,a)=>s+a.score,0)/rows.length) : null };
  });
}
const TAG_TOPICS = { 'preflop-loose':'preflop', 'preflop-tight':'preflop', 'missed-3bet':'preflop', limping:'preflop', 'pot-odds':'odds', 'draw-chasing':'odds', 'over-folding':'ranges', 'missed-value':'value', passive:'value', 'over-bluffing':'bluffing', position:'position' };
export function targetedLessons(profile) {
  const topics = Object.entries(profile.leaks ?? {}).sort((a,b)=>b[1].count-a[1].count).map(([tag])=>TAG_TOPICS[tag]).filter(Boolean);
  return [...LESSONS].sort((a,b) => {
    const priority = q => topics.includes(q.topic) ? topics.indexOf(q.topic) : 100;
    return priority(a)-priority(b);
  });
}
export function savedSpots(profile) {
  return (profile.handLog ?? []).flatMap(hand => (hand.reviews ?? [])
    .filter(r => r.practice?.choices?.includes(r.practice.answer))
    .map((r,i) => ({ ...r.practice, id: `hand-${hand.handNumber}-${r.street}-${i}`, topic:'review', title: `Hand #${hand.handNumber} · ${r.street}`, explanation: r.notes.join(' '), original: r.action, priority: r.evLoss ?? 0 })))
    .sort((a,b)=>b.priority-a.priority)
    .slice(0,40);
}
