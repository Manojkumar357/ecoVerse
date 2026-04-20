import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, Youtube, Video, Plus, Trash2, Edit3, Bell, BarChart3, Users, FileText, BookOpen, Brain, Zap, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["Overview", "Tasks", "Quizzes", "Assignments", "Videos", "Students", "Announcements", "Profile"];

const FALLBACK_IMAGES: Record<string, string> = {
  'Green Living': '/api/image/nature-319.jpg',
  'Forest Conservation': '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg',
  'Transportation': '/api/image/ai-generated-earth-globe-illustration-animation-horizontal-with-plants-copy-space-banner-ecological-earth-day-hour-safe-clouds-clear-trees-mountains-environmental-problems-on-blue-background-free-video.jpg',
  'Air Quality': '/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg',
  'Marine Life': '/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg',
  'Biodiversity': '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg',
  'Renewable Energy': '/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg',
  'Waste Management': '/api/image/360_F_628835191_EMMgdwXxjtd3yLBUguiz5UrxaxqByvUc.jpg',
  'Water Conservation': '/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg',
  'Climate Change': '/api/image/b1573252592009209d45a186360dea8c.jpg',
  'Agriculture': '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg',
  'General': '/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg'
};

const getFallbackImage = (category: string, title: string): string => {
  if (FALLBACK_IMAGES[category]) return FALLBACK_IMAGES[category];
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ocean') || titleLower.includes('marine') || titleLower.includes('sea')) return FALLBACK_IMAGES['Marine Life'];
  if (titleLower.includes('forest') || titleLower.includes('tree') || titleLower.includes('deforestation')) return FALLBACK_IMAGES['Forest Conservation'];
  if (titleLower.includes('energy') || titleLower.includes('solar') || titleLower.includes('wind')) return FALLBACK_IMAGES['Renewable Energy'];
  return FALLBACK_IMAGES['General'];
};

