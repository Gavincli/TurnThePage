import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const HamburgerMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/log-reading', label: 'Log Reading', icon: '✏️' },
    { path: '/shop', label: 'Shop', icon: '🛒' },
    { path: '/friends', label: 'Friends', icon: '👥' },
    { path: '/avatar', label: 'Avatar', icon: '🙂' },
  ]

  const isActive = (path) => location.pathname === path

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Mobile burger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-2 md:flex">
        {navItems
          .filter((item) => item.path !== '/avatar')
          .map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(path)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
      </nav>

      {/* Mobile dropdown */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/10 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu overlay"
          />

          <div className="absolute right-0 top-14 z-40 w-64 overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-2 shadow-[0_18px_44px_rgba(15,23,42,0.18)] backdrop-blur-xl md:hidden">
            <div className="px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Menu
              </p>
            </div>

            <div className="space-y-1">
              {navItems.map(({ path, label, icon }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => handleNavigate(path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    isActive(path)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HamburgerMenu