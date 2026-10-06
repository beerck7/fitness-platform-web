import { api } from '../api/services.js';
import {
  escapeHtml,
  loading,
  emptyState,
  number,
  renderError,
  submitForm,
  toast,
} from '../utils/dom.js';
import { dateISO } from '../utils/date.js';
import { flattenDiary, percentage } from '../utils/analytics.js';
import { icon } from '../utils/icons.js';
import { closeDialog, openDialog, pageHeading } from './shell.js';

import { mountDragDrop } from '../utils/drag-drop.js';

const meals = ['Śniadanie', 'Obiad', 'Kolacja', 'Przekąski', 'Inne'];

export async function renderNutrition(container, signal, selectedDate = dateISO()) {
  if (signal.aborted) return;
  loading(container);
  try {
    const [diary, products, goal] = await Promise.all([
      api.diary(selectedDate, { signal }),
      api.products({ signal }),
      api.goal({ signal }),
    ]);
    if (signal.aborted) return;
    const entries = flattenDiary(diary);
    const previousDay = new Date(`${selectedDate}T12:00:00`);
    previousDay.setDate(previousDay.getDate() - 1);
    const nextDay = new Date(`${selectedDate}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    const targets = {
      calories: goal?.targetCalories ?? 2200,
      protein: goal?.proteinGrams ?? 140,
      carbs: goal?.carbsGrams ?? 260,
      fat: goal?.fatGrams ?? 70,
    };
    container.innerHTML = /* HTML */ `${pageHeading('Dziennik żywienia', 'Zapisuj posiłki i kontroluj dzienne wartości odżywcze.', `<button class="button button--primary" data-add-food>${icon('plus', 16)} Dodaj produkt</button>`)}
      <div class="nutrition-grid">
        <section
          class="panel food-diary"
          aria-labelledby="diary-heading"
        >
          <div class="panel__heading">
            <div>
              <span class="eyebrow">TWOJE POSIŁKI</span>
              <h2 id="diary-heading">Dziennik posiłków</h2>
            </div>
            <div class="diary-date">
              <a
                class="icon-button"
                href="#/nutrition?date=${dateISO(previousDay)}"
                aria-label="Poprzedni dzień dziennika"
                >${icon('chevron-left', 16)}</a
              ><label class="date-field"
                ><span class="sr-only">Data dziennika posiłków</span
                ><input
                  type="date"
                  value="${selectedDate}"
                  data-diary-date
                  required /></label
              ><a
                class="icon-button"
                href="#/nutrition?date=${dateISO(nextDay)}"
                aria-label="Następny dzień dziennika"
                >${icon('chevron-right', 16)}</a
              >
            </div>
          </div>
          <div
            class="meal-shortcuts"
            role="group"
            aria-label="Dodaj posiłek"
          >
            ${meals.map((label, index) => `<button class="meal-shortcuts__button" type="button" data-log-meal="${index}" aria-label="Dodaj posiłek: ${label}">${icon(index < 3 ? 'food' : 'leaf', 16)}${label}${icon('plus', 13)}</button>`).join('')}
          </div>
          ${!entries.length ? emptyState('Brak posiłków w tym dniu', 'Przeciągnij produkt z biblioteki albo użyj przycisku Dodaj produkt.') : ''}
          ${meals
            .map((label, index) => {
              const group = entries.filter((entry) => entry.mealType === index);
              return `<section class="meal-group" data-drop-zone data-meal="${index}" aria-labelledby="meal-heading-${index}"><h3 id="meal-heading-${index}">${label}<span>${number(group.reduce((sum, item) => sum + item.kcal, 0))} kcal</span></h3>${group.length ? group.map(foodEntry).join('') : '<p class="meal-group__empty">Przeciągnij tutaj produkt lub użyj przycisku +.</p>'}</section>`;
            })
            .join('')}
        </section>
        <aside
          class="panel daily-nutrition"
          aria-labelledby="daily-heading"
        >
          <div class="panel__heading">
            <div>
              <span class="eyebrow">BILANS DNIA</span>
              <h2 id="daily-heading">Dzienne spożycie</h2>
            </div>
          </div>
          <div
            class="calorie-ring"
            style="--progress:${percentage(diary.totalKcal, targets.calories)}%"
          >
            <div>
              <strong>${number(diary.totalKcal)}</strong
              ><span>z ${number(targets.calories)} kcal</span>
            </div>
          </div>
          <div class="nutrient-bars">
            ${[
              ['Białko', diary.totalProtein, targets.protein, 'protein'],
              ['Węglowodany', diary.totalCarbs, targets.carbs, 'carbs'],
              ['Tłuszcze', diary.totalFat, targets.fat, 'fat'],
            ]
              .map(
                ([name, value, target, tone]) =>
                  `<div class="nutrient-bars__row"><div><span class="macro-dot macro-dot--${tone}"></span><strong>${name}</strong><span>${number(value)} / ${target} g</span></div><progress class="progress--${tone}" value="${Math.min(value, target)}" max="${target}" aria-label="Dzienne spożycie: ${name}"></progress></div>`,
              )
              .join('')}
          </div>
          <p class="daily-nutrition__note">Dzienne cele możesz zmienić w swoim profilu.</p>
          <a
            class="text-link"
            href="#/profile"
            >Zmień dzienne cele ${icon('arrow', 15)}</a
          >
          <section
            class="food-library"
            aria-labelledby="food-library-heading"
          >
            <h2 id="food-library-heading">Biblioteka produktów</h2>
            <p class="form__hint">Przeciągnij produkt do posiłku albo użyj przycisku +.</p>
            <label
              class="sr-only"
              for="food-search"
              >Szukaj produktu</label
            ><input
              id="food-search"
              type="search"
              class="food-library__search"
              placeholder="Szukaj produktu"
              data-food-search
            />
            <div
              class="food-library__list"
              data-food-library
            ></div>
          </section>
        </aside>
      </div>`;
    container.querySelector('[data-diary-date]').addEventListener('change', (event) => {
      if (event.target.value) {
        history.replaceState(null, '', `#/nutrition?date=${event.target.value}`);
        void renderNutrition(container, signal, event.target.value);
      }
    });
    container
      .querySelector('[data-add-food]')
      .addEventListener('click', () =>
        foodForm(products, selectedDate, () => renderNutrition(container, signal, selectedDate)),
      );
    container
      .querySelectorAll('[data-log-meal]')
      .forEach((button) =>
        button.addEventListener('click', () =>
          foodForm(
            products,
            selectedDate,
            () => renderNutrition(container, signal, selectedDate),
            Number(button.dataset.logMeal),
          ),
        ),
      );
    const refresh = () => renderNutrition(container, signal, selectedDate);
    function drawProducts() {
      const query = container.querySelector('[data-food-search]').value.toLocaleLowerCase('pl');
      const filtered = products.filter((product) =>
        product.name.toLocaleLowerCase('pl').includes(query),
      );
      container.querySelector('[data-food-library]').innerHTML = filtered.length
        ? filtered
            .map(
              (product) =>
                `<article class="drag-item" draggable="true" data-drag-id="product:${escapeHtml(product.id)}"><div><strong>${escapeHtml(product.name)}</strong><span>${number(product.kcal)} kcal / 100 g</span></div><button class="icon-button" type="button" data-add-product="${escapeHtml(product.id)}" aria-label="Dodaj produkt: ${escapeHtml(product.name)}">${icon('plus', 17)}</button></article>`,
            )
            .join('')
        : '<p class="form__hint">Brak pasujących produktów.</p>';
    }
    container.querySelector('[data-food-search]').addEventListener('input', drawProducts);
    drawProducts();
    container.querySelector('.nutrition-grid').addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('[data-add-product], [data-edit-food]');
        if (!button) return;
        if (button.dataset.addProduct)
          foodForm(products, selectedDate, refresh, 0, button.dataset.addProduct);
        else {
          const entry = entries.find((item) => item.id === button.dataset.editFood);
          if (entry)
            foodForm(products, selectedDate, refresh, entry.mealType, entry.productId, entry);
        }
      },
      { signal },
    );
    mountDragDrop(container.querySelector('.nutrition-grid'), (id, zone) => {
      const mealType = Number(zone.dataset.meal);
      if (id.startsWith('product:')) {
        const productId = id.slice(8);
        if (products.some((item) => item.id === productId))
          foodForm(products, selectedDate, refresh, mealType, productId);
      } else if (id.startsWith('entry:')) {
        const entry = entries.find((item) => item.id === id.slice(6));
        if (!entry || entry.mealType === mealType) return;
        void moveEntry(entry, mealType, refresh);
      }
    });

    container.querySelectorAll('[data-remove-food]').forEach((button) =>
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await api.deleteFood(button.dataset.removeFood);
          toast('Produkt usunięty z dziennika.');
          await renderNutrition(container, signal, selectedDate);
        } catch (error) {
          toast(error.message);
          if (button.isConnected) button.disabled = false;
        }
      }),
    );
  } catch (error) {
    if (!signal.aborted)
      renderError(container, error, () => renderNutrition(container, signal, selectedDate));
  }
}

