import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  WalletCards,
  PieChart,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react'
import clsx from 'clsx'
import MobileMoreDrawer from './MobileMoreDrawer'

const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/ledger', label: 'Ledger', icon: WalletCards },
  { to: '/stock', label: 'Portfolio', icon: PieChart },
  { to: '/crypto', label: 'Market', icon: TrendingUp },
]

export default function BottomNavBar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const moreActive = !TABS.some((t) =>
    t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)
  )

  return (
    <>
      <nav
        data-wf-bottom-nav
        style={{ display: 'flex' }}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/8"
        css-override="true"
      >
        <div
          className="w-full flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
          style={{
            background: 'linear-gradient(0deg, rgba(10,14,26,0.98), rgba(12,17,32,0.95))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[11px] font-semibold transition-all',
                  isActive ? 'text-brand-400' : 'text-white/40'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={clsx(
              'flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[11px] font-semibold transition-all',
              moreActive ? 'text-brand-400' : 'text-white/40'
            )}
          >
            <MoreHorizontal size={22} strokeWidth={1.8} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
