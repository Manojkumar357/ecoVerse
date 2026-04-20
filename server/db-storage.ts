import { orm } from './db';
import { users } from './schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export class DbStorage {
  async seedAdmin() {
    const found = await orm.select().from(users).where(eq(users.username, 'admin123'));
    if (found.length === 0) {
      await orm.insert(users).values({
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
  async addTeacherApplication(app: any) {
    const id = randomUUID();
    await orm.insert(users).values({
      id,
      name: app.name,
      email: app.email,
      username: app.username,
      password: app.password,
      role: 'teacher',
      schoolId: app.schoolId,
      subject: app.subject,
      photoUrl: app.photoDataUrl,
      approved: false,
    });
    return { ...app, id };
  }

  async addStudentApplication(app: any) {
    const id = randomUUID();
    await orm.insert(users).values({
      id,
      name: app.name,
      email: app.email,
      username: app.username,
      password: app.password,
      role: 'student',
      schoolId: app.schoolId,
      subject: app.subject,
      photoUrl: app.photoDataUrl,
      approved: false,
    });
    return { ...app, id };
  }

  async isUsernameAvailable(username: string) {
    const found = await orm.select().from(users).where(eq(users.username, username));
    return found.length === 0;
  }
}
