import { useState, useEffect, useCallback } from 'react';
import { db, getAllCheckinsForDate, toggleCheckin, saveCheckinWithNotes } from '../db';
import { GOALS } from '../goals';
import { computeStreak, computeBestStreak } from '../utils/streak';
import { formatDate, parseDate } from '../utils/dates';

export function useGoalData(date) {
  const [checkins, setCheckins] = useState({});
  const [streaks, setStreaks] = useState({});
  const [bestStreaks, setBestStreaks] = useState({});
  const [historicalSets, setHistoricalSets] = useState({});

  useEffect(() => {
    getAllCheckinsForDate(date).then((rows) => {
      const map = {};
      rows.forEach((r) => { map[r.goalId] = r; });
      setCheckins(map);
    });
  }, [date]);

  useEffect(() => {
    const from = formatDate(
      new Date(parseDate(date).setFullYear(parseDate(date).getFullYear() - 1))
    );
    db.checkins
      .where('date').between(from, date, true, true)
      .toArray()
      .then((rows) => {
        const sets = {};
        rows.forEach(({ goalId, date: d }) => {
          if (!sets[goalId]) sets[goalId] = new Set();
          sets[goalId].add(d);
        });
        setHistoricalSets(sets);
      });
  }, [date]);

  useEffect(() => {
    const streakResult = {};
    const bestResult = {};
    GOALS.forEach((g) => {
      const set = new Set(historicalSets[g.id] || []);
      if (checkins[g.id]?.done) set.add(date);
      else set.delete(date);
      streakResult[g.id] = computeStreak(g.days, set, date);
      bestResult[g.id] = computeBestStreak(g.days, set);
    });
    setStreaks(streakResult);
    setBestStreaks(bestResult);
  }, [historicalSets, checkins, date]);

  const toggle = useCallback(
    async (goalId) => {
      const done = await toggleCheckin(goalId, date);
      setCheckins((prev) => {
        const next = { ...prev };
        if (done) next[goalId] = { done: true, notes: '' };
        else delete next[goalId];
        return next;
      });
      return done;
    },
    [date]
  );

  const saveNotes = useCallback(
    async (goalId, notes) => {
      await saveCheckinWithNotes(goalId, date, notes);
      setCheckins((prev) => ({
        ...prev,
        [goalId]: { ...prev[goalId], done: true, notes },
      }));
    },
    [date]
  );

  return { checkins, streaks, bestStreaks, toggle, saveNotes };
}
