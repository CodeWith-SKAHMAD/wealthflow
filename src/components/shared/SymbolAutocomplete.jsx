import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { searchCryptoSymbols, searchStockSymbols } from '../../lib/prices'
import AssetLogo from '../ui/AssetLogo'

/**
 * Text input that shows a live dropdown of matching symbols as the user types.
 * Calls onPick({ symbol, name, logoUrl }) when a suggestion is chosen.
 * Falls back to plain free-text entry if no suggestions come back (e.g. no stock API key).
 */
export default function SymbolAutocomplete({ assetType, value, onChange, onPick, placeholder, label }) {
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  const runSearch = useCallback(
    async (query) => {
      if (!query || query.trim().length === 0) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const data =
          assetType === 'crypto' ? await searchCryptoSymbols(query) : await searchStockSymbols(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [assetType]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 300)
    return () => clearTimeout(debounceRef.current)
  }, [value, runSearch])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <label className="block">
        {label && <span className="block text-xs font-medium opacity-60 mb-1.5">{label}</span>}
        <div className="relative">
          <input
            className="w-full rounded-xl glass-inset px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-brand-400/50 placeholder:opacity-40"
            value={value}
            autoComplete="off"
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            required
          />
          {loading && (
            <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 opacity-40" />
          )}
        </div>
      </label>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full glass !rounded-xl max-h-60 overflow-y-auto p-1.5">
          {results.map((r) => (
            <button
              key={r.symbol + (r.exchange || r.id || '')}
              type="button"
              onClick={() => {
                onPick(r)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/10 text-left transition-colors"
            >
              <AssetLogo symbol={r.symbol} logoUrl={r.logoUrl} size={24} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{r.symbol}</div>
                <div className="text-[11px] opacity-50 truncate">
                  {r.name}
                  {r.exchange ? ` · ${r.exchange}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
