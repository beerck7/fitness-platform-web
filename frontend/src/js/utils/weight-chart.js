import { emptyState, number } from './dom.js';

export function weightChart(weights, titleId) {
  const sorted = [...weights].sort((a, b) => a.dateRecorded.localeCompare(b.dateRecorded));
  if (!sorted.length)
    return emptyState('Brak pomiarów wagi', 'Dodaj pomiar, aby zobaczyć historię.');
  const values = sorted.map((entry) => entry.weightKg);
  const low = Math.min(...values) - 0.3;
  const range = Math.max(...values) + 0.3 - low;
  const coordinates = values.map((value, index) => [
    30 + (index / Math.max(values.length - 1, 1)) * 740,
    200 - ((value - low) / range) * 150,
  ]);
  return `<figure class="weight-chart"><svg viewBox="0 0 800 240" role="img" aria-labelledby="${titleId}"><title id="${titleId}">Historia wagi: od ${number(values[0], 1)} do ${number(values.at(-1), 1)} kg.</title>${[50, 100, 150, 200].map((y) => `<path d="M30 ${y}H770" stroke="#e8eaf2"/>`).join('')}<polyline points="${coordinates.map((point) => point.join(',')).join(' ')}" fill="none" stroke="#7762ff" stroke-width="3"/>${coordinates.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#6048e8"/>`).join('')}</svg><figcaption>Twoje pomiary wagi w czasie.</figcaption></figure>`;
}
