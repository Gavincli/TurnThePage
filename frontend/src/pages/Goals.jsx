import React, { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import MuseumBackground from '../components/MuseumBackground'


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
  const { updateGoalProgress, markGoalCompleted, undoGoalCompletion, deleteGoal } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const clampedCurrent = goal.completed && goal.target ? goal.target : goal.current
  const progress = goal.target ? Math.min((goal.current / goal.target) * 100, 100) : 0

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8c6b4a', '#5f8779', '#c4bbb2', '#e6ebe9']
    })
    markGoalCompleted(goal.id)
  }

  const handleIncrement = () => {
    if (goal.current + 1 >= goal.target) {
      handleComplete()
    } else {
      updateGoalProgress(goal.id, goal.current + 1)
    }
  }

  const handleDecrement = () => {
    updateGoalProgress(goal.id, goal.current - 1)
  }

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
                <div className="relative mt-2 flex items-center justify-end gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#47665b]">Done</p>
                  <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6ebe9] text-[#47665b] transition hover:bg-[#d5dedb] focus:outline-none"
                    aria-label="Options"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 z-30 w-32 origin-top-right rounded-xl border border-[#eeebe4] bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] select-none">
                      <button 
                        onClick={() => { undoGoalCompletion(goal.id); setIsMenuOpen(false); }} 
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#4a4542] hover:bg-[#f5efe6] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
                        Undo
                      </button>
                      <button 
                        onClick={() => { deleteGoal(goal.id); setIsMenuOpen(false); }} 
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6L17 21H7L5 6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
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
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  disabled={goal.current <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eeebe4] bg-[#fcfbfa] pb-0.5 text-lg leading-none text-[#6b645d] shadow-sm transition hover:bg-[#f5efe6] disabled:opacity-50 disabled:hover:bg-[#fcfbfa]"
                  aria-label="Decrease progress"
                >
                  &minus;
                </button>
                <div className="w-8 text-center font-serif text-[15px] font-medium text-[#2b2724] md:text-base">
                  {clampedCurrent}
                </div>
                <button
                  onClick={handleIncrement}
                  disabled={goal.current >= goal.target}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eeebe4] bg-[#fcfbfa] pb-0.5 text-lg leading-none text-[#6b645d] shadow-sm transition hover:bg-[#f5efe6] disabled:opacity-50 disabled:hover:bg-[#fcfbfa]"
                  aria-label="Increase progress"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleComplete}
                className="rounded-full bg-gradient-to-r from-[#8c6b4a] to-[#73583d] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#ffffff] shadow-sm shadow-[#8c6b4a]/20 transition hover:scale-[1.02] hover:shadow-md"
              >
                Complete
              </button>
            </div>
          )}
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
    <div className="relative min-h-screen bg-white pb-24 md:pb-12 font-sans overflow-x-hidden text-[#2b2724]">
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

              <div className="mt-6 rounded-[1.4rem] bg-[#3f3b39]/50 backdrop-blur-md p-5 text-[#fcfbfa] shadow-lg border border-white/10 sm:p-6 relative overflow-hidden">
                 <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#f5efe6]/20 blur-2xl" />
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a69e98]">
                      {activeView.badge}
                    </p>
                    <p className="mt-2 text-2xl font-serif font-medium">{activeView.title}</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#c4bbb2]">
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

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
            <div className="mb-4 flex items-center justify-between pl-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a8178]">
                Goals
              </h3>
              <ReadAloud text="Goals" size="xs" />
            </div>

            {filteredGoals.length === 0 ? (
              <div className="rounded-[1.4rem] border border-[#eeebe4] bg-white px-8 py-10 text-center shadow-sm">
                <img 
                  src="/open_watercolor_book.png" 
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