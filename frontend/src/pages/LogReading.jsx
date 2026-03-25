import React, { useState, useEffect } from 'react'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'

const API_BASE = 'http://localhost:3001'
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'
const BOOKS_STORAGE_KEY = 'turn-the-page-books'
const BOOK_READS_STORAGE_KEY = 'turn-the-page-book-reads'

const getToday = () => new Date().toISOString().slice(0, 10)

const loadBooks = () => {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveBooks = (books) => {
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
}

const loadBookReads = () => {
  try {
    const raw = localStorage.getItem(BOOK_READS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveBookReads = (reads) => {
  localStorage.setItem(BOOK_READS_STORAGE_KEY, JSON.stringify(reads))
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatMinutes = (mins) => {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

const LogReading = () => {
  const [minutes, setMinutes] = useState('')
  const [pages, setPages] = useState('')
  const [sessionDate, setSessionDate] = useState(getToday())
  const [bookMode, setBookMode] = useState('existing') // 'existing' | 'new'
  const [selectedBookId, setSelectedBookId] = useState('')
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookTotalPages, setNewBookTotalPages] = useState('')
  const [finishedBook, setFinishedBook] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [books, setBooks] = useState([])
  const [bookReads, setBookReads] = useState([])

  useEffect(() => {
    setBooks(loadBooks())
    setBookReads(loadBookReads())
  }, [])

  useEffect(() => {
    document.title = 'Log Reading | Turn the Page'
    return () => { document.title = 'Turn the Page' }
  }, [])

  const validate = () => {
    const next = {}

    const minutesNum = parseInt(minutes, 10)
    if (!minutes.trim()) {
      next.minutes = 'Minutes is required.'
    } else if (Number.isNaN(minutesNum) || minutesNum < 1) {
      next.minutes = 'Minutes must be at least 1.'
    } else if (minutesNum > 9999) {
      next.minutes = 'Minutes must be less than 10,000.'
    }

    if (pages.trim()) {
      const pagesNum = parseInt(pages, 10)
      if (Number.isNaN(pagesNum) || pagesNum < 0) {
        next.pages = 'Pages must be 0 or greater.'
      } else if (pagesNum > 99999) {
        next.pages = 'Pages must be less than 100,000.'
      }
    }

    const dateVal = new Date(sessionDate)
    if (!sessionDate.trim()) {
      next.sessionDate = 'Date is required.'
    } else if (Number.isNaN(dateVal.getTime())) {
      next.sessionDate = 'Please enter a valid date.'
    }

    if (bookMode === 'existing') {
      if (books.length === 0) {
        next.book = 'No books yet. Add a new book below.'
      } else if (!selectedBookId) {
        next.book = 'Please select a book.'
      }
    } else {
      if (!newBookTitle.trim()) {
        next.book = 'Please enter a book title.'
      } else if (newBookTitle.trim().length > 200) {
        next.book = 'Book title must be 200 characters or less.'
      }
      if (newBookTotalPages.trim()) {
        const total = parseInt(newBookTotalPages, 10)
        if (Number.isNaN(total) || total < 1) {
          next.newBookTotalPages = 'Total pages must be at least 1.'
        } else if (total > 99999) {
          next.newBookTotalPages = 'Total pages must be less than 100,000.'
        }
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      let bookId = null

      let bookTotalPagesForReads = null
      if (bookMode === 'existing' && selectedBookId) {
        bookId = selectedBookId
        bookTotalPagesForReads = books.find((b) => b.id === bookId)?.totalPages ?? null
      } else if (bookMode === 'new' && newBookTitle.trim()) {
        const title = newBookTitle.trim()
        const existing = books.find(
          (b) => b.title.toLowerCase() === title.toLowerCase()
        )
        if (existing) {
          bookId = existing.id
          if (newBookTotalPages.trim()) {
            const total = parseInt(newBookTotalPages, 10)
            if (!Number.isNaN(total) && total > 0) {
              const updated = books.map((b) =>
                b.id === existing.id ? { ...b, totalPages: total } : b
              )
              saveBooks(updated)
              setBooks(updated)
              bookTotalPagesForReads = total
            } else {
              bookTotalPagesForReads = existing.totalPages ?? null
            }
          } else {
            bookTotalPagesForReads = existing.totalPages ?? null
          }
        } else {
          const totalPagesVal = newBookTotalPages.trim()
            ? parseInt(newBookTotalPages, 10)
            : null
          const totalPages = totalPagesVal && !Number.isNaN(totalPagesVal) && totalPagesVal > 0
            ? totalPagesVal
            : null
          const newBook = { id: crypto.randomUUID(), title, totalPages }
          const updated = [...books, newBook]
          setBooks(updated)
          saveBooks(updated)
          bookId = newBook.id
          bookTotalPagesForReads = totalPages
        }
      }

      const body = {
        userId: TEST_USER_ID,
        minutesRead: parseInt(minutes, 10),
        sessionDate: sessionDate || getToday(),
        bookId: bookId || undefined,
        pagesRead: pages.trim() ? parseInt(pages, 10) : undefined,
        finishedBook,
      }

      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to log reading. Please try again.' })
        return
      }

      setSubmitSuccess(true)
      setMinutes('')
      setPages('')
      setSessionDate(getToday())
      setSelectedBookId('')
      setNewBookTitle('')
      setNewBookTotalPages('')
      setFinishedBook(false)

      if (bookId) {
        const title = bookMode === 'existing'
          ? books.find((b) => b.id === bookId)?.title ?? 'Unknown'
          : newBookTitle.trim()
        const date = sessionDate || getToday()
        const mins = parseInt(minutes, 10)
        const pgs = pages.trim() ? parseInt(pages, 10) : 0
        const reads = loadBookReads()
        const existing = reads.find((r) => r.bookId === bookId)
        const session = { date, minutes: mins, pages: pgs }
        if (existing) {
          existing.sessions.push(session)
          if (finishedBook) existing.finishedAt = date
          if (bookTotalPagesForReads != null && existing.bookPageCount == null) {
            existing.bookPageCount = bookTotalPagesForReads
          }
        } else {
          reads.push({
            bookId,
            title,
            bookPageCount: bookTotalPagesForReads,
            sessions: [session],
            finishedAt: finishedBook ? date : null,
          })
        }
        saveBookReads(reads)
        setBookReads(reads)
      }
    } catch (err) {
      setErrors({
        submit: 'Could not reach the server. Make sure the backend is running.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-16 font-sans">
        <a
          href="#main-content"
          className="absolute left-4 -top-12 z-30 bg-[#8c6b4a] px-4 py-2 text-white font-medium transition-[top] duration-150 focus:top-4 focus:outline-none focus:ring-4 focus:ring-[#8c6b4a]/50"
        >
          Skip to main content
        </a>
        <header className="sticky top-0 z-20 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <HamburgerMenu />
          </div>
        </header>

        <main id="main-content" role="main" className="mx-auto w-full max-w-7xl px-3 pt-8 sm:px-6 sm:pt-12 lg:px-10">
          <section className="mx-auto max-w-md rounded-[1.5rem] border border-[#eeebe4] bg-white p-6 shadow-[0_8px_32px_rgba(71,63,55,0.04)] text-center sm:rounded-[2rem] sm:p-8">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#8c6b4a]/10 text-3xl">
              ✓
            </div>
            <h2 className="mt-4 text-2xl font-serif font-medium text-[#2b2724]">
              Reading logged!
            </h2>
            <p className="mt-2 text-sm text-[#6b645d]">
              Your progress has been saved.
            </p>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="mt-6 w-full rounded-[1.6rem] bg-gradient-to-r from-[#8c6b4a] to-[#73583d] px-5 py-4 text-base font-medium font-serif tracking-wide text-white shadow-lg shadow-[#8c6b4a]/20 transition hover:scale-[1.01]"
            >
              Log another session
            </button>
          </section>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white pb-16 font-sans overflow-x-hidden text-[#2b2724]">
      <MuseumBackground />
      <header className="sticky top-0 z-30 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8a8178]">
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-16 font-sans">
      <a
        href="#main-content"
        className="absolute left-4 -top-12 z-30 bg-[#8c6b4a] px-4 py-2 text-white font-medium transition-[top] duration-150 focus:top-4 focus:outline-none focus:ring-4 focus:ring-[#8c6b4a]/50"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-20 border-b border-[#e8e4db] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#8a8178]">
              Turn The Page
            </p>
            <h1 className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-2xl font-serif font-medium leading-tight tracking-tight text-[#2b2724] sm:text-3xl">
              Log Reading
              <ReadAloud text="Log Reading" size="sm" />
            </h1>
            <p className="mt-1 text-xs font-medium text-[#8a8178] sm:text-sm">
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              }).format(new Date())}
            </p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eeebe4] bg-white p-5 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />
      <main id="main-content" role="main" className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:gap-5">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6">
              <h3 className="mt-2 text-lg font-serif font-medium tracking-tight text-[#2b2724] sm:text-xl">
                Why log?
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                It shows your hard work and helps you stay consistent.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6">
              <h3 className="mt-2 text-lg font-serif font-medium tracking-tight text-[#2b2724] sm:text-xl">
                Remember
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                Any reading is good reading.
              </p>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply transition-opacity duration-700 sm:opacity-[0.35]"
              style={{
                maskImage: 'linear-gradient(to right, transparent 10%, black 80%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 10%, black 80%)',
              }}
            >
              <img
                src="/library.png"
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width="400"
                height="300"
                className="h-full w-full object-cover object-[center_20%]"
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 max-w-2xl">
                  <h2 className="text-2xl font-serif font-medium leading-tight tracking-tight text-[#2b2724] sm:text-3xl lg:text-[2.2rem]">
                    Log your reading
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#6b645d] sm:mt-3">
                    Track your minutes, pages, and progress.
                  </p>
                </div>
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/70 text-2xl text-[#9c7846] shadow-sm backdrop-blur-md sm:flex">
                  ✏️
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
                {errors.submit && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {errors.submit}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="minutes"
                    className="mb-2.5 block text-sm font-bold text-[#6b645d]"
                  >
                    Minutes <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickMinutes.map((minutes) => {
                      const isActive = selectedQuick === minutes
                      return (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => handleQuickSelect(minutes)}
                          className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-[#3f3b39] text-[#fcfbfa] shadow-md border border-[#3f3b39]'
                              : 'border border-[#e8e4db] bg-white text-[#4a4542] hover:bg-[#fbf9f5] cursor-pointer shadow-sm'
                          }`}
                        >
                          {minutes} min
                        </button>
                      )
                    })}
                  </div>
                  <input
                    id="minutes"
                    type="number"
                    min="1"
                    max="9999"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    onBlur={() =>
                      errors.minutes &&
                      setErrors((p) => ({ ...p, minutes: undefined }))
                    }
                    className={`w-full rounded-xl border px-4 py-4 text-xl font-serif font-medium text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 ${
                      errors.minutes
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                    }`}
                    placeholder="e.g. 25"
                    autoComplete="off"
                    aria-required="true"
                    aria-invalid={!!errors.minutes}
                    aria-describedby={errors.minutes ? 'minutes-error' : undefined}
                  />
                  {errors.minutes && (
                    <p id="minutes-error" className="mt-1.5 text-sm text-red-600">
                      {errors.minutes}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pages"
                    className="mb-2.5 block text-sm font-bold text-[#6b645d]"
                  >
                    Pages (optional)
                  </label>
                  <input
                    id="pages"
                    type="number"
                    min="1"
                    value={minutesRead}
                    onChange={handleMinutesChange}
                    className="w-full rounded-xl border border-[#e8e4db] bg-white px-4 py-4 text-xl font-serif font-medium text-[#2b2724] shadow-sm outline-none transition focus:border-[#8c6b4a] focus:ring-4 focus:ring-[#8c6b4a]/10"
                    placeholder="Minutes"
                    min="0"
                    max="99999"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    onBlur={() =>
                      errors.pages &&
                      setErrors((p) => ({ ...p, pages: undefined }))
                    }
                    className={`w-full rounded-xl border px-3 py-3 text-lg font-serif font-medium text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 sm:px-4 sm:py-4 sm:text-xl ${
                      errors.pages
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                    }`}
                    placeholder="e.g. 15"
                    autoComplete="off"
                    aria-invalid={!!errors.pages}
                    aria-describedby={errors.pages ? 'pages-error' : undefined}
                  />
                  {errors.pages && (
                    <p id="pages-error" className="mt-1.5 text-sm text-red-600">
                      {errors.pages}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="sessionDate"
                    className="mb-2.5 block text-sm font-bold text-[#6b645d]"
                  >
                    Date <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    onBlur={() =>
                      errors.sessionDate &&
                      setErrors((p) => ({ ...p, sessionDate: undefined }))
                    }
                    className={`w-full rounded-xl border px-3 py-3 text-base font-medium text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 sm:px-4 sm:py-4 sm:text-lg ${
                      errors.sessionDate
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                    }`}
                    aria-invalid={!!errors.sessionDate}
                    autoComplete="off"
                    aria-required="true"
                    aria-describedby={
                      errors.sessionDate ? 'sessionDate-error' : undefined
                    }
                  />
                  {errors.sessionDate && (
                    <p
                      id="sessionDate-error"
                      className="mt-1.5 text-sm text-red-600"
                    >
                      {errors.sessionDate}
                    </p>
                  )}
                </div>

                <div>
                  <p id="book-label" className="mb-3 block text-sm font-bold text-[#6b645d]">
                    Book <span className="text-red-500" aria-hidden="true">*</span>
                  </p>
                  <div className="mb-3 flex gap-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="bookMode"
                        checked={bookMode === 'existing'}
                        onChange={() => {
                          setBookMode('existing')
                          setNewBookTitle('')
                          setNewBookTotalPages('')
                          setErrors((p) => ({ ...p, book: undefined, newBookTotalPages: undefined }))
                        }}
                        className="h-4 w-4 border-[#dcd7d0] text-[#8c6b4a] focus:ring-[#8c6b4a]"
                      />
                      <span className="text-sm font-medium text-[#2b2724]">
                        Select existing
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="bookMode"
                        checked={bookMode === 'new'}
                        onChange={() => {
                          setBookMode('new')
                          setSelectedBookId('')
                          setErrors((p) => ({ ...p, book: undefined, newBookTotalPages: undefined }))
                        }}
                        className="h-4 w-4 border-[#dcd7d0] text-[#8c6b4a] focus:ring-[#8c6b4a]"
                      />
                      <span className="text-sm font-medium text-[#2b2724]">
                        Add new book
                      </span>
                    </label>
                  </div>

                  {bookMode === 'existing' ? (
                    <select
                      id="book-select"
                      value={selectedBookId}
                      aria-labelledby="book-label"
                      aria-required="true"
                      onChange={(e) => {
                        setSelectedBookId(e.target.value)
                        setErrors((p) => ({ ...p, book: undefined }))
                      }}
                      onBlur={() =>
                        errors.book &&
                        setErrors((p) => ({ ...p, book: undefined }))
                      }
                      className={`w-full rounded-xl border px-3 py-3 text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 sm:px-4 sm:py-4 ${
                        errors.book
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                      }`}
                      aria-invalid={!!errors.book}
                    >
                      <option value="">
                        {books.length === 0
                          ? 'No books yet — add one below'
                          : 'Choose a book...'}
                      </option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="book-input"
                      type="text"
                      value={newBookTitle}
                      aria-labelledby="book-label"
                      aria-required="true"
                      onChange={(e) => {
                        setNewBookTitle(e.target.value)
                        setErrors((p) => ({ ...p, book: undefined }))
                      }}
                      onBlur={() =>
                        errors.book &&
                        setErrors((p) => ({ ...p, book: undefined }))
                      }
                      maxLength={200}
                      className={`w-full rounded-xl border px-3 py-3 text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 sm:px-4 sm:py-4 ${
                        errors.book
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                      }`}
                      placeholder="e.g. The Hobbit"
                      autoComplete="off"
                      aria-invalid={!!errors.book}
                    />
                  )}
                  {bookMode === 'new' && (
                    <div className="mt-3">
                      <label
                        htmlFor="new-book-total-pages"
                        className="mb-2 block text-sm font-bold text-[#6b645d]"
                      >
                        Total pages in book (optional)
                      </label>
                      <input
                        id="new-book-total-pages"
                        type="number"
                        min="1"
                        max="99999"
                        value={newBookTotalPages}
                        onChange={(e) => {
                          setNewBookTotalPages(e.target.value)
                          setErrors((p) => ({ ...p, newBookTotalPages: undefined }))
                        }}
                        onBlur={() =>
                          errors.newBookTotalPages &&
                          setErrors((p) => ({ ...p, newBookTotalPages: undefined }))
                        }
                        className={`w-full rounded-xl border px-3 py-2.5 text-[#2b2724] shadow-sm outline-none transition backdrop-blur-sm focus:ring-4 focus:ring-[#8c6b4a]/10 sm:px-4 sm:py-3 ${
                          errors.newBookTotalPages
                            ? 'border-red-400 bg-red-50/50'
                            : 'border-[#dcd7d0] bg-white/60 focus:border-[#8c6b4a]'
                        }`}
                        placeholder="e.g. 304"
                        autoComplete="off"
                        aria-invalid={!!errors.newBookTotalPages}
                      />
                      {errors.newBookTotalPages && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.newBookTotalPages}</p>
                      )}
                    </div>
                  )}
                  {errors.book && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.book}</p>
                  )}
                </div>

                <label htmlFor="finished-book" className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e8e4db] bg-white/60 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
                  <input
                    id="finished-book"
                    type="checkbox"
                    checked={finishedBook}
                    onChange={(e) => setFinishedBook(e.target.checked)}
                    aria-describedby="finished-book-desc"
                    className="mt-1 h-4 w-4 rounded border-[#dcd7d0] text-[#8c6b4a] focus:ring-4 focus:ring-[#8c6b4a]"
                  />
                  <span id="finished-book-desc" className="text-sm font-medium text-[#2b2724]">
                    I finished this book
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-[1.4rem] bg-gradient-to-r from-[#8c6b4a] to-[#73583d] px-4 py-4 text-base font-medium font-serif tracking-wide text-white shadow-lg shadow-[#8c6b4a]/20 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#8c6b4a]/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 sm:rounded-[1.6rem] sm:px-5 sm:py-4.5"
                >
                  {isSubmitting ? 'Saving…' : 'Save'}
                </button>
              </form>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-[#e8e4db] bg-white p-6 shadow-md">
              <h3 className="mt-2 text-xl font-serif font-medium tracking-tight text-[#2b2724]">
                Why save?
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                It shows your hard work!
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#e8e4db] bg-white p-6 shadow-md">
              <h3 className="mt-2 text-xl font-serif font-medium tracking-tight text-[#2b2724]">
                Remember
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6b645d]">
                Any reading is good reading.
          <section className="overflow-x-auto rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6">
            <h2 className="text-lg font-serif font-medium tracking-tight text-[#2b2724] sm:text-xl">
              Books you&apos;ve read
            </h2>
            <p className="mt-2 text-sm text-[#6b645d]">
              Books you&apos;ve logged reading for, with total time and date range.
            </p>
            {bookReads.length === 0 ? (
              <p className="mt-4 text-sm text-[#8a8178] italic">
                No books logged yet. Log a reading session with a book to see it here.
              </p>
            ) : (
              <div className="mt-4 w-full">
                {/* Table header - hidden on mobile, shown from md up */}
                <div className="mb-3 hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] gap-2 border-b-2 border-[#e8e4db] px-3 pb-3 md:grid lg:gap-4 lg:px-5">
                  <span className="min-w-0 font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">Book</span>
                  <span className="text-center font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">Total time</span>
                  <span className="text-center font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">Pages read</span>
                  <span className="text-center font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">Book pages</span>
                  <span className="text-center font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">Start date</span>
                  <span className="text-center font-serif text-xs font-semibold uppercase tracking-widest text-[#8a8178] lg:text-base">End date</span>
                </div>
                <ul className="w-full space-y-3" role="list">
                {bookReads
                  .map((r) => {
                    const dates = r.sessions.map((s) => s.date)
                    const startDate = dates.reduce((a, b) => (a < b ? a : b))
                    const endDate = r.finishedAt ?? dates.reduce((a, b) => (a > b ? a : b))
                    const totalMinutes = r.sessions.reduce((sum, s) => sum + s.minutes, 0)
                    const pagesRead = r.sessions.reduce((sum, s) => sum + (s.pages || 0), 0)
                    const bookPageCount = r.bookPageCount ?? null
                    return { ...r, startDate, endDate, totalMinutes, pagesRead, bookPageCount }
                  })
                  .sort((a, b) => (b.endDate > a.endDate ? 1 : -1))
                  .map((r) => (
                    <li
                      key={r.bookId}
                      className="group grid w-full grid-cols-1 gap-3 rounded-xl border border-[#e8e4db] border-l-4 border-l-[#8c6b4a]/30 bg-white px-4 py-4 shadow-sm transition-all hover:border-l-[#8c6b4a] hover:border-[#dcd7d0] hover:shadow-md md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] md:items-center md:gap-2 md:px-5 lg:gap-4"
                    >
                      <span className="min-w-0 font-serif text-base font-semibold tracking-tight text-[#2b2724] md:text-lg lg:text-xl">
                        {r.title}
                      </span>
                      {/* Mobile: label-value grid. Desktop: values only in table cells */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3 md:contents">
                        <span className="text-xs text-[#8a8178] md:hidden">Total time</span>
                        <span className="tabular-nums font-medium text-[#8c6b4a] md:text-center md:text-lg">
                          {formatMinutes(r.totalMinutes)}
                        </span>
                        <span className="text-xs text-[#8a8178] md:hidden">Pages read</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {r.pagesRead > 0 ? r.pagesRead : '—'}
                        </span>
                        <span className="text-xs text-[#8a8178] md:hidden">Book pages</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {r.bookPageCount != null ? r.bookPageCount : '—'}
                        </span>
                        <span className="text-xs text-[#8a8178] md:hidden">Start date</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {formatDate(r.startDate)}
                        </span>
                        <span className="text-xs text-[#8a8178] md:hidden">End date</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {formatDate(r.endDate)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />

      <footer className="mt-8 hidden border-t border-[#e8e4db] sm:mt-12 md:block">
        <div className="mx-auto w-full max-w-7xl px-3 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#8a8178] sm:px-6 sm:text-xs lg:px-10">
          Turn The Page.
        </div>
      </footer>
      <BottomNav />
    </div>
  )
}

export default LogReading
