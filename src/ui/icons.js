import { h } from './dom.js';
const paths = {
  play: '<path d="m9 5 10 7-10 7Z"/>',
  progress: '<path d="M4 19h16M6 15v-4m6 4V5m6 10V8"/>',
  practice: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m12 12 8-8"/>',
  history: '<path d="M4 5h12a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3Zm0 11h15M8 9h7"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  cards: '<rect x="4" y="5" width="11" height="15" rx="2"/><path d="m9 3 10 2 1 14M8 10h3m-3 4h3"/>',
  theory: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
  odds: '<path d="M7 17 17 7"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/>',
};
export function icon(name) {
  return h('span', { class:'ui-icon', 'aria-hidden':'true', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]??paths.practice)+'</svg>' });
}
