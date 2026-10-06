import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Polish forms show localized validation and recover after input changes', async ({ page }) => {
  await page.goto('/#/register');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  const name = page.getByLabel('Imię i nazwisko');
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click();
  await expect(name).toBeFocused();
  expect(await name.evaluate((input) => input.validationMessage)).toBe('Uzupełnij to pole.');
  await name.fill('Jan Kowalski');
  expect(await name.evaluate((input) => input.validationMessage)).toBe('');
  const email = page.getByLabel('Adres e-mail');
  await email.fill('niepoprawny');
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click();
  expect(await email.evaluate((input) => input.validationMessage)).toBe(
    'Podaj poprawny adres e-mail.',
  );
  await email.fill('jan@example.com');
  expect(await email.evaluate((input) => input.validationMessage)).toBe('');
});

test('dashboard session supports cancellation, exercise checks and persistent completion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/overview');
  const start = page.getByRole('button', { name: 'Rozpocznij trening', exact: true });
  await expect(start).toBeVisible();
  const box = await start.boundingBox();
  expect(box.y + box.height).toBeLessThan(770);
  await start.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Zakończ trening' })).toBeDisabled();
  await dialog.getByRole('checkbox').first().check();
  await expect(dialog.getByRole('status')).toHaveText('Wykonano 1 z 4 ćwiczeń');
  await page.keyboard.press('Escape');
  await expect(start).toBeFocused();
  await start.click();
  await expect(dialog.getByRole('status')).toHaveText('Wykonano 0 z 4 ćwiczeń');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  for (const checkbox of await dialog.getByRole('checkbox').all()) await checkbox.check();
  await dialog.getByRole('button', { name: 'Zakończ trening' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Zobacz trening', exact: true })).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Zobacz trening', exact: true }).click();
  for (const checkbox of await dialog.getByRole('checkbox').all()) {
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toBeDisabled();
  }
});

