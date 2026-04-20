import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateQuiz(teacherUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }>;
  deleteQuiz(teacherUsername: string, id: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Schools
  listSchools(): Promise<Array<{ id: string; name: string }>>;
  addSchool(name: string): Promise<{ id: string; name: string }>; // simplistic
  removeSchool(id: string): Promise<boolean>;
  // Signups
  addStudentApplication(app: StudentApplication): Promise<StudentApplication>;
  addTeacherApplication(app: TeacherApplication): Promise<TeacherApplication>;
  listPending(): Promise<{ students: StudentApplication[]; teachers: TeacherApplication[] }>;
  approveApplication(type: "student" | "teacher", id: string): Promise<boolean>;
  // Username and status
  isUsernameAvailable(username: string): Promise<boolean>;
  getApplicationStatus(username: string): Promise<"pending" | "approved" | "none">;
  // OTP
  saveOtp(email: string, code: string, ttlMs: number): Promise<void>;
  verifyOtp(email: string, code: string): Promise<boolean>;
  // Admin ops
  resetPassword(username: string, password: string): Promise<boolean>;
  unapproveUser(username: string): Promise<boolean>;
  // Admin accounts
  listAdmins(): Promise<Array<{ username: string; name?: string; email?: string }>>;
  createAdmin(input: { username: string; password: string; name?: string; email?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  updateAdmin(username: string, updates: { username?: string; name?: string; email?: string }, currentUsername?: string): Promise<{ ok: true } | { ok: false; error: string }>;
  deleteAdmin(username: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Tasks & submissions
  createTask(teacherUsername: string, input: { title: string; description?: string; deadline?: string; proofType?: 'photo'; maxPoints: number; groupMode?: 'solo' | 'group'; maxGroupSize?: number }): Promise<{ ok: true; task: Task } | { ok: false; error: string }>;
  listTeacherTasks(teacherUsername: string): Promise<Task[]>;
  listStudentTasks(studentUsername: string): Promise<Array<{ task: Task; submission?: TaskSubmission }>>;
  submitTask(studentUsername: string, taskId: string, photoDataUrlOrList: string | string[]): Promise<{ ok: true; submission: TaskSubmission } | { ok: false; error: string }>;
  listSubmissionsForTeacher(teacherUsername: string, taskId?: string): Promise<Array<TaskSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; groupMembers?: string[]; taskMaxPoints?: number }>>;
  reviewSubmission(teacherUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  // Announcements
  createAnnouncement(teacherUsername: string, input: { title: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  listAnnouncementsForTeacher(teacherUsername: string): Promise<Announcement[]>;
  createAdminAnnouncement(adminUsername: string, input: { title: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  listAdminAnnouncements(adminUsername: string): Promise<Announcement[]>;
  updateAdminAnnouncement(adminUsername: string, announcementId: string, updates: { title?: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  deleteAdminAnnouncement(adminUsername: string, announcementId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listStudentAnnouncements(studentUsername: string): Promise<Announcement[]>;
  // Groups
  createTaskGroup(studentUsername: string, taskId: string, members: string[]): Promise<{ ok: true; group: TaskGroup & { memberUsernames: string[] } } | { ok: false; error: string }>;
  getTaskGroupForStudent(studentUsername: string, taskId: string): Promise<(TaskGroup & { memberUsernames: string[] }) | null>;
  // Profiles (self-service)
  getOwnProfile(username: string): Promise<ProfilePayload | null>;
  updateOwnProfile(username: string, updates: Partial<ProfileUpsert>): Promise<{ ok: true; profile: ProfilePayload } | { ok: false; error: string }>;
  // Student Profile (dashboard view)
  getStudentProfile(username: string): Promise<StudentProfileView | null>;
  setStudentPrivacy(username: string, allowExternalView: boolean): Promise<{ ok: true } | { ok: false; error: string }>;
  // Learning modules
  listLessonCompletions(studentUsername: string): Promise<LessonCompletion[]>;
  completeLesson(studentUsername: string, input: { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string; points: number }): Promise<{ ok: true; completion: LessonCompletion; alreadyCompleted: boolean } | { ok: false; error: string }>;
  listLearningModules(): Promise<LearningModule[]>;
  listManagedLearningModules(managerUsername: string): Promise<LearningModule[]>;
  upsertManagedLearningModule(managerUsername: string, input: { id?: string; title: string; description?: string; lessons: Array<{ id?: string; title: string; duration?: string; points: number; content?: string }> }): Promise<{ ok: true; module: LearningModule } | { ok: false; error: string }>;
  deleteManagedLearningModule(managerUsername: string, moduleId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Activity logging & notifications
  addQuizAttempt(studentUsername: string, input: { quizId: string; answers?: number[]; scorePercent?: number }): Promise<{ ok: true; attempt: QuizAttempt } | { ok: false; error: string }>;
  getStudentQuizAttempt(username: string, quizId: string): Promise<QuizAttempt | null>;
  addGamePlay(studentUsername: string, gameId: string): Promise<{ ok: true; play: GamePlay } | { ok: false; error: string }>;
  getStudentGameSummary(username: string): Promise<{
    totalGamePoints: number;
    badges: string[];
    monthCompletedCount: number;
    totalUniqueGames: number;
  }>;
  listNotifications(username: string): Promise<NotificationItem[]>;
  markAllNotificationsRead(username: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Games catalog (admin-managed)
  listGames(): Promise<Game[]>;
  listAdminGames(adminUsername: string): Promise<Game[]>;
  createAdminGame(adminUsername: string, input: { id?: string; name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }): Promise<{ ok: true; game: Game } | { ok: false; error: string }>;
  updateAdminGame(adminUsername: string, gameId: string, updates: Partial<{ name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }>): Promise<{ ok: true; game: Game } | { ok: false; error: string }>;
  deleteAdminGame(adminUsername: string, gameId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Assignments
  createAssignment(teacherUsername: string, input: { title: string; description?: string; deadline?: string; maxPoints?: number }): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }>;
  listTeacherAssignments(teacherUsername: string): Promise<Assignment[]>;
  createAdminAssignment(adminUsername: string, input: { title: string; description?: string; deadline?: string; maxPoints?: number }): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }>;
  listAdminAssignments(adminUsername: string): Promise<Assignment[]>;
  updateAdminAssignment(adminUsername: string, assignmentId: string, updates: { title?: string; description?: string; deadline?: string; maxPoints?: number }): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }>;
  deleteAdminAssignment(adminUsername: string, assignmentId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listStudentAssignments(studentUsername: string): Promise<Array<{ assignment: Assignment; submission?: AssignmentSubmission }>>;
  submitAssignment(studentUsername: string, assignmentId: string, filesOrList: string | string[]): Promise<{ ok: true; submission: AssignmentSubmission } | { ok: false; error: string }>;
  listAssignmentSubmissionsForTeacher(teacherUsername: string, assignmentId?: string): Promise<Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>>;
  reviewAssignmentSubmission(teacherUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  listAssignmentSubmissionsForAdmin(adminUsername: string, assignmentId?: string): Promise<Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>>;
  reviewAdminAssignmentSubmission(adminUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  // Admin quizzes CRUD
  updateAdminQuiz(adminUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }>;
  deleteAdminQuiz(adminUsername: string, id: string): Promise<{ ok: true } | { ok: false; error: string }>;
  // Leaderboard
  getGlobalSchoolsLeaderboard(limit?: number): Promise<Array<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } }>>;
  getSchoolStudentsLeaderboard(schoolId: string, limit?: number, offset?: number): Promise<Array<{ username: string; name?: string; ecoPoints: number }>>;
  getStudentPreview(targetUsername: string): Promise<{ username: string; name?: string; ecoPoints: number; schoolId?: string } | null>;
  getGlobalStudentsLeaderboard(limit?: number, offset?: number, schoolIdFilter?: string | null): Promise<Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; achievements?: string[]; snapshot?: { tasksApproved: number; quizzesCompleted: number } }>>;
  getGlobalTeachersLeaderboard(limit?: number, offset?: number, schoolIdFilter?: string | null): Promise<Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number }>>;
  getSchoolPreview(schoolId: string): Promise<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } } | null>;
  getTeacherPreview(targetUsername: string): Promise<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number } | null>;
  getAdminLeaderboardAnalytics(): Promise<{ activeSchoolsThisWeek: number; newStudentsThisWeek: number; totalEcoPointsThisWeek: number; inactiveSchools: Array<{ schoolId: string; schoolName: string }>; }>
  // Dev/demo data helpers
  seedSchoolsAndStudents(input: { schools: number; students: number; adminUsername?: string }): Promise<{ schoolsCreated: number; studentsCreated: number }>;
  // Video Management
  getAllVideos(): Promise<Video[]>;
  getTeacherVideos(teacherId: string): Promise<Video[]>;
  getTeacherVideosCount(teacherUsername: string): Promise<number>;
  createVideo(input: { title: string; description?: string; type: 'youtube' | 'file'; url: string; thumbnail?: string; credits: number; uploadedBy: string; category?: string; duration?: number }): Promise<Video>;
  updateVideo(id: string, updates: Partial<{ title: string; description: string; type: 'youtube' | 'file'; url: string; thumbnail: string; credits: number; category: string; duration: number; uploadedBy: string }>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  getUserCredits(username: string): Promise<{ totalCredits: number; lastUpdated: number }>;
  recordVideoWatch(username: string, videoId: string): Promise<{ success: boolean; creditsAwarded: number }>;
  awardCredits(username: string, videoId: string, credits: number): Promise<{ success: boolean; newTotal: number }>;
  fetchYouTubeMetadata(url: string): Promise<{ title: string; description: string; thumbnail: string; duration?: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private roles: Map<string, 'student' | 'teacher' | 'admin'>;
  private schools: Map<string, { id: string; name: string }>;
  private pendingStudents: Map<string, StudentApplication>;
  private pendingTeachers: Map<string, TeacherApplication>;
  private otps: Map<string, { code: string; expires: number }>;
  private profiles: Map<string, any>; // userId -> rich profile details
  private tasks: Map<string, Task>;
  private submissions: Map<string, TaskSubmission>;
  private groups: Map<string, TaskGroup>;
  private announcements: Map<string, Announcement>;
  private assignments: Map<string, Assignment>;
  private assignmentSubmissions: Map<string, AssignmentSubmission>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt>;
  private gamePlays: Map<string, GamePlay>;
  private games: Map<string, Game>;
  private lessonCompletions: Map<string, LessonCompletion>;
  private learningModules: Map<string, LearningModule>;
  private notifications: Map<string, NotificationItem>;
  private lastGamePlay: Map<string, number>; // key: studentId|gameId -> ts
  private videos: Map<string, Video>;
  private userVideoProgress: Map<string, UserVideoProgress>;
  private userCredits: Map<string, UserCredits>;
  private dataFile: string;
  private saveTimer: ReturnType<typeof setTimeout> | null;
  private saveInFlight: boolean;
  private saveRequestedWhileWriting: boolean;

  constructor() {
    this.users = new Map();
    this.roles = new Map();
    this.schools = new Map();
    this.pendingStudents = new Map();
    this.pendingTeachers = new Map();
    this.otps = new Map();
  this.profiles = new Map();
  this.tasks = new Map();
  this.submissions = new Map();
  this.groups = new Map();
  this.announcements = new Map();
  this.assignments = new Map();
  this.assignmentSubmissions = new Map();
  this.quizzes = new Map();
  this.quizAttempts = new Map();
  this.gamePlays = new Map();
  this.games = new Map();
  this.lessonCompletions = new Map();
  this.learningModules = new Map();
  this.notifications = new Map();
  this.lastGamePlay = new Map();
  this.videos = new Map();
  this.userVideoProgress = new Map();
  this.userCredits = new Map();
  this.dataFile = path.join(process.cwd(), 'server', 'data.json');
  this.saveTimer = null;
  this.saveInFlight = false;
  this.saveRequestedWhileWriting = false;

    // Load from disk if available; otherwise seed defaults and save
  if (fs.existsSync(this.dataFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8')) as any;
        for (const u of raw.users ?? []) this.users.set(u.id, u);
        for (const [id, role] of Object.entries(raw.roles ?? {})) this.roles.set(id, role as any);
        for (const s of raw.schools ?? []) this.schools.set(s.id, s);
        for (const a of raw.pendingStudents ?? []) this.pendingStudents.set(a.id, a);
        for (const a of raw.pendingTeachers ?? []) this.pendingTeachers.set(a.id, a);
        const rawProfiles = raw.profiles ?? {};
        if (rawProfiles && typeof rawProfiles === 'object') {
          for (const [id, prof] of Object.entries(rawProfiles)) this.profiles.set(id, prof);
        }
  for (const t of raw.tasks ?? []) this.tasks.set(t.id, t);
  for (const s of raw.submissions ?? []) this.submissions.set(s.id, s);
  for (const g of raw.groups ?? []) this.groups.set(g.id, g);
  // load quizzes (default visibility to 'school' if missing)
  for (const q of raw.quizzes ?? []) this.quizzes.set(q.id, { ...q, visibility: (q as any).visibility ?? 'school' });
  for (const qa of raw.quizAttempts ?? []) this.quizAttempts.set(qa.id, qa);
  for (const gp of raw.gamePlays ?? []) this.gamePlays.set(gp.id, gp);
  for (const g of raw.games ?? []) this.games.set(g.id, g);
  for (const lc of raw.lessonCompletions ?? []) this.lessonCompletions.set(lc.id, lc);
  for (const m of raw.learningModules ?? []) this.learningModules.set(m.id, m);
  for (const n of raw.notifications ?? []) this.notifications.set(n.id, n);
  for (const v of raw.videos ?? []) this.videos.set(v.id, v);
  for (const p of raw.userVideoProgress ?? []) this.userVideoProgress.set(p.id, p);
  for (const c of raw.userCredits ?? []) this.userCredits.set(c.id, c);
  // load announcements/assignments with default visibility
  for (const a of raw.announcements ?? []) this.announcements.set(a.id, { ...a, visibility: (a as any).visibility ?? 'school' });
  for (const a of raw.assignments ?? []) this.assignments.set(a.id, { ...a, visibility: (a as any).visibility ?? 'school' });
  for (const s of raw.assignmentSubmissions ?? []) this.assignmentSubmissions.set(s.id, s);
  // Normalize: ensure approved students/teachers have basic profiles with schoolId
        const firstSchool = Array.from(this.schools.values())[0];
        this.users.forEach((u, id) => {
          const role = this.roles.get(id);
          if ((role === 'student' || role === 'teacher') && !this.profiles.get(id)) {
            const base: any = { role, name: '', email: '', schoolId: firstSchool?.id || '' };
            this.profiles.set(id, base);
          }
        });
  // Ensure demo quizzes exist for existing data installs
  this.ensureDemoQuizzes();
  this.ensureDemoGames();
  // Ensure demo announcements and assignments exist for presentation
  this.ensureDemoAnnouncementsAssignments();
        this.save();
      } catch {
        // fallback to seeding if parse fails
        this.seedDefaults();
        this.save();
      }
    } else {
      this.seedDefaults();
  // Also seed demo announcements & assignments on first run
  this.ensureDemoAnnouncementsAssignments();
  this.ensureDemoGames();
      this.save();
    }
  }

  // Public helper to ensure demo quizzes exist (dev only)
  public seedDemoQuizzes() {
    this.ensureDemoQuizzes();
    this.save();
  }

  // Dev helper: bulk-create schools and approved students for demos/leaderboards
  public async seedSchoolsAndStudents(input: { schools: number; students: number; adminUsername?: string }): Promise<{ schoolsCreated: number; studentsCreated: number }> {
    const schoolsTarget = Math.max(0, Math.min(100, Math.floor(Number(input.schools) || 0)));
    const studentsTarget = Math.max(0, Math.min(10000, Math.floor(Number(input.students) || 0)));

    // Ensure main admin exists if requested (best-effort)
    if (input.adminUsername) {
      const hasAdmin = Array.from(this.users.values()).some(u => u.username === input.adminUsername);
      if (!hasAdmin) {
        try { await this.createAdmin({ username: input.adminUsername, password: 'admin@1234', name: 'Admin', email: `${input.adminUsername}@example.com` }); } catch {}
      }
    }

    // 1) Create schools with unique names if needed
    const existingSchoolNames = new Set(Array.from(this.schools.values()).map(s => s.name));
    const baseNames = [
      'Green Valley High','Riverdale Academy','Sunrise Public School','Harmony International','Cedar Grove School',
      'Maple Leaf High','Blue Horizon School','Silver Oak Academy','Evergreen Public','Springfield High',
      'Lakeside School','Hillcrest Academy','Oakridge High','Starlight Public','Pinecrest School',
      'Brookside Academy','Riverside High','Meadowview School','Clearwater Public','Willowdale High',
      'Summit Ridge School','Grandview Academy','Crescent Public','Highland High','Northfield School',
      'Southridge Academy','Westwood High','Eastview School','Parkside Public','Bayview High'
    ];
    let schoolsCreated = 0;
    for (let i = 0; i < schoolsTarget; i++) {
      let name = baseNames[i % baseNames.length];
      // avoid duplicate names
      let suffix = 1;
      let candidate = name;
      while (existingSchoolNames.has(candidate)) {
        suffix++;
        candidate = `${name} ${suffix}`;
      }
      const created = await this.addSchool(candidate);
      existingSchoolNames.add(created.name);
      schoolsCreated++;
    }

    // 2) Create approved students distributed randomly across schools
    const schoolIds = Array.from(this.schools.values()).map(s => s.id);
    const firstSchoolId = schoolIds[0];
    const fnames = ['Aarav','Diya','Rohan','Isha','Kabir','Anaya','Vivaan','Myra','Arjun','Sara','Aditya','Anika','Rahul','Pooja','Kunal','Meera','Tejas','Nisha','Siddharth','Kavya','Harsh','Priya','Ritika','Ayaan','Navya','Om','Tanvi','Yash','Zara','Ira'];
    const lnames = ['Mehta','Kapoor','Gupta','Sharma','Verma','Khan','Joshi','Agarwal','Singh','Nair','Patel','Desai','Reddy','Iyer','Das','Ghosh','Chopra','Bose','Malhotra','Trivedi','Pillai','Kulkarni','Bhat','Dutta','Menon','Shetty','Saxena','Mishra','Bhattacharya','Shukla'];
    const sections = ['A','B','C','D'];
    let studentsCreated = 0;

    const usernameExists = (uname: string) => {
      if (Array.from(this.users.values()).some(u => u.username === uname)) return true;
      if (Array.from(this.pendingStudents.values()).some(a => a.username === uname)) return true;
      if (Array.from(this.pendingTeachers.values()).some(a => a.username === uname)) return true;
      return false;
    };

    for (let i = 0; i < studentsTarget; i++) {
      const fn = fnames[i % fnames.length];
      const ln = lnames[(i * 7) % lnames.length];
      const base = `${fn.toLowerCase()}_${ln.toLowerCase()}`;
      // ensure unique username with numeric suffix
      let uname = base;
      let counter = 1;
      while (usernameExists(uname)) {
        counter++;
        uname = `${base}${counter}`;
      }
      // choose school
      const schoolId = schoolIds.length ? schoolIds[(i * 13) % schoolIds.length] : firstSchoolId;
      const classNum = String(6 + (i % 7)); // classes 6..12
      const section = sections[(i * 3) % sections.length];
      const roll = String(1 + (i % 60));
      const studentId = `STU${(1000 + i).toString()}`;

      // Create approved user directly
      const id = randomUUID();
      this.users.set(id, { id, username: uname, password: '123@123' });
      this.roles.set(id, 'student');
      this.profiles.set(id, {
        role: 'student',
        name: `${fn} ${ln}`,
        email: `${uname}@example.com`,
        schoolId: schoolId || '',
        studentId,
        rollNumber: roll,
        className: classNum,
        section,
      });
      studentsCreated++;
    }

    this.save();
    return { schoolsCreated, studentsCreated };
  }

  private ensureDemoQuizzes() {
    const hasGlobal = Array.from(this.quizzes.values()).some(q => q.visibility === 'global');
    const adminEntry = Array.from(this.users.entries()).find(([,u]) => u.username === 'admin123');
    const now = Date.now();
    if (!hasGlobal && adminEntry) {
      const [adminId] = adminEntry;
      const gqId = randomUUID();
      this.quizzes.set(gqId, {
        id: gqId,
        title: 'Earth Basics (Global)',
        description: 'General planet awareness',
        points: 3,
        createdByUserId: adminId,
        schoolId: '',
        createdAt: now,
        visibility: 'global',
        questions: [
          { id: randomUUID(), text: "Which gas is most abundant in Earth's atmosphere?", options: ["Nitrogen","Oxygen","Carbon Dioxide","Argon"], answerIndex: 0 },
          { id: randomUUID(), text: "Approximate age of Earth?", options: ["4.5 billion years","450 million years","45 million years","13.8 billion years"], answerIndex: 0 },
          { id: randomUUID(), text: "What percentage of Earth's surface is covered by water?", options: ["71%","50%","29%","90%"], answerIndex: 0 }
        ]
      });
    }
    const teacherEntry = Array.from(this.users.entries()).find(([,u]) => u.username === 'test_teacher');
    if (teacherEntry) {
      const [tid, tu] = teacherEntry;
      const hasSchoolQuiz = Array.from(this.quizzes.values()).some(q => q.visibility === 'school' && q.createdByUserId === tid);
      // attach to teacher's school, or default to first school
      let schoolId = this.getSchoolIdForUserId(tid);
      if (!schoolId) schoolId = Array.from(this.schools.values())[0]?.id;
      if (!hasSchoolQuiz && schoolId) {
        const tqId = randomUUID();
        this.quizzes.set(tqId, {
          id: tqId,
          title: 'School Science Quiz',
          description: 'Test your science knowledge! (School only)',
          points: 3,
          createdByUserId: tid,
          schoolId,
          createdAt: now + 1,
          visibility: 'school',
          questions: [
            { id: randomUUID(), text: "What is H2O commonly known as?", options: ["Water","Oxygen","Hydrogen","Salt"], answerIndex: 0 },
            { id: randomUUID(), text: "Which planet is known as the Red Planet?", options: ["Mars","Venus","Jupiter","Saturn"], answerIndex: 0 },
            { id: randomUUID(), text: "What force keeps us on the ground?", options: ["Gravity","Magnetism","Friction","Wind"], answerIndex: 0 }
          ]
        });
      }
    }
  }

  private ensureDemoGames() {
    // Keep a rich default catalog in sync with public games, while preserving custom/admin-added games.
    const base: Array<Omit<Game,'id'|'createdAt'|'createdByUserId'>> = [
      { name: 'SeaVerse: Ocean Guardian', category: 'wildlife', description: 'Protect and restore our oceans. Complete missions to save marine life, stop pollution, and learn about ocean conservation.', difficulty: 'Medium', points: 100, icon: '🌊', externalUrl: '/embedded-games/index.html', image: '/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg' },
      { name: 'Eco Word Spell', category: 'fun', description: 'Build environmental vocabulary by spelling eco-themed words in a fast, fun challenge.', difficulty: 'Easy', points: 75, icon: '🔤', externalUrl: 'https://eco-word-spell.lovable.app/', image: '/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg' },
      { name: 'Sorting Stories', category: 'recycling', description: 'Sort choices in story-based scenarios to practice better waste and recycling decisions.', difficulty: 'Easy', points: 80, icon: '📚', externalUrl: 'https://sorting-stories-game.lovable.app/', image: '/api/image/360_F_628835191_EMMgdwXxjtd3yLBUguiz5UrxaxqByvUc.jpg' },
      { name: 'Eco Arrow Harmony', category: 'climate', description: 'Follow eco-guided arrow flows to learn sustainable pathways in an interactive challenge.', difficulty: 'Medium', points: 85, icon: '🎯', externalUrl: 'https://eco-arrow-harmony.lovable.app/', image: '/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg' },
      { name: 'Eco Balance Grid', category: 'habits', description: 'Balance environmental choices on a grid to build smart, sustainable daily habits.', difficulty: 'Medium', points: 90, icon: '🧩', externalUrl: 'https://eco-balance-grid.lovable.app/', image: '/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg' },
      { name: 'Bad Gas Hunter', category: 'climate', description: 'Hunt down harmful emissions and boost cleaner air through fast action.', difficulty: 'Medium', points: 95, icon: '🛰️', externalUrl: 'https://badgashunter.netlify.app/', image: '/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg' },
      { name: 'Eco Hit', category: 'fun', description: 'Quick reflex eco challenge: hit the right sustainability targets and rack up points.', difficulty: 'Easy', points: 85, icon: '🎯', externalUrl: 'https://eco-hit.netlify.app/', image: '/api/image/nature-319.jpg' },
      { name: 'Eco Shoot', category: 'wildlife', description: 'Action-packed shooter experience with an environmental mission focus.', difficulty: 'Hard', points: 120, icon: '🚀', externalUrl: 'https://ecoshoot.netlify.app/', image: '/api/image/b1573252592009209d45a186360dea8c.jpg' },
      { name: 'Matching Pairs Date', category: 'fun', description: 'A fast memory and matching challenge with a playful date-night style twist.', difficulty: 'Easy', points: 75, icon: '💞', externalUrl: 'https://matchingpairsdate.netlify.app/', image: '/api/image/Bhpd8.jpg' },
      { name: 'Tsunami Expedition', category: 'climate', description: 'Explore wave and disaster awareness through a challenge built around environmental resilience.', difficulty: 'Medium', points: 95, icon: '🌊', externalUrl: 'https://tsunamiexp.netlify.app/', image: '/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg' },
      { name: 'Mineral Expedition', category: 'wildlife', description: 'Discover mineral-themed exploration in a guided adventure focused on terrain and earth science.', difficulty: 'Medium', points: 90, icon: '⛏️', externalUrl: 'https://mineralexp.netlify.app/', image: '/api/image/pngtree-cb-background-hd-2022-download-picsart-and-snapseed-photo-editing-picture-image_15546523.jpg' },
      { name: 'Environment Word Explorer', category: 'fun', description: 'Explore and master environmental words in a fun, educational game session.', difficulty: 'Easy', points: 80, icon: '📖', externalUrl: 'https://evironmentwordexplorer.netlify.app/', image: '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg' },
      { name: 'AcquaMind', category: 'habits', description: 'Interactive water-awareness challenge focused on smarter use, conservation habits, and environmental impact.', difficulty: 'Medium', points: 95, icon: '💧', externalUrl: 'https://acquamind.netlify.app/', image: '/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg' },
      { name: 'Waste Segregation', category: 'recycling', description: 'Drag items into the correct bins.', difficulty: 'Easy', points: 5, icon: '♻️', externalUrl: '/games/' },
      { name: 'Eco-Home Challenge', category: 'habits', description: 'Fix bad habits in a room.', difficulty: 'Easy', points: 8, icon: '🏠', externalUrl: '/games/' },
      { name: 'Recycling Factory Puzzle', category: 'recycling', description: 'Reorder the factory line correctly.', difficulty: 'Medium', points: 20, icon: '🏭', externalUrl: '/games/' },
      { name: 'Ocean Cleanup', category: 'recycling', description: 'Collect plastic, avoid fish.', difficulty: 'Easy', points: 10, icon: '🚤', externalUrl: '/games/' },
    ];
    const adminEntry = Array.from(this.users.entries()).find(([,u]) => u.username === 'admin123');
    const adminId = adminEntry?.[0] || Array.from(this.users.keys())[0];
    const now = Date.now();
    let added = false;
    base.forEach((b, i) => {
      const id = (b.name || `Game ${i+1}`).toLowerCase().replace(/[^a-z0-9]+/g,'-');
      if (!this.games.has(id)) {
        this.games.set(id, { id, ...b, createdAt: now + i, createdByUserId: adminId || '' });
        added = true;
      }
    });
    if (added) this.save();
  }

  // Seed a few sample announcements & assignments for admin and the demo teacher
  private ensureDemoAnnouncementsAssignments() {
    const now = Date.now();
    // Admin (global) samples
    const adminEntry = Array.from(this.users.entries()).find(([, u]) => u.username === 'admin123');
    if (adminEntry) {
      const [aid] = adminEntry;
      const globalAnns = Array.from(this.announcements.values()).filter(a => a.visibility === 'global');
      if (globalAnns.length < 3) {
        const samples: Array<{ title: string; body?: string }> = [
          { title: 'Global Eco Week Kickoff', body: 'Welcome to Eco Week! Participate in events and earn points.' },
          { title: 'New Global Quiz Series', body: 'Try the Global Climate Action quiz now.' },
          { title: 'Scholarships', body: 'Top eco-scorers will be considered for scholarships.' },
        ];
        samples.forEach((s, i) => {
          const id = randomUUID();
          const ann: Announcement = { id, title: s.title, body: s.body, createdAt: now + i, createdByUserId: aid, schoolId: '', visibility: 'global' };
          this.announcements.set(id, ann);
        });
        // Notify all students once for the first global item (keep it light)
        this.users.forEach((u, id) => { if (this.roles.get(id) === 'student') this.addNotificationForUserId(id, 'New global announcements available', 'announcement'); });
      }
      const globalAssignments = Array.from(this.assignments.values()).filter(a => a.visibility === 'global');
      if (globalAssignments.length < 2) {
        const samples: Array<{ title: string; description?: string; maxPoints: number; deadline?: string }> = [
          { title: 'Global Climate Report Summary', description: 'Summarize the latest IPCC climate report in 1 page (PDF/DOC).', maxPoints: 10, deadline: new Date(now + 7*24*3600*1000).toISOString() },
          { title: 'Ocean Conservation Review', description: 'Review 3 ocean protection initiatives and propose one idea.', maxPoints: 8, deadline: new Date(now + 14*24*3600*1000).toISOString() },
        ];
        samples.forEach((s, i) => {
          const id = randomUUID();
          const asn: Assignment = { id, title: s.title, description: s.description, deadline: s.deadline, maxPoints: s.maxPoints, createdByUserId: aid, schoolId: '', createdAt: now + i, visibility: 'global' };
          this.assignments.set(id, asn);
        });
        this.users.forEach((u, id) => { if (this.roles.get(id) === 'student') this.addNotificationForUserId(id, 'New global assignments available', 'task'); });
      }
    }

    // Teacher (school) samples
    const teacherEntry = Array.from(this.users.entries()).find(([, u]) => u.username === 'test_teacher');
    if (teacherEntry) {
      const [tid] = teacherEntry;
      const schoolId = this.getSchoolIdForUserId(tid) || Array.from(this.schools.values())[0]?.id;
      if (schoolId) {
        const teacherAnns = Array.from(this.announcements.values()).filter(a => a.createdByUserId === tid);
        if (teacherAnns.length < 3) {
          const samples: Array<{ title: string; body?: string }> = [
            { title: 'School Assembly on Monday', body: 'Please assemble by 8:30 AM in the auditorium.' },
            { title: 'Science Fair Registrations Open', body: 'Register your teams by Friday.' },
            { title: 'New Library Books Available', body: 'Visit the library to check out the latest arrivals.' },
          ];
          samples.forEach((s, i) => {
            const id = randomUUID();
            const ann: Announcement = { id, title: s.title, body: s.body, createdAt: now + i, createdByUserId: tid, schoolId, visibility: 'school' };
            this.announcements.set(id, ann);
          });
          this.notifySchool(schoolId, 'New school announcements available', 'announcement');
        }
        const teacherAsns = Array.from(this.assignments.values()).filter(a => a.createdByUserId === tid);
        if (teacherAsns.length < 2) {
          const samples: Array<{ title: string; description?: string; maxPoints: number; deadline?: string }> = [
            { title: 'Essay on Renewable Energy', description: '500-700 words. Upload as PDF/DOC.', maxPoints: 10, deadline: new Date(now + 5*24*3600*1000).toISOString() },
            { title: 'Waste Audit Report', description: 'Audit household waste for 3 days and propose reductions.', maxPoints: 8, deadline: new Date(now + 9*24*3600*1000).toISOString() },
          ];
          samples.forEach((s, i) => {
            const id = randomUUID();
            const asn: Assignment = { id, title: s.title, description: s.description, deadline: s.deadline, maxPoints: s.maxPoints, createdByUserId: tid, schoolId, createdAt: now + i, visibility: 'school' };
            this.assignments.set(id, asn);
          });
          this.notifySchool(schoolId, 'New school assignments available', 'task');
        }
      }
    }
  }

  private seedDefaults() {
    // Seed default admin and a couple schools and sample data
  const mainAdminId = randomUUID();
  this.users.set(mainAdminId, { id: mainAdminId, username: "admin123", password: "admin@1234" });
  this.roles.set(mainAdminId, 'admin');
    const s1 = { id: randomUUID(), name: "Green Valley High" };
    const s2 = { id: randomUUID(), name: "Riverdale Academy" };
    this.schools.set(s1.id, s1);
    this.schools.set(s2.id, s2);

    const pendingStudents: StudentApplication[] = [
      { name: 'Aarav Mehta', email: 'aarav.mehta@example.com', username: 'aarav_m', schoolId: s1.id, studentId: 'STU1001', rollNumber: '12', className: '8', section: 'A', password: '123@123' },
      { name: 'Diya Kapoor', email: 'diya.kapoor@example.com', username: 'diya_k', schoolId: s2.id, studentId: 'STU1002', rollNumber: '7', className: '7', section: 'B', password: '123@123' },
      { name: 'Rohan Gupta', email: 'rohan.g@example.com', username: 'rohan_g', schoolId: s1.id, studentId: 'STU1003', rollNumber: '4', className: '9', section: 'C', password: '123@123' },
    ];
    for (const s of pendingStudents) {
      const id = randomUUID();
      this.pendingStudents.set(id, { ...s, id });
    }
    const pendingTeachers: TeacherApplication[] = [
      { name: 'Neha Sharma', email: 'neha.sharma@example.com', username: 'neha_s', schoolId: s1.id, teacherId: 'TCH2001', subject: 'Mathematics', password: '123@123' },
      { name: 'Arjun Verma', email: 'arjun.verma@example.com', username: 'arjun_v', schoolId: s2.id, teacherId: 'TCH2002', subject: 'Science', password: '123@123' },
      { name: 'Sara Khan', email: 'sara.khan@example.com', username: 'sara_k', schoolId: s1.id, teacherId: 'TCH2003', subject: 'English', password: '123@123' },
    ];
    for (const t of pendingTeachers) {
      const id = randomUUID();
      this.pendingTeachers.set(id, { ...t, id });
    }
    const approvedStudentId = randomUUID();
    this.users.set(approvedStudentId, { id: approvedStudentId, username: 'test_student', password: '123@123' });
    this.roles.set(approvedStudentId, 'student');
    const approvedTeacherId = randomUUID();
    this.users.set(approvedTeacherId, { id: approvedTeacherId, username: 'test_teacher', password: '123@123' });
    this.roles.set(approvedTeacherId, 'teacher');
    // Basic profiles for admin/student/teacher
  const adminIdLookup = Array.from(this.users.entries()).find(([,u])=>u.username==='admin123')?.[0];
  if (adminIdLookup && !this.profiles.get(adminIdLookup)) this.profiles.set(adminIdLookup, { role: 'admin', name: 'Admin' });
    if (!this.profiles.get(approvedStudentId)) this.profiles.set(approvedStudentId, { role: 'student', name: 'Test Student', schoolId: s1.id });
    if (!this.profiles.get(approvedTeacherId)) this.profiles.set(approvedTeacherId, { role: 'teacher', name: 'Test Teacher', schoolId: s1.id });

    // Seed quizzes (global by admin, school by teacher)
    const now = Date.now();
    const gqId = randomUUID();
    this.quizzes.set(gqId, {
      id: gqId,
      title: 'Earth Basics (Global)',
      description: 'General planet awareness',
      points: 3,
  createdByUserId: adminIdLookup || approvedTeacherId,
      schoolId: '',
      createdAt: now,
      visibility: 'global',
      questions: [
        { id: randomUUID(), text: "Which gas is most abundant in Earth's atmosphere?", options: ["Nitrogen","Oxygen","Carbon Dioxide","Argon"], answerIndex: 0 },
        { id: randomUUID(), text: "Approximate age of Earth?", options: ["4.5 billion years","450 million years","45 million years","13.8 billion years"], answerIndex: 0 },
        { id: randomUUID(), text: "What percentage of Earth's surface is covered by water?", options: ["71%","50%","29%","90%"], answerIndex: 0 }
      ]
    });
    const tqId = randomUUID();
    this.quizzes.set(tqId, {
      id: tqId,
      title: 'School Science Quiz',
      description: 'Test your science knowledge! (School only)',
      points: 3,
      createdByUserId: approvedTeacherId,
      schoolId: s1.id,
      createdAt: now + 1,
      visibility: 'school',
      questions: [
        { id: randomUUID(), text: "What is H2O commonly known as?", options: ["Water","Oxygen","Hydrogen","Salt"], answerIndex: 0 },
        { id: randomUUID(), text: "Which planet is known as the Red Planet?", options: ["Mars","Venus","Jupiter","Saturn"], answerIndex: 0 },
        { id: randomUUID(), text: "What force keeps us on the ground?", options: ["Gravity","Magnetism","Friction","Wind"], answerIndex: 0 }
      ]
    });
  }

  private buildPayload() {
    return {
      users: Array.from(this.users.values()),
      roles: Object.fromEntries(this.roles.entries()),
      schools: Array.from(this.schools.values()),
      pendingStudents: Array.from(this.pendingStudents.values()),
      pendingTeachers: Array.from(this.pendingTeachers.values()),
  profiles: Object.fromEntries(this.profiles.entries()),
  tasks: Array.from(this.tasks.values()),
  submissions: Array.from(this.submissions.values()),
  groups: Array.from(this.groups.values()),
  announcements: Array.from(this.announcements.values()),
  assignments: Array.from(this.assignments.values()),
  assignmentSubmissions: Array.from(this.assignmentSubmissions.values()),
  quizzes: Array.from(this.quizzes.values()),
  quizAttempts: Array.from(this.quizAttempts.values()),
  gamePlays: Array.from(this.gamePlays.values()),
  games: Array.from(this.games.values()),
  lessonCompletions: Array.from(this.lessonCompletions.values()),
  learningModules: Array.from(this.learningModules.values()),
  notifications: Array.from(this.notifications.values()),
  videos: Array.from(this.videos.values()),
  userVideoProgress: Array.from(this.userVideoProgress.values()),
  userCredits: Array.from(this.userCredits.values()),
    };
  }

  private async flushSave() {
    if (this.saveInFlight) {
      this.saveRequestedWhileWriting = true;
      return;
    }
    this.saveInFlight = true;
    try {
      do {
        this.saveRequestedWhileWriting = false;
        const payload = this.buildPayload();
        await fs.promises.writeFile(this.dataFile, JSON.stringify(payload, null, 2), 'utf-8');
      } while (this.saveRequestedWhileWriting);
    } catch {
      // ignore persistence failure in demo
    } finally {
      this.saveInFlight = false;
    }
  }

  private save() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.flushSave();
    }, 25);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Schools
  async listSchools() {
    return Array.from(this.schools.values());
  }

  async addSchool(name: string) {
    const school = { id: randomUUID(), name };
    this.schools.set(school.id, school);
  this.save();
  return school;
  }

  async removeSchool(id: string) {
    const existed = this.schools.delete(id);
    if (existed) this.save();
    return existed;
  }

  // Signups
  async addStudentApplication(app: StudentApplication) {
    const id = randomUUID();
    const stored = { ...app, id };
    this.pendingStudents.set(id, stored);
  this.save();
    return stored;
  }

  async addTeacherApplication(app: TeacherApplication) {
    const id = randomUUID();
    const stored = { ...app, id };
    this.pendingTeachers.set(id, stored);
  this.save();
    return stored;
  }

  async listPending() {
    return {
      students: Array.from(this.pendingStudents.values()),
      teachers: Array.from(this.pendingTeachers.values()),
    };
  }

  async approveApplication(type: "student" | "teacher", id: string) {
    if (type === "student") {
      const app = this.pendingStudents.get(id);
      if (!app) return false;
      this.pendingStudents.delete(id);
      const userId = randomUUID();
  this.users.set(userId, { id: userId, username: app.username, password: app.password ?? "" });
  this.roles.set(userId, 'student');
  this.profiles.set(userId, {
    name: app.name,
    email: app.email,
    role: 'student',
    schoolId: app.schoolId,
    studentId: app.studentId,
    rollNumber: app.rollNumber,
    className: app.className,
    section: app.section,
    photoDataUrl: app.photoDataUrl,
  });
  this.save();
  return true;
    } else {
      const app = this.pendingTeachers.get(id);
      if (!app) return false;
      this.pendingTeachers.delete(id);
      const userId = randomUUID();
  this.users.set(userId, { id: userId, username: app.username, password: app.password ?? "" });
  this.roles.set(userId, 'teacher');
  this.profiles.set(userId, {
    name: app.name,
    email: app.email,
    role: 'teacher',
    schoolId: app.schoolId,
    teacherId: app.teacherId,
    subject: app.subject,
    photoDataUrl: app.photoDataUrl,
  });
  this.save();
  return true;
    }
  }

  async isUsernameAvailable(username: string) {
    const inUsers = Array.from(this.users.values()).some(u => u.username === username);
    if (inUsers) return false;
    const inPending = Array.from(this.pendingStudents.values()).some(a => a.username === username)
      || Array.from(this.pendingTeachers.values()).some(a => a.username === username);
    return !inPending;
  }

  async getApplicationStatus(username: string) {
    const inUsers = Array.from(this.users.values()).some(u => u.username === username);
    if (inUsers) return "approved";
    const inPending = Array.from(this.pendingStudents.values()).some(a => a.username === username)
      || Array.from(this.pendingTeachers.values()).some(a => a.username === username);
    return inPending ? "pending" : "none";
  }

  async saveOtp(email: string, code: string, ttlMs: number) {
  const key = email.trim().toLowerCase();
  const sanitized = String(code).replace(/\D/g, '').slice(0, 6);
  this.otps.set(key, { code: sanitized, expires: Date.now() + ttlMs });
  }

  async verifyOtp(email: string, code: string) {
  const key = email.trim().toLowerCase();
  const sanitized = String(code).replace(/\D/g, '').slice(0, 6);
  const rec = this.otps.get(key);
    if (!rec) return false;
  const ok = rec.code === sanitized && Date.now() <= rec.expires;
  // if (ok) this.otps.delete(key);
    return ok;
  }

  async resetPassword(username: string, password: string) {
    const found = Array.from(this.users.values()).find(u => u.username === username);
    if (!found) return false;
    this.users.set(found.id, { ...found, password });
    this.save();
    return true;
  }

  async unapproveUser(username: string) {
    // find user by username
    const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
    if (!entry) return false;
    const [id, user] = entry;
    const role = this.roles.get(id);
    if (role !== 'student' && role !== 'teacher') return false; // don't unapprove admins

    // remove from approved users
    this.users.delete(id);
    this.roles.delete(id);
    const prof = this.profiles.get(id);
    this.profiles.delete(id);

    // push back to pending with minimal fields
    if (role === 'student') {
      const pending: StudentApplication = {
        id: randomUUID(),
        name: prof?.name || '',
        email: prof?.email || '',
        username,
        schoolId: prof?.schoolId || '',
        studentId: prof?.studentId || 'REVIEW',
        rollNumber: prof?.rollNumber || '',
        className: prof?.className || '',
        section: prof?.section || '',
        photoDataUrl: prof?.photoDataUrl,
        password: user.password,
      };
      this.pendingStudents.set(pending.id!, pending);
    } else {
      const pending: TeacherApplication = {
        id: randomUUID(),
        name: prof?.name || '',
        email: prof?.email || '',
        username,
        schoolId: prof?.schoolId || '',
        teacherId: prof?.teacherId || 'REVIEW',
        subject: prof?.subject || '',
        photoDataUrl: prof?.photoDataUrl,
        password: user.password,
      };
      this.pendingTeachers.set(pending.id!, pending);
    }
    this.save();
    return true;
  }

  async getUserDetails(username: string): Promise<any> {
    // Approved users
    const approvedEntry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
    if (approvedEntry) {
      const [id, u] = approvedEntry;
      const role = this.roles.get(id) || 'student';
      const profile = this.profiles.get(id) || {};
      return {
        status: 'approved',
        username: u.username,
        role,
        password: u.password,
        name: profile.name,
        email: profile.email,
        schoolId: profile.schoolId,
        studentId: profile.studentId,
        teacherId: profile.teacherId,
        subject: profile.subject,
        rollNumber: profile.rollNumber,
        className: profile.className,
        section: profile.section,
        photoDataUrl: profile.photoDataUrl,
      };
    }
    // Pending students
    const ps = Array.from(this.pendingStudents.values()).find(a => a.username === username);
    if (ps) return { status: 'pending', role: 'student', ...ps };
    // Pending teachers
    const pt = Array.from(this.pendingTeachers.values()).find(a => a.username === username);
    if (pt) return { status: 'pending', role: 'teacher', ...pt };
    return { status: 'none', username };
  }

  // ===== Profiles (self) =====
  private findUserIdByUsername(username: string): string | null {
    const e = Array.from(this.users.entries()).find(([, u]) => u.username === username);
    return e ? e[0] : null;
  }

  async getOwnProfile(username: string): Promise<ProfilePayload | null> {
    const uid = this.findUserIdByUsername(username);
    if (!uid) return null;
    const role = this.roles.get(uid) as 'student' | 'teacher' | 'admin' | undefined;
    const base = this.profiles.get(uid) || {};
    const user = this.users.get(uid)!;
    const payload: ProfilePayload = {
      username: user.username,
      role: (role as any) || 'student',
      name: base.name || '',
      email: base.email || '',
      schoolId: base.schoolId || '',
      photoDataUrl: base.photoDataUrl || '',
      studentId: base.studentId,
      rollNumber: base.rollNumber,
      className: base.className,
      section: base.section,
      teacherId: base.teacherId,
      subject: base.subject,
    };
    return payload;
  }

  async updateOwnProfile(username: string, updates: Partial<ProfileUpsert>): Promise<{ ok: true; profile: ProfilePayload } | { ok: false; error: string }> {
    const uid = this.findUserIdByUsername(username);
    if (!uid) return { ok: false as const, error: 'User not found' };
    const role = this.roles.get(uid);
    const current = this.profiles.get(uid) || {};
    // Optional: validate school exists if provided
    if (typeof updates.schoolId === 'string' && updates.schoolId) {
      if (!this.schools.has(updates.schoolId)) return { ok: false as const, error: 'Invalid school' };
    }
    // Compose new profile; do not allow changing role here
    const next = { ...current } as any;
    const allowed = ['name','email','schoolId','photoDataUrl','studentId','rollNumber','className','section','teacherId','subject'] as const;
    for (const k of allowed) {
      if (k in (updates as any)) {
        (next as any)[k] = (updates as any)[k] ?? '';
      }
    }
    // Ensure role set and consistent
    next.role = role || next.role || 'student';
    this.profiles.set(uid, next);
    this.save();
    const payload = await this.getOwnProfile(username);
    return { ok: true, profile: payload! };
  }

  // ===== Student Profile View =====
  async getStudentProfile(username: string): Promise<StudentProfileView | null> {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return null;
    const [uid, user] = entry;
    if (this.roles.get(uid) !== 'student') return null;
    const p = this.profiles.get(uid) || {};
    // Eco points: sum approved submissions points
    let ecoPoints = 0;
    const timeline: Array<TimelineItem>= [];
    this.submissions.forEach((s) => {
      if (s.studentUserId === uid && s.status === 'approved') {
        ecoPoints += Number(s.points || 0);
        const task = this.tasks.get(s.taskId);
  if (task) timeline.push({ kind: 'task', when: s.reviewedAt || s.submittedAt, title: task.title, photoDataUrl: (s.photos && s.photos[0]) || s.photoDataUrl, points: s.points });
      }
    });
    // include quiz attempts
    this.quizAttempts.forEach((qa) => {
      if (qa.studentUserId === uid) {
        const quiz = this.quizzes.get(qa.quizId);
        if (quiz) timeline.push({ kind: 'quiz', when: qa.attemptedAt, title: quiz.title, scorePercent: qa.scorePercent, points: quiz.points });
      }
    });
    // include game plays
    this.gamePlays.forEach((gp) => {
      if (gp.studentUserId === uid) {
        timeline.push({ kind: 'game', when: gp.playedAt, title: gp.gameId, lastPlayedAt: gp.playedAt });
      }
    });
    // include lesson completions
    this.lessonCompletions.forEach((lc) => {
      if (lc.studentUserId === uid) {
        ecoPoints += Number(lc.points || 0);
        timeline.push({ kind: 'lesson', when: lc.completedAt, title: `${lc.moduleTitle}: ${lc.lessonTitle}`, points: lc.points, moduleId: lc.moduleId, lessonId: lc.lessonId });
      }
    });
    timeline.sort((a,b)=> (b.when||0)-(a.when||0));
    // Eco-tree stage
    const ecoTreeStage = ecoPoints >= 500 ? 'Big Tree' : ecoPoints >= 100 ? 'Small Tree' : 'Seedling';
    // Achievements
    const achievements: Array<{ key: string; name: string; unlocked: boolean }>= [
      { key: 'first_task', name: 'First Task Completed', unlocked: ecoPoints > 0 },
      { key: 'top10_school', name: 'Top 10 in School', unlocked: false },
      { key: 'quiz_master', name: 'Quiz Master', unlocked: false },
    ];
  // Leaderboard ranks (simple): compute ranks by ecoPoints per school and global
    const schoolId = p.schoolId;
    const studentScores: Array<{ uid: string; username: string; eco: number; schoolId?: string }> = [];
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
    let score = 0;
    this.submissions.forEach((s) => { if (s.studentUserId === id && s.status === 'approved') score += Number(s.points||0); });
    this.quizAttempts.forEach((a) => { if (a.studentUserId === id) { const q = this.quizzes.get(a.quizId); if (q) score += Number(q.points||0); } });
    this.lessonCompletions.forEach((lc) => { if (lc.studentUserId === id) score += Number(lc.points || 0); });
        const prof = this.profiles.get(id) || {};
        studentScores.push({ uid: id, username: u.username, eco: score, schoolId: prof.schoolId });
      }
    });
    studentScores.sort((a,b)=> b.eco - a.eco);
    const globalRank = studentScores.findIndex(s => s.uid === uid) + 1 || null;
    const schoolList = studentScores.filter(s => s.schoolId === schoolId);
    const schoolRank = schoolList.findIndex(s => s.uid === uid) + 1 || null;
    // Top10 school achievement
    const achIdx = achievements.findIndex(a => a.key === 'top10_school');
  if (achIdx >= 0) achievements[achIdx] = { ...achievements[achIdx], unlocked: schoolRank != null && schoolRank > 0 && schoolRank <= 10 };

    const allowExternalView = !!p.allowExternalView;
    // Weekly streak: Monday..Sunday presence
    const week = this.computeWeeklyStreak(uid);
    // Leaderboard next target in school
    const schoolScores = studentScores.filter(s => s.schoolId === schoolId);
    const myIdx = schoolScores.findIndex(s => s.uid === uid);
    const nextAhead = myIdx > 0 ? schoolScores[myIdx - 1] : undefined;
    const leaderboardNext = nextAhead ? { username: nextAhead.username, points: nextAhead.eco } : null;
    // Profile completion
    const completion = this.computeProfileCompletion(p);
    // Unread notifications count
    const unreadNotifications = this.countUnread(uid);
    return {
      username: user.username,
      name: p.name || '',
      schoolId: p.schoolId || '',
      ecoPoints,
      ecoTreeStage,
      achievements,
      timeline,
      ranks: { global: globalRank || null, school: schoolRank || null },
      allowExternalView,
      week,
      leaderboardNext,
      profileCompletion: completion,
      unreadNotifications,
    };
  }

  // ===== Leaderboard helpers =====
  async getGlobalSchoolsLeaderboard(limit = 25) {
    const perSchool = new Map<string, { eco: number; students: number }>();
    const studentEco = new Map<string, number>();

    const addStudentEco = (studentUserId: string, points: number) => {
      if (this.roles.get(studentUserId) !== 'student') return;
      studentEco.set(studentUserId, (studentEco.get(studentUserId) || 0) + Number(points || 0));
    };

    // prime with student counts
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
        const prof = this.profiles.get(id) || {};
        const sid = prof.schoolId || '';
        if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
        perSchool.get(sid)!.students += 1;
      }
    });
    // task points
    this.submissions.forEach(s => {
      if (s.status === 'approved') {
        const sid = (this.profiles.get(s.studentUserId) || {}).schoolId || '';
        if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
        const points = Number(s.points || 0);
        perSchool.get(sid)!.eco += points;
        addStudentEco(s.studentUserId, points);
      }
    });
    // quiz points
    this.quizAttempts.forEach(a => {
      const sid = (this.profiles.get(a.studentUserId) || {}).schoolId || '';
      const quiz = this.quizzes.get(a.quizId);
      if (!quiz) return;
      if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
      const points = Number(quiz.points || 0);
      perSchool.get(sid)!.eco += points;
      addStudentEco(a.studentUserId, points);
    });
    // lesson points
    this.lessonCompletions.forEach(lc => {
      const sid = (this.profiles.get(lc.studentUserId) || {}).schoolId || '';
      if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
      const points = Number(lc.points || 0);
      perSchool.get(sid)!.eco += points;
      addStudentEco(lc.studentUserId, points);
    });
    const schools = Array.from(this.schools.values());
    const rows = Array.from(perSchool.entries()).map(([schoolId, v]) => {
      let topStudent: { username: string; name?: string; ecoPoints: number } | undefined;
      this.users.forEach((u, id) => {
        if (this.roles.get(id) !== 'student') return;
        const p = this.profiles.get(id) || {};
        if ((p.schoolId || '') !== schoolId) return;
        const eco = studentEco.get(id) || 0;
        if (!topStudent || eco > topStudent.ecoPoints) {
          topStudent = { username: u.username, name: p.name, ecoPoints: eco };
        }
      });

      return {
        schoolId,
        schoolName: schools.find(s => s.id === schoolId)?.name || (schoolId || 'Unknown School'),
        ecoPoints: v.eco,
        students: v.students,
        topStudent,
      };
    });
    rows.sort((a,b)=> b.ecoPoints - a.ecoPoints);
    return rows.slice(0, Math.max(1, Math.min(500, limit|0)));
  }

  async getSchoolStudentsLeaderboard(schoolId: string, limit = 50, offset = 0) {
    const rows: Array<{ username: string; name?: string; ecoPoints: number }>= [];
    const ids: string[] = [];
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
        const p = this.profiles.get(id) || {};
        if ((p.schoolId || '') === schoolId) ids.push(id);
      }
    });
    for (const id of ids) {
      let eco = 0;
      this.submissions.forEach(s => { if (s.studentUserId === id && s.status === 'approved') eco += Number(s.points||0); });
      this.quizAttempts.forEach(a => { if (a.studentUserId === id) { const q = this.quizzes.get(a.quizId); if (q) eco += Number(q.points||0); } });
      this.lessonCompletions.forEach(lc => { if (lc.studentUserId === id) eco += Number(lc.points || 0); });
      const u = this.users.get(id)!;
      const p = this.profiles.get(id) || {};
      rows.push({ username: u.username, name: p.name, ecoPoints: eco });
    }
    rows.sort((a,b)=> b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset|0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(200, limit|0)));
    return rows.slice(start, end);
  }

  async getStudentPreview(targetUsername: string) {
    const entry = this.findUserEntryByUsername(targetUsername);
    if (!entry) return null;
    const [id, u] = entry;
    if (this.roles.get(id) !== 'student') return null;
    let eco = 0;
    this.submissions.forEach(s => { if (s.studentUserId === id && s.status === 'approved') eco += Number(s.points||0); });
    this.quizAttempts.forEach(a => { if (a.studentUserId === id) { const q = this.quizzes.get(a.quizId); if (q) eco += Number(q.points||0); } });
    this.lessonCompletions.forEach(lc => { if (lc.studentUserId === id) eco += Number(lc.points || 0); });
    const p = this.profiles.get(id) || {};
    return { username: u.username, name: p.name, ecoPoints: eco, schoolId: p.schoolId };
  }

  private getSchoolNameFromProfileSchoolId(rawSchoolId?: string): string | undefined {
    const value = String(rawSchoolId || '').trim();
    if (!value) return undefined;

    const byId = this.schools.get(value);
    if (byId?.name) return byId.name;

    const normalized = value.toLowerCase();
    const byName = Array.from(this.schools.values()).find((s) => s.name.trim().toLowerCase() === normalized);
    if (byName?.name) return byName.name;

    // Legacy fallback: some old records stored school name directly in schoolId.
    return value;
  }

  async getGlobalStudentsLeaderboard(limit = 50, offset = 0, schoolIdFilter: string | null = null) {
    const rows: Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; achievements?: string[]; snapshot?: { tasksApproved: number; quizzesCompleted: number } }> = [];
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
        const p = this.profiles.get(id) || {};
        if (schoolIdFilter && p.schoolId !== schoolIdFilter) return;
        let eco = 0;
        let tasksApproved = 0;
        let quizzesCompleted = 0;
        this.submissions.forEach(s => { if (s.studentUserId === id && s.status === 'approved') { eco += Number(s.points||0); tasksApproved++; } });
        this.quizAttempts.forEach(a => { if (a.studentUserId === id) { const q = this.quizzes.get(a.quizId); if (q) { eco += Number(q.points||0); quizzesCompleted++; } } });
        this.lessonCompletions.forEach(lc => { if (lc.studentUserId === id) eco += Number(lc.points || 0); });
        const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
        const achievements: string[] = [];
        if (tasksApproved > 0) achievements.push('🥇 First Task');
        if (quizzesCompleted >= 3) achievements.push('🧠 Quiz Master');
        if (eco >= 100) achievements.push('🌲 Small Tree');
        if (eco >= 500) achievements.push('🌳 Big Tree');
        rows.push({ username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, achievements, snapshot: { tasksApproved, quizzesCompleted } });
      }
    });
    rows.sort((a,b)=> b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset|0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit|0)));
    return rows.slice(start, end);
  }

  async getGlobalTeachersLeaderboard(limit = 50, offset = 0, schoolIdFilter: string | null = null) {
    // Teacher eco credit: sum of approved student task points and quiz points from content they created
    const teacherIds: string[] = [];
    this.users.forEach((u, id) => { if (this.roles.get(id) === 'teacher') teacherIds.push(id); });
    const rows: Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number }> = [];
    for (const tid of teacherIds) {
      const p = this.profiles.get(tid) || {};
      if (schoolIdFilter && p.schoolId !== schoolIdFilter) continue;
      // tasks created by this teacher
      const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter(t => t.createdByUserId === tid).map(t => t.id));
      const tasksCreated = ownedTaskIds.size;
      // submissions approved on their tasks
      let eco = 0;
      this.submissions.forEach(s => { if (ownedTaskIds.has(s.taskId) && s.status === 'approved') eco += Number(s.points||0); });
      // quizzes created by this teacher (school scope)
      const ownedQuizIds = new Set(Array.from(this.quizzes.values()).filter(q => q.createdByUserId === tid && q.visibility === 'school').map(q => q.id));
      const quizzesCreated = ownedQuizIds.size;
      // quiz attempts by students on those quizzes
      this.quizAttempts.forEach(a => { if (ownedQuizIds.has(a.quizId)) { const q = this.quizzes.get(a.quizId); if (q) eco += Number(q.points||0); } });
      const u = this.users.get(tid)!;
      const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
      rows.push({ username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, tasksCreated, quizzesCreated });
    }
    rows.sort((a,b)=> b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset|0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit|0)));
    return rows.slice(start, end);
  }

  async getSchoolPreview(schoolId: string) {
    const s = this.schools.get(schoolId);
    if (!s) return null;
    const rows = await this.getSchoolStudentsLeaderboard(schoolId, 1000, 0);
    const top = rows[0];
    const eco = rows.reduce((acc, r) => acc + Number(r.ecoPoints||0), 0);
    const students = rows.length;
    return { schoolId, schoolName: s.name, ecoPoints: eco, students, topStudent: top ? { username: top.username, name: top.name, ecoPoints: top.ecoPoints } : undefined };
  }

  async getTeacherPreview(targetUsername: string) {
    const entry = this.findUserEntryByUsername(targetUsername);
    if (!entry) return null;
    const [id, u] = entry;
    if (this.roles.get(id) !== 'teacher') return null;
    const p = this.profiles.get(id) || {};
    const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
    // compute same as teachers leaderboard for single teacher
    const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter(t => t.createdByUserId === id).map(t => t.id));
    const tasksCreated = ownedTaskIds.size;
    let eco = 0;
    this.submissions.forEach(s => { if (ownedTaskIds.has(s.taskId) && s.status === 'approved') eco += Number(s.points||0); });
    const ownedQuizIds = new Set(Array.from(this.quizzes.values()).filter(q => q.createdByUserId === id && q.visibility === 'school').map(q => q.id));
    const quizzesCreated = ownedQuizIds.size;
    this.quizAttempts.forEach(a => { if (ownedQuizIds.has(a.quizId)) { const q = this.quizzes.get(a.quizId); if (q) eco += Number(q.points||0); } });
    return { username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, tasksCreated, quizzesCreated };
  }

  async getAdminLeaderboardAnalytics() {
    // Define current week window (Mon..Sun)
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = ((day + 6) % 7);
    const monday = new Date(now);
    monday.setHours(0,0,0,0);
    monday.setDate(now.getDate() - diffToMonday);
    const startMs = monday.getTime();
    const activeSchoolIds = new Set<string>();
    let totalEcoPointsThisWeek = 0;
    // Activity during this week
    this.submissions.forEach(s => {
      if (s.status === 'approved' && (s.reviewedAt || s.submittedAt) >= startMs) {
        const sid = (this.profiles.get(s.studentUserId) || {}).schoolId;
        if (sid) activeSchoolIds.add(sid);
        totalEcoPointsThisWeek += Number(s.points || 0);
      }
    });
    this.quizAttempts.forEach(a => {
      if (a.attemptedAt >= startMs) {
        const sid = (this.profiles.get(a.studentUserId) || {}).schoolId;
        if (sid) activeSchoolIds.add(sid);
        const q = this.quizzes.get(a.quizId);
        if (q) totalEcoPointsThisWeek += Number(q.points || 0);
      }
    });
    this.lessonCompletions.forEach(lc => {
      if (lc.completedAt >= startMs) {
        const sid = (this.profiles.get(lc.studentUserId) || {}).schoolId;
        if (sid) activeSchoolIds.add(sid);
        totalEcoPointsThisWeek += Number(lc.points || 0);
      }
    });
    // New approved students this week
    let newStudentsThisWeek = 0;
    // We don't persist user creation timestamps; infer via profile presence timing is absent.
    // Approximation: count students with at least one activity in week that had no activity earlier.
    const seenBefore = new Set<string>();
    this.submissions.forEach(s => { if (s.status === 'approved' && (s.reviewedAt || s.submittedAt) < startMs) seenBefore.add(s.studentUserId); });
    this.quizAttempts.forEach(a => { if (a.attemptedAt < startMs) seenBefore.add(a.studentUserId); });
    this.lessonCompletions.forEach(lc => { if (lc.completedAt < startMs) seenBefore.add(lc.studentUserId); });
    const activeThisWeek = new Set<string>();
    this.submissions.forEach(s => { if (s.status === 'approved' && (s.reviewedAt || s.submittedAt) >= startMs) activeThisWeek.add(s.studentUserId); });
    this.quizAttempts.forEach(a => { if (a.attemptedAt >= startMs) activeThisWeek.add(a.studentUserId); });
    this.lessonCompletions.forEach(lc => { if (lc.completedAt >= startMs) activeThisWeek.add(lc.studentUserId); });
    activeThisWeek.forEach(id => { if (!seenBefore.has(id)) newStudentsThisWeek++; });
    // Inactive schools = schools with zero activity in week
    const inactiveSchools: Array<{ schoolId: string; schoolName: string }> = [];
    this.schools.forEach(s => { if (!activeSchoolIds.has(s.id)) inactiveSchools.push({ schoolId: s.id, schoolName: s.name }); });
    return { activeSchoolsThisWeek: activeSchoolIds.size, newStudentsThisWeek, totalEcoPointsThisWeek, inactiveSchools };
  }

  private computeWeeklyStreak(uid: string): WeeklyStreak {
    // Build set of dates (YYYY-MM-DD) with activity within last 7 days (Mon..Sun of current week)
    const now = new Date();
    const day = now.getDay(); // 0 Sun .. 6 Sat
    // find Monday of current week
    const diffToMonday = ((day + 6) % 7); // 0 if Monday
    const monday = new Date(now);
    monday.setHours(0,0,0,0);
    monday.setDate(now.getDate() - diffToMonday);
    const days: boolean[] = new Array(7).fill(false);
    const mark = (ts: number) => {
      const d = new Date(ts);
      if (d < monday) return;
      const idx = Math.min(6, Math.floor((d.getTime() - monday.getTime()) / (24*3600*1000)));
      if (idx >=0 && idx < 7) days[idx] = true;
    };
    this.submissions.forEach(s => { if (s.studentUserId === uid) mark(s.submittedAt); });
    this.quizAttempts.forEach(a => { if (a.studentUserId === uid) mark(a.attemptedAt); });
    this.gamePlays.forEach(g => { if (g.studentUserId === uid) mark(g.playedAt); });
    this.lessonCompletions.forEach(lc => { if (lc.studentUserId === uid) mark(lc.completedAt); });
    return { days, start: monday.getTime() };
  }

  private computeProfileCompletion(p: any): number {
    const fields = ['name','email','schoolId','photoDataUrl','className','section','studentId'];
    const have = fields.reduce((acc, f) => acc + (p && p[f] ? 1 : 0), 0);
    return Math.round((have / fields.length) * 100);
  }

  private countUnread(uid: string): number {
    let n = 0;
    this.notifications.forEach(x => { if (x.userId === uid && !x.readAt) n++; });
    return n;
  }

  async setStudentPrivacy(username: string, allowExternalView: boolean) {
    const id = this.findUserIdByUsername(username);
    if (!id) return { ok: false as const, error: 'User not found' };
    if (this.roles.get(id) !== 'student') return { ok: false as const, error: 'Not a student' };
    const p = this.profiles.get(id) || {};
    this.profiles.set(id, { ...p, allowExternalView: !!allowExternalView });
    this.save();
    return { ok: true as const };
  }

  async listLessonCompletions(studentUsername: string): Promise<LessonCompletion[]> {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return [];
    const [id] = entry;
    if (this.roles.get(id) !== 'student') return [];
    return Array.from(this.lessonCompletions.values()).filter(lc => lc.studentUserId === id);
  }

  async completeLesson(studentUsername: string, input: { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string; points: number }) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [id] = entry;
    if (this.roles.get(id) !== 'student') return { ok: false as const, error: 'Not a student' };
    const moduleId = String(input.moduleId || '').trim();
    const lessonId = String(input.lessonId || '').trim();
    const moduleTitle = String(input.moduleTitle || '').trim();
    const lessonTitle = String(input.lessonTitle || '').trim();
    const points = Number(input.points || 0);
    if (!moduleId || !lessonId || !moduleTitle || !lessonTitle) return { ok: false as const, error: 'Missing lesson details' };
    if (!Number.isFinite(points) || points <= 0) return { ok: false as const, error: 'Invalid points' };

    const existing = Array.from(this.lessonCompletions.values()).find(lc => lc.studentUserId === id && lc.moduleId === moduleId && lc.lessonId === lessonId);
    if (existing) return { ok: true as const, completion: existing, alreadyCompleted: true as const };

    const completion: LessonCompletion = {
      id: randomUUID(),
      studentUserId: id,
      moduleId,
      moduleTitle,
      lessonId,
      lessonTitle,
      points: Math.floor(points),
      completedAt: Date.now(),
    };
    this.lessonCompletions.set(completion.id, completion);
    this.save();
    return { ok: true as const, completion, alreadyCompleted: false as const };
  }

  async listLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values())
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l })) }));
  }

  async listManagedLearningModules(managerUsername: string): Promise<LearningModule[]> {
    const entry = this.findUserEntryByUsername(managerUsername);
    if (!entry) return [];
    const [uid] = entry;
    const role = this.roles.get(uid);
    if (role !== 'admin' && role !== 'teacher') return [];
    return await this.listLearningModules();
  }

  async upsertManagedLearningModule(managerUsername: string, input: { id?: string; title: string; description?: string; lessons: Array<{ id?: string; title: string; duration?: string; points: number; content?: string }> }) {
    const entry = this.findUserEntryByUsername(managerUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [uid] = entry;
    const role = this.roles.get(uid);
    if (role !== 'admin' && role !== 'teacher') return { ok: false as const, error: 'Not allowed' };

    const title = String(input?.title || '').trim();
    if (!title) return { ok: false as const, error: 'Module title is required' };

    const nextId = (String(input?.id || '').trim() || title.toLowerCase())
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!nextId) return { ok: false as const, error: 'Invalid module id' };

    const rawLessons = Array.isArray(input?.lessons) ? input.lessons : [];
    if (rawLessons.length === 0) return { ok: false as const, error: 'At least one lesson is required' };

    const lessons: LearningLesson[] = [];
    const seenLessonIds = new Set<string>();
    for (let i = 0; i < rawLessons.length; i++) {
      const raw = rawLessons[i] || ({} as any);
      const lessonTitle = String(raw.title || '').trim();
      if (!lessonTitle) return { ok: false as const, error: `Lesson ${i + 1} title is required` };
      const lessonId = (String(raw.id || '').trim() || lessonTitle.toLowerCase())
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!lessonId) return { ok: false as const, error: `Lesson ${i + 1} id is invalid` };
      if (seenLessonIds.has(lessonId)) return { ok: false as const, error: `Duplicate lesson id: ${lessonId}` };
      seenLessonIds.add(lessonId);

      let points = Math.floor(Number(raw.points));
      if (!Number.isFinite(points) || points < 1) points = 1;
      if (points > 500) points = 500;

      lessons.push({
        id: lessonId,
        title: lessonTitle,
        duration: String(raw.duration || '').trim() || '10 minutes',
        points,
        content: String(raw.content || '').trim() || `<h2>${lessonTitle}</h2><p>Lesson content coming soon.</p>`,
      });
    }

    const existing = this.learningModules.get(nextId);
    const module: LearningModule = {
      id: nextId,
      title,
      description: String(input?.description || '').trim(),
      lessons,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdByUserId: existing?.createdByUserId || uid,
      updatedByUserId: uid,
      deleted: false,
    };

    this.learningModules.set(module.id, module);
    this.save();
    return { ok: true as const, module };
  }

  async deleteManagedLearningModule(managerUsername: string, moduleId: string) {
    const entry = this.findUserEntryByUsername(managerUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [uid] = entry;
    const role = this.roles.get(uid);
    if (role !== 'admin' && role !== 'teacher') return { ok: false as const, error: 'Not allowed' };

    const id = String(moduleId || '').trim();
    if (!id) return { ok: false as const, error: 'Module id is required' };
    const existing = this.learningModules.get(id);
    const tombstone: LearningModule = {
      id,
      title: existing?.title || id,
      description: existing?.description || '',
      lessons: existing?.lessons || [],
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdByUserId: existing?.createdByUserId || uid,
      updatedByUserId: uid,
      deleted: true,
    };
    this.learningModules.set(id, tombstone);
    this.save();
    return { ok: true as const };
  }

  // Admin accounts
  async listAdmins() {
    const list: Array<{ username: string; name?: string; email?: string }> = [];
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'admin') {
        const p = this.profiles.get(id) || {};
        list.push({ username: u.username, name: p.name, email: p.email });
      }
    });
    return list;
  }

  async createAdmin(input: { username: string; password: string; name?: string; email?: string }) {
    const uname = input.username?.trim();
    if (!uname || !input.password) return { ok: false as const, error: 'Missing fields' };
    const available = await this.isUsernameAvailable(uname);
    if (!available) return { ok: false as const, error: 'Username taken' };
    const id = randomUUID();
    this.users.set(id, { id, username: uname, password: input.password });
    this.roles.set(id, 'admin');
    this.profiles.set(id, { name: input.name || '', email: input.email || '', role: 'admin' });
    this.save();
    return { ok: true as const };
  }

  async updateAdmin(username: string, updates: { username?: string; name?: string; email?: string }, currentUsername?: string) {
    if (username === 'admin123' && currentUsername !== 'admin123') return { ok: false as const, error: 'Only main admin can edit main admin' };
    const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
    if (!entry) return { ok: false as const, error: 'Not found' };
    const [id, user] = entry;
    if (this.roles.get(id) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    // Handle username change
    if (updates.username && updates.username.trim() !== username) {
      // Do not allow changing main admin username
      if (username === 'admin123') return { ok: false as const, error: 'Main admin username cannot change' };
      const newU = updates.username.trim();
      const available = await this.isUsernameAvailable(newU);
      if (!available) return { ok: false as const, error: 'Username taken' };
      this.users.set(id, { ...user, username: newU });
    }
    // Update profile
    const prof = this.profiles.get(id) || {};
    this.profiles.set(id, { ...prof, name: updates.name ?? prof.name, email: updates.email ?? prof.email, role: 'admin' });
    this.save();
    return { ok: true as const };
  }

  async deleteAdmin(username: string) {
    if (username === 'admin123') return { ok: false as const, error: 'Cannot delete main admin' };
    const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
    if (!entry) return { ok: false as const, error: 'Not found' };
    const [id] = entry;
    if (this.roles.get(id) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    this.users.delete(id);
    this.roles.delete(id);
    this.profiles.delete(id);
    this.save();
    return { ok: true as const };
  }

  // ===== Tasks & Submissions =====
  private findUserEntryByUsername(username: string): [string, User] | undefined {
    return Array.from(this.users.entries()).find(([, u]) => u.username === username);
  }
  private getSchoolIdForUserId(userId: string): string | undefined {
    const profile = this.profiles.get(userId);
    return profile?.schoolId;
  }

  async createTask(teacherUsername: string, input: { title: string; description?: string; deadline?: string; proofType?: 'photo'; maxPoints: number; groupMode?: 'solo' | 'group'; maxGroupSize?: number }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid, user] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const schoolId = this.getSchoolIdForUserId(tid);
    if (!schoolId) return { ok: false as const, error: 'Teacher not linked to a school' };
    if (!input?.title || !String(input.title).trim()) return { ok: false as const, error: 'Title required' };
    let maxPoints = Number(input.maxPoints);
    if (!Number.isFinite(maxPoints)) return { ok: false as const, error: 'Invalid max points' };
    // Clamp to 1..10 per requirements
    maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
    const groupMode = input.groupMode === 'group' ? 'group' : 'solo';
    let maxGroupSize: number | undefined = undefined;
    if (groupMode === 'group') {
      const m = Number(input.maxGroupSize ?? 4);
      if (!Number.isFinite(m) || m < 2) return { ok: false as const, error: 'Invalid max group size' };
      maxGroupSize = Math.min(10, Math.max(2, Math.floor(m)));
    }
    const task: Task = {
      id: randomUUID(),
      title: String(input.title).trim(),
      description: input.description ? String(input.description) : '',
      deadline: input.deadline,
      proofType: input.proofType ?? 'photo',
      maxPoints,
      createdByUserId: tid,
      schoolId,
      createdAt: Date.now(),
      groupMode,
      maxGroupSize,
    };
    this.tasks.set(task.id, task);
    this.save();
    return { ok: true as const, task };
  }

  async listTeacherTasks(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Task[];
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Task[];
    return Array.from(this.tasks.values()).filter(t => t.createdByUserId === tid);
  }

  async listStudentTasks(studentUsername: string) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return [];
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return [];
    const schoolId = this.getSchoolIdForUserId(sid);
    if (!schoolId) return [];
    const tasks = Array.from(this.tasks.values()).filter(t => t.schoolId === schoolId);
    const items: Array<{ task: Task; submission?: TaskSubmission }> = tasks.map(t => {
      let submission: TaskSubmission | undefined;
      if (t.groupMode === 'group') {
        const group = this.findGroupForStudent(t.id, sid);
        if (group) submission = Array.from(this.submissions.values()).find(s => s.taskId === t.id && s.groupId === group.id);
      } else {
        submission = Array.from(this.submissions.values()).find(s => s.taskId === t.id && s.studentUserId === sid);
      }
      return { task: t, submission };
    });
    return items;
  }

  async submitTask(studentUsername: string, taskId: string, photoDataUrlOrList: string | string[]) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'Student not found' };
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return { ok: false as const, error: 'Not a student' };
    const task = this.tasks.get(taskId);
    if (!task) return { ok: false as const, error: 'Task not found' };
    // Ensure task is within the student's school
    const schoolId = this.getSchoolIdForUserId(sid);
    if (!schoolId || schoolId !== task.schoolId) return { ok: false as const, error: 'Task not available for this student' };
    // Normalize photos
    const photosList = Array.isArray(photoDataUrlOrList)
      ? photoDataUrlOrList.filter(p => typeof p === 'string' && p.startsWith('data:')).map(String)
      : (typeof photoDataUrlOrList === 'string' ? [photoDataUrlOrList] : []);
    if (!photosList.length) return { ok: false as const, error: 'Photo(s) required' };
    let existing: TaskSubmission | undefined;
    let group: TaskGroup | undefined;
    if (task.groupMode === 'group') {
      group = this.findGroupForStudent(taskId, sid);
      if (!group) return { ok: false as const, error: 'Create or join a group first' };
      existing = Array.from(this.submissions.values()).find(s => s.taskId === taskId && s.groupId === group!.id);
    } else {
      existing = Array.from(this.submissions.values()).find(s => s.taskId === taskId && s.studentUserId === sid);
    }
    if (existing && existing.status === 'approved') return { ok: false as const, error: 'Already approved; cannot resubmit' };
    const now = Date.now();
    let submission: TaskSubmission;
    if (existing) {
      const merged = Array.from(new Set([...(existing.photos || (existing.photoDataUrl ? [existing.photoDataUrl] : [])), ...photosList]));
      submission = { ...existing, photoDataUrl: undefined, photos: merged, status: 'submitted', points: undefined, reviewedAt: undefined, reviewedByUserId: undefined, feedback: undefined, submittedAt: now };
      this.submissions.set(existing.id, submission);
    } else {
      submission = {
        id: randomUUID(),
        taskId,
        studentUserId: sid,
        photoDataUrl: undefined,
        photos: photosList,
        status: 'submitted',
        submittedAt: now,
        groupId: group?.id,
      };
      this.submissions.set(submission.id, submission);
    }
    this.save();
    return { ok: true as const, submission };
  }

  async listSubmissionsForTeacher(teacherUsername: string, taskId?: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Array<TaskSubmission & { studentUsername: string; groupMembers?: string[] }>;
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Array<TaskSubmission & { studentUsername: string; groupMembers?: string[] }>;
    const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter(t => t.createdByUserId === tid).map(t => t.id));
    const results: Array<TaskSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; groupMembers?: string[]; taskMaxPoints?: number }> = [];
    this.submissions.forEach((s) => {
      const inScope = taskId ? s.taskId === taskId : ownedTaskIds.has(s.taskId);
      if (!inScope) return;
      const user = this.users.get(s.studentUserId);
      const prof = this.profiles.get(s.studentUserId) || {};
      const task = this.tasks.get(s.taskId);
      let groupMembers: string[] | undefined = undefined;
      if (s.groupId) {
        const g = this.groups.get(s.groupId);
        if (g) groupMembers = g.memberUserIds.map(uid => this.users.get(uid)?.username || 'student');
      }
      results.push({
        ...s,
        studentUsername: user?.username || 'student',
        studentName: (prof as any).name,
        className: (prof as any).className,
        section: (prof as any).section,
        groupMembers,
        taskMaxPoints: task?.maxPoints,
      });
    });
    return results.sort((a, b) => b.submittedAt - a.submittedAt);
  }

  async reviewSubmission(teacherUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const submission = this.submissions.get(submissionId);
    if (!submission) return { ok: false as const, error: 'Submission not found' };
    const task = this.tasks.get(submission.taskId);
    if (!task || task.createdByUserId !== tid) return { ok: false as const, error: 'Not allowed' };
    const status = decision.status;
    if (status === 'approved') {
      const pts = Number(decision.points ?? 0);
      if (!Number.isFinite(pts) || pts < 0 || pts > task.maxPoints) return { ok: false as const, error: 'Invalid points' };
      const prevApproved = Array.from(this.submissions.values()).some(s => s.studentUserId === submission.studentUserId && s.status === 'approved');
      this.submissions.set(submissionId, { ...submission, status: 'approved', points: pts, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
      // Badge: first task completed
      if (!prevApproved) {
        this.addNotificationForUserId(submission.studentUserId, 'You unlocked a new badge! First Task Completed', 'badge');
      }
    } else {
      this.submissions.set(submissionId, { ...submission, status: 'rejected', points: 0, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
    }
    this.save();
    return { ok: true as const };
  }

  // ===== Groups =====
  private findGroupForStudent(taskId: string, studentUserId: string): TaskGroup | undefined {
    for (const g of this.groups.values()) {
      if (g.taskId === taskId && g.memberUserIds.includes(studentUserId)) return g;
    }
    return undefined;
  }

  async createTaskGroup(studentUsername: string, taskId: string, members: string[]) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'Student not found' };
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return { ok: false as const, error: 'Not a student' };
    const task = this.tasks.get(taskId);
    if (!task) return { ok: false as const, error: 'Task not found' };
    if (task.groupMode !== 'group') return { ok: false as const, error: 'This task does not accept groups' };
    const schoolId = this.getSchoolIdForUserId(sid);
    if (!schoolId || schoolId !== task.schoolId) return { ok: false as const, error: 'Task not available for this student' };
    // Normalize and ensure self included
    const usernames = Array.from(new Set((members || []).map(u => String(u).trim()).filter(Boolean)));
    if (!usernames.includes(this.users.get(sid)!.username)) usernames.push(this.users.get(sid)!.username);
    // Map to user IDs and validate
    const memberIds: string[] = [];
    for (const uname of usernames) {
      const e = this.findUserEntryByUsername(uname);
      if (!e) return { ok: false as const, error: `User @${uname} not found` };
      const [uid, u] = e;
      if (this.roles.get(uid) !== 'student') return { ok: false as const, error: `@${uname} is not a student` };
      const uSchool = this.getSchoolIdForUserId(uid);
      if (!uSchool || uSchool !== schoolId) return { ok: false as const, error: `@${uname} not in your school` };
      // Already in a group for this task?
      const existing = this.findGroupForStudent(taskId, uid);
      if (existing) return { ok: false as const, error: `@${uname} already in another group` };
      memberIds.push(uid);
    }
    if (!task.maxGroupSize) return { ok: false as const, error: 'Task missing group size' };
    if (memberIds.length < 2) return { ok: false as const, error: 'At least 2 members required' };
    if (memberIds.length > task.maxGroupSize) return { ok: false as const, error: `Max ${task.maxGroupSize} members` };
    const group: TaskGroup = { id: randomUUID(), taskId, memberUserIds: memberIds, createdAt: Date.now() };
    this.groups.set(group.id, group);
    this.save();
    return { ok: true as const, group: { ...group, memberUsernames: memberIds.map(id => this.users.get(id)!.username) } };
  }

  async getTaskGroupForStudent(studentUsername: string, taskId: string) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return null;
    const [sid] = entry;
    const group = this.findGroupForStudent(taskId, sid);
    if (!group) return null;
    return { ...group, memberUsernames: group.memberUserIds.map(id => this.users.get(id)!.username) };
  }

  // ===== Announcements =====
  async createAnnouncement(teacherUsername: string, input: { title: string; body?: string }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const schoolId = this.getSchoolIdForUserId(tid);
    if (!schoolId) return { ok: false as const, error: 'Teacher not linked to a school' };
    if (!input?.title || !String(input.title).trim()) return { ok: false as const, error: 'Title required' };
  const ann: Announcement = { id: randomUUID(), title: String(input.title).trim(), body: input.body ? String(input.body) : '', createdAt: Date.now(), createdByUserId: tid, schoolId, visibility: 'school' };
    this.announcements.set(ann.id, ann);
  this.notifySchool(schoolId, `New announcement: ${ann.title}`, 'announcement');
    this.save();
    return { ok: true as const, announcement: ann };
  }
  async listAnnouncementsForTeacher(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Announcement[];
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Announcement[];
    return Array.from(this.announcements.values()).filter(a => a.createdByUserId === tid).sort((a,b)=>b.createdAt-a.createdAt);
  }

  // Admin: Global announcements
  async createAdminAnnouncement(adminUsername: string, input: { title: string; body?: string }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    if (!input?.title || !String(input.title).trim()) return { ok: false as const, error: 'Title required' };
    const ann: Announcement = { id: randomUUID(), title: String(input.title).trim(), body: input.body ? String(input.body) : '', createdAt: Date.now(), createdByUserId: aid, schoolId: '', visibility: 'global' };
    this.announcements.set(ann.id, ann);
    // Persist the announcement immediately in batched async mode, then fan out notifications off the critical request path.
    this.save();
    setTimeout(() => {
      this.users.forEach((u, id) => { if (this.roles.get(id) === 'student') this.addNotificationForUserId(id, `Global announcement: ${ann.title}`, 'announcement'); });
    }, 0);
    return { ok: true as const, announcement: ann };
  }
  async listAdminAnnouncements(adminUsername: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return [] as Announcement[];
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return [] as Announcement[];
    return Array.from(this.announcements.values()).filter(a => a.visibility === 'global').sort((a,b)=>b.createdAt-a.createdAt);
  }
  async updateAdminAnnouncement(adminUsername: string, announcementId: string, updates: { title?: string; body?: string }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const ann = this.announcements.get(announcementId);
    if (!ann) return { ok: false as const, error: 'Announcement not found' };
    if (ann.visibility !== 'global') return { ok: false as const, error: 'Only global announcements can be edited here' };
    const title = updates.title !== undefined ? String(updates.title).trim() : ann.title;
    if (!title) return { ok: false as const, error: 'Title required' };
    const body = updates.body !== undefined ? String(updates.body) : (ann.body || '');
    const updated = { ...ann, title, body };
    this.announcements.set(announcementId, updated);
    this.save();
    return { ok: true as const, announcement: updated };
  }
  async deleteAdminAnnouncement(adminUsername: string, announcementId: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const ann = this.announcements.get(announcementId);
    if (!ann) return { ok: false as const, error: 'Announcement not found' };
    if (ann.visibility !== 'global') return { ok: false as const, error: 'Only global announcements can be deleted here' };
    this.announcements.delete(announcementId);
    this.save();
    return { ok: true as const };
  }
  async listStudentAnnouncements(studentUsername: string) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return [] as Announcement[];
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return [] as Announcement[];
    const schoolId = this.getSchoolIdForUserId(sid);
    return Array.from(this.announcements.values()).filter(a => a.visibility === 'global' || (!!schoolId && a.schoolId === schoolId)).sort((a,b)=>b.createdAt-a.createdAt);
  }

  // ===== Assignments (simple, create/list) =====
  async createAssignment(teacherUsername: string, input: { title: string; description?: string; deadline?: string; maxPoints?: number }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const schoolId = this.getSchoolIdForUserId(tid);
    if (!schoolId) return { ok: false as const, error: 'Teacher not linked to a school' };
    if (!input?.title || !String(input.title).trim()) return { ok: false as const, error: 'Title required' };
    let maxPoints = Number(input.maxPoints ?? 10);
    if (!Number.isFinite(maxPoints)) maxPoints = 10;
    maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
  const asn: Assignment = { id: randomUUID(), title: String(input.title).trim(), description: input.description || '', deadline: input.deadline, maxPoints, createdByUserId: tid, schoolId, createdAt: Date.now(), visibility: 'school' };
    this.assignments.set(asn.id, asn);
  this.notifySchool(schoolId, `New assignment: ${asn.title}`, 'task');
    this.save();
    return { ok: true as const, assignment: asn };
  }
  async listTeacherAssignments(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Assignment[];
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Assignment[];
    return Array.from(this.assignments.values()).filter(a => a.createdByUserId === tid).sort((a,b)=>b.createdAt-a.createdAt);
  }

  // Admin: Global assignments
  async createAdminAssignment(adminUsername: string, input: { title: string; description?: string; deadline?: string; maxPoints?: number }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    if (!input?.title || !String(input.title).trim()) return { ok: false as const, error: 'Title required' };
    let maxPoints = Number(input.maxPoints ?? 10);
    if (!Number.isFinite(maxPoints)) maxPoints = 10;
    maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
    const asn: Assignment = { id: randomUUID(), title: String(input.title).trim(), description: input.description || '', deadline: input.deadline, maxPoints, createdByUserId: aid, schoolId: '', createdAt: Date.now(), visibility: 'global' };
    this.assignments.set(asn.id, asn);
    // Broadcast to all students
    this.users.forEach((u, id) => { if (this.roles.get(id) === 'student') this.addNotificationForUserId(id, `Global assignment: ${asn.title}`, 'task'); });
    this.save();
    return { ok: true as const, assignment: asn };
  }
  async listAdminAssignments(adminUsername: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return [] as Assignment[];
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return [] as Assignment[];
    return Array.from(this.assignments.values()).filter(a => a.visibility === 'global').sort((a,b)=>b.createdAt-a.createdAt);
  }
  async updateAdminAssignment(adminUsername: string, assignmentId: string, updates: { title?: string; description?: string; deadline?: string; maxPoints?: number }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const asn = this.assignments.get(assignmentId);
    if (!asn) return { ok: false as const, error: 'Assignment not found' };
    if (asn.visibility !== 'global') return { ok: false as const, error: 'Only global assignments can be edited here' };
    const title = updates.title !== undefined ? String(updates.title).trim() : asn.title;
    if (!title) return { ok: false as const, error: 'Title required' };
    let maxPoints = updates.maxPoints !== undefined ? Number(updates.maxPoints) : asn.maxPoints;
    if (!Number.isFinite(maxPoints)) maxPoints = asn.maxPoints;
    maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
    const updated = {
      ...asn,
      title,
      description: updates.description !== undefined ? String(updates.description) : (asn.description || ''),
      deadline: updates.deadline !== undefined ? updates.deadline : asn.deadline,
      maxPoints,
    };
    this.assignments.set(assignmentId, updated);
    this.save();
    return { ok: true as const, assignment: updated };
  }
  async deleteAdminAssignment(adminUsername: string, assignmentId: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const asn = this.assignments.get(assignmentId);
    if (!asn) return { ok: false as const, error: 'Assignment not found' };
    if (asn.visibility !== 'global') return { ok: false as const, error: 'Only global assignments can be deleted here' };
    this.assignments.delete(assignmentId);
    this.save();
    return { ok: true as const };
  }

  // ===== Student: discover assignments and submit =====
  async listStudentAssignments(studentUsername: string) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return [] as Array<{ assignment: Assignment; submission?: AssignmentSubmission }>;
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return [] as Array<{ assignment: Assignment; submission?: AssignmentSubmission }>;
    const schoolId = this.getSchoolIdForUserId(sid);
    const list = Array.from(this.assignments.values()).filter(a => a.visibility === 'global' || (!!schoolId && a.schoolId === schoolId)).sort((a,b)=>b.createdAt-a.createdAt);
    return list.map(a => {
      const submission = Array.from(this.assignmentSubmissions.values()).find(s => s.assignmentId === a.id && s.studentUserId === sid);
      return { assignment: a, submission };
    });
  }

  async submitAssignment(studentUsername: string, assignmentId: string, filesOrList: string | string[]) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'Student not found' };
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return { ok: false as const, error: 'Not a student' };
    const asn = this.assignments.get(assignmentId);
    if (!asn) return { ok: false as const, error: 'Assignment not found' };
    // scope: allow if global or same school
    const schoolId = this.getSchoolIdForUserId(sid);
    const allowed = asn.visibility === 'global' || (!!schoolId && asn.schoolId === schoolId);
    if (!allowed) return { ok: false as const, error: 'Assignment not available' };
    // Normalize files and validate mime types
    const list = Array.isArray(filesOrList) ? filesOrList : (typeof filesOrList === 'string' ? [filesOrList] : []);
    const allow = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
    const files = list.filter(v => {
      if (typeof v !== 'string') return false;
      if (!v.startsWith('data:')) return false;
      const m = /^data:([^;,]+)[;,]/.exec(v);
      if (!m) return false;
      return allow.has(m[1]);
    }).map(String);
    if (files.length === 0) return { ok: false as const, error: 'Only PDF/DOC/DOCX accepted' };
    let existing = Array.from(this.assignmentSubmissions.values()).find(s => s.assignmentId === assignmentId && s.studentUserId === sid);
    if (existing && existing.status === 'approved') return { ok: false as const, error: 'Already approved; cannot resubmit' };
    const now = Date.now();
    let submission: AssignmentSubmission;
    if (existing) {
      const merged = Array.from(new Set([...(existing.files || []), ...files]));
      submission = { ...existing, files: merged, status: 'submitted', points: undefined, reviewedAt: undefined, reviewedByUserId: undefined, feedback: undefined, submittedAt: now };
      this.assignmentSubmissions.set(existing.id, submission);
    } else {
      submission = { id: randomUUID(), assignmentId, studentUserId: sid, files, submittedAt: now, status: 'submitted' };
      this.assignmentSubmissions.set(submission.id, submission);
    }
    this.save();
    return { ok: true as const, submission };
  }

  async listAssignmentSubmissionsForTeacher(teacherUsername: string, assignmentId?: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>;
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>;
    const ownedIds = new Set(Array.from(this.assignments.values()).filter(a => a.createdByUserId === tid).map(a => a.id));
    const results: Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }> = [];
    this.assignmentSubmissions.forEach((s) => {
      const inScope = assignmentId ? s.assignmentId === assignmentId : ownedIds.has(s.assignmentId);
      if (!inScope) return;
      const user = this.users.get(s.studentUserId);
      const prof = this.profiles.get(s.studentUserId) || {};
      const asn = this.assignments.get(s.assignmentId);
      results.push({
        ...s,
        studentUsername: user?.username || 'student',
        studentName: (prof as any).name,
        className: (prof as any).className,
        section: (prof as any).section,
        assignmentMaxPoints: asn?.maxPoints,
      });
    });
    return results.sort((a,b)=> b.submittedAt - a.submittedAt);
  }

  async reviewAssignmentSubmission(teacherUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const submission = this.assignmentSubmissions.get(submissionId);
    if (!submission) return { ok: false as const, error: 'Submission not found' };
    const asn = this.assignments.get(submission.assignmentId);
    if (!asn || asn.createdByUserId !== tid) return { ok: false as const, error: 'Not allowed' };
    const status = decision.status;
    if (status === 'approved') {
      const pts = Number(decision.points ?? 0);
      if (!Number.isFinite(pts) || pts < 0 || pts > asn.maxPoints) return { ok: false as const, error: 'Invalid points' };
      this.assignmentSubmissions.set(submissionId, { ...submission, status: 'approved', points: pts, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
    } else {
      this.assignmentSubmissions.set(submissionId, { ...submission, status: 'rejected', points: 0, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
    }
    this.save();
    return { ok: true as const };
  }

  async listAssignmentSubmissionsForAdmin(adminUsername: string, assignmentId?: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return [] as Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>;
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return [] as Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }>;
    const results: Array<AssignmentSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; assignmentMaxPoints?: number }> = [];
    this.assignmentSubmissions.forEach((s) => {
      const asn = this.assignments.get(s.assignmentId);
      if (!asn || asn.visibility !== 'global') return;
      const inScope = assignmentId ? s.assignmentId === assignmentId : true;
      if (!inScope) return;
      const user = this.users.get(s.studentUserId);
      const prof = this.profiles.get(s.studentUserId) || {};
      results.push({
        ...s,
        studentUsername: user?.username || 'student',
        studentName: (prof as any).name,
        className: (prof as any).className,
        section: (prof as any).section,
        assignmentMaxPoints: asn?.maxPoints,
      });
    });
    return results.sort((a,b)=> b.submittedAt - a.submittedAt);
  }

  async reviewAdminAssignmentSubmission(adminUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const submission = this.assignmentSubmissions.get(submissionId);
    if (!submission) return { ok: false as const, error: 'Submission not found' };
    const asn = this.assignments.get(submission.assignmentId);
    if (!asn || asn.visibility !== 'global') return { ok: false as const, error: 'Not allowed' };
    const status = decision.status;
    if (status === 'approved') {
      const pts = Number(decision.points ?? 0);
      if (!Number.isFinite(pts) || pts < 0 || pts > asn.maxPoints) return { ok: false as const, error: 'Invalid points' };
      this.assignmentSubmissions.set(submissionId, { ...submission, status: 'approved', points: pts, reviewedByUserId: aid, reviewedAt: Date.now(), feedback: decision.feedback });
    } else {
      this.assignmentSubmissions.set(submissionId, { ...submission, status: 'rejected', points: 0, reviewedByUserId: aid, reviewedAt: Date.now(), feedback: decision.feedback });
    }
    this.save();
    return { ok: true as const };
  }

  // ===== Quizzes (simple MCQ, create/list) =====
  async createQuiz(teacherUsername: string, input: { title: string; description?: string; points?: number; questions: Array<{ text: string; options: string[]; answerIndex: number }> }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const schoolId = this.getSchoolIdForUserId(tid);
    if (!schoolId) return { ok: false as const, error: 'Teacher not linked to a school' };
    const title = String(input?.title || '').trim();
    if (!title) return { ok: false as const, error: 'Title required' };
    const pointsRaw = Number(input.points ?? 3);
    const points = Math.max(1, Math.min(3, Number.isFinite(pointsRaw) ? Math.floor(pointsRaw) : 3));
    const questions = Array.isArray(input.questions) ? input.questions
      .map((q, idx) => ({ id: randomUUID(), text: String(q.text || '').trim(), options: (q.options || []).map(String).slice(0,4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) }))
      .filter(q => q.text && q.options.length >= 2) : [];
    if (questions.length === 0) return { ok: false as const, error: 'At least one question required' };
  const quiz: Quiz = { id: randomUUID(), title, description: String(input.description || ''), points, createdByUserId: tid, schoolId, createdAt: Date.now(), questions, visibility: 'school' };
    this.quizzes.set(quiz.id, quiz);
  this.notifySchool(schoolId, `School quiz created: ${quiz.title}`, 'quiz');
    this.save();
    return { ok: true as const, quiz };
  }
  async listTeacherQuizzes(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Quiz[];
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [] as Quiz[];
    return Array.from(this.quizzes.values()).filter(q => q.createdByUserId === tid).sort((a,b)=>b.createdAt-a.createdAt);
  }

  async updateQuiz(teacherUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const quiz = this.quizzes.get(id);
    if (!quiz) return { ok: false as const, error: 'Quiz not found' };
    if (quiz.createdByUserId !== tid) return { ok: false as const, error: 'Not allowed' };
    const next = { ...quiz } as Quiz;
    if (typeof updates.title === 'string') next.title = updates.title.trim();
    if (typeof updates.description === 'string') next.description = updates.description;
    if (typeof updates.points !== 'undefined') {
      const p = Number(updates.points);
      if (!Number.isFinite(p)) return { ok: false as const, error: 'Invalid points' };
      next.points = Math.max(1, Math.min(3, Math.floor(p)));
    }
    if (Array.isArray(updates.questions)) {
      const qs = updates.questions
        .map(q => ({ id: q.id || randomUUID(), text: String(q.text || '').trim(), options: (q.options || []).map(String).slice(0,4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) }))
        .filter(q => q.text && q.options.length >= 2);
      if (qs.length === 0) return { ok: false as const, error: 'At least one question required' };
      next.questions = qs;
    }
    this.quizzes.set(id, next);
    this.save();
    return { ok: true as const, quiz: next };
  }

  async deleteQuiz(teacherUsername: string, id: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { ok: false as const, error: 'Teacher not found' };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { ok: false as const, error: 'Not a teacher' };
    const quiz = this.quizzes.get(id);
    if (!quiz) return { ok: false as const, error: 'Quiz not found' };
    if (quiz.createdByUserId !== tid) return { ok: false as const, error: 'Not allowed' };
    this.quizzes.delete(id);
    // keep historical attempts
    this.save();
    return { ok: true as const };
  }

  // ===== Admin: Global Quizzes =====
  async createAdminQuiz(adminUsername: string, input: { title: string; description?: string; points?: number; questions: Array<{ text: string; options: string[]; answerIndex: number }> }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const title = String(input?.title || '').trim();
    if (!title) return { ok: false as const, error: 'Title required' };
    const pointsRaw = Number(input.points ?? 3);
    const points = Math.max(1, Math.min(3, Number.isFinite(pointsRaw) ? Math.floor(pointsRaw) : 3));
    const questions = Array.isArray(input.questions) ? input.questions
      .map((q) => ({ id: randomUUID(), text: String(q.text || '').trim(), options: (q.options || []).map(String).slice(0,4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) }))
      .filter(q => q.text && q.options.length >= 2) : [];
    if (questions.length === 0) return { ok: false as const, error: 'At least one question required' };
    const quiz: Quiz = { id: randomUUID(), title, description: String(input.description || ''), points, createdByUserId: aid, schoolId: '', createdAt: Date.now(), questions, visibility: 'global' };
    this.quizzes.set(quiz.id, quiz);
    // Broadcast to all students
    this.users.forEach((u, id) => { if (this.roles.get(id) === 'student') this.addNotificationForUserId(id, `Global quiz created: ${quiz.title}`, 'quiz'); });
    this.save();
    return { ok: true as const, quiz };
  }
  async listAdminQuizzes(adminUsername: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return [] as Quiz[];
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return [] as Quiz[];
    return Array.from(this.quizzes.values()).filter(q => q.visibility === 'global').sort((a,b)=>b.createdAt-a.createdAt);
  }

  async updateAdminQuiz(adminUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const quiz = this.quizzes.get(id);
    if (!quiz) return { ok: false as const, error: 'Quiz not found' };
    if (quiz.visibility !== 'global' || quiz.createdByUserId !== aid) return { ok: false as const, error: 'Not allowed' };
    const next = { ...quiz } as Quiz;
    if (typeof updates.title === 'string') next.title = updates.title.trim();
    if (typeof updates.description === 'string') next.description = updates.description;
    if (typeof updates.points !== 'undefined') {
      const p = Number(updates.points);
      if (!Number.isFinite(p)) return { ok: false as const, error: 'Invalid points' };
      next.points = Math.max(1, Math.min(3, Math.floor(p)));
    }
    if (Array.isArray(updates.questions)) {
      const qs = updates.questions
        .map(q => ({ id: q.id || randomUUID(), text: String(q.text || '').trim(), options: (q.options || []).map(String).slice(0,4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) }))
        .filter(q => q.text && q.options.length >= 2);
      if (qs.length === 0) return { ok: false as const, error: 'At least one question required' };
      next.questions = qs;
    }
    this.quizzes.set(id, next);
    this.save();
    return { ok: true as const, quiz: next };
  }

  async deleteAdminQuiz(adminUsername: string, id: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'Admin not found' };
    const [aid] = entry;
    if (this.roles.get(aid) !== 'admin') return { ok: false as const, error: 'Not an admin' };
    const quiz = this.quizzes.get(id);
    if (!quiz) return { ok: false as const, error: 'Quiz not found' };
    if (quiz.visibility !== 'global' || quiz.createdByUserId !== aid) return { ok: false as const, error: 'Not allowed' };
    this.quizzes.delete(id);
    this.save();
    return { ok: true as const };
  }

  // ===== Student: Discover Quizzes (global + school) =====
  async listStudentQuizzes(studentUsername: string) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return [] as Quiz[];
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return [] as Quiz[];
    const schoolId = this.getSchoolIdForUserId(sid);
  const quizzes = Array.from(this.quizzes.values()).filter(q => q.visibility === 'global' || (!!schoolId && q.schoolId === schoolId)).sort((a,b)=>b.createdAt-a.createdAt);
  // Attach attempt summary (one attempt rule)
  const attemptsByQuiz = new Map<string, QuizAttempt>();
  this.quizAttempts.forEach((a)=>{ if (a.studentUserId === sid) attemptsByQuiz.set(a.quizId, a); });
  return quizzes.map(q => ({ ...q, _attempt: attemptsByQuiz.get(q.id) ? { scorePercent: attemptsByQuiz.get(q.id)!.scorePercent, attemptedAt: attemptsByQuiz.get(q.id)!.attemptedAt } : undefined } as any));
  }

  async getQuizById(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  // ===== Students & Overview =====
  async listStudentsForTeacher(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return [] as Array<{ username: string; name?: string; className?: string; section?: string }>;
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return [];
    const schoolId = this.getSchoolIdForUserId(tid);
    if (!schoolId) return [];
    const list: Array<{ username: string; name?: string; className?: string; section?: string }> = [];
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
        const p = this.profiles.get(id) || {};
        if (p.schoolId === schoolId) {
          list.push({ username: u.username, name: p.name, className: p.className, section: p.section });
        }
      }
    });
    return list.sort((a,b)=> (a.name||a.username).localeCompare(b.name||b.username));
  }

  async getTeacherOverview(teacherUsername: string) {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return { tasks:0, assignments:0, quizzes:0, announcements:0, videos:0, students:0, pendingSubmissions:0 };
    const [tid] = entry;
    if (this.roles.get(tid) !== 'teacher') return { tasks:0, assignments:0, quizzes:0, announcements:0, videos:0, students:0, pendingSubmissions:0 };
    const tasks = Array.from(this.tasks.values()).filter(t => t.createdByUserId === tid).length;
    const assignments = Array.from(this.assignments.values()).filter(a => a.createdByUserId === tid).length;
    const quizzes = Array.from(this.quizzes.values()).filter(q => q.createdByUserId === tid).length;
    const announcements = Array.from(this.announcements.values()).filter(a => a.createdByUserId === tid).length;
    const videos = Array.from(this.videos.values()).filter(v => v.uploadedBy === teacherUsername || v.uploadedBy === tid).length;
    const students = (await this.listStudentsForTeacher(teacherUsername)).length;
  const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter(t => t.createdByUserId === tid).map(t => t.id));
  const ownedAssignmentIds = new Set(Array.from(this.assignments.values()).filter(a => a.createdByUserId === tid).map(a => a.id));
  let pendingSubmissions = 0;
  this.submissions.forEach(s => { if (ownedTaskIds.has(s.taskId) && s.status === 'submitted') pendingSubmissions++; });
  this.assignmentSubmissions.forEach(s => { if (ownedAssignmentIds.has(s.assignmentId) && s.status === 'submitted') pendingSubmissions++; });
    return { tasks, assignments, quizzes, announcements, videos, students, pendingSubmissions };
  }

  // ===== Activity logging & notifications =====
  async addQuizAttempt(studentUsername: string, input: { quizId: string; answers?: number[]; scorePercent?: number }) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'Student not found' };
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return { ok: false as const, error: 'Not a student' };
  const quiz = this.quizzes.get(input.quizId);
    if (!quiz) return { ok: false as const, error: 'Quiz not found' };
  // scope: allow if global or same school
    const schoolId = this.getSchoolIdForUserId(sid);
  const allowed = quiz.visibility === 'global' || (!!schoolId && schoolId === quiz.schoolId);
  if (!allowed) return { ok: false as const, error: 'Quiz not available' };
    // One attempt per student per quiz
    const existing = Array.from(this.quizAttempts.values()).find(a => a.quizId === quiz.id && a.studentUserId === sid);
    if (existing) return { ok: false as const, error: 'Already attempted' };
    const attempt: QuizAttempt = { id: randomUUID(), quizId: quiz.id, studentUserId: sid, answers: Array.isArray(input.answers) ? input.answers.map(n=> Number(n)) : undefined, scorePercent: Math.max(0, Math.min(100, Math.round(Number(input.scorePercent) || 0))), attemptedAt: Date.now() };
    this.quizAttempts.set(attempt.id, attempt);
    this.save();
    return { ok: true as const, attempt };
  }

  async getStudentQuizAttempt(username: string, quizId: string) {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return null;
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return null;
    const a = Array.from(this.quizAttempts.values()).find(x => x.quizId === quizId && x.studentUserId === sid) || null;
    return a;
  }

  async addGamePlay(studentUsername: string, gameId: string, points?: number) {
    const entry = this.findUserEntryByUsername(studentUsername);
    if (!entry) return { ok: false as const, error: 'Student not found' };
    const [sid] = entry;
    if (this.roles.get(sid) !== 'student') return { ok: false as const, error: 'Not a student' };
    // anti-spam: throttle same game per user for 10s
    const key = `${sid}|${gameId}`;
    const now = Date.now();
    const last = this.lastGamePlay.get(key) || 0;
    if (now - last < 10_000) {
      return { ok: true as const, play: { id: 'throttled', gameId: String(gameId), studentUserId: sid, playedAt: now, points: 0 } } as any;
    }
    // One-time points per game per user: if a play with points exists for this game and user, set points to 0 for subsequent plays
    let creditPoints = 0;
    const requested = Number(points);
    if (Number.isFinite(requested) && requested > 0) {
      const alreadyCredited = Array.from(this.gamePlays.values()).some(g => g.studentUserId === sid && g.gameId === String(gameId) && Number(g.points || 0) > 0);
      creditPoints = alreadyCredited ? 0 : Math.max(0, Math.floor(requested));
    }
    const play: GamePlay = { id: randomUUID(), gameId: String(gameId), studentUserId: sid, playedAt: now, points: creditPoints || undefined };
    this.gamePlays.set(play.id, play);
    this.lastGamePlay.set(key, now);
    this.save();
    return { ok: true as const, play };
  }

  async getStudentGameSummary(username: string) {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return { totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 };
    const [sid] = entry;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let totalGamePoints = 0;
  const uniqueGames = new Set<string>();
    let monthCompletedCount = 0;
    this.gamePlays.forEach(g => {
      if (g.studentUserId !== sid) return;
  uniqueGames.add(g.gameId);
  if (g.points) totalGamePoints += Number(g.points || 0);
      if (g.playedAt >= monthStart) monthCompletedCount++;
    });
    const badges: string[] = [];
    if (monthCompletedCount >= 1) badges.push('🎮 First Play');
    if (monthCompletedCount >= 5) badges.push('🔥 Game Streak 5');
    if (totalGamePoints >= 10) badges.push('⭐ Game Enthusiast');
    return { totalGamePoints, badges, monthCompletedCount, totalUniqueGames: uniqueGames.size };
  }

  async listNotifications(username: string) {
    const id = this.findUserIdByUsername(username);
    if (!id) return [] as NotificationItem[];
    return Array.from(this.notifications.values()).filter(n => n.userId === id).sort((a,b)=> (b.createdAt - a.createdAt));
  }

  async markAllNotificationsRead(username: string) {
    const id = this.findUserIdByUsername(username);
    if (!id) return { ok: false as const, error: 'User not found' };
    const now = Date.now();
    let changed = false;
    this.notifications.forEach((n, key) => {
      if (n.userId === id && !n.readAt) {
        this.notifications.set(key, { ...n, readAt: now });
        changed = true;
      }
    });
    if (changed) this.save();
    return { ok: true as const };
  }

  private notifySchool(schoolId: string, message: string, type: NotificationItem['type'] = 'info') {
    this.users.forEach((u, id) => {
      if (this.roles.get(id) === 'student') {
        const p = this.profiles.get(id) || {};
        if (p.schoolId === schoolId) this.addNotificationForUserId(id, message, type);
      }
    });
  }

  private addNotificationForUserId(userId: string, message: string, type: NotificationItem['type'] = 'info') {
    const n: NotificationItem = { id: randomUUID(), userId, message, type, createdAt: Date.now() };
    this.notifications.set(n.id, n);
    this.save();
  }

  // ===== Games Catalog (Admin-managed) =====
  async listGames(): Promise<Game[]> {
    // Keep default games available even if data.json started with a partial set.
    this.ensureDemoGames();
    // Public list (no auth). Sorted by createdAt desc.
    return Array.from(this.games.values()).sort((a,b)=> b.createdAt - a.createdAt);
  }

  async listAdminGames(adminUsername: string): Promise<Game[]> {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return [] as Game[];
    const [aid] = entry;
    const role = this.roles.get(aid);
    if (role !== 'admin' && role !== 'teacher') return [] as Game[];
    return await this.listGames();
  }

  async createAdminGame(adminUsername: string, input: { id?: string; name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [aid] = entry;
    const role = this.roles.get(aid);
    if (role !== 'admin' && role !== 'teacher') return { ok: false as const, error: 'Not allowed' };
    const name = String(input?.name || '').trim();
    const category = String(input?.category || '').trim().toLowerCase();
    if (!name || !category) return { ok: false as const, error: 'Name and category required' };
    if (!['recycling', 'climate', 'habits', 'wildlife', 'fun'].includes(category)) return { ok: false as const, error: 'Invalid category' };
    const externalUrl = String(input?.externalUrl || '').trim();
    if (!externalUrl) return { ok: false as const, error: 'Game link is required' };
    const id = (input.id?.trim() || name.toLowerCase()).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) return { ok: false as const, error: 'Invalid id' };
    if (this.games.has(id)) return { ok: false as const, error: 'ID already exists' };
    let points = Math.floor(Number(input.points));
    if (!Number.isFinite(points) || points < 1) points = 1;
    if (points > 50) points = 50;
    const difficulty = (input.difficulty === 'Easy' || input.difficulty === 'Medium' || input.difficulty === 'Hard') ? input.difficulty : undefined;
    const game: Game = {
      id,
      name,
      category,
      description: input.description ? String(input.description) : undefined,
      difficulty,
      points,
      icon: input.icon ? String(input.icon) : undefined,
      externalUrl,
      image: input.image ? String(input.image).trim() : undefined,
      createdAt: Date.now(),
      createdByUserId: aid,
    };
    this.games.set(id, game);
    this.save();
    return { ok: true as const, game };
  }

  async updateAdminGame(adminUsername: string, gameId: string, updates: Partial<{ name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }>) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [aid] = entry;
    const role = this.roles.get(aid);
    if (role !== 'admin' && role !== 'teacher') return { ok: false as const, error: 'Not allowed' };
    const g = this.games.get(gameId);
    if (!g) return { ok: false as const, error: 'Game not found' };
    const next: Game = { ...g };
    if (typeof updates.name === 'string') next.name = updates.name.trim() || next.name;
    if (typeof updates.category === 'string') {
      const category = updates.category.trim().toLowerCase();
      if (!['recycling', 'climate', 'habits', 'wildlife', 'fun'].includes(category)) return { ok: false as const, error: 'Invalid category' };
      next.category = category || next.category;
    }
    if (typeof updates.description === 'string') next.description = updates.description;
    if (typeof updates.icon === 'string') next.icon = updates.icon;
    if (typeof updates.externalUrl === 'string') {
      const url = updates.externalUrl.trim();
      if (!url) return { ok: false as const, error: 'Game link is required' };
      next.externalUrl = url;
    }
    if (typeof updates.image === 'string') next.image = updates.image.trim() || undefined;
    if (typeof updates.points !== 'undefined') {
      let p = Math.floor(Number(updates.points));
      if (!Number.isFinite(p) || p < 1) p = 1;
      if (p > 50) p = 50;
      next.points = p;
    }
    if (typeof updates.difficulty !== 'undefined') {
      if (updates.difficulty === 'Easy' || updates.difficulty === 'Medium' || updates.difficulty === 'Hard') next.difficulty = updates.difficulty;
    }
    this.games.set(gameId, next);
    this.save();
    return { ok: true as const, game: next };
  }

  async deleteAdminGame(adminUsername: string, gameId: string) {
    const entry = this.findUserEntryByUsername(adminUsername);
    if (!entry) return { ok: false as const, error: 'User not found' };
    const [aid] = entry;
    const role = this.roles.get(aid);
    if (role !== 'admin' && role !== 'teacher') return { ok: false as const, error: 'Not allowed' };
    if (!this.games.has(gameId)) return { ok: false as const, error: 'Game not found' };
    this.games.delete(gameId);
    this.save();
    return { ok: true as const };
  }

  // ===== Video Management =====
  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  async getTeacherVideos(teacherId: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(v => v.uploadedBy === teacherId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  async getTeacherVideosCount(teacherUsername: string): Promise<number> {
    const entry = this.findUserEntryByUsername(teacherUsername);
    if (!entry) return 0;
    const [tid] = entry;
    return Array.from(this.videos.values()).filter(v => v.uploadedBy === teacherUsername || v.uploadedBy === tid).length;
  }

  async createVideo(input: { title: string; description?: string; type: 'youtube' | 'file'; url: string; thumbnail?: string; credits: number; uploadedBy: string; category?: string; duration?: number }): Promise<Video> {
    const video: Video = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      type: input.type,
      url: input.url,
      thumbnail: input.thumbnail,
      credits: input.credits,
      uploadedBy: input.uploadedBy,
      uploadedAt: Date.now(),
      category: input.category,
      duration: input.duration,
    };
    this.videos.set(video.id, video);
    this.save();
    return video;
  }

  async updateVideo(id: string, updates: Partial<{ title: string; description: string; type: 'youtube' | 'file'; url: string; thumbnail: string; credits: number; category: string; duration: number; uploadedBy: string }>): Promise<Video> {
    const video = this.videos.get(id);
    if (!video) throw new Error('Video not found');
    
    const updated: Video = { ...video, ...updates };
    this.videos.set(id, updated);
    this.save();
    return updated;
  }

  async deleteVideo(id: string): Promise<void> {
    this.videos.delete(id);
    // Also delete related progress records
    const progressToDelete: string[] = [];
    this.userVideoProgress.forEach((progress, progressId) => {
      if (progress.videoId === id) {
        progressToDelete.push(progressId);
      }
    });
    progressToDelete.forEach(progressId => this.userVideoProgress.delete(progressId));
    this.save();
  }

  async getUserCredits(username: string): Promise<{ totalCredits: number; lastUpdated: number }> {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return { totalCredits: 0, lastUpdated: Date.now() };
    
    const [userId] = entry;
    const userCredits = Array.from(this.userCredits.values()).find(c => c.userId === userId);
    
    if (!userCredits) {
      return { totalCredits: 0, lastUpdated: Date.now() };
    }
    
    return {
      totalCredits: userCredits.totalCredits,
      lastUpdated: userCredits.lastUpdated,
    };
  }

  async recordVideoWatch(username: string, videoId: string): Promise<{ success: boolean; creditsAwarded: number }> {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return { success: false, creditsAwarded: 0 };
    
    const [userId] = entry;
    const video = this.videos.get(videoId);
    if (!video) return { success: false, creditsAwarded: 0 };
    
    // Check if already watched
    const existingProgress = Array.from(this.userVideoProgress.values())
      .find(p => p.userId === userId && p.videoId === videoId);
    
    if (existingProgress && existingProgress.watched) {
      return { success: true, creditsAwarded: 0 }; // Already watched
    }
    
    // Record the watch
    const progressId = existingProgress?.id || randomUUID();
    const progress: UserVideoProgress = {
      id: progressId,
      userId,
      videoId,
      watched: true,
      watchedAt: Date.now(),
      creditsAwarded: !existingProgress || !existingProgress.creditsAwarded,
    };
    
    this.userVideoProgress.set(progressId, progress);
    
    // Award credits if first time watching
    let creditsAwarded = 0;
    if (!existingProgress || !existingProgress.creditsAwarded) {
      creditsAwarded = video.credits;
      await this.awardCredits(username, videoId, creditsAwarded);
    }
    
    this.save();
    return { success: true, creditsAwarded };
  }

  async awardCredits(username: string, videoId: string, credits: number): Promise<{ success: boolean; newTotal: number }> {
    const entry = this.findUserEntryByUsername(username);
    if (!entry) return { success: false, newTotal: 0 };
    
    const [userId] = entry;
    let userCredits = Array.from(this.userCredits.values()).find(c => c.userId === userId);
    
    if (!userCredits) {
      userCredits = {
        id: randomUUID(),
        userId,
        totalCredits: 0,
        lastUpdated: Date.now(),
      };
    }
    
    userCredits.totalCredits += credits;
    userCredits.lastUpdated = Date.now();
    
    this.userCredits.set(userCredits.id, userCredits);
    this.save();
    
    return { success: true, newTotal: userCredits.totalCredits };
  }

  async fetchYouTubeMetadata(url: string): Promise<{ title: string; description: string; thumbnail: string; duration?: number }> {
    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      throw new Error('Invalid YouTube URL');
    }
    
    const videoId = videoIdMatch[1];
    
    // For demo purposes, return mock metadata
    // In a real app, you would use the YouTube Data API
    return {
      title: `Video ${videoId}`,
      description: 'Environmental education video from YouTube',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 300, // 5 minutes default
    };
  }
}

