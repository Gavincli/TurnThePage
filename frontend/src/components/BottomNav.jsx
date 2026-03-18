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
    { path: '/friends', label: 'Friends', icon: '👥' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-neutral-200/80 safe-area-pb">
      <div className="max-w-lg mx-auto px-4 py-2 flex justify-around items-center">
        {navItems.map(({ path, label, labelShort, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[56px] ${
              isActive(path)
                ? 'text-[#007AFF]'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <span className="text-[22px] leading-none">{icon}</span>
            <span className="text-[10px] font-medium">
              <span className="sm:hidden">{labelShort || label}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
