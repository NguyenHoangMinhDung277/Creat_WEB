import React, { useState } from 'react';
import { Volume2, Bookmark, Check, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import PronunciationTrainer from '../speech/PronunciationTrainer';
import { useSpeech } from '../../hooks/useSpeech';

export default function ExtractedItemCard({
  item,
  isSelected,
  onToggleSelect,
  isAdded,
  onAddToDeck,
  uiLang,
  t
}) {
  const { speak } = useSpeech();
  const [showTrainer, setShowTrainer] = useState(false);

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col gap-3.5 ${
        isSelected
          ? 'border-cyan-400 bg-cyan-950/40 shadow-glass-glow'
          : 'border-white/10 hover:border-cyan-500/30'
      }`}
    >
      {/* Top Header: Checkbox, Badges, Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 focus:ring-offset-ocean-950 bg-ocean-900 border-white/20 cursor-pointer"
            aria-label="Select item for batch deck addition"
          />
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
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowTrainer(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              showTrainer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{t.speak}</span>
            {showTrainer ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => onAddToDeck(item)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isAdded
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-cyan-300'
            }`}
          >
            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isAdded ? t.addedToDeck : t.addDeck}</span>
          </button>
        </div>
      </div>

      {/* English term & Vietnamese definition directly below */}
      <BilingualText
        en={item.english}
        vi={item.vietnamese}
        enClassName="text-lg font-bold text-slate-100"
        viClassName="text-sm font-semibold text-cyan-300"
      />

      {/* Example sentence with Vietnamese translation directly below */}
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
          <span className="font-semibold text-cyan-300 mr-1.5">💡 Cách dùng:</span>
          <span>{item.explanationVi}</span>
        </div>
      )}

      {/* Original Source Context */}
      {item.sourceContext && (
        <div className="text-[11px] text-slate-400 italic border-t border-white/5 pt-2">
          <span className="font-semibold text-slate-400 not-italic mr-1">In Context:</span>
          &ldquo;{item.sourceContext}&rdquo;
        </div>
      )}

      {/* Collapsible Trainer */}
      {showTrainer && (
        <div className="pt-2">
          <PronunciationTrainer targetItem={item} t={t} />
        </div>
      )}
    </div>
  );
}