export const storage = new MemStorage();

// Types used by the in-memory store
export type StudentApplication = {
  id?: string;
  name: string;
  email: string;
  username: string;
  schoolId: string;
  studentId: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  photoDataUrl?: string;
  password?: string;
};

export type TeacherApplication = {
  id?: string;
  name: string;
  email: string;
  username: string;
  schoolId: string;
  teacherId: string;
  subject?: string;
  photoDataUrl?: string;
  password?: string;
};

// New types for Tasks & Submissions
export type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // ISO or human
  proofType: 'photo';
  maxPoints: number;
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  groupMode: 'solo' | 'group';
  maxGroupSize?: number;
};

export type TaskSubmission = {
  id: string;
  taskId: string;
  studentUserId: string;
  photoDataUrl?: string; // legacy single
  photos?: string[]; // new multi
  submittedAt: number;
  status: 'submitted' | 'approved' | 'rejected';
  points?: number;
  feedback?: string;
  reviewedByUserId?: string;
  reviewedAt?: number;
  groupId?: string;
};

export type TaskGroup = {
  id: string;
  taskId: string;
  memberUserIds: string[];
  createdAt: number;
};

// Profile DTOs for self-service profile view/edit
export type ProfilePayload = {
  username: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  email: string;
  schoolId: string;
  photoDataUrl?: string;
  // student fields
  studentId?: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  // teacher fields
  teacherId?: string;
  subject?: string;
};

