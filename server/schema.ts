import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

// ============ USER MANAGEMENT ============
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  username: text('username').unique(),
  password: text('password'),
  role: text('role'), // student, teacher, admin
  schoolId: text('school_id'),
  subject: text('subject'),
  photoUrl: text('photo_url'),
  approved: integer('approved', { mode: 'boolean' }),
});

export const schools = sqliteTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').unique(),
});

// Student & Teacher Applications
export const studentApplications = sqliteTable('student_applications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  username: text('username').notNull().unique(),
  schoolId: text('school_id').notNull(),
  studentId: text('student_id'),
  rollNumber: text('roll_number'),
  className: text('class_name'),
  section: text('section'),
  photoDataUrl: text('photo_data_url'),
  password: text('password').notNull(),
  submittedAt: integer('submitted_at').notNull(),
});

export const teacherApplications = sqliteTable('teacher_applications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  username: text('username').notNull().unique(),
  schoolId: text('school_id').notNull(),
  teacherId: text('teacher_id'),
  subject: text('subject'),
  photoDataUrl: text('photo_data_url'),
  password: text('password').notNull(),
  submittedAt: integer('submitted_at').notNull(),
});

// User Profiles
export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  username: text('username').notNull().unique(),
  role: text('role').notNull(),
  name: text('name'),
  email: text('email'),
  schoolId: text('school_id'),
  photoDataUrl: text('photo_data_url'),
  studentId: text('student_id'),
  rollNumber: text('roll_number'),
  className: text('class_name'),
  section: text('section'),
  teacherId: text('teacher_id'),
  subject: text('subject'),
  allowExternalView: integer('allow_external_view', { mode: 'boolean' }).default(true),
  updatedAt: integer('updated_at').notNull(),
});

// OTP Storage
export const otps = sqliteTable('otps', {
  email: text('email').primaryKey(),
  code: text('code').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

// ============ TASKS & SUBMISSIONS ============
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  deadline: text('deadline'),
  proofType: text('proof_type').default('photo'), // 'photo'
  maxPoints: integer('max_points').notNull(),
  createdByUserId: text('created_by_user_id').notNull(),
  schoolId: text('school_id'),
  createdAt: integer('created_at').notNull(),
  groupMode: text('group_mode').default('solo'), // 'solo' | 'group'
  maxGroupSize: integer('max_group_size'),
});

export const taskSubmissions = sqliteTable('task_submissions', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  studentUserId: text('student_user_id').notNull(),
  photoDataUrl: text('photo_data_url'),
  photos: blob('photos'), // JSON stringified array
  submittedAt: integer('submitted_at').notNull(),
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected'
  points: integer('points'),
  feedback: text('feedback'),
  reviewedByUserId: text('reviewed_by_user_id'),
  reviewedAt: integer('reviewed_at'),
  groupId: text('group_id'),
});

export const taskGroups = sqliteTable('task_groups', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  memberUserIds: blob('member_user_ids').notNull(), // JSON stringified array
  createdAt: integer('created_at').notNull(),
});

// ============ QUIZZES ============
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  points: integer('points').notNull(),
  createdByUserId: text('created_by_user_id').notNull(),
  schoolId: text('school_id'),
  createdAt: integer('created_at').notNull(),
  questions: blob('questions').notNull(), // JSON stringified array
  visibility: text('visibility').default('school'), // 'global' | 'school'
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  studentUserId: text('student_user_id').notNull(),
  answers: blob('answers'), // JSON stringified array
  scorePercent: integer('score_percent'),
  attemptedAt: integer('attempted_at').notNull(),
});

// ============ ASSIGNMENTS ============
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  deadline: text('deadline'),
  maxPoints: integer('max_points'),
  createdByUserId: text('created_by_user_id').notNull(),
  schoolId: text('school_id'),
  createdAt: integer('created_at').notNull(),
  visibility: text('visibility').default('school'), // 'global' | 'school'
});

export const assignmentSubmissions = sqliteTable('assignment_submissions', {
  id: text('id').primaryKey(),
  assignmentId: text('assignment_id').notNull(),
  studentUserId: text('student_user_id').notNull(),
  files: blob('files'), // JSON stringified array
  submittedAt: integer('submitted_at').notNull(),
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected'
  points: integer('points'),
  feedback: text('feedback'),
  reviewedByUserId: text('reviewed_by_user_id'),
  reviewedAt: integer('reviewed_at'),
});

// ============ ANNOUNCEMENTS ============
export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body'),
  createdAt: integer('created_at').notNull(),
  createdByUserId: text('created_by_user_id').notNull(),
  schoolId: text('school_id'),
  visibility: text('visibility').default('school'), // 'global' | 'school'
});

// ============ LEARNING MODULES & LESSONS ============
export const learningModules = sqliteTable('learning_modules', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  lessons: blob('lessons').notNull(), // JSON stringified array
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdByUserId: text('created_by_user_id'),
  updatedByUserId: text('updated_by_user_id'),
  deleted: integer('deleted', { mode: 'boolean' }).default(false),
});

export const lessonCompletions = sqliteTable('lesson_completions', {
  id: text('id').primaryKey(),
  studentUserId: text('student_user_id').notNull(),
  moduleId: text('module_id').notNull(),
  moduleTitle: text('module_title').notNull(),
  lessonId: text('lesson_id').notNull(),
  lessonTitle: text('lesson_title').notNull(),
  points: integer('points').notNull(),
  completedAt: integer('completed_at').notNull(),
});

// ============ GAMES ============
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  difficulty: text('difficulty'), // 'Easy', 'Medium', 'Hard'
  points: integer('points').notNull(),
  icon: text('icon'),
  externalUrl: text('external_url').notNull(),
  image: text('image'),
  createdAt: integer('created_at').notNull(),
  createdByUserId: text('created_by_user_id'),
});

export const gamePlays = sqliteTable('game_plays', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull(),
  studentUserId: text('student_user_id').notNull(),
  playedAt: integer('played_at').notNull(),
  points: integer('points').notNull(),
});

// ============ NOTIFICATIONS ============
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  message: text('message').notNull(),
  type: text('type'), // 'info', 'task', 'quiz', 'announcement', 'badge'
  createdAt: integer('created_at').notNull(),
  readAt: integer('read_at'),
});

// ============ VIDEOS ============
export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'youtube' or 'file'
  url: text('url').notNull(),
  thumbnail: text('thumbnail'),
  credits: integer('credits').notNull().default(1),
  uploadedBy: text('uploaded_by').notNull(),
  uploadedAt: integer('uploaded_at').notNull(),
  category: text('category'),
  duration: integer('duration'),
});

export const userVideoProgress = sqliteTable('user_video_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  videoId: text('video_id').notNull(),
  watched: integer('watched', { mode: 'boolean' }).default(false),
  watchedAt: integer('watched_at'),
  creditsAwarded: integer('credits_awarded', { mode: 'boolean' }).default(false),
});

export const userCredits = sqliteTable('user_credits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  totalCredits: integer('total_credits').notNull().default(0),
  lastUpdated: integer('last_updated').notNull(),
});
