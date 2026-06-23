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

export interface PDFExportOptions {
  includePlan: boolean
  includeGrocery: boolean
  filterAssignees?: string[]
}

export function exportToPDF(state: AppState, opts: PDFExportOptions = { includePlan: true, includeGrocery: true }) {
  const { plan, meals, groceryList } = state
  if (!plan) return

  const { includePlan, includeGrocery, filterAssignees } = opts
  const hasAssigneeFilter = filterAssignees && filterAssignees.length > 0

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
  const subtitleParts = [
    `${formatDayLabel(plan.startDate)}  →  ${formatDayLabel(plan.endDate)}   ·   ${plan.days.length} days`,
  ]
  if (hasAssigneeFilter) subtitleParts.push(`Showing: ${filterAssignees!.join(', ')}`)
  doc.text(subtitleParts.join('   '), 14, 34)

  let currentY = 42

  // ── Meal grid ─────────────────────────────────────────────────────
  if (includePlan) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...OLIVE)
    doc.text('Meal Plan', 14, currentY)

    const gridHead = [['Day', ...SLOTS.map((s) => MEAL_SLOT_LABELS[s])]]
    const gridBody = plan.days.map((day) => [
      formatDayLabel(day.date),
      ...SLOTS.map((slot) => {
        const mealId = day.slots[slot].mealId
        if (!mealId || !meals[mealId]) return ''
        const meal = meals[mealId]
        if (hasAssigneeFilter) {
          const assigned = meal.assignedTo ?? []
          const overlap = filterAssignees!.some((f) => assigned.includes(f))
          if (!overlap && assigned.length > 0) return ''
        }
        return meal.name
      }),
    ])

    autoTable(doc, {
      startY: currentY + 3,
      head: gridHead,
      body: gridBody,
      styles: { fontSize: 8, cellPadding: 2.5, textColor: OLIVE },
      headStyles: { fillColor: SAGE, textColor: CREAM, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 242] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 32 } },
      margin: { left: 14, right: 14 },
    })

    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }

  // ── Grocery list ──────────────────────────────────────────────────
  if (includeGrocery) {
    const remaining = doc.internal.pageSize.getHeight() - currentY
    if (remaining < 40) {
      doc.addPage()
      currentY = 20
    }

    const filteredGrocery = hasAssigneeFilter
      ? groceryList.filter((i) => {
          const assigned = i.assignedTo ?? []
          return assigned.length === 0 || filterAssignees!.some((f) => assigned.includes(f))
        })
      : groceryList

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...OLIVE)
    doc.text('Grocery List', 14, currentY)

    if (filteredGrocery.length === 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 140)
      doc.text('No ingredients added yet.', 14, currentY + 6)
    } else {
      autoTable(doc, {
        startY: currentY + 3,
        head: [['Item', 'Quantity', 'Unit', 'Assigned To']],
        body: filteredGrocery.map((i) => [
          i.name,
          String(i.quantity),
          i.unit,
          (i.assignedTo ?? []).join(', '),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5, textColor: OLIVE },
        headStyles: { fillColor: TERRA, textColor: CREAM, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        columnStyles: { 1: { halign: 'right', cellWidth: 22 }, 2: { cellWidth: 22 } },
        margin: { left: 14, right: 14 },
      })
    }
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
