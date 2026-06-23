import { useState } from 'react'
import { usePacking } from '../../hooks/usePacking'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { PACKING_CATEGORY_LABELS, PACKING_CATEGORY_EMOJI, type PackingCategory } from '../../types'

const CATEGORIES: PackingCategory[] = ['clothes', 'toiletries', 'documents', 'kitchen', 'misc']

const SUGGESTIONS: Record<PackingCategory, string[]> = {
  clothes: ['T-shirts', 'Pants / shorts', 'Underwear', 'Socks', 'Light jacket', 'Swimwear', 'Comfortable walking shoes'],
  toiletries: ['Toothbrush & toothpaste', 'Shampoo & conditioner', 'Sunscreen', 'Deodorant', 'Medications', 'Hand sanitiser'],
  documents: ['Passport / ID', 'Travel insurance', 'Accommodation booking', 'Flight / train tickets', 'Emergency contacts'],
  kitchen: ['Reusable shopping bags', 'Corkscrew / bottle opener', 'Travel spices', 'Reusable water bottle', 'Snacks for travel day'],
  misc: ['Phone charger', 'Power bank', 'Earbuds / headphones', 'Travel adapter', 'Book / e-reader', 'Cash in local currency'],
}

export function PackingPage() {
  const { packingList, packedCount, addPackingItem, togglePackingItem, removePackingItem, clearPackedItems } = usePacking()
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState<PackingCategory>('misc')
  const [activeCategory, setActiveCategory] = useState<PackingCategory>('clothes')
  const [showSuggestions, setShowSuggestions] = useState(packingList.length === 0)

  function handleAdd() {
    const text = newText.trim()
    if (!text) return
    addPackingItem(text, newCategory)
    setNewText('')
  }

  function addSuggestion(text: string, category: PackingCategory) {
    if (!packingList.find((i) => i.text.toLowerCase() === text.toLowerCase())) {
      addPackingItem(text, category)
    }
  }

  const total = packingList.length

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-semibold text-olive">Packing List</h2>
          {total > 0 && (
            <p className="text-xs text-olive/50 mt-0.5">
              {packedCount}/{total} packed
              {packedCount === total && total > 0 && ' · All done! 🎉'}
            </p>
          )}
        </div>
        {packedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearPackedItems}>
            Clear packed
          </Button>
        )}
      </div>

      {/* Add item */}
      <div className="bg-white rounded-card shadow-card p-4 space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-card border border-olive/20 bg-cream px-3 py-2 text-sm text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
            placeholder="Add an item…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as PackingCategory)}
            className="rounded-card border border-olive/20 bg-cream px-2 py-2 text-xs text-olive focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{PACKING_CATEGORY_EMOJI[cat]} {PACKING_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newText.trim()}>Add</Button>
        </div>

        {/* Suggestions toggle */}
        <button
          type="button"
          onClick={() => setShowSuggestions((v) => !v)}
          className="text-xs text-sage hover:text-sage-dark font-medium flex items-center gap-1"
        >
          <svg className={`h-3 w-3 transition-transform ${showSuggestions ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
        </button>

        {showSuggestions && (
          <div className="space-y-3">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-sage text-white' : 'bg-olive/10 text-olive/60 hover:bg-olive/20'}`}
                >
                  {PACKING_CATEGORY_EMOJI[cat]} {PACKING_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[activeCategory].map((s) => {
                const alreadyAdded = !!packingList.find((i) => i.text.toLowerCase() === s.toLowerCase())
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addSuggestion(s, activeCategory)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      alreadyAdded
                        ? 'bg-olive/5 text-olive/30 cursor-default'
                        : 'bg-cream border border-olive/15 text-olive hover:bg-sage/10 hover:border-sage/30'
                    }`}
                  >
                    {alreadyAdded ? '✓ ' : '+ '}{s}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Packing list by category */}
      {total === 0 ? (
        <EmptyState
          title="Nothing packed yet"
          description="Add items above or use the suggestions to build your list quickly."
        />
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const items = packingList.filter((i) => i.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat} className="bg-white rounded-card shadow-card overflow-hidden">
                <div className="px-4 py-2.5 bg-olive/5 border-b border-olive/10 flex items-center gap-2">
                  <span className="text-sm">{PACKING_CATEGORY_EMOJI[cat]}</span>
                  <span className="text-xs font-semibold text-olive/60 uppercase tracking-wide">{PACKING_CATEGORY_LABELS[cat]}</span>
                  <span className="ml-auto text-xs text-olive/40">{items.filter((i) => i.packed).length}/{items.length}</span>
                </div>
                <div className="divide-y divide-olive/10">
                  {items.map((item) => (
                    <div key={item.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-olive/5">
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => togglePackingItem(item.id)}
                        className="h-4 w-4 rounded border-olive/30 text-sage focus:ring-sage"
                      />
                      <span className={`flex-1 text-sm ${item.packed ? 'line-through text-olive/30' : 'text-olive'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => removePackingItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-olive/30 hover:text-red-400 rounded p-1"
                        aria-label="Remove item"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                          <line x1="3" y1="3" x2="11" y2="11" /><line x1="11" y1="3" x2="3" y2="11" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
