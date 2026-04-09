import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { today } from '../utils/dates';

export default function GoalEntryModal({ entry, goalColor = '#00ff88', onSave, onDelete, onClose }) {
  const isEditing = !!entry;
  const color = goalColor;

  const [date, setDate] = useState(entry?.date || today());
  const [title, setTitle] = useState(entry?.title || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    if (!date) return;
    onSave({ date, title: title.trim(), notes: notes.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-t-2xl w-full flex flex-col"
        style={{ background: '#12121a', borderTop: '1px solid #2a2a3a', maxHeight: '88dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <h2 className="font-mono text-sm font-bold text-text-primary tracking-widest">
            {isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}
          </h2>
          <button onClick={onClose} className="p-1 text-text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-5 space-y-3 pb-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 rounded-xl px-4 font-mono text-sm text-text-primary bg-surface border border-border focus:outline-none"
            style={{ colorScheme: 'dark', borderColor: color + '55' }}
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Venue, event, milestone…"
            className="w-full h-12 rounded-xl px-4 font-mono text-sm text-text-primary placeholder-text-muted bg-surface border border-border focus:outline-none"
            style={{ borderColor: color + '55' }}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes…"
            rows={4}
            className="w-full rounded-xl px-4 py-3 font-mono text-sm text-text-primary placeholder-text-muted bg-surface border border-border focus:outline-none resize-none"
            style={{ borderColor: color + '55' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-5 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={!date}
            className="flex-1 py-3 rounded-xl font-mono text-sm font-bold transition-all"
            style={{
              background: date ? color : '#2a2a3a',
              color: date ? '#0a0a0f' : '#6b6b8a',
              boxShadow: date ? `0 0 14px ${color}55` : 'none',
            }}
          >
            {isEditing ? 'Save changes' : 'Add entry'}
          </button>
          {isEditing && (
            confirmDelete ? (
              <button
                onClick={() => onDelete(entry.id)}
                className="px-4 py-3 rounded-xl font-mono text-xs font-bold text-neon-pink border border-neon-pink/40 bg-neon-pink/10"
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-3 rounded-xl border border-border hover:bg-surface-2 transition-colors"
              >
                <Trash2 size={16} className="text-text-muted" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
