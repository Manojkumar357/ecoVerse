import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { randomBytes } from "crypto";
import { type StudentApplication, type TeacherApplication } from "./storage-db";
import { sendEmail, sendWelcomeEmail, sendApplicationStatusEmail } from "./email";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Storage will be initialized globally
  const storage = (globalThis as any).storage;
  
  type SessionRole = 'student' | 'teacher' | 'admin';
  type SessionRecord = {
    sid: string;
    username: string;
    role: SessionRole;
    createdAt: number;
    lastActivityAt: number;
  };

  const SESSION_COOKIE = 'ev_session';
  const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const SESSION_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
  const sessions = new Map<string, SessionRecord>();

  const parseCookies = (cookieHeader?: string) => {
    const out: Record<string, string> = {};
    if (!cookieHeader) return out;
    for (const item of cookieHeader.split(';')) {
      const [rawKey, ...rest] = item.trim().split('=');
      if (!rawKey) continue;
      out[rawKey] = decodeURIComponent(rest.join('=') || '');
    }
    return out;
  };

  const setSessionCookie = (res: any, sid: string) => {
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_ABSOLUTE_TIMEOUT_MS,
    });
  };

  const clearSessionCookie = (res: any) => {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  };

  const getActiveSession = (req: any, res?: any) => {
    const cookies = parseCookies(req.headers.cookie as string | undefined);
    const sid = cookies[SESSION_COOKIE];
    if (!sid) return null;
    const session = sessions.get(sid);
    if (!session) {
      if (res) clearSessionCookie(res);
      return null;
    }

    const now = Date.now();
    const idleExpired = now - session.lastActivityAt > SESSION_IDLE_TIMEOUT_MS;
    const absoluteExpired = now - session.createdAt > SESSION_ABSOLUTE_TIMEOUT_MS;
    if (idleExpired || absoluteExpired) {
      sessions.delete(sid);
      if (res) clearSessionCookie(res);
      return null;
    }

    session.lastActivityAt = now;
    sessions.set(sid, session);
    return session;
  };

  const protectedPrefixes = ['/api/me', '/api/student', '/api/teacher', '/api/admin', '/api/learning'];
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) return next();

    const needsSession = protectedPrefixes.some(prefix => req.path.startsWith(prefix));
    if (!needsSession) return next();

    const session = getActiveSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    req.headers['x-username'] = session.username;
    req.headers['x-role'] = session.role;
    next();
  });

  // Serve all assets under public/models (textures, bins, nested folders) so GLB dependencies resolve
  const modelsRoot = path.join(process.cwd(), 'public', 'models');
  app.use('/api/models', express.static(modelsRoot));

  // Serve any model from public/models safely
  app.get('/api/models/:file', (req, res) => {
    const { file } = req.params;
    // basic sanitization: only allow .glb or .gltf under public/models
    if (!/^[A-Za-z0-9._-]+\.(glb|gltf)$/.test(file)) {
      return res.status(400).json({ error: 'Invalid model filename' });
    }

    const filePath = path.join(process.cwd(), 'public', 'models', file);
    res.type(path.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving model file:', err);
        res.status(404).json({ error: 'Model not found' });
      }
    });
  });

  // Serve any image from public folder safely
  app.get('/api/image/:file', (req, res) => {
    const { file } = req.params;
    // basic sanitization: only allow common image formats
    if (!/^[A-Za-z0-9._()-]+\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
      return res.status(400).json({ error: 'Invalid image filename' });
    }

    const filePath = path.join(process.cwd(), 'public', file);
    res.type(path.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving image file:', err);
        res.status(404).json({ error: 'Image not found' });
      }
    });
  });

  // Serve embedded static games under a dedicated path to avoid colliding with SPA /games route
  const gamesRoot = path.join(process.cwd(), 'public', 'games');
  app.use('/embedded-games', express.static(gamesRoot));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Games catalog (public)
  app.get('/api/games', async (_req, res) => {
    const list = await (storage as any).listGames();
    res.json(list);
  });

  // Schools
  app.get('/api/schools', async (_req, res) => {
    const schools = await storage.listSchools();
    res.json(schools);
  });

  const resolveSchoolIdFromInput = async (rawSchool: unknown): Promise<string | null> => {
    const input = String(rawSchool ?? '').trim();
    if (!input) return null;

    const schools = await storage.listSchools();

    const byId = schools.find((s: any) => s.id === input);
    if (byId) return byId.id;

    const normalizedInput = input.toLowerCase();
    const byName = schools.find((s: any) => s.name.trim().toLowerCase() === normalizedInput);
    if (byName) return byName.id;

    const created = await storage.addSchool(input);
    return created.id;
  };

  // Admin: add a new school/college (demo; no auth guard here)
  app.post('/api/admin/schools', async (req, res) => {
    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Invalid school name' });
    }
    const created = await storage.addSchool(name.trim());
    res.json(created);
  });

  // Admin: delete a school/college by id
  app.delete('/api/admin/schools/:id', async (req, res) => {
    const ok = await storage.removeSchool(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  // Signups
  app.post('/api/signup/student', async (req, res) => {
    const { name, email, username, schoolId, id, rollNumber, className, section, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: 'Missing fields' });
    if (!(await storage.isUsernameAvailable(username))) return res.status(409).json({ error: 'Username taken' });

    const resolvedSchoolId = await resolveSchoolIdFromInput(schoolId);
    if (!resolvedSchoolId) return res.status(400).json({ error: 'Invalid school name' });

    const appData: StudentApplication = {
      name,
      email,
      username,
      schoolId: resolvedSchoolId,
      studentId: id,
      rollNumber,
      className,
      section,
      photoDataUrl,
      password,
    };
    const created = await storage.addStudentApplication(appData);
    res.json(created);
  });

  app.post('/api/signup/teacher', async (req, res) => {
    const { name, email, username, schoolId, id, subject, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: 'Missing fields' });
    if (!(await storage.isUsernameAvailable(username))) return res.status(409).json({ error: 'Username taken' });

    const resolvedSchoolId = await resolveSchoolIdFromInput(schoolId);
    if (!resolvedSchoolId) return res.status(400).json({ error: 'Invalid school name' });

    const appData: TeacherApplication = {
      name,
      email,
      username,
      schoolId: resolvedSchoolId,
      teacherId: id,
      subject,
      photoDataUrl,
      password,
    };
    const created = await storage.addTeacherApplication(appData);
    res.json(created);
  });

  // Admin approvals
  app.get('/api/admin/pending', async (_req, res) => {
    const data = await storage.listPending();
    res.json(data);
  });

  app.post('/api/admin/approve/:type/:id', async (req, res) => {
    const type = req.params.type === 'student' ? 'student' : 'teacher';
    const ok = await storage.approveApplication(type, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  // Convenience: approve all pending applications (demo helper)
  app.post('/api/admin/approve-all', async (_req, res) => {
    const data = await storage.listPending();
    let approvedStudents = 0;
    let approvedTeachers = 0;
    for (const s of data.students) {
      const ok = await storage.approveApplication('student', s.id!);
      if (ok) approvedStudents++;
    }
    for (const t of data.teachers) {
      const ok = await storage.approveApplication('teacher', t.id!);
      if (ok) approvedTeachers++;
    }
    res.json({ ok: true, approvedStudents, approvedTeachers });
  });

  // Admin: list users (demo; excludes passwords)
  app.get('/api/admin/users', async (_req, res) => {
  const users = (storage as any).users as Map<string, { id: string; username: string; password: string }>;
  const roles = (storage as any).roles as Map<string, 'student'|'teacher'|'admin'>;
  const list = Array.from(users?.values?.() ?? []).map(u => ({ username: u.username, role: roles?.get(u.id) || 'student' }));
    res.json(list);
  });

  // Admin: full user details by username
  app.get('/api/admin/user/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const details = await (storage as any).getUserDetails(username);
    res.json(details);
  });

  // Admin: reset password for a username (demo only, no auth)
  app.post('/api/admin/reset-password', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const ok = await storage.resetPassword(username, password);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
  });

  // Admin: unapprove a user (move back to pending)
  app.post('/api/admin/unapprove', async (req, res) => {
    const { username } = req.body ?? {};
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const ok = await storage.unapproveUser(username);
    if (!ok) return res.status(404).json({ error: 'User not found or cannot be unapproved' });
    res.json({ ok: true });
  });

  // Username and OTP
  app.get('/api/username-available/:username', async (req, res) => {
    const available = await storage.isUsernameAvailable(req.params.username);
    res.json({ available });
  });

  // Basic login (in-memory; demo only)
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    // Use DatabaseStorage to find user
    const found = await storage.getUserByUsername(username);
    if (!found || found.password !== password) {
      return res.status(401).json({ ok: false });
    }

    // Check if user is approved (except for admin)
    if (found.role !== 'admin' && !found.approved) {
      return res.status(401).json({ ok: false, error: 'Account not approved yet' });
    }

    const role = found.role as SessionRole;

    // Invalidate any existing session from this browser before issuing a new one.
    const existing = parseCookies(req.headers.cookie as string | undefined)[SESSION_COOKIE];
    if (existing) sessions.delete(existing);

    const sid = randomBytes(32).toString('hex');
    const now = Date.now();
    sessions.set(sid, {
      sid,
      username: found.username,
      role,
      createdAt: now,
      lastActivityAt: now,
    });
    setSessionCookie(res, sid);

    res.json({
      ok: true,
      role,
      username: found.username,
      idleTimeoutMs: SESSION_IDLE_TIMEOUT_MS,
      absoluteTimeoutMs: SESSION_ABSOLUTE_TIMEOUT_MS,
    });
  });

  app.post('/api/logout', async (req, res) => {
    const sid = parseCookies(req.headers.cookie as string | undefined)[SESSION_COOKIE];
    if (sid) sessions.delete(sid);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/session', async (req, res) => {
    const session = getActiveSession(req, res);
    if (!session) return res.status(401).json({ ok: false });
    const now = Date.now();
    res.json({
      ok: true,
      username: session.username,
      role: session.role,
      expiresInMs: Math.min(
        SESSION_IDLE_TIMEOUT_MS - (now - session.lastActivityAt),
        SESSION_ABSOLUTE_TIMEOUT_MS - (now - session.createdAt),
      ),
    });
  });

  app.post('/api/session/ping', async (req, res) => {
    const session = getActiveSession(req, res);
    if (!session) return res.status(401).json({ ok: false });
    const now = Date.now();
    res.json({
      ok: true,
      expiresInMs: Math.min(
        SESSION_IDLE_TIMEOUT_MS - (now - session.lastActivityAt),
        SESSION_ABSOLUTE_TIMEOUT_MS - (now - session.createdAt),
      ),
    });
  });

  // Public: application status by username (pending/approved/none)
  app.get('/api/application-status/:username', async (req, res) => {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    try {
      const status = await storage.getApplicationStatus(username);
      res.json({ status });
    } catch (e) {
      res.status(500).json({ error: 'Status check failed' });
    }
  });

  app.post('/api/otp/request', async (req, res) => {
    const { email } = req.body ?? {};
    const normalizedEmail = String(email || '').trim();
    if (!normalizedEmail) return res.status(400).json({ error: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await storage.saveOtp(normalizedEmail, code, 5 * 60 * 1000);

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${code}. It expires in 5 minutes.`,
        html: `<p>Your OTP is: <strong>${code}</strong>. It expires in 5 minutes.</p>`,
      });
      res.json({ ok: true });
    } catch (err) {
      console.error('Email send error:', err);
      res.status(500).json({ error: 'Failed to send OTP email' });
    }
  });
  

  app.post('/api/otp/verify', async (req, res) => {
    const { email, code } = req.body ?? {};
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
    const ok = await storage.verifyOtp(email, code);
    res.json({ ok });
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, category, subject, message } = req.body ?? {};
    const senderName = String(name || '').trim();
    const senderEmail = String(email || '').trim();
    const contactCategory = String(category || '').trim();
    const contactSubject = String(subject || '').trim();
    const contactMessage = String(message || '').trim();

    if (!senderName || !senderEmail || !contactCategory || !contactSubject || !contactMessage) {
      return res.status(400).json({ error: 'All contact fields are required' });
    }

    const supportInbox = process.env.EMAIL || process.env.GMAIL_USER || process.env.SUPPORT_EMAIL || 'ecoverse.academy@gmail.com';

    await sendEmail({
      to: supportInbox,
      subject: `[Contact:${contactCategory}] ${contactSubject}`,
      text: `Name: ${senderName}\nEmail: ${senderEmail}\nCategory: ${contactCategory}\nSubject: ${contactSubject}\n\nMessage:\n${contactMessage}`,
      replyTo: senderEmail,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #111827;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #16a34a 100%); color: white; padding: 20px 24px; border-radius: 14px 14px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">EcoVerse Contact Request</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 14px 14px;">
            <p><strong>Name:</strong> ${senderName}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
            <p><strong>Category:</strong> ${contactCategory}</p>
            <p><strong>Subject:</strong> ${contactSubject}</p>
            <div style="margin-top: 18px; padding: 16px; background: #f9fafb; border-radius: 12px; white-space: pre-wrap;">
              ${contactMessage}
            </div>
          </div>
        </div>
      `,
    });

    res.json({ ok: true, deliveredTo: supportInbox });
  });

  // ===== Self Profile (Teacher/Student/Admin) =====
  app.get('/api/me/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const p = await (storage as any).getOwnProfile(current);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  });
  app.put('/api/me/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const r = await (storage as any).updateOwnProfile(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.profile);
  });

  // Admin accounts CRUD
  app.get('/api/admin/admins', async (_req, res) => {
    const list = await storage.listAdmins();
    res.json(list);
  });
  app.post('/api/admin/admins', async (req, res) => {
    const { username, password, name, email } = req.body ?? {};
    const r = await storage.createAdmin({ username, password, name, email });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app.put('/api/admin/admins/:username', async (req, res) => {
    const current = (req.headers['x-username'] as string) || undefined;
    const r = await storage.updateAdmin(req.params.username, req.body ?? {}, current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app.delete('/api/admin/admins/:username', async (req, res) => {
    const r = await storage.deleteAdmin(req.params.username);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // Dev-only seeding of teacher tasks
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/dev/seed-teacher-tasks', async (req, res) => {
      try {
        const teacher = (req.body?.username as string) || 'test_teacher';
        const count = Number.isFinite(req.body?.count) ? Math.max(1, Math.min(100, Number(req.body.count))) : 12;
        const create = async (input: any) => {
          return await (storage as any).createTask(teacher, input);
        };
        const pool = [
          { title: 'Recycle Drive', description: 'Collect and sort recyclables from your neighborhood.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 4 },
          { title: 'Plant a Tree', description: 'Plant a sapling and document the process.', maxPoints: 10, proofType: 'photo', groupMode: 'solo' },
          { title: 'Clean-Up Challenge', description: 'Clean a local area and show before/after photos.', maxPoints: 9, proofType: 'photo', groupMode: 'group', maxGroupSize: 5 },
          { title: 'Water Audit', description: 'Audit household water usage and suggest savings.', maxPoints: 7, proofType: 'text', groupMode: 'solo' },
          { title: 'Energy Saver Week', description: 'Track and reduce electricity consumption for a week.', maxPoints: 8, proofType: 'text', groupMode: 'solo' },
          { title: 'Eco Poster', description: 'Design a poster promoting an eco-friendly habit.', maxPoints: 6, proofType: 'photo', groupMode: 'solo' },
          { title: 'Compost Starter', description: 'Start a compost bin and log the steps.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 3 },
          { title: 'Biodiversity Walk', description: 'List 10 species found in your area with photos.', maxPoints: 9, proofType: 'photo', groupMode: 'group', maxGroupSize: 4 },
          { title: 'Plastic-Free Day', description: 'Go plastic-free for a day and report findings.', maxPoints: 7, proofType: 'text', groupMode: 'solo' },
          { title: 'Rainwater Harvesting Plan', description: 'Draft a simple harvesting plan for your building.', maxPoints: 10, proofType: 'text', groupMode: 'group', maxGroupSize: 4 },
          { title: 'School Garden Duty', description: 'Maintain a garden patch for a week.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 5 },
          { title: 'Green Transport Day', description: 'Use non-motorized or public transport; log your route.', maxPoints: 6, proofType: 'text', groupMode: 'solo' },
        ];
        const created: any[] = [];
        for (let i = 0; i < count; i++) {
          const base = pool[i % pool.length];
          const variant = {
            ...base,
            title: `${base.title} #${i + 1}`,
            deadline: undefined,
          };
          const r = await create(variant);
          if (r?.ok) created.push(r.task);
        }
        res.json({ ok: true, count: created.length, username: teacher });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });
    // Dev: seed quizzes (supports bulk). If no body provided, falls back to demo seeding.
    app.post('/api/dev/seed-quizzes', async (req, res) => {
      try {
        const body = req.body ?? {};
        const adminCount = Number.isFinite(body.adminCount) ? Math.max(0, Math.min(100, Number(body.adminCount))) : undefined;
        const teacherCount = Number.isFinite(body.teacherCount) ? Math.max(0, Math.min(100, Number(body.teacherCount))) : undefined;
        const adminUsername = (body.adminUsername as string) || 'admin123';
        const teacherUsername = (body.teacherUsername as string) || 'test_teacher';

        if (adminCount == null && teacherCount == null) {
          // Back-compat: simple demo seed via storage helper
          const { storage } = await import('./storage');
          (storage as any).seedDemoQuizzes?.();
          return res.json({ ok: true, mode: 'demo' });
        }

        // Build quiz factory
        const topics = [
          'Climate Action', 'Oceans', 'Forests', 'Wildlife', 'Renewables',
          'Water Conservation', 'Recycling', 'Pollution', 'Sustainable Cities', 'Energy Efficiency',
          'Biodiversity', 'Soil Health', 'Green Transport', 'Circular Economy', 'Air Quality',
        ];
        const optBank = [
          'Reduce carbon emissions', 'Increase plastic use', 'Cut more trees', 'Ignore pollution',
          'Install solar panels', 'Burn more coal', 'Dump waste in oceans', 'Save energy at home',
        ];
        const makeQuestion = (qIdx: number) => {
          const correctIndex = Math.floor(Math.random() * 4);
          const base = qIdx % (optBank.length - 4);
          const options = [0,1,2,3].map((i) => optBank[(base + i) % optBank.length]);
          const text = `Q${qIdx + 1}. Choose the best eco-friendly action.`;
          return { id: qIdx + 1, text, options, answerIndex: correctIndex };
        };
        const makeQuiz = (i: number, scope: 'global' | 'school') => {
          const title = `${scope === 'global' ? 'Global' : 'School'} Quiz ${i + 1}: ${topics[i % topics.length]}`;
          const description = `Test your knowledge on ${topics[i % topics.length]}.`;
          const points = 10 + (i % 5) * 2;
          const questions = Array.from({ length: 5 }, (_, qi) => makeQuestion(qi));
          return { title, description, points, questions };
        };

        let adminCreated = 0;
        let teacherCreated = 0;
        const createAdminQuiz = async (q: any) => {
          const r = await (storage as any).createAdminQuiz(adminUsername, q);
          if (r?.ok !== false) adminCreated++;
        };
        const createTeacherQuiz = async (q: any) => {
          const r = await (storage as any).createQuiz(teacherUsername, q);
          if (r?.ok !== false) teacherCreated++;
        };

        // Ensure teacher/admin may exist (best-effort, ignore failures if already present)
        try { await (storage as any).createAdmin?.({ username: adminUsername, password: 'admin@1234', name: 'Admin', email: `${adminUsername}@example.com` }); } catch {}

        // Seed admin quizzes
        if (adminCount && adminCount > 0) {
          for (let i = 0; i < adminCount; i++) {
            await createAdminQuiz(makeQuiz(i, 'global'));
          }
        }
        // Seed teacher quizzes
        if (teacherCount && teacherCount > 0) {
          for (let i = 0; i < teacherCount; i++) {
            await createTeacherQuiz(makeQuiz(i, 'school'));
          }
        }

        res.json({ ok: true, adminCreated, teacherCreated, adminUsername, teacherUsername });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });

    // Dev: seed many schools and approved students for leaderboard demos
    app.post('/api/dev/seed-schools-students', async (req, res) => {
      try {
        const body = req.body ?? {};
        const schools = Math.max(0, Math.min(100, Math.floor(Number(body.schools) || 0)));
        const students = Math.max(0, Math.min(10000, Math.floor(Number(body.students) || 0)));
        const adminUsername = (body.adminUsername as string) || 'admin123';
        const r = await (storage as any).seedSchoolsAndStudents({ schools, students, adminUsername });
        res.json({ ok: true, ...r, adminUsername });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });
  }

  // ===== Teacher & Student: Tasks and Submissions =====
  // Create a new task (Teacher only)
  app.post('/api/teacher/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize } = req.body ?? {};
    const r = await (storage as any).createTask(current, { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  // List tasks created by this teacher
  app.get('/api/teacher/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherTasks(current);
    res.json(list);
  });
  // List submissions for teacher (optionally by task)
  app.get('/api/teacher/submissions', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const taskId = (req.query.taskId as string) || undefined;
    const list = await (storage as any).listSubmissionsForTeacher(current, taskId);
    res.json(list);
  });
  // Review a submission (approve/reject with points)
  app.post('/api/teacher/submissions/:id/review', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { status, points, feedback } = req.body ?? {};
    const r = await (storage as any).reviewSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  // Student: list available tasks (for their school) with submission status
  app.get('/api/student/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentTasks(current);
    res.json(list);
  });
  // Student: submit task proof (photo data URL)
  app.post('/api/student/tasks/:id/submit', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { photoDataUrl, photos } = req.body ?? {};
    const payload = Array.isArray(photos) ? photos : photoDataUrl;
    const r = await (storage as any).submitTask(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });

  // Groups: create or fetch
  app.post('/api/student/tasks/:id/group', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { members } = req.body ?? {};
    const r = await (storage as any).createTaskGroup(current, req.params.id, members || []);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app.get('/api/student/tasks/:id/group', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const g = await (storage as any).getTaskGroupForStudent(current, req.params.id);
    res.json(g);
  });

  // ===== Teacher: Announcements =====
  app.post('/api/teacher/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, body } = req.body ?? {};
    const r = await (storage as any).createAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app.get('/api/teacher/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAnnouncementsForTeacher(current);
    res.json(list);
  });

  // ===== Admin: Global Announcements =====
  app.post('/api/admin/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, body } = req.body ?? {};
    const r = await (storage as any).createAdminAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app.get('/api/admin/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminAnnouncements(current);
    res.json(list);
  });
  app.put('/api/admin/announcements/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, body } = req.body ?? {};
    const r = await (storage as any).updateAdminAnnouncement(current, req.params.id, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app.delete('/api/admin/announcements/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminAnnouncement(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Student: Announcements (global + school) =====
  app.get('/api/student/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentAnnouncements(current);
    res.json(list);
  });

  // ===== Teacher: Assignments =====
  app.post('/api/teacher/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await (storage as any).createAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app.get('/api/teacher/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherAssignments(current);
    res.json(list);
  });

  // ===== Admin: Global Assignments =====
  app.post('/api/admin/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await (storage as any).createAdminAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app.get('/api/admin/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminAssignments(current);
    res.json(list);
  });
  app.put('/api/admin/assignments/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await (storage as any).updateAdminAssignment(current, req.params.id, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app.delete('/api/admin/assignments/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminAssignment(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app.get('/api/admin/assignment-submissions', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const assignmentId = (req.query.assignmentId as string) || undefined;
    const list = await (storage as any).listAssignmentSubmissionsForAdmin(current, assignmentId);
    res.json(list);
  });
  app.post('/api/admin/assignment-submissions/:id/review', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { status, points, feedback } = req.body ?? {};
    const r = await (storage as any).reviewAdminAssignmentSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Student: Assignments & Submissions =====
  app.get('/api/student/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentAssignments(current);
    res.json(list);
  });
  app.post('/api/student/assignments/:id/submit', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { files } = req.body ?? {};
    const payload = Array.isArray(files) ? files : [];
    const r = await (storage as any).submitAssignment(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });

  // ===== Teacher: Assignment Submissions review =====
  app.get('/api/teacher/assignment-submissions', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const assignmentId = (req.query.assignmentId as string) || undefined;
    const list = await (storage as any).listAssignmentSubmissionsForTeacher(current, assignmentId);
    res.json(list);
  });
  app.post('/api/teacher/assignment-submissions/:id/review', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { status, points, feedback } = req.body ?? {};
    const r = await (storage as any).reviewAssignmentSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Teacher: Quizzes =====
  app.post('/api/teacher/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, points, questions } = req.body ?? {};
    const r = await (storage as any).createQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app.get('/api/teacher/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherQuizzes(current);
    res.json(list);
  });
  // Update a teacher quiz
  app.put('/api/teacher/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  // Delete a teacher quiz
  app.delete('/api/teacher/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Admin: Global Quizzes =====
  app.post('/api/admin/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, points, questions } = req.body ?? {};
    const r = await (storage as any).createAdminQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app.get('/api/admin/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminQuizzes(current);
    res.json(list);
  });
  // Update a global quiz (admin)
  app.put('/api/admin/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  // Delete a global quiz (admin)
  app.delete('/api/admin/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Student: Discover quizzes =====
  app.get('/api/student/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentQuizzes(current);
    const sanitized = (Array.isArray(list) ? list : []).map((q: any) => ({
      ...q,
      questions: (q.questions || []).map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options })),
    }));
    res.json(sanitized);
  });

  // ===== Admin: Games management =====
  app.get('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminGames(current);
    res.json(list);
  });
  app.post('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).createAdminGame(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.put('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.delete('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // Student: fetch own attempt for a quiz
  app.get('/api/student/quizzes/:id/attempt', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const a = await (storage as any).getStudentQuizAttempt(current, req.params.id);
    res.json(a || null);
  });

  // Public: fetch quiz by id (metadata without answers)
  app.get('/api/quizzes/:id', async (req, res) => {
    const q = await (storage as any).getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    const sanitized = { ...q, questions: q.questions.map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options })) };
    res.json(sanitized);
  });

  // Secure scoring: compute score server-side using answer keys
  app.post('/api/quizzes/:id/score', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const q = await (storage as any).getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    // ensure only students can score and quiz is available to them
    const me = await (storage as any).getOwnProfile(current);
    if (!me || me.role !== 'student') return res.status(403).json({ error: 'Only students can attempt' });
    const schoolId = me.schoolId;
    const allowed = q.visibility === 'global' || (!!schoolId && q.schoolId === schoolId);
    if (!allowed) return res.status(403).json({ error: 'Quiz not available' });
    const answers: number[] = Array.isArray(req.body?.answers) ? req.body.answers.map((n: any) => Number(n)) : [];
    const total = q.questions.length || 0;
    if (total === 0) return res.json({ ok: true, correct: 0, total: 0, percent: 0 });
    let correct = 0;
      const details: Array<{ index: number; correctIndex: number; selected: number; isCorrect: boolean }> = [];
      for (let i = 0; i < total; i++) {
        const choice = answers[i];
        const correctIndex = (q.questions[i] as any).answerIndex;
        const isCorrect = Number.isFinite(choice) && choice === correctIndex;
        if (isCorrect) correct++;
        details.push({ index: i, correctIndex, selected: Number.isFinite(choice) ? choice : -1, isCorrect });
    }
    const percent = Math.round((correct / total) * 100);
    res.json({ ok: true, correct, total, percent, details });
  });

  // ===== Teacher: Students & Overview =====
  app.get('/api/teacher/students', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentsForTeacher(current);
    res.json(list);
  });
  app.get('/api/teacher/overview', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const data = await (storage as any).getTeacherOverview(current);
    res.json(data);
  });

  // ===== Student Profile (view + privacy)
  app.get('/api/student/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const p = await (storage as any).getStudentProfile(current);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  });
  app.put('/api/student/profile/privacy', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const allow = !!(req.body?.allowExternalView);
    const r = await (storage as any).setStudentPrivacy(current, allow);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Learning modules =====
  app.get('/api/learning/progress', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const list = await (storage as any).listLessonCompletions(current);
    const totalLessonPoints = list.reduce((acc: number, lc: any) => acc + Number(lc.points || 0), 0);
    res.json({ completions: list, totalLessonPoints });
  });

  app.post('/api/learning/complete', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const { moduleId, moduleTitle, lessonId, lessonTitle, points } = req.body ?? {};
    const r = await (storage as any).completeLesson(current, { moduleId, moduleTitle, lessonId, lessonTitle, points });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });

  app.get('/api/learning/modules', async (_req, res) => {
    const list = await (storage as any).listLearningModules();
    res.json(list);
  });

  app.get('/api/admin/learning/modules', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listManagedLearningModules(current);
    res.json(list);
  });

  app.post('/api/admin/learning/modules', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).upsertManagedLearningModule(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.module);
  });

  app.put('/api/admin/learning/modules/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).upsertManagedLearningModule(current, { ...(req.body ?? {}), id: req.params.id });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.module);
  });

  app.delete('/api/admin/learning/modules/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteManagedLearningModule(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Activity logging =====
  app.post('/api/student/quiz-attempts', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
  const { quizId, scorePercent, answers } = req.body ?? {};
  const r = await (storage as any).addQuizAttempt(current, { quizId, scorePercent, answers });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.attempt);
  });
  app.post('/api/student/games/:gameId/play', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const points = Number(req.body?.points);
    const r = await (storage as any).addGamePlay(current, req.params.gameId, Number.isFinite(points) ? points : undefined);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.play);
  });

  // Games: summary for progress UI
  app.get('/api/student/games/summary', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const summary = await (storage as any).getStudentGameSummary(current);
    res.json(summary);
  });

  // Public: list all games (admin-managed catalog)
  app.get('/api/games', async (_req, res) => {
    const list = await (storage as any).listGames();
    res.json(list);
  });

  // Admin: manage games catalog
  app.get('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminGames(current);
    res.json(list);
  });
  app.post('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { id, name, category, description, difficulty, points, icon, externalUrl, image } = req.body ?? {};
    const r = await (storage as any).createAdminGame(current, { id, name, category, description, difficulty, points, icon, externalUrl, image });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.put('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.delete('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Notifications =====
  app.get('/api/notifications', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listNotifications(current);
    res.json(list);
  });
  app.post('/api/notifications/read', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).markAllNotificationsRead(current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Leaderboard =====
  // Global: top schools
  app.get('/api/leaderboard/schools', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 25));
    const rows = await (storage as any).getGlobalSchoolsLeaderboard(limit);
    res.json(rows);
  });
  // School: top students
  app.get('/api/leaderboard/school/:schoolId/students', async (req, res) => {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const rows = await (storage as any).getSchoolStudentsLeaderboard(req.params.schoolId, limit, offset);
    res.json(rows);
  });
  // Global: top students (optional school filter)
  app.get('/api/leaderboard/students', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = (req.query.schoolId as string) || null;
    const rows = await (storage as any).getGlobalStudentsLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  // Global: top teachers (optional school filter)
  app.get('/api/leaderboard/teachers', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = (req.query.schoolId as string) || null;
    const rows = await (storage as any).getGlobalTeachersLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  // School preview
  app.get('/api/leaderboard/school/:schoolId/preview', async (req, res) => {
    const data = await (storage as any).getSchoolPreview(req.params.schoolId);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Student preview
  app.get('/api/leaderboard/student/:username/preview', async (req, res) => {
    const data = await (storage as any).getStudentPreview(req.params.username);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Teacher preview
  app.get('/api/leaderboard/teacher/:username/preview', async (req, res) => {
    const data = await (storage as any).getTeacherPreview(req.params.username);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Admin analytics
  app.get('/api/leaderboard/admin/analytics', async (_req, res) => {
    const data = await (storage as any).getAdminLeaderboardAnalytics();
    res.json(data);
  });

  // Video Management Routes
  
  // Get all videos (public endpoint)
  app.get('/api/videos', async (_req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  // Get user's video progress and credits
  app.get('/api/users/:username/credits', async (req, res) => {
    try {
      const credits = await storage.getUserCredits(req.params.username);
      res.json(credits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      res.status(500).json({ error: 'Failed to fetch user credits' });
    }
  });

  // Award credits for watching a video
  app.post('/api/videos/watch', async (req, res) => {
    try {
      const current = (req.headers['x-username'] as string) || '';
      const { videoId, username: bodyUsername } = req.body;
      const username = bodyUsername || current;
      const result = await storage.recordVideoWatch(username, videoId);
      res.json(result);
    } catch (error) {
      console.error('Error recording video watch:', error);
      res.status(500).json({ error: 'Failed to record video watch' });
    }
  });

  // Award credits endpoint
  app.post('/api/videos/award-credits', async (req, res) => {
    try {
      const current = (req.headers['x-username'] as string) || '';
      const { username: bodyUsername, videoId } = req.body;
      const username = bodyUsername || current;
      const result = await storage.recordVideoWatch(username, videoId);
      res.json(result);
    } catch (error) {
      console.error('Error awarding credits:', error);
      res.status(500).json({ error: 'Failed to award credits' });
    }
  });

  // Fetch YouTube video metadata
  app.post('/api/videos/youtube-metadata', async (req, res) => {
    try {
      const { url } = req.body;
      const metadata = await storage.fetchYouTubeMetadata(url);
      res.json(metadata);
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      res.status(500).json({ error: 'Failed to fetch YouTube metadata' });
    }
  });

  // Admin video management routes
  app.get('/api/admin/videos', async (_req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching admin videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  app.post('/api/admin/videos', async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage.createVideo({
        title,
        description,
        type,
        url,
        thumbnail,
        credits: credits || 1,
        uploadedBy: 'admin', // TODO: Get from authenticated user
        category,
        duration
      });
      res.json(video);
    } catch (error) {
      console.error('Error creating admin video:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  });

  app.put('/api/admin/videos/:id', async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage.updateVideo(req.params.id, {
        title,
        description,
        type,
        url,
        thumbnail,
        credits,
        category,
        duration
      });
      res.json(video);
    } catch (error) {
      console.error('Error updating admin video:', error);
      res.status(500).json({ error: 'Failed to update video' });
    }
  });

  app.delete('/api/admin/videos/:id', async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting admin video:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  });

  // Teacher video management routes
  app.get('/api/teacher/videos', async (req, res) => {
    try {
      const videos = await storage.getTeacherVideos(req.query.teacherId as string);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching teacher videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  app.get('/api/teacher/videos/count', async (req, res) => {
    try {
      const current = (req.headers['x-username'] as string) || '';
      const count = await storage.getTeacherVideosCount(current);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching teacher videos count:', error);
      res.status(500).json({ error: 'Failed to fetch videos count' });
    }
  });

  app.post('/api/teacher/videos', async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage.createVideo({
        title,
        description,
        type,
        url,
        thumbnail,
        credits: credits || 1,
        uploadedBy: req.body.teacherId || 'teacher', // TODO: Get from authenticated user
        category,
        duration
      });
      res.json(video);
    } catch (error) {
      console.error('Error creating teacher video:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  });

  app.put('/api/teacher/videos/:id', async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration, uploadedBy } = req.body;
      const video = await storage.updateVideo(req.params.id, {
        title,
        description,
        type,
        url,
        thumbnail,
        credits,
        category,
        duration,
        uploadedBy
      });
      res.json(video);
    } catch (error) {
      console.error('Error updating teacher video:', error);
      res.status(500).json({ error: 'Failed to update video' });
    }
  });

  app.delete('/api/teacher/videos/:id', async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting teacher video:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  });

  // ===== Public Profile Endpoint (no auth required) =====
  app.get('/api/public-profile/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    
    try {
      const profile = await (storage as any).getStudentProfile(username);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      
      // Check if student allows external view
      if (!profile.allowExternalView) {
        return res.status(403).json({ error: 'This profile is private' });
      }
      
      // Return public profile data (including eco points)
      res.json({
        username: profile.username,
        name: profile.name,
        ecoPoints: profile.ecoPoints,
        ecoTreeStage: profile.ecoTreeStage,
        achievements: profile.achievements,
        ranks: profile.ranks,
        timeline: profile.timeline,
        schoolId: profile.schoolId
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Email endpoints
  app.post('/api/email/welcome', async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Missing email or name' });
      }
      await sendWelcomeEmail(email, name);
      res.json({ ok: true, message: 'Welcome email sent' });
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  });

  app.post('/api/email/application-status', async (req, res) => {
    try {
      const { email, name, status, message } = req.body;
      if (!email || !name || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      await sendApplicationStatusEmail(email, name, status, message);
      res.json({ ok: true, message: 'Application status email sent' });
    } catch (error: any) {
      console.error('Error sending application status email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  });

  app.post('/api/email/custom', async (req, res) => {
    try {
      const { to, subject, html, text } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({ error: 'Missing required fields (to, subject, html)' });
      }
      await sendEmail({ to, subject, html, text });
      res.json({ ok: true, message: 'Email sent' });
    } catch (error: any) {
      console.error('Error sending custom email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
