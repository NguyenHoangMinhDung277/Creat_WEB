import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award, Sparkles, BookOpen } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import { StorageService } from '../../services/storage';
import { SFX } from '../../services/sfx';

export default function QuizGame({
  items,
  onQuizCompleted,
  uiLang,
  t
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);

  // Generate dynamic quiz questions from items
  useEffect(() => {
    if (!items || items.length === 0) return;

    // Pick up to 10 items for the quiz session
    const pool = [...items].sort(() => 0.5 - Math.random());
    const selectedItems = pool.slice(0, Math.min(10, pool.length));

    const generatedQuestions = selectedItems.map((item, idx) => {
      // 50% EN -> VI (Word to Meaning), 50% VI -> EN (Meaning to Word)
      const mode = idx % 2 === 0 ? 'EN_TO_VI' : 'VI_TO_EN';

      // Pick 3 distractors from the rest of the pool
      const otherItems = items.filter(i => i.english !== item.english).sort(() => 0.5 - Math.random());
      const distractors = otherItems.slice(0, 3);

      let options = [];
      let promptEn = '';
      let promptVi = '';

      if (mode === 'EN_TO_VI') {
        promptEn = `What is the accurate Vietnamese meaning of "${item.english}"?`;
        promptVi = `Nghĩa tiếng Việt chuẩn xác nhất của "${item.english}" là gì?`;
        options = [
          { textEn: item.english, textVi: item.vietnamese, isCorrect: true },
          ...distractors.map(d => ({ textEn: d.english, textVi: d.vietnamese, isCorrect: false }))
        ];
      } else {
        promptEn = `Which English expression best corresponds to: "${item.vietnamese}"?`;
        promptVi = `Cụm từ tiếng Anh nào diễn đạt chính xác nhất cho nghĩa: "${item.vietnamese}"?`;
        options = [
          { textEn: item.english, textVi: item.vietnamese, isCorrect: true },
          ...distractors.map(d => ({ textEn: d.english, textVi: d.vietnamese, isCorrect: false }))
        ];
      }

      // Shuffle options
      options.sort(() => 0.5 - Math.random());
      const correctIdx = options.findIndex(o => o.isCorrect);

      return {
        id: `q_${item.id}_${idx}`,
        targetItem: item,
        mode,
        promptEn,
        promptVi,
        options,
        correctIndex: correctIdx,
        explanationVi: item.explanationVi,
        exampleEn: item.exampleEn,
        exampleVi: item.exampleVi
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setResults([]);
    setIsFinished(false);
    setShowMistakesOnly(false);
  }, [items]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      SFX.playCorrect();
      StorageService.addXP(15);
    } else {
      SFX.playWrong();
      StorageService.recordWordAttempt(currentQ.targetItem, 40);
    }

    setResults(prev => [...prev, {
      question: currentQ,
      selectedOption: index,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      SFX.playClick();
    } else {
      setIsFinished(true);
      SFX.playFanfare();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }

      if (onQuizCompleted) {
        const correctCount = results.filter(r => r.isCorrect).length;
        onQuizCompleted({
          total: questions.length,
          correct: correctCount,
          xpEarned: correctCount * 15
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setResults([]);
    setIsFinished(false);
    setShowMistakesOnly(false);
    SFX.playClick();
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4 max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-cyan-400" />
        <h3 className="text-xl font-bold text-slate-100">Need More Vocabulary Items</h3>
        <p className="text-xs text-slate-400">
          Save at least 4 items to your deck or select a CEFR level to start generating quiz questions.
        </p>
      </div>
    );
  }

  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectResults = results.filter(r => !r.isCorrect);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {!isFinished ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col gap-6 shadow-2xl">
          {/* Header & Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-2">
                <Badge level={currentQ.targetItem.level} size="xs" />
                <Badge type={currentQ.targetItem.type} size="xs" uiLang={uiLang} />
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Prompt */}
          <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10">
            <BilingualText
              en={currentQ.promptEn}
              vi={currentQ.promptVi}
              enClassName="text-base sm:text-lg font-bold text-slate-100"
              viClassName="text-xs sm:text-sm text-cyan-300 font-medium mt-1"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              let optStyle = 'glass-panel border-white/10 text-slate-200 hover:border-cyan-400/50 hover:bg-white/5';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                } else if (idx === selectedOption) {
                  optStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                } else {
                  optStyle = 'opacity-40 border-white/5';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 ${optStyle}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-100">
                      {opt.textEn}
                    </span>
                    <span className="text-xs text-cyan-200/80">
                      {opt.textVi}
                    </span>
                  </div>

                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if Answered */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-ocean-950/70 border border-cyan-500/20 flex flex-col gap-2 text-xs text-slate-300 animate-in fade-in">
              <span className="font-bold text-cyan-300">💡 Giải thích chi tiết:</span>
              <p>{currentQ.explanationVi}</p>
              {currentQ.exampleEn && (
                <div className="pt-1 text-slate-400 italic">
                  <span>Ví dụ: &ldquo;{currentQ.exampleEn}&rdquo;</span>
                  {currentQ.exampleVi && <span className="block not-italic text-slate-300">↳ {currentQ.exampleVi}</span>}
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <Button
                variant="rainbow"
                size="md"
                onClick={handleNext}
                icon={ArrowRight}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Quiz Results'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan animate-bounce">
            <Award className="w-10 h-10 text-slate-950" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Quiz Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              {correctCount} / {questions.length} Correct ({Math.round((correctCount / questions.length) * 100)}%)
            </h2>
            <p className="text-sm text-slate-300">
              {correctCount >= questions.length * 0.8
                ? t.congratulations
                : 'Good effort! Review mistakes below to solidify your memory.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10 flex flex-col items-center">
              <span className="text-xs text-slate-400">Accuracy</span>
              <span className="text-xl font-bold text-emerald-400">
                {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10 flex flex-col items-center">
              <span className="text-xs text-slate-400">XP Earned</span>
              <span className="text-xl font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                +{correctCount * 15}
              </span>
            </div>
          </div>

          {/* Review Mistakes Button */}
          {incorrectResults.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMistakesOnly(prev => !prev)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
            >
              {showMistakesOnly ? 'Hide Mistakes' : `${t.reviewMistakes} (${incorrectResults.length})`}
            </button>
          )}

          {/* Mistakes Breakdown */}
          {showMistakesOnly && incorrectResults.length > 0 && (
            <div className="w-full text-left flex flex-col gap-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Questions to Review:
              </h4>
              {incorrectResults.map((res, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-ocean-950/80 border border-rose-500/30 text-xs flex flex-col gap-1">
                  <span className="font-semibold text-slate-100">{res.question.targetItem.english}</span>
                  <span className="text-cyan-300">↳ Nghĩa đúng: {res.question.targetItem.vietnamese}</span>
                  <span className="text-slate-400 italic">{res.question.explanationVi}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="neon"
              size="lg"
              onClick={handleRestart}
              icon={RotateCcw}
            >
              {t.tryAgain}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
