import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('original navigation opens the inline training builder and saves a dragged exercise', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/overview');
  const navigation = page.getByRole('navigation', { name: 'Menu główne', exact: true });
  for (const label of ['Pulpit', 'Treningi', 'Ćwiczenia', 'Kalorie', 'Znajomi', 'Profil', 'Plany'])
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  await navigation.getByRole('link', { name: 'Treningi', exact: true }).click();
  await page.getByLabel('Nazwa treningu', { exact: true }).fill('Trening z własnej zakładki');
  await page.locator('[data-drag-id="exercise:1"]').dragTo(page.locator('[data-builder-plan]'));
  await expect(page.locator('[data-plan-item]')).toHaveCount(1);
  await page.getByLabel('Ciężar docelowy (kg): Przysiad z hantlem', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Trening z własnej zakładki', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Trening z własnej zakładki', exact: true }),
  ).toBeVisible();
});

test('dashboard search and quick actions open working exercise and weight forms', async ({
  page,
}) => {
  await page.goto('/#/overview');
  await page.getByLabel('Wyszukiwarka ćwiczeń', { exact: true }).fill('Deska');
  await page.getByRole('button', { name: 'Wyszukaj ćwiczenia' }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Deska', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.goto('/#/overview');
  await page.getByRole('link', { name: 'Zważ się', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Dodaj pomiar', exact: true })).toBeFocused();
});

test('friends support accepting, searching, sending and cancelling invitations after reload', async ({
  page,
}) => {
  await page.goto('/#/friends');
  await page.getByRole('button', { name: 'Zaproszenia (1)', exact: true }).click();
  await page.getByRole('button', { name: 'Akceptuj zaproszenie: Julia Wiśniewska' }).click();
  await page.getByRole('button', { name: 'Znajomi (3)', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Julia Wiśniewska', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
  await page.getByLabel('Imię lub pełny adres e-mail').fill('Piotr');
  await page.getByRole('button', { name: 'Szukaj osób' }).click();
  await page.getByRole('button', { name: 'Dodaj do znajomych: Piotr Zieliński' }).click();
  await expect(
    page.getByRole('button', { name: 'Anuluj zaproszenie: Piotr Zieliński' }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Zaproszenia (0)', exact: true }).click();
  await page.getByRole('button', { name: 'Anuluj zaproszenie: Piotr Zieliński' }).click();
  await expect(page.getByText('Nie masz wysłanych zaproszeń.')).toBeVisible();
  for (const tab of ['Znajomi (3)', 'Zaproszenia (0)', 'Szukaj']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
