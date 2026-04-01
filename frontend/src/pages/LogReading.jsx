
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReadAloud from '../components/ReadAloud'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'
import MuseumBackground from '../components/MuseumBackground'
import { useApp } from '../context/AppContext'
import { supabase } from '../utils/supabase'
import { aggregateBookHistory, mapBookRow } from '../utils/booksDb'

async function createOrReuseBook(userId, title, totalPagesOpt) {
  const trimmed = title.trim()
  const { data: existingList, error: listErr } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)

  if (listErr) throw listErr

  const match = existingList?.find(
    (b) => b.title.trim().toLowerCase() === trimmed.toLowerCase(),
  )

  if (match) {
    if (
      totalPagesOpt != null &&
      Number(match.total_pages) !== Number(totalPagesOpt)
    ) {
      const { data: updated, error: upErr } = await supabase
        .from('books')
        .update({
          total_pages: totalPagesOpt,
          updated_at: new Date().toISOString(),
        })
        .eq('book_id', match.book_id)
        .select()
        .single()

      if (upErr) throw upErr
      return { book: mapBookRow(updated), wasCreated: false }
    }
    return { book: mapBookRow(match), wasCreated: false }
  }

  const bookId = crypto.randomUUID()
  const { data: inserted, error: insErr } = await supabase
    .from('books')
    .insert({
      book_id: bookId,
      user_id: userId,
      title: trimmed,
      total_pages: totalPagesOpt ?? null,
      is_finished: false,
    })
    .select()
    .single()

  if (insErr) throw insErr
  return { book: mapBookRow(inserted), wasCreated: true }
}

