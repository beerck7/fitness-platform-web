import { api } from '../api/services.js';
import { loading, renderError } from '../utils/dom.js';
import { dateISO } from '../utils/date.js';
import { icon } from '../utils/icons.js';
import { pageHeading } from './shell.js';
import { mountWorkoutBuilder } from './workout-builder.js';

export async function renderTraining(container, signal, selectedDate) {
  if (signal.aborted) return;
  loading(container);
  try {
    const exercises = await api.exercises({ signal });
    if (signal.aborted) return;
    container.innerHTML = `${pageHeading('Ułóż trening', 'Wybierz ćwiczenia i dopasuj serie, powtórzenia oraz przerwy.', `<a class="button button--secondary" href="#/workouts">Twoje plany ${icon('arrow', 16)}</a>`)}<section class="panel training-builder" aria-label="Kreator treningu" data-training-builder></section>`;
    mountWorkoutBuilder(
      container.querySelector('[data-training-builder]'),
      exercises,
      () => {
        location.hash = '#/workouts';
      },
      selectedDate ?? dateISO(),
    );
  } catch (error) {
    if (!signal.aborted)
      renderError(container, error, () => renderTraining(container, signal, selectedDate));
  }
}
