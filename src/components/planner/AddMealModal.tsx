import { useState, useEffect, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { DietaryTagBadge } from './DietaryTagBadge'
import { RecipeBrowser } from './RecipeBrowser'
import { usePlanStore } from '../../stores/planStore'
import { PRESET_DIETARY_TAGS, type DietaryTag, type Meal, type MealSlotKey, type GroceryItem, type Recipe } from '../../types'
import { saveCustomRecipe, loadCustomRecipes } from '../../lib/db'
import { toast } from '../../hooks/useToast'
import recipes from '../../data/recipes.json'

interface IngredientRow {
  id: string
  name: string
  quantity: string
  unit: string
}

interface AddMealModalProps {
  open: boolean
  onClose: () => void
  date: string
  slot: MealSlotKey
  editingMeal?: Meal
}

function emptyRow(): IngredientRow {
  return { id: crypto.randomUUID(), name: '', quantity: '1', unit: '' }
}

export function AddMealModal({ open, onClose, date, slot, editingMeal }: AddMealModalProps) {
  const addMeal = usePlanStore((s) => s.addMeal)
  const updateMeal = usePlanStore((s) => s.updateMeal)
  const assignMealToSlot = usePlanStore((s) => s.assignMealToSlot)
  const regenerateGroceryList = usePlanStore((s) => s.regenerateGroceryList)

  const [customCount, setCustomCount] = useState(0)
  useEffect(() => { loadCustomRecipes().then((r) => setCustomCount(r.length)) }, [open])
  const totalRecipes = (recipes as unknown[]).length + customCount

  const [showRecipes, setShowRecipes] = useState(!editingMeal)
  const [name, setName] = useState(editingMeal?.name ?? '')
  const [notes, setNotes] = useState(editingMeal?.notes ?? '')
  const [servings, setServings] = useState(String(editingMeal?.servings ?? 2))
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>(editingMeal?.dietaryTags ?? [])
  const [allergyInput, setAllergyInput] = useState('')
  const [assignedTo, setAssignedTo] = useState<string[]>(editingMeal?.assignedTo ?? [])
  const [assigneeInput, setAssigneeInput] = useState('')
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    editingMeal?.ingredients?.length
      ? editingMeal.ingredients.map((i) => ({ id: i.id, name: i.name, quantity: String(i.quantity), unit: i.unit }))
      : [emptyRow()]
  )
  const [scaleToServings, setScaleToServings] = useState(editingMeal?.scaleToServings !== false)
  const [nameError, setNameError] = useState('')

  function addAssignee() {
    const val = assigneeInput.trim()
    if (!val) return
    if (!assignedTo.includes(val)) setAssignedTo((prev) => [...prev, val])
    setAssigneeInput('')
  }

  function removeAssignee(name: string) {
    setAssignedTo((prev) => prev.filter((n) => n !== name))
  }

  function applyRecipe(recipe: Recipe) {
    setName(recipe.name)
    setNotes(recipe.description)
    setServings(String(recipe.servings))
    setSelectedTags(recipe.dietaryTags)
    setIngredients(recipe.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: String(i.quantity),
      unit: i.unit,
    })))
    setShowRecipes(false)
  }

  function toggleTag(tag: DietaryTag) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function addAllergyTag() {
    const val = allergyInput.trim().toLowerCase()
    if (!val) return
    const tag: DietaryTag = `allergy:${val}`
    if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag])
    setAllergyInput('')
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, emptyRow()])
  }

  function updateIngredient(id: string, field: keyof IngredientRow, value: string) {
    setIngredients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((r) => r.id !== id))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setNameError('Meal name is required'); return }
    setNameError('')

    const parsedIngredients: GroceryItem[] = ingredients
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: r.id,
        name: r.name.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unit: r.unit.trim(),
        checked: false,
        mealIds: [],
      }))

    if (editingMeal) {
      updateMeal(editingMeal.id, { name: name.trim(), notes: notes.trim(), servings: parseInt(servings) || 1, scaleToServings, dietaryTags: selectedTags, ingredients: parsedIngredients, assignedTo: assignedTo.length ? assignedTo : undefined })
      regenerateGroceryList()
    } else {
      const meal: Meal = {
        id: crypto.randomUUID(),
        name: name.trim(),
        notes: notes.trim(),
        servings: parseInt(servings) || 1,
        scaleToServings,
        dietaryTags: selectedTags,
        ingredients: parsedIngredients,
        assignedTo: assignedTo.length ? assignedTo : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addMeal(meal)
      assignMealToSlot(date, slot, meal.id)
      regenerateGroceryList()
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editingMeal ? 'Edit Meal' : 'Add a Meal'}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Recipe browser toggle */}
        {!editingMeal && (
          <div className="rounded-card bg-cream p-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowRecipes((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-olive w-full"
            >
              <svg className={`h-4 w-4 transition-transform ${showRecipes ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
              Browse recipes
              <span className="ml-auto text-xs text-olive/40 font-normal">{totalRecipes} ideas</span>
            </button>
            {showRecipes && <RecipeBrowser onSelect={applyRecipe} />}
          </div>
        )}

        <Input id="meal-name" label="Meal name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Caprese salad" error={nameError} autoFocus={!!editingMeal} />
        <Textarea id="meal-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Prep notes, restaurant name, etc." rows={2} />
        <div className="space-y-1.5">
          <Input id="meal-servings" label="Servings" type="number" min={1} max={50} value={servings} onChange={(e) => setServings(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scaleToServings}
              onChange={(e) => setScaleToServings(e.target.checked)}
              className="rounded border-olive/30 text-sage focus:ring-sage"
            />
            <span className="text-xs text-olive/70">Scale grocery quantities to serving count</span>
          </label>
        </div>

        {/* Who's responsible */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-olive">Who's cooking / responsible</p>
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 min-w-0 rounded-card border border-olive/20 bg-white px-3 py-1.5 text-sm text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none"
              placeholder="Add a name…"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addAssignee() } }}
            />
            <Button type="button" variant="ghost" size="sm" onClick={addAssignee}>Add</Button>
          </div>
          {assignedTo.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {assignedTo.map((n) => (
                <span key={n} className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-olive">
                  {n}
                  <button type="button" onClick={() => removeAssignee(n)} className="text-olive/40 hover:text-red-400 transition-colors" aria-label={`Remove ${n}`}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dietary tags */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-olive">Dietary preferences</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_DIETARY_TAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} className="rounded border-olive/30 text-sage focus:ring-sage" />
                <span className="text-xs text-olive capitalize">{tag}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <Input id="allergy-input" label="Add allergy (e.g. Shellfish)" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergyTag() } }} placeholder="Shellfish, Peanuts…" className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={addAllergyTag} className="mb-0.5">Add</Button>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <DietaryTagBadge key={tag} tag={tag} onRemove={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))} />
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-olive">Ingredients</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ingredients.map((row) => (
              <div key={row.id} className="flex gap-2 items-center">
                <input className="flex-1 min-w-0 rounded-card border border-olive/20 bg-white px-2 py-1.5 text-xs text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none" placeholder="Ingredient" value={row.name} onChange={(e) => updateIngredient(row.id, 'name', e.target.value)} />
                <input className="w-14 rounded-card border border-olive/20 bg-white px-2 py-1.5 text-xs text-olive focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none" type="number" min={0} step="0.25" placeholder="Qty" value={row.quantity} onChange={(e) => updateIngredient(row.id, 'quantity', e.target.value)} />
                <input className="w-16 rounded-card border border-olive/20 bg-white px-2 py-1.5 text-xs text-olive placeholder:text-olive/40 focus:border-sage focus:ring-1 focus:ring-sage focus:outline-none" placeholder="Unit" value={row.unit} onChange={(e) => updateIngredient(row.id, 'unit', e.target.value)} />
                <button type="button" onClick={() => removeIngredient(row.id)} className="text-olive/30 hover:text-red-400 transition-colors" aria-label="Remove ingredient">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addIngredientRow}>+ Add ingredient</Button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!name.trim()}
            onClick={async () => {
              const parsedIngredients: GroceryItem[] = ingredients
                .filter((r) => r.name.trim())
                .map((r) => ({
                  id: r.id,
                  name: r.name.trim(),
                  quantity: parseFloat(r.quantity) || 1,
                  unit: r.unit.trim(),
                  checked: false,
                  mealIds: [],
                }))
              const recipe: Recipe = {
                id: crypto.randomUUID(),
                name: name.trim(),
                description: notes.trim(),
                servings: parseInt(servings) || 1,
                dietaryTags: selectedTags,
                ingredients: parsedIngredients.map(({ id, name: n, quantity, unit }) => ({ id, name: n, quantity, unit })),
              }
              await saveCustomRecipe(recipe)
              toast('Saved to My Recipes')
            }}
          >
            ★ Save as recipe
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">{editingMeal ? 'Save changes' : 'Add meal'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
