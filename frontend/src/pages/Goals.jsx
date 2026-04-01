import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import MuseumBackground from '../components/MuseumBackground'

const goalViews = [
  {
    id: 'daily',
    title: 'Daily goal',
    subtitle: 'Read a little every day.',
    badge: 'Today',
    icon: '☀️',
  },
  {
    id: 'weekly',
    title: 'Weekly goal',
    subtitle: 'Stay on track this week.',
    badge: 'This week',
    icon: '🗓️',
  },
  {
    id: 'monthly',
    title: 'Monthly goal',
    subtitle: 'See your progress grow.',
    badge: 'This month',
    icon: '🌙',
  },
]
 

const GOAL_TAB_PERIODS = new Set(['daily', 'weekly', 'monthly'])

/** Bucket for the Daily / Weekly / Monthly filter; driven by API `period` from goal_templates. */
const resolveGoalPeriod = (goal) => {
  if (goal.period && GOAL_TAB_PERIODS.has(goal.period)) {
    return goal.period
  }
  return 'daily'
}

const GoalRow = ({ goal }) => {
  const progress = goal.target ? Math.min((goal.current / goal.target) * 100, 100) : 0
  const clampedCurrent = Math.min(goal.current, goal.target || goal.current)

  return (
    <div
      className={`rounded-[1.4rem] border p-4 shadow-md transition ${
        goal.completed
          ? 'border-[#c8d1cf] bg-[#fdfbf9]'
          : 'border-[#e8e4db] bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
            goal.completed ? 'bg-[#e6ebe9] text-[#47665b]' : 'bg-[#f5efe6] text-[#9c7846]'
          }`}
        >
          {goal.icon || '📖'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[15px] font-serif font-medium text-[#2b2724] md:text-base">
                {goal.name}
                <ReadAloud
                  text={`${goal.name}: ${goal.current} out of ${goal.target}${goal.completed ? ', Completed' : ''}`}
                  size="xs"
                />
              </p>

              {goal.description && (
                <p className="mt-1 flex items-center gap-1 text-xs leading-5 text-[#6b645d] md:text-sm">
                  <span>{goal.description}</span>
                  <ReadAloud text={goal.description} size="xs" />
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-serif font-medium tabular-nums text-[#6b645d]">
                {clampedCurrent}/{goal.target}
              </p>
              <p className="mt-1 text-xs font-bold text-[#8c6b4a]">
                {Math.round(progress)}%
              </p>
              {goal.completed && (
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#47665b]">Done</p>
              )}
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#eeeae6]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                goal.completed ? 'bg-[#5f8779]' : 'bg-[#b89569]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {!goal.completed && (
            <p className="mt-5 text-sm leading-6 text-[#6b645d]">
              Log reading sessions to move this goal forward.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const Goals = () => {
  const { goalProgress, goalsLoading, newlyCompletedGoals } = useApp()
  const [selectedView, setSelectedView] = useState('daily')

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
    <div className="relative min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-24 md:pb-12 font-sans overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      <header className="sticky top-0 z-30 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <h1 className="mt-0.5 flex items-center gap-2 text-3xl font-serif font-medium tracking-tight text-[#2b2724]">
              Goals
              <ReadAloud text="Goals" size="sm" />
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8a8178]">
              {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eeebe4] bg-white p-5 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />
            
            {/* Soft background illustration */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply transition-opacity duration-700 sm:opacity-50">
              <img 
                src="/library.png" 
                alt="" 
                className="h-full w-full object-cover object-[center_20%]"
                style={{ maskImage: 'linear-gradient(to right, transparent 10%, black 80%)', WebkitMaskImage: 'linear-gradient(to right, transparent 10%, black 80%)' }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#8a8178]">Reading goals</p>
                  <h2 className="mt-2 text-3xl font-serif font-medium leading-tight tracking-tight text-[#2b2724] lg:text-[2.2rem] lg:leading-[1.05]">
                    Track a goal.
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/70 backdrop-blur-md text-[#9c7846] text-2xl shadow-sm border border-white/50">
                  {activeView.icon}
                </div>
              </div>

              {newlyCompletedGoals.length > 0 && (
                <div className="mt-5 rounded-[1.2rem] border border-[#d8e1de] bg-[#f5faf8] px-4 py-4 text-[#47665b] shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f8779]">
                    Newly completed
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-6">
                    {newlyCompletedGoals.map((goal) => (
                      <li key={goal.templateId}>{goal.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 rounded-[1.4rem] bg-[#3f3b39]/50 backdrop-blur-md p-5 text-[#fcfbfa] shadow-lg border border-white/10 sm:p-6 relative overflow-hidden">
                 <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#f5efe6]/20 blur-2xl" />
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-white">
                      {activeView.badge}
                    </p>
                    <p className="mt-1 text-3xl font-serif font-medium leading-tight">{activeView.title}</p>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/80 font-medium">
                      {activeView.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-[1rem] bg-black/20 p-1.5 backdrop-blur-sm">
                    {goalViews.map((view) => {
                      const isActive = selectedView === view.id
                      return (
                        <button
                          key={view.id}
                          onClick={() => setSelectedView(view.id)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-white/60 hover:bg-white/10'
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

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] bg-black/20 backdrop-blur-sm px-5 py-4 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Progress</p>
                    <p className="mt-1 text-2xl font-serif text-white">{progressPercent}%</p>
                  </div>
                  <div className="rounded-[1rem] bg-black/20 backdrop-blur-sm px-5 py-4 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Done</p>
                    <p className="mt-1 text-2xl font-serif text-white">{completedGoals}</p>
                  </div>
                  <div className="rounded-[1rem] bg-black/20 backdrop-blur-sm px-5 py-4 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Total</p>
                    <p className="mt-1 text-2xl font-serif text-white">{totalGoals}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e0dbd3] bg-white px-4 py-1.5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[#4a4542]">
                  Your Goals
                </h3>
                <ReadAloud text="Your Goals" size="xs" />
              </div>
            </div>

            {goalsLoading ? (
              <div className="rounded-[1.4rem] border border-[#eeebe4] bg-white px-8 py-10 text-center shadow-sm">
                <p className="text-lg font-serif font-medium text-[#4a4542]">
                  Loading goals...
                </p>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="rounded-[1.4rem] border border-[#eeebe4] bg-white px-8 py-10 text-center shadow-sm">
                <img 
                  src="/favicon.svg" 
                  alt="" 
                  className="mx-auto h-32 w-32 object-contain opacity-80 mix-blend-multiply drop-shadow-sm"
                />
                <p className="mt-4 text-lg font-serif font-medium text-[#4a4542]">
                  No {selectedView} goals yet.
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

      <footer className="mt-12 hidden border-t border-[#e8e4db] md:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center text-[#8a8178] sm:px-6 lg:px-10">
          © 2026 Turn The Page. Built to support better reading habits.
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

export default Goals