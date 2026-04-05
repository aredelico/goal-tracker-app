import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { GOALS } from '../goals';
import { db } from '../db';
import { today, addDays, parseDate, getMondayOfWeek } from '../utils/dates';

const PERIODS = ['7D', '30D', '90D'];
const PERIOD_DAYS = { '7D': 7, '30D': 30, '90D': 90 };

function countPossibleDays(goal, fromDate, totalDays) {
  let count = 0;
  for (let i = 0; i < totalDays; i++) {
    const dow = parseDate(addDays(fromDate, i)).getDay();
    if (!goal.days || goal.days.includes(dow)) count++;
  }
  return count;
}

async function loadStats(period) {
  const days = PERIOD_DAYS[period];
  const toDate = today();
  const fromDate = addDays(toDate, -(days - 1));

  const rows = await db.checkins
    .where('date').between(fromDate, toDate, true, true)
    .toArray();

  // Per-goal completion rates
  const goalStats = GOALS.map((goal) => {
    const actual = rows.filter((r) => r.goalId === goal.id).length;
    const possible = countPossibleDays(goal, fromDate, days);
    const rate = possible > 0 ? Math.round((actual / possible) * 100) : 0;
    return { goal, actual, possible, rate };
  });

  // Chart data
  let chartData;
  if (period === '7D') {
    chartData = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(fromDate, i);
      const entry = {
        label: parseDate(d).toLocaleDateString('en-US', { weekday: 'short' }),
      };
      GOALS.forEach((g) => {
        entry[g.id] = rows.some((r) => r.goalId === g.id && r.date === d) ? 1 : 0;
      });
      return entry;
    });
  } else {
    // Weekly aggregation — include all weeks even if empty
    const weekMap = new Map();
    let wc = getMondayOfWeek(fromDate);
    while (wc <= toDate) {
      const entry = {
        date: wc,
        label: parseDate(wc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      GOALS.forEach((g) => { entry[g.id] = 0; });
      weekMap.set(wc, entry);
      wc = addDays(wc, 7);
    }
    rows.forEach((r) => {
      const mon = getMondayOfWeek(r.date);
      if (weekMap.has(mon)) weekMap.get(mon)[r.goalId]++;
    });
    chartData = [...weekMap.values()];
  }

  return { goalStats, chartData };
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  labelStyle: { color: '#e8e8f0', marginBottom: 4 },
  itemStyle: { color: '#e8e8f0' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export default function StatsPage() {
  const [period, setPeriod] = useState('30D');
  const [goalStats, setGoalStats] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadStats(period).then(({ goalStats, chartData }) => {
      setGoalStats(goalStats);
      setChartData(chartData);
    });
  }, [period]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header + period selector */}
      <header className="pt-2 mb-5 flex items-baseline justify-between">
        <h1 className="font-mono text-2xl font-bold text-text-primary tracking-wider">STATS</h1>
        <div className="flex gap-1 bg-surface rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="font-mono text-xs px-2.5 py-1 rounded-md transition-all"
              style={{
                color: p === period ? '#0a0a0f' : '#6b6b8a',
                background: p === period ? '#00ff88' : 'transparent',
                boxShadow: p === period ? '0 0 8px #00ff8866' : 'none',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* Completion rate cards */}
      <div className="space-y-3 mb-5">
        {goalStats.map(({ goal, actual, possible, rate }) => (
          <div key={goal.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-medium" style={{ color: goal.color }}>
                {goal.emoji} {goal.name}
              </span>
              {goal.target ? (
                <span className="font-mono text-xs text-text-muted">
                  {actual}/{possible} · <span style={{ color: goal.color }}>{rate}%</span>
                </span>
              ) : (
                <span className="font-mono text-xs" style={{ color: goal.color }}>
                  {actual} gig{actual !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {goal.target && (
              <div className="h-1.5 rounded-full overflow-hidden bg-surface-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(rate, 100)}%`,
                    background: goal.color,
                    boxShadow: `0 0 8px ${goal.color}88`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="glass rounded-xl p-4">
        <p className="font-mono text-[10px] text-text-muted tracking-widest mb-4">ACTIVITY</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} margin={{ top: 2, right: 2, left: -22, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b6b8a', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              interval={period === '90D' ? 2 : 0}
            />
            <YAxis
              tick={{ fill: '#6b6b8a', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip {...TOOLTIP_STYLE} />
            {GOALS.map((g, i) => (
              <Bar
                key={g.id}
                dataKey={g.id}
                stackId="a"
                fill={g.color}
                name={g.name}
                radius={i === GOALS.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {GOALS.map((g) => (
            <div key={g.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: g.color }} />
              <span className="font-mono text-[9px] text-text-muted">{g.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
