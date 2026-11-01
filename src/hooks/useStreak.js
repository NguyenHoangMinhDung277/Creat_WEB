import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage.js';

export const ALL_BADGES = [
  { id: 'badge_first_step', name: 'First Steps', nameVi: 'Bước chân đầu tiên', icon: '🌱', description: 'Begin your English learning journey on AuraLingua' },
  { id: 'badge_3_streak', name: 'Consistent Learner', nameVi: 'Học tập kiên trì', icon: '🔥', description: 'Reach a 3-day consecutive study streak' },
  { id: 'badge_7_streak', name: 'Dedicated Scholar', nameVi: 'Học giả chuyên tâm', icon: '⚡', description: 'Reach a 7-day consecutive study streak' },
  { id: 'badge_deck_builder', name: 'Vocabulary Collector', nameVi: 'Người sưu tầm từ vựng', icon: '📚', description: 'Save 10 or more items to your personal deck' },
  { id: 'badge_quiz_champ', name: 'Quiz Champion', nameVi: 'Nhà vô địch trắc nghiệm', icon: '🏆', description: 'Achieve 100% score on a vocabulary quiz' },
  { id: 'badge_century_xp', name: 'Century Club', nameVi: 'Câu lạc bộ 500 XP', icon: '💎', description: 'Earn 500 total XP points' }
];

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function useStreak() {
  const [gamification, setGamification] = useState(() => StorageService.getGamification());

  const checkAndUpdateStreak = useCallback(() => {
    const data = StorageService.getGamification();
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    let streak = data.streak || 1;
    let lastActive = data.lastActiveDate;
    let dailyEarned = data.dailyEarnedXP || 0;

    if (!lastActive) {
      lastActive = today;
      streak = 1;
    } else if (lastActive === today) {
      // Already active today
    } else if (lastActive === yesterday) {
      // Continued streak from yesterday!
      streak += 1;
      lastActive = today;
      dailyEarned = 0; // Reset daily counter for the new day
    } else {
      // Missed at least one day, reset to 1
      streak = 1;
      lastActive = today;
      dailyEarned = 0;
    }

    const updated = {
      ...data,
      streak,
      lastActiveDate: lastActive,
      dailyEarnedXP: dailyEarned
    };

    StorageService.saveGamification(updated);
    setGamification(updated);
    return updated;
  }, []);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const addXP = useCallback((amount, extraBadges = []) => {
    const current = StorageService.getGamification();
    const newXP = (current.xp || 0) + amount;
    const newDaily = (current.dailyEarnedXP || 0) + amount;

    const badges = new Set(current.badges || ['badge_first_step']);
    if (newXP >= 500) badges.add('badge_century_xp');
    if (current.streak >= 3) badges.add('badge_3_streak');
    if (current.streak >= 7) badges.add('badge_7_streak');

    extraBadges.forEach(b => badges.add(b));

    const updated = {
      ...current,
      xp: newXP,
      dailyEarnedXP: newDaily,
      badges: Array.from(badges)
    };

    StorageService.saveGamification(updated);
    setGamification(updated);
    return updated;
  }, []);

  return {
    streak: gamification.streak || 1,
    xp: gamification.xp || 0,
    dailyGoalXP: gamification.dailyGoalXP || 50,
    dailyEarnedXP: gamification.dailyEarnedXP || 0,
    badges: gamification.badges || ['badge_first_step'],
    addXP,
    refresh: checkAndUpdateStreak
  };
}
