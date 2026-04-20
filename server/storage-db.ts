import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { orm } from "./db";
import { eq, and, or, desc, asc, sql, inArray, isNull } from "drizzle-orm";
import * as schema from "./schema";

// ============ TYPE DEFINITIONS ============
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
  submittedAt?: number;
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
  submittedAt?: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
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
  photoDataUrl?: string | null;
  photos?: string | null;
  submittedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  points?: number | null;
  feedback?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: number | null;
  groupId?: string | null;
};

export type TaskGroup = {
  id: string;
  taskId: string;
  memberUserIds: string | any;
  createdAt: number;
};

export type ProfilePayload = {
  username: string;
  role: 'student' | 'teacher' | 'admin';
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

export type ProfileUpsert = {
  name?: string;
  email?: string;
  schoolId?: string;
  photoDataUrl?: string;
  studentId?: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  teacherId?: string;
  subject?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body?: string | null;
  createdAt: number;
  createdByUserId: string;
  schoolId: string;
  visibility: 'global' | 'school';
};

export type Assignment = {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  maxPoints?: number | null;
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  visibility: 'global' | 'school';
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentUserId: string;
  files?: string | any;
  submittedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  points?: number | null;
  feedback?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: number | null;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
};

export type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  points: number;
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  questions: QuizQuestion[] | string | any;
  visibility: 'global' | 'school';
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  studentUserId: string;
  answers?: string | any;
  scorePercent?: number | null;
  attemptedAt: number;
};

export type GamePlay = {
  id: string;
  gameId: string;
  studentUserId: string;
  playedAt: number;
  points: number;
};

export type Game = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | null;
  points: number;
  icon?: string | null;
  externalUrl: string;
  image?: string | null;
  createdAt: number;
  createdByUserId?: string | null;
};

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
  lessons: LearningLesson[] | string | any;
  createdAt: number;
  updatedAt: number;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
  deleted?: boolean;
};

export type NotificationItem = {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'task' | 'quiz' | 'announcement' | 'badge';
  createdAt: number;
  readAt?: number | null;
};

export type Video = {
  id: string;
  title: string;
  description?: string | null;
  type: 'youtube' | 'file';
  url: string;
  thumbnail?: string | null;
  credits: number;
  uploadedBy: string;
  uploadedAt: number;
  category?: string | null;
  duration?: number | null;
};

export type UserVideoProgress = {
  id: string;
  userId: string;
  videoId: string;
  watched?: boolean | null;
  watchedAt?: number | null;
  creditsAwarded?: boolean | null;
};

export type UserCredits = {
  id: string;
  userId: string;
  totalCredits: number;
  lastUpdated: number;
};

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
  profileCompletion: number;
  unreadNotifications: number;
};

export type TimelineItem = {
  kind: 'task' | 'quiz' | 'game' | 'lesson';
  when: number;
  title: string;
  photoDataUrl?: string;
  points?: number;
  scorePercent?: number;
  lastPlayedAt?: number;
  moduleId?: string;
  lessonId?: string;
};

export type WeeklyStreak = {
  start: number;
  days: boolean[];
};

/**
 * DatabaseStorage - SQLite implementation using Drizzle ORM
 * Replaces the in-memory Map-based MemStorage with persistent database queries
 * 
 * Key changes from Map-based approach:
 * - All data persisted to SQLite database
 * - Async/await for all database operations
 * - JSON serialization for complex fields (questions, photos, lessons, etc.)
 * - Drizzle ORM for type-safe queries
 */
export class DatabaseStorage implements IStorage {
  constructor() {
    // No initialization needed - database is already initialized in db.ts
  }

  // ============ ADMIN SEEDING ============
  async seedAdmin() {
    const found = await orm.select().from(schema.users).where(eq(schema.users.username, 'admin123'));
    if (found.length === 0) {
      await orm.insert(schema.users).values({
        id: randomUUID(),
        name: 'Admin',
        email: 'admin@example.com',
        username: 'admin123',
        password: 'admin@1234',
        role: 'admin',
        approved: true,
      });
    }
  }

  // ============ USER MANAGEMENT ============
  async getUser(id: string): Promise<User | undefined> {
    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return user[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await orm.insert(schema.users).values(user);
    return user;
  }

  // ============ SCHOOLS ============
  async listSchools() {
    const schools = await orm.select().from(schema.schools);
    return schools.map(s => ({ id: s.id, name: s.name }));
  }

  async addSchool(name: string) {
    const school = { id: randomUUID(), name };
    await orm.insert(schema.schools).values(school);
    return school;
  }

  async removeSchool(id: string) {
    const result = await orm
      .delete(schema.schools)
      .where(eq(schema.schools.id, id));
    return result.changes > 0;
  }

  // ============ APPLICATIONS (SIGNUPS) ============
  async addStudentApplication(app: Omit<StudentApplication, 'id' | 'submittedAt'> & { submittedAt?: number }): Promise<StudentApplication> {
    const id = randomUUID();
    const stored: StudentApplication = {
      ...app,
      id,
      submittedAt: app.submittedAt || Date.now(),
    };
    await orm.insert(schema.studentApplications).values(stored);
    return stored;
  }

  async addTeacherApplication(app: Omit<TeacherApplication, 'id' | 'submittedAt'> & { submittedAt?: number }): Promise<TeacherApplication> {
    const id = randomUUID();
    const stored: TeacherApplication = {
      ...app,
      id,
      submittedAt: app.submittedAt || Date.now(),
    };
    await orm.insert(schema.teacherApplications).values(stored);
    return stored;
  }

  async listPending() {
    const [students, teachers] = await Promise.all([
      orm.select().from(schema.studentApplications),
      orm.select().from(schema.teacherApplications),
    ]);
    return { students, teachers };
  }

  async approveApplication(type: "student" | "teacher", id: string): Promise<boolean> {
    if (type === "student") {
      const app = await orm
        .select()
        .from(schema.studentApplications)
        .where(eq(schema.studentApplications.id, id))
        .limit(1);

      if (!app[0]) return false;

      const application = app[0];
      const userId = randomUUID();

      // Create user
      await orm.insert(schema.users).values({
        id: userId,
        username: application.username,
        password: application.password,
        email: application.email,
        role: "student",
        schoolId: application.schoolId,
        approved: 1,
      });

      // Create profile
      await orm.insert(schema.profiles).values({
        userId,
        username: application.username,
        role: "student",
        name: application.name,
        email: application.email,
        schoolId: application.schoolId,
        studentId: application.studentId,
        rollNumber: application.rollNumber,
        className: application.className,
        section: application.section,
        photoDataUrl: application.photoDataUrl,
        updatedAt: Date.now(),
      });

      // Delete from pending
      await orm
        .delete(schema.studentApplications)
        .where(eq(schema.studentApplications.id, id));

      return true;
    } else {
      const app = await orm
        .select()
        .from(schema.teacherApplications)
        .where(eq(schema.teacherApplications.id, id))
        .limit(1);

      if (!app[0]) return false;

      const application = app[0];
      const userId = randomUUID();

      // Create user
      await orm.insert(schema.users).values({
        id: userId,
        username: application.username,
        password: application.password,
        email: application.email,
        role: "teacher",
        schoolId: application.schoolId,
        subject: application.subject,
        approved: 1,
      });

      // Create profile
      await orm.insert(schema.profiles).values({
        userId,
        username: application.username,
        role: "teacher",
        name: application.name,
        email: application.email,
        schoolId: application.schoolId,
        teacherId: application.teacherId,
        subject: application.subject,
        photoDataUrl: application.photoDataUrl,
        updatedAt: Date.now(),
      });

      // Delete from pending
      await orm
        .delete(schema.teacherApplications)
        .where(eq(schema.teacherApplications.id, id));

      return true;
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const [approvedUser, studentApp, teacherApp] = await Promise.all([
      orm
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .limit(1),
      orm
        .select()
        .from(schema.studentApplications)
        .where(eq(schema.studentApplications.username, username))
        .limit(1),
      orm
        .select()
        .from(schema.teacherApplications)
        .where(eq(schema.teacherApplications.username, username))
        .limit(1),
    ]);

    return !approvedUser[0] && !studentApp[0] && !teacherApp[0];
  }

  async getApplicationStatus(username: string): Promise<"pending" | "approved" | "none"> {
    const [approvedUser, pendingApp] = await Promise.all([
      orm
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .limit(1),
      orm.select().from(schema.studentApplications)
        .where(eq(schema.studentApplications.username, username))
        .limit(1)
        .then(r => r[0] ? r : 
          orm.select().from(schema.teacherApplications)
            .where(eq(schema.teacherApplications.username, username))
            .limit(1)
        ),
    ]);

    if (approvedUser[0]) return "approved";
    if (pendingApp[0]) return "pending";
    return "none";
  }

  // ============ OTP MANAGEMENT ============
  async saveOtp(email: string, code: string, ttlMs: number): Promise<void> {
    const key = email.trim().toLowerCase();
    const sanitized = String(code).replace(/\D/g, '').slice(0, 6);
    const expiresAt = Date.now() + ttlMs;

    await orm
      .delete(schema.otps)
      .where(eq(schema.otps.email, key));

    await orm.insert(schema.otps).values({
      email: key,
      code: sanitized,
      expiresAt,
    });
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const key = email.trim().toLowerCase();
    const sanitized = String(code).replace(/\D/g, '').slice(0, 6);

    const otp = await orm
      .select()
      .from(schema.otps)
      .where(eq(schema.otps.email, key))
      .limit(1);

    if (!otp[0]) return false;

    const valid = otp[0].code === sanitized && Date.now() <= otp[0].expiresAt;
    return valid;
  }

  // ============ ADMIN OPERATIONS ============
  async resetPassword(username: string, password: string): Promise<boolean> {
    const result = await orm
      .update(schema.users)
      .set({ password })
      .where(eq(schema.users.username, username));

    return result.changes > 0;
  }

  async unapproveUser(username: string): Promise<boolean> {
    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user[0]) return false;

    const userId = user[0].id;
    const role = user[0].role;

    if (role !== "student" && role !== "teacher") return false;

    // Get profile
    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId))
      .limit(1);

    const profileData = profile[0];

    // Delete user and profile
    await Promise.all([
      orm.delete(schema.users).where(eq(schema.users.id, userId)),
      orm.delete(schema.profiles).where(eq(schema.profiles.userId, userId)),
    ]);

    // Create pending application
    if (role === "student") {
      await orm.insert(schema.studentApplications).values({
        id: randomUUID(),
        name: profileData?.name || "",
        email: profileData?.email || "",
        username,
        schoolId: profileData?.schoolId || "",
        studentId: profileData?.studentId || "REVIEW",
        rollNumber: profileData?.rollNumber,
        className: profileData?.className,
        section: profileData?.section,
        photoDataUrl: profileData?.photoDataUrl,
        password: user[0].password,
        submittedAt: Date.now(),
      });
    } else {
      await orm.insert(schema.teacherApplications).values({
        id: randomUUID(),
        name: profileData?.name || "",
        email: profileData?.email || "",
        username,
        schoolId: profileData?.schoolId || "",
        teacherId: profileData?.teacherId || "REVIEW",
        subject: profileData?.subject,
        photoDataUrl: profileData?.photoDataUrl,
        password: user[0].password,
        submittedAt: Date.now(),
      });
    }

