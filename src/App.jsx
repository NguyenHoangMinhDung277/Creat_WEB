import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SettingsModal from './components/settings/SettingsModal';
import LevelBrowser from './features/levels/LevelBrowser';
import PlacementTest from './features/levels/PlacementTest';
import DocumentExtractor from './features/extract/DocumentExtractor';
import PracticeHub from './features/games/PracticeHub';
import HistoryView from './features/history/HistoryView';
import TutorFloatingWidget from './features/tutor/TutorFloatingWidget';
import { useAudioSFX } from './hooks/useAudioSFX';
import { useStreak } from './hooks/useStreak';
import { StorageService } from './services/storage';
import { GeminiClient } from './services/geminiClient';
import { UI_TRANSLATIONS } from './data/uiTranslations';
import { SEED_ITEMS } from './data/seedContent';
import { validateAllContent } from './utils/devValidator';

export default function App() {
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'extract' | 'practice' | 'history' | 'placement'
  const [theme, setTheme] = useState(() => StorageService.getSettings().theme || 'dark');
  const [uiLang, setUiLang] = useState(() => StorageService.getSettings().uiLang || 'en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => GeminiClient.hasApiKey());

  const { isMuted, toggleMute } = useAudioSFX();
  const { streak, xp, dailyEarnedXP, dailyGoalXP, badges, addXP, refresh: refreshStreak } = useStreak();

  // Current UI localization strings
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.en;

  // Run 100% translation validation check on mount
  useEffect(() => {
    validateAllContent(SEED_ITEMS, 'Seed Content Initialization');
  }, []);

  // Sync theme with HTML document class and storage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    const current = StorageService.getSettings();
    StorageService.saveSettings({ ...current, theme });
  }, [theme]);

  // Sync UI Language with storage
  useEffect(() => {
    const current = StorageService.getSettings();
    StorageService.saveSettings({ ...current, uiLang });
  }, [uiLang]);

  const handleSettingsSaved = () => {
    setHasApiKey(GeminiClient.hasApiKey());
  };

  const handleSessionCompleted = (sessionData) => {
    StorageService.recordPracticeSession(sessionData);
    if (sessionData.xpGained || sessionData.xpEarned) {
      addXP(sessionData.xpGained || sessionData.xpEarned);
    }
    refreshStreak();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-ocean-950 dark:bg-ocean-950 light:bg-ocean-50 text-slate-100 transition-colors duration-300">
      {/* Subtle Background Glow Spheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"
      />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        uiLang={uiLang}
        setUiLang={setUiLang}
        theme={theme}
        setTheme={setTheme}
        isMuted={isMuted}
        toggleMute={toggleMute}
        streak={streak}
        xp={xp}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setIsSettingsOpen(true)}
        t={t}
      />

      {/* Main Feature View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10">
        {activeTab === 'levels' && (
          <LevelBrowser
            onItemAddedToDeck={(item) => addXP(5)}
            uiLang={uiLang}
            t={t}
          />
        )}

        {activeTab === 'extract' && (
          <DocumentExtractor
            onItemsAddedToDeck={(items) => addXP(items.length * 5)}
            uiLang={uiLang}
            t={t}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeHub
            onSessionCompleted={handleSessionCompleted}
            uiLang={uiLang}
            t={t}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            streak={streak}
            xp={xp}
            dailyEarnedXP={dailyEarnedXP}
            dailyGoalXP={dailyGoalXP}
            badges={badges}
            onDataReset={() => {
              setHasApiKey(GeminiClient.hasApiKey());
              refreshStreak();
            }}
            uiLang={uiLang}
            t={t}
          />
        )}

        {activeTab === 'placement' && (
          <PlacementTest
            onLevelSelected={(lvl) => {
              setActiveTab('levels');
              addXP(30);
            }}
            uiLang={uiLang}
            t={t}
          />
        )}
      </main>

      {/* Floating AI Tutor Chat Widget */}
      <TutorFloatingWidget uiLang={uiLang} t={t} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        t={t}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Footer */}
      <Footer t={t} uiLang={uiLang} />
    </div>
  );
}
