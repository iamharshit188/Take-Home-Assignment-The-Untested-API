const taskService = require('../src/services/taskService');

beforeEach(() => taskService._reset());

describe('create', () => {
  test('applies defaults', () => {
    const t = taskService.create({ title: 'a' });
    expect(t).toMatchObject({
      title: 'a',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      completedAt: null,
    });
    expect(t.id).toEqual(expect.any(String));
    expect(new Date(t.createdAt).toString()).not.toBe('Invalid Date');
  });

  test('keeps provided fields and generates unique ids', () => {
    const a = taskService.create({ title: 'a', priority: 'high', status: 'in_progress' });
    const b = taskService.create({ title: 'b' });
    expect(a.priority).toBe('high');
    expect(a.status).toBe('in_progress');
    expect(a.id).not.toBe(b.id);
  });
});

describe('getAll / findById', () => {
  test('getAll returns a copy', () => {
    taskService.create({ title: 'a' });
    taskService.getAll().pop();
    expect(taskService.getAll()).toHaveLength(1);
  });

  test('findById returns task or undefined', () => {
    const t = taskService.create({ title: 'a' });
    expect(taskService.findById(t.id)).toEqual(t);
    expect(taskService.findById('nope')).toBeUndefined();
  });
});

describe('getByStatus', () => {
  beforeEach(() => {
    taskService.create({ title: 'a', status: 'todo' });
    taskService.create({ title: 'b', status: 'in_progress' });
    taskService.create({ title: 'c', status: 'done' });
  });

  test('returns exact matches', () => {
    expect(taskService.getByStatus('todo').map((t) => t.title)).toEqual(['a']);
    expect(taskService.getByStatus('done').map((t) => t.title)).toEqual(['c']);
  });

  test('does not match on substrings', () => {
    expect(taskService.getByStatus('do')).toEqual([]);
    expect(taskService.getByStatus('progress')).toEqual([]);
  });
});

describe('getPaginated', () => {
  beforeEach(() => {
    for (let i = 1; i <= 5; i++) taskService.create({ title: `t${i}` });
  });

  test('page 1 returns the first items', () => {
    expect(taskService.getPaginated(1, 2).map((t) => t.title)).toEqual(['t1', 't2']);
  });

  test('later pages and partial last page', () => {
    expect(taskService.getPaginated(2, 2).map((t) => t.title)).toEqual(['t3', 't4']);
    expect(taskService.getPaginated(3, 2).map((t) => t.title)).toEqual(['t5']);
  });

  test('page beyond the end is empty', () => {
    expect(taskService.getPaginated(4, 2)).toEqual([]);
  });
});

describe('getStats', () => {
  test('counts by status and overdue', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();
    taskService.create({ title: 'a', dueDate: past });
    taskService.create({ title: 'b', status: 'in_progress', dueDate: past });
    taskService.create({ title: 'c', status: 'done', dueDate: past });
    taskService.create({ title: 'd', dueDate: future });
    expect(taskService.getStats()).toEqual({ todo: 2, in_progress: 1, done: 1, overdue: 2 });
  });

  test('empty store', () => {
    expect(taskService.getStats()).toEqual({ todo: 0, in_progress: 0, done: 0, overdue: 0 });
  });
});

describe('update', () => {
  test('merges fields', () => {
    const t = taskService.create({ title: 'a' });
    const u = taskService.update(t.id, { title: 'b', priority: 'low' });
    expect(u).toMatchObject({ id: t.id, title: 'b', priority: 'low', status: 'todo' });
    expect(taskService.findById(t.id).title).toBe('b');
  });

  test('returns null for unknown id', () => {
    expect(taskService.update('nope', { title: 'x' })).toBeNull();
  });
});

describe('remove', () => {
  test('removes existing task', () => {
    const t = taskService.create({ title: 'a' });
    expect(taskService.remove(t.id)).toBe(true);
    expect(taskService.getAll()).toEqual([]);
  });

  test('returns false for unknown id', () => {
    expect(taskService.remove('nope')).toBe(false);
  });
});

describe('completeTask', () => {
  test('sets status and completedAt', () => {
    const t = taskService.create({ title: 'a' });
    const c = taskService.completeTask(t.id);
    expect(c.status).toBe('done');
    expect(new Date(c.completedAt).toString()).not.toBe('Invalid Date');
  });

  test('preserves priority', () => {
    const t = taskService.create({ title: 'a', priority: 'high' });
    expect(taskService.completeTask(t.id).priority).toBe('high');
  });

  test('returns null for unknown id', () => {
    expect(taskService.completeTask('nope')).toBeNull();
  });
});
