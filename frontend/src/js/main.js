import '../styles/main.scss';
import { config } from './config/app.js';
import { getSession } from './modules/session.js';
import { mountShell, setActivePage, syncShellProfile } from './modules/shell.js';
import { renderOverview } from './modules/overview.js';
import { renderWorkouts } from './modules/workouts.js';
import { renderTraining } from './modules/training.js';
import { renderFriends } from './modules/friends.js';
import { renderSchedule } from './modules/schedule.js';
import { renderExercises } from './modules/exercises.js';
import { renderNutrition } from './modules/nutrition.js';
import { renderProgress } from './modules/progress.js';
import { renderProfile } from './modules/profile.js';
import { renderAuth } from './modules/auth.js';
import { emptyState, toast } from './utils/dom.js';
import { validDate } from './utils/date.js';
import { mountPolishValidation } from './utils/validation.js';

const views = {
  overview: renderOverview,
  workouts: renderWorkouts,
  training: renderTraining,
  friends: renderFriends,
  schedule: renderSchedule,
  exercises: renderExercises,
  nutrition: renderNutrition,
  progress: renderProgress,
  profile: renderProfile,
};
let controller;
mountShell();
mountPolishValidation();
document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('#main-content').focus();
});

function renderRoute() {
  controller?.abort();
  controller = new AbortController();
  const [path, query] = location.hash.replace(/^#\//, '').split('?');
  const route = path || 'overview';
  const params = new URLSearchParams(query);
  const selectedDate = params.get('date');
  if (!config.demo && !getSession() && !['login', 'register'].includes(route)) {
    location.replace('#/login');
    return;
  }
  const dialog = document.querySelector('#app-dialog');
  if (dialog.open) dialog.close();
  setActivePage(route);
  if (views[route] && !['overview', 'profile'].includes(route))
    void syncShellProfile(controller.signal);
  const container = document.querySelector('#main-content');
  container.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (route === 'login' || route === 'register') renderAuth(container, route === 'register');
  else if (views[route]) {
    const signal = controller.signal;
    void views[route](
      container,
      signal,
      validDate(selectedDate) ? selectedDate : undefined,
      params.get('search')?.slice(0, 100) ?? '',
    ).then(() => {
      if (signal.aborted || params.get('action') !== 'add') return;
      const actions = { nutrition: '[data-add-food]', progress: '[data-log-weight]' };
      const button = actions[route] && container.querySelector(actions[route]);
      button?.focus();
      button?.click();
    });
  } else
    container.innerHTML = emptyState(
      'Nie znaleziono strony',
      'Wybierz stronę z menu.',
      '<a class="button button--primary" href="#/overview">Wróć do pulpitu</a>',
    );
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('session-expired', () => {
  toast('Sesja wygasła. Zaloguj się ponownie.');
  location.hash = '#/login';
});
renderRoute();
