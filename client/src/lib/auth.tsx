import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type Role = "admin" | "student" | "teacher" | null;

type AuthContextValue = {
  role: Role;
  username: string | null;
  setRole: (r: Role) => void;
  setSession: (r: { role: Exclude<Role, null>; username: string }) => void;
  clear: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CLIENT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_WARNING_BEFORE_MS = 2 * 60 * 1000;
const SESSION_PING_THROTTLE_MS = 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const warningCountdownRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastPingRef = useRef<number>(0);
  const touchSessionRef = useRef<(() => void) | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(Math.floor(SESSION_WARNING_BEFORE_MS / 1000));

  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem("app.role");
    return (saved as Role) || null;
  });
  const [username, setUsername] = useState<string | null>(() => {
    const u = localStorage.getItem("app.username");
    return u || null;
  });

  const setRole = (r: Role) => {
    setRoleState(r);
    if (r) localStorage.setItem("app.role", r);
    else localStorage.removeItem("app.role");
  };

  const setSession = (r: { role: Exclude<Role, null>; username: string }) => {
    setRoleState(r.role);
    setUsername(r.username);
    localStorage.setItem("app.role", r.role);
    localStorage.setItem("app.username", r.username);
  };

  const clear = () => {
    setRole(null);
    setUsername(null);
    setShowSessionWarning(false);
    localStorage.removeItem("app.role");
    localStorage.removeItem("app.username");
    void fetch("/api/logout", { method: "POST" }).catch(() => undefined);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/session");
        if (!active) return;
        if (!res.ok) {
          setRoleState(null);
          setUsername(null);
          setShowSessionWarning(false);
          localStorage.removeItem("app.role");
          localStorage.removeItem("app.username");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setRoleState((data.role as Role) || null);
        setUsername(data.username || null);
        if (data.role) localStorage.setItem("app.role", data.role);
        if (data.username) localStorage.setItem("app.username", data.username);
      } catch {
        if (!active) return;
        setRoleState(null);
        setUsername(null);
        setShowSessionWarning(false);
        localStorage.removeItem("app.role");
        localStorage.removeItem("app.username");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!role) {
      setShowSessionWarning(false);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        window.clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (warningCountdownRef.current) {
        window.clearInterval(warningCountdownRef.current);
        warningCountdownRef.current = null;
      }
      touchSessionRef.current = null;
      return;
    }

    const logoutForInactivity = () => {
      setRoleState(null);
      setUsername(null);
      setShowSessionWarning(false);
      localStorage.removeItem("app.role");
      localStorage.removeItem("app.username");
      void fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    };

    const closeWarning = () => {
      setShowSessionWarning(false);
      if (warningCountdownRef.current) {
        window.clearInterval(warningCountdownRef.current);
        warningCountdownRef.current = null;
      }
    };

    const refreshWarningCountdown = () => {
      const remainingMs = Math.max(CLIENT_IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current), 0);
      setWarningSecondsLeft(Math.ceil(remainingMs / 1000));
    };

    const openWarning = () => {
      setShowSessionWarning(true);
      refreshWarningCountdown();
      if (warningCountdownRef.current) window.clearInterval(warningCountdownRef.current);
      warningCountdownRef.current = window.setInterval(() => {
        refreshWarningCountdown();
      }, 1000);
    };

    const scheduleIdleLogout = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(CLIENT_IDLE_TIMEOUT_MS - elapsed, 0);
      idleTimerRef.current = window.setTimeout(logoutForInactivity, remaining);
    };

    const scheduleWarning = () => {
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(CLIENT_IDLE_TIMEOUT_MS - elapsed, 0);
      const showAfter = Math.max(remaining - SESSION_WARNING_BEFORE_MS, 0);
      warningTimerRef.current = window.setTimeout(openWarning, showAfter);
    };

    const pingSession = () => {
      const now = Date.now();
      if (now - lastPingRef.current < SESSION_PING_THROTTLE_MS) return;
      lastPingRef.current = now;
      void fetch("/api/session/ping", { method: "POST" })
        .then((res) => {
          if (res.status === 401) logoutForInactivity();
        })
        .catch(() => undefined);
    };

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      closeWarning();
      scheduleIdleLogout();
      scheduleWarning();
      pingSession();
    };

    touchSessionRef.current = onActivity;

    onActivity();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") onActivity();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      document.removeEventListener("visibilitychange", onVisibility);
      touchSessionRef.current = null;
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        window.clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (warningCountdownRef.current) {
        window.clearInterval(warningCountdownRef.current);
        warningCountdownRef.current = null;
      }
    };
  }, [role]);

  const value = useMemo(() => ({ role, username, setRole, setSession, clear }), [role, username]);
  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionWarning && role && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-300/40 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-amber-200">Session Expiring Soon</h3>
            <p className="mt-2 text-sm text-white/80">
              You will be logged out in about {warningSecondsLeft} seconds due to inactivity.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={clear}
                className="rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={() => touchSessionRef.current?.()}
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-emerald-300"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
