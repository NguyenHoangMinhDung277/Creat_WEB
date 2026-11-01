import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  Award,
  Sparkles,
  Flame,
  CheckCircle,
  Volume2
} from 'lucide-react';
import ScoreChart from './ScoreChart';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import Modal from '../../components/common/Modal';
import { StorageService } from '../../services/storage';
import { ALL_BADGES } from '../../hooks/useStreak';
import { useSpeech } from '../../hooks/useSpeech';
import { SFX } from '../../services/sfx';

export default function HistoryView({
  streak,
  xp,
  dailyEarnedXP,
  dailyGoalXP,
  badges,
  onDataReset,
  uiLang,
  t
}) {
  const [historyData, setHistoryData] = useState(() => StorageService.getHistory());
  const [userDeck, setUserDeck] = useState(() => StorageService.getUserDeck());
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState(null);

  const { speak } = useSpeech();

  const reloadData = () => {
    setHistoryData(StorageService.getHistory());
    setUserDeck(StorageService.getUserDeck());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Format practice scores for chart
  const chartScores = (historyData.practiceSessions || []).map((s, idx) => ({
    score: s.score || Math.round((s.knewCount / Math.max(1, s.total)) * 100) || 75,
    label: s.type || `Session ${idx + 1}`
  })).reverse();

  // Export data as JSON
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraLingua_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    SFX.playClick();
  };

  // Import data from JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = StorageService.importData(content);
      if (res.success) {
        setImportNotice({ success: true, message: 'Data imported successfully!' });
        reloadData();
        SFX.playLevelUp();
      } else {
        setImportNotice({ success: false, message: `Import failed: ${res.error}` });
        SFX.playWrong();
      }
    };
    reader.readAsText(file);
  };

  // Reset all data
  const handleConfirmReset = () => {
    StorageService.resetAllData();
    setIsResetModalOpen(false);
    SFX.playClick();
    if (onDataReset) onDataReset();
  };

  const weakWords = historyData.weakWords || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <History className="w-7 h-7 text-cyan-400" />
          <span>{t.navHistory}</span>
        </h1>
        <p className="text-sm text-cyan-300 font-medium">
          {uiLang === 'vi'
            ? 'Theo dõi tiến trình học tập, biểu đồ điểm số, từ vựng cần cải thiện và các huy hiệu đạt được.'
            : 'Track study progress, performance charts over time, weak words review, and earned achievements.'}
        </p>
      </div>

      {/* Gamification Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              {t.streakDay}
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
              <span>{streak} Days</span>
            </div>
            <span className="text-[11px] text-amber-300/80">Active today</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              {t.totalXP}
            </span>
            <div className="text-2xl font-black text-cyan-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span>{xp} XP</span>
            </div>
            <span className="text-[11px] text-cyan-300/80">Lifetime earned</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 flex items-center justify-between">
          <div className="w-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Daily Goal
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {dailyEarnedXP} / {dailyGoalXP} XP
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                style={{ width: `${Math.min(100, (dailyEarnedXP / dailyGoalXP) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Saved Deck Count */}
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Personal Deck
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {userDeck.length} Items
            </div>
            <span className="text-[11px] text-purple-300/80">Saved in browser</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Weak Words */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Over Time Chart (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-100">
                Score Accuracy Over Time
              </h2>
            </div>
            <span className="text-xs text-slate-400">Recent practice sessions</span>
          </div>

          <div className="pt-2">
            <ScoreChart scores={chartScores} />
          </div>
        </div>

        {/* Weak Words & Improvement List (1 Column) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-slate-100">
                Weakest Words
              </h2>
            </div>
            <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {weakWords.length}
            </span>
          </div>

          {weakWords.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No weak words recorded! Any items with scores &lt; 70% in pronunciation or quizzes will appear here for targeted review.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {weakWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3 rounded-xl bg-ocean-950/70 border border-rose-500/20 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-100">
                      {word.english}
                    </span>
                    <span className="text-xs text-cyan-300">
                      ↳ {word.vietnamese}
                    </span>
                    <span className="text-[10px] text-rose-400 mt-0.5">
                      Failed {word.failCount} time{word.failCount > 1 ? 's' : ''} (Last score: {word.lastScore}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(word.english)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors shrink-0"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">
            Earned Badges & Milestones
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_BADGES.map((b) => {
            const isEarned = (badges || []).includes(b.id);
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isEarned
                    ? 'bg-gradient-to-tr from-cyan-950/40 to-blue-950/40 border-cyan-400/30'
                    : 'bg-white/5 border-white/5 opacity-40'
                }`}
              >
                <div className="text-2xl">{b.icon}</div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">
                      {uiLang === 'vi' ? b.nameVi : b.name}
                    </span>
                    {isEarned && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-snug">
                    {b.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management Section: Export, Import, Reset */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-4 shadow-xl">
        <h2 className="text-base font-bold text-slate-100">
          Data Management & Privacy
        </h2>
        <p className="text-xs text-slate-400">
          All your decks, study history, settings, and gamification statistics are stored exclusively in your browser. You can export a JSON backup anytime or import previous data.
        </p>

        {importNotice && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              importNotice.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {importNotice.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportJSON}
            icon={Download}
          >
            {t.exportData}
          </Button>

          {/* Import Button */}
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImportJSON}
            id="import-json-input"
            className="hidden"
          />
          <label
            htmlFor="import-json-input"
            className="cursor-pointer glass-panel border-white/10 hover:border-cyan-400/50 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{t.importData}</span>
          </label>

          {/* Reset Progress Button */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            icon={Trash2}
          >
            {t.resetData}
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Data Reset"
        titleVi="Xác nhận đặt lại toàn bộ tiến độ"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-slate-300 leading-relaxed">
            {t.resetConfirm}
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
