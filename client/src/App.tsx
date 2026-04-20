import { Switch, Route, useLocation } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute, AdminOnlyRoute, StudentOrTeacherRoute } from "@/components/ProtectedRoute";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { CustomCursorProvider } from "@/components/CustomCursor";
const Home = lazy(() => import("@/pages/home"));
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AboutPage = lazy(() => import("@/pages/about"));
const SignInPage = lazy(() => import("@/pages/signin"));
const SignUpPage = lazy(() => import("@/pages/signup"));
const GamesPage = lazy(() => import("@/pages/games"));
const GamePlayPage = lazy(() => import("./pages/game-play"));
const LearnPage = lazy(() => import("@/pages/learn"));
const QuizzesPage = lazy(() => import("@/pages/quizzes"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const AssignmentsPage = lazy(() => import("@/pages/assignments"));
const AnnouncementsPage = lazy(() => import("@/pages/announcements"));
const ContactHelpPage = lazy(() => import("@/pages/contact"));
const AdminPortal = lazy(() => import("@/pages/admin"));
const StudentSignupWizard = lazy(() => import("@/pages/student-signup"));
const TeacherSignupWizard = lazy(() => import("@/pages/teacher-signup"));
const StudentAppShell = lazy(() => import("@/pages/student"));
const TeacherAppShell = lazy(() => import("@/pages/teacher"));
const VideosPage = lazy(() => import("@/pages/videos"));
const PublicProfilePage = lazy(() => import("@/pages/public-profile"));
const EcoVisionPage = lazy(() => import("@/pages/ecovision"));
import { AppHamburger } from "@/components/AppHamburger";

function Router() {
  const [location] = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Switch key={location}>
        <Route path="/">
          {() => (
            <PageTransition>
              <Home />
            </PageTransition>
          )}
        </Route>
        <Route path="/about">
          {() => (
            <PageTransition>
              <AboutPage />
            </PageTransition>
          )}
        </Route>
        <Route path="/signin">
          {() => (
            <PageTransition>
              <SignInPage />
            </PageTransition>
          )}
        </Route>
        <Route path="/signup">
          {() => (
            <PageTransition>
              <SignUpPage />
            </PageTransition>
          )}
        </Route>
        <Route path="/contact">
          {() => (
            <PageTransition>
              <ContactHelpPage />
            </PageTransition>
          )}
        </Route>
      
      {/* Admin only routes */}
      <Route path="/admin">
        {() => (
          <PageTransition>
            <AdminOnlyRoute>
              <AdminPortal />
            </AdminOnlyRoute>
          </PageTransition>
        )}
      </Route>
      
      {/* Signup flows - no authentication required */}
      <Route path="/student/signup">
        {() => (
          <PageTransition>
            <StudentSignupWizard />
          </PageTransition>
        )}
      </Route>
      <Route path="/teacher/signup">
        {() => (
          <PageTransition>
            <TeacherSignupWizard />
          </PageTransition>
        )}
      </Route>
      
      {/* Role-specific app shells */}
      <Route path="/student">
        {() => (
          <PageTransition>
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAppShell />
            </ProtectedRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/teacher">
        {() => (
          <PageTransition>
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAppShell />
            </ProtectedRoute>
          </PageTransition>
        )}
      </Route>
      
      {/* Pages requiring authentication but available to both students and teachers */}
      <Route path="/games/play/:id">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <GamePlayPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/games">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <GamesPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/learn">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <LearnPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/quizzes">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <QuizzesPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/leaderboard">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <LeaderboardPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/tasks">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <TasksPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/assignments">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <AssignmentsPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/videos">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <VideosPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/ecovision">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <EcoVisionPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/announcements">
        {() => (
          <PageTransition>
            <StudentOrTeacherRoute>
              <AnnouncementsPage />
            </StudentOrTeacherRoute>
          </PageTransition>
        )}
      </Route>
      <Route path="/integrations">
        {() => (
          <PageTransition>
            <ProtectedRoute requireAuth={true}>
              <IntegrationsPage />
            </ProtectedRoute>
          </PageTransition>
        )}
      </Route>
      
      {/* Public profile view - no authentication required */}
      <Route path="/profile/:profileId">
        {() => (
          <PageTransition>
            <PublicProfilePage />
          </PageTransition>
        )}
      </Route>
      
      <Route>
        {() => (
          <PageTransition>
            <NotFound />
          </PageTransition>
        )}
      </Route>
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950">
      <div className="flex flex-col items-center gap-3 text-white/90">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white/80 animate-spin" />
        <div className="text-sm tracking-wide">Loading...</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {/* Custom Cursor with Eco Theme */}
          <CustomCursorProvider />
          {/* Global menu overlay available on all routes */}
          <div className="fixed top-4 left-4 z-[60] pointer-events-none">
            <AppHamburger />
          </div>
          {/* Safe area to prevent content underlapping the hamburger on small screens */}
          <div className="relative">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
