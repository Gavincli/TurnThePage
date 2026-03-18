import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const FIXED_GOALS = [
  { id: 1, name: 'Read 10 minutes', target: 10, icon: '⏱️' },
  { id: 2, name: 'Read 20 pages', target: 20, icon: '📄' },
  { id: 3, name: 'Read before bed', target: 1, icon: '🌙' },
  { id: 4, name: 'Read without distractions', target: 1, icon: '🧠' },
  { id: 5, name: 'Log a reading session', target: 1, icon: '✏️' },
  { id: 6, name: 'Read in the morning', target: 1, icon: '🌅' },
  { id: 7, name: 'Complete 1 chapter', target: 1, icon: '📖' },
]

export const AppProvider = ({ children }) => {
  const [currentStreak, setCurrentStreak] = useState(5)
  const [totalMinutes, setTotalMinutes] = useState(1240)
  const [booksFinished, setBooksFinished] = useState(12)
  const [goalsCompleted, setGoalsCompleted] = useState(8)
  const [currentReading, setCurrentReading] = useState("The Hobbit")
  const [goalProgress] = useState([
    { id: 1, name: 'Read 10 minutes', current: 7, target: 10, completed: false, icon: '⏱️' },
    { id: 2, name: 'Read 20 pages', current: 6, target: 20, completed: false, icon: '📄' },
    { id: 3, name: 'Read before bed', current: 0, target: 1, completed: false, icon: '🌙' },
    { id: 4, name: 'Read without distractions', current: 0, target: 1, completed: false, icon: '🧠' },
    { id: 5, name: 'Log a reading session', current: 1, target: 1, completed: true, icon: '✏️' },
    { id: 6, name: 'Read in the morning', current: 0, target: 1, completed: false, icon: '🌅' },
    { id: 7, name: 'Complete 1 chapter', target: 1, current: 0, completed: false, icon: '📖' },
  ])

  const value = {
    currentStreak,
    totalMinutes,
    booksFinished,
    goalsCompleted,
    currentReading,
    goalProgress,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
