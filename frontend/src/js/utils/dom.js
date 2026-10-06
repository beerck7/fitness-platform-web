export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}
export function number(value, digits = 0) {
  return Number.isFinite(Number(value))
    ? new Intl.NumberFormat('pl-PL', { maximumFractionDigits: digits }).format(Number(value))
    : '—';
}
export function initials(name = 'Użytkownik') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();
}
let toastTimer;
export function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.hidden = true;
  }, 4500);
}

export function loading(container, label = 'Ładowanie danych') {
  container.innerHTML = `<div class="loading-state" role="status" aria-label="${escapeHtml(label)}"><span class="sr-only">${escapeHtml(label)}</span><div class="skeleton skeleton--heading"></div><div class="skeleton-grid">${Array.from({ length: 3 }, () => '<div class="skeleton skeleton--card"></div>').join('')}</div><div class="skeleton skeleton--panel"></div></div>`;
}

export function emptyState(title, description, action = '') {
  return `<div class="data-state"><span class="data-state__symbol" aria-hidden="true">↗</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>${action}</div>`;
}

export function renderError(container, error, retry) {
  if (error.name === 'AbortError') return;
  container.innerHTML = `<div class="panel data-state" role="alert"><h2>Nie udało się wczytać danych</h2><p>${escapeHtml(error.message)}</p><button class="button button--primary" type="button" data-retry>Spróbuj ponownie</button></div>`;
  container.querySelector('[data-retry]').addEventListener('click', retry, { once: true });
}

export async function submitForm(form, action, success) {
  if (!form.reportValidity()) return;
  const button = form.querySelector('[type="submit"]');
  const errorElement = form.querySelector('[data-form-error]');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Zapisywanie…';
  errorElement.textContent = '';
  try {
    await action(Object.fromEntries(new FormData(form)));
    await success();
  } catch (error) {
    errorElement.textContent = error.message;
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = label;
    }
  }
}
