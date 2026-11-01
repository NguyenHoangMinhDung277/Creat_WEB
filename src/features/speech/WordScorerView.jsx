import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Volume2 } from 'lucide-react';

/**
 * WordScorerView Component
 * Renders target phrase with:
 * 1. Word-level color coding
 * 2. Character-by-character (từng ký tự) diff analysis
 * 3. Specific phonetic guidance for Vietnamese speakers (âm đuôi -s, -ed, -t, etc.)
 */
export default function WordScorerView({ scoreResult, targetPhrase }) {
  const [expandedWordIdx, setExpandedWordIdx] = useState(null);

  if (!scoreResult || !scoreResult.words || scoreResult.words.length === 0) {
    return null;
  }

  const { score, words, rawSpoken, vietnameseTips } = scoreResult;

  const getScoreColor = (s) => {
    if (s >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (s >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getWordBadge = (w) => {
    if (w.status === 'correct') {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25';
    }
    if (w.status === 'close') {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25';
    }
    return 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25';
  };

  const getCharStyle = (c) => {
    if (c.status === 'correct') {
      return 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50';
    }
    if (c.status === 'wrong') {
      return 'bg-amber-500/30 text-amber-200 border-amber-400/50';
    }
    if (c.status === 'missing') {
      return 'bg-rose-500/30 text-rose-300 border-rose-500/50 line-through';
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-ocean-950/70 border border-cyan-500/20 shadow-xl">
      {/* Header: Score & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
            Độ chính xác phát âm:
          </span>
          <span className={`px-3 py-1 rounded-xl border text-sm sm:text-base font-black ${getScoreColor(score)}`}>
            {score}/100%
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Chuẩn xác</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Gần đúng</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Cần sửa</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
            score >= 65 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
            'bg-gradient-to-r from-rose-500 to-orange-400'
          }`}
          style={{ width: `${Math.max(6, score)}%` }}
        />
      </div>

      {/* Word-level colored blocks with clickable Character-Level Inspector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-slate-400 font-medium">
          Nhấp vào từng từ để xem phân tích chi tiết từng ký tự:
        </span>

        <div className="flex flex-wrap gap-2">
          {words.map((item, idx) => {
            const isExpanded = expandedWordIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setExpandedWordIdx(isExpanded ? null : idx)}
                className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${getWordBadge(item)} ${
                  isExpanded ? 'ring-2 ring-cyan-400 shadow-glass-glow' : ''
                }`}
                title="Bấm để xem từng ký tự"
              >
                <span>{item.word}</span>
                <span className="text-[10px] opacity-75 font-mono">({item.ratio}%)</span>
                {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Character-by-Character Inspection Panel */}
      {expandedWordIdx !== null && words[expandedWordIdx] && (
        <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-cyan-500/30 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Chi tiết từng ký tự của từ: &ldquo;{words[expandedWordIdx].word}&rdquo;
            </span>
            <span className="text-[11px] text-slate-400">
              {words[expandedWordIdx].matchedWith
                ? `Máy nghe được: "${words[expandedWordIdx].matchedWith}"`
                : 'Không nghe thấy từ này'}
            </span>
          </div>

          {/* Letter-by-letter badges */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {words[expandedWordIdx].chars && words[expandedWordIdx].chars.length > 0 ? (
              words[expandedWordIdx].chars.map((ch, cIdx) => (
                <div
                  key={cIdx}
                  className={`w-8 h-8 rounded-lg border font-mono font-bold text-sm flex flex-col items-center justify-center leading-none ${getCharStyle(ch)}`}
                  title={
                    ch.status === 'correct' ? `Ký tự "${ch.char}": Phát âm chuẩn` :
                    ch.status === 'missing' ? `Ký tự "${ch.char}": Bị nuốt âm / bỏ quên` :
                    `Ký tự "${ch.char}": Bị đọc nhầm thành "${ch.spokenChar || '?'}"`
                  }
                >
                  <span>{ch.char}</span>
                  {ch.status !== 'correct' && ch.spokenChar && ch.spokenChar !== ch.char && (
                    <span className="text-[9px] opacity-80 mt-0.5">{ch.spokenChar}</span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Không có dữ liệu ký tự.</span>
            )}
          </div>

          {/* Word tips if any */}
          {words[expandedWordIdx].tips && words[expandedWordIdx].tips.length > 0 && (
            <div className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {words[expandedWordIdx].tips.map((tip, tIdx) => (
                <div key={tIdx}>💡 {tip}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vietnamese Learner Common Pronunciation Tips */}
      {vietnameseTips && vietnameseTips.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Mẹo phát âm cho người Việt:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {vietnameseTips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript comparison */}
      {rawSpoken && (
        <div className="text-xs text-slate-400 italic pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <span>Đoạn máy nghe được: &ldquo;{rawSpoken}&rdquo;</span>
          {score >= 85 ? (
            <span className="text-emerald-400 font-bold not-italic">✓ Phát âm xuất sắc, âm điệu rất tự nhiên!</span>
          ) : score >= 65 ? (
            <span className="text-amber-400 font-bold not-italic">⚡ Khá tốt, hãy tập trung vào các âm đuôi màu vàng/đỏ!</span>
          ) : (
            <span className="text-rose-400 font-bold not-italic">↺ Hãy nghe lại phát âm mẫu và luyện tập thêm nhé!</span>
          )}
        </div>
      )}
    </div>
  );
}
