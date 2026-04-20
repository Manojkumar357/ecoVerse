import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GAME_CATEGORIES, GAMES, mergeGamesCatalog } from "@/lib/gamesCatalog";

type GameDef = typeof GAMES[number];

const CATEGORY_THEME: Record<GameDef["category"], string> = {
  recycling: "from-[#66d69f]/25 to-[#3ca1d3]/20",
  climate: "from-[#85b9ff]/25 to-[#52ddd3]/20",
  habits: "from-[#f9b46f]/22 to-[#7bc4ad]/24",
  wildlife: "from-[#5ed6b2]/25 to-[#6dc6ff]/20",
  fun: "from-[#a1b5ff]/24 to-[#66d69f]/24",
};

export default function GamesPage() {
  const [category, setCategory] = useState<'recycling' | 'climate' | 'habits' | 'wildlife' | 'fun' | 'all'>('all');
  const [summary, setSummary] = useState<{ totalGamePoints: number; badges: string[]; monthCompletedCount: number; totalUniqueGames: number } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { username } = useAuth();
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [hoverFx, setHoverFx] = useState<Record<string, { x: number; y: number }>>({});
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastHoverToneRef = useRef(0);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingSummary(true);
      try {
        const res = await fetch('/api/student/games/summary', { headers: username ? { 'x-username': username } : undefined });
        const json = await res.json();
        if (active) setSummary(json);
      } catch {
        if (active) setSummary({ totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 });
      } finally {
        if (active) setLoadingSummary(false);
      }
    })();
    return () => { active = false; };
  }, [username]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/games');
        const json = await res.json();
        if (active) setLiveGames(Array.isArray(json) ? json : []);
      } catch {
        if (active) setLiveGames([]);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const merged = mergeGamesCatalog(liveGames);
    return category === 'all' ? merged : merged.filter(g => g.category === category);
  }, [category, liveGames]);

  useEffect(() => {
    // Gives a polished first-load skeleton before cards animate in.
    const timer = setTimeout(() => setCatalogLoading(false), 520);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const armSound = () => setSoundEnabled(true);
    window.addEventListener("pointerdown", armSound, { once: true });
    window.addEventListener("keydown", armSound, { once: true });
    return () => {
      window.removeEventListener("pointerdown", armSound);
      window.removeEventListener("keydown", armSound);
    };
  }, []);

  useEffect(() => {
    setCardsVisible(false);
    const timer = setTimeout(() => setCardsVisible(true), 80);
    return () => clearTimeout(timer);
  }, [category, filtered.length]);

  useEffect(() => {
    if (catalogLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("data-game-id");
          if (!id) return;
          setVisibleIds((prev) => ({ ...prev, [id]: true }));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    filtered.forEach((game) => {
      const element = cardRefs.current[game.id];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [catalogLoading, filtered]);

  const progressPercent = useMemo(() => {
    const total = Math.max(summary?.totalUniqueGames ?? 0, 1);
    const month = summary?.monthCompletedCount ?? 0;
    return Math.min(100, Math.round((month / total) * 100));
  }, [summary]);

  const playUiTone = (kind: "hover" | "click") => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = kind === "hover" ? 560 : 740;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(kind === "hover" ? 0.016 : 0.03, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "hover" ? 0.06 : 0.12));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (kind === "hover" ? 0.07 : 0.13));
    } catch {
      // Non-blocking fallback if WebAudio fails.
    }
  };

  const openGame = () => {
    playUiTone("click");
  };

  const onPlayHover = () => {
    const now = Date.now();
    if (now - lastHoverToneRef.current < 150) return;
    lastHoverToneRef.current = now;
    playUiTone("hover");
  };

  const onCardMove = (id: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setHoverFx((prev) => ({
      ...prev,
      [id]: {
        x: (px - 0.5) * 2,
        y: (py - 0.5) * 2,
      },
    }));
  };

  const onCardLeave = (id: string) => {
    setHoverFx((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
  };
  // Refresh progress when user returns from a game
  useEffect(() => {
    const onFocus = () => {
      fetch('/api/student/games/summary', { headers: username ? { 'x-username': username } : undefined })
        .then(r=>r.json())
        .then(setSummary)
        .catch(()=>{});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [username]);

  return (
    <div className="min-h-screen text-white pt-14 md:pt-16 p-4 md:p-6 relative overflow-hidden bg-[#08141c]">
      {/* Layered atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(89,203,166,0.18),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(135,162,255,0.2),transparent_28%),linear-gradient(180deg,#0c1f2a_0%,#08141c_38%,#071018_100%)]"></div>
      <div className="pointer-events-none absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl"></div>
      <div className="pointer-events-none absolute right-[-9rem] top-[-1rem] h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="rounded-3xl border border-white/15 bg-[#d7ebf00f] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-4 md:p-6 mb-4 md:mb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200/35 bg-emerald-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100/95">Interactive Missions</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white/95 drop-shadow">Eco-Games <span>🌱🎮</span></h1>
              <p className="mt-1.5 max-w-2xl text-sm md:text-base text-white/80">Play, learn, and act. Every game now connects to targeted learning paths and practical environmental actions.</p>
            </div>
            <div className="rounded-2xl border border-cyan-100/20 bg-[#d6e8ee12] backdrop-blur-xl p-3 min-w-[250px] lg:min-w-[312px]">
              <div className="text-sm font-bold uppercase tracking-[0.08em] text-white/90">Your Game Progress</div>
              {loadingSummary ? (
                <div className="text-xs text-white/70 mt-1">Loading…</div>
              ) : (
                <motion.div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-white/85"><span>Game Points</span><span className="font-bold text-lg">{summary?.totalGamePoints ?? 0}</span></div>
                  <div className="flex items-center justify-between text-white/85"><span>Games this month</span><span className="font-semibold">{summary?.monthCompletedCount ?? 0}</span></div>
                  <div className="flex items-center justify-between text-white/85"><span>Unique games</span><span className="font-semibold">{summary?.totalUniqueGames ?? 0}</span></div>
                  <div className="pt-1">
                    <div className="mb-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="text-[11px] text-white/60">Monthly completion: {progressPercent}%</div>
                  </div>
                  <div className="pt-2 border-t border-white/25">
                    <div className="text-xs uppercase tracking-[0.08em] text-white/70 mb-1">Badges</div>
                    <div className="flex flex-wrap gap-2 text-base">{(summary?.badges ?? []).length ? summary!.badges.map((b,i)=>(<span key={i}>{b}</span>)) : <span className="text-white/60 text-xs">No badges yet</span>}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

      {/* Categories */}
      {true && (
      <div className="mt-2 md:mt-3">
        <Tabs value={category} onValueChange={(v)=>setCategory(v as any)}>
          <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl border border-white/15 bg-[#f4efe80d]/80 p-2 backdrop-blur-md">
            <TabsTrigger value="all" className="rounded-full px-4 py-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md">All</TabsTrigger>
            {GAME_CATEGORIES.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="rounded-full px-4 py-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={category}>
            {/* Grid of game cards */}
            <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              {catalogLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-3xl border border-white/10 bg-[#0f1f29]/55 overflow-hidden backdrop-blur-xl animate-pulse">
                  <div className="h-40 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                  <div className="p-4 md:p-5 space-y-4">
                    <div className="h-5 w-2/3 rounded-full bg-white/10"></div>
                    <div className="h-4 w-full rounded-full bg-white/10"></div>
                    <div className="h-4 w-5/6 rounded-full bg-white/10"></div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-5 w-28 rounded-full bg-white/10"></div>
                      <div className="h-11 w-32 rounded-full bg-white/10"></div>
                    </div>
                  </div>
                </div>
              )) : filtered.map((g, index) => {
                const fx = hoverFx[g.id] ?? { x: 0, y: 0 };
                const imageShiftX = fx.x * 8;
                const imageShiftY = fx.y * 8;
                const glowX = 50 + fx.x * 8;
                const glowY = 50 + fx.y * 10;
                const detailChips = ['About', 'How To Play', 'Real-Life Effects', 'Read + Action', 'Learn Path'];

                return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`group rounded-3xl border border-white/15 bg-[#0f1f29]/65 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden backdrop-blur-xl hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_26px_65px_rgba(0,0,0,0.6)]`}
                  data-game-id={g.id}
                  ref={(el) => {
                    cardRefs.current[g.id] = el;
                  }}
                  onMouseMove={(event) => onCardMove(g.id, event)}
                  onMouseLeave={() => onCardLeave(g.id)}
                >
                  <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${CATEGORY_THEME[g.category]}`}>
                    <img
                      src={g.image || "/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg"}
                      alt={`${g.name} preview`}
                      className="h-full w-full object-cover opacity-70 transition-transform duration-300"
                      style={{ transform: `scale(1.08) translate(${imageShiftX}px, ${imageShiftY}px)` }}
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(180,245,227,0.22), transparent 45%)`,
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07161f]/80 via-[#07161f]/20 to-transparent"></div>
                    <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between gap-2">
                      <div className="text-xl md:text-2xl font-extrabold flex items-center gap-2 text-white/95 drop-shadow-md">{g.icon && <span>{g.icon}</span>}<span className="line-clamp-1">{g.name}</span></div>
                      <span className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/35 bg-white/15 backdrop-blur-sm font-semibold">{g.difficulty}</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-base text-white/85 leading-relaxed min-h-[64px]">{g.description}</p>
                    <div className="mt-4 text-base flex items-center justify-between gap-3">
                      <div className="text-white/90">Reward: <span className="font-extrabold text-emerald-200">+{g.points} pts</span></div>
                      <span className="text-xs rounded-full border border-white/25 bg-white/5 px-2.5 py-1 uppercase tracking-wider text-white/65">{g.category}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[11px] rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-emerald-100/90">Reward</span>
                      {detailChips.map((chip) => (
                        <span key={`${g.id}-${chip}`} className="text-[11px] rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-white/75">
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                    <Link href={`/games/play/${g.id}`}>
                      <Button
                        size="lg"
                        className="rounded-full px-8 bg-gradient-to-r from-emerald-400 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 text-[#062421] font-black shadow-xl shadow-emerald-900/35 transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98]"
                        onMouseEnter={onPlayHover}
                        onFocus={onPlayHover}
                        onClick={openGame}
                      >
                        ▶ Play Now
                      </Button>
                    </Link>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      )}
      </div>
    </div>
  );
}
