import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Bell, MessageCircle } from "lucide-react";
import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";

export default function AnnouncementsPage() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const me = await fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
  const teacherMode = me?.role === 'teacher';
  const url = teacherMode ? '/api/teacher/announcements' : '/api/student/announcements';
  const data = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);
  
  const sortedList = [...list].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <SignupAnimatedBackground elementCount={20} className="text-white">
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={36} className="text-yellow-300 group-hover:scale-110 transition-transform" />
            <h1 className="text-4xl font-bold text-white/95 group-hover:text-white transition-colors">Announcements</h1>
          </div>
          <p className="mt-2 text-white/70 group-hover:text-white/80 transition-colors">Stay updated with the latest news and important updates</p>
        </div>
        
        {loading ? (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin"></div>
              <p className="text-white/70">Loading announcements...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent backdrop-blur-2xl border border-blue-400/30 shadow-2xl rounded-2xl p-12 text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">No announcements yet. Check back soon for updates!</p>
              </div>
            )}
            {sortedList.map((a, idx) => {
              const isExpanded = expandedId === a.id;
              const date = new Date(a.createdAt);
              const isRecent = (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000; // Less than 24 hours
              
              return (
                <div 
                  key={a.id}
                  className="group cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isExpanded 
                        ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/30 shadow-2xl' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:from-white/15 hover:to-white/10 hover:border-white/30 hover:shadow-xl'
                    }`}
                  >
                    {/* Animated gradient edge */}
                    {isRecent && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse"></div>
                    )}
                    
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="p-6 relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white/95 group-hover:text-white transition-colors flex-1">{a.title}</h3>
                            {isRecent && (
                              <span className="text-xs bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 px-3 py-1 rounded-full border border-yellow-400/50 animate-pulse">
                                🔥 New
                              </span>
                            )}
                          </div>
                          {a.body && (
                            <p className={`text-sm text-white/70 transition-all ${
                              isExpanded ? '' : 'line-clamp-2'
                            }`}>
                              {a.body}
                            </p>
                          )}
                        </div>
                        <div className="text-2xl transform transition-transform duration-300 ml-4" style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </div>
                      </div>
                      
                      {/* Date and meta info */}
                      <div className="flex items-center gap-4 text-xs text-white/60 group-hover:text-white/70 transition-colors">
                        <span className="flex items-center gap-1">
                          📅 {date.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          🕐 {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Expanded full content */}
                      {isExpanded && a.body && (
                        <div className="mt-4 pt-4 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="prose prose-invert max-w-none">
                            <p className="text-white/85 leading-relaxed whitespace-pre-wrap">
                              {a.body}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                            <span className="flex items-center gap-1">✓ Posted {date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .prose-invert {
          --tw-prose-body: rgba(255, 255, 255, 0.85);
          --tw-prose-headings: rgba(255, 255, 255, 0.95);
          --tw-prose-lead: rgba(255, 255, 255, 0.75);
          --tw-prose-links: #60a5fa;
          --tw-prose-bold: rgba(255, 255, 255, 0.95);
          --tw-prose-counters: #60a5fa;
          --tw-prose-bullets: rgba(255, 255, 255, 0.3);
          --tw-prose-hr: rgba(255, 255, 255, 0.1);
          --tw-prose-quotes: rgba(255, 255, 255, 0.7);
          --tw-prose-quote-borders: rgba(59, 130, 246, 0.5);
          --tw-prose-captions: rgba(255, 255, 255, 0.7);
          --tw-prose-code: rgba(255, 255, 255, 0.9);
          --tw-prose-pre-bg: rgba(0, 0, 0, 0.2);
          --tw-prose-pre-border: rgba(255, 255, 255, 0.1);
          --tw-prose-th-borders: rgba(255, 255, 255, 0.2);
          --tw-prose-td-borders: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </SignupAnimatedBackground>
  );
}
