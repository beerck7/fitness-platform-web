import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient, ApiError } from '../../frontend/src/js/api/client.js';
import { createDemoData, createDemoFetch } from '../../frontend/src/js/api/demo.js';
import { escapeHtml, number } from '../../frontend/src/js/utils/dom.js';
import { count } from '../../frontend/src/js/utils/locale.js';
import { percentage } from '../../frontend/src/js/utils/analytics.js';
import { validDate, shortDate } from '../../frontend/src/js/utils/date.js';

test('friends extend existing demo saves and persist invitations without resetting training data', async () => {
  const data = createDemoData();
  data.workouts[0].name = 'Mój zapisany trening';
  delete data.people;
  delete data.friendships;
  const memory = new Map([['stride:demo:v1', JSON.stringify({ version: 2, data })]]);
  const storage = {
    getItem: (key) => memory.get(key),
    setItem: (key, value) => memory.set(key, value),
  };
  const makeClient = () =>
    createApiClient({ baseUrl: '/api', fetchImpl: createDemoFetch({ storage }) });
  const client = makeClient();
  assert.equal((await client.get('/Workouts'))[0].name, 'Mój zapisany trening');
  const incoming = (await client.get('/Friendship/pending')).find((request) => request.isIncoming);
  await client.post(`/Friendship/accept/${incoming.friendshipId}`);
  assert.equal((await client.get('/Friendship/friends')).length, 3);
  await client.post('/Friendship/send', { addresseeId: 'demo-piotr' });
  await assert.rejects(
    () => client.post('/Friendship/send', { addresseeId: 'demo-piotr' }),
    (error) => error.status === 409,
  );
  const persisted = makeClient();
  const outgoing = (await persisted.get('/Friendship/pending')).find(
    (request) => request.userId === 'demo-piotr',
  );
  await assert.rejects(
    () => persisted.post(`/Friendship/accept/${outgoing.friendshipId}`),
    (error) => error.status === 404,
  );
  await persisted.post(`/Friendship/reject/${outgoing.friendshipId}`);
  assert.equal((await makeClient().get('/Friendship/pending')).length, 0);
  assert.equal((await makeClient().get('/Workouts'))[0].name, 'Mój zapisany trening');
});

test('route dates accept real calendar dates and reject markup and impossible dates', () => {
  assert.equal(validDate('2024-02-29'), true);
  for (const value of ['2025-02-29', '2026-13-01', '2026-02-31', '', null, '"><script>'])
    assert.equal(validDate(value), false);
});

test('Polish formatting handles decimal numbers, month names and noun forms', () => {
  assert.equal(number(68.4, 1), '68,4');
  assert.equal(shortDate('2026-10-04'), '4 paź');
  for (const [value, label] of [
    [1, 'trening'],
    [2, 'treningi'],
    [5, 'treningów'],
    [12, 'treningów'],
    [22, 'treningi'],
  ])
    assert.equal(count(value, 'trening', 'treningi', 'treningów'), `${value} ${label}`);
});

test('old demo text migrates to Polish without losing edits, completion or entries', async () => {
  const data = createDemoData();
  data.exercises[0].name = 'Goblet squat';
  data.exercises[0].description = 'My custom coaching note';
  data.exercises.push({ ...data.exercises[0], id: 123, name: 'My custom exercise' });
  data.workouts[0].name = 'My renamed workout';
  data.workouts[0].isCompleted = true;
  data.workouts[0].exercises[0].exerciseName = 'Goblet squat';
  data.workouts[1].name = 'Upper body strength';
  data.products[0].name = 'Greek yogurt';
  data.entries[0].productName = 'Greek yogurt';
  const memory = new Map([['stride:demo:v1', JSON.stringify({ version: 1, data })]]);
  const storage = {
    getItem: (key) => memory.get(key),
    setItem: (key, value) => memory.set(key, value),
  };
  const client = createApiClient({
    baseUrl: '/api',
    fetchImpl: createDemoFetch({ storage, latency: 0 }),
  });
  const workouts = await client.get('/Workouts');
  assert.equal(workouts[0].name, 'My renamed workout');
  assert.equal(workouts[0].isCompleted, true);
  assert.equal(workouts[0].exercises[0].exerciseName, 'Przysiad z hantlem');
  assert.equal(workouts[1].name, 'Siła górnej części ciała');
  const saved = JSON.parse(memory.get('stride:demo:v1'));
  assert.equal(saved.version, 2);
  assert.equal(saved.data.entries[0].productName, 'Jogurt grecki');
  assert.equal(saved.data.exercises[0].description, 'My custom coaching note');
  assert.equal(saved.data.exercises.at(-1).name, 'My custom exercise');
  assert.deepEqual(saved.data.weights, data.weights);
  assert.equal(saved.data.entries.length, data.entries.length);
  assert.equal(saved.data.profile.name, data.profile.name);
});

test('API validation and failed sign-in remain readable in Polish', async () => {
  for (const [status, body, expected] of [
    [
      400,
      {
        title: 'One or more validation errors occurred.',
        errors: { Password: ['The field Password must be at least 12 characters.'] },
      },
      'Sprawdź pola: Hasło.',
    ],
    [401, { message: 'Invalid email or password.' }, 'Nieprawidłowy adres e-mail lub hasło.'],
    [
      500,
      { title: 'An unexpected error occurred.' },
      'Serwer nie mógł wykonać operacji. Spróbuj ponownie.',
    ],
  ]) {
    const client = createApiClient({
      baseUrl: '/api',
      fetchImpl: async () => Response.json(body, { status }),
    });
    await assert.rejects(
      client.post('/Account/login', {}),
      (error) => error.status === status && error.message === expected,
    );
  }
});

