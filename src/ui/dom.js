/** Small DOM helpers. No framework; the app is small enough not to need one. */

import { RANKS, SUIT_GLYPHS, rankOf, suitOf } from '../cards.js';

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Minimal hyperscript. `props` may contain `class`, `text`, `html`, `style`,
 * dataset entries under `data`, `on<Event>` handlers, and any other attribute.
 */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'style') {
      // Custom properties have to go through setProperty; assigning them onto
      // the style object silently does nothing.
      for (const [prop, val] of Object.entries(value)) {
        if (prop.startsWith('--')) node.style.setProperty(prop, val);
        else node.style[prop] = val;
      }
    }
    else if (key === 'data') for (const [d, v] of Object.entries(value)) node.dataset[d] = v;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Suit colour class. The four-colour deck helps beginners read flush draws. */
function suitClass(suit, fourColour) {
  if (!fourColour) return suit === 1 || suit === 2 ? 'red' : '';
  return ['', 'blue', 'red', 'green'][suit];
}

/**
 * Render one playing card.
 * @param {number|null} card card integer, or null for a face-down card
 */
export function cardNode(card, { size = '', faceDown = false, fourColour = false, animate = false } = {}) {
  const classes = ['pcard'];
  if (size) classes.push(size);
  if (animate) classes.push('dealt');
  if (faceDown || card === null || card === undefined) {
    classes.push('back');
    return h('div', { class: classes.join(' '), 'aria-label': 'face-down card' });
  }
  const r = rankOf(card);
  const s = suitOf(card);
  const colour = suitClass(s, fourColour);
  if (colour) classes.push(colour);
  return h('div', {
    class: classes.join(' '),
    role: 'img',
    'aria-label': `${RANKS[r]} of ${['clubs', 'diamonds', 'hearts', 'spades'][s]}`,
  }, h('span', { class: 'r', text: RANKS[r] }), h('span', { class: 's', text: SUIT_GLYPHS[s] }));
}

export function cardRow(cards, opts = {}) {
  return h('div', { class: 'card-row' }, cards.map((c) => cardNode(c, opts)));
}

/** Chips are always whole numbers at the table. */
export const chips = (n) => Math.round(n).toLocaleString();

export const signed = (n) => `${n > 0 ? '+' : ''}${chips(n)}`;

let toastTimer;
export function toast(message) {
  let node = qs('.toast');
  if (!node) {
    node = h('div', { class: 'toast' });
    document.body.append(node);
  }
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2200);
}

export function haptic(pattern = 8) {
  try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
}

/** A bottom sheet. Returns a close function. */
export function openSheet({ title, body, footer, onClose }) {
  const backdrop = qs('#sheet');
  const titleNode = qs('#sheet-title');
  const bodyNode = qs('#sheet-body');
  const footNode = qs('#sheet-foot');

  titleNode.textContent = title ?? '';
  clear(bodyNode).append(body);
  clear(footNode);
  if (footer) footNode.append(footer);
  footNode.style.display = footer ? '' : 'none';
  backdrop.classList.add('open');
  sheetCloseHandler = onClose ?? null;
  return closeSheet;
}

let sheetCloseHandler = null;

export function closeSheet() {
  const backdrop = qs('#sheet');
  if (!backdrop.classList.contains('open')) return;
  backdrop.classList.remove('open');
  const fn = sheetCloseHandler;
  sheetCloseHandler = null;
  fn?.();
}

export const isSheetOpen = () => qs('#sheet')?.classList.contains('open');
