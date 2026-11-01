import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GraduationCap, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { PLACEMENT_QUESTIONS, calculateRecommendedLevel } from '../../data/placementQuestions';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BilingualText from '../../components/common/BilingualText';
import { SFX } from '../../services/sfx';

export default function PlacementTest({
  onLevelSelected,
  uiLang,
  t
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = PLACEMENT_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex) / PLACEMENT_QUESTIONS.length) * 100);

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      SFX.playCorrect();
    } else {
      SFX.playWrong();
    }

    setUserAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selected: index,
      isCorrect,
      level: currentQ.level
    }]);
  };

  const handleNext = () => {
    if (currentIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      SFX.playClick();
    } else {
      // Finished test
      setIsFinished(true);
      SFX.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
    SFX.playClick();
  };

  const totalScore = userAnswers.filter(a => a.isCorrect).length;
  const recommendation = calculateRecommendedLevel(totalScore, PLACEMENT_QUESTIONS.length);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {t.navPlacement}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300 font-medium">
              15 câu hỏi đánh giá trình độ toàn diện từ A1 đến C2
            </p>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col gap-6 shadow-2xl">
          {/* Progress Bar & Question Meta */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Question {currentIndex + 1} of {PLACEMENT_QUESTIONS.length}</span>
              <div className="flex items-center gap-2">
                <Badge level={currentQ.level} size="xs" />
                <span>{progressPercent}%</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-ocean-950/70 border border-white/10">
            <BilingualText
              en={currentQ.questionEn}
              vi={currentQ.questionVi}
              enClassName="text-base sm:text-lg font-bold text-slate-100 leading-snug"
              viClassName="text-xs sm:text-sm text-cyan-300 font-medium mt-1"
            />
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              let optionStyle = 'glass-panel border-white/10 text-slate-200 hover:border-cyan-400/50 hover:bg-white/5';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optionStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm';
                } else if (idx === selectedOption) {
                  optionStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                } else {
                  optionStyle = 'opacity-40 border-white/5';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 ${optionStyle}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-100">
                      {option.textEn}
                    </span>
                    <span className="text-xs text-cyan-200/80">
                      {option.textVi}
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
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 flex flex-col gap-1 animate-in fade-in">
              <span className="font-bold text-cyan-300">💡 Giải thích chi tiết:</span>
              <p>{currentQ.explanationVi}</p>
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
                {currentIndex < PLACEMENT_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan animate-bounce">
            <Award className="w-10 h-10 text-slate-950" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Placement Assessment Complete
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              {totalScore} / {PLACEMENT_QUESTIONS.length} Correct ({Math.round((totalScore / PLACEMENT_QUESTIONS.length) * 100)}%)
            </h2>
            <p className="text-sm text-slate-300">
              Recommended starting proficiency level:
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ocean-950/80 border border-cyan-400/30 flex flex-col items-center gap-3 w-full max-w-md">
            <Badge level={recommendation.level} size="md" />
            <h3 className="text-2xl font-extrabold text-cyan-300">
              {recommendation.title}
            </h3>
            <p className="text-sm text-slate-300">
              {recommendation.titleVi}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={handleRestart}
              icon={RotateCcw}
            >
              Retake Test
            </Button>
            <Button
              variant="neon"
              size="lg"
              onClick={() => onLevelSelected && onLevelSelected(recommendation.level)}
              icon={ArrowRight}
            >
              Start Learning at {recommendation.level} &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
