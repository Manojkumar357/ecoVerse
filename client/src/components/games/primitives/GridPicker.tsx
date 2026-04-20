import { useMemo, useState } from 'react';

type Tile = { label: string; correct: boolean };

export default function GridPicker({ tiles, targetCount, onComplete }: { tiles: Tile[]; targetCount: number; onComplete: () => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const toggle = (i: number) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const ok = sel.length === targetCount && sel.every(i => tiles[i].correct);
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tiles.map((t, i) => (
          <button key={i} onClick={() => toggle(i)} className={`px-3 py-4 rounded-xl border transition ${sel.includes(i) ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 hover:bg-white/10'}`}>{t.label}</button>
        ))}
      </div>
      <div className="mt-3">
        <button disabled={!ok} onClick={onComplete} className={`px-3 py-2 rounded-lg ${ok ? 'bg-earth-orange shadow-orange' : 'bg-white/10 cursor-not-allowed'}`}>Finish</button>
      </div>
    </div>
  );
}
