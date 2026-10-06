import { api } from '../api/services.js';
import { escapeHtml, loading, emptyState, renderError, submitForm, toast } from '../utils/dom.js';
import { dateISO, shortDate, weekStart } from '../utils/date.js';
import { icon } from '../utils/icons.js';
import { count } from '../utils/locale.js';
import { closeDialog, openDialog, pageHeading } from './shell.js';
import { openWorkoutSession } from './workout-session.js';
import { openWorkoutBuilder } from './workout-builder.js';

export async function renderWorkouts(container, signal, selectedDate) {
  if (signal.aborted) return;
  loading(container);
  try {
    const [workouts, exercises] = await Promise.all([
      api.workouts({ signal }),
      api.exercises({ signal }),
    ]);
    if (signal.aborted) return;
    let activeDate = selectedDate ?? '';
    const monday = new Date(`${weekStart()}T12:00:00`);
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + index);
      return {
        date: dateISO(day),
        label: new Intl.DateTimeFormat('pl-PL', { weekday: 'short' }).format(day),
        day: day.getDate(),
      };
    });
    container.innerHTML = /* HTML */ `${pageHeading('Twoje treningi', 'Zaplanuj trening i ćwicz we własnym tempie.', `<button class="button button--primary" data-create-workout>${icon('plus', 16)} Utwórz trening</button>`)}
      <div
        class="training-days"
        role="group"
        aria-label="Wybierz datę treningu"
      >
        <button
          class="training-days__all"
          type="button"
          data-training-date=""
          aria-pressed="${!activeDate}"
        >
          Wszystkie daty</button
        >${days.map((day) => `<button type="button" data-training-date="${day.date}" aria-label="Treningi na ${day.date}" aria-pressed="${activeDate === day.date}"><span>${day.label}</span><strong>${day.day}</strong></button>`).join('')}
      </div>
      <div class="filter-bar">
        <div
          class="tabs"
          role="group"
          aria-label="Filtruj treningi"
        >
          ${[
            ['all', 'Wszystkie treningi'],
            ['planned', 'Zaplanowane'],
            ['completed', 'Ukończone'],
            ['favorites', 'Ulubione'],
          ]
            .map(
              ([filter, label]) =>
                `<button type="button" class="tabs__button ${filter === 'all' ? 'tabs__button--active' : ''}" data-filter="${filter}" aria-pressed="${filter === 'all'}">${label}</button>`,
            )
            .join('')}
        </div>
        <label class="search"
          >${icon('search', 17)}<span class="sr-only">Szukaj treningów</span
          ><input
            type="search"
            placeholder="Szukaj treningów"
            data-search-workouts
        /></label>
      </div>
      <div
        class="training-list"
        data-workouts
      ></div>`;
    let filter = 'all';
    let query = '';
    function draw() {
      const filtered = workouts.filter(
        (workout) =>
          (filter === 'all' ||
            (filter === 'completed' && workout.isCompleted) ||
            (filter === 'planned' && !workout.isCompleted) ||
            (filter === 'favorites' && workout.isFavorite)) &&
          (!activeDate || workout.date.startsWith(activeDate)) &&
          workout.name.toLowerCase().includes(query.toLowerCase()),
      );
      container.querySelector('[data-workouts]').innerHTML = filtered.length
        ? [false, true]
            .map((completed) => {
              const group = filtered
                .filter((workout) => workout.isCompleted === completed)
                .sort((a, b) =>
                  completed ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
                );
              return group.length
                ? `<section class="training-list__group"><h2 class="training-list__heading">${completed ? 'Ukończone treningi' : 'Zaplanowane treningi'}<span>${count(group.length, 'trening', 'treningi', 'treningów')}</span></h2><div class="training-list__cards">${group.map(workoutRow).join('')}</div></section>`
                : '';
            })
            .join('')
        : emptyState('Brak treningów', 'Utwórz trening lub zmień wybrane filtry.');
    }
    draw();
    container.querySelectorAll('[data-training-date]').forEach((button) =>
      button.addEventListener('click', () => {
        activeDate = button.dataset.trainingDate;
        container
          .querySelectorAll('[data-training-date]')
          .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        history.replaceState(null, '', `#/workouts${activeDate ? `?date=${activeDate}` : ''}`);
        draw();
      }),
    );
    container.querySelectorAll('[data-filter]').forEach((button) =>
      button.addEventListener('click', () => {
        filter = button.dataset.filter;
        container.querySelectorAll('[data-filter]').forEach((item) => {
          item.classList.toggle('tabs__button--active', item === button);
          item.setAttribute('aria-pressed', String(item === button));
        });
        draw();
      }),
    );
    container.querySelector('[data-search-workouts]').addEventListener('input', (event) => {
      query = event.target.value;
      draw();
    });
    container
      .querySelector('[data-create-workout]')
      .addEventListener('click', () =>
        openWorkoutBuilder(
          exercises,
          () => renderWorkouts(container, signal, activeDate || undefined),
          activeDate || dateISO(),
        ),
      );
    container.querySelector('[data-workouts]').addEventListener('click', async (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const id = Number(
        button.dataset.complete ||
          button.dataset.favorite ||
          button.dataset.rename ||
          button.dataset.session ||
          button.dataset.delete,
      );
      const workout = workouts.find((item) => item.id === id);
      if (!workout) return;
      if (button.dataset.session) {
        openWorkoutSession(workout, () =>
          renderWorkouts(container, signal, activeDate || undefined),
        );
        return;
      }
      if (button.dataset.rename) {
        openDialog(
          'Zmień nazwę treningu',
          `<form class="form" data-rename-form><label>Nazwa treningu<input name="name" value="${escapeHtml(workout.name)}" required minlength="2" maxlength="100"></label><p class="form__error" role="alert" data-form-error></p><button class="button button--primary" type="submit">Zapisz nazwę</button></form>`,
          (dialog) =>
            dialog.querySelector('form').addEventListener('submit', (event) => {
              event.preventDefault();
              void submitForm(
                event.target,
                (values) => api.renameWorkout(id, values.name),
                async () => {
                  closeDialog();
                  toast('Nazwa treningu zmieniona.');
                  await renderWorkouts(container, signal, activeDate || undefined);
                },
              );
            }),
        );
        return;
      }
      if (button.dataset.delete) {
        openDialog(
          'Usunąć trening?',
          `<p class="modal__description">Usunąć trening „${escapeHtml(workout.name)}”? Trening i jego serie zostaną usunięte.</p><form class="form"><p class="form__error" role="alert" data-form-error></p><div class="form__actions"><button class="button button--secondary" type="button" data-close-dialog>Zachowaj trening</button><button class="button button--danger" type="submit">Usuń trening</button></div></form>`,
          (dialog) =>
            dialog.querySelector('form').addEventListener('submit', (event) => {
              event.preventDefault();
              void submitForm(
                event.target,
                () => api.deleteWorkout(id),
                async () => {
                  closeDialog();
                  toast('Trening usunięty.');
                  await renderWorkouts(container, signal, activeDate || undefined);
                },
              );
            }),
        );
        return;
      }
      button.disabled = true;
      try {
        if (button.dataset.complete) await api.completeWorkout(id, !workout.isCompleted);
        else await api.favoriteWorkout(id);
        toast(
          button.dataset.complete
            ? 'Status treningu zaktualizowany.'
            : 'Lista ulubionych zaktualizowana.',
        );
        await renderWorkouts(container, signal, activeDate || undefined);
      } catch (error) {
        toast(error.message);
        if (button.isConnected) button.disabled = false;
      }
    });
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderWorkouts(container, signal));
  }
}

