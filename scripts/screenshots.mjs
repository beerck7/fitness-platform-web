import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('docs/images', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1100],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:4173/#/overview');
    await page.getByRole('heading', { name: /Witaj, Alex/, level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: `docs/images/${name}.png` });
    await page.close();
    console.info(`Saved docs/images/${name}.png`);
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  await page.goto('http://127.0.0.1:4173/#/workouts');
  await page.getByRole('heading', { name: 'Twoje treningi', level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/training-plan.png', fullPage: true });
  await page.goto('http://127.0.0.1:4173/#/overview');
  await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await page.getByRole('dialog').getByRole('checkbox').first().check();
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/session.png' });
  await page.keyboard.press('Escape');
  await page.goto('http://127.0.0.1:4173/#/workouts');
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByRole('button', { name: 'Utwórz trening', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('button', { name: 'Dodaj ćwiczenie: Przysiad z hantlem', exact: true })
    .click();
  await dialog
    .getByRole('button', { name: 'Dodaj ćwiczenie: Wiosłowanie hantlem', exact: true })
    .click();
  await dialog.getByLabel('Nazwa treningu', { exact: true }).fill('Trening całego ciała');
  await dialog.getByLabel('Ciężar docelowy (kg): Przysiad z hantlem', { exact: true }).fill('10');
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/workout-builder.png' });
  await page.keyboard.press('Escape');
  await page.goto('http://127.0.0.1:4173/#/schedule');
  await page.getByRole('heading', { name: 'Harmonogram', level: 1 }).waitFor();
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/schedule.png' });
  await page.goto('http://127.0.0.1:4173/#/training');
  await page.getByRole('heading', { name: 'Ułóż trening', level: 1 }).waitFor();
  await page
    .getByRole('button', { name: 'Dodaj ćwiczenie: Przysiad z hantlem', exact: true })
    .click();
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/training.png' });
  await page.goto('http://127.0.0.1:4173/#/friends');
  await page.getByRole('heading', { name: 'Znajomi', level: 1 }).waitFor();
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: 'docs/images/friends.png' });
  await page.close();
  console.info('Saved training plan and session screenshots');
} finally {
  await browser.close();
}
