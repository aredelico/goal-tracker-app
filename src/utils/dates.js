/** Format a Date object to 'YYYY-MM-DD' in local time. */
export function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Parse 'YYYY-MM-DD' to a Date in local time (avoids UTC-shift bugs). */
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Today's date as 'YYYY-MM-DD'. */
export function today() {
  return formatDate(new Date());
}

/** Add (or subtract) N days to a 'YYYY-MM-DD' string. */
export function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

/** Day label: 'MONDAY', 'TODAY', 'YESTERDAY'. */
export function dayLabel(dateStr) {
  const t = today();
  if (dateStr === t) return 'TODAY';
  if (dateStr === addDays(t, -1)) return 'YESTERDAY';
  return parseDate(dateStr)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
}

/** Short month+day label: 'APR 4' */
export function shortDate(dateStr) {
  return parseDate(dateStr)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
}

/** Get the Monday of the week containing dateStr, as 'YYYY-MM-DD'. */
export function getMondayOfWeek(dateStr) {
  const d = parseDate(dateStr);
  const dow = d.getDay(); // 0 = Sun
  const back = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - back);
  return formatDate(d);
}
