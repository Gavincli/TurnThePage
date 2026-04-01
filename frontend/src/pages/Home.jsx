import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/Avatar'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'



const ResourceCard = ({ href, icon, title, readText }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between rounded-3xl border border-[#e6e2db] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5efe6] text-[#9c7846] text-xl">
          {icon}
        </div>
        <div className="shrink-0 pt-0.5">
          <ReadAloud text={readText} size="xs" />
        </div>
      </div>
      <div>
        <h4 className="mt-4 text-lg font-serif font-medium leading-tight text-[#2b2724]">
          {title}
        </h4>
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
    currentBooks,
    statsLoading,
    booksLoading,
  } = useApp()
  const currentReading = currentBooks[0]?.title

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
              Home
              <ReadAloud text="Home" size="sm" />
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8a8178]">
              {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="space-y-12">
          
          {/* Top Dashboard Row */}
          <section className="grid gap-6 md:grid-cols-12 md:grid-rows-1">
            
            {/* Habit / Overview Panel (Takes 8/12 on large screens) */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#eeebe4] bg-white p-6 md:col-span-8 lg:col-span-9 lg:p-8 shadow-sm">
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
                  <Avatar size="xl" />
                </button>
              </div>

              <div className="relative mt-8 rounded-[1.4rem] bg-[#3f3b39]/60 backdrop-blur-md px-6 py-5 text-[#fcfbfa] shadow-lg border border-white/10 overflow-hidden z-10">
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#f5efe6]/20 blur-2xl" />
                <div className="flex flex-row items-center justify-around sm:justify-start w-full">
                  
                  {/* Streak Compact Badge */}
                  <div className="relative z-10 flex flex-col items-center justify-center pl-2 sm:pl-4">
                    <div className="flex flex-col items-center drop-shadow-md">
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="url(#flame-gradient)" stroke="url(#flame-gradient)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                        <defs>
                          <linearGradient id="flame-gradient" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#f43f5e" /> {/* Rose-500 */}
                            <stop offset="50%" stopColor="#f97316" /> {/* Orange-500 */}
                            <stop offset="100%" stopColor="#fbbf24" /> {/* Amber-400 */}
                          </linearGradient>
                        </defs>
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      <p className="mt-0.5 text-5xl font-serif text-white font-bold leading-none">
                         {statsLoading ? '...' : currentStreak}
                      </p>
                    </div>
                    <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">
                      Day Streak
                    </p>
                    <div className="mt-1">
                      <ReadAloud text={`Current streak: ${currentStreak} days`} size="xs" />
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="relative z-10 w-px h-16 sm:h-24 bg-white/20 shrink-0 mx-4 sm:mx-8" />

                  {/* Other Metrics Grid */}
                  <div className="relative z-10 flex-1 grid grid-cols-3 gap-2 sm:gap-6 divide-x divide-white/20">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 mb-2 drop-shadow-sm"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                      <p className="text-3xl sm:text-4xl font-serif text-white font-bold leading-none">{statsLoading ? '...' : goalsCompleted}</p>
                      <p className="mt-1 sm:mt-2 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80 drop-shadow-sm text-center">Goals</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 mb-2 drop-shadow-sm"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M10 2h4"/><path d="M12 2v3"/></svg>
                      <p className="text-3xl sm:text-4xl font-serif text-white font-bold leading-none">{statsLoading ? '...' : totalMinutes.toLocaleString()}</p>
                      <p className="mt-1 sm:mt-2 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80 drop-shadow-sm text-center">Mins</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 mb-2 drop-shadow-sm"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      <p className="text-3xl sm:text-4xl font-serif text-white font-bold leading-none">{statsLoading ? '...' : booksFinished}</p>
                      <p className="mt-1 sm:mt-2 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80 drop-shadow-sm text-center">Books</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Current Book & Actions Panel (Takes 4/12 on large screens) */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-[#eeebe4] bg-white p-6 md:col-span-4 lg:col-span-3 lg:p-8 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                   <p className="text-xs font-bold uppercase tracking-widest text-[#8a8178]">
                     Now Reading
                   </p>
                   <ReadAloud
                     text={currentReading ? `Now reading ${currentReading}` : 'No book chosen'}
                     size="xs"
                   />
                </div>
                <h3 className="mt-1 line-clamp-2 text-2xl font-serif font-medium text-[#2b2724]">
                  {booksLoading ? 'Loading...' : currentReading || 'No book yet'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6b645d]">
                  {booksLoading
                    ? 'Checking your current books.'
                    : currentReading
                      ? `${currentBooks.length} active ${currentBooks.length === 1 ? 'book' : 'books'} in progress.`
                      : 'Your current book will show up here after you log a session.'}
                </p>
              </div>

              <div className="mt-4 flex flex-1 items-center justify-center p-2">
                <img 
                  src="/floating_book.png" 
                  alt="Current reading" 
                  className="w-full max-w-[130px] h-auto object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105 drop-shadow-sm opacity-90 mx-auto"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate('/log-reading')}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8c6b4a] to-[#73583d] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#8c6b4a]/20 transition hover:scale-[1.02] hover:shadow-lg"
                >
                  Log Time
                </button>
              </div>
            </div>
          </section>

          {/* Resources Row */}
          <section className="mb-8">
            <div className="mb-4 pl-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e0dbd3] bg-white px-4 py-1.5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#4a4542]">
                  Resources
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.open('https://www.gutenberg.org', '_blank')}
                className="group flex flex-col items-center justify-center p-6 bg-white border border-[#eeebe4] rounded-[2rem] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-[#f5efe6] text-[#9c7846] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#2b2724]">Free Books</h3>
                <p className="text-xs text-[#8a8178] mt-1 text-center font-medium">Project Gutenberg</p>
              </button>
              
              <button
                onClick={() => window.open('https://openlibrary.org', '_blank')}
                className="group flex flex-col items-center justify-center p-6 bg-white border border-[#eeebe4] rounded-[2rem] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-[#f5efe6] text-[#9c7846] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16" />
                    <path d="M4 2h16" />
                    <path d="M6 2v20" />
                    <path d="M10 2v20" />
                    <path d="M14 2v20" />
                    <path d="M18 2v20" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#2b2724]">Library</h3>
                <p className="text-xs text-[#8a8178] mt-1 text-center font-medium">Open Library</p>
              </button>
            </div>
          </section>

        </div>
      </main>

      <footer className="relative z-10 mt-12 hidden border-t border-[#e8e4db] md:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-xs font-bold uppercase tracking-widest text-[#6b645d] sm:px-6 lg:px-10">
          Turn The Page
        </div>
      </footer>

      {/* Adding bottom nav back for mobile purely in case user accidentally relied on it, though Hamburger exists. */}
      <BottomNav />
    </div>
  )
}

export default Home