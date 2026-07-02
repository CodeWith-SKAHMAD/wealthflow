import { NavLink } from 'react-router-dom'
import {
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
  X,
} from 'lucide-react'
import clsx from 'clsx'
import Logo from '../ui/Logo'

const MORE_ITEMS = [
  { to: '/stock', label: 'Stock', icon: LineChart },
  { to: '/etf', label: 'ETF', icon: Layers },
  { to: '/crypto', label: 'Crypto', icon: Bitcoin },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/currency-converter', label: 'Currency Converter', icon: ArrowLeftRight },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/transactions', label: 'All Transactions', icon: ListOrdered },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/pnl', label: 'PnL', icon: PieChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileMoreDrawer({ open, onClose }) {
  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 inset-x-0 border-t border-white/10 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,20,38,0.99), rgba(10,14,26,0.99))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px 24px 0 0',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {MORE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-500/25 text-brand-300 border border-brand-400/30'
                    : 'bg-white/6 text-white/75 border border-white/6 hover:bg-white/12'
                )
              }
            >
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
