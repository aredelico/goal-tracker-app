import { useState } from 'react';
import { Plus } from 'lucide-react';
import { today } from '../utils/dates';
import { useGoalData } from '../hooks/useGoalData';
import { useGoals } from '../GoalsContext';
import DayNav from '../components/DayNav';
import GoalCard from '../components/GoalCard';
import Toast from '../components/Toast';
import GoalFormModal from '../components/GoalFormModal';

export default function TodayPage() {
  const { goals: allGoals, addGoal, updateGoal, deleteGoal } = useGoals();
  const goals = allGoals.filter((g) => !g.tab || g.tab === 'routine');
  const [date, setDate] = useState(today);
  const { checkins, streaks, toggle, saveNotes } = useGoalData(date, goals);
  const [toast, setToast] = useState(null);
  const [modalGoal, setModalGoal] = useState(null); // null=closed, 'new'=add, goal obj=edit

  function showToast(message, color) {
    setToast({ message, color });
    setTimeout(() => setToast(null), 2000);
  }

  async function handleToggle(goal) {
    const done = await toggle(goal.id);
    showToast(
      done ? `✓ ${goal.name}` : `✗ ${goal.name} removed`,
      goal.color
    );
  }

  async function handleSave(data) {
    try {
      if (modalGoal === 'new') {
        await addGoal({ ...data, tab: 'routine' });
      } else {
        await updateGoal(modalGoal.id, data);
      }
      setModalGoal(null);
    } catch (err) {
      console.error('Failed to save goal:', err);
      showToast('Failed to save goal', '#ff4466');
    }
  }

  async function handleDelete(goalId) {
    await deleteGoal(goalId);
    setModalGoal(null);
  }

  const doneCount = goals.filter((g) => checkins[g.id]?.done).length;

  return (
    <>
      <Toast toast={toast} />

      <div className="p-4 max-w-lg mx-auto">
        <header className="pt-2 mb-4 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">
            ROUTINE
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalGoal('new')}
              className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              aria-label="Add goal"
            >
              <Plus size={16} className="text-text-muted" />
            </button>
            <span className="font-mono text-xs text-text-muted tracking-wider">
              {doneCount}/{goals.length} done
            </span>
          </div>
        </header>

        <DayNav date={date} onChange={setDate} />

        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              checkin={checkins[goal.id]}
              streak={streaks[goal.id] ?? 0}
              onToggle={() => handleToggle(goal)}
              onSaveNotes={(notes) => saveNotes(goal.id, notes)}
              onEdit={() => setModalGoal(goal)}
            />
          ))}
        </div>
      </div>

      {modalGoal !== null && (
        <GoalFormModal
          goal={modalGoal === 'new' ? null : modalGoal}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalGoal(null)}
        />
      )}
    </>
  );
}
