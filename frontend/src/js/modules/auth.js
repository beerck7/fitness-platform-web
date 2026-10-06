import { api } from '../api/services.js';
import { config } from '../config/app.js';
import { submitForm, toast } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { pageHeading } from './shell.js';
import { setSession } from './session.js';

export function renderAuth(container, register = false) {
  container.innerHTML = /* HTML */ `${pageHeading(register ? 'Dołącz do Siłownika' : 'Witaj ponownie!', register ? 'Utwórz konto i zacznij planować swoje treningi.' : 'Zaloguj się, aby wrócić do swoich treningów.')}
    <div class="auth-layout">
      <section
        class="panel auth-card"
        aria-labelledby="auth-heading"
      >
        <span class="soft-icon">${icon('bolt', 30)}</span>
        <h2 id="auth-heading">${register ? 'Utwórz konto' : 'Zaloguj się na swoje konto'}</h2>
        <p>
          ${config.demo ? 'Wersja demo: konto nie jest tworzone, a hasło nie jest zapisywane.' : 'Logowanie obowiązuje w tej karcie przeglądarki.'}
        </p>
        <form
          class="form"
          data-auth-form
        >
          ${register ? '<label>Imię i nazwisko<input name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Jan Kowalski"></label>' : ''}<label
            >Adres e-mail<input
              name="email"
              type="email"
              required
              maxlength="254"
              autocomplete="email"
              placeholder="twoj@email.pl" /></label
          ><label
            >Hasło<input
              name="password"
              type="password"
              required
              minlength="${register ? 12 : 1}"
              maxlength="128"
              autocomplete="${register ? 'new-password' : 'current-password'}" /></label
          ><span class="form__hint">${register ? 'Użyj co najmniej 12 znaków.' : ''}</span
          >${register ? '<div class="form__row"><label>Data urodzenia<input name="dateOfBirth" type="date" required></label><label>Numer telefonu<input name="phoneNumber" type="tel" minlength="5" maxlength="30" required autocomplete="tel"></label></div><label>Płeć<select name="gender"><option value="0">Kobieta</option><option value="1">Mężczyzna</option></select></label>' : ''}
          <p
            class="form__error"
            role="alert"
            data-form-error
          ></p>
          <button
            class="button button--primary"
            type="submit"
          >
            ${register ? 'Utwórz konto' : 'Zaloguj się'} ${icon('arrow', 16)}
          </button>
        </form>
        <p class="auth-card__switch">
          ${register ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}
          <a href="#/${register ? 'login' : 'register'}"
            >${register ? 'Zaloguj się' : 'Utwórz konto'}</a
          >
        </p>
        ${config.demo ? '<a class="text-link" href="#/overview">Przejdź do wersji demo →</a>' : ''}
      </section>
    </div>`;
  container.querySelector('[data-auth-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    void submitForm(
      event.target,
      async (values) => {
        const response = await (register
          ? api.register({ ...values, gender: Number(values.gender) })
          : api.login(values));
        if (!config.demo && typeof response?.accessToken !== 'string')
          throw new Error('Serwer zwrócił nieprawidłową odpowiedź logowania.');
        setSession({
          accessToken: config.demo ? null : response.accessToken,
          name: response.userName,
        });
      },
      () => {
        toast(
          config.demo
            ? 'Korzystasz z wersji demo. Konto nie zostało utworzone.'
            : 'Witaj w Siłowniku!',
        );
        location.hash = '#/overview';
      },
    );
  });
}
