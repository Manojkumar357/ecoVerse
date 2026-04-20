export type GameDef = {
  id: string;
  name: string;
  category: 'recycling' | 'climate' | 'habits' | 'wildlife' | 'fun';
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  icon?: string;
  image?: string;
  externalUrl?: string;
};

export const GAME_CATEGORIES: Array<{ value: GameDef['category']; label: string }> = [
  { value: 'recycling', label: '♻️ Recycling' },
  { value: 'climate', label: '🌍 Climate' },
  { value: 'habits', label: '🏡 Habits' },
  { value: 'wildlife', label: '🌱 Plant & Wildlife' },
  { value: 'fun', label: '🎲 Fun' },
];

// Add future games using this shape:
// {
//   id: 'your-game-id',
//   name: 'Your Game Name',
//   category: 'fun',
//   description: 'Short game summary.',
//   difficulty: 'Easy',
//   points: 100,
//   icon: '🎮',
//   image: '/api/image/your-image.jpg', // optional but recommended
//   externalUrl: 'https://your-game-host.netlify.app/', // optional for external games
// }

export const GAMES: GameDef[] = [
  // SeaVerse - Main Ocean Protection Game
  { id: 'seaverse', name: 'SeaVerse: Ocean Guardian', category: 'wildlife', description: 'Protect and restore our oceans. Complete missions to save marine life, stop pollution, and learn about ocean conservation.', difficulty: 'Medium', points: 100, icon: '🌊', image: '/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg', externalUrl: '/embedded-games/index.html' },
  { id: 'eco-word-spell', name: 'Eco Word Spell', category: 'fun', description: 'Build environmental vocabulary by spelling eco-themed words in a fast, fun challenge.', difficulty: 'Easy', points: 75, icon: '🔤', image: '/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg', externalUrl: 'https://eco-word-spell.lovable.app/' },
  { id: 'sorting-stories-game', name: 'Sorting Stories', category: 'recycling', description: 'Sort choices in story-based scenarios to practice better waste and recycling decisions.', difficulty: 'Easy', points: 80, icon: '📚', image: '/api/image/360_F_628835191_EMMgdwXxjtd3yLBUguiz5UrxaxqByvUc.jpg', externalUrl: 'https://sorting-stories-game.lovable.app/' },
  { id: 'eco-arrow-harmony', name: 'Eco Arrow Harmony', category: 'climate', description: 'Follow eco-guided arrow flows to learn sustainable pathways in an interactive challenge.', difficulty: 'Medium', points: 85, icon: '🎯', image: '/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg', externalUrl: 'https://eco-arrow-harmony.lovable.app/' },
  { id: 'eco-balance-grid', name: 'Eco Balance Grid', category: 'habits', description: 'Balance environmental choices on a grid to build smart, sustainable daily habits.', difficulty: 'Medium', points: 90, icon: '🧩', image: '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg', externalUrl: 'https://eco-balance-grid.lovable.app/' },
  { id: 'badgas-hunter', name: 'Bad Gas Hunter', category: 'climate', description: 'Hunt down harmful emissions and boost cleaner air through fast action.', difficulty: 'Medium', points: 95, icon: '🛰️', image: '/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg', externalUrl: 'https://badgashunter.netlify.app/' },
  { id: 'eco-hit', name: 'Eco Hit', category: 'fun', description: 'Quick reflex eco challenge: hit the right sustainability targets and rack up points.', difficulty: 'Easy', points: 85, icon: '🎯', image: '/api/image/nature-319.jpg', externalUrl: 'https://eco-hit.netlify.app/' },
  { id: 'eco-shoot', name: 'Eco Shoot', category: 'wildlife', description: 'Action-packed shooter experience with an environmental mission focus.', difficulty: 'Hard', points: 120, icon: '🚀', image: '/api/image/b1573252592009209d45a186360dea8c.jpg', externalUrl: 'https://ecoshoot.netlify.app/' },
  { id: 'matching-pairs-date', name: 'Matching Pairs Date', category: 'fun', description: 'A fast memory and matching challenge with a playful date-night style twist.', difficulty: 'Easy', points: 75, icon: '💞', image: '/api/image/Bhpd8.jpg', externalUrl: 'https://matchingpairsdate.netlify.app/' },
  { id: 'tsunami-expedition', name: 'Tsunami Expedition', category: 'climate', description: 'Explore wave and disaster awareness through a challenge built around environmental resilience.', difficulty: 'Medium', points: 95, icon: '🌊', image: '/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg', externalUrl: 'https://tsunamiexp.netlify.app/' },
  { id: 'mineral-expedition', name: 'Mineral Expedition', category: 'wildlife', description: 'Discover mineral-themed exploration in a guided adventure focused on terrain and earth science.', difficulty: 'Medium', points: 90, icon: '⛏️', image: '/api/image/pngtree-cb-background-hd-2022-download-picsart-and-snapseed-photo-editing-picture-image_15546523.jpg', externalUrl: 'https://mineralexp.netlify.app/' },
  { id: 'environment-word-explorer', name: 'Environment Word Explorer', category: 'fun', description: 'Explore and master environmental words in a fun, educational game session.', difficulty: 'Easy', points: 80, icon: '📖', image: '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg', externalUrl: 'https://evironmentwordexplorer.netlify.app/' },
  { id: 'acquamind', name: 'AcquaMind', category: 'habits', description: 'Interactive water-awareness challenge focused on smarter use, conservation habits, and environmental impact.', difficulty: 'Medium', points: 95, icon: '💧', image: '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg', externalUrl: 'https://acquamind.netlify.app/' },
];

