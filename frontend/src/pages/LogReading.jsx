import React, { useState } from 'react'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'

const quickMinutes = [10, 20, 30, 45]
// I JUST IMPLEMENTED THE POSSIBLE DESIGN. BUT THIS IS NOT HOW THE LOG PAE SHOULD BE, YOU CAN MAKE IT MORE COMPLETE AND BETTER
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
    alert(`Reading logged: ${minutesRead} minutes`)
  }

  return (
    <div className="relative min-h-screen bg-white pb-16 font-sans overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      <header className="sticky top-0 z-30 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <h1 className="mt-0.5 flex items-center gap-2 text-3xl font-serif font-medium tracking-tight text-[#2b2724]">
              Log Time
              <ReadAloud text="Log Time" size="sm" />
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8a8178]">
              {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eeebe4] bg-white p-5 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />

            {/* Soft background illustration */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply transition-opacity duration-700 sm:opacity-[0.35]">
              <img 
                src="/library.png" 
                alt="" 
                className="h-full w-full object-cover object-[center_20%]"
                style={{ maskImage: 'linear-gradient(to right, transparent 10%, black 80%)', WebkitMaskImage: 'linear-gradient(to right, transparent 10%, black 80%)' }}
              />
            </div>

             <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-serif font-medium leading-tight tracking-tight text-[#2b2724] lg:text-[2.2rem] lg:leading-[1.05]">
                    Great job!
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b645d]">
                    Save your time below.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/70 backdrop-blur-md text-[#9c7846] text-2xl shadow-sm border border-white/50">
                  ✏️
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label className="mb-2.5 block text-sm font-bold text-[#6b645d]">
                    Pick time
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickMinutes.map((minutes) => {
                      const isActive = selectedQuick === minutes
                      return (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => handleQuickSelect(minutes)}
                          className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-[#3f3b39] text-[#fcfbfa] shadow-md border border-[#3f3b39]'
                              : 'border border-[#e8e4db] bg-white text-[#4a4542] hover:bg-[#fbf9f5] cursor-pointer shadow-sm'
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
                    className="mb-2.5 block text-sm font-bold text-[#6b645d]"
                  >
                    Minutes
                  </label>
                  <input
                    id="minutesRead"
                    type="number"
                    min="1"
                    value={minutesRead}
                    onChange={handleMinutesChange}
                    className="w-full rounded-xl border border-[#e8e4db] bg-white px-4 py-4 text-xl font-serif font-medium text-[#2b2724] shadow-sm outline-none transition focus:border-[#8c6b4a] focus:ring-4 focus:ring-[#8c6b4a]/10"
                    placeholder="Minutes"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-[1.6rem] bg-gradient-to-r from-[#8c6b4a] to-[#73583d] px-5 py-4.5 text-base font-medium font-serif tracking-wide text-white shadow-lg shadow-[#8c6b4a]/20 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#8c6b4a]/30"
                >
                  Save Time
                </button>
              </form>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-[#e8e4db] bg-white p-6 shadow-md">
              <h3 className="mt-2 text-xl font-serif font-medium tracking-tight text-[#2b2724]">
                Why save?
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                It shows your hard work!
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#e8e4db] bg-white p-6 shadow-md">
              <h3 className="mt-2 text-xl font-serif font-medium tracking-tight text-[#2b2724]">
                Remember
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                Any reading is good reading.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-12 hidden border-t border-[#e8e4db] md:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center text-[#8a8178] sm:px-6 lg:px-10">
          Turn The Page.
        </div>
      </footer>
      <BottomNav />
    </div>
  )
}

export default LogReading