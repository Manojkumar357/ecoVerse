# DatabaseStorage Usage Guide

## Overview
The `DatabaseStorage` class is a drop-in replacement for `MemStorage` that uses SQLite with Drizzle ORM instead of in-memory Maps.

## Installation & Setup

### 1. Database Initialization (Automatic)
The database initializes automatically when `DatabaseStorage` is instantiated:
```typescript
import { DatabaseStorage } from './server/storage-db';

const storage = new DatabaseStorage();
// db.sqlite file created automatically
// All tables created automatically
// Ready to use!
```

### 2. Usage in Express Routes
```typescript
import express from 'express';
import { DatabaseStorage } from './storage-db';

const app = express();
const storage = new DatabaseStorage();

app.post('/api/users', async (req, res) => {
  const user = await storage.createUser({
    username: req.body.username,
    password: req.body.password,
  });
  res.json(user);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await storage.getUser(req.params.id);
  res.json(user);
});
```

## Common Operations

### User Management

#### Create a User
```typescript
const user = await storage.createUser({
  username: 'john_doe',
  password: 'secure_password',
});
// Returns: { id: '...', username: 'john_doe', password: 'secure_password' }
```

#### Get User by ID
```typescript
const user = await storage.getUser(userId);
// Returns: User | undefined
```

#### Get User by Username
```typescript
const user = await storage.getUserByUsername('john_doe');
// Returns: User | undefined
```

#### Reset Password
```typescript
const success = await storage.resetPassword('john_doe', 'new_password');
// Returns: boolean
```

### Task Management

#### Create a Task (by Teacher)
```typescript
const result = await storage.createTask('teacher_username', {
  title: 'Reduce Plastic Usage',
  description: 'Record how you reduced plastic this week',
  deadline: '2024-05-15',
  proofType: 'photo',
  maxPoints: 50,
  groupMode: 'solo',
});

if (result.ok) {
  console.log('Task created:', result.task);
} else {
  console.log('Error:', result.error);
}
```

#### List Teacher's Tasks
```typescript
const tasks = await storage.listTeacherTasks('teacher_username');
// Returns: Task[]
```

#### Submit a Task (by Student)
```typescript
const result = await storage.submitTask(
  'student_username',
  taskId,
  dataUrl, // Single photo as data URL
  // OR
  // [dataUrl1, dataUrl2] // Multiple photos
);

if (result.ok) {
  console.log('Submission accepted:', result.submission);
}
```

#### Review Submission (by Teacher)
```typescript
const result = await storage.reviewSubmission(
  'teacher_username',
  submissionId,
  {
    status: 'approved',
    points: 45,
    feedback: 'Great effort! Keep it up.',
  }
);
```

### Quiz Management

#### Create a Quiz
```typescript
const result = await storage.createQuiz('teacher_username', {
  title: 'Climate Change Basics',
  description: 'Test your knowledge',
  points: 10,
  questions: [
    {
      text: 'What is the main cause of climate change?',
      options: ['CO2', 'Methane', 'Deforestation', 'All of above'],
      answerIndex: 3, // "All of above"
    },
    {
      text: 'Which gas traps the most heat?',
      options: ['Oxygen', 'CO2', 'Nitrogen', 'Hydrogen'],
      answerIndex: 1, // "CO2"
    },
  ],
});
```

#### Get Available Quizzes
```typescript
const quizzes = await storage.listStudentQuizzesInternal('student_username');
// Returns: Quiz[] (global + school quizzes)
```

#### Submit Quiz Attempt
```typescript
const result = await storage.addQuizAttempt('student_username', {
  quizId: quizId,
  answers: [3, 1], // Student's answers (index of selected option)
  scorePercent: 100,
});
```

### Game Management

#### Create a Game (Admin)
```typescript
const result = await storage.createAdminGame('admin_username', {
  name: 'Ocean Cleanup Challenge',
  category: 'wildlife',
  description: 'Clean up ocean plastics',
  difficulty: 'Medium',
  points: 100,
  icon: '🌊',
  externalUrl: 'https://ocean-cleanup.example.com',
  image: 'https://image.url/ocean.jpg',
});
```

