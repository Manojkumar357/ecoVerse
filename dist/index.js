var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemStorage = class {
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.roles = /* @__PURE__ */ new Map();
        this.schools = /* @__PURE__ */ new Map();
        this.pendingStudents = /* @__PURE__ */ new Map();
        this.pendingTeachers = /* @__PURE__ */ new Map();
        this.otps = /* @__PURE__ */ new Map();
        this.profiles = /* @__PURE__ */ new Map();
        this.tasks = /* @__PURE__ */ new Map();
        this.submissions = /* @__PURE__ */ new Map();
        this.groups = /* @__PURE__ */ new Map();
        this.announcements = /* @__PURE__ */ new Map();
        this.assignments = /* @__PURE__ */ new Map();
        this.assignmentSubmissions = /* @__PURE__ */ new Map();
        this.quizzes = /* @__PURE__ */ new Map();
        this.quizAttempts = /* @__PURE__ */ new Map();
        this.gamePlays = /* @__PURE__ */ new Map();
        this.games = /* @__PURE__ */ new Map();
        this.lessonCompletions = /* @__PURE__ */ new Map();
        this.learningModules = /* @__PURE__ */ new Map();
        this.notifications = /* @__PURE__ */ new Map();
        this.lastGamePlay = /* @__PURE__ */ new Map();
        this.videos = /* @__PURE__ */ new Map();
        this.userVideoProgress = /* @__PURE__ */ new Map();
        this.userCredits = /* @__PURE__ */ new Map();
        this.dataFile = path.join(process.cwd(), "server", "data.json");
        this.saveTimer = null;
        this.saveInFlight = false;
        this.saveRequestedWhileWriting = false;
        if (fs.existsSync(this.dataFile)) {
          try {
            const raw = JSON.parse(fs.readFileSync(this.dataFile, "utf-8"));
            for (const u of raw.users ?? []) this.users.set(u.id, u);
            for (const [id, role] of Object.entries(raw.roles ?? {})) this.roles.set(id, role);
            for (const s of raw.schools ?? []) this.schools.set(s.id, s);
            for (const a of raw.pendingStudents ?? []) this.pendingStudents.set(a.id, a);
            for (const a of raw.pendingTeachers ?? []) this.pendingTeachers.set(a.id, a);
            const rawProfiles = raw.profiles ?? {};
            if (rawProfiles && typeof rawProfiles === "object") {
              for (const [id, prof] of Object.entries(rawProfiles)) this.profiles.set(id, prof);
            }
            for (const t of raw.tasks ?? []) this.tasks.set(t.id, t);
            for (const s of raw.submissions ?? []) this.submissions.set(s.id, s);
            for (const g of raw.groups ?? []) this.groups.set(g.id, g);
            for (const q of raw.quizzes ?? []) this.quizzes.set(q.id, { ...q, visibility: q.visibility ?? "school" });
            for (const qa of raw.quizAttempts ?? []) this.quizAttempts.set(qa.id, qa);
            for (const gp of raw.gamePlays ?? []) this.gamePlays.set(gp.id, gp);
            for (const g of raw.games ?? []) this.games.set(g.id, g);
            for (const lc of raw.lessonCompletions ?? []) this.lessonCompletions.set(lc.id, lc);
            for (const m of raw.learningModules ?? []) this.learningModules.set(m.id, m);
            for (const n of raw.notifications ?? []) this.notifications.set(n.id, n);
            for (const v of raw.videos ?? []) this.videos.set(v.id, v);
            for (const p of raw.userVideoProgress ?? []) this.userVideoProgress.set(p.id, p);
            for (const c of raw.userCredits ?? []) this.userCredits.set(c.id, c);
            for (const a of raw.announcements ?? []) this.announcements.set(a.id, { ...a, visibility: a.visibility ?? "school" });
            for (const a of raw.assignments ?? []) this.assignments.set(a.id, { ...a, visibility: a.visibility ?? "school" });
            for (const s of raw.assignmentSubmissions ?? []) this.assignmentSubmissions.set(s.id, s);
            const firstSchool = Array.from(this.schools.values())[0];
            this.users.forEach((u, id) => {
              const role = this.roles.get(id);
              if ((role === "student" || role === "teacher") && !this.profiles.get(id)) {
                const base = { role, name: "", email: "", schoolId: firstSchool?.id || "" };
                this.profiles.set(id, base);
              }
            });
            this.ensureDemoQuizzes();
            this.ensureDemoGames();
            this.ensureDemoAnnouncementsAssignments();
            this.save();
          } catch {
            this.seedDefaults();
            this.save();
          }
        } else {
          this.seedDefaults();
          this.ensureDemoAnnouncementsAssignments();
          this.ensureDemoGames();
          this.save();
        }
      }
      // Public helper to ensure demo quizzes exist (dev only)
      seedDemoQuizzes() {
        this.ensureDemoQuizzes();
        this.save();
      }
      // Dev helper: bulk-create schools and approved students for demos/leaderboards
      async seedSchoolsAndStudents(input) {
        const schoolsTarget = Math.max(0, Math.min(100, Math.floor(Number(input.schools) || 0)));
        const studentsTarget = Math.max(0, Math.min(1e4, Math.floor(Number(input.students) || 0)));
        if (input.adminUsername) {
          const hasAdmin = Array.from(this.users.values()).some((u) => u.username === input.adminUsername);
          if (!hasAdmin) {
            try {
              await this.createAdmin({ username: input.adminUsername, password: "admin@1234", name: "Admin", email: `${input.adminUsername}@example.com` });
            } catch {
            }
          }
        }
        const existingSchoolNames = new Set(Array.from(this.schools.values()).map((s) => s.name));
        const baseNames = [
          "Green Valley High",
          "Riverdale Academy",
          "Sunrise Public School",
          "Harmony International",
          "Cedar Grove School",
          "Maple Leaf High",
          "Blue Horizon School",
          "Silver Oak Academy",
          "Evergreen Public",
          "Springfield High",
          "Lakeside School",
          "Hillcrest Academy",
          "Oakridge High",
          "Starlight Public",
          "Pinecrest School",
          "Brookside Academy",
          "Riverside High",
          "Meadowview School",
          "Clearwater Public",
          "Willowdale High",
          "Summit Ridge School",
          "Grandview Academy",
          "Crescent Public",
          "Highland High",
          "Northfield School",
          "Southridge Academy",
          "Westwood High",
          "Eastview School",
          "Parkside Public",
          "Bayview High"
        ];
        let schoolsCreated = 0;
        for (let i = 0; i < schoolsTarget; i++) {
          let name = baseNames[i % baseNames.length];
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
        const schoolIds = Array.from(this.schools.values()).map((s) => s.id);
        const firstSchoolId = schoolIds[0];
        const fnames = ["Aarav", "Diya", "Rohan", "Isha", "Kabir", "Anaya", "Vivaan", "Myra", "Arjun", "Sara", "Aditya", "Anika", "Rahul", "Pooja", "Kunal", "Meera", "Tejas", "Nisha", "Siddharth", "Kavya", "Harsh", "Priya", "Ritika", "Ayaan", "Navya", "Om", "Tanvi", "Yash", "Zara", "Ira"];
        const lnames = ["Mehta", "Kapoor", "Gupta", "Sharma", "Verma", "Khan", "Joshi", "Agarwal", "Singh", "Nair", "Patel", "Desai", "Reddy", "Iyer", "Das", "Ghosh", "Chopra", "Bose", "Malhotra", "Trivedi", "Pillai", "Kulkarni", "Bhat", "Dutta", "Menon", "Shetty", "Saxena", "Mishra", "Bhattacharya", "Shukla"];
        const sections = ["A", "B", "C", "D"];
        let studentsCreated = 0;
        const usernameExists = (uname) => {
          if (Array.from(this.users.values()).some((u) => u.username === uname)) return true;
          if (Array.from(this.pendingStudents.values()).some((a) => a.username === uname)) return true;
          if (Array.from(this.pendingTeachers.values()).some((a) => a.username === uname)) return true;
          return false;
        };
        for (let i = 0; i < studentsTarget; i++) {
          const fn = fnames[i % fnames.length];
          const ln = lnames[i * 7 % lnames.length];
          const base = `${fn.toLowerCase()}_${ln.toLowerCase()}`;
          let uname = base;
          let counter = 1;
          while (usernameExists(uname)) {
            counter++;
            uname = `${base}${counter}`;
          }
          const schoolId = schoolIds.length ? schoolIds[i * 13 % schoolIds.length] : firstSchoolId;
          const classNum = String(6 + i % 7);
          const section = sections[i * 3 % sections.length];
          const roll = String(1 + i % 60);
          const studentId = `STU${(1e3 + i).toString()}`;
          const id = randomUUID();
          this.users.set(id, { id, username: uname, password: "123@123" });
          this.roles.set(id, "student");
          this.profiles.set(id, {
            role: "student",
            name: `${fn} ${ln}`,
            email: `${uname}@example.com`,
            schoolId: schoolId || "",
            studentId,
            rollNumber: roll,
            className: classNum,
            section
          });
          studentsCreated++;
        }
        this.save();
        return { schoolsCreated, studentsCreated };
      }
      ensureDemoQuizzes() {
        const hasGlobal = Array.from(this.quizzes.values()).some((q) => q.visibility === "global");
        const adminEntry = Array.from(this.users.entries()).find(([, u]) => u.username === "admin123");
        const now = Date.now();
        if (!hasGlobal && adminEntry) {
          const [adminId] = adminEntry;
          const gqId = randomUUID();
          this.quizzes.set(gqId, {
            id: gqId,
            title: "Earth Basics (Global)",
            description: "General planet awareness",
            points: 3,
            createdByUserId: adminId,
            schoolId: "",
            createdAt: now,
            visibility: "global",
            questions: [
              { id: randomUUID(), text: "Which gas is most abundant in Earth's atmosphere?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], answerIndex: 0 },
              { id: randomUUID(), text: "Approximate age of Earth?", options: ["4.5 billion years", "450 million years", "45 million years", "13.8 billion years"], answerIndex: 0 },
              { id: randomUUID(), text: "What percentage of Earth's surface is covered by water?", options: ["71%", "50%", "29%", "90%"], answerIndex: 0 }
            ]
          });
        }
        const teacherEntry = Array.from(this.users.entries()).find(([, u]) => u.username === "test_teacher");
        if (teacherEntry) {
          const [tid, tu] = teacherEntry;
          const hasSchoolQuiz = Array.from(this.quizzes.values()).some((q) => q.visibility === "school" && q.createdByUserId === tid);
          let schoolId = this.getSchoolIdForUserId(tid);
          if (!schoolId) schoolId = Array.from(this.schools.values())[0]?.id;
          if (!hasSchoolQuiz && schoolId) {
            const tqId = randomUUID();
            this.quizzes.set(tqId, {
              id: tqId,
              title: "School Science Quiz",
              description: "Test your science knowledge! (School only)",
              points: 3,
              createdByUserId: tid,
              schoolId,
              createdAt: now + 1,
              visibility: "school",
              questions: [
                { id: randomUUID(), text: "What is H2O commonly known as?", options: ["Water", "Oxygen", "Hydrogen", "Salt"], answerIndex: 0 },
                { id: randomUUID(), text: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answerIndex: 0 },
                { id: randomUUID(), text: "What force keeps us on the ground?", options: ["Gravity", "Magnetism", "Friction", "Wind"], answerIndex: 0 }
              ]
            });
          }
        }
      }
      ensureDemoGames() {
        const base = [
          { name: "SeaVerse: Ocean Guardian", category: "wildlife", description: "Protect and restore our oceans. Complete missions to save marine life, stop pollution, and learn about ocean conservation.", difficulty: "Medium", points: 100, icon: "\u{1F30A}", externalUrl: "/embedded-games/index.html", image: "/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg" },
          { name: "Eco Word Spell", category: "fun", description: "Build environmental vocabulary by spelling eco-themed words in a fast, fun challenge.", difficulty: "Easy", points: 75, icon: "\u{1F524}", externalUrl: "https://eco-word-spell.lovable.app/", image: "/api/image/1080p-nature-background-nfkrrkh7da3eonyn.jpg" },
          { name: "Sorting Stories", category: "recycling", description: "Sort choices in story-based scenarios to practice better waste and recycling decisions.", difficulty: "Easy", points: 80, icon: "\u{1F4DA}", externalUrl: "https://sorting-stories-game.lovable.app/", image: "/api/image/360_F_628835191_EMMgdwXxjtd3yLBUguiz5UrxaxqByvUc.jpg" },
          { name: "Eco Arrow Harmony", category: "climate", description: "Follow eco-guided arrow flows to learn sustainable pathways in an interactive challenge.", difficulty: "Medium", points: 85, icon: "\u{1F3AF}", externalUrl: "https://eco-arrow-harmony.lovable.app/", image: "/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg" },
          { name: "Eco Balance Grid", category: "habits", description: "Balance environmental choices on a grid to build smart, sustainable daily habits.", difficulty: "Medium", points: 90, icon: "\u{1F9E9}", externalUrl: "https://eco-balance-grid.lovable.app/", image: "/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg" },
          { name: "Bad Gas Hunter", category: "climate", description: "Hunt down harmful emissions and boost cleaner air through fast action.", difficulty: "Medium", points: 95, icon: "\u{1F6F0}\uFE0F", externalUrl: "https://badgashunter.netlify.app/", image: "/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg" },
          { name: "Eco Hit", category: "fun", description: "Quick reflex eco challenge: hit the right sustainability targets and rack up points.", difficulty: "Easy", points: 85, icon: "\u{1F3AF}", externalUrl: "https://eco-hit.netlify.app/", image: "/api/image/nature-319.jpg" },
          { name: "Eco Shoot", category: "wildlife", description: "Action-packed shooter experience with an environmental mission focus.", difficulty: "Hard", points: 120, icon: "\u{1F680}", externalUrl: "https://ecoshoot.netlify.app/", image: "/api/image/b1573252592009209d45a186360dea8c.jpg" },
          { name: "Matching Pairs Date", category: "fun", description: "A fast memory and matching challenge with a playful date-night style twist.", difficulty: "Easy", points: 75, icon: "\u{1F49E}", externalUrl: "https://matchingpairsdate.netlify.app/", image: "/api/image/Bhpd8.jpg" },
          { name: "Tsunami Expedition", category: "climate", description: "Explore wave and disaster awareness through a challenge built around environmental resilience.", difficulty: "Medium", points: 95, icon: "\u{1F30A}", externalUrl: "https://tsunamiexp.netlify.app/", image: "/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg" },
          { name: "Mineral Expedition", category: "wildlife", description: "Discover mineral-themed exploration in a guided adventure focused on terrain and earth science.", difficulty: "Medium", points: 90, icon: "\u26CF\uFE0F", externalUrl: "https://mineralexp.netlify.app/", image: "/api/image/pngtree-cb-background-hd-2022-download-picsart-and-snapseed-photo-editing-picture-image_15546523.jpg" },
          { name: "Environment Word Explorer", category: "fun", description: "Explore and master environmental words in a fun, educational game session.", difficulty: "Easy", points: 80, icon: "\u{1F4D6}", externalUrl: "https://evironmentwordexplorer.netlify.app/", image: "/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg" },
          { name: "AcquaMind", category: "habits", description: "Interactive water-awareness challenge focused on smarter use, conservation habits, and environmental impact.", difficulty: "Medium", points: 95, icon: "\u{1F4A7}", externalUrl: "https://acquamind.netlify.app/", image: "/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg" },
          { name: "Waste Segregation", category: "recycling", description: "Drag items into the correct bins.", difficulty: "Easy", points: 5, icon: "\u267B\uFE0F", externalUrl: "/games/" },
          { name: "Eco-Home Challenge", category: "habits", description: "Fix bad habits in a room.", difficulty: "Easy", points: 8, icon: "\u{1F3E0}", externalUrl: "/games/" },
          { name: "Recycling Factory Puzzle", category: "recycling", description: "Reorder the factory line correctly.", difficulty: "Medium", points: 20, icon: "\u{1F3ED}", externalUrl: "/games/" },
          { name: "Ocean Cleanup", category: "recycling", description: "Collect plastic, avoid fish.", difficulty: "Easy", points: 10, icon: "\u{1F6A4}", externalUrl: "/games/" }
        ];
        const adminEntry = Array.from(this.users.entries()).find(([, u]) => u.username === "admin123");
        const adminId = adminEntry?.[0] || Array.from(this.users.keys())[0];
        const now = Date.now();
        let added = false;
        base.forEach((b, i) => {
          const id = (b.name || `Game ${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
          if (!this.games.has(id)) {
            this.games.set(id, { id, ...b, createdAt: now + i, createdByUserId: adminId || "" });
            added = true;
          }
        });
        if (added) this.save();
      }
      // Seed a few sample announcements & assignments for admin and the demo teacher
      ensureDemoAnnouncementsAssignments() {
        const now = Date.now();
        const adminEntry = Array.from(this.users.entries()).find(([, u]) => u.username === "admin123");
        if (adminEntry) {
          const [aid] = adminEntry;
          const globalAnns = Array.from(this.announcements.values()).filter((a) => a.visibility === "global");
          if (globalAnns.length < 3) {
            const samples = [
              { title: "Global Eco Week Kickoff", body: "Welcome to Eco Week! Participate in events and earn points." },
              { title: "New Global Quiz Series", body: "Try the Global Climate Action quiz now." },
              { title: "Scholarships", body: "Top eco-scorers will be considered for scholarships." }
            ];
            samples.forEach((s, i) => {
              const id = randomUUID();
              const ann = { id, title: s.title, body: s.body, createdAt: now + i, createdByUserId: aid, schoolId: "", visibility: "global" };
              this.announcements.set(id, ann);
            });
            this.users.forEach((u, id) => {
              if (this.roles.get(id) === "student") this.addNotificationForUserId(id, "New global announcements available", "announcement");
            });
          }
          const globalAssignments = Array.from(this.assignments.values()).filter((a) => a.visibility === "global");
          if (globalAssignments.length < 2) {
            const samples = [
              { title: "Global Climate Report Summary", description: "Summarize the latest IPCC climate report in 1 page (PDF/DOC).", maxPoints: 10, deadline: new Date(now + 7 * 24 * 3600 * 1e3).toISOString() },
              { title: "Ocean Conservation Review", description: "Review 3 ocean protection initiatives and propose one idea.", maxPoints: 8, deadline: new Date(now + 14 * 24 * 3600 * 1e3).toISOString() }
            ];
            samples.forEach((s, i) => {
              const id = randomUUID();
              const asn = { id, title: s.title, description: s.description, deadline: s.deadline, maxPoints: s.maxPoints, createdByUserId: aid, schoolId: "", createdAt: now + i, visibility: "global" };
              this.assignments.set(id, asn);
            });
            this.users.forEach((u, id) => {
              if (this.roles.get(id) === "student") this.addNotificationForUserId(id, "New global assignments available", "task");
            });
          }
        }
        const teacherEntry = Array.from(this.users.entries()).find(([, u]) => u.username === "test_teacher");
        if (teacherEntry) {
          const [tid] = teacherEntry;
          const schoolId = this.getSchoolIdForUserId(tid) || Array.from(this.schools.values())[0]?.id;
          if (schoolId) {
            const teacherAnns = Array.from(this.announcements.values()).filter((a) => a.createdByUserId === tid);
            if (teacherAnns.length < 3) {
              const samples = [
                { title: "School Assembly on Monday", body: "Please assemble by 8:30 AM in the auditorium." },
                { title: "Science Fair Registrations Open", body: "Register your teams by Friday." },
                { title: "New Library Books Available", body: "Visit the library to check out the latest arrivals." }
              ];
              samples.forEach((s, i) => {
                const id = randomUUID();
                const ann = { id, title: s.title, body: s.body, createdAt: now + i, createdByUserId: tid, schoolId, visibility: "school" };
                this.announcements.set(id, ann);
              });
              this.notifySchool(schoolId, "New school announcements available", "announcement");
            }
            const teacherAsns = Array.from(this.assignments.values()).filter((a) => a.createdByUserId === tid);
            if (teacherAsns.length < 2) {
              const samples = [
                { title: "Essay on Renewable Energy", description: "500-700 words. Upload as PDF/DOC.", maxPoints: 10, deadline: new Date(now + 5 * 24 * 3600 * 1e3).toISOString() },
                { title: "Waste Audit Report", description: "Audit household waste for 3 days and propose reductions.", maxPoints: 8, deadline: new Date(now + 9 * 24 * 3600 * 1e3).toISOString() }
              ];
              samples.forEach((s, i) => {
                const id = randomUUID();
                const asn = { id, title: s.title, description: s.description, deadline: s.deadline, maxPoints: s.maxPoints, createdByUserId: tid, schoolId, createdAt: now + i, visibility: "school" };
                this.assignments.set(id, asn);
              });
              this.notifySchool(schoolId, "New school assignments available", "task");
            }
          }
        }
      }
      seedDefaults() {
        const mainAdminId = randomUUID();
        this.users.set(mainAdminId, { id: mainAdminId, username: "admin123", password: "admin@1234" });
        this.roles.set(mainAdminId, "admin");
        const s1 = { id: randomUUID(), name: "Green Valley High" };
        const s2 = { id: randomUUID(), name: "Riverdale Academy" };
        this.schools.set(s1.id, s1);
        this.schools.set(s2.id, s2);
        const pendingStudents = [
          { name: "Aarav Mehta", email: "aarav.mehta@example.com", username: "aarav_m", schoolId: s1.id, studentId: "STU1001", rollNumber: "12", className: "8", section: "A", password: "123@123" },
          { name: "Diya Kapoor", email: "diya.kapoor@example.com", username: "diya_k", schoolId: s2.id, studentId: "STU1002", rollNumber: "7", className: "7", section: "B", password: "123@123" },
          { name: "Rohan Gupta", email: "rohan.g@example.com", username: "rohan_g", schoolId: s1.id, studentId: "STU1003", rollNumber: "4", className: "9", section: "C", password: "123@123" }
        ];
        for (const s of pendingStudents) {
          const id = randomUUID();
          this.pendingStudents.set(id, { ...s, id });
        }
        const pendingTeachers = [
          { name: "Neha Sharma", email: "neha.sharma@example.com", username: "neha_s", schoolId: s1.id, teacherId: "TCH2001", subject: "Mathematics", password: "123@123" },
          { name: "Arjun Verma", email: "arjun.verma@example.com", username: "arjun_v", schoolId: s2.id, teacherId: "TCH2002", subject: "Science", password: "123@123" },
          { name: "Sara Khan", email: "sara.khan@example.com", username: "sara_k", schoolId: s1.id, teacherId: "TCH2003", subject: "English", password: "123@123" }
        ];
        for (const t of pendingTeachers) {
          const id = randomUUID();
          this.pendingTeachers.set(id, { ...t, id });
        }
        const approvedStudentId = randomUUID();
        this.users.set(approvedStudentId, { id: approvedStudentId, username: "test_student", password: "123@123" });
        this.roles.set(approvedStudentId, "student");
        const approvedTeacherId = randomUUID();
        this.users.set(approvedTeacherId, { id: approvedTeacherId, username: "test_teacher", password: "123@123" });
        this.roles.set(approvedTeacherId, "teacher");
        const adminIdLookup = Array.from(this.users.entries()).find(([, u]) => u.username === "admin123")?.[0];
        if (adminIdLookup && !this.profiles.get(adminIdLookup)) this.profiles.set(adminIdLookup, { role: "admin", name: "Admin" });
        if (!this.profiles.get(approvedStudentId)) this.profiles.set(approvedStudentId, { role: "student", name: "Test Student", schoolId: s1.id });
        if (!this.profiles.get(approvedTeacherId)) this.profiles.set(approvedTeacherId, { role: "teacher", name: "Test Teacher", schoolId: s1.id });
        const now = Date.now();
        const gqId = randomUUID();
        this.quizzes.set(gqId, {
          id: gqId,
          title: "Earth Basics (Global)",
          description: "General planet awareness",
          points: 3,
          createdByUserId: adminIdLookup || approvedTeacherId,
          schoolId: "",
          createdAt: now,
          visibility: "global",
          questions: [
            { id: randomUUID(), text: "Which gas is most abundant in Earth's atmosphere?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], answerIndex: 0 },
            { id: randomUUID(), text: "Approximate age of Earth?", options: ["4.5 billion years", "450 million years", "45 million years", "13.8 billion years"], answerIndex: 0 },
            { id: randomUUID(), text: "What percentage of Earth's surface is covered by water?", options: ["71%", "50%", "29%", "90%"], answerIndex: 0 }
          ]
        });
        const tqId = randomUUID();
        this.quizzes.set(tqId, {
          id: tqId,
          title: "School Science Quiz",
          description: "Test your science knowledge! (School only)",
          points: 3,
          createdByUserId: approvedTeacherId,
          schoolId: s1.id,
          createdAt: now + 1,
          visibility: "school",
          questions: [
            { id: randomUUID(), text: "What is H2O commonly known as?", options: ["Water", "Oxygen", "Hydrogen", "Salt"], answerIndex: 0 },
            { id: randomUUID(), text: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answerIndex: 0 },
            { id: randomUUID(), text: "What force keeps us on the ground?", options: ["Gravity", "Magnetism", "Friction", "Wind"], answerIndex: 0 }
          ]
        });
      }
      buildPayload() {
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
          userCredits: Array.from(this.userCredits.values())
        };
      }
      async flushSave() {
        if (this.saveInFlight) {
          this.saveRequestedWhileWriting = true;
          return;
        }
        this.saveInFlight = true;
        try {
          do {
            this.saveRequestedWhileWriting = false;
            const payload = this.buildPayload();
            await fs.promises.writeFile(this.dataFile, JSON.stringify(payload, null, 2), "utf-8");
          } while (this.saveRequestedWhileWriting);
        } catch {
        } finally {
          this.saveInFlight = false;
        }
      }
      save() {
        if (this.saveTimer) return;
        this.saveTimer = setTimeout(() => {
          this.saveTimer = null;
          void this.flushSave();
        }, 25);
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async createUser(insertUser) {
        const id = randomUUID();
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
      }
      // Schools
      async listSchools() {
        return Array.from(this.schools.values());
      }
      async addSchool(name) {
        const school = { id: randomUUID(), name };
        this.schools.set(school.id, school);
        this.save();
        return school;
      }
      async removeSchool(id) {
        const existed = this.schools.delete(id);
        if (existed) this.save();
        return existed;
      }
      // Signups
      async addStudentApplication(app2) {
        const id = randomUUID();
        const stored = { ...app2, id };
        this.pendingStudents.set(id, stored);
        this.save();
        return stored;
      }
      async addTeacherApplication(app2) {
        const id = randomUUID();
        const stored = { ...app2, id };
        this.pendingTeachers.set(id, stored);
        this.save();
        return stored;
      }
      async listPending() {
        return {
          students: Array.from(this.pendingStudents.values()),
          teachers: Array.from(this.pendingTeachers.values())
        };
      }
      async approveApplication(type, id) {
        if (type === "student") {
          const app2 = this.pendingStudents.get(id);
          if (!app2) return false;
          this.pendingStudents.delete(id);
          const userId = randomUUID();
          this.users.set(userId, { id: userId, username: app2.username, password: app2.password ?? "" });
          this.roles.set(userId, "student");
          this.profiles.set(userId, {
            name: app2.name,
            email: app2.email,
            role: "student",
            schoolId: app2.schoolId,
            studentId: app2.studentId,
            rollNumber: app2.rollNumber,
            className: app2.className,
            section: app2.section,
            photoDataUrl: app2.photoDataUrl
          });
          this.save();
          return true;
        } else {
          const app2 = this.pendingTeachers.get(id);
          if (!app2) return false;
          this.pendingTeachers.delete(id);
          const userId = randomUUID();
          this.users.set(userId, { id: userId, username: app2.username, password: app2.password ?? "" });
          this.roles.set(userId, "teacher");
          this.profiles.set(userId, {
            name: app2.name,
            email: app2.email,
            role: "teacher",
            schoolId: app2.schoolId,
            teacherId: app2.teacherId,
            subject: app2.subject,
            photoDataUrl: app2.photoDataUrl
          });
          this.save();
          return true;
        }
      }
      async isUsernameAvailable(username) {
        const inUsers = Array.from(this.users.values()).some((u) => u.username === username);
        if (inUsers) return false;
        const inPending = Array.from(this.pendingStudents.values()).some((a) => a.username === username) || Array.from(this.pendingTeachers.values()).some((a) => a.username === username);
        return !inPending;
      }
      async getApplicationStatus(username) {
        const inUsers = Array.from(this.users.values()).some((u) => u.username === username);
        if (inUsers) return "approved";
        const inPending = Array.from(this.pendingStudents.values()).some((a) => a.username === username) || Array.from(this.pendingTeachers.values()).some((a) => a.username === username);
        return inPending ? "pending" : "none";
      }
      async saveOtp(email, code, ttlMs) {
        const key = email.trim().toLowerCase();
        const sanitized = String(code).replace(/\D/g, "").slice(0, 6);
        this.otps.set(key, { code: sanitized, expires: Date.now() + ttlMs });
      }
      async verifyOtp(email, code) {
        const key = email.trim().toLowerCase();
        const sanitized = String(code).replace(/\D/g, "").slice(0, 6);
        const rec = this.otps.get(key);
        if (!rec) return false;
        const ok = rec.code === sanitized && Date.now() <= rec.expires;
        return ok;
      }
      async resetPassword(username, password) {
        const found = Array.from(this.users.values()).find((u) => u.username === username);
        if (!found) return false;
        this.users.set(found.id, { ...found, password });
        this.save();
        return true;
      }
      async unapproveUser(username) {
        const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
        if (!entry) return false;
        const [id, user] = entry;
        const role = this.roles.get(id);
        if (role !== "student" && role !== "teacher") return false;
        this.users.delete(id);
        this.roles.delete(id);
        const prof = this.profiles.get(id);
        this.profiles.delete(id);
        if (role === "student") {
          const pending = {
            id: randomUUID(),
            name: prof?.name || "",
            email: prof?.email || "",
            username,
            schoolId: prof?.schoolId || "",
            studentId: prof?.studentId || "REVIEW",
            rollNumber: prof?.rollNumber || "",
            className: prof?.className || "",
            section: prof?.section || "",
            photoDataUrl: prof?.photoDataUrl,
            password: user.password
          };
          this.pendingStudents.set(pending.id, pending);
        } else {
          const pending = {
            id: randomUUID(),
            name: prof?.name || "",
            email: prof?.email || "",
            username,
            schoolId: prof?.schoolId || "",
            teacherId: prof?.teacherId || "REVIEW",
            subject: prof?.subject || "",
            photoDataUrl: prof?.photoDataUrl,
            password: user.password
          };
          this.pendingTeachers.set(pending.id, pending);
        }
        this.save();
        return true;
      }
      async getUserDetails(username) {
        const approvedEntry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
        if (approvedEntry) {
          const [id, u] = approvedEntry;
          const role = this.roles.get(id) || "student";
          const profile = this.profiles.get(id) || {};
          return {
            status: "approved",
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
            photoDataUrl: profile.photoDataUrl
          };
        }
        const ps = Array.from(this.pendingStudents.values()).find((a) => a.username === username);
        if (ps) return { status: "pending", role: "student", ...ps };
        const pt = Array.from(this.pendingTeachers.values()).find((a) => a.username === username);
        if (pt) return { status: "pending", role: "teacher", ...pt };
        return { status: "none", username };
      }
      // ===== Profiles (self) =====
      findUserIdByUsername(username) {
        const e = Array.from(this.users.entries()).find(([, u]) => u.username === username);
        return e ? e[0] : null;
      }
      async getOwnProfile(username) {
        const uid = this.findUserIdByUsername(username);
        if (!uid) return null;
        const role = this.roles.get(uid);
        const base = this.profiles.get(uid) || {};
        const user = this.users.get(uid);
        const payload = {
          username: user.username,
          role: role || "student",
          name: base.name || "",
          email: base.email || "",
          schoolId: base.schoolId || "",
          photoDataUrl: base.photoDataUrl || "",
          studentId: base.studentId,
          rollNumber: base.rollNumber,
          className: base.className,
          section: base.section,
          teacherId: base.teacherId,
          subject: base.subject
        };
        return payload;
      }
      async updateOwnProfile(username, updates) {
        const uid = this.findUserIdByUsername(username);
        if (!uid) return { ok: false, error: "User not found" };
        const role = this.roles.get(uid);
        const current = this.profiles.get(uid) || {};
        if (typeof updates.schoolId === "string" && updates.schoolId) {
          if (!this.schools.has(updates.schoolId)) return { ok: false, error: "Invalid school" };
        }
        const next = { ...current };
        const allowed = ["name", "email", "schoolId", "photoDataUrl", "studentId", "rollNumber", "className", "section", "teacherId", "subject"];
        for (const k of allowed) {
          if (k in updates) {
            next[k] = updates[k] ?? "";
          }
        }
        next.role = role || next.role || "student";
        this.profiles.set(uid, next);
        this.save();
        const payload = await this.getOwnProfile(username);
        return { ok: true, profile: payload };
      }
      // ===== Student Profile View =====
      async getStudentProfile(username) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return null;
        const [uid, user] = entry;
        if (this.roles.get(uid) !== "student") return null;
        const p = this.profiles.get(uid) || {};
        let ecoPoints = 0;
        const timeline = [];
        this.submissions.forEach((s) => {
          if (s.studentUserId === uid && s.status === "approved") {
            ecoPoints += Number(s.points || 0);
            const task = this.tasks.get(s.taskId);
            if (task) timeline.push({ kind: "task", when: s.reviewedAt || s.submittedAt, title: task.title, photoDataUrl: s.photos && s.photos[0] || s.photoDataUrl, points: s.points });
          }
        });
        this.quizAttempts.forEach((qa) => {
          if (qa.studentUserId === uid) {
            const quiz = this.quizzes.get(qa.quizId);
            if (quiz) timeline.push({ kind: "quiz", when: qa.attemptedAt, title: quiz.title, scorePercent: qa.scorePercent, points: quiz.points });
          }
        });
        this.gamePlays.forEach((gp) => {
          if (gp.studentUserId === uid) {
            timeline.push({ kind: "game", when: gp.playedAt, title: gp.gameId, lastPlayedAt: gp.playedAt });
          }
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.studentUserId === uid) {
            ecoPoints += Number(lc.points || 0);
            timeline.push({ kind: "lesson", when: lc.completedAt, title: `${lc.moduleTitle}: ${lc.lessonTitle}`, points: lc.points, moduleId: lc.moduleId, lessonId: lc.lessonId });
          }
        });
        timeline.sort((a, b) => (b.when || 0) - (a.when || 0));
        const ecoTreeStage = ecoPoints >= 500 ? "Big Tree" : ecoPoints >= 100 ? "Small Tree" : "Seedling";
        const achievements = [
          { key: "first_task", name: "First Task Completed", unlocked: ecoPoints > 0 },
          { key: "top10_school", name: "Top 10 in School", unlocked: false },
          { key: "quiz_master", name: "Quiz Master", unlocked: false }
        ];
        const schoolId = p.schoolId;
        const studentScores = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            let score = 0;
            this.submissions.forEach((s) => {
              if (s.studentUserId === id && s.status === "approved") score += Number(s.points || 0);
            });
            this.quizAttempts.forEach((a) => {
              if (a.studentUserId === id) {
                const q = this.quizzes.get(a.quizId);
                if (q) score += Number(q.points || 0);
              }
            });
            this.lessonCompletions.forEach((lc) => {
              if (lc.studentUserId === id) score += Number(lc.points || 0);
            });
            const prof = this.profiles.get(id) || {};
            studentScores.push({ uid: id, username: u.username, eco: score, schoolId: prof.schoolId });
          }
        });
        studentScores.sort((a, b) => b.eco - a.eco);
        const globalRank = studentScores.findIndex((s) => s.uid === uid) + 1 || null;
        const schoolList = studentScores.filter((s) => s.schoolId === schoolId);
        const schoolRank = schoolList.findIndex((s) => s.uid === uid) + 1 || null;
        const achIdx = achievements.findIndex((a) => a.key === "top10_school");
        if (achIdx >= 0) achievements[achIdx] = { ...achievements[achIdx], unlocked: schoolRank != null && schoolRank > 0 && schoolRank <= 10 };
        const allowExternalView = !!p.allowExternalView;
        const week = this.computeWeeklyStreak(uid);
        const schoolScores = studentScores.filter((s) => s.schoolId === schoolId);
        const myIdx = schoolScores.findIndex((s) => s.uid === uid);
        const nextAhead = myIdx > 0 ? schoolScores[myIdx - 1] : void 0;
        const leaderboardNext = nextAhead ? { username: nextAhead.username, points: nextAhead.eco } : null;
        const completion = this.computeProfileCompletion(p);
        const unreadNotifications = this.countUnread(uid);
        return {
          username: user.username,
          name: p.name || "",
          schoolId: p.schoolId || "",
          ecoPoints,
          ecoTreeStage,
          achievements,
          timeline,
          ranks: { global: globalRank || null, school: schoolRank || null },
          allowExternalView,
          week,
          leaderboardNext,
          profileCompletion: completion,
          unreadNotifications
        };
      }
      // ===== Leaderboard helpers =====
      async getGlobalSchoolsLeaderboard(limit = 25) {
        const perSchool = /* @__PURE__ */ new Map();
        const studentEco = /* @__PURE__ */ new Map();
        const addStudentEco = (studentUserId, points) => {
          if (this.roles.get(studentUserId) !== "student") return;
          studentEco.set(studentUserId, (studentEco.get(studentUserId) || 0) + Number(points || 0));
        };
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            const prof = this.profiles.get(id) || {};
            const sid = prof.schoolId || "";
            if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
            perSchool.get(sid).students += 1;
          }
        });
        this.submissions.forEach((s) => {
          if (s.status === "approved") {
            const sid = (this.profiles.get(s.studentUserId) || {}).schoolId || "";
            if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
            const points = Number(s.points || 0);
            perSchool.get(sid).eco += points;
            addStudentEco(s.studentUserId, points);
          }
        });
        this.quizAttempts.forEach((a) => {
          const sid = (this.profiles.get(a.studentUserId) || {}).schoolId || "";
          const quiz = this.quizzes.get(a.quizId);
          if (!quiz) return;
          if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
          const points = Number(quiz.points || 0);
          perSchool.get(sid).eco += points;
          addStudentEco(a.studentUserId, points);
        });
        this.lessonCompletions.forEach((lc) => {
          const sid = (this.profiles.get(lc.studentUserId) || {}).schoolId || "";
          if (!perSchool.has(sid)) perSchool.set(sid, { eco: 0, students: 0 });
          const points = Number(lc.points || 0);
          perSchool.get(sid).eco += points;
          addStudentEco(lc.studentUserId, points);
        });
        const schools2 = Array.from(this.schools.values());
        const rows = Array.from(perSchool.entries()).map(([schoolId, v]) => {
          let topStudent;
          this.users.forEach((u, id) => {
            if (this.roles.get(id) !== "student") return;
            const p = this.profiles.get(id) || {};
            if ((p.schoolId || "") !== schoolId) return;
            const eco = studentEco.get(id) || 0;
            if (!topStudent || eco > topStudent.ecoPoints) {
              topStudent = { username: u.username, name: p.name, ecoPoints: eco };
            }
          });
          return {
            schoolId,
            schoolName: schools2.find((s) => s.id === schoolId)?.name || (schoolId || "Unknown School"),
            ecoPoints: v.eco,
            students: v.students,
            topStudent
          };
        });
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        return rows.slice(0, Math.max(1, Math.min(500, limit | 0)));
      }
      async getSchoolStudentsLeaderboard(schoolId, limit = 50, offset = 0) {
        const rows = [];
        const ids = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            const p = this.profiles.get(id) || {};
            if ((p.schoolId || "") === schoolId) ids.push(id);
          }
        });
        for (const id of ids) {
          let eco = 0;
          this.submissions.forEach((s) => {
            if (s.studentUserId === id && s.status === "approved") eco += Number(s.points || 0);
          });
          this.quizAttempts.forEach((a) => {
            if (a.studentUserId === id) {
              const q = this.quizzes.get(a.quizId);
              if (q) eco += Number(q.points || 0);
            }
          });
          this.lessonCompletions.forEach((lc) => {
            if (lc.studentUserId === id) eco += Number(lc.points || 0);
          });
          const u = this.users.get(id);
          const p = this.profiles.get(id) || {};
          rows.push({ username: u.username, name: p.name, ecoPoints: eco });
        }
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(200, limit | 0)));
        return rows.slice(start, end);
      }
      async getStudentPreview(targetUsername) {
        const entry = this.findUserEntryByUsername(targetUsername);
        if (!entry) return null;
        const [id, u] = entry;
        if (this.roles.get(id) !== "student") return null;
        let eco = 0;
        this.submissions.forEach((s) => {
          if (s.studentUserId === id && s.status === "approved") eco += Number(s.points || 0);
        });
        this.quizAttempts.forEach((a) => {
          if (a.studentUserId === id) {
            const q = this.quizzes.get(a.quizId);
            if (q) eco += Number(q.points || 0);
          }
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.studentUserId === id) eco += Number(lc.points || 0);
        });
        const p = this.profiles.get(id) || {};
        return { username: u.username, name: p.name, ecoPoints: eco, schoolId: p.schoolId };
      }
      getSchoolNameFromProfileSchoolId(rawSchoolId) {
        const value = String(rawSchoolId || "").trim();
        if (!value) return void 0;
        const byId = this.schools.get(value);
        if (byId?.name) return byId.name;
        const normalized = value.toLowerCase();
        const byName = Array.from(this.schools.values()).find((s) => s.name.trim().toLowerCase() === normalized);
        if (byName?.name) return byName.name;
        return value;
      }
      async getGlobalStudentsLeaderboard(limit = 50, offset = 0, schoolIdFilter = null) {
        const rows = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            const p = this.profiles.get(id) || {};
            if (schoolIdFilter && p.schoolId !== schoolIdFilter) return;
            let eco = 0;
            let tasksApproved = 0;
            let quizzesCompleted = 0;
            this.submissions.forEach((s) => {
              if (s.studentUserId === id && s.status === "approved") {
                eco += Number(s.points || 0);
                tasksApproved++;
              }
            });
            this.quizAttempts.forEach((a) => {
              if (a.studentUserId === id) {
                const q = this.quizzes.get(a.quizId);
                if (q) {
                  eco += Number(q.points || 0);
                  quizzesCompleted++;
                }
              }
            });
            this.lessonCompletions.forEach((lc) => {
              if (lc.studentUserId === id) eco += Number(lc.points || 0);
            });
            const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
            const achievements = [];
            if (tasksApproved > 0) achievements.push("\u{1F947} First Task");
            if (quizzesCompleted >= 3) achievements.push("\u{1F9E0} Quiz Master");
            if (eco >= 100) achievements.push("\u{1F332} Small Tree");
            if (eco >= 500) achievements.push("\u{1F333} Big Tree");
            rows.push({ username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, achievements, snapshot: { tasksApproved, quizzesCompleted } });
          }
        });
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
        return rows.slice(start, end);
      }
      async getGlobalTeachersLeaderboard(limit = 50, offset = 0, schoolIdFilter = null) {
        const teacherIds = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "teacher") teacherIds.push(id);
        });
        const rows = [];
        for (const tid of teacherIds) {
          const p = this.profiles.get(tid) || {};
          if (schoolIdFilter && p.schoolId !== schoolIdFilter) continue;
          const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter((t) => t.createdByUserId === tid).map((t) => t.id));
          const tasksCreated = ownedTaskIds.size;
          let eco = 0;
          this.submissions.forEach((s) => {
            if (ownedTaskIds.has(s.taskId) && s.status === "approved") eco += Number(s.points || 0);
          });
          const ownedQuizIds = new Set(Array.from(this.quizzes.values()).filter((q) => q.createdByUserId === tid && q.visibility === "school").map((q) => q.id));
          const quizzesCreated = ownedQuizIds.size;
          this.quizAttempts.forEach((a) => {
            if (ownedQuizIds.has(a.quizId)) {
              const q = this.quizzes.get(a.quizId);
              if (q) eco += Number(q.points || 0);
            }
          });
          const u = this.users.get(tid);
          const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
          rows.push({ username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, tasksCreated, quizzesCreated });
        }
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
        return rows.slice(start, end);
      }
      async getSchoolPreview(schoolId) {
        const s = this.schools.get(schoolId);
        if (!s) return null;
        const rows = await this.getSchoolStudentsLeaderboard(schoolId, 1e3, 0);
        const top = rows[0];
        const eco = rows.reduce((acc, r) => acc + Number(r.ecoPoints || 0), 0);
        const students = rows.length;
        return { schoolId, schoolName: s.name, ecoPoints: eco, students, topStudent: top ? { username: top.username, name: top.name, ecoPoints: top.ecoPoints } : void 0 };
      }
      async getTeacherPreview(targetUsername) {
        const entry = this.findUserEntryByUsername(targetUsername);
        if (!entry) return null;
        const [id, u] = entry;
        if (this.roles.get(id) !== "teacher") return null;
        const p = this.profiles.get(id) || {};
        const schoolName = this.getSchoolNameFromProfileSchoolId(p.schoolId);
        const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter((t) => t.createdByUserId === id).map((t) => t.id));
        const tasksCreated = ownedTaskIds.size;
        let eco = 0;
        this.submissions.forEach((s) => {
          if (ownedTaskIds.has(s.taskId) && s.status === "approved") eco += Number(s.points || 0);
        });
        const ownedQuizIds = new Set(Array.from(this.quizzes.values()).filter((q) => q.createdByUserId === id && q.visibility === "school").map((q) => q.id));
        const quizzesCreated = ownedQuizIds.size;
        this.quizAttempts.forEach((a) => {
          if (ownedQuizIds.has(a.quizId)) {
            const q = this.quizzes.get(a.quizId);
            if (q) eco += Number(q.points || 0);
          }
        });
        return { username: u.username, name: p.name, schoolId: p.schoolId, schoolName, ecoPoints: eco, tasksCreated, quizzesCreated };
      }
      async getAdminLeaderboardAnalytics() {
        const now = /* @__PURE__ */ new Date();
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - diffToMonday);
        const startMs = monday.getTime();
        const activeSchoolIds = /* @__PURE__ */ new Set();
        let totalEcoPointsThisWeek = 0;
        this.submissions.forEach((s) => {
          if (s.status === "approved" && (s.reviewedAt || s.submittedAt) >= startMs) {
            const sid = (this.profiles.get(s.studentUserId) || {}).schoolId;
            if (sid) activeSchoolIds.add(sid);
            totalEcoPointsThisWeek += Number(s.points || 0);
          }
        });
        this.quizAttempts.forEach((a) => {
          if (a.attemptedAt >= startMs) {
            const sid = (this.profiles.get(a.studentUserId) || {}).schoolId;
            if (sid) activeSchoolIds.add(sid);
            const q = this.quizzes.get(a.quizId);
            if (q) totalEcoPointsThisWeek += Number(q.points || 0);
          }
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.completedAt >= startMs) {
            const sid = (this.profiles.get(lc.studentUserId) || {}).schoolId;
            if (sid) activeSchoolIds.add(sid);
            totalEcoPointsThisWeek += Number(lc.points || 0);
          }
        });
        let newStudentsThisWeek = 0;
        const seenBefore = /* @__PURE__ */ new Set();
        this.submissions.forEach((s) => {
          if (s.status === "approved" && (s.reviewedAt || s.submittedAt) < startMs) seenBefore.add(s.studentUserId);
        });
        this.quizAttempts.forEach((a) => {
          if (a.attemptedAt < startMs) seenBefore.add(a.studentUserId);
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.completedAt < startMs) seenBefore.add(lc.studentUserId);
        });
        const activeThisWeek = /* @__PURE__ */ new Set();
        this.submissions.forEach((s) => {
          if (s.status === "approved" && (s.reviewedAt || s.submittedAt) >= startMs) activeThisWeek.add(s.studentUserId);
        });
        this.quizAttempts.forEach((a) => {
          if (a.attemptedAt >= startMs) activeThisWeek.add(a.studentUserId);
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.completedAt >= startMs) activeThisWeek.add(lc.studentUserId);
        });
        activeThisWeek.forEach((id) => {
          if (!seenBefore.has(id)) newStudentsThisWeek++;
        });
        const inactiveSchools = [];
        this.schools.forEach((s) => {
          if (!activeSchoolIds.has(s.id)) inactiveSchools.push({ schoolId: s.id, schoolName: s.name });
        });
        return { activeSchoolsThisWeek: activeSchoolIds.size, newStudentsThisWeek, totalEcoPointsThisWeek, inactiveSchools };
      }
      computeWeeklyStreak(uid) {
        const now = /* @__PURE__ */ new Date();
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - diffToMonday);
        const days = new Array(7).fill(false);
        const mark = (ts) => {
          const d = new Date(ts);
          if (d < monday) return;
          const idx = Math.min(6, Math.floor((d.getTime() - monday.getTime()) / (24 * 3600 * 1e3)));
          if (idx >= 0 && idx < 7) days[idx] = true;
        };
        this.submissions.forEach((s) => {
          if (s.studentUserId === uid) mark(s.submittedAt);
        });
        this.quizAttempts.forEach((a) => {
          if (a.studentUserId === uid) mark(a.attemptedAt);
        });
        this.gamePlays.forEach((g) => {
          if (g.studentUserId === uid) mark(g.playedAt);
        });
        this.lessonCompletions.forEach((lc) => {
          if (lc.studentUserId === uid) mark(lc.completedAt);
        });
        return { days, start: monday.getTime() };
      }
      computeProfileCompletion(p) {
        const fields = ["name", "email", "schoolId", "photoDataUrl", "className", "section", "studentId"];
        const have = fields.reduce((acc, f) => acc + (p && p[f] ? 1 : 0), 0);
        return Math.round(have / fields.length * 100);
      }
      countUnread(uid) {
        let n = 0;
        this.notifications.forEach((x) => {
          if (x.userId === uid && !x.readAt) n++;
        });
        return n;
      }
      async setStudentPrivacy(username, allowExternalView) {
        const id = this.findUserIdByUsername(username);
        if (!id) return { ok: false, error: "User not found" };
        if (this.roles.get(id) !== "student") return { ok: false, error: "Not a student" };
        const p = this.profiles.get(id) || {};
        this.profiles.set(id, { ...p, allowExternalView: !!allowExternalView });
        this.save();
        return { ok: true };
      }
      async listLessonCompletions(studentUsername) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return [];
        const [id] = entry;
        if (this.roles.get(id) !== "student") return [];
        return Array.from(this.lessonCompletions.values()).filter((lc) => lc.studentUserId === id);
      }
      async completeLesson(studentUsername, input) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [id] = entry;
        if (this.roles.get(id) !== "student") return { ok: false, error: "Not a student" };
        const moduleId = String(input.moduleId || "").trim();
        const lessonId = String(input.lessonId || "").trim();
        const moduleTitle = String(input.moduleTitle || "").trim();
        const lessonTitle = String(input.lessonTitle || "").trim();
        const points = Number(input.points || 0);
        if (!moduleId || !lessonId || !moduleTitle || !lessonTitle) return { ok: false, error: "Missing lesson details" };
        if (!Number.isFinite(points) || points <= 0) return { ok: false, error: "Invalid points" };
        const existing = Array.from(this.lessonCompletions.values()).find((lc) => lc.studentUserId === id && lc.moduleId === moduleId && lc.lessonId === lessonId);
        if (existing) return { ok: true, completion: existing, alreadyCompleted: true };
        const completion = {
          id: randomUUID(),
          studentUserId: id,
          moduleId,
          moduleTitle,
          lessonId,
          lessonTitle,
          points: Math.floor(points),
          completedAt: Date.now()
        };
        this.lessonCompletions.set(completion.id, completion);
        this.save();
        return { ok: true, completion, alreadyCompleted: false };
      }
      async listLearningModules() {
        return Array.from(this.learningModules.values()).sort((a, b) => a.createdAt - b.createdAt).map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l })) }));
      }
      async listManagedLearningModules(managerUsername) {
        const entry = this.findUserEntryByUsername(managerUsername);
        if (!entry) return [];
        const [uid] = entry;
        const role = this.roles.get(uid);
        if (role !== "admin" && role !== "teacher") return [];
        return await this.listLearningModules();
      }
      async upsertManagedLearningModule(managerUsername, input) {
        const entry = this.findUserEntryByUsername(managerUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [uid] = entry;
        const role = this.roles.get(uid);
        if (role !== "admin" && role !== "teacher") return { ok: false, error: "Not allowed" };
        const title = String(input?.title || "").trim();
        if (!title) return { ok: false, error: "Module title is required" };
        const nextId = (String(input?.id || "").trim() || title.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!nextId) return { ok: false, error: "Invalid module id" };
        const rawLessons = Array.isArray(input?.lessons) ? input.lessons : [];
        if (rawLessons.length === 0) return { ok: false, error: "At least one lesson is required" };
        const lessons = [];
        const seenLessonIds = /* @__PURE__ */ new Set();
        for (let i = 0; i < rawLessons.length; i++) {
          const raw = rawLessons[i] || {};
          const lessonTitle = String(raw.title || "").trim();
          if (!lessonTitle) return { ok: false, error: `Lesson ${i + 1} title is required` };
          const lessonId = (String(raw.id || "").trim() || lessonTitle.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          if (!lessonId) return { ok: false, error: `Lesson ${i + 1} id is invalid` };
          if (seenLessonIds.has(lessonId)) return { ok: false, error: `Duplicate lesson id: ${lessonId}` };
          seenLessonIds.add(lessonId);
          let points = Math.floor(Number(raw.points));
          if (!Number.isFinite(points) || points < 1) points = 1;
          if (points > 500) points = 500;
          lessons.push({
            id: lessonId,
            title: lessonTitle,
            duration: String(raw.duration || "").trim() || "10 minutes",
            points,
            content: String(raw.content || "").trim() || `<h2>${lessonTitle}</h2><p>Lesson content coming soon.</p>`
          });
        }
        const existing = this.learningModules.get(nextId);
        const module = {
          id: nextId,
          title,
          description: String(input?.description || "").trim(),
          lessons,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
          createdByUserId: existing?.createdByUserId || uid,
          updatedByUserId: uid,
          deleted: false
        };
        this.learningModules.set(module.id, module);
        this.save();
        return { ok: true, module };
      }
      async deleteManagedLearningModule(managerUsername, moduleId) {
        const entry = this.findUserEntryByUsername(managerUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [uid] = entry;
        const role = this.roles.get(uid);
        if (role !== "admin" && role !== "teacher") return { ok: false, error: "Not allowed" };
        const id = String(moduleId || "").trim();
        if (!id) return { ok: false, error: "Module id is required" };
        const existing = this.learningModules.get(id);
        const tombstone = {
          id,
          title: existing?.title || id,
          description: existing?.description || "",
          lessons: existing?.lessons || [],
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
          createdByUserId: existing?.createdByUserId || uid,
          updatedByUserId: uid,
          deleted: true
        };
        this.learningModules.set(id, tombstone);
        this.save();
        return { ok: true };
      }
      // Admin accounts
      async listAdmins() {
        const list = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "admin") {
            const p = this.profiles.get(id) || {};
            list.push({ username: u.username, name: p.name, email: p.email });
          }
        });
        return list;
      }
      async createAdmin(input) {
        const uname = input.username?.trim();
        if (!uname || !input.password) return { ok: false, error: "Missing fields" };
        const available = await this.isUsernameAvailable(uname);
        if (!available) return { ok: false, error: "Username taken" };
        const id = randomUUID();
        this.users.set(id, { id, username: uname, password: input.password });
        this.roles.set(id, "admin");
        this.profiles.set(id, { name: input.name || "", email: input.email || "", role: "admin" });
        this.save();
        return { ok: true };
      }
      async updateAdmin(username, updates, currentUsername) {
        if (username === "admin123" && currentUsername !== "admin123") return { ok: false, error: "Only main admin can edit main admin" };
        const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
        if (!entry) return { ok: false, error: "Not found" };
        const [id, user] = entry;
        if (this.roles.get(id) !== "admin") return { ok: false, error: "Not an admin" };
        if (updates.username && updates.username.trim() !== username) {
          if (username === "admin123") return { ok: false, error: "Main admin username cannot change" };
          const newU = updates.username.trim();
          const available = await this.isUsernameAvailable(newU);
          if (!available) return { ok: false, error: "Username taken" };
          this.users.set(id, { ...user, username: newU });
        }
        const prof = this.profiles.get(id) || {};
        this.profiles.set(id, { ...prof, name: updates.name ?? prof.name, email: updates.email ?? prof.email, role: "admin" });
        this.save();
        return { ok: true };
      }
      async deleteAdmin(username) {
        if (username === "admin123") return { ok: false, error: "Cannot delete main admin" };
        const entry = Array.from(this.users.entries()).find(([, u]) => u.username === username);
        if (!entry) return { ok: false, error: "Not found" };
        const [id] = entry;
        if (this.roles.get(id) !== "admin") return { ok: false, error: "Not an admin" };
        this.users.delete(id);
        this.roles.delete(id);
        this.profiles.delete(id);
        this.save();
        return { ok: true };
      }
      // ===== Tasks & Submissions =====
      findUserEntryByUsername(username) {
        return Array.from(this.users.entries()).find(([, u]) => u.username === username);
      }
      getSchoolIdForUserId(userId) {
        const profile = this.profiles.get(userId);
        return profile?.schoolId;
      }
      async createTask(teacherUsername, input) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid, user] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const schoolId = this.getSchoolIdForUserId(tid);
        if (!schoolId) return { ok: false, error: "Teacher not linked to a school" };
        if (!input?.title || !String(input.title).trim()) return { ok: false, error: "Title required" };
        let maxPoints = Number(input.maxPoints);
        if (!Number.isFinite(maxPoints)) return { ok: false, error: "Invalid max points" };
        maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
        const groupMode = input.groupMode === "group" ? "group" : "solo";
        let maxGroupSize = void 0;
        if (groupMode === "group") {
          const m = Number(input.maxGroupSize ?? 4);
          if (!Number.isFinite(m) || m < 2) return { ok: false, error: "Invalid max group size" };
          maxGroupSize = Math.min(10, Math.max(2, Math.floor(m)));
        }
        const task = {
          id: randomUUID(),
          title: String(input.title).trim(),
          description: input.description ? String(input.description) : "",
          deadline: input.deadline,
          proofType: input.proofType ?? "photo",
          maxPoints,
          createdByUserId: tid,
          schoolId,
          createdAt: Date.now(),
          groupMode,
          maxGroupSize
        };
        this.tasks.set(task.id, task);
        this.save();
        return { ok: true, task };
      }
      async listTeacherTasks(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        return Array.from(this.tasks.values()).filter((t) => t.createdByUserId === tid);
      }
      async listStudentTasks(studentUsername) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return [];
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return [];
        const schoolId = this.getSchoolIdForUserId(sid);
        if (!schoolId) return [];
        const tasks2 = Array.from(this.tasks.values()).filter((t) => t.schoolId === schoolId);
        const items = tasks2.map((t) => {
          let submission;
          if (t.groupMode === "group") {
            const group = this.findGroupForStudent(t.id, sid);
            if (group) submission = Array.from(this.submissions.values()).find((s) => s.taskId === t.id && s.groupId === group.id);
          } else {
            submission = Array.from(this.submissions.values()).find((s) => s.taskId === t.id && s.studentUserId === sid);
          }
          return { task: t, submission };
        });
        return items;
      }
      async submitTask(studentUsername, taskId, photoDataUrlOrList) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "Student not found" };
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return { ok: false, error: "Not a student" };
        const task = this.tasks.get(taskId);
        if (!task) return { ok: false, error: "Task not found" };
        const schoolId = this.getSchoolIdForUserId(sid);
        if (!schoolId || schoolId !== task.schoolId) return { ok: false, error: "Task not available for this student" };
        const photosList = Array.isArray(photoDataUrlOrList) ? photoDataUrlOrList.filter((p) => typeof p === "string" && p.startsWith("data:")).map(String) : typeof photoDataUrlOrList === "string" ? [photoDataUrlOrList] : [];
        if (!photosList.length) return { ok: false, error: "Photo(s) required" };
        let existing;
        let group;
        if (task.groupMode === "group") {
          group = this.findGroupForStudent(taskId, sid);
          if (!group) return { ok: false, error: "Create or join a group first" };
          existing = Array.from(this.submissions.values()).find((s) => s.taskId === taskId && s.groupId === group.id);
        } else {
          existing = Array.from(this.submissions.values()).find((s) => s.taskId === taskId && s.studentUserId === sid);
        }
        if (existing && existing.status === "approved") return { ok: false, error: "Already approved; cannot resubmit" };
        const now = Date.now();
        let submission;
        if (existing) {
          const merged = Array.from(/* @__PURE__ */ new Set([...existing.photos || (existing.photoDataUrl ? [existing.photoDataUrl] : []), ...photosList]));
          submission = { ...existing, photoDataUrl: void 0, photos: merged, status: "submitted", points: void 0, reviewedAt: void 0, reviewedByUserId: void 0, feedback: void 0, submittedAt: now };
          this.submissions.set(existing.id, submission);
        } else {
          submission = {
            id: randomUUID(),
            taskId,
            studentUserId: sid,
            photoDataUrl: void 0,
            photos: photosList,
            status: "submitted",
            submittedAt: now,
            groupId: group?.id
          };
          this.submissions.set(submission.id, submission);
        }
        this.save();
        return { ok: true, submission };
      }
      async listSubmissionsForTeacher(teacherUsername, taskId) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter((t) => t.createdByUserId === tid).map((t) => t.id));
        const results = [];
        this.submissions.forEach((s) => {
          const inScope = taskId ? s.taskId === taskId : ownedTaskIds.has(s.taskId);
          if (!inScope) return;
          const user = this.users.get(s.studentUserId);
          const prof = this.profiles.get(s.studentUserId) || {};
          const task = this.tasks.get(s.taskId);
          let groupMembers = void 0;
          if (s.groupId) {
            const g = this.groups.get(s.groupId);
            if (g) groupMembers = g.memberUserIds.map((uid) => this.users.get(uid)?.username || "student");
          }
          results.push({
            ...s,
            studentUsername: user?.username || "student",
            studentName: prof.name,
            className: prof.className,
            section: prof.section,
            groupMembers,
            taskMaxPoints: task?.maxPoints
          });
        });
        return results.sort((a, b) => b.submittedAt - a.submittedAt);
      }
      async reviewSubmission(teacherUsername, submissionId, decision) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const submission = this.submissions.get(submissionId);
        if (!submission) return { ok: false, error: "Submission not found" };
        const task = this.tasks.get(submission.taskId);
        if (!task || task.createdByUserId !== tid) return { ok: false, error: "Not allowed" };
        const status = decision.status;
        if (status === "approved") {
          const pts = Number(decision.points ?? 0);
          if (!Number.isFinite(pts) || pts < 0 || pts > task.maxPoints) return { ok: false, error: "Invalid points" };
          const prevApproved = Array.from(this.submissions.values()).some((s) => s.studentUserId === submission.studentUserId && s.status === "approved");
          this.submissions.set(submissionId, { ...submission, status: "approved", points: pts, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
          if (!prevApproved) {
            this.addNotificationForUserId(submission.studentUserId, "You unlocked a new badge! First Task Completed", "badge");
          }
        } else {
          this.submissions.set(submissionId, { ...submission, status: "rejected", points: 0, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
        }
        this.save();
        return { ok: true };
      }
      // ===== Groups =====
      findGroupForStudent(taskId, studentUserId) {
        for (const g of this.groups.values()) {
          if (g.taskId === taskId && g.memberUserIds.includes(studentUserId)) return g;
        }
        return void 0;
      }
      async createTaskGroup(studentUsername, taskId, members) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "Student not found" };
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return { ok: false, error: "Not a student" };
        const task = this.tasks.get(taskId);
        if (!task) return { ok: false, error: "Task not found" };
        if (task.groupMode !== "group") return { ok: false, error: "This task does not accept groups" };
        const schoolId = this.getSchoolIdForUserId(sid);
        if (!schoolId || schoolId !== task.schoolId) return { ok: false, error: "Task not available for this student" };
        const usernames = Array.from(new Set((members || []).map((u) => String(u).trim()).filter(Boolean)));
        if (!usernames.includes(this.users.get(sid).username)) usernames.push(this.users.get(sid).username);
        const memberIds = [];
        for (const uname of usernames) {
          const e = this.findUserEntryByUsername(uname);
          if (!e) return { ok: false, error: `User @${uname} not found` };
          const [uid, u] = e;
          if (this.roles.get(uid) !== "student") return { ok: false, error: `@${uname} is not a student` };
          const uSchool = this.getSchoolIdForUserId(uid);
          if (!uSchool || uSchool !== schoolId) return { ok: false, error: `@${uname} not in your school` };
          const existing = this.findGroupForStudent(taskId, uid);
          if (existing) return { ok: false, error: `@${uname} already in another group` };
          memberIds.push(uid);
        }
        if (!task.maxGroupSize) return { ok: false, error: "Task missing group size" };
        if (memberIds.length < 2) return { ok: false, error: "At least 2 members required" };
        if (memberIds.length > task.maxGroupSize) return { ok: false, error: `Max ${task.maxGroupSize} members` };
        const group = { id: randomUUID(), taskId, memberUserIds: memberIds, createdAt: Date.now() };
        this.groups.set(group.id, group);
        this.save();
        return { ok: true, group: { ...group, memberUsernames: memberIds.map((id) => this.users.get(id).username) } };
      }
      async getTaskGroupForStudent(studentUsername, taskId) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return null;
        const [sid] = entry;
        const group = this.findGroupForStudent(taskId, sid);
        if (!group) return null;
        return { ...group, memberUsernames: group.memberUserIds.map((id) => this.users.get(id).username) };
      }
      // ===== Announcements =====
      async createAnnouncement(teacherUsername, input) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const schoolId = this.getSchoolIdForUserId(tid);
        if (!schoolId) return { ok: false, error: "Teacher not linked to a school" };
        if (!input?.title || !String(input.title).trim()) return { ok: false, error: "Title required" };
        const ann = { id: randomUUID(), title: String(input.title).trim(), body: input.body ? String(input.body) : "", createdAt: Date.now(), createdByUserId: tid, schoolId, visibility: "school" };
        this.announcements.set(ann.id, ann);
        this.notifySchool(schoolId, `New announcement: ${ann.title}`, "announcement");
        this.save();
        return { ok: true, announcement: ann };
      }
      async listAnnouncementsForTeacher(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        return Array.from(this.announcements.values()).filter((a) => a.createdByUserId === tid).sort((a, b) => b.createdAt - a.createdAt);
      }
      // Admin: Global announcements
      async createAdminAnnouncement(adminUsername, input) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        if (!input?.title || !String(input.title).trim()) return { ok: false, error: "Title required" };
        const ann = { id: randomUUID(), title: String(input.title).trim(), body: input.body ? String(input.body) : "", createdAt: Date.now(), createdByUserId: aid, schoolId: "", visibility: "global" };
        this.announcements.set(ann.id, ann);
        this.save();
        setTimeout(() => {
          this.users.forEach((u, id) => {
            if (this.roles.get(id) === "student") this.addNotificationForUserId(id, `Global announcement: ${ann.title}`, "announcement");
          });
        }, 0);
        return { ok: true, announcement: ann };
      }
      async listAdminAnnouncements(adminUsername) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return [];
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return [];
        return Array.from(this.announcements.values()).filter((a) => a.visibility === "global").sort((a, b) => b.createdAt - a.createdAt);
      }
      async updateAdminAnnouncement(adminUsername, announcementId, updates) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const ann = this.announcements.get(announcementId);
        if (!ann) return { ok: false, error: "Announcement not found" };
        if (ann.visibility !== "global") return { ok: false, error: "Only global announcements can be edited here" };
        const title = updates.title !== void 0 ? String(updates.title).trim() : ann.title;
        if (!title) return { ok: false, error: "Title required" };
        const body = updates.body !== void 0 ? String(updates.body) : ann.body || "";
        const updated = { ...ann, title, body };
        this.announcements.set(announcementId, updated);
        this.save();
        return { ok: true, announcement: updated };
      }
      async deleteAdminAnnouncement(adminUsername, announcementId) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const ann = this.announcements.get(announcementId);
        if (!ann) return { ok: false, error: "Announcement not found" };
        if (ann.visibility !== "global") return { ok: false, error: "Only global announcements can be deleted here" };
        this.announcements.delete(announcementId);
        this.save();
        return { ok: true };
      }
      async listStudentAnnouncements(studentUsername) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return [];
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return [];
        const schoolId = this.getSchoolIdForUserId(sid);
        return Array.from(this.announcements.values()).filter((a) => a.visibility === "global" || !!schoolId && a.schoolId === schoolId).sort((a, b) => b.createdAt - a.createdAt);
      }
      // ===== Assignments (simple, create/list) =====
      async createAssignment(teacherUsername, input) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const schoolId = this.getSchoolIdForUserId(tid);
        if (!schoolId) return { ok: false, error: "Teacher not linked to a school" };
        if (!input?.title || !String(input.title).trim()) return { ok: false, error: "Title required" };
        let maxPoints = Number(input.maxPoints ?? 10);
        if (!Number.isFinite(maxPoints)) maxPoints = 10;
        maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
        const asn = { id: randomUUID(), title: String(input.title).trim(), description: input.description || "", deadline: input.deadline, maxPoints, createdByUserId: tid, schoolId, createdAt: Date.now(), visibility: "school" };
        this.assignments.set(asn.id, asn);
        this.notifySchool(schoolId, `New assignment: ${asn.title}`, "task");
        this.save();
        return { ok: true, assignment: asn };
      }
      async listTeacherAssignments(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        return Array.from(this.assignments.values()).filter((a) => a.createdByUserId === tid).sort((a, b) => b.createdAt - a.createdAt);
      }
      // Admin: Global assignments
      async createAdminAssignment(adminUsername, input) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        if (!input?.title || !String(input.title).trim()) return { ok: false, error: "Title required" };
        let maxPoints = Number(input.maxPoints ?? 10);
        if (!Number.isFinite(maxPoints)) maxPoints = 10;
        maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
        const asn = { id: randomUUID(), title: String(input.title).trim(), description: input.description || "", deadline: input.deadline, maxPoints, createdByUserId: aid, schoolId: "", createdAt: Date.now(), visibility: "global" };
        this.assignments.set(asn.id, asn);
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") this.addNotificationForUserId(id, `Global assignment: ${asn.title}`, "task");
        });
        this.save();
        return { ok: true, assignment: asn };
      }
      async listAdminAssignments(adminUsername) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return [];
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return [];
        return Array.from(this.assignments.values()).filter((a) => a.visibility === "global").sort((a, b) => b.createdAt - a.createdAt);
      }
      async updateAdminAssignment(adminUsername, assignmentId, updates) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const asn = this.assignments.get(assignmentId);
        if (!asn) return { ok: false, error: "Assignment not found" };
        if (asn.visibility !== "global") return { ok: false, error: "Only global assignments can be edited here" };
        const title = updates.title !== void 0 ? String(updates.title).trim() : asn.title;
        if (!title) return { ok: false, error: "Title required" };
        let maxPoints = updates.maxPoints !== void 0 ? Number(updates.maxPoints) : asn.maxPoints;
        if (!Number.isFinite(maxPoints)) maxPoints = asn.maxPoints;
        maxPoints = Math.max(1, Math.min(10, Math.floor(maxPoints)));
        const updated = {
          ...asn,
          title,
          description: updates.description !== void 0 ? String(updates.description) : asn.description || "",
          deadline: updates.deadline !== void 0 ? updates.deadline : asn.deadline,
          maxPoints
        };
        this.assignments.set(assignmentId, updated);
        this.save();
        return { ok: true, assignment: updated };
      }
      async deleteAdminAssignment(adminUsername, assignmentId) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const asn = this.assignments.get(assignmentId);
        if (!asn) return { ok: false, error: "Assignment not found" };
        if (asn.visibility !== "global") return { ok: false, error: "Only global assignments can be deleted here" };
        this.assignments.delete(assignmentId);
        this.save();
        return { ok: true };
      }
      // ===== Student: discover assignments and submit =====
      async listStudentAssignments(studentUsername) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return [];
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return [];
        const schoolId = this.getSchoolIdForUserId(sid);
        const list = Array.from(this.assignments.values()).filter((a) => a.visibility === "global" || !!schoolId && a.schoolId === schoolId).sort((a, b) => b.createdAt - a.createdAt);
        return list.map((a) => {
          const submission = Array.from(this.assignmentSubmissions.values()).find((s) => s.assignmentId === a.id && s.studentUserId === sid);
          return { assignment: a, submission };
        });
      }
      async submitAssignment(studentUsername, assignmentId, filesOrList) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "Student not found" };
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return { ok: false, error: "Not a student" };
        const asn = this.assignments.get(assignmentId);
        if (!asn) return { ok: false, error: "Assignment not found" };
        const schoolId = this.getSchoolIdForUserId(sid);
        const allowed = asn.visibility === "global" || !!schoolId && asn.schoolId === schoolId;
        if (!allowed) return { ok: false, error: "Assignment not available" };
        const list = Array.isArray(filesOrList) ? filesOrList : typeof filesOrList === "string" ? [filesOrList] : [];
        const allow = /* @__PURE__ */ new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
        const files = list.filter((v) => {
          if (typeof v !== "string") return false;
          if (!v.startsWith("data:")) return false;
          const m = /^data:([^;,]+)[;,]/.exec(v);
          if (!m) return false;
          return allow.has(m[1]);
        }).map(String);
        if (files.length === 0) return { ok: false, error: "Only PDF/DOC/DOCX accepted" };
        let existing = Array.from(this.assignmentSubmissions.values()).find((s) => s.assignmentId === assignmentId && s.studentUserId === sid);
        if (existing && existing.status === "approved") return { ok: false, error: "Already approved; cannot resubmit" };
        const now = Date.now();
        let submission;
        if (existing) {
          const merged = Array.from(/* @__PURE__ */ new Set([...existing.files || [], ...files]));
          submission = { ...existing, files: merged, status: "submitted", points: void 0, reviewedAt: void 0, reviewedByUserId: void 0, feedback: void 0, submittedAt: now };
          this.assignmentSubmissions.set(existing.id, submission);
        } else {
          submission = { id: randomUUID(), assignmentId, studentUserId: sid, files, submittedAt: now, status: "submitted" };
          this.assignmentSubmissions.set(submission.id, submission);
        }
        this.save();
        return { ok: true, submission };
      }
      async listAssignmentSubmissionsForTeacher(teacherUsername, assignmentId) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        const ownedIds = new Set(Array.from(this.assignments.values()).filter((a) => a.createdByUserId === tid).map((a) => a.id));
        const results = [];
        this.assignmentSubmissions.forEach((s) => {
          const inScope = assignmentId ? s.assignmentId === assignmentId : ownedIds.has(s.assignmentId);
          if (!inScope) return;
          const user = this.users.get(s.studentUserId);
          const prof = this.profiles.get(s.studentUserId) || {};
          const asn = this.assignments.get(s.assignmentId);
          results.push({
            ...s,
            studentUsername: user?.username || "student",
            studentName: prof.name,
            className: prof.className,
            section: prof.section,
            assignmentMaxPoints: asn?.maxPoints
          });
        });
        return results.sort((a, b) => b.submittedAt - a.submittedAt);
      }
      async reviewAssignmentSubmission(teacherUsername, submissionId, decision) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const submission = this.assignmentSubmissions.get(submissionId);
        if (!submission) return { ok: false, error: "Submission not found" };
        const asn = this.assignments.get(submission.assignmentId);
        if (!asn || asn.createdByUserId !== tid) return { ok: false, error: "Not allowed" };
        const status = decision.status;
        if (status === "approved") {
          const pts = Number(decision.points ?? 0);
          if (!Number.isFinite(pts) || pts < 0 || pts > asn.maxPoints) return { ok: false, error: "Invalid points" };
          this.assignmentSubmissions.set(submissionId, { ...submission, status: "approved", points: pts, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
        } else {
          this.assignmentSubmissions.set(submissionId, { ...submission, status: "rejected", points: 0, reviewedByUserId: tid, reviewedAt: Date.now(), feedback: decision.feedback });
        }
        this.save();
        return { ok: true };
      }
      async listAssignmentSubmissionsForAdmin(adminUsername, assignmentId) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return [];
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return [];
        const results = [];
        this.assignmentSubmissions.forEach((s) => {
          const asn = this.assignments.get(s.assignmentId);
          if (!asn || asn.visibility !== "global") return;
          const inScope = assignmentId ? s.assignmentId === assignmentId : true;
          if (!inScope) return;
          const user = this.users.get(s.studentUserId);
          const prof = this.profiles.get(s.studentUserId) || {};
          results.push({
            ...s,
            studentUsername: user?.username || "student",
            studentName: prof.name,
            className: prof.className,
            section: prof.section,
            assignmentMaxPoints: asn?.maxPoints
          });
        });
        return results.sort((a, b) => b.submittedAt - a.submittedAt);
      }
      async reviewAdminAssignmentSubmission(adminUsername, submissionId, decision) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const submission = this.assignmentSubmissions.get(submissionId);
        if (!submission) return { ok: false, error: "Submission not found" };
        const asn = this.assignments.get(submission.assignmentId);
        if (!asn || asn.visibility !== "global") return { ok: false, error: "Not allowed" };
        const status = decision.status;
        if (status === "approved") {
          const pts = Number(decision.points ?? 0);
          if (!Number.isFinite(pts) || pts < 0 || pts > asn.maxPoints) return { ok: false, error: "Invalid points" };
          this.assignmentSubmissions.set(submissionId, { ...submission, status: "approved", points: pts, reviewedByUserId: aid, reviewedAt: Date.now(), feedback: decision.feedback });
        } else {
          this.assignmentSubmissions.set(submissionId, { ...submission, status: "rejected", points: 0, reviewedByUserId: aid, reviewedAt: Date.now(), feedback: decision.feedback });
        }
        this.save();
        return { ok: true };
      }
      // ===== Quizzes (simple MCQ, create/list) =====
      async createQuiz(teacherUsername, input) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const schoolId = this.getSchoolIdForUserId(tid);
        if (!schoolId) return { ok: false, error: "Teacher not linked to a school" };
        const title = String(input?.title || "").trim();
        if (!title) return { ok: false, error: "Title required" };
        const pointsRaw = Number(input.points ?? 3);
        const points = Math.max(1, Math.min(3, Number.isFinite(pointsRaw) ? Math.floor(pointsRaw) : 3));
        const questions = Array.isArray(input.questions) ? input.questions.map((q, idx) => ({ id: randomUUID(), text: String(q.text || "").trim(), options: (q.options || []).map(String).slice(0, 4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) })).filter((q) => q.text && q.options.length >= 2) : [];
        if (questions.length === 0) return { ok: false, error: "At least one question required" };
        const quiz = { id: randomUUID(), title, description: String(input.description || ""), points, createdByUserId: tid, schoolId, createdAt: Date.now(), questions, visibility: "school" };
        this.quizzes.set(quiz.id, quiz);
        this.notifySchool(schoolId, `School quiz created: ${quiz.title}`, "quiz");
        this.save();
        return { ok: true, quiz };
      }
      async listTeacherQuizzes(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        return Array.from(this.quizzes.values()).filter((q) => q.createdByUserId === tid).sort((a, b) => b.createdAt - a.createdAt);
      }
      async updateQuiz(teacherUsername, id, updates) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const quiz = this.quizzes.get(id);
        if (!quiz) return { ok: false, error: "Quiz not found" };
        if (quiz.createdByUserId !== tid) return { ok: false, error: "Not allowed" };
        const next = { ...quiz };
        if (typeof updates.title === "string") next.title = updates.title.trim();
        if (typeof updates.description === "string") next.description = updates.description;
        if (typeof updates.points !== "undefined") {
          const p = Number(updates.points);
          if (!Number.isFinite(p)) return { ok: false, error: "Invalid points" };
          next.points = Math.max(1, Math.min(3, Math.floor(p)));
        }
        if (Array.isArray(updates.questions)) {
          const qs = updates.questions.map((q) => ({ id: q.id || randomUUID(), text: String(q.text || "").trim(), options: (q.options || []).map(String).slice(0, 4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) })).filter((q) => q.text && q.options.length >= 2);
          if (qs.length === 0) return { ok: false, error: "At least one question required" };
          next.questions = qs;
        }
        this.quizzes.set(id, next);
        this.save();
        return { ok: true, quiz: next };
      }
      async deleteQuiz(teacherUsername, id) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { ok: false, error: "Teacher not found" };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { ok: false, error: "Not a teacher" };
        const quiz = this.quizzes.get(id);
        if (!quiz) return { ok: false, error: "Quiz not found" };
        if (quiz.createdByUserId !== tid) return { ok: false, error: "Not allowed" };
        this.quizzes.delete(id);
        this.save();
        return { ok: true };
      }
      // ===== Admin: Global Quizzes =====
      async createAdminQuiz(adminUsername, input) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const title = String(input?.title || "").trim();
        if (!title) return { ok: false, error: "Title required" };
        const pointsRaw = Number(input.points ?? 3);
        const points = Math.max(1, Math.min(3, Number.isFinite(pointsRaw) ? Math.floor(pointsRaw) : 3));
        const questions = Array.isArray(input.questions) ? input.questions.map((q) => ({ id: randomUUID(), text: String(q.text || "").trim(), options: (q.options || []).map(String).slice(0, 4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) })).filter((q) => q.text && q.options.length >= 2) : [];
        if (questions.length === 0) return { ok: false, error: "At least one question required" };
        const quiz = { id: randomUUID(), title, description: String(input.description || ""), points, createdByUserId: aid, schoolId: "", createdAt: Date.now(), questions, visibility: "global" };
        this.quizzes.set(quiz.id, quiz);
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") this.addNotificationForUserId(id, `Global quiz created: ${quiz.title}`, "quiz");
        });
        this.save();
        return { ok: true, quiz };
      }
      async listAdminQuizzes(adminUsername) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return [];
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return [];
        return Array.from(this.quizzes.values()).filter((q) => q.visibility === "global").sort((a, b) => b.createdAt - a.createdAt);
      }
      async updateAdminQuiz(adminUsername, id, updates) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const quiz = this.quizzes.get(id);
        if (!quiz) return { ok: false, error: "Quiz not found" };
        if (quiz.visibility !== "global" || quiz.createdByUserId !== aid) return { ok: false, error: "Not allowed" };
        const next = { ...quiz };
        if (typeof updates.title === "string") next.title = updates.title.trim();
        if (typeof updates.description === "string") next.description = updates.description;
        if (typeof updates.points !== "undefined") {
          const p = Number(updates.points);
          if (!Number.isFinite(p)) return { ok: false, error: "Invalid points" };
          next.points = Math.max(1, Math.min(3, Math.floor(p)));
        }
        if (Array.isArray(updates.questions)) {
          const qs = updates.questions.map((q) => ({ id: q.id || randomUUID(), text: String(q.text || "").trim(), options: (q.options || []).map(String).slice(0, 4), answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex) || 0)) })).filter((q) => q.text && q.options.length >= 2);
          if (qs.length === 0) return { ok: false, error: "At least one question required" };
          next.questions = qs;
        }
        this.quizzes.set(id, next);
        this.save();
        return { ok: true, quiz: next };
      }
      async deleteAdminQuiz(adminUsername, id) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "Admin not found" };
        const [aid] = entry;
        if (this.roles.get(aid) !== "admin") return { ok: false, error: "Not an admin" };
        const quiz = this.quizzes.get(id);
        if (!quiz) return { ok: false, error: "Quiz not found" };
        if (quiz.visibility !== "global" || quiz.createdByUserId !== aid) return { ok: false, error: "Not allowed" };
        this.quizzes.delete(id);
        this.save();
        return { ok: true };
      }
      // ===== Student: Discover Quizzes (global + school) =====
      async listStudentQuizzes(studentUsername) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return [];
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return [];
        const schoolId = this.getSchoolIdForUserId(sid);
        const quizzes2 = Array.from(this.quizzes.values()).filter((q) => q.visibility === "global" || !!schoolId && q.schoolId === schoolId).sort((a, b) => b.createdAt - a.createdAt);
        const attemptsByQuiz = /* @__PURE__ */ new Map();
        this.quizAttempts.forEach((a) => {
          if (a.studentUserId === sid) attemptsByQuiz.set(a.quizId, a);
        });
        return quizzes2.map((q) => ({ ...q, _attempt: attemptsByQuiz.get(q.id) ? { scorePercent: attemptsByQuiz.get(q.id).scorePercent, attemptedAt: attemptsByQuiz.get(q.id).attemptedAt } : void 0 }));
      }
      async getQuizById(id) {
        return this.quizzes.get(id);
      }
      // ===== Students & Overview =====
      async listStudentsForTeacher(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return [];
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return [];
        const schoolId = this.getSchoolIdForUserId(tid);
        if (!schoolId) return [];
        const list = [];
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            const p = this.profiles.get(id) || {};
            if (p.schoolId === schoolId) {
              list.push({ username: u.username, name: p.name, className: p.className, section: p.section });
            }
          }
        });
        return list.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
      }
      async getTeacherOverview(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return { tasks: 0, assignments: 0, quizzes: 0, announcements: 0, videos: 0, students: 0, pendingSubmissions: 0 };
        const [tid] = entry;
        if (this.roles.get(tid) !== "teacher") return { tasks: 0, assignments: 0, quizzes: 0, announcements: 0, videos: 0, students: 0, pendingSubmissions: 0 };
        const tasks2 = Array.from(this.tasks.values()).filter((t) => t.createdByUserId === tid).length;
        const assignments2 = Array.from(this.assignments.values()).filter((a) => a.createdByUserId === tid).length;
        const quizzes2 = Array.from(this.quizzes.values()).filter((q) => q.createdByUserId === tid).length;
        const announcements2 = Array.from(this.announcements.values()).filter((a) => a.createdByUserId === tid).length;
        const videos2 = Array.from(this.videos.values()).filter((v) => v.uploadedBy === teacherUsername || v.uploadedBy === tid).length;
        const students = (await this.listStudentsForTeacher(teacherUsername)).length;
        const ownedTaskIds = new Set(Array.from(this.tasks.values()).filter((t) => t.createdByUserId === tid).map((t) => t.id));
        const ownedAssignmentIds = new Set(Array.from(this.assignments.values()).filter((a) => a.createdByUserId === tid).map((a) => a.id));
        let pendingSubmissions = 0;
        this.submissions.forEach((s) => {
          if (ownedTaskIds.has(s.taskId) && s.status === "submitted") pendingSubmissions++;
        });
        this.assignmentSubmissions.forEach((s) => {
          if (ownedAssignmentIds.has(s.assignmentId) && s.status === "submitted") pendingSubmissions++;
        });
        return { tasks: tasks2, assignments: assignments2, quizzes: quizzes2, announcements: announcements2, videos: videos2, students, pendingSubmissions };
      }
      // ===== Activity logging & notifications =====
      async addQuizAttempt(studentUsername, input) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "Student not found" };
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return { ok: false, error: "Not a student" };
        const quiz = this.quizzes.get(input.quizId);
        if (!quiz) return { ok: false, error: "Quiz not found" };
        const schoolId = this.getSchoolIdForUserId(sid);
        const allowed = quiz.visibility === "global" || !!schoolId && schoolId === quiz.schoolId;
        if (!allowed) return { ok: false, error: "Quiz not available" };
        const existing = Array.from(this.quizAttempts.values()).find((a) => a.quizId === quiz.id && a.studentUserId === sid);
        if (existing) return { ok: false, error: "Already attempted" };
        const attempt = { id: randomUUID(), quizId: quiz.id, studentUserId: sid, answers: Array.isArray(input.answers) ? input.answers.map((n) => Number(n)) : void 0, scorePercent: Math.max(0, Math.min(100, Math.round(Number(input.scorePercent) || 0))), attemptedAt: Date.now() };
        this.quizAttempts.set(attempt.id, attempt);
        this.save();
        return { ok: true, attempt };
      }
      async getStudentQuizAttempt(username, quizId) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return null;
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return null;
        const a = Array.from(this.quizAttempts.values()).find((x) => x.quizId === quizId && x.studentUserId === sid) || null;
        return a;
      }
      async addGamePlay(studentUsername, gameId, points) {
        const entry = this.findUserEntryByUsername(studentUsername);
        if (!entry) return { ok: false, error: "Student not found" };
        const [sid] = entry;
        if (this.roles.get(sid) !== "student") return { ok: false, error: "Not a student" };
        const key = `${sid}|${gameId}`;
        const now = Date.now();
        const last = this.lastGamePlay.get(key) || 0;
        if (now - last < 1e4) {
          return { ok: true, play: { id: "throttled", gameId: String(gameId), studentUserId: sid, playedAt: now, points: 0 } };
        }
        let creditPoints = 0;
        const requested = Number(points);
        if (Number.isFinite(requested) && requested > 0) {
          const alreadyCredited = Array.from(this.gamePlays.values()).some((g) => g.studentUserId === sid && g.gameId === String(gameId) && Number(g.points || 0) > 0);
          creditPoints = alreadyCredited ? 0 : Math.max(0, Math.floor(requested));
        }
        const play = { id: randomUUID(), gameId: String(gameId), studentUserId: sid, playedAt: now, points: creditPoints || void 0 };
        this.gamePlays.set(play.id, play);
        this.lastGamePlay.set(key, now);
        this.save();
        return { ok: true, play };
      }
      async getStudentGameSummary(username) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return { totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 };
        const [sid] = entry;
        const now = /* @__PURE__ */ new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        let totalGamePoints = 0;
        const uniqueGames = /* @__PURE__ */ new Set();
        let monthCompletedCount = 0;
        this.gamePlays.forEach((g) => {
          if (g.studentUserId !== sid) return;
          uniqueGames.add(g.gameId);
          if (g.points) totalGamePoints += Number(g.points || 0);
          if (g.playedAt >= monthStart) monthCompletedCount++;
        });
        const badges = [];
        if (monthCompletedCount >= 1) badges.push("\u{1F3AE} First Play");
        if (monthCompletedCount >= 5) badges.push("\u{1F525} Game Streak 5");
        if (totalGamePoints >= 10) badges.push("\u2B50 Game Enthusiast");
        return { totalGamePoints, badges, monthCompletedCount, totalUniqueGames: uniqueGames.size };
      }
      async listNotifications(username) {
        const id = this.findUserIdByUsername(username);
        if (!id) return [];
        return Array.from(this.notifications.values()).filter((n) => n.userId === id).sort((a, b) => b.createdAt - a.createdAt);
      }
      async markAllNotificationsRead(username) {
        const id = this.findUserIdByUsername(username);
        if (!id) return { ok: false, error: "User not found" };
        const now = Date.now();
        let changed = false;
        this.notifications.forEach((n, key) => {
          if (n.userId === id && !n.readAt) {
            this.notifications.set(key, { ...n, readAt: now });
            changed = true;
          }
        });
        if (changed) this.save();
        return { ok: true };
      }
      notifySchool(schoolId, message, type = "info") {
        this.users.forEach((u, id) => {
          if (this.roles.get(id) === "student") {
            const p = this.profiles.get(id) || {};
            if (p.schoolId === schoolId) this.addNotificationForUserId(id, message, type);
          }
        });
      }
      addNotificationForUserId(userId, message, type = "info") {
        const n = { id: randomUUID(), userId, message, type, createdAt: Date.now() };
        this.notifications.set(n.id, n);
        this.save();
      }
      // ===== Games Catalog (Admin-managed) =====
      async listGames() {
        this.ensureDemoGames();
        return Array.from(this.games.values()).sort((a, b) => b.createdAt - a.createdAt);
      }
      async listAdminGames(adminUsername) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return [];
        const [aid] = entry;
        const role = this.roles.get(aid);
        if (role !== "admin" && role !== "teacher") return [];
        return await this.listGames();
      }
      async createAdminGame(adminUsername, input) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [aid] = entry;
        const role = this.roles.get(aid);
        if (role !== "admin" && role !== "teacher") return { ok: false, error: "Not allowed" };
        const name = String(input?.name || "").trim();
        const category = String(input?.category || "").trim().toLowerCase();
        if (!name || !category) return { ok: false, error: "Name and category required" };
        if (!["recycling", "climate", "habits", "wildlife", "fun"].includes(category)) return { ok: false, error: "Invalid category" };
        const externalUrl = String(input?.externalUrl || "").trim();
        if (!externalUrl) return { ok: false, error: "Game link is required" };
        const id = (input.id?.trim() || name.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!id) return { ok: false, error: "Invalid id" };
        if (this.games.has(id)) return { ok: false, error: "ID already exists" };
        let points = Math.floor(Number(input.points));
        if (!Number.isFinite(points) || points < 1) points = 1;
        if (points > 50) points = 50;
        const difficulty = input.difficulty === "Easy" || input.difficulty === "Medium" || input.difficulty === "Hard" ? input.difficulty : void 0;
        const game = {
          id,
          name,
          category,
          description: input.description ? String(input.description) : void 0,
          difficulty,
          points,
          icon: input.icon ? String(input.icon) : void 0,
          externalUrl,
          image: input.image ? String(input.image).trim() : void 0,
          createdAt: Date.now(),
          createdByUserId: aid
        };
        this.games.set(id, game);
        this.save();
        return { ok: true, game };
      }
      async updateAdminGame(adminUsername, gameId, updates) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [aid] = entry;
        const role = this.roles.get(aid);
        if (role !== "admin" && role !== "teacher") return { ok: false, error: "Not allowed" };
        const g = this.games.get(gameId);
        if (!g) return { ok: false, error: "Game not found" };
        const next = { ...g };
        if (typeof updates.name === "string") next.name = updates.name.trim() || next.name;
        if (typeof updates.category === "string") {
          const category = updates.category.trim().toLowerCase();
          if (!["recycling", "climate", "habits", "wildlife", "fun"].includes(category)) return { ok: false, error: "Invalid category" };
          next.category = category || next.category;
        }
        if (typeof updates.description === "string") next.description = updates.description;
        if (typeof updates.icon === "string") next.icon = updates.icon;
        if (typeof updates.externalUrl === "string") {
          const url = updates.externalUrl.trim();
          if (!url) return { ok: false, error: "Game link is required" };
          next.externalUrl = url;
        }
        if (typeof updates.image === "string") next.image = updates.image.trim() || void 0;
        if (typeof updates.points !== "undefined") {
          let p = Math.floor(Number(updates.points));
          if (!Number.isFinite(p) || p < 1) p = 1;
          if (p > 50) p = 50;
          next.points = p;
        }
        if (typeof updates.difficulty !== "undefined") {
          if (updates.difficulty === "Easy" || updates.difficulty === "Medium" || updates.difficulty === "Hard") next.difficulty = updates.difficulty;
        }
        this.games.set(gameId, next);
        this.save();
        return { ok: true, game: next };
      }
      async deleteAdminGame(adminUsername, gameId) {
        const entry = this.findUserEntryByUsername(adminUsername);
        if (!entry) return { ok: false, error: "User not found" };
        const [aid] = entry;
        const role = this.roles.get(aid);
        if (role !== "admin" && role !== "teacher") return { ok: false, error: "Not allowed" };
        if (!this.games.has(gameId)) return { ok: false, error: "Game not found" };
        this.games.delete(gameId);
        this.save();
        return { ok: true };
      }
      // ===== Video Management =====
      async getAllVideos() {
        return Array.from(this.videos.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
      }
      async getTeacherVideos(teacherId) {
        return Array.from(this.videos.values()).filter((v) => v.uploadedBy === teacherId).sort((a, b) => b.uploadedAt - a.uploadedAt);
      }
      async getTeacherVideosCount(teacherUsername) {
        const entry = this.findUserEntryByUsername(teacherUsername);
        if (!entry) return 0;
        const [tid] = entry;
        return Array.from(this.videos.values()).filter((v) => v.uploadedBy === teacherUsername || v.uploadedBy === tid).length;
      }
      async createVideo(input) {
        const video = {
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
          duration: input.duration
        };
        this.videos.set(video.id, video);
        this.save();
        return video;
      }
      async updateVideo(id, updates) {
        const video = this.videos.get(id);
        if (!video) throw new Error("Video not found");
        const updated = { ...video, ...updates };
        this.videos.set(id, updated);
        this.save();
        return updated;
      }
      async deleteVideo(id) {
        this.videos.delete(id);
        const progressToDelete = [];
        this.userVideoProgress.forEach((progress, progressId) => {
          if (progress.videoId === id) {
            progressToDelete.push(progressId);
          }
        });
        progressToDelete.forEach((progressId) => this.userVideoProgress.delete(progressId));
        this.save();
      }
      async getUserCredits(username) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return { totalCredits: 0, lastUpdated: Date.now() };
        const [userId] = entry;
        const userCredits2 = Array.from(this.userCredits.values()).find((c) => c.userId === userId);
        if (!userCredits2) {
          return { totalCredits: 0, lastUpdated: Date.now() };
        }
        return {
          totalCredits: userCredits2.totalCredits,
          lastUpdated: userCredits2.lastUpdated
        };
      }
      async recordVideoWatch(username, videoId) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return { success: false, creditsAwarded: 0 };
        const [userId] = entry;
        const video = this.videos.get(videoId);
        if (!video) return { success: false, creditsAwarded: 0 };
        const existingProgress = Array.from(this.userVideoProgress.values()).find((p) => p.userId === userId && p.videoId === videoId);
        if (existingProgress && existingProgress.watched) {
          return { success: true, creditsAwarded: 0 };
        }
        const progressId = existingProgress?.id || randomUUID();
        const progress = {
          id: progressId,
          userId,
          videoId,
          watched: true,
          watchedAt: Date.now(),
          creditsAwarded: !existingProgress || !existingProgress.creditsAwarded
        };
        this.userVideoProgress.set(progressId, progress);
        let creditsAwarded = 0;
        if (!existingProgress || !existingProgress.creditsAwarded) {
          creditsAwarded = video.credits;
          await this.awardCredits(username, videoId, creditsAwarded);
        }
        this.save();
        return { success: true, creditsAwarded };
      }
      async awardCredits(username, videoId, credits) {
        const entry = this.findUserEntryByUsername(username);
        if (!entry) return { success: false, newTotal: 0 };
        const [userId] = entry;
        let userCredits2 = Array.from(this.userCredits.values()).find((c) => c.userId === userId);
        if (!userCredits2) {
          userCredits2 = {
            id: randomUUID(),
            userId,
            totalCredits: 0,
            lastUpdated: Date.now()
          };
        }
        userCredits2.totalCredits += credits;
        userCredits2.lastUpdated = Date.now();
        this.userCredits.set(userCredits2.id, userCredits2);
        this.save();
        return { success: true, newTotal: userCredits2.totalCredits };
      }
      async fetchYouTubeMetadata(url) {
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        if (!videoIdMatch) {
          throw new Error("Invalid YouTube URL");
        }
        const videoId = videoIdMatch[1];
        return {
          title: `Video ${videoId}`,
          description: "Environmental education video from YouTube",
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: 300
          // 5 minutes default
        };
      }
    };
    storage = new MemStorage();
  }
});

// server/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  assignmentSubmissions: () => assignmentSubmissions,
  assignments: () => assignments,
  gamePlays: () => gamePlays,
  games: () => games,
  learningModules: () => learningModules,
  lessonCompletions: () => lessonCompletions,
  notifications: () => notifications,
  otps: () => otps,
  profiles: () => profiles,
  quizAttempts: () => quizAttempts,
  quizzes: () => quizzes,
  schools: () => schools,
  studentApplications: () => studentApplications,
  taskGroups: () => taskGroups,
  taskSubmissions: () => taskSubmissions,
  tasks: () => tasks,
  teacherApplications: () => teacherApplications,
  userCredits: () => userCredits,
  userVideoProgress: () => userVideoProgress,
  users: () => users,
  videos: () => videos
});
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
var users, schools, studentApplications, teacherApplications, profiles, otps, tasks, taskSubmissions, taskGroups, quizzes, quizAttempts, assignments, assignmentSubmissions, announcements, learningModules, lessonCompletions, games, gamePlays, notifications, videos, userVideoProgress, userCredits;
var init_schema = __esm({
  "server/schema.ts"() {
    "use strict";
    users = sqliteTable("users", {
      id: text("id").primaryKey(),
      name: text("name"),
      email: text("email").unique(),
      username: text("username").unique(),
      password: text("password"),
      role: text("role"),
      // student, teacher, admin
      schoolId: text("school_id"),
      subject: text("subject"),
      photoUrl: text("photo_url"),
      approved: integer("approved", { mode: "boolean" })
    });
    schools = sqliteTable("schools", {
      id: text("id").primaryKey(),
      name: text("name").unique()
    });
    studentApplications = sqliteTable("student_applications", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      username: text("username").notNull().unique(),
      schoolId: text("school_id").notNull(),
      studentId: text("student_id"),
      rollNumber: text("roll_number"),
      className: text("class_name"),
      section: text("section"),
      photoDataUrl: text("photo_data_url"),
      password: text("password").notNull(),
      submittedAt: integer("submitted_at").notNull()
    });
    teacherApplications = sqliteTable("teacher_applications", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      username: text("username").notNull().unique(),
      schoolId: text("school_id").notNull(),
      teacherId: text("teacher_id"),
      subject: text("subject"),
      photoDataUrl: text("photo_data_url"),
      password: text("password").notNull(),
      submittedAt: integer("submitted_at").notNull()
    });
    profiles = sqliteTable("profiles", {
      userId: text("user_id").primaryKey(),
      username: text("username").notNull().unique(),
      role: text("role").notNull(),
      name: text("name"),
      email: text("email"),
      schoolId: text("school_id"),
      photoDataUrl: text("photo_data_url"),
      studentId: text("student_id"),
      rollNumber: text("roll_number"),
      className: text("class_name"),
      section: text("section"),
      teacherId: text("teacher_id"),
      subject: text("subject"),
      allowExternalView: integer("allow_external_view", { mode: "boolean" }).default(true),
      updatedAt: integer("updated_at").notNull()
    });
    otps = sqliteTable("otps", {
      email: text("email").primaryKey(),
      code: text("code").notNull(),
      expiresAt: integer("expires_at").notNull()
    });
    tasks = sqliteTable("tasks", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      deadline: text("deadline"),
      proofType: text("proof_type").default("photo"),
      // 'photo'
      maxPoints: integer("max_points").notNull(),
      createdByUserId: text("created_by_user_id").notNull(),
      schoolId: text("school_id"),
      createdAt: integer("created_at").notNull(),
      groupMode: text("group_mode").default("solo"),
      // 'solo' | 'group'
      maxGroupSize: integer("max_group_size")
    });
    taskSubmissions = sqliteTable("task_submissions", {
      id: text("id").primaryKey(),
      taskId: text("task_id").notNull(),
      studentUserId: text("student_user_id").notNull(),
      photoDataUrl: text("photo_data_url"),
      photos: blob("photos"),
      // JSON stringified array
      submittedAt: integer("submitted_at").notNull(),
      status: text("status").default("pending"),
      // 'pending', 'approved', 'rejected'
      points: integer("points"),
      feedback: text("feedback"),
      reviewedByUserId: text("reviewed_by_user_id"),
      reviewedAt: integer("reviewed_at"),
      groupId: text("group_id")
    });
    taskGroups = sqliteTable("task_groups", {
      id: text("id").primaryKey(),
      taskId: text("task_id").notNull(),
      memberUserIds: blob("member_user_ids").notNull(),
      // JSON stringified array
      createdAt: integer("created_at").notNull()
    });
    quizzes = sqliteTable("quizzes", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      points: integer("points").notNull(),
      createdByUserId: text("created_by_user_id").notNull(),
      schoolId: text("school_id"),
      createdAt: integer("created_at").notNull(),
      questions: blob("questions").notNull(),
      // JSON stringified array
      visibility: text("visibility").default("school")
      // 'global' | 'school'
    });
    quizAttempts = sqliteTable("quiz_attempts", {
      id: text("id").primaryKey(),
      quizId: text("quiz_id").notNull(),
      studentUserId: text("student_user_id").notNull(),
      answers: blob("answers"),
      // JSON stringified array
      scorePercent: integer("score_percent"),
      attemptedAt: integer("attempted_at").notNull()
    });
    assignments = sqliteTable("assignments", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      deadline: text("deadline"),
      maxPoints: integer("max_points"),
      createdByUserId: text("created_by_user_id").notNull(),
      schoolId: text("school_id"),
      createdAt: integer("created_at").notNull(),
      visibility: text("visibility").default("school")
      // 'global' | 'school'
    });
    assignmentSubmissions = sqliteTable("assignment_submissions", {
      id: text("id").primaryKey(),
      assignmentId: text("assignment_id").notNull(),
      studentUserId: text("student_user_id").notNull(),
      files: blob("files"),
      // JSON stringified array
      submittedAt: integer("submitted_at").notNull(),
      status: text("status").default("pending"),
      // 'pending', 'approved', 'rejected'
      points: integer("points"),
      feedback: text("feedback"),
      reviewedByUserId: text("reviewed_by_user_id"),
      reviewedAt: integer("reviewed_at")
    });
    announcements = sqliteTable("announcements", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      body: text("body"),
      createdAt: integer("created_at").notNull(),
      createdByUserId: text("created_by_user_id").notNull(),
      schoolId: text("school_id"),
      visibility: text("visibility").default("school")
      // 'global' | 'school'
    });
    learningModules = sqliteTable("learning_modules", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      lessons: blob("lessons").notNull(),
      // JSON stringified array
      createdAt: integer("created_at").notNull(),
      updatedAt: integer("updated_at").notNull(),
      createdByUserId: text("created_by_user_id"),
      updatedByUserId: text("updated_by_user_id"),
      deleted: integer("deleted", { mode: "boolean" }).default(false)
    });
    lessonCompletions = sqliteTable("lesson_completions", {
      id: text("id").primaryKey(),
      studentUserId: text("student_user_id").notNull(),
      moduleId: text("module_id").notNull(),
      moduleTitle: text("module_title").notNull(),
      lessonId: text("lesson_id").notNull(),
      lessonTitle: text("lesson_title").notNull(),
      points: integer("points").notNull(),
      completedAt: integer("completed_at").notNull()
    });
    games = sqliteTable("games", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      category: text("category").notNull(),
      description: text("description"),
      difficulty: text("difficulty"),
      // 'Easy', 'Medium', 'Hard'
      points: integer("points").notNull(),
      icon: text("icon"),
      externalUrl: text("external_url").notNull(),
      image: text("image"),
      createdAt: integer("created_at").notNull(),
      createdByUserId: text("created_by_user_id")
    });
    gamePlays = sqliteTable("game_plays", {
      id: text("id").primaryKey(),
      gameId: text("game_id").notNull(),
      studentUserId: text("student_user_id").notNull(),
      playedAt: integer("played_at").notNull(),
      points: integer("points").notNull()
    });
    notifications = sqliteTable("notifications", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull(),
      message: text("message").notNull(),
      type: text("type"),
      // 'info', 'task', 'quiz', 'announcement', 'badge'
      createdAt: integer("created_at").notNull(),
      readAt: integer("read_at")
    });
    videos = sqliteTable("videos", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      type: text("type").notNull(),
      // 'youtube' or 'file'
      url: text("url").notNull(),
      thumbnail: text("thumbnail"),
      credits: integer("credits").notNull().default(1),
      uploadedBy: text("uploaded_by").notNull(),
      uploadedAt: integer("uploaded_at").notNull(),
      category: text("category"),
      duration: integer("duration")
    });
    userVideoProgress = sqliteTable("user_video_progress", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull(),
      videoId: text("video_id").notNull(),
      watched: integer("watched", { mode: "boolean" }).default(false),
      watchedAt: integer("watched_at"),
      creditsAwarded: integer("credits_awarded", { mode: "boolean" }).default(false)
    });
    userCredits = sqliteTable("user_credits", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().unique(),
      totalCredits: integer("total_credits").notNull().default(0),
      lastUpdated: integer("last_updated").notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  initDb: () => initDb,
  orm: () => orm
});
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
function initDb() {
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
var sqlite, orm;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    sqlite = new Database("./db.sqlite");
    orm = drizzle(sqlite, { schema: schema_exports });
  }
});

// server/storage-db.ts
var storage_db_exports = {};
__export(storage_db_exports, {
  DatabaseStorage: () => DatabaseStorage
});
import { randomUUID as randomUUID2 } from "crypto";
import { eq, and, or, desc, asc, inArray, isNull } from "drizzle-orm";
var DatabaseStorage;
var init_storage_db = __esm({
  "server/storage-db.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      constructor() {
      }
      // ============ ADMIN SEEDING ============
      async seedAdmin() {
        const found = await orm.select().from(users).where(eq(users.username, "admin123"));
        if (found.length === 0) {
          await orm.insert(users).values({
            id: randomUUID2(),
            name: "Admin",
            email: "admin@example.com",
            username: "admin123",
            password: "admin@1234",
            role: "admin",
            approved: true
          });
        }
      }
      // ============ USER MANAGEMENT ============
      async getUser(id) {
        const user = await orm.select().from(users).where(eq(users.id, id)).limit(1);
        return user[0];
      }
      async getUserByUsername(username) {
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        return user[0];
      }
      async createUser(insertUser) {
        const id = randomUUID2();
        const user = { ...insertUser, id };
        await orm.insert(users).values(user);
        return user;
      }
      // ============ SCHOOLS ============
      async listSchools() {
        const schools2 = await orm.select().from(schools);
        return schools2.map((s) => ({ id: s.id, name: s.name }));
      }
      async addSchool(name) {
        const school = { id: randomUUID2(), name };
        await orm.insert(schools).values(school);
        return school;
      }
      async removeSchool(id) {
        const result = await orm.delete(schools).where(eq(schools.id, id));
        return result.changes > 0;
      }
      // ============ APPLICATIONS (SIGNUPS) ============
      async addStudentApplication(app2) {
        const id = randomUUID2();
        const stored = {
          ...app2,
          id,
          submittedAt: app2.submittedAt || Date.now()
        };
        await orm.insert(studentApplications).values(stored);
        return stored;
      }
      async addTeacherApplication(app2) {
        const id = randomUUID2();
        const stored = {
          ...app2,
          id,
          submittedAt: app2.submittedAt || Date.now()
        };
        await orm.insert(teacherApplications).values(stored);
        return stored;
      }
      async listPending() {
        const [students, teachers] = await Promise.all([
          orm.select().from(studentApplications),
          orm.select().from(teacherApplications)
        ]);
        return { students, teachers };
      }
      async approveApplication(type, id) {
        if (type === "student") {
          const app2 = await orm.select().from(studentApplications).where(eq(studentApplications.id, id)).limit(1);
          if (!app2[0]) return false;
          const application = app2[0];
          const userId = randomUUID2();
          await orm.insert(users).values({
            id: userId,
            username: application.username,
            password: application.password,
            email: application.email,
            role: "student",
            schoolId: application.schoolId,
            approved: 1
          });
          await orm.insert(profiles).values({
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
            updatedAt: Date.now()
          });
          await orm.delete(studentApplications).where(eq(studentApplications.id, id));
          return true;
        } else {
          const app2 = await orm.select().from(teacherApplications).where(eq(teacherApplications.id, id)).limit(1);
          if (!app2[0]) return false;
          const application = app2[0];
          const userId = randomUUID2();
          await orm.insert(users).values({
            id: userId,
            username: application.username,
            password: application.password,
            email: application.email,
            role: "teacher",
            schoolId: application.schoolId,
            subject: application.subject,
            approved: 1
          });
          await orm.insert(profiles).values({
            userId,
            username: application.username,
            role: "teacher",
            name: application.name,
            email: application.email,
            schoolId: application.schoolId,
            teacherId: application.teacherId,
            subject: application.subject,
            photoDataUrl: application.photoDataUrl,
            updatedAt: Date.now()
          });
          await orm.delete(teacherApplications).where(eq(teacherApplications.id, id));
          return true;
        }
      }
      async isUsernameAvailable(username) {
        const [approvedUser, studentApp, teacherApp] = await Promise.all([
          orm.select().from(users).where(eq(users.username, username)).limit(1),
          orm.select().from(studentApplications).where(eq(studentApplications.username, username)).limit(1),
          orm.select().from(teacherApplications).where(eq(teacherApplications.username, username)).limit(1)
        ]);
        return !approvedUser[0] && !studentApp[0] && !teacherApp[0];
      }
      async getApplicationStatus(username) {
        const [approvedUser, pendingApp] = await Promise.all([
          orm.select().from(users).where(eq(users.username, username)).limit(1),
          orm.select().from(studentApplications).where(eq(studentApplications.username, username)).limit(1).then(
            (r) => r[0] ? r : orm.select().from(teacherApplications).where(eq(teacherApplications.username, username)).limit(1)
          )
        ]);
        if (approvedUser[0]) return "approved";
        if (pendingApp[0]) return "pending";
        return "none";
      }
      // ============ OTP MANAGEMENT ============
      async saveOtp(email, code, ttlMs) {
        const key = email.trim().toLowerCase();
        const sanitized = String(code).replace(/\D/g, "").slice(0, 6);
        const expiresAt = Date.now() + ttlMs;
        await orm.delete(otps).where(eq(otps.email, key));
        await orm.insert(otps).values({
          email: key,
          code: sanitized,
          expiresAt
        });
      }
      async verifyOtp(email, code) {
        const key = email.trim().toLowerCase();
        const sanitized = String(code).replace(/\D/g, "").slice(0, 6);
        const otp = await orm.select().from(otps).where(eq(otps.email, key)).limit(1);
        if (!otp[0]) return false;
        const valid = otp[0].code === sanitized && Date.now() <= otp[0].expiresAt;
        return valid;
      }
      // ============ ADMIN OPERATIONS ============
      async resetPassword(username, password) {
        const result = await orm.update(users).set({ password }).where(eq(users.username, username));
        return result.changes > 0;
      }
      async unapproveUser(username) {
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user[0]) return false;
        const userId = user[0].id;
        const role = user[0].role;
        if (role !== "student" && role !== "teacher") return false;
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
        const profileData = profile[0];
        await Promise.all([
          orm.delete(users).where(eq(users.id, userId)),
          orm.delete(profiles).where(eq(profiles.userId, userId))
        ]);
        if (role === "student") {
          await orm.insert(studentApplications).values({
            id: randomUUID2(),
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
            submittedAt: Date.now()
          });
        } else {
          await orm.insert(teacherApplications).values({
            id: randomUUID2(),
            name: profileData?.name || "",
            email: profileData?.email || "",
            username,
            schoolId: profileData?.schoolId || "",
            teacherId: profileData?.teacherId || "REVIEW",
            subject: profileData?.subject,
            photoDataUrl: profileData?.photoDataUrl,
            password: user[0].password,
            submittedAt: Date.now()
          });
        }
        return true;
      }
      async listAdmins() {
        const admins = await orm.select({
          username: users.username,
          name: profiles.name,
          email: profiles.email
        }).from(users).where(eq(users.role, "admin")).leftJoin(profiles, eq(users.id, profiles.userId));
        return admins.map((a) => ({
          username: a.username,
          name: a.name,
          email: a.email
        }));
      }
      async createAdmin(input) {
        const uname = input.username?.trim();
        if (!uname || !input.password) {
          return { ok: false, error: "Missing fields" };
        }
        const available = await this.isUsernameAvailable(uname);
        if (!available) {
          return { ok: false, error: "Username taken" };
        }
        const id = randomUUID2();
        await Promise.all([
          orm.insert(users).values({
            id,
            username: uname,
            password: input.password,
            email: input.email,
            role: "admin"
          }),
          orm.insert(profiles).values({
            userId: id,
            username: uname,
            role: "admin",
            name: input.name || "",
            email: input.email || "",
            updatedAt: Date.now()
          })
        ]);
        return { ok: true };
      }
      async updateAdmin(username, updates, currentUsername) {
        if (username === "admin123" && currentUsername !== "admin123") {
          return { ok: false, error: "Only main admin can edit main admin" };
        }
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user[0]) return { ok: false, error: "Not found" };
        if (user[0].role !== "admin") {
          return { ok: false, error: "Not an admin" };
        }
        const userId = user[0].id;
        if (updates.username && updates.username.trim() !== username) {
          if (username === "admin123") {
            return { ok: false, error: "Main admin username cannot change" };
          }
          const newU = updates.username.trim();
          const available = await this.isUsernameAvailable(newU);
          if (!available) {
            return { ok: false, error: "Username taken" };
          }
          await orm.update(users).set({ username: newU }).where(eq(users.id, userId));
          await orm.update(profiles).set({ username: newU }).where(eq(profiles.userId, userId));
        }
        await orm.update(profiles).set({
          name: updates.name !== void 0 ? updates.name : void 0,
          email: updates.email !== void 0 ? updates.email : void 0,
          updatedAt: Date.now()
        }).where(eq(profiles.userId, userId));
        return { ok: true };
      }
      async deleteAdmin(username) {
        if (username === "admin123") {
          return { ok: false, error: "Cannot delete main admin" };
        }
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user[0] || user[0].role !== "admin") {
          return { ok: false, error: "Not an admin" };
        }
        const userId = user[0].id;
        await Promise.all([
          orm.delete(users).where(eq(users.id, userId)),
          orm.delete(profiles).where(eq(profiles.userId, userId))
        ]);
        return { ok: true };
      }
      // ============ PROFILES ============
      async findUserIdByUsername(username) {
        const user = await orm.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
        return user[0]?.id || null;
      }
      async getOwnProfile(username) {
        const uid = await this.findUserIdByUsername(username);
        if (!uid) return null;
        const [user, profile] = await Promise.all([
          orm.select().from(users).where(eq(users.id, uid)).limit(1),
          orm.select().from(profiles).where(eq(profiles.userId, uid)).limit(1)
        ]);
        if (!user[0]) return null;
        const p = profile[0];
        const payload = {
          username: user[0].username,
          role: user[0].role || "student",
          name: p?.name || "",
          email: p?.email || "",
          schoolId: p?.schoolId || "",
          photoDataUrl: p?.photoDataUrl || "",
          studentId: p?.studentId,
          rollNumber: p?.rollNumber,
          className: p?.className,
          section: p?.section,
          teacherId: p?.teacherId,
          subject: p?.subject
        };
        return payload;
      }
      async updateOwnProfile(username, updates) {
        const uid = await this.findUserIdByUsername(username);
        if (!uid) return { ok: false, error: "User not found" };
        if (typeof updates.schoolId === "string" && updates.schoolId) {
          const school = await orm.select().from(schools).where(eq(schools.id, updates.schoolId)).limit(1);
          if (!school[0]) return { ok: false, error: "Invalid school" };
        }
        const updateData = {};
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
          "subject"
        ];
        for (const k of allowed) {
          if (k in updates) {
            updateData[k] = updates[k] ?? "";
          }
        }
        updateData.updatedAt = Date.now();
        await orm.update(profiles).set(updateData).where(eq(profiles.userId, uid));
        const payload = await this.getOwnProfile(username);
        return { ok: true, profile: payload };
      }
      // ============ TASKS ============
      async createTask(teacherUsername, input) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, teacherId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const taskId = randomUUID2();
        const task = {
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
          maxGroupSize: input.maxGroupSize
        };
        await orm.insert(tasks).values(task);
        return { ok: true, task };
      }
      async listTeacherTasks(teacherUsername) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return [];
        const tasks2 = await orm.select().from(tasks).where(eq(tasks.createdByUserId, teacherId)).orderBy(desc(tasks.createdAt));
        return tasks2;
      }
      async listStudentTasks(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const tasks2 = await orm.select().from(tasks).where(eq(tasks.schoolId, schoolId)).orderBy(desc(tasks.createdAt));
        const submissions = await orm.select().from(taskSubmissions).where(eq(taskSubmissions.studentUserId, studentId));
        const submissionMap = new Map(submissions.map((s) => [s.taskId, s]));
        return tasks2.map((task) => ({
          task,
          submission: submissionMap.get(task.id)
        }));
      }
      async submitTask(studentUsername, taskId, photoDataUrlOrList) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return { ok: false, error: "Student not found" };
        const task = await orm.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
        if (!task[0]) return { ok: false, error: "Task not found" };
        const submissionId = randomUUID2();
        const photos = Array.isArray(photoDataUrlOrList) ? photoDataUrlOrList : [photoDataUrlOrList];
        const submission = {
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
          groupId: null
        };
        await orm.insert(taskSubmissions).values(submission);
        return { ok: true, submission };
      }
      async listSubmissionsForTeacher(teacherUsername, taskId) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return [];
        let submissions = [];
        if (taskId) {
          submissions = await orm.select().from(taskSubmissions).where(eq(taskSubmissions.taskId, taskId));
        } else {
          const teacherTasks = await orm.select().from(tasks).where(eq(tasks.createdByUserId, teacherId));
          const taskIds = teacherTasks.map((t) => t.id);
          if (taskIds.length === 0) return [];
          submissions = await orm.select().from(taskSubmissions).where(inArray(taskSubmissions.taskId, taskIds));
        }
        const result = [];
        for (const submission of submissions) {
          const [student, task, profile] = await Promise.all([
            orm.select().from(users).where(eq(users.id, submission.studentUserId)).limit(1),
            orm.select().from(tasks).where(eq(tasks.id, submission.taskId)).limit(1),
            orm.select().from(profiles).where(eq(profiles.userId, submission.studentUserId)).limit(1)
          ]);
          if (student[0]) {
            result.push({
              ...submission,
              studentUsername: student[0].username,
              studentName: profile[0]?.name,
              className: profile[0]?.className,
              section: profile[0]?.section,
              groupMembers: submission.groupId ? await this.getGroupMembers(submission.groupId) : void 0,
              taskMaxPoints: task[0]?.maxPoints
            });
          }
        }
        return result;
      }
      async getGroupMembers(groupId) {
        const group = await orm.select().from(taskGroups).where(eq(taskGroups.id, groupId)).limit(1);
        if (!group[0]) return [];
        const memberIds = JSON.parse(group[0].memberUserIds);
        const members = await orm.select({ username: users.username }).from(users).where(inArray(users.id, memberIds));
        return members.map((m) => m.username);
      }
      async reviewSubmission(teacherUsername, submissionId, decision) {
        const submission = await orm.select().from(taskSubmissions).where(eq(taskSubmissions.id, submissionId)).limit(1);
        if (!submission[0]) return { ok: false, error: "Submission not found" };
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const now = Date.now();
        await orm.update(taskSubmissions).set({
          status: decision.status,
          points: decision.points !== void 0 ? decision.points : submission[0].points,
          feedback: decision.feedback || submission[0].feedback,
          reviewedByUserId: teacherId,
          reviewedAt: now
        }).where(eq(taskSubmissions.id, submissionId));
        return { ok: true };
      }
      async createTaskGroup(studentUsername, taskId, members) {
        const groupId = randomUUID2();
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return { ok: false, error: "Student not found" };
        const memberIds = [studentId];
        for (const memberUsername of members) {
          const memberId = await this.findUserIdByUsername(memberUsername);
          if (memberId && memberId !== studentId) {
            memberIds.push(memberId);
          }
        }
        const group = {
          id: groupId,
          taskId,
          memberUserIds: JSON.stringify(memberIds),
          createdAt: Date.now()
        };
        await orm.insert(taskGroups).values(group);
        return {
          ok: true,
          group: {
            ...group,
            memberUsernames: members
          }
        };
      }
      async getTaskGroupForStudent(studentUsername, taskId) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return null;
        const groups = await orm.select().from(taskGroups).where(eq(taskGroups.taskId, taskId));
        for (const group of groups) {
          const memberIds = JSON.parse(group.memberUserIds);
          if (memberIds.includes(studentId)) {
            const memberUsers = await orm.select({ username: users.username }).from(users).where(inArray(users.id, memberIds));
            return {
              ...group,
              memberUsernames: memberUsers.map((u) => u.username)
            };
          }
        }
        return null;
      }
      // ============ ANNOUNCEMENTS ============
      async createAnnouncement(teacherUsername, input) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, teacherId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const announcementId = randomUUID2();
        const announcement = {
          id: announcementId,
          title: input.title,
          body: input.body,
          createdAt: Date.now(),
          createdByUserId: teacherId,
          schoolId,
          visibility: "school"
        };
        await orm.insert(announcements).values(announcement);
        return { ok: true, announcement };
      }
      async listAnnouncementsForTeacher(teacherUsername) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return [];
        const announcements2 = await orm.select().from(announcements).where(eq(announcements.createdByUserId, teacherId)).orderBy(desc(announcements.createdAt));
        return announcements2;
      }
      async createAdminAnnouncement(adminUsername, input) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return { ok: false, error: "Admin not found" };
        const announcementId = randomUUID2();
        const announcement = {
          id: announcementId,
          title: input.title,
          body: input.body,
          createdAt: Date.now(),
          createdByUserId: adminId,
          schoolId: "",
          visibility: "global"
        };
        await orm.insert(announcements).values(announcement);
        return { ok: true, announcement };
      }
      async listAdminAnnouncements(adminUsername) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return [];
        const announcements2 = await orm.select().from(announcements).where(
          and(
            eq(announcements.createdByUserId, adminId),
            eq(announcements.visibility, "global")
          )
        ).orderBy(desc(announcements.createdAt));
        return announcements2;
      }
      async updateAdminAnnouncement(adminUsername, announcementId, updates) {
        const announcement = await orm.select().from(announcements).where(eq(announcements.id, announcementId)).limit(1);
        if (!announcement[0] || announcement[0].visibility !== "global") {
          return { ok: false, error: "Not found or unauthorized" };
        }
        const updated = { ...announcement[0], ...updates };
        await orm.update(announcements).set(updated).where(eq(announcements.id, announcementId));
        return { ok: true, announcement: updated };
      }
      async deleteAdminAnnouncement(adminUsername, announcementId) {
        const announcement = await orm.select().from(announcements).where(eq(announcements.id, announcementId)).limit(1);
        if (!announcement[0] || announcement[0].visibility !== "global") {
          return { ok: false, error: "Not found or unauthorized" };
        }
        await orm.delete(announcements).where(eq(announcements.id, announcementId));
        return { ok: true };
      }
      async listStudentAnnouncements(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        const schoolId = profile[0]?.schoolId;
        const announcements2 = await orm.select().from(announcements).where(
          or(
            eq(announcements.visibility, "global"),
            schoolId ? eq(announcements.schoolId, schoolId) : void 0
          )
        ).orderBy(desc(announcements.createdAt));
        return announcements2;
      }
      // ============ QUIZZES ============
      async createQuiz(teacherUsername, input) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, teacherId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const quizId = randomUUID2();
        const questions = input.questions.map((q) => ({
          ...q,
          id: randomUUID2()
        }));
        const quiz = {
          id: quizId,
          title: input.title,
          description: input.description,
          points: input.points || 0,
          createdByUserId: teacherId,
          schoolId,
          createdAt: Date.now(),
          questions,
          visibility: "school"
        };
        await orm.insert(quizzes).values({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          points: quiz.points,
          createdByUserId: quiz.createdByUserId,
          schoolId: quiz.schoolId,
          createdAt: quiz.createdAt,
          questions: JSON.stringify(quiz.questions),
          visibility: quiz.visibility
        });
        return { ok: true, quiz };
      }
      async updateQuiz(teacherUsername, id, updates) {
        const quiz = await orm.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
        if (!quiz[0] || quiz[0].createdByUserId !== await this.findUserIdByUsername(teacherUsername)) {
          return { ok: false, error: "Not found or unauthorized" };
        }
        const questions = updates.questions?.map((q) => ({
          ...q,
          id: q.id || randomUUID2()
        }));
        const updated = {
          ...quiz[0],
          title: updates.title ?? quiz[0].title,
          description: updates.description ?? quiz[0].description,
          points: updates.points ?? quiz[0].points,
          questions: questions ? JSON.stringify(questions) : quiz[0].questions
        };
        await orm.update(quizzes).set(updated).where(eq(quizzes.id, id));
        return {
          ok: true,
          quiz: {
            ...updated,
            questions: questions || JSON.parse(quiz[0].questions)
          }
        };
      }
      async deleteQuiz(teacherUsername, id) {
        const quiz = await orm.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
        if (!quiz[0] || quiz[0].createdByUserId !== await this.findUserIdByUsername(teacherUsername)) {
          return { ok: false, error: "Not found or unauthorized" };
        }
        await orm.delete(quizzes).where(eq(quizzes.id, id));
        return { ok: true };
      }
      async listStudentQuizzes(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        const schoolId = profile[0]?.schoolId;
        const quizzes2 = await orm.select().from(quizzes).where(
          or(
            eq(quizzes.visibility, "global"),
            schoolId ? eq(quizzes.schoolId, schoolId) : void 0
          )
        ).orderBy(desc(quizzes.createdAt));
        return quizzes2.map((q) => ({
          ...q,
          questions: JSON.parse(q.questions)
        }));
      }
      async addQuizAttempt(studentUsername, input) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return { ok: false, error: "Student not found" };
        const quiz = await orm.select().from(quizzes).where(eq(quizzes.id, input.quizId)).limit(1);
        if (!quiz[0]) return { ok: false, error: "Quiz not found" };
        const attemptId = randomUUID2();
        const attempt = {
          id: attemptId,
          quizId: input.quizId,
          studentUserId: studentId,
          answers: input.answers ? JSON.stringify(input.answers) : null,
          scorePercent: input.scorePercent || null,
          attemptedAt: Date.now()
        };
        await orm.insert(quizAttempts).values(attempt);
        return { ok: true, attempt };
      }
      async getStudentQuizAttempt(username, quizId) {
        const studentId = await this.findUserIdByUsername(username);
        if (!studentId) return null;
        const attempt = await orm.select().from(quizAttempts).where(
          and(
            eq(quizAttempts.studentUserId, studentId),
            eq(quizAttempts.quizId, quizId)
          )
        ).limit(1);
        return attempt[0] || null;
      }
      // ============ ASSIGNMENTS ============
      async createAssignment(teacherUsername, input) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, teacherId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const assignmentId = randomUUID2();
        const assignment = {
          id: assignmentId,
          title: input.title,
          description: input.description,
          deadline: input.deadline,
          maxPoints: input.maxPoints,
          createdByUserId: teacherId,
          schoolId,
          createdAt: Date.now(),
          visibility: "school"
        };
        await orm.insert(assignments).values(assignment);
        return { ok: true, assignment };
      }
      async listTeacherAssignments(teacherUsername) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return [];
        const assignments2 = await orm.select().from(assignments).where(eq(assignments.createdByUserId, teacherId)).orderBy(desc(assignments.createdAt));
        return assignments2;
      }
      async createAdminAssignment(adminUsername, input) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return { ok: false, error: "Admin not found" };
        const assignmentId = randomUUID2();
        const assignment = {
          id: assignmentId,
          title: input.title,
          description: input.description,
          deadline: input.deadline,
          maxPoints: input.maxPoints,
          createdByUserId: adminId,
          schoolId: "",
          createdAt: Date.now(),
          visibility: "global"
        };
        await orm.insert(assignments).values(assignment);
        return { ok: true, assignment };
      }
      async listAdminAssignments(adminUsername) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return [];
        const assignments2 = await orm.select().from(assignments).where(
          and(
            eq(assignments.createdByUserId, adminId),
            eq(assignments.visibility, "global")
          )
        ).orderBy(desc(assignments.createdAt));
        return assignments2;
      }
      async updateAdminAssignment(adminUsername, assignmentId, updates) {
        const assignment = await orm.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
        if (!assignment[0] || assignment[0].visibility !== "global") {
          return { ok: false, error: "Not found or unauthorized" };
        }
        const updated = { ...assignment[0], ...updates };
        await orm.update(assignments).set(updated).where(eq(assignments.id, assignmentId));
        return { ok: true, assignment: updated };
      }
      async deleteAdminAssignment(adminUsername, assignmentId) {
        const assignment = await orm.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
        if (!assignment[0] || assignment[0].visibility !== "global") {
          return { ok: false, error: "Not found or unauthorized" };
        }
        await orm.delete(assignments).where(eq(assignments.id, assignmentId));
        return { ok: true };
      }
      async listStudentAssignments(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        const schoolId = profile[0]?.schoolId || "";
        const assignments2 = await orm.select().from(assignments).where(
          or(
            eq(assignments.visibility, "global"),
            eq(assignments.schoolId, schoolId)
          )
        ).orderBy(desc(assignments.createdAt));
        const submissions = await orm.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.studentUserId, studentId));
        const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]));
        return assignments2.map((assignment) => ({
          assignment,
          submission: submissionMap.get(assignment.id)
        }));
      }
      async submitAssignment(studentUsername, assignmentId, filesOrList) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return { ok: false, error: "Student not found" };
        const assignment = await orm.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
        if (!assignment[0]) return { ok: false, error: "Assignment not found" };
        const submissionId = randomUUID2();
        const files = Array.isArray(filesOrList) ? filesOrList : [filesOrList];
        const submission = {
          id: submissionId,
          assignmentId,
          studentUserId: studentId,
          files: JSON.stringify(files),
          submittedAt: Date.now(),
          status: "pending",
          points: null,
          feedback: null,
          reviewedByUserId: null,
          reviewedAt: null
        };
        await orm.insert(assignmentSubmissions).values(submission);
        return { ok: true, submission };
      }
      async listAssignmentSubmissionsForTeacher(teacherUsername, assignmentId) {
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return [];
        let submissions = [];
        if (assignmentId) {
          submissions = await orm.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, assignmentId));
        } else {
          const teacherAssignments = await orm.select().from(assignments).where(eq(assignments.createdByUserId, teacherId));
          const assignmentIds = teacherAssignments.map((a) => a.id);
          if (assignmentIds.length === 0) return [];
          submissions = await orm.select().from(assignmentSubmissions).where(inArray(assignmentSubmissions.assignmentId, assignmentIds));
        }
        const result = [];
        for (const submission of submissions) {
          const [student, assignment, profile] = await Promise.all([
            orm.select().from(users).where(eq(users.id, submission.studentUserId)).limit(1),
            orm.select().from(assignments).where(eq(assignments.id, submission.assignmentId)).limit(1),
            orm.select().from(profiles).where(eq(profiles.userId, submission.studentUserId)).limit(1)
          ]);
          if (student[0]) {
            result.push({
              ...submission,
              studentUsername: student[0].username,
              studentName: profile[0]?.name,
              className: profile[0]?.className,
              section: profile[0]?.section,
              assignmentMaxPoints: assignment[0]?.maxPoints
            });
          }
        }
        return result;
      }
      async reviewAssignmentSubmission(teacherUsername, submissionId, decision) {
        const submission = await orm.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.id, submissionId)).limit(1);
        if (!submission[0]) return { ok: false, error: "Submission not found" };
        const teacherId = await this.findUserIdByUsername(teacherUsername);
        if (!teacherId) return { ok: false, error: "Teacher not found" };
        const now = Date.now();
        await orm.update(assignmentSubmissions).set({
          status: decision.status,
          points: decision.points !== void 0 ? decision.points : submission[0].points,
          feedback: decision.feedback || submission[0].feedback,
          reviewedByUserId: teacherId,
          reviewedAt: now
        }).where(eq(assignmentSubmissions.id, submissionId));
        return { ok: true };
      }
      async listAssignmentSubmissionsForAdmin(adminUsername, assignmentId) {
        let submissions = [];
        if (assignmentId) {
          submissions = await orm.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, assignmentId));
        } else {
          const adminId = await this.findUserIdByUsername(adminUsername);
          if (!adminId) return [];
          const adminAssignments = await orm.select().from(assignments).where(
            and(
              eq(assignments.createdByUserId, adminId),
              eq(assignments.visibility, "global")
            )
          );
          const assignmentIds = adminAssignments.map((a) => a.id);
          if (assignmentIds.length === 0) return [];
          submissions = await orm.select().from(assignmentSubmissions).where(inArray(assignmentSubmissions.assignmentId, assignmentIds));
        }
        const result = [];
        for (const submission of submissions) {
          const [student, assignment, profile] = await Promise.all([
            orm.select().from(users).where(eq(users.id, submission.studentUserId)).limit(1),
            orm.select().from(assignments).where(eq(assignments.id, submission.assignmentId)).limit(1),
            orm.select().from(profiles).where(eq(profiles.userId, submission.studentUserId)).limit(1)
          ]);
          if (student[0]) {
            result.push({
              ...submission,
              studentUsername: student[0].username,
              studentName: profile[0]?.name,
              className: profile[0]?.className,
              section: profile[0]?.section,
              assignmentMaxPoints: assignment[0]?.maxPoints
            });
          }
        }
        return result;
      }
      async reviewAdminAssignmentSubmission(adminUsername, submissionId, decision) {
        const submission = await orm.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.id, submissionId)).limit(1);
        if (!submission[0]) return { ok: false, error: "Submission not found" };
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return { ok: false, error: "Admin not found" };
        const now = Date.now();
        await orm.update(assignmentSubmissions).set({
          status: decision.status,
          points: decision.points !== void 0 ? decision.points : submission[0].points,
          feedback: decision.feedback || submission[0].feedback,
          reviewedByUserId: adminId,
          reviewedAt: now
        }).where(eq(assignmentSubmissions.id, submissionId));
        return { ok: true };
      }
      // ============ GAMES ============
      async listGames() {
        const games2 = await orm.select().from(games).orderBy(desc(games.createdAt));
        return games2;
      }
      async listAdminGames(adminUsername) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return [];
        const games2 = await orm.select().from(games).where(eq(games.createdByUserId, adminId)).orderBy(desc(games.createdAt));
        return games2;
      }
      async createAdminGame(adminUsername, input) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return { ok: false, error: "Admin not found" };
        const gameId = input.id || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!gameId) return { ok: false, error: "Invalid game ID" };
        const game = {
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
          createdByUserId: adminId
        };
        await orm.insert(games).values(game);
        return { ok: true, game };
      }
      async updateAdminGame(adminUsername, gameId, updates) {
        const game = await orm.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game[0] || game[0].createdByUserId !== await this.findUserIdByUsername(adminUsername)) {
          return { ok: false, error: "Not found or unauthorized" };
        }
        const updated = { ...game[0], ...updates };
        await orm.update(games).set(updated).where(eq(games.id, gameId));
        return { ok: true, game: updated };
      }
      async deleteAdminGame(adminUsername, gameId) {
        const game = await orm.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game[0] || game[0].createdByUserId !== await this.findUserIdByUsername(adminUsername)) {
          return { ok: false, error: "Not found or unauthorized" };
        }
        await orm.delete(games).where(eq(games.id, gameId));
        return { ok: true };
      }
      async addGamePlay(studentUsername, gameId, points) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return { ok: false, error: "Student not found" };
        const game = await orm.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game[0]) return { ok: false, error: "Game not found" };
        const playId = randomUUID2();
        const play = {
          id: playId,
          gameId,
          studentUserId: studentId,
          playedAt: Date.now(),
          points: points || game[0].points || 0
        };
        await orm.insert(gamePlays).values(play);
        return { ok: true, play };
      }
      async getStudentGameSummary(username) {
        const studentId = await this.findUserIdByUsername(username);
        if (!studentId) {
          return { totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 };
        }
        const plays = await orm.select().from(gamePlays).where(eq(gamePlays.studentUserId, studentId));
        const totalGamePoints = plays.reduce((sum, p) => sum + (p.points || 0), 0);
        const uniqueGames = new Set(plays.map((p) => p.gameId)).size;
        const monthAgo = Date.now() - 30 * 24 * 3600 * 1e3;
        const monthCompleted = plays.filter((p) => p.playedAt >= monthAgo).length;
        const badges = [];
        if (totalGamePoints >= 100) badges.push("\u{1F3AE} Game Master");
        if (uniqueGames >= 5) badges.push("\u{1F30D} Explorer");
        if (monthCompleted >= 10) badges.push("\u26A1 Active Player");
        return {
          totalGamePoints,
          badges,
          monthCompletedCount: monthCompleted,
          totalUniqueGames: uniqueGames
        };
      }
      // ============ LEARNING MODULES & LESSONS ============
      async listLessonCompletions(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const completions = await orm.select().from(lessonCompletions).where(eq(lessonCompletions.studentUserId, studentId)).orderBy(desc(lessonCompletions.completedAt));
        return completions;
      }
      async completeLesson(studentUsername, input) {
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
        const existing = await orm.select().from(lessonCompletions).where(
          and(
            eq(lessonCompletions.studentUserId, studentId),
            eq(lessonCompletions.moduleId, moduleId),
            eq(lessonCompletions.lessonId, lessonId)
          )
        ).limit(1);
        if (existing[0]) {
          return { ok: true, completion: existing[0], alreadyCompleted: true };
        }
        const completion = {
          id: randomUUID2(),
          studentUserId: studentId,
          moduleId,
          moduleTitle,
          lessonId,
          lessonTitle,
          points: Math.floor(points),
          completedAt: Date.now()
        };
        await orm.insert(lessonCompletions).values(completion);
        return { ok: true, completion, alreadyCompleted: false };
      }
      async listLearningModules() {
        const modules = await orm.select().from(learningModules).where(eq(learningModules.deleted, false)).orderBy(asc(learningModules.createdAt));
        return modules.map((m) => ({
          ...m,
          lessons: JSON.parse(m.lessons)
        }));
      }
      async listManagedLearningModules(managerUsername) {
        const managerId = await this.findUserIdByUsername(managerUsername);
        if (!managerId) return [];
        const user = await orm.select().from(users).where(eq(users.id, managerId)).limit(1);
        if (!user[0] || user[0].role !== "admin" && user[0].role !== "teacher") {
          return [];
        }
        return await this.listLearningModules();
      }
      async upsertManagedLearningModule(managerUsername, input) {
        const managerId = await this.findUserIdByUsername(managerUsername);
        if (!managerId) return { ok: false, error: "User not found" };
        const user = await orm.select().from(users).where(eq(users.id, managerId)).limit(1);
        if (!user[0] || user[0].role !== "admin" && user[0].role !== "teacher") {
          return { ok: false, error: "Not allowed" };
        }
        const title = String(input?.title || "").trim();
        if (!title) return { ok: false, error: "Module title is required" };
        const nextId = (String(input?.id || "").trim() || title.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!nextId) return { ok: false, error: "Invalid module id" };
        const rawLessons = Array.isArray(input?.lessons) ? input.lessons : [];
        if (rawLessons.length === 0) return { ok: false, error: "At least one lesson is required" };
        const lessons = [];
        const seenLessonIds = /* @__PURE__ */ new Set();
        for (let i = 0; i < rawLessons.length; i++) {
          const raw = rawLessons[i] || {};
          const lessonTitle = String(raw.title || "").trim();
          if (!lessonTitle) return { ok: false, error: `Lesson ${i + 1} title is required` };
          const lessonId = (String(raw.id || "").trim() || lessonTitle.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
            content: String(raw.content || "").trim() || `<h2>${lessonTitle}</h2><p>Lesson content coming soon.</p>`
          });
        }
        const existing = await orm.select().from(learningModules).where(eq(learningModules.id, nextId)).limit(1);
        const module = {
          id: nextId,
          title,
          description: String(input?.description || "").trim(),
          lessons,
          createdAt: existing[0]?.createdAt || Date.now(),
          updatedAt: Date.now(),
          createdByUserId: existing[0]?.createdByUserId || managerId,
          updatedByUserId: managerId,
          deleted: false
        };
        if (existing[0]) {
          await orm.update(learningModules).set({
            title: module.title,
            description: module.description,
            lessons: JSON.stringify(module.lessons),
            updatedAt: module.updatedAt,
            updatedByUserId: module.updatedByUserId,
            deleted: module.deleted
          }).where(eq(learningModules.id, nextId));
        } else {
          await orm.insert(learningModules).values({
            id: module.id,
            title: module.title,
            description: module.description,
            lessons: JSON.stringify(module.lessons),
            createdAt: module.createdAt,
            updatedAt: module.updatedAt,
            createdByUserId: module.createdByUserId,
            updatedByUserId: module.updatedByUserId,
            deleted: module.deleted
          });
        }
        return { ok: true, module };
      }
      async deleteManagedLearningModule(managerUsername, moduleId) {
        const managerId = await this.findUserIdByUsername(managerUsername);
        if (!managerId) return { ok: false, error: "User not found" };
        const user = await orm.select().from(users).where(eq(users.id, managerId)).limit(1);
        if (!user[0] || user[0].role !== "admin" && user[0].role !== "teacher") {
          return { ok: false, error: "Not allowed" };
        }
        const id = String(moduleId || "").trim();
        if (!id) return { ok: false, error: "Module id is required" };
        const existing = await orm.select().from(learningModules).where(eq(learningModules.id, id)).limit(1);
        const tombstone = {
          id,
          title: existing[0]?.title || id,
          description: existing[0]?.description || "",
          lessons: existing[0]?.lessons || [],
          createdAt: existing[0]?.createdAt || Date.now(),
          updatedAt: Date.now(),
          createdByUserId: existing[0]?.createdByUserId || managerId,
          updatedByUserId: managerId,
          deleted: true
        };
        if (existing[0]) {
          await orm.update(learningModules).set({
            deleted: true,
            updatedAt: Date.now(),
            updatedByUserId: managerId
          }).where(eq(learningModules.id, id));
        } else {
          await orm.insert(learningModules).values({
            id: tombstone.id,
            title: tombstone.title,
            description: tombstone.description,
            lessons: JSON.stringify(tombstone.lessons),
            createdAt: tombstone.createdAt,
            updatedAt: tombstone.updatedAt,
            createdByUserId: tombstone.createdByUserId,
            updatedByUserId: tombstone.updatedByUserId,
            deleted: true
          });
        }
        return { ok: true };
      }
      // ============ NOTIFICATIONS ============
      async listNotifications(username) {
        const userId = await this.findUserIdByUsername(username);
        if (!userId) return [];
        const notifications2 = await orm.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        return notifications2;
      }
      async markAllNotificationsRead(username) {
        const userId = await this.findUserIdByUsername(username);
        if (!userId) return { ok: false, error: "User not found" };
        const now = Date.now();
        await orm.update(notifications).set({ readAt: now }).where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
        return { ok: true };
      }
      async addNotificationForUserId(userId, message, type) {
        await orm.insert(notifications).values({
          id: randomUUID2(),
          userId,
          message,
          type,
          createdAt: Date.now(),
          readAt: null
        });
      }
      // ============ LEADERBOARDS ============
      async getGlobalSchoolsLeaderboard(limit = 25) {
        const schools2 = await orm.select().from(schools);
        const perSchool = /* @__PURE__ */ new Map();
        const schoolProfiles = await orm.select().from(profiles);
        const studentEco = /* @__PURE__ */ new Map();
        for (const profile of schoolProfiles) {
          const schoolId = profile.schoolId || "";
          if (!perSchool.has(schoolId)) {
            perSchool.set(schoolId, { eco: 0, students: 0 });
          }
          if (profile.role === "student") {
            perSchool.get(schoolId).students += 1;
          }
        }
        const approvedSubmissions = await orm.select().from(taskSubmissions).where(eq(taskSubmissions.status, "approved"));
        for (const submission of approvedSubmissions) {
          const profile = schoolProfiles.find((p) => p.userId === submission.studentUserId);
          const schoolId = profile?.schoolId || "";
          if (!perSchool.has(schoolId)) {
            perSchool.set(schoolId, { eco: 0, students: 0 });
          }
          const points = Number(submission.points || 0);
          perSchool.get(schoolId).eco += points;
          studentEco.set(submission.studentUserId, (studentEco.get(submission.studentUserId) || 0) + points);
        }
        const quizzes2 = await orm.select().from(quizzes);
        const quizAttempts2 = await orm.select().from(quizAttempts);
        for (const attempt of quizAttempts2) {
          const quiz = quizzes2.find((q) => q.id === attempt.quizId);
          if (!quiz) continue;
          const profile = schoolProfiles.find((p) => p.userId === attempt.studentUserId);
          const schoolId = profile?.schoolId || "";
          if (!perSchool.has(schoolId)) {
            perSchool.set(schoolId, { eco: 0, students: 0 });
          }
          const points = Number(quiz.points || 0);
          perSchool.get(schoolId).eco += points;
          studentEco.set(attempt.studentUserId, (studentEco.get(attempt.studentUserId) || 0) + points);
        }
        const lessonCompletions2 = await orm.select().from(lessonCompletions);
        for (const completion of lessonCompletions2) {
          const profile = schoolProfiles.find((p) => p.userId === completion.studentUserId);
          const schoolId = profile?.schoolId || "";
          if (!perSchool.has(schoolId)) {
            perSchool.set(schoolId, { eco: 0, students: 0 });
          }
          const points = Number(completion.points || 0);
          perSchool.get(schoolId).eco += points;
          studentEco.set(completion.studentUserId, (studentEco.get(completion.studentUserId) || 0) + points);
        }
        const rows = Array.from(perSchool.entries()).map(([schoolId, v]) => {
          let topStudent;
          for (const profile of schoolProfiles) {
            if (profile.role !== "student" || (profile.schoolId || "") !== schoolId) continue;
            const eco = studentEco.get(profile.userId) || 0;
            if (!topStudent || eco > topStudent.ecoPoints) {
              const user = this.getUser(profile.userId);
              topStudent = { username: profile.username, name: profile.name, ecoPoints: eco };
            }
          }
          return {
            schoolId,
            schoolName: schools2.find((s) => s.id === schoolId)?.name || "Unknown School",
            ecoPoints: v.eco,
            students: v.students,
            topStudent
          };
        });
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        return rows.slice(0, Math.max(1, Math.min(500, limit | 0)));
      }
      async getSchoolStudentsLeaderboard(schoolId, limit = 50, offset = 0) {
        const rows = [];
        const schoolProfiles = await orm.select().from(profiles).where(and(eq(profiles.role, "student"), eq(profiles.schoolId, schoolId)));
        const studentIds = schoolProfiles.map((p) => p.userId);
        if (studentIds.length === 0) return [];
        for (const profile of schoolProfiles) {
          let eco = 0;
          const approvedSubmissions = await orm.select().from(taskSubmissions).where(
            and(
              eq(taskSubmissions.studentUserId, profile.userId),
              eq(taskSubmissions.status, "approved")
            )
          );
          for (const submission of approvedSubmissions) {
            eco += Number(submission.points || 0);
          }
          const quizzes2 = await orm.select().from(quizzes);
          const quizAttempts2 = await orm.select().from(quizAttempts).where(eq(quizAttempts.studentUserId, profile.userId));
          for (const attempt of quizAttempts2) {
            const quiz = quizzes2.find((q) => q.id === attempt.quizId);
            if (quiz) {
              eco += Number(quiz.points || 0);
            }
          }
          const lessonCompletions2 = await orm.select().from(lessonCompletions).where(eq(lessonCompletions.studentUserId, profile.userId));
          for (const completion of lessonCompletions2) {
            eco += Number(completion.points || 0);
          }
          rows.push({ username: profile.username, name: profile.name, ecoPoints: eco });
        }
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(200, limit | 0)));
        return rows.slice(start, end);
      }
      async getStudentPreview(targetUsername) {
        const studentId = await this.findUserIdByUsername(targetUsername);
        if (!studentId) return null;
        const user = await orm.select().from(users).where(eq(users.id, studentId)).limit(1);
        if (!user[0] || user[0].role !== "student") return null;
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        let eco = 0;
        const approvedSubmissions = await orm.select().from(taskSubmissions).where(
          and(eq(taskSubmissions.studentUserId, studentId), eq(taskSubmissions.status, "approved"))
        );
        for (const submission of approvedSubmissions) {
          eco += Number(submission.points || 0);
        }
        const quizzes2 = await orm.select().from(quizzes);
        const quizAttempts2 = await orm.select().from(quizAttempts).where(eq(quizAttempts.studentUserId, studentId));
        for (const attempt of quizAttempts2) {
          const quiz = quizzes2.find((q) => q.id === attempt.quizId);
          if (quiz) {
            eco += Number(quiz.points || 0);
          }
        }
        const lessonCompletions2 = await orm.select().from(lessonCompletions).where(eq(lessonCompletions.studentUserId, studentId));
        for (const completion of lessonCompletions2) {
          eco += Number(completion.points || 0);
        }
        const p = profile[0];
        return { username: user[0].username, name: p?.name, ecoPoints: eco, schoolId: p?.schoolId };
      }
      async getGlobalStudentsLeaderboard(limit = 50, offset = 0, schoolIdFilter = null) {
        const rows = [];
        const schools2 = await orm.select().from(schools);
        const profiles2 = await orm.select().from(profiles).where(eq(profiles.role, "student"));
        const users2 = await orm.select().from(users);
        for (const profile of profiles2) {
          if (schoolIdFilter && profile.schoolId !== schoolIdFilter) continue;
          const user = users2.find((u) => u.id === profile.userId);
          if (!user) continue;
          let eco = 0;
          let tasksApproved = 0;
          let quizzesCompleted = 0;
          const approvedSubmissions = await orm.select().from(taskSubmissions).where(
            and(
              eq(taskSubmissions.studentUserId, profile.userId),
              eq(taskSubmissions.status, "approved")
            )
          );
          for (const submission of approvedSubmissions) {
            eco += Number(submission.points || 0);
            tasksApproved++;
          }
          const quizzes2 = await orm.select().from(quizzes);
          const quizAttempts2 = await orm.select().from(quizAttempts).where(eq(quizAttempts.studentUserId, profile.userId));
          for (const attempt of quizAttempts2) {
            const quiz = quizzes2.find((q) => q.id === attempt.quizId);
            if (quiz) {
              eco += Number(quiz.points || 0);
              quizzesCompleted++;
            }
          }
          const lessonCompletions2 = await orm.select().from(lessonCompletions).where(eq(lessonCompletions.studentUserId, profile.userId));
          for (const completion of lessonCompletions2) {
            eco += Number(completion.points || 0);
          }
          const schoolName = schools2.find((s) => s.id === profile.schoolId)?.name;
          const achievements = [];
          if (tasksApproved > 0) achievements.push("\u{1F947} First Task");
          if (quizzesCompleted >= 3) achievements.push("\u{1F9E0} Quiz Master");
          if (eco >= 100) achievements.push("\u{1F332} Small Tree");
          if (eco >= 500) achievements.push("\u{1F333} Big Tree");
          rows.push({
            username: user.username,
            name: profile.name,
            schoolId: profile.schoolId,
            schoolName,
            ecoPoints: eco,
            achievements,
            snapshot: { tasksApproved, quizzesCompleted }
          });
        }
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
        return rows.slice(start, end);
      }
      async getGlobalTeachersLeaderboard(limit = 50, offset = 0, schoolIdFilter = null) {
        const rows = [];
        const schools2 = await orm.select().from(schools);
        const users2 = await orm.select().from(users).where(eq(users.role, "teacher"));
        const profiles2 = await orm.select().from(profiles);
        const quizzes2 = await orm.select().from(quizzes);
        for (const user of users2) {
          const profile = profiles2.find((p) => p.userId === user.id);
          if (!profile || schoolIdFilter && profile.schoolId !== schoolIdFilter) continue;
          const tasks2 = await orm.select().from(tasks).where(eq(tasks.createdByUserId, user.id));
          const tasksCreated = tasks2.length;
          const taskIds = tasks2.map((t) => t.id);
          let eco = 0;
          if (taskIds.length > 0) {
            const approvedSubmissions = await orm.select().from(taskSubmissions).where(
              and(inArray(taskSubmissions.taskId, taskIds), eq(taskSubmissions.status, "approved"))
            );
            for (const submission of approvedSubmissions) {
              eco += Number(submission.points || 0);
            }
          }
          const teacherQuizzes = quizzes2.filter((q) => q.createdByUserId === user.id && q.visibility === "school");
          const quizzesCreated = teacherQuizzes.length;
          const quizAttempts2 = await orm.select().from(quizAttempts);
          for (const attempt of quizAttempts2) {
            const quiz = teacherQuizzes.find((q) => q.id === attempt.quizId);
            if (quiz) {
              eco += Number(quiz.points || 0);
            }
          }
          const schoolName = schools2.find((s) => s.id === profile.schoolId)?.name;
          rows.push({
            username: user.username,
            name: profile.name,
            schoolId: profile.schoolId,
            schoolName,
            ecoPoints: eco,
            tasksCreated,
            quizzesCreated
          });
        }
        rows.sort((a, b) => b.ecoPoints - a.ecoPoints);
        const start = Math.max(0, offset | 0);
        const end = Math.min(rows.length, start + Math.max(1, Math.min(500, limit | 0)));
        return rows.slice(start, end);
      }
      async getSchoolPreview(schoolId) {
        const school = await orm.select().from(schools).where(eq(schools.id, schoolId)).limit(1);
        if (!school[0]) return null;
        const leaderboard = await this.getSchoolStudentsLeaderboard(schoolId, 1e3, 0);
        const top = leaderboard[0];
        const eco = leaderboard.reduce((acc, r) => acc + Number(r.ecoPoints || 0), 0);
        const students = leaderboard.length;
        return {
          schoolId,
          schoolName: school[0].name,
          ecoPoints: eco,
          students,
          topStudent: top ? { username: top.username, name: top.name, ecoPoints: top.ecoPoints } : void 0
        };
      }
      async getTeacherPreview(targetUsername) {
        const teacherId = await this.findUserIdByUsername(targetUsername);
        if (!teacherId) return null;
        const user = await orm.select().from(users).where(eq(users.id, teacherId)).limit(1);
        if (!user[0] || user[0].role !== "teacher") return null;
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, teacherId)).limit(1);
        const schools2 = await orm.select().from(schools);
        const schoolName = schools2.find((s) => s.id === profile[0]?.schoolId)?.name;
        const tasks2 = await orm.select().from(tasks).where(eq(tasks.createdByUserId, teacherId));
        const tasksCreated = tasks2.length;
        const taskIds = tasks2.map((t) => t.id);
        let eco = 0;
        if (taskIds.length > 0) {
          const approvedSubmissions = await orm.select().from(taskSubmissions).where(
            and(inArray(taskSubmissions.taskId, taskIds), eq(taskSubmissions.status, "approved"))
          );
          for (const submission of approvedSubmissions) {
            eco += Number(submission.points || 0);
          }
        }
        const quizzes2 = await orm.select().from(quizzes);
        const teacherQuizzes = quizzes2.filter((q) => q.createdByUserId === teacherId && q.visibility === "school");
        const quizzesCreated = teacherQuizzes.length;
        const quizAttempts2 = await orm.select().from(quizAttempts);
        for (const attempt of quizAttempts2) {
          const quiz = teacherQuizzes.find((q) => q.id === attempt.quizId);
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
          quizzesCreated
        };
      }
      async getAdminLeaderboardAnalytics() {
        const now = /* @__PURE__ */ new Date();
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - diffToMonday);
        const startMs = monday.getTime();
        const activeSchoolIds = /* @__PURE__ */ new Set();
        let totalEcoPointsThisWeek = 0;
        const weekSubmissions = await orm.select().from(taskSubmissions).where(eq(taskSubmissions.status, "approved"));
        for (const submission of weekSubmissions) {
          const reviewedAt = submission.reviewedAt || submission.submittedAt;
          if (reviewedAt >= startMs) {
            const profile = await orm.select().from(profiles).where(eq(profiles.userId, submission.studentUserId)).limit(1);
            if (profile[0]?.schoolId) {
              activeSchoolIds.add(profile[0].schoolId);
            }
            totalEcoPointsThisWeek += Number(submission.points || 0);
          }
        }
        const quizAttempts2 = await orm.select().from(quizAttempts);
        const quizzes2 = await orm.select().from(quizzes);
        for (const attempt of quizAttempts2) {
          if (attempt.attemptedAt >= startMs) {
            const profile = await orm.select().from(profiles).where(eq(profiles.userId, attempt.studentUserId)).limit(1);
            if (profile[0]?.schoolId) {
              activeSchoolIds.add(profile[0].schoolId);
            }
            const quiz = quizzes2.find((q) => q.id === attempt.quizId);
            if (quiz) {
              totalEcoPointsThisWeek += Number(quiz.points || 0);
            }
          }
        }
        const lessonCompletions2 = await orm.select().from(lessonCompletions);
        for (const completion of lessonCompletions2) {
          if (completion.completedAt >= startMs) {
            const profile = await orm.select().from(profiles).where(eq(profiles.userId, completion.studentUserId)).limit(1);
            if (profile[0]?.schoolId) {
              activeSchoolIds.add(profile[0].schoolId);
            }
            totalEcoPointsThisWeek += Number(completion.points || 0);
          }
        }
        let newStudentsThisWeek = 0;
        const seenBefore = /* @__PURE__ */ new Set();
        for (const submission of weekSubmissions) {
          if (submission.status === "approved" && (submission.reviewedAt || submission.submittedAt) < startMs) {
            seenBefore.add(submission.studentUserId);
          }
        }
        for (const attempt of quizAttempts2) {
          if (attempt.attemptedAt < startMs) {
            seenBefore.add(attempt.studentUserId);
          }
        }
        for (const completion of lessonCompletions2) {
          if (completion.completedAt < startMs) {
            seenBefore.add(completion.studentUserId);
          }
        }
        const activeThisWeek = /* @__PURE__ */ new Set();
        for (const submission of weekSubmissions) {
          if (submission.status === "approved" && (submission.reviewedAt || submission.submittedAt) >= startMs) {
            activeThisWeek.add(submission.studentUserId);
          }
        }
        for (const attempt of quizAttempts2) {
          if (attempt.attemptedAt >= startMs) {
            activeThisWeek.add(attempt.studentUserId);
          }
        }
        for (const completion of lessonCompletions2) {
          if (completion.completedAt >= startMs) {
            activeThisWeek.add(completion.studentUserId);
          }
        }
        activeThisWeek.forEach((id) => {
          if (!seenBefore.has(id)) newStudentsThisWeek++;
        });
        const schools2 = await orm.select().from(schools);
        const inactiveSchools = [];
        for (const school of schools2) {
          if (!activeSchoolIds.has(school.id)) {
            inactiveSchools.push({ schoolId: school.id, schoolName: school.name });
          }
        }
        return {
          activeSchoolsThisWeek: activeSchoolIds.size,
          newStudentsThisWeek,
          totalEcoPointsThisWeek,
          inactiveSchools
        };
      }
      // ============ VIDEOS & CREDITS ============
      async getAllVideos() {
        const videos2 = await orm.select().from(videos).orderBy(desc(videos.uploadedAt));
        return videos2;
      }
      async getTeacherVideos(teacherId) {
        const videos2 = await orm.select().from(videos).where(eq(videos.uploadedBy, teacherId)).orderBy(desc(videos.uploadedAt));
        return videos2;
      }
      async getTeacherVideosCount(teacherUsername) {
        const teacher = await this.findUserIdByUsername(teacherUsername);
        if (!teacher) return 0;
        const videos2 = await orm.select().from(videos).where(eq(videos.uploadedBy, teacher));
        return videos2.length;
      }
      async createVideo(input) {
        const video = {
          id: randomUUID2(),
          title: input.title,
          description: input.description,
          type: input.type,
          url: input.url,
          thumbnail: input.thumbnail,
          credits: input.credits,
          uploadedBy: input.uploadedBy,
          uploadedAt: Date.now(),
          category: input.category,
          duration: input.duration
        };
        await orm.insert(videos).values(video);
        return video;
      }
      async updateVideo(id, updates) {
        const updated = { ...updates, uploadedAt: Date.now() };
        await orm.update(videos).set(updated).where(eq(videos.id, id));
        const video = await orm.select().from(videos).where(eq(videos.id, id)).limit(1);
        return video[0];
      }
      async deleteVideo(id) {
        await orm.delete(videos).where(eq(videos.id, id));
      }
      async getUserCredits(username) {
        const userId = await this.findUserIdByUsername(username);
        if (!userId) return { totalCredits: 0, lastUpdated: Date.now() };
        const credits = await orm.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
        if (!credits[0]) {
          return { totalCredits: 0, lastUpdated: Date.now() };
        }
        return { totalCredits: credits[0].totalCredits, lastUpdated: credits[0].lastUpdated };
      }
      async recordVideoWatch(username, videoId) {
        const userId = await this.findUserIdByUsername(username);
        if (!userId) return { success: false, creditsAwarded: 0 };
        const video = await orm.select().from(videos).where(eq(videos.id, videoId)).limit(1);
        if (!video[0]) return { success: false, creditsAwarded: 0 };
        const existing = await orm.select().from(userVideoProgress).where(and(eq(userVideoProgress.userId, userId), eq(userVideoProgress.videoId, videoId))).limit(1);
        if (existing[0]?.creditsAwarded) {
          return { success: false, creditsAwarded: 0 };
        }
        const progressId = existing[0]?.id || randomUUID2();
        await orm.insert(userVideoProgress).values({
          id: progressId,
          userId,
          videoId,
          watched: 1,
          watchedAt: Date.now(),
          creditsAwarded: 1
        }).onConflictDoUpdate({
          target: userVideoProgress.id,
          set: {
            watched: 1,
            watchedAt: Date.now(),
            creditsAwarded: 1
          }
        });
        const credits = video[0].credits;
        const userCredits2 = await orm.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
        if (userCredits2[0]) {
          await orm.update(userCredits).set({
            totalCredits: userCredits2[0].totalCredits + credits,
            lastUpdated: Date.now()
          }).where(eq(userCredits.userId, userId));
        } else {
          await orm.insert(userCredits).values({
            id: randomUUID2(),
            userId,
            totalCredits: credits,
            lastUpdated: Date.now()
          });
        }
        return { success: true, creditsAwarded: credits };
      }
      async awardCredits(username, videoId, credits) {
        const userId = await this.findUserIdByUsername(username);
        if (!userId) return { success: false, newTotal: 0 };
        let userCredits2 = await orm.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
        if (userCredits2[0]) {
          const newTotal = userCredits2[0].totalCredits + credits;
          await orm.update(userCredits).set({ totalCredits: newTotal, lastUpdated: Date.now() }).where(eq(userCredits.userId, userId));
          return { success: true, newTotal };
        } else {
          await orm.insert(userCredits).values({
            id: randomUUID2(),
            userId,
            totalCredits: credits,
            lastUpdated: Date.now()
          });
          return { success: true, newTotal: credits };
        }
      }
      async fetchYouTubeMetadata(url) {
        return {
          title: "Video Title",
          description: "Video Description",
          thumbnail: "",
          duration: 0
        };
      }
      // ============ SEEDING / DEMO DATA ============
      async seedSchoolsAndStudents(input) {
        return { schoolsCreated: 0, studentsCreated: 0 };
      }
      // ============ HELPER METHODS ============
      async findUserEntryByUsername(username) {
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        return user[0] ? [user[0].id, user[0]] : null;
      }
      // Stub methods for features not yet implemented
      async getStudentProfile(username) {
        const uid = await this.findUserIdByUsername(username);
        if (!uid) return null;
        const user = await orm.select().from(users).where(eq(users.id, uid)).limit(1);
        if (!user[0] || user[0].role !== "student") return null;
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
          unreadNotifications: 0
        };
      }
      async setStudentPrivacy(username, allowExternalView) {
        const uid = await this.findUserIdByUsername(username);
        if (!uid) return { ok: false, error: "User not found" };
        await orm.update(profiles).set({ allowExternalView: allowExternalView ? 1 : 0 }).where(eq(profiles.userId, uid));
        return { ok: true };
      }
      async updateAdminQuiz(adminUsername, id, updates) {
        return await this.updateQuiz(adminUsername, id, updates);
      }
      async deleteAdminQuiz(adminUsername, id) {
        return await this.deleteQuiz(adminUsername, id);
      }
      async createAdminQuiz(adminUsername, input) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return { ok: false, error: "Admin not found" };
        const quizId = randomUUID2();
        const questions = input.questions.map((q) => ({
          ...q,
          id: randomUUID2()
        }));
        const quiz = {
          id: quizId,
          title: input.title,
          description: input.description,
          points: input.points || 0,
          createdByUserId: adminId,
          schoolId: "",
          createdAt: Date.now(),
          questions,
          visibility: "global"
        };
        await orm.insert(quizzes).values({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          points: quiz.points,
          createdByUserId: quiz.createdByUserId,
          schoolId: quiz.schoolId,
          createdAt: quiz.createdAt,
          questions: JSON.stringify(quiz.questions),
          visibility: quiz.visibility
        });
        return { ok: true, quiz };
      }
      async listAdminQuizzes(adminUsername) {
        const adminId = await this.findUserIdByUsername(adminUsername);
        if (!adminId) return [];
        const quizzes2 = await orm.select().from(quizzes).where(
          and(
            eq(quizzes.createdByUserId, adminId),
            eq(quizzes.visibility, "global")
          )
        ).orderBy(desc(quizzes.createdAt));
        return quizzes2.map((q) => ({
          ...q,
          questions: typeof q.questions === "string" ? JSON.parse(q.questions) : q.questions
        }));
      }
      async listStudentQuizzesInternal(studentUsername) {
        const studentId = await this.findUserIdByUsername(studentUsername);
        if (!studentId) return [];
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, studentId)).limit(1);
        const schoolId = profile[0]?.schoolId;
        const quizzes2 = await orm.select().from(quizzes).where(
          or(
            eq(quizzes.visibility, "global"),
            schoolId ? eq(quizzes.schoolId, schoolId) : void 0
          )
        ).orderBy(desc(quizzes.createdAt));
        return quizzes2.map((q) => ({
          ...q,
          questions: typeof q.questions === "string" ? JSON.parse(q.questions) : q.questions
        }));
      }
      async getUserDetails(username) {
        const user = await orm.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user[0]) return { status: "none", username };
        const profile = await orm.select().from(profiles).where(eq(profiles.userId, user[0].id)).limit(1);
        return {
          status: "approved",
          username: user[0].username,
          role: user[0].role,
          password: user[0].password,
          ...profile[0]
        };
      }
    };
  }
});

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import path2 from "path";
import { randomBytes } from "crypto";

// server/email.ts
import nodemailer from "nodemailer";
var MAIL_USER = process.env.GMAIL_USER || process.env.EMAIL;
var MAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
var MAIL_FROM_NAME = process.env.GMAIL_FROM_NAME || "EcoVerse Platform";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});
async function sendEmail(options) {
  try {
    const mailOptions = {
      from: `${MAIL_FROM_NAME} <${MAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || "Please enable HTML emails to view this message.",
      ...options.replyTo ? { replyTo: options.replyTo } : {}
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
async function sendWelcomeEmail(email, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0;">Welcome to EcoVerse!</h1>
      </div>
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>Thank you for signing up to EcoVerse! We're excited to have you join our community dedicated to environmental excellence and gamified learning.</p>
        <p>You can now:</p>
        <ul>
          <li>Complete interactive environmental missions</li>
          <li>Earn eco-points and badges</li>
          <li>Join community challenges</li>
          <li>Track your environmental impact</li>
        </ul>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || "http://localhost:5000"}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: "Welcome to EcoVerse!",
    html
  });
}
async function sendApplicationStatusEmail(email, name, status, message) {
  const statusColors = {
    approved: "#10b981",
    rejected: "#ef4444",
    pending: "#f59e0b"
  };
  const statusMessages = {
    approved: "Your application has been approved! You can now access EcoVerse.",
    rejected: "Unfortunately, your application was not approved at this time.",
    pending: "Your application is being reviewed. We will notify you soon."
  };
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${statusColors[status]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; text-transform: capitalize;">Application ${status}</h1>
      </div>
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>${statusMessages[status]}</p>
        ${message ? `<p style="background: #fff; padding: 15px; border-left: 4px solid ${statusColors[status]};">${message}</p>` : ""}
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: `EcoVerse Application - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  const storage2 = globalThis.storage;
  const SESSION_COOKIE = "ev_session";
  const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1e3;
  const SESSION_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1e3;
  const sessions = /* @__PURE__ */ new Map();
  const parseCookies = (cookieHeader) => {
    const out = {};
    if (!cookieHeader) return out;
    for (const item of cookieHeader.split(";")) {
      const [rawKey, ...rest] = item.trim().split("=");
      if (!rawKey) continue;
      out[rawKey] = decodeURIComponent(rest.join("=") || "");
    }
    return out;
  };
  const setSessionCookie = (res, sid) => {
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_ABSOLUTE_TIMEOUT_MS
    });
  };
  const clearSessionCookie = (res) => {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });
  };
  const getActiveSession = (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
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
  const protectedPrefixes = ["/api/me", "/api/student", "/api/teacher", "/api/admin", "/api/learning"];
  app2.use((req, res, next) => {
    if (!req.path.startsWith("/api/")) return next();
    const needsSession = protectedPrefixes.some((prefix) => req.path.startsWith(prefix));
    if (!needsSession) return next();
    const session = getActiveSession(req, res);
    if (!session) {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    req.headers["x-username"] = session.username;
    req.headers["x-role"] = session.role;
    next();
  });
  const modelsRoot = path2.join(process.cwd(), "public", "models");
  app2.use("/api/models", express.static(modelsRoot));
  app2.get("/api/models/:file", (req, res) => {
    const { file } = req.params;
    if (!/^[A-Za-z0-9._-]+\.(glb|gltf)$/.test(file)) {
      return res.status(400).json({ error: "Invalid model filename" });
    }
    const filePath = path2.join(process.cwd(), "public", "models", file);
    res.type(path2.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error serving model file:", err);
        res.status(404).json({ error: "Model not found" });
      }
    });
  });
  app2.get("/api/image/:file", (req, res) => {
    const { file } = req.params;
    if (!/^[A-Za-z0-9._()-]+\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
      return res.status(400).json({ error: "Invalid image filename" });
    }
    const filePath = path2.join(process.cwd(), "public", file);
    res.type(path2.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error serving image file:", err);
        res.status(404).json({ error: "Image not found" });
      }
    });
  });
  const gamesRoot = path2.join(process.cwd(), "public", "games");
  app2.use("/embedded-games", express.static(gamesRoot));
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/games", async (_req, res) => {
    const list = await storage2.listGames();
    res.json(list);
  });
  app2.get("/api/schools", async (_req, res) => {
    const schools2 = await storage2.listSchools();
    res.json(schools2);
  });
  const resolveSchoolIdFromInput = async (rawSchool) => {
    const input = String(rawSchool ?? "").trim();
    if (!input) return null;
    const schools2 = await storage2.listSchools();
    const byId = schools2.find((s) => s.id === input);
    if (byId) return byId.id;
    const normalizedInput = input.toLowerCase();
    const byName = schools2.find((s) => s.name.trim().toLowerCase() === normalizedInput);
    if (byName) return byName.id;
    const created = await storage2.addSchool(input);
    return created.id;
  };
  app2.post("/api/admin/schools", async (req, res) => {
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Invalid school name" });
    }
    const created = await storage2.addSchool(name.trim());
    res.json(created);
  });
  app2.delete("/api/admin/schools/:id", async (req, res) => {
    const ok = await storage2.removeSchool(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });
  app2.post("/api/signup/student", async (req, res) => {
    const { name, email, username, schoolId, id, rollNumber, className, section, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: "Missing fields" });
    if (!await storage2.isUsernameAvailable(username)) return res.status(409).json({ error: "Username taken" });
    const resolvedSchoolId = await resolveSchoolIdFromInput(schoolId);
    if (!resolvedSchoolId) return res.status(400).json({ error: "Invalid school name" });
    const appData = {
      name,
      email,
      username,
      schoolId: resolvedSchoolId,
      studentId: id,
      rollNumber,
      className,
      section,
      photoDataUrl,
      password
    };
    const created = await storage2.addStudentApplication(appData);
    res.json(created);
  });
  app2.post("/api/signup/teacher", async (req, res) => {
    const { name, email, username, schoolId, id, subject, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: "Missing fields" });
    if (!await storage2.isUsernameAvailable(username)) return res.status(409).json({ error: "Username taken" });
    const resolvedSchoolId = await resolveSchoolIdFromInput(schoolId);
    if (!resolvedSchoolId) return res.status(400).json({ error: "Invalid school name" });
    const appData = {
      name,
      email,
      username,
      schoolId: resolvedSchoolId,
      teacherId: id,
      subject,
      photoDataUrl,
      password
    };
    const created = await storage2.addTeacherApplication(appData);
    res.json(created);
  });
  app2.get("/api/admin/pending", async (_req, res) => {
    const data = await storage2.listPending();
    res.json(data);
  });
  app2.post("/api/admin/approve/:type/:id", async (req, res) => {
    const type = req.params.type === "student" ? "student" : "teacher";
    const ok = await storage2.approveApplication(type, req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });
  app2.post("/api/admin/approve-all", async (_req, res) => {
    const data = await storage2.listPending();
    let approvedStudents = 0;
    let approvedTeachers = 0;
    for (const s of data.students) {
      const ok = await storage2.approveApplication("student", s.id);
      if (ok) approvedStudents++;
    }
    for (const t of data.teachers) {
      const ok = await storage2.approveApplication("teacher", t.id);
      if (ok) approvedTeachers++;
    }
    res.json({ ok: true, approvedStudents, approvedTeachers });
  });
  app2.get("/api/admin/users", async (_req, res) => {
    const users2 = storage2.users;
    const roles = storage2.roles;
    const list = Array.from(users2?.values?.() ?? []).map((u) => ({ username: u.username, role: roles?.get(u.id) || "student" }));
    res.json(list);
  });
  app2.get("/api/admin/user/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Missing username" });
    const details = await storage2.getUserDetails(username);
    res.json(details);
  });
  app2.post("/api/admin/reset-password", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });
    const ok = await storage2.resetPassword(username, password);
    if (!ok) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  });
  app2.post("/api/admin/unapprove", async (req, res) => {
    const { username } = req.body ?? {};
    if (!username) return res.status(400).json({ error: "Missing username" });
    const ok = await storage2.unapproveUser(username);
    if (!ok) return res.status(404).json({ error: "User not found or cannot be unapproved" });
    res.json({ ok: true });
  });
  app2.get("/api/username-available/:username", async (req, res) => {
    const available = await storage2.isUsernameAvailable(req.params.username);
    res.json({ available });
  });
  app2.post("/api/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });
    const found = await storage2.getUserByUsername(username);
    if (!found || found.password !== password) {
      return res.status(401).json({ ok: false });
    }
    if (found.role !== "admin" && !found.approved) {
      return res.status(401).json({ ok: false, error: "Account not approved yet" });
    }
    const role = found.role;
    const existing = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (existing) sessions.delete(existing);
    const sid = randomBytes(32).toString("hex");
    const now = Date.now();
    sessions.set(sid, {
      sid,
      username: found.username,
      role,
      createdAt: now,
      lastActivityAt: now
    });
    setSessionCookie(res, sid);
    res.json({
      ok: true,
      role,
      username: found.username,
      idleTimeoutMs: SESSION_IDLE_TIMEOUT_MS,
      absoluteTimeoutMs: SESSION_ABSOLUTE_TIMEOUT_MS
    });
  });
  app2.post("/api/logout", async (req, res) => {
    const sid = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (sid) sessions.delete(sid);
    clearSessionCookie(res);
    res.json({ ok: true });
  });
  app2.get("/api/session", async (req, res) => {
    const session = getActiveSession(req, res);
    if (!session) return res.status(401).json({ ok: false });
    const now = Date.now();
    res.json({
      ok: true,
      username: session.username,
      role: session.role,
      expiresInMs: Math.min(
        SESSION_IDLE_TIMEOUT_MS - (now - session.lastActivityAt),
        SESSION_ABSOLUTE_TIMEOUT_MS - (now - session.createdAt)
      )
    });
  });
  app2.post("/api/session/ping", async (req, res) => {
    const session = getActiveSession(req, res);
    if (!session) return res.status(401).json({ ok: false });
    const now = Date.now();
    res.json({
      ok: true,
      expiresInMs: Math.min(
        SESSION_IDLE_TIMEOUT_MS - (now - session.lastActivityAt),
        SESSION_ABSOLUTE_TIMEOUT_MS - (now - session.createdAt)
      )
    });
  });
  app2.get("/api/application-status/:username", async (req, res) => {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: "Missing username" });
    try {
      const status = await storage2.getApplicationStatus(username);
      res.json({ status });
    } catch (e) {
      res.status(500).json({ error: "Status check failed" });
    }
  });
  app2.post("/api/otp/request", async (req, res) => {
    const { email } = req.body ?? {};
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) return res.status(400).json({ error: "Email required" });
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    await storage2.saveOtp(normalizedEmail, code, 5 * 60 * 1e3);
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Your OTP Code",
        text: `Your OTP is: ${code}. It expires in 5 minutes.`,
        html: `<p>Your OTP is: <strong>${code}</strong>. It expires in 5 minutes.</p>`
      });
      res.json({ ok: true });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: "Failed to send OTP email" });
    }
  });
  app2.post("/api/otp/verify", async (req, res) => {
    const { email, code } = req.body ?? {};
    if (!email || !code) return res.status(400).json({ error: "Email and code required" });
    const ok = await storage2.verifyOtp(email, code);
    res.json({ ok });
  });
  app2.post("/api/contact", async (req, res) => {
    const { name, email, category, subject, message } = req.body ?? {};
    const senderName = String(name || "").trim();
    const senderEmail = String(email || "").trim();
    const contactCategory = String(category || "").trim();
    const contactSubject = String(subject || "").trim();
    const contactMessage = String(message || "").trim();
    if (!senderName || !senderEmail || !contactCategory || !contactSubject || !contactMessage) {
      return res.status(400).json({ error: "All contact fields are required" });
    }
    const supportInbox = process.env.EMAIL || process.env.GMAIL_USER || process.env.SUPPORT_EMAIL || "ecoverse.academy@gmail.com";
    await sendEmail({
      to: supportInbox,
      subject: `[Contact:${contactCategory}] ${contactSubject}`,
      text: `Name: ${senderName}
Email: ${senderEmail}
Category: ${contactCategory}
Subject: ${contactSubject}

Message:
${contactMessage}`,
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
      `
    });
    res.json({ ok: true, deliveredTo: supportInbox });
  });
  app2.get("/api/me/profile", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const p = await storage2.getOwnProfile(current);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  });
  app2.put("/api/me/profile", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const r = await storage2.updateOwnProfile(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.profile);
  });
  app2.get("/api/admin/admins", async (_req, res) => {
    const list = await storage2.listAdmins();
    res.json(list);
  });
  app2.post("/api/admin/admins", async (req, res) => {
    const { username, password, name, email } = req.body ?? {};
    const r = await storage2.createAdmin({ username, password, name, email });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.put("/api/admin/admins/:username", async (req, res) => {
    const current = req.headers["x-username"] || void 0;
    const r = await storage2.updateAdmin(req.params.username, req.body ?? {}, current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.delete("/api/admin/admins/:username", async (req, res) => {
    const r = await storage2.deleteAdmin(req.params.username);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  if (process.env.NODE_ENV !== "production") {
    app2.post("/api/dev/seed-teacher-tasks", async (req, res) => {
      try {
        const teacher = req.body?.username || "test_teacher";
        const count = Number.isFinite(req.body?.count) ? Math.max(1, Math.min(100, Number(req.body.count))) : 12;
        const create = async (input) => {
          return await storage2.createTask(teacher, input);
        };
        const pool = [
          { title: "Recycle Drive", description: "Collect and sort recyclables from your neighborhood.", maxPoints: 8, proofType: "photo", groupMode: "group", maxGroupSize: 4 },
          { title: "Plant a Tree", description: "Plant a sapling and document the process.", maxPoints: 10, proofType: "photo", groupMode: "solo" },
          { title: "Clean-Up Challenge", description: "Clean a local area and show before/after photos.", maxPoints: 9, proofType: "photo", groupMode: "group", maxGroupSize: 5 },
          { title: "Water Audit", description: "Audit household water usage and suggest savings.", maxPoints: 7, proofType: "text", groupMode: "solo" },
          { title: "Energy Saver Week", description: "Track and reduce electricity consumption for a week.", maxPoints: 8, proofType: "text", groupMode: "solo" },
          { title: "Eco Poster", description: "Design a poster promoting an eco-friendly habit.", maxPoints: 6, proofType: "photo", groupMode: "solo" },
          { title: "Compost Starter", description: "Start a compost bin and log the steps.", maxPoints: 8, proofType: "photo", groupMode: "group", maxGroupSize: 3 },
          { title: "Biodiversity Walk", description: "List 10 species found in your area with photos.", maxPoints: 9, proofType: "photo", groupMode: "group", maxGroupSize: 4 },
          { title: "Plastic-Free Day", description: "Go plastic-free for a day and report findings.", maxPoints: 7, proofType: "text", groupMode: "solo" },
          { title: "Rainwater Harvesting Plan", description: "Draft a simple harvesting plan for your building.", maxPoints: 10, proofType: "text", groupMode: "group", maxGroupSize: 4 },
          { title: "School Garden Duty", description: "Maintain a garden patch for a week.", maxPoints: 8, proofType: "photo", groupMode: "group", maxGroupSize: 5 },
          { title: "Green Transport Day", description: "Use non-motorized or public transport; log your route.", maxPoints: 6, proofType: "text", groupMode: "solo" }
        ];
        const created = [];
        for (let i = 0; i < count; i++) {
          const base = pool[i % pool.length];
          const variant = {
            ...base,
            title: `${base.title} #${i + 1}`,
            deadline: void 0
          };
          const r = await create(variant);
          if (r?.ok) created.push(r.task);
        }
        res.json({ ok: true, count: created.length, username: teacher });
      } catch (e) {
        res.status(500).json({ error: "Seed failed" });
      }
    });
    app2.post("/api/dev/seed-quizzes", async (req, res) => {
      try {
        const body = req.body ?? {};
        const adminCount = Number.isFinite(body.adminCount) ? Math.max(0, Math.min(100, Number(body.adminCount))) : void 0;
        const teacherCount = Number.isFinite(body.teacherCount) ? Math.max(0, Math.min(100, Number(body.teacherCount))) : void 0;
        const adminUsername = body.adminUsername || "admin123";
        const teacherUsername = body.teacherUsername || "test_teacher";
        if (adminCount == null && teacherCount == null) {
          const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          storage3.seedDemoQuizzes?.();
          return res.json({ ok: true, mode: "demo" });
        }
        const topics = [
          "Climate Action",
          "Oceans",
          "Forests",
          "Wildlife",
          "Renewables",
          "Water Conservation",
          "Recycling",
          "Pollution",
          "Sustainable Cities",
          "Energy Efficiency",
          "Biodiversity",
          "Soil Health",
          "Green Transport",
          "Circular Economy",
          "Air Quality"
        ];
        const optBank = [
          "Reduce carbon emissions",
          "Increase plastic use",
          "Cut more trees",
          "Ignore pollution",
          "Install solar panels",
          "Burn more coal",
          "Dump waste in oceans",
          "Save energy at home"
        ];
        const makeQuestion = (qIdx) => {
          const correctIndex = Math.floor(Math.random() * 4);
          const base = qIdx % (optBank.length - 4);
          const options = [0, 1, 2, 3].map((i) => optBank[(base + i) % optBank.length]);
          const text2 = `Q${qIdx + 1}. Choose the best eco-friendly action.`;
          return { id: qIdx + 1, text: text2, options, answerIndex: correctIndex };
        };
        const makeQuiz = (i, scope) => {
          const title = `${scope === "global" ? "Global" : "School"} Quiz ${i + 1}: ${topics[i % topics.length]}`;
          const description = `Test your knowledge on ${topics[i % topics.length]}.`;
          const points = 10 + i % 5 * 2;
          const questions = Array.from({ length: 5 }, (_, qi) => makeQuestion(qi));
          return { title, description, points, questions };
        };
        let adminCreated = 0;
        let teacherCreated = 0;
        const createAdminQuiz = async (q) => {
          const r = await storage2.createAdminQuiz(adminUsername, q);
          if (r?.ok !== false) adminCreated++;
        };
        const createTeacherQuiz = async (q) => {
          const r = await storage2.createQuiz(teacherUsername, q);
          if (r?.ok !== false) teacherCreated++;
        };
        try {
          await storage2.createAdmin?.({ username: adminUsername, password: "admin@1234", name: "Admin", email: `${adminUsername}@example.com` });
        } catch {
        }
        if (adminCount && adminCount > 0) {
          for (let i = 0; i < adminCount; i++) {
            await createAdminQuiz(makeQuiz(i, "global"));
          }
        }
        if (teacherCount && teacherCount > 0) {
          for (let i = 0; i < teacherCount; i++) {
            await createTeacherQuiz(makeQuiz(i, "school"));
          }
        }
        res.json({ ok: true, adminCreated, teacherCreated, adminUsername, teacherUsername });
      } catch (e) {
        res.status(500).json({ error: "Seed failed" });
      }
    });
    app2.post("/api/dev/seed-schools-students", async (req, res) => {
      try {
        const body = req.body ?? {};
        const schools2 = Math.max(0, Math.min(100, Math.floor(Number(body.schools) || 0)));
        const students = Math.max(0, Math.min(1e4, Math.floor(Number(body.students) || 0)));
        const adminUsername = body.adminUsername || "admin123";
        const r = await storage2.seedSchoolsAndStudents({ schools: schools2, students, adminUsername });
        res.json({ ok: true, ...r, adminUsername });
      } catch (e) {
        res.status(500).json({ error: "Seed failed" });
      }
    });
  }
  app2.post("/api/teacher/tasks", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize } = req.body ?? {};
    const r = await storage2.createTask(current, { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app2.get("/api/teacher/tasks", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listTeacherTasks(current);
    res.json(list);
  });
  app2.get("/api/teacher/submissions", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const taskId = req.query.taskId || void 0;
    const list = await storage2.listSubmissionsForTeacher(current, taskId);
    res.json(list);
  });
  app2.post("/api/teacher/submissions/:id/review", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { status, points, feedback } = req.body ?? {};
    const r = await storage2.reviewSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/student/tasks", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listStudentTasks(current);
    res.json(list);
  });
  app2.post("/api/student/tasks/:id/submit", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { photoDataUrl, photos } = req.body ?? {};
    const payload = Array.isArray(photos) ? photos : photoDataUrl;
    const r = await storage2.submitTask(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app2.post("/api/student/tasks/:id/group", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { members } = req.body ?? {};
    const r = await storage2.createTaskGroup(current, req.params.id, members || []);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app2.get("/api/student/tasks/:id/group", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const g = await storage2.getTaskGroupForStudent(current, req.params.id);
    res.json(g);
  });
  app2.post("/api/teacher/announcements", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, body } = req.body ?? {};
    const r = await storage2.createAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app2.get("/api/teacher/announcements", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAnnouncementsForTeacher(current);
    res.json(list);
  });
  app2.post("/api/admin/announcements", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, body } = req.body ?? {};
    const r = await storage2.createAdminAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app2.get("/api/admin/announcements", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAdminAnnouncements(current);
    res.json(list);
  });
  app2.put("/api/admin/announcements/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, body } = req.body ?? {};
    const r = await storage2.updateAdminAnnouncement(current, req.params.id, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app2.delete("/api/admin/announcements/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteAdminAnnouncement(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/student/announcements", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listStudentAnnouncements(current);
    res.json(list);
  });
  app2.post("/api/teacher/assignments", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await storage2.createAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app2.get("/api/teacher/assignments", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listTeacherAssignments(current);
    res.json(list);
  });
  app2.post("/api/admin/assignments", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await storage2.createAdminAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app2.get("/api/admin/assignments", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAdminAssignments(current);
    res.json(list);
  });
  app2.put("/api/admin/assignments/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await storage2.updateAdminAssignment(current, req.params.id, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app2.delete("/api/admin/assignments/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteAdminAssignment(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/admin/assignment-submissions", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const assignmentId = req.query.assignmentId || void 0;
    const list = await storage2.listAssignmentSubmissionsForAdmin(current, assignmentId);
    res.json(list);
  });
  app2.post("/api/admin/assignment-submissions/:id/review", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { status, points, feedback } = req.body ?? {};
    const r = await storage2.reviewAdminAssignmentSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/student/assignments", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listStudentAssignments(current);
    res.json(list);
  });
  app2.post("/api/student/assignments/:id/submit", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { files } = req.body ?? {};
    const payload = Array.isArray(files) ? files : [];
    const r = await storage2.submitAssignment(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app2.get("/api/teacher/assignment-submissions", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const assignmentId = req.query.assignmentId || void 0;
    const list = await storage2.listAssignmentSubmissionsForTeacher(current, assignmentId);
    res.json(list);
  });
  app2.post("/api/teacher/assignment-submissions/:id/review", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { status, points, feedback } = req.body ?? {};
    const r = await storage2.reviewAssignmentSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.post("/api/teacher/quizzes", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, points, questions } = req.body ?? {};
    const r = await storage2.createQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app2.get("/api/teacher/quizzes", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listTeacherQuizzes(current);
    res.json(list);
  });
  app2.put("/api/teacher/quizzes/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.updateQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app2.delete("/api/teacher/quizzes/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.post("/api/admin/quizzes", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { title, description, points, questions } = req.body ?? {};
    const r = await storage2.createAdminQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app2.get("/api/admin/quizzes", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAdminQuizzes(current);
    res.json(list);
  });
  app2.put("/api/admin/quizzes/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.updateAdminQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app2.delete("/api/admin/quizzes/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteAdminQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/student/quizzes", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listStudentQuizzes(current);
    const sanitized = (Array.isArray(list) ? list : []).map((q) => ({
      ...q,
      questions: (q.questions || []).map((qq) => ({ id: qq.id, text: qq.text, options: qq.options }))
    }));
    res.json(sanitized);
  });
  app2.get("/api/admin/games", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAdminGames(current);
    res.json(list);
  });
  app2.post("/api/admin/games", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.createAdminGame(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app2.put("/api/admin/games/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app2.delete("/api/admin/games/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/student/quizzes/:id/attempt", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const a = await storage2.getStudentQuizAttempt(current, req.params.id);
    res.json(a || null);
  });
  app2.get("/api/quizzes/:id", async (req, res) => {
    const q = await storage2.getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });
    const sanitized = { ...q, questions: q.questions.map((qq) => ({ id: qq.id, text: qq.text, options: qq.options })) };
    res.json(sanitized);
  });
  app2.post("/api/quizzes/:id/score", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const q = await storage2.getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });
    const me = await storage2.getOwnProfile(current);
    if (!me || me.role !== "student") return res.status(403).json({ error: "Only students can attempt" });
    const schoolId = me.schoolId;
    const allowed = q.visibility === "global" || !!schoolId && q.schoolId === schoolId;
    if (!allowed) return res.status(403).json({ error: "Quiz not available" });
    const answers = Array.isArray(req.body?.answers) ? req.body.answers.map((n) => Number(n)) : [];
    const total = q.questions.length || 0;
    if (total === 0) return res.json({ ok: true, correct: 0, total: 0, percent: 0 });
    let correct = 0;
    const details = [];
    for (let i = 0; i < total; i++) {
      const choice = answers[i];
      const correctIndex = q.questions[i].answerIndex;
      const isCorrect = Number.isFinite(choice) && choice === correctIndex;
      if (isCorrect) correct++;
      details.push({ index: i, correctIndex, selected: Number.isFinite(choice) ? choice : -1, isCorrect });
    }
    const percent = Math.round(correct / total * 100);
    res.json({ ok: true, correct, total, percent, details });
  });
  app2.get("/api/teacher/students", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listStudentsForTeacher(current);
    res.json(list);
  });
  app2.get("/api/teacher/overview", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const data = await storage2.getTeacherOverview(current);
    res.json(data);
  });
  app2.get("/api/student/profile", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const p = await storage2.getStudentProfile(current);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  });
  app2.put("/api/student/profile/privacy", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const allow = !!req.body?.allowExternalView;
    const r = await storage2.setStudentPrivacy(current, allow);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/learning/progress", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const list = await storage2.listLessonCompletions(current);
    const totalLessonPoints = list.reduce((acc, lc) => acc + Number(lc.points || 0), 0);
    res.json({ completions: list, totalLessonPoints });
  });
  app2.post("/api/learning/complete", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const { moduleId, moduleTitle, lessonId, lessonTitle, points } = req.body ?? {};
    const r = await storage2.completeLesson(current, { moduleId, moduleTitle, lessonId, lessonTitle, points });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app2.get("/api/learning/modules", async (_req, res) => {
    const list = await storage2.listLearningModules();
    res.json(list);
  });
  app2.get("/api/admin/learning/modules", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listManagedLearningModules(current);
    res.json(list);
  });
  app2.post("/api/admin/learning/modules", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.upsertManagedLearningModule(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.module);
  });
  app2.put("/api/admin/learning/modules/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.upsertManagedLearningModule(current, { ...req.body ?? {}, id: req.params.id });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.module);
  });
  app2.delete("/api/admin/learning/modules/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteManagedLearningModule(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.post("/api/student/quiz-attempts", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { quizId, scorePercent, answers } = req.body ?? {};
    const r = await storage2.addQuizAttempt(current, { quizId, scorePercent, answers });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.attempt);
  });
  app2.post("/api/student/games/:gameId/play", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const points = Number(req.body?.points);
    const r = await storage2.addGamePlay(current, req.params.gameId, Number.isFinite(points) ? points : void 0);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.play);
  });
  app2.get("/api/student/games/summary", async (req, res) => {
    const current = req.headers["x-username"] || "";
    if (!current) return res.status(401).json({ error: "Missing username" });
    const summary = await storage2.getStudentGameSummary(current);
    res.json(summary);
  });
  app2.get("/api/games", async (_req, res) => {
    const list = await storage2.listGames();
    res.json(list);
  });
  app2.get("/api/admin/games", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listAdminGames(current);
    res.json(list);
  });
  app2.post("/api/admin/games", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const { id, name, category, description, difficulty, points, icon, externalUrl, image } = req.body ?? {};
    const r = await storage2.createAdminGame(current, { id, name, category, description, difficulty, points, icon, externalUrl, image });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app2.put("/api/admin/games/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app2.delete("/api/admin/games/:id", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/notifications", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const list = await storage2.listNotifications(current);
    res.json(list);
  });
  app2.post("/api/notifications/read", async (req, res) => {
    const current = req.headers["x-username"] || "";
    const r = await storage2.markAllNotificationsRead(current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app2.get("/api/leaderboard/schools", async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 25));
    const rows = await storage2.getGlobalSchoolsLeaderboard(limit);
    res.json(rows);
  });
  app2.get("/api/leaderboard/school/:schoolId/students", async (req, res) => {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const rows = await storage2.getSchoolStudentsLeaderboard(req.params.schoolId, limit, offset);
    res.json(rows);
  });
  app2.get("/api/leaderboard/students", async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = req.query.schoolId || null;
    const rows = await storage2.getGlobalStudentsLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  app2.get("/api/leaderboard/teachers", async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = req.query.schoolId || null;
    const rows = await storage2.getGlobalTeachersLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  app2.get("/api/leaderboard/school/:schoolId/preview", async (req, res) => {
    const data = await storage2.getSchoolPreview(req.params.schoolId);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });
  app2.get("/api/leaderboard/student/:username/preview", async (req, res) => {
    const data = await storage2.getStudentPreview(req.params.username);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });
  app2.get("/api/leaderboard/teacher/:username/preview", async (req, res) => {
    const data = await storage2.getTeacherPreview(req.params.username);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  });
  app2.get("/api/leaderboard/admin/analytics", async (_req, res) => {
    const data = await storage2.getAdminLeaderboardAnalytics();
    res.json(data);
  });
  app2.get("/api/videos", async (_req, res) => {
    try {
      const videos2 = await storage2.getAllVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });
  app2.get("/api/users/:username/credits", async (req, res) => {
    try {
      const credits = await storage2.getUserCredits(req.params.username);
      res.json(credits);
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ error: "Failed to fetch user credits" });
    }
  });
  app2.post("/api/videos/watch", async (req, res) => {
    try {
      const current = req.headers["x-username"] || "";
      const { videoId, username: bodyUsername } = req.body;
      const username = bodyUsername || current;
      const result = await storage2.recordVideoWatch(username, videoId);
      res.json(result);
    } catch (error) {
      console.error("Error recording video watch:", error);
      res.status(500).json({ error: "Failed to record video watch" });
    }
  });
  app2.post("/api/videos/award-credits", async (req, res) => {
    try {
      const current = req.headers["x-username"] || "";
      const { username: bodyUsername, videoId } = req.body;
      const username = bodyUsername || current;
      const result = await storage2.recordVideoWatch(username, videoId);
      res.json(result);
    } catch (error) {
      console.error("Error awarding credits:", error);
      res.status(500).json({ error: "Failed to award credits" });
    }
  });
  app2.post("/api/videos/youtube-metadata", async (req, res) => {
    try {
      const { url } = req.body;
      const metadata = await storage2.fetchYouTubeMetadata(url);
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      res.status(500).json({ error: "Failed to fetch YouTube metadata" });
    }
  });
  app2.get("/api/admin/videos", async (_req, res) => {
    try {
      const videos2 = await storage2.getAllVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching admin videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });
  app2.post("/api/admin/videos", async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage2.createVideo({
        title,
        description,
        type,
        url,
        thumbnail,
        credits: credits || 1,
        uploadedBy: "admin",
        // TODO: Get from authenticated user
        category,
        duration
      });
      res.json(video);
    } catch (error) {
      console.error("Error creating admin video:", error);
      res.status(500).json({ error: "Failed to create video" });
    }
  });
  app2.put("/api/admin/videos/:id", async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage2.updateVideo(req.params.id, {
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
      console.error("Error updating admin video:", error);
      res.status(500).json({ error: "Failed to update video" });
    }
  });
  app2.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      await storage2.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting admin video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });
  app2.get("/api/teacher/videos", async (req, res) => {
    try {
      const videos2 = await storage2.getTeacherVideos(req.query.teacherId);
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching teacher videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });
  app2.get("/api/teacher/videos/count", async (req, res) => {
    try {
      const current = req.headers["x-username"] || "";
      const count = await storage2.getTeacherVideosCount(current);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching teacher videos count:", error);
      res.status(500).json({ error: "Failed to fetch videos count" });
    }
  });
  app2.post("/api/teacher/videos", async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration } = req.body;
      const video = await storage2.createVideo({
        title,
        description,
        type,
        url,
        thumbnail,
        credits: credits || 1,
        uploadedBy: req.body.teacherId || "teacher",
        // TODO: Get from authenticated user
        category,
        duration
      });
      res.json(video);
    } catch (error) {
      console.error("Error creating teacher video:", error);
      res.status(500).json({ error: "Failed to create video" });
    }
  });
  app2.put("/api/teacher/videos/:id", async (req, res) => {
    try {
      const { title, description, type, url, thumbnail, credits, category, duration, uploadedBy } = req.body;
      const video = await storage2.updateVideo(req.params.id, {
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
      console.error("Error updating teacher video:", error);
      res.status(500).json({ error: "Failed to update video" });
    }
  });
  app2.delete("/api/teacher/videos/:id", async (req, res) => {
    try {
      await storage2.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting teacher video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });
  app2.get("/api/public-profile/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Missing username" });
    try {
      const profile = await storage2.getStudentProfile(username);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      if (!profile.allowExternalView) {
        return res.status(403).json({ error: "This profile is private" });
      }
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
      console.error("Error fetching public profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  app2.post("/api/email/welcome", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: "Missing email or name" });
      }
      await sendWelcomeEmail(email, name);
      res.json({ ok: true, message: "Welcome email sent" });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });
  app2.post("/api/email/application-status", async (req, res) => {
    try {
      const { email, name, status, message } = req.body;
      if (!email || !name || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      await sendApplicationStatusEmail(email, name, status, message);
      res.json({ ok: true, message: "Application status email sent" });
    } catch (error) {
      console.error("Error sending application status email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });
  app2.post("/api/email/custom", async (req, res) => {
    try {
      const { to, subject, html, text: text2 } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing required fields (to, subject, html)" });
      }
      await sendEmail({ to, subject, html, text: text2 });
      res.json({ ok: true, message: "Email sent" });
    } catch (error) {
      console.error("Error sending custom email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import fs2 from "fs";
var envPath = path3.resolve(import.meta.dirname, ".env");
var envVars = {};
if (fs2.existsSync(envPath)) {
  const envContent = fs2.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && !key.startsWith("#")) {
      envVars[key.trim()] = value?.trim() || "";
    }
  });
}
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    hmr: {
      overlay: false
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    __VITE_ENV__: JSON.stringify(envVars)
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    if (req.originalUrl?.startsWith("/api")) return next();
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "..", "dist", "public");
  const legacyPath = path4.resolve(import.meta.dirname, "public");
  const usePath = fs3.existsSync(distPath) ? distPath : legacyPath;
  if (!fs3.existsSync(usePath)) {
    throw new Error(
      `Could not find the build directory: ${distPath} or ${legacyPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(usePath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(usePath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json({ limit: "10mb" }));
app.use(express3.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const { initDb: initDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  initDb2();
  const { DatabaseStorage: DatabaseStorage2 } = await Promise.resolve().then(() => (init_storage_db(), storage_db_exports));
  globalThis.storage = new DatabaseStorage2();
  await globalThis.storage.seedAdmin();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
    try {
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const teacher = "test_teacher";
      const tasks2 = await storage2.listTeacherTasks(teacher);
      if (!Array.isArray(tasks2) || tasks2.length === 0) {
        await storage2.createTask(teacher, { title: "Recycle Drive", description: "Collect and sort recyclables.", maxPoints: 8, proofType: "photo", groupMode: "group", maxGroupSize: 4 });
        await storage2.createTask(teacher, { title: "Plant a Tree", description: "Plant a sapling in your neighborhood.", maxPoints: 10, proofType: "photo", groupMode: "solo" });
      }
    } catch {
    }
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";
  server.listen(
    {
      port,
      host
    },
    () => {
      log(`\u2705 Server running at http://${host}:${port}`);
    }
  );
})();