export type ProfileUpsert = {
  name: string;
  email: string;
  schoolId: string;
  photoDataUrl?: string;
  studentId?: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  teacherId?: string;
  subject?: string;
};

// Announcements
export type Announcement = {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  createdByUserId: string;
  schoolId: string;
  visibility: 'global' | 'school';
};

// Assignments (without submission flow for now)
export type Assignment = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  maxPoints: number;
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  visibility: 'global' | 'school';
};

// Assignment Submissions (PDF/DOC/DOCX files via data URLs)
export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentUserId: string;
  files: string[]; // data:application/* URLs
  submittedAt: number;
  status: 'submitted' | 'approved' | 'rejected';
  points?: number;
  feedback?: string;
  reviewedByUserId?: string;
  reviewedAt?: number;
};

// Quizzes
export type QuizQuestion = {
  id: string;
  text: string;
  options: string[]; // up to 4
  answerIndex: number; // 0..3
};
export type Quiz = {
  id: string;
  title: string;
  description?: string;
  points: number; // 1..3 small points
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  questions: QuizQuestion[];
  visibility: 'global' | 'school';
};

// Student profile view
export type StudentProfileView = {
  username: string;
  name: string;
  schoolId: string;
  ecoPoints: number;
  ecoTreeStage: 'Seedling' | 'Small Tree' | 'Big Tree';
  achievements: Array<{ key: string; name: string; unlocked: boolean }>;
  timeline: TimelineItem[];
  ranks: { global: number | null; school: number | null };
  allowExternalView: boolean;
  week: WeeklyStreak;
  leaderboardNext: { username: string; points: number } | null;
  profileCompletion: number; // 0..100
  unreadNotifications: number;
};

