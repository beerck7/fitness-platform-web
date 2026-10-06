export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const messages = {
  400: 'Sprawdź wprowadzone dane.',
  401: 'Sesja wygasła. Zaloguj się ponownie.',
  403: 'Nie masz uprawnień do tej operacji.',
  404: 'Nie znaleziono wybranego elementu.',
  429: 'Zbyt wiele prób. Odczekaj minutę i spróbuj ponownie.',
  500: 'Serwer nie mógł wykonać operacji. Spróbuj ponownie.',
};

const fieldLabels = {
  name: 'Imię lub nazwa',
  email: 'Adres e-mail',
  password: 'Hasło',
  oldpassword: 'Aktualne hasło',
  newpassword: 'Nowe hasło',
  dateofbirth: 'Data urodzenia',
  phonenumber: 'Numer telefonu',
  gender: 'Płeć',
  weightkg: 'Waga',
  currentweightkg: 'Aktualna waga',
  heightcm: 'Wzrost',
  targetcalories: 'Kalorie',
  proteingrams: 'Białko',
  carbsgrams: 'Węglowodany',
  fatgrams: 'Tłuszcze',
  trainingsperweektarget: 'Treningi w tygodniu',
  productamount: 'Ilość produktu',
  mealtype: 'Posiłek',
  durationminutes: 'Czas treningu',
  targetweight: 'Ciężar docelowy',
  sets: 'Serie',
  reps: 'Powtórzenia',
};

function responseMessage(json, status, authenticated) {
  if (json?.errors && typeof json.errors === 'object') {
    const labels = [
      ...new Set(
        Object.keys(json.errors)
          .map((key) => fieldLabels[key.split('.').at(-1).toLowerCase()])
          .filter(Boolean),
      ),
    ];
    return labels.length ? `Sprawdź pola: ${labels.join(', ')}.` : 'Sprawdź dane formularza.';
  }
  if (status >= 500) return messages[500];
  const detail = json?.message || json?.title;
  const legacyMessages = {
    'Invalid email or password.': 'Nieprawidłowy adres e-mail lub hasło.',
    'This email is already registered.': 'Ten adres e-mail jest już zarejestrowany.',
    'This phone number is already registered.': 'Ten numer telefonu jest już zarejestrowany.',
    'Current password is incorrect.': 'Aktualne hasło jest nieprawidłowe.',
  };
  if (legacyMessages[detail]) return legacyMessages[detail];
  if (
    detail &&
    !/^(Bad Request|Unauthorized|Forbidden|Not Found|One or more validation errors)/i.test(detail)
  )
    return detail;
  if (status === 401 && !authenticated) return 'Nieprawidłowy adres e-mail lub hasło.';
  return messages[status] || `Nie udało się wykonać operacji (HTTP ${status}).`;
}

export function createApiClient({
  baseUrl,
  fetchImpl = globalThis.fetch,
  getToken = () => null,
  onUnauthorized = () => {},
  timeoutMs = 10_000,
}) {
  async function request(path, { method = 'GET', body, signal } = {}) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(cancel, timeoutMs);
    try {
      const token = getToken();
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) {
        let json;
        try {
          json = await response.json();
        } catch {
          /* Some errors have no response body. */
        }
        // A rejected sign-in is not an expired authenticated session.
        if (response.status === 401 && token) onUnauthorized();
        throw new ApiError(responseMessage(json, response.status, Boolean(token)), response.status);
      }
      if (response.status === 204 || response.headers.get('content-length') === '0') return null;
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        throw new ApiError('Serwer zwrócił nieprawidłowe dane.', 502);
      }
    } catch (error) {
      if (signal?.aborted)
        throw new DOMException('Żądanie anulowano po zmianie strony.', 'AbortError');
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted)
        throw new ApiError('Przekroczono czas oczekiwania. Spróbuj ponownie.', 408);
      throw new ApiError('Nie udało się pobrać danych. Sprawdź połączenie i spróbuj ponownie.', 0);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  return {
    get: (path, options) => request(path, options),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  };
}
