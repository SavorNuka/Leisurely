import { usePlanStore } from '../../stores/planStore'
import { encodeShareLink } from '../../lib/shareLink'
import { Button } from '../ui/Button'
import { toast } from '../../hooks/useToast'

export function SharePlan() {
  const plan = usePlanStore((s) => s.plan)
  const toggleVisibility = usePlanStore((s) => s.togglePlanVisibility)
  const exportState = usePlanStore((s) => s.exportState)

  function handleCopy() {
    const link = encodeShareLink(exportState())
    navigator.clipboard.writeText(link).then(() => toast('Link copied!'))
  }

  return (
    <div className="bg-white rounded-card shadow-card p-5 space-y-4">
      <div>
        <h3 className="font-serif text-base font-semibold text-olive mb-1">Share Plan</h3>
        <p className="text-xs text-olive/60">
          {plan
            ? 'Generate a link that encodes your entire plan. Anyone with the link can import it.'
            : 'Create a trip plan to generate a shareable link.'}
        </p>
      </div>

      {plan ? (
        <>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-olive">
                {plan.isPublic ? 'Public' : 'Private'}
              </p>
              <p className="text-xs text-olive/50 mt-0.5">
                {plan.isPublic
                  ? 'This plan is marked as shareable.'
                  : 'Mark as public before sharing.'}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={plan.isPublic}
              onClick={toggleVisibility}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 ${plan.isPublic ? 'bg-sage' : 'bg-olive/20'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${plan.isPublic ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </label>

          <Button
            variant={plan.isPublic ? 'primary' : 'ghost'}
            onClick={handleCopy}
            disabled={!plan.isPublic}
            className="w-full justify-center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v8.25A2.25 2.25 0 005.25 18.75h8.25A2.25 2.25 0 0015.75 17V8.75M13.5 6l3-3m0 0l-3-3m3 3H8.25" />
            </svg>
            Copy share link
          </Button>

          {!plan.isPublic && (
            <p className="text-xs text-olive/40 text-center">Toggle the plan to Public first.</p>
          )}
        </>
      ) : (
        <Button variant="ghost" disabled className="w-full justify-center opacity-40 cursor-not-allowed">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v8.25A2.25 2.25 0 005.25 18.75h8.25A2.25 2.25 0 0015.75 17V8.75M13.5 6l3-3m0 0l-3-3m3 3H8.25" />
          </svg>
          Copy share link
        </Button>
      )}
    </div>
  )
}
