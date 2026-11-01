import React, { useState, useEffect } from 'react';
import { Key, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Sliders, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { StorageService } from '../../services/storage';
import { GeminiClient, AVAILABLE_MODELS, DEFAULT_GEMINI_MODEL } from '../../services/geminiClient';
import { SFX } from '../../services/sfx';

export default function SettingsModal({
  isOpen,
  onClose,
  t,
  onSettingsSaved
}) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_GEMINI_MODEL);
  const [voiceAccent, setVoiceAccent] = useState('en-US');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, message: string }

  useEffect(() => {
    if (isOpen) {
      const current = StorageService.getSettings();
      setApiKey(current.apiKey || '');
      setModel(current.model || DEFAULT_GEMINI_MODEL);
      setVoiceAccent(current.voiceAccent || 'en-US');
      setSpeechRate(current.speechRate || 0.9);
      setTestStatus(null);
    }
  }, [isOpen]);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ success: false, message: 'Please enter a Gemini API key first.' });
      SFX.playWrong();
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    try {
      await GeminiClient.testConnection(apiKey.trim(), model);
      setTestStatus({ success: true, message: t.keyValid });
      SFX.playCorrect();
    } catch (err) {
      setTestStatus({ success: false, message: err.message || t.keyInvalid });
      SFX.playWrong();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const existing = StorageService.getSettings();
    const updated = {
      ...existing,
      apiKey: apiKey.trim(),
      model,
      voiceAccent,
      speechRate: Number(speechRate)
    };
    StorageService.saveSettings(updated);
    SFX.playClick();
    if (onSettingsSaved) onSettingsSaved(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.settings}
      titleVi="Cài đặt hệ thống & Kết nối Gemini AI"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-6 text-sm">
        {/* Gemini API Key Section */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              {t.apiKey}
            </span>
            <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Browser-only localStorage
            </span>
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus(null);
              }}
              placeholder="AIzaSy..."
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.apiKeyHint}{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              Get a free API key at Google AI Studio &rarr;
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-holo-cyan" />
            {t.modelName}
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm focus:outline-none bg-ocean-950 text-slate-100"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-ocean-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            Default recommended is Gemini 2.5 Flash for high performance, sub-second responses, and JSON adherence.
          </p>
        </div>

        {/* Test Connection Button & Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={handleTestKey}
              disabled={isTesting}
              icon={isTesting ? RefreshCw : Sparkles}
              className={isTesting ? 'animate-spin' : ''}
            >
              {isTesting ? t.testingKey : t.testKey}
            </Button>
            <span className="text-xs text-slate-400">
              {apiKey.trim() ? 'Verify connection directly with Google API' : 'Leave empty to run in offline Demo Mode'}
            </span>
          </div>

          {testStatus && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
                testStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Audio & Speech Settings */}
        <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Speech & Audio Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accent selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Default Accent</label>
              <select
                value={voiceAccent}
                onChange={(e) => setVoiceAccent(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-xs bg-ocean-950 text-slate-100"
              >
                <option value="en-US">US American (en-US)</option>
                <option value="en-GB">UK British (en-GB)</option>
              </select>
            </div>

            {/* Speech Rate slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium flex justify-between">
                <span>Playback Speed</span>
                <span className="text-cyan-400">{speechRate}x</span>
              </label>
              <input
                type="range"
                min="0.6"
                max="1.2"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="accent-cyan-400 w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t.close}
          </Button>
          <Button variant="neon" size="md" onClick={handleSave}>
            {t.saveSettings}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
