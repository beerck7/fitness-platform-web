import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('workout builder supports dragging, individual settings, ordering and mobile buttons', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/workouts');
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('[data-drag-id="exercise:1"]').dragTo(dialog.locator('[data-builder-plan]'));
  await dialog
    .getByRole('button', { name: 'Dodaj ćwiczenie: Wiosłowanie hantlem', exact: true })
    .click();
  await dialog.getByLabel('Serie: Przysiad z hantlem', { exact: true }).fill('4');
  await dialog.getByLabel('Powtórzenia: Przysiad z hantlem', { exact: true }).fill('8');
  await dialog.getByLabel('Przerwa (s): Przysiad z hantlem', { exact: true }).fill('90');
  await dialog.getByLabel('Ciężar docelowy (kg): Przysiad z hantlem', { exact: true }).fill('7.5');
  await dialog.getByLabel('Serie: Wiosłowanie hantlem', { exact: true }).fill('2');
  await dialog.getByRole('button', { name: 'Przesuń w dół: Przysiad z hantlem' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Usuń ćwiczenie: Przysiad z hantlem' }),
  ).toBeFocused();
  await expect(dialog.locator('.plan-exercise h4')).toHaveText([
    '1. Wiosłowanie hantlem',
    '2. Przysiad z hantlem',
  ]);
  await expect(dialog.getByLabel('Serie: Przysiad z hantlem', { exact: true })).toHaveValue('4');
  await dialog.getByRole('button', { name: 'Usuń ćwiczenie: Wiosłowanie hantlem' }).click();
  await dialog.getByRole('button', { name: 'Dodaj ćwiczenie: Pompki', exact: true }).click();
  await dialog.getByLabel('Szukaj ćwiczenia w bibliotece').fill('nieistniejące');
  await expect(dialog.getByText('Brak pasujących ćwiczeń.')).toBeVisible();
  await dialog.getByLabel('Szukaj ćwiczenia w bibliotece').fill('');
  await dialog.getByLabel('Nazwa treningu', { exact: true }).fill('Plan z przeciągania');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await dialog.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Plan z przeciągania', exact: true }),
  ).toBeVisible();
  await page.reload();
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Plan z przeciągania', exact: true }) });
  await card.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await expect(dialog.locator('.session-exercise__details > strong')).toHaveText([
    'Przysiad z hantlem',
    'Pompki',
  ]);
  await expect(
    dialog.getByText(/4 serie × 8 powtórzeń · 7,5 kg docelowo · 90 s odpoczynku/),
  ).toBeVisible();
  await expect(dialog.getByText(/Bez dodatkowego obciążenia/)).toBeVisible();
});

test('food dragging adds a portion, moves it between meals and preserves edits after reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/#/nutrition?date=2020-01-01');
  const product = page
    .locator('[data-food-library] .drag-item')
    .filter({ hasText: 'Jogurt grecki' });
  await product.dragTo(page.locator('[data-meal="2"]'));
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Dodaj posiłek: Kolacja' })).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: 'Posiłek', exact: true })).toHaveValue('2');
  await dialog.getByLabel('Ilość (gramy)').fill('200');
  await dialog.getByRole('button', { name: 'Dodaj do dziennika' }).click();
  await expect(page.locator('[data-meal="2"] .food-entry')).toHaveCount(1);
  await page.locator('[data-meal="2"] .food-entry').dragTo(page.locator('[data-meal="0"]'));
  await expect(page.locator('[data-meal="0"] .food-entry')).toHaveCount(1);
  await expect(page.locator('[data-meal="2"] .food-entry')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Edytuj lub przenieś: Jogurt grecki', exact: true })
    .click();
  await expect(dialog.getByLabel('Ilość (gramy)')).toHaveValue('200');
  await dialog.getByLabel('Ilość (gramy)').fill('150');
  await dialog.getByRole('combobox', { name: 'Posiłek', exact: true }).selectOption('1');
  await dialog.getByRole('button', { name: 'Zapisz zmiany' }).click();
  await expect(page.locator('[data-meal="1"] .food-entry')).toContainText('150 g');
  await page.locator('[data-meal="1"] .food-entry').dragTo(page.locator('[data-meal="3"]'));
  await expect(page.locator('[data-meal="3"] .food-entry')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.food-entry')).toHaveCount(1);
  await expect(page.locator('[data-meal="3"] .food-entry')).toContainText('150 g');
});

test('calendar accepts a dragged plan, saves its time and supports editing and deletion', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00'));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/schedule');
  await page
    .locator('[data-drag-id="plan:1"]')
    .dragTo(page.locator('[data-schedule-date="2026-10-06"]'), {
      targetPosition: { x: 40, y: 120 },
    });
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Data', { exact: true })).toHaveValue('2026-10-06');
  await expect(dialog.getByLabel('Godzina')).toHaveValue('08:00');
  await expect(dialog.locator('.plan-exercise')).toHaveCount(4);
  await dialog.getByLabel('Nazwa treningu', { exact: true }).fill('Trening z kalendarza');
  await dialog.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  const event = page.getByRole('button', { name: /^Edytuj termin: Trening z kalendarza/ });
  await expect(event).toBeVisible();
  await event.click();
  await dialog.getByLabel('Data', { exact: true }).fill('2026-10-07');
  await dialog.getByLabel('Godzina').fill('18:30');
  await dialog.getByRole('button', { name: 'Zapisz termin' }).click();
  await expect(event).toHaveAccessibleName('Edytuj termin: Trening z kalendarza, 18:30');
  await page.reload();
  await expect(page.locator('[data-calendar-day="2026-10-07"]')).toContainText(
    'Trening z kalendarza',
  );
  await event.click();
  await dialog.getByRole('button', { name: 'Usuń trening', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Usunąć trening?' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Usuń trening', exact: true }).click();
  await expect(event).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Zaplanuj: Trening całego ciała', exact: true }).click();
  await expect(dialog.locator('.plan-exercise')).toHaveCount(4);
  await page.keyboard.press('Escape');
});
