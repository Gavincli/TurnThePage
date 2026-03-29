import React, { useState, useEffect, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'

const avatarEmojiMap = {
  cat: '🐱',
  bunny: '🐰',
  bear: '🐻',
  fox: '🦊',
  owl: '🦉',
  star: '🌟',
}

const backgroundOptions = [
  { id: 'bg-slate-100', colorClass: 'bg-slate-100', name: 'Slate' },
  { id: 'bg-pink-100', colorClass: 'bg-pink-100', name: 'Pink' },
  { id: 'bg-violet-100', colorClass: 'bg-violet-100', name: 'Violet' },
  { id: 'bg-indigo-100', colorClass: 'bg-indigo-100', name: 'Indigo' },
  { id: 'bg-sky-100', colorClass: 'bg-sky-100', name: 'Sky' },
  { id: 'bg-emerald-100', colorClass: 'bg-emerald-100', name: 'Emerald' },
  { id: 'bg-amber-100', colorClass: 'bg-amber-100', name: 'Amber' },
  { id: 'bg-orange-100', colorClass: 'bg-orange-100', name: 'Orange' },
  { id: 'bg-rose-100', colorClass: 'bg-rose-100', name: 'Rose' },
  { id: 'bg-park', colorClass: 'bg-gradient-to-b from-sky-300 via-sky-200 to-green-400', name: 'Park' },
  { id: 'bg-beach', colorClass: 'bg-gradient-to-b from-sky-400 via-cyan-200 to-amber-200', name: 'Beach' },
  { id: 'bg-sunset', colorClass: 'bg-gradient-to-b from-orange-400 via-rose-300 to-purple-400', name: 'Sunset' },
  { id: 'bg-night', colorClass: 'bg-gradient-to-b from-slate-900 via-indigo-900 to-purple-900', name: 'Night' },
  { id: 'bg-magic', colorClass: 'bg-gradient-to-br from-fuchsia-300 via-purple-300 to-pink-300', name: 'Magic' },
]

const wearableOptions = [
  { id: 'none', emoji: '🚫', name: 'None' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'cap', emoji: '🧢', name: 'Cap' },
  { id: 'party', emoji: '🥳', name: 'Party Hat' },
  { id: 'glasses', emoji: '👓', name: 'Glasses' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'flower', emoji: '🌸', name: 'Flower' },
  { id: 'headphones', emoji: '🎧', name: 'Audio' },
  { id: 'cool', emoji: '🕶️', name: 'cool' },
  { id: 'dress', emoji: '👗', name: 'dress' },
  { id: 'shirt', emoji: '👕', name: 'shirt' },
  { id: 'pants', emoji: '👖', name: 'pants' },
  { id: 'magichat', emoji: '🎩', name: 'magichat' },
  { id: 'graduation', emoji: '🎓', name: 'graduation' },

]

const roomOptions = [
  { id: 'trash', emoji: '🗑️', name: 'Clear All' },
  { id: 'plant', emoji: '🪴', name: 'Plant' },
  { id: 'teddy', emoji: '🧸', name: 'Teddy Bear' },
  { id: 'guitar', emoji: '🎸', name: 'Guitar' },
  { id: 'bed', emoji: '🛏️', name: 'Bed' },
  { id: 'window', emoji: '🪟', name: 'Window' },
  { id: 'picture', emoji: '🖼️', name: 'Picture' },
  { id: 'lamp', emoji: '🛋️', name: 'Lamp' },
  { id: 'books', emoji: '📚', name: 'Books' },
  { id: 'backpack', emoji: '🎒', name: 'Backpack' },
  { id: 'tree', emoji: '🌳', name: 'Tree' },
  { id: 'palm', emoji: '🌴', name: 'Palm' },
  { id: 'pine', emoji: '🌲', name: 'Pine' },
  { id: 'sun', emoji: '🌞', name: 'Sun' },
  { id: 'moon', emoji: '🌝', name: 'Moon' },
  { id: 'snowman', emoji: '⛄️', name: 'Snowman' },
  { id: 'cake', emoji: '🎂', name: 'Cake' },
  { id: 'donut', emoji: '🍩', name: 'Donut' },
  { id: 'popcorn', emoji: '🍿', name: 'Popcorn' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream' },
  { id: 'lunch', emoji: '🍱', name: 'Lunch' },
  { id: 'soccer', emoji: '⚽️', name: 'Soccer' },
  { id: 'basketball', emoji: '🏀', name: 'Basketball' },
  { id: 'football', emoji: '🏈', name: 'Football' },
  { id: 'skateboard', emoji: '🛹', name: 'Skateboard' },
  { id: 'bike', emoji: '🚲', name: 'Bike' },
  { id: 'car', emoji: '🚗', name: 'Car' },
  { id: 'phone', emoji: '📱', name: 'Phone' },
  { id: 'laptop', emoji: '💻', name: 'Laptop' },
  { id: 'disco', emoji: '🪩', name: 'Disco' },
  { id: 'colombia', emoji: '🇨🇴', name: 'Colombia' },
  { id: 'brazil', emoji: '🇧🇷', name: 'Brazil' },
  { id: 'korea', emoji: '🇰🇷', name: 'Korea' },
  { id: 'usa', emoji: '🇺🇸', name: 'USA' },
  { id: 'door', emoji: '🚪', name: 'Door' },
  { id: 'mirror', emoji: '🪞', name: 'Mirror' },
  { id: 'faucet', emoji: '🚰', name: 'Faucet' },
  { id: 'bath', emoji: '🛁', name: 'Bath' },
  { id: 'toilet', emoji: '🚽', name: 'Toilet' },
  { id: 'toiletpaper', emoji: '🧻', name: 'Toilet Paper' },
  { id: 'toothbrush', emoji: '🪥', name: 'Toothbrush' },
]

const Shop = () => {
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
    <div className="relative min-h-screen bg-white pb-24 md:pb-10 overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Closet
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8 flex flex-col md:flex-row gap-8">
        
        {/* Top / Left Section: Avatar Preview */}
        <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center shrink-0">
          <div 
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full max-w-sm aspect-square rounded-[3rem] border-4 border-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden transition-colors duration-500 flex flex-col items-center justify-center ${selectedBg}`}
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
                title="Double-click to remove"
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
              Drop items around avatar
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-slate-500 uppercase tracking-widest text-center">
            Your Look <br/>
            <span className="text-xs text-slate-400 normal-case tracking-normal">Double-click items to remove</span>
          </p>
        </section>

        {/* Bottom / Right Section: Customization Categories & Items */}
        <section className="w-full md:w-1/2 lg:w-3/5">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            
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

            {/* Items Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              
              {activeTab === 'backgrounds' && backgroundOptions.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg.id)}
                  className={`aspect-square rounded-2xl border-4 transition-all duration-200 ${bg.colorClass} ${
                    selectedBg === bg.id
                      ? 'border-slate-900 shadow-md scale-105'
                      : 'border-white hover:scale-105 shadow-sm'
                  }`}
                  aria-label={`Select ${bg.name} background`}
                />
              ))}

              {activeTab === 'wearables' && wearableOptions.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectWearable(item.id)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 ${
                    selectedWearable === item.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:scale-105'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                  <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center px-1 ${selectedWearable === item.id ? 'text-slate-200' : 'text-slate-500'}`}>
                    {item.name}
                  </span>
                </button>
              ))}

              {activeTab === 'room' && roomOptions.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddRoomItem(item.id)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:scale-105`}
                >
                  <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                  <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center px-1 text-slate-500`}>
                    {item.name}
                  </span>
                </button>
              ))}

            </div>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

export default Shop
