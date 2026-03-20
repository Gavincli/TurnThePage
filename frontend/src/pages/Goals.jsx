import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const goalViews = [
  {
    id: 'daily',
    title: 'Daily goal',
    subtitle: 'Small steps every day build strong reading habits.',
    badge: 'Today',
    icon: '☀️',
  },
  {
    id: 'weekly',
    title: 'Weekly goal',
    subtitle: 'Stay consistent through the week and keep your rhythm.',
    badge: 'This week',
    icon: '🗓️',
  },
  {
    id: 'monthly',
    title: 'Monthly goal',
    subtitle: 'See your progress grow over time and celebrate milestones.',
    badge: 'This month',
    icon: '🌙',
  },
]

const resolveGoalPeriod = (goal) => {
  if (goal.period && ['daily', 'weekly', 'monthly'].includes(goal.period)) {
    return goal.period
  }

  const text = `${goal.name || ''} ${goal.description || ''}`.toLowerCase()

  if (text.includes('weekly') || text.includes('week')) return 'weekly'
  if (text.includes('monthly') || text.includes('month')) return 'monthly'
  return 'daily'
}

const GoalRow = ({ goal }) => {
  const clampedCurrent = goal.completed && goal.target ? goal.target : goal.current
  const progress = goal.target ? Math.min((goal.current / goal.target) * 100, 100) : 0

  return (
    <div
      className={`rounded-[1.75rem] border p-4 shadow-sm transition ${
        goal.completed
          ? 'border-emerald-200/80 bg-emerald-50/70'
          : 'border-slate-200/80 bg-white/90'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
            goal.completed ? 'bg-emerald-100' : 'bg-slate-100'
          }`}
        >
          {goal.icon || '📖'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[15px] font-semibold text-slate-900 md:text-base">
                {goal.name}
                <ReadAloud
                  text={`${goal.name}: ${goal.current} out of ${goal.target}${goal.completed ? ', Completed' : ''}`}
                  size="xs"
                />
              </p>

              {goal.description && (
                <p className="mt-1 flex items-center gap-1 text-xs leading-5 text-slate-500 md:text-sm">
                  <span>{goal.description}</span>
                  <ReadAloud text={goal.description} size="xs" />
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums text-slate-500">
                {clampedCurrent}/{goal.target}
              </p>
              <p className="mt-1 text-xs font-semibold text-indigo-500">
                {Math.round(progress)}%
              </p>
              {goal.completed && (
                <p className="mt-1 text-xs font-semibold text-emerald-600">Done</p>
              )}
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                goal.completed ? 'bg-emerald-500' : 'bg-indigo-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Goals = () => {
  const { goalProgress } = useApp()
  const [selectedView, setSelectedView] = useState('daily')

  const today = new Date()
  const dateStr = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`

  const activeView = useMemo(
    () => goalViews.find((view) => view.id === selectedView) || goalViews[0],
    [selectedView]
  )

  const filteredGoals = useMemo(() => {
    return [...goalProgress]
      .filter((goal) => resolveGoalPeriod(goal) === selectedView)
      .sort((a, b) => Number(a.completed) - Number(b.completed))
  }, [goalProgress, selectedView])

  const completedGoals = filteredGoals.filter((g) => g.completed).length
  const totalGoals = filteredGoals.length
  const progressPercent = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] pb-24 md:pb-6">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Turn The Page
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              {getGreeting()}
              <ReadAloud text={`${getGreeting()}, Goals`} />
            </h1>
            <p className="mt-1 text-sm text-slate-500">{dateStr}</p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/90 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sky-100/80 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.18))]" />

            <div className="relative">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-slate-500">Reading goals</p>
                  <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-slate-900 lg:text-[2.2rem] lg:leading-[1.05]">
                    Choose the goal view you want to focus on.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Start small, stay consistent, and keep your reading progress visible.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl shadow-sm">
                  {activeView.icon}
                </div>
              </div>

              <div className="mt-5 rounded-[1.6rem] bg-slate-950 p-4 text-white shadow-[0_16px_34px_rgba(2,6,23,0.24)] sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                      {activeView.badge}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{activeView.title}</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                      {activeView.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-1.5">
                    {goalViews.map((view) => {
                      const isActive = selectedView === view.id
                      return (
                        <button
                          key={view.id}
                          onClick={() => setSelectedView(view.id)}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          {view.id === 'daily'
                            ? 'Daily'
                            : view.id === 'weekly'
                              ? 'Weekly'
                              : 'Monthly'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Progress</p>
                    <p className="mt-1 text-2xl font-semibold">{progressPercent}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Completed</p>
                    <p className="mt-1 text-2xl font-semibold">{completedGoals}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total goals</p>
                    <p className="mt-1 text-2xl font-semibold">{totalGoals}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Metas
              </h3>
              <ReadAloud text="Metas" size="xs" />
            </div>

            {filteredGoals.length === 0 ? (
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  {activeView.icon}
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">
                  No {selectedView} goals yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Once goals are added for this section, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((goal) => (
                  <GoalRow key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-8 hidden border-t border-slate-200/80 md:block">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
          © 2026 Turn The Page. Built to support better reading habits.
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

export default Goals