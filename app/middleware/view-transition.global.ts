import type { ProjectDocLink, ProjectSummary } from '~/composables/useProjects'

/**
 * Picks the page transition for each client-side navigation. Nuxt's view
 * transitions plugin (`experimental.viewTransition` in nuxt.config) reads
 * `to.meta.viewTransition` in `router.beforeResolve`, which runs after this, and
 * passes the type on to `document.startViewTransition()`. main.css styles each
 * type (see "Page transitions" there).
 *
 * - Tab to tab (About, Experience, Projects): `slide-forward` when the new tab is
 *   to the right of the old one, `slide-back` when it's to the left. It's decided
 *   from the two paths, so browser back/forward slide the right way too.
 * - /projects → a project's overview: `project-open`, and `project-close` on the
 *   way back. The project's title morphs between its row and the page heading.
 * - About → a project's overview, and back (the About tab, the header name,
 *   browser back): the same morph, from and to the project's link in About's
 *   selected projects, as long as About lists that project. Otherwise it's the
 *   usual tab slide, as it is for a project's docs pages.
 * - Between pages of one project (its overview and docs pages): `chapter-forward`
 *   to a later page in reading order, `chapter-back` to an earlier one. Only the
 *   article slides; the docs nav stays put.
 * - Anything else (hash or query changes, one project to another): none.
 *
 * vue-router builds a fresh `to.meta` for every navigation, so a type never
 * carries over to the next one. Nuxt already skips transitions for
 * prefers-reduced-motion, and browsers without transition types navigate
 * instantly.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  // First load (nothing to transition from) or an unknown page
  const type = from.matched.length && to.matched.length
    ? pageTransitionType(normalizePath(from.path), normalizePath(to.path))
    : undefined
  to.meta.viewTransition = type && supportsTransitionTypes()
    ? { enabled: true, types: [type] }
    : { enabled: false }
})

type PageTransitionType = 'slide-forward' | 'slide-back' | 'project-open' | 'project-close' | 'chapter-forward' | 'chapter-back'

function pageTransitionType(from: string, to: string): PageTransitionType | undefined {
  // Same page, only the hash or query changed
  if (from === to) return undefined

  const fromTab = siteTabIndex(from)
  const toTab = siteTabIndex(to)
  if (fromTab === -1 || toTab === -1) return undefined

  if (from === '/' && isProjectIndexPath(to) && aboutListsProject(to)) return 'project-open'
  if (isProjectIndexPath(from) && to === '/' && aboutListsProject(from)) return 'project-close'
  if (fromTab !== toTab) return toTab > fromTab ? 'slide-forward' : 'slide-back'

  if (from === '/projects' && isProjectIndexPath(to)) return 'project-open'
  if (isProjectIndexPath(from) && to === '/projects') return 'project-close'
  return chapterTransitionType(from, to)
}

/**
 * Two pages of the same project slide in reading order (sortProjectDocs: the
 * overview, then the docs pages). The order comes from the project's docs list,
 * which the current page has already loaded; without it, no transition.
 */
function chapterTransitionType(from: string, to: string): PageTransitionType | undefined {
  const root = projectRootPath(from)
  if (!root || root !== projectRootPath(to)) return undefined
  const docs = useNuxtApp().payload.data[projectDocsKey(root)] as Pick<ProjectDocLink, 'path'>[] | null | undefined
  const fromIndex = docs?.findIndex(doc => doc.path === from) ?? -1
  const toIndex = docs?.findIndex(doc => doc.path === to) ?? -1
  if (fromIndex === -1 || toIndex === -1) return undefined
  return toIndex > fromIndex ? 'chapter-forward' : 'chapter-back'
}

/** `/projects/<slug>` for any page of a project, otherwise undefined. */
function projectRootPath(path: string) {
  return /^\/projects\/[^/]+/.exec(path)?.[0]
}

/**
 * Whether About's selected projects (the featured ones, pages/index.vue) include
 * this project. The next page hasn't loaded yet, so this asks the data the
 * current page already has: About has the project list, and an overview has its
 * own page. With neither, the answer is no and the navigation keeps its slide.
 */
function aboutListsProject(projectPath: string): boolean {
  const data = useNuxtApp().payload.data
  const page = data[projectPageKey(projectPath)] as Pick<ProjectSummary, 'featured'> | null | undefined
  if (page) return Boolean(page.featured)
  const list = data[PROJECT_LIST_KEY] as ProjectSummary[] | null | undefined
  return Boolean(list?.some(project => project.path === projectPath && project.featured))
}

function normalizePath(path: string) {
  return path.replace(/(.)\/+$/, '$1')
}

let typesSupported: boolean | undefined

/** Transition types shipped after `startViewTransition()` itself (Chrome 125, Safari 18.2). */
function supportsTransitionTypes() {
  typesSupported ??= typeof CSS !== 'undefined' && CSS.supports('selector(:active-view-transition-type(a))')
  return typesSupported
}
