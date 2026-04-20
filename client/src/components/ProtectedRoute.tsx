import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

type Role = "admin" | "student" | "teacher";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true, 
  redirectTo = "/signin" 
}: ProtectedRouteProps) {
  const { role } = useAuth();
  const [, setLocation] = useLocation();
  const isUnauthorized = requireAuth && !role;
  const isForbidden = allowedRoles && role && !allowedRoles.includes(role);

  useEffect(() => {
    // If authentication is required but user is not logged in
    if (isUnauthorized) {
      setLocation(redirectTo);
      return;
    }

    // If specific roles are required but user doesn't have the right role
    if (isForbidden) {
      // Redirect based on user's actual role
      if (role === 'student') {
        setLocation('/student');
      } else if (role === 'teacher') {
        setLocation('/teacher');
      } else if (role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
      return;
    }
  }, [role, allowedRoles, requireAuth, redirectTo, setLocation, isUnauthorized, isForbidden]);

  // Don't render if user doesn't meet requirements
  if (isUnauthorized || isForbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950">
        <div className="flex flex-col items-center gap-3 text-white/90">
          <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white/80 animate-spin" />
          <div className="text-sm tracking-wide">Redirecting...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for specific role protection
export function StudentOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {children}
    </ProtectedRoute>
  );
}

export function TeacherOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentOrTeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student", "teacher"]}>
      {children}
    </ProtectedRoute>
  );
}