const getToday = () => new Date().toISOString().slice(0, 10)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
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
  const { userId, syncAfterSession } = useApp()
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
  const [isBooksLoading, setIsBooksLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [successSummary, setSuccessSummary] = useState(null)

  const availableBooks = useMemo(
    () => books.filter((book) => !book.isFinished),
    [books],
  )

  const loadBooks = useCallback(async () => {
    if (!userId) {
      setBooks([])
      setIsBooksLoading(false)
      return
    }
    setIsBooksLoading(true)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('is_finished', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks((data ?? []).map(mapBookRow))
    } catch (err) {
      console.error('Failed to load books for Log Reading.', err)
      setBooks([])
    } finally {
      setIsBooksLoading(false)
    }
  }, [userId])

  const loadBookHistory = useCallback(async () => {
    if (!userId) {
      setBookReads([])
      setIsHistoryLoading(false)
      return
    }
    setIsHistoryLoading(true)
    try {
      const [booksRes, sessRes] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', userId),
        supabase
          .from('reading_sessions')
          .select('book_id, minutes_read, pages_read, session_date')
          .eq('user_id', userId)
          .not('book_id', 'is', null),
      ])

      if (booksRes.error) throw booksRes.error
      if (sessRes.error) throw sessRes.error

      const history = aggregateBookHistory(
        booksRes.data ?? [],
        sessRes.data ?? [],
      )
      setBookReads(
        history.filter(
          (book) => book.totalMinutes > 0 || book.totalPagesRead > 0,
        ),
      )
    } catch (err) {
      console.error('Failed to load book history.', err)
      setBookReads([])
    } finally {
      setIsHistoryLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadBooks()
    loadBookHistory()
  }, [loadBookHistory, loadBooks])

  useEffect(() => {
    if (selectedBookId && !availableBooks.some((book) => book.bookId === selectedBookId)) {
      setSelectedBookId('')
    }
  }, [availableBooks, selectedBookId])

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
      if (availableBooks.length === 0) {
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
    console.info('[LogReading] Submit started', {
      userIdPresent: Boolean(userId),
      bookMode,
      selectedBookId: selectedBookId || null,
      sessionDate,
    })

    if (!userId) {
      const authMessage = 'You must be logged in to log a reading session.'
      console.error('[LogReading] Aborting submit: missing authenticated user.')
      setErrors({ submit: authMessage })
      return
    }

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      let bookId = null
      let bookTitle = ''
      console.debug('[LogReading] Validation passed, preparing payload.')

      if (bookMode === 'existing' && selectedBookId) {
        bookId = selectedBookId
        bookTitle = availableBooks.find((book) => book.bookId === bookId)?.title ?? ''
        console.debug('[LogReading] Using existing book.', { bookId, bookTitle })
      } else if (bookMode === 'new' && newBookTitle.trim()) {
        bookTitle = newBookTitle.trim()
        const totalPages = newBookTotalPages.trim()
          ? parseInt(newBookTotalPages, 10)
          : undefined

        try {
          console.debug('[LogReading] Creating or reusing book.', {
            bookTitle,
            totalPages: totalPages ?? null,
          })
          const { book } = await createOrReuseBook(userId, bookTitle, totalPages)
          bookId = book.bookId
          bookTitle = book.title || bookTitle
          console.debug('[LogReading] Book create/reuse successful.', { bookId, bookTitle })
        } catch (bookErr) {
          console.error('[LogReading] Book create/reuse failed.', bookErr)
          setErrors({
            submit: bookErr?.message || 'Failed to save the book. Please try again.',
          })
          return
        }
      }

      console.debug('[LogReading] Calling log_reading_session RPC.', {
        p_minutes_read: parseInt(minutes, 10),
        p_session_date: sessionDate || getToday(),
        p_book_id: bookId || null,
        p_pages_read: pages.trim() ? parseInt(pages, 10) : null,
        p_finished_book: finishedBook,
      })
      const { error: sessionErr } = await supabase.rpc('log_reading_session', {
        p_minutes_read: parseInt(minutes, 10),
        p_session_date: sessionDate || getToday(),
        p_book_id: bookId || null,
        p_pages_read: pages.trim() ? parseInt(pages, 10) : null,
        p_finished_book: finishedBook,
      })

      if (sessionErr) {
        console.error('[LogReading] Session RPC failed.', sessionErr)
        setErrors({
          submit:
            sessionErr.message ||
            'Failed to log reading. Please try again.',
        })
        return
      }
      console.info('[LogReading] Session RPC successful.')

      await Promise.all([
        loadBooks(),
        loadBookHistory(),
        syncAfterSession(),
      ])
      console.debug('[LogReading] Post-submit sync complete.')

      setSubmitSuccess(true)
      setSuccessSummary({
        bookTitle,
        newlyCompleted: [],
      })
      setMinutes('')
      setPages('')
      setSessionDate(getToday())
      setSelectedBookId('')
      setNewBookTitle('')
      setNewBookTotalPages('')
      setFinishedBook(false)
      console.info('[LogReading] Submit completed successfully.')
    } catch (err) {
      console.error('[LogReading] Unexpected submit failure.', err)
      setErrors({
        submit:
          err?.message ||
          'Something went wrong. Check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
      console.debug('[LogReading] Submit finished. isSubmitting reset.')
    }
  }

  if (submitSuccess) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-16 font-sans">
        <MuseumBackground />
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
              {successSummary?.bookTitle
                ? `${successSummary.bookTitle} has been updated.`
                : 'Your progress has been saved.'}
            </p>
            {successSummary?.newlyCompleted?.length > 0 && (
              <div className="mt-4 rounded-[1.25rem] border border-[#e8e4db] bg-[#faf8f4] px-4 py-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a8178]">
                  Goal completed
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[#4a4542]">
                  {successSummary.newlyCompleted.map((goal) => (
                    <li key={goal.templateId}>{goal.title}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false)
                setSuccessSummary(null)
              }}
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
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] pb-16 font-sans">
      <MuseumBackground />
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

      <main id="main-content" role="main" className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:gap-5">
          <section className="relative overflow-hidden rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.4),transparent_50%)]" />
            <div
              className="pointer-events-none absolute inset-0 z-0 hidden opacity-40 mix-blend-multiply transition-opacity duration-700 sm:block sm:opacity-[0.35]"
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
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white text-2xl text-[#9c7846] shadow-sm sm:flex">
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
                      disabled={isBooksLoading}
                    >
                      <option value="">
                        {isBooksLoading
                          ? 'Loading books...'
                          : availableBooks.length === 0
                          ? 'No books yet — add one below'
                          : 'Choose a book...'}
                      </option>
                      {availableBooks.map((b) => (
                        <option key={b.bookId} value={b.bookId}>
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

                <label htmlFor="finished-book" className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e8e4db] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
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

          <section
            aria-labelledby="books-read-heading"
            aria-describedby="books-read-description"
            className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#eeebe4] bg-white p-4 shadow-[0_8px_32px_rgba(71,63,55,0.04)] sm:rounded-[2rem] sm:p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,233,222,0.35),transparent_55%)]" />
            <div className="relative z-10">
            <h2 id="books-read-heading" className="text-lg font-serif font-medium tracking-tight text-[#2b2724] sm:text-xl">
              Books you&apos;ve read
            </h2>
            <p id="books-read-description" className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5851]">
              Books you&apos;ve logged reading for, with total time and date range.
            </p>
            {isHistoryLoading ? (
              <div className="mt-4 rounded-[1.25rem] border border-[#e8e4db] bg-[#faf8f4] px-4 py-4 sm:px-5">
                <p className="text-sm leading-6 text-[#5f5851]">
                  Loading your logged books...
                </p>
              </div>
            ) : bookReads.length === 0 ? (
              <div className="mt-4 rounded-[1.25rem] border border-[#e8e4db] bg-[#faf8f4] px-4 py-4 sm:px-5">
                <p className="text-sm leading-6 text-[#5f5851]">
                  No books logged yet. Log a reading session with a book to see it here.
                </p>
              </div>
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
                <ul className="w-full space-y-3" role="list" aria-describedby="books-read-description">
                {bookReads
                  .sort((a, b) => (b.endDate > a.endDate ? 1 : -1))
                  .map((r) => (
                    <li
                      key={r.bookId}
                      className="group grid w-full grid-cols-1 gap-3 rounded-[1.25rem] border border-[#e8e4db] border-l-4 border-l-[#8c6b4a]/30 bg-[#fcfbf8] px-4 py-4 shadow-sm transition-all hover:border-l-[#8c6b4a] hover:border-[#dcd7d0] hover:shadow-md md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] md:items-center md:gap-2 md:px-5 lg:gap-4"
                    >
                      <span className="min-w-0 font-serif text-base font-semibold tracking-tight text-[#2b2724] md:text-lg lg:text-xl">
                        {r.title}
                      </span>
                      {/* Mobile: label-value grid. Desktop: values only in table cells */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3 md:contents">
                        <span className="text-xs font-medium text-[#6b645d] md:hidden">Total time</span>
                        <span className="tabular-nums font-medium text-[#8c6b4a] md:text-center md:text-lg">
                          {formatMinutes(r.totalMinutes)}
                        </span>
                        <span className="text-xs font-medium text-[#6b645d] md:hidden">Pages read</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {r.totalPagesRead > 0 ? r.totalPagesRead : '—'}
                        </span>
                        <span className="text-xs font-medium text-[#6b645d] md:hidden">Book pages</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {r.totalPages != null ? r.totalPages : '—'}
                        </span>
                        <span className="text-xs font-medium text-[#6b645d] md:hidden">Start date</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {formatDate(r.startDate)}
                        </span>
                        <span className="text-xs font-medium text-[#6b645d] md:hidden">End date</span>
                        <span className="tabular-nums text-[#6b645d] md:text-center md:text-base">
                          {formatDate(r.endDate)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />

      <footer className="mt-8 hidden border-t border-[#e8e4db] sm:mt-12 md:block">
        <div className="mx-auto w-full max-w-7xl px-3 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#8a8178] sm:px-6 sm:text-xs lg:px-10">
          Turn The Page.
        </div>
      </footer>
    </div>
  )
}

export default LogReading
