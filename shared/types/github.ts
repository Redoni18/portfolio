export interface ContributionDay {
  /** `YYYY-MM-DD` (UTC) */
  date: string
  count: number
  /** GitHub's intensity bucket, 0–4 */
  level: 0 | 1 | 2 | 3 | 4
}

/** A week column, Sunday (index 0) → Saturday (index 6); `null` pads partial weeks. */
export type ContributionWeek = Array<ContributionDay | null>

export interface ContributionsResponse {
  total: number
  /** Column-major: oldest week first. */
  weeks: ContributionWeek[]
  /** ISO timestamp of when the data was fetched from GitHub */
  fetchedAt: string
}
