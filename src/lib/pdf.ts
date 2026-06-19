import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AppState } from '../types'
import { MEAL_SLOT_LABELS, type MealSlotKey } from '../types'
import { formatDayLabel } from './dateUtils'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

// Cozy Earth palette in RGB
type RGB = [number, number, number]
const SAGE: RGB = [125, 155, 118]
const CREAM: RGB = [245, 240, 232]
const OLIVE: RGB = [61, 74, 46]
const TERRA: RGB = [193, 123, 90]

export function exportToPDF(state: AppState) {
  const { plan, meals, groceryList } = state
  if (!plan) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Cover header ──────────────────────────────────────────────────
  doc.setFillColor(...SAGE)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(245, 240, 232)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Leisurely', 14, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Meal planning, minus the stress.', 14, 18)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(plan.name, 14, 25)

  doc.setTextColor(...OLIVE)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${formatDayLabel(plan.startDate)}  →  ${formatDayLabel(plan.endDate)}   ·   ${plan.days.length} days`,
    14,
    34
  )

  // ── Meal grid ─────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...OLIVE)
  doc.text('Meal Plan', 14, 42)

  const gridHead = [['Day', ...SLOTS.map((s) => MEAL_SLOT_LABELS[s])]]
  const gridBody = plan.days.map((day) => [
    formatDayLabel(day.date),
    ...SLOTS.map((slot) => {
      const mealId = day.slots[slot].mealId
      return mealId && meals[mealId] ? meals[mealId].name : ''
    }),
  ])

  autoTable(doc, {
    startY: 45,
    head: gridHead,
    body: gridBody,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: OLIVE },
    headStyles: { fillColor: SAGE, textColor: CREAM, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 32 } },
    margin: { left: 14, right: 14 },
  })

  // ── Grocery list ──────────────────────────────────────────────────
  const afterGrid = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  const remaining = doc.internal.pageSize.getHeight() - afterGrid
  if (remaining < 40) doc.addPage()

  const groceryY = remaining < 40 ? 20 : afterGrid

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...OLIVE)
  doc.text('Grocery List', 14, groceryY)

  if (groceryList.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 140)
    doc.text('No ingredients added yet.', 14, groceryY + 6)
  } else {
    autoTable(doc, {
      startY: groceryY + 3,
      head: [['Item', 'Quantity', 'Unit']],
      body: groceryList.map((i) => [i.name, String(i.quantity), i.unit]),
      styles: { fontSize: 8, cellPadding: 2.5, textColor: OLIVE },
      headStyles: { fillColor: TERRA, textColor: CREAM, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 242] },
      columnStyles: { 1: { halign: 'right', cellWidth: 22 }, 2: { cellWidth: 22 } },
      margin: { left: 14, right: 14 },
    })
  }

  // ── Footer ────────────────────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(180, 175, 165)
    doc.text(
      `Leisurely  ·  Page ${i} of ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    )
  }

  doc.save(`${plan.name.replace(/\s+/g, '-').toLowerCase()}-leisurely.pdf`)
}