#### Record Game Play
```typescript
const result = await storage.addGamePlay(
  'student_username',
  'ocean-cleanup-challenge',
  100 // points earned
);
```

#### Get Game Summary
```typescript
const summary = await storage.getStudentGameSummary('student_username');
// Returns: {
//   totalGamePoints: 450,
//   badges: ['🎮 Game Master', '🌍 Explorer'],
//   monthCompletedCount: 5,
//   totalUniqueGames: 8
// }
```

### Leaderboards

#### Global Schools Leaderboard
```typescript
const leaderboard = await storage.getGlobalSchoolsLeaderboard(25);
// Returns: Array of {
//   schoolId: string,
//   schoolName: string,
//   ecoPoints: number,
//   students: number,
//   topStudent?: { username: string, name?: string, ecoPoints: number }
// }
```

#### School Students Leaderboard
```typescript
const leaderboard = await storage.getSchoolStudentsLeaderboard(
  schoolId,
  50, // limit
  0   // offset
);
// Returns: Array of { username, name?, ecoPoints }
```

#### Global Students Leaderboard
```typescript
const leaderboard = await storage.getGlobalStudentsLeaderboard(
  50,           // limit
  0,            // offset
  schoolIdFilter // optional school filter
);
// Returns: Array of {
//   username: string,
//   name?: string,
//   schoolId?: string,
//   schoolName?: string,
//   ecoPoints: number,
//   achievements?: string[],
//   snapshot?: { tasksApproved: number, quizzesCompleted: number }
// }
```

### Announcements

#### Create Announcement (Teacher)
```typescript
const result = await storage.createAnnouncement('teacher_username', {
  title: 'Eco Week Challenge',
  body: 'Join us for a week of environmental challenges!',
});
```

#### Create Global Announcement (Admin)
```typescript
const result = await storage.createAdminAnnouncement('admin_username', {
  title: 'Platform-wide Announcement',
  body: 'Important notice for all users',
});
```

#### Get Student Announcements
```typescript
const announcements = await storage.listStudentAnnouncements('student_username');
// Returns: Announcement[] (global + school announcements)
```

### Learning Modules

#### Create Learning Module
```typescript
const result = await storage.upsertManagedLearningModule(
  'teacher_username',
  {
    title: 'Carbon Footprint 101',
    description: 'Learn about your carbon impact',
    lessons: [
      {
        title: 'What is Carbon Footprint?',
        duration: '15 minutes',
        points: 10,
        content: '<h2>What is...</h2><p>Your carbon footprint...</p>',
      },
      {
        title: 'How to Reduce It',
        duration: '20 minutes',
        points: 15,
        content: '<h2>10 Ways to...</h2>...',
      },
    ],
  }
);
```

#### Complete a Lesson
```typescript
const result = await storage.completeLesson('student_username', {
  moduleId: 'carbon-footprint-101',
  moduleTitle: 'Carbon Footprint 101',
  lessonId: 'what-is-carbon',
  lessonTitle: 'What is Carbon Footprint?',
  points: 10,
});

if (result.ok) {
  console.log('Lesson completed!', result.completion);
  console.log('Already completed?', result.alreadyCompleted);
}
```

### Video Management

#### Create a Video
```typescript
const video = await storage.createVideo({
  title: 'How to Reduce Plastic Waste',
  description: 'A short guide',
  type: 'youtube', // or 'file'
  url: 'https://youtube.com/watch?v=...',
  thumbnail: 'https://thumbnail.url/img.jpg',
  credits: 5,
  uploadedBy: 'teacher_user_id',
  category: 'sustainability',
  duration: 600, // seconds
});
```

#### Record Video Watch
```typescript
const result = await storage.recordVideoWatch(
  'student_username',
  videoId
);
// Returns: { success: boolean, creditsAwarded: number }
```

#### Get User Credits
```typescript
const credits = await storage.getUserCredits('student_username');
// Returns: { totalCredits: 50, lastUpdated: 1234567890 }
```

### Notifications

#### List User Notifications
```typescript
const notifications = await storage.listNotifications('student_username');
// Returns: NotificationItem[]
// Each has: id, userId, message, type, createdAt, readAt?
```

