const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/**
 * Format a `YYYY-MM` string as `Jun 2024`. Locale-independent on purpose so the
 * prerendered HTML and the hydrated client always agree.
 */
export function formatYearMonth(value: string | null | undefined): string {
  if (!value) return 'Present'
  const [year, month] = value.split('-')
  const index = Number(month) - 1
  const name = MONTHS[index]
  return name ? `${name} ${year}` : String(year)
}

/** `Jun 2024 — Present` */
export function formatRange(start: string, end: string | null | undefined): string {
  return `${formatYearMonth(start)} — ${formatYearMonth(end)}`
}
