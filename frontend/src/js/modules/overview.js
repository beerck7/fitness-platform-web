import gymImage from '../../assets/images/gym.webp';
import trainingImage from '../../assets/images/training.webp';
import { api } from '../api/services.js';
import { escapeHtml, loading, number, renderError } from '../utils/dom.js';
import { dateISO, shortDate, weekStart } from '../utils/date.js';
import { flattenDiary, percentage, workoutSummary } from '../utils/analytics.js';
import { weightChart } from '../utils/weight-chart.js';
import { count } from '../utils/locale.js';
import { icon } from '../utils/icons.js';
import { demoNotice, updateShellProfile } from './shell.js';
import { openWorkoutSession } from './workout-session.js';

export async function renderOverview(container, signal) {
  if (signal.aborted) return;
  loading(container);
  try {
    const today = dateISO();
    const [profile, workouts, goal, diary, weights] = await Promise.all([
      api.profile({ signal }),
      api.workouts({ signal }),
      api.goal({ signal }),
      api.diary(today, { signal }),
      api.weights({ signal }),
    ]);
    if (signal.aborted) return;
    updateShellProfile(profile);
    const stats = workoutSummary(workouts);
    const planned = workouts
      .filter((workout) => !workout.isCompleted)
      .sort((a, b) => a.date.localeCompare(b.date));
    const todayWorkout = workouts.find((workout) => workout.date.startsWith(today));
    const featured =
      planned.find((workout) => workout.date.startsWith(today)) ??
      todayWorkout ??
      planned.find((workout) => workout.date.slice(0, 10) >= today) ??
      planned.at(-1);
    const completed = workouts
      .filter((workout) => workout.isCompleted)
      .sort((a, b) => b.date.localeCompare(a.date));
    const target = goal?.trainingsPerWeekTarget ?? 4;
    const calorieTarget = goal?.targetCalories;
    const sortedWeights = [...weights].sort((a, b) => a.dateRecorded.localeCompare(b.dateRecorded));
    const latestWeight = sortedWeights.at(-1);
    const previousWeight = sortedWeights.at(-2);
    const weightChange =
      previousWeight && latestWeight ? latestWeight.weightKg - previousWeight.weightKg : null;
    const entries = flattenDiary(diary);
    const monday = new Date(`${weekStart()}T12:00:00`);
    const week = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map((label, index) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + index);
      const date = dateISO(day);
      return {
        label,
        date,
        day: day.getDate(),
        today: date === today,
        sessions: workouts.filter((workout) => workout.date.startsWith(date)),
      };
    });
    const macros = [
      ['protein', 'Białko', diary.totalProtein, goal?.proteinGrams],
      ['carbs', 'Węglowodany', diary.totalCarbs, goal?.carbsGrams],
      ['fat', 'Tłuszcze', diary.totalFat, goal?.fatGrams],
    ];
    const dateLabel = new Intl.DateTimeFormat('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${today}T12:00:00`));
    container.innerHTML = /* HTML */ ` <div class="dashboard-intro">
        <section
          class="dashboard-welcome"
          aria-labelledby="welcome-title"
        >
          <p class="dashboard-welcome__date">${dateLabel}</p>
          <h1 id="welcome-title">Witaj, ${escapeHtml(profile.name.split(' ')[0])}!</h1>
          <p>Małe kroki, wielkie efekty. Trzymaj tempo!</p>
        </section>
        <section
          class="featured-workout"
          aria-labelledby="featured-workout-title"
        >
          <img
            src="${gymImage}"
            width="1200"
            height="500"
            alt=""
            fetchpriority="high"
          />
          <div class="featured-workout__content">
            <p>
              ${featured?.date.startsWith(today) ? 'Dzisiaj w planie' : featured ? 'Twój kolejny trening' : 'Twój plan treningowy'}
            </p>
            <h2 id="featured-workout-title">
              ${escapeHtml(featured?.name ?? 'Zrób pierwszy krok')}
            </h2>
            <div class="featured-workout__bottom">
              <span
                >${featured ? `${icon('clock', 16)} ${featured.durationMinutes} min <span aria-hidden="true">·</span> ${count(featured.exercisesCount, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}` : 'Ułóż trening dopasowany do siebie.'}</span
              >
              ${featured ? `<button class="button button--primary" data-start-session>${icon('arrow', 18)} ${featured.isCompleted ? 'Zobacz trening' : 'Rozpocznij trening'}</button>` : '<a class="button button--primary" href="#/training">Ułóż trening</a>'}
            </div>
          </div>
        </section>
      </div>
      <div class="dashboard-summary">
        <section
          class="summary-card summary-card--calories"
          aria-labelledby="calorie-heading"
        >
          <div class="summary-card__heading">
            <h2 id="calorie-heading">${icon('flame', 23)} Kalorie</h2>
            <a
              class="icon-button"
              href="#/nutrition?action=add"
              aria-label="Dodaj posiłek"
              >${icon('plus', 20)}</a
            >
          </div>
          <p class="summary-card__value">
            ${number(diary.totalKcal)}
            <span>${calorieTarget ? `/ ${number(calorieTarget)}` : 'kcal'}</span>
          </p>
          ${calorieTarget ? `<progress value="${Math.min(diary.totalKcal, calorieTarget)}" max="${calorieTarget}" aria-label="Dzisiejsze spożycie kalorii"></progress><p class="summary-card__note">${diary.totalKcal <= calorieTarget ? `Jeszcze ${number(calorieTarget - diary.totalKcal)} kcal do celu` : `${number(diary.totalKcal - calorieTarget)} kcal ponad cel`}</p>` : '<a class="text-link" href="#/profile">Ustaw dzienny cel</a>'}
        </section>
        <section
          class="summary-card summary-card--macros"
          aria-labelledby="macros-heading"
        >
          <div class="summary-card__heading">
            <h2 id="macros-heading">${icon('target', 23)} Makroskładniki</h2>
            <a
              class="icon-button"
              href="#/nutrition"
              aria-label="Zobacz makroskładniki w dzienniku"
              >${icon('chevron-right', 18)}</a
            >
          </div>
          <dl class="macro-summary">
            ${macros.map(([key, label, value, limit]) => `<div class="macro-summary__row macro-summary__row--${key}"><dt>${label}</dt><dd>${limit ? `<progress value="${Math.min(value, limit)}" max="${limit}" aria-label="${label}: dzienne spożycie"></progress>` : ''}<span>${number(value)}${limit ? ` / ${number(limit)}` : ''} g</span></dd></div>`).join('')}
          </dl>
        </section>
        <section
          class="summary-card summary-card--weight"
          aria-labelledby="weight-heading"
        >
          <div class="summary-card__heading">
            <h2 id="weight-heading">${icon('scale', 23)} Waga</h2>
            <a
              class="icon-button"
              href="#/progress?action=add"
              aria-label="Dodaj pomiar wagi"
              >${icon('plus', 20)}</a
            >
          </div>
          ${latestWeight ? `<div class="weight-summary"><div><p class="summary-card__value">${number(latestWeight.weightKg, 1)} <span>kg</span></p><p class="weight-summary__change">${weightChange !== null ? `${weightChange > 0 ? '+' : ''}${number(weightChange, 1)} kg od poprzedniego` : 'Pierwszy zapisany pomiar'}</p></div>${weightChart(sortedWeights.slice(-7), 'dashboard-weight-chart-title')}</div><p class="summary-card__note">Ostatni pomiar: ${shortDate(latestWeight.dateRecorded)}</p>` : '<p class="summary-card__note">Jeszcze bez pomiarów.</p><a class="text-link" href="#/progress?action=add">Dodaj pierwszy pomiar</a>'}
        </section>
        <section
          class="summary-card"
          aria-labelledby="weekly-heading"
        >
          <div class="summary-card__heading">
            <h2 id="weekly-heading">${icon('chart', 23)} Postęp</h2>
            <a
              class="icon-button"
              href="#/progress"
              aria-label="Zobacz postępy"
              >${icon('chevron-right', 18)}</a
            >
          </div>
          <p class="summary-card__value">${stats.weekly} <span>/ ${target}</span></p>
          <p class="summary-card__note">treningi w tym tygodniu</p>
          <ol class="weekly-dots">
            ${week.map((day) => `<li><a href="#/workouts?date=${day.date}" aria-label="Treningi: ${day.label}, ${day.date}"><span class="weekly-dots__bar ${day.sessions.some((workout) => workout.isCompleted) ? 'weekly-dots__bar--done' : ''} ${day.today ? 'weekly-dots__bar--today' : ''}"></span><span>${day.label}</span></a></li>`).join('')}
          </ol>
        </section>
      </div>
      <div class="dashboard-row">
        <section
          class="panel today-tasks"
          aria-labelledby="tasks-heading"
        >
          <div class="panel__heading">
            <h2 id="tasks-heading">Dzisiaj na spokojnie</h2>
            <a
              class="text-link"
              href="#/schedule"
              >Zobacz plan ${icon('chevron-right', 16)}</a
            >
          </div>
          <ul class="today-tasks__list">
            <li>
              <a href="#/workouts?date=${today}"
                ><span class="task-status ${todayWorkout?.isCompleted ? 'task-status--done' : ''}"
                  >${icon(todayWorkout?.isCompleted ? 'check' : 'dumbbell', 18)}</span
                ><span
                  ><strong>${escapeHtml(todayWorkout?.name ?? 'Zaplanuj swój trening')}</strong
                  ><small
                    >${todayWorkout ? `${todayWorkout.durationMinutes} min · ${count(todayWorkout.exercisesCount, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}${todayWorkout.isCompleted ? ' · Ukończony' : ''}` : 'Wybierz ćwiczenia i ustaw porę'}</small
                  ></span
                >${icon('chevron-right', 18)}</a
              >
            </li>
            <li>
              <a href="#/nutrition"
                ><span class="task-status ${entries.length ? 'task-status--done' : ''}"
                  >${icon(entries.length ? 'check' : 'food', 18)}</span
                ><span
                  ><strong>Twój dziennik posiłków</strong
                  ><small
                    >${entries.length ? `${count(entries.length, 'wpis', 'wpisy', 'wpisów')} · ${number(diary.totalKcal)} kcal` : 'Dodaj pierwszy posiłek dzisiaj'}</small
                  ></span
                >${icon('chevron-right', 18)}</a
              >
            </li>
            <li>
              <a href="#/progress?action=add"
                ><span
                  class="task-status ${latestWeight?.dateRecorded.startsWith(today) ? 'task-status--done' : ''}"
                  >${icon(latestWeight?.dateRecorded.startsWith(today) ? 'check' : 'scale', 18)}</span
                ><span
                  ><strong>Zapisz pomiar wagi</strong
                  ><small
                    >${latestWeight ? `Ostatnio: ${number(latestWeight.weightKg, 1)} kg · ${shortDate(latestWeight.dateRecorded)}` : 'Śledź zmiany we własnym tempie'}</small
                  ></span
                >${icon('chevron-right', 18)}</a
              >
            </li>
          </ul>
        </section>
        <section
          class="motivation-card"
          aria-labelledby="motivation-heading"
        >
          <img
            src="${trainingImage}"
            width="1200"
            height="600"
            alt=""
            loading="lazy"
          />
          <div class="motivation-card__content">
            <span class="motivation-card__eyebrow">Twój rytm. Twoje postępy.</span>
            <h2 id="motivation-heading">Lepsza wersja Ciebie.<br />Każdego <span>dnia.</span></h2>
            <p>Treningi, odżywianie i małe kroki do celu.</p>
            <a
              class="button button--primary"
              href="#/progress"
              >Zobacz swój postęp ${icon('arrow', 18)}</a
            >
          </div>
        </section>
      </div>
      <div class="dashboard-row">
        <section
          class="panel goal-card"
          aria-labelledby="goal-heading"
        >
          <h2 id="goal-heading">${icon('target', 23)} Twój cel</h2>
          <h3>Regularność robi różnicę</h3>
          <div class="goal-card__progress">
            <progress
              value="${Math.min(stats.weekly, target)}"
              max="${Math.max(target, 1)}"
              aria-label="Tygodniowy cel treningowy"
            ></progress
            ><span>${number(percentage(stats.weekly, target))}%</span>
          </div>
          <dl class="goal-card__details">
            <div>
              <dt>Ukończone w tygodniu</dt>
              <dd>${stats.weekly} / ${target}</dd>
            </div>
            <div>
              <dt>Treningowy cel</dt>
              <dd>${count(target, 'trening', 'treningi', 'treningów')}</dd>
            </div>
            <div>
              <dt>Dzienny cel kalorii</dt>
              <dd>
                ${calorieTarget ? `${number(calorieTarget)} kcal` : '<a class="text-link" href="#/profile">Ustaw cel</a>'}
              </dd>
            </div>
          </dl>
        </section>
        <section
          class="quick-actions"
          aria-labelledby="quick-actions-heading"
        >
          <h2 id="quick-actions-heading">${icon('bolt', 23)} Szybkie akcje</h2>
          <div class="quick-actions__grid">
            ${[
              ['nutrition?action=add', 'food', 'Dodaj posiłek'],
              ['training', 'dumbbell', 'Ułóż trening'],
              ['progress?action=add', 'scale', 'Zważ się'],
              ['progress', 'chart', 'Zobacz statystyki'],
            ]
              .map(
                ([route, image, label]) =>
                  `<a href="#/${route}">${icon(image, 26)}<span>${label}</span></a>`,
              )
              .join('')}
          </div>
        </section>
      </div>
      <section
        class="panel week-ribbon"
        aria-labelledby="week-title"
      >
        <div class="panel__heading">
          <h2 id="week-title">Harmonogram tygodnia</h2>
          <a
            class="text-link"
            href="#/schedule"
            >Otwórz harmonogram ${icon('arrow', 15)}</a
          >
        </div>
        <ol class="week-ribbon__days">
          ${week.map((day) => `<li><a href="#/workouts?date=${day.date}" class="week-ribbon__day ${day.today ? 'week-ribbon__day--today' : ''}" aria-label="Plan treningów na ${day.date}${day.today ? ', dzisiaj' : ''}"><span>${day.label}</span><strong>${day.day}</strong><span class="week-ribbon__sessions">${day.sessions.length ? day.sessions.map((workout) => `<span class="week-ribbon__session ${workout.isCompleted ? 'week-ribbon__session--done' : ''}">${icon(workout.isCompleted ? 'check' : 'dumbbell', 12)}<span>${escapeHtml(workout.name)}</span></span>`).join('') : '<span class="week-ribbon__rest">Odpoczynek</span>'}</span></a></li>`).join('')}
        </ol>
      </section>
      <section
        class="panel dashboard-statistics"
        aria-labelledby="statistics-heading"
      >
        <div class="panel__heading">
          <h2 id="statistics-heading">Twoja aktywność</h2>
          <div
            class="tabs"
            role="group"
            aria-label="Okres statystyk"
          >
            ${[
              ['week', 'Tydzień'],
              ['month', 'Miesiąc'],
              ['year', 'Rok'],
            ]
              .map(
                ([range, label]) =>
                  `<button class="tabs__button" data-range="${range}" aria-pressed="false">${label}</button>`,
              )
              .join('')}
          </div>
        </div>
        <div class="dashboard-statistics__grid">
          ${[
            ['dumbbell', 'workouts', 'Treningi'],
            ['activity', 'sets', 'Serie ćwiczeń'],
            ['clock', 'minutes', 'Minuty'],
          ]
            .map(
              ([image, key, label]) =>
                `<div><span class="soft-icon">${icon(image, 22)}</span><div><strong data-stat="${key}">0</strong><span>${label} <small data-period></small></span></div></div>`,
            )
            .join('')}
        </div>
      </section>
      <section
        class="panel history-panel"
        aria-labelledby="activity-title"
      >
        <div class="panel__heading">
          <h2 id="activity-title">Ostatnie aktywności</h2>
          <a
            class="text-link"
            href="#/workouts"
            >Wszystkie plany ${icon('arrow', 15)}</a
          >
        </div>
        <ul class="workout-history">
          ${
            completed
              .slice(0, 4)
              .map(
                (workout) =>
                  `<li><span class="soft-icon">${icon('check', 18)}</span><div><strong>${escapeHtml(workout.name)}</strong><span>${shortDate(workout.date)} · ${workout.durationMinutes} min</span></div><span class="badge badge--success">Ukończone</span></li>`,
              )
              .join('') || '<li>Brak ukończonych treningów.</li>'
          }
        </ul>
      </section>
      <div class="dashboard-demo">${demoNotice()}</div>`;
    function updatePeriod(range) {
      const start =
        range === 'week'
          ? weekStart()
          : range === 'month'
            ? today.slice(0, 7) + '-01'
            : today.slice(0, 4) + '-01-01';
      const selected = completed.filter(
        (workout) => workout.date.slice(0, 10) >= start && workout.date.slice(0, 10) <= today,
      );
      const totals = {
        workouts: selected.length,
        sets: selected.reduce(
          (sum, workout) =>
            sum + workout.exercises.reduce((total, exercise) => total + exercise.sets, 0),
          0,
        ),
        minutes: selected.reduce((sum, workout) => sum + workout.durationMinutes, 0),
      };
      container.querySelectorAll('[data-stat]').forEach((element) => {
        element.textContent = number(totals[element.dataset.stat]);
      });
      container.querySelectorAll('[data-period]').forEach((element) => {
        element.textContent = {
          week: 'w tym tygodniu',
          month: 'w tym miesiącu',
          year: 'w tym roku',
        }[range];
      });
      container.querySelectorAll('[data-range]').forEach((button) => {
        const active = button.dataset.range === range;
        button.classList.toggle('tabs__button--active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    updatePeriod('week');
    container
      .querySelectorAll('[data-range]')
      .forEach((button) =>
        button.addEventListener('click', () => updatePeriod(button.dataset.range)),
      );
    container
      .querySelector('[data-start-session]')
      ?.addEventListener('click', () =>
        openWorkoutSession(featured, () => renderOverview(container, signal)),
      );
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderOverview(container, signal));
  }
}
