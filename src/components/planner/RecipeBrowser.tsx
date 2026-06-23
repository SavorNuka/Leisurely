import { useState, useMemo } from 'react'
import recipesData from '../../data/recipes.json'
import type { Recipe, DietaryTag } from '../../types'
import { DietaryTagBadge } from './DietaryTagBadge'
import { Input } from '../ui/Input'

const recipes = recipesData as Recipe[]

interface RecipeBrowserProps {
  onSelect: (recipe: Recipe) => void
}

export function RecipeBrowser({ onSelect }: RecipeBrowserProps) {
  const [query, setQuery] = useState('')
  const [filterTag, setFilterTag] = useState<DietaryTag | null>(null)

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesQuery = query.trim() === '' || r.name.toLowerCase().includes(query.toLowerCase()) || r.description.toLowerCase().includes(query.toLowerCase())
      const matchesTag = filterTag === null || r.dietaryTags.includes(filterTag)
      return matchesQuery && matchesTag
    })
  }, [query, filterTag])

  const allTags = useMemo(() => {
    const set = new Set<DietaryTag>()
    recipes.forEach((r) => r.dietaryTags.forEach((t) => set.add(t)))
    return [...set]
  }, [])

  return (
    <div className="space-y-3">
      <Input
        id="recipe-search"
        placeholder="Search recipes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Tag filters */}
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

      {/* Recipe grid */}
      <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-olive/40 py-4 text-center">No recipes match your search.</p>
        )}
        {filtered.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            onClick={() => onSelect(recipe)}
            className="text-left rounded-card border border-olive/10 bg-cream hover:bg-sage/5 hover:border-sage/30 transition-colors p-3 space-y-1"
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
        ))}
      </div>
    </div>
  )
}