function foodForm(products, date, refresh, selectedMeal = 0, selectedProduct, entry) {
  if (!products.length) {
    toast('Katalog produktów jest pusty.');
    return;
  }
  openDialog(
    entry ? `Edytuj produkt: ${entry.productName}` : `Dodaj posiłek: ${meals[selectedMeal]}`,
    `<form class="form"><label for="food-product">Produkt</label><select id="food-product" name="productId">${products.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} · ${number(product.kcal)} kcal / 100g</option>`).join('')}</select><div class="form__row"><label>Ilość (gramy)<input name="productAmount" type="number" min="1" max="5000" value="${entry?.productAmount ?? 100}" required></label><label>Posiłek<select name="mealType">${meals.map((name, index) => `<option value="${index}">${name}</option>`).join('')}</select></label></div><p class="form__hint">Wartości odżywcze obliczamy na podstawie danych dla 100 g produktu.</p><p class="form__error" role="alert" data-form-error></p><button class="button button--primary" type="submit">${entry ? 'Zapisz zmiany' : 'Dodaj do dziennika'}</button></form>`,
    (dialog) => {
      dialog.querySelector('[name="mealType"]').value = String(selectedMeal);
      if (selectedProduct) dialog.querySelector('[name="productId"]').value = selectedProduct;
      dialog.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        void submitForm(
          event.target,
          (values) =>
            (entry ? (body) => api.updateFood(entry.id, body) : api.addFood)({
              ...values,
              date,
              notes: entry?.notes,
              productAmount: Number(values.productAmount),
              mealType: Number(values.mealType),
            }),
          async () => {
            closeDialog();
            toast(entry ? 'Zmiany zapisane.' : 'Produkt dodany do dziennika.');
            await refresh();
          },
        );
      });
    },
  );
}

function foodEntry(entry) {
  const name = escapeHtml(entry.productName || entry.mealName);
  return `<article class="food-entry" ${entry.productId ? `draggable="true" data-drag-id="entry:${escapeHtml(entry.id)}"` : ''}><span class="food-entry__icon">${icon('food', 19)}</span><div class="food-entry__details"><h4>${name}</h4><p>${number(entry.productAmount ?? entry.mealServings)} ${entry.productAmount != null ? 'g' : 'porcji'} · ${number(entry.protein)} g białka</p></div><strong>${number(entry.kcal)}<span> kcal</span></strong><div class="food-entry__actions">${entry.productId ? `<button class="icon-button" type="button" data-edit-food="${escapeHtml(entry.id)}" aria-label="Edytuj lub przenieś: ${name}">${icon('edit', 15)}</button>` : ''}<button class="icon-button" type="button" data-remove-food="${escapeHtml(entry.id)}" aria-label="Usuń: ${name}">${icon('trash', 15)}</button></div></article>`;
}

async function moveEntry(entry, mealType, refresh) {
  if (entry.pending) return;
  entry.pending = true;
  try {
    await api.updateFood(entry.id, {
      productId: entry.productId,
      productAmount: entry.productAmount,
      mealType,
      notes: entry.notes,
    });
    toast('Produkt przeniesiony.');
    await refresh();
  } catch (error) {
    toast(error.message);
  } finally {
    entry.pending = false;
  }
}
