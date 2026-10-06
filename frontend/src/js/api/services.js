import { config } from '../config/app.js';
import { createApiClient, ApiError } from './client.js';
import { createDemoFetch } from './demo.js';
import { clearSession, getSession } from '../modules/session.js';
import { dateISO } from '../utils/date.js';

const client = createApiClient({
  baseUrl: config.apiBaseUrl,
  fetchImpl: config.demo ? createDemoFetch() : globalThis.fetch.bind(globalThis),
  getToken: () => getSession()?.accessToken,
  onUnauthorized: () => {
    clearSession();
    window.dispatchEvent(new Event('session-expired'));
  },
  timeoutMs: config.timeoutMs,
});

function arrayResponse(value, key) {
  const list = key ? value?.[key] : value;
  if (!Array.isArray(list) || list.some((item) => typeof item !== 'object' || item === null))
    throw new ApiError('Serwer zwrócił nieprawidłową listę danych.', 502);
  return list;
}

export const api = {
  health: (options) => client.get('/health', options),
  login: (body) => client.post('/Account/login', body),
  register: (body) => client.post('/Account/register', body),
  changePassword: (body) => client.put('/Account/change-password', body),
  profile: (options) => client.get('/User/me', options),
  updateProfile: (body) => client.put('/User/me', body),
  friends: async (options) => arrayResponse(await client.get('/Friendship/friends', options)),
  pendingFriends: async (options) =>
    arrayResponse(await client.get('/Friendship/pending', options)),
  searchUsers: async (term, options) =>
    arrayResponse(await client.get(`/User/search?term=${encodeURIComponent(term)}`, options)),
  sendFriendRequest: (addresseeId) => client.post('/Friendship/send', { addresseeId }),
  acceptFriendRequest: (id) => client.post(`/Friendship/accept/${id}`),
  rejectFriendRequest: (id) => client.post(`/Friendship/reject/${id}`),
  goal: async (options) => {
    try {
      return await client.get('/me/goal', options);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },
  updateGoal: (body) => client.put('/me/goal', body),
  workouts: async (options) => arrayResponse(await client.get('/Workouts', options)),
  createWorkout: (body) => client.post('/Workouts', body),
  renameWorkout: (id, name) => client.put(`/Workouts/${id}/settings`, { name }),
  completeWorkout: (id, isCompleted) => client.patch(`/Workouts/${id}/completion`, { isCompleted }),
  favoriteWorkout: (id) => client.post(`/Workouts/${id}/toggle-favorite`),
  scheduleWorkout: (id, body) => client.patch(`/Workouts/${id}/schedule`, body),
  deleteWorkout: (id) => client.delete(`/Workouts/${id}`),
  exercises: async (options) =>
    arrayResponse(await client.get('/Exercises?pageSize=100&page=1', options), 'items'),
  createExercise: (body) => client.post('/Exercises', body),
  products: async (options) => arrayResponse(await client.get('/Products', options)),
  diary: (date = dateISO(), options) => client.get(`/FoodDiary/${date}`, options),
  addFood: (body) => client.post('/FoodDiary', body),
  updateFood: (id, body) => client.put(`/FoodDiary/${id}`, body),
  deleteFood: (id) => client.delete(`/FoodDiary/${id}`),
  weights: async (options) => arrayResponse(await client.get('/weight/history', options)),
  addWeight: (body) => client.post('/weight', body),
};
