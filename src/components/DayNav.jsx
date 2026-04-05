import { ChevronLeft, ChevronRight } from 'lucide-react';
import { today, addDays, dayLabel, shortDate } from '../utils/dates';

export default function DayNav({ date, onChange }) {
  const isToday = date === today();

  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => onChange(addDays(date, -1))}
        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex-1 text-center">
        <p className="font-mono text-xs text-text-muted tracking-widest">
          {dayLabel(date)}
        </p>
        <p className="font-mono text-base font-bold text-text-primary tracking-wider">
          {shortDate(date)}
        </p>
        {!isToday && (
          <button
            onClick={() => onChange(today())}
            className="font-mono text-[10px] text-neon-green tracking-wider mt-0.5 hover:opacity-80 transition-opacity"
          >
            → back to today
          </button>
        )}
      </div>

      <button
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday}
        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        aria-label="Next day"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
