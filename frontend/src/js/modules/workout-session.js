import { api } from '../api/services.js';
import { escapeHtml, number, submitForm, toast } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { count } from '../utils/locale.js';
import { closeDialog, openDialog } from './shell.js';

export function openWorkoutSession(workout, refresh) {
  const exercises = workout.exercises;
  const complete = workout.isCompleted;
  if (!exercises.length) {
    toast('Ten trening nie zawiera ćwiczeń.');
    return;
  }
  openDialog(
    workout.name,
    /* HTML */ ` <form class="form session-form">
      <div class="session-intro">
        <span class="badge ${complete ? 'badge--success' : ''}"
          >${complete ? 'Ukończony trening' : 'Twój trening'}</span
        ><span
          >${number(workout.durationMinutes)} min ·
          ${count(exercises.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}</span
        >
      </div>
      <p class="session-description">
        ${complete ? 'Lista ćwiczeń z ukończonego treningu.' : 'Wykonuj ćwiczenia i odhaczaj je na liście. Po zakończeniu zapisz trening jako ukończony.'}
      </p>
      <fieldset class="session-checklist">
        <legend class="sr-only">Ćwiczenia w treningu</legend>
        ${exercises.map((exercise, index) => `<label class="session-exercise"><span class="session-exercise__number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="session-exercise__details"><strong>${escapeHtml(exercise.exerciseName)}</strong><span>${count(exercise.sets, 'seria', 'serie', 'serii')} × ${count(exercise.reps, 'powtórzenie', 'powtórzenia', 'powtórzeń')} · ${exercise.targetWeight > 0 ? `${number(exercise.targetWeight, 1)} kg docelowo` : 'Bez dodatkowego obciążenia'}${exercise.restSeconds ? ` · ${exercise.restSeconds} s odpoczynku` : ''}</span></span><input type="checkbox" name="exercise-${index}" aria-label="Wykonano: ${escapeHtml(exercise.exerciseName)}" ${complete ? 'checked disabled' : ''}><span class="session-exercise__check" aria-hidden="true">${icon('check', 17)}</span></label>`).join('')}
      </fieldset>
      ${complete ? '<button class="button button--secondary" type="button" data-close-dialog>Zamknij trening</button>' : `<div class="session-finish"><div><p role="status" data-session-count>Wykonano 0 z ${exercises.length} ćwiczeń</p><progress value="0" max="${exercises.length}" aria-label="Postęp treningu"></progress></div><button class="button button--primary" type="submit" disabled>Zakończ trening ${icon('check', 17)}</button></div><p class="form__error" role="alert" data-form-error></p>`}
    </form>`,
    (dialog) => {
      dialog.classList.add('modal--session');
      if (complete) return;
      const form = dialog.querySelector('form');
      const boxes = [...form.querySelectorAll('input[type="checkbox"]')];
      const button = form.querySelector('[type="submit"]');
      form.addEventListener('change', () => {
        const done = boxes.filter((box) => box.checked).length;
        form.querySelector('[data-session-count]').textContent =
          `Wykonano ${done} z ${boxes.length} ćwiczeń`;
        form.querySelector('progress').value = done;
        button.disabled = done !== boxes.length;
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!boxes.every((box) => box.checked) || button.disabled) return;
        boxes.forEach((box) => {
          box.disabled = true;
        });
        void submitForm(
          form,
          () => api.completeWorkout(workout.id, true),
          async () => {
            const restoreFocus = form.isConnected && dialog.open;
            if (restoreFocus) closeDialog();
            toast('Trening ukończony i zapisany. Dobra robota!');
            await refresh();
            if (restoreFocus && !dialog.open) {
              const trigger =
                document.querySelector(`[data-session="${workout.id}"]`) ??
                document.querySelector('[data-start-session]');
              trigger?.focus({ preventScroll: true });
            }
          },
        ).finally(() => {
          boxes.forEach((box) => {
            box.disabled = false;
          });
        });
      });
    },
  );
}
