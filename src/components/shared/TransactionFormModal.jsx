import { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import SymbolAutocomplete from './SymbolAutocomplete'
import { addHoldingsTransaction, updateHoldingsTransaction } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'
import { getLogoUrl } from '../../lib/prices'
import clsx from 'clsx'

const ASSET_LABELS = { stock: 'Stock', etf: 'ETF', crypto: 'Crypto' }

export default function TransactionFormModal({ open, onClose, assetType, onSaved, editingTransaction }) {
  const { user } = useAuth()
  const isEditing = Boolean(editingTransaction)

  const [txnType, setTxnType] = useState('buy')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [total, setTotal] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingTransaction) {
      setTxnType(editingTransaction.txn_type)
      setDate(editingTransaction.txn_date)
      setSymbol(editingTransaction.symbol)
      setName(editingTransaction.name || '')
      setLogoUrl(editingTransaction.logo_url || null)
      setQuantity(String(editingTransaction.quantity))
      setPrice(String(editingTransaction.price))
      setTotal(String(editingTransaction.total_cost))
      setCurrency(editingTransaction.currency)
      setNote(editingTransaction.note || '')
    }
  }, [editingTransaction])

  const reset = () => {
    setTxnType('buy')
    setDate(new Date().toISOString().slice(0, 10))
    setSymbol('')
    setName('')
    setLogoUrl(null)
    setQuantity('')
    setPrice('')
    setTotal('')
    setCurrency('USD')
    setNote('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handlePickSymbol = (result) => {
    setSymbol(result.symbol)
    setName(result.name)
    setLogoUrl(result.logoUrl)
  }

  // Auto-calc: any two of {quantity, price, total} determine the third.
  const handleFieldChange = (field, value) => {
    const setters = { quantity: setQuantity, price: setPrice, total: setTotal }
    setters[field](value)

    const vals = {
      quantity: field === 'quantity' ? value : quantity,
      price: field === 'price' ? value : price,
      total: field === 'total' ? value : total,
    }
    const q = parseFloat(vals.quantity)
    const p = parseFloat(vals.price)
    const t = parseFloat(vals.total)

    if (field === 'quantity' && !isNaN(q) && !isNaN(p)) {
      setTotal((q * p).toString())
    } else if (field === 'price' && !isNaN(p) && !isNaN(q)) {
      setTotal((q * p).toString())
    } else if (field === 'total' && !isNaN(t)) {
      if (!isNaN(p) && p !== 0) setQuantity((t / p).toString())
      else if (!isNaN(q) && q !== 0) setPrice((t / q).toString())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!symbol.trim()) return setError('Enter a symbol or name.')
    const q = parseFloat(quantity)
    const p = parseFloat(price)
    const t = parseFloat(total)
    if (!q || !p || !t) return setError('Fill in quantity, price, and total (any two auto-fill the third).')

    setLoading(true)
    try {
      const payload = {
        asset_type: assetType,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim().toUpperCase(),
        logo_url: logoUrl || getLogoUrl(assetType, symbol.trim()),
        txn_type: txnType,
        quantity: q,
        price: p,
        total_cost: t,
        currency,
        note: note || null,
        txn_date: date,
      }
      if (isEditing) {
        await updateHoldingsTransaction(editingTransaction.id, payload)
      } else {
        await addHoldingsTransaction({ ...payload, user_id: user.id })
      }
      reset()
      onClose()
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${isEditing ? 'Edit' : 'Add'} ${ASSET_LABELS[assetType]} Transaction`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTxnType('buy')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              txnType === 'buy'
                ? 'bg-profit-500/20 text-profit-400 border border-profit-500/40'
                : 'glass-inset opacity-60'
            )}
          >
            <ArrowDownCircle size={16} /> Buy
          </button>
          <button
            type="button"
            onClick={() => setTxnType('sell')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              txnType === 'sell'
                ? 'bg-loss-500/20 text-loss-400 border border-loss-500/40'
                : 'glass-inset opacity-60'
            )}
          >
            <ArrowUpCircle size={16} /> Sell
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SymbolAutocomplete
            assetType={assetType}
            label={`${ASSET_LABELS[assetType]} symbol`}
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
        </div>
        {assetType !== 'crypto' && (
          <p className="text-[11px] opacity-40 -mt-2">
            Suggestions need a free Twelve Data API key (see README). You can still type the symbol manually.
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Quantity"
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
            placeholder="0"
          />
          <Input
            label="Market price"
            type="number"
            step="any"
            value={price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Total cost"
            type="number"
            step="any"
            value={total}
            onChange={(e) => handleFieldChange('total', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <p className="text-[11px] opacity-40 -mt-2">
          Fill in any two of quantity / price / total — the third fills in automatically.
        </p>

        <Textarea
          label="Short note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note…"
          rows={2}
        />

        {error && <p className="text-sm text-loss-400">{error}</p>}

        <div className="flex gap-2 mt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Saving…' : isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
