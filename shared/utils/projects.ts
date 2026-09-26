/**
 * Pure project helpers, shared by the pages (app/) and the build-time agent
 * files (server/: sitemap.xml, llms.txt, the markdown pages), so both list
 * projects and their pages in the same order.
 */

/** `/projects/<slug>` — exactly two path segments. */
export function isProjectIndexPath(path: string): boolean {
  return /^\/projects\/[^/]+$/.test(path)
}

/** Featured first, then by `order`, then title. */
export function sortProjects<T extends { featured?: boolean, order?: number, title?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    || (a.order ?? 999) - (b.order ?? 999)
    || String(a.title).localeCompare(String(b.title)),
  )
}

/** Numeric filename prefix of a stem segment: `projects/x/2.api` → 2 */
function stemOrder(stem: string): number {
  const last = stem.split('/').pop() ?? ''
  const match = /^(\d+)\./.exec(last)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

/** Overview (the project index) first, then sub-pages by numeric filename prefix. */
export function sortProjectDocs<T extends { path: string, stem: string }>(items: T[], rootPath: string): T[] {
  return [...items].sort((a, b) => {
    if (a.path === rootPath) return -1
    if (b.path === rootPath) return 1
    return stemOrder(a.stem) - stemOrder(b.stem) || a.stem.localeCompare(b.stem)
  })
}

/** Label for a doc page in the sidebar. The project index is always "Overview". */
export function docLabel(doc: { path: string, title: string, navigation?: unknown }, rootPath: string): string {
  if (doc.path === rootPath) return 'Overview'
  const nav = doc.navigation
  if (nav && typeof nav === 'object' && 'title' in nav && typeof nav.title === 'string' && nav.title) return nav.title
  return doc.title
}

/**
 * The address shown on a project's preview card, like the domain line on a shared
 * link: `https://getforevermore.co` → `getforevermore.co`, keeping any path.
 */
export function linkLabel(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const { hostname, pathname } = new URL(url)
    return `${hostname.replace(/^www\./, '')}${pathname}`.replace(/\/+$/, '')
  }
  catch {
    return undefined
  }
}

/** Employment roles in display order: by `order`, then most recent start first. */
export function sortRoles<T extends { order?: number, start: string }>(roles: T[]): T[] {
  return [...roles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.start.localeCompare(a.start))
}

/**
 * Where a page's markdown copy lives, following llmstxt.org: the page's URL with
 * `.md` appended, or `/index.html.md` for the root.
 */
export function markdownPath(path: string): string {
  return path === '/' ? '/index.html.md' : `${path.replace(/\/+$/, '')}.md`
}
