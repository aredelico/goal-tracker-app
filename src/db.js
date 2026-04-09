import {
  doc, getDoc, setDoc, deleteDoc, getDocs,
  collection, query, where, writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';

// ── Checkins ───────────────────────────────────────────────────────────────
// Firestore path: users/{uid}/checkins/{goalId_date}
// Document IDs are deterministic (goalId + date) so we can get/delete by ID directly.

function checkinRef(uid, goalId, date) {
  return doc(firestore, 'users', uid, 'checkins', `${goalId}_${date}`);
}

function checkinsCol(uid) {
  return collection(firestore, 'users', uid, 'checkins');
}

/** Get a single check-in for a goal on a given date. */
export async function getCheckin(uid, goalId, date) {
  const snap = await getDoc(checkinRef(uid, goalId, date));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Toggle a check-in. Creates if absent, removes if present.
 *  Returns the new done state (true = just checked in, false = removed). */
export async function toggleCheckin(uid, goalId, date) {
  const ref = checkinRef(uid, goalId, date);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { goalId, date, done: true, notes: '' });
  return true;
}

/** Upsert a check-in with notes (for gig-type goals). */
export async function saveCheckinWithNotes(uid, goalId, date, notes) {
  await setDoc(
    checkinRef(uid, goalId, date),
    { goalId, date, done: true, notes },
    { merge: true }
  );
}

/** Get all check-ins for a specific date (all goals). */
export async function getAllCheckinsForDate(uid, date) {
  const q = query(checkinsCol(uid), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/** Get all check-ins between two dates inclusive ('YYYY-MM-DD'). */
export async function getCheckinsInRange(uid, fromDate, toDate) {
  const q = query(
    checkinsCol(uid),
    where('date', '>=', fromDate),
    where('date', '<=', toDate)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/** Export all data as JSON string. */
export async function exportData(uid) {
  const snap = await getDocs(checkinsCol(uid));
  const checkins = snap.docs.map((d) => d.data());
  return JSON.stringify({ version: 1, checkins }, null, 2);
}

/** Import data from JSON string. Clears existing data first. */
export async function importData(uid, json) {
  const { checkins } = JSON.parse(json);
  const existing = await getDocs(checkinsCol(uid));
  const batch = writeBatch(firestore);
  existing.docs.forEach((d) => batch.delete(d.ref));
  checkins.forEach(({ goalId, date, done, notes }) => {
    batch.set(doc(checkinsCol(uid), `${goalId}_${date}`), {
      goalId, date, done: done ?? true, notes: notes ?? '',
    });
  });
  await batch.commit();
}

/** Delete all check-ins for the user. */
export async function clearData(uid) {
  const snap = await getDocs(checkinsCol(uid));
  const batch = writeBatch(firestore);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ── Goals ──────────────────────────────────────────────────────────────────
// Firestore path: users/{uid}/goals/{goalId}

function goalsCol(uid) {
  return collection(firestore, 'users', uid, 'goals');
}

function goalDocRef(uid, goalId) {
  return doc(firestore, 'users', uid, 'goals', goalId);
}

/** Fetch all goals for a user, sorted by order. */
export async function getGoals(uid) {
  const snap = await getDocs(goalsCol(uid));
  return snap.docs.map((d) => d.data()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Create or update a single goal document. */
export async function saveGoal(uid, goal) {
  await setDoc(goalDocRef(uid, goal.id), goal);
}

/** Delete a goal document. */
export async function removeGoal(uid, goalId) {
  await deleteDoc(goalDocRef(uid, goalId));
}

/** Seed goals from hardcoded defaults. Only call when user has no goals yet. */
export async function seedGoals(uid, goals) {
  const batch = writeBatch(firestore);
  goals.forEach((g, i) => {
    batch.set(goalDocRef(uid, g.id), { ...g, order: i, tab: 'routine' });
  });
  await batch.commit();
}
