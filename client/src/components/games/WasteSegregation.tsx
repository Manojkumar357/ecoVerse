import { useMemo, useState } from "react";

export default function WasteSegregation({ onComplete }: { onComplete: () => void }) {
  const items = useMemo(() => ([
    { id: 'banana', label: '🍌 Banana Peel', bin: 'organic' },
    { id: 'bottle', label: '🧴 Plastic Bottle', bin: 'recyclable' },
    { id: 'paper', label: '📰 Newspaper', bin: 'recyclable' },
    { id: 'chip', label: '🍟 Chip Packet', bin: 'non' },
  ]), []);
  const [placed, setPlaced] = useState<Record<string,string>>({});
  const [done, setDone] = useState(false);

  const allPlaced = Object.keys(placed).length >= items.length;
  const correct = allPlaced && items.every(it => placed[it.id] === it.bin);

  const onDrop = (e: React.DragEvent<HTMLDivElement>, bin: string) => {
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    setPlaced(p => ({ ...p, [id]: bin }));
  };
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <p className="text-sm text-earth-muted mb-2">Drag items into the correct bin. Place all correctly to complete.</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium mb-2">Items</div>
          <div className="flex flex-col gap-3">
            {items.map(it => (
              <div key={it.id} draggable onDragStart={(e)=>onDragStart(e, it.id)} className={`px-4 py-3 rounded-lg border transition ${placed[it.id] ? 'opacity-50' : 'cursor-move hover:border-emerald-400 hover:bg-emerald-400/10'} bg-white/5`}>
                {it.label}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-medium">Bins</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'organic', name: 'Organic' },
              { id: 'recyclable', name: 'Recyclable' },
              { id: 'non', name: 'Non-Recyclable' },
            ].map(b => (
              <div key={b.id} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDrop(e, b.id)} className="h-28 rounded-xl border border-[var(--earth-border)] bg-white/5 flex items-center justify-center text-sm hover:border-cyan-400 hover:bg-cyan-400/10 transition shadow-md">
                {b.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm">
        {allPlaced ? (
          correct ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-300">All correct! 🎉</span>
              <button className="px-3 py-1 rounded bg-earth-orange shadow-orange" onClick={() => { if (!done) { setDone(true); onComplete(); } }}>Finish</button>
            </div>
          ) : (
            <span className="text-amber-300">Some items are in the wrong bin. Adjust and try again.</span>
          )
        ) : (
          <span className="text-earth-muted">Place all items to check.</span>
        )}
      </div>
    </div>
  );
}
