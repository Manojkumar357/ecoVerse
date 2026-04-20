import { useState } from 'react';

export default function Stepper({ steps, onComplete }: { steps: string[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const next = () => {
    if (i + 1 >= steps.length) onComplete();
    else setI(i + 1);
  };
  return (
    <div className="max-w-md mx-auto bg-white/5 rounded-xl border p-4">
      <div className="text-sm text-earth-muted mb-3">Follow the eco-steps</div>
      <div className="text-lg font-medium mb-4">{steps[i]}</div>
      <div className="flex justify-end">
        <button onClick={next} className="px-3 py-2 rounded-lg bg-earth-orange shadow-orange">{i + 1 >= steps.length ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  );
}
