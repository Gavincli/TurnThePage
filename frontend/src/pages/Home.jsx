import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/Avatar'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'

const InlineStat = ({ label, value, icon, readText, loading }) => {
  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3 transition duration-200 hover:-translate-y-0.5"
      aria-label={readText}
    >
      <div className="text-[#2b2724] opacity-80 flex shrink-0 drop-shadow-sm">{icon}</div>
      <div className="flex items-baseline gap-1.5 sm:gap-2 border-b border-transparent">
        <p className="text-3xl sm:text-4xl font-serif text-[#2b2724] font-medium tracking-tight">
          {loading ? (
            <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-[#e8e4db]" />
          ) : (
            value
          )}
        </p>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#2b2724] opacity-80">
          {label}
        </p>
      </div>
    </div>
  )
}

// Currently reading list — shows unfinished books from the backend.
// If no books, shows a clean empty state.
const CurrentlyReadingPanel = ({ books, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-xl bg-[#f0ece4]"
          />
        ))}
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <img
          src="/open_watercolor_book.png"
          alt=""
          className="mx-auto h-20 w-20 object-contain opacity-70 mix-blend-multiply drop-shadow-sm"
        />
        <p className="mt-3 text-sm font-serif text-[#6b645d]">No books in progress yet.</p>
        <p className="mt-1 text-xs text-[#9a9390]">Log a session to add one.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {books.map((book) => (
        <li
          key={book.bookId}
          className="flex items-center gap-3 rounded-xl border border-[#eeebe4] bg-[#fdfbf9] px-4 py-3"
        >
          <span className="text-lg">📖</span>
          <span className="line-clamp-1 text-sm font-serif font-medium text-[#2b2724]">
            {book.title}
          </span>
        </li>
      ))}
    </ul>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const {
    currentStreak,
    todayMinutes,
    weekMinutes,
    totalMinutes,
    booksFinished,
    statsLoading,
    currentBooks,
    booksLoading,
    goalsCompleted,
  } = useApp()

  // Label for the "Now Reading" header area
  const nowReadingLabel =
    booksLoading
      ? 'Loading…'
      : currentBooks.length === 0
        ? 'No book chosen'
        : currentBooks.length === 1
          ? `Now reading ${currentBooks[0].title}`
          : `Reading ${currentBooks.length} books`

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-24 md:pb-12 font-sans">
      <header className="sticky top-0 z-20 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <h1 className="mt-0.5 flex items-center gap-2 text-3xl font-serif font-medium tracking-tight text-[#2b2724]">
              Home
              <ReadAloud text="Home" size="sm" />
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8a8178]">
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              }).format(new Date())}
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="space-y-12">

          {/* Top Dashboard Row */}
          <section className="grid gap-6 md:grid-cols-12 md:grid-rows-1">

            {/* Habit / Overview Panel */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#eeebe4] bg-white p-6 md:col-span-7 lg:col-span-8 lg:p-8 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />

              <div className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply transition-opacity duration-700 sm:opacity-50">
                <img
                  src="/library.png"
                  alt=""
                  className="h-full w-full object-cover object-[center_20%]"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 10%, black 80%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 10%, black 80%)',
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8a8178]">
                    My Habit
                  </p>
                  <h2 className="mt-1 text-3xl font-serif font-medium leading-tight tracking-tight text-[#2b2724]">
                    Read every day.
                  </h2>
                </div>

                <button
                  onClick={() => navigate('/avatar')}
                  className="shrink-0 self-start rounded-full border border-[#e8e4db] bg-[#fbf9f5] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  aria-label="Choose avatar"
                >
                  <Avatar size="md" />
                </button>
              </div>

              {/* Dark stats bar */}
              <div className="relative mt-8 rounded-[1.4rem] bg-[#3f3b39]/60 backdrop-blur-md px-6 py-5 text-[#fcfbfa] shadow-lg border border-white/10 overflow-hidden z-10">
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#f5efe6]/20 blur-2xl" />

                <div className="flex flex-row items-center justify-between gap-4">

                  {/* Streak badge */}
                  <div className="relative z-10 flex flex-col items-center justify-center pl-2">
                    <div className="flex flex-col items-center drop-shadow-md">
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill="url(#flame-gradient)"
                        stroke="url(#flame-gradient)"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-sm"
                      >
                        <defs>
                          <linearGradient id="flame-gradient" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                        </defs>
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      {statsLoading ? (
                        <span className="mt-0.5 inline-block h-12 w-10 animate-pulse rounded-md bg-white/20" />
                      ) : (
                        <p className="mt-0.5 text-5xl font-serif text-white font-bold leading-none">
                          {currentStreak}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">
                      Day Streak
                    </p>
                    <div className="mt-1">
                      <ReadAloud
                        text={`Current streak: ${currentStreak} days`}
                        size="xs"
                      />
                    </div>
                  </div>

                  {/* Today / This week mini stats */}
                  <div className="relative z-10 flex flex-col gap-2 text-right">
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60">
                        Today
                      </p>
                      {statsLoading ? (
                        <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/20" />
                      ) : (
                        <p className="text-xl font-serif text-white font-medium">
                          {todayMinutes} <span className="text-xs text-white/70">min</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60">
                        This week
                      </p>
                      {statsLoading ? (
                        <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/20" />
                      ) : (
                        <p className="text-xl font-serif text-white font-medium">
                          {weekMinutes} <span className="text-xs text-white/70">min</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="relative z-10 flex flex-col gap-2.5 shrink-0">
                    <button
                      onClick={() => window.open('https://www.gutenberg.org', '_blank')}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md px-4 min-w-[130px] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-white/20 hover:border-white/40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 drop-shadow-sm">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      Free Books
                    </button>
                    <button
                      onClick={() => window.open('https://openlibrary.org', '_blank')}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md px-4 min-w-[130px] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-white/20 hover:border-white/40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 drop-shadow-sm">
                        <path d="M4 22h16" /><path d="M4 2h16" /><path d="M6 2v20" />
                        <path d="M10 2v20" /><path d="M14 2v20" /><path d="M18 2v20" />
                      </svg>
                      Library
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Currently Reading Panel */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-[#eeebe4] bg-white p-6 md:col-span-5 lg:col-span-4 lg:p-8 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8a8178]">
                    Now Reading
                  </p>
                  <ReadAloud text={nowReadingLabel} size="xs" />
                </div>

                {/* Show first book title as heading if available */}
                {!booksLoading && currentBooks.length > 0 && (
                  <h3 className="mt-1 line-clamp-2 text-2xl font-serif font-medium text-[#2b2724]">
                    {currentBooks[0].title}
                    {currentBooks.length > 1 && (
                      <span className="ml-2 text-sm font-sans font-normal text-[#8a8178]">
                        +{currentBooks.length - 1} more
                      </span>
                    )}
                  </h3>
                )}

                {!booksLoading && currentBooks.length === 0 && (
                  <h3 className="mt-1 text-xl font-serif font-medium text-[#9a9390]">
                    No book yet
                  </h3>
                )}

                {booksLoading && (
                  <div className="mt-1 h-8 w-40 animate-pulse rounded-md bg-[#f0ece4]" />
                )}
              </div>

              {/* Book image or list if multiple */}
              {!booksLoading && currentBooks.length <= 1 ? (
                <div className="mt-4 flex flex-1 items-center justify-center p-2">
                  <img
                    src="/floating_open_book.png"
                    alt="Current reading"
                    className="w-full max-w-[200px] h-auto object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105 drop-shadow-sm opacity-90"
                  />
                </div>
              ) : (
                <div className="mt-4 flex-1">
                  <CurrentlyReadingPanel books={currentBooks} loading={booksLoading} />
                </div>
              )}

              {booksLoading && (
                <div className="mt-4 flex flex-1 items-center justify-center p-2">
                  <div className="h-40 w-40 animate-pulse rounded-2xl bg-[#f0ece4]" />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate('/read-now')}
                  className="w-full rounded-xl bg-[#3f3b39]/80 backdrop-blur-md border border-[#3f3b39] py-3.5 text-sm font-semibold text-[#fcfbfa] shadow-sm transition hover:bg-[#2e2b2a]/90"
                >
                  Read Now
                </button>
                <button
                  onClick={() => navigate('/log-reading')}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8c6b4a] to-[#73583d] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8c6b4a]/20 transition hover:scale-[1.02] hover:shadow-lg"
                >
                  Log Time
                </button>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <section className="mb-8">
            <div className="mb-5 pl-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a8178]">
                Stats
              </h3>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-y-8 gap-x-4 px-2 sm:px-4">
              <InlineStat
                label="Goals"
                value={`${goalsCompleted}`}
                readText={`Goals met: ${goalsCompleted}`}
                loading={false}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                    <path d="m22 2-6.5 6.5"/><path d="M22 2v4"/><path d="M22 2h-4"/>
                  </svg>
                }
              />
              <InlineStat
                label="Minutes"
                value={totalMinutes.toLocaleString()}
                readText={`Minutes read: ${totalMinutes.toLocaleString()}`}
                loading={statsLoading}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M10 2h4"/><path d="M12 2v3"/>
                  </svg>
                }
              />
              <InlineStat
                label="Books"
                value={`${booksFinished}`}
                readText={`Books read: ${booksFinished}`}
                loading={statsLoading}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                  </svg>
                }
              />
              <InlineStat
                label="Streak"
                value={`${currentStreak}`}
                readText={`Reading streak: ${currentStreak}`}
                loading={statsLoading}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path d="M5 3v4"/><path d="M7 5H3"/>
                  </svg>
                }
              />
            </div>
          </section>

        </div>
      </main>

      <footer className="mt-12 hidden border-t border-[#e8e4db] md:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8a8178] sm:px-6 lg:px-10">
          Turn The Page
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

export default Home
