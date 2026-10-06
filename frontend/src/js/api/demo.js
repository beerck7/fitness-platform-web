import { dateISO, daysAgo } from '../utils/date.js';
import { migrateDemoLanguage } from '../utils/legacy-demo.js';

const KEY = 'stride:demo:v1';
export function createDemoData() {
  const exercises = [
    {
      id: 1,
      name: 'Przysiad z hantlem',
      description: 'Ćwicz nogi, wykonując przysiad z kontrolowanym ruchem.',
      equipmentRequired: 'Hantel',
      muscleGroupId: 3,
      difficultyLevel: 0,
      instructions: 'Trzymaj klatkę piersiową wysoko. Powoli zejdź w dół i spokojnie wstań.',
    },
    {
      id: 2,
      name: 'Wiosłowanie hantlem',
      description: 'Ćwiczenie górnej części pleców wykonywane jedną ręką.',
      equipmentRequired: 'Hantel',
      muscleGroupId: 2,
      difficultyLevel: 0,
      instructions: 'Podeprzyj tułów i przyciągnij łokieć w stronę biodra.',
    },
    {
      id: 3,
      name: 'Pompki',
      description: 'Ćwiczenie klatki piersiowej i ramion z masą własnego ciała.',
      equipmentRequired: 'Masa własnego ciała',
      muscleGroupId: 1,
      difficultyLevel: 0,
      instructions: 'Utrzymuj ciało w jednej linii i powoli się opuszczaj.',
    },
    {
      id: 4,
      name: 'Rumuński martwy ciąg',
      description: 'Ćwicz ruch w biodrach i wzmacniaj tylną część ciała.',
      equipmentRequired: 'Hantel',
      muscleGroupId: 3,
      difficultyLevel: 1,
      instructions: 'Lekko ugnij kolana i pochyl tułów, zginając się w biodrach.',
    },
    {
      id: 5,
      name: 'Wyciskanie nad głowę',
      description: 'Wzmocnij barki, wyciskając hantle nad głowę.',
      equipmentRequired: 'Hantel',
      muscleGroupId: 4,
      difficultyLevel: 1,
      instructions: 'Napnij tułów. Wyciskaj bez wyginania pleców.',
    },
    {
      id: 6,
      name: 'Deska',
      description: 'Proste ćwiczenie stabilizacji mięśni tułowia.',
      equipmentRequired: 'Masa własnego ciała',
      muscleGroupId: 7,
      difficultyLevel: 0,
      instructions: 'Utrzymuj biodra na jednej wysokości i oddychaj spokojnie.',
    },
  ];
  const workout = (id, name, ago, completed, ids, duration = 45) => ({
    id,
    name,
    date: `${daysAgo(ago)}T09:00:00`,
    durationMinutes: duration,
    isCompleted: completed,
    isFavorite: id <= 2,
    exercisesCount: ids.length,
    exercises: ids.map((exerciseId) => ({
      exerciseId,
      exerciseName: exercises.find((item) => item.id === exerciseId).name,
      sets: 3,
      reps: 12,
      weight: 0,
      targetWeight: exerciseId === 3 || exerciseId === 6 ? 0 : 10,
      restSeconds: 60,
    })),
  });
  const products = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Jogurt grecki',
      kcal: 73,
      protein: 10,
      carbs: 3.9,
      fat: 2,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Płatki owsiane',
      kcal: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Pierś z kurczaka',
      kcal: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Ryż brązowy gotowany',
      kcal: 123,
      protein: 2.7,
      carbs: 25.6,
      fat: 1,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      name: 'Banan',
      kcal: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      name: 'Awokado',
      kcal: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
    },
  ];
  const entry = (id, product, amount, mealType) => ({
    id,
    date: dateISO(),
    mealType,
    productId: product.id,
    productName: product.name,
    productAmount: amount,
    kcal: (product.kcal * amount) / 100,
    protein: (product.protein * amount) / 100,
    carbs: (product.carbs * amount) / 100,
    fat: (product.fat * amount) / 100,
  });
  return {
    profile: {
      id: 'demo-user',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      dateOfBirth: '1999-06-15',
      gender: 'female',
      visibility: false,
    },
    goal: {
      currentWeightKg: 68.4,
      heightCm: 172,
      targetCalories: 2200,
      proteinGrams: 140,
      carbsGrams: 260,
      fatGrams: 70,
      trainingsPerWeekTarget: 4,
      activityLevel: 2,
      stepsPerDayTarget: 8000,
      goalType: 0,
    },
    exercises,
    products,
    workouts: [
      workout(1, 'Trening całego ciała', 0, false, [1, 2, 3, 6]),
      workout(2, 'Siła górnej części ciała', 1, true, [2, 3, 5], 40),
      workout(3, 'Nogi i mięśnie brzucha', 3, true, [1, 4, 6], 50),
      workout(4, 'Trening ogólnorozwojowy', 5, true, [1, 2, 3], 35),
      workout(5, 'Siła górnej części ciała', 8, true, [2, 3, 5], 40),
      workout(6, 'Nogi i mięśnie brzucha', 10, true, [1, 4, 6], 50),
    ],
    weights: Array.from({ length: 7 }, (_, index) => ({
      id: `weight-${index}`,
      weightKg: 69.8 - index * 0.23,
      dateRecorded: `${daysAgo((6 - index) * 5)}T12:00:00`,
    })),
    entries: [
      entry('entry-1', products[0], 200, 0),
      entry('entry-2', products[1], 80, 0),
      entry('entry-3', products[2], 200, 1),
      entry('entry-4', products[3], 200, 1),
      entry('entry-5', products[4], 120, 3),
    ],
    people: [
      { userId: 'demo-anna', name: 'Anna Kowalska' },
      { userId: 'demo-michal', name: 'Michał Nowak' },
      { userId: 'demo-julia', name: 'Julia Wiśniewska' },
      { userId: 'demo-piotr', name: 'Piotr Zieliński' },
      { userId: 'demo-marta', name: 'Marta Wójcik' },
    ],
    friendships: [
      { id: 1, userId: 'demo-anna', status: 'accepted', isIncoming: false, date: daysAgo(20) },
      { id: 2, userId: 'demo-michal', status: 'accepted', isIncoming: true, date: daysAgo(12) },
      { id: 3, userId: 'demo-julia', status: 'pending', isIncoming: true, date: daysAgo(1) },
    ],
  };
}

