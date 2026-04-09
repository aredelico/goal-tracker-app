import { useState, useEffect } from 'react';
import { Check, PencilLine } from 'lucide-react';

export default function GoalCard({ goal, checkin, streak, onToggle, onSaveNotes, onEdit }) {
  const checked = !!checkin?.done;
  const [notes, setNotes] = useState(checkin?.notes || '');

  // Sync notes when date changes or checkin loads from DB
  useEffect(() => {
    setNotes(checkin?.notes || '');
  }, [checkin]);

  return (
    <div
      className="rounded-xl overflow-hidden transition-opacity duration-200"
      style={{
        background: 'rgba(18, 18, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(42, 42, 58, 0.8)',
        borderRight: '1px solid rgba(42, 42, 58, 0.8)',
        borderBottom: '1px solid rgba(42, 42, 58, 0.8)',
        borderLeft: `3px solid ${checked ? goal.color : goal.color + '55'}`,
        transition: 'border-left-color 0.2s',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <span className="text-2xl select-none" style={{ filter: 'grayscale(1)' }}>{goal.emoji}</span>

        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-sm font-medium tracking-wide"
            style={{ color: checked ? goal.color : goal.color + 'cc' }}
          >
            {goal.name}
          </p>

          <p className="font-mono text-xs text-text-muted mt-0.5 h-4">
            {streak > 0 ? (
              <span>🔥 {streak} day{streak !== 1 ? 's' : ''}</span>
            ) : (
              goal.target && (
                <span className="opacity-40">{goal.target}× / week</span>
              )
            )}
          </p>
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 flex-shrink-0 text-text-muted opacity-30 hover:opacity-70 active:opacity-70 transition-opacity"
            aria-label="Edit goal"
          >
            <PencilLine size={13} />
          </button>
        )}

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-200 active:scale-90"
          style={{
            borderColor: checked ? goal.color : `${goal.color}55`,
            backgroundColor: checked ? goal.color : 'transparent',
            boxShadow: checked ? `0 0 14px ${goal.color}88` : 'none',
          }}
          aria-label={checked ? 'Uncheck' : 'Check in'}
        >
          {checked && <Check size={16} color="#0a0a0f" strokeWidth={3} />}
        </button>
      </div>

      {/* Notes section — only for goals with hasNotes, shown when checked */}
      {goal.hasNotes && checked && (
        <div className="px-4 pb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onSaveNotes(notes)}
            placeholder="Venue, event name, notes…"
            rows={2}
            className="w-full rounded-lg p-3 font-mono text-xs text-text-primary placeholder-text-muted resize-none focus:outline-none transition-colors"
            style={{
              background: 'rgba(26, 26, 38, 0.9)',
              border: `1px solid ${goal.color}44`,
            }}
          />
        </div>
      )}
    </div>
  );
}