test('Fetch client sends all REST methods, serializes JSON and attaches an in-memory token', async () => {
  const calls = [];
  const client = createApiClient({
    baseUrl: '/api',
    getToken: () => 'test-memory-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, ...options });
      return new Response(null, { status: 204 });
    },
  });
  await client.get('/items');
  await client.post('/items', { name: 'test' });
  await client.put('/items/1', { name: 'edited' });
  await client.patch('/items/1', { complete: true });
  await client.delete('/items/1');
  assert.deepEqual(
    calls.map((call) => call.method),
    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  );
  assert.equal(calls[0].headers.Authorization, 'Bearer test-memory-token');
  assert.equal(calls[0].headers['Content-Type'], undefined);
  assert.equal(calls[1].body, '{"name":"test"}');
});

test('401 clears an authenticated session; failed login does not trigger an expiry redirect', async () => {
  let expired = 0;
  const client = createApiClient({
    baseUrl: '/api',
    getToken: () => 'test-memory-token',
    onUnauthorized: () => expired++,
    fetchImpl: async () => new Response(null, { status: 401 }),
  });
  await assert.rejects(
    client.get('/User/me'),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(expired, 1);
  const login = createApiClient({
    baseUrl: '/api',
    onUnauthorized: () => expired++,
    fetchImpl: async () => new Response(null, { status: 401 }),
  });
  await assert.rejects(login.post('/Account/login', {}));
  assert.equal(expired, 1);
});

test('404, 500, malformed JSON, network failure and timeout become controlled errors', async () => {
  for (const status of [404, 500]) {
    const client = createApiClient({
      baseUrl: '/api',
      fetchImpl: async () => new Response(null, { status }),
    });
    await assert.rejects(client.get('/items'), (error) => error.status === status);
  }
  for (const [fetchImpl, status] of [
    [async () => new Response('<html>'), 502],
    [
      async () => {
        throw new TypeError('offline');
      },
      0,
    ],
  ]) {
    await assert.rejects(
      createApiClient({ baseUrl: '/api', fetchImpl }).get('/items'),
      (error) => error.status === status,
    );
  }
  const fetchImpl = (_url, options) =>
    new Promise((_resolve, reject) =>
      options.signal.addEventListener('abort', () =>
        reject(new DOMException('Cancelled', 'AbortError')),
      ),
    );
  await assert.rejects(
    createApiClient({ baseUrl: '/api', fetchImpl, timeoutMs: 5 }).get('/items'),
    (error) => error.status === 408,
  );
});

test('navigation abort stays distinct from transport failure', async () => {
  const controller = new AbortController();
  const fetchImpl = (_url, options) =>
    new Promise((_resolve, reject) =>
      options.signal.addEventListener('abort', () =>
        reject(new DOMException('Cancelled', 'AbortError')),
      ),
    );
  const result = createApiClient({ baseUrl: '/api', fetchImpl }).get('/items', {
    signal: controller.signal,
  });
  controller.abort();
  await assert.rejects(result, (error) => error.name === 'AbortError');
});

test('demo workout CRUD persists independently and does not store passwords or access tokens', async () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key),
    setItem: (key, value) => memory.set(key, value),
  };
  const client = createApiClient({
    baseUrl: '/api',
    fetchImpl: createDemoFetch({ storage }),
  });
  await client.post('/Account/register', {
    name: 'Test Explorer',
    email: 'test@example.com',
    password: 'not-a-real-password',
  });
  const cancelled = new AbortController();
  cancelled.abort();
  await assert.rejects(
    client.put('/User/me', { name: 'Cancelled edit' }, { signal: cancelled.signal }),
    (error) => error.name === 'AbortError',
  );
  assert.equal((await client.get('/User/me')).name, 'Test Explorer');
  await client.post('/Workouts', {
    name: 'My workout',
    workoutDate: '2026-10-04T12:00:00',
    durationMinutes: 30,
    isCompleted: false,
    exercises: [{ exerciseId: 1, sets: 3, reps: 10 }],
  });
  const created = (await client.get('/Workouts')).find((item) => item.name === 'My workout');
  await client.put(`/Workouts/${created.id}/settings`, { name: 'Renamed workout' });
  await client.patch(`/Workouts/${created.id}/completion`, { isCompleted: true });
  const restored = createApiClient({
    baseUrl: '/api',
    fetchImpl: createDemoFetch({ storage }),
  });
  assert.equal(
    (await restored.get('/Workouts')).find((item) => item.id === created.id).isCompleted,
    true,
  );
  await restored.delete(`/Workouts/${created.id}`);
  assert.ok(!(await restored.get('/Workouts')).some((item) => item.id === created.id));
  const saved = [...memory.values()].join('');
  assert.ok(!saved.includes('not-a-real-password'));
  assert.ok(!saved.includes('accessToken'));
});

test('demo nutrition calculates portions and updates the selected day after deletion', async () => {
  const client = createApiClient({
    baseUrl: '/api',
    fetchImpl: createDemoFetch({ storage: null, latency: 0 }),
  });
  const product = (await client.get('/Products'))[0];
  const id = await client.post('/FoodDiary', {
    date: '2020-01-01',
    mealType: 0,
    productId: product.id,
    productAmount: 200,
  });
  assert.equal((await client.get('/FoodDiary/2020-01-01')).totalKcal, product.kcal * 2);
  await client.delete(`/FoodDiary/${id}`);
  assert.equal((await client.get('/FoodDiary/2020-01-01')).totalKcal, 0);
});

test('HTML escaping protects user content and progress percentages handle empty targets', () => {
  assert.equal(escapeHtml('<img onerror="alert(1)">'), '&lt;img onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(percentage(10, 0), 0);
  assert.equal(percentage(150, 100), 100);
});
