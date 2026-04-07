import { useState } from 'react';
import { Download, Upload, Trash2, Info, LogOut } from 'lucide-react';
import { exportData, importData, clearData } from '../db';
import { useAuth } from '../AuthContext';
import { today } from '../utils/dates';

export default function SettingsPage() {
  const { user, logOut } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState(null); // { text, color }

  function flash(text, color = '#00ff88') {
    setMessage({ text, color });
    setTimeout(() => setMessage(null), 2500);
  }

  async function handleExport() {
    try {
      const json = await exportData(user.uid);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goal-tracker-${today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash('✓ Exported successfully');
    } catch {
      flash('✗ Export failed', '#ff2d78');
    }
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await importData(user.uid, ev.target.result);
        flash('✓ Data imported');
      } catch {
        flash('✗ Invalid or corrupt file', '#ff2d78');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleClear() {
    await clearData(user.uid);
    setConfirmClear(false);
    flash('All data cleared', '#ff2d78');
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <header className="pt-2 mb-6">
        <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">SETTINGS</h1>
      </header>

      {/* Inline flash message */}
      {message && (
        <div
          className="mb-4 px-4 py-2 rounded-lg font-mono text-sm text-center transition-all"
          style={{
            color: message.color,
            background: message.color + '1a',
            border: `1px solid ${message.color}44`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Data section */}
      <div className="glass rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border">
          <p className="font-mono text-[10px] text-text-muted tracking-widest">DATA</p>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-4 px-4 py-4 border-b border-border hover:bg-surface-2 transition-colors text-left"
        >
          <Download size={16} className="text-neon-green flex-shrink-0" />
          <div>
            <p className="font-mono text-sm text-text-primary">Export data</p>
            <p className="font-mono text-xs text-text-muted mt-0.5">Download all check-ins as JSON</p>
          </div>
        </button>

        {/* Import */}
        <label className="w-full flex items-center gap-4 px-4 py-4 border-b border-border hover:bg-surface-2 transition-colors cursor-pointer">
          <Upload size={16} className="text-neon-cyan flex-shrink-0" />
          <div>
            <p className="font-mono text-sm text-text-primary">Import data</p>
            <p className="font-mono text-xs text-text-muted mt-0.5">Restore from a JSON backup</p>
          </div>
          <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        </label>

        {/* Clear */}
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-surface-2 transition-colors text-left"
          >
            <Trash2 size={16} className="text-neon-pink flex-shrink-0" />
            <div>
              <p className="font-mono text-sm text-neon-pink">Clear all data</p>
              <p className="font-mono text-xs text-text-muted mt-0.5">Delete every check-in permanently</p>
            </div>
          </button>
        ) : (
          <div className="px-4 py-4 bg-neon-pink/5">
            <p className="font-mono text-xs text-neon-pink mb-3">
              This will delete all check-ins and cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-lg font-mono text-xs text-neon-pink border border-neon-pink/40 bg-neon-pink/10 hover:bg-neon-pink/20 transition-colors"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2 rounded-lg font-mono text-xs text-text-muted border border-border hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="glass rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border">
          <p className="font-mono text-[10px] text-text-muted tracking-widest">ACCOUNT</p>
        </div>
        <div className="px-4 py-4 border-b border-border">
          <p className="font-mono text-xs text-text-muted">Signed in as</p>
          <p className="font-mono text-sm text-text-primary mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={logOut}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-surface-2 transition-colors text-left"
        >
          <LogOut size={16} className="text-text-muted flex-shrink-0" />
          <p className="font-mono text-sm text-text-primary">Sign out</p>
        </button>
      </div>

      {/* About */}
      <div className="glass rounded-xl p-4 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={13} className="text-text-muted" />
          <p className="font-mono text-[10px] text-text-muted tracking-widest">ABOUT</p>
        </div>
        <p className="font-mono text-xs text-text-muted">Goal Tracker v0.2.0</p>
        <p className="font-mono text-xs text-text-muted">Dark Terminal Meets Vinyl</p>
        <p className="font-mono text-xs text-text-muted">Data synced to Firebase · Accessible from any device</p>
      </div>
    </div>
  );
}
