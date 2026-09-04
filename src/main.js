/**
 * Application shell: owns the profile and settings, wires the tab bar to the
 * screens, and hands the table screen over to the Game controller.
 */

import { loadProfile, saveProfile, loadSettings, saveSettings } from './storage.js';
import { Game } from './ui/game.js';
import { renderSetup, renderProgress, renderPractice, renderHistory, showSettings } from './ui/views.js';
import { qs, qsa, closeSheet, isSheetOpen } from './ui/dom.js';

class App {
  constructor() {
    this.profile = loadProfile();
    this.settings = loadSettings();
    this.game = new Game(this);
    this.screen = 'setup';
  }

  persist() {
    saveProfile(this.profile);
  }

  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch };
    saveSettings(this.settings);
  }

  /** Show one screen and render it. The table screen hides the tab bar. */
  show(name) {
    this.screen = name;
    for (const el of qsa('.screen')) el.classList.toggle('active', el.id === `screen-${name}`);
    for (const btn of qsa('.tabbar button')) {
      btn.setAttribute('aria-selected', String(btn.dataset.screen === name));
    }
    qs('.tabbar').classList.toggle('hidden', name === 'table');
    this.refreshCurrentScreen();
  }

  refreshCurrentScreen() {
    switch (this.screen) {
      case 'setup': renderSetup(this); break;
      case 'progress': renderProgress(this); break;
      case 'practice': renderPractice(this); break;
      case 'history': renderHistory(this); break;
      case 'table': this.game.render(); this.game.renderActions(); break;
      default: break;
    }
  }

  startGame() {
    this.show('table');
    this.game.newSession();
  }

  leaveTable() {
    this.game.clearTimers();
    this.show('setup');
  }
}

function boot() {
  const app = new App();
  window.__pokerApp = app;

  for (const btn of qsa('.tabbar button')) {
    btn.addEventListener('click', () => app.show(btn.dataset.screen));
  }
  qs('#deal-in').addEventListener('click', () => app.startGame());
  qs('#setup-settings').addEventListener('click', () => showSettings(app));
  qs('#leave-table').addEventListener('click', () => app.leaveTable());
  qs('#table-settings').addEventListener('click', () => showSettings(app));
  qs('#sheet').addEventListener('click', (e) => {
    if (e.target.id === 'sheet') closeSheet();
  });
  qs('#sheet-close').addEventListener('click', () => closeSheet());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen()) closeSheet();
  });

  // Pause the bots when the app is backgrounded so a hand does not race
  // forward while the phone is locked.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) app.game.clearTimers();
    else if (app.screen === 'table' && app.game.table && !app.game.table.handComplete) app.game.step();
  });

  app.show('setup');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: './' })
        .catch(() => { /* offline support is optional */ });
    });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
