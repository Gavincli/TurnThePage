import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import HamburgerMenu from '../components/HamburgerMenu'
import ReadAloud from '../components/ReadAloud'

const avatarOptions = [
  {
    id: 'cat',
    emoji: '🐱',
    name: 'Cat',
    description: 'Playful and curious',
    bg: 'bg-pink-50 border-pink-200',
  },
  {
    id: 'bunny',
    emoji: '🐰',
    name: 'Bunny',
    description: 'Sweet and gentle',
    bg: 'bg-violet-50 border-violet-200',
  },
  {
    id: 'bear',
    emoji: '🐻',
    name: 'Bear',
    description: 'Calm and strong',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'fox',
    emoji: '🦊',
    name: 'Fox',
    description: 'Smart and bright',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'owl',
    emoji: '🦉',
    name: 'Owl',
    description: 'Wise and focused',
    bg: 'bg-sky-50 border-sky-200',
  },
  {
    id: 'star',
    emoji: '🌟',
    name: 'Star',
    description: 'Shining and brave',
    bg: 'bg-indigo-50 border-indigo-200',
  },
]

const AvatarSelect = () => {
  const navigate = useNavigate()
  const [selectedAvatar, setSelectedAvatar] = useState('cat')

  useEffect(() => {
    const savedAvatar = localStorage.getItem('ttp_avatar')
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('ttp_avatar', selectedAvatar)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Turn The Page
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Choose your avatar
              <ReadAloud text="Choose your avatar" />
            </h1>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white text-5xl shadow-sm">
              {avatarOptions.find((avatar) => avatar.id === selectedAvatar)?.emoji}
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              Pick the character that feels like you
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              Your avatar will appear on your home page and can be changed anytime.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {avatarOptions.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id

              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`rounded-[1.5rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${avatar.bg} ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 shadow-md'
                      : 'shadow-sm'
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    {avatar.emoji}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {avatar.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {avatar.description}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate('/')}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back home
            </button>

            <button
              onClick={handleSave}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.28)] transition duration-200 hover:scale-[1.01]"
            >
              Save avatar
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-10 hidden border-t border-slate-200/80 md:block">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
          © 2026 Turn The Page. Built to support better reading habits.
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

export default AvatarSelect