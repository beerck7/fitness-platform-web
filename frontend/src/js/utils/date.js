export function dateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isFinite(parsed.getTime()) && dateISO(parsed) === value;
}

export function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateISO(date);
}
export function shortDate(value) {
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' }).format(
    new Date(`${value.slice(0, 10)}T12:00:00`),
  );
}
export function weekStart(date = new Date()) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return dateISO(start);
}
