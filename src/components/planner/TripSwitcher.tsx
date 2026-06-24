import { useState } from 'react'
import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { usePlanStore } from '../../stores/planStore'
import { useTripHistory } from '../../hooks/useTripHistory'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { TripStub, Plan } from '../../types'
import { formatDayLabel } from '../../lib/dateUtils'

function dateRange(start: string, end: string) {
  return `${formatDayLabel(start)} – ${formatDayLabel(end)}`
}

function isPastTrip(stub: TripStub) {
  return isPast(parseISO(stub.endDate))
}

interface TripRowProps {
  stub: TripStub
  onSwitch: () => void
  onDelete: () => void
  loading: boolean
}

function TripRow({ stub, onSwitch, onDelete, loading }: TripRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-card hover:bg-olive/5 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-olive truncate">{stub.name}</p>
        <p className="text-xs text-olive/50">{dateRange(stub.startDate, stub.endDate)}</p>
        <p className="text-xs text-olive/35">Saved {formatDistanceToNow(parseISO(stub.savedAt), { addSuffix: true })}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {confirmDelete ? (
          <>
            <span className="text-xs text-olive/50">Delete?</span>
            <button
              className="text-xs text-red-500 font-medium hover:text-red-600"
              onClick={() => { setConfirmDelete(false); onDelete() }}
            >
              Yes
            </button>
            <button
              className="text-xs text-olive/50 hover:text-olive"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onSwitch} disabled={loading}>
              Switch to
            </Button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-olive/30 hover:text-red-400 p-1 rounded"
              aria-label="Delete trip"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

interface TripSwitcherProps {
  trigger?: 'link' | 'button'
}

export function TripSwitcher({ trigger = 'link' }: TripSwitcherProps) {
  const [open, setOpen] = useState(false)
  const plan = usePlanStore((s) => s.plan)
  const { stubs, loading, switchTo, archiveCurrent, deleteTrip } = useTripHistory()

  const upcomingStubs = stubs.filter((s) => !isPastTrip(s))
  const pastStubs = stubs.filter((s) => isPastTrip(s))

  function handleOpen() { setOpen(true) }

  if (trigger === 'link') {
    return (
      <>
        <button
          onClick={handleOpen}
          className="text-xs text-olive/50 hover:text-sage transition-colors underline underline-offset-2"
        >
          My trips {stubs.length > 0 && `(${stubs.length + (plan ? 1 : 0)})`}
        </button>
        <TripSwitcherModal
          open={open}
          onClose={() => setOpen(false)}
          plan={plan}
          stubs={stubs}
          upcomingStubs={upcomingStubs}
          pastStubs={pastStubs}
          loading={loading}
          switchTo={switchTo}
          archiveCurrent={archiveCurrent}
          deleteTrip={deleteTrip}
        />
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h14M3 12h14M8 17l4-4-4-4" />
        </svg>
        My trips {stubs.length > 0 && `(${stubs.length + (plan ? 1 : 0)})`}
      </Button>
      <TripSwitcherModal
        open={open}
        onClose={() => setOpen(false)}
        plan={plan}
        stubs={stubs}
        upcomingStubs={upcomingStubs}
        pastStubs={pastStubs}
        loading={loading}
        switchTo={switchTo}
        archiveCurrent={archiveCurrent}
        deleteTrip={deleteTrip}
      />
    </>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  plan: Plan | null
  stubs: TripStub[]
  upcomingStubs: TripStub[]
  pastStubs: TripStub[]
  loading: boolean
  switchTo: (s: TripStub) => Promise<void>
  archiveCurrent: () => Promise<void>
  deleteTrip: (id: string) => Promise<void>
}

function TripSwitcherModal({
  open, onClose, plan, upcomingStubs, pastStubs, loading, switchTo, archiveCurrent, deleteTrip,
}: ModalProps) {
  const [showPast, setShowPast] = useState(false)

  async function handleSwitchTo(stub: TripStub) {
    await switchTo(stub)
    onClose()
  }

  async function handleArchive() {
    await archiveCurrent()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="My Trips">
      <div className="space-y-4">
        {/* Active trip */}
        {plan && (
          <div>
            <p className="text-xs font-semibold text-olive/40 uppercase tracking-wide mb-2">Active trip</p>
            <div className="rounded-card border border-sage/30 bg-sage/5 p-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-olive">{plan.name}</p>
                <p className="text-xs text-olive/50">{dateRange(plan.startDate, plan.endDate)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleArchive} disabled={loading}>
                Archive
              </Button>
            </div>
          </div>
        )}

        {/* Upcoming saved trips */}
        {upcomingStubs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-olive/40 uppercase tracking-wide mb-1">Saved trips</p>
            <div className="divide-y divide-olive/10">
              {upcomingStubs.map((stub) => (
                <TripRow
                  key={stub.planId}
                  stub={stub}
                  onSwitch={() => handleSwitchTo(stub)}
                  onDelete={() => deleteTrip(stub.planId)}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past trips collapsible */}
        {pastStubs.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-olive/40 uppercase tracking-wide mb-1 hover:text-olive/60 transition-colors"
            >
              <svg className={`h-3 w-3 transition-transform ${showPast ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
              Past trips ({pastStubs.length})
            </button>
            {showPast && (
              <div className="divide-y divide-olive/10">
                {pastStubs.map((stub) => (
                  <TripRow
                    key={stub.planId}
                    stub={stub}
                    onSwitch={() => handleSwitchTo(stub)}
                    onDelete={() => deleteTrip(stub.planId)}
                    loading={loading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!plan && upcomingStubs.length === 0 && pastStubs.length === 0 && (
          <p className="text-sm text-olive/50 text-center py-4">No saved trips yet.</p>
        )}
      </div>
    </Modal>
  )
}
