/**
 * Card model.
 *
 * A card is an integer 0..51.
 *   rank = card >> 2   (0 = deuce ... 12 = ace)
 *   suit = card & 3    (0 = clubs, 1 = diamonds, 2 = hearts, 3 = spades)
 *
 * Integers keep the evaluator and the Monte-Carlo simulator allocation free,
 * which matters because the coach runs thousands of simulations per decision
 * on a phone.
 */

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS = ['c', 'd', 'h', 's'];
export const SUIT_GLYPHS = ['♣', '♦', '♥', '♠'];
export const SUIT_NAMES = ['clubs', 'diamonds', 'hearts', 'spades'];

export const rankOf = (card) => card >> 2;
export const suitOf = (card) => card & 3;

export function makeCard(rank, suit) {
  return (rank << 2) | suit;
}

/** "Ah" -> card int. Throws on malformed input. */
export function parseCard(text) {
  const s = String(text).trim();
  if (s.length !== 2) throw new Error(`Bad card: ${text}`);
  const r = RANKS.indexOf(s[0].toUpperCase());
  const u = SUITS.indexOf(s[1].toLowerCase());
  if (r < 0 || u < 0) throw new Error(`Bad card: ${text}`);
  return makeCard(r, u);
}

export const parseCards = (text) => String(text).trim().split(/\s+/).filter(Boolean).map(parseCard);

/** card int -> "Ah" */
export const cardToString = (card) => RANKS[rankOf(card)] + SUITS[suitOf(card)];
export const cardsToString = (cards) => cards.map(cardToString).join(' ');

export function freshDeck() {
  const deck = new Array(52);
  for (let i = 0; i < 52; i++) deck[i] = i;
  return deck;
}

/**
 * Mulberry32 - a small deterministic PRNG. Seeded runs make the engine and the
 * coach reproducible in tests; the app seeds from Date.now().
 */
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** In-place Fisher-Yates. */
export function shuffle(array, rng = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/**
 * Canonical two-card notation: "AKs", "AKo", "TT".
 * This is the key used by every preflop range chart in the app.
 */
export function handCode(a, b) {
  const ra = rankOf(a);
  const rb = rankOf(b);
  const hi = Math.max(ra, rb);
  const lo = Math.min(ra, rb);
  if (hi === lo) return RANKS[hi] + RANKS[lo];
  return RANKS[hi] + RANKS[lo] + (suitOf(a) === suitOf(b) ? 's' : 'o');
}

/** Human label for a hole-card pair, e.g. "Ace-King suited". */
const RANK_WORDS = {
  2: 'Deuce', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight',
  9: 'Nine', T: 'Ten', J: 'Jack', Q: 'Queen', K: 'King', A: 'Ace',
};

export function handLabel(a, b) {
  const code = handCode(a, b);
  const hi = RANK_WORDS[code[0]];
  const lo = RANK_WORDS[code[1]];
  if (code.length === 2) return `Pocket ${hi}s`;
  return `${hi}-${lo} ${code[2] === 's' ? 'suited' : 'offsuit'}`;
}
