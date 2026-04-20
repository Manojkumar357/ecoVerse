import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, Settings, Users, CheckCircle, AlertCircle, Zap, Plus, Trash2, 
  Edit3, Eye, Shield, BarChart3, Gamepad2, BookOpen, Video, Globe, 
  Megaphone, Clipboard, Youtube, Upload, RefreshCw, X
} from "lucide-react";
function AdminGamesManager() {
  const { username } = useAuth();
  const { toast } = useToast();
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const [list, setList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<{ name: string; category: 'recycling' | 'climate' | 'habits' | 'wildlife' | 'fun'; description: string; difficulty: 'Easy' | 'Medium' | 'Hard'; points: number; icon: string; externalUrl: string; image: string }>({
    name: '',
    category: 'recycling',
    description: '',
    difficulty: 'Easy',
    points: 10,
    icon: '',
    externalUrl: '',
    image: '',
  });

  const load = async () => {
    const data = await fetch('/api/admin/games', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ name: '', category: 'recycling', description: '', difficulty: 'Easy', points: 10, icon: '', externalUrl: '', image: '' });
    setIsModalOpen(false);
  };

  const startEdit = (g: any) => {
    setEditingId(g.id);
    setForm({
      name: g.name || '',
      category: (g.category || 'recycling') as any,
      description: g.description || '',
      difficulty: (g.difficulty || 'Easy') as any,
      points: Number(g.points || 10),
      icon: g.icon || '',
      externalUrl: g.externalUrl || '',
      image: g.image || '',
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', category: 'recycling', description: '', difficulty: 'Easy', points: 10, icon: '', externalUrl: '', image: '' });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    // Always reveal modal content after opening from any scroll position.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = window.setTimeout(() => {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      titleInputRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(t);
  }, [isModalOpen, editingId]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Game name required', description: 'Please enter a title for the game.', variant: 'destructive' });
      return;
    }
    if (!form.externalUrl.trim()) {
      toast({ title: 'Game link required', description: 'Please add the game URL to continue.', variant: 'destructive' });
      return;
    }
    try {
      new URL(form.externalUrl.trim(), window.location.origin);
    } catch {
      toast({ title: 'Invalid game link', description: 'Enter a valid external URL.', variant: 'destructive' });
      return;
    }
    if (form.image.trim()) {
      try {
        new URL(form.image.trim(), window.location.origin);
      } catch {
        toast({ title: 'Invalid photo URL', description: 'Enter a valid image URL or keep it empty.', variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      difficulty: form.difficulty,
      points: form.points,
      icon: form.icon.trim(),
      externalUrl: form.externalUrl.trim(),
      image: form.image.trim(),
    };

    const res = await fetch(editingId ? `/api/admin/games/${encodeURIComponent(editingId)}` : '/api/admin/games', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: editingId ? 'Failed to update game' : 'Failed to create game', description: e?.error || 'Please try again.', variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    toast({ title: editingId ? 'Game updated' : 'Game created', description: `${form.name} is now visible in the public games section.` });
    reset();
    await load();
    setIsSaving(false);
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setRemovingId(id);
    const res = await fetch(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: 'Failed to delete game', description: e?.error || 'Please try again.', variant: 'destructive' });
      setRemovingId(null);
      return;
    }
    if (editingId === id) reset();
    toast({ title: 'Game deleted', description: `${name} was removed from the catalog.` });
    await load();
    setRemovingId(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Games & Challenges</h2>
          <p className="text-sm text-earth-muted mt-1">Add playable games with categories, rewards, and optional external links.</p>
        </div>
        <Button className="bg-earth-orange hover:bg-earth-orange-hover gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create Game
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--earth-card)] border border-[var(--earth-border)] mb-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-earth-muted">Use the form to add a link-based or built-in game, then it will appear in the public games section for everyone.</p>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-earth-muted">
            {list.length} game{list.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-earth-muted">No games yet.</p>}
        {list.map(g => (
          <div key={g.id} className="p-4 rounded-2xl bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-base">{g.icon ? `${g.icon} ` : ''}{g.name}</div>
                  <span className="text-[11px] rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-earth-muted">{String(g.category).toUpperCase()}</span>
                  <span className="text-[11px] rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{g.points} pts</span>
                  {g.externalUrl && <span className="text-[11px] rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">Linked game</span>}
                </div>
                <div className="text-xs text-earth-muted mt-1">{g.difficulty || 'Easy'}</div>
                {g.description && <div className="text-sm text-earth-muted mt-2 whitespace-pre-wrap">{g.description}</div>}
                {g.externalUrl && <div className="text-xs text-cyan-300 mt-2 break-all">URL: {g.externalUrl}</div>}
                {g.image && <div className="text-xs text-emerald-300 mt-1 break-all">Photo: {g.image}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  title="Edit game"
                  aria-label="Edit game"
                  onClick={() => startEdit(g)}
                  className="h-9 w-9 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/35 hover:text-emerald-100 hover:scale-105 active:scale-95"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete game"
                  aria-label="Delete game"
                  onClick={() => del(g.id, g.name)}
                  disabled={removingId === g.id}
                  className="h-9 w-9 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center transition-all duration-200 hover:bg-red-500/35 hover:text-red-100 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 className={`h-4 w-4 ${removingId === g.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-[9999] p-4 pt-10 overflow-y-auto">
          <div className="fixed inset-0 bg-transparent" onClick={reset}></div>
          <div ref={modalBodyRef} className="bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-xl p-6 max-w-2xl w-full max-h-[calc(100vh-5rem)] overflow-y-auto shadow-2xl relative z-[10000]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white/90">{editingId ? 'Edit Game' : 'Add New Game'}</h3>
              <Button
                variant="secondary"
                onClick={reset}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                x
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm mb-2">Title *</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Eco Word Spell"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Build environmental vocabulary by spelling eco-themed words in a fast, fun challenge."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/90 text-sm mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                  >
                    <option value="recycling" className="bg-gray-800 text-white">♻️ Recycling</option>
                    <option value="climate" className="bg-gray-800 text-white">🌍 Climate</option>
                    <option value="habits" className="bg-gray-800 text-white">🏡 Habits</option>
                    <option value="wildlife" className="bg-gray-800 text-white">🌱 Plant & Wildlife</option>
                    <option value="fun" className="bg-gray-800 text-white">🎲 Fun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                  >
                    <option value="Easy" className="bg-gray-800 text-white">Easy</option>
                    <option value="Medium" className="bg-gray-800 text-white">Medium</option>
                    <option value="Hard" className="bg-gray-800 text-white">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">Points</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/90 text-sm mb-2">Icon / Emoji</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="🔤"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">External Game URL *</label>
                  <input
                    type="url"
                    value={form.externalUrl}
                    onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="https://your-game-host.netlify.app/"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">Photo URL (optional)</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="https://images.example.com/game-cover.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-1">
                <Button
                  onClick={submit}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : (editingId ? 'Save Game' : 'Create Game')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={reset}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}

function AdminLearnManager() {
  const { username, clear } = useAuth();
  const { toast } = useToast();
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  
  // Baseline modules (from Learn curriculum)
  const baselineModules = [
    { id: "environmental-health", title: "Environmental Health Theory", description: "Core concepts, WHO definitions, and major health risks in the environment" },
    { id: "ecosystem-theory", title: "Ecosystem Theory", description: "Nature background, classification, threats, scientific depth, and interactive quiz" },
    { id: "energy-resources", title: "Renewable vs Nonrenewable", description: "Interactive learning journey on energy resources, trade-offs, and sustainable choices" },
    { id: "ocean", title: "Save the Ocean", description: "Ocean conservation, coral ecosystems and marine sustainability" },
    { id: "climate", title: "Climate Change", description: "Global warming, mitigation and adaptation" },
    { id: "water", title: "Water Conservation", description: "Water scarcity and sustainable management" },
    { id: "forest", title: "Save the Forests", description: "Deforestation and biodiversity protection" },
    { id: "biosphere", title: "BioSphere", description: "Biodiversity fundamentals, threats, and protection pathways" },
    { id: "pollution-silent-killer", title: "Pollution: The Silent Killer", description: "Interactive pollution science, timeline of neglect, and restoration pathways" },
    { id: "ecolearn-environmental-education", title: "EcoLearn: Environmental Education", description: "Interdisciplinary foundations, global frameworks, and future pathways in environmental education" },
    { id: "earthpulse-environment-human", title: "EarthPulse: Environment and Humanity", description: "Population growth, climate pressure, and pathways toward planetary balance" },
    { id: "wildlife", title: "Protect Wildlife", description: "Endangered species and habitat conservation" },
    { id: "renewable", title: "Renewable Energy", description: "Clean energy technologies and transition" },
    { id: "pollution", title: "Stop Pollution", description: "Air, water and soil pollution solutions" },
    { id: "agriculture", title: "Sustainable Agriculture", description: "Eco-friendly farming practices" },
    { id: "eco-literacy", title: "Environmental Literacy", description: "Eco vocabulary, interpretation, and communication skills" },
    { id: "earth-resilience", title: "Earth Science and Resilience", description: "Natural hazards, mineral resources, and community preparedness" },
  ];

  const [list, setList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: string; title: string; description: string; lessons: Array<{ id: string; title: string; duration: string; points: number; content: string }> }>({
    id: '',
    title: '',
    description: '',
    lessons: [{ id: '1', title: '', duration: '10 minutes', points: 10, content: '' }],
  });

  const load = async () => {
    const res = await fetch('/api/admin/learning/modules', { headers: { 'X-Username': username || '' } });
    if (res.status === 401) {
      toast({ title: 'Session expired', description: 'Please sign in again to manage Learn modules.', variant: 'destructive' });
      clear();
      return;
    }
    const managedData = await res.json().catch(() => [] as any[]);
    const managedModules = Array.isArray(managedData) ? managedData.filter((item) => !item?.deleted) : [];
    
    // Merge baseline modules with managed overrides
    const managedMap = new Map(managedModules.map((m: any) => [m.id, m]));
    const merged = baselineModules.map((base) => managedMap.get(base.id) || { ...base, lessons: [] });
    
    // Add any custom modules not in baseline
    managedModules.forEach((managed: any) => {
      if (!baselineModules.find((b) => b.id === managed.id)) {
        merged.push(managed);
      }
    });
    
    setList(merged.sort((a, b) => a.title.localeCompare(b.title)));
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ id: '', title: '', description: '', lessons: [{ id: '1', title: '', duration: '10 minutes', points: 10, content: '' }] });
    setIsModalOpen(false);
  };

  const openCreate = () => {
    reset();
    setIsModalOpen(true);
  };

  const startEdit = (module: any) => {
    setEditingId(module.id);
    setForm({
      id: module.id || '',
      title: module.title || '',
      description: module.description || '',
      lessons: Array.isArray(module.lessons) && module.lessons.length ? module.lessons.map((lesson: any, index: number) => ({
        id: lesson.id || String(index + 1),
        title: lesson.title || '',
        duration: lesson.duration || '10 minutes',
        points: Number(lesson.points || 10),
        content: lesson.content || '',
      })) : [{ id: '1', title: '', duration: '10 minutes', points: 10, content: '' }],
    });
    setIsModalOpen(true);
  };

  const addLesson = () => {
    setForm((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { id: String(prev.lessons.length + 1), title: '', duration: '10 minutes', points: 10, content: '' }],
    }));
  };

  const removeLesson = (index: number) => {
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons.length > 1 ? prev.lessons.filter((_, i) => i !== index) : prev.lessons,
    }));
  };

  const submit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Module title required', description: 'Please enter a module title.', variant: 'destructive' });
      return;
    }
    const lessons = form.lessons
      .map((lesson) => ({
        id: lesson.id.trim(),
        title: lesson.title.trim(),
        duration: lesson.duration.trim() || '10 minutes',
        points: Math.max(1, Math.min(500, Number(lesson.points) || 1)),
        content: lesson.content.trim(),
      }))
      .filter((lesson) => lesson.title);

    if (!lessons.length) {
      toast({ title: 'Lesson required', description: 'Add at least one lesson title.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const res = await fetch(editingId ? `/api/admin/learning/modules/${encodeURIComponent(editingId)}` : '/api/admin/learning/modules', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
      body: JSON.stringify({
        id: form.id.trim() || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        lessons,
      }),
    });

    if (res.status === 401) {
      toast({ title: 'Session expired', description: 'Please sign in again and retry.', variant: 'destructive' });
      setIsSaving(false);
      clear();
      return;
    }

    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: editingId ? 'Failed to update module' : 'Failed to create module', description: e?.error || 'Please try again.', variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    toast({ title: editingId ? 'Module updated' : 'Module created', description: `${form.title} is now available in the Learn section.` });
    reset();
    await load();
    setIsSaving(false);
  };

  const del = async (id: string, title: string) => {
    if (!confirm(`Delete ${title}? This removes the module from Learn.`)) return;
    setRemovingId(id);
    const res = await fetch(`/api/admin/learning/modules/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });

    if (res.status === 401) {
      toast({ title: 'Session expired', description: 'Please sign in again and retry.', variant: 'destructive' });
      setRemovingId(null);
      clear();
      return;
    }

    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: 'Failed to delete module', description: e?.error || 'Please try again.', variant: 'destructive' });
      setRemovingId(null);
      return;
    }
    if (editingId === id) reset();
    toast({ title: 'Module deleted', description: `${title} was removed from Learn.` });
    await load();
    setRemovingId(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Learn Modules & Lessons</h2>
          <p className="text-sm text-earth-muted mt-1">Edit or customize modules and lessons for the Learn section. All 17 core modules are available to edit.</p>
        </div>
        <Button className="bg-earth-orange hover:bg-earth-orange-hover gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create Module
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--earth-card)] border border-[var(--earth-border)] mb-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-earth-muted">You can edit any of the 17 core environmental modules or create new custom modules.</p>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-earth-muted">
            {list.length} module{list.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-earth-muted">Loading modules...</p>}
        {list.map(module => (
          <div key={module.id} className="p-4 rounded-2xl bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-base">{module.title}</div>
                  <span className="text-[11px] rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-earth-muted">{module.lessons?.length || 0} lessons</span>
                </div>
                {module.description && <div className="text-sm text-earth-muted mt-2 whitespace-pre-wrap">{module.description}</div>}
                <div className="space-y-2 mt-3">
                  {(module.lessons || []).map((lesson: any, index: number) => (
                    <div key={`${module.id}-${lesson.id || index}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-earth-muted">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-white">{lesson.title}</span>
                        <span>{lesson.duration || '10 minutes'} · {lesson.points || 0} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  title="Edit module"
                  aria-label="Edit module"
                  onClick={() => startEdit(module)}
                  className="h-9 w-9 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/35 hover:text-emerald-100 hover:scale-105 active:scale-95"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete module"
                  aria-label="Delete module"
                  onClick={() => del(module.id, module.title)}
                  disabled={removingId === module.id}
                  className="h-9 w-9 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center transition-all duration-200 hover:bg-red-500/35 hover:text-red-100 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 className={`h-4 w-4 ${removingId === module.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-[9999] p-4 pt-10 overflow-y-auto">
          <div className="fixed inset-0 bg-transparent" onClick={reset}></div>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-xl p-6 max-w-3xl w-full max-h-[calc(100vh-5rem)] overflow-y-auto shadow-2xl relative z-[10000]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white/90">{editingId ? 'Edit Module' : 'Add New Module'}</h3>
              <Button variant="secondary" onClick={reset} className="bg-white/20 hover:bg-white/30 text-white border-white/30">x</Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm mb-2">Module ID</label>
                <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="climate" />
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Climate Change" />
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Short module description" rows={3} />
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="font-semibold text-white">Lessons</h4>
                <Button onClick={addLesson} variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-white/20">
                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                </Button>
              </div>

              <div className="space-y-3">
                {form.lessons.map((lesson, index) => (
                  <div key={`${index}-${lesson.id}`} className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-white">Lesson {index + 1}</div>
                      {form.lessons.length > 1 && (
                        <button type="button" onClick={() => removeLesson(index)} className="text-red-300 hover:text-red-200" title="Remove lesson">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/80 text-xs mb-1">Lesson ID</label>
                        <input value={lesson.id} onChange={(e) => setForm({ ...form, lessons: form.lessons.map((item, i) => i === index ? { ...item, id: e.target.value } : item) })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white" placeholder="1" />
                      </div>
                      <div>
                        <label className="block text-white/80 text-xs mb-1">Title</label>
                        <input value={lesson.title} onChange={(e) => setForm({ ...form, lessons: form.lessons.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white" placeholder="Lesson title" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/80 text-xs mb-1">Duration</label>
                        <input value={lesson.duration} onChange={(e) => setForm({ ...form, lessons: form.lessons.map((item, i) => i === index ? { ...item, duration: e.target.value } : item) })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white" placeholder="10 minutes" />
                      </div>
                      <div>
                        <label className="block text-white/80 text-xs mb-1">Points</label>
                        <input type="number" min={1} max={500} value={lesson.points} onChange={(e) => setForm({ ...form, lessons: form.lessons.map((item, i) => i === index ? { ...item, points: Math.max(1, Math.min(500, Number(e.target.value) || 1)) } : item) })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-xs mb-1">Content</label>
                      <textarea value={lesson.content} onChange={(e) => setForm({ ...form, lessons: form.lessons.map((item, i) => i === index ? { ...item, content: e.target.value } : item) })} className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white" rows={4} placeholder="Lesson content (HTML allowed)" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-1">
                <Button onClick={submit} disabled={isSaving} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex items-center gap-2">
                  {isSaving ? 'Saving...' : (editingId ? 'Save Module' : 'Create Module')}
                </Button>
                <Button variant="secondary" onClick={reset} className="bg-white/20 hover:bg-white/30 text-white border-white/30">Cancel</Button>
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}
export default function AdminPortal() {
  const { role, clear } = useAuth();
  const isAdmin = role === 'admin';
  const canManageGames = role === 'admin' || role === 'teacher';
  const [pending, setPending] = useState<{ students: any[]; teachers: any[] }>({ students: [], teachers: [] });
  const [users, setUsers] = useState<Array<{ username: string; role: string }>>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [resetting, setResetting] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [tab, setTab] = useState(0);

  const tabNames = [
    { name: 'Approval List', icon: CheckCircle },
    { name: 'Admin Accounts', icon: Shield },
    { name: 'All Accounts', icon: Users },
    { name: 'Challenges & Games', icon: Gamepad2 },
    { name: 'Quizzes', icon: BookOpen },
    { name: 'Videos', icon: Video },
    { name: 'Schools', icon: Globe },
    { name: 'Announcements', icon: Megaphone },
    { name: 'Assignments', icon: Clipboard },
    { name: 'Learn', icon: BookOpen },
  ];
  const visibleTabIndexes = isAdmin ? tabNames.map((_, i) => i) : [3, 9];

  const load = async () => {
    const data = await fetch('/api/admin/pending').then(r => r.json());
    setPending(data);
  };

  const loadUsers = async () => {
    try {
      const data = await fetch('/api/admin/users').then(r => r.json());
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  const loadSchools = async () => {
    try {
      const data = await fetch('/api/schools').then(r => r.json());
      setSchools(Array.isArray(data) ? data : []);
    } catch {
      setSchools([]);
    }
  };

  const getSchoolName = (schoolId?: string) => {
    const raw = String(schoolId || '').trim();
    if (!raw) return '-';
    const match = schools.find((school) => school.id === raw);
    return match?.name || raw;
  };

  useEffect(() => {
    if (isAdmin) {
      load();
      loadUsers();
      loadSchools();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && canManageGames) setTab(3);
  }, [isAdmin, canManageGames]);

  const approve = async (type: 'student' | 'teacher', id: string) => {
    await fetch(`/api/admin/approve/${type}/${id}`, { method: 'POST' });
    await load();
    await loadUsers();
  };

  const approveAll = async () => {
    if (!confirm('Approve all pending applications?')) return;
    await fetch('/api/admin/approve-all', { method: 'POST' });
    await load();
    await loadUsers();
  };

  const resetPassword = async (username: string, password?: string) => {
    const pwd = password ?? prompt(`Set new password for @${username}`, '') ?? '';
    const finalPwd = pwd.trim();
    if (!finalPwd) return;
    setResetting(username);
    await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: finalPwd }) });
    setResetting(null);
  };

  const unapprove = async (username: string) => {
    if (!confirm(`Move @${username} back to pending?`)) return;
    try {
      const res = await fetch('/api/admin/unapprove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        return;
      }
      const json = await res.json().catch(() => ({} as any));
      if (!json?.ok) {
        alert('Failed to move to pending');
        return;
      }
      await load();
      await loadUsers();
      alert(`@${username} moved to pending.`);
    } catch (e) {
      alert('Network error while moving to pending');
    }
  };

  const openDetails = async (username: string) => {
    setLoadingDetails(true);
    try {
      const d = await fetch(`/api/admin/user/${encodeURIComponent(username)}`).then(r => r.json());
      setSelectedUser(d);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!canManageGames) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/70 mb-6">You don't have permission to access the admin portal.</p>
          <Button onClick={clear} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-400/30">
                  <Shield className="w-6 h-6 text-emerald-300" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{isAdmin ? 'Admin Portal' : 'Games Management'}</h1>
              </div>
              <p className="text-white/60 ml-15">{isAdmin ? 'Manage users, content, and system settings' : 'Create, edit, and delete games catalog entries'}</p>
            </div>
            <Button 
              onClick={clear}
              className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 text-red-300 hover:text-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 pl-14">
          <div className="flex flex-wrap gap-2 pb-2">
            {tabNames.map((tab_item, i) => {
              if (!visibleTabIndexes.includes(i)) return null;
              const Icon = tab_item.icon;
              return (
                <button
                  key={tab_item.name}
                  onClick={() => setTab(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    tab === i
                      ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-400/50 text-white"
                      : "bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab_item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
          {/* Approval List Tab */}
          {tab === 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Application Approvals</h2>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  {pending.students.length + pending.teachers.length} Pending
                </Badge>
              </div>
              
              <Button 
                onClick={approveAll}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve All Pending
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Students Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Pending Students
                    <Badge className="bg-blue-500/20 text-blue-300">{pending.students.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {pending.students.length === 0 ? (
                      <p className="text-white/50 text-center py-3">No pending students</p>
                    ) : (
                      pending.students.map((s) => (
                        <div key={s.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-white">{s.name}</p>
                              <p className="text-sm text-white/60">@{s.username}</p>
                              <p className="text-xs text-white/40 mt-1">{s.email}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Student</Badge>
                          </div>
                          <div className="text-xs text-white/40 mb-3 space-y-1">
                            <p>ID: {s.studentId} | Roll: {s.rollNumber || '-'} | Class: {s.className || '-'}</p>
                            <p>School: {getSchoolName(s.schoolId)}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => approve('student', s.id)}
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Teachers Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Pending Teachers
                    <Badge className="bg-orange-500/20 text-orange-300">{pending.teachers.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {pending.teachers.length === 0 ? (
                      <p className="text-white/50 text-center py-3">No pending teachers</p>
                    ) : (
                      pending.teachers.map((t) => (
                        <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm">{t.name}</p>
                              <p className="text-xs text-white/60">@{t.username}</p>
                              <p className="text-xs text-white/40 mt-0.5">{t.email}</p>
                            </div>
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Teacher</Badge>
                          </div>
                          <div className="text-xs text-white/40 mb-2 space-y-0.5">
                            <p>Teacher ID: {t.teacherId} | Subject: {t.subject || '-'}</p>
                            <p>School: {getSchoolName(t.schoolId)}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => approve('teacher', t.id)}
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manage All Accounts Tab */}
          {tab === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">All Accounts</h2>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  {users.length} Total
                </Badge>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">No users found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {users.map(u => (
                    <div key={u.username} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <p className="font-semibold text-white">@{u.username}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={`${
                              u.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                              u.role === 'teacher' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                              'bg-blue-500/20 text-blue-300 border-blue-400/30'
                            }`}>
                              {u.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Button 
                            size="sm"
                            onClick={() => openDetails(u.username)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => navigator.clipboard?.writeText(u.username)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                          >
                            Copy
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => resetPassword(u.username)}
                            disabled={resetting === u.username}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                          >
                            {resetting === u.username ? 'SavingGǪ' : 'Reset Password'}
                          </Button>
                          {u.role !== 'admin' && (
                            <Button 
                              size="sm"
                              onClick={() => unapprove(u.username)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                            >
                              To Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
              <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 border border-white/20 rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">@{selectedUser.username || selectedUser.name || 'User'}</h3>
                  <Button variant="ghost" onClick={() => setSelectedUser(null)} className="text-white/60 hover:text-white">x</Button>
                </div>
                
                {loadingDetails ? (
                  <p className="text-white/50">LoadingGǪ</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {selectedUser.photoDataUrl && (
                      <img src={selectedUser.photoDataUrl} alt="Profile" className="h-24 w-24 object-cover rounded-full border-2 border-white/20 mb-4" />
                    )}
                    <p><span className="text-white/60">Status:</span> <Badge className="ml-2 bg-emerald-500/20 text-emerald-300">{selectedUser.status}</Badge></p>
                    {selectedUser.name && <p><span className="text-white/60">Name:</span> <span className="text-white ml-2">{selectedUser.name}</span></p>}
                    {selectedUser.email && <p><span className="text-white/60">Email:</span> <span className="text-white ml-2">{selectedUser.email}</span></p>}
                    {selectedUser.role && <p><span className="text-white/60">Role:</span> <span className="text-white ml-2">{selectedUser.role}</span></p>}
                    {selectedUser.studentId && <p><span className="text-white/60">Student ID:</span> <span className="text-white ml-2">{selectedUser.studentId}</span></p>}
                    {selectedUser.teacherId && <p><span className="text-white/60">Teacher ID:</span> <span className="text-white ml-2">{selectedUser.teacherId}</span></p>}
                    {selectedUser.schoolId && <p><span className="text-white/60">School:</span> <span className="text-white ml-2">{getSchoolName(selectedUser.schoolId)}</span></p>}
                    {selectedUser.subject && <p><span className="text-white/60">Subject:</span> <span className="text-white ml-2">{selectedUser.subject}</span></p>}
                    {selectedUser.rollNumber && <p><span className="text-white/60">Roll No:</span> <span className="text-white ml-2">{selectedUser.rollNumber}</span></p>}
                    {selectedUser.className && <p><span className="text-white/60">Class:</span> <span className="text-white ml-2">{selectedUser.className}</span></p>}
                    {selectedUser.section && <p><span className="text-white/60">Section:</span> <span className="text-white ml-2">{selectedUser.section}</span></p>}
                  </div>
                )}
                
                <Button onClick={() => setSelectedUser(null)} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Manager Tabs */}
          {tab === 1 && <AdminAccounts />}
          {tab === 3 && <AdminGamesManager />}
          {tab === 4 && <AdminQuizManager />}
          {tab === 5 && <AdminVideosManager />}
          {tab === 6 && <SchoolsManager />}
          {tab === 7 && <GlobalAnnouncements />}
          {tab === 8 && <GlobalAssignments />}
          {tab === 9 && <AdminLearnManager />}
        </div>
      </div>
    </div>
  );
}

function SchoolsManager() {
  const [schools, setSchools] = useState<Array<{ name: string; total: number; students: number; teachers: number; pending: number; approved: number }>>([]);
  const [loading, setLoading] = useState(false);
  
  // Check if value is a UUID format
  const isUUID = (str: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
  
  const load = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/pending'),
        fetch('/api/admin/users'),
        fetch('/api/schools'),
      ]);
      const pending = await pendingRes.json().catch(() => ({ students: [], teachers: [] } as any));
      const users = await usersRes.json().catch(() => [] as any[]);
      const schoolsList = await schoolsRes.json().catch(() => [] as any[]);

      // Build UUID -> name map from schools table
      const uuidToName = new Map<string, string>();
      (Array.isArray(schoolsList) ? schoolsList : []).forEach((school: any) => {
        if (school.id && school.name) {
          uuidToName.set(school.id.toLowerCase(), school.name);
        }
      });

      const buckets = new Map<string, { name: string; total: number; students: number; teachers: number; pending: number; approved: number }>();
      const upsert = (rawName: string, kind: 'student' | 'teacher', status: 'pending' | 'approved') => {
        let name = String(rawName || '').trim();
        if (!name) return;
        
        // If it's a UUID, try to look up the actual school name
        if (isUUID(name)) {
          name = uuidToName.get(name.toLowerCase()) || name;
        }
        
        const key = name.toLowerCase();
        const current = buckets.get(key) || { name, total: 0, students: 0, teachers: 0, pending: 0, approved: 0 };
        current.total += 1;
        current[`${kind}s`] += 1;
        current[status] += 1;
        if (!current.name) current.name = name;
        buckets.set(key, current);
      };

      (pending.students || []).forEach((item: any) => upsert(item.schoolId, 'student', 'pending'));
      (pending.teachers || []).forEach((item: any) => upsert(item.schoolId, 'teacher', 'pending'));

      const details = await Promise.all(
        (Array.isArray(users) ? users : []).map(async (user: any) => {
          try {
            const detailsResponse = await fetch(`/api/admin/user/${encodeURIComponent(user.username)}`);
            return await detailsResponse.json();
          } catch {
            return null;
          }
        })
      );

      details.forEach((item: any) => {
        if (!item?.schoolId) return;
        const role = item.role === 'teacher' ? 'teacher' : 'student';
        upsert(item.schoolId, role, 'approved');
      });

      setSchools(Array.from(buckets.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xl font-semibold">Schools & Colleges from Signups</h2>
        <button onClick={load} disabled={loading} title="Refresh schools list" className="h-9 w-9 rounded-full border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20 hover:border-emerald-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <p className="text-sm text-earth-muted mb-4">This list is built from the school/college values entered by students and teachers during signup.</p>
      <div className="space-y-2">
        {schools.length === 0 && <p className="text-earth-muted">No schools or colleges have been entered yet.</p>}
        {schools.map(s => (
          <div key={s.name} className="p-3 rounded-xl bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-earth-muted mt-1">{s.total} signup(s) • {s.students} student(s) • {s.teachers} teacher(s)</div>
              </div>
              <div className="text-xs text-earth-muted text-right">
                <div>{s.approved} approved</div>
                <div>{s.pending} pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAccounts() {
  const { username } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Array<{ username: string; name?: string; email?: string }>>([]);
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ username: string; name?: string; email?: string }>({ username: '' });

  const load = async () => {
    const data = await fetch('/api/admin/admins').then(r => r.json());
    setAdmins(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.username.trim() || !form.password.trim()) return alert('Username and password required');
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: 'Failed to create admin', description: e?.error || 'Could not create admin account.', variant: 'destructive' });
      return alert(e?.error || 'Failed to create admin');
    }
    setForm({ username: '', password: '', name: '', email: '' });
    toast({ title: 'Admin created', description: `@${form.username} was added successfully.` });
    await load();
  };

  const startEdit = (a: { username: string; name?: string; email?: string }) => {
    setEditing(a.username);
    setEditData({ username: a.username, name: a.name, email: a.email });
  };
  const saveEdit = async () => {
    if (!editing) return;
    if (!confirm(`Apply these changes to @${editing}?`)) return;
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(editing)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ username: editData.username, name: editData.name, email: editData.email }) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: 'Failed to update admin', description: e?.error || 'Could not save admin changes.', variant: 'destructive' });
      return alert(e?.error || 'Failed to update admin');
    }
    setEditing(null);
    toast({ title: 'Admin updated', description: `@${editData.username || editing} was updated successfully.` });
    await load();
  };
  const del = async (username: string) => {
    if (!confirm(`Delete admin @${username}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(username)}`, { method: 'DELETE' });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast({ title: 'Failed to delete admin', description: e?.error || 'Could not delete admin account.', variant: 'destructive' });
      return alert(e?.error || 'Failed to delete admin');
    }
    toast({ title: 'Admin deleted', description: `@${username} was removed.` });
    await load();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Manage Admin Accounts</h2>
          <p className="text-sm text-earth-muted mt-1">Create backup admins and manage their access from one place.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-earth-muted">
          {admins.length} admin{admins.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--earth-card)] border border-[var(--earth-border)] mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-earth-muted mb-1">Username</div>
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-earth-muted mb-1">Password</div>
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-earth-muted mb-1">Name</div>
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Name (optional)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-earth-muted mb-1">Email</div>
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-earth-muted">Main admin @admin123 can only edit its own profile name/email and cannot be deleted. Username cannot be changed.</p>
          <Button className="bg-earth-orange hover:bg-earth-orange-hover gap-2" onClick={create}>
            <Plus className="h-4 w-4" />
            Create Admin
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {admins.map(a => (
          <div key={a.username} className={`p-4 rounded-2xl border shadow-sm transition-all duration-200 ${a.username === 'admin123' ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-400/30' : 'bg-[var(--earth-card)] border-[var(--earth-border)] hover:-translate-y-0.5 hover:shadow-md'}`}>
            {editing === a.username ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <div className="text-xs text-earth-muted mb-1">Username</div>
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white/90" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} disabled={a.username === 'admin123'} />
                </div>
                <div>
                  <div className="text-xs text-earth-muted mb-1">Name</div>
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white/90" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-earth-muted mb-1">Email</div>
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white/90" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end md:justify-start">
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(null)}
                    className="h-10 w-10 rounded-full p-0 border border-white/10 bg-white/10 hover:bg-white/20 text-white"
                    title="Cancel"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    className="h-10 w-10 rounded-full p-0 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                    onClick={saveEdit}
                    title="Save changes"
                    aria-label="Save changes"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium">@{a.username}{a.username === 'admin123' && ' (main)'}</div>
                    {a.username === 'admin123' && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">Primary</Badge>}
                  </div>
                  <div className="text-xs text-earth-muted mt-1 break-words">{a.name || '-'}{a.email ? ` | ${a.email}` : ''}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => startEdit(a)}
                    disabled={a.username === 'admin123' && username !== 'admin123'}
                    className="h-10 w-10 rounded-full p-0 border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 disabled:opacity-40"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    className="h-10 w-10 rounded-full p-0 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-400/30 disabled:opacity-40"
                    onClick={() => del(a.username)}
                    disabled={a.username === 'admin123'}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalQuizzes() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ text: string; options: string[]; answerIndex: number }>>([
    { text: '', options: ['', ''], answerIndex: 0 },
  ]);
  const load = async () => {
    const data = await fetch('/api/admin/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', options: ['', ''], answerIndex: 0 }]);
  const addOption = (qi: number) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.length < 4 ? [...q.options, ''] : q.options } : q));
  const updateQ = (qi: number, patch: Partial<{ text: string; options: string[]; answerIndex: number }>) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, ...patch } : q));
  const updateOpt = (qi: number, oi: number, val: string) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));

  const create = async () => {
    if (!title.trim()) return;
    const body = { title, description, points, questions };
    const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create quiz');
    }
    setTitle(''); setDescription(''); setPoints(3); setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]);
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Quizzes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Create Global Quiz</h3>
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted">Points (1-3)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={3} value={points} onChange={e=>setPoints(Number(e.target.value))} />
            </div>
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] mb-2" placeholder={`Question ${qi+1}`} value={q.text} onChange={e=>updateQ(qi, { text: e.target.value })} />
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-2">
                      <input className="flex-1 rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateOpt(qi, oi, e.target.value)} />
                      <label className="text-xs text-earth-muted flex items-center gap-1">
                        <input type="radio" name={`ans-admin-${qi}`} checked={q.answerIndex === oi} onChange={()=>updateQ(qi, { answerIndex: oi })} /> Correct
                      </label>
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <Button variant="secondary" onClick={()=>addOption(qi)}>Add Option</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
            </div>
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Global Quiz</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Quizzes</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No global quizzes yet.</p>}
            {list.map(q => (
              <div key={q.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{q.title} <span className="text-xs text-earth-muted">| {q.points} pts | {q.questions?.length||0} Qs</span></div>
                {q.description && <div className="text-sm text-earth-muted">{q.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminQuizManager() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ id?: string; text: string; options: string[]; answerIndex: number }>>([
    { text: '', options: ['', ''], answerIndex: 0 },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const data = await fetch('/api/admin/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', options: ['', ''], answerIndex: 0 }]);
  const addOption = (qi: number) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.length < 4 ? [...q.options, ''] : q.options } : q));
  const updateQ = (qi: number, patch: Partial<{ text: string; options: string[]; answerIndex: number }>) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, ...patch } : q));
  const updateOpt = (qi: number, oi: number, val: string) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));

  const resetForm = () => {
    setTitle(''); setDescription(''); setPoints(3); setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]); setEditingId(null);
  };

  const create = async () => {
    if (!title.trim()) return;
    const body = { title, description, points, questions };
    const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create quiz');
    }
    resetForm();
    await load();
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setTitle(q.title || '');
    setDescription(q.description || '');
    setPoints(q.points || 3);
    setQuestions((q.questions || []).map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options || [], answerIndex: qq.answerIndex || 0 })));
  };
  const saveEdit = async () => {
    if (!editingId) return;
    const body = { title, description, points, questions };
    const res = await fetch(`/api/admin/quizzes/${encodeURIComponent(editingId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to update quiz');
    }
    resetForm();
    await load();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    const res = await fetch(`/api/admin/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to delete quiz');
    }
    if (editingId === id) resetForm();
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Quizzes Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId ? 'Edit Global Quiz' : 'Create Global Quiz'}</h3>
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted">Points (1-3)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={3} value={points} onChange={e=>setPoints(Number(e.target.value))} />
            </div>
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] mb-2" placeholder={`Question ${qi+1}`} value={q.text} onChange={e=>updateQ(qi, { text: e.target.value })} />
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-2">
                      <input className="flex-1 rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateOpt(qi, oi, e.target.value)} />
                      <label className="text-xs text-earth-muted flex items-center gap-1">
                        <input type="radio" name={`ans-admin-mgr-${qi}`} checked={q.answerIndex === oi} onChange={()=>updateQ(qi, { answerIndex: oi })} /> Correct
                      </label>
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <Button variant="secondary" onClick={()=>addOption(qi)}>Add Option</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
            </div>
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={saveEdit}>Save Changes</Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                </>
              ) : (
                <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Global Quiz</Button>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Quizzes</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No global quizzes yet.</p>}
            {list.map(q => (
              <div key={q.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300/30">
                <div className="font-medium flex items-center justify-between">
                  <span>{q.title} <span className="text-xs text-earth-muted">| {q.points} pts | {q.questions?.length||0} Qs</span></span>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      title="Edit quiz"
                      aria-label="Edit quiz"
                      onClick={()=>startEdit(q)}
                      className="h-9 w-9 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/35 hover:text-emerald-100 hover:scale-105 active:scale-95"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete quiz"
                      aria-label="Delete quiz"
                      onClick={()=>del(q.id)}
                      className="h-9 w-9 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center transition-all duration-200 hover:bg-red-500/35 hover:text-red-100 hover:scale-105 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {q.description && <div className="text-sm text-earth-muted">{q.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalAnnouncements() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const load = async () => {
    const data = await fetch('/api/admin/announcements', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
  };
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setBody(item.body || '');
  };
  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch(editingId ? `/api/admin/announcements/${encodeURIComponent(editingId)}` : '/api/admin/announcements', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
      body: JSON.stringify({ title, body })
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      setSaving(false);
      return alert(e?.error || (editingId ? 'Failed to update announcement' : 'Failed to post announcement'));
    }
    resetForm();
    await load();
    setSaving(false);
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    setRemovingId(id);
    const res = await fetch(`/api/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      setRemovingId(null);
      return alert(e?.error || 'Failed to delete announcement');
    }
    if (editingId === id) resetForm();
    await load();
    setRemovingId(null);
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Announcements</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId ? 'Edit Global Announcement' : 'Post Global Announcement'}</h3>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/[0.07]">
            <input className="w-full rounded-xl px-3 py-2.5 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full min-h-40 rounded-xl px-3 py-2.5 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" placeholder="Write something..." value={body} onChange={e=>setBody(e.target.value)} />
            <div className="flex gap-2">
              <Button className="bg-earth-orange hover:bg-earth-orange-hover transition-all duration-200" onClick={submit} disabled={saving}>{saving ? (editingId ? 'Saving...' : 'Posting...') : (editingId ? 'Save Changes' : 'Post')}</Button>
              {editingId && <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Announcements</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No announcements yet.</p>}
            {list.map(a => (
              <div key={a.id} className="p-3 rounded-xl bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300/30">
                <div className="font-medium flex items-start justify-between gap-3">
                  <div>
                    <div>{a.title}</div>
                    <div className="text-xs text-earth-muted mt-1">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      title="Edit announcement"
                      aria-label="Edit announcement"
                      onClick={() => startEdit(a)}
                      className="h-9 w-9 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/35 hover:text-emerald-100 hover:scale-105 active:scale-95"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete announcement"
                      aria-label="Delete announcement"
                      onClick={() => remove(a.id)}
                      disabled={removingId === a.id}
                      className="h-9 w-9 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center transition-all duration-200 hover:bg-red-500/35 hover:text-red-100 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 className={`h-4 w-4 ${removingId === a.id ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
                {a.body && <div className="text-sm text-earth-muted whitespace-pre-wrap mt-2">{a.body}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalAssignments() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxPoints, setMaxPoints] = useState(10);
  const [subs, setSubs] = useState<any[]>([]);
  const [assignmentSubmissionSummary, setAssignmentSubmissionSummary] = useState<Record<string, { total: number; pending: number }>>({});
  const [subsLoading, setSubsLoading] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [activeAssignmentTitle, setActiveAssignmentTitle] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const load = async () => {
    const data = await fetch('/api/admin/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };

  const fetchSubs = async (assignmentId?: string) => {
    const url = assignmentId ? `/api/admin/assignment-submissions?assignmentId=${encodeURIComponent(assignmentId)}` : '/api/admin/assignment-submissions';
    const data = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
    return Array.isArray(data) ? data : [];
  };

  const refreshAssignmentSummary = async () => {
    const all = await fetchSubs();
    const next: Record<string, { total: number; pending: number }> = {};
    all.forEach((s: any) => {
      const key = String(s.assignmentId || '');
      if (!key) return;
      if (!next[key]) next[key] = { total: 0, pending: 0 };
      next[key].total += 1;
      if (s.status === 'submitted') next[key].pending += 1;
    });
    setAssignmentSubmissionSummary(next);
  };

  const loadSubs = async (assignmentId?: string) => {
    setSubsLoading(true);
    try {
      const data = await fetchSubs(assignmentId);
      setSubs(data);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadSubs();
    refreshAssignmentSummary();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadSubs(activeAssignmentId || undefined);
      refreshAssignmentSummary();
    }, 8000);
    return () => window.clearInterval(id);
  }, [activeAssignmentId, username]);
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setMaxPoints(10);
  };
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setDeadline(item.deadline || '');
    setMaxPoints(Number(item.maxPoints || 10));
  };
  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch(editingId ? `/api/admin/assignments/${encodeURIComponent(editingId)}` : '/api/admin/assignments', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
      body: JSON.stringify({ title, description, deadline, maxPoints })
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      setSaving(false);
      return alert(e?.error || 'Failed to create assignment');
    }
    resetForm();
    await load();
    await refreshAssignmentSummary();
    setSaving(false);
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    setRemovingId(id);
    const res = await fetch(`/api/admin/assignments/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      setRemovingId(null);
      return alert(e?.error || 'Failed to delete assignment');
    }
    if (editingId === id) resetForm();
    await load();
    await refreshAssignmentSummary();
    setRemovingId(null);
  };

  const review = async (id: string, status: 'approved' | 'rejected', points?: number) => {
    const body: any = { status };
    if (typeof points !== 'undefined') body.points = points;
    const res = await fetch(`/api/admin/assignment-submissions/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to review');
    }
    await loadSubs(activeAssignmentId || undefined);
    await refreshAssignmentSummary();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Assignments</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId ? 'Edit Global Assignment' : 'Create Global Assignment'}</h3>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/[0.07]">
            <input className="w-full rounded-xl px-3 py-2.5 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-xl px-3 py-2.5 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <input className="w-full rounded-xl px-3 py-2.5 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted text-sm">Max Points (1-10)</span>
              <input className="w-24 rounded-xl px-3 py-2 text-[var(--foreground)] bg-white/95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-200" type="number" min={1} max={10} value={maxPoints} onChange={e=>setMaxPoints(Number(e.target.value))} />
            </div>
            <div className="flex gap-2">
              <Button className="bg-earth-orange hover:bg-earth-orange-hover transition-all duration-200" onClick={submit} disabled={saving}>{saving ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Global Assignment')}</Button>
              {editingId && <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Assignments</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No assignments yet.</p>}
            {list.map(a => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-[var(--earth-card)] border border-[var(--earth-border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300/30 cursor-pointer"
                onClick={() => {
                  setActiveAssignmentId(a.id);
                  setActiveAssignmentTitle(a.title);
                  loadSubs(a.id);
                }}
              >
                <div className="font-medium flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="break-words">{a.title} <span className="text-xs text-earth-muted">| Max {a.maxPoints} pts</span></div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/20 text-earth-muted">
                          {assignmentSubmissionSummary[a.id]?.total || 0} submission{(assignmentSubmissionSummary[a.id]?.total || 0) === 1 ? '' : 's'}
                        </span>
                        {(assignmentSubmissionSummary[a.id]?.pending || 0) > 0 && (
                          <span className="relative inline-flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                          </span>
                        )}
                      </div>
                    </div>
                    {a.description && <div className="text-sm text-earth-muted mt-1 break-words">{a.description}</div>}
                    <div className="flex items-center justify-between gap-3 text-xs text-earth-muted mt-1">
                      {a.deadline ? <div>Deadline: {new Date(a.deadline).toLocaleDateString('en-GB')}</div> : <div />}
                      {(assignmentSubmissionSummary[a.id]?.pending || 0) > 0 && <div className="text-amber-300">Needs review: {assignmentSubmissionSummary[a.id]?.pending}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      title="Edit assignment"
                      aria-label="Edit assignment"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(a);
                      }}
                      className="h-9 w-9 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-300 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/35 hover:text-emerald-100 hover:scale-105 active:scale-95"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete assignment"
                      aria-label="Delete assignment"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(a.id);
                      }}
                      disabled={removingId === a.id}
                      className="h-9 w-9 rounded-full border border-red-400/60 bg-red-500/20 text-red-300 flex items-center justify-center transition-all duration-200 hover:bg-red-500/35 hover:text-red-100 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 className={`h-4 w-4 ${removingId === a.id ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="font-semibold">{activeAssignmentId ? `Submissions for "${activeAssignmentTitle}"` : 'All Assignment Submissions'}</h3>
          {activeAssignmentId && (
            <Button variant="secondary" size="sm" onClick={() => { setActiveAssignmentId(null); setActiveAssignmentTitle(''); loadSubs(); }}>
              Show All
            </Button>
          )}
        </div>
        {subsLoading ? (
          <p className="text-sm text-earth-muted">Loading submissions...</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-earth-muted">No submissions yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {subs.map((s) => (
              <AdminAssignmentSubmissionCard key={s.id} s={s} onReview={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAssignmentSubmissionCard({ s, onReview }: { s: any; onReview: (id: string, status: 'approved' | 'rejected', points?: number) => Promise<void> }) {
  const [points, setPoints] = useState<number>(() => {
    const current = Number(s.points);
    return Number.isFinite(current) ? current : 0;
  });
  const maxPts = Number(s.assignmentMaxPoints || 10);
  const approved = s.status === 'approved';
  const rejected = s.status === 'rejected';
  const submitted = s.status === 'submitted';

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="text-sm flex-1 min-w-0">
          <div className="font-medium break-words">@{s.studentUsername} {s.studentName && <span className="text-earth-muted">• {s.studentName}</span>}</div>
          {(s.className || s.section) && (
            <div className="text-xs text-earth-muted mt-1">Class: {s.className || '-'} | Section: {s.section || '-'}</div>
          )}
        </div>
        <div className="text-xs text-earth-muted shrink-0">{new Date(s.submittedAt).toLocaleString()}</div>
      </div>

      {Array.isArray(s.files) && s.files.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {s.files.map((f: string, i: number) => (
            <a key={i} href={f} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs rounded border border-white/20 text-blue-300 hover:text-blue-200">
              File {i + 1}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 flex-wrap">
        {submitted && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-earth-muted">Points:</label>
              <input
                className="w-16 rounded-lg px-2 py-1 bg-white/10 border border-white/20 text-sm"
                type="number"
                min={0}
                max={maxPts}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
              />
              <span className="text-xs text-earth-muted">/ {maxPts}</span>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(s.id, 'approved', points)}>
              Approve
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onReview(s.id, 'rejected')}>
              Reject
            </Button>
          </>
        )}
        {approved && <span className="text-sm text-emerald-400 font-medium">Approved | {s.points} pts</span>}
        {rejected && <span className="text-sm text-red-400 font-medium">Rejected</span>}
      </div>
    </div>
  );
}

function AdminVideosManager() {
  const { username } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'youtube' | 'file'>('youtube');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Climate Change',
    difficulty: 'Beginner',
    credits: 1,
    youtubeUrl: '',
    thumbnailUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const categories = [
    'Climate Change', 'Renewable Energy', 'Ocean Conservation', 
    'Agriculture', 'Wildlife', 'Green Technology', 'Waste Management', 
    'Water Conservation', 'Air Quality', 'Biodiversity'
  ];

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos', {
        headers: { 'X-Username': username || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setVideos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [username]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'Climate Change',
      difficulty: 'Beginner',
      credits: 1,
      youtubeUrl: '',
      thumbnailUrl: ''
    });
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const generateYouTubeEmbedUrl = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const generateYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const handleYouTubeUpload = async () => {
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      alert('Title and YouTube URL are required');
      return;
    }

    const videoId = extractYouTubeVideoId(form.youtubeUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setIsUploading(true);
    try {
      let duration: number | undefined;
      try {
        const metaRes = await fetch('/api/videos/youtube-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
          body: JSON.stringify({ url: form.youtubeUrl.trim() })
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const parsed = Number(meta?.duration);
          if (Number.isFinite(parsed) && parsed > 0) duration = parsed;
        }
      } catch {
        // Keep upload resilient even if metadata lookup fails.
      }

      const videoData = {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        credits: form.credits,
        url: form.youtubeUrl.trim(),
        thumbnail: form.thumbnailUrl || generateYouTubeThumbnail(form.youtubeUrl),
        duration,
        uploadedBy: username,
        type: 'youtube'
      };

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username || ''
        },
        body: JSON.stringify(videoData)
      });

      if (response.ok) {
        alert('YouTube video added successfully!');
        resetForm();
        setIsUploadModalOpen(false);
        loadVideos();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add YouTube video');
      }
    } catch (error) {
      console.error('Error uploading YouTube video:', error);
      alert('Failed to add YouTube video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!form.title.trim() || !videoFile) {
      alert('Title and video file are required');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('difficulty', form.difficulty);
      formData.append('credits', form.credits.toString());
      formData.append('uploadedBy', username || '');
      formData.append('type', 'file');
      formData.append('video', videoFile);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        headers: {
          'X-Username': username || ''
        },
        body: formData
      });

      if (response.ok) {
        alert('Video file uploaded successfully!');
        resetForm();
        setIsUploadModalOpen(false);
        loadVideos();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload video file');
      }
    } catch (error) {
      console.error('Error uploading video file:', error);
      alert('Failed to upload video file');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'X-Username': username || '' }
      });

      if (response.ok) {
        alert('Video deleted successfully!');
        loadVideos();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white/90 flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-400" />
              Videos Management
            </h2>
            <p className="text-white/70 mt-1">Manage educational videos for students and teachers</p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </div>

        {/* Videos List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90">All Videos ({videos.length})</h3>
          {videos.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <Video className="h-12 w-12 mx-auto mb-4 text-white/50" />
              <p>No videos uploaded yet. Add your first video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-cover bg-center relative" style={{ backgroundImage: `url(${video.thumbnail})` }}>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        {video.type === 'youtube' ? (
                          <Youtube className="h-6 w-6 text-white" />
                        ) : (
                          <Video className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white text-xs px-2 py-1 rounded-full">
                      {video.credits} credits
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white/90 text-sm mb-1 line-clamp-2">{video.title}</h4>
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span>{video.category}</span>
                      <span>{video.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">By {video.uploadedBy}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deleteVideo(video.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-[9999] p-4 pt-10 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setIsUploadModalOpen(false)}
          ></div>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-xl p-6 max-w-2xl w-full max-h-[calc(100vh-5rem)] overflow-y-auto shadow-2xl relative z-[10000]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white/90">Add New Video</h3>
              <Button
                variant="secondary"
                onClick={() => setIsUploadModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                x
              </Button>
            </div>

            {/* Upload Type Selection */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Button
                  variant={uploadType === 'youtube' ? 'default' : 'secondary'}
                  onClick={() => setUploadType('youtube')}
                  className={uploadType === 'youtube' 
                    ? "bg-red-500/80 hover:bg-red-600/80 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  }
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube Link
                </Button>
                <Button
                  variant={uploadType === 'file' ? 'default' : 'secondary'}
                  onClick={() => setUploadType('file')}
                  className={uploadType === 'file' 
                    ? "bg-blue-500/80 hover:bg-blue-600/80 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={uploadType === 'youtube' ? handleYouTubeUpload : handleFileUpload}
                disabled={isUploading}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    {uploadType === 'youtube' ? <Youtube className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    {uploadType === 'youtube' ? 'Add YouTube Video' : 'Upload Video File'}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsUploadModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Cancel
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/90 text-sm mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 bg-white/95 border border-white/30 text-slate-900"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  >
                    {categories.map(category => (
                      <option
                        key={category}
                        value={category}
                        className="bg-white text-slate-900"
                        style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 bg-white/95 border border-white/30 text-slate-900"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  >
                    <option value="Beginner" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Beginner</option>
                    <option value="Intermediate" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Intermediate</option>
                    <option value="Advanced" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm mb-2">Credits</label>
                  <select
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 bg-white/95 border border-white/30 text-slate-900"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  >
                    <option value={1} className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>1 Credit</option>
                    <option value={2} className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>2 Credits</option>
                  </select>
                </div>
              </div>

              {uploadType === 'youtube' ? (
                <>
                  <div>
                    <label className="block text-white/90 text-sm mb-2">YouTube URL *</label>
                    <input
                      type="url"
                      value={form.youtubeUrl}
                      onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm mb-2">Custom Thumbnail URL (optional)</label>
                    <input
                      type="url"
                      value={form.thumbnailUrl}
                      onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="Leave empty to use YouTube thumbnail"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-white/90 text-sm mb-2">Video File *</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm mb-2">Thumbnail Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                    />
                    <p className="text-white/50 text-xs mt-1">If not provided, a frame from the video will be used</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
