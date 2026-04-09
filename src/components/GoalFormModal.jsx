import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // Mon=1…Sat=6, Sun=0 (JS getDay())

const EMOJIS = [
  '🏃','🏋️','🚴','🧘','🤸','💪','🥗','🥤','💊','😴',
  '⚽','🏀','🏊','🎾','⛷️','🏄','🥊','🏈','🎱','🏆',
  '🎤','🎧','🎼','🎹','🎸','🥁','🎷','🎺','🎵','🎶',
  '📚','✍️','💻','🎯','📝','📖','🎓','✏️','🔬','🧠',
  '🎨','📷','🎬','🖌️','🎭','🎉','💡','⭐','🔥','🚀',
  '✅','💎','🌟','📌','🌱','🏠','☕','💰','🐾','❤️',
  '🌅','🍳','🧹','🌿','🤝','💬','🎁','🍎','🧗','🎲',
];

export default function GoalFormModal({ goal, onSave, onDelete, onClose }) {
  const isEditing = !!goal;

  const [emoji, setEmoji] = useState(goal?.emoji || '📌');
  const [name, setName] = useState(goal?.name || '');
  const [color, setColor] = useState(goal?.color || '#00ff88');
  const [hasTarget, setHasTarget] = useState(goal?.target != null);
  const [targetStr, setTargetStr] = useState(goal?.target != null ? String(goal.target) : '7');
  const [specificDays, setSpecificDays] = useState(!!goal?.days);
  const [days, setDays] = useState(goal?.days || []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  function toggleDay(val) {
    setDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  }

  function handleSave() {
    if (!name.trim()) return;
    const target = hasTarget && targetStr ? parseInt(targetStr, 10) : null;
    onSave({
      emoji,
      name: name.trim(),
      color,
      target,
      period: target ? 'week' : null,
      days: hasTarget && specificDays && days.length > 0 ? [...days].sort() : null,
    });
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
        {/* Header — always visible */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <h2 className="font-mono text-sm font-bold text-text-primary tracking-widest">
            {isEditing ? 'EDIT GOAL' : 'NEW GOAL'}
          </h2>
          <button onClick={onClose} className="p-1 text-text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form content */}
        <div className="overflow-y-auto flex-1 px-5">

          {/* Emoji button + Name + Color */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="w-14 h-12 rounded-xl text-2xl flex items-center justify-center bg-surface border border-border flex-shrink-0 transition-colors"
              style={{ borderColor: showPicker ? color + '88' : color + '33' }}
            >
              <span style={{ filter: 'grayscale(1)' }}>{emoji}</span>
            </button>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name"
              className="flex-1 h-12 rounded-xl px-4 font-mono text-sm text-text-primary placeholder-text-muted bg-surface border border-border focus:outline-none"
              style={{ borderColor: color + '55' }}
            />
            <label className="relative cursor-pointer flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl border-2 border-border"
                style={{ background: color, boxShadow: `0 0 12px ${color}55` }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>

          {/* Emoji picker grid */}
          {showPicker && (
            <div className="mb-3 rounded-xl bg-surface border border-border p-2"
              style={{ borderColor: color + '33' }}
            >
              <div className="grid grid-cols-10 gap-0.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setShowPicker(false); }}
                    className="text-xl p-1.5 rounded-lg transition-colors flex items-center justify-center"
                    style={{ background: e === emoji ? color + '22' : undefined }}
                  >
                    <span style={{ filter: 'grayscale(1)' }}>{e}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target toggle */}
          <button
            onClick={() => setHasTarget((v) => !v)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-surface border border-border mb-2"
          >
            <div
              className="w-9 h-5 rounded-full relative flex-shrink-0 transition-colors"
              style={{ background: hasTarget ? color : '#2a2a3a' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: hasTarget ? 'calc(100% - 18px)' : '2px' }}
              />
            </div>
            <span className="font-mono text-xs text-text-muted">Fixed target per week</span>
            {hasTarget && (
              <div className="ml-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={targetStr}
                  onChange={(e) => setTargetStr(e.target.value)}
                  min={1}
                  max={7}
                  className="w-12 h-7 rounded-lg text-center font-mono text-sm bg-surface-2 border border-border text-text-primary focus:outline-none"
                  style={{ borderColor: color + '55' }}
                />
                <span className="font-mono text-xs text-text-muted">× / wk</span>
              </div>
            )}
          </button>

          {/* Specific days (only when target is set) */}
          {hasTarget && (
            <div className="mb-4">
              <button
                onClick={() => setSpecificDays((v) => !v)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-surface border border-border mb-2"
              >
                <div
                  className="w-9 h-5 rounded-full relative flex-shrink-0 transition-colors"
                  style={{ background: specificDays ? color : '#2a2a3a' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: specificDays ? 'calc(100% - 18px)' : '2px' }}
                  />
                </div>
                <span className="font-mono text-xs text-text-muted">Specific days only</span>
              </button>
              {specificDays && (
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, i) => {
                    const val = DAY_VALUES[i];
                    const active = days.includes(val);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleDay(val)}
                        className="flex-1 py-2 rounded-lg font-mono text-[10px] tracking-wider transition-all"
                        style={{
                          color: active ? '#0a0a0f' : '#6b6b8a',
                          background: active ? color : '#1a1a26',
                          boxShadow: active ? `0 0 8px ${color}55` : 'none',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>{/* end scrollable */}

        {/* Actions — always visible at bottom */}
        <div className="flex gap-2 px-5 py-5 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl font-mono text-sm font-bold transition-all"
            style={{
              background: name.trim() ? color : '#2a2a3a',
              color: name.trim() ? '#0a0a0f' : '#6b6b8a',
              boxShadow: name.trim() ? `0 0 14px ${color}55` : 'none',
            }}
          >
            {isEditing ? 'Save changes' : 'Add goal'}
          </button>
          {isEditing && (
            confirmDelete ? (
              <button
                onClick={() => onDelete(goal.id)}
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
