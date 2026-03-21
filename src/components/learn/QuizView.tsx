'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types';
import { useLocale } from '@/i18n/useLocale';
import MathText from '@/components/shared/MathText';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export default function QuizView({ questions, onComplete }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { t } = useLocale();

  const question = questions[currentIndex];

  const handleSelect = (choiceIndex: number) => {
    if (revealed) return;
    setSelectedIndex(choiceIndex);
    setRevealed(true);
    if (question.choices[choiceIndex].isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedIndex(null);
      setRevealed(false);
    }
  };

  if (finished) {
    const message = score === questions.length
      ? t('quiz.perfect')
      : score >= questions.length / 2
        ? t('quiz.good')
        : t('quiz.retry');

    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 text-center">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t('quiz.result')}
        </h3>
        <p className="text-3xl font-bold mb-1">
          <span className="text-blue-600 dark:text-blue-400">{score}</span>
          <span className="text-zinc-400 dark:text-zinc-500"> / {questions.length}</span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{message}</p>
        <button
          onClick={onComplete}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {t('quiz.proceed')}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('quiz.title')}</h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-4">
        <MathText text={question.question} className="text-sm font-medium text-zinc-800 dark:text-zinc-200" />
      </div>

      <div className="space-y-2 mb-4">
        {question.choices.map((choice, i) => {
          let style = 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer';
          if (revealed) {
            if (choice.isCorrect) {
              style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200';
            } else if (i === selectedIndex) {
              style = 'border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200';
            } else {
              style = 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 opacity-60';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left rounded-lg border-2 px-4 py-3 text-sm transition-colors ${style}`}
            >
              <MathText text={choice.text} className="text-zinc-800 dark:text-zinc-200" />
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 mb-4">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">{t('quiz.explanation')}</p>
          <MathText text={question.explanation} className="text-sm text-blue-800 dark:text-blue-200" />
        </div>
      )}

      {revealed && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {currentIndex + 1 >= questions.length ? t('quiz.showResult') : t('quiz.next')}
          </button>
        </div>
      )}
    </div>
  );
}
