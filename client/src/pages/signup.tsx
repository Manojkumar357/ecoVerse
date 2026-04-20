import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function SignUpPage() {
  const { setRole, clear } = useAuth();
  const [, navigate] = useLocation();

  const choose = (r: "student" | "teacher" | "admin") => {
    if (r === "admin") {
      // Clear any existing role before navigating to admin signin
      clear();
      navigate("/signin?role=admin");
      return;
    }
    // For student/teacher signup, set the role temporarily
    // setRole(r);
    if (r === "student") navigate("/student/signup");
    else navigate("/teacher/signup");
  };

  return (
    <SignupAnimatedBackground elementCount={16}>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 -right-20 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-4 border-white/20 transform hover:scale-[1.01] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-blue-400 via-green-400 to-emerald-500 p-4 rounded-full mb-4 shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">Join EcoVerse!</h1>
            <p className="text-gray-700 text-xl font-medium">Choose your role to create an account</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Student Card */}
            <button
              onClick={() => choose("student")}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-3 border-green-300 hover:border-green-400 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              data-testid="role-student-button"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-green-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">I'm a Student</h3>
                <p className="text-sm text-gray-600 text-center">Join our learning community</p>
              </div>
            </button>

            {/* Teacher Card */}
            <button
              onClick={() => choose("teacher")}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 hover:from-blue-200 hover:to-sky-200 border-3 border-blue-300 hover:border-blue-400 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              data-testid="role-teacher-button"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">I'm a Teacher</h3>
                <p className="text-sm text-gray-600 text-center">Guide the next generation</p>
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => choose("admin")}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border-3 border-orange-300 hover:border-orange-400 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              data-testid="role-admin-button"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-orange-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Admin</h3>
                <p className="text-sm text-gray-600 text-center">Manage the platform</p>
              </div>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-gray-600 text-base">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-blue-600 hover:text-blue-700 font-bold underline transition-colors"
                data-testid="goto-signin-link"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </SignupAnimatedBackground>
  );
}
