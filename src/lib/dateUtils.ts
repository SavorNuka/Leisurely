import { eachDayOfInterval, parseISO, format, isWithinInterval } from 'date-fns'
import type { DayPlan, MealSlotKey } from '../types'

const EMPTY_SLOTS = (): Record<MealSlotKey, { mealId: null }> => ({
  breakfast: { mealId: null },
  lunch: { mealId: null },
  dinner: { mealId: null },
  snacks: { mealId: null },
})

export function generateDayPlans(startDate: string, endDate: string): DayPlan[] {
  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
  return days.map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    slots: EMPTY_SLOTS(),
  }))
}

export function mergeDayPlans(
  existingDays: DayPlan[],
  newStartDate: string,
  newEndDate: string
): DayPlan[] {
  const interval = { start: parseISO(newStartDate), end: parseISO(newEndDate) }
  const existingByDate = Object.fromEntries(existingDays.map((d) => [d.date, d]))
  const newDays = eachDayOfInterval(interval)

  return newDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    if (existingByDate[dateStr] && isWithinInterval(parseISO(dateStr), interval)) {
      return existingByDate[dateStr]
    }
    return { date: dateStr, slots: EMPTY_SLOTS() }
  })
}

export function formatDayLabel(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE, MMM d')
}
