import React from 'react'

const sizeMap = {
  xl: 'w-24 h-24 text-4xl',
  lg: 'w-16 h-16 text-3xl',
  md: 'w-12 h-12 text-2xl',
  sm: 'w-8 h-8 text-lg',
}

const avatarThemeMap = {
  cat: 'bg-pink-50 border-pink-100',
  bunny: 'bg-violet-50 border-violet-100',
  bear: 'bg-amber-50 border-amber-100',
  fox: 'bg-orange-50 border-orange-100',
  owl: 'bg-sky-50 border-sky-100',
  star: 'bg-indigo-50 border-indigo-100',
}

const avatarEmojiMap = {
  cat: '🐱',
  bunny: '🐰',
  bear: '🐻',
  fox: '🦊',
  owl: '🦉',
  star: '🌟',
}

const wearableEmojiMap = {
  crown: '👑',
  cap: '🧢',
  party: '🥳',
  glasses: '👓',
  bow: '🎀',
  flower: '🌸',
  headphones: '🎧',
  cool: '🕶️',
  dress: '👗',
  shirt: '👕',
  pants: '👖',
  magichat: '🎩',
  graduation: '🎓',
}

const getInitialAvatar = () => {
  const savedAvatar = localStorage.getItem('ttp_avatar')
  return savedAvatar && avatarEmojiMap[savedAvatar] ? savedAvatar : 'cat'
}

const getWearable = () => {
  return localStorage.getItem('ttp_shop_wearable') || 'none'
}

const Avatar = ({ size = 'md' }) => {
  const selectedAvatar = getInitialAvatar()
  const wearable = getWearable()
  const wearableEmoji = wearableEmojiMap[wearable]

  // Relative sizes for the wearable badge overlay
  const badgeSizeMap = {
    xl: 'text-xl -top-2 -right-2',
    lg: 'text-base -top-1 -right-1',
    md: 'text-sm -top-1 -right-1',
    sm: 'text-xs -top-0.5 -right-0.5',
  }
  const badgeCls = badgeSizeMap[size] || badgeSizeMap.md

  return (
    <div
      className={`relative flex items-center justify-center rounded-full border shadow-sm ${sizeMap[size] || sizeMap.md} ${avatarThemeMap[selectedAvatar]}`}
      aria-label="User avatar"
    >
      <span>{avatarEmojiMap[selectedAvatar]}</span>
      {wearableEmoji && (
        <span
          className={`absolute ${badgeCls} leading-none`}
          aria-hidden="true"
        >
          {wearableEmoji}
        </span>
      )}
    </div>
  )
}

export default Avatar