import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/log-reading', labelShort: 'Log', label: 'Log Reading', icon: '✏️' },
    { path: '/shop', label: 'Shop', icon: '🛒' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e4db] bg-white/90 backdrop-blur-2xl safe-area-pb md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {navItems.map(({ path, label, labelShort, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all duration-300 ${
              isActive(path)
                ? 'bg-[#f4ece1] text-[#3f3b39] shadow-sm'
                : 'text-[#a69e98] hover:bg-[#faf7f2] hover:text-[#6b645d]'
            }`}
          >
            <span className="text-[22px] leading-none">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {labelShort || label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav