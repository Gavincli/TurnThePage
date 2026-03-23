import React, { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext()

const USER_ID = '11111111-1111-1111-1111-111111111111'
const API = 'http://localhost:4000'

export const AppProvider = ({ children }) => {
  // --- Stats (streak, minutes, books) ---
  const [currentStreak, setCurrentStreak] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [weekMinutes, setWeekMinutes] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [booksFinished, setBooksFinished] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // --- Currently reading books ---
  const [currentBooks, setCurrentBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(true)

  // --- Goals ---
  const [goalsCompleted, setGoalsCompleted] = useState(0)

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

  const [goalProgress, setGoalProgress] = useState(sampleGoals)

  // --- Fetch stats from /api/stats ---
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API}/api/stats?userId=${USER_ID}`)
        if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`)
        const data = await res.json()
        setCurrentStreak(data.streak ?? 0)
        setTodayMinutes(data.todayMinutes ?? 0)
        setWeekMinutes(data.weekMinutes ?? 0)
        setTotalMinutes(data.totalMinutes ?? 0)
        setBooksFinished(data.booksFinished ?? 0)
      } catch (err) {
        console.error('Failed to load stats from backend, using defaults.', err)
        // Defaults remain 0 — cleaner than showing fake numbers
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [])

  // --- Fetch current (unfinished) books from /api/books/current ---
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await fetch(`${API}/api/books/current?userId=${USER_ID}`)
        if (!res.ok) throw new Error(`Books fetch failed: ${res.status}`)
        const data = await res.json()
        // Only unfinished books — backend already filters is_finished = false
        setCurrentBooks(data.books ?? [])
      } catch (err) {
        console.error('Failed to load current books from backend.', err)
        setCurrentBooks([])
      } finally {
        setBooksLoading(false)
      }
    }

    loadBooks()
  }, [])

  // --- Fetch goals from /api/goals ---
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await fetch(`${API}/api/goals?userId=${USER_ID}`)
        const data = await res.json()
        const goals = data.goals || []

        if (!goals.length) {
          setGoalProgress(sampleGoals)
          setGoalsCompleted(sampleGoals.filter((g) => g.completed).length)
          return
        }

        const mapped = goals.map((g, index) => ({
          id: g.id ?? index + 1,
          name: g.title,
          description: g.description,
          current: g.progress,
          target: g.target,
          completed: g.isCompleted,
          icon: g.icon || '📖',
          period: g.period || 'daily',
        }))

        setGoalProgress(mapped)
        setGoalsCompleted(mapped.filter((g) => g.completed).length)
      } catch (err) {
        console.error('Failed to load goals from backend, using sample goals instead.', err)
        setGoalProgress(sampleGoals)
        setGoalsCompleted(sampleGoals.filter((g) => g.completed).length)
      }
    }

    loadGoals()
  }, [])

  const value = {
    // Stats
    currentStreak,
    todayMinutes,
    weekMinutes,
    totalMinutes,
    booksFinished,
    statsLoading,
    // Books
    currentBooks,
    booksLoading,
    // Goals
    goalsCompleted,
    goalProgress,
    setGoalProgress,
    // User
    userId: USER_ID,
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
