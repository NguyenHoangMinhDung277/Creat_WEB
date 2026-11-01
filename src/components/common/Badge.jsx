import React from 'react';

const LEVEL_COLORS = {
  A1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  A2: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  B1: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  B2: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  C1: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  C2: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const TYPE_LABELS = {
  word: { en: 'Word', vi: 'Từ vựng', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  phrasal_verb: { en: 'Phrasal Verb', vi: 'Cụm động từ', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  idiom: { en: 'Idiom', vi: 'Thành ngữ', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  collocation: { en: 'Collocation', vi: 'Cụm từ cố định', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
};

export default function Badge({
  level,
  type,
  children,
  className = '',
  size = 'sm', // 'xs' | 'sm' | 'md'
  uiLang = 'en',
}) {
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  if (level) {
    const color = LEVEL_COLORS[level] || LEVEL_COLORS.B1;
    return (
      <span className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md border ${color} ${sizeClass} ${className}`}>
        {level}
      </span>
    );
  }

  if (type) {
    const meta = TYPE_LABELS[type] || { en: type, vi: type, color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    return (
      <span className={`inline-flex items-center font-medium rounded-md border ${meta.color} ${sizeClass} ${className}`} title={meta.vi}>
        {uiLang === 'vi' ? meta.vi : meta.en}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md border border-white/10 bg-white/5 text-slate-300 ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}
