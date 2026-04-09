import { createContext, useContext, useState, useEffect } from 'react';
import { GOALS as DEFAULT_GOALS } from './goals';
import { getGoals, saveGoal, removeGoal as dbRemoveGoal, seedGoals } from './db';
import { useAuth } from './AuthContext';

const GoalsContext = createContext(null);

const PALETTE = ['#00ff88', '#00cfff', '#ff6b6b', '#ffa94d', '#cc5de8', '#74c0fc', '#63e6be', '#ff922b'];

export function GoalsProvider({ children }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      let rows = await getGoals(user.uid);
      if (rows.length === 0) {
        await seedGoals(user.uid, DEFAULT_GOALS);
        rows = await getGoals(user.uid);
      }
      setGoals(rows);
      setLoading(false);
    })();
  }, [user]);

  async function addGoal(data) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const goal = {
      id,
      name: data.name,
      emoji: data.emoji || '📌',
      color: data.color || PALETTE[goals.length % PALETTE.length],
      target: data.target || null,
      period: data.target ? 'week' : null,
      days: data.days || null,
      hasNotes: false,
      tab: 'routine',
      order: goals.length,
    };
    await saveGoal(user.uid, goal);
    setGoals((prev) => [...prev, goal]);
  }

  async function updateGoal(goalId, updates) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updated = { ...goal, ...updates };
    await saveGoal(user.uid, updated);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
  }

  async function deleteGoal(goalId) {
    await dbRemoveGoal(user.uid, goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  return (
    <GoalsContext.Provider value={{ goals, loading, addGoal, updateGoal, deleteGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  return useContext(GoalsContext);
}
