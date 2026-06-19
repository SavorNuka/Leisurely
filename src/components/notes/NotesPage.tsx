import { useState, type FormEvent } from 'react'
import { format, parseISO } from 'date-fns'
import { usePlanStore } from '../../stores/planStore'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export function NotesPage() {
  const notes = usePlanStore((s) => s.notes)
  const addNote = usePlanStore((s) => s.addNote)
  const removeNote = usePlanStore((s) => s.removeNote)
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addNote(text)
    setText('')
  }

  return (
    <div className="py-6 space-y-5">
      <div>
        <h2 className="text-lg font-serif font-semibold text-olive">Bulletin Board</h2>
        <p className="text-xs text-olive/50 mt-0.5">
          Jot down ideas, reminders, or notes for the trip.
        </p>
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'What\'s on your mind? Try: "Pick up olive oil on arrival" or "Check if villa has a BBQ"'}
          rows={3}
          className="w-full rounded-card border border-olive/20 bg-cream px-3 py-2 text-sm text-olive placeholder:text-olive/35 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as FormEvent)
          }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-olive/35">⌘↵ to post</span>
          <Button type="submit" variant="primary" size="sm" disabled={!text.trim()}>
            Post note
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Post a note above to get started. Great for packing tips, restaurant ideas, or anything that shouldn't be forgotten."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group relative bg-white rounded-card shadow-card p-4"
            >
              {/* decorative accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-card bg-terracotta/50" />
              <p className="text-sm text-olive whitespace-pre-wrap pl-3 pr-8 leading-relaxed">
                {note.text}
              </p>
              <div className="flex items-center justify-between mt-2 pl-3">
                <time className="text-xs text-olive/40">
                  {format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}
                </time>
                <button
                  onClick={() => removeNote(note.id)}
                  aria-label="Delete note"
                  className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-olive/30 hover:text-red-400 rounded p-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                    <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