test('dashboard statistics switch periods without changing the weekly goal', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-04T12:00:00'));
  await page.goto('/#/overview');
  const weeklyGoal = page.getByRole('progressbar', { name: 'Tygodniowy cel treningowy' });
  const weeklyValue = await weeklyGoal.getAttribute('value');
  await page.getByRole('button', { name: 'Rok', exact: true }).click();
  await expect(page.locator('[data-stat="workouts"]')).toHaveText('5');
  await expect(page.locator('[data-stat="minutes"]')).toHaveText('215');
  await expect(page.locator('[data-period]').first()).toHaveText('w tym roku');
  await expect(weeklyGoal).toHaveAttribute('value', weeklyValue);
  await page.getByRole('button', { name: 'Miesiąc', exact: true }).click();
  await expect(page.locator('[data-stat="workouts"]')).toHaveText('2');
  await expect(page.locator('[data-stat="minutes"]')).toHaveText('90');
  await expect(page.locator('[data-period]').first()).toHaveText('w tym miesiącu');
  await expect(page.getByRole('button', { name: 'Rok', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Tydzień', exact: true }).click();
  await expect(page.locator('[data-stat="workouts"]')).toHaveText('3');
  await expect(page.locator('[data-stat="sets"]')).toHaveText('27');
  await expect(page.locator('[data-period]').first()).toHaveText('w tym tygodniu');
});

test('weekly calendar opens a filtered training plan that survives reload', async ({ page }) => {
  await page.goto('/#/overview');
  await page.getByRole('link', { name: /^Plan treningów na .*, dzisiaj$/ }).click();
  await expect(page.getByRole('heading', { name: 'Twoje treningi', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: 'Trening całego ciała', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  await expect(page.getByRole('dialog').locator('[name="date"]')).toHaveValue(
    new URL(page.url()).hash.split('?date=')[1],
  );
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Wszystkie daty', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(6);
  await page.goto('/#/workouts?date=%22%3E%3Cscript%3E');
  await expect(page.getByRole('article')).toHaveCount(6);
});

test('meal shortcuts select the meal and day navigation retains its own diary', async ({
  page,
}) => {
  await page.goto('/#/nutrition?date=2020-01-01');
  await expect(page.getByLabel('Data dziennika posiłków')).toHaveValue('2020-01-01');
  await page.getByRole('button', { name: 'Dodaj posiłek: Kolacja', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('combobox', { name: 'Posiłek', exact: true })).toHaveValue('2');
  await dialog.getByRole('button', { name: 'Dodaj do dziennika' }).click();
  await expect(
    page
      .locator('.meal-group')
      .filter({ has: page.getByRole('heading', { name: /^Kolacja/ }) })
      .getByRole('heading', { name: 'Jogurt grecki', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Następny dzień dziennika' }).click();
  await expect(page.getByLabel('Data dziennika posiłków')).toHaveValue('2020-01-02');
  await expect(page.getByRole('heading', { name: 'Brak posiłków w tym dniu' })).toBeVisible();
  await page.getByRole('link', { name: 'Poprzedni dzień dziennika' }).click();
  await expect(page.getByRole('heading', { name: 'Jogurt grecki', exact: true })).toBeVisible();
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`demo pages fit ${width}px and have no detected accessibility violations`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [route, heading] of [
      ['overview', /Witaj, Alex/],
      ['workouts', 'Twoje treningi'],
      ['training', 'Ułóż trening'],
      ['friends', 'Znajomi'],
      ['schedule', 'Harmonogram'],
      ['exercises', 'Biblioteka ćwiczeń'],
      ['nutrition', 'Dziennik żywienia'],
      ['progress', 'Twoje postępy'],
      ['profile', 'Twój profil'],
    ]) {
      await page.goto(`/#/${route}`);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('demo creates, renames, completes and deletes a workout; modal supports Escape', async ({
  page,
}) => {
  await page.goto('/#/workouts');
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  await page.getByLabel('Nazwa treningu', { exact: true }).fill('Test strength session');
  const targetWeight = page.getByLabel('Ciężar docelowy (kg): Przysiad z hantlem', { exact: true });
  await page
    .getByRole('button', { name: 'Dodaj ćwiczenie: Przysiad z hantlem', exact: true })
    .click();
  await targetWeight.fill('7.5');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Utwórz trening', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Test strength session' })).toBeVisible();
  await page.getByRole('button', { name: 'Zmień nazwę: Test strength session' }).click();
  await page.getByLabel('Nazwa treningu', { exact: true }).fill('Renamed strength session');
  await page.getByRole('button', { name: 'Zapisz nazwę' }).click();
  await expect(page.getByRole('heading', { name: 'Renamed strength session' })).toBeVisible();
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Renamed strength session' }) });
  await page.reload();
  await card.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(/7,5 kg docelowo/)).toBeVisible();
  await page.keyboard.press('Escape');
  await card.getByRole('button', { name: 'Oznacz jako ukończony', exact: true }).click();
  await expect(card.getByRole('button', { name: 'Oznacz jako planowany' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Renamed strength session' })).toBeVisible();
  await page.getByRole('button', { name: 'Usuń: Renamed strength session' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Usuń: Renamed strength session' }).click();
  await page.getByRole('button', { name: 'Usuń trening', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Renamed strength session' })).not.toBeVisible();
});

test('exercise search has an empty state and a new exercise is available for workouts', async ({
  page,
}) => {
  await page.goto('/#/exercises');
  await page.getByRole('searchbox', { name: 'Szukaj ćwiczeń' }).fill('no match');
  await expect(page.getByRole('heading', { name: 'Brak pasujących ćwiczeń' })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj ćwiczenie' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nazwa ćwiczenia').fill('Test movement');
  await dialog.getByLabel('Krótki opis').fill('A sample exercise for the demo.');
  await dialog.getByLabel('Sprzęt', { exact: true }).fill('Masa własnego ciała');
  await dialog.getByLabel('Wskazówki').fill('Move with control.');
  await dialog.getByRole('button', { name: 'Zapisz ćwiczenie' }).click();
  await expect(page.getByRole('heading', { name: 'Test movement' })).toBeVisible();
});

test('food diary supports empty days, adding food and removal', async ({ page }) => {
  await page.goto('/#/nutrition');
  await page.getByLabel('Data dziennika posiłków').fill('2020-01-01');
  await expect(page.getByRole('heading', { name: 'Brak posiłków w tym dniu' })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj produkt', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Produkt', { exact: true })
    .selectOption({ label: 'Jogurt grecki · 73 kcal / 100g' });
  await page.getByLabel('Ilość (gramy)').fill('200');
  await page.getByRole('button', { name: 'Dodaj do dziennika' }).click();
  await expect(page.getByRole('heading', { name: 'Jogurt grecki' })).toBeVisible();
  await expect(page.locator('.calorie-ring strong')).toHaveText('146');
  await page.getByRole('button', { name: 'Usuń: Jogurt grecki' }).click();
  await expect(page.getByRole('heading', { name: 'Brak posiłków w tym dniu' })).toBeVisible();
});

test('profile escapes saved content and weight check-ins persist', async ({ page }) => {
  await page.goto('/#/profile');
  await page.getByLabel('Imię i nazwisko').fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: 'Zapisz dane' }).click();
  await expect(
    page.getByRole('heading', { name: '<script>alert(1)</script>', exact: true }),
  ).toBeVisible();
  expect(await page.locator('.profile-summary script').count()).toBe(0);
  await page.goto('/#/progress');
  await page.getByRole('button', { name: 'Dodaj pomiar' }).click();
  await page.getByRole('dialog').getByLabel('Waga (kg)').fill('67.2');
  await page.getByRole('button', { name: 'Zapisz pomiar' }).click();
  await expect(page.getByRole('cell', { name: '67,2 kg', exact: true })).toBeVisible();
});

test('mobile navigation, skip link, reduced motion and route changes work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/overview');
  await page.getByRole('button', { name: 'Otwórz menu' }).click();
  await expect(page.getByRole('link', { name: 'Pulpit', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeFocused();
  await page.getByRole('link', { name: 'Przejdź do treści' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.getByRole('heading', { name: /Witaj, Alex/ })).toBeVisible();
  await page.goto('/#/missing');
  await expect(page.getByRole('heading', { name: 'Nie znaleziono strony' })).toBeVisible();
});
