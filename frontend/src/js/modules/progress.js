import { api } from '../api/services.js';
import {
  escapeHtml,
  loading,
  emptyState,
  number,
  renderError,
  submitForm,
  toast,
} from '../utils/dom.js';
import { dateISO, shortDate } from '../utils/date.js';
import { workoutSummary } from '../utils/analytics.js';
import { weightChart } from '../utils/weight-chart.js';
import { count } from '../utils/locale.js';
import { icon } from '../utils/icons.js';
import { closeDialog, openDialog, pageHeading } from './shell.js';

export async function renderProgress(container, signal) {
  if (signal.aborted) return;
  loading(container);
  try {
    const [weights, workouts] = await Promise.all([
      api.weights({ signal }),
      api.workouts({ signal }),
    ]);
    if (signal.aborted) return;
    const sorted = [...weights].sort((a, b) => a.dateRecorded.localeCompare(b.dateRecorded));
    const stats = workoutSummary(workouts);
    const latest = sorted.at(-1);
    const values = sorted.map((entry) => entry.weightKg);
    container.innerHTML = /* HTML */ `${pageHeading('Twoje postępy', 'Sprawdź efekty swojej regularnej pracy.', `<button class="button button--primary" data-log-weight>${icon('plus', 16)} Dodaj pomiar</button>`)}
      <section
        class="progress-overview"
        aria-labelledby="routine-heading"
      >
        <div class="progress-overview__story">
          <span class="soft-icon">${icon('activity', 28)}</span>
          <div>
            <span class="eyebrow">TWÓJ WYSIŁEK MA ZNACZENIE</span>
            <h2 id="routine-heading">
              ${stats.total ? 'Budujesz swoją regularność.' : 'Zacznij od pierwszego treningu.'}
            </h2>
            <p>Każdy trening ma znaczenie. Ćwicz we własnym tempie.</p>
          </div>
        </div>
        <dl class="progress-overview__numbers">
          <div>
            <dt>Ukończone treningi</dt>
            <dd>${stats.total}</dd>
          </div>
          <div>
            <dt>Aktywność w tym tygodniu</dt>
            <dd>${number(stats.minutes)}<span> min</span></dd>
          </div>
          <div>
            <dt>Ostatni pomiar</dt>
            <dd>${latest ? number(latest.weightKg, 1) + '<span> kg</span>' : '—'}</dd>
          </div>
        </dl>
      </section>
      <section
        class="panel progress-panel"
        aria-labelledby="weight-heading"
      >
        <div class="panel__heading">
          <div>
            <span class="eyebrow">HISTORIA POMIARÓW</span>
            <h2 id="weight-heading">Pomiary wagi</h2>
          </div>
          <span class="badge">${count(sorted.length, 'pomiar', 'pomiary', 'pomiarów')}</span>
        </div>
        ${
          values.length
            ? `${weightChart(sorted, 'weight-chart-title')}<div class="table-scroll" tabindex="0" role="region" aria-label="Historia pomiarów wagi"><table class="data-table"><caption class="sr-only">Pełna historia pomiarów wagi</caption><thead><tr><th scope="col">Data</th><th scope="col">Waga</th></tr></thead><tbody>${sorted
                .slice()
                .reverse()
                .map(
                  (entry) =>
                    `<tr><th scope="row">${shortDate(entry.dateRecorded)}</th><td>${number(entry.weightKg, 1)} kg</td></tr>`,
                )
                .join('')}</tbody></table></div>`
            : emptyState(
                'Dodaj pierwszy pomiar',
                'Zapisz pomiar wagi, aby zobaczyć swoją historię.',
              )
        }
      </section>
      <section
        class="panel history-panel"
        aria-labelledby="history-heading"
      >
        <div class="panel__heading">
          <h2 id="history-heading">Ostatnio ukończone treningi</h2>
          <a
            class="text-link"
            href="#/workouts"
            >Wszystkie treningi ${icon('arrow', 15)}</a
          >
        </div>
        ${
          workouts.some((workout) => workout.isCompleted)
            ? `<ul class="workout-history">${workouts
                .filter((workout) => workout.isCompleted)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map(
                  (workout) =>
                    `<li><span class="soft-icon">${icon('check', 18)}</span><div><strong>${escapeHtml(workout.name)}</strong><span>${shortDate(workout.date)} · ${workout.durationMinutes} min</span></div><span class="badge badge--success">Ukończone</span></li>`,
                )
                .join('')}</ul>`
            : emptyState(
                'Brak ukończonych treningów',
                'Tutaj pojawią się Twoje ukończone treningi.',
              )
        }
      </section>`;
    container.querySelector('[data-log-weight]').addEventListener('click', () =>
      openDialog(
        'Nowy pomiar wagi',
        `<form class="form"><div class="form__row"><label>Waga (kg)<input name="weightKg" type="number" step="0.1" min="20" max="400" value="${latest ? latest.weightKg : ''}" required></label><label>Data<input name="date" type="date" value="${dateISO()}" max="${dateISO()}" required></label></div><p class="form__error" role="alert" data-form-error></p><button class="button button--primary" type="submit">Zapisz pomiar</button></form>`,
        (dialog) =>
          dialog.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();
            void submitForm(
              event.target,
              (values) =>
                api.addWeight({
                  weightKg: Number(values.weightKg),
                  dateRecorded: `${values.date}T12:00:00`,
                }),
              async () => {
                closeDialog();
                toast('Pomiar zapisany.');
                await renderProgress(container, signal);
              },
            );
          }),
      ),
    );
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderProgress(container, signal));
  }
}
