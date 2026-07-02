import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MarketSessionBar from './MarketSessionBar'
import BottomNavBar from './BottomNavBar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar — completely hidden on mobile via display:none */}
      <Sidebar />

      {/* Main content */}
      <div
        className="flex-1 min-w-0 w-full"
        style={{ minWidth: 0 }}
      >
        <div className="px-4 pt-4 lg:px-6 lg:pt-6 pb-28 lg:pb-6 max-w-screen-xl mx-auto">
          <TopBar />
          <MarketSessionBar />
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNavBar />
    </div>
  )
}
