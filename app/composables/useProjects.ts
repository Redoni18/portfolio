import type { ProjectsCollectionItem } from '@nuxt/content'

export type ProjectSummary = Pick<
  ProjectsCollectionItem,
  'path' | 'title' | 'description' | 'year' | 'stack' | 'featured' | 'kind' | 'order' | 'links' | 'preview'
>

export type ProjectDocLink = Pick<ProjectsCollectionItem, 'path' | 'title' | 'stem' | 'navigation' | 'description'>

/** `/projects/<slug>` — exactly two path segments. */
export function isProjectIndexPath(path: string): boolean {
  return /^\/projects\/[^/]+$/.test(path)
}

/**
 * `view-transition-name` of a project's title, shared by its row on /projects, its
 * link in About's selected projects and the heading of its overview page, so the
 * title morphs between them (see "Page transitions" in main.css). Characters that
 * aren't valid in a CSS name are escaped (`.` → `_2e_`), so every slug still gets
 * its own name.
 */
export function projectTitleTransitionName(projectPath: string): string {
  const slug = projectPath.split('/')[2] ?? ''
  return `project-title-${slug.replace(/[^a-z0-9-]/giu, char => `_${char.codePointAt(0)!.toString(16)}_`)}`
}

/** Featured first, then by `order`, then title. */
export function sortProjects<T extends Pick<ProjectSummary, 'featured' | 'order' | 'title'>>(items: T[]): T[] {
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
export function sortProjectDocs<T extends Pick<ProjectDocLink, 'path' | 'stem'>>(items: T[], rootPath: string): T[] {
  return [...items].sort((a, b) => {
    if (a.path === rootPath) return -1
    if (b.path === rootPath) return 1
    return stemOrder(a.stem) - stemOrder(b.stem) || a.stem.localeCompare(b.stem)
  })
}

/** Label for a doc page in the sidebar. The project index is always "Overview". */
export function docLabel(doc: Pick<ProjectDocLink, 'path' | 'title' | 'navigation'>, rootPath: string): string {
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

/** `useAsyncData` key of the project list (/projects, and About's selected projects). */
export const PROJECT_LIST_KEY = 'projects:list'

/** `useAsyncData` key of one project page (an overview or a docs page), by its path. */
export function projectPageKey(path: string): string {
  return `projects:page:${path}`
}

/** `useAsyncData` key of a project's docs, in reading order, by the project's path. */
export function projectDocsKey(rootPath: string): string {
  return `projects:docs:${rootPath}`
}

/** All top-level projects, sorted for listing. */
export function useProjectList(key = PROJECT_LIST_KEY) {
  return useAsyncData(key, async () => {
    const items = await queryCollection('projects')
      .select('path', 'title', 'description', 'year', 'stack', 'featured', 'kind', 'order', 'links', 'preview')
      .all()
    return sortProjects(items.filter(item => isProjectIndexPath(item.path)))
  })
}
