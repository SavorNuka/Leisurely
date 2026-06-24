import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AppState } from '../types'
import { MEAL_SLOT_LABELS, type MealSlotKey } from '../types'
import { formatDayLabel } from './dateUtils'

const SLOTS: MealSlotKey[] = ['breakfast', 'lunch', 'dinner', 'snacks']

type RGB = [number, number, number]
const INK:   RGB = [28, 26, 24]
const CREAM: RGB = [245, 240, 232]
const OLIVE: RGB = [61, 74, 46]
const SAGE:  RGB = [125, 155, 118]
const TERRA: RGB = [193, 123, 90]

export interface PDFExportOptions {
  includePlan: boolean
  includeGrocery: boolean
  filterAssignees?: string[]
}

// Draws the leaf icon from the app header using jsPDF bezier curves.
// SVG viewBox is 0 0 32 32; all path coords are raw SVG units, scaled by sc = size/32.
function drawLeafIcon(doc: jsPDF, ix: number, iy: number, size: number, color: RGB) {
  const sc = size / 32
  doc.setDrawColor(...color)
  doc.setLineWidth(0.4)
  // Stem
  doc.line(ix + 16 * sc, iy + 10 * sc, ix + 16 * sc, iy + 28 * sc)
  // Left leaf: M16 22 C11 19, 8 14, 10 10 C12 6, 16 10, 16 13
  doc.lines([[-5, -3, -8, -8, -6, -12], [2, -4, 6, 0, 6, 3]], ix + 16 * sc, iy + 22 * sc, [sc, sc], 'S')
  // Right leaf: M16 18 C21 15, 24 10, 22 6 C20 2, 16 6, 16 9
  doc.lines([[5, -3, 8, -8, 6, -12], [-2, -4, -6, 0, -6, 3]], ix + 16 * sc, iy + 18 * sc, [sc, sc], 'S')
  // Lower left branch: M16 26 C12 24, 9 21, 10 18
  doc.lines([[-4, -2, -7, -5, -6, -8]], ix + 16 * sc, iy + 26 * sc, [sc, sc], 'S')
  // Lower right branch: M16 26 C20 24, 23 21, 22 18
  doc.lines([[4, -2, 7, -5, 6, -8]], ix + 16 * sc, iy + 26 * sc, [sc, sc], 'S')
}

export function exportToPDF(state: AppState, opts: PDFExportOptions = { includePlan: true, includeGrocery: true }) {
  const { plan, meals, groceryList } = state
  if (!plan) return

  const { includePlan, includeGrocery, filterAssignees } = opts
  const hasAssigneeFilter = filterAssignees && filterAssignees.length > 0

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Cover header ──────────────────────────────────────────────────
  doc.setFillColor(...INK)
  doc.rect(0, 0, pageW, 28, 'F')

  // Leaf logo — right side of header
  drawLeafIcon(doc, pageW - 26, 4, 20, CREAM)

  doc.setTextColor(...CREAM)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Leisurely', 14, 12)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Meal planning, minus the stress.', 14, 18)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(plan.name, 14, 25)

  // Subtitle row — ASCII "to" instead of → (avoids Helvetica encoding gap)
  doc.setTextColor(...OLIVE)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const dateRange = `${formatDayLabel(plan.startDate)}  to  ${formatDayLabel(plan.endDate)}   ·   ${plan.days.length} day${plan.days.length !== 1 ? 's' : ''}`
  const subtitleParts = [dateRange]
  if (hasAssigneeFilter) subtitleParts.push(`For: ${filterAssignees!.join(', ')}`)
  doc.text(subtitleParts.join('   ·   '), 14, 34)

  let currentY = 42

  // ── Meal plan grid ────────────────────────────────────────────────
  if (includePlan) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...OLIVE)
    doc.text('Meal Plan', 14, currentY)

    const gridHead = [['', 'Day', ...SLOTS.map((s) => MEAL_SLOT_LABELS[s])]]
    const gridBody = plan.days.map((day) => [
      '',
      formatDayLabel(day.date),
      ...SLOTS.map((slot) => {
        const mealId = day.slots[slot].mealId
        if (!mealId || !meals[mealId]) return ''
        const meal = meals[mealId]
        if (hasAssigneeFilter) {
          const assigned = meal.assignedTo ?? []
          if (!filterAssignees!.some((f) => assigned.includes(f)) && assigned.length > 0) return ''
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
      columnStyles: {
        0: { cellWidth: 8 },
        1: { fontStyle: 'bold', cellWidth: 32 },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          const sz = 3.5
          const cx = data.cell.x + (data.cell.width - sz) / 2
          const cy = data.cell.y + (data.cell.height - sz) / 2
          doc.setDrawColor(...OLIVE)
          doc.setLineWidth(0.3)
          doc.rect(cx, cy, sz, sz)
        }
      },
    })

    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }

  // ── Grocery list ──────────────────────────────────────────────────
  if (includeGrocery) {
    if (doc.internal.pageSize.getHeight() - currentY < 40) {
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
        head: [['', 'Item', 'Qty', 'Unit', 'For']],
        body: filteredGrocery.map((i) => [
          '',
          i.name,
          String(i.quantity),
          i.unit,
          (i.assignedTo ?? []).join(', '),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5, textColor: OLIVE },
        headStyles: { fillColor: TERRA, textColor: CREAM, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        columnStyles: {
          0: { cellWidth: 8 },
          2: { halign: 'right', cellWidth: 18 },
          3: { cellWidth: 18 },
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          if (data.column.index === 0 && data.section === 'body') {
            const sz = 3.5
            const cx = data.cell.x + (data.cell.width - sz) / 2
            const cy = data.cell.y + (data.cell.height - sz) / 2
            doc.setDrawColor(...OLIVE)
            doc.setLineWidth(0.3)
            doc.rect(cx, cy, sz, sz)
          }
        },
      })
    }
  }

  // ── Footer — page numbers ─────────────────────────────────────────
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
