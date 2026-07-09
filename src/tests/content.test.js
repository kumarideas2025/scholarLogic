import request from 'supertest';
import createApp from '../app.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import { describeDb } from './setup.js';

/**
 * Content Module Integration Tests
 *
 * Covers course creation + enrollment, assignment creation + submission +
 * grading, and resource creation. Uses a teacher/admin created in-DB.
 */

const app = createApp();
const AUTH = '/api/v1/auth';
const COURSES = '/api/v1/courses';
const ASSIGN = '/api/v1/assignments';
const RES = '/api/v1/resources';

const teacherSignup = async () => {
  const user = {
    firstName: 'Teach',
    lastName: 'Er',
    email: `teacher${Math.floor(Math.random() * 1e6)}@example.com`,
    password: 'Passw0rd!23',
    role: 'teacher',
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return res.body.data;
};

const studentSignup = async () => {
  const user = {
    firstName: 'Stud',
    lastName: 'Ent',
    email: `student${Math.floor(Math.random() * 1e6)}@example.com`,
    password: 'Passw0rd!23',
    role: 'student',
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return res.body.data;
};

describeDb('Content API', () => {
  it('teacher can create a course', async () => {
    const t = await teacherSignup();
    const res = await request(app)
      .post(COURSES)
      .set('Authorization', `Bearer ${t.accessToken}`)
      .send({ title: 'Algebra 101', description: 'Intro to algebra', level: 'beginner' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.course.slug).toBeDefined();
    // Cleanup
    await Course.findByIdAndDelete(res.body.data.course.id);
  });

  it('student cannot create a course (403)', async () => {
    const s = await studentSignup();
    const res = await request(app)
      .post(COURSES)
      .set('Authorization', `Bearer ${s.accessToken}`)
      .send({ title: 'Hacking 101', description: 'nope', level: 'beginner' });
    expect(res.statusCode).toBe(403);
  });

  it('full assignment lifecycle: create → submit → grade', async () => {
    const t = await teacherSignup();
    const s = await studentSignup();

    const courseRes = await request(app)
      .post(COURSES)
      .set('Authorization', `Bearer ${t.accessToken}`)
      .send({ title: 'Physics', description: 'Mechanics', level: 'intermediate' });
    const courseId = courseRes.body.data.course.id;

    const assignRes = await request(app)
      .post(ASSIGN)
      .set('Authorization', `Bearer ${t.accessToken}`)
      .send({
        title: 'Lab 1',
        course: courseId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        points: 100,
      });
    expect(assignRes.statusCode).toBe(201);
    const assignId = assignRes.body.data.assignment._id;

    const submitRes = await request(app)
      .post(`${ASSIGN}/${assignId}/submit`)
      .set('Authorization', `Bearer ${s.accessToken}`)
      .send({ content: 'My lab report' });
    expect(submitRes.statusCode).toBe(200);

    const gradeRes = await request(app)
      .post(`${ASSIGN}/${assignId}/grade/${s.user.id}`)
      .set('Authorization', `Bearer ${t.accessToken}`)
      .send({ grade: 95, feedback: 'Great work' });
    expect(gradeRes.statusCode).toBe(200);
    expect(gradeRes.body.data.assignment.status).toBe('graded');

    // Cleanup
    await Assignment.findByIdAndDelete(assignId);
    await Course.findByIdAndDelete(courseId);
  });

  it('teacher can create a resource', async () => {
    const t = await teacherSignup();
    const res = await request(app)
      .post(RES)
      .set('Authorization', `Bearer ${t.accessToken}`)
      .send({ title: 'Cheat Sheet', type: 'document', url: 'https://example.com/sheet.pdf' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.resource.title).toBe('Cheat Sheet');
  });
});
