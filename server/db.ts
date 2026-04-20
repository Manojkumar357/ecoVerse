import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./db.sqlite');
export const orm = drizzle(sqlite, { schema });

// Initialize DB tables if they don't exist (idempotent)
export function initDb() {
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT,
			email TEXT UNIQUE,
			username TEXT UNIQUE,
			password TEXT,
			role TEXT,
			school_id TEXT,
			subject TEXT,
			photo_url TEXT,
			approved INTEGER
		);
		CREATE TABLE IF NOT EXISTS schools (
			id TEXT PRIMARY KEY,
			name TEXT UNIQUE
		);
		CREATE TABLE IF NOT EXISTS student_applications (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			school_id TEXT NOT NULL,
			student_id TEXT,
			roll_number TEXT,
			class_name TEXT,
			section TEXT,
			photo_data_url TEXT,
			password TEXT NOT NULL,
			submitted_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS teacher_applications (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			school_id TEXT NOT NULL,
			teacher_id TEXT,
			subject TEXT,
			photo_data_url TEXT,
			password TEXT NOT NULL,
			submitted_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS profiles (
			user_id TEXT PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			role TEXT NOT NULL,
			name TEXT,
			email TEXT,
			school_id TEXT,
			photo_data_url TEXT,
			student_id TEXT,
			roll_number TEXT,
			class_name TEXT,
			section TEXT,
			teacher_id TEXT,
			subject TEXT,
			allow_external_view INTEGER DEFAULT 1,
			updated_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS otps (
			email TEXT PRIMARY KEY,
			code TEXT NOT NULL,
			expires_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			deadline TEXT,
			proof_type TEXT DEFAULT 'photo',
			max_points INTEGER NOT NULL,
			created_by_user_id TEXT NOT NULL,
			school_id TEXT,
			created_at INTEGER NOT NULL,
			group_mode TEXT DEFAULT 'solo',
			max_group_size INTEGER
		);
		CREATE TABLE IF NOT EXISTS task_submissions (
			id TEXT PRIMARY KEY,
			task_id TEXT NOT NULL,
			student_user_id TEXT NOT NULL,
			photo_data_url TEXT,
			photos BLOB,
			submitted_at INTEGER NOT NULL,
			status TEXT DEFAULT 'pending',
			points INTEGER,
			feedback TEXT,
			reviewed_by_user_id TEXT,
			reviewed_at INTEGER,
			group_id TEXT
		);
		CREATE TABLE IF NOT EXISTS task_groups (
			id TEXT PRIMARY KEY,
			task_id TEXT NOT NULL,
			member_user_ids BLOB NOT NULL,
			created_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS quizzes (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			points INTEGER NOT NULL,
			created_by_user_id TEXT NOT NULL,
			school_id TEXT,
			created_at INTEGER NOT NULL,
			questions BLOB NOT NULL,
			visibility TEXT DEFAULT 'school'
		);
		CREATE TABLE IF NOT EXISTS quiz_attempts (
			id TEXT PRIMARY KEY,
			quiz_id TEXT NOT NULL,
			student_user_id TEXT NOT NULL,
			answers BLOB,
			score_percent INTEGER,
			attempted_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS assignments (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			deadline TEXT,
			max_points INTEGER,
			created_by_user_id TEXT NOT NULL,
			school_id TEXT,
			created_at INTEGER NOT NULL,
			visibility TEXT DEFAULT 'school'
		);
		CREATE TABLE IF NOT EXISTS assignment_submissions (
			id TEXT PRIMARY KEY,
			assignment_id TEXT NOT NULL,
			student_user_id TEXT NOT NULL,
			files BLOB,
			submitted_at INTEGER NOT NULL,
			status TEXT DEFAULT 'pending',
			points INTEGER,
			feedback TEXT,
			reviewed_by_user_id TEXT,
			reviewed_at INTEGER
		);
		CREATE TABLE IF NOT EXISTS announcements (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			body TEXT,
			created_at INTEGER NOT NULL,
			created_by_user_id TEXT NOT NULL,
			school_id TEXT,
			visibility TEXT DEFAULT 'school'
		);
		CREATE TABLE IF NOT EXISTS learning_modules (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			lessons BLOB NOT NULL,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			created_by_user_id TEXT,
			updated_by_user_id TEXT,
			deleted INTEGER DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS lesson_completions (
			id TEXT PRIMARY KEY,
			student_user_id TEXT NOT NULL,
			module_id TEXT NOT NULL,
			module_title TEXT NOT NULL,
			lesson_id TEXT NOT NULL,
			lesson_title TEXT NOT NULL,
			points INTEGER NOT NULL,
			completed_at INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS games (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			category TEXT NOT NULL,
			description TEXT,
			difficulty TEXT,
			points INTEGER NOT NULL,
			icon TEXT,
			external_url TEXT NOT NULL,
			image TEXT,
			created_at INTEGER NOT NULL,
			created_by_user_id TEXT
		);
		CREATE TABLE IF NOT EXISTS game_plays (
			id TEXT PRIMARY KEY,
			game_id TEXT NOT NULL,
			student_user_id TEXT NOT NULL,
			played_at INTEGER NOT NULL,
			points INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			message TEXT NOT NULL,
			type TEXT,
			created_at INTEGER NOT NULL,
			read_at INTEGER
		);
		CREATE TABLE IF NOT EXISTS videos (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			type TEXT NOT NULL,
			url TEXT NOT NULL,
			thumbnail TEXT,
			credits INTEGER NOT NULL DEFAULT 1,
			uploaded_by TEXT NOT NULL,
			uploaded_at INTEGER NOT NULL,
			category TEXT,
			duration INTEGER
		);
		CREATE TABLE IF NOT EXISTS user_video_progress (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			video_id TEXT NOT NULL,
			watched INTEGER DEFAULT 0,
			watched_at INTEGER,
			credits_awarded INTEGER DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS user_credits (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL UNIQUE,
			total_credits INTEGER NOT NULL DEFAULT 0,
			last_updated INTEGER NOT NULL
		);
	`);
}
