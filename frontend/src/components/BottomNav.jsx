import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-md mx-auto flex justify-between items-center text-gray-500">
        <button 
          onClick={() => navigate('/')} 
          className={`flex flex-col items-center ${isActive('/') ? 'text-blue-600' : ''}`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => navigate('/goals')} 
          className={`flex flex-col items-center ${isActive('/goals') ? 'text-blue-600' : ''}`}
        >
          <span className="text-xl">🎯</span>
          <span className="text-xs mt-1">Goals</span>
        </button>
        <button 
          onClick={() => navigate('/shop')} 
          className={`flex flex-col items-center ${isActive('/shop') ? 'text-blue-600' : ''}`}
        >
          <span className="text-xl">🛒</span>
          <span className="text-xs mt-1">Shop</span>
        </button>
      </div>
    </div>
  )
}

export default BottomNav
