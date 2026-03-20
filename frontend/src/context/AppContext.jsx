import React, { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentStreak] = useState(5)
  const [totalMinutes] = useState(1240)
  const [booksFinished] = useState(12)
  const [goalsCompleted, setGoalsCompleted] = useState(0)
  const [currentReading] = useState('The Hobbit')

  // Goals should ultimately come from the backend/database.
  // For now, we keep example goals here as a fallback so the UI can show
  // the expected structure for daily, weekly, and monthly goals.
  // This helps the backend team understand the shape the frontend expects.
  const sampleGoals = [
    {
      id: 1,
      name: 'Read 10 minutes',
      description: 'Complete one focused reading session',
      current: 4,
      target: 10,
      completed: false,
      icon: '📖',
      period: 'daily',
    },
    {
      id: 2,
      name: 'Read 30 minutes',
      description: 'Build your reading habit for today',
      current: 10,
      target: 30,
      completed: false,
      icon: '⏱️',
      period: 'daily',
    },
    {
      id: 3,
      name: 'Read 5 days this week',
      description: 'Stay consistent during the week',
      current: 2,
      target: 5,
      completed: false,
      icon: '🗓️',
      period: 'weekly',
    },
    {
      id: 4,
      name: 'Read 120 minutes this week',
      description: 'Accumulate reading time this week',
      current: 45,
      target: 120,
      completed: false,
      icon: '📚',
      period: 'weekly',
    },
    {
      id: 5,
      name: 'Finish 1 book this month',
      description: 'Reach one monthly reading milestone',
      current: 0,
      target: 1,
      completed: false,
      icon: '🌙',
      period: 'monthly',
    },
    {
      id: 6,
      name: 'Read 600 minutes this month',
      description: 'Grow your reading stamina over time',
      current: 140,
      target: 600,
      completed: false,
      icon: '✨',
      period: 'monthly',
    },
  ]

  // Goals loaded from the backend API.
  // If the backend is not ready yet or does not return the expected shape,
  // we fall back to sampleGoals so the frontend still shows the intended design.
  const [goalProgress, setGoalProgress] = useState(sampleGoals)

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await fetch(
          'http://localhost:4000/api/goals?userId=11111111-1111-1111-1111-111111111111'
        )
        const data = await res.json()
        const goals = data.goals || []

        // If the backend returns no goals yet, keep the sample goals.
        if (!goals.length) {
          setGoalProgress(sampleGoals)
          setGoalsCompleted(sampleGoals.filter((g) => g.completed).length)
          return
        }

        const mapped = goals.map((g, index) => ({
          id: g.id ?? index + 1,

          // Frontend display fields
          name: g.title,
          description: g.description,
          current: g.progress,
          target: g.target,
          completed: g.isCompleted,
          icon: g.icon || '📖',

          // IMPORTANT:
          // period is needed by the Goals page to decide whether a goal belongs
          // in the Daily, Weekly, or Monthly section.
          // Expected values: 'daily', 'weekly', 'monthly'
          //
          // If the backend is not sending period yet, we default to 'daily'
          // so the UI still renders instead of breaking.
          period: g.period || 'daily',
        }))

        setGoalProgress(mapped)
        setGoalsCompleted(mapped.filter((g) => g.completed).length)
      } catch (err) {
        console.error('Failed to load goals from backend, using sample goals instead.', err)

        // Fallback to sample goals so the frontend still demonstrates
        // the intended structure and UI even if the backend is unavailable.
        setGoalProgress(sampleGoals)
        setGoalsCompleted(sampleGoals.filter((g) => g.completed).length)
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