#### Mark All as Read
```typescript
const result = await storage.markAllNotificationsRead('student_username');
// Returns: { ok: true } | { ok: false, error: string }
```

### Admin Operations

#### Approve Application
```typescript
const success = await storage.approveApplication('student', applicationId);
// Converts pending student to approved user
```

#### Get Admin Leaderboard Analytics
```typescript
const analytics = await storage.getAdminLeaderboardAnalytics();
// Returns: {
//   activeSchoolsThisWeek: number,
//   newStudentsThisWeek: number,
//   totalEcoPointsThisWeek: number,
//   inactiveSchools: Array<{ schoolId, schoolName }>
// }
```

## Error Handling

### Result Pattern
Many methods return a Result type for error handling:
```typescript
type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

// Example
const result = await storage.createTask(username, input);

if (result.ok) {
  console.log('Created task:', result.task);
} else {
  console.log('Error:', result.error);
}
```

### Promise Return Pattern
Simple CRUD methods return direct types:
```typescript
const user = await storage.getUser(id);
if (user) {
  console.log('Found user:', user);
} else {
  console.log('User not found');
}
```

### Array Return Pattern
List methods always return arrays (empty if none):
```typescript
const tasks = await storage.listTeacherTasks(username);
tasks.forEach(task => console.log(task.title));
```

## Performance Tips

### 1. Use Parallel Queries
```typescript
// ✓ Better: Parallel queries
const [users, schools, tasks] = await Promise.all([
  orm.select().from(schema.users),
  orm.select().from(schema.schools),
  orm.select().from(schema.tasks),
]);

// ❌ Avoid: Sequential queries
const users = await orm.select().from(schema.users);
const schools = await orm.select().from(schema.schools);
const tasks = await orm.select().from(schema.tasks);
```

### 2. Filter Early
```typescript
// ✓ Better: Filter in database
const approved = await orm.select().from(schema.tasks)
  .where(eq(schema.tasks.status, 'approved'));

// ❌ Avoid: Filter in code
const tasks = await orm.select().from(schema.tasks);
const approved = tasks.filter(t => t.status === 'approved');
```

### 3. Use Pagination for Large Lists
```typescript
const limit = 50;
const offset = (page - 1) * limit;
const page1 = await storage.getGlobalStudentsLeaderboard(limit, offset);
const page2 = await storage.getGlobalStudentsLeaderboard(limit, offset + limit);
```

## Data Types Reference

### Common Return Types

```typescript
// User
type User = {
  id: string;
  username: string;
  password: string;
};

// Task
type Task = {
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

// Quiz
type Quiz = {
  id: string;
  title: string;
  description?: string;
  points: number;
  createdByUserId: string;
  schoolId: string;
  createdAt: number;
  questions: QuizQuestion[];
  visibility: 'global' | 'school';
};

// See storage-db.ts for all 20+ type definitions
```

## Migration from MemStorage

### Single Change Required
```typescript
// Old
import { MemStorage } from './storage';
const storage = new MemStorage();

// New
import { DatabaseStorage } from './storage-db';
const storage = new DatabaseStorage();
```

Everything else works exactly the same!

## Troubleshooting

### "Cannot read property 'questions' of undefined"
Ensure JSON fields are parsed:
```typescript
// In DatabaseStorage methods, questions come as JSON strings
// They're automatically parsed when returned to caller
const quiz = { ...q, questions: JSON.parse(q.questions as any) };
```

### "Database is locked"
Better-sqlite3 doesn't support concurrent writes well. Keep write operations short and minimize concurrency.

### "Foreign key constraint"
Ensure parent records exist:
```typescript
// Create school first
await storage.addSchool('My School');

// Then reference it
await storage.createUser({ schoolId: schoolId, ... });
```

## Best Practices

1. **Always use await** - All operations are async
2. **Use Promise.all()** - For parallel operations
3. **Check result.ok** - Handle Result-type returns
4. **Validate input** - DatabaseStorage validates, but check at route level too
5. **Use try-catch** - For unexpected errors
6. **Filter in database** - Not in code
7. **Paginate large lists** - Don't load all records at once

---

For complete method documentation, see [server/storage-db.ts](server/storage-db.ts)
