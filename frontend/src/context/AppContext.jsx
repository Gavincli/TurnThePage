import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentStreak, setCurrentStreak] = useState(5)
  const [totalMinutes, setTotalMinutes] = useState(1240)
  const [booksFinished, setBooksFinished] = useState(12)
  const [goalsCompleted, setGoalsCompleted] = useState(8)
  const [currentReading, setCurrentReading] = useState("The Hobbit")

  const value = {
    currentStreak,
    totalMinutes,
    booksFinished,
    goalsCompleted,
    currentReading,
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
