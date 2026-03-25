import React from 'react'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'

const Shop = () => {
  return (
    <div className="relative min-h-screen bg-white pb-20 px-4 py-6 overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-6">Shop</h1>
        <p>Rewards shop will appear here.</p>
      </div>
      <BottomNav />
    </div>
  )
}

export default Shop
