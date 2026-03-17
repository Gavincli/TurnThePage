import React from 'react'

const Avatar = ({ size = 'md' }) => {
  return (
    <div className={`rounded-full bg-gray-200 flex items-center justify-center ${
      size === 'xl' ? 'w-24 h-24' :
      size === 'lg' ? 'w-16 h-16' :
      size === 'sm' ? 'w-8 h-8' :
      'w-12 h-12'
    }`}>
      <span className="text-gray-500">Avatar</span>
    </div>
  )
}

export default Avatar
