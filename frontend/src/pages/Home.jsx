import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/Avatar'
import BottomNav from '../components/BottomNav'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'

const Home = () => {
  const navigate = useNavigate()
  const {
    currentStreak,
    totalMinutes,
    booksFinished,
    goalsCompleted,
    currentReading,
  } = useApp()

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              Home
              <ReadAloud text="Home" />
            </h1>
            <HamburgerMenu />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar size="xl" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
              <div className="text-sm text-gray-700 mb-1 flex items-center font-medium">
                Current Streak
                <ReadAloud text={`Current Streak: ${currentStreak} Days`} size="xs" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{currentStreak} Days</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
              <div className="text-sm text-gray-700 mb-1 flex items-center font-medium">
                Goals Completed
                <ReadAloud text={`Goals Completed: ${goalsCompleted} Goals`} size="xs" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">{goalsCompleted} Goals</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-700 mb-1 flex items-center font-medium">
                Minutes Read
                <ReadAloud text={`Minutes Read: ${totalMinutes.toLocaleString()} Minutes`} size="xs" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totalMinutes.toLocaleString()} Min
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
              <div className="text-sm text-gray-700 mb-1 flex items-center font-medium">
                Books Read
                <ReadAloud text={`Books Read: ${booksFinished} Books`} size="xs" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{booksFinished} Books</div>
            </div>
          </div>

          {currentReading && (
            <div className="bg-indigo-50 rounded-xl p-4 border-l-4 border-indigo-500">
              <div className="text-sm text-gray-700 mb-2 flex items-center font-medium">
                Currently Reading
                <ReadAloud text={`Currently Reading: ${currentReading}`} size="xs" />
              </div>
              <div className="text-xl font-bold text-gray-900 flex items-center">
                📚 {currentReading}
                <ReadAloud text={currentReading} size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Resources Section - Prominent */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              📚 Reading Resources
              <ReadAloud text="Reading Resources" size="xs" />
            </h3>
            <button
              onClick={() => navigate('/read-now')}
              className="text-blue-600 font-semibold text-sm hover:text-blue-700 hover:underline flex items-center transition-colors"
            >
              View All →
              <ReadAloud text="View All" size="xs" />
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-4 flex items-center">
            Find free books, libraries, and dictionaries to help you read more
            <ReadAloud text="Find free books, libraries, and dictionaries to help you read more" size="xs" />
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://www.gutenberg.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 hover:bg-gray-100 hover:shadow-md transition-all border border-gray-200"
            >
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium text-gray-900 flex items-center">
                Free eBooks
                <ReadAloud text="Free eBooks" size="xs" />
              </span>
            </a>
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 hover:bg-gray-100 hover:shadow-md transition-all border border-gray-200"
            >
              <span className="text-2xl">📖</span>
              <span className="text-sm font-medium text-gray-900 flex items-center">
                Open Library
                <ReadAloud text="Open Library" size="xs" />
              </span>
            </a>
          </div>
        </div>

        {/* Primary Action: Log Reading */}
        <button
          onClick={() => navigate('/log-reading')}
          className="w-full bg-blue-600 text-white rounded-2xl py-5 px-6 text-xl font-bold shadow-lg hover:bg-blue-700 transition-all mb-6 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">✏️</span>
          <span>Log Reading</span>
          <ReadAloud text="Log Reading" />
        </button>

      </div>

      <BottomNav />
    </div>
  )
}

export default Home
