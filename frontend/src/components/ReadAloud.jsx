import React from 'react'

const ReadAloud = ({ text, size = 'md' }) => {
  const handleClick = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Speech synthesis not available (e.g. server-side or very old browser).
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    // Optionally tweak voice/rate here if needed.
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-gray-400 hover:text-blue-500 transition-colors ml-2 ${
        size === 'xs' ? 'text-xs'
          : size === 'sm' ? 'text-sm'
            : 'text-base'
      }`}
      aria-label={`Read aloud: ${text}`}
    >
      🔊
    </button>
  )
}

export default ReadAloud
