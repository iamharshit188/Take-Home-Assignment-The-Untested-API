const { validateCreateTask, validateUpdateTask } = require('../src/utils/validators');

describe('validateCreateTask', () => {
  test('accepts minimal and full bodies', () => {
    expect(validateCreateTask({ title: 'a' })).toBeNull();
    expect(
      validateCreateTask({ title: 'a', status: 'done', priority: 'low', dueDate: '2030-01-01' })
    ).toBeNull();
  });

  test('rejects invalid fields', () => {
    expect(validateCreateTask({})).toMatch(/title/);
    expect(validateCreateTask({ title: 'a', status: 'x' })).toMatch(/status/);
    expect(validateCreateTask({ title: 'a', priority: 'x' })).toMatch(/priority/);
    expect(validateCreateTask({ title: 'a', dueDate: 'x' })).toMatch(/dueDate/);
  });
});

describe('validateUpdateTask', () => {
  test('accepts empty body', () => {
    expect(validateUpdateTask({})).toBeNull();
  });

  test('rejects invalid fields', () => {
    expect(validateUpdateTask({ title: '' })).toMatch(/title/);
    expect(validateUpdateTask({ status: 'x' })).toMatch(/status/);
    expect(validateUpdateTask({ priority: 'x' })).toMatch(/priority/);
    expect(validateUpdateTask({ dueDate: 'x' })).toMatch(/dueDate/);
  });
});
