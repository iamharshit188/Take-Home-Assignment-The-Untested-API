# Bug Report

Found by writing tests against the expected behavior in ASSIGNMENT.md / README.md.

## Fixed

### 1. Pagination skips the first page
- **Where:** `task-api/src/services/taskService.js`, `getPaginated`
- **Expected:** `?page=1&limit=2` returns items 1-2.
- **Actual:** `offset = page * limit`, so page 1 returns items 3-4 and page 0 is the real first page.
- **Found:** service test `page 1 returns the first items`.
- **Fix:** `offset = (page - 1) * limit`. Applied.

### 2. Status filter matches substrings
- **Where:** `taskService.js`, `getByStatus`
- **Expected:** `?status=done` returns only `done` tasks; unknown/partial values return nothing.
- **Actual:** `t.status.includes(status)`, so `?status=do` matches `todo` and `done`; `?status=o` matches all.
- **Found:** test `does not match on substrings`.
- **Fix:** strict equality. Applied.

### 3. Completing a task resets priority
- **Where:** `taskService.js`, `completeTask`
- **Expected:** completion changes `status` and `completedAt` only.
- **Actual:** `priority` is hardcoded to `'medium'`, silently destroying user data.
- **Found:** test `preserves priority`.
- **Fix:** removed the override. Applied.

## Not fixed

### 4. PUT accepts arbitrary fields (mass assignment)
- **Where:** `taskService.update` spreads `req.body` into the task.
- **Actual:** client can overwrite `id`, `createdAt`, `completedAt`, or add unknown keys.
- **Fix:** whitelist `title, description, status, priority, dueDate`.

### 5. Status changes via PUT do not maintain `completedAt`
- **Where:** `taskService.update`.
- **Actual:** `PUT {status:'done'}` leaves `completedAt: null`; moving back from `done` leaves a stale `completedAt`.
- **Fix:** set/clear `completedAt` on status transitions.

### 6. Pagination input not validated
- **Where:** `routes/tasks.js`, `GET /`.
- **Actual:** `parseInt(page) || 1` lets negative values through (`page=-1` gives a negative offset, `limit=-1` slices from the end). No maximum limit.
- **Fix:** reject or clamp `page >= 1`, `1 <= limit <= 100`.

### 7. `status` filter and pagination are mutually exclusive
- **Where:** `routes/tasks.js`, `GET /`. If `status` is set, `page`/`limit` are ignored.
- **Fix:** filter first, then paginate.

### 8. Validators use truthiness checks
- **Where:** `utils/validators.js`. `status: ''`, `priority: ''`, `dueDate: ''` pass validation because falsy values are skipped; `status: null` likewise.
- **Fix:** compare against `undefined`.

### 9. Completing an already-completed task overwrites `completedAt`
- **Where:** `taskService.completeTask`. Not idempotent.

### 10. Documentation mismatch
- README task shape says `pending | in-progress | completed`; code and ASSIGNMENT.md use `todo | in_progress | done`. README updated to match the code.

## Assign endpoint design (`PATCH /tasks/:id/assign`)
- `assignee` must be a string with non-whitespace content; else 400. Value is trimmed before storing.
- Unknown task id: 404. Validation runs before lookup, so a bad body on an unknown id returns 400.
- Already assigned: reassignment is allowed and overwrites (200). There is no unassign endpoint, so rejecting reassignment (409) would make a wrong assignment permanent.
- New tasks now include `assignee: null` so the shape is consistent.

## Submission notes
- **Test next:** concurrency-free edge cases of PUT (fields listed above), large/negative pagination, malformed JSON body (currently 500 via the error handler; should be 400), ids of unusual types.
- **Surprises:** the three logic bugs are all one-line; README and code disagree on status names.
- **Questions before production:** is the in-memory store acceptable; should assignee be a user id validated against a user list; should reassignment be restricted; auth; max page size.

## Coverage
```
All files       |    97.4 |    97.67 |   93.33 |   97.14
```
