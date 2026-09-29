const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => taskService._reset());

const make = (body = { title: 'task' }) => request(app).post('/tasks').send(body);

describe('POST /tasks', () => {
  test('creates a task', async () => {
    const res = await make({ title: 'Write tests', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Write tests', priority: 'high', status: 'todo' });
    expect(res.body.id).toBeDefined();
  });

  test.each([
    ['missing title', {}],
    ['empty title', { title: '  ' }],
    ['non-string title', { title: 5 }],
    ['bad status', { title: 'a', status: 'pending' }],
    ['bad priority', { title: 'a', priority: 'urgent' }],
    ['bad dueDate', { title: 'a', dueDate: 'not-a-date' }],
  ])('400 on %s', async (_, body) => {
    const res = await make(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /tasks', () => {
  test('lists all tasks', async () => {
    await make({ title: 'a' });
    await make({ title: 'b' });
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('filters by exact status', async () => {
    await make({ title: 'a', status: 'todo' });
    await make({ title: 'b', status: 'done' });
    const res = await request(app).get('/tasks?status=done');
    expect(res.body.map((t) => t.title)).toEqual(['b']);
  });



});

describe('PUT /tasks/:id', () => {
  test('updates a task', async () => {
    const { body: t } = await make();
    const res = await request(app).put(`/tasks/${t.id}`).send({ title: 'new', status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: t.id, title: 'new', status: 'in_progress' });
  });

  test('404 for unknown id', async () => {
    const res = await request(app).put('/tasks/nope').send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('400 on invalid body', async () => {
    const { body: t } = await make();
    const res = await request(app).put(`/tasks/${t.id}`).send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /tasks/:id', () => {
  test('deletes a task', async () => {
    const { body: t } = await make();
    const res = await request(app).delete(`/tasks/${t.id}`);
    expect(res.status).toBe(204);
    expect((await request(app).get('/tasks')).body).toEqual([]);
  });

  test('404 for unknown id', async () => {
    expect((await request(app).delete('/tasks/nope')).status).toBe(404);
  });
});

describe('PATCH /tasks/:id/complete', () => {
  test('completes a task', async () => {
    const { body: t } = await make({ title: 'a', priority: 'high' });
    const res = await request(app).patch(`/tasks/${t.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).not.toBeNull();
  });

  test('404 for unknown id', async () => {
    expect((await request(app).patch('/tasks/nope/complete')).status).toBe(404);
  });
});

describe('GET /tasks/stats', () => {
  test('returns counts and overdue', async () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    await make({ title: 'a', dueDate: past });
    await make({ title: 'b', status: 'done' });
    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ todo: 1, in_progress: 0, done: 1, overdue: 1 });
  });
});
