import { useState, useEffect, useRef } from 'react';
import { GOALS } from '../goals';
import { db } from '../db';
import { today, addDays, formatDate, parseDate } from '../utils/dates';
import { computeStreak } from '../utils/streak';

const WEEKS = 26;
const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const DAY_W = 20;
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildWeeks() {
  const t = today();
  const d = parseDate(t);
  const back = d.getDay() === 0 ? 6 : d.getDay() - 1; // days back to Monday
  const mon0 = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);

  return Array.from({ length: WEEKS }, (_, wi) => {
    const weekOffset = WEEKS - 1 - wi; // 0 = current week, going back from right
    return Array.from({ length: 7 }, (_, di) => {
      const day = new Date(mon0.getFullYear(), mon0.getMonth(), mon0.getDate() - weekOffset * 7 + di);
      const ds = formatDate(day);
      return ds <= t ? ds : null;
    });
  });
}

function buildMonthLabels(weeks) {
  const seen = new Set();
  return weeks.reduce((acc, week, col) => {
    const first = week.find(Boolean);
    if (!first) return acc;
    const key = first.slice(0, 7);
    if (!seen.has(key)) {
      seen.add(key);
      acc.push({
        col,
        text: parseDate(first).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      });
    }
    return acc;
  }, []);
}

function cellBg(dateStr, goal, set) {
  if (!dateStr) return 'transparent';
  const dow = parseDate(dateStr).getDay();
  const active = !goal.days || goal.days.includes(dow);
  if (!active) return '#ffffff08';
  return set.has(dateStr) ? goal.color : goal.color + '20';
}

export default function CalendarPage() {
  const [goalId, setGoalId] = useState(GOALS[0].id);
  const [checkinSet, setCheckinSet] = useState(new Set());
  const scrollRef = useRef(null);

  const goal = GOALS.find((g) => g.id === goalId);
  const weeks = buildWeeks();
  const monthLabels = buildMonthLabels(weeks);

  useEffect(() => {
    const from = addDays(today(), -(WEEKS * 7));
    db.checkins
      .where('goalId').equals(goalId)
      .and((r) => r.date >= from && r.date <= today())
      .toArray()
      .then((rows) => setCheckinSet(new Set(rows.map((r) => r.date))));
  }, [goalId]);

  // Scroll to the right (most recent week) on mount and goal change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  });

  const thisMonthKey = today().slice(0, 7);
  const thisMonthCount = [...checkinSet].filter((d) => d.startsWith(thisMonthKey)).length;
  const weekStart = addDays(today(), -6);
  const thisWeekCount = [...checkinSet].filter((d) => d >= weekStart).length;
  const streak = computeStreak(goal.days, checkinSet, today());

  return (
    <div className="p-4 max-w-lg mx-auto">
      <header className="pt-2 mb-4">
        <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">CALENDAR</h1>
      </header>

      {/* Goal selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoalId(g.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all"
            style={{
              color: g.color,
              border: `1px solid ${goalId === g.id ? g.color : 'transparent'}`,
              background: goalId === g.id ? g.color + '22' : 'transparent',
              opacity: goalId === g.id ? 1 : 0.4,
              boxShadow: goalId === g.id ? `0 0 10px ${g.color}44` : 'none',
            }}
          >
            {g.emoji} {g.name}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div ref={scrollRef} className="overflow-x-auto pb-2 no-scrollbar">
        <div style={{ width: DAY_W + WEEKS * STEP + GAP, position: 'relative' }}>
          {/* Month labels */}
          <div style={{ height: 14, position: 'relative', marginLeft: DAY_W }}>
            {monthLabels.map(({ col, text }) => (
              <span
                key={text + col}
                className="absolute font-mono text-text-muted"
                style={{ fontSize: 9, left: col * STEP }}
              >
                {text}
              </span>
            ))}
          </div>

          {/* Day labels + cell grid */}
          <div className="flex" style={{ gap: GAP }}>
            <div className="flex flex-col" style={{ gap: GAP, width: DAY_W }}>
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="font-mono text-text-muted flex items-center"
                  style={{ fontSize: 8, height: CELL }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gridTemplateColumns: `repeat(${WEEKS}, ${CELL}px)`,
                gridAutoFlow: 'column',
                gap: GAP,
              }}
            >
              {weeks.flatMap((week, wi) =>
                week.map((dateStr, di) => (
                  <div
                    key={`${wi}-${di}`}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      background: cellBg(dateStr, goal, checkinSet),
                    }}
                    title={dateStr || ''}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-5 glass rounded-xl divide-y divide-border">
        {[
          { label: 'This week', value: thisWeekCount },
          { label: 'This month', value: thisMonthCount },
          { label: 'Total (6 mo)', value: checkinSet.size },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-4 py-3">
            <span className="font-mono text-xs text-text-muted tracking-wider">{label}</span>
            <span className="font-mono text-sm font-bold" style={{ color: goal.color }}>
              {value} check-in{value !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
        {streak > 0 && (
          <div className="flex justify-between items-center px-4 py-3">
            <span className="font-mono text-xs text-text-muted tracking-wider">Current streak</span>
            <span className="font-mono text-sm font-bold" style={{ color: goal.color }}>
              🔥 {streak} day{streak !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
