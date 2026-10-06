import { api } from '../api/services.js';
import { config } from '../config/app.js';
import { escapeHtml, initials, loading, renderError, submitForm, toast } from '../utils/dom.js';
import { pageHeading, updateShellProfile } from './shell.js';

export async function renderProfile(container, signal) {
  if (signal.aborted) return;
  loading(container);
  try {
    const [profile, goal] = await Promise.all([api.profile({ signal }), api.goal({ signal })]);
    if (signal.aborted) return;
    updateShellProfile(profile);
    container.innerHTML = /* HTML */ `${pageHeading('Twój profil', 'Zarządzaj swoimi danymi i celami.')}
      <div class="profile-grid">
        <section class="panel profile-summary">
          <span class="avatar avatar--large">${escapeHtml(initials(profile.name))}</span>
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.email)}</p>
          <span class="badge badge--success"
            >${config.demo ? 'Profil demonstracyjny' : 'Twoje konto'}</span
          >
          <p class="profile-summary__note">
            ${config.demo ? 'To wersja demonstracyjna. Zmiany zapisujemy tylko w tej przeglądarce.' : 'Po odświeżeniu strony zaloguj się ponownie.'}
          </p>
        </section>
        <section
          class="panel settings-panel"
          aria-labelledby="details-heading"
        >
          <div class="panel__heading"><h2 id="details-heading">Dane osobowe</h2></div>
          <form
            class="form"
            data-profile-form
          >
            <label
              >Imię i nazwisko<input
                name="name"
                value="${escapeHtml(profile.name)}"
                required
                minlength="2"
                maxlength="100"
                autocomplete="name"
            /></label>
            <div class="form__row">
              <label
                >Data urodzenia<input
                  name="dateOfBirth"
                  type="date"
                  value="${escapeHtml(profile.dateOfBirth)}"
                  required /></label
              ><label
                >Płeć<select name="gender">
                  <option
                    value="0"
                    ${profile.gender === 'female' ? 'selected' : ''}
                  >
                    Kobieta
                  </option>
                  <option
                    value="1"
                    ${profile.gender === 'male' ? 'selected' : ''}
                  >
                    Mężczyzna
                  </option>
                </select></label
              >
            </div>
            <label class="checkbox"
              ><input
                type="checkbox"
                name="visibility"
                ${profile.visibility ? 'checked' : ''}
              />Widoczność profilu publicznego</label
            >
            <p
              class="form__error"
              role="alert"
              data-form-error
            ></p>
            <button
              class="button button--primary"
              type="submit"
            >
              Zapisz dane
            </button>
          </form>
        </section>
      </div>
      <section
        class="panel settings-panel"
        aria-labelledby="targets-heading"
      >
        <div class="panel__heading">
          <div>
            <h2 id="targets-heading">Twoje dzienne cele</h2>
            <p>Ustaw własne cele kalorii, składników odżywczych i treningów.</p>
          </div>
        </div>
        <form
          class="form"
          data-goal-form
        >
          <div class="form__row form__row--three">
            <label
              >Kalorie (kcal)<input
                name="targetCalories"
                type="number"
                min="500"
                max="10000"
                value="${goal?.targetCalories ?? 2200}"
                required /></label
            ><label
              >Treningi w tygodniu<input
                name="trainingsPerWeekTarget"
                type="number"
                min="1"
                max="14"
                value="${goal?.trainingsPerWeekTarget ?? 4}"
                required /></label
            ><label
              >Wzrost (cm)<input
                name="heightCm"
                type="number"
                min="80"
                max="250"
                value="${goal?.heightCm ?? 172}"
                required
            /></label>
          </div>
          <div class="form__row form__row--three">
            ${[
              ['proteinGrams', 'Białko (g)', 140],
              ['carbsGrams', 'Węglowodany (g)', 260],
              ['fatGrams', 'Tłuszcze (g)', 70],
            ]
              .map(
                ([name, label, fallback]) =>
                  `<label>${label}<input name="${name}" type="number" min="1" max="1000" value="${goal?.[name] ?? fallback}" required></label>`,
              )
              .join('')}
          </div>
          <label
            >Aktualna waga (kg)<input
              name="currentWeightKg"
              type="number"
              min="20"
              max="400"
              step="0.1"
              value="${goal?.currentWeightKg ?? 68.4}"
              required
          /></label>
          <p
            class="form__error"
            role="alert"
            data-form-error
          ></p>
          <button
            class="button button--primary"
            type="submit"
          >
            Zapisz cele
          </button>
        </form>
      </section>
      <section
        class="panel settings-panel"
        aria-labelledby="password-heading"
      >
        <div class="panel__heading"><h2 id="password-heading">Zmień hasło</h2></div>
        <form
          class="form"
          data-password-form
        >
          <div class="form__row">
            <label
              >Aktualne hasło<input
                name="oldPassword"
                type="password"
                required
                autocomplete="current-password"
                maxlength="128" /></label
            ><label
              >Nowe hasło<input
                name="newPassword"
                type="password"
                minlength="12"
                maxlength="128"
                required
                autocomplete="new-password"
            /></label>
          </div>
          <p class="form__hint">
            Co najmniej 12 znaków.
            ${config.demo ? 'W trybie demo nie zapisujemy ani nie zmieniamy hasła.' : ''}
          </p>
          <p
            class="form__error"
            role="alert"
            data-form-error
          ></p>
          <button
            class="button button--secondary"
            type="submit"
          >
            Zapisz nowe hasło
          </button>
        </form>
      </section>`;
    container.querySelector('[data-profile-form]').addEventListener('submit', (event) => {
      event.preventDefault();
      void submitForm(
        event.target,
        (values) =>
          api.updateProfile({
            ...values,
            gender: Number(values.gender),
            visibility: values.visibility === 'on',
          }),
        async () => {
          toast('Dane osobowe zapisane.');
          await renderProfile(container, signal);
        },
      );
    });
    container.querySelector('[data-goal-form]').addEventListener('submit', (event) => {
      event.preventDefault();
      void submitForm(
        event.target,
        (values) =>
          api.updateGoal({
            ...goal,
            ...Object.fromEntries(
              Object.entries(values).map(([key, value]) => [key, Number(value)]),
            ),
            goalType: goal?.goalType ?? 0,
            activityLevel: goal?.activityLevel ?? 2,
            stepsPerDayTarget: goal?.stepsPerDayTarget ?? 8000,
          }),
        async () => {
          toast('Cele zaktualizowane.');
          await renderProfile(container, signal);
        },
      );
    });
    container.querySelector('[data-password-form]').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.target;
      void submitForm(
        form,
        (values) => api.changePassword(values),
        () => {
          form.reset();
          toast(
            config.demo ? 'To tylko demonstracja. Hasło nie zostało zapisane.' : 'Hasło zmienione.',
          );
        },
      );
    });
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderProfile(container, signal));
  }
}
