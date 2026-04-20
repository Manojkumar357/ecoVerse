import { useMemo, useState } from "react";

export default function EcoHome({ onComplete }: { onComplete: () => void }) {
  const hazards = useMemo(() => ([
    { id: 'fan', label: 'Ceiling fan left on', fixed: false },
    { id: 'tap', label: 'Tap running', fixed: false },
    { id: 'lights', label: 'Lights on', fixed: false },
  ]), []);
  const [state, setState] = useState<Record<string, boolean>>({});
  const allFixed = hazards.every(h => state[h.id]);

  return (
    <div>
      <p className="text-sm text-earth-muted mb-2">Click each bad habit to fix it.</p>
      <div className="space-y-2">
        {hazards.map(h => (
          <button
            key={h.id}
            onClick={()=>setState(s => ({ ...s, [h.id]: !s[h.id] }))}
            className={`w-full text-left px-4 py-3 rounded-lg border transition ${state[h.id] ? 'border-emerald-500 bg-emerald-500/10 shadow-md' : 'border-[var(--earth-border)] bg-white/5 hover:border-emerald-400 hover:bg-emerald-400/10'}`}
          >
            {state[h.id] ? '✅' : '⚠️'} {h.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <button
          disabled={!allFixed}
          onClick={onComplete}
          className={`px-4 py-2 rounded-lg ${allFixed ? 'bg-earth-orange shadow-orange' : 'bg-white/10 cursor-not-allowed'}`}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
