import React, { useState } from 'react';
import { Volume2, Bookmark, Check, Sparkles, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import Button from '../../components/common/Button';
import PronunciationTrainer from '../speech/PronunciationTrainer';
import { useSpeech } from '../../hooks/useSpeech';
import { StorageService } from '../../services/storage';
import { GeminiClient } from '../../services/geminiClient';
import { SFX } from '../../services/sfx';

export default function TopicDetail({
  topic,
  level,
  items,
  onItemAddedToDeck,
  onItemsGenerated,
  uiLang,
  t
}) {
  const { speak } = useSpeech();
  const [activePracticeItem, setActivePracticeItem] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const handleAddToDeck = (item) => {
    StorageService.addToDeck(item);
    setAddedIds(prev => new Set(prev).add(item.id));
    SFX.playClick();
    if (onItemAddedToDeck) onItemAddedToDeck(item);
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const newItems = await GeminiClient.generateTopicItems(level.id, topic.name, 4);
      SFX.playLevelUp();
      if (onItemsGenerated) onItemsGenerated(newItems);
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate additional items.');
      SFX.playWrong();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Topic Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge level={level.id} size="sm" />
            <span className="text-xs text-slate-400 font-medium">Topic Details</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            {topic.name}
          </h2>
          <p className="text-sm text-cyan-300 font-medium">
            {topic.nameVi}
          </p>
        </div>

        {/* Generate More with AI Button */}
        <Button
          variant="rainbow"
          size="sm"
          onClick={handleGenerateMore}
          disabled={isGenerating}
          icon={Sparkles}
        >
          {isGenerating ? t.generating : t.generateMoreAi}
        </Button>
      </div>

      {generateError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {generateError}
        </div>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => {
          const isAdded = addedIds.has(item.id);
          const isPracticing = activePracticeItem?.id === item.id;

          return (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col gap-3.5"
            >
              {/* Card Top: Badges & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge level={item.level} size="xs" />
                  <Badge type={item.type} size="xs" uiLang={uiLang} />
                  {item.ipa && (
                    <span className="text-xs font-mono text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      {item.ipa}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speak(item.english)}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                    title="Listen to pronunciation"
                    aria-label="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePracticeItem(isPracticing ? null : item)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                      isPracticing
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t.speak}</span>
                    {isPracticing ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToDeck(item)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isAdded ? t.addedToDeck : t.addDeck}</span>
                  </button>
                </div>
              </div>

              {/* English & Vietnamese Meaning (100% Rule) */}
              <BilingualText
                en={item.english}
                vi={item.vietnamese}
                enClassName="text-lg sm:text-xl font-bold text-slate-100"
                viClassName="text-sm sm:text-base text-cyan-300 font-semibold"
              />

              {/* Example sentence with Vietnamese translation directly underneath */}
              {item.exampleEn && (
                <div className="p-3 rounded-xl bg-ocean-950/60 border border-white/5 flex flex-col gap-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Example / Ví dụ:
                  </div>
                  <BilingualText
                    en={`“${item.exampleEn}”`}
                    vi={item.exampleVi ? `↳ ${item.exampleVi}` : ''}
                    enClassName="text-sm font-medium text-slate-200"
                    viClassName="text-xs text-slate-400 italic"
                  />
                </div>
              )}

              {/* Vietnamese Usage Explanation */}
              {item.explanationVi && (
                <div className="text-xs text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="font-semibold text-cyan-300 mr-1.5">💡 Lưu ý cách dùng:</span>
                  <span>{item.explanationVi}</span>
                </div>
              )}

              {/* Collapsible Pronunciation Trainer */}
              {isPracticing && (
                <div className="pt-2">
                  <PronunciationTrainer
                    targetItem={item}
                    t={t}
                    onAttemptCompleted={(score) => {
                      if (score >= 80) {
                        // Handled by SFX
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
