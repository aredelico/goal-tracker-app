import { useState, useEffect, useCallback } from 'react';
import { getAllCheckinsForDate, toggleCheckin, saveCheckinWithNotes, getCheckinsInRange } from '../db';
import { useAuth } from '../AuthContext';
import { GOALS } from '../goals';
import { computeStreak, computeBestStreak } from '../utils/streak';
import { formatDate, parseDate } from '../utils/dates';

export function useGoalData(date) {
  const { user } = useAuth();
  const uid = user.uid;

  const [checkins, setCheckins] = useState({});
  const [streaks, setStreaks] = useState({});
  const [bestStreaks, setBestStreaks] = useState({});
  const [historicalSets, setHistoricalSets] = useState({});

  useEffect(() => {
    getAllCheckinsForDate(uid, date).then((rows) => {
      const map = {};
      rows.forEach((r) => { map[r.goalId] = r; });
      setCheckins(map);
    });
  }, [uid, date]);

  useEffect(() => {
    const from = formatDate(
      new Date(parseDate(date).setFullYear(parseDate(date).getFullYear() - 1))
    );
    getCheckinsInRange(uid, from, date).then((rows) => {
      const sets = {};
      rows.forEach(({ goalId, date: d }) => {
        if (!sets[goalId]) sets[goalId] = new Set();
        sets[goalId].add(d);
      });
      setHistoricalSets(sets);
    });
  }, [uid, date]);

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
      const done = await toggleCheckin(uid, goalId, date);
      setCheckins((prev) => {
        const next = { ...prev };
        if (done) next[goalId] = { done: true, notes: '' };
        else delete next[goalId];
        return next;
      });
      return done;
    },
    [uid, date]
  );

  const saveNotes = useCallback(
    async (goalId, notes) => {
      await saveCheckinWithNotes(uid, goalId, date, notes);
      setCheckins((prev) => ({
        ...prev,
        [goalId]: { ...prev[goalId], done: true, notes },
      }));
    },
    [uid, date]
  );

  return { checkins, streaks, bestStreaks, toggle, saveNotes };
}
