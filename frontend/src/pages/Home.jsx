import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/Avatar'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'

const StatCard = ({ label, value, accent, readText, icon, iconBg }) => {
  const accentMap = {
    amber: 'border-amber-200/80 bg-white',
    emerald: 'border-emerald-200/80 bg-white',
    blue: 'border-blue-200/80 bg-white',
    violet: 'border-violet-200/80 bg-white',
  }

  return (
    <div
      className={`rounded-3xl border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${accentMap[accent]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg shadow-sm ${iconBg}`}
          >
            {icon}
          </div>
          <p className="text-sm font-medium leading-tight text-slate-500">
            {label}
          </p>
        </div>

        <div className="shrink-0 pt-0.5">
          <ReadAloud text={readText} size="xs" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  )
}

const ResourceCard = ({ href, icon, title, subtitle, readText }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
            {icon}
          </div>
          <div>
            <h4 className="text-base font-semibold leading-tight text-slate-900">
              {title}
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <ReadAloud text={readText} size="xs" />
        </div>
      </div>
    </a>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const {
    currentStreak,
    totalMinutes,
    booksFinished,
    goalsCompleted,
    currentReading,
  } = useApp()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] pb-24 md:pb-6">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Turn The Page
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
              <ReadAloud text="Welcome back" />
            </h1>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr] xl:gap-6">
          <div className="space-y-5">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:min-h-[290px]">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/90 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sky-100/80 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.18))]" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium text-slate-500">
                      Your reading journey
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-slate-900 lg:text-[2.2rem] lg:leading-[1.05]">
                      Keep building your habit, one page at a time.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                      Track progress, stay consistent, and make reading feel simple,
                      structured, and motivating every day.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/avatar')}
                    className="shrink-0 self-start rounded-[1.5rem] border border-white/70 bg-white/70 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.10)]"
                    aria-label="Choose avatar"
                  >
                    <Avatar size="lg" />
                  </button>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.6rem] bg-slate-950 px-5 py-4 text-white shadow-[0_16px_34px_rgba(2,6,23,0.24)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                          Current streak
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                          {currentStreak} day{currentStreak === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
                        Keep going
                      </div>
                    </div>
                    <div className="mt-2">
                      <ReadAloud text={`Current streak: ${currentStreak} days`} size="xs" />
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/70 bg-white/70 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Reading focus
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                      {currentReading || 'Choose your next book'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {currentReading
                        ? 'Stay with your current book and keep the momentum going.'
                        : 'Pick a title and begin your next reading session.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Overview
                </h3>
                <ReadAloud text="Overview" size="xs" />
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                  label="Goals completed"
                  value={`${goalsCompleted}`}
                  accent="emerald"
                  icon="🎯"
                  iconBg="bg-emerald-50"
                  readText={`Goals completed: ${goalsCompleted}`}
                />
                <StatCard
                  label="Minutes read"
                  value={`${totalMinutes.toLocaleString()} min`}
                  accent="blue"
                  icon="⏱️"
                  iconBg="bg-blue-50"
                  readText={`Minutes read: ${totalMinutes.toLocaleString()} minutes`}
                />
                <StatCard
                  label="Books finished"
                  value={`${booksFinished}`}
                  accent="violet"
                  icon="📘"
                  iconBg="bg-violet-50"
                  readText={`Books finished: ${booksFinished}`}
                />
                <StatCard
                  label="Reading streak"
                  value={`${currentStreak} days`}
                  accent="amber"
                  icon="✨"
                  iconBg="bg-amber-50"
                  readText={`Reading streak: ${currentStreak} days`}
                />
              </div>

              <div className="hidden lg:block min-h-[200px]" />
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Currently reading
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {currentReading || 'No book selected yet'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {currentReading
                      ? 'Come back to continue where you left off and keep your momentum strong.'
                      : 'Choose a book or resource to start building your daily reading habit.'}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  📚
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/read-now')}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Read now
                </button>

                <button
                  onClick={() => navigate('/log-reading')}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Log reading
                </button>
              </div>

              <div className="mt-3">
                <ReadAloud
                  text={
                    currentReading
                      ? `Currently reading ${currentReading}`
                      : 'No current reading selected yet'
                  }
                  size="xs"
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Resources
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Reading support
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/read-now')}
                  className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Explore
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ResourceCard
                  href="https://www.gutenberg.org"
                  icon="📚"
                  title="Project Gutenberg"
                  subtitle="Free classic eBooks"
                  readText="Project Gutenberg, free classic eBooks"
                />
                <ResourceCard
                  href="https://openlibrary.org"
                  icon="📖"
                  title="Open Library"
                  subtitle="Borrow and explore books"
                  readText="Open Library, borrow and explore books"
                />
              </div>
            </section>

            <section>
              <button
                onClick={() => navigate('/log-reading')}
                className="w-full rounded-[1.6rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-base font-semibold text-white shadow-[0_16px_34px_rgba(99,102,241,0.28)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(99,102,241,0.35)]"
              >
                Log today’s reading
              </button>
              <div className="mt-2 flex justify-center">
                <ReadAloud text="Log today's reading" />
              </div>
            </section>
          </div>
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

export default Home