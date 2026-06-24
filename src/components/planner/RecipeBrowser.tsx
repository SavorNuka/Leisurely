import { useState, useMemo, useEffect } from 'react'
import recipesData from '../../data/recipes.json'
import type { Recipe, DietaryTag } from '../../types'
import { DietaryTagBadge } from './DietaryTagBadge'
import { Input } from '../ui/Input'
import { loadCustomRecipes, deleteCustomRecipe } from '../../lib/db'

const builtInRecipes = recipesData as Recipe[]

interface RecipeBrowserProps {
  onSelect: (recipe: Recipe) => void
}

type Tab = 'all' | 'my' | 'builtin'

function RecipeCard({ recipe, onSelect, onDelete }: { recipe: Recipe; onSelect: () => void; onDelete?: () => void }) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left rounded-card border border-olive/10 bg-cream hover:bg-sage/5 hover:border-sage/30 transition-colors p-3 space-y-1"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-olive">{recipe.name}</p>
          <span className="text-xs text-olive/40 shrink-0">Serves {recipe.servings}</span>
        </div>
        <p className="text-xs text-olive/60 line-clamp-1">{recipe.description}</p>
        {recipe.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {recipe.dietaryTags.slice(0, 3).map((tag) => (
              <DietaryTagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-olive/30 hover:text-red-400 p-1 rounded"
          aria-label="Delete recipe"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export function RecipeBrowser({ onSelect }: RecipeBrowserProps) {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [filterTag, setFilterTag] = useState<DietaryTag | null>(null)
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    loadCustomRecipes().then(setCustomRecipes)
  }, [])

  async function handleDelete(id: string) {
    await deleteCustomRecipe(id)
    setCustomRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const sourceRecipes = tab === 'my' ? customRecipes : tab === 'builtin' ? builtInRecipes : [...customRecipes, ...builtInRecipes]

  const filtered = useMemo(() => {
    return sourceRecipes.filter((r) => {
      const matchesQuery = query.trim() === '' || r.name.toLowerCase().includes(query.toLowerCase()) || r.description.toLowerCase().includes(query.toLowerCase())
      const matchesTag = filterTag === null || r.dietaryTags.includes(filterTag)
      return matchesQuery && matchesTag
    })
  }, [sourceRecipes, query, filterTag])

  const allTags = useMemo(() => {
    const set = new Set<DietaryTag>()
    builtInRecipes.forEach((r) => r.dietaryTags.forEach((t) => set.add(t)))
    return [...set]
  }, [])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'my', label: `★ My Recipes${customRecipes.length ? ` (${customRecipes.length})` : ''}` },
    { key: 'builtin', label: 'Built-in' },
  ]

  return (
    <div className="space-y-3">
      {/* Tab row */}
      <div className="flex gap-1 border-b border-olive/10 -mx-1 px-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`pb-1.5 px-2 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === key
                ? 'border-b-2 border-sage text-sage'
                : 'text-olive/50 hover:text-olive'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== 'my' && (
        <>
          <Input
            id="recipe-search"
            placeholder="Search recipes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterTag(null)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${filterTag === null ? 'bg-sage text-white' : 'bg-olive/10 text-olive/60 hover:bg-olive/20'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${filterTag === tag ? 'bg-sage text-white' : 'bg-olive/10 text-olive/60 hover:bg-olive/20'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
        {tab === 'my' && customRecipes.length === 0 && (
          <p className="text-xs text-olive/40 py-4 text-center">
            No saved recipes yet.<br />
            <span className="text-olive/30">Fill in a meal and click ★ Save as recipe.</span>
          </p>
        )}
        {tab !== 'my' && filtered.length === 0 && (
          <p className="text-xs text-olive/40 py-4 text-center">No recipes match your search.</p>
        )}
        {tab === 'my'
          ? customRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => onSelect(recipe)}
                onDelete={() => handleDelete(recipe.id)}
              />
            ))
          : filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => onSelect(recipe)}
                onDelete={customRecipes.some((r) => r.id === recipe.id) ? () => handleDelete(recipe.id) : undefined}
              />
            ))
        }
      </div>
    </div>
  )
}
