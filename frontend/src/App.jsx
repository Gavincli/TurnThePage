import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Home from './pages/Home'
import Goals from './pages/Goals'
import ReadNow from './pages/ReadNow'
import LogReading from './pages/LogReading'
import Shop from './pages/Shop'


function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/read-now" element={<ReadNow />} />
          <Route path="/log-reading" element={<LogReading />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
