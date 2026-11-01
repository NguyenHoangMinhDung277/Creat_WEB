import React from 'react';

/**
 * Reusable BilingualText Component
 * Enforces the 100% Vietnamese translation rule across the entire application.
 * Displays English text cleanly on top, followed immediately by Vietnamese translation underneath.
 */
export default function BilingualText({
  en,
  vi,
  enClassName = 'text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900',
  viClassName = 'text-sm text-cyan-300 dark:text-cyan-300 light:text-blue-700 font-normal',
  containerClassName = 'flex flex-col gap-0.5',
  prefixEn = null,
  prefixVi = null,
  highlightWord = null,
}) {
  if (!en && !vi) return null;

  return (
    <div className={`bilingual-block ${containerClassName}`}>
      {/* English primary line */}
      {en && (
        <div className={`flex items-baseline gap-1.5 leading-snug ${enClassName}`}>
          {prefixEn}
          <span>{en}</span>
        </div>
      )}

      {/* Vietnamese secondary translation line directly below */}
      {vi && (
        <div className={`flex items-baseline gap-1.5 leading-snug opacity-95 ${viClassName}`}>
          {prefixVi}
          <span>{vi}</span>
        </div>
      )}
    </div>
  );
}
