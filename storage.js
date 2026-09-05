/**
 * Persistence.
 *
 * Everything lives in the browser under one key. There is no account and no
 * server, so a player's hand history never leaves their phone. Every read is
 * defensive: a corrupted or outdated blob returns a fresh profile rather than
 * breaking the app.
 */

import { createProfile, PROFILE_VERSION } from './stats.js';

const KEY = 'poker-trainer:v3';
const SETTINGS_KEY = 'poker-trainer:settings:v3';

export const DEFAULT_SETTINGS = {
  playerCount: 6,
  startingStack: 200,
  bigBlind: 2,
  coachMode: 'instant',   // instant | end-of-hand | off
  showEquity: true,
  sound: false,
  animations: true,
  fourColourDeck: false,
  autoAdvance: false,
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // A full or disabled storage must not take the game down with it.
    return false;
  }
}

export function loadProfile() {
  const stored = readJSON(KEY, null);
  if (!stored || stored.version !== PROFILE_VERSION) return createProfile();
  const fresh = createProfile();
  return {
    ...fresh,
    ...stored,
    counters: { ...fresh.counters, ...(stored.counters ?? {}) },
    grades: { ...fresh.grades, ...(stored.grades ?? {}) },
    streetLoss: { ...fresh.streetLoss, ...(stored.streetLoss ?? {}) },
    leaks: stored.leaks ?? {},
    handLog: Array.isArray(stored.handLog) ? stored.handLog : [],
  };
}

export const saveProfile = (profile) => writeJSON(KEY, profile);

export const resetProfile = () => {
  const fresh = createProfile();
  writeJSON(KEY, fresh);
  return fresh;
};

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY, {}) };
}

export const saveSettings = (settings) => writeJSON(SETTINGS_KEY, settings);
