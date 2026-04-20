import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import SignupAnimatedBackground from '@/components/SignupAnimatedBackground';
import { CheckCircle, Clock, AlertCircle, Image, Users, Zap } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  maxPoints?: number;
  proofType?: 'photo' | 'text';
  groupMode?: 'solo' | 'group';
  maxGroupSize?: number;
};

export default function TasksPage() {
  const { role, username } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studentItems, setStudentItems] = useState<Array<{ task: Task; submission?: { id: string; status: 'submitted'|'approved'|'rejected'; points?: number } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [stagedPhotos, setStagedPhotos] = useState<Record<string, string[]>>({});
  const [resubmitOpen, setResubmitOpen] = useState<Record<string, boolean>>({});
  const [groupInfo, setGroupInfo] = useState<Record<string, { memberUsernames: string[] } | null>>({});

  const loadForTeacher = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/tasks', { headers: { 'X-Username': username || '' } });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'teacher') {
      loadForTeacher();
    } else if (role === 'student') {
      loadForStudent();
    }
  }, [role]);

  const loadForStudent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/student/tasks', { headers: { 'X-Username': username || '' } });
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setStudentItems(items);
      
      // Load group information for group tasks
      const groupInfoPromises = items
        .filter(({ task }) => task.groupMode === 'group')
        .map(async ({ task }) => {
          try {
            const groupRes = await fetch(`/api/student/tasks/${encodeURIComponent(task.id)}/group`, {
              headers: { 'X-Username': username || '' }
            });
            if (groupRes.ok) {
              const groupData = await groupRes.json();
              return { taskId: task.id, group: groupData };
            }
          } catch (e) {
            // Group doesn't exist yet
          }
          return { taskId: task.id, group: null };
        });
      
      const groupResults = await Promise.all(groupInfoPromises);
      const newGroupInfo: Record<string, { memberUsernames: string[] } | null> = {};
      groupResults.forEach(({ taskId, group }) => {
        newGroupInfo[taskId] = group;
      });
      setGroupInfo(newGroupInfo);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const ensureGroup = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, check if user is already in a group
      const groupCheck = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/group`, {
        headers: { 'X-Username': username || '' }
      });
      
      if (groupCheck.ok) {
        const existingGroup = await groupCheck.json();
        if (existingGroup && existingGroup.memberUsernames?.length > 0) {
          setError(`Already in group with: ${existingGroup.memberUsernames.join(', ')}`);
          return;
        }
      }
      
      // If no existing group, prompt for member usernames
      const membersInput = prompt('Enter usernames of group members (comma-separated, excluding yourself):');
      if (!membersInput) {
        setError('Group creation cancelled');
        return;
      }
      
      const members = membersInput
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0 && u !== username);
      
      if (members.length === 0) {
        setError('You need at least one other member to form a group');
        return;
      }
      
      const response = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ members }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group');
      }
      
      setError(`Group created successfully with: ${result.group.memberUsernames.join(', ')}`);
      
      // Update group info state
      setGroupInfo(prev => ({
        ...prev,
        [taskId]: result.group
      }));
      
      await loadForStudent(); // Refresh the tasks
    } catch (err: any) {
      setError(err.message || 'Failed to manage group');
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = (taskId: string) => {
    const input = fileInputsRef.current[taskId];
    if (input) input.click();
  };

  const toDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitProof = async (taskId: string, filesOrUrls: Array<File | string>) => {
    setLoading(true);
    setError(null);
    try {
      if (!filesOrUrls || filesOrUrls.length === 0) {
        throw new Error('Please add at least one photo before submitting');
      }
      
      const photos = await Promise.all(filesOrUrls.map(async f => typeof f === 'string' ? f : await toDataUrl(f)));
      
      if (photos.length === 0) {
        throw new Error('No valid photos to submit');
      }
      
      const res = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ photos }),
      });
      
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        const msg = e?.error || 'Submit failed';
        // If group required, try to create and retry once
        if (/group/i.test(msg) || msg.includes('Create or join a group first')) {
          setError('This task requires a group. Please click "Create Group" first to create or join a group.');
          return;
        } else {
          throw new Error(msg);
        }
      }
      
      await loadForStudent();
      setStagedPhotos(prev => ({ ...prev, [taskId]: [] }));
      setResubmitOpen(prev => ({ ...prev, [taskId]: false }));
      setError('✓ Task submitted successfully!');
    } catch (err: any) {
      setError(err?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const seed = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/dev/seed-teacher-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, count: 12 })
      });
      await loadForTeacher();
    } catch (e) {
      setError('Seed failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupAnimatedBackground elementCount={20} className="text-white">
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Glassmorphic header */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-2">
            <Zap size={36} className="text-yellow-300 group-hover:scale-110 transition-transform" />
            <div>
              <h1 className="text-4xl font-bold text-white/95 group-hover:text-white transition-colors">Tasks</h1>
              {role && <div className="text-xs text-white/70 group-hover:text-white/80 transition-colors mt-1">Logged in as <span className="font-semibold text-yellow-300">@{username}</span></div>}
            </div>
          </div>
          {role !== 'teacher' && (
            <p className="mt-2 text-white/70 group-hover:text-white/80 transition-colors">📝 Complete missions and earn eco-points!</p>
          )}
        </div>

      {role === 'teacher' && (
        <div className="space-y-6">
          {loading && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin"></div>
                <p className="text-white/70">Loading tasks...</p>
              </div>
            </div>
          )}
          {error && <div className="text-red-300 bg-red-500/20 p-4 rounded-xl border border-red-400/30 flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
          {!loading && tasks.length === 0 && (
            <div className="bg-gradient-to-r from-blue-500/10 to-transparent backdrop-blur-xl border border-blue-400/30 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-white/70 text-lg mb-4">No tasks yet.</p>
              <Button onClick={seed} className="bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50 rounded-lg">Seed 12 demo tasks</Button>
            </div>
          )}
          {tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((t, idx) => (
                <div 
                  key={t.id} 
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:from-white/15 hover:to-white/10 hover:border-white/30 hover:shadow-2xl transition-all duration-300 p-6"
                  style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white/95 group-hover:text-white transition-colors mb-2">{t.title}</h3>
                    {t.description && <p className="text-sm text-white/70 line-clamp-3 mb-3">{t.description}</p>}
                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Zap size={14} className="text-yellow-300" /> <span>{t.maxPoints ?? 0} pts</span>
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        {t.groupMode === 'group' ? <Users size={14} className="text-blue-300" /> : <AlertCircle size={14} className="text-emerald-300" />}
                        <span>{t.groupMode === 'group' ? `Group${t.maxGroupSize ? ` (up to ${t.maxGroupSize})` : ''}` : 'Solo'}</span>
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Image size={14} className="text-cyan-300" /> <span>Proof: {t.proofType}</span>
                      </div>
                      {t.deadline && <div className="flex items-center gap-2 group-hover:text-white/90 transition-colors"><Clock size={14} className="text-red-300" /> Deadline: {t.deadline}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'student' && (
        <div className="space-y-6">
          {loading && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin"></div>
                <p className="text-white/70">Loading tasks...</p>
              </div>
            </div>
          )}
          {error && <div className={`p-4 rounded-xl border flex items-center gap-3 ${error.includes('successfully') ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' : 'bg-red-500/20 border-red-400/30 text-red-300'}`}>
            {error.includes('successfully') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {error}
          </div>}
          {!loading && studentItems.length === 0 && (
            <div className="bg-gradient-to-r from-purple-500/10 to-transparent backdrop-blur-xl border border-purple-400/30 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-3">🌱</div>
              <p className="text-white/70 text-lg">No tasks available yet. Check back soon!</p>
            </div>
          )}
          {studentItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentItems.map(({ task, submission }, idx) => {
                const isExpanded = expandedId === task.id;
                const statusIcon = submission?.status === 'approved' ? <CheckCircle size={16} className="text-emerald-300" /> : submission?.status === 'rejected' ? <AlertCircle size={16} className="text-red-300" /> : <Clock size={16} className="text-amber-300" />;
                
                return (
                  <div
                    key={task.id}
                    className="group cursor-pointer"
                    style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                  >
                    <div 
                      onClick={() => setExpandedId(isExpanded ? null : task.id)}
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
                            <h3 className="text-lg font-bold text-white/95 group-hover:text-white transition-colors">{task.title}</h3>
                            {task.description && <p className="text-sm text-white/70 line-clamp-2 mt-1">{task.description}</p>}
                          </div>
                          <div className="text-2xl transform transition-transform duration-300" style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>
                            ▼
                          </div>
                        </div>
                        
                        {/* Quick info */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white/80 flex items-center gap-1">
                            <Zap size={12} className="text-yellow-300" /> {task.maxPoints ?? 0} pts
                          </span>
                          {task.groupMode === 'group' && (
                            <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-200 flex items-center gap-1">
                              <Users size={12} /> Group
                            </span>
                          )}
                          {submission && (
                            <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold ${
                              submission.status === 'approved' ? 'bg-emerald-500/20 text-emerald-200' :
                              submission.status === 'rejected' ? 'bg-red-500/20 text-red-200' :
                              'bg-amber-500/20 text-amber-200'
                            }`}>
                              {statusIcon}
                              <span className="capitalize">{submission.status}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Expanded content */}
                        {isExpanded && (
                          <div
                            className="mt-6 pt-6 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2 text-white/80">
                                <Image size={16} className="text-cyan-300" /> Proof: {task.proofType}
                              </div>
                              {task.deadline && <div className="flex items-center gap-2 text-white/80"><Clock size={16} className="text-red-300" /> Deadline: {task.deadline}</div>}
                              
                              {submission?.status === 'approved' && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                                  <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                                    <CheckCircle size={16} /> Task Approved!
                                  </div>
                                  <div className="text-xs text-emerald-200/80 mt-1">Earned {submission.points ?? 0} pts</div>
                                </div>
                              )}
                              
                              {submission?.status === 'rejected' && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                                  <div className="flex items-center gap-2 text-red-200 font-semibold">
                                    <AlertCircle size={16} /> Resubmit
                                  </div>
                                  <div className="text-xs text-red-200/80 mt-1">This submission needs revision. Please resubmit.</div>
                                </div>
                              )}
                              
                              {submission?.status === 'submitted' && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                                  <div className="flex items-center gap-2 text-amber-200 font-semibold">
                                    <Clock size={16} /> Pending Review
                                  </div>
                                  <div className="text-xs text-amber-200/80 mt-1">Your submission is waiting for teacher review...</div>
                                </div>
                              )}
                              
                              {task.groupMode === 'group' && (
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    ensureGroup(task.id);
                                  }}
                                  className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50 rounded-lg transition-all"
                                >
                                  👥 Manage Group
                                </Button>
                              )}

                              {submission?.status !== 'approved' && (
                                <>
                                  {!submission || resubmitOpen[task.id] ? (
                                    <div className="mt-4 space-y-3">
                                      <label className="block">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          hidden
                                          ref={(el) => { fileInputsRef.current[task.id] = el; }}
                                          onChange={(e) => {
                                            const files = Array.from(e.currentTarget.files || []);
                                            if (files.length) {
                                              Promise.all(files.map(toDataUrl)).then((urls) => {
                                                setStagedPhotos(prev => ({ ...prev, [task.id]: [...(prev[task.id] || []), ...urls] }));
                                              });
                                            }
                                            e.currentTarget.value = '';
                                          }}
                                        />
                                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer">
                                          <Image size={18} className="text-emerald-300" />
                                          <span className="text-sm font-medium text-white/80">Add Photos</span>
                                        </div>
                                      </label>
                                      
                                      {Array.isArray(stagedPhotos[task.id]) && stagedPhotos[task.id].length > 0 && (
                                        <div className="space-y-2">
                                          <p className="text-xs text-white/70">Selected photos ({stagedPhotos[task.id].length})</p>
                                          <div className="flex gap-2 flex-wrap">
                                            {stagedPhotos[task.id].map((p, i) => (
                                              <div key={i} className="relative group/thumb">
                                                <img src={p} alt={`Selected ${i+1}`} className="h-16 w-16 object-cover rounded border border-white/30" />
                                                <button 
                                                  type="button"
                                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/80 text-white text-xs hover:bg-red-600/80 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity" 
                                                  onClick={() => setStagedPhotos(prev => ({ ...prev, [task.id]: (prev[task.id] || []).filter((_, idx) => idx !== i) }))}
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <Button 
                                        className="w-full bg-emerald-500/80 hover:bg-emerald-600/80 text-white border border-emerald-400/50 rounded-lg transition-all"
                                        disabled={loading || !(stagedPhotos[task.id]?.length)} 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          submitProof(task.id, stagedPhotos[task.id] || []);
                                        }}
                                      >
                                        🚀 {submission ? 'Resubmit' : 'Submit'}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="secondary" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResubmitOpen(prev => ({ ...prev, [task.id]: true }));
                                      }}
                                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-lg transition-all"
                                    >
                                      🔄 Resubmit
                                    </Button>
                                  )}
                                </>
                              )}
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
        
        .animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </SignupAnimatedBackground>
  );
}
