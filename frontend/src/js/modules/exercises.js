import { api } from '../api/services.js';
import { escapeHtml, loading, emptyState, renderError, submitForm, toast } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { closeDialog, openDialog, pageHeading } from './shell.js';

const muscles = {
  1: 'Klatka piersiowa',
  2: 'Plecy',
  3: 'Nogi',
  4: 'Barki',
  5: 'Biceps',
  6: 'Triceps',
  7: 'Mięśnie brzucha',
  8: 'Kondycja',
};

export async function renderExercises(container, signal, _selectedDate, initialSearch = '') {
  if (signal.aborted) return;
  loading(container);
  try {
    const exercises = await api.exercises({ signal });
    if (signal.aborted) return;
    container.innerHTML = /* HTML */ `${pageHeading('Biblioteka ćwiczeń', 'Poznaj ćwiczenia i ułóż własny trening.', `<button class="button button--primary" data-add-exercise>${icon('plus', 16)} Dodaj ćwiczenie</button>`)}
      <div class="filter-bar">
        <label class="search"
          >${icon('search', 17)}<span class="sr-only">Szukaj ćwiczeń</span
          ><input
            type="search"
            placeholder="Szukaj ćwiczeń"
            value="${escapeHtml(initialSearch)}"
            data-exercise-search /></label
        ><label class="select-field"
          >Grupa mięśniowa<select data-muscle-filter>
            <option value="all">Wszystkie grupy mięśniowe</option>
            ${Object.entries(muscles)
              .map(([id, name]) => `<option value="${id}">${name}</option>`)
              .join('')}
          </select></label
        >
      </div>
      <div
        class="exercise-grid"
        data-exercise-list
      ></div>`;
    let query = initialSearch;
    let muscle = 'all';
    function draw() {
      const list = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query.toLowerCase()) &&
          (muscle === 'all' || exercise.muscleGroupId === Number(muscle)),
      );
      container.querySelector('[data-exercise-list]').innerHTML = list.length
        ? list
            .map(
              (exercise) =>
                `<article class="panel exercise-card"><div class="exercise-card__top"><span class="soft-icon">${icon(exercise.equipmentRequired === 'Masa własnego ciała' ? 'activity' : 'dumbbell', 24)}</span><span class="badge">${['Początkujący', 'Średniozaawansowany', 'Zaawansowany'][exercise.difficultyLevel] ?? 'Każdy poziom'}</span></div><span class="eyebrow">${muscles[exercise.muscleGroupId] ?? 'Całe ciało'} · ${escapeHtml(exercise.equipmentRequired)}</span><h2>${escapeHtml(exercise.name)}</h2><p>${escapeHtml(exercise.description)}</p><details><summary>Wskazówki</summary><p>${escapeHtml(exercise.instructions)}</p></details></article>`,
            )
            .join('')
        : emptyState(
            'Brak pasujących ćwiczeń',
            'Zmień nazwę lub grupę mięśniową albo dodaj własne ćwiczenie.',
          );
    }
    draw();
    container.querySelector('[data-exercise-search]').addEventListener('input', (event) => {
      query = event.target.value;
      draw();
    });
    container.querySelector('[data-muscle-filter]').addEventListener('change', (event) => {
      muscle = event.target.value;
      draw();
    });
    container.querySelector('[data-add-exercise]').addEventListener('click', () =>
      openDialog(
        'Nowe ćwiczenie',
        `<form class="form"><label>Nazwa ćwiczenia<input name="name" required minlength="2" maxlength="100"></label><label>Krótki opis<textarea name="description" required maxlength="300" rows="2"></textarea></label><div class="form__row"><label>Grupa mięśniowa<select name="muscleGroupId">${Object.entries(
          muscles,
        )
          .map(([id, label]) => `<option value="${id}">${label}</option>`)
          .join(
            '',
          )}</select></label><label>Poziom trudności<select name="difficultyLevel"><option value="0">Początkujący</option><option value="1">Średniozaawansowany</option><option value="2">Zaawansowany</option></select></label></div><label>Sprzęt<input name="equipmentRequired" required maxlength="100" placeholder="np. masa własnego ciała"></label><label>Wskazówki<textarea name="instructions" required maxlength="1000" rows="3"></textarea></label><p class="form__error" role="alert" data-form-error></p><button type="submit" class="button button--primary">Zapisz ćwiczenie</button></form>`,
        (dialog) =>
          dialog.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();
            void submitForm(
              event.target,
              (values) =>
                api.createExercise({
                  ...values,
                  difficultyLevel: Number(values.difficultyLevel),
                  muscleGroupId: Number(values.muscleGroupId),
                  exercisesIds: [],
                }),
              async () => {
                closeDialog();
                toast('Ćwiczenie dodane do biblioteki.');
                await renderExercises(container, signal);
              },
            );
          }),
      ),
    );
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderExercises(container, signal));
  }
}
