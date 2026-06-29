import { useState } from 'react'
import { Plus, X, Star } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { Input } from '../ui/Input'
import AssetLogo from '../ui/AssetLogo'
import SymbolAutocomplete from './SymbolAutocomplete'
import TradingViewMiniChart from './TradingViewMiniChart'
import { useAuth } from '../../context/AuthContext'
import { addWatchlistItem, deleteWatchlistItem } from '../../lib/db'
import { getLogoUrl } from '../../lib/prices'

const TV_HINT = {
  crypto: 'e.g. BINANCE:BTCUSDT, BINANCE:ETHUSDT',
  stock: 'e.g. NASDAQ:AAPL, NYSE:TSLA',
  etf: 'e.g. NASDAQ:QQQ, AMEX:SPY',
}

export default function WatchlistSection({ assetType, items, onChanged }) {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [tvSymbol, setTvSymbol] = useState('')
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setSymbol('')
    setTvSymbol('')
    setName('')
    setLogoUrl(null)
    setError('')
  }

  const handlePickSymbol = (result) => {
    setSymbol(result.symbol)
    setName(result.name)
    setLogoUrl(result.logoUrl)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    if (!symbol.trim()) return setError('Enter a symbol.')
    setLoading(true)
    try {
      await addWatchlistItem({
        user_id: user.id,
        asset_type: assetType,
        symbol: tvSymbol.trim() || symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim().toUpperCase(),
        logo_url: logoUrl || getLogoUrl(assetType, symbol.trim()),
      })
      reset()
      setModalOpen(false)
      onChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    await deleteWatchlistItem(id)
    onChanged?.()
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-400" />
          <h3 className="font-display font-semibold">Watchlist</h3>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          Add to Watchlist
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-40 py-8 text-center">
          Your watchlist is empty. Add symbols to track real-time prices and charts.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="glass-inset p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AssetLogo symbol={item.symbol.split(':').pop()} logoUrl={item.logo_url} size={24} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{item.name}</div>
                    <div className="text-[10px] opacity-40 truncate">{item.symbol}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 rounded-lg hover:bg-loss-500/15 opacity-40 hover:opacity-100 hover:text-loss-400 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <TradingViewMiniChart symbol={item.symbol} height={120} />
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Add to Watchlist">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <SymbolAutocomplete
            assetType={assetType}
            label="Symbol"
            value={symbol}
            onChange={(v) => {
              setSymbol(v)
              setLogoUrl(null)
            }}
            onPick={handlePickSymbol}
            placeholder={assetType === 'crypto' ? 'BTC or Bitcoin' : 'AAPL or Apple'}
          />
          <Input
            label="Display name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={assetType === 'crypto' ? 'Bitcoin' : 'Apple Inc.'}
          />
          <Input
            label="TradingView chart symbol (optional, for accurate chart)"
            value={tvSymbol}
            onChange={(e) => setTvSymbol(e.target.value)}
            placeholder={TV_HINT[assetType]}
            hint="Leave blank to use the plain symbol — TradingView will try to auto-match it."
          />
          {error && <p className="text-sm text-loss-400">{error}</p>}
          <div className="flex gap-2 mt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => { setModalOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </GlassCard>
  )
}
