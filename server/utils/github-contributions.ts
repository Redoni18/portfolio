import type { ContributionDay, ContributionsResponse, ContributionWeek } from '#shared/types/github'

const DAY_TAG_RE = /<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g
const ATTR_RE = /([\w:-]+)\s*=\s*"([^"]*)"/g
const TOOLTIP_RE = /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g
const CELL_ID_RE = /^contribution-day-component-(\d+)-(\d+)$/
const TOTAL_RE = /<h2\b[^>]*id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?/
const TOTAL_FALLBACK_RE = /([\d,]+)\s+contributions?\s+in the last year/

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of tag.matchAll(ATTR_RE)) {
    attrs[match[1]!.toLowerCase()] = match[2]!
  }
  return attrs
}

function parseCount(text: string): number {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (/^no contributions/i.test(clean)) return 0
  const match = /^([\d,]+)\s+contributions?/i.exec(clean)
  return match ? Number(match[1]!.replace(/,/g, '')) : 0
}

function toLevel(value: string | undefined): ContributionDay['level'] {
  const n = Number(value)
  return (Number.isInteger(n) && n >= 0 && n <= 4 ? n : 0) as ContributionDay['level']
}

/** Weekday (0 = Sunday) of a `YYYY-MM-DD` date, in UTC. */
function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

/**
 * Parse the public contributions calendar HTML served at
 * `https://github.com/users/<name>/contributions`.
 *
 * Cells look like:
 *   <td data-date="2025-09-21" id="contribution-day-component-{row}-{col}" data-level="0-4" class="ContributionCalendar-day">
 * with counts in `<tool-tip for="contribution-day-component-R-C">N contributions on …</tool-tip>`.
 * Rows are weekdays (0 = Sunday), columns are weeks.
 *
 * Plain string/regex parsing so it runs on Cloudflare Workers without a DOM.
 */
export function parseContributionsHtml(html: string): Omit<ContributionsResponse, 'fetchedAt'> {
  const counts = new Map<string, number>()
  for (const match of html.matchAll(TOOLTIP_RE)) {
    const attrs = parseAttributes(match[1]!)
    if (attrs.for) counts.set(attrs.for, parseCount(match[2]!))
  }

  const cells: Array<{ row: number, col: number, day: ContributionDay }> = []
  for (const match of html.matchAll(DAY_TAG_RE)) {
    const attrs = parseAttributes(match[0])
    const date = attrs['data-date']
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue

    const id = attrs.id ?? ''
    const position = CELL_ID_RE.exec(id)
    const row = position ? Number(position[1]) : weekdayOf(date)
    const col = position ? Number(position[2]) : -1

    cells.push({
      row,
      col,
      day: { date, count: counts.get(id) ?? 0, level: toLevel(attrs['data-level']) },
    })
  }

  if (!cells.length) {
    throw new Error('No contribution cells found in GitHub response')
  }

  // Fall back to date-derived columns if GitHub ever drops the positional ids.
  if (cells.some(cell => cell.col < 0)) {
    const sorted = [...cells].sort((a, b) => a.day.date.localeCompare(b.day.date))
    const first = new Date(`${sorted[0]!.day.date}T00:00:00Z`)
    const firstSunday = first.getTime() - first.getUTCDay() * 86_400_000
    for (const cell of cells) {
      const t = new Date(`${cell.day.date}T00:00:00Z`).getTime()
      cell.col = Math.floor((t - firstSunday) / (7 * 86_400_000))
      cell.row = weekdayOf(cell.day.date)
    }
  }

  const columns = Math.max(...cells.map(cell => cell.col)) + 1
  const weeks: ContributionWeek[] = Array.from({ length: columns }, () => Array.from({ length: 7 }, () => null))
  for (const { row, col, day } of cells) {
    if (row >= 0 && row < 7 && col >= 0) weeks[col]![row] = day
  }

  const summed = cells.reduce((sum, cell) => sum + cell.day.count, 0)
  const totalMatch = TOTAL_RE.exec(html) ?? TOTAL_FALLBACK_RE.exec(html)
  const total = totalMatch ? Number(totalMatch[1]!.replace(/,/g, '')) : summed

  return { total, weeks }
}
