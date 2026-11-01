// LocalStorage Persistence Service for AuraLingua AI
// Manages settings, custom decks, study history, and gamification state.

const STORAGE_KEYS = {
  SETTINGS: 'auralingua_settings',
  DECK: 'auralingua_user_deck',
  HISTORY: 'auralingua_history',
  GAMIFICATION: 'auralingua_gamification',
  TUTOR_CHAT: 'auralingua_tutor_chat',
};

export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  theme: 'dark', // 'dark' | 'light'
  uiLang: 'en',  // 'en' | 'vi'
  sfxMuted: false,
  voiceAccent: 'en-US', // 'en-US' | 'en-GB'
  speechRate: 0.9,
};

export const DEFAULT_GAMIFICATION = {
  xp: 120,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  badges: ['badge_first_step'],
  dailyGoalXP: 50,
  dailyEarnedXP: 20,
};

// Safe storage getter
export function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading localStorage key "${key}":`, err);
    return fallback;
  }
}

// Safe storage setter
export function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
    return false;
  }
}

export const StorageService = {
  getSettings() {
    return { ...DEFAULT_SETTINGS, ...getStoredData(STORAGE_KEYS.SETTINGS, {}) };
  },

  saveSettings(settings) {
    return setStoredData(STORAGE_KEYS.SETTINGS, settings);
  },

  getUserDeck() {
    return getStoredData(STORAGE_KEYS.DECK, []);
  },

  saveUserDeck(deck) {
    return setStoredData(STORAGE_KEYS.DECK, deck);
  },

  addToDeck(item) {
    const deck = this.getUserDeck();
    const existingIndex = deck.findIndex(d => d.id === item.id || d.english.toLowerCase() === item.english.toLowerCase());
    if (existingIndex >= 0) {
      deck[existingIndex] = { ...deck[existingIndex], ...item, updatedAt: new Date().toISOString() };
    } else {
      deck.unshift({
        ...item,
        savedAt: new Date().toISOString(),
        srs: {
          repetitions: 0,
          interval: 1,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          lastReviewedDate: null
        }
      });
    }
    this.saveUserDeck(deck);
    return deck;
  },

  removeFromDeck(itemId) {
    const deck = this.getUserDeck().filter(d => d.id !== itemId);
    this.saveUserDeck(deck);
    return deck;
  },

  getGamification() {
    return { ...DEFAULT_GAMIFICATION, ...getStoredData(STORAGE_KEYS.GAMIFICATION, {}) };
  },

  saveGamification(data) {
    return setStoredData(STORAGE_KEYS.GAMIFICATION, data);
  },

  addXP(amount) {
    const data = this.getGamification();
    const newXP = (data.xp || 0) + amount;
    const newDaily = (data.dailyEarnedXP || 0) + amount;
    const updated = { ...data, xp: newXP, dailyEarnedXP: newDaily };
    this.saveGamification(updated);
    return updated;
  },

  getHistory() {
    return getStoredData(STORAGE_KEYS.HISTORY, {
      practiceSessions: [],
      pronunciationLogs: [],
      weakWords: []
    });
  },

  saveHistory(history) {
    return setStoredData(STORAGE_KEYS.HISTORY, history);
  },

  recordPracticeSession(session) {
    const history = this.getHistory();
    const logs = history.practiceSessions || [];
    logs.unshift({
      ...session,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 sessions
    history.practiceSessions = logs.slice(0, 100);
    this.saveHistory(history);
  },

  recordWordAttempt(item, score) {
    const history = this.getHistory();
    const weak = history.weakWords || [];
    const existing = weak.find(w => w.id === item.id || w.english === item.english);

    if (score < 70) {
      if (existing) {
        existing.failCount = (existing.failCount || 0) + 1;
        existing.lastFailedAt = new Date().toISOString();
        existing.lastScore = score;
      } else {
        weak.push({
          id: item.id || `weak_${Date.now()}`,
          english: item.english,
          vietnamese: item.vietnamese,
          level: item.level || 'B1',
          failCount: 1,
          lastFailedAt: new Date().toISOString(),
          lastScore: score
        });
      }
    } else if (score >= 85 && existing) {
      // Remove from weakest words when mastered
      history.weakWords = weak.filter(w => w.id !== item.id && w.english !== item.english);
    }
    this.saveHistory(history);
  },

  getTutorChat() {
    return getStoredData(STORAGE_KEYS.TUTOR_CHAT, []);
  },

  saveTutorChat(messages) {
    return setStoredData(STORAGE_KEYS.TUTOR_CHAT, messages);
  },

  exportAllData() {
    const exportObject = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      userDeck: this.getUserDeck(),
      gamification: this.getGamification(),
      history: this.getHistory(),
      tutorChat: this.getTutorChat()
    };
    return JSON.stringify(exportObject, null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.userDeck) this.saveUserDeck(data.userDeck);
      if (data.gamification) this.saveGamification(data.gamification);
      if (data.history) this.saveHistory(data.history);
      if (data.tutorChat) this.saveTutorChat(data.tutorChat);
      return { success: true };
    } catch (err) {
      console.error('Failed to import data:', err);
      return { success: false, error: err.message };
    }
  },

  resetAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (err) {
      console.error('Failed to reset localStorage:', err);
      return false;
    }
  }
};
