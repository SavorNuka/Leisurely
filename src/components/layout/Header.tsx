import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isConfigured } from '../../lib/supabase'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 bg-ink-900 shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2.5">
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-sand-100/70"
          viewBox="0 0 32 32"
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
        <div className="flex-1">
          <span className="font-serif font-light text-xl text-sand-100 leading-none tracking-wide">
            Leisurely
          </span>
          <span className="hidden sm:block text-[10px] text-sand-100/40 leading-none mt-0.5 tracking-widest uppercase font-sans">
            Meal planning, minus the stress.
          </span>
        </div>

        {isConfigured() && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:block text-xs text-sand-100/50 truncate max-w-[140px]">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-xs text-sand-100/60 hover:text-sand-100 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-xs text-sand-100/60 hover:text-sand-100 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
