const { validateCreateTask, validateUpdateTask, validateAssignTask } = require('../src/utils/validators');

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

describe('validateAssignTask', () => {
  test('accepts non-empty string', () => {
    expect(validateAssignTask({ assignee: 'Alice' })).toBeNull();
  });

  test('rejects missing body, empty, blank and non-string', () => {
    expect(validateAssignTask(undefined)).toMatch(/assignee/);
    expect(validateAssignTask({ assignee: '' })).toMatch(/assignee/);
    expect(validateAssignTask({ assignee: ' ' })).toMatch(/assignee/);
    expect(validateAssignTask({ assignee: 1 })).toMatch(/assignee/);
  });
});
