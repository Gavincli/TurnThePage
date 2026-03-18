import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const HamburgerMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/goals', label: 'Goals' },
    { path: '/log-reading', label: 'Log Reading' },
    { path: '/shop', label: 'Shop' },
    { path: '/friends', label: 'Friends' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile button */}
      <button className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden">
        <span className="text-2xl">☰</span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-2 md:flex">
        {navItems.map(({ path, label }) => (
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
    </>
  )
}

export default HamburgerMenu