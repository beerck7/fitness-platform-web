import { api } from '../api/services.js';
import { escapeHtml, number, submitForm, toast } from '../utils/dom.js';
import { count } from '../utils/locale.js';
import { icon } from '../utils/icons.js';
import { mountDragDrop } from '../utils/drag-drop.js';
import { closeDialog, openDialog } from './shell.js';

const muscleNames = [
  'Inne',
  'Klatka piersiowa',
  'Plecy',
  'Nogi',
  'Barki',
  'Biceps',
  'Triceps',
  'Brzuch',
  'Cardio',
];

export function openWorkoutBuilder(exercises, refresh, date, template, time = '12:00') {
  renderWorkoutBuilder(exercises, refresh, date, template, time, openDialog);
}

export function mountWorkoutBuilder(container, exercises, refresh, date) {
  renderWorkoutBuilder(exercises, refresh, date, undefined, '12:00', (_title, content, mount) => {
    container.innerHTML = content;
    mount(container);
  });
}

function renderWorkoutBuilder(exercises, refresh, date, template, time, showBuilder) {
  if (!exercises.length) {
    toast('Dodaj ćwiczenie do biblioteki, zanim utworzysz trening.');
    return;
  }
  let nextId = 0;
  const plan = (template?.exercises ?? []).map((exercise) => ({
    ...exercise,
    draftId: ++nextId,
  }));
  showBuilder(
    template ? 'Zaplanuj trening' : 'Nowy trening',
    /* HTML */ `<form
      class="form"
      data-workout-form
    >
      <label
        >Nazwa treningu<input
          name="name"
          value="${escapeHtml(template?.name ?? '')}"
          required
          minlength="2"
          maxlength="100"
          placeholder="np. Trening całego ciała"
      /></label>
      <div class="form__row form__row--three">
        <label
          >Data<input
            type="date"
            name="date"
            value="${date}"
            required
        /></label>
        <label
          >Godzina<input
            type="time"
            name="time"
            value="${time}"
            required
        /></label>
        <label
          >Czas trwania (minuty)<input
            type="number"
            name="duration"
            value="${template?.durationMinutes ?? 45}"
            min="1"
            max="300"
            required
        /></label>
      </div>
      <div class="workout-builder">
        <section
          class="workout-builder__library"
          aria-labelledby="builder-library-heading"
        >
          <h3 id="builder-library-heading">Biblioteka ćwiczeń</h3>
          <label
            class="sr-only"
            for="builder-search"
            >Szukaj ćwiczenia w bibliotece</label
          >
          <input
            id="builder-search"
            type="search"
            placeholder="Szukaj ćwiczenia"
            data-builder-search
          />
          <label
            class="sr-only"
            for="builder-muscle"
            >Partia mięśniowa</label
          >
          <select
            id="builder-muscle"
            data-builder-muscle
          >
            <option value="">Wszystkie partie</option>
            ${muscleNames
              .slice(1)
              .map((name, index) => `<option value="${index + 1}">${name}</option>`)
              .join('')}
          </select>
          <div
            class="workout-builder__catalogue"
            data-builder-library
          ></div>
        </section>
        <section
          class="workout-builder__workspace"
          aria-labelledby="builder-plan-heading"
        >
          <h3 id="builder-plan-heading">Twój plan</h3>
          <p class="form__hint">Przeciągnij ćwiczenia z biblioteki albo użyj przycisku +.</p>
          <div
            class="workout-builder__drop-zone"
            data-drop-zone
            data-builder-plan
          ></div>
        </section>
        <aside
          class="workout-builder__analysis"
          aria-labelledby="builder-analysis-heading"
        >
          <h3 id="builder-analysis-heading">Analiza planu</h3>
          <p
            class="form__hint"
            role="status"
            data-builder-summary
          ></p>
          <div data-builder-balance></div>
          <p class="form__hint">Szacunek zakłada 3 sekundy na powtórzenie i podane przerwy.</p>
        </aside>
      </div>
      <p class="form__hint">
        Ciężar jest celem treningu. Wartość 0 oznacza brak dodatkowego obciążenia.
      </p>
      <p
        class="form__error"
        role="alert"
        data-form-error
      ></p>
      <button
        class="button button--primary"
        type="submit"
      >
        Utwórz trening ${icon('arrow', 15)}
      </button>
    </form>`,
    (dialog) => {
      if (dialog.tagName === 'DIALOG') dialog.classList.add('modal--builder');
      const form = dialog.querySelector('form');
      const library = form.querySelector('[data-builder-library]');
      const workspace = form.querySelector('[data-builder-plan]');
      function drawLibrary() {
        const query = form.querySelector('[data-builder-search]').value.toLocaleLowerCase('pl');
        const muscle = form.querySelector('[data-builder-muscle]').value;
        const filtered = exercises.filter(
          (exercise) =>
            exercise.name.toLocaleLowerCase('pl').includes(query) &&
            (!muscle || exercise.muscleGroupId === Number(muscle)),
        );
        library.innerHTML = filtered.length
          ? filtered
              .map(
                (exercise) =>
                  `<article class="drag-item" draggable="true" data-drag-id="exercise:${exercise.id}"><div><strong>${escapeHtml(exercise.name)}</strong><span>${muscleNames[exercise.muscleGroupId] ?? 'Inne'}</span></div><button class="icon-button" type="button" data-add-exercise="${exercise.id}" aria-label="Dodaj ćwiczenie: ${escapeHtml(exercise.name)}">${icon('plus', 17)}</button></article>`,
              )
              .join('')
          : '<p class="form__hint">Brak pasujących ćwiczeń.</p>';
      }
      function updateAnalysis() {
        const sets = plan.reduce((sum, item) => sum + item.sets, 0);
        const seconds = plan.reduce(
          (sum, item) => sum + item.sets * (item.reps * 3 + item.restSeconds),
          0,
        );
        form.querySelector('[data-builder-summary]').textContent =
          `${count(plan.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')} · ${count(sets, 'seria', 'serie', 'serii')} · około ${number(Math.ceil(seconds / 60))} min`;
        const groups = new Map();
        for (const item of plan) {
          const muscle = exercises.find(
            (exercise) => exercise.id === item.exerciseId,
          )?.muscleGroupId;
          const name = muscleNames[muscle] ?? 'Inne';
          groups.set(name, (groups.get(name) ?? 0) + item.sets);
        }
        form.querySelector('[data-builder-balance]').innerHTML = [...groups]
          .map(
            ([name, total]) =>
              `<div class="workout-builder__balance"><span>${name}</span><strong>${count(total, 'seria', 'serie', 'serii')}</strong></div>`,
          )
          .join('');
      }
      function drawPlan() {
        workspace.innerHTML = plan.length
          ? plan
              .map(
                (item, index) =>
                  `<section class="plan-exercise" data-plan-item="${item.draftId}" aria-label="${escapeHtml(item.exerciseName)}"><div class="plan-exercise__heading"><h4>${index + 1}. ${escapeHtml(item.exerciseName)}</h4><div><button class="icon-button" type="button" data-move-exercise="${item.draftId}" data-direction="-1" aria-label="Przesuń w górę: ${escapeHtml(item.exerciseName)}" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" type="button" data-move-exercise="${item.draftId}" data-direction="1" aria-label="Przesuń w dół: ${escapeHtml(item.exerciseName)}" ${index === plan.length - 1 ? 'disabled' : ''}>↓</button><button class="icon-button" type="button" data-remove-exercise="${item.draftId}" aria-label="Usuń ćwiczenie: ${escapeHtml(item.exerciseName)}">${icon('close', 16)}</button></div></div><div class="plan-exercise__fields">${[
                    ['sets', 'Serie', 1, 20, 1],
                    ['reps', 'Powtórzenia', 1, 200, 1],
                    ['restSeconds', 'Przerwa (s)', 0, 600, 10],
                    ['targetWeight', 'Ciężar docelowy (kg)', 0, 500, 0.5],
                  ]
                    .map(
                      ([key, label, min, max, step]) =>
                        `<label>${label}<input type="number" name="${key}-${item.draftId}" data-plan-field="${key}" aria-label="${label}: ${escapeHtml(item.exerciseName)}" value="${item[key] ?? 0}" min="${min}" max="${max}" step="${step}" required></label>`,
                    )
                    .join('')}</div></section>`,
              )
              .join('')
          : '<p class="workout-builder__empty">Przeciągnij tutaj ćwiczenia z biblioteki.</p>';
        updateAnalysis();
      }
      function addExercise(id) {
        const exercise = exercises.find((item) => item.id === Number(id));
        if (!exercise) return;
        if (plan.length >= 30) {
          toast('Trening może zawierać maksymalnie 30 ćwiczeń.');
          return;
        }
        plan.push({
          draftId: ++nextId,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 3,
          reps: 12,
          restSeconds: 60,
          targetWeight: 0,
        });
        form.querySelector('[data-form-error]').textContent = '';
        drawPlan();
      }
      form.querySelector('[data-builder-search]').addEventListener('input', drawLibrary);
      form.querySelector('[data-builder-muscle]').addEventListener('change', drawLibrary);
      form.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.addExercise) addExercise(button.dataset.addExercise);
        if (button.dataset.removeExercise) {
          const index = plan.findIndex(
            (item) => item.draftId === Number(button.dataset.removeExercise),
          );
          plan.splice(index, 1);
          drawPlan();
          form.querySelector('[data-builder-search]').focus();
        }
        if (button.dataset.moveExercise) {
          const index = plan.findIndex(
            (item) => item.draftId === Number(button.dataset.moveExercise),
          );
          const next = index + Number(button.dataset.direction);
          if (next < 0 || next >= plan.length) return;
          [plan[index], plan[next]] = [plan[next], plan[index]];
          drawPlan();
          const moveButton = form.querySelector(
            `[data-move-exercise="${button.dataset.moveExercise}"][data-direction="${button.dataset.direction}"]`,
          );
          const focusTarget = moveButton.disabled
            ? form.querySelector(`[data-remove-exercise="${button.dataset.moveExercise}"]`)
            : moveButton;
          focusTarget.focus();
        }
      });
      form.addEventListener('input', (event) => {
        const key = event.target.dataset.planField;
        if (!key) return;
        const item = plan.find(
          (entry) =>
            entry.draftId === Number(event.target.closest('[data-plan-item]').dataset.planItem),
        );
        item[key] = Number(event.target.value);
        updateAnalysis();
      });
      mountDragDrop(form, (id) => {
        if (id.startsWith('exercise:')) addExercise(id.slice(9));
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!plan.length) {
          form.querySelector('[data-form-error]').textContent =
            'Wybierz co najmniej jedno ćwiczenie.';
          return;
        }
        void submitForm(
          form,
          (values) =>
            api.createWorkout({
              name: values.name.trim(),
              workoutDate: `${values.date}T${values.time}:00`,
              durationMinutes: Number(values.duration),
              isCompleted: false,
              exercises: plan.map(({ exerciseId, sets, reps, restSeconds, targetWeight }) => ({
                exerciseId,
                sets,
                reps,
                restSeconds,
                targetWeight,
              })),
            }),
          async () => {
            if (dialog.tagName === 'DIALOG') closeDialog();
            toast('Trening utworzony. Możesz zaczynać!');
            await refresh();
          },
        );
      });
      drawLibrary();
      drawPlan();
    },
  );
}
