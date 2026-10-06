const paths = {
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7Z',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  dumbbell: 'm6 6 12 12 M3 8l5-5 M16 21l5-5 M2 5l3-3 M19 22l3-3',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  food: 'M5 3v7c0 3 6 3 6 0V3 M8 3v18 M19 3c-4 5-4 9 0 9V3v18',
  chart: 'M3 3v18h18 M6 15l4-5 4 3 6-8',
  user: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M4 21v-3a8 8 0 0 1 16 0v3',
  users:
    'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M2 21v-3a7 7 0 0 1 14 0v3 M17 3a4 4 0 0 1 0 8 M19 14a5 5 0 0 1 3 5v2',
  flame: 'M12 3c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 2 5 2-3 2-7 1-10Z',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 11v2',
  scale:
    'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3 M8 7a5 5 0 0 1 8 0l-2 3h-4Z M12 6v2',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 m-5-5 5 5-5 5',
  'chevron-left': 'm15 5-7 7 7 7',
  'chevron-right': 'm9 5 7 7-7 7',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',
  check: 'm5 12 4 4L19 6',
  star: 'm12 3 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  edit: 'm4 16-1 5 5-1L21 7l-4-4Z M14 6l4 4',
  search: 'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15 M16 16l5 5',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M6 18 18 6',
  logout: 'M10 4H4v16h6 M8 12h13 m-4-4 4 4-4 4',
  leaf: 'M20 3c-10 0-17 5-15 13 7 4 14-1 15-13 M4 21 15 10',
  info: 'M12 8v.1 M12 11v6 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
};
export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] ?? paths.activity}"/></svg>`;
}