    return true;
  }

  async listAdmins() {
    const admins = await orm
      .select({
        username: schema.users.username,
        name: schema.profiles.name,
        email: schema.profiles.email,
      })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"))
      .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId));

    return admins.map(a => ({
      username: a.username,
      name: a.name,
      email: a.email,
    }));
  }

  async createAdmin(input: {
    username: string;
    password: string;
    name?: string;
    email?: string;
  }) {
    const uname = input.username?.trim();
    if (!uname || !input.password) {
      return { ok: false as const, error: "Missing fields" };
    }

    const available = await this.isUsernameAvailable(uname);
    if (!available) {
      return { ok: false as const, error: "Username taken" };
    }

    const id = randomUUID();

    await Promise.all([
      orm.insert(schema.users).values({
        id,
        username: uname,
        password: input.password,
        email: input.email,
        role: "admin",
      }),
      orm.insert(schema.profiles).values({
        userId: id,
        username: uname,
        role: "admin",
        name: input.name || "",
        email: input.email || "",
        updatedAt: Date.now(),
      }),
    ]);

    return { ok: true as const };
  }

  async updateAdmin(
    username: string,
    updates: { username?: string; name?: string; email?: string },
    currentUsername?: string
  ) {
    if (username === "admin123" && currentUsername !== "admin123") {
      return { ok: false as const, error: "Only main admin can edit main admin" };
    }

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user[0]) return { ok: false as const, error: "Not found" };

    if (user[0].role !== "admin") {
      return { ok: false as const, error: "Not an admin" };
    }

    const userId = user[0].id;

    // Handle username change
    if (updates.username && updates.username.trim() !== username) {
      if (username === "admin123") {
        return { ok: false as const, error: "Main admin username cannot change" };
      }

      const newU = updates.username.trim();
      const available = await this.isUsernameAvailable(newU);
      if (!available) {
        return { ok: false as const, error: "Username taken" };
      }

      await orm
        .update(schema.users)
        .set({ username: newU })
        .where(eq(schema.users.id, userId));

      await orm
        .update(schema.profiles)
        .set({ username: newU })
        .where(eq(schema.profiles.userId, userId));
    }

    // Update profile
    await orm
      .update(schema.profiles)
      .set({
        name: updates.name !== undefined ? updates.name : undefined,
        email: updates.email !== undefined ? updates.email : undefined,
        updatedAt: Date.now(),
      })
      .where(eq(schema.profiles.userId, userId));

    return { ok: true as const };
  }

  async deleteAdmin(username: string) {
    if (username === "admin123") {
      return { ok: false as const, error: "Cannot delete main admin" };
    }

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user[0] || user[0].role !== "admin") {
      return { ok: false as const, error: "Not an admin" };
    }

    const userId = user[0].id;

    await Promise.all([
      orm.delete(schema.users).where(eq(schema.users.id, userId)),
      orm.delete(schema.profiles).where(eq(schema.profiles.userId, userId)),
    ]);

    return { ok: true as const };
  }

  // ============ PROFILES ============
  private async findUserIdByUsername(username: string): Promise<string | null> {
    const user = await orm
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    return user[0]?.id || null;
  }

  async getOwnProfile(username: string): Promise<ProfilePayload | null> {
    const uid = await this.findUserIdByUsername(username);
    if (!uid) return null;

    const [user, profile] = await Promise.all([
      orm
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, uid))
        .limit(1),
      orm
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, uid))
        .limit(1),
    ]);

    if (!user[0]) return null;

    const p = profile[0];
    const payload: ProfilePayload = {
      username: user[0].username,
      role: (user[0].role as any) || "student",
      name: p?.name || "",
      email: p?.email || "",
      schoolId: p?.schoolId || "",
      photoDataUrl: p?.photoDataUrl || "",
      studentId: p?.studentId,
      rollNumber: p?.rollNumber,
      className: p?.className,
      section: p?.section,
      teacherId: p?.teacherId,
      subject: p?.subject,
    };

    return payload;
  }

  async updateOwnProfile(
    username: string,
    updates: Partial<ProfileUpsert>
  ): Promise<{ ok: true; profile: ProfilePayload } | { ok: false; error: string }> {
    const uid = await this.findUserIdByUsername(username);
    if (!uid) return { ok: false, error: "User not found" };

    // Validate school exists if provided
    if (typeof updates.schoolId === "string" && updates.schoolId) {
      const school = await orm
        .select()
        .from(schema.schools)
        .where(eq(schema.schools.id, updates.schoolId))
        .limit(1);

      if (!school[0]) return { ok: false, error: "Invalid school" };
    }

    // Build update object
    const updateData: any = {};
    const allowed = [
      "name",
      "email",
      "schoolId",
      "photoDataUrl",
      "studentId",
      "rollNumber",
      "className",
      "section",
      "teacherId",
      "subject",
    ] as const;

    for (const k of allowed) {
      if (k in (updates as any)) {
        updateData[k] = (updates as any)[k] ?? "";
      }
    }

    updateData.updatedAt = Date.now();

    await orm
      .update(schema.profiles)
      .set(updateData)
      .where(eq(schema.profiles.userId, uid));

    const payload = await this.getOwnProfile(username);
    return { ok: true, profile: payload! };
  }

  // ============ TASKS ============
  async createTask(
    teacherUsername: string,
    input: {
      title: string;
      description?: string;
      deadline?: string;
      proofType?: "photo";
      maxPoints: number;
      groupMode?: "solo" | "group";
      maxGroupSize?: number;
    }
  ): Promise<{ ok: true; task: Task } | { ok: false; error: string }> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, teacherId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";
    const taskId = randomUUID();

    const task: Task = {
      id: taskId,
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      proofType: input.proofType || "photo",
      maxPoints: input.maxPoints,
      createdByUserId: teacherId,
      schoolId,
      createdAt: Date.now(),
      groupMode: input.groupMode || "solo",
      maxGroupSize: input.maxGroupSize,
    };

    await orm.insert(schema.tasks).values(task);

    return { ok: true, task };
  }

  async listTeacherTasks(teacherUsername: string): Promise<Task[]> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return [];

    const tasks = await orm
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.createdByUserId, teacherId))
      .orderBy(desc(schema.tasks.createdAt));

    return tasks;
  }

  async listStudentTasks(
    studentUsername: string
  ): Promise<Array<{ task: Task; submission?: TaskSubmission }>> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    // Get student's school
    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";

    // Get all school tasks
    const tasks = await orm
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.schoolId, schoolId))
      .orderBy(desc(schema.tasks.createdAt));

    // Get submissions for this student
    const submissions = await orm
      .select()
      .from(schema.taskSubmissions)
      .where(eq(schema.taskSubmissions.studentUserId, studentId));

    const submissionMap = new Map(submissions.map(s => [s.taskId, s]));

    return tasks.map(task => ({
      task,
      submission: submissionMap.get(task.id),
    }));
  }

  async submitTask(
    studentUsername: string,
    taskId: string,
    photoDataUrlOrList: string | string[]
  ): Promise<{ ok: true; submission: TaskSubmission } | { ok: false; error: string }> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return { ok: false, error: "Student not found" };

    const task = await orm
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .limit(1);

    if (!task[0]) return { ok: false, error: "Task not found" };

    const submissionId = randomUUID();
    const photos = Array.isArray(photoDataUrlOrList)
      ? photoDataUrlOrList
      : [photoDataUrlOrList];

    const submission: TaskSubmission = {
      id: submissionId,
      taskId,
      studentUserId: studentId,
      photoDataUrl: photos[0],
      photos: photos.length > 1 ? JSON.stringify(photos) : null,
      submittedAt: Date.now(),
      status: "pending",
      points: null,
      feedback: null,
      reviewedByUserId: null,
      reviewedAt: null,
      groupId: null,
    };

    await orm.insert(schema.taskSubmissions).values(submission);

    return { ok: true, submission };
  }

  async listSubmissionsForTeacher(
    teacherUsername: string,
    taskId?: string
  ): Promise<
    Array<
      TaskSubmission & {
        studentUsername: string;
        studentName?: string;
        className?: string;
        section?: string;
        groupMembers?: string[];
        taskMaxPoints?: number;
      }
    >
  > {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return [];

    // Get teacher's tasks
    let submissions: any[] = [];

    if (taskId) {
      submissions = await orm
        .select()
        .from(schema.taskSubmissions)
        .where(eq(schema.taskSubmissions.taskId, taskId));
    } else {
      const teacherTasks = await orm
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.createdByUserId, teacherId));

      const taskIds = teacherTasks.map(t => t.id);

      if (taskIds.length === 0) return [];

      submissions = await orm
        .select()
        .from(schema.taskSubmissions)
        .where(inArray(schema.taskSubmissions.taskId, taskIds));
    }

    // Enrich with student and task info
    const result = [];

    for (const submission of submissions) {
      const [student, task, profile] = await Promise.all([
        orm
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, submission.studentUserId))
          .limit(1),
        orm
          .select()
          .from(schema.tasks)
          .where(eq(schema.tasks.id, submission.taskId))
          .limit(1),
        orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, submission.studentUserId))
          .limit(1),
      ]);

      if (student[0]) {
        result.push({
          ...submission,
          studentUsername: student[0].username,
          studentName: profile[0]?.name,
          className: profile[0]?.className,
          section: profile[0]?.section,
          groupMembers: submission.groupId
            ? await this.getGroupMembers(submission.groupId)
            : undefined,
          taskMaxPoints: task[0]?.maxPoints,
        });
      }
    }

    return result;
  }

  private async getGroupMembers(groupId: string): Promise<string[]> {
    const group = await orm
      .select()
      .from(schema.taskGroups)
      .where(eq(schema.taskGroups.id, groupId))
      .limit(1);

    if (!group[0]) return [];

    const memberIds = JSON.parse(group[0].memberUserIds as any);
    const members = await orm
      .select({ username: schema.users.username })
      .from(schema.users)
      .where(inArray(schema.users.id, memberIds));

    return members.map(m => m.username);
  }

  async reviewSubmission(
    teacherUsername: string,
    submissionId: string,
    decision: { status: "approved" | "rejected"; points?: number; feedback?: string }
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const submission = await orm
      .select()
      .from(schema.taskSubmissions)
      .where(eq(schema.taskSubmissions.id, submissionId))
      .limit(1);

    if (!submission[0]) return { ok: false, error: "Submission not found" };

    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const now = Date.now();

    await orm
      .update(schema.taskSubmissions)
      .set({
        status: decision.status,
        points: decision.points !== undefined ? decision.points : submission[0].points,
        feedback: decision.feedback || submission[0].feedback,
        reviewedByUserId: teacherId,
        reviewedAt: now,
      })
      .where(eq(schema.taskSubmissions.id, submissionId));

    return { ok: true };
  }

  async createTaskGroup(
    studentUsername: string,
    taskId: string,
    members: string[]
  ): Promise<
    { ok: true; group: TaskGroup & { memberUsernames: string[] } } | { ok: false; error: string }
  > {
    const groupId = randomUUID();
    const studentId = await this.findUserIdByUsername(studentUsername);

    if (!studentId) return { ok: false, error: "Student not found" };

    // Resolve all member usernames to IDs
    const memberIds: string[] = [studentId];

    for (const memberUsername of members) {
      const memberId = await this.findUserIdByUsername(memberUsername);
      if (memberId && memberId !== studentId) {
        memberIds.push(memberId);
      }
    }

    const group: TaskGroup = {
      id: groupId,
      taskId,
      memberUserIds: JSON.stringify(memberIds) as any,
      createdAt: Date.now(),
    };

    await orm.insert(schema.taskGroups).values(group);

    return {
      ok: true,
      group: {
        ...group,
        memberUsernames: members,
      },
    };
  }

  async getTaskGroupForStudent(
    studentUsername: string,
    taskId: string
  ): Promise<(TaskGroup & { memberUsernames: string[] }) | null> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return null;

    const groups = await orm
      .select()
      .from(schema.taskGroups)
      .where(eq(schema.taskGroups.taskId, taskId));

    for (const group of groups) {
      const memberIds = JSON.parse(group.memberUserIds as any);
      if (memberIds.includes(studentId)) {
        const memberUsers = await orm
          .select({ username: schema.users.username })
          .from(schema.users)
          .where(inArray(schema.users.id, memberIds));

        return {
          ...group,
          memberUsernames: memberUsers.map(u => u.username),
        };
      }
    }

    return null;
  }

  // ============ ANNOUNCEMENTS ============
  async createAnnouncement(
    teacherUsername: string,
    input: { title: string; body?: string }
  ): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, teacherId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";
    const announcementId = randomUUID();

    const announcement: Announcement = {
      id: announcementId,
      title: input.title,
      body: input.body,
      createdAt: Date.now(),
      createdByUserId: teacherId,
      schoolId,
      visibility: "school",
    };

    await orm.insert(schema.announcements).values(announcement);

    return { ok: true, announcement };
  }

  async listAnnouncementsForTeacher(teacherUsername: string): Promise<Announcement[]> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return [];

    const announcements = await orm
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.createdByUserId, teacherId))
      .orderBy(desc(schema.announcements.createdAt));

    return announcements;
  }

  async createAdminAnnouncement(
    adminUsername: string,
    input: { title: string; body?: string }
  ): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return { ok: false, error: "Admin not found" };

    const announcementId = randomUUID();

    const announcement: Announcement = {
      id: announcementId,
      title: input.title,
      body: input.body,
      createdAt: Date.now(),
      createdByUserId: adminId,
      schoolId: "",
      visibility: "global",
    };

    await orm.insert(schema.announcements).values(announcement);

    return { ok: true, announcement };
  }

  async listAdminAnnouncements(adminUsername: string): Promise<Announcement[]> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return [];

    const announcements = await orm
      .select()
      .from(schema.announcements)
      .where(
        and(
          eq(schema.announcements.createdByUserId, adminId),
          eq(schema.announcements.visibility, "global")
        )
      )
      .orderBy(desc(schema.announcements.createdAt));

    return announcements;
  }

  async updateAdminAnnouncement(
    adminUsername: string,
    announcementId: string,
    updates: { title?: string; body?: string }
  ): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }> {
    const announcement = await orm
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, announcementId))
      .limit(1);

    if (!announcement[0] || announcement[0].visibility !== "global") {
      return { ok: false, error: "Not found or unauthorized" };
    }

    const updated = { ...announcement[0], ...updates };

    await orm
      .update(schema.announcements)
      .set(updated)
      .where(eq(schema.announcements.id, announcementId));

    return { ok: true, announcement: updated };
  }

  async deleteAdminAnnouncement(
    adminUsername: string,
    announcementId: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const announcement = await orm
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, announcementId))
      .limit(1);

    if (!announcement[0] || announcement[0].visibility !== "global") {
      return { ok: false, error: "Not found or unauthorized" };
    }

    await orm
      .delete(schema.announcements)
      .where(eq(schema.announcements.id, announcementId));

    return { ok: true };
  }

  async listStudentAnnouncements(studentUsername: string): Promise<Announcement[]> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    const schoolId = profile[0]?.schoolId;

    const announcements = await orm
      .select()
      .from(schema.announcements)
      .where(
        or(
          eq(schema.announcements.visibility, "global"),
          schoolId ? eq(schema.announcements.schoolId, schoolId) : undefined
        )
      )
      .orderBy(desc(schema.announcements.createdAt));

    return announcements;
  }

  // ============ QUIZZES ============
  async createQuiz(
    teacherUsername: string,
    input: {
      title: string;
      description?: string;
      points?: number;
      questions: Array<{ text: string; options: string[]; answerIndex: number }>;
    }
  ): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, teacherId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";
    const quizId = randomUUID();

    // Add IDs to questions if missing
    const questions = input.questions.map(q => ({
      ...q,
      id: randomUUID(),
    }));

    const quiz: Quiz = {
      id: quizId,
      title: input.title,
      description: input.description,
      points: input.points || 0,
      createdByUserId: teacherId,
      schoolId,
      createdAt: Date.now(),
      questions: questions as any,
      visibility: "school",
    };

    await orm.insert(schema.quizzes).values({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      points: quiz.points,
      createdByUserId: quiz.createdByUserId,
      schoolId: quiz.schoolId,
      createdAt: quiz.createdAt,
      questions: JSON.stringify(quiz.questions) as any,
      visibility: quiz.visibility,
    });

    return { ok: true, quiz };
  }

  async updateQuiz(
    teacherUsername: string,
    id: string,
    updates: {
      title?: string;
      description?: string;
      points?: number;
      questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }>;
    }
  ): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }> {
    const quiz = await orm
      .select()
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, id))
      .limit(1);

    if (!quiz[0] || quiz[0].createdByUserId !== (await this.findUserIdByUsername(teacherUsername))) {
      return { ok: false, error: "Not found or unauthorized" };
    }

    const questions = updates.questions?.map(q => ({
      ...q,
      id: q.id || randomUUID(),
    }));

    const updated = {
      ...quiz[0],
      title: updates.title ?? quiz[0].title,
      description: updates.description ?? quiz[0].description,
      points: updates.points ?? quiz[0].points,
      questions: questions ? JSON.stringify(questions) : quiz[0].questions,
    };

    await orm
      .update(schema.quizzes)
      .set(updated)
      .where(eq(schema.quizzes.id, id));

    return {
      ok: true,
      quiz: {
        ...updated,
        questions: questions || JSON.parse(quiz[0].questions as any),
      } as any,
    };
  }

  async deleteQuiz(
    teacherUsername: string,
    id: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const quiz = await orm
      .select()
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, id))
      .limit(1);

    if (!quiz[0] || quiz[0].createdByUserId !== (await this.findUserIdByUsername(teacherUsername))) {
      return { ok: false, error: "Not found or unauthorized" };
    }

    await orm.delete(schema.quizzes).where(eq(schema.quizzes.id, id));

    return { ok: true };
  }

  async listStudentQuizzes(studentUsername: string): Promise<Quiz[]> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    const schoolId = profile[0]?.schoolId;

    const quizzes = await orm
      .select()
      .from(schema.quizzes)
      .where(
        or(
          eq(schema.quizzes.visibility, "global"),
          schoolId ? eq(schema.quizzes.schoolId, schoolId) : undefined
        )
      )
      .orderBy(desc(schema.quizzes.createdAt));

    return quizzes.map(q => ({
      ...q,
      questions: JSON.parse(q.questions as any),
    } as any));
  }

  async addQuizAttempt(
    studentUsername: string,
    input: { quizId: string; answers?: number[]; scorePercent?: number }
  ): Promise<{ ok: true; attempt: QuizAttempt } | { ok: false; error: string }> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return { ok: false, error: "Student not found" };

    const quiz = await orm
      .select()
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, input.quizId))
      .limit(1);

    if (!quiz[0]) return { ok: false, error: "Quiz not found" };

    const attemptId = randomUUID();

    const attempt: QuizAttempt = {
      id: attemptId,
      quizId: input.quizId,
      studentUserId: studentId,
      answers: input.answers ? JSON.stringify(input.answers) : null,
      scorePercent: input.scorePercent || null,
      attemptedAt: Date.now(),
    };

    await orm.insert(schema.quizAttempts).values(attempt);

    return { ok: true, attempt };
  }

  async getStudentQuizAttempt(username: string, quizId: string): Promise<QuizAttempt | null> {
    const studentId = await this.findUserIdByUsername(username);
    if (!studentId) return null;

    const attempt = await orm
      .select()
      .from(schema.quizAttempts)
      .where(
        and(
          eq(schema.quizAttempts.studentUserId, studentId),
          eq(schema.quizAttempts.quizId, quizId)
        )
      )
      .limit(1);

    return attempt[0] || null;
  }

  // ============ ASSIGNMENTS ============
  async createAssignment(
    teacherUsername: string,
    input: { title: string; description?: string; deadline?: string; maxPoints?: number }
  ): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, teacherId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";
    const assignmentId = randomUUID();

    const assignment: Assignment = {
      id: assignmentId,
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      maxPoints: input.maxPoints,
      createdByUserId: teacherId,
      schoolId,
      createdAt: Date.now(),
      visibility: "school",
    };

    await orm.insert(schema.assignments).values(assignment);

    return { ok: true, assignment };
  }

  async listTeacherAssignments(teacherUsername: string): Promise<Assignment[]> {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return [];

    const assignments = await orm
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.createdByUserId, teacherId))
      .orderBy(desc(schema.assignments.createdAt));

    return assignments;
  }

  async createAdminAssignment(
    adminUsername: string,
    input: { title: string; description?: string; deadline?: string; maxPoints?: number }
  ): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return { ok: false, error: "Admin not found" };

    const assignmentId = randomUUID();

    const assignment: Assignment = {
      id: assignmentId,
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      maxPoints: input.maxPoints,
      createdByUserId: adminId,
      schoolId: "",
      createdAt: Date.now(),
      visibility: "global",
    };

    await orm.insert(schema.assignments).values(assignment);

    return { ok: true, assignment };
  }

  async listAdminAssignments(adminUsername: string): Promise<Assignment[]> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return [];

    const assignments = await orm
      .select()
      .from(schema.assignments)
      .where(
        and(
          eq(schema.assignments.createdByUserId, adminId),
          eq(schema.assignments.visibility, "global")
        )
      )
      .orderBy(desc(schema.assignments.createdAt));

    return assignments;
  }

  async updateAdminAssignment(
    adminUsername: string,
    assignmentId: string,
    updates: { title?: string; description?: string; deadline?: string; maxPoints?: number }
  ): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }> {
    const assignment = await orm
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

    if (!assignment[0] || assignment[0].visibility !== "global") {
      return { ok: false, error: "Not found or unauthorized" };
    }

    const updated = { ...assignment[0], ...updates };

    await orm
      .update(schema.assignments)
      .set(updated)
      .where(eq(schema.assignments.id, assignmentId));

    return { ok: true, assignment: updated };
  }

  async deleteAdminAssignment(
    adminUsername: string,
    assignmentId: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const assignment = await orm
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

    if (!assignment[0] || assignment[0].visibility !== "global") {
      return { ok: false, error: "Not found or unauthorized" };
    }

    await orm
      .delete(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId));

    return { ok: true };
  }

  async listStudentAssignments(
    studentUsername: string
  ): Promise<Array<{ assignment: Assignment; submission?: AssignmentSubmission }>> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    const schoolId = profile[0]?.schoolId || "";

    const assignments = await orm
      .select()
      .from(schema.assignments)
      .where(
        or(
          eq(schema.assignments.visibility, "global"),
          eq(schema.assignments.schoolId, schoolId)
        )
      )
      .orderBy(desc(schema.assignments.createdAt));

    const submissions = await orm
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.studentUserId, studentId));

    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));

    return assignments.map(assignment => ({
      assignment,
      submission: submissionMap.get(assignment.id),
    }));
  }

  async submitAssignment(
    studentUsername: string,
    assignmentId: string,
    filesOrList: string | string[]
  ): Promise<
    { ok: true; submission: AssignmentSubmission } | { ok: false; error: string }
  > {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return { ok: false, error: "Student not found" };

    const assignment = await orm
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

    if (!assignment[0]) return { ok: false, error: "Assignment not found" };

    const submissionId = randomUUID();
    const files = Array.isArray(filesOrList) ? filesOrList : [filesOrList];

    const submission: AssignmentSubmission = {
      id: submissionId,
      assignmentId,
      studentUserId: studentId,
      files: JSON.stringify(files) as any,
      submittedAt: Date.now(),
      status: "pending",
      points: null,
      feedback: null,
      reviewedByUserId: null,
      reviewedAt: null,
    };

    await orm.insert(schema.assignmentSubmissions).values(submission);

    return { ok: true, submission };
  }

  async listAssignmentSubmissionsForTeacher(
    teacherUsername: string,
    assignmentId?: string
  ): Promise<
    Array<
      AssignmentSubmission & {
        studentUsername: string;
        studentName?: string;
        className?: string;
        section?: string;
        assignmentMaxPoints?: number;
      }
    >
  > {
    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return [];

    let submissions: any[] = [];

    if (assignmentId) {
      submissions = await orm
        .select()
        .from(schema.assignmentSubmissions)
        .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId));
    } else {
      const teacherAssignments = await orm
        .select()
        .from(schema.assignments)
        .where(eq(schema.assignments.createdByUserId, teacherId));

      const assignmentIds = teacherAssignments.map(a => a.id);

      if (assignmentIds.length === 0) return [];

      submissions = await orm
        .select()
        .from(schema.assignmentSubmissions)
        .where(inArray(schema.assignmentSubmissions.assignmentId, assignmentIds));
    }

    const result = [];

    for (const submission of submissions) {
      const [student, assignment, profile] = await Promise.all([
        orm
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, submission.studentUserId))
          .limit(1),
        orm
          .select()
          .from(schema.assignments)
          .where(eq(schema.assignments.id, submission.assignmentId))
          .limit(1),
        orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, submission.studentUserId))
          .limit(1),
      ]);

      if (student[0]) {
        result.push({
          ...submission,
          studentUsername: student[0].username,
          studentName: profile[0]?.name,
          className: profile[0]?.className,
          section: profile[0]?.section,
          assignmentMaxPoints: assignment[0]?.maxPoints,
        });
      }
    }

    return result;
  }

  async reviewAssignmentSubmission(
    teacherUsername: string,
    submissionId: string,
    decision: { status: "approved" | "rejected"; points?: number; feedback?: string }
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const submission = await orm
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, submissionId))
      .limit(1);

    if (!submission[0]) return { ok: false, error: "Submission not found" };

    const teacherId = await this.findUserIdByUsername(teacherUsername);
    if (!teacherId) return { ok: false, error: "Teacher not found" };

    const now = Date.now();

    await orm
      .update(schema.assignmentSubmissions)
      .set({
        status: decision.status,
        points: decision.points !== undefined ? decision.points : submission[0].points,
        feedback: decision.feedback || submission[0].feedback,
        reviewedByUserId: teacherId,
        reviewedAt: now,
      })
      .where(eq(schema.assignmentSubmissions.id, submissionId));

    return { ok: true };
  }

  async listAssignmentSubmissionsForAdmin(
    adminUsername: string,
    assignmentId?: string
  ): Promise<
    Array<
      AssignmentSubmission & {
        studentUsername: string;
        studentName?: string;
        className?: string;
        section?: string;
        assignmentMaxPoints?: number;
      }
    >
  > {
    let submissions: any[] = [];

    if (assignmentId) {
      submissions = await orm
        .select()
        .from(schema.assignmentSubmissions)
        .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId));
    } else {
      const adminId = await this.findUserIdByUsername(adminUsername);
      if (!adminId) return [];

      const adminAssignments = await orm
        .select()
        .from(schema.assignments)
        .where(
          and(
            eq(schema.assignments.createdByUserId, adminId),
            eq(schema.assignments.visibility, "global")
          )
        );

      const assignmentIds = adminAssignments.map(a => a.id);

      if (assignmentIds.length === 0) return [];

      submissions = await orm
        .select()
        .from(schema.assignmentSubmissions)
        .where(inArray(schema.assignmentSubmissions.assignmentId, assignmentIds));
    }

    const result = [];

    for (const submission of submissions) {
      const [student, assignment, profile] = await Promise.all([
        orm
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, submission.studentUserId))
          .limit(1),
        orm
          .select()
          .from(schema.assignments)
          .where(eq(schema.assignments.id, submission.assignmentId))
          .limit(1),
        orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, submission.studentUserId))
          .limit(1),
      ]);

      if (student[0]) {
        result.push({
          ...submission,
          studentUsername: student[0].username,
          studentName: profile[0]?.name,
          className: profile[0]?.className,
          section: profile[0]?.section,
          assignmentMaxPoints: assignment[0]?.maxPoints,
        });
      }
    }

    return result;
  }

  async reviewAdminAssignmentSubmission(
    adminUsername: string,
    submissionId: string,
    decision: { status: "approved" | "rejected"; points?: number; feedback?: string }
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const submission = await orm
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, submissionId))
      .limit(1);

    if (!submission[0]) return { ok: false, error: "Submission not found" };

    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return { ok: false, error: "Admin not found" };

    const now = Date.now();

    await orm
      .update(schema.assignmentSubmissions)
      .set({
        status: decision.status,
        points: decision.points !== undefined ? decision.points : submission[0].points,
        feedback: decision.feedback || submission[0].feedback,
        reviewedByUserId: adminId,
        reviewedAt: now,
      })
      .where(eq(schema.assignmentSubmissions.id, submissionId));

    return { ok: true };
  }

  // ============ GAMES ============
  async listGames(): Promise<Game[]> {
    const games = await orm.select().from(schema.games).orderBy(desc(schema.games.createdAt));
    return games;
  }

  async listAdminGames(adminUsername: string): Promise<Game[]> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return [];

    const games = await orm
      .select()
      .from(schema.games)
      .where(eq(schema.games.createdByUserId, adminId))
      .orderBy(desc(schema.games.createdAt));

    return games;
  }

  async createAdminGame(
    adminUsername: string,
    input: {
      id?: string;
      name: string;
      category: string;
      description?: string;
      difficulty?: "Easy" | "Medium" | "Hard";
      points: number;
      icon?: string;
      externalUrl: string;
      image?: string;
    }
  ): Promise<{ ok: true; game: Game } | { ok: false; error: string }> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return { ok: false, error: "Admin not found" };

    const gameId =
      input.id ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!gameId) return { ok: false, error: "Invalid game ID" };

    const game: Game = {
      id: gameId,
      name: input.name,
      category: input.category,
      description: input.description,
      difficulty: input.difficulty,
      points: input.points,
      icon: input.icon,
      externalUrl: input.externalUrl,
      image: input.image,
      createdAt: Date.now(),
      createdByUserId: adminId,
    };

    await orm.insert(schema.games).values(game);

    return { ok: true, game };
  }

  async updateAdminGame(
    adminUsername: string,
    gameId: string,
    updates: Partial<{
      name: string;
      category: string;
      description?: string;
      difficulty?: "Easy" | "Medium" | "Hard";
      points: number;
      icon?: string;
      externalUrl: string;
      image?: string;
    }>
  ): Promise<{ ok: true; game: Game } | { ok: false; error: string }> {
    const game = await orm
      .select()
      .from(schema.games)
      .where(eq(schema.games.id, gameId))
      .limit(1);

    if (!game[0] || game[0].createdByUserId !== (await this.findUserIdByUsername(adminUsername))) {
      return { ok: false, error: "Not found or unauthorized" };
    }

    const updated = { ...game[0], ...updates };

    await orm
      .update(schema.games)
      .set(updated)
      .where(eq(schema.games.id, gameId));

    return { ok: true, game: updated };
  }

  async deleteAdminGame(
    adminUsername: string,
    gameId: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const game = await orm
      .select()
      .from(schema.games)
      .where(eq(schema.games.id, gameId))
      .limit(1);

    if (!game[0] || game[0].createdByUserId !== (await this.findUserIdByUsername(adminUsername))) {
      return { ok: false, error: "Not found or unauthorized" };
    }

    await orm.delete(schema.games).where(eq(schema.games.id, gameId));

    return { ok: true };
  }

  async addGamePlay(
    studentUsername: string,
    gameId: string,
    points?: number
  ): Promise<{ ok: true; play: GamePlay } | { ok: false; error: string }> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return { ok: false, error: "Student not found" };

    const game = await orm
      .select()
      .from(schema.games)
      .where(eq(schema.games.id, gameId))
      .limit(1);

    if (!game[0]) return { ok: false, error: "Game not found" };

    const playId = randomUUID();

    const play: GamePlay = {
      id: playId,
      gameId,
      studentUserId: studentId,
      playedAt: Date.now(),
      points: points || game[0].points || 0,
    };

    await orm.insert(schema.gamePlays).values(play);

    return { ok: true, play };
  }

  async getStudentGameSummary(username: string): Promise<{
    totalGamePoints: number;
    badges: string[];
    monthCompletedCount: number;
    totalUniqueGames: number;
  }> {
    const studentId = await this.findUserIdByUsername(username);
    if (!studentId) {
      return { totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 };
    }

    const plays = await orm
      .select()
      .from(schema.gamePlays)
      .where(eq(schema.gamePlays.studentUserId, studentId));

    const totalGamePoints = plays.reduce((sum, p) => sum + (p.points || 0), 0);
    const uniqueGames = new Set(plays.map(p => p.gameId)).size;

    const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
    const monthCompleted = plays.filter(p => p.playedAt >= monthAgo).length;

    const badges = [];
    if (totalGamePoints >= 100) badges.push("🎮 Game Master");
    if (uniqueGames >= 5) badges.push("🌍 Explorer");
    if (monthCompleted >= 10) badges.push("⚡ Active Player");

    return {
      totalGamePoints,
      badges,
      monthCompletedCount: monthCompleted,
      totalUniqueGames: uniqueGames,
    };
  }

  // ============ LEARNING MODULES & LESSONS ============
  async listLessonCompletions(studentUsername: string): Promise<LessonCompletion[]> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    const completions = await orm
      .select()
      .from(schema.lessonCompletions)
      .where(eq(schema.lessonCompletions.studentUserId, studentId))
      .orderBy(desc(schema.lessonCompletions.completedAt));

    return completions;
  }

  async completeLesson(
    studentUsername: string,
    input: { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string; points: number }
  ): Promise<
    { ok: true; completion: LessonCompletion; alreadyCompleted: boolean } | { ok: false; error: string }
  > {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return { ok: false, error: "Student not found" };

    const moduleId = String(input.moduleId || "").trim();
    const lessonId = String(input.lessonId || "").trim();
    const moduleTitle = String(input.moduleTitle || "").trim();
    const lessonTitle = String(input.lessonTitle || "").trim();
    const points = Number(input.points || 0);

    if (!moduleId || !lessonId || !moduleTitle || !lessonTitle) {
      return { ok: false, error: "Missing lesson details" };
    }

    if (!Number.isFinite(points) || points <= 0) {
      return { ok: false, error: "Invalid points" };
    }

    const existing = await orm
      .select()
      .from(schema.lessonCompletions)
      .where(
        and(
          eq(schema.lessonCompletions.studentUserId, studentId),
          eq(schema.lessonCompletions.moduleId, moduleId),
          eq(schema.lessonCompletions.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing[0]) {
      return { ok: true, completion: existing[0], alreadyCompleted: true };
    }

    const completion: LessonCompletion = {
      id: randomUUID(),
      studentUserId: studentId,
      moduleId,
      moduleTitle,
      lessonId,
      lessonTitle,
      points: Math.floor(points),
      completedAt: Date.now(),
    };

    await orm.insert(schema.lessonCompletions).values(completion);

    return { ok: true, completion, alreadyCompleted: false };
  }

  async listLearningModules(): Promise<LearningModule[]> {
    const modules = await orm
      .select()
      .from(schema.learningModules)
      .where(eq(schema.learningModules.deleted, false))
      .orderBy(asc(schema.learningModules.createdAt));

    return modules.map(m => ({
      ...m,
      lessons: JSON.parse(m.lessons as any),
    })) as any;
  }

  async listManagedLearningModules(managerUsername: string): Promise<LearningModule[]> {
    const managerId = await this.findUserIdByUsername(managerUsername);
    if (!managerId) return [];

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, managerId))
      .limit(1);

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "teacher")) {
      return [];
    }

    return await this.listLearningModules();
  }

  async upsertManagedLearningModule(
    managerUsername: string,
    input: {
      id?: string;
      title: string;
      description?: string;
      lessons: Array<{ id?: string; title: string; duration?: string; points: number; content?: string }>;
    }
  ): Promise<{ ok: true; module: LearningModule } | { ok: false; error: string }> {
    const managerId = await this.findUserIdByUsername(managerUsername);
    if (!managerId) return { ok: false, error: "User not found" };

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, managerId))
      .limit(1);

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "teacher")) {
      return { ok: false, error: "Not allowed" };
    }

    const title = String(input?.title || "").trim();
    if (!title) return { ok: false, error: "Module title is required" };

    const nextId = (String(input?.id || "").trim() || title.toLowerCase())
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!nextId) return { ok: false, error: "Invalid module id" };

    const rawLessons = Array.isArray(input?.lessons) ? input.lessons : [];
    if (rawLessons.length === 0) return { ok: false, error: "At least one lesson is required" };

    const lessons: LearningLesson[] = [];
    const seenLessonIds = new Set<string>();

    for (let i = 0; i < rawLessons.length; i++) {
      const raw = rawLessons[i] || ({} as any);
      const lessonTitle = String(raw.title || "").trim();
      if (!lessonTitle) return { ok: false, error: `Lesson ${i + 1} title is required` };

      const lessonId = (String(raw.id || "").trim() || lessonTitle.toLowerCase())
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!lessonId) return { ok: false, error: `Lesson ${i + 1} id is invalid` };
      if (seenLessonIds.has(lessonId)) {
        return { ok: false, error: `Duplicate lesson id: ${lessonId}` };
      }
      seenLessonIds.add(lessonId);

      let points = Math.floor(Number(raw.points));
      if (!Number.isFinite(points) || points < 1) points = 1;
      if (points > 500) points = 500;

      lessons.push({
        id: lessonId,
        title: lessonTitle,
        duration: String(raw.duration || "").trim() || "10 minutes",
        points,
        content:
          String(raw.content || "").trim() ||
          `<h2>${lessonTitle}</h2><p>Lesson content coming soon.</p>`,
      });
    }

    const existing = await orm
      .select()
      .from(schema.learningModules)
      .where(eq(schema.learningModules.id, nextId))
      .limit(1);

    const module: LearningModule = {
      id: nextId,
      title,
      description: String(input?.description || "").trim(),
      lessons,
      createdAt: existing[0]?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdByUserId: existing[0]?.createdByUserId || managerId,
      updatedByUserId: managerId,
      deleted: false,
    };

    if (existing[0]) {
      await orm
        .update(schema.learningModules)
        .set({
          title: module.title,
          description: module.description,
          lessons: JSON.stringify(module.lessons),
          updatedAt: module.updatedAt,
          updatedByUserId: module.updatedByUserId,
          deleted: module.deleted,
        })
        .where(eq(schema.learningModules.id, nextId));
    } else {
      await orm.insert(schema.learningModules).values({
        id: module.id,
        title: module.title,
        description: module.description,
        lessons: JSON.stringify(module.lessons) as any,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        createdByUserId: module.createdByUserId,
        updatedByUserId: module.updatedByUserId,
        deleted: module.deleted,
      });
    }

    return { ok: true, module };
  }

  async deleteManagedLearningModule(
    managerUsername: string,
    moduleId: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const managerId = await this.findUserIdByUsername(managerUsername);
    if (!managerId) return { ok: false, error: "User not found" };

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, managerId))
      .limit(1);

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "teacher")) {
      return { ok: false, error: "Not allowed" };
    }

    const id = String(moduleId || "").trim();
    if (!id) return { ok: false, error: "Module id is required" };

    const existing = await orm
      .select()
      .from(schema.learningModules)
      .where(eq(schema.learningModules.id, id))
      .limit(1);

    const tombstone: LearningModule = {
      id,
      title: existing[0]?.title || id,
      description: existing[0]?.description || "",
      lessons: existing[0]?.lessons || [],
      createdAt: existing[0]?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdByUserId: existing[0]?.createdByUserId || managerId,
      updatedByUserId: managerId,
      deleted: true,
    };

    if (existing[0]) {
      await orm
        .update(schema.learningModules)
        .set({
          deleted: true,
          updatedAt: Date.now(),
          updatedByUserId: managerId,
        })
        .where(eq(schema.learningModules.id, id));
    } else {
      await orm.insert(schema.learningModules).values({
        id: tombstone.id,
        title: tombstone.title,
        description: tombstone.description,
        lessons: JSON.stringify(tombstone.lessons) as any,
        createdAt: tombstone.createdAt,
        updatedAt: tombstone.updatedAt,
        createdByUserId: tombstone.createdByUserId,
        updatedByUserId: tombstone.updatedByUserId,
        deleted: true,
      });
    }

    return { ok: true };
  }

  // ============ NOTIFICATIONS ============
  async listNotifications(username: string): Promise<NotificationItem[]> {
    const userId = await this.findUserIdByUsername(username);
    if (!userId) return [];

    const notifications = await orm
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));

    return notifications as any;
  }

  async markAllNotificationsRead(username: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const userId = await this.findUserIdByUsername(username);
    if (!userId) return { ok: false, error: "User not found" };

    const now = Date.now();

    await orm
      .update(schema.notifications)
      .set({ readAt: now })
      .where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt)));

    return { ok: true };
  }

  private async addNotificationForUserId(
    userId: string,
    message: string,
    type: string
  ): Promise<void> {
    await orm.insert(schema.notifications).values({
      id: randomUUID(),
      userId,
      message,
      type,
      createdAt: Date.now(),
      readAt: null,
    });
  }

  // ============ LEADERBOARDS ============
  async getGlobalSchoolsLeaderboard(limit = 25) {
    const schools = await orm.select().from(schema.schools);
    const perSchool = new Map<string, { eco: number; students: number }>();

    // Count students per school
    const schoolProfiles = await orm.select().from(schema.profiles);
    const studentEco = new Map<string, number>();

    for (const profile of schoolProfiles) {
      const schoolId = profile.schoolId || "";
      if (!perSchool.has(schoolId)) {
        perSchool.set(schoolId, { eco: 0, students: 0 });
      }

      if (profile.role === "student") {
        perSchool.get(schoolId)!.students += 1;
      }
    }

    // Calculate eco points from submissions
    const approvedSubmissions = await orm
      .select()
      .from(schema.taskSubmissions)
      .where(eq(schema.taskSubmissions.status, "approved"));

    for (const submission of approvedSubmissions) {
      const profile = schoolProfiles.find(p => p.userId === submission.studentUserId);
      const schoolId = profile?.schoolId || "";
      if (!perSchool.has(schoolId)) {
        perSchool.set(schoolId, { eco: 0, students: 0 });
      }
      const points = Number(submission.points || 0);
      perSchool.get(schoolId)!.eco += points;
      studentEco.set(submission.studentUserId, (studentEco.get(submission.studentUserId) || 0) + points);
    }

    // Calculate eco points from quizzes
    const quizzes = await orm.select().from(schema.quizzes);
    const quizAttempts = await orm.select().from(schema.quizAttempts);

    for (const attempt of quizAttempts) {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (!quiz) continue;

      const profile = schoolProfiles.find(p => p.userId === attempt.studentUserId);
      const schoolId = profile?.schoolId || "";
      if (!perSchool.has(schoolId)) {
        perSchool.set(schoolId, { eco: 0, students: 0 });
      }

      const points = Number(quiz.points || 0);
      perSchool.get(schoolId)!.eco += points;
      studentEco.set(attempt.studentUserId, (studentEco.get(attempt.studentUserId) || 0) + points);
    }

    // Calculate eco points from lessons
    const lessonCompletions = await orm.select().from(schema.lessonCompletions);

    for (const completion of lessonCompletions) {
      const profile = schoolProfiles.find(p => p.userId === completion.studentUserId);
      const schoolId = profile?.schoolId || "";
      if (!perSchool.has(schoolId)) {
        perSchool.set(schoolId, { eco: 0, students: 0 });
      }

      const points = Number(completion.points || 0);
      perSchool.get(schoolId)!.eco += points;
      studentEco.set(completion.studentUserId, (studentEco.get(completion.studentUserId) || 0) + points);
    }

    // Build rows
    const rows = Array.from(perSchool.entries()).map(([schoolId, v]) => {
      let topStudent: { username: string; name?: string; ecoPoints: number } | undefined;

      for (const profile of schoolProfiles) {
        if (profile.role !== "student" || (profile.schoolId || "") !== schoolId) continue;

        const eco = studentEco.get(profile.userId) || 0;
        if (!topStudent || eco > topStudent.ecoPoints) {
          const user = this.getUser(profile.userId); // Note: this is async, need to handle
          topStudent = { username: profile.username, name: profile.name, ecoPoints: eco };
        }
      }

      return {
        schoolId,
        schoolName: schools.find(s => s.id === schoolId)?.name || "Unknown School",
        ecoPoints: v.eco,
        students: v.students,
        topStudent,
      };
    });

    rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
    return rows.slice(0, Math.max(1, Math.min(500, limit | 0)));
  }

  async getSchoolStudentsLeaderboard(
    schoolId: string,
    limit = 50,
    offset = 0
  ): Promise<Array<{ username: string; name?: string; ecoPoints: number }>> {
    const rows: Array<{ username: string; name?: string; ecoPoints: number }> = [];

    // Get all students in school
    const schoolProfiles = await orm
      .select()
      .from(schema.profiles)
      .where(and(eq(schema.profiles.role, "student"), eq(schema.profiles.schoolId, schoolId)));

    const studentIds = schoolProfiles.map(p => p.userId);

    if (studentIds.length === 0) return [];

    // Calculate eco points for each student
    for (const profile of schoolProfiles) {
      let eco = 0;

      const approvedSubmissions = await orm
        .select()
        .from(schema.taskSubmissions)
        .where(
          and(
            eq(schema.taskSubmissions.studentUserId, profile.userId),
            eq(schema.taskSubmissions.status, "approved")
          )
        );

      for (const submission of approvedSubmissions) {
        eco += Number(submission.points || 0);
      }

      const quizzes = await orm.select().from(schema.quizzes);
      const quizAttempts = await orm
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.studentUserId, profile.userId));

      for (const attempt of quizAttempts) {
        const quiz = quizzes.find(q => q.id === attempt.quizId);
        if (quiz) {
          eco += Number(quiz.points || 0);
        }
      }

      const lessonCompletions = await orm
        .select()
        .from(schema.lessonCompletions)
        .where(eq(schema.lessonCompletions.studentUserId, profile.userId));

      for (const completion of lessonCompletions) {
        eco += Number(completion.points || 0);
      }

      rows.push({ username: profile.username, name: profile.name, ecoPoints: eco });
    }

    rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset | 0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(200, limit | 0)));
    return rows.slice(start, end);
  }

  async getStudentPreview(targetUsername: string) {
    const studentId = await this.findUserIdByUsername(targetUsername);
    if (!studentId) return null;

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, studentId))
      .limit(1);

    if (!user[0] || user[0].role !== "student") return null;

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    let eco = 0;

    const approvedSubmissions = await orm
      .select()
      .from(schema.taskSubmissions)
      .where(
        and(eq(schema.taskSubmissions.studentUserId, studentId), eq(schema.taskSubmissions.status, "approved"))
      );

    for (const submission of approvedSubmissions) {
      eco += Number(submission.points || 0);
    }

    const quizzes = await orm.select().from(schema.quizzes);
    const quizAttempts = await orm
      .select()
      .from(schema.quizAttempts)
      .where(eq(schema.quizAttempts.studentUserId, studentId));

    for (const attempt of quizAttempts) {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (quiz) {
        eco += Number(quiz.points || 0);
      }
    }

    const lessonCompletions = await orm
      .select()
      .from(schema.lessonCompletions)
      .where(eq(schema.lessonCompletions.studentUserId, studentId));

    for (const completion of lessonCompletions) {
      eco += Number(completion.points || 0);
    }

    const p = profile[0];
    return { username: user[0].username, name: p?.name, ecoPoints: eco, schoolId: p?.schoolId };
  }

  async getGlobalStudentsLeaderboard(
    limit = 50,
    offset = 0,
    schoolIdFilter: string | null = null
  ): Promise<
    Array<{
      username: string;
      name?: string;
      schoolId?: string;
      schoolName?: string;
      ecoPoints: number;
      achievements?: string[];
      snapshot?: { tasksApproved: number; quizzesCompleted: number };
    }>
  > {
    const rows: Array<any> = [];
    const schools = await orm.select().from(schema.schools);
    const profiles = await orm.select().from(schema.profiles).where(eq(schema.profiles.role, "student"));
    const users = await orm.select().from(schema.users);

    for (const profile of profiles) {
      if (schoolIdFilter && profile.schoolId !== schoolIdFilter) continue;

      const user = users.find(u => u.id === profile.userId);
      if (!user) continue;

      let eco = 0;
      let tasksApproved = 0;
      let quizzesCompleted = 0;

      const approvedSubmissions = await orm
        .select()
        .from(schema.taskSubmissions)
        .where(
          and(
            eq(schema.taskSubmissions.studentUserId, profile.userId),
            eq(schema.taskSubmissions.status, "approved")
          )
        );

      for (const submission of approvedSubmissions) {
        eco += Number(submission.points || 0);
        tasksApproved++;
      }

      const quizzes = await orm.select().from(schema.quizzes);
      const quizAttempts = await orm
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.studentUserId, profile.userId));

      for (const attempt of quizAttempts) {
        const quiz = quizzes.find(q => q.id === attempt.quizId);
        if (quiz) {
          eco += Number(quiz.points || 0);
          quizzesCompleted++;
        }
      }

      const lessonCompletions = await orm
        .select()
        .from(schema.lessonCompletions)
        .where(eq(schema.lessonCompletions.studentUserId, profile.userId));

      for (const completion of lessonCompletions) {
        eco += Number(completion.points || 0);
      }

      const schoolName = schools.find(s => s.id === profile.schoolId)?.name;
      const achievements: string[] = [];

      if (tasksApproved > 0) achievements.push("🥇 First Task");
      if (quizzesCompleted >= 3) achievements.push("🧠 Quiz Master");
      if (eco >= 100) achievements.push("🌲 Small Tree");
      if (eco >= 500) achievements.push("🌳 Big Tree");

      rows.push({
        username: user.username,
        name: profile.name,
        schoolId: profile.schoolId,
        schoolName,
        ecoPoints: eco,
        achievements,
        snapshot: { tasksApproved, quizzesCompleted },
      });
    }

    rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset | 0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
    return rows.slice(start, end);
  }

  async getGlobalTeachersLeaderboard(
    limit = 50,
    offset = 0,
    schoolIdFilter: string | null = null
  ): Promise<
    Array<{
      username: string;
      name?: string;
      schoolId?: string;
      schoolName?: string;
      ecoPoints: number;
      tasksCreated: number;
      quizzesCreated: number;
    }>
  > {
    const rows: Array<any> = [];
    const schools = await orm.select().from(schema.schools);
    const users = await orm.select().from(schema.users).where(eq(schema.users.role, "teacher"));
    const profiles = await orm.select().from(schema.profiles);
    const quizzes = await orm.select().from(schema.quizzes);

    for (const user of users) {
      const profile = profiles.find(p => p.userId === user.id);
      if (!profile || (schoolIdFilter && profile.schoolId !== schoolIdFilter)) continue;

      const tasks = await orm
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.createdByUserId, user.id));

      const tasksCreated = tasks.length;
      const taskIds = tasks.map(t => t.id);

      let eco = 0;

      if (taskIds.length > 0) {
        const approvedSubmissions = await orm
          .select()
          .from(schema.taskSubmissions)
          .where(
            and(inArray(schema.taskSubmissions.taskId, taskIds), eq(schema.taskSubmissions.status, "approved"))
          );

        for (const submission of approvedSubmissions) {
          eco += Number(submission.points || 0);
        }
      }

      const teacherQuizzes = quizzes.filter(q => q.createdByUserId === user.id && q.visibility === "school");
      const quizzesCreated = teacherQuizzes.length;

      const quizAttempts = await orm.select().from(schema.quizAttempts);

      for (const attempt of quizAttempts) {
        const quiz = teacherQuizzes.find(q => q.id === attempt.quizId);
        if (quiz) {
          eco += Number(quiz.points || 0);
        }
      }

      const schoolName = schools.find(s => s.id === profile.schoolId)?.name;

      rows.push({
        username: user.username,
        name: profile.name,
        schoolId: profile.schoolId,
        schoolName,
        ecoPoints: eco,
        tasksCreated,
        quizzesCreated,
      });
    }

    rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
    const start = Math.max(0, offset | 0);
    const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
    return rows.slice(start, end);
  }

  async getSchoolPreview(schoolId: string) {
    const school = await orm
      .select()
      .from(schema.schools)
      .where(eq(schema.schools.id, schoolId))
      .limit(1);

    if (!school[0]) return null;

    const leaderboard = await this.getSchoolStudentsLeaderboard(schoolId, 1000, 0);
    const top = leaderboard[0];
    const eco = leaderboard.reduce((acc, r) => acc + Number(r.ecoPoints || 0), 0);
    const students = leaderboard.length;

    return {
      schoolId,
      schoolName: school[0].name,
      ecoPoints: eco,
      students,
      topStudent: top ? { username: top.username, name: top.name, ecoPoints: top.ecoPoints } : undefined,
    };
  }

  async getTeacherPreview(targetUsername: string) {
    const teacherId = await this.findUserIdByUsername(targetUsername);
    if (!teacherId) return null;

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, teacherId))
      .limit(1);

    if (!user[0] || user[0].role !== "teacher") return null;

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, teacherId))
      .limit(1);

    const schools = await orm.select().from(schema.schools);
    const schoolName = schools.find(s => s.id === profile[0]?.schoolId)?.name;

    const tasks = await orm
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.createdByUserId, teacherId));

    const tasksCreated = tasks.length;
    const taskIds = tasks.map(t => t.id);

    let eco = 0;

    if (taskIds.length > 0) {
      const approvedSubmissions = await orm
        .select()
        .from(schema.taskSubmissions)
        .where(
          and(inArray(schema.taskSubmissions.taskId, taskIds), eq(schema.taskSubmissions.status, "approved"))
        );

      for (const submission of approvedSubmissions) {
        eco += Number(submission.points || 0);
      }
    }

    const quizzes = await orm.select().from(schema.quizzes);
    const teacherQuizzes = quizzes.filter(q => q.createdByUserId === teacherId && q.visibility === "school");
    const quizzesCreated = teacherQuizzes.length;

    const quizAttempts = await orm.select().from(schema.quizAttempts);

    for (const attempt of quizAttempts) {
      const quiz = teacherQuizzes.find(q => q.id === attempt.quizId);
      if (quiz) {
        eco += Number(quiz.points || 0);
      }
    }

    return {
      username: user[0].username,
      name: profile[0]?.name,
      schoolId: profile[0]?.schoolId,
      schoolName,
      ecoPoints: eco,
      tasksCreated,
      quizzesCreated,
    };
  }

  async getAdminLeaderboardAnalytics() {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - diffToMonday);
    const startMs = monday.getTime();

    const activeSchoolIds = new Set<string>();
    let totalEcoPointsThisWeek = 0;

    // Task submissions this week
    const weekSubmissions = await orm
      .select()
      .from(schema.taskSubmissions)
      .where(eq(schema.taskSubmissions.status, "approved"));

    for (const submission of weekSubmissions) {
      const reviewedAt = submission.reviewedAt || submission.submittedAt;
      if (reviewedAt >= startMs) {
        const profile = await orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, submission.studentUserId))
          .limit(1);

        if (profile[0]?.schoolId) {
          activeSchoolIds.add(profile[0].schoolId);
        }

        totalEcoPointsThisWeek += Number(submission.points || 0);
      }
    }

    // Quiz attempts this week
    const quizAttempts = await orm.select().from(schema.quizAttempts);
    const quizzes = await orm.select().from(schema.quizzes);

    for (const attempt of quizAttempts) {
      if (attempt.attemptedAt >= startMs) {
        const profile = await orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, attempt.studentUserId))
          .limit(1);

        if (profile[0]?.schoolId) {
          activeSchoolIds.add(profile[0].schoolId);
        }

        const quiz = quizzes.find(q => q.id === attempt.quizId);
        if (quiz) {
          totalEcoPointsThisWeek += Number(quiz.points || 0);
        }
      }
    }

    // Lesson completions this week
    const lessonCompletions = await orm.select().from(schema.lessonCompletions);

    for (const completion of lessonCompletions) {
      if (completion.completedAt >= startMs) {
        const profile = await orm
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, completion.studentUserId))
          .limit(1);

        if (profile[0]?.schoolId) {
          activeSchoolIds.add(profile[0].schoolId);
        }

        totalEcoPointsThisWeek += Number(completion.points || 0);
      }
    }

    // New students this week
    let newStudentsThisWeek = 0;
    const seenBefore = new Set<string>();

    for (const submission of weekSubmissions) {
      if (submission.status === "approved" && (submission.reviewedAt || submission.submittedAt) < startMs) {
        seenBefore.add(submission.studentUserId);
      }
    }

    for (const attempt of quizAttempts) {
      if (attempt.attemptedAt < startMs) {
        seenBefore.add(attempt.studentUserId);
      }
    }

    for (const completion of lessonCompletions) {
      if (completion.completedAt < startMs) {
        seenBefore.add(completion.studentUserId);
      }
    }

    const activeThisWeek = new Set<string>();

    for (const submission of weekSubmissions) {
      if (submission.status === "approved" && (submission.reviewedAt || submission.submittedAt) >= startMs) {
        activeThisWeek.add(submission.studentUserId);
      }
    }

    for (const attempt of quizAttempts) {
      if (attempt.attemptedAt >= startMs) {
        activeThisWeek.add(attempt.studentUserId);
      }
    }

    for (const completion of lessonCompletions) {
      if (completion.completedAt >= startMs) {
        activeThisWeek.add(completion.studentUserId);
      }
    }

    activeThisWeek.forEach(id => {
      if (!seenBefore.has(id)) newStudentsThisWeek++;
    });

    // Inactive schools
    const schools = await orm.select().from(schema.schools);
    const inactiveSchools: Array<{ schoolId: string; schoolName: string }> = [];

    for (const school of schools) {
      if (!activeSchoolIds.has(school.id)) {
        inactiveSchools.push({ schoolId: school.id, schoolName: school.name });
      }
    }

    return {
      activeSchoolsThisWeek: activeSchoolIds.size,
      newStudentsThisWeek,
      totalEcoPointsThisWeek,
      inactiveSchools,
    };
  }

  // ============ VIDEOS & CREDITS ============
  async getAllVideos(): Promise<Video[]> {
    const videos = await orm.select().from(schema.videos).orderBy(desc(schema.videos.uploadedAt));
    return videos;
  }

  async getTeacherVideos(teacherId: string): Promise<Video[]> {
    const videos = await orm
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.uploadedBy, teacherId))
      .orderBy(desc(schema.videos.uploadedAt));

    return videos;
  }

  async getTeacherVideosCount(teacherUsername: string): Promise<number> {
    const teacher = await this.findUserIdByUsername(teacherUsername);
    if (!teacher) return 0;

    const videos = await orm
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.uploadedBy, teacher));

    return videos.length;
  }

  async createVideo(input: {
    title: string;
    description?: string;
    type: "youtube" | "file";
    url: string;
    thumbnail?: string;
    credits: number;
    uploadedBy: string;
    category?: string;
    duration?: number;
  }): Promise<Video> {
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

    await orm.insert(schema.videos).values(video);

    return video;
  }

  async updateVideo(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      type: "youtube" | "file";
      url: string;
      thumbnail: string;
      credits: number;
      category: string;
      duration: number;
      uploadedBy: string;
    }>
  ): Promise<Video> {
    const updated = { ...updates, uploadedAt: Date.now() };

    await orm.update(schema.videos).set(updated).where(eq(schema.videos.id, id));

    const video = await orm
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.id, id))
      .limit(1);

    return video[0]!;
  }

  async deleteVideo(id: string): Promise<void> {
    await orm.delete(schema.videos).where(eq(schema.videos.id, id));
  }

  async getUserCredits(username: string): Promise<{ totalCredits: number; lastUpdated: number }> {
    const userId = await this.findUserIdByUsername(username);
    if (!userId) return { totalCredits: 0, lastUpdated: Date.now() };

    const credits = await orm
      .select()
      .from(schema.userCredits)
      .where(eq(schema.userCredits.userId, userId))
      .limit(1);

    if (!credits[0]) {
      return { totalCredits: 0, lastUpdated: Date.now() };
    }

    return { totalCredits: credits[0].totalCredits, lastUpdated: credits[0].lastUpdated };
  }

  async recordVideoWatch(username: string, videoId: string): Promise<{ success: boolean; creditsAwarded: number }> {
    const userId = await this.findUserIdByUsername(username);
    if (!userId) return { success: false, creditsAwarded: 0 };

    const video = await orm
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.id, videoId))
      .limit(1);

    if (!video[0]) return { success: false, creditsAwarded: 0 };

    const existing = await orm
      .select()
      .from(schema.userVideoProgress)
      .where(and(eq(schema.userVideoProgress.userId, userId), eq(schema.userVideoProgress.videoId, videoId)))
      .limit(1);

    if (existing[0]?.creditsAwarded) {
      return { success: false, creditsAwarded: 0 };
    }

    const progressId = existing[0]?.id || randomUUID();

    await orm
      .insert(schema.userVideoProgress)
      .values({
        id: progressId,
        userId,
        videoId,
        watched: 1,
        watchedAt: Date.now(),
        creditsAwarded: 1,
      })
      .onConflictDoUpdate({
        target: schema.userVideoProgress.id,
        set: {
          watched: 1,
          watchedAt: Date.now(),
          creditsAwarded: 1,
        },
      });

    const credits = video[0].credits;

    const userCredits = await orm
      .select()
      .from(schema.userCredits)
      .where(eq(schema.userCredits.userId, userId))
      .limit(1);

    if (userCredits[0]) {
      await orm
        .update(schema.userCredits)
        .set({
          totalCredits: userCredits[0].totalCredits + credits,
          lastUpdated: Date.now(),
        })
        .where(eq(schema.userCredits.userId, userId));
    } else {
      await orm.insert(schema.userCredits).values({
        id: randomUUID(),
        userId,
        totalCredits: credits,
        lastUpdated: Date.now(),
      });
    }

    return { success: true, creditsAwarded: credits };
  }

  async awardCredits(
    username: string,
    videoId: string,
    credits: number
  ): Promise<{ success: boolean; newTotal: number }> {
    const userId = await this.findUserIdByUsername(username);
    if (!userId) return { success: false, newTotal: 0 };

    let userCredits = await orm
      .select()
      .from(schema.userCredits)
      .where(eq(schema.userCredits.userId, userId))
      .limit(1);

    if (userCredits[0]) {
      const newTotal = userCredits[0].totalCredits + credits;

      await orm
        .update(schema.userCredits)
        .set({ totalCredits: newTotal, lastUpdated: Date.now() })
        .where(eq(schema.userCredits.userId, userId));

      return { success: true, newTotal };
    } else {
      await orm.insert(schema.userCredits).values({
        id: randomUUID(),
        userId,
        totalCredits: credits,
        lastUpdated: Date.now(),
      });

      return { success: true, newTotal: credits };
    }
  }

  async fetchYouTubeMetadata(
    url: string
  ): Promise<{ title: string; description: string; thumbnail: string; duration?: number }> {
    // Placeholder implementation - actual YouTube API integration would go here
    return {
      title: "Video Title",
      description: "Video Description",
      thumbnail: "",
      duration: 0,
    };
  }

  // ============ SEEDING / DEMO DATA ============
  async seedSchoolsAndStudents(input: {
    schools: number;
    students: number;
    adminUsername?: string;
  }): Promise<{ schoolsCreated: number; studentsCreated: number }> {
    // This method creates sample data for demo/testing purposes
    // Implementation would be similar to the original MemStorage version
    // but using database inserts instead of Map operations
    return { schoolsCreated: 0, studentsCreated: 0 };
  }

  // ============ HELPER METHODS ============
  private async findUserEntryByUsername(username: string): Promise<[string, User] | null> {
    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    
    return user[0] ? [user[0].id, user[0]] : null;
  }

  // Stub methods for features not yet implemented
  async getStudentProfile(username: string): Promise<StudentProfileView | null> {
    const uid = await this.findUserIdByUsername(username);
    if (!uid) return null;

    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, uid))
      .limit(1);

    if (!user[0] || user[0].role !== "student") return null;

    // Stub implementation - full version would calculate all metrics
    return {
      username: user[0].username,
      name: "",
      schoolId: "",
      ecoPoints: 0,
      ecoTreeStage: "Seedling",
      achievements: [],
      timeline: [],
      ranks: { global: null, school: null },
      allowExternalView: true,
      week: { start: Date.now(), days: [false, false, false, false, false, false, false] },
      leaderboardNext: null,
      profileCompletion: 0,
      unreadNotifications: 0,
    };
  }

  async setStudentPrivacy(username: string, allowExternalView: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
    const uid = await this.findUserIdByUsername(username);
    if (!uid) return { ok: false, error: "User not found" };

    await orm
      .update(schema.profiles)
      .set({ allowExternalView: allowExternalView ? 1 : 0 })
      .where(eq(schema.profiles.userId, uid));

    return { ok: true };
  }

  async updateAdminQuiz(
    adminUsername: string,
    id: string,
    updates: {
      title?: string;
      description?: string;
      points?: number;
      questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }>;
    }
  ): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }> {
    // Similar to updateQuiz for teachers, but with admin verification
    return await this.updateQuiz(adminUsername, id, updates);
  }

  async deleteAdminQuiz(adminUsername: string, id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    // Similar to deleteQuiz but for admin
    return await this.deleteQuiz(adminUsername, id);
  }

  async createAdminQuiz(
    adminUsername: string,
    input: {
      title: string;
      description?: string;
      points?: number;
      questions: Array<{ text: string; options: string[]; answerIndex: number }>;
    }
  ): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return { ok: false, error: "Admin not found" };

    const quizId = randomUUID();

    // Add IDs to questions if missing
    const questions = input.questions.map(q => ({
      ...q,
      id: randomUUID(),
    }));

    const quiz: Quiz = {
      id: quizId,
      title: input.title,
      description: input.description,
      points: input.points || 0,
      createdByUserId: adminId,
      schoolId: "",
      createdAt: Date.now(),
      questions: questions as any,
      visibility: "global",
    };

    await orm.insert(schema.quizzes).values({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      points: quiz.points,
      createdByUserId: quiz.createdByUserId,
      schoolId: quiz.schoolId,
      createdAt: quiz.createdAt,
      questions: JSON.stringify(quiz.questions) as any,
      visibility: quiz.visibility,
    });

    return { ok: true, quiz };
  }

  async listAdminQuizzes(adminUsername: string): Promise<Quiz[]> {
    const adminId = await this.findUserIdByUsername(adminUsername);
    if (!adminId) return [];

    const quizzes = await orm
      .select()
      .from(schema.quizzes)
      .where(
        and(
          eq(schema.quizzes.createdByUserId, adminId),
          eq(schema.quizzes.visibility, "global")
        )
      )
      .orderBy(desc(schema.quizzes.createdAt));

    return quizzes.map(q => ({
      ...q,
      questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions,
    })) as any;
  }

  private async listStudentQuizzesInternal(studentUsername: string): Promise<Quiz[]> {
    const studentId = await this.findUserIdByUsername(studentUsername);
    if (!studentId) return [];

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, studentId))
      .limit(1);

    const schoolId = profile[0]?.schoolId;

    const quizzes = await orm
      .select()
      .from(schema.quizzes)
      .where(
        or(
          eq(schema.quizzes.visibility, "global"),
          schoolId ? eq(schema.quizzes.schoolId, schoolId) : undefined
        )
      )
      .orderBy(desc(schema.quizzes.createdAt));

    return quizzes.map(q => ({
      ...q,
      questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions,
    })) as any;
  }

  async getUserDetails(username: string): Promise<any> {
    // Get combined user and profile information
    const user = await orm
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user[0]) return { status: "none", username };

    const profile = await orm
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, user[0].id))
      .limit(1);

    return {
      status: "approved",
      username: user[0].username,
      role: user[0].role,
      password: user[0].password,
      ...profile[0],
    };
  }
}

