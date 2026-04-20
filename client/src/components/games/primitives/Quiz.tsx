import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

export type QuizQuestion = { id: string; text: string; options: string[]; answerIndex?: number };
export default function MiniQuiz({
  questions,
  onComplete,
  timePer = 20,
}: {
  questions: QuizQuestion[];
  onComplete: (scorePercent: number) => void;
  timePer?: number;
}) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number[]>([]);
  const total = questions.length;

  const current = questions[step];

  const choose = (idx: number) => {
    if (answered[step] != null) return; // lock
    const next = [...answered];
    next[step] = idx;
    setAnswered(next);
    const correct = current.answerIndex;
    if (typeof correct === 'number' && correct === idx) setScore((s) => s + 1);
  };

  const nextQ = () => {
    if (step + 1 < total) setStep((s) => s + 1);
    else onComplete(Math.round((score / total) * 100));
  };

  return (
    <div>
      <div className="text-sm text-earth-muted mb-1">Question {step + 1} / {total}</div>
      <div className="text-lg font-medium">{current.text}</div>
      <div className="mt-3 grid gap-2">
        {current.options.map((o, i) => (
          <button key={i} onClick={() => choose(i)} className={`text-left px-3 py-2 rounded-lg border transition ${answered[step] == null ? 'hover:border-cyan-400 hover:bg-cyan-400/10' : answered[step] === i ? 'border-emerald-500 bg-emerald-500/10' : 'opacity-60 border-[var(--earth-border)] bg-white/5'}`}>{o}</button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>Score: {score} / {total}</div>
        <Button size="sm" onClick={nextQ}>Continue</Button>
      </div>
    </div>
  );
}
