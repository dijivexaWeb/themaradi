export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

/**
 * Returns a human-readable date string based on precision.
 * precision='year'  → "1945"
 * precision='month' → "Mart 1945"
 * precision='day'   → "15 Mart 1945"
 */
export function formatPartialDate(
  dateStr: string | null | undefined,
  precision: string | null | undefined,
): string | null {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  const y = parts[0]
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  if (!y) return null
  const prec = precision || 'day'
  if (prec === 'year') return `${y}`
  if (prec === 'month') return `${MONTHS_TR[m - 1]} ${y}`
  return `${d} ${MONTHS_TR[m - 1]} ${y}`
}

/**
 * Composes a YYYY-MM-DD date string from partial inputs.
 * Returns null if year is missing.
 */
export function composeDate(
  year: string,
  month: string,
  day: string,
): { date: string; precision: 'year' | 'month' | 'day' } | null {
  const y = parseInt(year, 10)
  if (!y || y < 1) return null
  const m = parseInt(month, 10)
  const hasMonth = m >= 1 && m <= 12
  if (!hasMonth) {
    return { date: `${y}-01-01`, precision: 'year' }
  }
  const dd = parseInt(day, 10)
  const hasDay = dd >= 1 && dd <= 31
  if (!hasDay) {
    return { date: `${y}-${String(m).padStart(2, '0')}-01`, precision: 'month' }
  }
  return {
    date: `${y}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
    precision: 'day',
  }
}