// Export interface definition
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateQuiz(teacherUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }>;
  deleteQuiz(teacherUsername: string, id: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listSchools(): Promise<Array<{ id: string; name: string }>>;
  addSchool(name: string): Promise<{ id: string; name: string }>;
  removeSchool(id: string): Promise<boolean>;
  addStudentApplication(app: StudentApplication): Promise<StudentApplication>;
  addTeacherApplication(app: TeacherApplication): Promise<TeacherApplication>;
  listPending(): Promise<{ students: StudentApplication[]; teachers: TeacherApplication[] }>;
  approveApplication(type: "student" | "teacher", id: string): Promise<boolean>;
  isUsernameAvailable(username: string): Promise<boolean>;
  getApplicationStatus(username: string): Promise<"pending" | "approved" | "none">;
  saveOtp(email: string, code: string, ttlMs: number): Promise<void>;
  verifyOtp(email: string, code: string): Promise<boolean>;
  resetPassword(username: string, password: string): Promise<boolean>;
  unapproveUser(username: string): Promise<boolean>;
  listAdmins(): Promise<Array<{ username: string; name?: string; email?: string }>>;
  createAdmin(input: { username: string; password: string; name?: string; email?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  updateAdmin(username: string, updates: { username?: string; name?: string; email?: string }, currentUsername?: string): Promise<{ ok: true } | { ok: false; error: string }>;
  deleteAdmin(username: string): Promise<{ ok: true } | { ok: false; error: string }>;
  createTask(teacherUsername: string, input: { title: string; description?: string; deadline?: string; proofType?: 'photo'; maxPoints: number; groupMode?: 'solo' | 'group'; maxGroupSize?: number }): Promise<{ ok: true; task: Task } | { ok: false; error: string }>;
  listTeacherTasks(teacherUsername: string): Promise<Task[]>;
  listStudentTasks(studentUsername: string): Promise<Array<{ task: Task; submission?: TaskSubmission }>>;
  submitTask(studentUsername: string, taskId: string, photoDataUrlOrList: string | string[]): Promise<{ ok: true; submission: TaskSubmission } | { ok: false; error: string }>;
  listSubmissionsForTeacher(teacherUsername: string, taskId?: string): Promise<Array<TaskSubmission & { studentUsername: string; studentName?: string; className?: string; section?: string; groupMembers?: string[]; taskMaxPoints?: number }>>;
  reviewSubmission(teacherUsername: string, submissionId: string, decision: { status: 'approved' | 'rejected'; points?: number; feedback?: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  createAnnouncement(teacherUsername: string, input: { title: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  listAnnouncementsForTeacher(teacherUsername: string): Promise<Announcement[]>;
  createAdminAnnouncement(adminUsername: string, input: { title: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  listAdminAnnouncements(adminUsername: string): Promise<Announcement[]>;
  updateAdminAnnouncement(adminUsername: string, announcementId: string, updates: { title?: string; body?: string }): Promise<{ ok: true; announcement: Announcement } | { ok: false; error: string }>;
  deleteAdminAnnouncement(adminUsername: string, announcementId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listStudentAnnouncements(studentUsername: string): Promise<Announcement[]>;
  createTaskGroup(studentUsername: string, taskId: string, members: string[]): Promise<{ ok: true; group: TaskGroup & { memberUsernames: string[] } } | { ok: false; error: string }>;
  getTaskGroupForStudent(studentUsername: string, taskId: string): Promise<(TaskGroup & { memberUsernames: string[] }) | null>;
  getOwnProfile(username: string): Promise<ProfilePayload | null>;
  updateOwnProfile(username: string, updates: Partial<ProfileUpsert>): Promise<{ ok: true; profile: ProfilePayload } | { ok: false; error: string }>;
  getStudentProfile(username: string): Promise<StudentProfileView | null>;
  setStudentPrivacy(username: string, allowExternalView: boolean): Promise<{ ok: true } | { ok: false; error: string }>;
  listLessonCompletions(studentUsername: string): Promise<LessonCompletion[]>;
  completeLesson(studentUsername: string, input: { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string; points: number }): Promise<{ ok: true; completion: LessonCompletion; alreadyCompleted: boolean } | { ok: false; error: string }>;
  listLearningModules(): Promise<LearningModule[]>;
  listManagedLearningModules(managerUsername: string): Promise<LearningModule[]>;
  upsertManagedLearningModule(managerUsername: string, input: { id?: string; title: string; description?: string; lessons: Array<{ id?: string; title: string; duration?: string; points: number; content?: string }> }): Promise<{ ok: true; module: LearningModule } | { ok: false; error: string }>;
  deleteManagedLearningModule(managerUsername: string, moduleId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  addQuizAttempt(studentUsername: string, input: { quizId: string; answers?: number[]; scorePercent?: number }): Promise<{ ok: true; attempt: QuizAttempt } | { ok: false; error: string }>;
  getStudentQuizAttempt(username: string, quizId: string): Promise<QuizAttempt | null>;
  addGamePlay(studentUsername: string, gameId: string, points?: number): Promise<{ ok: true; play: GamePlay } | { ok: false; error: string }>;
  getStudentGameSummary(username: string): Promise<{ totalGamePoints: number; badges: string[]; monthCompletedCount: number; totalUniqueGames: number }>;
  listNotifications(username: string): Promise<NotificationItem[]>;
  markAllNotificationsRead(username: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listGames(): Promise<Game[]>;
  listAdminGames(adminUsername: string): Promise<Game[]>;
  createAdminGame(adminUsername: string, input: { id?: string; name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }): Promise<{ ok: true; game: Game } | { ok: false; error: string }>;
  updateAdminGame(adminUsername: string, gameId: string, updates: Partial<{ name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'; points: number; icon?: string; externalUrl: string; image?: string }>): Promise<{ ok: true; game: Game } | { ok: false; error: string }>;
  deleteAdminGame(adminUsername: string, gameId: string): Promise<{ ok: true } | { ok: false; error: string }>;
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
  updateAdminQuiz(adminUsername: string, id: string, updates: { title?: string; description?: string; points?: number; questions?: Array<{ id?: string; text: string; options: string[]; answerIndex: number }> }): Promise<{ ok: true; quiz: Quiz } | { ok: false; error: string }>;
  deleteAdminQuiz(adminUsername: string, id: string): Promise<{ ok: true } | { ok: false; error: string }>;
  getGlobalSchoolsLeaderboard(limit?: number): Promise<Array<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } }>>;
  getSchoolStudentsLeaderboard(schoolId: string, limit?: number, offset?: number): Promise<Array<{ username: string; name?: string; ecoPoints: number }>>;
  getStudentPreview(targetUsername: string): Promise<{ username: string; name?: string; ecoPoints: number; schoolId?: string } | null>;
  getGlobalStudentsLeaderboard(limit?: number, offset?: number, schoolIdFilter?: string | null): Promise<Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; achievements?: string[]; snapshot?: { tasksApproved: number; quizzesCompleted: number } }>>;
  getGlobalTeachersLeaderboard(limit?: number, offset?: number, schoolIdFilter?: string | null): Promise<Array<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number }>>;
  getSchoolPreview(schoolId: string): Promise<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } } | null>;
  getTeacherPreview(targetUsername: string): Promise<{ username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number } | null>;
  getAdminLeaderboardAnalytics(): Promise<{ activeSchoolsThisWeek: number; newStudentsThisWeek: number; totalEcoPointsThisWeek: number; inactiveSchools: Array<{ schoolId: string; schoolName: string }> }>;
  seedSchoolsAndStudents(input: { schools: number; students: number; adminUsername?: string }): Promise<{ schoolsCreated: number; studentsCreated: number }>;
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
  getUserDetails(username: string): Promise<any>;
}
