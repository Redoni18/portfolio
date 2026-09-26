import type { ProjectsCollectionItem } from '@nuxt/content'

export type ProjectSummary = Pick<
  ProjectsCollectionItem,
  'path' | 'title' | 'description' | 'year' | 'stack' | 'featured' | 'kind' | 'order' | 'links' | 'preview'
>

export type ProjectDocLink = Pick<ProjectsCollectionItem, 'path' | 'title' | 'stem' | 'navigation' | 'description'>

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
