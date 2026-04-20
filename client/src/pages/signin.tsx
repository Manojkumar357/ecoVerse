import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const { setSession, role } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const storyCards = [
    {
      title: "EcoVerse for learners",
      description: "A gamified environmental platform where students explore, grow, and earn eco-points through real action.",
      accent: "from-emerald-400 to-cyan-400",
      badge: "Project Overview",
      stat: "Learning + impact",
      img: "/images/ecology_learning_bg.png",
    },
    {
      title: "Games that teach",
      description: "Interactive challenges, quizzes, and missions keep the experience fun while building real eco habits.",
      accent: "from-sky-400 to-blue-500",
      badge: "Games & Quizzes",
      stat: "Play to progress",
      img: "/images/games_quizzes_bg.png",
    },
    {
      title: "Built for kids",
      description: "Friendly visuals, simple navigation, and a safe experience that helps younger users stay engaged.",
      accent: "from-amber-400 to-orange-500",
      badge: "Kid Friendly",
      stat: "Simple & playful",
      img: "/images/kids_friendly_bg.png",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("role") === "admin") setIsAdminMode(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (role) {
      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else navigate("/student");
    }
  }, [role, navigate]);

  const signin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      if (!data.ok) throw new Error("Invalid credentials or not approved yet");
      setSession({ role: data.role, username: data.username });
      
      // Small delay to ensure session is set
      setTimeout(() => {
        if (data.role === "admin") navigate("/admin");
        else if (data.role === "teacher") navigate("/teacher");
        else navigate("/student");
      }, 100);
    } catch (e: any) {
      try {
        const st = await fetch(
          `/api/application-status/${encodeURIComponent(username)}`
        ).then((r) => r.json());
        if (st?.status === "pending") {
          setPendingUser(username);
          setError(null);
        } else {
          setError(e?.message || "Login error");
        }
      } catch {
        setError(e?.message || "Login error");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!username) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/application-status/${encodeURIComponent(username)}`
      );
      const data = await res.json();
      if (data.status === "approved") {
        setPendingUser(null);
        setError(null);
      } else if (data.status === "rejected") {
        setPendingUser(null);
        setError("Your application was rejected.");
      } else {
        setError("Application is still pending approval.");
      }
    } catch {
      setError("Could not check status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-6 py-8 text-white bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(160deg,_#07141a_0%,_#092b24_42%,_#030b10_100%)]">
      <style>{`
        @keyframes panBg {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-pan-bg {
          animation: panBg 20s linear infinite alternate;
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-[-5rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" style={{ animationDelay: '900ms' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/5 blur-3xl animate-pulse" style={{ animationDelay: '1800ms' }} />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
        <div className="space-y-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-2 text-sm text-white/80 mb-5 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              EcoVerse Learning Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {isAdminMode ? 'Admin Sign In' : 'Welcome back to EcoVerse'}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/75 max-w-2xl">
              {isAdminMode
                ? 'Access the admin workspace to manage the platform and approvals.'
                : 'Sign in to continue your eco journey, unlock missions, and track your impact.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storyCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl shadow-black/20 transition-transform duration-300"
              >
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay animate-pan-bg group-hover:[animation-play-state:paused]"
                  style={{
                    backgroundImage: `url('${card.img}')`,
                    backgroundSize: 'cover',
                  }}
                />
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent} z-10`} />
                <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                  <span className={`inline-flex rounded-full bg-gradient-to-r ${card.accent} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg`}>
                    {card.badge}
                  </span>
                  <span className="text-xs text-white/70 font-medium">{card.stat}</span>
                </div>
                <h2 className="relative z-10 text-lg font-semibold text-white mb-2 drop-shadow-md">{card.title}</h2>
                <p className="relative z-10 text-sm leading-6 text-white/80 drop-shadow">{card.description}</p>
                <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-2xl group-hover:bg-white/15 transition-colors z-10 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -top-10 -left-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/30 p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300" />

            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Sign in to your account
              </h2>
              <p className="mt-2 text-white/65">
                Continue where you left off and keep your progress moving.
              </p>
            </div>

            {pendingUser && (
              <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-6 w-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-100">Your application is pending approval. Check back soon!</div>
                    <Button
                      className="mt-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={checking}
                      onClick={checkStatus}
                    >
                      {checking ? 'Checking...' : 'Check Status'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && !pendingUser && (
              <div className="mb-6 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm font-medium text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); signin(); }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/75 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10 hover:border-white/25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/75 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 hover:border-white/25"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || pendingUser !== null}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-400 hover:via-cyan-400 hover:to-emerald-500 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/65">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-bold text-emerald-300 underline underline-offset-4 transition-colors hover:text-emerald-200"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
