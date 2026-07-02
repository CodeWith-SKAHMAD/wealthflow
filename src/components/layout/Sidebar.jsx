import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  WalletCards,
  LineChart,
  Layers,
  Bitcoin,
  Calculator,
  ArrowLeftRight,
  StickyNote,
  ListOrdered,
  FileBarChart,
  PieChart,
  Settings,
} from 'lucide-react'
import Logo from '../ui/Logo'
import clsx from 'clsx'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/ledger', label: 'Ledger', icon: WalletCards },
  { to: '/stock', label: 'Stock', icon: LineChart },
  { to: '/etf', label: 'ETF', icon: Layers },
  { to: '/crypto', label: 'Crypto', icon: Bitcoin },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/currency-converter', label: 'Currency Converter', icon: ArrowLeftRight },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/transactions', label: 'All Transactions', icon: ListOrdered },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/pnl', label: 'Unrealized & Realized PnL', icon: PieChart },
]

/**
 * Desktop-only sidebar. Uses `hidden lg:flex` (display:none below lg) rather
 * than fixed-position + transform tricks — display:none guarantees it never
 * reserves layout width on mobile, which is what was breaking the phone view.
 */
export default function Sidebar() {
  return (
    <aside
      data-wf-desktop-sidebar
      className="hidden lg:flex lg:sticky lg:top-0 h-screen w-72 shrink-0 flex-col gap-1 p-4 glass !rounded-none lg:!rounded-r-3xl border-r border-white/5"
      style={{ display: 'none' }}
      ref={(el) => {
        if (el) {
          // Force correct display via JS as a final fallback
          const mq = window.matchMedia('(min-width: 1024px)')
          const update = () => { el.style.display = mq.matches ? 'flex' : 'none' }
          update()
          mq.addEventListener('change', update)
        }
      }}
    >
      <div className="flex items-center px-2 py-3 mb-2">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'btn-3d text-white shadow-lg'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/5'
              )
            }
          >
            <item.icon size={17} strokeWidth={2.1} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 border-t border-white/5 pt-4',
            isActive ? 'text-brand-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
          )
        }
      >
        <Settings size={17} strokeWidth={2.1} />
        Profile &amp; Settings
      </NavLink>
    </aside>
  )
}
