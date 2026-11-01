import React, { useState } from 'react';
import { Brain, HelpCircle, Layers, Filter, CheckCircle, Sparkles } from 'lucide-react';
import FlashcardDeck from './FlashcardDeck';
import QuizGame from './QuizGame';
import Badge from '../../components/common/Badge';
import { StorageService } from '../../services/storage';
import { SEED_ITEMS } from '../../data/seedContent';

export default function PracticeHub({
  onSessionCompleted,
  uiLang,
  t
}) {
  const [gameMode, setGameMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [sourceMode, setSourceMode] = useState('all');    // 'my_deck' | 'all'
  const [filterLevel, setFilterLevel] = useState('all');

  const userDeck = StorageService.getUserDeck();
  const basePool = sourceMode === 'my_deck' && userDeck.length > 0 ? userDeck : SEED_ITEMS;

  const filteredPool = basePool.filter(item => {
    if (filterLevel !== 'all' && item.level !== filterLevel) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Brain className="w-7 h-7 text-cyan-400" />
            <span>{t.navPractice}</span>
          </h1>
          <p className="text-sm text-cyan-300 font-medium">
            {uiLang === 'vi'
              ? 'Luyện tập phản xạ bằng Thẻ lật ghi nhớ ngắt quãng (SM-2) hoặc Bài thi trắc nghiệm song ngữ.'
              : 'Master active recall with SM-2 spaced repetition flashcards and bilingual multiple-choice quizzes.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Flashcards vs Quiz) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10">
          <button
            type="button"
            onClick={() => setGameMode('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'flashcards'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards (SM-2)</span>
          </button>
          <button
            type="button"
            onClick={() => setGameMode('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'quiz'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Vocabulary Quiz</span>
          </button>
        </div>
      </div>

      {/* Filter and Source Controls */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Deck Source Selection */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSourceMode('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                sourceMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All CEFR Seed Pool ({SEED_ITEMS.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('my_deck')}
              className={`px-3 py-1 rounded-lg transition-all ${
                sourceMode === 'my_deck'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Saved Deck ({userDeck.length})
            </button>
          </div>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-xl text-xs bg-ocean-950 text-slate-200 focus:outline-none"
          >
            <option value="all">{t.allLevels}</option>
            <option value="A1">A1 Beginner</option>
            <option value="A2">A2 Elementary</option>
            <option value="B1">B1 Intermediate</option>
            <option value="B2">B2 Upper-Intermediate</option>
            <option value="C1">C1 Advanced</option>
            <option value="C2">C2 Proficiency</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Practicing {filteredPool.length} items</span>
        </div>
      </div>

      {/* Active Game Mode */}
      <div className="pt-2">
        {gameMode === 'flashcards' ? (
          <FlashcardDeck
            items={filteredPool}
            onSessionCompleted={onSessionCompleted}
            uiLang={uiLang}
            t={t}
          />
        ) : (
          <QuizGame
            items={filteredPool}
            onQuizCompleted={onSessionCompleted}
            uiLang={uiLang}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
