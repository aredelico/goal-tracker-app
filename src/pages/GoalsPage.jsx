import { useState, useEffect } from 'react';
import { Plus, PencilLine, ChevronDown, ChevronUp } from 'lucide-react';
import { useGoals } from '../GoalsContext';
import { useAuth } from '../AuthContext';
import { getAllEntries, saveEntry, removeEntry } from '../db';
import GoalFormModal from '../components/GoalFormModal';
import GoalEntryModal from '../components/GoalEntryModal';
import Toast from '../components/Toast';

function fmtDate(dateStr) {
  // Parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GoalsPage() {
  const { goals: allGoals, addGoal, updateGoal, deleteGoal } = useGoals();
  const goals = allGoals.filter((g) => g.tab === 'goals');
  const { user } = useAuth();

  const [entries, setEntries] = useState({});   // { goalId: Entry[] sorted desc }
  const [expandedId, setExpandedId] = useState(null);
  const [goalModal, setGoalModal] = useState(null);   // null | 'new' | goal obj
  const [entryModal, setEntryModal] = useState(null); // null | { goalId, entry? }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getAllEntries(user.uid).then((rows) => {
      const grouped = {};
      rows.forEach((e) => {
        if (!grouped[e.goalId]) grouped[e.goalId] = [];
        grouped[e.goalId].push(e);
      });
      Object.values(grouped).forEach((list) =>
        list.sort((a, b) => b.date.localeCompare(a.date))
      );
      setEntries(grouped);
    });
  }, [user.uid]);

  function showToast(msg, color = '#ff4466') {
    setToast({ message: msg, color });
    setTimeout(() => setToast(null), 2000);
  }

  async function handleSaveGoal(data) {
    try {
      if (goalModal === 'new') {
        await addGoal({ ...data, tab: 'goals' });
      } else {
        await updateGoal(goalModal.id, data);
      }
      setGoalModal(null);
    } catch {
      showToast('Failed to save goal');
    }
  }

  async function handleDeleteGoal(goalId) {
    await deleteGoal(goalId);
    setGoalModal(null);
  }

  async function handleSaveEntry(data) {
    const { goalId, entry } = entryModal;
    const id = entry?.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const newEntry = { id, goalId, ...data };
    try {
      await saveEntry(user.uid, newEntry);
      setEntries((prev) => {
        const list = (prev[goalId] || []).filter((e) => e.id !== id);
        return {
          ...prev,
          [goalId]: [...list, newEntry].sort((a, b) => b.date.localeCompare(a.date)),
        };
      });
      setEntryModal(null);
    } catch {
      showToast('Failed to save entry');
    }
  }

  async function handleDeleteEntry(entryId) {
    const { goalId } = entryModal;
    await removeEntry(user.uid, entryId);
    setEntries((prev) => ({
      ...prev,
      [goalId]: (prev[goalId] || []).filter((e) => e.id !== entryId),
    }));
    setEntryModal(null);
  }

  return (
    <>
      <Toast toast={toast} />

      <div className="p-4 max-w-lg mx-auto">
        <header className="pt-2 mb-4 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">GOALS</h1>
          <button
            onClick={() => setGoalModal('new')}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label="Add goal"
          >
            <Plus size={16} className="text-text-muted" />
          </button>
        </header>

        <div className="space-y-3">
          {goals.length === 0 && (
            <p className="font-mono text-xs text-text-muted text-center py-12">
              No goals yet. Tap + to add one.
            </p>
          )}

          {goals.map((goal) => {
            const goalEntries = entries[goal.id] || [];
            const isExpanded = expandedId === goal.id;

            return (
              <div
                key={goal.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(18,18,26,0.8)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderTop: '1px solid rgba(42,42,58,0.8)',
                  borderRight: '1px solid rgba(42,42,58,0.8)',
                  borderBottom: '1px solid rgba(42,42,58,0.8)',
                  borderLeft: `3px solid ${goal.color}`,
                }}
              >
                {/* Goal header */}
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl select-none" style={{ filter: 'grayscale(1)' }}>
                    {goal.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium" style={{ color: goal.color }}>
                      {goal.name}
                    </p>
                    <p className="font-mono text-xs text-text-muted mt-0.5">
                      {goalEntries.length} {goalEntries.length === 1 ? 'entry' : 'entries'}
                      {goalEntries.length > 0 && (
                        <> · last {fmtDate(goalEntries[0].date)}</>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => setGoalModal(goal)}
                    className="p-1.5 text-text-muted opacity-30 hover:opacity-70 active:opacity-70 transition-opacity"
                    aria-label="Edit goal"
                  >
                    <PencilLine size={13} />
                  </button>
                  <button
                    onClick={() => setEntryModal({ goalId: goal.id })}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: goal.color }}
                    aria-label="Add entry"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                    className="p-1.5 text-text-muted opacity-50 hover:opacity-80 transition-opacity"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Entries list */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {goalEntries.length === 0 ? (
                      <p className="px-4 py-4 font-mono text-xs text-text-muted">
                        No entries yet — tap + to log one.
                      </p>
                    ) : (
                      goalEntries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setEntryModal({ goalId: goal.id, entry })}
                          className="w-full flex gap-4 px-4 py-3 border-b border-border last:border-b-0 text-left hover:bg-surface-2 active:bg-surface-2 transition-colors"
                        >
                          <span
                            className="font-mono text-xs flex-shrink-0 pt-0.5 tabular-nums"
                            style={{ color: goal.color }}
                          >
                            {fmtDate(entry.date)}
                          </span>
                          <div className="min-w-0">
                            {entry.title ? (
                              <p className="font-mono text-sm text-text-primary truncate">
                                {entry.title}
                              </p>
                            ) : null}
                            {entry.notes ? (
                              <p className="font-mono text-xs text-text-muted truncate mt-0.5">
                                {entry.notes}
                              </p>
                            ) : null}
                            {!entry.title && !entry.notes && (
                              <p className="font-mono text-xs text-text-muted italic">No details</p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {goalModal !== null && (
        <GoalFormModal
          goal={goalModal === 'new' ? null : goalModal}
          simpleMode
          onSave={handleSaveGoal}
          onDelete={handleDeleteGoal}
          onClose={() => setGoalModal(null)}
        />
      )}

      {entryModal !== null && (
        <GoalEntryModal
          entry={entryModal.entry || null}
          goalColor={allGoals.find((g) => g.id === entryModal.goalId)?.color}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onClose={() => setEntryModal(null)}
        />
      )}
    </>
  );
}