export function summarizeDiary(entries, date) {
  const selected = entries.filter((entry) => entry.date === date);
  return {
    date,
    totalKcal: selected.reduce((sum, item) => sum + item.kcal, 0),
    totalProtein: selected.reduce((sum, item) => sum + item.protein, 0),
    totalCarbs: selected.reduce((sum, item) => sum + item.carbs, 0),
    totalFat: selected.reduce((sum, item) => sum + item.fat, 0),
    breakfast: selected.filter((item) => item.mealType === 0),
    lunch: selected.filter((item) => item.mealType === 1),
    dinner: selected.filter((item) => item.mealType === 2),
    snacks: selected.filter((item) => item.mealType === 3),
    other: selected.filter((item) => item.mealType === 4),
  };
}

export function createDemoFetch({ storage = globalThis.localStorage, latency = 0 } = {}) {
  let data;
  try {
    const saved = JSON.parse(storage?.getItem(KEY) ?? 'null');
    data =
      [1, 2].includes(saved?.version) && saved.data?.profile && Array.isArray(saved.data.workouts)
        ? saved.data
        : createDemoData();
    if (saved?.version === 1) {
      migrateDemoLanguage(data, createDemoData());
      save();
    }
  } catch {
    data = createDemoData();
  }
  // Extend older demo saves without resetting workouts, meals or profile data.
  if (!Array.isArray(data.people)) data.people = createDemoData().people;
  if (!Array.isArray(data.friendships)) data.friendships = createDemoData().friendships;
  function save() {
    try {
      storage?.setItem(KEY, JSON.stringify({ version: 2, data }));
    } catch {
      /* Demo remains usable in memory when storage is blocked. */
    }
  }
  function respond(payload, status = 200) {
    return new Response(status === 204 ? null : JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return async (url, options = {}) => {
    if (options.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (latency > 0)
      await new Promise((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer);
          reject(new DOMException('Cancelled', 'AbortError'));
        };
        const timer = setTimeout(() => {
          options.signal?.removeEventListener('abort', abort);
          resolve();
        }, latency);
        options.signal?.addEventListener('abort', abort, { once: true });
        if (options.signal?.aborted) abort();
      });
    const parsed = new URL(url, 'https://demo.invalid');
    const path = parsed.pathname.replace(/^.*\/api/, '');
    const method = options.method ?? 'GET';
    const body = options.body ? JSON.parse(options.body) : {};
    if (path === '/User/search' && method === 'GET') {
      const term = (parsed.searchParams.get('term') ?? '').trim().toLocaleLowerCase('pl');
      return respond(
        term.length >= 2
          ? data.people.filter((person) => person.name.toLocaleLowerCase('pl').includes(term))
          : [],
      );
    }
    if (path === '/Friendship/friends' && method === 'GET') {
      return respond(
        data.friendships
          .filter((item) => item.status === 'accepted')
          .map((item) => ({
            ...data.people.find((person) => person.userId === item.userId),
            friendsSince: item.date,
          })),
      );
    }
    if (path === '/Friendship/pending' && method === 'GET') {
      return respond(
        data.friendships
          .filter((item) => item.status === 'pending')
          .map((item) => ({
            ...data.people.find((person) => person.userId === item.userId),
            friendshipId: item.id,
            requestDate: item.date,
            isIncoming: item.isIncoming,
          })),
      );
    }
    if (path === '/Friendship/send' && method === 'POST') {
      if (!data.people.some((person) => person.userId === body.addresseeId))
        return respond({ message: 'Nie znaleziono użytkownika.' }, 404);
      if (data.friendships.some((item) => item.userId === body.addresseeId))
        return respond({ message: 'Zaproszenie już istnieje lub jesteście znajomymi.' }, 409);
      const id = Math.max(0, ...data.friendships.map((item) => item.id)) + 1;
      data.friendships.push({
        id,
        userId: body.addresseeId,
        status: 'pending',
        isIncoming: false,
        date: dateISO(),
      });
      save();
      return respond({ friendshipId: id });
    }
    const friendAction = path.match(/^\/Friendship\/(accept|reject)\/(\d+)$/);
    if (friendAction && method === 'POST') {
      const friendship = data.friendships.find(
        (item) => item.id === Number(friendAction[2]) && item.status === 'pending',
      );
      if (!friendship || (friendAction[1] === 'accept' && !friendship.isIncoming))
        return respond({ message: 'Nie znaleziono zaproszenia.' }, 404);
      if (friendAction[1] === 'accept') {
        friendship.status = 'accepted';
        friendship.date = dateISO();
      } else data.friendships = data.friendships.filter((item) => item !== friendship);
      save();
      return respond(null, 204);
    }
    if (path === '/health') return respond({ status: 'ok', mode: 'demo' });
    if (path === '/Account/register' || path === '/Account/login') {
      data.profile.name = body.name || data.profile.name;
      if (body.email) data.profile.email = body.email;
      // This is a preview interaction. No password is stored and no real JWT is created.
      save();
      return respond({ accessToken: null, userName: data.profile.name, demo: true });
    }
    if (path === '/Account/change-password') return respond(null, 204);
    if (path === '/User/me') {
      if (method === 'PUT') {
        data.profile = { ...data.profile, ...body, gender: body.gender === 1 ? 'male' : 'female' };
        save();
        return respond(null, 204);
      }
      return respond(data.profile);
    }
    if (path === '/me/goal') {
      if (method === 'PUT') {
        data.goal = { ...data.goal, ...body };
        save();
      }
      return respond(data.goal);
    }
    if (path === '/Exercises') {
      if (method === 'POST') {
        data.exercises.push({
          ...body,
          id: Math.max(0, ...data.exercises.map((item) => item.id)) + 1,
        });
        save();
        return respond(null, 201);
      }
      return respond({
        items: data.exercises,
        totalCount: data.exercises.length,
        pageSize: 100,
        pageNumber: 1,
        totalPages: 1,
      });
    }
    if (path === '/Products') return respond(data.products);
    if (path === '/Workouts') {
      if (method === 'POST') {
        const exercises = body.exercises.map((exercise) => ({
          ...exercise,
          exerciseName:
            data.exercises.find((item) => item.id === exercise.exerciseId)?.name ?? 'Ćwiczenie',
        }));
        data.workouts.unshift({
          ...body,
          date: body.workoutDate,
          id: Math.max(0, ...data.workouts.map((item) => item.id)) + 1,
          exercises,
          exercisesCount: exercises.length,
          isFavorite: false,
        });
        save();
        return respond(null, 201);
      }
      return respond(data.workouts);
    }
    const workoutMatch = path.match(
      /^\/Workouts\/(\d+)(?:\/(settings|completion|toggle-favorite|schedule))?$/,
    );
    if (workoutMatch) {
      const index = data.workouts.findIndex((item) => item.id === Number(workoutMatch[1]));
      if (index < 0) return respond({ message: 'Nie znaleziono treningu.' }, 404);
      if (method === 'DELETE') data.workouts.splice(index, 1);
      else if (workoutMatch[2] === 'settings') data.workouts[index].name = body.name;
      else if (workoutMatch[2] === 'completion')
        data.workouts[index].isCompleted = body.isCompleted;
      else if (workoutMatch[2] === 'toggle-favorite')
        data.workouts[index].isFavorite = !data.workouts[index].isFavorite;
      else if (workoutMatch[2] === 'schedule') {
        data.workouts[index].date = body.workoutDate;
        data.workouts[index].name = body.name;
        data.workouts[index].durationMinutes = body.durationMinutes;
      } else return respond({ message: 'Nieobsługiwana operacja treningu.' }, 404);
      save();
      return respond(null, 204);
    }
    if (path === '/FoodDiary' && method === 'POST') {
      const product = data.products.find((item) => item.id === body.productId);
      if (!product || !(body.productAmount > 0))
        return respond({ message: 'Wybierz produkt i poprawną ilość.' }, 400);
      const entry = {
        ...body,
        id: globalThis.crypto.randomUUID(),
        productName: product.name,
        kcal: (product.kcal * body.productAmount) / 100,
        protein: (product.protein * body.productAmount) / 100,
        carbs: (product.carbs * body.productAmount) / 100,
        fat: (product.fat * body.productAmount) / 100,
      };
      data.entries.push(entry);
      save();
      return respond(entry.id);
    }
    if (path.startsWith('/FoodDiary/') && method === 'PUT') {
      const entry = data.entries.find((item) => item.id === path.split('/').at(-1));
      if (!entry) return respond({ message: 'Nie znaleziono wpisu w dzienniku.' }, 404);
      const product = data.products.find((item) => item.id === body.productId);
      if (
        !product ||
        body.productAmount <= 0 ||
        body.productAmount > 5000 ||
        !Number.isInteger(body.mealType) ||
        body.mealType < 0 ||
        body.mealType > 4
      )
        return respond({ message: 'Sprawdź ilość produktu i rodzaj posiłku.' }, 400);
      Object.assign(entry, body, {
        productName: product.name,
        kcal: (product.kcal * body.productAmount) / 100,
        protein: (product.protein * body.productAmount) / 100,
        carbs: (product.carbs * body.productAmount) / 100,
        fat: (product.fat * body.productAmount) / 100,
      });
      save();
      return respond(null, 204);
    }
    if (path.startsWith('/FoodDiary/') && method === 'GET')
      return respond(summarizeDiary(data.entries, path.split('/').at(-1)));
    if (path.startsWith('/FoodDiary/') && method === 'DELETE') {
      data.entries = data.entries.filter((item) => item.id !== path.split('/').at(-1));
      save();
      return respond(null, 204);
    }
    if (path === '/weight/history') return respond(data.weights);
    if (path === '/weight' && method === 'POST') {
      data.weights.push({ ...body, id: globalThis.crypto.randomUUID() });
      save();
      return respond(null, 200);
    }
    return respond({ message: 'Ta operacja nie jest dostępna w wersji demo.' }, 404);
  };
}
