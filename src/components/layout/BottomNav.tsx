import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/plan',
    label: 'Plan',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <line x1="3" y1="8" x2="17" y2="8" />
        <line x1="7" y1="4" x2="7" y2="2" />
        <line x1="13" y1="4" x2="13" y2="2" />
      </svg>
    ),
  },
  {
    to: '/grocery',
    label: 'Grocery',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h1l1 8h9l1-6H7" />
        <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="14" cy="16" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/notes',
    label: 'Notes',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12a1 1 0 011 1v9l-4 4H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
        <line x1="7" y1="8" x2="13" y2="8" />
        <line x1="7" y1="11" x2="11" y2="11" />
        <path d="M13 14v3l4-4h-3a1 1 0 01-1-1z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2" />
        <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M4.93 4.93l1.06 1.06M14.01 14.01l1.06 1.06M4.93 15.07l1.06-1.06M14.01 5.99l1.06-1.06" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-olive/10">
      <div className="max-w-2xl mx-auto flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-sage' : 'text-olive/50 hover:text-olive'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
