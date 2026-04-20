import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";
import { ArrowLeft, Crown, School, Search, Trophy, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Define CSS animations
const animationStyles = `
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

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
    animation: fadeInUp 0.6s ease-out;
  }

  .fade-in {
    animation: fadeInUp 0.6s ease-out both;
  }

  .slide-in-from-bottom-4 {
    animation: fadeInUp 0.6s ease-out;
  }
`;

type SchoolRow = {
  schoolId: string;
  schoolName: string;
  ecoPoints: number;
  students: number;
  topStudent?: { username: string; name?: string; ecoPoints: number };
};
type StudentRow = { username: string; name?: string; ecoPoints: number };
type GlobalStudentRow = {
  username: string;
  name?: string;
  schoolId?: string;
  schoolName?: string;
  ecoPoints: number;
  achievements?: string[];
  snapshot?: { tasksApproved: number; quizzesCompleted: number };
};
type TeacherRow = { username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number };

export default function LeaderboardPage() {
  const [schools, setSchools] = useState<SchoolRow[] | null>(null);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null);
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const { username: me } = useAuth();

  // Header filters and tabs
  type Tab = 'schools' | 'students' | 'teachers';
  const [tab, setTab] = useState<Tab>('schools');
  const [search, setSearch] = useState('');
  const [globalStudents, setGlobalStudents] = useState<GlobalStudentRow[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[] | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);
  const [schoolsList, setSchoolsList] = useState<Array<{ id: string; name: string }>>([]);
  const [schoolFilter, setSchoolFilter] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setSchoolsError(null);
      try {
        const res = await fetch(`/api/leaderboard/schools?limit=50`);
        if (!res.ok) throw new Error(`${res.status}`);
        const list = (await res.json()) as SchoolRow[];
        if (mounted) setSchools(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (mounted) setSchoolsError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load tab content for Students/Teachers (global scope)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (tab === 'students') {
        setLoadingTab(true);
        try {
          const pageSize = 500;
          let offset = 0;
          const all: GlobalStudentRow[] = [];

          while (true) {
            const url = `/api/leaderboard/students?limit=${pageSize}&offset=${offset}${schoolFilter ? `&schoolId=${encodeURIComponent(schoolFilter)}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status}`);

            const chunk = (await res.json()) as GlobalStudentRow[];
            const rows = Array.isArray(chunk) ? chunk : [];
            all.push(...rows);

            if (rows.length < pageSize) break;
            offset += pageSize;
          }

          if (mounted) setGlobalStudents(all);
        } catch {
          if (mounted) setGlobalStudents([]);
        } finally {
          if (mounted) setLoadingTab(false);
        }
      } else if (tab === 'teachers') {
        setLoadingTab(true);
        try {
          const pageSize = 500;
          let offset = 0;
          const all: TeacherRow[] = [];

          while (true) {
            const url = `/api/leaderboard/teachers?limit=${pageSize}&offset=${offset}${schoolFilter ? `&schoolId=${encodeURIComponent(schoolFilter)}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status}`);

            const chunk = (await res.json()) as TeacherRow[];
            const rows = Array.isArray(chunk) ? chunk : [];
            all.push(...rows);

            if (rows.length < pageSize) break;
            offset += pageSize;
          }

          if (mounted) setTeachers(all);
        } catch {
          if (mounted) setTeachers([]);
        } finally {
          if (mounted) setLoadingTab(false);
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [tab, schoolFilter]);

  // Derive schools for filter dropdown from loaded leaderboard schools
  useEffect(() => {
    if (Array.isArray(schools)) {
      setSchoolsList(schools.map(s => ({ id: s.schoolId, name: s.schoolName })));
    }
  }, [schools]);

  const loadStudents = async (school: SchoolRow) => {
    setSelectedSchool(school);
    setStudents(null);
    setStudentsError(null);
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/leaderboard/school/${encodeURIComponent(school.schoolId)}/students?limit=50`);
      if (!res.ok) throw new Error(`${res.status}`);
      const list = (await res.json()) as StudentRow[];
      setStudents(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setStudentsError(e?.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const backToGlobal = () => {
    setSelectedSchool(null);
    setStudents(null);
    setStudentsError(null);
  };

  return (
    <SignupAnimatedBackground elementCount={20} className="text-white">
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            {selectedSchool && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={backToGlobal}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-lg"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </Button>
            )}
            <Trophy size={36} className="text-yellow-300 group-hover:scale-110 transition-transform" />
            <div>
              <h1 className="text-4xl font-bold text-white/95 group-hover:text-white transition-colors">Leaderboard</h1>
              <p className="text-sm text-white/70 group-hover:text-white/80 transition-colors mt-1">Compete and rank globally!</p>
            </div>
          </div>
        </div>

      {/* Header filters - Enhanced */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
        <div
          className="inline-flex rounded-xl border border-white/30 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30"
          style={{ animation: "fadeInLeft 0.6s ease-out both" }}
        >
          🌍 Global
        </div>
        
        <div className="inline-flex rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm p-1 shadow-lg">
          {(['schools','students','teachers'] as const).map((t, idx)=> (
            <button 
              key={t} 
              onClick={()=>setTab(t)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                tab===t
                  ?'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30' 
                  :'text-white/70 hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ animation: `fadeInLeft 0.6s ease-out ${(idx + 3) * 0.1}s both` }}
            >
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        
        {(tab==='students' || tab==='teachers') && (
          <div className="ml-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <select 
              value={schoolFilter} 
              onChange={(e)=>setSchoolFilter(e.target.value)} 
              className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white hover:bg-white/20 transition-all focus:outline-none focus:border-white/50 focus:bg-white/20"
            >
              <option value="" className="text-gray-900">All Schools</option>
              {schoolsList.map(s => (<option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>))}
            </select>
          </div>
        )}
        
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-2 hover:bg-white/20 transition-all">
          <Search size={16} className="text-white/70" />
          <input 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
            placeholder="Search…" 
            className="bg-transparent outline-none text-sm py-0 text-white placeholder-white/50 focus:text-white"
          />
        </div>
      </div>

      {!selectedSchool ? (
        <div>
          {tab === 'schools' && (
            <>
          <p className="mt-1 text-white/70 mb-4">🏆 Global top schools ranked by eco-points</p>
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 px-6 py-4 text-xs text-white/70 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent font-semibold">
              <div className="col-span-2">Rank</div>
              <div className="col-span-4">School</div>
              <div className="col-span-3">Top Student</div>
              <div className="col-span-1 text-right">👥</div>
              <div className="col-span-2 text-right">Eco-Points</div>
            </div>
            <div className="divide-y divide-white/10">
              {loading && <div className="px-6 py-8 text-white/70 text-sm text-center"><div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin mx-auto"></div></div>}
              {schoolsError && <div className="px-6 py-8 text-red-300 text-sm text-center">{schoolsError}</div>}

              {(!loading && !schoolsError && (schools?.length ?? 0) === 0) && (
                <div className="px-4 py-6 text-white/70 text-sm">No schools yet.</div>
              )}
              {(schools || []).filter(s=>!search||s.schoolName.toLowerCase().includes(search.toLowerCase())).map((s, idx) => (
                <HoverCard key={s.schoolId}>
                  <HoverCardTrigger asChild>
                    <button
                      className="w-full grid grid-cols-12 px-6 py-4 hover:bg-white/10 text-left text-white/90 transition-all duration-200 group"
                      onClick={() => loadStudents(s)}
                    >
                      <div className="col-span-2 flex items-center gap-3 text-sm font-semibold">
                        {idx===0?<Crown size={18} className="text-yellow-300 animate-bounce"/>:<Trophy size={18} className={idx < 3 ? 'text-yellow-300' : 'text-white/40'} />}
                        <span className="group-hover:text-yellow-300 transition-colors">#{idx + 1}</span>
                      </div>
                      <div className="col-span-4 flex items-center gap-3 group-hover:text-white transition-colors">
                        <School size={18} className="text-emerald-300 group-hover:scale-110 transition-transform" />
                        <span className="truncate font-medium group-hover:underline">{s.schoolName}</span>
                      </div>
                      <div className="col-span-3 text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">
                        {s.topStudent ? (
                          <span>
                            @{s.topStudent.username}
                            {s.topStudent.name ? ` ${s.topStudent.name}` : ''}
                          </span>
                        ) : '—'}
                      </div>
                      <div className="col-span-1 text-right text-white/70 flex items-center justify-end gap-1 group-hover:text-white transition-colors">
                        <Users size={16} /> {s.students}
                      </div>
                      <div className="col-span-2 text-right font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors">{formatPoints(s.ecoPoints)}</div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-slate-900/95 border-white/20 text-white backdrop-blur-xl">
                    <SchoolHoverPreview schoolId={s.schoolId} fallback={{ schoolName: s.schoolName, ecoPoints: s.ecoPoints, students: s.students }} />
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>
            </>
          )}

          {tab === 'students' && (
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 px-6 py-4 text-xs text-white/70 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent font-semibold">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-4">School</div>
                <div className="col-span-2 text-right">Eco-Points</div>
              </div>
              <div className="divide-y divide-white/10">
                {loadingTab && <div className="px-6 py-8 text-white/70 text-sm text-center"><div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin mx-auto"></div></div>}
                {(!loadingTab && (globalStudents?.length ?? 0) === 0) && <div className="px-6 py-8 text-white/70 text-sm text-center">🔍 No students found.</div>}
                {(globalStudents || []).filter(r => !search || r.username.toLowerCase().includes(search.toLowerCase()) || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.schoolName||'').toLowerCase().includes(search.toLowerCase())).map((r, idx) => (
                  <GlobalStudentRowItem key={r.username} row={r} rank={idx + 1} isMe={me === r.username} />
                ))}
              </div>
            </div>
          )}

          {tab === 'teachers' && (
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 px-6 py-4 text-xs text-white/70 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent font-semibold">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Teacher</div>
                <div className="col-span-2">School</div>
                <div className="col-span-2 text-right">Eco-Points</div>
                <div className="col-span-1 text-right">Tasks</div>
                <div className="col-span-1 text-right">Quizzes</div>
              </div>
              <div className="divide-y divide-white/10">
                {loadingTab && <div className="px-6 py-8 text-white/70 text-sm text-center"><div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin mx-auto"></div></div>}
                {(!loadingTab && (teachers?.length ?? 0) === 0) && <div className="px-6 py-8 text-white/70 text-sm text-center">🔍 No teachers found.</div>}
                {(teachers || []).filter(r => !search || r.username.toLowerCase().includes(search.toLowerCase()) || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.schoolName||'').toLowerCase().includes(search.toLowerCase())).map((t, idx) => (
                  <HoverCard key={t.username}>
                    <HoverCardTrigger asChild>
                      <div className="grid grid-cols-12 px-6 py-4 hover:bg-white/10 text-white/90 transition-all duration-200 group cursor-default">
                        <div className="col-span-2 text-sm font-semibold flex items-center gap-2">
                          {idx < 3 ? <Trophy size={16} className="text-yellow-300" /> : null}
                          <span className="group-hover:text-yellow-300 transition-colors">#{idx + 1}</span>
                        </div>
                        <div className="col-span-4 font-medium group-hover:text-white transition-colors">@{t.username} {t.name && <span className="text-white/70 ml-2">{t.name}</span>}</div>
                        <div className="col-span-2 text-white/70 group-hover:text-white/90 transition-colors">{t.schoolName || '—'}</div>
                        <div className="col-span-2 text-right font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors">{formatPoints(t.ecoPoints)}</div>
                        <div className="col-span-1 text-right text-white/70 group-hover:text-white/90 transition-colors">{t.tasksCreated}</div>
                        <div className="col-span-1 text-right text-white/70 group-hover:text-white/90 transition-colors">{t.quizzesCreated}</div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-slate-900/95 border-white/20 text-white backdrop-blur-xl">
                      <TeacherHoverPreview username={t.username} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-yellow-300/70 text-xs font-semibold mb-1">🌍 Global › 🏫 School</div>
              <h2 className="text-3xl font-bold text-white/95">{selectedSchool.schoolName}</h2>
              <div className="text-sm text-white/70 mt-1">⭐ Top students in this school</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 px-6 py-4 text-xs text-white/70 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent font-semibold">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Student</div>
              <div className="col-span-4 text-right">Eco-Points</div>
            </div>
            <div className="divide-y divide-white/10">
              {loadingStudents && <div className="px-6 py-8 text-white/70 text-sm text-center"><div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin mx-auto"></div></div>}
              {studentsError && <div className="px-6 py-8 text-red-300 text-sm text-center">❌ {studentsError}</div>}
              {(!loadingStudents && !studentsError && (students?.length ?? 0) === 0) && (
                <div className="px-6 py-8 text-white/70 text-sm text-center">🔍 No students yet.</div>
              )}
              {(students || []).map((u, idx) => (
                <StudentRowItem key={u.username} row={u} rank={idx + 1} isMe={me === u.username} />
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

      <style>{animationStyles}</style>
    </SignupAnimatedBackground>
  );
}

function SchoolHoverPreview({ schoolId, fallback }: { schoolId: string; fallback?: { schoolName: string; ecoPoints: number; students: number } }) {
  const [data, setData] = useState<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } } | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/school/${encodeURIComponent(schoolId)}/preview`);
        if (!res.ok) throw new Error('');
        const j = await res.json();
        if (mounted) setData(j);
      } catch {
        if (mounted && fallback) setData({ schoolId, ...fallback });
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);
  if (!loaded && !data) return <div className="text-xs text-white/70">Loading…</div>;
  if (!data) return <div className="text-xs text-red-300">Not available</div>;
  return (
    <div className="text-sm">
      <div className="font-medium text-white/90">{data.schoolName}</div>
      <div className="text-xs text-white/70">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
      <div className="text-xs text-white/70">Students: <span className="text-white">{data.students}</span></div>
      {data.topStudent && (
        <div className="mt-2 text-xs">
          Top Student: <span className="font-medium text-white/90">@{data.topStudent.username}</span> <span className="text-white/70">{data.topStudent.name || ''}</span>
          <span className="ml-1">· {formatPoints(data.topStudent.ecoPoints)} pts</span>
        </div>
      )}
      <div className="mt-3 text-[10px] text-white/70">Click to view top students</div>
    </div>
  );
}

function StudentRowItem({ row, rank, isMe }: { row: StudentRow; rank: number; isMe: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/10 cursor-default text-white/90">
          <div className="col-span-2 text-sm">#{rank}</div>
          <div className="col-span-6">
            <span className="font-medium">@{row.username}</span>
            {row.name && <span className="text-white/70 ml-2">{row.name}</span>}
            {isMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200">you</span>}
          </div>
          <div className="col-span-4 text-right font-medium">{formatPoints(row.ecoPoints)}</div>
        </div>
      </HoverCardTrigger>
      <StudentHoverPreview username={row.username} open={open} />
    </HoverCard>
  );
}

function GlobalStudentRowItem({ row, rank, isMe }: { row: GlobalStudentRow; rank: number; isMe: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/10 cursor-default text-white/90">
          <div className="col-span-2 text-sm">#{rank}</div>
          <div className="col-span-4">
            <span className="font-medium">@{row.username}</span>
            {row.name && <span className="text-white/70 ml-2">{row.name}</span>}
            {isMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200">you</span>}
          </div>
          <div className="col-span-4 text-white/70">{row.schoolName || '—'}</div>
          <div className="col-span-2 text-right font-medium">{formatPoints(row.ecoPoints)}</div>
          <div className="col-span-12 pl-6 mt-1 flex gap-2 text-sm text-amber-200">
            {(row.achievements || []).slice(0,3).map((a: string, i: number)=>(<span key={i}>{a}</span>))}
            {row.snapshot && (
              <span className="text-xs text-white/60 ml-auto">{row.snapshot.tasksApproved} tasks · {row.snapshot.quizzesCompleted} quizzes</span>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      <StudentHoverPreview username={row.username} open={open} />
    </HoverCard>
  );
}

function StudentHoverPreview({ username, open }: { username: string; open: boolean }) {
  const [data, setData] = useState<{ username: string; name?: string; ecoPoints: number; schoolId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { username: me } = useAuth();

  // Load once on first open
  useEffect(() => {
    let active = true;
    if (!open || loaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/student/${encodeURIComponent(username)}/preview`);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (active) setData(json);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [open, loaded, username]);

  return (
    <HoverCardContent className="bg-slate-900/95 border-white/20 text-white backdrop-blur-xl">
      {!loaded && <div className="text-xs text-white/70">Loading…</div>}
      {error && <div className="text-xs text-red-300">{error}</div>}
      {data && (
        <div className="text-sm">
          <div className="font-medium text-white/90">@{data.username} {data.name && <span className="text-white/70">· {data.name}</span>}</div>
          <div className="text-xs text-white/70">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
          {me === data.username ? (
            <div className="mt-3">
              <a href="/student" className="text-xs underline text-emerald-300">View your eco-profile</a>
            </div>
          ) : (
            <div className="mt-3 text-[10px] text-white/70">Full profile is private; ask them to share.</div>
          )}
        </div>
      )}
    </HoverCardContent>
  );
}

function TeacherHoverPreview({ username }: { username: string }) {
  const [data, setData] = useState<{ username: string; name?: string; ecoPoints: number; schoolId?: string; schoolName?: string; tasksCreated: number; quizzesCreated: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/teacher/${encodeURIComponent(username)}/preview`);
        if (!res.ok) throw new Error('');
        const j = await res.json();
        if (mounted) setData(j);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [username]);
  if (!loaded) return <div className="text-xs text-white/70">Loading…</div>;
  if (!data) return <div className="text-xs text-red-300">Not available</div>;
  return (
    <div className="text-sm">
      <div className="font-medium text-white/90">@{data.username} {data.name && <span className="text-white/70">· {data.name}</span>}</div>
      <div className="text-xs text-white/70">School: <span className="text-white">{data.schoolName || '—'}</span></div>
      <div className="text-xs text-white/70">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="text-white/70">Tasks: <span className="text-white">{data.tasksCreated}</span></div>
        <div className="text-white/70">Quizzes: <span className="text-white">{data.quizzesCreated}</span></div>
      </div>
    </div>
  );
}

function formatPoints(n: number) {
  const v = Math.floor(Number(n) || 0);
  return v.toLocaleString();
}
