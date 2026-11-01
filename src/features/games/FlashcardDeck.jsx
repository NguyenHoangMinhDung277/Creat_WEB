import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCw, Check, X, Award, Sparkles, Layers } from 'lucide-react';
import RainbowBorder from '../../components/common/RainbowBorder';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import { calculateSM2 } from '../../utils/srs';
import { StorageService } from '../../services/storage';
import { useSpeech } from '../../hooks/useSpeech';
import { SFX } from '../../services/sfx';

export default function FlashcardDeck({
  items,
  onSessionCompleted,
  uiLang,
  t
}) {
  const [deck, setDeck] = useState(items || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const { speak } = useSpeech();

  useEffect(() => {
    setDeck(items || []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionResults([]);
    setIsCompleted(false);
  }, [items]);

  const currentCard = deck[currentIndex];

  // Spacebar flips card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isCompleted) {
        e.preventDefault();
        setIsFlipped(prev => {
          SFX.playCardFlip();
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted]);

  const handleFlip = () => {
    SFX.playCardFlip();
    setIsFlipped(prev => !prev);
  };

  const handleReviewAnswer = (knewIt) => {
    if (!currentCard) return;

    if (knewIt) {
      SFX.playCorrect();
    } else {
      SFX.playWrong();
    }

    // Update SRS schedule
    const newSRS = calculateSM2(currentCard.srs || {}, knewIt);
    const updatedCard = { ...currentCard, srs: newSRS };

    // Update in user deck if saved
    StorageService.addToDeck(updatedCard);

    // Add XP: 10 XP for knew it, 2 XP for effort
    const xpGained = knewIt ? 10 : 2;
    StorageService.addXP(xpGained);

    const newResults = [...sessionResults, { id: currentCard.id, english: currentCard.english, knewIt }];
    setSessionResults(newResults);

    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      SFX.playFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }

      if (onSessionCompleted) {
        onSessionCompleted({
          type: 'flashcards',
          total: deck.length,
          knewCount: newResults.filter(r => r.knewIt).length,
          xpGained: newResults.reduce((acc, cur) => acc + (cur.knewIt ? 10 : 2), 0)
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionResults([]);
    setIsCompleted(false);
    SFX.playClick();
  };

  if (!deck || deck.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4 max-w-md mx-auto">
        <Layers className="w-12 h-12 text-cyan-400" />
        <h3 className="text-xl font-bold text-slate-100">{t.deckEmpty}</h3>
        <p className="text-xs text-slate-400">
          Add items to your deck from CEFR topics or Document Extraction to start practicing with spaced repetition.
        </p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex) / deck.length) * 100);
  const knewCount = sessionResults.filter(r => r.knewIt).length;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      {!isCompleted ? (
        <div className="flex flex-col gap-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <div className="flex items-center gap-2">
              <Badge level={currentCard.level} size="xs" />
              <span>{progressPercent}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* Flashcard with Rainbow Border */}
          <RainbowBorder
            thickness={2}
            rounded="rounded-3xl"
            glow={true}
            className="w-full cursor-pointer select-none"
            onClick={handleFlip}
          >
            <div className="min-h-[300px] sm:min-h-[340px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              {/* Card Top: Badges & Audio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge level={currentCard.level} size="xs" />
                  <Badge type={currentCard.type} size="xs" uiLang={uiLang} />
                  {currentCard.ipa && (
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                      {currentCard.ipa}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.english);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Center: English on Front; Vietnamese on Back */}
              <div className="my-auto py-6 text-center flex flex-col items-center justify-center gap-3">
                {!isFlipped ? (
                  /* FRONT: English term + Context hint */
                  <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-xs uppercase tracking-widest font-bold text-cyan-400">
                      English
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
                      {currentCard.english}
                    </h2>
                    {currentCard.exampleEn && (
                      <p className="text-xs sm:text-sm text-slate-300 italic max-w-sm mt-2">
                        &ldquo;{currentCard.exampleEn}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  /* BACK: Vietnamese Translation + Explanation (100% Rule) */
                  <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                      Nghĩa Tiếng Việt
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
                      {currentCard.vietnamese}
                    </h2>

                    {currentCard.exampleVi && (
                      <div className="p-2.5 rounded-xl bg-ocean-900/60 border border-white/5 text-xs text-slate-300 max-w-md">
                        <span className="font-semibold text-slate-400 block mb-0.5">Dịch câu ví dụ:</span>
                        <span>↳ {currentCard.exampleVi}</span>
                      </div>
                    )}

                    {currentCard.explanationVi && (
                      <p className="text-xs text-slate-300 leading-relaxed max-w-md bg-white/5 p-2 rounded-lg">
                        💡 {currentCard.explanationVi}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom Hint */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-3 border-t border-white/10">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t.flipCard}</span>
              </div>
            </div>
          </RainbowBorder>

          {/* Action Buttons: Knew It vs Didn't Know */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleReviewAnswer(false)}
              className="glass-panel border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 text-rose-300 py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>{t.didntKnow}</span>
            </button>

            <button
              type="button"
              onClick={() => handleReviewAnswer(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{t.knewIt}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Session Completed Screen */
        <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan animate-bounce">
            <Award className="w-10 h-10 text-slate-950" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Spaced Repetition Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              {t.quizCompleted}
            </h2>
            <p className="text-sm text-slate-300">
              You reviewed {deck.length} flashcards and remembered {knewCount}!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10 flex flex-col items-center">
              <span className="text-xs text-slate-400">Mastery Rate</span>
              <span className="text-xl font-bold text-emerald-400">
                {Math.round((knewCount / deck.length) * 100)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10 flex flex-col items-center">
              <span className="text-xs text-slate-400">XP Gained</span>
              <span className="text-xl font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                +{knewCount * 10 + (deck.length - knewCount) * 2}
              </span>
            </div>
          </div>

          <Button
            variant="neon"
            size="lg"
            onClick={handleRestart}
            icon={RotateCw}
          >
            {t.tryAgain}
          </Button>
        </div>
      )}
    </div>
  );
}