function workoutRow(workout) {
  const day = shortDate(workout.date).split(' ');
  return /* HTML */ `<article
    class="workout-card ${workout.isCompleted ? 'workout-card--completed' : ''}"
  >
    <div class="workout-card__date"><strong>${day[0]}</strong><span>${day[1]}</span></div>
    <div class="workout-card__body">
      <div class="workout-card__heading">
        <h3 class="workout-card__title">${escapeHtml(workout.name)}</h3>
        <span class="badge ${workout.isCompleted ? 'badge--success' : ''}"
          >${workout.isCompleted ? 'Ukończone' : 'Zaplanowane'}</span
        >
      </div>
      <div class="workout-card__meta">
        <span>${icon('clock', 14)}${workout.durationMinutes} min</span
        ><span>${count(workout.exercisesCount, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}</span>
      </div>
      <p class="workout-card__routine">
        ${workout.exercises
          .slice(0, 3)
          .map((exercise) => escapeHtml(exercise.exerciseName))
          .join(
            ' · ',
          )}${workout.exercises.length > 3 ? ` · +${workout.exercises.length - 3} więcej` : ''}
      </p>
    </div>
    <div class="workout-card__actions">
      <button
        class="button button--${workout.isCompleted ? 'secondary' : 'primary'}"
        data-session="${workout.id}"
      >
        ${workout.isCompleted ? 'Zobacz trening' : 'Rozpocznij trening'} ${icon('arrow', 15)}
      </button>
      <div class="workout-card__tools">
        <button
          class="text-link"
          type="button"
          data-complete="${workout.id}"
        >
          ${workout.isCompleted ? 'Oznacz jako planowany' : 'Oznacz jako ukończony'}</button
        ><button
          class="icon-button ${workout.isFavorite ? 'icon-button--saved' : ''}"
          data-favorite="${workout.id}"
          aria-label="${workout.isFavorite ? 'Usuń z ulubionych:' : 'Dodaj do ulubionych:'} ${escapeHtml(workout.name)}"
          aria-pressed="${workout.isFavorite}"
        >
          ${icon('star', 17)}</button
        ><button
          class="icon-button"
          data-rename="${workout.id}"
          aria-label="Zmień nazwę: ${escapeHtml(workout.name)}"
        >
          ${icon('edit', 16)}</button
        ><button
          class="icon-button"
          data-delete="${workout.id}"
          aria-label="Usuń: ${escapeHtml(workout.name)}"
        >
          ${icon('trash', 16)}
        </button>
      </div>
    </div>
  </article>`;
}
