import { api } from '../api/services.js';
import { escapeHtml, loading, renderError, submitForm, toast } from '../utils/dom.js';
import { dateISO, weekStart, shortDate } from '../utils/date.js';
import { count } from '../utils/locale.js';
import { icon } from '../utils/icons.js';
import { mountDragDrop } from '../utils/drag-drop.js';
import { closeDialog, openDialog, pageHeading } from './shell.js';
import { openWorkoutBuilder } from './workout-builder.js';

export async function renderSchedule(container, signal, selectedDate = dateISO()) {
  if (signal.aborted) return;
  loading(container);
  try {
    const [workouts, exercises] = await Promise.all([
      api.workouts({ signal }),
      api.exercises({ signal }),
    ]);
    if (signal.aborted) return;
    const monday = new Date(`${weekStart(new Date(`${selectedDate}T12:00:00`))}T12:00:00`);
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + index);
      return {
        date: dateISO(day),
        label: new Intl.DateTimeFormat('pl-PL', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(day),
      };
    });
    const previous = new Date(monday);
    previous.setDate(previous.getDate() - 7);
    const next = new Date(monday);
    next.setDate(next.getDate() + 7);
    const refresh = () => renderSchedule(container, signal, selectedDate);
    const templates = workouts.filter(
      (workout, index) => workouts.findIndex((item) => item.name === workout.name) === index,
    );
    const visible = workouts.filter(
      (workout) =>
        workout.date.slice(0, 10) >= days[0].date && workout.date.slice(0, 10) <= days[6].date,
    );
    const times = visible.map((workout) => Number(workout.date.slice(11, 13)));
    const firstHour = Math.min(6, ...times);
    const lastHour = Math.max(
      22,
      ...visible.map((workout) =>
        Math.ceil(
          Number(workout.date.slice(11, 13)) +
            (Number(workout.date.slice(14, 16)) + workout.durationMinutes) / 60,
        ),
      ),
    );
    const calendarHeight = (lastHour - firstHour) * 60;
    container.innerHTML = /* HTML */ `${pageHeading('Harmonogram', 'Przeciągnij plan na wybrany dzień i godzinę.', '<button class="button button--primary" data-new-event>Dodaj trening</button>')}
      <div class="schedule-toolbar">
        <a
          class="icon-button"
          href="#/schedule?date=${dateISO(previous)}"
          aria-label="Poprzedni tydzień"
          >${icon('chevron-left', 18)}</a
        >
        <h2>${shortDate(days[0].date)} – ${shortDate(days[6].date)}</h2>
        <a
          class="icon-button"
          href="#/schedule?date=${dateISO(next)}"
          aria-label="Następny tydzień"
          >${icon('chevron-right', 18)}</a
        ><a
          class="button button--secondary"
          href="#/schedule"
          >Dzisiaj</a
        >
      </div>
      <div class="schedule-layout">
        <aside
          class="panel schedule-library"
          aria-labelledby="schedule-library-heading"
        >
          <h2 id="schedule-library-heading">Twoje plany</h2>
          <p class="form__hint">
            Użyj istniejącego treningu jako wzoru. Przeciągnij go do kalendarza lub naciśnij +.
          </p>
          <label
            class="sr-only"
            for="schedule-search"
            >Szukaj planu</label
          ><input
            type="search"
            id="schedule-search"
            placeholder="Szukaj planu"
            data-schedule-search
          />
          <div data-schedule-library></div>
        </aside>
        <section
          class="panel schedule-calendar"
          aria-label="Tygodniowy kalendarz treningów"
        >
          <label class="schedule-calendar__mobile-day"
            >Dzień tygodnia<select data-schedule-day>
              ${days.map((day) => `<option value="${day.date}" ${day.date === selectedDate ? 'selected' : ''}>${day.label}</option>`).join('')}
            </select></label
          >
          <div class="schedule-calendar__scroll">
            <div
              class="schedule-calendar__grid"
              style="--calendar-height:${calendarHeight}px"
            >
              <div class="schedule-calendar__hours">
                <div
                  class="schedule-calendar__header"
                  aria-hidden="true"
                ></div>
                ${Array.from({ length: lastHour - firstHour }, (_, index) => `<span>${String(firstHour + index).padStart(2, '0')}:00</span>`).join('')}
              </div>
              ${days
                .map(
                  (day) =>
                    `<section class="schedule-day" data-calendar-day="${day.date}" aria-label="${day.label}"><h3 class="schedule-calendar__header">${day.label}</h3><div class="schedule-day__timeline" data-drop-zone data-schedule-date="${day.date}" tabindex="0" role="group" aria-label="Zaplanuj trening na ${day.date}">${visible
                      .filter((workout) => workout.date.startsWith(day.date))
                      .map((workout) => {
                        const minutes =
                          (Number(workout.date.slice(11, 13)) - firstHour) * 60 +
                          Number(workout.date.slice(14, 16));
                        return `<button class="schedule-event ${workout.isCompleted ? 'schedule-event--completed' : ''}" type="button" data-schedule-event="${workout.id}" style="top:${minutes}px;min-height:${Math.max(44, workout.durationMinutes)}px" aria-label="Edytuj termin: ${escapeHtml(workout.name)}, ${workout.date.slice(11, 16)}"><strong>${escapeHtml(workout.name)}</strong><span>${workout.date.slice(11, 16)} · ${workout.durationMinutes} min</span></button>`;
                      })
                      .join('')}</div></section>`,
                )
                .join('')}
            </div>
          </div>
        </section>
      </div>`;
    const root = container.querySelector('.schedule-layout');
    function drawLibrary() {
      const query = root.querySelector('[data-schedule-search]').value.toLocaleLowerCase('pl');
      const filtered = templates.filter((item) =>
        item.name.toLocaleLowerCase('pl').includes(query),
      );
      root.querySelector('[data-schedule-library]').innerHTML = filtered.length
        ? filtered
            .map(
              (workout) =>
                `<article class="drag-item" draggable="true" data-drag-id="plan:${workout.id}"><div><strong>${escapeHtml(workout.name)}</strong><span>${count(workout.exercises.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}</span></div><button class="icon-button" type="button" data-plan-workout="${workout.id}" aria-label="Zaplanuj: ${escapeHtml(workout.name)}">${icon('plus', 17)}</button></article>`,
            )
            .join('')
        : '<p class="form__hint">Utwórz trening, aby pojawił się tutaj jego plan.</p>';
    }
    function newEvent(date, time = '18:00', template) {
      openWorkoutBuilder(exercises, refresh, date, template, time);
    }
    function timeAt(event, zone) {
      const y = event.clientY - zone.getBoundingClientRect().top;
      const minutes = Math.max(
        0,
        Math.min(23 * 60 + 30, Math.round((y + firstHour * 60) / 30) * 30),
      );
      return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    }
    root.querySelector('[data-schedule-search]').addEventListener('input', drawLibrary);
    function selectMobileDay() {
      const date = root.querySelector('[data-schedule-day]').value;
      root
        .querySelectorAll('[data-calendar-day]')
        .forEach((day) =>
          day.classList.toggle('schedule-day--selected', day.dataset.calendarDay === date),
        );
    }
    root.querySelector('[data-schedule-day]').addEventListener('change', selectMobileDay);
    selectMobileDay();
    container
      .querySelector('[data-new-event]')
      .addEventListener('click', () => newEvent(selectedDate));
    root.addEventListener('click', (event) => {
      const planButton = event.target.closest('[data-plan-workout]');
      if (planButton) {
        const template = workouts.find(
          (item) => item.id === Number(planButton.dataset.planWorkout),
        );
        newEvent(root.querySelector('[data-schedule-day]').value, '18:00', template);
        return;
      }
      const eventButton = event.target.closest('[data-schedule-event]');
      if (eventButton) {
        const workout = workouts.find(
          (item) => item.id === Number(eventButton.dataset.scheduleEvent),
        );
        editEvent(workout, refresh);
        return;
      }
      const zone = event.target.closest('[data-schedule-date]');
      if (zone)
        newEvent(zone.dataset.scheduleDate, event.detail === 0 ? '18:00' : timeAt(event, zone));
    });
    root.addEventListener('keydown', (event) => {
      if (!event.target.matches('[data-schedule-date]') || !['Enter', ' '].includes(event.key))
        return;
      event.preventDefault();
      newEvent(event.target.dataset.scheduleDate);
    });
    mountDragDrop(root, (id, zone, event) => {
      const template = workouts.find((item) => `plan:${item.id}` === id);
      if (template) newEvent(zone.dataset.scheduleDate, timeAt(event, zone), template);
    });
    drawLibrary();
  } catch (error) {
    if (!signal.aborted)
      renderError(container, error, () => renderSchedule(container, signal, selectedDate));
  }
}

