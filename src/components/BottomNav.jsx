import { Home, Calendar, BarChart2, Settings } from 'lucide-react';

const TABS = [
  { id: 'today',    label: 'Today',    Icon: Home },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  { id: 'stats',    label: 'Stats',    Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-150 active:opacity-70"
            >
              <Icon
                size={20}
                className={isActive ? 'text-neon-green' : 'text-text-muted'}
                style={isActive ? { filter: 'drop-shadow(0 0 6px #00ff88)' } : undefined}
              />
              <span
                className={`font-mono text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                  isActive ? 'text-neon-green' : 'text-text-muted'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
