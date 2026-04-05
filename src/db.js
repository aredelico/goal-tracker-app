import Dexie from 'dexie';

export const db = new Dexie('GoalTrackerDB');

db.version(1).stores({
  // Compound index [goalId+date] for fast single-day lookups per goal
  // date stored as 'YYYY-MM-DD' string
  // notes: optional string (only used by dj-gigs)
  checkins: '++id, [goalId+date], goalId, date',
});

// Helpers

/** Get a single check-in for a goal on a given date. */
export async function getCheckin(goalId, date) {
  return db.checkins.where('[goalId+date]').equals([goalId, date]).first();
}

/** Toggle a check-in. Creates if absent, removes if present.
 *  Returns the new done state (true = just checked in, false = removed). */
export async function toggleCheckin(goalId, date) {
  const existing = await getCheckin(goalId, date);
  if (existing) {
    await db.checkins.delete(existing.id);
    return false;
  } else {
    await db.checkins.add({ goalId, date, done: true, notes: '' });
    return true;
  }
}

/** Upsert a check-in with notes (for dj-gigs). */
export async function saveCheckinWithNotes(goalId, date, notes) {
  const existing = await getCheckin(goalId, date);
  if (existing) {
    await db.checkins.update(existing.id, { done: true, notes });
  } else {
    await db.checkins.add({ goalId, date, done: true, notes });
  }
}

/** Get all check-ins for a goal between two dates (inclusive, 'YYYY-MM-DD'). */
export async function getCheckinsInRange(goalId, fromDate, toDate) {
  return db.checkins
    .where('goalId').equals(goalId)
    .and((c) => c.date >= fromDate && c.date <= toDate)
    .toArray();
}

/** Get all check-ins for a specific date (all goals). */
export async function getAllCheckinsForDate(date) {
  return db.checkins.where('date').equals(date).toArray();
}

/** Export all data as JSON string. */
export async function exportData() {
  const checkins = await db.checkins.toArray();
  return JSON.stringify({ version: 1, checkins }, null, 2);
}

/** Import data from JSON string. Clears existing data first. */
export async function importData(json) {
  const { checkins } = JSON.parse(json);
  await db.checkins.clear();
  await db.checkins.bulkAdd(checkins.map(({ goalId, date, done, notes }) => ({
    goalId, date, done, notes,
  })));
}
