import React, { useState } from 'react'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
/// Hey silas this is just a template for the log reading page  you can edit it as you please
const quickMinutes = [10, 20, 30, 45]

const LogReading = () => {
  const [minutesRead, setMinutesRead] = useState(10)
  const [notes, setNotes] = useState('')
  const [selectedQuick, setSelectedQuick] = useState(10)

  const handleQuickSelect = (minutes) => {
    setSelectedQuick(minutes)
    setMinutesRead(minutes)
  }

  const handleMinutesChange = (e) => {
    const value = e.target.value
    setSelectedQuick(null)
    setMinutesRead(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Placeholder only for now.
    // Later this can connect to backend /api/sessions.
    alert(`Reading logged: ${minutesRead} minutes${notes ? ` | Notes: ${notes}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] pb-24 md:pb-6">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Turn The Page
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              Log reading
              <ReadAloud text="Log reading" />
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Save today’s reading in a few seconds.
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/90 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sky-100/80 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.18))]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-slate-500">
                    Today’s reading
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-slate-900 lg:text-[2.2rem] lg:leading-[1.05]">
                    Keep your reading habit going.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Log your session quickly so your progress stays updated and your goals keep moving.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm">
                  ✏️
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Quick select
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickMinutes.map((minutes) => {
                      const isActive = selectedQuick === minutes
                      return (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => handleQuickSelect(minutes)}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-slate-950 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {minutes} min
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="minutesRead"
                    className="mb-2 block text-sm font-semibold text-slate-600"
                  >
                    Minutes read
                  </label>
                  <input
                    id="minutesRead"
                    type="number"
                    min="1"
                    value={minutesRead}
                    onChange={handleMinutesChange}
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-lg font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Enter minutes"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-slate-600"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                    placeholder="What did you read today?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-[1.6rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-base font-semibold text-white shadow-[0_16px_34px_rgba(99,102,241,0.28)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(99,102,241,0.35)]"
                >
                  Save reading log
                </button>
              </form>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Why log it?
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                Small actions build progress
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Logging your reading helps track your habit, update your goals, and show how far you’ve come.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick reminder
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                It does not need to be perfect
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Even a short reading session counts. The goal is consistency, not perfection.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-8 hidden border-t border-slate-200/80 md:block">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
          © 2026 Turn The Page. Built to support better reading habits.
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

export default LogReading