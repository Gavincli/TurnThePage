import React, { useState, useEffect, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'
import HamburgerMenu from '../components/HamburgerMenu'
import { useApp } from '../context/AppContext'

const avatarEmojiMap = {
  cat: '🐱',
  bunny: '🐰',
  bear: '🐻',
  fox: '🦊',
  owl: '🦉',
  star: '🌟',
}

const backgroundOptions = [
  { id: 'bg-slate-100', colorClass: 'bg-slate-100', name: 'Slate', minMinutes: 0 },
  { id: 'bg-pink-100', colorClass: 'bg-pink-100', name: 'Pink', minMinutes: 0 },
  { id: 'bg-violet-100', colorClass: 'bg-violet-100', name: 'Violet', minMinutes: 10 },
  { id: 'bg-indigo-100', colorClass: 'bg-indigo-100', name: 'Indigo', minMinutes: 20 },
  { id: 'bg-sky-100', colorClass: 'bg-sky-100', name: 'Sky', minMinutes: 30 },
  { id: 'bg-emerald-100', colorClass: 'bg-emerald-100', name: 'Emerald', minMinutes: 40 },
  { id: 'bg-amber-100', colorClass: 'bg-amber-100', name: 'Amber', minMinutes: 50 },
  { id: 'bg-orange-100', colorClass: 'bg-orange-100', name: 'Orange', minMinutes: 60 },
  { id: 'bg-rose-100', colorClass: 'bg-rose-100', name: 'Rose', minMinutes: 80 },
  { id: 'bg-park', colorClass: 'bg-gradient-to-b from-sky-300 via-sky-200 to-green-400', name: 'Park', minMinutes: 90 },
  { id: 'bg-beach', colorClass: 'bg-gradient-to-b from-sky-400 via-cyan-200 to-amber-200', name: 'Beach', minMinutes: 100 },
  { id: 'bg-sunset', colorClass: 'bg-gradient-to-b from-orange-400 via-rose-300 to-purple-400', name: 'Sunset', minMinutes: 500 },
  { id: 'bg-night', colorClass: 'bg-gradient-to-b from-slate-900 via-indigo-900 to-purple-900', name: 'Night', minMinutes: 1000 },
  { id: 'bg-magic', colorClass: 'bg-gradient-to-br from-fuchsia-300 via-purple-300 to-pink-300', name: 'Magic', minMinutes: 2000 },
]

const wearableOptions = [
  { id: 'none', emoji: '🚫', name: 'None', minMinutes: 0 },
  { id: 'crown', emoji: '👑', name: 'Crown', minMinutes: 0 },
  { id: 'cap', emoji: '🧢', name: 'Cap', minMinutes: 10 },
  { id: 'glasses', emoji: '👓', name: 'Glasses', minMinutes: 20 },
  { id: 'bow', emoji: '🎀', name: 'Bow', minMinutes: 30 },
  { id: 'flower', emoji: '🌸', name: 'Flower', minMinutes: 40 },
  { id: 'headphones', emoji: '🎧', name: 'Audio', minMinutes: 50 },
  { id: 'cool', emoji: '🕶️', name: 'Cool', minMinutes: 60 },
  { id: 'dress', emoji: '👗', name: 'Dress', minMinutes: 80 },
  { id: 'shirt', emoji: '👕', name: 'Shirt', minMinutes: 90 },
  { id: 'pants', emoji: '👖', name: 'Pants', minMinutes: 100 },
  { id: 'magichat', emoji: '🎩', name: 'Magic Hat', minMinutes: 500 },
  { id: 'graduation', emoji: '🎓', name: 'Graduation', minMinutes: 2000 },
]

const roomOptions = [
  { id: 'trash', emoji: '🗑️', name: 'Clear All', minMinutes: 0 },
  { id: 'plant', emoji: '🪴', name: 'Plant', minMinutes: 0 },
  { id: 'teddy', emoji: '🧸', name: 'Teddy Bear', minMinutes: 0 },
  { id: 'guitar', emoji: '🎸', name: 'Guitar', minMinutes: 0 },
  { id: 'bed', emoji: '🛏️', name: 'Bed', minMinutes: 10 },
  { id: 'window', emoji: '🪟', name: 'Window', minMinutes: 20 },
  { id: 'picture', emoji: '🖼️', name: 'Picture', minMinutes: 30 },
  { id: 'lamp', emoji: '🛋️', name: 'Lamp', minMinutes: 40 },
  { id: 'books', emoji: '📚', name: 'Books', minMinutes: 50 },
  { id: 'backpack', emoji: '🎒', name: 'Backpack', minMinutes: 60 },
  { id: 'tree', emoji: '🌳', name: 'Tree', minMinutes: 80 },
  { id: 'palm', emoji: '🌴', name: 'Palm', minMinutes: 90 },
  { id: 'pine', emoji: '🌲', name: 'Pine', minMinutes: 100 },
  { id: 'sun', emoji: '🌞', name: 'Sun', minMinutes: 500 },
  { id: 'moon', emoji: '🌝', name: 'Moon', minMinutes: 500 },
  { id: 'snowman', emoji: '⛄️', name: 'Snowman', minMinutes: 500 },
  { id: 'cake', emoji: '🎂', name: 'Cake', minMinutes: 1000 },
  { id: 'donut', emoji: '🍩', name: 'Donut', minMinutes: 1000 },
  { id: 'popcorn', emoji: '🍿', name: 'Popcorn', minMinutes: 1000 },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', minMinutes: 1000 },
  { id: 'lunch', emoji: '🍱', name: 'Lunch', minMinutes: 1000 },
  { id: 'soccer', emoji: '⚽️', name: 'Soccer', minMinutes: 1500 },
  { id: 'basketball', emoji: '🏀', name: 'Basketball', minMinutes: 1500 },
  { id: 'football', emoji: '🏈', name: 'Football', minMinutes: 1500 },
  { id: 'skateboard', emoji: '🛹', name: 'Skateboard', minMinutes: 1500 },
  { id: 'bike', emoji: '🚲', name: 'Bike', minMinutes: 1500 },
  { id: 'car', emoji: '🚗', name: 'Car', minMinutes: 1500 },
  { id: 'phone', emoji: '📱', name: 'Phone', minMinutes: 1500 },
  { id: 'laptop', emoji: '💻', name: 'Laptop', minMinutes: 1500 },
  { id: 'disco', emoji: '🪩', name: 'Disco', minMinutes: 1500 },
  { id: 'colombia', emoji: '🇨🇴', name: 'Colombia', minMinutes: 2000 },
  { id: 'brazil', emoji: '🇧🇷', name: 'Brazil', minMinutes: 2000 },
  { id: 'korea', emoji: '🇰🇷', name: 'Korea', minMinutes: 2000 },
  { id: 'usa', emoji: '🇺🇸', name: 'USA', minMinutes: 2000 },
  { id: 'door', emoji: '🚪', name: 'Door', minMinutes: 2000 },
  { id: 'mirror', emoji: '🪞', name: 'Mirror', minMinutes: 2000 },
  { id: 'faucet', emoji: '🚰', name: 'Faucet', minMinutes: 2000 },
  { id: 'bath', emoji: '🛁', name: 'Bath', minMinutes: 2000 },
  { id: 'toilet', emoji: '🚽', name: 'Toilet', minMinutes: 2000 },
  { id: 'toiletpaper', emoji: '🧻', name: 'Toilet Paper', minMinutes: 2000 },
  { id: 'toothbrush', emoji: '🪥', name: 'Toothbrush', minMinutes: 2000 },
]

const Shop = () => {
  const { totalMinutes } = useApp()
  const baseAvatar = localStorage.getItem('ttp_avatar') || 'cat'
  const emoji = avatarEmojiMap[baseAvatar] || '🐱'

  const [activeTab, setActiveTab] = useState('backgrounds')
  
  const [selectedBg, setSelectedBg] = useState(() => localStorage.getItem('ttp_shop_bg') || 'bg-slate-100')
  const [selectedWearable, setSelectedWearable] = useState(() => localStorage.getItem('ttp_shop_wearable') || 'none')
  
  // Custom Draggable Wearable Position
  const [wearablePos, setWearablePos] = useState(() => {
    const saved = localStorage.getItem('ttp_shop_wearable_pos')
    return saved ? JSON.parse(saved) : { x: 50, y: 30 } // default above head
  })

  // Draggable Room Items State
  const [placedRoomItems, setPlacedRoomItems] = useState(() => {
    const saved = localStorage.getItem('ttp_shop_placed_items')
    return saved ? JSON.parse(saved) : []
  })

  const containerRef = useRef(null)
  const [draggingItem, setDraggingItem] = useState(null) // { id, startX, startY, origX, origY, pointerId }

  useEffect(() => {
    localStorage.setItem('ttp_shop_bg', selectedBg)
    localStorage.setItem('ttp_shop_wearable', selectedWearable)
    localStorage.setItem('ttp_shop_wearable_pos', JSON.stringify(wearablePos))
  }, [selectedBg, selectedWearable, wearablePos])

  useEffect(() => {
    localStorage.setItem('ttp_shop_placed_items', JSON.stringify(placedRoomItems))
  }, [placedRoomItems])

  const handleSelectWearable = (id) => {
    setSelectedWearable(id)
    // Optional: We keep the old position so they can swap hats freely!
    // If they select "none", the position is saved but hidden.
  }

  const handleAddRoomItem = (typeId) => {
    if (typeId === 'trash') {
      setPlacedRoomItems([])
      return
    }
    // Spawn off to the side (randomized between 70% and 85% X)
    const newItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: typeId,
      x: 70 + Math.random() * 15,
      y: 40 + Math.random() * 20
    }
    setPlacedRoomItems(prev => [...prev, newItem])
  }

  const handleRemoveRoomItem = (id) => {
    setPlacedRoomItems(prev => prev.filter(item => item.id !== id))
  }

  // Pointer Events for Dragging
  const handlePointerDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    
    if (id === 'wearable') {
      setDraggingItem({
        id: 'wearable',
        startX: e.clientX,
        startY: e.clientY,
        origX: wearablePos.x,
        origY: wearablePos.y,
        pointerId: e.pointerId
      });
      return;
    }

    const item = placedRoomItems.find(i => i.id === id);
    if (!item) return;
    
    setDraggingItem({
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      pointerId: e.pointerId
    });
  }

  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate delta in pixels
    const deltaX = e.clientX - draggingItem.startX;
    const deltaY = e.clientY - draggingItem.startY;
    
    // Convert delta to percentage of container
    const deltaPctX = (deltaX / rect.width) * 100;
    const deltaPctY = (deltaY / rect.height) * 100;
    
    if (draggingItem.id === 'wearable') {
      setWearablePos({
        x: Math.max(0, Math.min(100, draggingItem.origX + deltaPctX)),
        y: Math.max(0, Math.min(100, draggingItem.origY + deltaPctY))
      })
    } else {
      setPlacedRoomItems(prev => prev.map(item => {
        if (item.id === draggingItem.id) {
          return {
            ...item,
            x: Math.max(0, Math.min(100, draggingItem.origX + deltaPctX)),
            y: Math.max(0, Math.min(100, draggingItem.origY + deltaPctY))
          };
        }
        return item;
      }));
    }
  }

  const handlePointerUp = (e) => {
    if (draggingItem) {
      try { e.target.releasePointerCapture(draggingItem.pointerId); } catch (err) {}
      setDraggingItem(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-24 md:pb-10 overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      
      <header className="sticky top-0 z-30 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <h1 className="mt-0.5 flex items-center gap-2 text-3xl font-serif font-medium tracking-tight text-[#2b2724]">
              Shop
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8a8178]">
              Customize your look
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-12 flex flex-col lg:flex-row items-center justify-center gap-10 xl:gap-20">
        
        {/* Top / Left Section: Avatar Preview */}
        <section className="w-full lg:w-1/2 flex flex-col items-center lg:items-end justify-center shrink-0">
          <div 
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full max-w-md xl:max-w-lg aspect-square rounded-[3rem] border-4 border-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden transition-colors duration-500 flex flex-col items-center justify-center ${backgroundOptions.find(b => b.id === selectedBg)?.colorClass || 'bg-slate-100'}`}
          >
            {/* Background elements to make it look like a room */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/5 pointer-events-none" />

            {/* Placed Room Items Layer */}
            {placedRoomItems.map(item => (
              <div 
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onDoubleClick={() => handleRemoveRoomItem(item.id)}
                onContextMenu={(e) => { e.preventDefault(); handleRemoveRoomItem(item.id); }}
                className="absolute text-5xl sm:text-7xl opacity-90 drop-shadow-md cursor-grab active:cursor-grabbing hover:scale-[1.1] active:scale-[0.95] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 touch-none select-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  zIndex: draggingItem?.id === item.id ? 20 : 5
                }}
                title="Double-click Room Item to remove"
              >
                {roomOptions.find(r => r.id === item.type)?.emoji}
              </div>
            ))}

            {/* Draggable Wearable Layer */}
            {selectedWearable !== 'none' && (
              <div 
                onPointerDown={(e) => handlePointerDown(e, 'wearable')}
                className="absolute text-5xl sm:text-7xl drop-shadow-lg cursor-grab active:cursor-grabbing hover:scale-[1.1] active:scale-[0.95] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 touch-none select-none"
                style={{
                  left: `${wearablePos.x}%`,
                  top: `${wearablePos.y}%`,
                  zIndex: draggingItem?.id === 'wearable' ? 30 : 20
                }}
                title="Drag to reposition!"
              >
                {wearableOptions.find(w => w.id === selectedWearable)?.emoji}
              </div>
            )}

            {/* Main Emoji Avatar */}
            <div className="relative z-10 flex flex-col items-center justify-center mt-10 pointer-events-none">
              <div className="text-[8rem] sm:text-[10rem] leading-none drop-shadow-2xl z-10 transition-transform duration-300">
                {emoji}
              </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-40 text-xs font-semibold tracking-wider pointer-events-none mix-blend-overlay">
            </div>
          </div>
          <div className="mt-5 flex flex-col items-center w-full max-w-md xl:max-w-lg gap-1 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e0dbd3] bg-white px-5 py-1.5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a4542]">Your Look</span>
              <span className="text-xs text-slate-400">Double-click Room Item to remove</span>
            </div>
          </div>
        </section>

        {/* Bottom / Right Section: Customization Categories & Items */}
        <section className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="w-full max-w-lg xl:max-w-xl rounded-[2rem] border border-white/70 bg-white/85 p-5 sm:p-8 xl:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {['backgrounds', 'wearables', 'room'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Items Grid — fixed height so layout never shifts between tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 xl:gap-5 h-[50vh] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              
              {activeTab === 'backgrounds' && backgroundOptions.map(bg => {
                const isLocked = bg.minMinutes > totalMinutes
                const isSelected = selectedBg === bg.id
                return (
                  <div key={bg.id} className="relative aspect-square">
                    <button
                      onClick={() => !isLocked && setSelectedBg(bg.id)}
                      disabled={isLocked}
                      title={isLocked ? `🔒 Unlock at ${bg.minMinutes} mins read` : bg.name}
                      className={`w-full h-full rounded-2xl border-4 transition-all duration-200 ${bg.colorClass} ${
                        isLocked
                          ? 'opacity-40 blur-[1.5px] cursor-not-allowed border-white'
                          : isSelected
                            ? 'border-slate-900 shadow-md scale-105 cursor-pointer'
                            : 'border-white hover:scale-105 shadow-sm cursor-pointer'
                      }`}
                      aria-label={isLocked ? `${bg.name} locked` : `Select ${bg.name} background`}
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
                        <span className="text-lg drop-shadow">🔒</span>
                        <span className="text-[9px] font-bold text-slate-600 mt-0.5 bg-white/80 rounded-full px-1.5 py-0.5 leading-none">{bg.minMinutes}m</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {activeTab === 'wearables' && wearableOptions.map(item => {
                const isLocked = item.minMinutes > totalMinutes
                const isSelected = selectedWearable === item.id
                return (
                  <div key={item.id} className="relative aspect-square">
                    <button
                      onClick={() => !isLocked && handleSelectWearable(item.id)}
                      disabled={isLocked}
                      title={isLocked ? `🔒 Unlock at ${item.minMinutes} mins read` : item.name}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-200 ${
                        isLocked
                          ? 'bg-slate-50 border-slate-200 opacity-40 blur-[1.5px] cursor-not-allowed'
                          : isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105 cursor-pointer'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:scale-105 cursor-pointer'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                      <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center px-1 ${isSelected && !isLocked ? 'text-slate-200' : 'text-slate-500'}`}>
                        {item.name}
                      </span>
                    </button>
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
                        <span className="text-lg drop-shadow">🔒</span>
                        <span className="text-[9px] font-bold text-slate-600 mt-0.5 bg-white/80 rounded-full px-1.5 py-0.5 leading-none">{item.minMinutes}m</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {activeTab === 'room' && roomOptions.map(item => {
                const isLocked = item.minMinutes > totalMinutes
                const isClear = item.id === 'trash'
                return (
                  <div key={item.id} className="relative aspect-square">
                    <button
                      onClick={() => !isLocked && handleAddRoomItem(item.id)}
                      disabled={isLocked}
                      title={isLocked ? `🔒 Unlock at ${item.minMinutes} mins read` : isClear ? 'Clear all room items' : `Add ${item.name}`}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-200 ${
                        isLocked
                          ? 'bg-slate-50 border-slate-200 opacity-40 blur-[1.5px] cursor-not-allowed'
                          : isClear
                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 shadow-sm hover:scale-105 cursor-pointer'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:scale-105 cursor-pointer'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                      <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center px-1 text-slate-500">
                        {item.name}
                      </span>
                    </button>
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
                        <span className="text-lg drop-shadow">🔒</span>
                        <span className="text-[9px] font-bold text-slate-600 mt-0.5 bg-white/80 rounded-full px-1.5 py-0.5 leading-none">{item.minMinutes}m</span>
                      </div>
                    )}
                  </div>
                )
              })}

            </div>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

export default Shop
