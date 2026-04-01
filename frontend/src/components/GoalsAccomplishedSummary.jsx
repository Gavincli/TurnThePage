import React from 'react'
import { useApp } from '../context/AppContext'
import ReadAloud from './ReadAloud'

export default function GoalsAccomplishedSummary() {
  const { goalsCompleted, goalsLoading } = useApp()

  const display =
    goalsLoading ? '…' : String(goalsCompleted)
  const readText = goalsLoading
    ? 'Loading goals accomplished count'
    : `Total goals accomplished: ${goalsCompleted}`

  return (
    <section
      className="rounded-[1.4rem] border border-[#e8e4db] bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby="goals-accomplished-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p
            id="goals-accomplished-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a8178]"
          >
            Goals accomplished
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#6b645d]">
            <span>From your synced reading goals in the database.</span>
            <ReadAloud text={readText} size="xs" />
          </p>
        </div>
        <p
          className="text-4xl font-serif font-semibold tabular-nums text-[#2b2724]"
          aria-live="polite"
        >
          {display}
        </p>
      </div>
    </section>
  )
}
