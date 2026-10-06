import { config } from '../config/app.js';
import { escapeHtml, initials } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { clearSession } from './session.js';
import { api } from '../api/services.js';

let profileLoaded = false;

const routes = [
  ['overview', 'Pulpit', 'grid'],
  ['training', 'Treningi', 'dumbbell'],
  ['exercises', 'Ćwiczenia', 'activity'],
  ['nutrition', 'Kalorie', 'food'],
  ['friends', 'Znajomi', 'users'],
  ['profile', 'Profil', 'user'],
  ['workouts', 'Plany', 'grid'],
  ['schedule', 'Harmonogram', 'clock'],
  ['progress', 'Moje postępy', 'chart'],
];

function navigationLinks() {
  return routes
    .map(
      ([id, label, image]) =>
        `<a href="#/${id}" class="navigation__link" data-nav="${id}">${icon(image, 18)}<span>${label}</span></a>`,
    )
    .join('');
}

export function mountShell() {
  document.querySelector('#app').innerHTML = /* HTML */ ` <div class="workspace">
      <header class="site-header">
        <div class="topbar">
          <a
            class="brand"
            href="#/overview"
            aria-label="Siłownik — strona główna"
            >${icon('bolt', 28)}Siłownik</a
          >
          <div class="topbar__actions">
            <span class="mode-pill">${config.demo ? 'TRYB DEMO' : 'POŁĄCZONO Z API'}</span>
            <button
              class="icon-button topbar__menu"
              data-menu
              aria-label="Otwórz menu"
              aria-expanded="false"
              aria-controls="mobile-navigation"
            >
              ${icon('menu')}
            </button>
          </div>
        </div>
        <nav
          class="navigation"
          aria-label="Menu główne"
        >
          ${navigationLinks()}
        </nav>
        <div class="sidebar-user">
          <a
            href="#/profile"
            class="sidebar-user__profile"
            aria-label="Zobacz swój profil"
          >
            <span
              class="avatar"
              data-avatar
              >AM</span
            >
            <span><small>Zalogowano jako</small><strong data-user-name>Twój profil</strong></span>
          </a>
          <button
            class="sidebar-user__logout"
            data-logout
            aria-label="Wyloguj się"
          >
            ${icon('logout', 18)}Wyloguj się
          </button>
        </div>
        <nav
          class="mobile-navigation"
          id="mobile-navigation"
          aria-label="Menu mobilne"
          hidden
        >
          ${navigationLinks()}<button
            class="navigation__link"
            type="button"
            data-logout
          >
            ${icon('logout', 18)}Wyloguj się
          </button>
        </nav>
      </header>
      <div class="workspace-bar">
        <form
          class="workspace-search"
          role="search"
          data-global-search
        >
          <label
            class="sr-only"
            for="workspace-search"
            >Wyszukiwarka ćwiczeń</label
          >
          ${icon('search', 20)}
          <input
            id="workspace-search"
            name="search"
            type="search"
            placeholder="Szukaj ćwiczeń w bibliotece…"
            maxlength="100"
          />
          <button
            class="icon-button"
            type="submit"
            aria-label="Wyszukaj ćwiczenia"
          >
            ${icon('arrow', 18)}
          </button>
        </form>
        <a
          class="workspace-profile"
          href="#/profile"
          aria-label="Otwórz swój profil"
        >
          <span
            class="avatar"
            data-avatar
            >AM</span
          ><span data-user-name>Twój profil</span>${icon('chevron-right', 16)}
        </a>
      </div>
      <main
        id="main-content"
        tabindex="-1"
      ></main>
      <footer class="footer">
        <span>Siłownik · Platforma treningowa</span
        ><a
          href="https://github.com/beerck7/fitness-platform-web"
          target="_blank"
          rel="noreferrer"
          >Kod projektu ${icon('arrow', 13)}</a
        >
      </footer>
      <nav
        class="quick-navigation"
        aria-label="Szybka nawigacja"
      >
        ${[
          ['overview', 'Pulpit', 'grid'],
          ['workouts', 'Plany', 'dumbbell'],
          ['nutrition', 'Kalorie', 'food'],
          ['progress', 'Postępy', 'chart'],
        ]
          .map(
            ([id, label, image]) =>
              `<a href="#/${id}" data-nav="${id}" aria-label="Otwórz: ${label}">${icon(image, 20)}<span>${label}</span></a>`,
          )
          .join('')}
      </nav>
    </div>
    <dialog
      class="modal"
      id="app-dialog"
      aria-labelledby="dialog-title"
    ></dialog>`;

  const menu = document.querySelector('[data-menu]');
  document.querySelector('[data-global-search]').addEventListener('submit', (event) => {
    event.preventDefault();
    const query = new FormData(event.target).get('search').trim();
    location.hash = `#/exercises?search=${encodeURIComponent(query)}`;
  });
  const nav = document.querySelector('#mobile-navigation');
  function closeMenu(restoreFocus = false) {
    nav.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Otwórz menu');
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = nav.hidden;
    nav.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    if (open) nav.querySelector('a').focus();
  });
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.querySelectorAll('[data-logout]').forEach((button) =>
    button.addEventListener('click', () => {
      clearSession();
      closeMenu();
      location.hash = '#/login';
    }),
  );
  document.querySelector('#app-dialog').addEventListener('click', (event) => {
    if (event.target.closest('[data-close-dialog]')) closeDialog();
  });
}

export function setActivePage(page) {
  const accountPage = ['login', 'register'].includes(page);
  document.querySelector('.sidebar-user').hidden = accountPage;
  document.querySelector('.workspace-profile').hidden = accountPage;
  if (accountPage) profileLoaded = false;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === page;
    link.classList.toggle('navigation__link--active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${routes.find(([id]) => id === page)?.[1] ?? 'Konto'} — Siłownik`;
}

export function updateShellProfile(profile) {
  profileLoaded = true;
  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = profile.name;
  });
  document.querySelectorAll('[data-avatar]').forEach((element) => {
    element.textContent = initials(profile.name);
  });
}

export async function syncShellProfile(signal) {
  if (profileLoaded) return;
  try {
    const profile = await api.profile({ signal });
    if (!signal.aborted) updateShellProfile(profile);
  } catch {
    // Optional sidebar identity must not replace a feature view's error/retry UI.
  }
}

export function openDialog(title, content, mount) {
  const dialog = document.querySelector('#app-dialog');
  dialog.classList.remove('modal--session', 'modal--builder');
  dialog.innerHTML = /* HTML */ `<div class="modal__heading">
      <div>
        <h2 id="dialog-title">${escapeHtml(title)}</h2>
      </div>
      <button
        class="icon-button"
        type="button"
        data-close-dialog
        aria-label="Zamknij okno"
      >
        ${icon('close')}
      </button>
    </div>
    ${content}`;
  dialog.showModal();
  mount?.(dialog);
}

export function closeDialog() {
  document.querySelector('#app-dialog').close();
}

export function pageHeading(title, description, action = '') {
  return `<div class="page-heading"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${action}</div>${demoNotice()}`;
}

export function demoNotice() {
  return config.demo
    ? '<div class="demo-note">Tryb demo · Przykładowe dane zapisujemy tylko w tej przeglądarce.</div>'
    : '';
}
