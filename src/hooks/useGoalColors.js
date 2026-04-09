import { useState, useCallback } from 'react';
import { GOALS } from '../goals';

const LS_KEY = 'goal-color-overrides';

function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

export function useGoalColors() {
  const [overrides, setOverrides] = useState(loadOverrides);

  const setColor = useCallback((goalId, color) => {
    setOverrides((prev) => {
      const next = { ...prev, [goalId]: color };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const goals = GOALS.map((g) => ({
    ...g,
    color: overrides[g.id] ?? g.color,
  }));

  return { goals, setColor };
}
