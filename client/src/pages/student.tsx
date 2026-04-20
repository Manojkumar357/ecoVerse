import { useAuth } from "@/lib/auth";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bell, BarChart3, User, Share2, Copy, CheckCircle2, TrendingUp, Trophy, 
  GamepadIcon, BookOpen, Target, Award, Home, ClipboardList, Brain, 
  Video, FileText, LogOut, Menu, X, Zap, Star, Crown, Sparkles
} from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentAppShell() {
  const { role, username, clear } = useAuth();
  const [currentView, setCurrentView] = useState<'overview' | 'profile'>('overview');
  const [profileSharing, setProfileSharing] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  const user = {
    username: username,
    email: `${username}@example.com`
  };

  // Generate shareable link when profile sharing is enabled
  useEffect(() => {
    if (profileSharing && username) {
      const baseUrl = window.location.origin;
      const profileId = btoa(username); // Simple encoding
      setShareableLink(`${baseUrl}/profile/${profileId}`);
    } else {
      setShareableLink("");
    }
  }, [profileSharing, username]);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Share Profile Link */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            onClick={() => setProfileSharing(!profileSharing)}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 text-blue-300 hover:text-blue-200"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {profileSharing ? 'Hide Share Link' : 'Share Profile Link'}
          </Button>
          <p className="mt-2 text-xs text-white/60 max-w-xl">
            This only shows the shareable URL. To let others open it, turn on the visibility switch in the Privacy section below.
          </p>
          
          {profileSharing && shareableLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4"
            >
              <label className="text-white/70 text-sm block mb-2">Shareable Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-white/60 text-xs mt-2">
                Others can view your progress and achievements using this link
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {currentView === 'overview' ? (
            <StudentOverview key="overview" username={username || ''} />
          ) : (
            <StudentProfile key="profile" username={username || ''} user={user} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Overview Dashboard Component
function StudentOverview({ username }: { username: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, t, q] = await Promise.all([
          fetch('/api/student/profile', { headers: { 'X-Username': username } }).then(r => r.json()),
          fetch('/api/student/tasks', { headers: { 'X-Username': username } }).then(r => r.json()),
          fetch('/api/student/quizzes', { headers: { 'X-Username': username } }).then(r => r.json()),
        ]);
        if (!mounted) return;
        setProfile(p);
        setTasks(Array.isArray(t) ? t.slice(0, 3) : []);
        setQuizzes(Array.isArray(q) ? q.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const togglePrivacy = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch('/api/student/profile/privacy', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ allowExternalView: !profile.allowExternalView }) });
      const p = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setProfile(p);
    } finally {
      setSaving(false);
    }
  };

  const ecoPoints = Number(profile?.ecoPoints || 0);
  const completedTasks = tasks.filter(t => t.submission?.status === 'approved').length || 0;
  const completedQuizzes = quizzes.filter(q => q._attempt).length || 0;
  const globalRank = profile?.ranks?.global || 0;
  const level = ecoPoints >= 500 ? 3 : ecoPoints >= 100 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Profile Visibility */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-white/70">Profile Visibility</div>
          <div className="text-lg font-semibold text-white">
            {profile?.allowExternalView ? 'Profile is Public' : 'Profile is Private'}
          </div>
          <div className="text-xs text-white/60">
            {profile?.allowExternalView
              ? 'Anyone with the shareable link can view this profile.'
              : 'Turn this on to let others open your shareable link.'}
          </div>
        </div>
        <Button
          onClick={togglePrivacy}
          disabled={saving || !profile}
          className={profile?.allowExternalView
            ? 'bg-slate-700/80 hover:bg-slate-700 text-white border border-white/20'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
        >
          {saving
            ? 'Updating...'
            : profile?.allowExternalView
              ? 'Make Private'
              : 'Make Public'}
        </Button>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-yellow-500/20 border border-white/20 p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-300 via-cyan-300 to-yellow-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome back, {username}! 🌱
          </motion.h1>
          <motion.p 
            className="text-lg text-emerald-200/80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Ready to make the Earth greener today?
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Zap className="w-8 h-8" />}
          label="Eco Points"
          value={ecoPoints}
          gradient="from-emerald-500 to-green-600"
          delay={0.2}
        />
        <StatsCard
          icon={<Crown className="w-8 h-8" />}
          label="Global Rank"
          value={`#${globalRank || '-'}`}
          gradient="from-yellow-500 to-orange-600"
          delay={0.3}
        />
        <StatsCard
          icon={<CheckCircle2 className="w-8 h-8" />}
          label="Tasks Done"
          value={completedTasks}
          gradient="from-cyan-500 to-blue-600"
          delay={0.4}
        />
        <StatsCard
          icon={<Brain className="w-8 h-8" />}
          label="Quiz Score"
          value={`${completedQuizzes}/${quizzes.length}`}
          gradient="from-purple-500 to-pink-600"
          delay={0.5}
        />
      </div>

      {/* Level Progress */}
      <LevelProgressCard ecoPoints={ecoPoints} level={level} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <TasksSection tasks={tasks} />

        {/* Quizzes Section */}
        <QuizzesSection quizzes={quizzes} />
      </div>

      {/* Achievements & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AchievementsSection achievements={profile?.achievements || []} />
        <LeaderboardSection currentUser={username} rank={globalRank} />
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 backdrop-blur-xl group"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <motion.p 
        className="text-3xl font-bold text-white"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

// Level Progress Card
function LevelProgressCard({ ecoPoints, level }: { ecoPoints: number; level: number }) {
  const progress = (() => {
    if (ecoPoints >= 500) return 100;
    const prev = ecoPoints >= 100 ? 100 : 0;
    const next = ecoPoints >= 100 ? 500 : 100;
    return Math.max(0, Math.min(100, Math.round(((ecoPoints - prev) / (next - prev)) * 100)));
  })();

  const levelEmoji = level === 3 ? '🌳' : level === 2 ? '🌲' : '🌱';
  const levelName = level === 3 ? 'Big Tree' : level === 2 ? 'Small Tree' : 'Seedling';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-emerald-400/30 p-8 backdrop-blur-xl"
    >
      <div className="flex items-center gap-6">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl"
        >
          {levelEmoji}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-white">Level {level}: {levelName}</h3>
            <Badge className="bg-emerald-500/20 border-emerald-400/30 text-emerald-300">
              {ecoPoints} pts
            </Badge>
          </div>
          <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-white/60 mt-2">
            {ecoPoints >= 500 ? 'Max level reached! 🎉' : `${level === 2 ? 500 - ecoPoints : 100 - ecoPoints} points to next level`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Tasks Section
function TasksSection({ tasks }: { tasks: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-emerald-400" />
          Recent Tasks
        </h2>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="text-emerald-300 hover:text-emerald-200">
            View All →
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-white/50 rounded-2xl bg-slate-800/30 border border-white/10">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No tasks available yet</p>
          </div>
        ) : (
          tasks.map((item: any, index: number) => (
            <TaskCard key={item.task.id} task={item.task} submission={item.submission} delay={index * 0.1} />
          ))
        )}
      </div>
    </motion.div>
  );
}

// Task Card Component
function TaskCard({ task, submission, delay }: { task: any; submission?: any; delay: number }) {
  const status = submission?.status || 'pending';
  const statusConfig = {
    pending: { label: 'Pending', color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30' },
    submitted: { label: 'Submitted', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30' },
    approved: { label: 'Approved', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30' },
    rejected: { label: 'Rejected', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', border: 'border-red-400/30' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border ${config.border} p-6 backdrop-blur-xl group cursor-pointer`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
            {task.title}
          </h3>
          <Badge className={`${config.bg} ${config.border} text-white border`}>
            {config.label}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-sm text-white/60 mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/50">
              {task.deadline ? `Due: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
            </span>
            {task.maxPoints && (
              <span className="text-xs font-medium text-yellow-300 flex items-center gap-1">
                <Star className="w-3 h-3" />
                {task.maxPoints} pts
              </span>
            )}
          </div>
          {status === 'pending' && (
            <Link href="/tasks">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
              >
                Submit Task
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Quizzes Section
function QuizzesSection({ quizzes }: { quizzes: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          Available Quizzes
        </h2>
        <Link href="/quizzes">
          <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-200">
            View All →
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-12 text-white/50 rounded-2xl bg-slate-800/30 border border-white/10">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No quizzes available yet</p>
          </div>
        ) : (
          quizzes.map((quiz: any, index: number) => (
            <QuizCard key={quiz.id} quiz={quiz} delay={index * 0.1} />
          ))
        )}
      </div>
    </motion.div>
  );
}

// Quiz Card Component
function QuizCard({ quiz, delay }: { quiz: any; delay: number }) {
  const attempted = !!quiz._attempt;
  const score = quiz._attempt?.scorePercent || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-cyan-400/30 p-6 backdrop-blur-xl group cursor-pointer"
    >
      <div className=" absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-sm text-white/60 line-clamp-1">{quiz.description}</p>
            )}
          </div>
          {attempted && (
            <Badge className="bg-emerald-500/20 border-emerald-400/30 text-emerald-300 border">
              {score}% ✓
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {quiz.questions?.length || 0} questions
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-300" />
              {quiz.points} pts
            </span>
          </div>
          <Link href="/quizzes">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-shadow ${
                attempted
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-600/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50'
              }`}
            >
              {attempted ? 'Review' : 'Start Quiz'}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Achievements Section
function AchievementsSection({ achievements }: { achievements: any[] }) {
  const defaultAchievements = [
    { key: 'first_task', name: 'First Steps', unlocked: false, icon: '🥇' },
    { key: 'top10_school', name: 'Top 10', unlocked: false, icon: '🏅' },
    { key: 'quiz_master', name: 'Quiz Master', unlocked: false, icon: '🧠' },
    { key: 'eco_warrior', name: 'Eco Warrior', unlocked: false, icon: '🌱' },
    { key: 'streak_7', name: '7 Day Streak', unlocked: false, icon: '🔥' },
    { key: 'game_champion', name: 'Game Champion', unlocked: false, icon: '🎮' },
  ];

  const achievementList = achievements.length > 0 ? achievements : defaultAchievements;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
        <Award className="w-6 h-6 text-yellow-400" />
        Achievements
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievementList.slice(0, 6).map((achievement: any, index: number) => (
          <AchievementBadge key={achievement.key} achievement={achievement} delay={index * 0.05} />
        ))}
      </div>
    </motion.div>
  );
}

// Achievement Badge Component
function AchievementBadge({ achievement, delay }: { achievement: any; delay: number }) {
  const unlocked = achievement.unlocked;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: unlocked ? 1.1 : 1.05, rotateY: 10 }}
      className={`relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30 shadow-lg shadow-yellow-500/20'
          : 'bg-slate-800/30 border-white/10 grayscale'
      }`}
    >
      {unlocked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-orange-400/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="relative z-10 text-center">
        <motion.div 
          className="text-4xl mb-2"
          animate={unlocked ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {achievement.icon || '🏆'}
        </motion.div>
        <h4 className="text-sm font-semibold text-white mb-1">{achievement.name}</h4>
        <p className="text-xs text-white/50">
          {unlocked ? 'Unlocked!' : 'Locked'}
        </p>
      </div>
    </motion.div>
  );
}

// Leaderboard Section
function LeaderboardSection({ currentUser, rank }: { currentUser: string; rank: number }) {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    // Mock leaderboard data
    setTopUsers([
      { username: 'EcoChampion', points: 850, rank: 1 },
      { username: 'GreenWarrior', points: 720, rank: 2 },
      { username: 'NatureHero', points: 680, rank: 3 },
      { username: currentUser, points: 520, rank: rank || 4 },
    ]);
  }, [currentUser, rank]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Top Players
        </h2>
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm" className="text-yellow-300 hover:text-yellow-200">
            Full Board →
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {topUsers.slice(0, 4).map((user: any, index: number) => (
          <LeaderboardCard key={user.username} user={user} currentUser={currentUser} delay={index * 0.1} />
        ))}
      </div>
    </motion.div>
  );
}

// Leaderboard Card Component
function LeaderboardCard({ user, currentUser, delay }: { user: any; currentUser: string; delay: number }) {
  const isCurrentUser = user.username === currentUser;
  const trophyColor = user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : user.rank === 3 ? 'text-orange-400' : 'text-white/30';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-xl p-4 backdrop-blur-xl border transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30'
          : 'bg-slate-800/30 border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <motion.div 
          className={`text-2xl ${trophyColor}`}
          animate={user.rank <= 3 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {user.rank <= 3 ? <Trophy className="w-6 h-6" /> : <span className="text-lg text-white/50">#{user.rank}</span>}
        </motion.div>
        <div className="flex-1">
          <p className="font-semibold text-white">
            {user.username}
            {isCurrentUser && <span className="text-xs text-emerald-300 ml-2">(You)</span>}
          </p>
          <p className="text-xs text-white/50">Rank #{user.rank}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-yellow-300 flex items-center gap-1">
            <Star className="w-4 h-4" />
            {user.points}
          </p>
          <p className="text-xs text-white/50">points</p>
        </div>
      </div>
    </motion.div>
  );
}

// Keep original Profile components for backward compatibility
function StudentProfile({ username, user }: { username: string; user: any }) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {!showProfileEditor ? <StudentProfileView /> : <StudentProfileEditor onClose={() => setShowProfileEditor(false)} />}

      {/* Profile Editor Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowProfileEditor(!showProfileEditor)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-shadow"
        >
          {showProfileEditor ? 'View Profile' : 'Edit Profile'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-white/90">{title}</h2>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">{children}</div>
    </section>
  );
}

function StudentProfileView() {
  const { username } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [me, setMe] = useState<any | null>(null);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, m, s] = await Promise.all([
          fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setProfile(p);
        setMe(m);
        setSchools(Array.isArray(s) ? s : []);
        if ((p?.achievements || []).some((a: any) => a.unlocked)) {
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const togglePrivacy = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch('/api/student/profile/privacy', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ allowExternalView: !profile.allowExternalView }) });
      const p = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setProfile(p);
    } finally {
      setSaving(false);
    }
  };

  const schoolName = useMemo(() => {
    if (!me?.schoolId) return '';
    const f = schools.find(s => s.id === me.schoolId);
    return f?.name || me.schoolId || '';
  }, [me?.schoolId, schools]);

  const stageEmoji = profile?.ecoTreeStage === 'Big Tree' ? '🌳' : profile?.ecoTreeStage === 'Small Tree' ? '🌲' : '🌱';
  const ecoPoints = Number(profile?.ecoPoints || 0);
  const progress = (() => {
    if (ecoPoints >= 500) return 100;
    const prev = ecoPoints >= 100 ? 100 : 0;
    const next = ecoPoints >= 100 ? 500 : 100;
    return Math.max(0, Math.min(100, Math.round(((ecoPoints - prev) / (next - prev)) * 100)));
  })();

  return (
    <div className="space-y-6">
      {!profile ? (
        <div className="text-white/50">Loading…</div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-white/70">Profile Visibility</div>
              <div className="text-lg font-semibold text-white">
                {profile.allowExternalView ? 'Profile is Public' : 'Profile is Private'}
              </div>
              <div className="text-xs text-white/60">
                {profile.allowExternalView
                  ? 'Anyone with the shareable link can view this profile.'
                  : 'Turn this on to let others open your shareable link.'}
              </div>
            </div>
            <Button
              onClick={togglePrivacy}
              disabled={saving}
              className={profile.allowExternalView
                ? 'bg-slate-700/80 hover:bg-slate-700 text-white border border-white/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
            >
              {saving
                ? 'Updating...'
                : profile.allowExternalView
                  ? 'Make Private'
                  : 'Make Public'}
            </Button>
          </div>

          {/* Header card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/20 backdrop-blur-xl flex items-center gap-4 overflow-hidden">
            {me?.photoDataUrl ? (
              <img src={me.photoDataUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-emerald-400" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                👩‍🎓
              </div>
            )}
            <div className="flex-1">
              <div className="text-lg font-semibold text-white">{me?.name || 'Student'} <span className="text-white/60 font-normal">(@{username})</span></div>
              <div className="text-sm text-white/60">{schoolName || '—'}</div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Profile {Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))}% complete</span>
                  <span>Next goal: {ecoPoints >= 500 ? 'Maxed!' : ecoPoints >= 100 ? `${500 - ecoPoints} pts → Big Tree` : `${100 - ecoPoints} pts → Small Tree`}</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))} />
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs">Eco-Points: {ecoPoints}</span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs">Global #{profile.ranks?.global || '-'}</span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs">School #{profile.ranks?.school || '-'}</span>
            </div>
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🎉</div>
            )}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              {/* Eco-Tree progress */}
              <Section title="My Eco-Tree">
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-pulse" aria-hidden>{stageEmoji}</div>
                  <div className="flex-1">
                    <div className="text-sm text-white/70 mb-1">{profile.ecoTreeStage}</div>
                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
                      <div className="h-3 bg-gradient-to-r from-green-500 to-green-300" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-xs text-white/60 mt-1">{ecoPoints >= 500 ? 'Max stage' : ecoPoints >= 100 ? `${ecoPoints - 100} / 400 to Big Tree` : `${ecoPoints} / 100 to Small Tree`}</div>
                  </div>
                </div>
              </Section>

              {/* Achievements */}
              <Section title="Achievements">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {profile.achievements?.map((a: any) => {
                    const emoji = a.key === 'first_task' ? '🥇' : a.key === 'top10_school' ? '🏅' : '🧠';
                    return (
                      <div key={a.key} className="p-3 rounded-lg bg-slate-800/30 border border-white/10 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${a.unlocked ? 'bg-emerald-500/40' : 'bg-slate-700/40'}`}>{emoji}</div>
                        <div>
                          <div className="font-medium text-white">{a.name}</div>
                          <div className="text-xs text-white/60">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Timeline */}
              <Section title="Contribution Timeline">
                <div className="space-y-3">
                  {(!profile.timeline || profile.timeline.length === 0) && (
                    <p className="text-white/60 text-sm">No contributions yet. Complete a task to begin your journey.</p>
                  )}
                  {profile.timeline?.map((t: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-2 top-2 h-full w-px bg-white/10" />
                      <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-emerald-500" />
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="text-xs text-white/60">{new Date(t.when).toLocaleString()}</div>
                        <div className="font-medium text-white">
                          {t.kind === 'quiz' ? `Quiz attempted: ${t.title}` : t.kind === 'game' ? `Played game: ${t.title}` : t.title}
                        </div>
                        {t.photoDataUrl && <img src={t.photoDataUrl} alt="Proof" className="mt-2 h-24 w-24 object-cover rounded" />}
                        {typeof t.scorePercent === 'number' && (
                          <div className="text-xs text-amber-200 mt-1">Score: {t.scorePercent}%</div>
                        )}
                        {typeof t.points === 'number' && t.kind !== 'game' && (
                          <div className="text-xs text-emerald-200 mt-1">Points: {t.points}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Tracker */}
              <Section title="Streak Tracker">
                <WeeklyStreak days={profile.week?.days || []} start={profile.week?.start} />
              </Section>

              {/* Leaderboard */}
              <Section title="Friends / Schoolmates Leaderboard">
                <div>
                  <div className="text-sm text-white">You're <span className="font-semibold">#{profile.ranks?.school || '-'}</span> in your school</div>
                  {profile.leaderboardNext ? (
                    <div className="text-xs text-white/60 mt-1">Next to beat <span className="text-white">@{profile.leaderboardNext.username}</span> with {profile.leaderboardNext.points} pts</div>
                  ) : (
                    <div className="text-xs text-white/60 mt-1">You're at the top! 🎉</div>
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* Privacy */}
          <Section title="Profile Visibility">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-white">Allow other schools to view my profile</div>
                  <Badge className={profile.allowExternalView ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' : 'bg-slate-500/20 text-slate-200 border-slate-400/30'}>
                    {profile.allowExternalView ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="text-xs text-white/60 mt-1">Use the button to switch between public and private visibility.</div>
              </div>
              <Button
                onClick={togglePrivacy}
                disabled={saving}
                className={profile.allowExternalView
                  ? 'bg-slate-700/80 hover:bg-slate-700 text-white border border-white/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
              >
                {saving
                  ? 'Updating...'
                  : profile.allowExternalView
                    ? 'Make Private'
                    : 'Make Public'}
              </Button>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function StudentProfileEditor({ onClose }: { onClose: () => void }) {
  const { username } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const [p, s] = await Promise.all([
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setData(p || {});
        setSchools(Array.isArray(s) ? s : []);
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
    reader.onload = () => setData((d:any) => ({ ...d, photoDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({
        name: data.name || '',
        email: data.email || '',
        schoolId: data.schoolId || '',
        photoDataUrl: data.photoDataUrl || '',
        studentId: data.studentId || '',
        rollNumber: data.rollNumber || '',
        className: data.className || '',
        section: data.section || '',
      }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to save profile');
        return;
      }
      const p = await res.json();
      setData(p);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Profile">
      {loading ? (
        <div className="text-white/60">Loading…</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              {data.photoDataUrl ? (
                <img src={data.photoDataUrl} alt="Profile" className="h-20 w-20 object-cover rounded-full border-2 border-emerald-400" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-slate-700/50 flex items-center justify-center text-white/60">No Photo</div>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={onPhoto} className="text-white bg-slate-800 rounded px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Username</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={`@${data.username || username}`} readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Role</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.role || 'student'} readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Full Name</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Email</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">School</span>
              <select className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.schoolId || ''} onChange={e => setData({ ...data, schoolId: e.target.value })}>
                <option value="">Select school…</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Student ID</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.studentId || ''} onChange={e => setData({ ...data, studentId: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Roll Number</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.rollNumber || ''} onChange={e => setData({ ...data, rollNumber: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Class</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.className || ''} onChange={e => setData({ ...data, className: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-white/70 mb-1">Section</span>
              <input className="w-full rounded-lg px-3 py-2 bg-slate-800/50 border border-white/10 text-white" value={data.section || ''} onChange={e => setData({ ...data, section: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={onClose} className="bg-slate-700 hover:bg-slate-600">Close</Button>
          </div>
          <p className="text-xs text-white/60">Update your details. Changes will reflect in your profile header and timeline context.</p>
        </div>
      )}
    </Section>
  );
}

function WeeklyStreak({ days, start }: { days: boolean[]; start?: number }) {
  const labels = ['M','T','W','T','F','S','S'];
  return (
    <div>
      <div className="flex gap-2">
        {labels.map((l, i) => (
          <div key={i} className={`flex flex-col items-center text-xs ${days[i] ? 'text-white' : 'text-white/40'}`}>
            <div className={`h-6 w-6 rounded-full border flex items-center justify-center mb-1 ${days[i] ? 'bg-emerald-500/60 border-emerald-400' : 'border-white/20'}`}>{l}</div>
          </div>
        ))}
      </div>
      {start && <div className="text-[10px] text-white/50 mt-2">Week of {new Date(start).toLocaleDateString()}</div>}
    </div>
  );
}

function NotificationsBell() {
  const { username } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prof = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        setUnread(Number(prof?.unreadNotifications || 0));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [username]);

  const load = async () => {
    try {
      const list = await fetch('/api/notifications', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setItems([]);
    }
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const next = !open;
    setOpen(next);
    
    if (next && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
      
      await load();
      try {
        await fetch('/api/notifications/read', { method: 'POST', headers: { 'X-Username': username || '' } });
        setUnread(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  };

  const closeNotifications = () => {
    setOpen(false);
  };

  const notificationPanel = open && (
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={closeNotifications}
        aria-hidden="true"
      />
      
      <div 
        className="fixed w-80 max-h-96 overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl z-[9999]"
        style={{
          top: position.top,
          right: position.right
        }}
      >
        <div className="p-3 text-sm font-medium text-white border-b border-white/10">
          Notifications
          {unread > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unread} new</span>}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-white/70 text-sm">No notifications yet</div>
              <div className="text-white/50 text-xs mt-1">We'll notify you about important updates</div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {items.map((n, i) => (
                <div key={i} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="text-sm text-white">{n.message}</div>
                  <div className="text-xs text-white/50 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-2 border-t border-white/10">
            <button 
              onClick={closeNotifications}
              className="w-full text-xs text-white/70 hover:text-white py-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggle} 
        className="relative h-9 w-9 grid place-items-center rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors"
        aria-label="Toggle notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] grid place-items-center font-medium">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      
      {typeof window !== 'undefined' && notificationPanel && createPortal(notificationPanel, document.body)}
    </>
  );
}
