import { useState } from 'react'
import {
  format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameDay, isBefore, isAfter, eachDayOfInterval,
  differenceInDays, isToday, isSameMonth,
} from 'date-fns'

interface Props {
  startDate: string | null
  endDate: string | null
  onRangeChange: (start: string, end: string) => void
  onError: (msg: string | null) => void
  maxDays?: number
}

type Phase = 'start' | 'end'

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DateRangeCalendar({ startDate, endDate, onRangeChange, onError, maxDays = 30 }: Props) {
  const [viewMonth, setViewMonth] = useState(() =>
    startDate ? startOfMonth(parseISO(startDate)) : startOfMonth(new Date())
  )
  const [phase, setPhase] = useState<Phase>('start')
  const [hover, setHover] = useState<Date | null>(null)

  const start = startDate ? parseISO(startDate) : null
  // treat start===end as "only start selected, end pending"
  const end = startDate && endDate && endDate !== startDate ? parseISO(endDate) : null

  // Live preview end during end-selection hover
  const previewEnd =
    phase === 'end' && hover && start && !isBefore(hover, start) && !isSameDay(hover, start)
      ? hover
      : null

  const effectiveRangeEnd = previewEnd ?? end

  function isInRange(day: Date): boolean {
    if (!start || !effectiveRangeEnd) return false
    return isAfter(day, start) && isBefore(day, effectiveRangeEnd)
  }

  function handleDayClick(day: Date) {
    const iso = format(day, 'yyyy-MM-dd')
    if (phase === 'start') {
      onError(null)
      onRangeChange(iso, iso)
      setPhase('end')
    } else {
      if (!start) { setPhase('start'); return }
      if (isBefore(day, start)) {
        onError('End date must be after start date')
        return
      }
      if (isSameDay(day, start)) {
        onError(null)
        onRangeChange(iso, iso)
        setPhase('start')
        return
      }
      const diff = differenceInDays(day, start)
      if (diff > maxDays) {
        onError(`Range cannot exceed ${maxDays} days`)
        return
      }
      onError(null)
      onRangeChange(format(start, 'yyyy-MM-dd'), iso)
      setPhase('start')
    }
  }

  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 })
  const calDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="relative bg-white rounded-card shadow-card p-4 overflow-hidden select-none">
      {/* Leaf watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 32 32"
          className="w-48 h-48 text-ink-900/[0.035]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="16" y1="28" x2="16" y2="10" />
          <path d="M16 22 C11 19, 8 14, 10 10 C12 6, 16 10, 16 13" />
          <path d="M16 18 C21 15, 24 10, 22 6 C20 2, 16 6, 16 9" />
          <path d="M16 26 C12 24, 9 21, 10 18" />
          <path d="M16 26 C20 24, 23 21, 22 18" />
        </svg>
      </div>

      <div className="relative z-10 space-y-3">
        {/* Phase toggle — Start / End buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase('start')}
            className={`flex-1 text-left px-3 py-2 rounded-xl border-2 transition-colors ${
              phase === 'start'
                ? 'border-saffron-400 bg-saffron-400/10'
                : 'border-sand-200 bg-white hover:border-sand-300'
            }`}
          >
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-ink-400 leading-none mb-1">Start</span>
            <span className={`font-serif font-medium text-sm ${start ? 'text-ink-900' : 'text-ink-400/50'}`}>
              {start ? format(start, 'MMM d, yyyy') : 'Select date'}
            </span>
          </button>

          <svg
            aria-hidden="true"
            className="h-3 w-8 text-ink-400/40 shrink-0"
            fill="none"
            viewBox="0 0 32 8"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          >
            <path d="M0 4h28M22 1l6 3-6 3" />
          </svg>

          <button
            type="button"
            onClick={() => { if (start) setPhase('end') }}
            disabled={!start}
            className={`flex-1 text-right px-3 py-2 rounded-xl border-2 transition-colors ${
              phase === 'end'
                ? 'border-saffron-400 bg-saffron-400/10'
                : 'border-sand-200 bg-white hover:border-sand-300 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-ink-400 leading-none mb-1 text-right">End</span>
            <span className={`font-serif font-medium text-sm ${end ? 'text-ink-900' : 'text-ink-400/50'}`}>
              {end ? format(end, 'MMM d, yyyy') : 'Select date'}
            </span>
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            aria-label="Previous month"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-900 hover:bg-sand-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>

          <span className="font-serif font-medium text-sm text-ink-900">
            {format(viewMonth, 'MMMM yyyy')}
          </span>

          <button
            type="button"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            aria-label="Next month"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-900 hover:bg-sand-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Day-name header row */}
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="h-6 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-ink-400/50">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar day grid */}
        <div className="grid grid-cols-7" onMouseLeave={() => setHover(null)}>
          {calDays.map((day) => {
            const iso = format(day, 'yyyy-MM-dd')
            const isStart = start !== null && isSameDay(day, start)
            const isEnd = end !== null && isSameDay(day, end)
            const isPEnd = previewEnd !== null && isSameDay(day, previewEnd)
            const inRange = isInRange(day)
            const inMonth = isSameMonth(day, viewMonth)
            const hasCircle = isStart || isEnd || isPEnd
            // Half-width connectors linking circle to the range band
            const rightConnector = isStart && effectiveRangeEnd && !isSameDay(day, effectiveRangeEnd)
            const leftConnector = (isEnd || isPEnd) && start && !isSameDay(day, start)

            return (
              <button
                key={iso}
                type="button"
                onClick={() => inMonth && handleDayClick(day)}
                onMouseEnter={() => phase === 'end' && inMonth && setHover(day)}
                aria-label={format(day, 'MMM d, yyyy')}
                className={`relative h-9 flex items-center justify-center text-xs font-sans transition-colors
                  ${!inMonth ? 'opacity-20 pointer-events-none' : ''}
                  ${!hasCircle && !inRange ? 'rounded-full hover:bg-sand-200' : ''}
                  ${hasCircle ? 'text-cream font-semibold' : 'text-ink-900'}
                `}
              >
                {/* Range band */}
                {inRange && <span className="absolute inset-0 bg-saffron-400/20 pointer-events-none" />}
                {/* Right-half connector on start day */}
                {rightConnector && <span className="absolute top-0 right-0 bottom-0 w-1/2 bg-saffron-400/20 pointer-events-none" />}
                {/* Left-half connector on end day */}
                {leftConnector && <span className="absolute top-0 left-0 bottom-0 w-1/2 bg-saffron-400/20 pointer-events-none" />}
                {/* Solid circle for start / end */}
                {hasCircle && (
                  <span
                    className={`absolute inset-1 rounded-full pointer-events-none ${
                      isPEnd && !isEnd ? 'bg-ink-700 opacity-75' : 'bg-ink-900'
                    }`}
                  />
                )}
                <span className="relative z-10">{format(day, 'd')}</span>
                {/* Today dot */}
                {isToday(day) && !hasCircle && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-saffron-400 z-10 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>

        {/* Contextual hint */}
        <p className="text-[10px] text-ink-400/40 text-center font-sans pt-1">
          {phase === 'start' ? 'Tap a day to set the start date' : `Tap a day to set the end date — max ${maxDays} days`}
        </p>
      </div>
    </div>
  )
}
