import { formatDate, parseDate, today } from './dates';

/**
 * Compute the current streak for a goal.
 *
 * @param {number[]|null} goalDays  - active days of the week (0=Sun). null = all days.
 * @param {Set<string>}   checkinSet - Set of 'YYYY-MM-DD' strings where goal was done.
 * @param {string}        upToDate  - 'YYYY-MM-DD' upper bound.
 * @returns {number} streak count
 *
 * Rules:
 *  - If upToDate is today and today is not yet checked in, start from yesterday
 *    (streak hasn't broken yet — gives user until midnight).
 *  - Non-active days (e.g. weekends for Piano) are skipped without breaking the streak.
 */
export function computeStreak(goalDays, checkinSet, upToDate) {
  const cursor = parseDate(upToDate);

  // Grace period: if looking at today and it's not done yet, start from yesterday
  if (upToDate === today() && !checkinSet.has(upToDate)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(cursor);
    const isActiveDay = !goalDays || goalDays.includes(cursor.getDay());

    if (isActiveDay) {
      if (checkinSet.has(dateStr)) {
        streak++;
      } else {
        break; // active day with no check-in → streak broken
      }
    }
    // Non-active days: skip silently

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Compute the all-time best streak for a goal by checking each checked-in date.
 * O(n × max_streak), fine for ≤365 entries.
 */
export function computeBestStreak(goalDays, checkinSet) {
  let best = 0;
  for (const date of checkinSet) {
    const s = computeStreak(goalDays, checkinSet, date);
    if (s > best) best = s;
  }
  return best;
}