// Timeline
export type TimelineItem = {
  kind: 'task' | 'quiz' | 'game' | 'lesson';
  when: number;
  title: string;
  // optional enrichments
  photoDataUrl?: string; // task proof
  points?: number; // task or quiz points
  scorePercent?: number; // quiz
  lastPlayedAt?: number; // game
  moduleId?: string;
  lessonId?: string;
};

// Learning completions
export type LessonCompletion = {
  id: string;
  studentUserId: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  points: number;
  completedAt: number;
};

export type LearningLesson = {
  id: string;
  title: string;
  duration: string;
  points: number;
  content: string;
};

export type LearningModule = {
  id: string;
  title: string;
  description?: string;
  lessons: LearningLesson[];
  createdAt: number;
  updatedAt: number;
  createdByUserId: string;
  updatedByUserId: string;
  deleted?: boolean;
};

// Weekly streak (Mon..Sun)
export type WeeklyStreak = {
  start: number; // Monday start timestamp
  days: boolean[]; // length 7, index 0=Mon
};

// Quiz attempts and game plays
export type QuizAttempt = {
  id: string;
  quizId: string;
  studentUserId: string;
  answers?: number[];
  scorePercent: number; // 0..100
  attemptedAt: number;
};
export type GamePlay = {
  id: string;
  gameId: string; // simple string id/name
  studentUserId: string;
  playedAt: number;
  points?: number;
};

// Admin-managed Game catalog entry
export type Game = {
  id: string; // slug
  name: string;
  category: string;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  points: number; // credit awarded first time completed
  icon?: string; // emoji or icon name
  externalUrl?: string; // optional hosted/custom game link
  image?: string; // optional photo URL shown in catalog card
  createdAt: number;
  createdByUserId: string; // admin id
};

// Notifications
export type NotificationItem = {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'task' | 'quiz' | 'announcement' | 'badge';
  createdAt: number;
  readAt?: number;
};

// Video Management Types
export type Video = {
  id: string;
  title: string;
  description?: string;
  type: 'youtube' | 'file';
  url: string; // YouTube URL or file path
  thumbnail?: string; // Thumbnail URL or path
  credits: number; // Credits awarded for watching
  uploadedBy: string; // User ID of uploader
  uploadedAt: number;
  category?: string; // Optional categorization
  duration?: number; // Duration in seconds (for files)
};

export type UserVideoProgress = {
  id: string;
  userId: string;
  videoId: string;
  watched: boolean;
  watchedAt?: number;
  creditsAwarded: boolean;
};

export type UserCredits = {
  id: string;
  userId: string;
  totalCredits: number;
  lastUpdated: number;
};
