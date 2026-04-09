import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCheckinsInRange } from '../db';
import { useAuth } from '../AuthContext';
import { today, addDays, formatDate, parseDate } from '../utils/dates';
import { computeStreak } from '../utils/streak';
import { useGoals } from '../GoalsContext';

// ── Heatmap constants ──────────────────────────────────────────────────────
const WEEKS = 26;
const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const DAY_W = 20;
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildWeeks() {
  const t = today();
  const d = parseDate(t);
  const back = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const mon0 = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);
  return Array.from({ length: WEEKS }, (_, wi) => {
    const weekOffset = WEEKS - 1 - wi;
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
      acc.push({ col, text: parseDate(first).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() });
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

// ── Macro calendar helpers ─────────────────────────────────────────────────
const MONTH_DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(formatDate(new Date(year, month, d)));
  return cells;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { user } = useAuth();
  const { goals: allGoals } = useGoals();
  const goals = allGoals.filter((g) => !g.tab || g.tab === 'routine');
  const [view, setView] = useState('macro');

  // Macro state
  const nowDate = new Date();
  const [macroYear, setMacroYear] = useState(nowDate.getFullYear());
  const [macroMonth, setMacroMonth] = useState(nowDate.getMonth());
  const [checkinsByDate, setCheckinsByDate] = useState({});

  // Heatmap state
  const [goalId, setGoalId] = useState(goals[0]?.id);
  const [checkinSet, setCheckinSet] = useState(new Set());
  const scrollRef = useRef(null);

  // Load macro data
  useEffect(() => {
    if (view !== 'macro') return;
    const from = formatDate(new Date(macroYear, macroMonth, 1));
    const to = formatDate(new Date(macroYear, macroMonth + 1, 0));
    getCheckinsInRange(user.uid, from, to).then((rows) => {
      const byDate = {};
      rows.forEach((r) => {
        if (!byDate[r.date]) byDate[r.date] = new Set();
        byDate[r.date].add(r.goalId);
      });
      setCheckinsByDate(byDate);
    });
  }, [user.uid, view, macroYear, macroMonth]);

  // Load heatmap data
  useEffect(() => {
    if (view !== 'heatmap' || !goalId) return;
    const from = addDays(today(), -(WEEKS * 7));
    getCheckinsInRange(user.uid, from, today()).then((rows) =>
      setCheckinSet(new Set(rows.filter((r) => r.goalId === goalId).map((r) => r.date)))
    );
  }, [user.uid, view, goalId]);

  // Scroll heatmap to most recent week
  useEffect(() => {
    if (view === 'heatmap' && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  });

  // Macro helpers
  const cells = buildMonthCells(macroYear, macroMonth);
  const todayStr = today();
  const canGoNext = !(macroYear === nowDate.getFullYear() && macroMonth === nowDate.getMonth());
  const monthLabel = new Date(macroYear, macroMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  function prevMonth() {
    if (macroMonth === 0) { setMacroYear((y) => y - 1); setMacroMonth(11); }
    else setMacroMonth((m) => m - 1);
  }
  function nextMonth() {
    if (!canGoNext) return;
    if (macroMonth === 11) { setMacroYear((y) => y + 1); setMacroMonth(0); }
    else setMacroMonth((m) => m + 1);
  }

  // Heatmap helpers
  const goal = goals.find((g) => g.id === goalId);
  const weeks = buildWeeks();
  const monthLabels = buildMonthLabels(weeks);
  const thisMonthKey = todayStr.slice(0, 7);
  const thisMonthCount = [...checkinSet].filter((d) => d.startsWith(thisMonthKey)).length;
  const weekStart = addDays(todayStr, -6);
  const thisWeekCount = [...checkinSet].filter((d) => d >= weekStart).length;
  const streak = goal ? computeStreak(goal.days, checkinSet, todayStr) : 0;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <header className="pt-2 mb-4 flex items-baseline justify-between">
        <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">CALENDAR</h1>
        <div className="flex gap-1 bg-surface rounded-lg p-0.5">
          {[['macro', 'Month'], ['heatmap', 'Goal']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="font-mono text-xs px-2.5 py-1 rounded-md transition-all"
              style={{
                color: v === view ? '#0a0a0f' : '#6b6b8a',
                background: v === view ? '#00ff88' : 'transparent',
                boxShadow: v === view ? '0 0 8px #00ff8866' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {view === 'macro' ? (
        <>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors">
              <ChevronLeft size={16} className="text-text-muted" />
            </button>
            <span className="font-mono text-xs text-text-muted tracking-widest">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              style={{ opacity: canGoNext ? 1 : 0.2, pointerEvents: canGoNext ? 'auto' : 'none' }}
            >
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {MONTH_DAY_LABELS.map((d) => (
              <div key={d} className="font-mono text-[9px] text-text-muted text-center py-1 tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={i} />;
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const completedIds = checkinsByDate[dateStr] || new Set();
              const dayNum = parseInt(dateStr.slice(-2), 10);

              return (
                <div
                  key={dateStr}
                  className="rounded-lg flex flex-col items-center pt-1.5 pb-1 gap-1"
                  style={{
                    background: isToday ? '#00ff8811' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isToday ? '#00ff8844' : 'transparent'}`,
                    opacity: isFuture ? 0.2 : 1,
                    minHeight: 50,
                  }}
                >
                  <span
                    className="font-mono text-[11px] leading-none"
                    style={{ color: isToday ? '#00ff88' : '#6b6b8a' }}
                  >
                    {dayNum}
                  </span>
                  <div className="flex flex-wrap justify-center gap-[3px] px-0.5">
                    {goals.map((g) =>
                      completedIds.has(g.id) ? (
                        <div
                          key={g.id}
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: 6,
                            height: 6,
                            background: g.color,
                            boxShadow: `0 0 4px ${g.color}99`,
                          }}
                        />
                      ) : null
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 px-1">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                <span className="font-mono text-[9px] text-text-muted">{g.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Goal selector */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
            {goals.map((g) => (
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
                <span style={{ filter: 'grayscale(1)' }}>{g.emoji}</span> {g.name}
              </button>
            ))}
          </div>

          {goal && (
            <>
              {/* Heatmap */}
              <div ref={scrollRef} className="overflow-x-auto pb-2 no-scrollbar">
                <div style={{ width: DAY_W + WEEKS * STEP + GAP, position: 'relative' }}>
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
                  <div className="flex" style={{ gap: GAP }}>
                    <div className="flex flex-col" style={{ gap: GAP, width: DAY_W }}>
                      {DAY_LABELS.map((d) => (
                        <div key={d} className="font-mono text-text-muted flex items-center" style={{ fontSize: 8, height: CELL }}>
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
            </>
          )}
        </>
      )}
    </div>
  );
}
