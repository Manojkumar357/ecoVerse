import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { FileUp, Check, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";

export default function AssignmentsPage() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        const teacherMode = me?.role === 'teacher';
        let data: any[] = [];
        if (teacherMode) {
          data = await fetch('/api/teacher/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        } else {
          data = await fetch('/api/student/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        }
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const onUpload = async (assignmentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const arr: string[] = [];
    for (const f of Array.from(files)) {
      if (!accepted.includes(f.type)) continue;
      const b64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ''));
        r.onerror = () => reject(new Error('read failed'));
        r.readAsDataURL(f);
      });
      arr.push(b64);
    }
    if (arr.length === 0) {
      alert('Only PDF/DOC/DOCX files are accepted.');
      return;
    }
    setUploadingId(assignmentId);
    try {
      const res = await fetch(`/api/student/assignments/${encodeURIComponent(assignmentId)}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ files: arr }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to submit assignment');
        return;
      }
      // reload list
      const data = await fetch('/api/student/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setList(Array.isArray(data) ? data : []);
    } finally {
      setUploadingId(null);
    }
  };
  
  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'submitted': return <Clock size={16} className="text-amber-300" />;
      case 'approved': return <Check size={16} className="text-emerald-300" />;
      case 'rejected': return <AlertCircle size={16} className="text-red-300" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'submitted': return 'from-amber-500/10 to-transparent border-amber-400/30 text-amber-200';
      case 'approved': return 'from-emerald-500/10 to-transparent border-emerald-400/30 text-emerald-200';
      case 'rejected': return 'from-red-500/10 to-transparent border-red-400/30 text-red-200';
      default: return 'from-blue-500/10 to-transparent border-blue-400/30 text-blue-200';
    }
  };
  
  return (
    <SignupAnimatedBackground elementCount={20} className="text-white">
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">📝</div>
            <h1 className="text-4xl font-bold text-white/95 group-hover:text-white transition-colors">Assignments</h1>
          </div>
          <p className="mt-2 text-white/70 group-hover:text-white/80 transition-colors">Complete and submit your assignments to earn points</p>
        </div>
        
        {loading ? (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin"></div>
              <p className="text-white/70">Loading assignments...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent backdrop-blur-2xl border border-blue-400/30 shadow-2xl rounded-2xl p-8 text-center">
                <div className="text-5xl mb-3">🎓</div>
                <p className="text-white/70 text-lg">No assignments yet. Check back soon!</p>
              </div>
            )}
            {list.map((row, idx) => {
              const a = row.assignment || row;
              const submission = row.submission;
              const isExpanded = expandedId === a.id;
              
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="p-6 relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white/95 group-hover:text-white transition-colors">{a.title}</h3>
                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white/80">Max {a.maxPoints} pts</span>
                          </div>
                          {a.description && <p className="text-sm text-white/70 line-clamp-2 mb-2">{a.description}</p>}
                        </div>
                        <div className="text-2xl transform transition-transform duration-300" style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </div>
                      </div>
                      
                      {/* Quick info */}
                      <div className="flex items-center gap-4 mb-3">
                        {a.deadline && (
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            📅 Deadline: {new Date(a.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {submission && (
                          <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(submission.status)} border`}>
                            {getStatusIcon(submission.status)}
                            <span className="capitalize font-semibold">{submission.status}</span>
                            {typeof submission.points !== 'undefined' && (
                              <span className="ml-1">• {submission.points} pts</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded section */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300">
                          {submission ? (
                            <div className={`p-4 rounded-xl bg-gradient-to-r ${getStatusColor(submission.status)} border backdrop-blur-sm`}>
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(submission.status)}
                                <span className="font-semibold capitalize">{submission.status}</span>
                              </div>
                              <p className="text-sm opacity-90">
                                {submission.status === 'approved' && `✓ Your submission was approved!`}
                                {submission.status === 'submitted' && `⏳ Waiting for teacher review...`}
                                {submission.status === 'rejected' && `✗ Your submission needs revision.`}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-white/80">📤 Upload your assignment (PDF, DOC, or DOCX)</p>
                              <label className="block" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="file" 
                                  multiple 
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                  onChange={e => onUpload(a.id, e.target.files)} 
                                  className="hidden"
                                  disabled={uploadingId === a.id}
                                />
                                <div className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                                  uploadingId === a.id 
                                    ? 'bg-white/10 border-white/30' 
                                    : 'border-white/30 hover:border-white/50 hover:bg-white/10'
                                }`} onClick={(e) => e.stopPropagation()}>
                                  <FileUp size={20} className="text-emerald-300" />
                                  <span className="text-sm font-medium text-white/80">
                                    {uploadingId === a.id ? 'Uploading...' : 'Click to select files'}
                                  </span>
                                </div>
                              </label>
                              <p className="text-xs text-white/55 mt-2" onClick={(e) => e.stopPropagation()}>
                                Uploaded files are saved in your assignment submission record on the server. Points are awarded after teacher review, not immediately on upload.
                              </p>
                            </div>
                          )}
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
      `}</style>
    </SignupAnimatedBackground>
  );
}
