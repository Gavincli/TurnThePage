import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const HamburgerMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/log-reading', label: 'Log Time', icon: '✏️' },
    { path: '/shop', label: 'Shop', icon: '🛒' },
    { path: '/avatar', label: 'Avatar', icon: '🙂' },
  ]

  const isActive = (path) => location.pathname === path

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Mobile burger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-xl p-2 text-[#6b645d] transition hover:bg-[#f5efe6] md:hidden"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-2 md:flex">
        {navItems
          .filter((item) => item.path !== '/avatar')
          .map(({ path, label }) => {
            const active = isActive(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition bg-transparent hover:bg-[#f5efe6] hover:text-[#2b2724] ${
                  active
                    ? 'shadow-inner inset-shadow-sm border-b-2 border-[#3f3b39] text-[#2b2724]'
                    : 'text-[#6b645d]'
                }`}
              >
                {label}
              </button>
            )
          })}
        {/* Desktop Logout */}
        <button
          onClick={handleLogout}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
        >
          Log out
        </button>
      </nav>

      {/* Mobile dropdown */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-[#2b2724]/10 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu overlay"
          />

          <div className="absolute right-0 top-14 z-40 w-64 overflow-hidden rounded-[1.4rem] border border-[#e8e4db] bg-white p-2 shadow-[0_18px_44px_rgba(71,63,55,0.08)] md:hidden">
            <div className="px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a8178]">
                Menu
              </p>
            </div>

            <div className="space-y-1">
              {navItems.map(({ path, label, icon }) => {
                const active = isActive(path)
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => handleNavigate(path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-[#f5efe6] text-[#2b2724] border-l-4 border-[#3f3b39]'
                        : 'text-[#4a4542] hover:bg-[#fbf8f5]'
                    }`}
                  >
                    <span className="text-[1.2rem]">{icon}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
              {/* Mobile Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <span className="text-[1.2rem]">🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HamburgerMenu