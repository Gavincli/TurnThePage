import React from 'react'
import BottomNav from '../components/BottomNav'

const goalsData = [
  {
    id: 1,
    title: 'Read 10 minutes',
    current: 0,
    total: 10,
    color: 'from-emerald-400 to-emerald-500',
  },
  {
    id: 2,
    title: 'Read 20 pages',
    current: 6,
    total: 20,
    color: 'from-sky-400 to-sky-500',
  },
  {
    id: 3,
    title: 'Read before bed',
    current: 0,
    total: 1,
    color: 'from-fuchsia-400 to-fuchsia-500',
  },
  {
    id: 4,
    title: 'Read without distractions',
    current: 0,
    total: 1,
    color: 'from-amber-400 to-amber-500',
  },
  {
    id: 5,
    title: 'Log reading session',
    current: 1,
    total: 1,
    color: 'from-lime-400 to-lime-500',
    done: true,
  },
  {
    id: 6,
    title: 'Read 30 pages',
    current: 13,
    total: 30,
    color: 'from-cyan-400 to-cyan-500',
  },
  {
    id: 7,
    title: 'Read 2 different books',
    current: 0,
    total: 2,
    color: 'from-purple-400 to-purple-500',
  },
  {
    id: 8,
    title: 'Read 25 minutes',
    current: 20,
    total: 25,
    color: 'from-orange-400 to-orange-500',
  },
  {
    id: 9,
    title: 'Read in the morning',
    current: 0,
    total: 1,
    color: 'from-pink-400 to-pink-500',
  },
  {
    id: 10,
    title: 'Complete 1 chapter',
    current: 0,
    total: 1,
    color: 'from-violet-400 to-violet-500',
  },
]

const StatCard = ({ label, value, helper, align = 'left' }) => (
  <div className="flex-1 rounded-3xl bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.15)] backdrop-blur">
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : ''}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {helper && (
        <div className="mt-1 text-xs text-slate-500">
          {helper}
        </div>
      )}
    </div>
  </div>
)

const DailyProgressCard = ({ current, total }) => {
  const percent = total ? Math.round((current / total) * 100) : 0
  const remaining = Math.max(total - current, 0)

  return (
    <section className="rounded-3xl bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Daily Progress
          </div>
          <div className="mt-1 text-2xl font-semibold leading-snug text-slate-900">
            {percent}% complete
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Keep going — {remaining} more to go
          </div>
        </div>
        <div className="rounded-xl bg-emerald-500 px-3 py-2 text-center text-xs font-semibold text-emerald-50 shadow-sm">
          <div className="text-[10px] uppercase tracking-wide text-emerald-100">Today</div>
          <div className="text-sm">
            {current}/{total}
          </div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </section>
  )
}

const GoalCard = ({ title, current, total, color, done, badge }) => {
  const percent = total ? Math.round((current / total) * 100) : 0

  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
        done ? 'ring-2 ring-lime-400' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md`}>
            <span className="text-lg">📚</span>
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-900">{title}</div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">
              {current} / {total}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {badge && (
            <div className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
              {badge}
            </div>
          )}
          {done && (
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
              ✓ Done
            </div>
          )}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100/80">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

const Goals = () => {
  const totalGoals = goalsData.length
  const completedGoals = goalsData.filter((g) => g.done).length
  const dailyProgressCurrent = 1
  const dailyProgressTotal = 10

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#14b8a6] via-[#22c55e] to-[#bbf7d0] pb-20 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 sm:max-w-lg lg:max-w-xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/70">
              Streak & goals
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-emerald-950">
              Keep your reading streak
            </h1>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
            <div className="space-y-[3px]">
              <span className="block h-0.5 w-4 rounded-full bg-white" />
              <span className="block h-0.5 w-4 rounded-full bg-white" />
            </div>
          </button>
        </header>

        {/* Top stats */}
        <section className="mb-5 space-y-3">
          <div className="flex gap-3 max-sm:flex-col">
            <StatCard
              label="Total goals"
              value={totalGoals}
              helper="Goals you set for this period"
            />
            <StatCard
              label="Completed"
              value={completedGoals}
              helper="Finished so far"
              align="right"
            />
          </div>

          <DailyProgressCard current={dailyProgressCurrent} total={dailyProgressTotal} />
        </section>

        {/* Today's goals header */}
        <section className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-emerald-950">
              Today&apos;s reading quests
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Small wins that keep your streak alive.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-950/80">
            {totalGoals - completedGoals} remaining
          </span>
        </section>

        {/* Goals grid */}
        <section className="mt-3 grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2">
          {goalsData.map((goal, index) => (
            <GoalCard
              key={goal.id}
              {...goal}
              badge={index === 0 ? '3 quests' : undefined}
            />
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Goals