const ALLOWED_CATEGORIES = new Set<GameDef['category']>(['recycling', 'climate', 'habits', 'wildlife', 'fun']);

export function normalizeGameRecord(raw: any): GameDef | null {
  const id = String(raw?.id || '').trim();
  const name = String(raw?.name || '').trim();
  if (!id || !name) return null;
  const category = ALLOWED_CATEGORIES.has(raw?.category) ? raw.category : 'fun';
  const difficulty = raw?.difficulty === 'Easy' || raw?.difficulty === 'Medium' || raw?.difficulty === 'Hard' ? raw.difficulty : 'Easy';
  const points = Math.max(1, Math.floor(Number(raw?.points) || 1));
  return {
    id,
    name,
    category,
    description: String(raw?.description || '').trim(),
    difficulty,
    points,
    icon: raw?.icon ? String(raw.icon).trim() : undefined,
    image: raw?.image ? String(raw.image).trim() : undefined,
    externalUrl: raw?.externalUrl ? String(raw.externalUrl).trim() : undefined,
  };
}

function normalizeNameKey(name: string) {
  return String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').trim();
}

function richnessScore(game: GameDef, isCanonical: boolean) {
  let score = 0;
  if (isCanonical) score += 1000;
  if (game.image) score += 40;
  if (game.icon) score += 20;
  if (game.externalUrl) score += 20;
  if (game.description) score += Math.min(50, Math.floor(game.description.length / 4));
  if (game.points > 0) score += 5;
  return score;
}

export function mergeGamesCatalog(extraGames: any[] = []) {
  const byId = new Map<string, GameDef>();
  const byName = new Map<string, GameDef>();
  const canonicalIds = new Set(GAMES.map((g) => g.id));

  const upsert = (game: GameDef) => {
    byId.set(game.id, game);
    const nameKey = normalizeNameKey(game.name);
    if (!nameKey) return;

    const existing = byName.get(nameKey);
    if (!existing) {
      byName.set(nameKey, game);
      return;
    }

    const existingScore = richnessScore(existing, canonicalIds.has(existing.id));
    const incomingScore = richnessScore(game, canonicalIds.has(game.id));
    if (incomingScore > existingScore) {
      byName.set(nameKey, game);
    }
  };

  GAMES.forEach(upsert);
  extraGames.forEach((raw) => {
    const normalized = normalizeGameRecord(raw);
    if (normalized) upsert(normalized);
  });

  const selectedIds = new Set(Array.from(byName.values()).map((g) => g.id));
  const ordered = Array.from(byId.values()).filter((g) => selectedIds.has(g.id));
  return ordered;
}

export function getGameById(id: string, extraGames: any[] = []) {
  return mergeGamesCatalog(extraGames).find(g => g.id === id);
}

export type GameType = 'builtin' | 'external';

export function getGameType(id: string, extraGames: any[] = []): GameType {
  const game = getGameById(id, extraGames);
  return game?.externalUrl ? 'external' : 'builtin';
}
