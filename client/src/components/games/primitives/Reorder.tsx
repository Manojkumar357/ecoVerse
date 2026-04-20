import { useMemo, useState } from 'react';

export default function Reorder({ items, targetOrder, onComplete }: { items: string[]; targetOrder: string[]; onComplete: () => void }) {
  const [arr, setArr] = useState(items);
  const swap = (i: number, j: number) => {
    const next = arr.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setArr(next);
  };
  const correct = arr.join('|') === targetOrder.join('|');
  return (
    <div>
      <div className="text-sm text-earth-muted mb-2">Tap items to swap them into the correct order.</div>
      <div className="flex gap-2 flex-wrap">
        {arr.map((it, i) => (
          <button key={i} onClick={() => i < arr.length - 1 ? swap(i, i + 1) : swap(i, 0)} className="px-3 py-2 rounded-lg border bg-white/5 hover:border-cyan-400 hover:bg-cyan-400/10 transition">{it}</button>
        ))}
      </div>
      <div className="mt-3">
        <button disabled={!correct} onClick={onComplete} className={`px-3 py-2 rounded-lg ${correct ? 'bg-earth-orange shadow-orange' : 'bg-white/10 cursor-not-allowed'}`}>Finish</button>
      </div>
    </div>
  );
}