function editEvent(workout, refresh) {
  openDialog(
    'Edytuj termin treningu',
    `<form class="form"><label>Nazwa treningu<input name="name" value="${escapeHtml(workout.name)}" minlength="2" maxlength="100" required></label><div class="form__row"><label>Data<input type="date" name="date" value="${workout.date.slice(0, 10)}" min="2000-01-01" max="2100-12-31" required></label><label>Godzina<input type="time" name="time" value="${workout.date.slice(11, 16)}" required></label></div><label>Czas trwania (minuty)<input type="number" name="duration" min="1" max="300" value="${workout.durationMinutes}" required></label><p class="form__error" role="alert" data-form-error></p><div class="form__actions"><button class="button button--danger" type="button" data-delete-event>Usuń trening</button><button class="button button--primary" type="submit">Zapisz termin</button></div></form>`,
    (dialog) => {
      const form = dialog.querySelector('form');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void submitForm(
          form,
          (values) =>
            api.scheduleWorkout(workout.id, {
              name: values.name.trim(),
              workoutDate: `${values.date}T${values.time}:00`,
              durationMinutes: Number(values.duration),
            }),
          async () => {
            closeDialog();
            toast('Termin treningu zapisany.');
            await refresh();
          },
        );
      });
      form.querySelector('[data-delete-event]').addEventListener('click', () => {
        openDialog(
          'Usunąć trening?',
          `<p class="modal__description">Usunąć trening „${escapeHtml(workout.name)}” z harmonogramu i listy treningów?</p><form class="form"><p class="form__error" role="alert" data-form-error></p><div class="form__actions"><button class="button button--secondary" type="button" data-close-dialog>Zachowaj trening</button><button class="button button--danger" type="submit">Usuń trening</button></div></form>`,
          (confirmation) => {
            confirmation.querySelector('form').addEventListener('submit', (event) => {
              event.preventDefault();
              void submitForm(
                event.target,
                () => api.deleteWorkout(workout.id),
                async () => {
                  closeDialog();
                  toast('Trening usunięty.');
                  await refresh();
                },
              );
            });
          },
        );
      });
    },
  );
}
