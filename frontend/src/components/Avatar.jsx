import React, { useState } from 'react'

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

const getInitialAvatar = () => {
  const savedAvatar = localStorage.getItem('ttp_avatar')
  return savedAvatar && avatarEmojiMap[savedAvatar] ? savedAvatar : 'cat'
}

const Avatar = ({ size = 'md' }) => {
  const [selectedAvatar] = useState(getInitialAvatar)

  return (
    <div
      className={`flex items-center justify-center rounded-full border shadow-sm ${sizeMap[size] || sizeMap.md} ${avatarThemeMap[selectedAvatar]}`}
      aria-label="User avatar"
    >
      <span>{avatarEmojiMap[selectedAvatar]}</span>
    </div>
  )
}

export default Avatar