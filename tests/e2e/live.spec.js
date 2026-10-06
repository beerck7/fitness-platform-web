import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test.use({ baseURL: 'http://127.0.0.1:5174' });

function account() {
  const id = randomUUID();
  return {
    name: 'API Test Explorer',
    email: `${id}@example.com`,
    phoneNumber: id.slice(0, 12),
    password: `Test-${id}`,
    dateOfBirth: '1999-06-15',
    gender: 0,
  };
}

test('friend invitations respect profile visibility and only the recipient can accept', async ({
  request,
}) => {
  const createUser = async (name, visibility) => {
    const details = { ...account(), name };
    const registration = await request.post('/api/Account/register', { data: details });
    expect(registration.status()).toBe(200);
    const { accessToken } = await registration.json();
    const headers = { Authorization: `Bearer ${accessToken}` };
    await request.put('/api/User/me', {
      headers,
      data: { name, visibility, gender: 0, dateOfBirth: details.dateOfBirth },
    });
    const profile = await (await request.get('/api/User/me', { headers })).json();
    return { ...details, id: profile.id, headers };
  };
  const tag = randomUUID().slice(0, 8);
  const sender = await createUser(`Nadawca ${tag}`, true);
  const recipient = await createUser(`Odbiorca ${tag}`, true);
  const outsider = await createUser(`Prywatny ${tag}`, false);
  const search = await (
    await request.get(`/api/User/search?term=${tag}`, { headers: sender.headers })
  ).json();
  expect(search.map((person) => person.userId)).toEqual([recipient.id]);
  expect(search[0]).not.toHaveProperty('email');
  expect(
    (
      await request.post('/api/Friendship/send', {
        headers: sender.headers,
        data: { addresseeId: outsider.id },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.post('/api/Friendship/send', {
        headers: sender.headers,
        data: { addresseeId: sender.id },
      })
    ).status(),
  ).toBe(400);
  const invitation = await request.post('/api/Friendship/send', {
    headers: sender.headers,
    data: { addresseeId: recipient.id },
  });
  expect(invitation.status()).toBe(200);
  const { friendshipId } = await invitation.json();
  expect(
    (
      await request.post('/api/Friendship/send', {
        headers: recipient.headers,
        data: { addresseeId: sender.id },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.post(`/api/Friendship/accept/${friendshipId}`, { headers: sender.headers })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.post(`/api/Friendship/reject/${friendshipId}`, { headers: outsider.headers })
    ).status(),
  ).toBe(404);
  const pending = await (
    await request.get('/api/Friendship/pending', { headers: recipient.headers })
  ).json();
  expect(pending).toEqual([
    expect.objectContaining({ friendshipId, isIncoming: true, userId: sender.id }),
  ]);
  expect(
    (
      await request.post(`/api/Friendship/accept/${friendshipId}`, { headers: recipient.headers })
    ).status(),
  ).toBe(204);
  const friends = await (
    await request.get('/api/Friendship/friends', { headers: sender.headers })
  ).json();
  expect(friends).toEqual([expect.objectContaining({ userId: recipient.id })]);
  expect(
    await (await request.get('/api/Friendship/friends', { headers: outsider.headers })).json(),
  ).toEqual([]);
  const invitationAgain = await request.post('/api/Friendship/send', {
    headers: outsider.headers,
    data: { addresseeId: recipient.id },
  });
  expect(invitationAgain.status()).toBe(200);
  const nextId = (await invitationAgain.json()).friendshipId;
  expect(
    (
      await request.post(`/api/Friendship/reject/${nextId}`, { headers: outsider.headers })
    ).status(),
  ).toBe(204);
  expect(
    await (await request.get('/api/Friendship/pending', { headers: outsider.headers })).json(),
  ).toEqual([]);
});

test('real ASP.NET API: auth, user ownership and complete REST persistence', async ({
  request,
}) => {
  expect((await request.get('/api/Workouts')).status()).toBe(401);
  const user = account();
  const registration = await request.post('/api/Account/register', { data: user });
  expect(registration.status()).toBe(200);
  const credentials = await registration.json();
  const claims = JSON.parse(
    Buffer.from(credentials.accessToken.split('.')[1], 'base64url').toString(),
  );
  expect(claims.iss).toBe('fitness-platform-api');
  expect(claims.aud).toBe('fitness-platform-web');
  expect(claims.exp - claims.iat).toBeLessThanOrEqual(1800);
  const headers = { Authorization: `Bearer ${credentials.accessToken}` };
  const changedName = {
    name: 'Updated API Explorer',
    gender: 1,
    dateOfBirth: user.dateOfBirth,
    visibility: false,
  };
  expect((await request.put('/api/User/me', { headers, data: changedName })).status()).toBe(204);
  expect((await (await request.get('/api/User/me', { headers })).json()).name).toBe(
    changedName.name,
  );
  const target = {
    targetCalories: 2400,
    trainingsPerWeekTarget: 3,
    heightCm: 178,
    currentWeightKg: 76.5,
    proteinGrams: 150,
    carbsGrams: 270,
    fatGrams: 80,
    goalType: 0,
    activityLevel: 2,
    stepsPerDayTarget: 8000,
  };
  expect((await request.put('/api/me/goal', { headers, data: target })).status()).toBe(200);
  expect((await (await request.get('/api/me/goal', { headers })).json()).targetCalories).toBe(2400);
  expect(
    (
      await request.post('/api/weight', {
        headers,
        data: { weightKg: 76.5, dateRecorded: '2020-01-01T12:00:00' },
      })
    ).status(),
  ).toBe(200);
  expect((await (await request.get('/api/weight/history', { headers })).json())[0].weightKg).toBe(
    76.5,
  );
  expect(
    (
      await request.post('/api/Exercises', {
        headers,
        data: {
          name: 'API controlled movement',
          description: 'Integration test exercise',
          difficultyLevel: 0,
          equipmentRequired: 'Masa własnego ciała',
          instructions: 'Move slowly.',
          muscleGroupId: 1,
          exercisesIds: [],
        },
      })
    ).status(),
  ).toBe(201);
  const invalid = await request.post('/api/Account/login', {
    data: { email: user.email, password: 'wrong-password' },
  });
  expect(invalid.status()).toBe(401);
  const exercises = await (await request.get('/api/Exercises?pageSize=100', { headers })).json();
  const created = await request.post('/api/Workouts', {
    headers,
    data: {
      name: 'API strength session',
      durationMinutes: 30,
      workoutDate: new Date().toISOString(),
      isCompleted: false,
      exercises: [
        {
          exerciseId: exercises.items[0].id,
          sets: 3,
          reps: 10,
          targetWeight: 7.5,
          restSeconds: 60,
        },
      ],
    },
  });
  expect(created.status()).toBe(201);
  const workout = (await (await request.get('/api/Workouts', { headers })).json())[0];
  expect(workout.exercises[0].targetWeight).toBe(7.5);
  expect(
    (
      await request.patch(`/api/Workouts/${workout.id}/schedule`, {
        headers,
        data: {
          name: 'Scheduled API session',
          workoutDate: '2026-10-07T18:30:00',
          durationMinutes: 40,
        },
      })
    ).status(),
  ).toBe(204);
  const scheduled = (await (await request.get('/api/Workouts', { headers })).json())[0];
  expect(scheduled.date).toBe('2026-10-07T18:30:00');
  expect(scheduled.durationMinutes).toBe(40);
  for (const targetWeight of [-1, 501]) {
    const invalidWeight = await request.post('/api/Workouts', {
      headers,
      data: {
        name: 'Invalid weight',
        durationMinutes: 30,
        workoutDate: new Date().toISOString(),
        exercises: [{ exerciseId: exercises.items[0].id, sets: 3, reps: 10, targetWeight }],
      },
    });
    expect(invalidWeight.status()).toBe(400);
  }
  expect(
    (
      await request.put(`/api/Workouts/${workout.id}/settings`, {
        headers,
        data: { name: 'Renamed API session' },
      })
    ).status(),
  ).toBe(204);
  expect(
    (
      await request.patch(`/api/Workouts/${workout.id}/completion`, {
        headers,
        data: { isCompleted: true },
      })
    ).status(),
  ).toBe(204);
  const other = await (await request.post('/api/Account/register', { data: account() })).json();
  expect(
    (
      await request.patch(`/api/Workouts/${workout.id}/schedule`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
        data: { name: 'Someone else', workoutDate: '2026-10-08T10:00:00', durationMinutes: 30 },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.delete(`/api/Workouts/${workout.id}`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
      })
    ).status(),
  ).toBe(404);
  const product = (await (await request.get('/api/Products', { headers })).json())[0];
  const entryResponse = await request.post('/api/FoodDiary', {
    headers,
    data: { date: '2020-01-01', mealType: 0, productId: product.id, productAmount: 200 },
  });
  expect(entryResponse.status()).toBe(200);
  const entry = await entryResponse.json();
  expect(
    (
      await request.put(`/api/FoodDiary/${entry}`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
        data: { mealType: 2, productId: product.id, productAmount: 150 },
      })
    ).status(),
  ).toBe(404);
  const diary = await (await request.get('/api/FoodDiary/2020-01-01', { headers })).json();
  expect(diary.totalKcal).toBe(product.kcal * 2);
  expect(
    (
      await request.put(`/api/FoodDiary/${entry}`, {
        headers,
        data: { mealType: 2, productId: product.id, productAmount: 150 },
      })
    ).status(),
  ).toBe(204);
  const movedDiary = await (await request.get('/api/FoodDiary/2020-01-01', { headers })).json();
  expect(movedDiary.breakfast).toHaveLength(0);
  expect(movedDiary.dinner[0].productAmount).toBe(150);
  expect(movedDiary.totalKcal).toBe(product.kcal * 1.5);
  expect((await request.delete(`/api/FoodDiary/${entry}`, { headers })).status()).toBe(204);
  expect((await request.delete(`/api/Workouts/${workout.id}`, { headers })).status()).toBe(204);
  expect((await request.get('/api/Workouts', { headers })).status()).toBe(200);
  expect((await request.get('/api/Exercises/2147483647', { headers })).status()).toBe(404);
  expect((await request.delete(`/api/FoodDiary/${entry}`, { headers })).status()).toBe(404);
  expect((await request.post('/api/weight', { headers, data: { weightKg: -1 } })).status()).toBe(
    400,
  );
  const newPassword = `Changed-${randomUUID()}`;
  expect(
    (
      await request.put('/api/Account/change-password', {
        headers,
        data: { oldPassword: user.password, newPassword },
      })
    ).status(),
  ).toBe(204);
  expect(
    (
      await request.post('/api/Account/login', {
        data: { email: user.email, password: user.password },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post('/api/Account/login', {
        data: { email: user.email, password: newPassword },
      })
    ).status(),
  ).toBe(200);
  const longPasswordUser = { ...account(), password: 'ą'.repeat(80) + 'A' };
  expect((await request.post('/api/Account/register', { data: longPasswordUser })).status()).toBe(
    200,
  );
  expect(
    (
      await request.post('/api/Account/login', {
        data: { email: longPasswordUser.email, password: longPasswordUser.password },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post('/api/Account/login', {
        data: { email: longPasswordUser.email, password: 'ą'.repeat(80) + 'B' },
      })
    ).status(),
  ).toBe(401);
});

test('real frontend registers, signs in and creates a workout without demo or stored tokens', async ({
  page,
}) => {
  const user = account();
  await page.goto('/#/register');
  await page.getByLabel('Imię i nazwisko').fill(user.name);
  await page.getByLabel('Adres e-mail').fill(user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(user.password);
  await page.getByLabel('Data urodzenia').fill(user.dateOfBirth);
  await page.getByLabel('Numer telefonu').fill(user.phoneNumber);
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Witaj, API/ })).toBeVisible();
  await expect(page.getByText('POŁĄCZONO Z API', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Plany', exact: true }).click();
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  await page.getByLabel('Nazwa treningu').fill('Browser API session');
  await page
    .getByRole('button', { name: 'Dodaj ćwiczenie: Przysiad z hantlem', exact: true })
    .click();
  await page.getByLabel('Ciężar docelowy (kg): Przysiad z hantlem', { exact: true }).fill('7.5');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Utwórz trening', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Browser API session' })).toBeVisible();
  await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(/7,5 kg docelowo/)).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('checkbox', { name: 'Wykonano: Przysiad z hantlem' })
    .check();
  await page.getByRole('dialog').getByRole('button', { name: 'Zakończ trening' }).click();
  await expect(page.getByRole('button', { name: 'Zobacz trening', exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.entries(localStorage).some(([key, value]) => /token|password/i.test(key + value)),
    ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Wyloguj się' }).click();
  await page.getByLabel('Adres e-mail').fill(user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Witaj, API/ })).toBeVisible();
});

test('live mode shows an API error with retry and handles an expired session', async ({ page }) => {
  const user = account();
  const credentials = await (
    await page.request.post('/api/Account/register', { data: user })
  ).json();
  await page.route('**/api/Account/login', (route) => route.fulfill({ json: credentials }));
  await page.goto('/#/login');
  await page.getByLabel('Adres e-mail').fill(user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Witaj, API/ })).toBeVisible();
  let fail = true;
  await page.route('**/api/Workouts', (route) =>
    fail
      ? route.fulfill({ status: 500, json: { title: 'Test API unavailable.' } })
      : route.continue(),
  );
  await page.getByRole('link', { name: 'Plany', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nie udało się wczytać danych' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
  await expect(page.getByRole('heading', { name: 'Twoje treningi', exact: true })).toBeVisible();
  await page.route('**/api/User/me', (route) => route.fulfill({ status: 401 }));
  await page.getByRole('link', { name: 'Profil', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Zaloguj się na swoje konto' })).toBeVisible();
});
