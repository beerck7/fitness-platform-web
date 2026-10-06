import { api } from '../api/services.js';
import { config } from '../config/app.js';
import { escapeHtml, emptyState, initials, loading, renderError, toast } from '../utils/dom.js';
import { shortDate } from '../utils/date.js';
import { icon } from '../utils/icons.js';
import { pageHeading } from './shell.js';

function personCard(person, note, action = '') {
  return `<article class="panel friend-card"><span class="avatar">${escapeHtml(initials(person.name))}</span><div><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(note)}</p></div>${action}</article>`;
}

export async function renderFriends(container, signal, _selectedDate, initialTab = 'friends') {
  if (signal.aborted) return;
  loading(container);
  try {
    const [friends, pending] = await Promise.all([
      api.friends({ signal }),
      api.pendingFriends({ signal }),
    ]);
    if (signal.aborted) return;
    const incoming = pending.filter((item) => item.isIncoming);
    const outgoing = pending.filter((item) => !item.isIncoming);
    container.innerHTML = /* HTML */ `<div class="friends-view">
      ${pageHeading('Znajomi', 'Twój krąg treningowy — znajomi, zaproszenia i nowe kontakty.', `<button class="button button--secondary" data-refresh-friends>${icon('users', 18)} Odśwież listę</button>`)}
      <div
        class="tabs friends-tabs"
        role="group"
        aria-label="Widok znajomych"
      >
        ${[
          ['friends', `Znajomi (${friends.length})`],
          ['requests', `Zaproszenia (${incoming.length})`],
          ['search', 'Szukaj'],
        ]
          .map(
            ([tab, label]) =>
              `<button class="tabs__button" data-friends-tab="${tab}" aria-pressed="false">${label}</button>`,
          )
          .join('')}
      </div>
      <section
        data-friends-pane="friends"
        aria-labelledby="friends-heading"
      >
        <h2
          id="friends-heading"
          class="friends-heading"
        >
          Twoi znajomi
        </h2>
        <div class="friends-grid">
          ${friends.map((person) => personCard(person, `Znajomi od ${shortDate(person.friendsSince)}`)).join('') || emptyState('Jeszcze bez znajomych', 'Otwórz Szukaj i wyślij pierwsze zaproszenie.')}
        </div>
      </section>
      <section
        data-friends-pane="requests"
        aria-labelledby="requests-heading"
        hidden
      >
        <h2
          id="requests-heading"
          class="friends-heading"
        >
          Otrzymane zaproszenia
        </h2>
        <div class="friends-grid">
          ${incoming.map((person) => personCard(person, `Zaproszenie z ${shortDate(person.requestDate)}`, `<div class="friend-card__actions"><button class="button button--primary" data-friend-action="accept" data-friend-id="${person.friendshipId}" aria-label="Akceptuj zaproszenie: ${escapeHtml(person.name)}">Akceptuj</button><button class="button button--secondary" data-friend-action="reject" data-friend-id="${person.friendshipId}" aria-label="Odrzuć zaproszenie: ${escapeHtml(person.name)}">Odrzuć</button></div>`)).join('') || emptyState('Brak zaproszeń', 'Nowe zaproszenia pojawią się tutaj.')}
        </div>
        <h2 class="friends-heading">Wysłane zaproszenia</h2>
        <div class="friends-grid">
          ${outgoing.map((person) => personCard(person, 'Oczekuje na odpowiedź', `<button class="button button--secondary" data-friend-action="reject" data-friend-id="${person.friendshipId}" aria-label="Anuluj zaproszenie: ${escapeHtml(person.name)}">Anuluj</button>`)).join('') || '<p class="form__hint">Nie masz wysłanych zaproszeń.</p>'}
        </div>
      </section>
      <section
        data-friends-pane="search"
        aria-labelledby="friend-search-heading"
        hidden
      >
        <h2
          id="friend-search-heading"
          class="friends-heading"
        >
          Znajdź znajomych
        </h2>
        <form
          class="friends-search"
          data-friends-search
        >
          <label class="search"
            >${icon('search', 18)}<span class="sr-only">Imię lub pełny adres e-mail</span
            ><input
              type="search"
              name="term"
              minlength="2"
              maxlength="100"
              placeholder="Imię lub pełny adres e-mail"
              required /></label
          ><button
            class="button button--primary"
            type="submit"
          >
            Szukaj osób
          </button>
        </form>
        <p class="form__hint friends-search__hint">
          ${config.demo ? 'Przykładowe osoby w demo: Anna, Michał, Julia, Piotr i Marta. Zaproszenia zapisują się w tej przeglądarce.' : 'Wyszukujemy tylko publiczne profile. Adres e-mail musi być wpisany w całości. Widoczność swojego konta ustawisz w profilu.'}
        </p>
        <p
          class="form__hint"
          role="status"
          data-friend-search-status
        >
          Wpisz co najmniej 2 znaki.
        </p>
        <div
          class="friends-grid"
          data-friend-results
        ></div>
      </section>
      <p
        class="form__error"
        role="alert"
        data-friend-error
      ></p>
    </div>`;
    let activeTab = 'friends';
    let searchVersion = 0;
    function selectTab(tab) {
      activeTab = ['friends', 'requests', 'search'].includes(tab) ? tab : 'friends';
      container.querySelectorAll('[data-friends-tab]').forEach((button) => {
        const active = button.dataset.friendsTab === activeTab;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('tabs__button--active', active);
      });
      container.querySelectorAll('[data-friends-pane]').forEach((pane) => {
        pane.hidden = pane.dataset.friendsPane !== activeTab;
      });
    }
    selectTab(initialTab);
    container
      .querySelectorAll('[data-friends-tab]')
      .forEach((button) =>
        button.addEventListener('click', () => selectTab(button.dataset.friendsTab)),
      );
    container
      .querySelector('[data-refresh-friends]')
      .addEventListener('click', () => void renderFriends(container, signal, undefined, activeTab));
    container.querySelector('[data-friends-search]').addEventListener('submit', async (event) => {
      event.preventDefault();
      const version = ++searchVersion;
      const status = container.querySelector('[data-friend-search-status]');
      const results = container.querySelector('[data-friend-results]');
      status.textContent = 'Szukam osób…';
      results.innerHTML = '';
      try {
        const people = await api.searchUsers(new FormData(event.target).get('term').trim(), {
          signal,
        });
        if (signal.aborted || version !== searchVersion) return;
        status.textContent = people.length
          ? `Znalezione osoby: ${people.length}`
          : 'Nie znaleziono publicznych profili.';
        results.innerHTML = people
          .map((person) => {
            const isFriend = friends.some((item) => item.userId === person.userId);
            const request = pending.find((item) => item.userId === person.userId);
            return personCard(
              person,
              isFriend ? 'Twój znajomy' : request ? 'Zaproszenie oczekuje' : 'Profil publiczny',
              isFriend || request
                ? '<span class="badge badge--success">Na Twojej liście</span>'
                : `<button class="button button--primary" data-send-friend="${escapeHtml(person.userId)}" aria-label="Dodaj do znajomych: ${escapeHtml(person.name)}">${icon('plus', 16)} Dodaj</button>`,
            );
          })
          .join('');
      } catch (error) {
        if (!signal.aborted && version === searchVersion) status.textContent = error.message;
      }
    });
    container.querySelector('.friends-view').addEventListener(
      'click',
      async (event) => {
        const button = event.target.closest('[data-friend-action], [data-send-friend]');
        if (!button || button.disabled || signal.aborted) return;
        button.disabled = true;
        const errorElement = container.querySelector('[data-friend-error]');
        errorElement.textContent = '';
        try {
          if (button.dataset.sendFriend) await api.sendFriendRequest(button.dataset.sendFriend);
          else if (button.dataset.friendAction === 'accept')
            await api.acceptFriendRequest(button.dataset.friendId);
          else await api.rejectFriendRequest(button.dataset.friendId);
          if (signal.aborted) return;
          toast(
            button.dataset.sendFriend
              ? 'Zaproszenie wysłane.'
              : button.dataset.friendAction === 'accept'
                ? 'Zaproszenie zaakceptowane.'
                : 'Zaproszenie usunięte.',
          );
          await renderFriends(container, signal, undefined, 'requests');
          container.querySelector('[data-friends-tab="requests"]').focus();
        } catch (error) {
          if (!signal.aborted) {
            errorElement.textContent = error.message;
            button.disabled = false;
          }
        }
      },
      { signal },
    );
  } catch (error) {
    if (!signal.aborted) renderError(container, error, () => renderFriends(container, signal));
  }
}
