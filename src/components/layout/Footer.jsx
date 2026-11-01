import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer({ t, uiLang }) {
  return (
    <footer className="mt-20 border-t border-white/10 py-10 px-4 text-center text-xs text-slate-400">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-cyan-300 font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>AuraLingua AI — Designed for Vietnamese English Learners</span>
        </div>
        <p className="max-w-md text-slate-400 leading-relaxed">
          {uiLang === 'vi'
            ? '100% dịch nghĩa và giải thích ngữ pháp tiếng Việt chi tiết. Hoạt động trực tiếp trên trình duyệt bằng Google Gemini AI.'
            : 'Zero-backend, privacy-first language learning web app powered by Google Gemini AI with Spaced Repetition (SM-2) and Web Speech scoring.'}
        </p>
        <div className="pt-2 flex items-center gap-1 text-[11px] text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>using Vite, React 18 & Tailwind CSS. Client-side localStorage persistence.</span>
        </div>
      </div>
    </footer>
  );
}