export default function TeacherAppShell() {
  const { role, username, clear } = useAuth();
  const initialTab = useMemo(() => {
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const q = new URLSearchParams(search);
      const t = (q.get('tab') || '').toLowerCase();
      if (!t) return 0;
      const idx = tabs.findIndex(x => x.toLowerCase() === t);
      return idx >= 0 ? idx : 0;
    } catch {
      return 0;
    }
  }, []);
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-white/70">Welcome, @{username}! Manage your courses and students</p>
            </div>
            <Button
              onClick={clear}
              size="sm"
              className="bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-400/30 text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pb-4">
            {tabs.map((t, i) => (
              <motion.button
                key={t}
                onClick={() => setTab(i)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  tab === i
                    ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/50 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {tab === 0 && <TeacherOverview key="overview" />}
            {tab === 1 && <TeacherTasks key="tasks" />}
            {tab === 2 && <TeacherQuizzes key="quizzes" />}
            {tab === 3 && <TeacherAssignments key="assignments" />}
            {tab === 4 && <TeacherVideosManager key="videos" />}
            {tab === 5 && <TeacherStudents key="students" />}
            {tab === 6 && <TeacherAnnouncements key="announcements" />}
            {tab === 7 && <TeacherProfile key="profile" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TeacherOverview() {
  const { username } = useAuth();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadVideosCount = async () => {
      try {
        const countRes = await fetch('/api/teacher/videos/count', { headers: { 'X-Username': username || '' } });
        if (countRes.ok) {
          const data = await countRes.json();
          return Number(data?.count || 0);
        }
      } catch {
        // Fallback below handles unavailable endpoint during rolling updates.
      }

      try {
        const listRes = await fetch(`/api/teacher/videos?teacherId=${encodeURIComponent(username || '')}`, { headers: { 'X-Username': username || '' } });
        const list = listRes.ok ? await listRes.json() : [];
        return Array.isArray(list) ? list.length : 0;
      } catch {
        return 0;
      }
    };

    Promise.all([
      fetch('/api/teacher/overview', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
      loadVideosCount(),
    ]).then(([overview, videosCount]) => {
      if (!mounted) return;
      setData({ ...overview, videos: Number.isFinite(videosCount) ? videosCount : 0 });
    });
    return () => { mounted = false; };
  }, [username]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {!data ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70 mt-4">Loading overview...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Tasks Created', value: data.tasks, icon: FileText, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-400', borderColor: 'border-blue-400/30' },
            { label: 'Quizzes Created', value: data.quizzes, icon: Brain, color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400', borderColor: 'border-purple-400/30' },
            { label: 'Assignments', value: data.assignments, icon: BookOpen, color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-400', borderColor: 'border-emerald-400/30' },
            { label: 'Videos', value: data.videos, icon: Video, color: 'from-pink-500/20 to-rose-500/20', iconColor: 'text-pink-400', borderColor: 'border-pink-400/30' },
            { label: 'Total Students', value: data.students, icon: Users, color: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-400', borderColor: 'border-cyan-400/30' },
            { label: 'Pending Reviews', value: data.pendingSubmissions, icon: Zap, color: 'from-yellow-500/20 to-orange-500/20', iconColor: 'text-yellow-400', borderColor: 'border-yellow-400/30' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} border ${stat.borderColor} rounded-2xl p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all`}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-white">{stat.value === undefined || stat.value === null || stat.value === '' ? 0 : stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/10 ${stat.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function TeacherTasks() {
  const { username } = useAuth();
  const [tasks, setTasks] = useState<Array<any>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxPoints, setMaxPoints] = useState(10);
  const [groupMode, setGroupMode] = useState<'solo' | 'group'>('solo');
  const [maxGroupSize, setMaxGroupSize] = useState(4);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Array<any>>([]);
  const [taskSubmissionSummary, setTaskSubmissionSummary] = useState<Record<string, { total: number; pending: number }>>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>("");
  const [subsLoading, setSubsLoading] = useState(false);

  const load = async () => {
    const list = await fetch('/api/teacher/tasks', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setTasks(Array.isArray(list) ? list : []);
  };

  const fetchSubs = async (taskId?: string) => {
    const url = taskId ? `/api/teacher/submissions?taskId=${encodeURIComponent(taskId)}` : '/api/teacher/submissions';
    const list = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
    return Array.isArray(list) ? list : [];
  };

  const refreshTaskSummary = async () => {
    const all = await fetchSubs();
    const next: Record<string, { total: number; pending: number }> = {};
    all.forEach((s: any) => {
      const key = String(s.taskId || '');
      if (!key) return;
      if (!next[key]) next[key] = { total: 0, pending: 0 };
      next[key].total += 1;
      if (s.status === 'submitted') next[key].pending += 1;
    });
    setTaskSubmissionSummary(next);
  };

  const loadSubs = async (taskId?: string) => {
    setSubsLoading(true);
    try {
      const list = await fetchSubs(taskId);
      setSubmissions(list);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadSubs();
    refreshTaskSummary();
  }, []);

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch('/api/teacher/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, deadline, proofType: 'photo', maxPoints, groupMode, maxGroupSize: groupMode === 'group' ? maxGroupSize : undefined }) });
    setLoading(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to create task');
    }
    setTitle(""); setDescription(""); setDeadline(""); setMaxPoints(10);
    await load();
  };

  const review = async (id: string, status: 'approved' | 'rejected', points?: number) => {
    const body: any = { status };
    if (typeof points !== 'undefined') body.points = points;
    const res = await fetch(`/api/teacher/submissions/${encodeURIComponent(id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to review');
    }
    await loadSubs(activeTaskId || undefined);
    await refreshTaskSummary();
  };

  const seed = async () => {
    setLoading(true);
    try {
      await fetch('/api/dev/seed-teacher-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, count: 12 }) });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            Create New Task
          </h3>
          <div className="space-y-3">
            <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              <input className="rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="number" min={1} max={10} value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))} placeholder="Max Points" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={groupMode === 'group'} onChange={e => setGroupMode(e.target.checked ? 'group' : 'solo')} className="cursor-pointer rounded" />
                <span className="text-white/70 text-sm">Group Task</span>
              </label>
              {groupMode === 'group' && (
                <div className="pl-6">
                  <label className="block text-white/70 text-sm mb-2">Max Group Size</label>
                  <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="number" min={2} max={10} value={maxGroupSize} onChange={e => setMaxGroupSize(Number(e.target.value))} />
                </div>
              )}
            </div>
            <Button onClick={create} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
            {tasks.length === 0 && (
              <Button variant="secondary" onClick={seed} disabled={loading} className="w-full bg-white/10 hover:bg-white/15">
                Seed 12 Demo Tasks
              </Button>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Your Tasks ({tasks.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tasks.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-xl hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => { setActiveTaskId(t.id); setActiveTaskTitle(t.title); loadSubs(t.id); }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-white">{t.title}</h4>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/20 text-white/80">
                      {taskSubmissionSummary[t.id]?.total || 0} submission{(taskSubmissionSummary[t.id]?.total || 0) === 1 ? '' : 's'}
                    </span>
                    {(taskSubmissionSummary[t.id]?.pending || 0) > 0 && (
                      <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                      </span>
                    )}
                  </div>
                </div>
                {t.description && <p className="text-white/70 text-sm mb-2">{t.description}</p>}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>📋 Max {t.maxPoints} pts</span>
                  {(taskSubmissionSummary[t.id]?.pending || 0) > 0 && <span className="text-amber-300">Needs review: {taskSubmissionSummary[t.id]?.pending}</span>}
                  {t.deadline && <span>⏰ {t.deadline}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {activeTaskId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Submissions for "{activeTaskTitle}"</h3>
            <Button onClick={() => { setActiveTaskId(null); setActiveTaskTitle(""); loadSubs(); }} variant="secondary" size="sm">
              Show All
            </Button>
          </div>
          {subsLoading ? (
            <p className="text-white/70">Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="text-white/70">No submissions yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.map((s) => (
                <SubmissionCard key={s.id} s={s} onReview={review} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function SubmissionCard({ s, onReview }: { s: any; onReview: (id: string, status: 'approved' | 'rejected', points?: number) => Promise<void> }) {
  const [points, setPoints] = useState<number>(() => {
    const current = Number(s.points);
    return Number.isFinite(current) ? current : 0;
  });
  const maxPts = Number(s.taskMaxPoints || 10);
  const approved = s.status === 'approved';
  const rejected = s.status === 'rejected';
  const submitted = s.status === 'submitted';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="text-sm flex-1">
          <div className="text-white font-medium">@{s.studentUsername} {s.studentName && <span className="text-white/70">• {s.studentName}</span>}</div>
          {(s.className || s.section) && (
            <div className="text-xs text-white/60 mt-1">Class: {s.className || '-'} • Section: {s.section || '-'}</div>
          )}
          {Array.isArray(s.groupMembers) && s.groupMembers.length > 0 && (
            <div className="text-xs text-white/60 mt-1">Group: {s.groupMembers.map((m: string) => `@${m}`).join(', ')}</div>
          )}
        </div>
        <div className="text-xs text-white/40">{new Date(s.submittedAt).toLocaleString()}</div>
      </div>

      {Array.isArray(s.photos) && s.photos.length > 0 ? (
        <div className="flex gap-2 mb-3 flex-wrap">
          {s.photos.map((p: string, i: number) => (
            <img key={i} src={p} alt={`Submission ${i + 1}`} className="h-20 w-20 object-cover rounded border border-white/20" />
          ))}
        </div>
      ) : s.photoDataUrl ? (
        <div className="mb-3">
          <img src={s.photoDataUrl} alt="Submission" className="h-20 w-20 object-cover rounded border border-white/20" />
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        {submitted && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/70">Points:</label>
              <input
                className="w-16 rounded-lg px-2 py-1 bg-white/10 border border-white/20 text-white text-sm"
                type="number"
                min={0}
                max={maxPts}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
              />
              <span className="text-xs text-white/70">/ {maxPts}</span>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(s.id, 'approved', points)}>
              Approve
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onReview(s.id, 'rejected')}>
              Reject
            </Button>
          </>
        )}
        {approved && <span className="text-sm text-emerald-400 font-medium">✓ Approved • {s.points} pts</span>}
        {rejected && <span className="text-sm text-red-400 font-medium">✗ Rejected</span>}
      </div>
    </motion.div>
  );
}

function TeacherQuizzes() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ id?: string; text: string; options: string[]; answerIndex: number }>>([{ text: '', options: ['', ''], answerIndex: 0 }]);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await fetch('/api/teacher/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setTitle('');
    setDescription('');
    setPoints(3);
    setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]);
    setEditingQuizId(null);
  };

  const save = async () => {
    if (!title.trim() || questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
      return alert('Title and all questions/options must be filled');
    }
    setLoading(true);
    const method = editingQuizId ? 'PUT' : 'POST';
    const url = editingQuizId ? `/api/teacher/quizzes/${editingQuizId}` : '/api/teacher/quizzes';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, points, questions }) });
    setLoading(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || (editingQuizId ? 'Failed to update' : 'Failed to create'));
    }
    reset();
    await load();
  };

  const removeQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz?')) return;
    const res = await fetch(`/api/teacher/quizzes/${quizId}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to delete');
    }
    await load();
  };

  const startEdit = (q: any) => {
    setEditingQuizId(q.id);
    setTitle(q.title);
    setDescription(q.description || '');
    setPoints(q.points);
    setQuestions(Array.isArray(q.questions) ? q.questions : []);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            {editingQuizId ? 'Edit' : 'Create'} Quiz
          </h3>
          <div className="space-y-3">
            <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            <div>
              <label className="block text-white/70 text-sm mb-2">Points</label>
              <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} />
            </div>

            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Questions</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {questions.map((q, qi) => (
                  <div key={qi} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <input className="w-full rounded px-2 py-1 bg-white/10 border border-white/20 text-white text-sm mb-2 placeholder-white/50" placeholder={`Question ${qi + 1}`} value={q.text} onChange={e => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, text: e.target.value } : qq))} />
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => (
                        <input key={oi} className="w-full rounded px-2 py-1 bg-white/10 border border-white/20 text-white text-sm placeholder-white/50" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => {
                          const newQ = { ...questions[qi], options: questions[qi].options.map((o, j) => j === oi ? e.target.value : o) };
                          setQuestions(questions.map((qq, i) => i === qi ? newQ : qq));
                        }} />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white" value={q.answerIndex} onChange={e => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, answerIndex: Number(e.target.value) } : qq))}>
                        {q.options.map((_, oi) => <option key={oi} value={oi}>Answer: {oi + 1}</option>)}
                      </select>
                      {q.options.length < 5 && <Button size="sm" variant="secondary" onClick={() => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, options: [...qq.options, ''] } : qq))}>+ Option</Button>}
                      <Button size="sm" variant="secondary" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="w-full mt-2 bg-white/20 hover:bg-white/30" onClick={() => setQuestions([...questions, { text: '', options: ['', ''], answerIndex: 0 }])}>+ Question</Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={save} disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                {loading ? 'Saving...' : 'Save Quiz'}
              </Button>
              {editingQuizId && <Button onClick={reset} variant="secondary" className="flex-1">Cancel</Button>}
            </div>
          </div>
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Quizzes ({list.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {list.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{q.title}</h4>
                    {q.description && <p className="text-white/70 text-sm">{q.description}</p>}
                    <p className="text-xs text-white/60 mt-1">{q.points} pts • {q.questions?.length || 0} Qs</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={() => setExpanded(e => ({ ...e, [q.id]: !e[q.id] }))}>
                    {expanded[q.id] ? 'Hide' : 'View'} Qs
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(q)}>Edit</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => removeQuiz(q.id)}>Delete</Button>
                </div>
                {expanded[q.id] && Array.isArray(q.questions) && (
                  <div className="mt-3 space-y-2 text-xs">
                    {q.questions.map((qq: any, idx: number) => (
                      <div key={qq.id || idx} className="bg-white/5 rounded p-2 border border-white/10">
                        <div className="font-medium text-white">Q{idx + 1}. {qq.text}</div>
                        <ul className="mt-1 list-disc list-inside text-white/70">
                          {qq.options?.map((opt: string, oi: number) => (
                            <li key={oi} className={oi === Number(qq.answerIndex) ? 'text-emerald-400' : ''}>
                              {opt} {oi === Number(qq.answerIndex) ? '✓' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeacherAssignments() {
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

  const load = async () => {
    const data = await fetch('/api/teacher/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };

  const fetchSubs = async (assignmentId?: string) => {
    const url = assignmentId ? `/api/teacher/assignment-submissions?assignmentId=${encodeURIComponent(assignmentId)}` : '/api/teacher/assignment-submissions';
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

  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/teacher/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, deadline, maxPoints }) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to create assignment');
    }
    setTitle(''); setDescription(''); setDeadline(''); setMaxPoints(10);
    await load();
  };

  const review = async (id: string, status: 'approved' | 'rejected', points?: number) => {
    const body: any = { status };
    if (typeof points !== 'undefined') body.points = points;
    const res = await fetch(`/api/teacher/assignment-submissions/${encodeURIComponent(id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to review');
    }
    await loadSubs(activeAssignmentId || undefined);
    await refreshAssignmentSummary();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Create Assignment
          </h3>
          <div className="space-y-3">
            <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              <input className="rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="number" min={1} max={10} value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))} placeholder="Max Points" />
            </div>
            <Button onClick={create} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
              Create Assignment
            </Button>
          </div>
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Assignments ({list.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {list.map((a, idx) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-xl cursor-pointer hover:bg-white/15 transition-all"
                onClick={() => { setActiveAssignmentId(a.id); setActiveAssignmentTitle(a.title); loadSubs(a.id); }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-white">{a.title}</h4>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/20 text-white/80">
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
                {a.description && <p className="text-white/70 text-sm mb-2">{a.description}</p>}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>📋 Max {a.maxPoints} pts</span>
                  {(assignmentSubmissionSummary[a.id]?.pending || 0) > 0 && <span className="text-amber-300">Needs review: {assignmentSubmissionSummary[a.id]?.pending}</span>}
                  {a.deadline && <span>⏰ {a.deadline}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {activeAssignmentId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Submissions for "{activeAssignmentTitle}"</h3>
            <Button onClick={() => { setActiveAssignmentId(null); setActiveAssignmentTitle(''); loadSubs(); }} variant="secondary" size="sm">
              Show All
            </Button>
          </div>
          {subsLoading ? (
            <p className="text-white/70">Loading...</p>
          ) : subs.length === 0 ? (
            <p className="text-white/70">No submissions yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subs.map((s) => (
                <AssignmentSubmissionCard key={s.id} s={s} onReview={review} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function AssignmentSubmissionCard({ s, onReview }: { s: any; onReview: (id: string, status: 'approved' | 'rejected', points?: number) => Promise<void> }) {
  const [points, setPoints] = useState<number>(() => {
    const current = Number(s.points);
    return Number.isFinite(current) ? current : 0;
  });
  const maxPts = Number(s.assignmentMaxPoints || 10);
  const approved = s.status === 'approved';
  const rejected = s.status === 'rejected';
  const submitted = s.status === 'submitted';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="text-sm flex-1">
          <div className="text-white font-medium">@{s.studentUsername} {s.studentName && <span className="text-white/70">• {s.studentName}</span>}</div>
          {(s.className || s.section) && (
            <div className="text-xs text-white/60 mt-1">Class: {s.className || '-'} • Section: {s.section || '-'}</div>
          )}
        </div>
        <div className="text-xs text-white/40">{new Date(s.submittedAt).toLocaleString()}</div>
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

      <div className="flex items-end gap-3">
        {submitted && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/70">Points:</label>
              <input
                className="w-16 rounded-lg px-2 py-1 bg-white/10 border border-white/20 text-white text-sm"
                type="number"
                min={0}
                max={maxPts}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
              />
              <span className="text-xs text-white/70">/ {maxPts}</span>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(s.id, 'approved', points)}>
              Approve
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onReview(s.id, 'rejected')}>
              Reject
            </Button>
          </>
        )}
        {approved && <span className="text-sm text-emerald-400 font-medium">✓ Approved • {s.points} pts</span>}
        {rejected && <span className="text-sm text-red-400 font-medium">✗ Rejected</span>}
      </div>
    </motion.div>
  );
}

function TeacherVideosManager() {
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

  const categories = ['Climate Change', 'Renewable Energy', 'Ocean Conservation', 'Agriculture', 'Wildlife', 'Green Technology', 'Waste Management', 'Water Conservation', 'Air Quality', 'Biodiversity'];

  const loadVideos = async () => {
    try {
      const response = await fetch(`/api/teacher/videos?teacherId=${username}`, { headers: { 'X-Username': username || '' } });
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
        teacherId: username,
        type: 'youtube'
      };
      const response = await fetch('/api/teacher/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
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
      formData.append('teacherId', username || '');
      formData.append('type', 'file');
      formData.append('video', videoFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const response = await fetch('/api/teacher/videos/upload', {
        method: 'POST',
        headers: { 'X-Username': username || '' },
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
      const response = await fetch(`/api/teacher/videos/${videoId}`, {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-pink-400" />
            Videos Management
          </h3>
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Upload Type</label>
                  <div className="flex gap-2">
                    <Button variant={uploadType === 'youtube' ? 'default' : 'secondary'} onClick={() => setUploadType('youtube')} size="sm">
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                    <Button variant={uploadType === 'file' ? 'default' : 'secondary'} onClick={() => setUploadType('file')} size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      File
                    </Button>
                  </div>
                </div>

                <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Video Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <textarea className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-2">Category</label>
                    <select
                      className="w-full rounded-lg px-3 py-2 bg-white/95 border border-white/30 text-slate-900 text-sm"
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      {categories.map(c => (
                        <option
                          key={c}
                          value={c}
                          style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Difficulty</label>
                    <select
                      className="w-full rounded-lg px-3 py-2 bg-white/95 border border-white/30 text-slate-900 text-sm"
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      value={form.difficulty}
                      onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    >
                      <option style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Beginner</option>
                      <option style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Intermediate</option>
                      <option style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Credits</label>
                  <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" type="number" min={1} value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} />
                </div>

                {uploadType === 'youtube' ? (
                  <>
                    <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="YouTube URL" value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} />
                    <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Custom Thumbnail URL (optional)" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} />
                    <Button onClick={handleYouTubeUpload} disabled={isUploading} className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                      {isUploading ? 'Uploading...' : 'Add YouTube Video'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm mb-2">Video File</label>
                      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full text-white/70" />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Thumbnail (optional)</label>
                      <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} className="w-full text-white/70" />
                    </div>
                    <Button onClick={handleFileUpload} disabled={isUploading} className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                      {isUploading ? 'Uploading...' : 'Upload Video File'}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-12 bg-white/10 border border-white/20 rounded-2xl"
        >
          <Video className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <p className="text-white/70">No videos uploaded yet</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v, idx) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-xl hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-black relative overflow-hidden">
                <img src={v.thumbnail || getFallbackImage(v.category, v.title)} alt={v.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-white mb-1 line-clamp-2">{v.title}</h4>
                <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                  <span className="bg-white/10 px-2 py-1 rounded">{v.category}</span>
                  <span>{v.difficulty}</span>
                </div>
                {v.description && <p className="text-white/70 text-sm mb-3 line-clamp-2">{v.description}</p>}
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="flex-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 text-white">
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/70">
                        Are you sure you want to delete "{v.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel className="bg-slate-700 text-white border border-white/30 hover:bg-slate-600 hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteVideo(v.id)}>
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const Play = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

function TeacherStudents() {
  const { username } = useAuth();
  const [list, setList] = useState<Array<any>>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/teacher/students', { headers: { 'X-Username': username || '' } })
      .then(r => r.json())
      .then(d => { if (mounted) setList(Array.isArray(d) ? d : []); });
    return () => { mounted = false; };
  }, [username]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold text-white mb-4">Your Students ({list.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s, idx) => (
          <motion.div
            key={s.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-4 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg font-bold mb-3">
              {s.name?.[0]?.toUpperCase() || s.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <h4 className="font-semibold text-white">{s.name || 'Student'}</h4>
            <p className="text-white/70 text-sm">@{s.username}</p>
            <p className="text-white/60 text-xs mt-2">Class: {s.className || 'N/A'} | Section: {s.section || 'N/A'}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TeacherAnnouncements() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await fetch('/api/teacher/announcements', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch('/api/teacher/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, body }) });
    setLoading(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to post announcement');
    }
    setTitle(''); setBody('');
    await load();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Post Announcement
        </h3>
        <div className="space-y-3">
          <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50" placeholder="Write your announcement..." value={body} onChange={e => setBody(e.target.value)} rows={3} />
          <Button onClick={create} disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            {loading ? 'Posting...' : 'Post Announcement'}
          </Button>
        </div>
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Your Announcements ({list.length})</h3>
        <div className="space-y-4">
          {list.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-xl"
            >
              <h4 className="font-semibold text-white text-lg mb-2">{a.title}</h4>
              {a.body && <p className="text-white/70 text-sm mb-3 whitespace-pre-wrap">{a.body}</p>}
              <p className="text-white/50 text-xs">📅 {new Date(a.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TeacherProfile() {
  const { username } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [schoolName, setSchoolName] = useState('');
  const [data, setData] = useState<any>({});

  const resolveSchoolName = (schoolId: string, schoolList: Array<{ id: string; name: string }>) => {
    const match = schoolList.find((s) => s.id === schoolId);
    return match ? match.name : schoolId;
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const [p, s] = await Promise.all([
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()).catch(() => []),
        ]);
        if (!mounted) return;
        setData(p || {});
        const schoolList = Array.isArray(s) ? s : [];
        setSchools(schoolList);
        setSchoolName(resolveSchoolName(String(p?.schoolId || ''), schoolList));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [username]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((d: any) => ({ ...d, photoDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      let nextSchoolId = String(data.schoolId || '');
      const normalizedSchoolName = schoolName.trim();

      if (normalizedSchoolName) {
        const existing = schools.find((s) => s.name.toLowerCase() === normalizedSchoolName.toLowerCase());
        if (existing) {
          nextSchoolId = existing.id;
        } else {
          const createSchoolRes = await fetch('/api/admin/schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
            body: JSON.stringify({ name: normalizedSchoolName }),
          });
          if (createSchoolRes.ok) {
            const created = await createSchoolRes.json();
            if (created?.id) {
              nextSchoolId = created.id;
              setSchools(prev => [...prev, created]);
            }
          } else {
            // If school already exists with different casing, refresh and try lookup again.
            const refreshedSchools = await fetch('/api/schools').then(r => r.json()).catch(() => []);
            const list = Array.isArray(refreshedSchools) ? refreshedSchools : [];
            setSchools(list);
            const refreshedMatch = list.find((s: any) => String(s?.name || '').toLowerCase() === normalizedSchoolName.toLowerCase());
            if (refreshedMatch?.id) {
              nextSchoolId = refreshedMatch.id;
            }
          }
        }
      }

      const res = await fetch('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ name: data.name || '', email: data.email || '', schoolId: nextSchoolId, photoDataUrl: data.photoDataUrl || '', teacherId: data.teacherId || '', subject: data.subject || '' }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to save profile');
        return;
      }
      const p = await res.json();
      setData(p);
      setSchoolName(resolveSchoolName(String(p?.schoolId || ''), schools));
      alert('Profile saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70 mt-4">Loading profile...</p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-start gap-6 mb-6">
              <div>
                {data.photoDataUrl ? (
                  <img src={data.photoDataUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-white/20" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                    {data.name?.[0] || username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{data.name || username}</h3>
                <p className="text-white/70">@{username}</p>
                <p className="text-white/60 text-sm mt-2">Teacher • {schoolName || 'No school selected'}</p>
              </div>
            </div>
            <label className="inline-block">
              <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              <span className="cursor-pointer text-blue-300 hover:text-blue-200 text-sm font-medium">Change Photo</span>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl space-y-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Full Name</label>
                <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Email</label>
                <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">School Name</label>
                <input
                  className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Teacher ID</label>
                <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" value={data.teacherId || ''} onChange={e => setData({ ...data, teacherId: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/70 text-sm mb-2">Subject</label>
                <input className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white" value={data.subject || ''} onChange={e => setData({ ...data, subject: e.target.value })} />
              </div>
            </div>
            <Button onClick={save} disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
