import React, { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentStreak] = useState(5)
  const [totalMinutes] = useState(1240)
  const [booksFinished] = useState(12)
  const [goalsCompleted, setGoalsCompleted] = useState(0)
  const [currentReading] = useState("The Hobbit")
  // Goals loaded from the backend API instead of being hard-coded here.
  const [goalProgress, setGoalProgress] = useState([])

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/goals?userId=11111111-1111-1111-1111-111111111111')
        const data = await res.json()
        const goals = data.goals || []

        const mapped = goals.map((g, index) => ({
          id: index + 1,
          name: g.title,
          description: g.description,
          current: g.progress,
          target: g.target,
          completed: g.isCompleted,
          icon: '📖',
        }))

        setGoalProgress(mapped)
        setGoalsCompleted(goals.filter((g) => g.isCompleted).length)
      } catch (err) {
        console.error('Failed to load goals from backend', err)
      }
    }

    loadGoals()
  }, [])

  const value = {
    currentStreak,
    totalMinutes,
    booksFinished,
    goalsCompleted,
    currentReading,
    goalProgress,
    setGoalProgress,
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
