import React from 'react'

const ReadAloud = ({ text, size = 'md' }) => {
  return (
    <button 
      className={`text-gray-400 hover:text-blue-500 transition-colors ml-2 ${
        size === 'xs' ? 'text-xs' :
        size === 'sm' ? 'text-sm' :
        'text-base'
      }`}
      aria-label={`Read aloud: ${text}`}
    >
      🔊
    </button>
  )
}

export default ReadAloud
