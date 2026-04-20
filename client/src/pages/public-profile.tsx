import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Target, Award, CheckCircle2, TrendingUp, ArrowLeft, Lock, Zap, Copy } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface TimelineItem {
  kind: string;
  when: number;
  title: string;
  photoDataUrl?: string;
  points?: number;
  scorePercent?: number;
}

interface PublicProfileData {
  username: string;
  name: string;
  ecoPoints: number;
  ecoTreeStage: string;
  achievements: Array<{ key: string; name: string; unlocked: boolean }>;
  ranks: { global: number | null; school: number | null };
  timeline: TimelineItem[];
  schoolId?: string;
}

export default function PublicProfilePage() {
  const [, params] = useRoute("/profile/:profileId");
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.profileId) {
      try {
        // Decode the profile ID to get username
        const username = atob(params.profileId);
        
        // Fetch real profile data from API
        (async () => {
          try {
            const response = await fetch(`/api/public-profile/${username}`);
            
            if (!response.ok) {
              if (response.status === 404) {
                setError("Profile not found");
              } else if (response.status === 403) {
                setError("This profile is private");
              } else {
                setError(await response.json().then(d => d.error).catch(() => "Failed to load profile"));
              }
              setLoading(false);
              return;
            }
            
            const data = await response.json();
            setProfileData(data);
            setLoading(false);
          } catch (err) {
            setError("Failed to load profile");
            setLoading(false);
          }
        })();
      } catch (err) {
        setError("Invalid profile ID");
        setLoading(false);
      }
    }
  }, [params?.profileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white px-4 py-6 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_24%),linear-gradient(160deg,_#08151b_0%,_#071f22_40%,_#030b11_100%)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-[-5rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" style={{ animationDelay: '900ms' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto min-h-[calc(100vh-3rem)] flex items-center">
          <div className="w-full rounded-3xl border border-white/15 bg-white/8 backdrop-blur-2xl shadow-2xl shadow-black/30 p-6 md:p-10 text-center">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 0.8 }}
                className="absolute inset-0 bg-amber-400/10"
              />
              <Lock className="relative z-10 w-10 h-10 text-amber-300" />
            </div>

            <Badge className="mb-4 bg-amber-500/15 text-amber-200 border-amber-300/20 px-3 py-1 rounded-full">
              Private Profile
            </Badge>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{error}</h1>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              {error === "This profile is private"
                ? "This student has not enabled public visibility yet. Once they switch their profile to Public in the dashboard, the link will load here."
                : "The profile you opened could not be found or is unavailable right now."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/60 mb-1">What happened</div>
                <div className="font-medium text-white">The profile is currently hidden from public view.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/60 mb-1">How to fix</div>
                <div className="font-medium text-white">The owner must tap Make Public in their student dashboard.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/60 mb-1">After that</div>
                <div className="font-medium text-white">Refresh this page or reopen the same link.</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/15">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <a href="/student">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-300/20">
                  Open Student Dashboard
                </Button>
              </a>
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                  } catch {
                    // ignore clipboard failures
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/15"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tasksCount = profileData.timeline.filter(t => t.kind === 'task').length;
  const quizzesCount = profileData.timeline.filter(t => t.kind === 'quiz').length;
  const gamesCount = profileData.timeline.filter(t => t.kind === 'game').length;
  const unlockedAchievements = profileData.achievements.filter(a => a.unlocked).length;

  const stageEmoji = profileData.ecoTreeStage === 'Big Tree' ? '🌳' : profileData.ecoTreeStage === 'Small Tree' ? '🌲' : '🌱';
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white px-4 py-6 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(160deg,_#08151b_0%,_#052f2a_45%,_#031018_100%)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-[-5rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" style={{ animationDelay: '900ms' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-lime-300/5 blur-3xl animate-pulse" style={{ animationDelay: '1800ms' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-300/20 px-3 py-1 rounded-full">
            Public Profile
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/8 backdrop-blur-2xl shadow-2xl shadow-black/30 p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(14,165,233,0.08),rgba(251,191,36,0.08))]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] items-center">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-lime-300 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-4xl">
                {stageEmoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{profileData.name || profileData.username}</h1>
                  <Badge className="bg-white/10 text-white/80 border border-white/10">{profileData.ecoTreeStage}</Badge>
                </div>
                <p className="text-white/70 mt-1">@{profileData.username}</p>
                <p className="text-sm text-white/60 mt-3 max-w-2xl">
                  Public progress snapshot showing eco-points, achievements, and recent contribution history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Points</div>
                <div className="text-2xl font-bold text-emerald-300">{profileData.ecoPoints}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Global</div>
                <div className="text-2xl font-bold text-amber-300">{profileData.ranks.global ? `#${profileData.ranks.global}` : '—'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">School</div>
                <div className="text-2xl font-bold text-cyan-300">{profileData.ranks.school ? `#${profileData.ranks.school}` : '—'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => scrollToSection('overview')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">Overview</Button>
          <Button onClick={() => scrollToSection('activity')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">Activity</Button>
          <Button onClick={() => scrollToSection('achievements')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">Achievements</Button>
          <Button onClick={() => scrollToSection('timeline')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">Timeline</Button>
        </div>

        <motion.div
          id="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 text-emerald-300 mb-2"><Zap className="w-4 h-4" /> Eco Points</div>
            <div className="text-3xl font-bold text-white">{profileData.ecoPoints}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 text-amber-300 mb-2"><Trophy className="w-4 h-4" /> Rankings</div>
            <div className="text-sm text-white/70">Global {profileData.ranks.global ? `#${profileData.ranks.global}` : '—'}</div>
            <div className="text-sm text-white/70">School {profileData.ranks.school ? `#${profileData.ranks.school}` : '—'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 text-cyan-300 mb-2"><BookOpen className="w-4 h-4" /> Tree Stage</div>
            <div className="text-3xl font-bold text-white">{profileData.ecoTreeStage}</div>
          </div>
        </motion.div>

        <motion.div
          id="activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/8 backdrop-blur-xl shadow-2xl p-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <h2 className="text-2xl font-bold text-white/95 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-300" /> Activity Summary
            </h2>
            <div className="text-sm text-white/60">A quick snapshot of contributions and progress</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 hover:border-emerald-300/30 transition-colors">
              <Trophy className="w-7 h-7 text-emerald-300 mb-3" />
              <div className="text-3xl font-bold text-white">{unlockedAchievements}</div>
              <div className="text-emerald-200 text-sm mt-1">Achievements unlocked</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 hover:border-cyan-300/30 transition-colors">
              <BookOpen className="w-7 h-7 text-cyan-300 mb-3" />
              <div className="text-3xl font-bold text-white">{tasksCount}</div>
              <div className="text-cyan-200 text-sm mt-1">Tasks completed</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 hover:border-amber-300/30 transition-colors">
              <Target className="w-7 h-7 text-amber-300 mb-3" />
              <div className="text-3xl font-bold text-white">{quizzesCount}</div>
              <div className="text-amber-200 text-sm mt-1">Quizzes completed</div>
            </div>
          </div>
        </motion.div>

        {profileData.achievements && profileData.achievements.length > 0 && (
          <motion.div
            id="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/8 backdrop-blur-xl shadow-2xl p-6"
          >
            <h3 className="text-2xl font-bold text-white/95 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-300" /> Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {profileData.achievements.map((achievement) => (
                <div
                  key={achievement.key}
                  className={`group p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    achievement.unlocked
                      ? 'bg-emerald-500/15 border-emerald-300/20 hover:border-emerald-200/40'
                      : 'bg-black/15 border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {achievement.unlocked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/35 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-white">{achievement.name}</p>
                      <p className="text-xs text-white/60">{achievement.unlocked ? 'Unlocked' : 'Locked'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profileData.timeline && profileData.timeline.length > 0 && (
          <motion.div
            id="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/8 backdrop-blur-xl shadow-2xl p-6"
          >
            <h3 className="text-2xl font-bold text-white/95 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-300" /> Recent Activity
            </h3>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {profileData.timeline.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-white/10 hover:border-cyan-300/20 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {item.kind === 'task' ? '✅' : item.kind === 'quiz' ? '🧠' : '🎮'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.title}</p>
                    <p className="text-white/55 text-xs mt-1">{new Date(item.when).toLocaleString()}</p>
                    {(item.points || item.scorePercent) && (
                      <p className="text-emerald-300 text-sm mt-2">
                        {typeof item.points === 'number' ? `+${item.points} points` : ''}
                        {typeof item.points === 'number' && typeof item.scorePercent === 'number' ? ' • ' : ''}
                        {typeof item.scorePercent === 'number' ? `Score: ${item.scorePercent}%` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}