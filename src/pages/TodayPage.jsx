import { useState } from 'react';
import { GOALS } from '../goals';
import { today } from '../utils/dates';
import { useGoalData } from '../hooks/useGoalData';
import DayNav from '../components/DayNav';
import GoalCard from '../components/GoalCard';
import Toast from '../components/Toast';

export default function TodayPage() {
  const [date, setDate] = useState(today);
  const { checkins, streaks, toggle, saveNotes } = useGoalData(date);
  const [toast, setToast] = useState(null);

  function showToast(message, color) {
    setToast({ message, color });
    // Clear any existing timer by setting null first is not needed — just overwrite
    setTimeout(() => setToast(null), 2000);
  }

  async function handleToggle(goal) {
    const done = await toggle(goal.id);
    showToast(
      done ? `✓ ${goal.name}` : `✗ ${goal.name} removed`,
      goal.color
    );
  }

  const doneCount = GOALS.filter((g) => checkins[g.id]?.done).length;

  return (
    <>
      <Toast toast={toast} />

      <div className="p-4 max-w-lg mx-auto">
        <header className="pt-2 mb-4 flex items-baseline justify-between">
          <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">
            TODAY
          </h1>
          <span className="font-mono text-xs text-text-muted tracking-wider">
            {doneCount}/{GOALS.length} done
          </span>
        </header>

        <DayNav date={date} onChange={setDate} />

        <div className="space-y-3">
          {GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              checkin={checkins[goal.id]}
              streak={streaks[goal.id] ?? 0}
              onToggle={() => handleToggle(goal)}
              onSaveNotes={(notes) => saveNotes(goal.id, notes)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
