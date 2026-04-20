import { useEffect, useMemo, useRef, useState } from 'react';

type Item = { id: number; x: number; y: number };

export default function ClickCollect({ count = 10, durationMs = 15000, onComplete }: { count?: number; durationMs?: number; onComplete: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [start, setStart] = useState<number | null>(null);
  const [collected, setCollected] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // spawn items
    const spawned: Item[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 85 + 5,
      y: Math.random() * 70 + 10,
    }));
    setItems(spawned);
    setStart(performance.now());
    timer.current = window.setTimeout(() => {
      // time up, consider success if all collected
      if (spawned.length === 0 || collected >= count) onComplete();
    }, durationMs) as unknown as number;

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [count, durationMs]);

  const handleClick = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setCollected(c => {
      const next = c + 1;
      if (next >= count) onComplete();
      return next;
    });
  };

  return (
    <div className="relative w-full h-[60vh] rounded-xl border bg-white/5 overflow-hidden">
      {items.map((it) => (
        <button key={it.id} onClick={() => handleClick(it.id)}
          className="absolute w-8 h-8 rounded-full bg-cyan-400/80 hover:bg-cyan-400 shadow-cyan focus:outline-none"
          style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%, -50%)' }}
          aria-label="collect item"
        />
      ))}
      <div className="absolute top-2 right-2 text-xs bg-black/40 px-2 py-1 rounded-md">{collected}/{count}</div>
    </div>
  );
}
