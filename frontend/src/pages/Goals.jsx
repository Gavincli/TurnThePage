import React from 'react'
import { useNavigate } from 'react-router-dom'
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

const Goals = () => {
  const navigate = useNavigate()
  const { goalProgress, goalsCompleted, currentStreak, currentReading } = useApp()

  const today = new Date()
  const dateStr = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`
  const completedToday = goalProgress.filter((g) => g.completed).length
  const totalToday = goalProgress.length
  const dailyPercent = totalToday ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="min-h-screen pb-24 md:pb-28 overflow-x-hidden bg-[#fafafa]">
      {/* Header — minimal, Apple-style */}
      <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] md:text-sm text-neutral-500 font-medium">{dateStr}</p>
              <h1 className="text-[28px] md:text-[34px] font-semibold text-neutral-900 tracking-tight mt-0.5 flex items-center gap-2">
                {getGreeting()}
                <ReadAloud text={`${getGreeting()}, Daily Goals`} />
              </h1>
            </div>
            <HamburgerMenu />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 md:px-8 pb-8">
        {/* Streak — refined, not loud */}
        <section className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-neutral-500 font-medium">Reading streak</p>
                <p className="text-[40px] md:text-[48px] font-semibold text-neutral-900 tracking-tight mt-1">
                  {currentStreak} <span className="text-[20px] md:text-[24px] font-medium text-neutral-500">days</span>
                </p>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl md:text-3xl">
                🔥
              </div>
            </div>
          </div>
        </section>

        {/* Progress + Stats — compact row */}
        <section className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[15px] font-medium text-neutral-900">Today&apos;s progress</p>
              <p className="text-[15px] font-semibold text-emerald-600">{dailyPercent}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-[22px] md:text-[26px] font-semibold text-neutral-900">{completedToday}</p>
                <p className="text-[12px] text-neutral-500">Done</p>
              </div>
              <div>
                <p className="text-[22px] md:text-[26px] font-semibold text-neutral-900">{totalToday - completedToday}</p>
                <p className="text-[12px] text-neutral-500">Remaining</p>
              </div>
              <div>
                <p className="text-[22px] md:text-[26px] font-semibold text-neutral-900">{goalsCompleted}</p>
                <p className="text-[12px] text-neutral-500">All-time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Daily goals — iOS list style */}
        <section className="mb-6 md:mb-8">
          <p className="text-[13px] font-medium text-neutral-500 uppercase tracking-wider mb-3 px-1">
            Daily goals
          </p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-neutral-100">
            {goalProgress.map((goal) => {
              const progress = goal.target ? Math.min((goal.current / goal.target) * 100, 100) : 0
              return (
                <div
                  key={goal.id}
                  className={`flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 ${goal.completed ? 'bg-emerald-50/50' : ''}`}
                >
                  <div
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0 ${
                      goal.completed ? 'bg-emerald-100' : 'bg-neutral-100'
                    }`}
                  >
                    {goal.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] md:text-[16px] font-medium text-neutral-900 flex items-center gap-1">
                        {goal.name}
                        <ReadAloud
                          text={`${goal.name}: ${goal.current} out of ${goal.target}${goal.completed ? ', Completed' : ''}`}
                          size="xs"
                        />
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[13px] text-neutral-500 tabular-nums">
                          {goal.current}/{goal.target}
                        </span>
                        {goal.completed && (
                          <span className="text-[11px] font-medium text-emerald-600">Done</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          goal.completed ? 'bg-emerald-500' : 'bg-neutral-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Primary action */}
        <button
          onClick={() => navigate('/log-reading')}
          className="w-full bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white rounded-xl py-4 md:py-5 text-[17px] font-semibold transition-all flex items-center justify-center gap-3"
        >
          <span className="text-xl">✏️</span>
          Log Reading
          <ReadAloud text="Log Reading" />
        </button>

        {/* Secondary cards — book, tip, week */}
        <div className="mt-6 md:mt-8 space-y-4">
          {currentReading && (
            <div
              onClick={() => navigate('/read-now')}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] cursor-pointer hover:bg-neutral-50/80 transition-colors"
            >
              <p className="text-[12px] text-neutral-500 font-medium mb-1">Currently reading</p>
              <p className="text-[17px] font-semibold text-neutral-900 flex items-center gap-2">
                {currentReading}
                <ReadAloud text={currentReading} size="xs" />
              </p>
              <p className="text-[13px] text-[#007AFF] font-medium mt-2">Continue reading →</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                💡
              </div>
              <div>
                <p className="text-[15px] font-semibold text-neutral-900 mb-1">Daily tip</p>
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  Just 10 minutes of reading a day adds up to 60+ hours per year. Small steps build big habits.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[15px] font-semibold text-neutral-900 mb-4">This week</p>
            <div className="flex gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                const isToday = i === today.getDay()
                const isPast = i < today.getDay()
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-lg py-2.5 text-center text-[12px] font-medium ${
                      isToday
                        ? 'bg-[#007AFF] text-white'
                        : isPast
                          ? 'bg-neutral-100 text-neutral-500'
                          : 'bg-neutral-50 text-neutral-400'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
            <p className="text-[13px] text-neutral-500">
              {currentStreak} day streak — keep it going
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default Goals
