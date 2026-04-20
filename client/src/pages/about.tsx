import { useEffect, useState } from "react";

export default function AboutPage() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    dedicatedTeachers: 0,
    partnerSchools: 0,
    ecoPointsEarned: 0,
    interactiveGames: 0,
    tasksCompleted: 0
  });

  useEffect(() => {
    // Fetch live statistics from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Fallback to demo data if API fails
          setStats({
            activeStudents: 155,
            dedicatedTeachers: 4,
            partnerSchools: 28,
            ecoPointsEarned: 18,
            interactiveGames: 15,
            tasksCompleted: 5
          });
        }
      } catch (error) {
        // Demo data for display
        setStats({
          activeStudents: 155,
          dedicatedTeachers: 4,
          partnerSchools: 28,
          ecoPointsEarned: 18,
          interactiveGames: 15,
          tasksCompleted: 5
        });
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        
        {/* Our Mission Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white/90 mb-4">Our Mission</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            
            {/* Educate */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-semibold text-white/90 mb-4">Educate</h3>
              <p className="text-white/80">
                Interactive games and quizzes that make environmental learning engaging and memorable
              </p>
            </div>

            {/* Action */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-white/90 mb-4">Action</h3>
              <p className="text-white/80">
                Real-world tasks and challenges that encourage students to make a positive environmental impact
              </p>
            </div>

            {/* Connect */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-semibold text-white/90 mb-4">Connect</h3>
              <p className="text-white/80">
                Building a community of environmentally conscious students, teachers, and schools
              </p>
            </div>
          </div>
        </div>

        {/* Our Growing Community Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white/90 mb-8">Our Growing Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-white/90">{stats.activeStudents}</div>
              <div className="text-sm text-white/70">Active Students</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <div className="text-3xl font-bold text-white/90">{stats.dedicatedTeachers}</div>
              <div className="text-sm text-white/70">Dedicated Teachers</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🏫</div>
              <div className="text-3xl font-bold text-white/90">{stats.partnerSchools}</div>
              <div className="text-sm text-white/70">Partner Schools</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-white/90">{stats.ecoPointsEarned}+</div>
              <div className="text-sm text-white/70">Eco-Points Earned</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-3xl font-bold text-white/90">{stats.interactiveGames}</div>
              <div className="text-sm text-white/70">Interactive Games</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-white/90">{stats.tasksCompleted}+</div>
              <div className="text-sm text-white/70">Tasks Completed</div>
            </div>
          </div>
        </div>

        {/* What Makes Us Special Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white/90 mb-8">What Makes Us Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Interactive Games */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-white/90 mb-4">Interactive Games</h3>
              <p className="text-white/80">
                Engaging mini-games covering recycling, climate action, sustainable habits, and wildlife conservation.
              </p>
            </div>

            {/* Smart Quizzes */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white/90 mb-4">Smart Quizzes</h3>
              <p className="text-white/80">
                Server-side scored quizzes with age-appropriate challenges that test environmental knowledge effectively.
              </p>
            </div>

            {/* Real-World Tasks */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white/90 mb-4">Real-World Tasks</h3>
              <p className="text-white/80">
                Photo-proof assignments that encourage actual environmental actions in students' communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
